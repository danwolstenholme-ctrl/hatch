'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import type { DbProject, DbSection, DbBrandConfig, DbBuild } from '@/lib/supabase'

function formatDate(value: string | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const SECTION_TYPES = ['header', 'hero', 'features', 'pricing', 'testimonials', 'cta', 'about', 'contact', 'footer']

export default function ProjectConfigPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const projectId = params?.id

  const [project, setProject] = useState<DbProject | null>(null)
  const [sections, setSections] = useState<DbSection[]>([])
  const [builds, setBuilds] = useState<DbBuild[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'brand' | 'seo' | 'pages' | 'deployments'>('overview')

  // Brand state
  const [brand, setBrand] = useState({
    primaryColor: '#10b981',
    secondaryColor: '#059669',
    bodyFont: 'Inter',
    headingFont: 'Inter',
    mode: 'dark' as 'dark' | 'light'
  })

  // SEO state
  const [seo, setSeo] = useState({
    title: '',
    description: '',
    keywords: ''
  })

  const refresh = useCallback(async () => {
    if (!projectId) return

    const [projectRes, buildsRes] = await Promise.all([
      fetch(`/api/project/${projectId}`),
      fetch(`/api/project/${projectId}/builds`),
    ])

    if (!projectRes.ok) {
      if (projectRes.status === 401) router.replace('/sign-in')
      return
    }

    const projectData = (await projectRes.json()) as { 
      project: DbProject & { brand_config?: DbBrandConfig }
      sections: DbSection[] 
    }
    
    setProject(projectData.project)
    setSections(projectData.sections || [])

    // Load brand config
    if (projectData.project.brand_config) {
      const bc = projectData.project.brand_config
      setBrand({
        primaryColor: bc.colors?.primary || '#10b981',
        secondaryColor: bc.colors?.secondary || '#059669',
        bodyFont: bc.fontStyle || 'Inter',
        headingFont: bc.fontStyle || 'Inter',
        mode: 'dark'
      })
      if (bc.seo) {
        setSeo({
          title: bc.seo.title || '',
          description: bc.seo.description || '',
          keywords: bc.seo.keywords || ''
        })
      }
    }

    if (buildsRes.ok) {
      const list = (await buildsRes.json()) as { builds?: DbBuild[] }
      setBuilds(list.builds || [])
    }
  }, [projectId, router])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        await refresh()
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [refresh])

  const handleSave = async () => {
    if (!projectId) return
    setSaving(true)
    try {
      await fetch(`/api/project/${projectId}/brand`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          colors: { primary: brand.primaryColor, secondary: brand.secondaryColor },
          fontStyle: brand.bodyFont,
          seo: seo
        })
      })
      await refresh()
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="py-12">
        <Link href="/dashboard/projects" className="text-sm text-zinc-500 hover:text-zinc-300">
          ← Back to Projects
        </Link>
        <p className="text-sm text-red-400 mt-4">Project not found</p>
      </div>
    )
  }

  const completedSections = sections.filter(s => s.status === 'complete').length
  const latestBuild = builds[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/dashboard/projects" className="text-xs text-zinc-500 hover:text-zinc-300 mb-2 block">
            ← Projects
          </Link>
          <h1 className="text-lg font-medium text-white">{project.name || 'Untitled'}</h1>
          <p className="text-sm text-zinc-500 font-mono">{project.slug}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/builder?project=${project.id}`}
            className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Open Builder
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-zinc-800/50">
        {(['overview', 'brand', 'seo', 'pages', 'deployments'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-sm capitalize transition-colors ${
              activeTab === tab
                ? 'text-white border-b border-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Status */}
          <div className="border border-zinc-800/50 rounded-md p-4 bg-zinc-900/30">
            <h3 className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">State</span>
                <span className={project.status === 'deployed' ? 'text-emerald-400' : 'text-zinc-300'}>
                  {project.status === 'deployed' ? 'Live' : project.status === 'complete' ? 'Ready' : 'Building'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Sections</span>
                <span className="text-zinc-300 tabular-nums">{completedSections}/{sections.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Last updated</span>
                <span className="text-zinc-300">{formatDate(project.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="border border-zinc-800/50 rounded-md p-4 bg-zinc-900/30">
            <h3 className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Sections</h3>
            <div className="space-y-1">
              {sections.length === 0 ? (
                <p className="text-sm text-zinc-500">No sections yet</p>
              ) : (
                sections.map((section) => (
                  <div key={section.id} className="flex justify-between text-sm">
                    <span className="text-zinc-400 capitalize">{section.section_id}</span>
                    <span className={section.status === 'complete' ? 'text-emerald-400' : 'text-zinc-500'}>
                      {section.status === 'complete' ? 'Done' : 'Pending'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'brand' && (
        <div className="space-y-6 max-w-lg">
          <div className="border border-zinc-800/50 rounded-md p-4 bg-zinc-900/30">
            <h3 className="text-xs text-zinc-500 uppercase tracking-wide mb-4">Colors</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-zinc-400 block mb-1">Primary</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brand.primaryColor}
                    onChange={(e) => setBrand(b => ({ ...b, primaryColor: e.target.value }))}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                    title="Primary color"
                  />
                  <input
                    type="text"
                    value={brand.primaryColor}
                    onChange={(e) => setBrand(b => ({ ...b, primaryColor: e.target.value }))}
                    className="flex-1 px-3 py-1.5 text-sm bg-zinc-800/50 border border-zinc-700/50 rounded text-zinc-200 font-mono"
                    title="Primary color hex"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-zinc-400 block mb-1">Secondary</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brand.secondaryColor}
                    onChange={(e) => setBrand(b => ({ ...b, secondaryColor: e.target.value }))}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                    title="Secondary color"
                  />
                  <input
                    type="text"
                    value={brand.secondaryColor}
                    onChange={(e) => setBrand(b => ({ ...b, secondaryColor: e.target.value }))}
                    className="flex-1 px-3 py-1.5 text-sm bg-zinc-800/50 border border-zinc-700/50 rounded text-zinc-200 font-mono"
                    title="Secondary color hex"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border border-zinc-800/50 rounded-md p-4 bg-zinc-900/30">
            <h3 className="text-xs text-zinc-500 uppercase tracking-wide mb-4">Typography</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-zinc-400 block mb-1">Body Font</label>
                <select
                  value={brand.bodyFont}
                  onChange={(e) => setBrand(b => ({ ...b, bodyFont: e.target.value }))}
                  className="w-full px-3 py-1.5 text-sm bg-zinc-800/50 border border-zinc-700/50 rounded text-zinc-200"
                  title="Body font"
                >
                  <option value="Inter">Inter</option>
                  <option value="DM Sans">DM Sans</option>
                  <option value="Space Grotesk">Space Grotesk</option>
                  <option value="Poppins">Poppins</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-zinc-400 block mb-1">Heading Font</label>
                <select
                  value={brand.headingFont}
                  onChange={(e) => setBrand(b => ({ ...b, headingFont: e.target.value }))}
                  className="w-full px-3 py-1.5 text-sm bg-zinc-800/50 border border-zinc-700/50 rounded text-zinc-200"
                  title="Heading font"
                >
                  <option value="Inter">Inter</option>
                  <option value="DM Sans">DM Sans</option>
                  <option value="Space Grotesk">Space Grotesk</option>
                  <option value="Playfair Display">Playfair Display</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border border-zinc-800/50 rounded-md p-4 bg-zinc-900/30">
            <h3 className="text-xs text-zinc-500 uppercase tracking-wide mb-4">Mode</h3>
            <div className="flex gap-4">
              <button
                onClick={() => setBrand(b => ({ ...b, mode: 'dark' }))}
                className={`px-4 py-2 text-sm rounded transition-colors ${
                  brand.mode === 'dark'
                    ? 'bg-zinc-700 text-white'
                    : 'bg-zinc-800/50 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => setBrand(b => ({ ...b, mode: 'light' }))}
                className={`px-4 py-2 text-sm rounded transition-colors ${
                  brand.mode === 'light'
                    ? 'bg-zinc-700 text-white'
                    : 'bg-zinc-800/50 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Light
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {activeTab === 'seo' && (
        <div className="space-y-6 max-w-lg">
          <div className="border border-zinc-800/50 rounded-md p-4 bg-zinc-900/30">
            <h3 className="text-xs text-zinc-500 uppercase tracking-wide mb-4">Meta Tags</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-zinc-400 block mb-1">Title</label>
                <input
                  type="text"
                  value={seo.title}
                  onChange={(e) => setSeo(s => ({ ...s, title: e.target.value }))}
                  placeholder="My Website"
                  className="w-full px-3 py-1.5 text-sm bg-zinc-800/50 border border-zinc-700/50 rounded text-zinc-200 placeholder-zinc-600"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 block mb-1">Description</label>
                <textarea
                  value={seo.description}
                  onChange={(e) => setSeo(s => ({ ...s, description: e.target.value }))}
                  placeholder="A short description of your site"
                  rows={3}
                  className="w-full px-3 py-1.5 text-sm bg-zinc-800/50 border border-zinc-700/50 rounded text-zinc-200 placeholder-zinc-600 resize-none"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 block mb-1">Keywords</label>
                <input
                  type="text"
                  value={seo.keywords}
                  onChange={(e) => setSeo(s => ({ ...s, keywords: e.target.value }))}
                  placeholder="keyword1, keyword2, keyword3"
                  className="w-full px-3 py-1.5 text-sm bg-zinc-800/50 border border-zinc-700/50 rounded text-zinc-200 placeholder-zinc-600"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {activeTab === 'pages' && (
        <div className="space-y-4">
          <div className="border border-zinc-800/50 rounded-md p-4 bg-zinc-900/30">
            <h3 className="text-xs text-zinc-500 uppercase tracking-wide mb-4">Site Pages</h3>
            <p className="text-sm text-zinc-500">
              Multi-page support coming soon. Currently building single-page sites.
            </p>
          </div>

          <div className="border border-zinc-800/50 rounded-md p-4 bg-zinc-900/30">
            <h3 className="text-xs text-zinc-500 uppercase tracking-wide mb-4">Available Section Types</h3>
            <div className="flex flex-wrap gap-2">
              {SECTION_TYPES.map((type) => (
                <span key={type} className="text-xs text-zinc-400 px-2 py-1 bg-zinc-800/50 rounded capitalize">
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'deployments' && (
        <div className="space-y-4">
          {latestBuild?.deployed_url && (
            <div className="border border-emerald-500/20 rounded-md p-4 bg-emerald-500/5">
              <h3 className="text-xs text-emerald-400 uppercase tracking-wide mb-2">Live Site</h3>
              <a
                href={latestBuild.deployed_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                {latestBuild.deployed_url}
              </a>
            </div>
          )}

          <div className="border border-zinc-800/50 rounded-md p-4 bg-zinc-900/30">
            <h3 className="text-xs text-zinc-500 uppercase tracking-wide mb-4">Build History</h3>
            {builds.length === 0 ? (
              <p className="text-sm text-zinc-500">No builds yet</p>
            ) : (
              <div className="space-y-2">
                {builds.slice(0, 10).map((build) => (
                  <div key={build.id} className="flex justify-between text-sm">
                    <span className="text-zinc-400">v{build.version}</span>
                    <span className="text-zinc-500">{formatDate(build.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
