'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Box, ArrowRight, Trash2, ExternalLink, Calendar, Clock, Crown, Zap, Star, Lock, Terminal, Search, Filter, MoreHorizontal, Activity, Database, Cpu, Globe, Share2, Check, Copy, Sparkles, Layout, Code2 } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { formatDistanceToNow } from 'date-fns'
import { DbProject } from '@/lib/supabase'

import GuestCreditBadge from '@/components/GuestCreditBadge'
import PremiumFeaturesShowcase from '@/components/PremiumFeaturesShowcase'

type ViewMode = 'grid' | 'list'

export default function ProjectsPage() {
  const { user } = useUser()
  const [projects, setProjects] = useState<DbProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMigrating, setIsMigrating] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const accountSubscription = user?.publicMetadata?.accountSubscription as any
  
  // Mock guest stats for the dashboard view (since this is authenticated, we'd normally pull real usage)
  // For now, we'll show the components as "available upgrades"
  const isFreeTier = !accountSubscription || accountSubscription.tier === 'free' || accountSubscription.tier === 'trial'

  // Fetch projects from Supabase + auto-migrate localStorage
  useEffect(() => {
    async function initProjects() {
      try {
        // Check for localStorage projects to migrate
        const localProjectsStr = localStorage.getItem('hatchit-projects')
        if (localProjectsStr) {
          const localProjects = JSON.parse(localProjectsStr)
          if (localProjects && localProjects.length > 0) {
            setIsMigrating(true)
            // Migrate to Supabase
            const response = await fetch('/api/project/migrate-guest', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ projects: localProjects })
            })
            if (response.ok) {
              // Clear localStorage after successful migration
              localStorage.removeItem('hatchit-projects')
              localStorage.removeItem('hatchit-current-project')
              console.log('✓ Projects migrated to database')
            }
            setIsMigrating(false)
          }
        }

        // Fetch projects from Supabase
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

  // Tier config for display
  const tierConfig = useMemo(() => {
    const tier = accountSubscription?.tier
    if (tier === 'singularity') return { name: 'Singularity', color: 'amber', icon: Crown, limit: Infinity, gradient: 'from-amber-500 to-orange-500' }
    if (tier === 'visionary') return { name: 'Visionary', color: 'teal', icon: Zap, limit: Infinity, gradient: 'from-teal-500 to-emerald-500' }
    if (tier === 'architect') return { name: 'Architect', color: 'emerald', icon: Terminal, limit: 3, gradient: 'from-emerald-500 to-teal-500' }
    return { name: 'Free Trial', color: 'zinc', icon: Terminal, limit: 1, gradient: 'from-zinc-500 to-zinc-600' }
  }, [accountSubscription?.tier])

  const projectsRemaining = tierConfig.limit === Infinity ? '∞' : Math.max(0, tierConfig.limit - projects.length)
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
        body: JSON.stringify({ 
          name: 'Untitled Project',
          templateId: 'single-page'
        })
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
    if (confirm('Are you sure you want to delete this project? This cannot be undone.')) {
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

  // Show loading state
  if (isLoading || isMigrating) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl animate-pulse" />
                <div className="relative w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center shadow-lg">
                  <Database className="w-8 h-8 text-emerald-500 animate-pulse" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                {isMigrating ? 'Migrating your workspace' : 'Loading projects'}
              </h2>
              <p className="text-sm text-zinc-500">
                {isMigrating ? 'Converting guest projects to your account...' : 'Just a moment...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Professional Header with Stats */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Projects</h1>
              <p className="text-zinc-400">
                Your workspace • {projects.length} {projects.length === 1 ? 'project' : 'projects'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Tier Badge */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl shadow-sm">
                <div className={`w-2 h-2 rounded-full ${
                  tierConfig.color === 'amber' ? 'bg-amber-500 shadow-amber-500/50' : 
                  tierConfig.color === 'teal' ? 'bg-teal-500 shadow-teal-500/50' : 
                  tierConfig.color === 'emerald' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-zinc-500'
                } shadow-[0_0_8px]`} />
                <span className="text-sm font-semibold text-zinc-300">{tierConfig.name}</span>
                {tierConfig.limit !== Infinity && (
                  <span className="text-xs text-zinc-500 ml-1">• {projectsRemaining} slots</span>
                )}
              </div>

              {/* Create Button */}
              <button
                onClick={handleCreate}
                disabled={isCreating || isAtLimit}
                className={`group flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg ${
                  isAtLimit 
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none' 
                    : 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 hover:shadow-xl hover:shadow-emerald-500/25 hover:scale-105 active:scale-100'
                }`}
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
                    <span>New Project</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-4 shadow-sm hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shadow-lg">
                  <Layout className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{projects.length}</div>
                  <div className="text-xs text-zinc-500 font-medium">Total Projects</div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-4 shadow-sm hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shadow-lg">
                  <Globe className="w-5 h-5 text-teal-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{projects.filter(p => p.slug).length}</div>
                  <div className="text-xs text-zinc-500 font-medium">Deployed</div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-4 shadow-sm hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{tierConfig.limit === Infinity ? '∞' : tierConfig.limit}</div>
                  <div className="text-xs text-zinc-500 font-medium">Capacity</div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-4 shadow-sm hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shadow-lg">
                  <Activity className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{projects.filter(p => {
                    const hourAgo = Date.now() - 3600000
                    return p.updated_at && new Date(p.updated_at).getTime() > hourAgo
                  }).length}</div>
                  <div className="text-xs text-zinc-500 font-medium">Active Today</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Search & View Controls */}
            <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text"
              placeholder="Search projects by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid' 
                  ? 'bg-zinc-800 text-emerald-400' 
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
              }`}
            >
              <Layout className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list' 
                  ? 'bg-zinc-800 text-emerald-400' 
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
              }`}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>                  ? 'bg-emerald-100 text-emerald-600' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Project Grid/List */}
        {filteredProjects.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-2xl"
          >
            <div className="w-20 h-20 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-zinc-700 shadow-lg">
              <Box className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery ? "No projects found" : "Your first project awaits"}
            </h3>
            <p className="text-zinc-500 text-sm mb-8 max-w-md mx-auto">
              {searchQuery 
                ? "Try adjusting your search terms or create a new project." 
                : "Start building something amazing. HatchIt will handle the code."}
            </p>
            {!searchQuery && (
              <button
                onClick={handleCreate}
                disabled={isAtLimit}
                className="px-6 py-3 bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-500 hover:to-teal-500 hover:shadow-xl hover:shadow-emerald-500/25 transition-all hover:scale-105 active:scale-100"
              >
                Create Your First Project
              </button>
            )}
          </motion.div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => {
                const isLocked = tierConfig.name === 'No Plan'
                
                return (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className={`group relative bg-zinc-900 border-2 border-zinc-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 ${
                      isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'
                    }`}
                  >
                    {!isLocked && (
                      <Link href={`/builder?project=${project.id}`} className="absolute inset-0 z-0" />
                    )}

                    {/* Gradient Header */}
                    <div className="h-24 bg-gradient-to-br from-emerald-900/50 via-teal-900/50 to-zinc-900 relative overflow-hidden">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-10" />
                      {project.slug && (
                        <div className="absolute top-3 right-3 px-2 py-1 bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-lg flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                          <span className="text-[10px] font-bold text-emerald-200 tracking-wide">LIVE</span>
                        </div>
                      )}
                    </div>

                    <div className="p-5 relative z-10 pointer-events-none">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`-mt-8 w-14 h-14 rounded-xl border-4 border-zinc-900 flex items-center justify-center transition-all shadow-lg ${
                          isLocked 
                            ? 'bg-zinc-800' 
                            : 'bg-zinc-800 group-hover:bg-zinc-700 group-hover:scale-110'
                        }`}>
                          <Code2 className={`w-6 h-6 ${isLocked ? 'text-zinc-600' : 'text-emerald-500'}`} />
                        </div>
                        
                        <div className="flex items-center gap-1 pointer-events-auto">
                          {project.slug && (
                            <a
                              href={`https://${project.slug}.hatchitsites.dev`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                              title="View Live"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Globe className="w-4 h-4" />
                            </a>
                          )}
                          
                          {!isLocked && (
                            <button 
                              onClick={(e) => handleDelete(e, project.id)}
                              className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              title="Delete Project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-white truncate mb-2 group-hover:text-emerald-400 transition-colors">
                        {project.name || 'Untitled Project'}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex-1 px-2 py-1 bg-zinc-800/50 border border-zinc-800 rounded-lg font-mono text-[10px] text-zinc-500 truncate">
                          {project.id}
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            navigator.clipboard.writeText(project.id)
                            setCopiedId(project.id)
                            setTimeout(() => setCopiedId(null), 2000)
                          }}
                          className="p-1.5 hover:bg-zinc-800 rounded-lg transition-all pointer-events-auto group/copy"
                          title="Copy ID"
                        >
                          {copiedId === project.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-zinc-600 group-hover/copy:text-zinc-400" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{project.updated_at ? formatDistanceToNow(new Date(project.updated_at), { addSuffix: true }) : 'Just now'}</span>
                        </div>
                        
                        {!isLocked && (
                          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500 group-hover:gap-3 transition-all">
                            <span>Open</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        ) : (
          /* List View */
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => {
                const isLocked = tierConfig.name === 'No Plan'
                
                return (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.03 }}
                    className={`group relative bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 rounded-xl overflow-hidden transition-all hover:shadow-lg ${
                      isLocked ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {!isLocked && (
                      <Link href={`/builder?project=${project.id}`} className="absolute inset-0 z-0" />
                    )}

                    <div className="p-4 flex items-center gap-4 relative z-10 pointer-events-none">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isLocked 
                          ? 'bg-zinc-800' 
                          : 'bg-zinc-800 group-hover:bg-zinc-700 group-hover:scale-110 transition-transform'
                      }`}>
                        <Code2 className={`w-6 h-6 ${isLocked ? 'text-zinc-600' : 'text-emerald-500'}`} />
                      </div>

                      {/* Project Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">
                          {project.name || 'Untitled Project'}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs font-mono text-zinc-500 truncate max-w-[200px]">{project.id}</span>
                          <span className="text-xs text-zinc-600">•</span>
                          <span className="text-xs text-zinc-500">{project.updated_at ? formatDistanceToNow(new Date(project.updated_at), { addSuffix: true }) : 'Just now'}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {project.slug && (
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-xs font-semibold text-emerald-400">Live</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-1 pointer-events-auto">
                        {project.slug && (
                          <a
                            href={`https://${project.slug}.hatchitsites.dev`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Globe className="w-4 h-4" />
                          </a>
                        )}
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            navigator.clipboard.writeText(project.id)
                            setCopiedId(project.id)
                            setTimeout(() => setCopiedId(null), 2000)
                          }}
                          className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-all"
                        >
                          {copiedId === project.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>

                        {!isLocked && (
                          <button 
                            onClick={(e) => handleDelete(e, project.id)}
                            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                        {!isLocked && (
                          <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all ml-2" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
          </div>

          {/* Sidebar - Upgrades & Stats (Only for Free/Trial users) */}
          {isFreeTier && (
            <div className="w-full lg:w-80 space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-1 shadow-xl">
                <GuestCreditBadge 
                  buildsUsed={projects.length}
                  buildsLimit={3}
                  refinementsUsed={0}
                  refinementsLimit={10}
                  onUpgrade={() => setShowLimitModal(true)}
                />
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm">
                <PremiumFeaturesShowcase 
                  onFeatureClick={() => setShowLimitModal(true)}
                />
              </div>
            </div>
          )}
        </div>
      
      {/* Limit Modal - Redesigned (Singularity) */}
      {showLimitModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" 
          onClick={() => setShowLimitModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-zinc-950 rounded-2xl p-8 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-800 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
            
            {/* Header */}
            <div className="text-center mb-10 relative z-10">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-xl shadow-emerald-500/10">
                <Sparkles className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Upgrade Your Reality</h2>
              <p className="text-zinc-400 text-lg">
                Unlock the full power of the Singularity Engine.
              </p>
            </div>
            
            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8 relative z-10">
              {/* Architect */}
              <Link 
                href="/api/checkout?priceId=price_architect" 
                className="group relative bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/30 rounded-2xl p-6 transition-all hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1 flex flex-col"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Initiate</div>
                    <Terminal className="w-5 h-5 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">Architect</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-mono font-bold text-white">$19</span>
                      <span className="text-zinc-600 font-mono text-sm">/mo</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-grow">
                    {[
                      'Up to 3 sites',
                      'Unlimited builds',
                      'Custom domains',
                      'Export source code'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-center font-medium transition-all border border-zinc-700 group-hover:border-zinc-600">
                    Select Plan
                  </div>
                </div>
              </Link>

              {/* Visionary - Featured */}
              <Link 
                href="/api/checkout?priceId=price_visionary" 
                className="group relative bg-zinc-900 border border-emerald-500/50 rounded-2xl p-6 transition-all hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] hover:-translate-y-2 scale-105 z-20 flex flex-col"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-black text-[10px] font-bold font-mono uppercase tracking-wider rounded-full shadow-lg shadow-emerald-500/20">
                  Recommended
                </div>

                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Unlimited</div>
                    <Zap className="w-5 h-5 text-emerald-400" />
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">Visionary</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-mono font-bold text-white">$49</span>
                      <span className="text-zinc-500 font-mono text-sm">/mo</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-grow">
                    {[
                      'Unlimited sites',
                      'Everything in Architect',
                      'Priority support',
                      'Advanced analytics',
                      'Commercial license'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-white font-medium">
                        <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-center font-bold transition-all shadow-lg shadow-emerald-500/20">
                    Get Started
                  </div>
                </div>
              </Link>

              {/* Singularity */}
              <Link 
                href="/api/checkout?priceId=price_singularity" 
                className="group relative bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/30 rounded-2xl p-6 transition-all hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1 flex flex-col"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs font-mono text-amber-500 uppercase tracking-widest">God Mode</div>
                    <Crown className="w-5 h-5 text-zinc-600 group-hover:text-amber-500 transition-colors" />
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">Singularity</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-mono font-bold text-white">$199</span>
                      <span className="text-zinc-600 font-mono text-sm">/mo</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-grow">
                    {[
                      'Everything in Visionary',
                      'White label branding',
                      'AI website cloner',
                      'Style DNA evolution',
                      'Direct founder access'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-center font-medium transition-all border border-zinc-700 group-hover:border-zinc-600">
                    Select Plan
                  </div>
                </div>
              </Link>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center gap-4 pt-6 border-t border-zinc-800/50 relative z-10">
              <button
                onClick={() => setShowLimitModal(false)}
                className="px-6 py-2.5 text-zinc-500 hover:text-white font-medium transition-colors text-sm"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      </div>
    </div>
  )
}

