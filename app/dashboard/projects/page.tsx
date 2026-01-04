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
    <div className="max-w-7xl mx-auto font-mono">
      {/* Terminal Header */}
      <div className="mb-8 border-b border-zinc-800 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <Terminal className="w-8 h-8 text-emerald-500" />
              <span>PROJECT_INDEX</span>
            </h1>
            <p className="text-zinc-500 text-xs mt-1 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              SYSTEM_READY // ACCESS_LEVEL: <span className={`uppercase ${
                tierConfig.color === 'amber' ? 'text-amber-400' : 
                tierConfig.color === 'violet' ? 'text-violet-400' : 
                tierConfig.color === 'emerald' ? 'text-emerald-400' : 'text-zinc-400'
              }`}>{tierConfig.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg">
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase">Total Constructs</span>
                <span className="text-lg font-bold text-white leading-none">{projects.length}</span>
              </div>
              <div className="w-px h-8 bg-zinc-800" />
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase">Capacity</span>
                <span className="text-lg font-bold text-zinc-400 leading-none">
                  {tierConfig.limit === Infinity ? '∞' : tierConfig.limit}
                </span>
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={isCreating}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-bold text-sm transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] ${
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
              <span>{isAtLimit ? 'UPGRADE_REQUIRED' : 'INITIALIZE_NEW'}</span>
            </button>
          </div>
        </div>

        {/* Command Bar */}
        <div className="flex items-center gap-4 bg-zinc-900/30 border border-zinc-800 p-1 rounded-lg">
          <div className="flex-1 flex items-center gap-3 px-3">
            <span className="text-emerald-500 font-bold">{'>'}</span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="filter_constructs..." 
              className="bg-transparent border-none focus:outline-none text-white text-sm w-full font-mono placeholder-zinc-600"
            />
          </div>
          <div className="flex items-center gap-1 pr-1">
            <button className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded transition-colors">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded transition-colors">
              <Activity className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Data Grid */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mb-4">
            <Database className="w-8 h-8 text-zinc-700" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">NO_DATA_FOUND</h3>
          <p className="text-zinc-500 mb-6 font-mono text-sm">
            Database empty. Initialize first construct.
          </p>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-emerald-500/50 text-white rounded-lg font-mono text-sm transition-all group"
          >
            <Plus className="w-4 h-4 text-emerald-500 group-hover:animate-pulse" />
            <span>EXECUTE_INIT</span>
          </button>
        </div>
      ) : (
        <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/20">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-zinc-900/50 border-b border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
            <div className="col-span-5 md:col-span-4">Construct Identity</div>
            <div className="col-span-3 md:col-span-2 text-center">Status</div>
            <div className="hidden md:block md:col-span-3">Last Modified</div>
            <div className="col-span-4 md:col-span-3 text-right">Operations</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-zinc-800/50">
            {filteredProjects.map((project) => {
              const isLocked = tierConfig.name === 'No Plan'
              
              return (
                <div
                  key={project.id}
                  onClick={() => isLocked && setShowLimitModal(true)}
                  className={`group relative grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors ${
                    isLocked 
                      ? 'opacity-50 cursor-not-allowed bg-zinc-950' 
                      : 'hover:bg-zinc-900/40 cursor-pointer'
                  }`}
                >
                  {!isLocked && (
                    <Link href={`/builder?project=${project.id}`} className="absolute inset-0 z-0" />
                  )}

                  {/* Identity */}
                  <div className="col-span-5 md:col-span-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                        isLocked ? 'bg-zinc-800' : 'bg-emerald-500/10 border border-emerald-500/20'
                      }`}>
                        <Cpu className={`w-4 h-4 ${isLocked ? 'text-zinc-600' : 'text-emerald-500'}`} />
                      </div>
                      <div className="min-w-0">
                        <h3 className={`text-sm font-bold truncate ${isLocked ? 'text-zinc-500' : 'text-white group-hover:text-emerald-400 transition-colors'}`}>
                          {project.name || 'UNTITLED_CONSTRUCT'}
                        </h3>
                        <p className="text-[10px] text-zinc-600 font-mono truncate">
                          ID: {project.id.substring(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-3 md:col-span-2 flex justify-center relative z-10">
                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      project.deployedSlug 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-zinc-800/50 text-zinc-500 border-zinc-700/50'
                    }`}>
                      {project.deployedSlug ? 'LIVE' : 'DRAFT'}
                    </div>
                  </div>

                  {/* Last Modified */}
                  <div className="hidden md:block md:col-span-3 text-xs text-zinc-500 font-mono relative z-10">
                    {project.updatedAt 
                      ? formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })
                      : 'Just now'}
                  </div>

                  {/* Operations */}
                  <div className="col-span-4 md:col-span-3 flex items-center justify-end gap-2 relative z-20">
                    {project.deployedSlug && (
                      <>
                        <a
                          href={`https://${project.deployedSlug}.hatchit.app`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
                          title="View Live"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Globe className="w-4 h-4" />
                        </a>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const url = `https://${project.deployedSlug}.hatchit.app`
                            navigator.clipboard.writeText(url)
                            setCopiedId(project.id)
                            setTimeout(() => setCopiedId(null), 2000)
                          }}
                          className="p-2 text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                          title="Copy Share Link"
                        >
                          {copiedId === project.id ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Share2 className="w-4 h-4" />
                          )}
                        </button>
                      </>
                    )}
                    
                    {!isLocked && (
                      <Link
                        href={`/builder?project=${project.id}`}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded transition-colors"
                      >
                        <Terminal className="w-3 h-3" />
                        <span>EDIT</span>
                      </Link>
                    )}

                    {!isLocked && (
                      <button
                        onClick={(e) => handleDelete(e, project.id)}
                        className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
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
