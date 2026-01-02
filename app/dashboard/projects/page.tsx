'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Box, ArrowRight, Trash2, ExternalLink, Calendar, Clock, Crown, Zap, Star, Lock } from 'lucide-react'
import { useProjects } from '@/hooks/useProjects'
import { formatDistanceToNow } from 'date-fns'

export default function ProjectsPage() {
  const { projects, createProject, deleteProject, switchProject, accountSubscription } = useProjects()
  const [isCreating, setIsCreating] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)

  // Tier config for display
  const tierConfig = useMemo(() => {
    const tier = accountSubscription?.tier
    if (tier === 'agency') return { name: 'Agency', color: 'amber', icon: Crown, limit: Infinity, gradient: 'from-amber-500 to-orange-500' }
    if (tier === 'pro') return { name: 'Pro', color: 'emerald', icon: Zap, limit: Infinity, gradient: 'from-emerald-500 to-teal-500' }
    if (tier === 'lite') return { name: 'Lite', color: 'lime', icon: Star, limit: 3, gradient: 'from-lime-500 to-green-500' }
    return { name: 'Free', color: 'zinc', icon: Box, limit: 1, gradient: 'from-zinc-500 to-zinc-600' }
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
    if (confirm('Are you sure you want to delete this project? This cannot be undone.')) {
      deleteProject(id)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header with tier info */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
          <div className="flex items-center gap-3">
            <p className="text-zinc-400">Manage your digital entities.</p>
            
            {/* Project counter */}
            <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full">
              <span className="text-sm text-zinc-400">
                {projects.length} / {tierConfig.limit === Infinity ? '∞' : tierConfig.limit}
              </span>
              <span className="text-xs text-zinc-600">projects</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Tier badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border`}
               style={{ 
                 backgroundColor: tierConfig.color === 'amber' ? 'rgba(245,158,11,0.1)' : 
                                  tierConfig.color === 'emerald' ? 'rgba(16,185,129,0.1)' : 
                                  tierConfig.color === 'lime' ? 'rgba(163,230,53,0.1)' : 'rgba(63,63,70,0.5)',
                 borderColor: tierConfig.color === 'amber' ? 'rgba(245,158,11,0.3)' : 
                              tierConfig.color === 'emerald' ? 'rgba(16,185,129,0.3)' : 
                              tierConfig.color === 'lime' ? 'rgba(163,230,53,0.3)' : 'rgba(63,63,70,0.5)'
               }}>
            <tierConfig.icon className="w-3.5 h-3.5" 
                            style={{ color: tierConfig.color === 'amber' ? '#fbbf24' : 
                                           tierConfig.color === 'emerald' ? '#34d399' : 
                                           tierConfig.color === 'lime' ? '#a3e635' : '#a1a1aa' }} />
            <span className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: tierConfig.color === 'amber' ? '#fbbf24' : 
                                 tierConfig.color === 'emerald' ? '#34d399' : 
                                 tierConfig.color === 'lime' ? '#a3e635' : '#a1a1aa' }}>
              {tierConfig.name}
            </span>
          </div>
          
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
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
            {isAtLimit ? 'Upgrade for More' : 'New Project'}
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
          <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
            <Box className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
          <p className="text-zinc-400 mb-6 max-w-md text-center">
            Initialize your first digital entity to begin building.
          </p>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Initialize Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/builder?project=${project.id}`}
              className="group relative block p-6 bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 rounded-xl transition-all hover:bg-zinc-900 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]"
            >
              {/* Delete button */}
              <button
                onClick={(e) => handleDelete(e, project.id)}
                className="absolute top-4 right-4 p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Box className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex items-center gap-2 pr-8">
                  {project.deployedSlug && (
                    <span className="px-2 py-1 rounded text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Live
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded text-xs font-mono ${
                    project.status === 'published' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}>
                    {project.status || 'draft'}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                {project.name || 'Untitled Project'}
              </h3>
              <p className="text-sm text-zinc-400 mb-6 line-clamp-2">
                {project.description || 'No description provided.'}
              </p>

              <div className="flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-800 pt-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {project.updatedAt 
                      ? formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })
                      : 'Just now'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-emerald-500/0 group-hover:text-emerald-500 transition-colors transform translate-x-2 group-hover:translate-x-0">
                  <span className="font-medium">Open Builder</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {/* Limit reached modal */}
      {showLimitModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowLimitModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Lock className="w-8 h-8 text-amber-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Project Limit Reached</h2>
              <p className="text-zinc-400 text-sm">
                You've used all {tierConfig.limit} project{tierConfig.limit !== 1 ? 's' : ''} on your {tierConfig.name} plan. 
                Upgrade to create more projects.
              </p>
            </div>
            
            <div className="space-y-3">
              {tierConfig.name === 'Lite' && (
                <Link
                  href="/sign-up?upgrade=pro"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
                >
                  <Zap className="w-4 h-4" />
                  Upgrade to Pro — Unlimited Projects
                </Link>
              )}
              <button
                onClick={() => setShowLimitModal(false)}
                className="w-full py-2.5 text-zinc-400 hover:text-white transition-colors text-sm"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
