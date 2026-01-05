'use client'

import { useEffect, useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ArrowRight, Trash2, Search, Globe, LayoutGrid, List, ExternalLink, Clock, ChevronRight, Zap, Code2, Database, ShieldCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { formatDistanceToNow } from 'date-fns'

import { DbProject } from '@/lib/supabase'

type TierConfig = {
  name: string
  limit: number
  color: string
}

type RoadmapFeature = {
  title: string
  description: string
  status: string
  icon: LucideIcon
}

const ROADMAP_FEATURES: RoadmapFeature[] = [
  {
    title: 'URL Replicator',
    description: 'Paste any URL and rebuild the layout automatically.',
    status: 'Built — Launching Soon',
    icon: Zap,
  },
  {
    title: 'Code Export',
    description: 'Download clean React + Tailwind files with one click.',
    status: 'Visionary+ Tier',
    icon: Code2,
  },
  {
    title: 'Custom Domains',
    description: 'Map hatchitsites.dev deployments to your own domains.',
    status: 'Q1 2026',
    icon: Globe,
  },
]

export default function PortalPage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const [projects, setProjects] = useState<DbProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMigrating, setIsMigrating] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
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

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      router.replace('/sign-in?redirect_url=/dashboard')
      return
    }

    let cancelled = false

    const bootstrap = async () => {
      try {
        const guestHandoff = typeof window !== 'undefined' ? localStorage.getItem('hatch_guest_handoff') : null

        if (guestHandoff) {
          setIsMigrating(true)
          try {
            const payload = JSON.parse(guestHandoff)
            console.log('[Portal] Importing guest handoff', {
              projectName: payload?.projectName,
              templateId: payload?.templateId,
              sections: payload?.sections?.length,
            })
            const res = await fetch('/api/project/import', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: guestHandoff,
            })

            if (res.ok) {
              localStorage.removeItem('hatch_guest_handoff')
              localStorage.removeItem('hatch_last_prompt')
            } else if (res.status === 401) {
              router.replace('/sign-in?redirect_url=/dashboard')
              return
            } else {
              console.error('[Portal] Import failed', await res.text())
            }
          } catch (error) {
            console.error('[Portal] Import error', error)
          } finally {
            setIsMigrating(false)
          }
        }

        const res = await fetch('/api/project/list')
        if (res.status === 401) {
          router.replace('/sign-in?redirect_url=/dashboard')
          return
        }

        if (res.ok) {
          const data = await res.json()
          if (!cancelled) setProjects(data.projects || [])
        }
      } catch (error) {
        console.error('[Portal] Failed to load projects', error)
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
    try {
      const res = await fetch('/api/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Untitled Project', templateId: 'landing-page' }),
      })

      if (res.ok) {
        const data = await res.json()
        setProjects(prev => [data.project, ...prev])
        routeToBuilder(data.project.id)
      }
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

  if (!isLoaded || !isSignedIn || isLoading || isMigrating) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-800 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    )
  }

  const portalStacks = [
    {
      title: 'Builder',
      description: 'Generate React components with Singularity-grade AI.',
      icon: Code2,
      cta: lastUpdatedProject ? 'Resume builder' : 'Launch builder',
      action: () => routeToBuilder(lastUpdatedProject?.id),
      accent: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    },
    {
      title: 'Data Layer',
      description: 'View Supabase tables, logs, and connection details.',
      icon: Database,
      cta: 'Coming soon',
      disabled: true,
      accent: 'from-zinc-600/30 via-zinc-900 to-transparent',
    },
    {
      title: 'Access & Billing',
      description: 'Manage your seat, upgrade tier, and invoices.',
      icon: ShieldCheck,
      cta: 'Open billing',
      action: () => router.push('/dashboard/billing'),
      accent: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
    },
  ]

  return (
    <>
      <div className="w-full px-6 py-8 space-y-10">
        <motion.section
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid gap-6 lg:grid-cols-[2fr,1fr]"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-900/80 to-zinc-900/40 px-6 py-6 sm:px-8 sm:py-8 shadow-[0_0_40px_-15px_rgba(16,185,129,0.5)]">
            <div className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: 'radial-gradient(circle at top right, rgba(16,185,129,0.15), transparent 45%)' }} />
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-zinc-600">Portal</p>
                <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mt-2">Singularity Portal</h1>
                <p className="text-zinc-400 text-sm sm:text-base mt-2 max-w-2xl">
                  Everything inside your HatchIt database — projects, builder, billing, and the roadmap — in one control surface.
                </p>
              </div>
              <span className="px-3 py-1 text-[10px] font-semibold tracking-widest uppercase rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                Live Sync
              </span>
            </div>

            <div className="relative z-10 mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Projects</p>
                <p className="text-2xl font-semibold text-white mt-1">{projects.length || 0}</p>
                <p className="text-[11px] text-zinc-500 mt-2">
                  {tierConfig.limit === Infinity ? 'Unlimited capacity' : `${projects.length} / ${tierConfig.limit} used`}
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Tier</p>
                <p className={`text-2xl font-semibold mt-1 ${tierConfig.color}`}>{tierConfig.name}</p>
                <p className="text-[11px] text-zinc-500 mt-2">Powered by Clerk + Supabase</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Last activity</p>
                <p className="text-2xl font-semibold text-white mt-1">
                  {lastUpdatedProject?.updated_at
                    ? formatDistanceToNow(new Date(lastUpdatedProject.updated_at), { addSuffix: true })
                    : 'No builds yet'}
                </p>
                <p className="text-[11px] text-zinc-500 mt-2">Observing builder state in real time</p>
              </div>
            </div>

            <div className="relative z-10 mt-8 flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreate}
                disabled={isCreating}
                className="group flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 text-sm font-medium text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.25)] transition-all"
              >
                {isCreating ? (
                  <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Start fresh build
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => routeToBuilder(lastUpdatedProject?.id)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white/90 backdrop-blur transition-all hover:bg-white/10"
              >
                <ArrowRight className="w-4 h-4" />
                {lastUpdatedProject ? 'Resume last build' : 'Open builder'}
              </motion.button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-600">Account</p>
              <h2 className="text-xl font-semibold text-white mt-2">{tierConfig.name} Tier</h2>
              <p className="text-sm text-zinc-400 mt-2">
                {isFreeTier ? 'Unlock code export, deployments, and unlimited projects.' : 'Full access unlocked. Head to billing to adjust seats or cancel.'}
              </p>
            </div>
            <div className="mt-6 space-y-3 text-sm text-zinc-400">
              <div className="flex items-center justify-between">
                <span>Projects in DB</span>
                <span className="font-semibold text-white">{projects.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Plan Limit</span>
                <span className="font-semibold text-white">{tierConfig.limit === Infinity ? '∞' : tierConfig.limit}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Sync Status</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1 text-xs uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Healthy
                </span>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Link
                href="/dashboard/billing"
                className="flex-1 text-center rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors"
              >
                {isFreeTier ? 'Upgrade Plan' : 'Manage Billing'}
              </Link>
              <Link
                href="/roadmap"
                className="flex-1 text-center rounded-xl border border-white/5 bg-white/5 py-2.5 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                Product Roadmap
              </Link>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-3"
        >
          {portalStacks.map((card, index) => (
            <motion.div
              key={card.title}
              whileHover={{ y: -4 }}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
              transition={{ delay: index * 0.05 }}
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.accent} opacity-60`} />
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/30">
                    <card.icon className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{card.title}</p>
                    <p className="text-xs text-zinc-500">Portal stack</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">{card.description}</p>
                <button
                  disabled={card.disabled}
                  onClick={card.action}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${card.disabled ? 'cursor-not-allowed border-white/5 text-zinc-500' : 'border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10'}`}
                >
                  {card.cta}
                  {!card.disabled && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-600">Projects</p>
              <h2 className="text-xl font-semibold text-white mt-1">Active Deliverables</h2>
            </div>
            {projects.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreate}
                disabled={isCreating}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 transition-all"
              >
                <Plus className="w-4 h-4" />
                New project
              </motion.button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[240px] group">
              <div className="absolute inset-0 rounded-xl bg-emerald-500/5 blur-2xl opacity-0 group-focus-within:opacity-100 transition" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="relative w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 backdrop-blur-sm focus:border-emerald-500/40 focus:bg-white/10 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-lg p-2 text-xs font-semibold transition-all ${viewMode === 'grid' ? 'bg-white/10 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-lg p-2 text-xs font-semibold transition-all ${viewMode === 'list' ? 'bg-white/10 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isLoading && projects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/60 py-16 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 mb-4">
                <Zap className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Your database is waiting</h3>
              <p className="mt-2 text-sm text-zinc-500 max-w-md">
                Generate your first artifact. Everything you build here syncs to Supabase and can be deployed instantly.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreate}
                className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-300"
              >
                <Plus className="w-4 h-4" />
                Create first project
              </motion.button>
            </motion.div>
          ) : filteredProjects.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-12 text-center">
              <p className="text-sm text-zinc-500">No matches. Try another query.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Link
                    href={`/builder?project=${project.id}`}
                    className="group relative block h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/40 hover:bg-white/10"
                  >
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ backgroundImage: 'linear-gradient(135deg, rgba(16,185,129,0.08), transparent)' }} />
                    <div className="relative z-10 flex items-start justify-between">
                      <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                        <div className="h-2 w-8 rounded-full bg-emerald-400" />
                      </div>
                      {project.slug ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold text-zinc-300">
                          {project.slug}
                          <ExternalLink className="h-3 w-3" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold text-zinc-500">
                          Draft
                        </span>
                      )}
                    </div>
                    <div className="relative z-10 mt-6 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{project.name || 'Untitled Project'}</p>
                          <p className="text-xs text-zinc-500">
                            Updated {project.updated_at ? formatDistanceToNow(new Date(project.updated_at), { addSuffix: true }) : 'moments ago'}
                          </p>
                        </div>
                        <button
                          onClick={(event) => handleDelete(event, project.id)}
                          className="rounded-full border border-white/10 p-2 text-zinc-500 hover:text-red-400 hover:border-red-400/40 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {project.updated_at ? formatDistanceToNow(new Date(project.updated_at), { addSuffix: true }) : 'Waiting for first pass'}
                        </span>
                        <span className="flex items-center gap-1 text-emerald-300 group-hover:text-white">
                          Open
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + index * 0.04 }}
                >
                  <Link
                    href={`/builder?project=${project.id}`}
                    className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur transition-colors hover:border-emerald-500/40 hover:bg-white/10"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{project.name || 'Untitled Project'}</p>
                      <p className="text-xs text-zinc-500">
                        Last touched {project.updated_at ? formatDistanceToNow(new Date(project.updated_at), { addSuffix: true }) : 'just now'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1">
                        {project.slug ? 'Published' : 'Draft'}
                      </span>
                      <button
                        onClick={(event) => handleDelete(event, project.id)}
                        className="rounded-full border border-white/10 p-2 text-zinc-500 hover:text-red-400 hover:border-red-400/40 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <ChevronRight className="h-4 w-4 text-emerald-300" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-6 lg:grid-cols-[2fr,1fr]"
        >
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-900/70 to-zinc-950/60 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-600">Roadmap</p>
                <h3 className="text-lg font-semibold text-white mt-1">Signal From The Singularity</h3>
              </div>
              <Link href="/roadmap" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 hover:text-white">
                View full changelog
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-6 space-y-4">
              {ROADMAP_FEATURES.map(feature => (
                <div key={feature.title} className="relative flex gap-4 rounded-2xl border border-white/5 bg-white/5 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/30">
                    <feature.icon className="h-5 w-5 text-emerald-300" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white">{feature.title}</p>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-wide text-zinc-400">
                        {feature.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-600">Velocity</p>
            <h3 className="text-lg font-semibold text-white">Deployment timeline</h3>
            <p className="text-sm text-zinc-400">
              Live shipping cadence from the Chronosphere. Builder updates land here before the public log.
            </p>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Portal redesign shipped · {formatDistanceToNow(new Date(), { addSuffix: true })}
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-zinc-500" />
                Next up: Builder autosave sync to Supabase
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-zinc-500" />
                Researching native deploy pipeline with incremental cache
              </li>
            </ul>
          </div>
        </motion.section>
      </div>

      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 text-white shadow-2xl"
            >
              <h3 className="text-xl font-semibold">Upgrade for unlimited builds</h3>
              <p className="mt-2 text-sm text-zinc-400">
                You have reached the cap for the {tierConfig.name} tier. Unlock Visionary to remove project limits, export code, and deploy to custom domains.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/dashboard/billing"
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20"
                >
                  Upgrade plan
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="rounded-xl border border-white/10 px-4 py-3 text-sm text-zinc-400 hover:text-white"
                >
                  Keep free tier for now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
