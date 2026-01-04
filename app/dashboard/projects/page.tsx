'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Box, ArrowRight, Trash2, ExternalLink, Calendar, Clock, Crown, Zap, Star, Lock, Terminal, Search, Filter, MoreHorizontal, Activity, Database, Cpu, Globe, Share2, Check, Copy } from 'lucide-react'
import { useProjects } from '@/hooks/useProjects'
import { formatDistanceToNow } from 'date-fns'

export default function ProjectsPage() {
  const { projects, createProject, deleteProject, switchProject, accountSubscription } = useProjects()
  const [isCreating, setIsCreating] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Tier config for display
  const tierConfig = useMemo(() => {
    const tier = accountSubscription?.tier
    if (tier === 'singularity') return { name: 'Singularity', color: 'amber', icon: Crown, limit: Infinity, gradient: 'from-amber-500 to-orange-500' }
    if (tier === 'visionary') return { name: 'Visionary', color: 'violet', icon: Zap, limit: Infinity, gradient: 'from-violet-500 to-purple-500' }
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

  const handleCreate = () => {
    if (isAtLimit) {
      setShowLimitModal(true)
      return
    }
    setIsCreating(true)
    const success = createProject()
    if (!success) {
      setShowLimitModal(true)
      setIsCreating(false)
    }
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this construct? This cannot be undone.')) {
      deleteProject(id)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Professional Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Projects</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Manage and deploy your generated sites.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-md">
            <span className="text-xs text-zinc-500 font-medium">PLAN</span>
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
              tierConfig.color === 'amber' ? 'bg-amber-500/10 text-amber-400' : 
              tierConfig.color === 'violet' ? 'bg-violet-500/10 text-violet-400' : 
              tierConfig.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
            }`}>{tierConfig.name}</span>
          </div>

          <button
            onClick={handleCreate}
            disabled={isCreating}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
              isAtLimit 
                ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed' 
                : 'bg-white text-black hover:bg-zinc-200'
            }`}
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>New Project</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/30 border border-zinc-800 rounded-md pl-9 pr-4 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all"
          />
        </div>
      </div>

      {/* Project Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
          <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
            <Box className="w-6 h-6 text-zinc-600" />
          </div>
          <h3 className="text-zinc-300 font-medium mb-1">No projects found</h3>
          <p className="text-zinc-500 text-sm mb-6">
            {searchQuery ? "Try adjusting your search terms." : "Create your first project to get started."}
          </p>
          {!searchQuery && (
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-white text-black rounded-md text-sm font-medium hover:bg-zinc-200 transition-colors"
            >
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const isLocked = tierConfig.name === 'No Plan'
            
            return (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => isLocked && setShowLimitModal(true)}
                className={`group relative bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 rounded-xl overflow-hidden transition-all hover:shadow-lg hover:shadow-black/20 ${
                  isLocked ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {!isLocked && (
                  <Link href={`/builder?project=${project.id}`} className="absolute inset-0 z-0" />
                )}

                <div className="p-5 relative z-10 pointer-events-none">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors ${
                      isLocked 
                        ? 'bg-zinc-900 border-zinc-800' 
                        : 'bg-zinc-900 border-zinc-800 group-hover:border-zinc-700'
                    }`}>
                      <Box className={`w-5 h-5 ${isLocked ? 'text-zinc-600' : 'text-zinc-400 group-hover:text-white'} transition-colors`} />
                    </div>
                    
                    <div className="flex items-center gap-1 pointer-events-auto">
                      {project.deployedSlug && (
                        <a
                          href={`https://${project.deployedSlug}.hatchit.app`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-colors"
                          title="View Live"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Globe className="w-4 h-4" />
                        </a>
                      )}
                      
                      {!isLocked && (
                        <button 
                          onClick={(e) => handleDelete(e, project.id)}
                          className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-white font-medium truncate pr-4 mb-1">{project.name || 'Untitled Project'}</h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono mb-4">
                    <span className="truncate max-w-[120px]">{project.id}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        navigator.clipboard.writeText(project.id)
                        setCopiedId(project.id)
                        setTimeout(() => setCopiedId(null), 2000)
                      }}
                      className="hover:text-zinc-300 transition-colors pointer-events-auto"
                    >
                      {copiedId === project.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800/50">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <Clock className="w-3 h-3" />
                      <span>{project.updatedAt ? formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true }) : 'Just now'}</span>
                    </div>
                    
                    {!isLocked && (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 group-hover:text-white transition-colors">
                        Open Studio
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
      
      {/* Limit reached modal */}
      {showLimitModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowLimitModal(false)}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-950 border border-zinc-800 rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-1">Choose Your Plan</h2>
              <p className="text-zinc-400 text-xs sm:text-sm">
                Select a plan to start building.
              </p>
            </div>
            
            <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              {/* Architect */}
              <Link href="/api/checkout?priceId=price_architect" className="group p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-emerald-500/50 active:scale-[0.98] transition-all">
                <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0">
                  <div className="sm:mb-2">
                    <div className="text-[10px] sm:text-xs font-mono text-emerald-500">ARCHITECT</div>
                    <div className="text-xl sm:text-2xl font-bold text-white">$19<span className="text-xs sm:text-sm text-zinc-500 font-normal">/mo</span></div>
                  </div>
                  <p className="text-xs text-zinc-400 flex-1 sm:flex-none">3 Sites</p>
                </div>
              </Link>

              {/* Visionary */}
              <Link href="/api/checkout?priceId=price_visionary" className="group p-4 rounded-xl border-2 border-violet-500/50 bg-violet-500/5 hover:border-violet-500 active:scale-[0.98] transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 px-2 py-0.5 bg-violet-500 text-[10px] font-bold text-white rounded-bl">POPULAR</div>
                <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0">
                  <div className="sm:mb-2">
                    <div className="text-[10px] sm:text-xs font-mono text-violet-400">VISIONARY</div>
                    <div className="text-xl sm:text-2xl font-bold text-white">$49<span className="text-xs sm:text-sm text-zinc-500 font-normal">/mo</span></div>
                  </div>
                  <p className="text-xs text-zinc-400 flex-1 sm:flex-none">Unlimited Sites</p>
                </div>
              </Link>

              {/* Singularity */}
              <Link href="/api/checkout?priceId=price_singularity" className="group p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50 active:scale-[0.98] transition-all">
                <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0">
                  <div className="sm:mb-2">
                    <div className="text-[10px] sm:text-xs font-mono text-amber-400">SINGULARITY</div>
                    <div className="text-xl sm:text-2xl font-bold text-white">$199<span className="text-xs sm:text-sm text-zinc-500 font-normal">/mo</span></div>
                  </div>
                  <p className="text-xs text-zinc-400 flex-1 sm:flex-none">White Label</p>
                </div>
              </Link>
            </div>

            <button
              onClick={() => setShowLimitModal(false)}
              className="w-full py-3 text-zinc-500 hover:text-white transition-colors text-sm border-t border-zinc-800"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}
