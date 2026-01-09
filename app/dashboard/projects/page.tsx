'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import type { DbProject } from '@/lib/supabase'

type ProjectWithProgress = DbProject & {
  total_sections?: number
  completed_sections?: number
  deployed_url?: string
}

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<ProjectWithProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const res = await fetch('/api/project/list')
        if (res.ok) {
          const data = (await res.json()) as { projects?: ProjectWithProgress[] }
          if (!cancelled) setProjects(data.projects || [])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [])

  const sorted = useMemo(() => {
    return [...projects].sort((a, b) => {
      const aTime = a.updated_at ? new Date(a.updated_at).getTime() : 0
      const bTime = b.updated_at ? new Date(b.updated_at).getTime() : 0
      return bTime - aTime
    })
  }, [projects])

  const handleNew = () => {
    router.push('/dashboard/projects/new')
  }

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-white">Projects</h1>
          <p className="text-sm text-zinc-500 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={handleNew}
          className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          + New Project
        </button>
      </div>

      {/* Project List */}
      {projects.length === 0 ? (
        <div className="py-16 text-center border border-zinc-800/50 rounded-md bg-zinc-900/30">
          <p className="text-sm text-zinc-400 mb-2">No projects yet</p>
          <p className="text-xs text-zinc-500 mb-6">Create your first project to get started</p>
          <button
            onClick={handleNew}
            className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            + Create Project
          </button>
        </div>
      ) : (
        <div className="border border-zinc-800/50 rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800/50 bg-zinc-900/50">
                <th className="text-left text-[11px] text-zinc-500 font-medium px-4 py-2">Name</th>
                <th className="text-left text-[11px] text-zinc-500 font-medium px-4 py-2 hidden sm:table-cell">Status</th>
                <th className="text-left text-[11px] text-zinc-500 font-medium px-4 py-2 hidden md:table-cell">Sections</th>
                <th className="text-left text-[11px] text-zinc-500 font-medium px-4 py-2 hidden lg:table-cell">Updated</th>
                <th className="text-right text-[11px] text-zinc-500 font-medium px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((project) => {
                const completed = project.completed_sections ?? 0
                const total = project.total_sections ?? 0
                const isDeployed = project.status === 'deployed'
                
                return (
                  <tr 
                    key={project.id} 
                    className="border-b border-zinc-800/30 last:border-b-0 hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link 
                        href={`/dashboard/projects/${project.id}`}
                        className="text-sm text-zinc-200 hover:text-white transition-colors"
                      >
                        {project.name || 'Untitled'}
                      </Link>
                      <p className="text-[11px] text-zinc-600 font-mono mt-0.5">{project.slug}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {isDeployed ? (
                        <span className="text-[11px] text-emerald-400">Live</span>
                      ) : (
                        <span className="text-[11px] text-zinc-500">Building</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-[11px] text-zinc-500 tabular-nums">{completed}/{total}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-[11px] text-zinc-500">
                        {project.updated_at
                          ? formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })
                          : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/builder?project=${project.id}`}
                        className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        Open Builder
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
