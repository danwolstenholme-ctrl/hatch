'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import type { DbBuild, DbProject, DbSection } from '@/lib/supabase'

function formatDate(value: string | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString()
}

export default function BuildDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const projectId = params?.id

  const [project, setProject] = useState<DbProject | null>(null)
  const [sections, setSections] = useState<DbSection[]>([])
  const [latestBuild, setLatestBuild] = useState<DbBuild | null>(null)
  const [builds, setBuilds] = useState<DbBuild[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!projectId) return
    setError(null)
    setNotice(null)

    const [projectRes, latestBuildRes, buildsRes] = await Promise.all([
      fetch(`/api/project/${projectId}`),
      fetch(`/api/project/${projectId}/build`),
      fetch(`/api/project/${projectId}/builds`),
    ])

    if (!projectRes.ok) {
      if (projectRes.status === 401) router.replace('/sign-in?redirect_url=/dashboard/builds')
      const body = (await projectRes.json().catch(() => ({}))) as { error?: string }
      throw new Error(body.error || 'Unable to load project')
    }

    const projectData = (await projectRes.json()) as { project: DbProject; sections: DbSection[] }
    setProject(projectData.project)
    setSections(projectData.sections || [])

    if (latestBuildRes.ok) {
      const b = (await latestBuildRes.json()) as { build?: DbBuild }
      setLatestBuild(b.build || null)
    } else {
      setLatestBuild(null)
    }

    if (buildsRes.ok) {
      const list = (await buildsRes.json()) as { builds?: DbBuild[] }
      setBuilds(list.builds || [])
    } else {
      setBuilds([])
    }
  }, [projectId, router])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!projectId) return
      try {
        await refresh()
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Unable to load project')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [projectId, refresh])

  const totalSections = sections.length
  const completedSections = useMemo(
    () => sections.filter(s => s.status === 'complete').length,
    [sections]
  )

  const createSnapshot = async () => {
    if (!projectId) return
    setBusy('snapshot')
    setError(null)
    setNotice(null)
    try {
      const res = await fetch(`/api/project/${projectId}/build`, { method: 'POST' })
      const data = (await res.json().catch(() => ({}))) as { error?: string; build?: DbBuild }
      if (!res.ok) throw new Error(data.error || 'Failed to create snapshot')
      setNotice(`Snapshot created (v${data.build?.version ?? '—'}).`)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create snapshot')
    } finally {
      setBusy(null)
    }
  }

  const runAudit = async () => {
    if (!projectId) return
    setBusy('audit')
    setError(null)
    setNotice(null)
    try {
      const res = await fetch(`/api/project/${projectId}/audit`, { method: 'POST' })
      const data = (await res.json().catch(() => ({}))) as { error?: string; requiresUpgrade?: boolean; auditChanges?: string[] }
      if (!res.ok) {
        if (data.requiresUpgrade) {
          router.push('/dashboard/billing')
          return
        }
        throw new Error(data.error || 'Failed to run audit')
      }
      setNotice(`Audit complete${data.auditChanges?.length ? ` (${data.auditChanges.length} changes)` : ''}.`)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to run audit')
    } finally {
      setBusy(null)
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="text-sm text-zinc-500">Loading…</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-3">
        <Link href="/dashboard/builds" className="text-sm text-zinc-500 hover:text-zinc-200">
          Back
        </Link>
        <div className="text-sm text-red-400">{error || 'Project not found'}</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <header className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-white">{project.name}</h1>
          <p className="truncate text-sm text-zinc-500">{project.slug}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link href="/dashboard/builds" className="text-sm text-zinc-500 hover:text-zinc-200">
            Back
          </Link>
          <Link href={`/builder?project=${project.id}`} className="text-sm text-zinc-500 hover:text-zinc-200">
            Builder
          </Link>
          <Link href={`/builder?project=${project.id}&settings=1`} className="text-sm text-zinc-200 hover:underline">
            Site settings
          </Link>
        </div>
      </header>

      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
      ) : null}
      {notice ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{notice}</div>
      ) : null}

      <section className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-800/70 bg-zinc-900/40 p-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Project</p>
          <div className="mt-2 grid gap-2 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-zinc-500">Status</span>
              <span className="text-zinc-200">{project.status || '—'}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-zinc-500">Sections</span>
              <span className="text-zinc-200 tabular-nums">{completedSections}/{totalSections}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-zinc-500">Updated</span>
              <span className="text-zinc-200">{formatDate(project.updated_at)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800/70 bg-zinc-900/40 p-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Latest snapshot</p>
          {latestBuild ? (
            <div className="mt-2 grid gap-2 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-500">Version</span>
                <span className="text-zinc-200 tabular-nums">v{latestBuild.version}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-500">Created</span>
                <span className="text-zinc-200">{formatDate(latestBuild.created_at)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-500">Audit</span>
                <span className="text-zinc-200">{latestBuild.audit_complete ? 'Complete' : '—'}</span>
              </div>
              {latestBuild.deployed_url ? (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-500">Deployed</span>
                  <a className="text-zinc-200 hover:underline" href={latestBuild.deployed_url} target="_blank" rel="noreferrer">
                    Open
                  </a>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">No snapshot yet.</p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={createSnapshot}
              disabled={busy !== null}
              className="px-3 py-1.5 text-xs text-zinc-200 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-all disabled:opacity-50"
            >
              {busy === 'snapshot' ? 'Creating…' : 'Create snapshot'}
            </button>
            <button
              onClick={runAudit}
              disabled={busy !== null}
              className="px-3 py-1.5 text-xs text-zinc-200 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-all disabled:opacity-50"
            >
              {busy === 'audit' ? 'Auditing…' : 'Run AI audit'}
            </button>
            <Link
              href={`/builder?project=${project.id}#deploy`}
              className="px-3 py-1.5 text-xs text-zinc-200 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-all"
            >
              Deploy
            </Link>
          </div>

          <p className="mt-2 text-xs text-zinc-500">Audit requires Visionary+.</p>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-800/70 bg-zinc-900/40 overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-800/70 px-4 py-2">
          <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Build history</p>
          <button onClick={() => refresh()} className="text-xs text-zinc-500 hover:text-zinc-200">Refresh</button>
        </div>

        {builds.length === 0 ? (
          <div className="px-4 py-4 text-sm text-zinc-500">No builds yet.</div>
        ) : (
          <div className="divide-y divide-zinc-800/70">
            {builds.map(b => (
              <div key={b.id} className="grid grid-cols-12 gap-3 px-4 py-3 text-sm">
                <div className="col-span-2 text-zinc-200 tabular-nums">v{b.version}</div>
                <div className="col-span-4 text-zinc-500">{formatDate(b.created_at)}</div>
                <div className="col-span-3 text-zinc-500">{b.audit_complete ? 'Audited' : '—'}</div>
                <div className="col-span-3 flex justify-end">
                  {b.deployed_url ? (
                    <a className="text-zinc-200 hover:underline" href={b.deployed_url} target="_blank" rel="noreferrer">
                      Open deploy
                    </a>
                  ) : (
                    <span className="text-zinc-500">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
