'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Box, ArrowRight, Trash2, Clock, Crown, Zap, Star, Search, Globe, Check, Copy, Sparkles, LayoutGrid, List, FolderOpen, Rocket, ExternalLink } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { formatDistanceToNow } from 'date-fns'
import { DbProject } from '@/lib/supabase'

export default function ProjectsPage() {
  const { user } = useUser()
  const [projects, setProjects] = useState<DbProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMigrating, setIsMigrating] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const accountSubscription = user?.publicMetadata?.accountSubscription as any

  // Fetch projects + import any guest work
  useEffect(() => {
    async function initProjects() {
      try {
        // Check for guest handoff data (from guest builder mode)
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
              console.log('✓ Guest work imported successfully')
            }
          } catch (err) {
            console.error('Failed to import guest work:', err)
          }
          setIsMigrating(false)
        }

        // Legacy: Check for old localStorage format
        const localProjectsStr = localStorage.getItem('hatchit-projects')
        if (localProjectsStr) {
          const localProjects = JSON.parse(localProjectsStr)
          if (localProjects && localProjects.length > 0) {
            setIsMigrating(true)
            const response = await fetch('/api/project/migrate-guest', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ projects: localProjects })
            })
            if (response.ok) {
              localStorage.removeItem('hatchit-projects')
              localStorage.removeItem('hatchit-current-project')
            }
            setIsMigrating(false)
          }
        }

        const res = await fetch('/api/project/list')
        if (res.ok) {
          const data = await res.json()
          setProjects(data.projects || [])
        }
      } catch (error) {
        console.error('Error loading projects:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initProjects()
  }, [])

  // Tier config
  const tierConfig = useMemo(() => {
    const tier = accountSubscription?.tier
    if (tier === 'singularity') return { name: 'Singularity', color: 'amber', icon: Crown, limit: Infinity }
    if (tier === 'visionary') return { name: 'Visionary', color: 'teal', icon: Zap, limit: Infinity }
    if (tier === 'architect') return { name: 'Architect', color: 'emerald', icon: Star, limit: 3 }
    return { name: 'Free', color: 'zinc', icon: Sparkles, limit: 1 }
  }, [accountSubscription?.tier])

  const isAtLimit = tierConfig.limit !== Infinity && projects.length >= tierConfig.limit

  const filteredProjects = useMemo(() => {
    return projects.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [projects, searchQuery])

  const handleCreate = async () => {
    if (isAtLimit) {
      setShowLimitModal(true)
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
    } catch (error) {
      console.error('Error creating project:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm('Delete this project? This cannot be undone.')) {
      try {
        const res = await fetch(`/api/project/${id}`, { method: 'DELETE' })
        if (res.ok) {
          setProjects(prev => prev.filter(p => p.id !== id))
        }
      } catch (error) {
        console.error('Error deleting project:', error)
      }
    }
  }

  // Loading state
  if (isLoading || isMigrating) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 text-sm">{isMigrating ? 'Migrating projects...' : 'Loading projects...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6 py-10">
        
        {/* Tier Status Banner - Always visible */}
        {tierConfig.name === 'Free' && (
          <div className="mb-8 p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-medium">You're on the Free plan</p>
                <p className="text-zinc-500 text-sm">Upgrade to unlock unlimited projects and deploys</p>
              </div>
            </div>
            <Link
              href="/#pricing"
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg font-medium text-sm transition-colors"
            >
              View Plans
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Clean Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-1">Projects</h1>
            <p className="text-zinc-500 text-sm">
              {projects.length} project{projects.length !== 1 ? 's' : ''} 
              {tierConfig.limit !== Infinity && ` · ${Math.max(0, tierConfig.limit - projects.length)} remaining`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Tier Badge */}
            {tierConfig.name !== 'Free' && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                tierConfig.color === 'amber' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                tierConfig.color === 'teal' ? 'bg-teal-500/10 border-teal-500/20 text-teal-400' :
                'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}>
                <tierConfig.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tierConfig.name}</span>
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={isCreating || isAtLimit}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                isAtLimit 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black'
              }`}
            >
              {isCreating ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              New Project
            </button>
          </div>
        </div>

        {/* Search & View Toggle */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
            />
          </div>

          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-zinc-800">
              <FolderOpen className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              {searchQuery ? "No projects found" : "No projects yet"}
            </h3>
            <p className="text-zinc-500 text-sm mb-6 max-w-sm mx-auto">
              {searchQuery 
                ? "Try a different search term." 
                : "Create your first project to get started."}
            </p>
            {!searchQuery && (
              <button
                onClick={handleCreate}
                disabled={isAtLimit}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg font-medium text-sm transition-colors"
              >
                Create Project
              </button>
            )}
          </motion.div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Link
                    href={`/builder?project=${project.id}`}
                    className="group block bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 transition-all hover:bg-zinc-900/80"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                        <Box className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {project.slug && (
                          <span className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded-md">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            <span className="text-[11px] font-medium text-emerald-400">Live</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-medium text-white mb-1 truncate group-hover:text-emerald-400 transition-colors">
                      {project.name || 'Untitled Project'}
                    </h3>
                    
                    {/* Meta */}
                    <p className="text-xs text-zinc-500 mb-4">
                      {project.updated_at 
                        ? `Updated ${formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}`
                        : 'Just created'}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                      <div className="flex items-center gap-2">
                        {project.slug && (
                          <a
                            href={`https://${project.slug}.hatchitsites.dev`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 text-zinc-500 hover:text-emerald-400 hover:bg-zinc-800 rounded-md transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button 
                          onClick={(e) => handleDelete(e, project.id)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <span className="text-xs text-zinc-500 group-hover:text-emerald-400 flex items-center gap-1 transition-colors">
                        Open <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* List View */
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <Link
                    href={`/builder?project=${project.id}`}
                    className="group flex items-center gap-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg px-4 py-3 transition-all"
                  >
                    <div className="w-9 h-9 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-zinc-700 transition-colors">
                      <Box className="w-4 h-4 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white text-sm truncate group-hover:text-emerald-400 transition-colors">
                        {project.name || 'Untitled Project'}
                      </h3>
                      <p className="text-xs text-zinc-500">
                        {project.updated_at 
                          ? formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })
                          : 'Just created'}
                      </p>
                    </div>

                    {project.slug && (
                      <span className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded-md">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        <span className="text-[11px] font-medium text-emerald-400">Live</span>
                      </span>
                    )}

                    <div className="flex items-center gap-1">
                      {project.slug && (
                        <a
                          href={`https://${project.slug}.hatchitsites.dev`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 text-zinc-500 hover:text-emerald-400 hover:bg-zinc-800 rounded-md transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button 
                        onClick={(e) => handleDelete(e, project.id)}
                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 transition-colors ml-2" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      
        {/* Upgrade Modal */}
        <AnimatePresence>
          {showLimitModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
              onClick={() => setShowLimitModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-zinc-900 rounded-2xl p-6 w-full max-w-lg border border-zinc-800"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Rocket className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">Upgrade to continue</h2>
                  <p className="text-zinc-400 text-sm">
                    You've reached the {tierConfig.limit} project limit. Upgrade to create more.
                  </p>
                </div>
                
                <div className="space-y-3 mb-6">
                  {/* Architect */}
                  <a 
                    href="/api/checkout?tier=architect"
                    className="block w-full p-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-emerald-400" />
                        <div>
                          <p className="text-white font-medium">Architect</p>
                          <p className="text-zinc-500 text-sm">3 projects, unlimited builds</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">$19<span className="text-zinc-500 text-sm">/mo</span></p>
                      </div>
                    </div>
                  </a>

                  {/* Visionary - Highlighted */}
                  <a 
                    href="/api/checkout?tier=visionary"
                    className="block w-full p-4 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 rounded-xl transition-colors group relative"
                  >
                    <div className="absolute -top-2 left-4 px-2 py-0.5 bg-emerald-500 text-black text-[10px] font-bold rounded">POPULAR</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-emerald-400" />
                        <div>
                          <p className="text-white font-medium">Visionary</p>
                          <p className="text-zinc-400 text-sm">Unlimited projects + code export</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">$49<span className="text-zinc-400 text-sm">/mo</span></p>
                      </div>
                    </div>
                  </a>

                  {/* Singularity */}
                  <a 
                    href="/api/checkout?tier=singularity"
                    className="block w-full p-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Crown className="w-5 h-5 text-amber-400" />
                        <div>
                          <p className="text-white font-medium">Singularity</p>
                          <p className="text-zinc-500 text-sm">Everything + API access</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">$199<span className="text-zinc-500 text-sm">/mo</span></p>
                      </div>
                    </div>
                  </a>
                </div>

                <button
                  onClick={() => setShowLimitModal(false)}
                  className="block w-full py-3 text-zinc-500 hover:text-white text-sm transition-colors"
                >
                  Maybe later
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

