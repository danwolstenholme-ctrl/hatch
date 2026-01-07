'use client'

import { useEffect, useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ArrowRight, Trash2, Search, Globe, LayoutGrid, List, ExternalLink, Sparkles, Settings, MessageSquare, Eye, Zap, Shield, Rocket, Activity, Server, Gauge } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { formatDistanceToNow } from 'date-fns'
import Pip from '@/components/Pip'
import Button from '@/components/singularity/Button'
import SystemStatus from '@/components/SystemStatus'
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
  const canDeploy = tier === 'architect' || tier === 'visionary' || tier === 'singularity'

  const tierConfig = useMemo<TierConfig>(() => {
    if (tier === 'singularity') return { name: 'Singularity', limit: Infinity, color: 'text-amber-400' }
    if (tier === 'visionary') return { name: 'Visionary', limit: Infinity, color: 'text-emerald-400' }
    if (tier === 'architect') return { name: 'Architect', limit: 3, color: 'text-emerald-400' }
    return { name: 'Free', limit: 3, color: 'text-zinc-400' }
  }, [tier])

  const isAtLimit = tierConfig.limit !== Infinity && projects.length >= tierConfig.limit
  const firstName = user?.firstName || 'there'

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

  const deployedProjects = projects.filter(project => project.status === 'deployed')
  const completedProjects = projects.filter(project => project.status === 'complete')
  const buildingProjects = projects.filter(project => !['deployed', 'complete'].includes(project.status || ''))
  const hasProjects = projects.length > 0

  const lastActivityLabel = lastUpdatedProject?.updated_at
    ? formatDistanceToNow(new Date(lastUpdatedProject.updated_at), { addSuffix: true })
    : 'Awaiting first build'

  const lastProjectName = lastUpdatedProject?.name || 'Untitled project'
  const heroSubtitle = hasProjects
    ? `Last edited ${lastActivityLabel} — ${lastProjectName}`
    : 'No drafts yet. Pip is idle and waiting for your next idea.'
  const projectSlotCopy = tierConfig.limit === Infinity
    ? 'Unlimited project slots'
    : `${projects.length}/${tierConfig.limit} slots used`
  const heroPrimaryLabel = hasProjects ? 'Resume build' : (isCreating ? 'Creating...' : 'Start building')

  const primaryEmail = user?.primaryEmailAddress?.emailAddress
    || user?.emailAddresses?.[0]?.emailAddress
    || 'Not set'

  const lastLogin = user?.lastSignInAt
    ? formatDistanceToNow(new Date(user.lastSignInAt), { addSuffix: true })
    : 'No sign-in yet'

  const memberSince = user?.createdAt
    ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })
    : 'Just arrived'

  const freeBuildsUsed = Number(user?.publicMetadata?.freeCreditsUsed || 0)
  const refineCreditsUsed = Number(user?.publicMetadata?.architectRefinementsUsed || 0)

  const overviewStats = [
    {
      label: 'Live deployments',
      value: deployedProjects.length,
      description: deployedProjects.length ? 'Running on hatchitsites.dev' : 'Ship straight from the builder',
      icon: Rocket,
    },
    {
      label: 'Ready for launch',
      value: completedProjects.length,
      description: completedProjects.length ? 'Awaiting your deploy' : 'Build a section to get started',
      icon: Sparkles,
    },
    {
      label: 'Active builds',
      value: buildingProjects.length,
      description: buildingProjects.length ? 'Claude is still iterating' : 'All builds are stable',
      icon: Activity,
    },
  ]

  const usageMetrics = [
    {
      label: 'Build sessions',
      value: freeBuildsUsed,
      limitLabel: 'Unlimited',
      hint: 'No generation caps. Ever.',
      icon: Sparkles,
    },
    {
      label: 'AI refinements',
      value: refineCreditsUsed,
      limitLabel: tier === 'free' ? '1 trial' : 'Unlimited',
      hint: tier === 'free' ? 'Upgrade for unlimited refinements' : 'Architect tiers get endless tweaks',
      icon: Zap,
      limit: tier === 'free' ? 1 : undefined,
    },
    {
      label: 'Project slots',
      value: projects.length,
      limitLabel: tierConfig.limit === Infinity ? 'Unlimited' : `${tierConfig.limit} max`,
      hint: tierConfig.limit === Infinity ? 'Visionary & Singularity unlock infinite slots' : 'Upgrade for unlimited projects',
      icon: Gauge,
      limit: tierConfig.limit === Infinity ? undefined : tierConfig.limit,
    },
  ]

  const intelligenceTools = [
    {
      name: 'Oracle',
      description: 'Gemini-powered prompt architect that shapes every brief before Claude writes a line of code.',
      status: 'Online',
      badge: 'Claude Sonnet 4.5',
      icon: MessageSquare,
      action: () => routeToBuilder(),
    },
    {
      name: 'Witness',
      description: 'Haiku watches every deploy for regressions and instantly reports anomalies.',
      status: 'Watching',
      badge: 'Haiku 4.5',
      icon: Eye,
      action: () => router.push('/builder?panel=witness'),
    },
    {
      name: 'Healer',
      description: 'Background self-healing layer that repairs broken preview states before you even notice.',
      status: 'Idle',
      badge: 'Auto-fix',
      icon: Shield,
      action: () => router.push('/builder?panel=healer'),
    },
    {
      name: 'Deploy',
      description: 'One-click Vercel deploy with Supabase wiring. Custom domains on Architect+ tiers.',
      status: canDeploy ? 'Ready' : 'Locked',
      badge: 'HatchEdge CDN',
      icon: Rocket,
      action: () => canDeploy ? router.push('/builder?panel=deploy') : router.push('/dashboard/billing'),
    },
    {
      name: 'Replicator',
      description: 'Visionary-exclusive site cloning. Feed any URL and Pip rebuilds it in your stack.',
      status: tier === 'singularity' ? 'Unlocked' : 'Tier-locked',
      badge: 'Singularity',
      icon: Globe,
      action: () => router.push('/builder?panel=replicator'),
    },
    {
      name: 'Dream Engine',
      description: 'Experimental generator that evolves components overnight based on traffic.',
      status: tier === 'singularity' ? 'Alpha' : 'Invite-only',
      badge: 'R&D',
      icon: Sparkles,
      action: () => router.push('/builder?panel=dream'),
    },
  ]

  const siteHealth = [
    {
      label: 'Live deployments',
      value: deployedProjects.length,
      status: deployedProjects.length ? 'Healthy' : 'Awaiting launch',
      icon: Server,
    },
    {
      label: 'Ready builds',
      value: completedProjects.length,
      status: completedProjects.length ? 'Launch-ready' : 'Needs prompting',
      icon: Shield,
    },
    {
      label: 'In progress',
      value: buildingProjects.length,
      status: buildingProjects.length ? 'Claude is writing' : 'Idle',
      icon: Activity,
    },
  ]

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

        {/* Portal Hero */}
        <motion.section
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-3xl border border-zinc-900/60 bg-gradient-to-br from-zinc-950 via-zinc-950/70 to-zinc-900/30 p-6 sm:p-8"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_55%)] opacity-80" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(79,70,229,0.1),transparent_60%)]" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-emerald-200/90">
                {tierConfig.name} plan
                <span className="h-1 w-1 rounded-full bg-emerald-400" />
                {projectSlotCopy}
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-white">
                  Hey {firstName}, your build stack is online.
                </h1>
                <p className="mt-2 text-sm text-zinc-400 sm:text-base">
                  {heroSubtitle}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => (hasProjects ? routeToBuilder(lastUpdatedProject?.id) : handleCreate())}
                  disabled={!hasProjects && isCreating}
                  loading={!hasProjects && isCreating}
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  {heroPrimaryLabel}
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => router.push('/dashboard/billing')}
                  icon={<Settings className="w-4 h-4" />}
                  iconPosition="left"
                >
                  Billing & usage
                </Button>
                {hasProjects && (
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => router.push('/dashboard/projects')}
                  >
                    Project archive
                  </Button>
                )}
              </div>
            </div>
            <div className="w-full max-w-sm space-y-4 rounded-2xl border border-zinc-800/70 bg-black/30 p-5 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Status</p>
                  <p className="text-sm font-medium text-white">System health</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full border border-zinc-800 text-zinc-300">
                  {tierConfig.name}
                </span>
              </div>
              <SystemStatus />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/30 p-3">
                  <p className="text-xs text-zinc-500">Last login</p>
                  <p className="mt-1 text-sm text-white">{lastLogin}</p>
                </div>
                <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/30 p-3">
                  <p className="text-xs text-zinc-500">Member since</p>
                  <p className="mt-1 text-sm text-white">{memberSince}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Overview Stats */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {overviewStats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-zinc-900/60 bg-zinc-950/40 p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{stat.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
                  </div>
                  <Icon className="h-5 w-5 text-emerald-400" />
                </div>
                <p className="mt-3 text-sm text-zinc-500">{stat.description}</p>
              </div>
            )
          })}
        </motion.section>

        {/* Account + Usage + Health */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-3 lg:grid-cols-3"
        >
          <div className="rounded-2xl border border-zinc-900/60 bg-zinc-950/40 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Account</p>
                <h3 className="text-lg font-semibold text-white">{firstName}'s workspace</h3>
              </div>
              <span className="text-xs px-2 py-1 rounded-full border border-zinc-800 text-zinc-300">
                {tierConfig.name}
              </span>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-zinc-500">Email</dt>
                <dd className="text-white truncate">{primaryEmail}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-zinc-500">Last login</dt>
                <dd className="text-white">{lastLogin}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-zinc-500">Member since</dt>
                <dd className="text-white">{memberSince}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-zinc-500">Project slots</dt>
                <dd className="text-white">{projectSlotCopy}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-zinc-900/60 bg-zinc-950/40 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Usage</p>
                <h3 className="text-lg font-semibold text-white">Live limits</h3>
              </div>
              <button
                type="button"
                onClick={() => router.push('/dashboard/billing')}
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Manage
              </button>
            </div>
            {usageMetrics.map((metric) => {
              const Icon = metric.icon
              const progress = metric.limit
                ? Math.min(100, Math.round((metric.value / metric.limit) * 100))
                : 100
              return (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-zinc-900/80 bg-black/20 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-zinc-500">{metric.label}</p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {metric.limit ? `${metric.value}/${metric.limit}` : metric.value}
                      </p>
                      <p className="text-xs text-zinc-500">{metric.limitLabel}</p>
                    </div>
                    <Icon className="h-5 w-5 text-emerald-400" />
                  </div>
                  {metric.limit ? (
                    <div className="mt-3 h-1.5 rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-zinc-500">{metric.hint}</p>
                  )}
                  {metric.limit && (
                    <p className="mt-2 text-xs text-zinc-500">{metric.hint}</p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="rounded-2xl border border-zinc-900/60 bg-zinc-950/40 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Health</p>
                <h3 className="text-lg font-semibold text-white">Launch readiness</h3>
              </div>
              <Shield className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-4 space-y-3">
              {siteHealth.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border border-zinc-900/70 bg-black/30 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-emerald-400" />
                      <div>
                        <p className="text-sm font-medium text-white">{item.label}</p>
                        <p className="text-xs text-zinc-500">{item.status}</p>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-white">{item.value}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.section>

        {/* Projects Section */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="rounded-3xl border border-zinc-900/60 bg-zinc-950/30 p-5 space-y-5"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Projects</p>
              <h2 className="text-xl font-semibold text-white">Active builds</h2>
              <p className="text-sm text-zinc-500">{hasProjects ? 'Pick up where you left off or branch a new concept.' : 'No drafts yet. Create your first build to unlock deploys.'}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleCreate}
                disabled={isCreating || isAtLimit}
                loading={isCreating}
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                iconPosition="left"
              >
                {isAtLimit ? 'Upgrade for slots' : isCreating ? 'Creating...' : 'New project'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/projects')}
              >
                View archive
              </Button>
            </div>
          </div>

          {hasProjects ? (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] group">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="w-full rounded-lg border border-zinc-800/80 bg-black/30 pl-8 pr-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/40 focus:bg-zinc-950 focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex items-center gap-0.5 rounded-lg border border-zinc-800/80 bg-black/30 p-0.5">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`rounded-md p-1.5 transition-all ${viewMode === 'grid' ? 'bg-zinc-900 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`rounded-md p-1.5 transition-all ${viewMode === 'list' ? 'bg-zinc-900 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {filteredProjects.length === 0 && searchQuery && (
                <div className="rounded-2xl border border-zinc-900/60 bg-black/30 px-4 py-8 text-center">
                  <p className="text-zinc-500 text-sm">No projects match "{searchQuery}"</p>
                </div>
              )}

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
                        className="group relative block h-full overflow-hidden rounded-2xl border border-zinc-900/60 bg-zinc-950/30 p-4 transition-all duration-150 hover:border-emerald-500/40 hover:bg-zinc-950"
                      >
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
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-900/60">
                            <span className={`text-xs px-2 py-1 rounded-full border ${
                              project.status === 'deployed'
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                : project.status === 'complete'
                                ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                                : 'border-zinc-700 bg-zinc-900/50 text-zinc-400'
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
                        className="group flex items-center justify-between rounded-2xl border border-zinc-900/60 bg-zinc-950/30 p-3 hover:border-emerald-500/40 hover:bg-zinc-950 transition-all"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-md border border-zinc-800 bg-black/30 flex items-center justify-center flex-shrink-0">
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
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-black/20 p-8 text-center">
              <Pip size={48} animate float glow />
              <p className="mt-4 text-sm text-zinc-400">No projects yet. Kick off your first build to see Oracle, Claude, and Witness light up.</p>
              <div className="mt-5">
                <Button
                  onClick={handleCreate}
                  disabled={isCreating}
                  loading={isCreating}
                  variant="primary"
                  size="md"
                  icon={<Plus className="w-4 h-4" />}
                  iconPosition="left"
                >
                  {isCreating ? 'Creating...' : 'Create your first project'}
                </Button>
              </div>
            </div>
          )}
        </motion.section>

        {/* Intelligence Stack */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="space-y-4"
        >
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Intelligence</p>
              <h2 className="text-xl font-semibold text-white">Oracle, Witness & friends</h2>
              <p className="text-sm text-zinc-500">Every AI surface inside HatchIt, mapped to your current tier.</p>
            </div>
            <span className="text-xs text-zinc-500">More automations unlock as you upgrade.</span>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {intelligenceTools.map((tool, index) => {
              const Icon = tool.icon
              const lockedStatuses = ['Locked', 'Tier-locked', 'Invite-only']
              const isLocked = lockedStatuses.includes(tool.status)
              return (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="rounded-2xl border border-zinc-900/60 bg-zinc-950/30 p-5 flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-emerald-400" />
                        <p className="text-base font-semibold text-white">{tool.name}</p>
                        <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">{tool.badge}</span>
                      </div>
                      <p className="text-sm text-zinc-400">{tool.description}</p>
                    </div>
                    <span className={`text-xs font-medium ${isLocked ? 'text-zinc-500' : 'text-emerald-400'}`}>
                      {tool.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant={isLocked ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={tool.action}
                      icon={<ArrowRight className="w-3.5 h-3.5" />}
                      iconPosition="right"
                    >
                      {isLocked ? 'View upgrade options' : 'Launch tool'}
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.section>
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
                    href="/dashboard/billing"
                    className="flex-1 px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors text-center"
                  >
                    Manage Billing
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
