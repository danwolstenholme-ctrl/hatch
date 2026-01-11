'use client'

import { useEffect, useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { formatDistanceToNow } from 'date-fns'
import { DbProject } from '@/lib/supabase'
import { useGitHub } from '@/hooks/useGitHub'

type ProjectWithProgress = DbProject & {
  total_sections?: number
  completed_sections?: number
}

const getDeployedUrl = (project: ProjectWithProgress): string | null => {
  if (project.deployed_slug) {
    return `https://${project.deployed_slug}.hatchit.dev`
  }
  return null
}

const TIER_LIMITS: Record<string, number> = {
  free: 1,
  architect: 3,
  visionary: Infinity,
  singularity: Infinity,
}

export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const gitHub = useGitHub()
  const router = useRouter()
  const [projects, setProjects] = useState<ProjectWithProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const accountSubscription = user?.publicMetadata?.accountSubscription as { tier?: string } | undefined
  const tier = accountSubscription?.tier || 'free'
  const limit = TIER_LIMITS[tier] ?? 1
  const isAtLimit = limit !== Infinity && projects.length >= limit

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      router.replace('/sign-in?redirect_url=/dashboard')
      return
    }
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch('/api/project/list')
        if (res.status === 401) {
          router.replace('/sign-in?redirect_url=/dashboard')
          return
        }
        if (res.ok) {
          const data = await res.json()
          if (!cancelled) setProjects(data.projects || [])
        }
      } catch (e) {
        console.error('[Dashboard] Failed to load', e)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
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
    const deployed = projects.filter(p => p.status === 'deployed').length
    const sections = projects.reduce((acc, p) => acc + (p.completed_sections || 0), 0)
    return { deployed, sections }
  }, [projects])

  const handleNewProject = () => {
    if (isAtLimit) {
      router.push('/dashboard/billing')
    } else {
      router.push('/dashboard/projects/new')
    }
  }

  const handleDelete = async (e: MouseEvent<HTMLButtonElement>, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Delete this project?')) return
    const res = await fetch(`/api/project/${id}`, { method: 'DELETE' })
    if (res.ok) setProjects(prev => prev.filter(p => p.id !== id))
  }

  if (!isLoaded || !isSignedIn || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-xs text-zinc-600">Loading...</p>
      </div>
    )
  }

  const mostRecent = sortedProjects[0]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-base font-medium text-white">Projects</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {projects.length === 0 
              ? 'No projects yet' 
              : `${projects.length}${limit !== Infinity ? ` / ${limit}` : ''} project${projects.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        <button
          onClick={handleNewProject}
          className="px-3 py-1.5 text-xs font-medium text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 rounded transition-colors"
        >
          {isAtLimit ? 'Upgrade' : 'New project'}
        </button>
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="border border-zinc-800/60 rounded-lg p-8 text-center">
          <p className="text-sm text-zinc-400 mb-4">Create your first project to get started</p>
          <button
            onClick={handleNewProject}
            className="px-4 py-2 text-xs font-medium text-black bg-white hover:bg-zinc-200 rounded transition-colors"
          >
            New project
          </button>
        </div>
      )}

      {/* Projects List */}
      {projects.length > 0 && (
        <div className="border border-zinc-800/60 rounded-lg overflow-hidden divide-y divide-zinc-800/60">
          {sortedProjects.map((project) => {
            const completed = project.completed_sections ?? 0
            const total = project.total_sections ?? 0
            const isDeployed = project.status === 'deployed'
            const deployedUrl = getDeployedUrl(project)

            return (
              <Link
                key={project.id}
                href={`/builder?project=${project.id}`}
                className="group flex items-center justify-between px-4 py-3 bg-zinc-950 hover:bg-zinc-900/50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white truncate">{project.name}</span>
                    {isDeployed && (
                      <span className="text-[10px] text-emerald-500">live</span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-600 mt-0.5">
                    {completed}/{total} sections · {project.updated_at
                      ? formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })
                      : 'just now'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {isDeployed && deployedUrl && (
                    <a
                      href={deployedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[11px] text-zinc-500 hover:text-white transition-colors"
                    >
                      View site
                    </a>
                  )}
                  <button
                    onClick={(e) => handleDelete(e, project.id)}
                    className="text-[11px] text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Delete
                  </button>
                  <span className="text-zinc-700 text-xs">→</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Bottom Row */}
      {projects.length > 0 && (
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/40">
          <div className="flex items-center gap-6 text-[11px] text-zinc-600">
            <span>{stats.deployed} deployed</span>
            <span>{stats.sections} sections built</span>
            {gitHub.connected && <span>GitHub connected</span>}
          </div>
          {mostRecent && (
            <Link
              href={`/builder?project=${mostRecent.id}`}
              className="text-xs text-zinc-500 hover:text-white transition-colors"
            >
              Continue building →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
