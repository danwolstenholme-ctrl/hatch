'use client'

import { useEffect, useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ArrowRight, Trash2, Search, Globe, LayoutGrid, List, ExternalLink, Sparkles, Settings } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { formatDistanceToNow } from 'date-fns'
import Pip from '@/components/Pip'
import { DbProject } from '@/lib/supabase'

type TierConfig = {
  name: string
  limit: number
  color: string
}

export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const [projects, setProjects] = useState<DbProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const accountSubscription = user?.publicMetadata?.accountSubscription as { tier?: string } | undefined
  const tier = accountSubscription?.tier || 'free'
  const isFreeTier = tier === 'free' || tier === 'trial'

  const tierConfig = useMemo<TierConfig>(() => {
    if (tier === 'singularity') return { name: 'Singularity', limit: Infinity, color: 'text-amber-400' }
    if (tier === 'visionary') return { name: 'Visionary', limit: Infinity, color: 'text-emerald-400' }
    if (tier === 'architect') return { name: 'Architect', limit: 3, color: 'text-emerald-400' }
    return { name: 'Free', limit: 3, color: 'text-zinc-400' }
  }, [tier])

  const isAtLimit = tierConfig.limit !== Infinity && projects.length >= tierConfig.limit
  const firstName = user?.firstName || 'there'

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      router.replace('/sign-in?redirect_url=/dashboard')
      return
    }

    let cancelled = false

    const bootstrap = async () => {
      try {
        const res = await fetch('/api/project/list')
        console.log('[Dashboard] Project list fetch:', { status: res.status })
        if (res.status === 401) {
          router.replace('/sign-in?redirect_url=/dashboard')
          return
        }

        if (res.ok) {
          const data = await res.json()
          console.log('[Dashboard] Projects loaded:', { count: data.projects?.length || 0, projects: data.projects?.map((p: any) => ({ id: p.id, name: p.name })) })
          if (!cancelled) setProjects(data.projects || [])
        }
      } catch (error) {
        console.error('[Dashboard] Failed to load projects', error)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    bootstrap()

    return () => {
      cancelled = true
    }
  }, [isLoaded, isSignedIn, router])

  const filteredProjects = useMemo(() => {
    if (!searchQuery) return projects
    const query = searchQuery.toLowerCase()
    return projects.filter(project => (project.name || 'Untitled Project').toLowerCase().includes(query))
  }, [projects, searchQuery])

  const lastUpdatedProject = useMemo(() => {
    if (!projects.length) return undefined
    return [...projects].sort((a, b) => {
      const aTime = a.updated_at ? new Date(a.updated_at).getTime() : 0
      const bTime = b.updated_at ? new Date(b.updated_at).getTime() : 0
      return bTime - aTime
    })[0]
  }, [projects])

  const routeToBuilder = (projectId?: string | null) => {
    if (projectId) {
      router.push(`/builder?project=${projectId}`)
    } else {
      router.push('/builder')
    }
  }

  const handleCreate = async () => {
    if (isAtLimit) {
      setShowUpgradeModal(true)
      return
    }

    setIsCreating(true)
    setCreateError(null)
    try {
      const res = await fetch('/api/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Untitled Project', templateId: 'website' }),
      })

      const data = await res.json()
      
      if (res.ok && data.project) {
        setProjects(prev => [data.project, ...prev])
        routeToBuilder(data.project.id)
      } else {
        console.error('[Dashboard] Create project failed:', { status: res.status, data })
        // If at limit, show upgrade modal
        if (res.status === 403) {
          setShowUpgradeModal(true)
        } else {
          setCreateError(data.error || 'Failed to create project. Please try again.')
        }
      }
    } catch (err) {
      console.error('[Dashboard] Create project error:', err)
      setCreateError('Failed to create project. Please check your connection.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (event: MouseEvent<HTMLButtonElement>, id: string) => {
    event.preventDefault()
    event.stopPropagation()

    if (!confirm('Delete this project?')) return

    const res = await fetch(`/api/project/${id}`, { method: 'DELETE' })
    if (res.ok) setProjects(prev => prev.filter(project => project.id !== id))
  }

  // Loading state with Pip
  if (!isLoaded || !isSignedIn || isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <Pip size={60} animate={true} float={true} glow={true} />
        <p className="text-zinc-400 text-sm">
          Loading your dashboard...
        </p>
      </div>
    )
  }

  const hasProjects = projects.length > 0

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Error Banner */}
        <AnimatePresence>
          {createError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              <span>{createError}</span>
              <button onClick={() => setCreateError(null)} className="text-red-400/60 hover:text-red-400">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-white">
              Hey {firstName} 👋
            </h1>
            <p className="text-zinc-500 text-sm mt-0.5">
              {hasProjects 
                ? `You have ${projects.length} project${projects.length === 1 ? '' : 's'}. Let's keep building.`
                : "Ready to build something amazing?"
              }
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/billing"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className={tierConfig.color}>{tierConfig.name}</span>
            </Link>
            
            {hasProjects && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleCreate}
                disabled={isCreating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
              >
                {isCreating ? (
                  <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                New Project
              </motion.button>
            )}
          </div>
        </motion.header>

        {/* Empty State - First Time User */}
        {!hasProjects && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-xl bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/50 p-6 sm:p-8"
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.08),transparent_60%)] pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            
            <div className="relative flex flex-col items-center text-center max-w-lg mx-auto">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <Pip size={64} animate={true} float={true} glow={true} />
              </motion.div>
              
              <h2 className="text-lg sm:text-xl font-semibold text-white mt-4">
                Welcome to HatchIt!
              </h2>
              <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
                Describe what you want to build, and watch AI create production-ready React components in real-time. 
                No templates. No drag-and-drop. Just your ideas, instantly realized.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-2 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="relative group w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent rounded-xl pointer-events-none" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                  {isCreating ? (
                    <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span className="relative">Start Building</span>
                  <ArrowRight className="w-4 h-4 relative group-hover:translate-x-0.5 transition-transform" />
                </motion.button>
                
                <Link
                  href="/how-it-works"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900/50 text-zinc-300 text-sm font-medium hover:bg-zinc-800/50 hover:border-zinc-700 transition-colors"
                >
                  See how it works
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 mt-5 text-xs text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Live preview
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Real React code
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  One-click deploy
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Projects Section */}
        {hasProjects && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {/* Search and View Toggle */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] group">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 pl-8 pr-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/40 focus:bg-zinc-900 focus:outline-none transition-colors"
                />
              </div>
              <div className="flex items-center gap-0.5 rounded-lg border border-zinc-800 bg-zinc-900/50 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`rounded-md p-1.5 transition-all ${viewMode === 'grid' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`rounded-md p-1.5 transition-all ${viewMode === 'list' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* No Search Results */}
            {filteredProjects.length === 0 && searchQuery && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-8 text-center">
                <p className="text-zinc-500 text-sm">No projects match "{searchQuery}"</p>
              </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && filteredProjects.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.02 + index * 0.02 }}
                  >
                    <Link
                      href={`/builder?project=${project.id}`}
                      className="group relative block h-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-all duration-150 hover:border-emerald-500/40 hover:bg-zinc-900"
                    >
                      {/* Hover gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      
                      <div className="relative">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white truncate group-hover:text-emerald-400 transition-colors">
                              {project.name || 'Untitled Project'}
                            </h3>
                            <p className="text-xs text-zinc-500 mt-1">
                              {project.updated_at
                                ? formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })
                                : 'Just created'}
                            </p>
                          </div>
                          
                          <button
                            onClick={(e) => handleDelete(e, project.id)}
                            className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-800/50">
                          <span className={`text-xs px-2 py-1 rounded-full border ${
                            project.status === 'deployed' 
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                              : project.status === 'complete'
                              ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                              : 'border-zinc-700 bg-zinc-800/50 text-zinc-400'
                          }`}>
                            {project.status === 'deployed' ? 'Live' : project.status === 'complete' ? 'Ready' : 'Building'}
                          </span>
                          
                          {project.status === 'deployed' && project.slug && (
                            <a
                              href={`https://${project.slug}.hatchitsites.dev`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-emerald-400 transition-colors"
                            >
                              <Globe className="w-3 h-3" />
                              View site
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && filteredProjects.length > 0 && (
              <div className="space-y-1.5">
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.02 + index * 0.02 }}
                  >
                    <Link
                      href={`/builder?project=${project.id}`}
                      className="group flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-emerald-500/40 hover:bg-zinc-900 transition-all"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-md border border-zinc-700 bg-zinc-800/50 flex items-center justify-center flex-shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-white truncate group-hover:text-emerald-400 transition-colors">
                            {project.name || 'Untitled Project'}
                          </h3>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-zinc-500">
                              {project.updated_at
                                ? formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })
                                : 'Just created'}
                            </span>
                            <span className={`text-xs ${
                              project.status === 'deployed' ? 'text-emerald-400' : 'text-zinc-500'
                            }`}>
                              {project.status === 'deployed' ? '● Live' : project.status === 'complete' ? '● Ready' : '● Building'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {project.status === 'deployed' && project.slug && (
                          <a
                            href={`https://${project.slug}.hatchitsites.dev`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-lg text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={(e) => handleDelete(e, project.id)}
                          className="p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>
        )}

        {/* Quick Stats for Users with Projects */}
        {hasProjects && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
              <p className="text-xs text-zinc-500">Total Projects</p>
              <p className="text-lg font-semibold text-white mt-0.5">{projects.length}</p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
              <p className="text-xs text-zinc-500">Deployed</p>
              <p className="text-lg font-semibold text-emerald-400 mt-0.5">
                {projects.filter(p => p.status === 'deployed').length}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
              <p className="text-xs text-zinc-500">Plan Limit</p>
              <p className="text-lg font-semibold text-white mt-0.5">
                {tierConfig.limit === Infinity ? '∞' : `${projects.length}/${tierConfig.limit}`}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
              <p className="text-xs text-zinc-500">Last Activity</p>
              <p className="text-sm font-medium text-white mt-0.5 truncate">
                {lastUpdatedProject?.updated_at
                  ? formatDistanceToNow(new Date(lastUpdatedProject.updated_at), { addSuffix: true })
                  : 'None'}
              </p>
            </div>
          </motion.section>
        )}
      </div>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUpgradeModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-xl p-5 max-w-sm w-full shadow-2xl"
            >
              <div className="text-center">
                <Pip size={48} animate={true} float={false} glow={true} />
                <h3 className="text-lg font-semibold text-white mt-3">Project Limit Reached</h3>
                <p className="text-zinc-400 text-sm mt-1.5">
                  You've hit the {tierConfig.limit} project limit on your {tierConfig.name} plan. 
                  Upgrade to create unlimited projects.
                </p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm hover:bg-zinc-800 transition-colors"
                  >
                    Maybe Later
                  </button>
                  <Link
                    href="/pricing"
                    className="flex-1 px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors text-center"
                  >
                    View Plans
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
