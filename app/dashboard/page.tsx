'use client'

import { useEffect, useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Trash2, 
  Search, 
  ExternalLink, 
  Settings,
  ChevronRight,
  X,
  Github,
  Rocket,
  Folder,
  Clock,
  Zap,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { formatDistanceToNow } from 'date-fns'
import { DbProject } from '@/lib/supabase'
import { LogoMark } from '@/components/Logo'
import { useGitHub } from '@/hooks/useGitHub'

// =============================================================================
// DASHBOARD - Clean, warm, professional
// =============================================================================

export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const gitHub = useGitHub()
  const router = useRouter()
  const [projects, setProjects] = useState<DbProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const accountSubscription = user?.publicMetadata?.accountSubscription as { tier?: string } | undefined
  const tier = accountSubscription?.tier || 'free'

  const tierConfig = useMemo(() => {
    if (tier === 'singularity') return { name: 'Singularity', limit: Infinity, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' }
    if (tier === 'visionary') return { name: 'Visionary', limit: Infinity, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' }
    if (tier === 'architect') return { name: 'Architect', limit: 3, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
    return { name: 'Free', limit: 1, color: 'text-zinc-400', bg: 'bg-zinc-800', border: 'border-zinc-700' }
  }, [tier])

  const isAtLimit = tierConfig.limit !== Infinity && projects.length >= tierConfig.limit

  const routeToBuilder = (projectId?: string | null) => {
    if (projectId) {
      router.push(`/builder?project=${projectId}`)
    } else {
      router.push('/builder')
    }
  }

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
        if (res.status === 401) {
          router.replace('/sign-in?redirect_url=/dashboard')
          return
        }

        if (res.ok) {
          const data = await res.json() as { projects?: DbProject[] }
          if (!cancelled) setProjects(data.projects || [])
        }
      } catch (error: unknown) {
        console.error('[Dashboard] Failed to load projects', error)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    bootstrap()

    return () => { cancelled = true }
  }, [isLoaded, isSignedIn, router])

  const filteredProjects = useMemo(() => {
    if (!searchQuery) return projects
    const query = searchQuery.toLowerCase()
    return projects.filter(project => 
      (project.name || 'Untitled Project').toLowerCase().includes(query)
    )
  }, [projects, searchQuery])

  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      const aTime = a.updated_at ? new Date(a.updated_at).getTime() : 0
      const bTime = b.updated_at ? new Date(b.updated_at).getTime() : 0
      return bTime - aTime
    })
  }, [filteredProjects])

  const deployedCount = projects.filter(p => p.status === 'deployed').length
  const inProgressCount = projects.filter(p => !['deployed', 'complete'].includes(p.status || '')).length
  const githubConnected = gitHub.connected && !gitHub.loading

  const handleConnectGitHub = () => {
    gitHub.connect()
  }

  const handleDisconnectGitHub = async () => {
    await gitHub.disconnect()
    gitHub.refresh()
  }

  const handleCreate = async () => {
    if (isAtLimit) {
      router.push('/dashboard/billing')
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
        if (res.status === 403) {
          router.push('/dashboard/billing')
        } else {
          setCreateError(data.error || 'Failed to create project')
        }
      }
    } catch {
      setCreateError('Failed to create project')
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

  const handleOpenProjectSettings = (event: MouseEvent<HTMLButtonElement>, projectId: string) => {
    event.preventDefault()
    event.stopPropagation()
    router.push(`/builder?project=${projectId}&settings=1`)
  }

  // Loading state
  if (!isLoaded || !isSignedIn || isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <LogoMark size={40} />
          </motion.div>
          <div className="h-0.5 w-24 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-emerald-500"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-500/[0.02] via-transparent to-violet-500/[0.02] pointer-events-none" />
      
      {/* Error Toast */}
      <AnimatePresence>
        {createError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
          >
            <span>{createError}</span>
            <button onClick={() => setCreateError(null)} className="text-red-400/60 hover:text-red-400" aria-label="Dismiss">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <LogoMark size={36} />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0f0f0f]" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Dashboard</h1>
              <div className={`inline-flex items-center gap-1.5 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${tierConfig.bg} ${tierConfig.border} border ${tierConfig.color}`}>
                <Sparkles className="w-2.5 h-2.5" />
                {tierConfig.name}
              </div>
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="group flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl transition-all disabled:opacity-50 bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20"
          >
            {isCreating ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            New Project
            <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
          </button>
        </header>

        {/* Stats Row */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            icon={Folder} 
            label="Projects" 
            value={projects.length} 
            sub={tierConfig.limit === Infinity ? 'Unlimited' : `of ${tierConfig.limit}`}
          />
          <StatCard 
            icon={Rocket} 
            label="Deployed" 
            value={deployedCount} 
            sub="Live sites"
            accent="emerald"
          />
          <StatCard 
            icon={Clock} 
            label="Building" 
            value={inProgressCount} 
            sub="In progress"
            accent="amber"
          />
          <StatCard 
            icon={Zap} 
            label="Stack" 
            value="Next.js" 
            sub="Full exports"
            accent="violet"
          />
        </section>

        {/* Integrations Row */}
        <section className="grid md:grid-cols-2 gap-4">
          {/* GitHub Card */}
          <div className={`group relative overflow-hidden rounded-2xl border transition-all ${
            githubConnected 
              ? 'bg-gradient-to-br from-zinc-900 to-zinc-900/50 border-zinc-800 hover:border-zinc-700' 
              : 'bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700'
          }`}>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    githubConnected 
                      ? 'bg-white text-black' 
                      : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    <Github className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-base font-medium text-white">GitHub</p>
                    <p className="text-sm text-zinc-500">
                      {githubConnected ? `Connected as @${gitHub.username}` : 'Push code to your repos'}
                    </p>
                  </div>
                </div>
                {githubConnected ? (
                  <button
                    onClick={handleDisconnectGitHub}
                    className="px-4 py-2 text-sm text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={handleConnectGitHub}
                    className="px-4 py-2 text-sm text-black font-medium bg-white hover:bg-zinc-200 rounded-lg transition-all"
                    disabled={gitHub.loading}
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
            {githubConnected && (
              <div className="absolute top-3 right-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </div>
            )}
          </div>

          {/* Plan Card */}
          <Link
            href="/dashboard/billing"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all"
          >
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tierConfig.bg} ${tierConfig.border} border`}>
                    <Settings className={`w-6 h-6 ${tierConfig.color}`} />
                  </div>
                  <div>
                    <p className="text-base font-medium text-white">Plan & Billing</p>
                    <p className="text-sm text-zinc-500">
                      {tier === 'free' ? 'Upgrade to unlock more' : 'Manage your subscription'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>
        </section>

        {/* Projects Section */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-medium text-white">Your Projects</h2>
            {projects.length > 2 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 w-48"
                />
              </div>
            )}
          </div>

          {projects.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30"
            >
              <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-5">
                <Folder className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No projects yet</h3>
              <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto">
                Create your first project and start building with AI-powered code generation
              </p>
              <button
                onClick={handleCreate}
                disabled={isCreating}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-black bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
              >
                <Plus className="w-4 h-4" />
                Create your first project
              </button>
            </motion.div>
          ) : sortedProjects.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-zinc-500">No results for &quot;{searchQuery}&quot;</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {sortedProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={`/builder?project=${project.id}`}
                    className="group flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700 transition-all"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        project.status === 'deployed' 
                          ? 'bg-emerald-500/10 border border-emerald-500/20' 
                          : 'bg-zinc-800'
                      }`}>
                        {project.status === 'deployed' ? (
                          <Rocket className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Folder className="w-5 h-5 text-zinc-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-medium text-white truncate group-hover:text-emerald-400 transition-colors">
                          {project.name || 'Untitled'}
                        </p>
                        <p className="text-xs text-zinc-600">
                          {project.updated_at 
                            ? formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })
                            : 'Just created'
                          }
                          {project.status === 'deployed' && (
                            <span className="ml-2 text-emerald-500">• Live</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {project.status === 'deployed' && (project as DbProject & { deployed_url?: string }).deployed_url && (
                        <a
                          href={(project as DbProject & { deployed_url?: string }).deployed_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 text-zinc-600 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={(e) => handleOpenProjectSettings(e, project.id)}
                        className="p-2 text-zinc-600 hover:text-white hover:bg-zinc-800 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, project.id)}
                        className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-zinc-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

// =============================================================================
// STAT CARD COMPONENT
// =============================================================================

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  sub,
  accent 
}: { 
  icon: typeof Folder
  label: string
  value: string | number
  sub: string
  accent?: 'emerald' | 'amber' | 'violet'
}) {
  const accentStyles = {
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', glow: 'shadow-amber-500/10' },
    violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', glow: 'shadow-violet-500/10' },
  }
  
  const style = accent ? accentStyles[accent] : null

  return (
    <div className={`relative overflow-hidden p-4 rounded-xl border transition-all ${
      style 
        ? `${style.bg} ${style.border} shadow-lg ${style.glow}` 
        : 'bg-zinc-900/50 border-zinc-800/50'
    }`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${style ? style.text : 'text-zinc-500'}`} />
        <span className="text-xs uppercase tracking-wider text-zinc-500 font-medium">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${style ? style.text : 'text-white'}`}>{value}</p>
      <p className="text-xs text-zinc-500 mt-1">{sub}</p>
    </div>
  )
}
