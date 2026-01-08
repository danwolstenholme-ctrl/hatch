'use client'

import { useEffect, useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { 
  Plus, 
  Trash2, 
  Search, 
  ExternalLink, 
  ChevronRight,
  X,
  Github,
  Folder,
  Zap,
  Globe,
  Download,
  Code2,
  GitBranch,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Layers,
  Activity,
  Rocket
} from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { formatDistanceToNow } from 'date-fns'
import { DbProject } from '@/lib/supabase'
import { LogoMark } from '@/components/Logo'
import { useGitHub } from '@/hooks/useGitHub'

// =============================================================================
// DASHBOARD - Dense, professional, infrastructure-focused
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
    if (tier === 'singularity') return { name: 'Singularity', limit: Infinity, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' }
    if (tier === 'visionary') return { name: 'Visionary', limit: Infinity, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30' }
    if (tier === 'architect') return { name: 'Architect', limit: 3, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' }
    return { name: 'Free', limit: 1, color: 'text-zinc-400', bg: 'bg-zinc-800/50', border: 'border-zinc-700' }
  }, [tier])

  const isAtLimit = tierConfig.limit !== Infinity && projects.length >= tierConfig.limit
  const canDeploy = tier !== 'free'
  const canExport = tier !== 'free'

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
        router.push(`/builder?project=${data.project.id}`)
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

  // Loading state
  if (!isLoaded || !isSignedIn || isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <LogoMark size={32} />
          <div className="text-xs text-zinc-600 font-mono">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Error Toast */}
      <AnimatePresence>
        {createError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4" />
            <span>{createError}</span>
            <button onClick={() => setCreateError(null)} className="text-red-400/60 hover:text-red-400" aria-label="Dismiss error">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Header Row */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-lg font-semibold text-white">Dashboard</h1>
              <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${tierConfig.bg} ${tierConfig.border} border ${tierConfig.color}`}>
                {tierConfig.name}
              </span>
            </div>
            <p className="text-sm text-zinc-600">
              {projects.length} project{projects.length !== 1 ? 's' : ''} 
              {deployedCount > 0 && ` · ${deployedCount} deployed`}
            </p>
          </div>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors disabled:opacity-50"
          >
            {isCreating ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            New Project
          </button>
        </header>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Column - Projects */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Projects Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-400">Projects</h2>
              {projects.length > 3 && (
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-md text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 w-36"
                  />
                </div>
              )}
            </div>

            {/* Projects List */}
            {projects.length === 0 ? (
              <div className="border border-dashed border-zinc-800 rounded-lg p-8 text-center">
                <Terminal className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                <p className="text-sm text-zinc-500 mb-4">No projects yet</p>
                <button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-black bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Project
                </button>
              </div>
            ) : sortedProjects.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-zinc-600">No results for &quot;{searchQuery}&quot;</p>
              </div>
            ) : (
              <div className="border border-zinc-800/50 rounded-lg divide-y divide-zinc-800/50 bg-zinc-900/30">
                {sortedProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/builder?project=${project.id}`}
                    className="group flex items-center justify-between p-4 hover:bg-zinc-900/50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded flex items-center justify-center ${
                        project.status === 'deployed' 
                          ? 'bg-emerald-500/10' 
                          : 'bg-zinc-800'
                      }`}>
                        {project.status === 'deployed' ? (
                          <Globe className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Folder className="w-4 h-4 text-zinc-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate group-hover:text-emerald-400 transition-colors">
                          {project.name || 'Untitled'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-zinc-600">
                          <span>
                            {project.updated_at 
                              ? formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })
                              : 'Just created'
                            }
                          </span>
                          {project.status === 'deployed' && (
                            <span className="flex items-center gap-1 text-emerald-500">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                              Live
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {project.status === 'deployed' && (project as DbProject & { deployed_url?: string }).deployed_url && (
                        <a
                          href={(project as DbProject & { deployed_url?: string }).deployed_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 text-zinc-600 hover:text-emerald-400 rounded transition-colors"
                          aria-label="Visit deployed site"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={(e) => handleDelete(e, project.id)}
                        className="p-2 text-zinc-700 hover:text-red-400 rounded transition-colors opacity-0 group-hover:opacity-100"
                        aria-label="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <Link
                href="/demo"
                className="flex items-center gap-2 px-3 py-2.5 text-xs text-zinc-400 bg-zinc-900/50 border border-zinc-800/50 rounded-lg hover:border-zinc-700 hover:text-zinc-300 transition-all"
              >
                <Layers className="w-3.5 h-3.5" />
                Try Demo
              </Link>
              <Link
                href="/dashboard/builds"
                className="flex items-center gap-2 px-3 py-2.5 text-xs text-zinc-400 bg-zinc-900/50 border border-zinc-800/50 rounded-lg hover:border-zinc-700 hover:text-zinc-300 transition-all"
              >
                <Activity className="w-3.5 h-3.5" />
                Build History
              </Link>
              <Link
                href="/dashboard/billing"
                className="flex items-center gap-2 px-3 py-2.5 text-xs text-zinc-400 bg-zinc-900/50 border border-zinc-800/50 rounded-lg hover:border-zinc-700 hover:text-zinc-300 transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                Upgrade
              </Link>
            </div>
          </div>

          {/* Right Column - Status & Integrations */}
          <div className="space-y-4">
            
            {/* Status Card */}
            <div className="border border-zinc-800/50 rounded-lg bg-zinc-900/30 p-4">
              <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Projects</span>
                  <span className="text-sm text-white font-mono">
                    {projects.length}{tierConfig.limit !== Infinity ? `/${tierConfig.limit}` : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Deployed</span>
                  <span className="text-sm text-emerald-400 font-mono">{deployedCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Building</span>
                  <span className="text-sm text-amber-400 font-mono">{inProgressCount}</span>
                </div>
                <div className="h-px bg-zinc-800 my-1" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Stack</span>
                  <span className="text-sm text-violet-400 font-mono">Next.js 14</span>
                </div>
              </div>
            </div>

            {/* GitHub Card */}
            <div className="border border-zinc-800/50 rounded-lg bg-zinc-900/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4 text-zinc-500" />
                  <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">GitHub</h3>
                </div>
                {githubConnected && (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    Connected
                  </span>
                )}
              </div>
              {githubConnected ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Account</span>
                    <span className="text-sm text-white font-mono">@{gitHub.username}</span>
                  </div>
                  <p className="text-xs text-zinc-600">Push code directly to your repos</p>
                  <button
                    onClick={() => gitHub.disconnect().then(() => gitHub.refresh())}
                    className="w-full px-3 py-2 text-xs text-zinc-500 hover:text-zinc-300 border border-zinc-800 hover:border-zinc-700 rounded transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-zinc-600">Connect to push code to your own repositories</p>
                  <button
                    onClick={() => gitHub.connect()}
                    disabled={gitHub.loading}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-white bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    Connect GitHub
                  </button>
                </div>
              )}
            </div>

            {/* Capabilities Card */}
            <div className="border border-zinc-800/50 rounded-lg bg-zinc-900/30 p-4">
              <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Your Plan</h3>
              <div className="space-y-2">
                <Capability icon={Code2} label="AI Generation" enabled />
                <Capability icon={Layers} label="Live Preview" enabled />
                <Capability icon={Rocket} label="Deploy to Vercel" enabled={canDeploy} />
                <Capability icon={Download} label="ZIP Export" enabled={canExport} />
                <Capability icon={GitBranch} label="GitHub Push" enabled={canExport} />
                <Capability icon={Globe} label="Custom Domain" enabled={tier === 'visionary' || tier === 'singularity'} />
              </div>
              {tier === 'free' && (
                <Link
                  href="/dashboard/billing"
                  className="flex items-center justify-center gap-2 w-full mt-4 px-3 py-2 text-sm font-medium text-black bg-emerald-500 hover:bg-emerald-400 rounded transition-colors"
                >
                  Upgrade to Deploy
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {/* Pipeline Info */}
            <div className="border border-zinc-800/50 rounded-lg bg-zinc-900/30 p-4">
              <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Pipeline</h3>
              <div className="flex items-center gap-2 text-xs text-zinc-600">
                <span className="px-2 py-1 bg-zinc-800 rounded text-zinc-400">Prompt</span>
                <ChevronRight className="w-3 h-3" />
                <span className="px-2 py-1 bg-zinc-800 rounded text-zinc-400">GitHub</span>
                <ChevronRight className="w-3 h-3" />
                <span className="px-2 py-1 bg-zinc-800 rounded text-zinc-400">Vercel</span>
              </div>
              <p className="text-xs text-zinc-600 mt-3">Full Next.js scaffold with brand tokens, SEO files, and component architecture</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// CAPABILITY ROW
// =============================================================================

function Capability({ 
  icon: Icon, 
  label, 
  enabled 
}: { 
  icon: typeof Code2
  label: string
  enabled: boolean
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2">
        <Icon className={`w-3.5 h-3.5 ${enabled ? 'text-zinc-400' : 'text-zinc-700'}`} />
        <span className={`text-sm ${enabled ? 'text-zinc-300' : 'text-zinc-600'}`}>{label}</span>
      </div>
      {enabled ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
      ) : (
        <X className="w-3.5 h-3.5 text-zinc-700" />
      )}
    </div>
  )
}
