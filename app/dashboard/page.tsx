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
  Code2,
  ArrowRight
} from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { formatDistanceToNow } from 'date-fns'
import { DbProject } from '@/lib/supabase'
import { useGitHub } from '@/hooks/useGitHub'
import Button from '@/components/singularity/Button'
import ProjectWizard from '@/components/ProjectWizard'

type ProjectWithProgress = DbProject & {
  total_sections?: number
  completed_sections?: number
  deployed_url?: string
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
  const tier = accountSubscription?.tier || 'free'

  const tierConfig = useMemo(() => {
    if (tier === 'singularity') return { name: 'Singularity', limit: Infinity }
    if (tier === 'visionary') return { name: 'Visionary', limit: Infinity }
    if (tier === 'architect') return { name: 'Architect', limit: 3 }
    return { name: 'Free', limit: 1 }
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
    const building = projects.filter(p => p.status === 'building').length
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
        
        // Push to GitHub if requested
        if (config.pushToGithub && gitHub.connected) {
          // GitHub push happens in builder after sections are built
        }
        
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

  // Simple loading state - no extra components
  if (!isLoaded || !isSignedIn || isLoading) {
    return null
  }

  return (
    <>
      <AnimatePresence>
        {createError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
          >
            <AlertCircle className="w-4 h-4" />
            <span>{createError}</span>
            <button onClick={() => setCreateError(null)} className="text-red-400/60 hover:text-red-400">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-white">Overview</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your projects and deployments</p>
        </div>
        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          iconPosition="left"
          onClick={handleOpenWizard}
          loading={isCreating}
          disabled={isCreating}
        >
          New Project
        </Button>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Folder} label="Projects" value={stats.totalProjects} suffix={tierConfig.limit !== Infinity ? `/${tierConfig.limit}` : ''} />
        <StatCard icon={Globe} label="Deployed" value={stats.deployed} iconColor="text-emerald-500" />
        <StatCard icon={Zap} label="Building" value={stats.building} iconColor="text-amber-500" />
        <StatCard icon={Code2} label="Sections" value={stats.completedSections} suffix={`/${stats.totalSections}`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-200">Projects</h2>
              {projects.length > 0 && (
                <Link href="/dashboard/builds" className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>

            {projects.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-5 h-5 text-zinc-500" />
                </div>
                <p className="text-sm text-zinc-300 mb-2">No projects yet</p>
                <p className="text-xs text-zinc-500 mb-6">Create your first project to get started</p>
                <Button
                  variant="primary"
                  size="md"
                  icon={<Plus className="w-4 h-4" />}
                  iconPosition="left"
                  onClick={handleOpenWizard}
                  loading={isCreating}
                  disabled={isCreating}
                >
                  Create Project
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {sortedProjects.slice(0, 5).map((project) => {
                  const completed = project.completed_sections ?? 0
                  const total = project.total_sections ?? 0
                  const progress = total > 0 ? Math.round((completed / total) * 100) : 0
                  const isDeployed = project.status === 'deployed'
                  return (
                    <Link key={project.id} href={`/builder?project=${project.id}`} className="group flex items-center justify-between px-5 py-4 hover:bg-zinc-800/50 transition-all">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isDeployed ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-zinc-800 border border-zinc-700'}`}>
                          {isDeployed ? <Globe className="w-4 h-4 text-emerald-400" /> : <Folder className="w-4 h-4 text-zinc-400" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-zinc-100 truncate group-hover:text-white">{project.name || 'Untitled'}</p>
                            {isDeployed && <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full"><span className="w-1 h-1 bg-emerald-400 rounded-full" />Live</span>}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all ${progress === 100 ? 'bg-emerald-500' : 'bg-zinc-600'}`} style={{ width: `${progress}%` }} />
                              </div>
                              <span className="text-[10px] text-zinc-500 tabular-nums">{completed}/{total}</span>
                            </div>
                            <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {project.updated_at ? formatDistanceToNow(new Date(project.updated_at), { addSuffix: true }) : 'Just created'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isDeployed && project.deployed_url && (
                          <a href={project.deployed_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 text-zinc-500 hover:text-emerald-400 rounded-lg transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button onClick={(e) => handleDelete(e, project.id)} className="p-2 text-zinc-600 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <Github className="w-5 h-5 text-zinc-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-zinc-200">GitHub</h3>
                <p className="text-xs text-zinc-500">{gitHub.loading ? 'Checking...' : gitHub.connected ? `@${gitHub.username}` : 'Not connected'}</p>
              </div>
              {gitHub.connected && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />}
            </div>
            {gitHub.connected ? (
              <div className="space-y-3">
                <p className="text-xs text-zinc-500">Push your projects directly to your repositories.</p>
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
                <p className="text-xs text-zinc-500">Connect to push code to your repos.</p>
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  icon={<Github className="w-4 h-4" />}
                  iconPosition="left"
                  onClick={() => gitHub.connect()}
                  loading={gitHub.loading}
                  disabled={gitHub.loading}
                >
                  Connect GitHub
                </Button>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h3 className="text-sm font-medium text-zinc-200 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/dashboard/builds" className="flex items-center justify-between px-3 py-2.5 text-sm text-zinc-400 hover:text-zinc-200 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-all">
                <span>View all builds</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/dashboard/billing" className="flex items-center justify-between px-3 py-2.5 text-sm text-zinc-400 hover:text-zinc-200 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-all">
                <span>Upgrade plan</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/dashboard/settings" className="flex items-center justify-between px-3 py-2.5 text-sm text-zinc-400 hover:text-zinc-200 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-all">
                <span>Settings</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
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

function StatCard({ icon: Icon, label, value, suffix = '', iconColor = 'text-zinc-500' }: { icon: typeof Folder; label: string; value: number; suffix?: string; iconColor?: string }) {
  return (
    <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <span className="text-xs text-zinc-500">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-white tabular-nums">
        {value}
        {suffix && <span className="text-zinc-600 text-base">{suffix}</span>}
      </p>
    </div>
  )
}






