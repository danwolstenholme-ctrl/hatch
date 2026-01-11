'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, ExternalLink, AlertTriangle } from 'lucide-react'
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

const SECTION_TYPES = ['header', 'hero', 'features', 'pricing', 'testimonials', 'cta', 'about', 'contact', 'footer', 'services', 'faq']

const SECTION_INFO: Record<string, { name: string; desc: string }> = {
  header: { name: 'Header', desc: 'Navigation bar' },
  hero: { name: 'Hero', desc: 'Main banner' },
  features: { name: 'Features', desc: 'Feature grid' },
  about: { name: 'About', desc: 'About section' },
  services: { name: 'Services', desc: 'Service offerings' },
  pricing: { name: 'Pricing', desc: 'Pricing tables' },
  testimonials: { name: 'Testimonials', desc: 'Reviews' },
  faq: { name: 'FAQ', desc: 'Questions' },
  cta: { name: 'CTA', desc: 'Call to action' },
  contact: { name: 'Contact', desc: 'Contact form' },
  footer: { name: 'Footer', desc: 'Site footer' },
}

export default function ProjectConfigPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = params?.id
  
  // Deployment status from URL params
  const justDeployed = searchParams?.get('deployed') === 'true'
  const deploymentId = searchParams?.get('deploymentId')

  const [project, setProject] = useState<DbProject | null>(null)
  const [sections, setSections] = useState<DbSection[]>([])
  const [builds, setBuilds] = useState<DbBuild[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'brand' | 'seo' | 'pages' | 'deployments'>('overview')
  
  // Deployment status tracking
  const [deployStatus, setDeployStatus] = useState<{
    status: 'checking' | 'building' | 'ready' | 'failed' | null
    url?: string
    error?: string
    logsUrl?: string
  }>({ status: justDeployed ? 'checking' : null })

  // Brand state
  const [brand, setBrand] = useState({
    primaryColor: '#10b981',
    secondaryColor: '#059669',
    bodyFont: 'Inter',
    headingFont: 'Inter',
    mode: 'dark' as 'dark' | 'light',
    logoUrl: '' as string
  })
  const [logoUploading, setLogoUploading] = useState(false)

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
        mode: 'dark',
        logoUrl: bc.logoUrl || ''
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

  // Poll deployment status when just deployed
  useEffect(() => {
    if (!justDeployed || !deploymentId) return
    
    let cancelled = false
    let attempts = 0
    const maxAttempts = 30 // 2 minutes max
    
    const checkStatus = async () => {
      if (cancelled) return
      
      try {
        const res = await fetch(`/api/deploy/status?id=${deploymentId}`)
        const data = await res.json()
        
        if (cancelled) return
        
        if (data.status === 'ready') {
          setDeployStatus({ status: 'ready', url: data.url })
          // Clear URL params after success
          window.history.replaceState({}, '', `/dashboard/projects/${projectId}`)
          return
        }
        
        if (data.status === 'failed') {
          setDeployStatus({ 
            status: 'failed', 
            error: data.error,
            logsUrl: data.logsUrl
          })
          return
        }
        
        if (data.status === 'building') {
          setDeployStatus({ status: 'building' })
        }
        
        // Keep polling
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 4000)
        } else {
          // Timeout - assume something went wrong
          setDeployStatus({ 
            status: 'failed', 
            error: 'Deployment timed out. Check Vercel dashboard for details.'
          })
        }
      } catch {
        if (!cancelled) {
          setDeployStatus({ status: 'failed', error: 'Could not check deployment status' })
        }
      }
    }
    
    // Start polling after a short delay
    setTimeout(checkStatus, 2000)
    
    return () => { cancelled = true }
  }, [justDeployed, deploymentId, projectId])

  const handleSave = async () => {
    if (!projectId) return
    setSaving(true)
    try {
      await fetch(`/api/project/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandConfig: {
            colors: { 
              primary: brand.primaryColor, 
              secondary: brand.secondaryColor,
              accent: brand.primaryColor 
            },
            fontStyle: brand.bodyFont,
            logoUrl: brand.logoUrl,
            seo: seo
          }
        })
      })
      await refresh()
    } finally {
      setSaving(false)
    }
  }

  // Section management
  const handleMoveSection = async (index: number, direction: 'up' | 'down') => {
    if (!projectId) return
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= sections.length) return

    // Create new order
    const newOrder = [...sections]
    const [moved] = newOrder.splice(index, 1)
    newOrder.splice(newIndex, 0, moved)

    // Optimistic update
    setSections(newOrder)

    // Save to server
    try {
      await fetch(`/api/project/${projectId}/sections/order`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder.map(s => s.section_id) })
      })
    } catch {
      // Revert on error
      await refresh()
    }
  }

  const handleDeleteSection = async (sectionId: string) => {
    if (!projectId) return
    if (sectionId === 'header' || sectionId === 'footer') return

    // Optimistic update
    setSections(prev => prev.filter(s => s.section_id !== sectionId))

    try {
      await fetch(`/api/project/${projectId}/sections/${sectionId}`, {
        method: 'DELETE'
      })
    } catch {
      await refresh()
    }
  }

  const handleAddSection = async (sectionId: string) => {
    if (!projectId) return
    
    // Find insertion point (before footer)
    const footerIndex = sections.findIndex(s => s.section_id === 'footer')
    const insertAt = footerIndex >= 0 ? footerIndex : sections.length

    try {
      const res = await fetch(`/api/project/${projectId}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId, orderIndex: insertAt })
      })
      
      if (res.ok) {
        await refresh()
      }
    } catch {
      // Ignore
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
      {/* Deployment Status Banner */}
      <AnimatePresence>
        {deployStatus.status && deployStatus.status !== null && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-lg border p-4 ${
              deployStatus.status === 'ready' 
                ? 'bg-emerald-500/10 border-emerald-500/30' 
                : deployStatus.status === 'failed'
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-zinc-800/50 border-zinc-700/50'
            }`}
          >
            <div className="flex items-center gap-3">
              {deployStatus.status === 'checking' || deployStatus.status === 'building' ? (
                <>
                  <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {deployStatus.status === 'checking' ? 'Checking deployment...' : 'Building your site...'}
                    </p>
                    <p className="text-xs text-zinc-500">This usually takes 30-60 seconds</p>
                  </div>
                </>
              ) : deployStatus.status === 'ready' ? (
                <>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Deployed successfully!</p>
                    <p className="text-xs text-zinc-400">Your site is now live</p>
                  </div>
                  {deployStatus.url && (
                    <a
                      href={deployStatus.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-500/20 text-emerald-400 rounded-md hover:bg-emerald-500/30 transition-colors"
                    >
                      View Live
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => setDeployStatus({ status: null })}
                    className="text-zinc-500 hover:text-zinc-300 text-xs"
                  >
                    Dismiss
                  </button>
                </>
              ) : deployStatus.status === 'failed' ? (
                <>
                  <XCircle className="w-5 h-5 text-red-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      Deployment failed
                    </p>
                    <p className="text-xs text-red-400/80 mt-0.5">{deployStatus.error || 'Unknown error'}</p>
                  </div>
                  {deployStatus.logsUrl && (
                    <a
                      href={deployStatus.logsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-zinc-800 text-zinc-300 rounded-md hover:bg-zinc-700 transition-colors"
                    >
                      View Logs
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => setDeployStatus({ status: null })}
                    className="text-zinc-500 hover:text-zinc-300 text-xs"
                  >
                    Dismiss
                  </button>
                </>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                {project.status === 'deployed' ? (
                  <span className="text-emerald-400">Live</span>
                ) : project.deployed_slug ? (
                  <span className="text-amber-400">Deploy pending...</span>
                ) : project.status === 'complete' ? (
                  <span className="text-zinc-300">Ready</span>
                ) : (
                  <span className="text-zinc-500">Building</span>
                )}
              </div>
              {/* Show deployed URL or check status button */}
              {project.deployed_slug && (
                <div className="flex justify-between text-sm items-center">
                  <span className="text-zinc-500">Site</span>
                  {project.status === 'deployed' ? (
                    <a 
                      href={`https://${project.deployed_slug}.hatchit.dev`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      {project.deployed_slug}.hatchit.dev
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/deploy/status?slug=${project.deployed_slug}`)
                          const data = await res.json()
                          if (data.status === 'ready') {
                            // Confirm in DB
                            await fetch(`/api/project/${project.id}/confirm-deploy`, { method: 'POST' })
                            refresh()
                          } else if (data.status === 'failed') {
                            alert(`Deploy failed: ${data.error || 'Unknown error'}\n\nCheck Vercel logs for details.`)
                          } else {
                            alert('Still building... try again in a moment.')
                          }
                        } catch {
                          alert('Could not check status')
                        }
                      }}
                      className="text-amber-400 hover:text-amber-300 text-xs"
                    >
                      Check Status →
                    </button>
                  )}
                </div>
              )}
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

          {/* Logo Section */}
          <div className="border border-zinc-800/50 rounded-md p-4 bg-zinc-900/30">
            <h3 className="text-xs text-zinc-500 uppercase tracking-wide mb-4">Logo</h3>
            
            {/* Current Logo */}
            {brand.logoUrl && (
              <div className="mb-4 p-3 bg-zinc-800/30 rounded border border-zinc-700/30">
                <img 
                  src={brand.logoUrl} 
                  alt="Current logo" 
                  className="max-h-12 object-contain"
                />
                <button
                  onClick={() => setBrand(b => ({ ...b, logoUrl: '' }))}
                  className="text-[11px] text-zinc-500 hover:text-red-400 mt-2 transition-colors"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Upload Option */}
            <div className="space-y-3">
              <div>
                <label className="text-sm text-zinc-400 block mb-2">Upload Your Logo</label>
                <div className="border border-dashed border-zinc-700 rounded p-4 text-center">
                  <input
                    type="file"
                    accept=".svg,.png,.jpg,.jpeg,.webp"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      
                      // For now, convert to base64 data URL
                      // TODO: Upload to Supabase storage
                      setLogoUploading(true)
                      try {
                        const reader = new FileReader()
                        reader.onload = () => {
                          setBrand(b => ({ ...b, logoUrl: reader.result as string }))
                          setLogoUploading(false)
                        }
                        reader.readAsDataURL(file)
                      } catch {
                        setLogoUploading(false)
                      }
                    }}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label 
                    htmlFor="logo-upload" 
                    className="cursor-pointer text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    {logoUploading ? 'Uploading...' : 'Click to upload'}
                  </label>
                  <p className="text-[10px] text-zinc-600 mt-2">
                    SVG, PNG, JPG, or WebP. Max 2MB. Transparent background recommended.
                  </p>
                </div>
              </div>

              {/* How it's used */}
              <div className="text-[11px] text-zinc-600 space-y-1">
                <p className="text-zinc-500">Where your logo appears:</p>
                <ul className="list-disc list-inside space-y-0.5 pl-1">
                  <li>Header navigation (all pages)</li>
                  <li>Footer section</li>
                  <li>Open Graph / social share images</li>
                  <li>Favicon (if SVG or PNG)</li>
                </ul>
              </div>

              {/* AI Generation Coming Soon */}
              <div className="border-t border-zinc-800/50 pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-400">AI Logo Generation</p>
                    <p className="text-[10px] text-zinc-600">Generate a logo based on your brand</p>
                  </div>
                  <span className="text-[10px] text-zinc-600 px-2 py-1 bg-zinc-800/50 rounded">
                    Coming Soon
                  </span>
                </div>
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
        <div className="space-y-3">
          {/* Edit Content CTA */}
          <div className="border border-emerald-500/20 rounded-md p-4 bg-emerald-500/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-white">Edit Page Content</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Open the Builder to edit text, regenerate sections, or refine your design
                </p>
              </div>
              <Link
                href={`/builder?project=${project.id}`}
                className="px-4 py-2 text-sm font-medium bg-emerald-500 text-black rounded hover:bg-emerald-400 transition-colors"
              >
                Open Builder
              </Link>
            </div>
          </div>

          {/* Current Sections */}
          <div className="border border-zinc-800/50 rounded-md p-4 bg-zinc-900/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] text-zinc-500 uppercase tracking-wide">Sections</h3>
              <span className="text-[10px] text-zinc-600">{sections.length} total</span>
            </div>
            
            <div className="space-y-1">
              {sections.map((section, index) => {
                const info = SECTION_INFO[section.section_id] || { name: section.section_id, desc: '' }
                const isHeader = section.section_id === 'header'
                const isFooter = section.section_id === 'footer'
                const isBuilt = section.status === 'complete'
                const canMove = !isHeader && !isFooter
                const canDelete = canMove
                
                return (
                  <div
                    key={section.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded text-left transition-colors ${
                      isBuilt
                        ? 'bg-zinc-800/80 border border-zinc-700/50'
                        : 'bg-zinc-900/30 border border-transparent'
                    } ${(isHeader || isFooter) ? 'opacity-60' : ''}`}
                  >
                    {/* Order controls */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleMoveSection(index, 'up')}
                        disabled={!canMove || index === 0 || sections[index - 1]?.section_id === 'header'}
                        className="text-[9px] text-zinc-600 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleMoveSection(index, 'down')}
                        disabled={!canMove || index === sections.length - 1 || sections[index + 1]?.section_id === 'footer'}
                        className="text-[9px] text-zinc-600 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        ▼
                      </button>
                    </div>

                    {/* Section info */}
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs ${isBuilt ? 'text-white' : 'text-zinc-400'}`}>
                        {info.name}
                      </span>
                      <span className="text-[10px] text-zinc-600 ml-2">{info.desc}</span>
                    </div>

                    {/* Status */}
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                      isBuilt ? 'bg-emerald-500/20 text-emerald-400' :
                      section.status === 'building' ? 'bg-blue-500/20 text-blue-400' :
                      section.status === 'skipped' ? 'bg-zinc-500/20 text-zinc-400' :
                      'bg-zinc-800 text-zinc-500'
                    }`}>
                      {isBuilt ? 'built' : section.status}
                    </span>

                    {/* Pin label or delete */}
                    {isHeader && <span className="text-[9px] text-zinc-600 w-8 text-right">first</span>}
                    {isFooter && <span className="text-[9px] text-zinc-600 w-8 text-right">last</span>}
                    {canDelete && (
                      <button
                        onClick={() => handleDeleteSection(section.section_id)}
                        className="text-[9px] text-zinc-600 hover:text-red-400 w-8 text-right transition-colors"
                        title="Remove section"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Add Section */}
          <div className="border border-zinc-800/50 rounded-md p-4 bg-zinc-900/30">
            <h3 className="text-[10px] text-zinc-500 uppercase tracking-wide mb-3">Add Section</h3>
            <div className="flex gap-2">
              <select
                value=""
                onChange={(e) => e.target.value && handleAddSection(e.target.value)}
                className="flex-1 px-2 py-1.5 text-xs bg-zinc-800/50 border border-zinc-700/50 rounded text-zinc-200"
                title="Add a section"
              >
                <option value="">Select section to add...</option>
                {SECTION_TYPES.filter(type => 
                  type !== 'header' && 
                  type !== 'footer' && 
                  !sections.find(s => s.section_id === type)
                ).map(type => {
                  const info = SECTION_INFO[type] || { name: type, desc: '' }
                  return (
                    <option key={type} value={type}>
                      {info.name} — {info.desc}
                    </option>
                  )
                })}
              </select>
            </div>
            {sections.filter(s => s.section_id !== 'header' && s.section_id !== 'footer').length === SECTION_TYPES.length - 2 && (
              <p className="text-[10px] text-zinc-600 mt-2">All available sections added</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'deployments' && (
        <div className="space-y-6">
          {/* Current Deployment Status */}
          <div className="border border-zinc-800/50 rounded-md bg-zinc-900/30 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800/50">
              <h3 className="text-xs text-zinc-500 uppercase tracking-wide">Production</h3>
            </div>
            <div className="p-4">
              {project.status === 'deployed' && project.deployed_slug ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-sm text-emerald-400">Live</span>
                    </div>
                    <a
                      href={`https://${project.deployed_slug}.hatchit.dev`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-zinc-300 hover:text-white transition-colors"
                    >
                      {project.deployed_slug}.hatchit.dev
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  {latestBuild?.deployed_at && (
                    <p className="text-xs text-zinc-600">
                      Last deployed {formatDate(latestBuild.deployed_at)}
                    </p>
                  )}
                </div>
              ) : project.deployed_slug ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    <span className="text-sm text-amber-400">Deploy in progress</span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Target: {project.deployed_slug}.hatchit.dev
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-zinc-600 rounded-full" />
                  <span className="text-sm text-zinc-500">Not deployed</span>
                </div>
              )}
            </div>
          </div>

          {/* Deployment History */}
          <div className="border border-zinc-800/50 rounded-md bg-zinc-900/30 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800/50">
              <h3 className="text-xs text-zinc-500 uppercase tracking-wide">Deployment History</h3>
            </div>
            
            {builds.length === 0 ? (
              <div className="p-4">
                <p className="text-sm text-zinc-500">No builds yet</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/50">
                {builds.slice(0, 10).map((build, index) => {
                  const isLatest = index === 0
                  const deployStatus = build.deploy_status
                  const hasDeployment = build.deployed_url || build.deployment_id
                  
                  return (
                    <div key={build.id} className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono text-zinc-400">v{build.version}</span>
                          {isLatest && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded">
                              latest
                            </span>
                          )}
                          {/* Deploy status indicator */}
                          {hasDeployment && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                              deployStatus === 'ready' 
                                ? 'bg-emerald-500/20 text-emerald-400' 
                                : deployStatus === 'failed'
                                ? 'bg-red-500/20 text-red-400'
                                : deployStatus === 'building'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-zinc-800 text-zinc-500'
                            }`}>
                              {deployStatus === 'ready' ? 'deployed' : deployStatus || 'pending'}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-zinc-600 tabular-nums">
                          {formatDate(build.created_at)}
                        </span>
                      </div>
                      
                      {/* Deployment details for this build */}
                      {hasDeployment && (
                        <div className="mt-2 pl-[60px] space-y-1">
                          {build.deployed_url && (
                            <a
                              href={build.deployed_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
                            >
                              {build.deployed_url}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {build.deploy_error && (
                            <div className="text-xs text-red-400/80">
                              Error: {build.deploy_error}
                            </div>
                          )}
                          {build.deploy_logs_url && (
                            <a
                              href={build.deploy_logs_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                            >
                              View logs →
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Deploy from builder CTA */}
          {project.status !== 'deployed' && (
            <div className="border border-dashed border-zinc-700/50 rounded-md p-4 text-center">
              <p className="text-sm text-zinc-500 mb-3">
                Ready to go live? Deploy your site from the Builder.
              </p>
              <Link
                href={`/builder?project=${project.id}`}
                className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Open Builder →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
