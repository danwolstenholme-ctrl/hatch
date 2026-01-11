'use client'

/**
 * UNIFIED BUILDER
 * Single layout for authenticated users: Sidebar | Editor | Preview
 * No phases, no mode switching - build, refine, preview in one view
 * Dashboard-style professional design
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Rocket, 
  Download, 
  ExternalLink, 
  RefreshCw,
  Sparkles,
  ArrowRight,
  Globe,
  X,
  Check,
  Smartphone,
  Tablet,
  Monitor,
  Share2,
  Github
} from 'lucide-react'
import { track } from '@vercel/analytics'

import { Sidebar } from './index'
import SectionPreview from '../SectionPreview'
import FullSitePreviewFrame from './FullSitePreviewFrame'
import HatchModal from '../HatchModal'
import SiteSettingsModal, { SiteSettings } from '../SiteSettingsModal'
import { LogoMark } from '../Logo'

import { useGitHub } from '@/hooks/useGitHub'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { chronosphere } from '@/lib/chronosphere'
import { Template, Section, createInitialBuildState, BuildState, websiteTemplate } from '@/lib/templates'
import { DbProject, DbSection, DbBrandConfig } from '@/lib/supabase'
import { AccountSubscription } from '@/types/subscriptions'

// =============================================================================
// TYPES
// =============================================================================

interface UnifiedBuilderProps {
  project: DbProject
  sections: DbSection[]
  template: Template
  brandConfig: DbBrandConfig | null
  onProjectUpdate: (project: DbProject) => void
  onSectionsUpdate: (sections: DbSection[]) => void
}

// =============================================================================
// UNIFIED BUILDER COMPONENT
// =============================================================================

export default function UnifiedBuilder({
  project,
  sections: initialSections,
  template,
  brandConfig: initialBrandConfig,
  onProjectUpdate,
  onSectionsUpdate,
}: UnifiedBuilderProps) {
  const { user } = useUser()
  useSubscription() // For context subscription
  const router = useRouter()
  const github = useGitHub()

  // ==========================================================================
  // STATE
  // ==========================================================================
  
  const [sections, setSections] = useState<DbSection[]>(initialSections)
  const [brandConfig, setBrandConfig] = useState<DbBrandConfig | null>(initialBrandConfig)
  const [buildState, setBuildState] = useState<BuildState>(() => {
    const state = createInitialBuildState(template.id)
    initialSections.forEach((s) => {
      if (s.status === 'complete' && s.code) {
        state.completedSections.push(s.section_id)
        state.sectionCode[s.section_id] = s.code
      } else if (s.status === 'skipped') {
        state.skippedSections.push(s.section_id)
      }
    })
    const firstPending = initialSections.findIndex((s) => s.status === 'pending' || s.status === 'building')
    state.currentSectionIndex = firstPending === -1 ? 0 : firstPending
    return state
  })

  // UI State
  const [deviceView, setDeviceView] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showHatchModal, setShowHatchModal] = useState(false)
  const [hatchModalReason, setHatchModalReason] = useState<'deploy' | 'download' | 'proactive'>('proactive')
  const [error, setError] = useState<string | null>(null)

  // Build State
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRefining, setIsRefining] = useState(false)
  const [isHealing, setIsHealing] = useState(false)
  const [lastHealMessage, setLastHealMessage] = useState<string | null>(null)

  // Deploy State
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null)
  const [showDeployOptions, setShowDeployOptions] = useState(false)
  const [githubRepoName] = useState('')
  const [, setGithubPushResult] = useState<{
    success: boolean
    repoUrl?: string
    vercelImportUrl?: string
    error?: string
  } | null>(null)

  // ==========================================================================
  // COMPUTED
  // ==========================================================================

  const accountSubscription = user?.publicMetadata?.accountSubscription as AccountSubscription | null

  const canDeploy = useMemo(() => {
    return accountSubscription?.status === 'active' && 
      ['architect', 'visionary', 'singularity'].includes(accountSubscription.tier)
  }, [accountSubscription])

  const isProUser = useMemo(() => {
    return accountSubscription?.status === 'active' && 
      (accountSubscription.tier === 'visionary' || accountSubscription.tier === 'singularity')
  }, [accountSubscription])

  const orderedSections = useMemo(() => {
    return [...sections].sort((a, b) => a.order_index - b.order_index)
  }, [sections])

  const templateSections = useMemo(() => {
    return orderedSections.map((dbSec, index) => {
      const templateSection = template.sections.find(s => s.id === dbSec.section_id)
      return templateSection || {
        id: dbSec.section_id,
        name: dbSec.section_id,
        description: '',
        prompt: '',
        estimatedTime: '~30s',
        required: false,
        order: index + 1,
      }
    })
  }, [orderedSections, template.sections])

  const currentSection = useMemo(() => {
    return templateSections[buildState.currentSectionIndex] || null
  }, [templateSections, buildState.currentSectionIndex])

  const currentDbSection = useMemo(() => {
    if (!currentSection) return null
    return orderedSections.find(s => s.section_id === currentSection.id) || null
  }, [currentSection, orderedSections])

  const previewSections = useMemo(() => {
    return orderedSections
      .filter(s => s.status === 'complete' && s.code)
      .map(s => ({ id: s.section_id, code: s.code! }))
  }, [orderedSections])

  const hasCompletedSections = previewSections.length > 0

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleSelectSection = useCallback((index: number) => {
    setBuildState(prev => ({ ...prev, currentSectionIndex: index }))
  }, [])

  const handleMoveSection = useCallback(async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return

    const pinnedTopId = 'header'
    const pinnedBottomId = 'footer'
    const fromId = templateSections[fromIndex]?.id
    const toId = templateSections[toIndex]?.id
    const lastIndex = templateSections.length - 1

    // Prevent moving pinned sections
    if (fromId === pinnedTopId || fromId === pinnedBottomId) return
    if (toIndex === 0 || toIndex === lastIndex) return
    if (toId === pinnedTopId || toId === pinnedBottomId) return

    const newOrder = [...templateSections]
    const [moved] = newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, moved)

    // Update sections order
    const newSections = newOrder.map((sec, idx) => {
      const dbSec = orderedSections.find(s => s.section_id === sec.id)
      return dbSec ? { ...dbSec, order_index: idx } : null
    }).filter(Boolean) as DbSection[]

    setSections(newSections)
    onSectionsUpdate(newSections)

    // Persist to API
    try {
      await fetch(`/api/project/${project.id}/sections/order`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder.map(s => s.id) }),
      })
    } catch (err) {
      console.error('Failed to persist section order:', err)
    }
  }, [templateSections, orderedSections, project.id, onSectionsUpdate])

  const handleNextSection = useCallback(() => {
    const nextIndex = buildState.currentSectionIndex + 1
    if (nextIndex < templateSections.length) {
      setBuildState(prev => ({ ...prev, currentSectionIndex: nextIndex }))
    }
  }, [buildState.currentSectionIndex, templateSections.length])

  // SIMPLIFIED: Just takes code - no refinement tracking
  const handleSectionComplete = useCallback((code: string) => {
    if (!currentSection || !currentDbSection) return

    const alreadyCompleted = buildState.completedSections.includes(currentSection.id)
    const newState: BuildState = {
      ...buildState,
      completedSections: alreadyCompleted 
        ? buildState.completedSections 
        : [...buildState.completedSections, currentSection.id],
      sectionCode: { ...buildState.sectionCode, [currentSection.id]: code },
    }

    setBuildState(newState)

    // Update sections array
    const newSections = sections.map(s => 
      s.id === currentDbSection.id 
        ? { ...s, status: 'complete' as const, code }
        : s
    )
    setSections(newSections)
    onSectionsUpdate(newSections)
  }, [currentSection, currentDbSection, buildState, sections, onSectionsUpdate])

  const handleDeploy = useCallback(async () => {
    if (!project || isDeploying || !hasCompletedSections) return

    if (!canDeploy) {
      setHatchModalReason('deploy')
      setShowHatchModal(true)
      return
    }

    setIsDeploying(true)
    setError(null)

    try {
      // Process sections for deployment
      const processedSections = previewSections.map((section, index) => {
        let code = section.code
          .replace(/'use client';?/g, '')
          .replace(/"use client";?/g, '')
          .replace(/import\s+.*?from\s+['"][^'"]+['"];?\s*/g, '')

        if (code.includes('export default function')) {
          code = code.replace(/export\s+default\s+function\s+(\w+)?/, (_, name) => {
            return `const Section_${index} = function ${name || 'Component'}`
          })
        } else if (code.includes('export default')) {
          code = code.replace(/export\s+default\s+/, `const Section_${index} = `)
        }

        return { code, index }
      })

      // Extract Lucide icons
      const lucideIconRegex = /<([A-Z][a-zA-Z0-9]*)\s/g
      const potentialIcons = new Set<string>()
      const fullSource = previewSections.map(s => s.code).join('\n')
      // Non-icon component names to filter out
      const nonIconComponents = [
        'AnimatePresence', 'Image', 'Link', 'Component', 'Fragment',
        'Icon', 'Icons', 'Button', 'Card', 'Section', 'Header', 'Footer',
        'Nav', 'Main', 'Div', 'Span', 'Container', 'Wrapper', 'Box',
        'Text', 'Title', 'Input', 'Form', 'Label', 'Modal', 'Dialog'
      ]
      let match
      while ((match = lucideIconRegex.exec(fullSource)) !== null) {
        const name = match[1]
        if (!nonIconComponents.includes(name)) {
          potentialIcons.add(name)
        }
      }

      const lucideImports = potentialIcons.size > 0 
        ? `import { ${Array.from(potentialIcons).join(', ')} } from 'lucide-react'\n`
        : ''

      const wrappedCode = `'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
${lucideImports}

${processedSections.map(s => s.code).join('\n\n')}

export default function GeneratedPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      ${processedSections.map(s => `<Section_${s.index} />`).join('\n      ')}
    </main>
  )
}`

      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: wrappedCode, projectName: project.name }),
      })

      const data = await response.json()

      if (data.url) {
        // Poll for readiness
        await new Promise(r => setTimeout(r, 8000))
        setDeployedUrl(data.url)
      } else {
        setError(data.error || 'Deploy failed')
      }
    } catch (err) {
      console.error('Deploy failed:', err)
      setError('Deploy failed. Please try again.')
    } finally {
      setIsDeploying(false)
    }
  }, [project, isDeploying, hasCompletedSections, canDeploy, previewSections])

  const handleDownload = useCallback(async () => {
    if (!project || !hasCompletedSections) return

    if (!isProUser) {
      setHatchModalReason('download')
      setShowHatchModal(true)
      return
    }

    // Similar logic to deploy but for export
    try {
      const processedSections = previewSections.map((section, index) => {
        let code = section.code
          .replace(/'use client';?/g, '')
          .replace(/"use client";?/g, '')
          .replace(/import\s+.*?from\s+['"][^'"]+['"];?\s*/g, '')

        if (code.includes('export default function')) {
          code = code.replace(/export\s+default\s+function\s+(\w+)?/, (_, name) => {
            return `const Section_${index} = function ${name || 'Component'}`
          })
        } else if (code.includes('export default')) {
          code = code.replace(/export\s+default\s+/, `const Section_${index} = `)
        }

        return { code, index }
      })

      const lucideIconRegex = /<([A-Z][a-zA-Z0-9]*)\s/g
      const potentialIcons = new Set<string>()
      const fullSource = previewSections.map(s => s.code).join('\n')
      let match
      while ((match = lucideIconRegex.exec(fullSource)) !== null) {
        const name = match[1]
        if (!['AnimatePresence', 'Image', 'Link', 'Component', 'Fragment'].includes(name)) {
          potentialIcons.add(name)
        }
      }

      const lucideImports = potentialIcons.size > 0 
        ? `import { ${Array.from(potentialIcons).join(', ')} } from 'lucide-react'\n`
        : ''

      const wrappedCode = `'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
${lucideImports}

${processedSections.map(s => s.code).join('\n\n')}

export default function GeneratedPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      ${processedSections.map(s => `<Section_${s.index} />`).join('\n      ')}
    </main>
  )
}`

      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: wrappedCode,
          projectSlug: project.slug || project.id,
          assets: []
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${project.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.zip`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const data = await response.json()
        setError(data.error || 'Download failed')
      }
    } catch (err) {
      console.error('Download failed:', err)
      setError('Download failed. Please try again.')
    }
  }, [project, hasCompletedSections, isProUser, previewSections])

  const handleGitHubPush = useCallback(async () => {
    if (!hasCompletedSections) return

    if (!github.connected) {
      github.connect()
      return
    }

    const defaultName = project?.name?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'hatchit-site'
    const assembledCode = previewSections.map(s => s.code).join('\n\n')
    
    // Build project config from brand settings
    const brandConfig = project?.brand_config as Record<string, unknown> | null
    const colors = brandConfig?.colors as { primary?: string; secondary?: string } | undefined
    
    const projectConfig = {
      name: project?.name || 'My HatchIt Site',
      brand: {
        primaryColor: colors?.primary || '#10b981',
        secondaryColor: colors?.secondary || '#059669',
        font: (brandConfig?.fontStyle as string) || 'Inter',
        headingFont: (brandConfig?.fontStyle as string) || 'Inter',
        mode: (brandConfig?.styleVibe === 'light' ? 'light' : 'dark') as 'dark' | 'light',
      },
      seo: {
        title: project?.name || 'My HatchIt Site',
        description: `Generated with HatchIt - ${new Date().toLocaleDateString()}`,
      }
    }

    const result = await github.push(
      githubRepoName || defaultName,
      assembledCode,
      undefined,
      { 
        description: `Generated with HatchIt - ${new Date().toLocaleDateString()}`,
        projectConfig 
      }
    )

    setGithubPushResult(result)

    if (result.success) {
      track('GitHub Push Success', { repoName: result.repoName })
    } else if (result.requiresAuth) {
      github.connect()
    }
  }, [hasCompletedSections, github, project?.name, project?.brand_config, previewSections, githubRepoName])

  const handleSaveSettings = useCallback(async (settings: SiteSettings) => {
    if (!project) return

    try {
      const response = await fetch(`/api/project/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandConfig: {
            ...(project.brand_config || {}),
            colors: {
              primary: settings.brand.primaryColor,
              secondary: '#000000',
              accent: settings.brand.primaryColor
            },
            fontStyle: settings.brand.font,
            brandName: settings.seo.title || project.name,
            styleVibe: settings.brand.mode,
            seo: settings.seo,
            integrations: settings.integrations
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        onProjectUpdate(data.project)
        setBrandConfig(data.project.brand_config)
      }
    } catch (err) {
      console.error('Error saving settings:', err)
    }
  }, [project, onProjectUpdate])

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-white overflow-hidden">
      {/* Header - Minimal */}
      <header className="flex-shrink-0 border-b border-zinc-800/50 bg-zinc-950">
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-zinc-500 hover:text-white transition-colors flex items-center gap-1.5 text-sm"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="flex items-center gap-2">
              <LogoMark size={20} />
              <h1 className="text-sm font-medium text-white truncate max-w-[180px]">
                {project.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Device Toggle */}
            <div className="hidden md:flex items-center bg-zinc-900 rounded-lg p-0.5 border border-zinc-800/50">
              {(['mobile', 'tablet', 'desktop'] as const).map((device) => (
                <button
                  key={device}
                  onClick={() => setDeviceView(device)}
                  className={`p-1.5 rounded transition-all ${
                    deviceView === device
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-600 hover:text-zinc-400'
                  }`}
                >
                  {device === 'mobile' ? <Smartphone className="w-3.5 h-3.5" /> : 
                   device === 'tablet' ? <Tablet className="w-3.5 h-3.5" /> : 
                   <Monitor className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>

            {/* Ship */}
            {deployedUrl ? (
              <a
                href={deployedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/15 transition-colors flex items-center gap-2"
              >
                <Globe className="w-3.5 h-3.5" />
                Live
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowDeployOptions(!showDeployOptions)}
                  disabled={!hasCompletedSections}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/40 hover:bg-emerald-500/20 text-white"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  Ship
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {showDeployOptions && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowDeployOptions(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden"
                      >
                        <div className="p-1.5 space-y-0.5">
                          <button
                            onClick={() => { setShowDeployOptions(false); handleGitHubPush() }}
                            disabled={github.pushing}
                            className="w-full flex items-center gap-3 p-2.5 hover:bg-zinc-800 rounded-lg transition-colors text-left"
                          >
                            <Github className="w-4 h-4 text-white" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-white">
                                {github.connected ? 'Push to GitHub' : 'Connect GitHub'}
                              </p>
                              <p className="text-[10px] text-zinc-500">
                                {github.connected ? `@${github.username}` : 'Your code'}
                              </p>
                            </div>
                          </button>

                          <button
                            onClick={() => { setShowDeployOptions(false); handleDeploy() }}
                            disabled={isDeploying}
                            className="w-full flex items-center gap-3 p-2.5 hover:bg-zinc-800 rounded-lg transition-colors text-left"
                          >
                            <Rocket className="w-4 h-4 text-emerald-400" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-white">Deploy</p>
                              <p className="text-[10px] text-zinc-500">hatchit.dev</p>
                            </div>
                          </button>

                          <button
                            onClick={() => { setShowDeployOptions(false); handleDownload() }}
                            className="w-full flex items-center gap-3 p-2.5 hover:bg-zinc-800 rounded-lg transition-colors text-left"
                          >
                            <Download className="w-4 h-4 text-zinc-400" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-white">Download</p>
                              <p className="text-[10px] text-zinc-500">ZIP file</p>
                            </div>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 pb-2">
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 flex items-center gap-2">
              {error}
              <button onClick={() => setError(null)} className="ml-auto text-red-400/60 hover:text-red-400" aria-label="Dismiss error">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content - Three Column Layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden lg:flex w-64 flex-col border-r border-zinc-800/50 bg-zinc-950 overflow-y-auto">
          <Sidebar
            userTier={(accountSubscription?.status === 'active' ? accountSubscription?.tier : 'free') as 'free' | 'architect' | 'visionary' | 'singularity'}
            projectName={project.name}
            currentSection={buildState.currentSectionIndex + 1}
            totalSections={templateSections.length}
            sectionNames={templateSections.map(s => s.name)}
            sectionIds={templateSections.map(s => s.id)}
            isGenerating={isGenerating}
            isHealing={isHealing}
            lastHealMessage={lastHealMessage ?? undefined}
            onAddSection={handleNextSection}
            onSelectSection={handleSelectSection}
            onMoveSection={handleMoveSection}
            onOpenHatch={() => {}}
            onOpenReplicator={() => {}}
            onRunAudit={() => {}}
            onDeploy={handleDeploy}
            onExport={handleDownload}
            onAddPage={() => {}}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </div>

        {/* Editor Panel */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-zinc-800/50">
          {/* Section Header */}
          <div className="flex-shrink-0 px-5 py-3 border-b border-zinc-800/50 bg-zinc-950">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-white">
                  {currentSection?.name || 'Section'}
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {currentSection?.description || 'Describe what you want'}
                </p>
              </div>
              <span className="text-[10px] text-zinc-600 bg-zinc-900 px-2 py-1 rounded">
                {buildState.currentSectionIndex + 1}/{templateSections.length}
              </span>
            </div>
          </div>

          {/* Section Builder Content */}
          <div className="flex-1 overflow-auto">
            {currentSection && currentDbSection && (
              <SectionBuilderInline
                section={currentSection}
                dbSection={currentDbSection}
                projectId={project.id}
                brandConfig={brandConfig}
                onComplete={handleSectionComplete}
                onNextSection={handleNextSection}
                isLastSection={buildState.currentSectionIndex >= templateSections.length - 1}
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
                isRefining={isRefining}
                setIsRefining={setIsRefining}
                onHealingStateChange={(healing, message) => {
                  setIsHealing(healing)
                  if (message) setLastHealMessage(message)
                }}
              />
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="hidden md:flex flex-1 flex-col min-w-0 bg-zinc-950">
          {/* Preview Header */}
          <div className="flex-shrink-0 px-4 py-2.5 border-b border-zinc-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Preview</span>
            </div>
            {hasCompletedSections && (
              <span className="text-[10px] text-zinc-600">
                {previewSections.length} section{previewSections.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-auto p-3">
            {hasCompletedSections ? (
              <div className={`h-full mx-auto transition-all duration-300 ${
                deviceView === 'mobile' ? 'max-w-[375px]' : 
                deviceView === 'tablet' ? 'max-w-[768px]' : 
                'max-w-full'
              }`}>
                <div className={`h-full bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800/50 ${
                  deviceView !== 'desktop' ? 'border-2' : ''
                }`}>
                  <FullSitePreviewFrame 
                    sections={previewSections} 
                    deviceView={deviceView}
                    seo={brandConfig?.seo ? {
                      title: brandConfig.seo.title || '',
                      description: brandConfig.seo.description || '',
                      keywords: brandConfig.seo.keywords || ''
                    } : undefined}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-5 h-5 text-zinc-700" />
                  </div>
                  <p className="text-xs text-zinc-600">Build sections to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <HatchModal
        isOpen={showHatchModal}
        onClose={() => setShowHatchModal(false)}
        reason={hatchModalReason}
      />

      <SiteSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        projectId={project.id}
        currentBrand={project.brand_config || undefined}
        onSave={handleSaveSettings}
        projectName={project.name}
      />

      {/* Deploy Success Modal */}
      <AnimatePresence>
        {deployedUrl && (
          <DeploySuccessModal
            url={deployedUrl}
            onClose={() => setDeployedUrl(null)}
            onGitHubPush={handleGitHubPush}
            github={github}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// =============================================================================
// INLINE SECTION BUILDER
// Simplified section building component
// =============================================================================

interface SectionBuilderInlineProps {
  section: Section
  dbSection: DbSection
  projectId: string
  brandConfig: DbBrandConfig | null
  onComplete: (code: string, refined: boolean, refinementChanges?: string[]) => void
  onNextSection: () => void
  isLastSection: boolean
  isGenerating: boolean
  setIsGenerating: (v: boolean) => void
  isRefining: boolean
  setIsRefining: (v: boolean) => void
  onHealingStateChange?: (isHealing: boolean, message?: string) => void
}

function SectionBuilderInline({
  section,
  dbSection,
  projectId,
  brandConfig,
  onComplete,
  onNextSection,
  isLastSection,
  isGenerating,
  setIsGenerating,
  isRefining,
  setIsRefining,
  onHealingStateChange,
}: SectionBuilderInlineProps) {
  const [prompt, setPrompt] = useState(dbSection.user_prompt || '')
  const [code, setCode] = useState(dbSection.code || '')
  const [refinePrompt, setRefinePrompt] = useState('')
  const [error, setError] = useState<string | null>(null)

  const hasCode = !!code
  const isComplete = dbSection.status === 'complete'

  // Reset state when section changes
  useEffect(() => {
    setPrompt(dbSection.user_prompt || '')
    setCode(dbSection.code || '')
    setRefinePrompt('')
    setError(null)
  }, [dbSection.id])

  const handleBuild = async () => {
    if (!prompt.trim() || isGenerating) return

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/build-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          sectionId: section.id,
          prompt: prompt.trim(),
          brandConfig,
        }),
      })

      if (!response.ok) {
        throw new Error('Build failed')
      }

      const data = await response.json()
      const newCode = data.code || ''
      setCode(newCode)
      onComplete(newCode, false)
    } catch (err) {
      console.error('Build error:', err)
      setError('Build failed. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRefine = async () => {
    if (!refinePrompt.trim() || isRefining || !code) return

    setIsRefining(true)
    setError(null)

    try {
      const response = await fetch('/api/refine-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          sectionId: section.id,
          currentCode: code,
          refinement: refinePrompt.trim(),
          brandConfig,
        }),
      })

      if (!response.ok) {
        throw new Error('Refine failed')
      }

      const data = await response.json()
      const newCode = data.code || ''
      setCode(newCode)
      setRefinePrompt('')
      onComplete(newCode, true, [refinePrompt.trim()])
    } catch (err) {
      console.error('Refine error:', err)
      setError('Refine failed. Please try again.')
    } finally {
      setIsRefining(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Preview Area */}
      <div className="flex-1 overflow-auto bg-zinc-950">
        {hasCode ? (
          <div className="h-full">
            <SectionPreview
              code={code}
              onRuntimeError={(err) => {
                console.error('Runtime error:', err)
                onHealingStateChange?.(true, 'Fixing issue...')
              }}
            />
          </div>
        ) : isGenerating ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-10 h-10 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 mx-auto mb-3"
              />
              <p className="text-xs text-zinc-500">Building {section.name}...</p>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-6">
            <div className="text-center max-w-sm">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                <Sparkles className="w-6 h-6 text-zinc-600" />
              </div>
              <h3 className="text-sm font-medium text-white mb-1">
                {section.name}
              </h3>
              <p className="text-xs text-zinc-500">
                {section.prompt || 'Describe what you want'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="flex-shrink-0 p-4 border-t border-zinc-800/50 bg-zinc-950">
        {error && (
          <div className="mb-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {!hasCode ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBuild()}
              disabled={isGenerating}
              placeholder={section.prompt || "Describe what you want..."}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
            />
            <button
              onClick={handleBuild}
              disabled={!prompt.trim() || isGenerating}
              className="px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 hover:bg-emerald-500/20 text-white text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Build'}
              {!isGenerating && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={refinePrompt}
              onChange={(e) => setRefinePrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
              disabled={isRefining}
              placeholder="What should change?"
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
            />
            <button
              onClick={handleRefine}
              disabled={!refinePrompt.trim() || isRefining}
              className="px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isRefining ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Refine'}
            </button>
            <button
              onClick={onNextSection}
              className="px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 hover:bg-emerald-500/20 text-white text-sm font-medium transition-all flex items-center gap-2"
            >
              {isLastSection ? 'Done' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// DEPLOY SUCCESS MODAL
// =============================================================================

interface DeploySuccessModalProps {
  url: string
  onClose: () => void
  onGitHubPush: () => void
  github: ReturnType<typeof useGitHub>
}

function DeploySuccessModal({ url, onClose, onGitHubPush, github }: DeploySuccessModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-1">Shipped</h2>
          <p className="text-sm text-zinc-500 mb-5">Your site is live</p>

          <button
            onClick={handleCopy}
            className="w-full px-5 py-3 bg-emerald-500/15 border border-emerald-500/40 hover:bg-emerald-500/20 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2 mb-3"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy Link'}
          </button>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <Globe className="w-4 h-4" />
            View Site
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="mt-3 p-2.5 bg-zinc-900/50 rounded-lg">
            <code className="text-[10px] text-zinc-500 break-all">{url}</code>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-zinc-800">
          <button
            onClick={() => { onClose(); onGitHubPush() }}
            disabled={github.pushing}
            className="w-full flex items-center gap-3 p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors text-left"
          >
            <Github className="w-5 h-5 text-white" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">
                {github.connected ? 'Push to GitHub' : 'Connect GitHub'}
              </p>
              <p className="text-[10px] text-zinc-500">Full Next.js project with your brand tokens</p>
            </div>
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
