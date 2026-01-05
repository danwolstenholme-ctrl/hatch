'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ArrowRight, Trash2, Search, Globe, LayoutGrid, List, ExternalLink, MoreHorizontal, Clock, ChevronRight, Zap, Crown, Check } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { formatDistanceToNow } from 'date-fns'
import { DbProject } from '@/lib/supabase'

export default function StudioPage() {
  const { user } = useUser()
  const [projects, setProjects] = useState<DbProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMigrating, setIsMigrating] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const accountSubscription = user?.publicMetadata?.accountSubscription as any
  const tier = accountSubscription?.tier || 'free'
  const isFreeTier = !accountSubscription || tier === 'free' || tier === 'trial'

  const tierConfig = useMemo(() => {
    if (tier === 'singularity') return { name: 'Singularity', limit: Infinity, color: 'text-amber-400', bg: 'bg-amber-500/10' }
    if (tier === 'visionary') return { name: 'Visionary', limit: Infinity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
    if (tier === 'architect') return { name: 'Architect', limit: 3, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
    return { name: 'Free', limit: 1, color: 'text-zinc-400', bg: 'bg-zinc-500/10' }
  }, [tier])

  const isAtLimit = tierConfig.limit !== Infinity && projects.length >= tierConfig.limit

  useEffect(() => {
    async function init() {
      try {
        // Import guest work if exists
        const guestHandoff = localStorage.getItem('hatch_guest_handoff')
        if (guestHandoff) {
          setIsMigrating(true)
          try {
            const payload = JSON.parse(guestHandoff)
            const res = await fetch('/api/project/import', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
            if (res.ok) {
              localStorage.removeItem('hatch_guest_handoff')
              localStorage.removeItem('hatch_last_prompt')
            }
          } catch (err) {
            console.error('Import failed:', err)
          }
          setIsMigrating(false)
        }

        const res = await fetch('/api/project/list')
        if (res.ok) {
          const data = await res.json()
          setProjects(data.projects || [])
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  const filteredProjects = useMemo(() => {
    if (!searchQuery) return projects
    return projects.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [projects, searchQuery])

  const handleCreate = async () => {
    if (isAtLimit) {
      setShowUpgradeModal(true)
      return
    }
    setIsCreating(true)
    try {
      const res = await fetch('/api/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Untitled Project', templateId: 'single-page' })
      })
      if (res.ok) {
        const data = await res.json()
        setProjects(prev => [data.project, ...prev])
      }
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm('Delete this project?')) {
      const res = await fetch(`/api/project/${id}`, { method: 'DELETE' })
      if (res.ok) setProjects(prev => prev.filter(p => p.id !== id))
    }
  }

  if (isLoading || isMigrating) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-500/[0.02] rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-white mb-2">Studio</h1>
              <p className="text-zinc-500 text-sm">
                Build and deploy React components with AI
                {tierConfig.limit !== Infinity && (
                  <span className="text-zinc-600"> · {projects.length}/{tierConfig.limit} projects</span>
                )}
              </p>
            </div>
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-medium rounded-lg transition-colors"
            >
              {isCreating ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              New Project
            </button>
          </div>

          {/* Upgrade banner for free users */}
          {isFreeTier && (
            <div className="mb-8 p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-white font-medium mb-1">Upgrade your plan</h3>
                  <p className="text-zinc-500 text-sm">Get more projects, code export, and custom domains.</p>
                </div>
                <Link
                  href="/dashboard/billing"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                >
                  View plans
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Search and filters */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white/[0.03] border border-white/[0.06] rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Projects */}
          {filteredProjects.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-white/[0.03] border border-white/[0.06] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Plus className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                {searchQuery ? 'No projects found' : 'Create your first project'}
              </h3>
              <p className="text-zinc-500 text-sm mb-6 max-w-sm mx-auto">
                {searchQuery 
                  ? 'Try a different search term.' 
                  : 'Describe what you want to build and AI generates the React code.'}
              </p>
              {!searchQuery && (
                <button
                  onClick={handleCreate}
                  disabled={isAtLimit}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg font-medium text-sm transition-colors"
                >
                  New Project
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/builder?project=${project.id}`}
                  className="group block bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.1] rounded-xl p-5 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-lg flex items-center justify-center">
                      <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
                    </div>
                    
                    {project.slug && (
                      <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Live
                      </span>
                    )}
                  </div>

                  <h3 className="font-medium text-white mb-1 truncate group-hover:text-emerald-400 transition-colors">
                    {project.name || 'Untitled'}
                  </h3>
                  
                  <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {project.updated_at 
                      ? formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })
                      : 'Just now'}
                  </p>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      {project.slug && (
                        <a
                          href={`https://${project.slug}.hatchitsites.dev`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 text-zinc-500 hover:text-emerald-400 hover:bg-white/5 rounded transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button 
                        onClick={(e) => handleDelete(e, project.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-white/5 rounded transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border border-white/[0.06] rounded-xl overflow-hidden">
              {filteredProjects.map((project, i) => (
                <Link
                  key={project.id}
                  href={`/builder?project=${project.id}`}
                  className={`group flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors ${
                    i !== filteredProjects.length - 1 ? 'border-b border-white/[0.06]' : ''
                  }`}
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-lg flex items-center justify-center flex-shrink-0">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white text-sm truncate group-hover:text-emerald-400 transition-colors">
                      {project.name || 'Untitled'}
                    </h3>
                    <p className="text-xs text-zinc-500">
                      {project.updated_at 
                        ? formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })
                        : 'Just now'}
                    </p>
                  </div>

                  {project.slug && (
                    <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      Live
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    {project.slug && (
                      <a
                        href={`https://${project.slug}.hatchitsites.dev`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-zinc-500 hover:text-emerald-400 rounded transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button 
                      onClick={(e) => handleDelete(e, project.id)}
                      className="p-2 text-zinc-500 hover:text-red-400 rounded transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUpgradeModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111] rounded-2xl p-6 w-full max-w-lg border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-white mb-2">Upgrade your plan</h2>
              <p className="text-zinc-400 text-sm mb-6">
                You&apos;ve reached the {tierConfig.limit} project limit. Choose a plan to continue.
              </p>
              
              <div className="space-y-3 mb-6">
                <a 
                  href="/api/checkout?tier=architect"
                  className="flex items-center justify-between p-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl transition-colors"
                >
                  <div>
                    <p className="text-white font-medium">Architect</p>
                    <p className="text-zinc-500 text-sm">3 projects, deploy to hatchit.dev</p>
                  </div>
                  <p className="text-white font-semibold">$19<span className="text-zinc-500 font-normal">/mo</span></p>
                </a>

                <a 
                  href="/api/checkout?tier=visionary"
                  className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition-colors relative"
                >
                  <div className="absolute -top-2 left-4 px-2 py-0.5 bg-emerald-500 text-black text-[10px] font-bold rounded">RECOMMENDED</div>
                  <div>
                    <p className="text-white font-medium">Visionary</p>
                    <p className="text-zinc-400 text-sm">10 projects + download code</p>
                  </div>
                  <p className="text-white font-semibold">$49<span className="text-zinc-400 font-normal">/mo</span></p>
                </a>

                <a 
                  href="/api/checkout?tier=singularity"
                  className="flex items-center justify-between p-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl transition-colors"
                >
                  <div>
                    <p className="text-white font-medium">Singularity</p>
                    <p className="text-zinc-500 text-sm">Unlimited projects + API</p>
                  </div>
                  <p className="text-white font-semibold">$199<span className="text-zinc-500 font-normal">/mo</span></p>
                </a>
              </div>

              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full py-2.5 text-zinc-500 hover:text-white text-sm transition-colors"
              >
                Maybe later
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

