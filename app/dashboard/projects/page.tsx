'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Box, ArrowRight, Trash2, ExternalLink, Calendar, Clock, Crown, Zap, Star, Lock, Terminal } from 'lucide-react'
import { useProjects } from '@/hooks/useProjects'
import { formatDistanceToNow } from 'date-fns'

export default function ProjectsPage() {
  const { projects, createProject, deleteProject, switchProject, accountSubscription } = useProjects()
  const [isCreating, setIsCreating] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)

  // Tier config for display
  const tierConfig = useMemo(() => {
    const tier = accountSubscription?.tier
    if (tier === 'singularity') return { name: 'Singularity', color: 'amber', icon: Crown, limit: Infinity, gradient: 'from-amber-500 to-orange-500' }
    if (tier === 'visionary') return { name: 'Visionary', color: 'violet', icon: Zap, limit: Infinity, gradient: 'from-violet-500 to-purple-500' }
    if (tier === 'architect') return { name: 'Architect', color: 'emerald', icon: Terminal, limit: 3, gradient: 'from-emerald-500 to-teal-500' }
    return { name: 'No Plan', color: 'zinc', icon: Terminal, limit: 0, gradient: 'from-zinc-500 to-zinc-600' }
  }, [accountSubscription?.tier])

  const projectsRemaining = tierConfig.limit === Infinity ? '∞' : Math.max(0, tierConfig.limit - projects.length)
  const isAtLimit = tierConfig.limit !== Infinity && projects.length >= tierConfig.limit

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
    <div className="px-4 py-6 md:p-8 max-w-7xl mx-auto">
      {/* Header - stacks on mobile */}
      <div className="flex flex-col gap-4 mb-6 md:mb-8">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Terminal</h1>
          
          {/* Tier badge - always visible */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border`}
               style={{ 
                 backgroundColor: tierConfig.color === 'amber' ? 'rgba(245,158,11,0.1)' : 
                                  tierConfig.color === 'violet' ? 'rgba(139,92,246,0.1)' :
                                  tierConfig.color === 'emerald' ? 'rgba(16,185,129,0.1)' : 'rgba(63,63,70,0.5)',
                 borderColor: tierConfig.color === 'amber' ? 'rgba(245,158,11,0.3)' : 
                              tierConfig.color === 'violet' ? 'rgba(139,92,246,0.3)' :
                              tierConfig.color === 'emerald' ? 'rgba(16,185,129,0.3)' : 'rgba(63,63,70,0.5)'
               }}>
            <tierConfig.icon className="w-3 h-3" 
                            style={{ color: tierConfig.color === 'amber' ? '#fbbf24' : 
                                           tierConfig.color === 'violet' ? '#a78bfa' :
                                           tierConfig.color === 'emerald' ? '#34d399' : '#a1a1aa' }} />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider"
                  style={{ color: tierConfig.color === 'amber' ? '#fbbf24' : 
                                 tierConfig.color === 'violet' ? '#a78bfa' :
                                 tierConfig.color === 'emerald' ? '#34d399' : '#a1a1aa' }}>
              {tierConfig.name}
            </span>
          </div>
        </div>
        
        {/* Subtitle + counter row */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-zinc-400 hidden sm:block">Manage your digital constructs</p>
          
          {/* Project counter */}
          <div className="flex items-center gap-2 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs">
            <span className="text-zinc-400 font-mono">
              {projects.length}/{tierConfig.limit === Infinity ? '∞' : tierConfig.limit}
            </span>
            <span className="text-zinc-600 hidden sm:inline">constructs</span>
          </div>
          
          {/* Create button */}
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isAtLimit 
                ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isCreating ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isAtLimit ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{isAtLimit ? 'Upgrade' : 'New Construct'}</span>
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 md:py-20 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
            <Terminal className="w-7 h-7 md:w-8 md:h-8 text-zinc-600" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-white mb-2">No constructs yet</h3>
          <p className="text-zinc-400 mb-6 max-w-md text-center text-sm px-4">
            Create your first site to begin building.
          </p>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors text-sm md:text-base"
          >
            <Plus className="w-4 h-4" />
            Create Site
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {projects.map((project) => {
            const isLocked = tierConfig.name === 'No Plan'
            
            return (
              <div
                key={project.id}
                onClick={() => isLocked && setShowLimitModal(true)}
                className={`group relative block p-4 md:p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl transition-all ${
                  isLocked 
                    ? 'cursor-pointer' 
                    : 'hover:border-emerald-500/50 hover:bg-zinc-900 active:scale-[0.98]'
                }`}
              >
                {!isLocked && (
                  <Link href={`/builder?project=${project.id}`} className="absolute inset-0 z-0" />
                )}

                {/* Lock Overlay */}
                {isLocked && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/60 backdrop-blur-[2px] rounded-xl">
                    <div className="flex flex-col items-center gap-1.5 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg">
                      <Lock className="w-4 h-4 text-zinc-500" />
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Locked</span>
                    </div>
                  </div>
                )}

                {/* Delete button - larger touch target on mobile */}
                {!isLocked && (
                  <button
                    onClick={(e) => handleDelete(e, project.id)}
                    className="absolute top-3 right-3 md:top-4 md:right-4 z-20 p-2 md:p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-md md:opacity-0 md:group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                
                <div className="flex items-start gap-3 mb-3 md:mb-4 relative">
                  <div className={`w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform ${
                    isLocked ? 'bg-zinc-800 border border-zinc-700' : 'bg-emerald-500/10 border border-emerald-500/20'
                  }`}>
                    <Terminal className={`w-4 h-4 md:w-5 md:h-5 ${isLocked ? 'text-zinc-600' : 'text-emerald-500'}`} />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap pr-8">
                    {project.deployedSlug && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] md:text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Live
                      </span>
                    )}
                    <span className={`px-1.5 py-0.5 rounded text-[10px] md:text-xs font-mono ${
                      project.status === 'published' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}>
                      {project.status || 'draft'}
                    </span>
                  </div>
                </div>

                <h3 className={`text-base md:text-lg font-bold mb-1.5 md:mb-2 transition-colors line-clamp-1 ${isLocked ? 'text-zinc-500' : 'text-white'}`}>
                  {project.name || 'Untitled'}
                </h3>
                <p className="text-xs md:text-sm text-zinc-500 mb-4 md:mb-6 line-clamp-2">
                  {project.description || 'No description'}
                </p>

                <div className="flex items-center justify-between text-[10px] md:text-xs text-zinc-600 border-t border-zinc-800 pt-3 md:pt-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {project.updatedAt 
                        ? formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })
                        : 'Just now'}
                    </span>
                  </div>
                  {!isLocked && (
                    <div className="flex items-center gap-1 text-emerald-500 md:text-emerald-500/0 md:group-hover:text-emerald-500 transition-colors">
                      <span className="font-medium">Open</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
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
