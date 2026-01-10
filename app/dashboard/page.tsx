'use client'

import { useEffect, useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { formatDistanceToNow } from 'date-fns'
import { Trash2, Rocket, Download, Github, Zap } from 'lucide-react'
import { DbProject } from '@/lib/supabase'
import { useGitHub } from '@/hooks/useGitHub'
import ProjectWizard from '@/components/ProjectWizard'

// =============================================================================
// DASHBOARD - Clean, text-based, Vercel-inspired
// No icons. Just information.
// =============================================================================

type ProjectWithProgress = DbProject & {
  total_sections?: number
  completed_sections?: number
  deployed_url?: string
}

const TIER_CONFIG = {
  free: {
    name: 'Free',
    limit: 1,
    variant: 'default' as const,
    features: ['1 project', 'Unlimited AI generations', 'Live preview']
  },
  architect: {
    name: 'Architect',
    limit: 3,
    variant: 'architect' as const,
    features: ['3 projects', 'Deploy & export', 'GitHub push']
  },
  visionary: {
    name: 'Visionary',
    limit: Infinity,
    variant: 'visionary' as const,
    features: ['Unlimited projects', 'Custom domains', 'The Auditor & Healer']
  },
  singularity: {
    name: 'Singularity',
    limit: Infinity,
    variant: 'singularity' as const,
    features: ['Everything', 'The Replicator', 'API access']
  }
}

export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const gitHub = useGitHub()
  const router = useRouter()
  const [projects, setProjects] = useState<ProjectWithProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [showWizard, setShowWizard] = useState(false)

  const accountSubscription = user?.publicMetadata?.accountSubscription as { tier?: string } | undefined
  const tier = (accountSubscription?.tier || 'free') as keyof typeof TIER_CONFIG
  const tierConfig = TIER_CONFIG[tier] || TIER_CONFIG.free

  const isAtLimit = tierConfig.limit !== Infinity && projects.length >= tierConfig.limit
  const canDeploy = tier !== 'free'

  const firstName = user?.firstName || user?.username || 'there'

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
          const data = await res.json() as { projects?: ProjectWithProgress[] }
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

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      const aTime = a.updated_at ? new Date(a.updated_at).getTime() : 0
      const bTime = b.updated_at ? new Date(b.updated_at).getTime() : 0
      return bTime - aTime
    })
  }, [projects])

  const stats = useMemo(() => {
    const totalProjects = projects.length
    const deployed = projects.filter(p => p.status === 'deployed').length
    const building = projects.filter(p => p.status === 'building' || (p.completed_sections || 0) < (p.total_sections || 0)).length
    const totalSections = projects.reduce((acc, p) => acc + (p.total_sections || 0), 0)
    const completedSections = projects.reduce((acc, p) => acc + (p.completed_sections || 0), 0)
    return { totalProjects, deployed, building, totalSections, completedSections }
  }, [projects])

  const handleOpenWizard = () => {
    if (isAtLimit) {
      router.push('/dashboard/billing')
      return
    }
    router.push('/dashboard/projects/new')
  }

  const handleWizardCreate = async (config: {
    name: string
    description: string
    siteType: string
    primaryColor: string
    secondaryColor: string
    bodyFont: string
    headingFont: string
    mode: 'dark' | 'light'
    pages: { name: string; path: string; sections: string[] }[]
    seoTitle: string
    seoDescription: string
    seoKeywords: string
    pushToGithub: boolean
  }) => {
    setIsCreating(true)
    setCreateError(null)
    try {
      const res = await fetch('/api/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: config.name,
          templateId: 'website',
          description: config.description,
          siteType: config.siteType,
          primaryColor: config.primaryColor,
          secondaryColor: config.secondaryColor,
          bodyFont: config.bodyFont,
          headingFont: config.headingFont,
          mode: config.mode,
          pages: config.pages,
          seoTitle: config.seoTitle,
          seoDescription: config.seoDescription,
          seoKeywords: config.seoKeywords,
        }),
      })
      const data = await res.json()
      if (res.ok && data.project) {
        setProjects(prev => [data.project, ...prev])
        setShowWizard(false)
        router.push(`/builder?project=${data.project.id}`)
      } else {
        if (res.status === 403) {
          router.push('/dashboard/billing')
        } else {
          throw new Error(data.error || 'Failed to create project')
        }
      }
    } catch (err) {
      throw err
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (event: MouseEvent<HTMLButtonElement>, id: string) => {
    event.preventDefault()
    event.stopPropagation()
    if (!confirm('Delete this project? This cannot be undone.')) return
    const res = await fetch(`/api/project/${id}`, { method: 'DELETE' })
    if (res.ok) setProjects(prev => prev.filter(project => project.id !== id))
  }

  // Loading state
  if (!isLoaded || !isSignedIn || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    )
  }

  return (
    <>
      {/* Error Toast */}
      <AnimatePresence>
        {createError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-2.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
          >
            <span>{createError}</span>
            <button onClick={() => setCreateError(null)} className="text-red-400 hover:text-red-300">
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-lg font-semibold text-white mb-1">
              Welcome back, {firstName}
            </h1>
            <p className="text-sm text-zinc-500">
              {projects.length === 0
                ? 'Create your first project to get started'
                : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={handleOpenWizard}
            disabled={isCreating || isAtLimit}
            className="w-full sm:w-auto px-5 py-3 sm:py-2 text-sm font-medium rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            {isAtLimit ? 'Upgrade for more' : '+ New Project'}
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-px sm:bg-zinc-800/50 rounded-xl sm:rounded-md overflow-hidden mb-8 sm:mb-10">
        <StatCell label="Projects" value={stats.totalProjects} suffix={tierConfig.limit !== Infinity ? `/${tierConfig.limit}` : ''} />
        <StatCell label="Deployed" value={stats.deployed} highlight={stats.deployed > 0} />
        <StatCell label="In Progress" value={stats.building} />
        <StatCell label="Sections Built" value={stats.completedSections} />
      </div>

      {/* Main Content - Reordered for mobile: Quick Actions first on mobile, sidebar on desktop */}
      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Quick Actions - Shows first on mobile, hidden on desktop (shown in sidebar instead) */}
        {projects.length > 0 && (
          <div className="lg:hidden">
            <div className="flex gap-3">
              <button
                onClick={handleOpenWizard}
                disabled={isAtLimit}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                New Project
              </button>
              {projects.length > 0 && projects[0] && (
                <Link
                  href={`/builder?project=${projects[0].id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-white transition-all active:scale-[0.98] border border-zinc-700/50"
                >
                  <Rocket className="w-4 h-4" />
                  Continue
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Projects List */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-zinc-400">Your Projects</h2>
            {projects.length > 5 && (
              <Link href="/dashboard/builds" className="text-xs text-zinc-500 hover:text-white transition-colors">
                View all →
              </Link>
            )}
          </div>

          {projects.length === 0 ? (
            <div className="rounded-xl border border-zinc-800/60 bg-gradient-to-b from-zinc-900/50 to-zinc-950 px-6 py-10 sm:py-12 text-center">
              {/* Animated egg icon */}
              <div className="mb-6 flex justify-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"
                >
                  <span className="text-3xl">🥚</span>
                </motion.div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Ready to hatch something?</h3>
              <p className="text-sm text-zinc-400 max-w-sm mx-auto mb-8">
                Describe your website idea and watch it come to life. Build, preview, and ship — all in minutes.
              </p>
              <button
                onClick={handleOpenWizard}
                className="w-full sm:w-auto px-8 py-4 sm:py-3 text-base sm:text-sm font-semibold text-black bg-emerald-500 hover:bg-emerald-400 rounded-xl sm:rounded-lg transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20"
              >
                🚀 Create Your First Project
              </button>
              <p className="mt-4 text-xs text-zinc-600">
                Or <Link href="/demo" className="text-emerald-500 hover:text-emerald-400">try the demo</Link> first
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-zinc-800/60 overflow-hidden">
              {sortedProjects.slice(0, 5).map((project, index) => {
                const completed = project.completed_sections ?? 0
                const total = project.total_sections ?? 0
                const progress = total > 0 ? Math.round((completed / total) * 100) : 0
                const isDeployed = project.status === 'deployed'

                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Link
                      href={`/builder?project=${project.id}`}
                      className="group flex items-center justify-between px-5 py-4 bg-zinc-950 hover:bg-zinc-900 transition-colors border-b border-zinc-800 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="text-sm font-medium text-zinc-100 truncate">
                            {project.name || 'Untitled Project'}
                          </p>
                          {isDeployed && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-sm font-medium">
                              Live
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-zinc-500">
                          <span>{completed}/{total} sections</span>
                          <span>
                            {project.updated_at
                              ? formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })
                              : 'Just created'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {isDeployed && project.deployed_url && (
                          <a
                            href={project.deployed_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs text-zinc-500 hover:text-white transition-colors"
                          >
                            Visit ↗
                          </a>
                        )}
                        {tier === 'singularity' && (
                          <button
                            onClick={(e) => handleDelete(e, project.id)}
                            className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <span className="text-zinc-700 group-hover:text-zinc-500 transition-colors">→</span>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-md border border-zinc-800/60 bg-zinc-900/30 p-4">
            <h3 className="text-sm font-medium text-white mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={handleOpenWizard}
                disabled={isAtLimit}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left rounded bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-500" />
                New Project
              </button>
              {projects.length > 0 && projects[0] && (
                <Link
                  href={`/builder?project=${projects[0].id}`}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left rounded bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
                >
                  <Rocket className="w-3.5 h-3.5 text-zinc-500" />
                  Continue Building
                </Link>
              )}
            </div>
          </div>

          {/* GitHub */}
          <div className="rounded-md border border-zinc-800/60 bg-zinc-900/30 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white">GitHub</h3>
              {gitHub.connected && (
                <span className="text-xs text-emerald-400">Connected</span>
              )}
            </div>
            <p className="text-xs text-zinc-500 mb-3">
              {gitHub.connected
                ? `@${gitHub.username}`
                : 'Push to your repositories'}
            </p>
            {gitHub.connected ? (
              <button
                onClick={async () => { await gitHub.disconnect(); await gitHub.refresh() }}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => gitHub.connect()}
                disabled={gitHub.loading || tier === 'free'}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50"
              >
                {tier === 'free' ? 'Upgrade to connect' : 'Connect'}
              </button>
            )}
          </div>

          {/* Plan */}
          <div className="rounded-md border border-zinc-800/60 bg-zinc-900/30 p-4">
            <h3 className="text-sm font-medium text-white mb-1">{tierConfig.name}</h3>
            <p className="text-xs text-zinc-500 mb-4">
              {tier === 'free' ? 'Upgrade to deploy' : 'Full access'}
            </p>
            <ul className="space-y-1.5 mb-4">
              {tierConfig.features.map((feature, i) => (
                <li key={i} className="text-xs text-zinc-400">
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard/billing"
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {tier === 'free' ? 'Upgrade' : 'Manage'} →
            </Link>
          </div>
        </div>
      </div>

      {/* Project Wizard */}
      <ProjectWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onCreate={handleWizardCreate}
        githubConnected={gitHub.connected}
      />
    </>
  )
}

function StatCell({ label, value, suffix = '', highlight = false }: { label: string; value: number; suffix?: string; highlight?: boolean }) {
  return (
    <div className={`px-4 py-4 rounded-xl sm:rounded-none border border-zinc-800/60 sm:border-0 ${highlight ? 'bg-emerald-500/5' : 'bg-zinc-900/50'}`}>
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className="text-2xl sm:text-lg font-semibold text-white tabular-nums">
        {value}
        {suffix && <span className="text-zinc-600 text-base sm:text-sm">{suffix}</span>}
      </p>
    </div>
  )
}
