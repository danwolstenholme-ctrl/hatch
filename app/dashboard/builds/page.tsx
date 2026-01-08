'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { DbProject } from '@/lib/supabase'

type ProjectWithProgress = DbProject & {
  total_sections?: number
  completed_sections?: number
  skipped_sections?: number
}

function fmt(n: number | undefined) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '—'
  return String(n)
}

export default function DashboardBuildsPage() {
  const [projects, setProjects] = useState<ProjectWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const res = await fetch('/api/project/list')
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string }
          throw new Error(body.error || 'Failed to load projects')
        }
        const data = (await res.json()) as { projects?: ProjectWithProgress[] }
        if (!cancelled) setProjects(data.projects || [])
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load projects')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  const rows = useMemo(() => {
    return [...projects].sort((a, b) => {
      const aTime = a.updated_at ? new Date(a.updated_at).getTime() : 0
      const bTime = b.updated_at ? new Date(b.updated_at).getTime() : 0
      return bTime - aTime
    })
  }, [projects])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold text-white">Builds</h1>
        <p className="text-sm text-zinc-500">Build snapshots, audits, and deployment per project.</p>
      </header>

      <section className="rounded-lg border border-zinc-800/70 bg-zinc-900/40 overflow-hidden">
        <div className="grid grid-cols-12 gap-3 border-b border-zinc-800/70 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
          <div className="col-span-5">Project</div>
          <div className="col-span-3">Progress</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {loading ? (
          <div className="px-4 py-6 text-sm text-zinc-500">Loading…</div>
        ) : error ? (
          <div className="px-4 py-6 text-sm text-red-400">{error}</div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-6 text-sm text-zinc-500">
            No projects yet. <Link href="/dashboard" className="text-zinc-200 hover:underline">Create one</Link>.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/70">
            {rows.map(project => {
              const completed = project.completed_sections ?? 0
              const total = project.total_sections ?? 0
              const skipped = project.skipped_sections ?? 0
              return (
                <div key={project.id} className="grid grid-cols-12 gap-3 px-4 py-3">
                  <div className="col-span-5 min-w-0">
                    <div className="truncate text-sm font-medium text-white">{project.name}</div>
                    <div className="truncate text-xs text-zinc-500">{project.slug}</div>
                  </div>

                  <div className="col-span-3 text-sm text-zinc-200 tabular-nums">
                    {fmt(completed)}/{fmt(total)}
                    {skipped > 0 ? <span className="ml-2 text-xs text-zinc-500">({skipped} skipped)</span> : null}
                  </div>

                  <div className="col-span-2 text-sm text-zinc-500">{project.status || '—'}</div>

                  <div className="col-span-2 flex justify-end gap-3 text-sm">
                    <Link href={`/dashboard/builds/${project.id}`} className="text-zinc-200 hover:underline">
                      Open
                    </Link>
                    <Link href={`/builder?project=${project.id}`} className="text-zinc-500 hover:text-zinc-200">
                      Builder
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
