'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ArrowRight, Trash2, Search, Globe, LayoutGrid, List, ExternalLink, MoreHorizontal, Clock, ChevronRight, Zap, Crown, Check, Code2, CreditCard, Home } from 'lucide-react'
import { useUser, UserButton } from '@clerk/nextjs'
import { formatDistanceToNow } from 'date-fns'
import { DbProject } from '@/lib/supabase'

export default function StudioPage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const router = useRouter()
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
    return { name: 'Free', limit: 3, color: 'text-zinc-400', bg: 'bg-zinc-500/10' }
  }, [tier])

  const isAtLimit = tierConfig.limit !== Infinity && projects.length >= tierConfig.limit

  useEffect(() => {
    if (!isLoaded) return

    // Hard redirect if user is not authenticated
    if (!isSignedIn) {
      router.replace('/sign-in?redirect_url=/dashboard')
      return
    }

    let cancelled = false

    async function init() {
      try {
        // Import guest work if exists
        const guestHandoff = localStorage.getItem('hatch_guest_handoff')
        if (guestHandoff) {
          setIsMigrating(true)
          try {
            const payload = JSON.parse(guestHandoff)
            console.log('[Studio] Attempting to import guest work:', {
              projectName: payload?.projectName,
              templateId: payload?.templateId,
              sectionsCount: payload?.sections?.length,
              sectionsWithCode: payload?.sections?.filter((s: any) => s.code?.length > 0).length,
            })
            const res = await fetch('/api/project/import', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
            if (res.ok) {
              const data = await res.json()
              console.log('[Studio] Import successful:', data)
              localStorage.removeItem('hatch_guest_handoff')
              localStorage.removeItem('hatch_last_prompt')
            } else if (res.status === 401) {
              router.replace('/sign-in?redirect_url=/dashboard')
              return
            } else {
              const text = await res.text()
              console.error('[Studio] Import failed:', res.status, text)
            }
          } catch (err) {
            console.error('[Studio] Import error:', err)
          }
          setIsMigrating(false)
        }

        const res = await fetch('/api/project/list')
        if (res.status === 401) {
          router.replace('/sign-in?redirect_url=/dashboard')
          return
        }
        if (res.ok) {
          const data = await res.json()
          if (!cancelled) setProjects(data.projects || [])
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    init()

    return () => {
      cancelled = true
    }
  }, [isLoaded, isSignedIn, router])

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
        body: JSON.stringify({ name: 'Untitled Project', templateId: 'landing-page' })
      })
      if (res.ok) {
        const data = await res.json()
        // Redirect to builder immediately
        router.push(`/builder?project=${data.project.id}`)
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

  if (!isLoaded || !isSignedIn || isLoading || isMigrating) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-800 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
    <div className="p-8 w-full">
      {/* Page Title */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex items-start justify-between mb-8"
      >
        <div>
          <h1 className="text-xl font-semibold text-zinc-100 mb-1">Studio</h1>
          <p className="text-zinc-500 text-sm">
            Build and deploy React components with AI
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreate}
          disabled={isCreating}
          className="group relative flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-sm font-medium rounded-lg backdrop-blur-md transition-all shadow-[0_0_20px_-5px_rgba(16,185,129,0.1)] hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.3)] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          {isCreating ? (
            <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          <span>New Project</span>
        </motion.button>
      </motion.div>

      {/* Empty State */}
      {!isLoading && projects.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30"
        >
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6 border border-zinc-800 shadow-xl">
            <Zap className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-xl font-semibold text-zinc-200 mb-2">Ready to build?</h3>
          <p className="text-zinc-500 max-w-md text-center mb-8">
            Create your first project to start generating React components with AI.
          </p>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2"
          >
            {isCreating ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            <span>Create New Project</span>
          </button>
        </motion.div>
      )}


          {/* Subtle upgrade hint for free users */}
          {isFreeTier && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8 flex items-center justify-between px-5 py-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-xl shadow-lg shadow-black/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-500/10 flex items-center justify-center border border-white/5">
                  <Crown className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <p className="text-zinc-200 text-sm font-medium">Free Plan</p>
                  <p className="text-zinc-500 text-xs">{projects.length} / {tierConfig.limit} projects used</p>
                </div>
              </div>
              <Link
                href="/dashboard/billing"
                className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 rounded-md transition-colors"
              >
                Upgrade Plan
              </Link>
            </motion.div>
          )}

          {/* Search and filters */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between gap-4 mb-8"
          >
            <div className="relative flex-1 max-w-md group">
              <div className="absolute inset-0 bg-emerald-500/5 rounded-lg blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-500/70 transition-colors" />
              <input 
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="relative w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:bg-white/10 focus:border-emerald-500/30 backdrop-blur-md transition-all shadow-inner shadow-black/20"
              />
            </div>
            
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 backdrop-blur-md rounded-lg p-1 shadow-inner shadow-black/20">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all duration-300 ${viewMode === 'grid' ? 'bg-white/10 text-emerald-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all duration-300 ${viewMode === 'list' ? 'bg-white/10 text-emerald-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Projects */}
          {filteredProjects.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-20 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl"
            >
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner shadow-black/20">
                <Plus className="w-6 h-6 text-zinc-500" />
              </div>
              <h3 className="text-lg font-medium text-zinc-200 mb-2">
                {searchQuery ? 'No projects found' : 'Start your first project'}
              </h3>
              <p className="text-zinc-500 text-sm max-w-xs mx-auto">
                {searchQuery 
                  ? 'Try a different search term.' 
                  : 'Initialize a new build to begin generating.'}
              </p>
            </motion.div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <Link
                    href={`/builder?project=${project.id}`}
                    className="group block bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 backdrop-blur-sm rounded-xl p-6 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.1)] h-full relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative z-10 flex items-start justify-between mb-6">
                      <div className="w-12 h-12 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-colors shadow-inner shadow-black/20">
                        <div className="w-3 h-3 bg-emerald-500/50 rounded-sm group-hover:bg-emerald-400 group-hover:shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all" />
                      </div>
                      
                      {project.slug && (
                        <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-emerald-500/80 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/10">
                          <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                          Live
                        </span>
                      )}
                    </div>

                    <div className="relative z-10">
                      <h3 className="font-medium text-zinc-200 mb-1 truncate group-hover:text-white transition-colors text-lg">
                        {project.name || 'Untitled'}
                      </h3>
                      
                      <p className="text-xs text-zinc-500 flex items-center gap-1.5 mb-6">
                        <Clock className="w-3 h-3" />
                        {project.updated_at 
                          ? formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })
                          : 'Just now'}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          {project.slug && (
                            <a
                              href={`https://${project.slug}.hatchitsites.dev`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button 
                            onClick={(e) => handleDelete(e, project.id)}
                            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-all">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="border border-white/10 rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm"
            >
              {filteredProjects.map((project, i) => (
                <Link
                  key={project.id}
                  href={`/builder?project=${project.id}`}
                  className={`group flex items-center gap-4 px-6 py-5 hover:bg-white/5 transition-colors ${
                    i !== filteredProjects.length - 1 ? 'border-b border-white/5' : ''
                  }`}
                >
                  <div className="w-10 h-10 bg-white/5 border border-white/5 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-colors">
                    <div className="w-2.5 h-2.5 bg-emerald-500/50 rounded-sm group-hover:bg-emerald-400 transition-colors" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-zinc-200 text-sm truncate group-hover:text-white transition-colors">
                      {project.name || 'Untitled'}
                    </h3>
                    <p className="text-xs text-zinc-500">
                      {project.updated_at 
                        ? formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })
                        : 'Just now'}
                    </p>
                  </div>

                  {project.slug && (
                    <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-emerald-500/80 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/10">
                      <span className="w-1 h-1 bg-emerald-500 rounded-full" />
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
                        className="p-2 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button 
                      onClick={(e) => handleDelete(e, project.id)}
                      className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </motion.div>
          )}

          {/* Coming Soon - Realistic Roadmap */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-16 pt-8 border-t border-white/10"
          >
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-lg font-medium text-zinc-400">Coming Soon</h2>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded uppercase tracking-wider border border-emerald-500/20">Q1 2026</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Replicator - REAL, already built */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="group relative bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-6 overflow-hidden hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-colors shadow-inner shadow-black/20">
                    <Zap className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h3 className="font-medium text-zinc-200 mb-2 text-lg">URL Replicator</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Paste any URL → AI extracts the design DNA and recreates it as your starting point.
                  </p>
                  <div className="mt-6 flex items-center gap-1.5 text-[10px] text-emerald-500 uppercase tracking-wider font-medium">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Built — Launching Soon
                  </div>
                </div>
              </motion.div>

              {/* Code Export - REAL, tier-gated */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="group relative bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-6 overflow-hidden hover:bg-white/10 transition-all duration-300"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors shadow-inner shadow-black/20">
                    <Code2 className="w-5 h-5 text-zinc-400 group-hover:text-zinc-300" />
                  </div>
                  <h3 className="font-medium text-zinc-200 mb-2 text-lg">Code Export</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Download your components as clean React + Tailwind files. Own your code completely.
                  </p>
                  <div className="mt-6 flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
                    <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                    Visionary+ Tier
                  </div>
                </div>
              </motion.div>

              {/* Custom Domains - REAL roadmap */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="group relative bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-6 overflow-hidden hover:bg-white/10 transition-all duration-300"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors shadow-inner shadow-black/20">
                    <Globe className="w-5 h-5 text-zinc-400 group-hover:text-zinc-300" />
                  </div>
                  <h3 className="font-medium text-zinc-200 mb-2 text-lg">Custom Domains</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Connect your own domain. Deploy to yourbrand.com instead of hatchitsites.dev.
                  </p>
                  <div className="mt-6 flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
                    <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                    Q1 2026
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Roadmap Link */}
            <div className="mt-8 text-center">
              <Link 
                href="/roadmap"
                className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-emerald-400 transition-colors px-4 py-2 rounded-full hover:bg-white/5"
              >
                View full roadmap
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowUpgradeModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900/90 border border-white/10 backdrop-blur-xl rounded-2xl p-8 w-full max-w-lg shadow-2xl shadow-black/50"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-semibold text-white mb-2">Upgrade your plan</h2>
              <p className="text-zinc-400 text-sm mb-8">
                You&apos;ve reached the {tierConfig.limit} project limit. Choose a plan to continue building.
              </p>
              
              <div className="space-y-4 mb-8">
                <a 
                  href="/api/checkout?tier=architect"
                  className="flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all group"
                >
                  <div>
                    <p className="text-zinc-200 font-medium group-hover:text-white transition-colors">Architect</p>
                    <p className="text-zinc-500 text-sm">3 projects, deploy to hatchit.dev</p>
                  </div>
                  <p className="text-zinc-200 font-semibold">$19<span className="text-zinc-500 font-normal">/mo</span></p>
                </a>

                <a 
                  href="/api/checkout?tier=visionary"
                  className="flex items-center justify-between p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition-all relative group shadow-[0_0_30px_-10px_rgba(16,185,129,0.2)]"
                >
                  <div className="absolute -top-2.5 left-4 px-2.5 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full shadow-lg shadow-emerald-500/20 tracking-wide">RECOMMENDED</div>
                  <div>
                    <p className="text-white font-medium">Visionary</p>
                    <p className="text-emerald-200/60 text-sm">10 projects + download code</p>
                  </div>
                  <p className="text-white font-semibold">$49<span className="text-emerald-200/60 font-normal">/mo</span></p>
                </a>

                <a 
                  href="/api/checkout?tier=singularity"
                  className="flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all group"
                >
                  <div>
                    <p className="text-zinc-200 font-medium group-hover:text-white transition-colors">Singularity</p>
                    <p className="text-zinc-500 text-sm">Unlimited projects + API</p>
                  </div>
                  <p className="text-zinc-200 font-semibold">$199<span className="text-zinc-500 font-normal">/mo</span></p>
                </a>
              </div>

              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full py-3 text-zinc-500 hover:text-zinc-300 text-sm transition-colors font-medium"
              >
                Maybe later
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

