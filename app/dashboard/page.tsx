'use client'

import { useEffect, useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Plus,
  Trash2,
  ExternalLink,
  ChevronRight,
  X,
  Github,
  Folder,
  Globe,
  CheckCircle2,
  AlertCircle,
  Clock,
  Rocket,
  Zap,
  Layers,
  ArrowRight,
  ArrowUpRight,
  Crown,
  Sparkles,
  Settings,
  CreditCard,
  Activity
} from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { formatDistanceToNow } from 'date-fns'
import { DbProject } from '@/lib/supabase'
import { useGitHub } from '@/hooks/useGitHub'
import Button from '@/components/singularity/Button'
import Badge from '@/components/singularity/Badge'
import ProjectWizard from '@/components/ProjectWizard'

// =============================================================================
// DASHBOARD - Command Center
// Clean, professional, infrastructure-focused with confident restraint
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

  // Get first name for greeting
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
    setShowWizard(true)
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
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center animate-pulse">
            <Activity className="w-5 h-5 text-zinc-500" />
          </div>
          <p className="text-sm text-zinc-500">Loading dashboard...</p>
        </div>
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
            className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm shadow-lg backdrop-blur-sm"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{createError}</span>
            <button onClick={() => setCreateError(null)} className="p-1 hover:bg-red-500/20 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold text-white">
                Welcome back, {firstName}
              </h1>
              <Badge variant={tierConfig.variant}>{tierConfig.name}</Badge>
            </div>
            <p className="text-sm text-zinc-500">
              {projects.length === 0
                ? 'Create your first project to get started'
                : `Managing ${projects.length} project${projects.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            icon={<Plus className="w-4 h-4" />}
            iconPosition="left"
            onClick={handleOpenWizard}
            loading={isCreating}
            disabled={isCreating || isAtLimit}
          >
            {isAtLimit ? 'Upgrade for more' : 'New Project'}
          </Button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Folder}
          label="Projects"
          value={stats.totalProjects}
          suffix={tierConfig.limit !== Infinity ? `/${tierConfig.limit}` : ''}
          progress={tierConfig.limit !== Infinity ? (stats.totalProjects / tierConfig.limit) * 100 : undefined}
        />
        <StatCard
          icon={Globe}
          label="Deployed"
          value={stats.deployed}
          iconColor="text-emerald-500"
          highlight={stats.deployed > 0}
        />
        <StatCard
          icon={Zap}
          label="In Progress"
          value={stats.building}
          iconColor="text-amber-500"
        />
        <StatCard
          icon={Layers}
          label="Sections Built"
          value={stats.completedSections}
          suffix={stats.totalSections > 0 ? `/${stats.totalSections}` : ''}
        />
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Projects List */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold text-white">Your Projects</h2>
                {projects.length > 0 && (
                  <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                    {projects.length}
                  </span>
                )}
              </div>
              {projects.length > 5 && (
                <Link href="/dashboard/builds" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>

            {projects.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center mx-auto mb-5">
                  <Rocket className="w-7 h-7 text-zinc-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No projects yet</h3>
                <p className="text-sm text-zinc-500 max-w-sm mx-auto mb-6">
                  Create your first project to start building. Describe your site, pick your sections, and let AI generate it for you.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Plus className="w-4 h-4" />}
                  iconPosition="left"
                  onClick={handleOpenWizard}
                  loading={isCreating}
                  disabled={isCreating}
                >
                  Create First Project
                </Button>
                {!canDeploy && (
                  <p className="text-xs text-zinc-600 mt-6">
                    Free tier: Unlimited AI generations, preview included
                  </p>
                )}
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/50">
                {sortedProjects.slice(0, 5).map((project, index) => {
                  const completed = project.completed_sections ?? 0
                  const total = project.total_sections ?? 0
                  const progress = total > 0 ? Math.round((completed / total) * 100) : 0
                  const isDeployed = project.status === 'deployed'
                  const isComplete = progress === 100

                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={`/builder?project=${project.id}`}
                        className="group flex items-center justify-between px-6 py-4 hover:bg-zinc-800/30 transition-all"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                            isDeployed
                              ? 'bg-emerald-500/10 border border-emerald-500/30 group-hover:border-emerald-500/50'
                              : 'bg-zinc-800 border border-zinc-700 group-hover:border-zinc-600'
                          }`}>
                            {isDeployed ? (
                              <Globe className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <Folder className="w-5 h-5 text-zinc-400" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-zinc-100 truncate group-hover:text-white transition-colors">
                                {project.name || 'Untitled Project'}
                              </p>
                              {isDeployed && (
                                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-medium">
                                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                  Live
                                </span>
                              )}
                              {!isDeployed && isComplete && (
                                <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-medium">
                                  Ready
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${isComplete ? 'bg-emerald-500' : 'bg-zinc-600'}`}
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-zinc-500 tabular-nums font-medium">
                                  {completed}/{total}
                                </span>
                              </div>

                              <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {project.updated_at
                                  ? formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })
                                  : 'Just created'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {isDeployed && project.deployed_url && (
                            <a
                              href={project.deployed_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                              title="View live site"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={(e) => handleDelete(e, project.id)}
                            className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Delete project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* GitHub Integration */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                gitHub.connected
                  ? 'bg-emerald-500/10 border border-emerald-500/30'
                  : 'bg-zinc-800 border border-zinc-700'
              }`}>
                <Github className={`w-5 h-5 ${gitHub.connected ? 'text-emerald-400' : 'text-zinc-400'}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-white">GitHub</h3>
                <p className="text-xs text-zinc-500">
                  {gitHub.loading ? 'Checking...' : gitHub.connected ? `@${gitHub.username}` : 'Not connected'}
                </p>
              </div>
              {gitHub.connected && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            </div>

            {gitHub.connected ? (
              <div className="space-y-3">
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Push projects directly to your repositories. Your code, your repo.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={async () => { await gitHub.disconnect(); await gitHub.refresh() }}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Connect to push your projects to GitHub and own your code.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  icon={<Github className="w-4 h-4" />}
                  iconPosition="left"
                  onClick={() => gitHub.connect()}
                  loading={gitHub.loading}
                  disabled={gitHub.loading || tier === 'free'}
                >
                  {tier === 'free' ? 'Upgrade to Connect' : 'Connect GitHub'}
                </Button>
              </div>
            )}
          </div>

          {/* Tier Card */}
          <div className={`rounded-2xl border p-5 ${
            tier === 'free'
              ? 'border-zinc-800 bg-zinc-900/50'
              : 'border-emerald-500/30 bg-emerald-500/5'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                tier === 'free' ? 'bg-zinc-800 border border-zinc-700' : 'bg-emerald-500/10 border border-emerald-500/30'
              }`}>
                {tier === 'free' ? (
                  <Sparkles className="w-5 h-5 text-zinc-400" />
                ) : (
                  <Crown className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">{tierConfig.name} Plan</h3>
                <p className="text-xs text-zinc-500">
                  {tier === 'free' ? 'Upgrade to deploy' : 'Full access enabled'}
                </p>
              </div>
            </div>

            <ul className="space-y-2 mb-4">
              {tierConfig.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-zinc-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  {feature}
                </li>
              ))}
            </ul>

            {tier === 'free' ? (
              <Button
                variant="primary"
                size="sm"
                fullWidth
                icon={<ArrowUpRight className="w-4 h-4" />}
                iconPosition="right"
                onClick={() => router.push('/dashboard/billing')}
              >
                Upgrade Plan
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={() => router.push('/dashboard/billing')}
              >
                Manage Subscription
              </Button>
            )}
          </div>

          {/* Quick Links */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h3 className="text-sm font-medium text-white mb-3">Quick Actions</h3>
            <div className="space-y-1">
              <QuickLink href="/dashboard/builds" icon={Layers} label="All Builds" />
              <QuickLink href="/dashboard/billing" icon={CreditCard} label="Billing" />
              <QuickLink href="/dashboard/settings" icon={Settings} label="Settings" />
            </div>
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

// =============================================================================
// Sub-components
// =============================================================================

function StatCard({
  icon: Icon,
  label,
  value,
  suffix = '',
  iconColor = 'text-zinc-500',
  highlight = false,
  progress
}: {
  icon: typeof Folder
  label: string
  value: number
  suffix?: string
  iconColor?: string
  highlight?: boolean
  progress?: number
}) {
  return (
    <div className={`p-4 rounded-xl border transition-all ${
      highlight
        ? 'bg-emerald-500/5 border-emerald-500/20'
        : 'bg-zinc-900/50 border-zinc-800'
    }`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <span className="text-xs text-zinc-500 font-medium">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-white tabular-nums">
        {value}
        {suffix && <span className="text-zinc-600 text-sm ml-0.5">{suffix}</span>}
      </p>
      {progress !== undefined && (
        <div className="mt-3 h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${progress >= 100 ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}

function QuickLink({ href, icon: Icon, label }: { href: string; icon: typeof Folder; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-3 py-2.5 text-sm text-zinc-400 hover:text-white bg-zinc-800/30 hover:bg-zinc-800 rounded-lg transition-all group"
    >
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400" />
        <span>{label}</span>
      </div>
      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  )
}
