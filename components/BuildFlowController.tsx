'use client'

/* eslint-disable react/no-unescaped-entities */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Layers, 
  Box, 
  Cpu, 
  Smartphone, 
  Tablet, 
  Monitor, 
  ArrowLeft, 
  Globe, 
  Rocket, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Home,
  Layout,
  Maximize2,
  Minimize2,
  Share2,
  Edit3,
  Plus,
  Terminal,
  ArrowRight,
  Copy
} from 'lucide-react'
import TemplateSelector from './TemplateSelector'
import BrandingStep, { BrandConfig } from './BrandingStep'
import SectionProgress from './SectionProgress'
import SectionBuilder from './SectionBuilder'
import HatchModal from './HatchModal'
import { Template, Section, getTemplateById, getSectionById, createInitialBuildState, BuildState } from '@/lib/templates'
import { DbProject, DbSection } from '@/lib/supabase'
import { AccountSubscription } from '@/types/subscriptions'

// =============================================================================
// FULL SITE PREVIEW FRAME
// Renders all assembled sections in an iframe
// =============================================================================

function FullSitePreviewFrame({ code, deviceView }: { code: string; deviceView: 'mobile' | 'tablet' | 'desktop' }) {
  const srcDoc = useMemo(() => {
    if (!code) return ''

    const hooksDestructure = `const { useState, useEffect, useMemo, useCallback, useRef, Fragment } = React;`

    let cleanedCode = code
      .replace(/export\s+default\s+/g, '')
      .replace(/export\s+/g, '')
      .replace(/import\s+.*?from\s+['"].*?['"]\s*;?/g, '')
      .replace(/React\.useState/g, 'useState')
      .replace(/React\.useEffect/g, 'useEffect')
      .replace(/React\.useMemo/g, 'useMemo')
      .replace(/React\.useCallback/g, 'useCallback')
      .replace(/React\.useRef/g, 'useRef')
      .replace(/React\.Fragment/g, 'Fragment')

    // Wrap all sections in a single component
    cleanedCode = `function GeneratedPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      ${cleanedCode}
    </main>
  )
}`

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            zinc: {
              950: '#09090b',
              900: '#18181b',
              800: '#27272a',
              700: '#3f3f46',
              600: '#52525b',
              500: '#71717a',
              400: '#a1a1aa',
              300: '#d4d4d8',
              200: '#e4e4e7',
              100: '#f4f4f5',
            }
          }
        }
      }
    }
  </script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    html, body, #root { min-height: 100%; width: 100%; }
    body { background: #09090b; color: #ffffff; }
    .error-display { color: #f87171; padding: 2rem; font-family: ui-monospace, monospace; font-size: 0.75rem; white-space: pre-wrap; background: #18181b; border-radius: 0.5rem; margin: 1rem; }
  </style>
</head>
<body class="dark">
  <div id="root"></div>
  
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/framer-motion@11/dist/framer-motion.js"></script>
  <script src="https://unpkg.com/lucide-react@0.294.0/dist/umd/lucide-react.js"></script>
  
  <script>
    window.motion = window.Motion?.motion || { div: 'div', span: 'span', button: 'button', a: 'a', p: 'p', h1: 'h1', h2: 'h2', h3: 'h3', section: 'section', nav: 'nav', ul: 'ul', li: 'li', img: 'img', form: 'form', input: 'input' };
    window.AnimatePresence = window.Motion?.AnimatePresence || function(p) { return p.children; };
    window.useInView = window.Motion?.useInView || function() { return true; };
    window.useScroll = window.Motion?.useScroll || function() { return { scrollY: 0, scrollYProgress: 0 }; };
    window.useTransform = window.Motion?.useTransform || function(v) { return v; };
    window.useMotionValue = window.Motion?.useMotionValue || function(v) { return { get: () => v, set: () => {} }; };
    window.useSpring = window.Motion?.useSpring || function(v) { return v; };
    window.useAnimation = window.Motion?.useAnimation || function() { return { start: () => {}, stop: () => {} }; };
    
    window.LucideIcons = window.lucideReact || {};
    if (!window.LucideIcons || Object.keys(window.LucideIcons).length === 0) {
      window.LucideIcons = new Proxy({}, { get: () => () => null });
    }
  </script>
  
  <script type="text/babel" data-presets="react,typescript">
    ${hooksDestructure}
    
    const motion = window.motion;
    const AnimatePresence = window.AnimatePresence;
    const useInView = window.useInView;
    const useScroll = window.useScroll;
    const useTransform = window.useTransform;
    const useMotionValue = window.useMotionValue;
    const useSpring = window.useSpring;
    const useAnimation = window.useAnimation;
    
    const { Menu, X, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, ArrowRight, ArrowLeft, Check, CheckCircle, CheckCircle2, Star, Heart, Mail, Phone, MapPin, Github, Twitter, Linkedin, Instagram, Facebook, Youtube, ExternalLink, Search, User, Users, Settings, Home, Plus, Minus, Edit, Trash, Copy, Download, Upload, Share, Send, Bell, Calendar, Clock, Globe, Lock, Unlock, Eye, EyeOff, Filter, Grid, List, MoreHorizontal, MoreVertical, RefreshCw, RotateCcw, Save, Zap, Award, Target, TrendingUp, BarChart, PieChart, Activity, Layers, Box, Package, Cpu, Database, Server, Cloud, Code, Terminal, FileText, Folder, Image, Video, Music, Headphones, Mic, Camera, Bookmark, Tag, AlertCircle, Info, HelpCircle, Loader, Link, MessageCircle, Building, Briefcase, Shield } = window.LucideIcons || {};
    
    ${cleanedCode}
    
    try {
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(<GeneratedPage />);
    } catch (err) {
      document.getElementById('root').innerHTML = '<div class="error-display">Render Error: ' + err.message + '</div>';
    }
  </script>
</body>
</html>`
  }, [code])

  if (!code) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Layers className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-lg font-mono font-semibold text-zinc-400 mb-2">System Initializing</h3>
          <p className="text-sm text-zinc-600 font-mono">Awaiting architectural components...</p>
        </div>
      </div>
    )
  }

  return (
    <iframe
      srcDoc={srcDoc}
      className="w-full border-0"
      style={{ height: deviceView === 'desktop' ? '100%' : 'calc(100% - 24px)' }}
      sandbox="allow-scripts"
      title="Full Site Preview"
    />
  )
}

// =============================================================================
// BUILD FLOW CONTROLLER
// Orchestrates the entire V3.0 build experience
// =============================================================================

type BuildPhase = 'select' | 'branding' | 'building' | 'review'

interface BuildFlowControllerProps {
  existingProjectId?: string
  demoMode?: boolean
}

const generateId = () => Math.random().toString(36).substring(2, 15)

export default function BuildFlowController({ existingProjectId, demoMode: forceDemoMode }: BuildFlowControllerProps) {
  const { user, isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  
  const [demoMode, setDemoMode] = useState(forceDemoMode ?? false)
  const [phase, setPhase] = useState<BuildPhase>('select')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [customizedSections, setCustomizedSections] = useState<Section[] | null>(null)
  const [brandConfig, setBrandConfig] = useState<BrandConfig | null>(null)
  const [buildState, setBuildState] = useState<BuildState | null>(null)
  const [project, setProject] = useState<DbProject | null>(null)
  const [dbSections, setDbSections] = useState<DbSection[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuditRunning, setIsAuditRunning] = useState(false)
  const [showHatchModal, setShowHatchModal] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null)
  const [reviewDeviceView, setReviewDeviceView] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null)
  const [justCreatedProjectId, setJustCreatedProjectId] = useState<string | null>(null)

  // Get account subscription from user metadata
  const accountSubscription = useMemo(() => {
    return user?.publicMetadata?.accountSubscription as AccountSubscription | null
  }, [user?.publicMetadata?.accountSubscription])

  // Check if user has an active account subscription (Pro or Agency)
  const isPaidUser = useMemo(() => {
    return accountSubscription?.status === 'active'
  }, [accountSubscription])

  // Check if project is paid (hatched) - now based on account subscription
  const isPaid = isPaidUser

  // The canonical section list for the build (must match the DB sections order/selection)
  const sectionsForBuild = useMemo(() => {
    if (!selectedTemplate) return [] as Section[]
    return customizedSections && customizedSections.length > 0
      ? customizedSections
      : selectedTemplate.sections
  }, [customizedSections, selectedTemplate])

  const templateForBuild = useMemo(() => {
    if (!selectedTemplate) return null
    return { ...selectedTemplate, sections: sectionsForBuild }
  }, [selectedTemplate, sectionsForBuild])

  // Track if we're in the middle of creating a project to prevent reload
  const [isCreatingProject, setIsCreatingProject] = useState(false)

  // Check for existing project on mount (from URL or localStorage)
  // Intentionally omits phase/loadExistingProject/forceDemoMode from deps to avoid re-running
  useEffect(() => {
    // Skip if we're currently creating a project
    if (isCreatingProject) {
      return
    }
    
    // Skip if we just created this project - don't reload it
    if (existingProjectId && existingProjectId === justCreatedProjectId) {
      return
    }
    
    // Skip if we're already past the select phase (user is actively building)
    if (phase !== 'select') {
      return
    }
    
    if (existingProjectId) {
      loadExistingProject(existingProjectId)
    } else {
      // Check localStorage for in-progress project
      const savedProjectId = localStorage.getItem('hatch_current_project')
      if (savedProjectId && !forceDemoMode) {
        loadExistingProject(savedProjectId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingProjectId, justCreatedProjectId, isCreatingProject])

  const loadExistingProject = async (projectId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/project/${projectId}`)
      
      // Handle 403 (not your project) or 404 (doesn't exist) gracefully
      if (response.status === 403 || response.status === 404) {
        console.log('Project not found or not owned by user, starting fresh')
        localStorage.removeItem('hatch_current_project')
        // Clear the URL parameter to prevent infinite reload loop
        router.replace('/builder', { scroll: false })
        setIsLoading(false)
        setPhase('select')
        return
      }
      
      if (!response.ok) throw new Error('Failed to load project')
      
      const { project: proj, sections } = await response.json()
      
      const template = getTemplateById(proj.template_id)
      if (!template) throw new Error('Unknown template')

      setProject(proj)
      setDbSections(sections)
      setSelectedTemplate(template)

      // Reconstruct the exact section sequence from DB order_index.
      // This prevents blank screens when the user customized sections during template selection.
      const orderedDbSections = [...sections].sort((a: DbSection, b: DbSection) => a.order_index - b.order_index)
      const reconstructed = orderedDbSections.map((s: DbSection, index: number): Section => {
        const def = getSectionById(template, s.section_id)
        if (def) return def
        return {
          id: s.section_id,
          name: s.section_id,
          description: '',
          prompt: 'Describe what you want for this section.',
          estimatedTime: '~30s',
          required: false,
          order: index + 1,
        }
      })
      setCustomizedSections(reconstructed)
      
      // Restore brand config from project!
      if (proj.brand_config) {
        setBrandConfig(proj.brand_config)
      }
      
      const state = createInitialBuildState(template.id)
      sections.forEach((s: DbSection) => {
        if (s.status === 'complete') {
          state.completedSections.push(s.section_id)
          if (s.code) state.sectionCode[s.section_id] = s.code
          if (s.refined) state.sectionRefined[s.section_id] = true
          if (s.refinement_changes) state.sectionChanges[s.section_id] = s.refinement_changes
        } else if (s.status === 'skipped') {
          state.skippedSections.push(s.section_id)
        }
      })
      
      const firstPending = sections.findIndex((s: DbSection) => s.status === 'pending' || s.status === 'building')
      state.currentSectionIndex = firstPending === -1 ? reconstructed.length : firstPending
      
      setBuildState(state)
      
      const allDone = sections.every((s: DbSection) => s.status === 'complete' || s.status === 'skipped')
      setPhase(allDone ? 'review' : 'building')
      
    } catch (err) {
      console.error('Error loading project:', err)
      setError('Failed to load project')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTemplateSelect = async (template: Template, customizedSections?: Section[]) => {
    // Store template and sections, move to branding phase
    setSelectedTemplate(template)
    setCustomizedSections(customizedSections || template.sections)
    setPhase('branding')
  }

  const handleBrandingComplete = async (brand: BrandConfig) => {
    if (!selectedTemplate) return
    
    setBrandConfig(brand)
    const sections = customizedSections || selectedTemplate.sections
    
    const setupDemoMode = () => {
      const mockProjectId = generateId()
      
      const mockProject: DbProject = {
        id: mockProjectId,
        user_id: 'demo-user',
        name: brand.brandName || `${selectedTemplate.name} - ${new Date().toLocaleDateString()}`,
        slug: `demo-${mockProjectId}`,
        template_id: selectedTemplate.id,
        status: 'building',
        brand_config: brand, // Include brand config in mock project
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      const mockSections: DbSection[] = sections.map((s, index) => ({
        id: generateId(),
        project_id: mockProjectId,
        section_id: s.id,
        code: null,
        user_prompt: null,
        refined: false,
        refinement_changes: null,
        status: 'pending' as const,
        order_index: index,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))
      
      setProject(mockProject)
      setDbSections(mockSections)
      setBuildState(createInitialBuildState(selectedTemplate.id))
      setPhase('building')
      setDemoMode(true)
      setIsCreatingProject(false)
      setIsLoading(false)
    }
    
    if (demoMode || forceDemoMode) {
      setupDemoMode()
      return
    }

    // If Clerk is still loading, don't silently fall back to demo mode.
    // This is a common source of “stuck” behavior where progress isn't persisted.
    if (!isLoaded) {
      setError('Loading your account… please try again in a moment.')
      setIsCreatingProject(false)
      setIsLoading(false)
      return
    }

    // Signed out users can still use the demo flow.
    if (!isSignedIn || !user) {
      setupDemoMode()
      return
    }

    setIsLoading(true)
    setIsCreatingProject(true)
    setError(null)

    try {
      const response = await fetch('/api/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          name: brand.brandName || `${selectedTemplate.name} - ${new Date().toLocaleDateString()}`,
          sections: sections,
          brand: brand,
        }),
      })

      if (!response.ok) {
        console.warn('API failed, falling back to demo mode')
        setupDemoMode()
        return
      }

      const { project: newProject, sections: dbSectionsData } = await response.json()

      setProject(newProject)
      setDbSections(dbSectionsData)
      setBuildState(createInitialBuildState(selectedTemplate.id))
      setPhase('building')
      
      // Mark this project as just created so we don't reload it when URL changes
      setJustCreatedProjectId(newProject.id)
      
      // Persist project ID in URL and localStorage
      router.replace(`/builder?project=${newProject.id}`, { scroll: false })
      localStorage.setItem('hatch_current_project', newProject.id)

    } catch (err) {
      console.error('Error creating project:', err)
      console.warn('Falling back to demo mode')
      setupDemoMode()
    } finally {
      setIsLoading(false)
      setIsCreatingProject(false)
    }
  }

  const getCurrentSection = useCallback((): Section | null => {
    if (!buildState) return null
    return sectionsForBuild[buildState.currentSectionIndex] || null
  }, [buildState, sectionsForBuild])

  const getCurrentDbSection = useCallback((): DbSection | null => {
    const section = getCurrentSection()
    if (!section) return null
    return dbSections.find(s => s.section_id === section.id) || null
  }, [getCurrentSection, dbSections])

  const handleSectionComplete = async (
    code: string,
    refined: boolean,
    refinementChanges?: string[]
  ) => {
    if (!buildState) return

    const currentSection = getCurrentSection()
    const dbSection = getCurrentDbSection()
    if (!currentSection || !dbSection) return

    // Save completion state but DON'T auto-advance - let user review first
    const newState: BuildState = {
      ...buildState,
      completedSections: [...buildState.completedSections, currentSection.id],
      sectionCode: { ...buildState.sectionCode, [currentSection.id]: code },
      sectionRefined: { ...buildState.sectionRefined, [currentSection.id]: refined },
      sectionChanges: refinementChanges 
        ? { ...buildState.sectionChanges, [currentSection.id]: refinementChanges }
        : buildState.sectionChanges,
      // DON'T auto-increment: currentSectionIndex stays the same
      // User clicks "Next Section" to advance via handleNextSection
    }

    setDbSections(prev => 
      prev.map(s => 
        s.id === dbSection.id 
          ? { ...s, status: 'complete' as const, code, refined, refinement_changes: refinementChanges || null }
          : s
      )
    )

    setBuildState(newState)
    // No auto-advance to review - user clicks "Finish & Review" button
  }

  const handleSkipSection = async () => {
    if (!buildState) return

    const currentSection = getCurrentSection()
    const dbSection = getCurrentDbSection()
    if (!currentSection || !dbSection) return

    // Optimistically update UI first for responsiveness
    const newState: BuildState = {
      ...buildState,
      skippedSections: [...buildState.skippedSections, currentSection.id],
      currentSectionIndex: buildState.currentSectionIndex + 1,
    }

    setDbSections(prev => 
      prev.map(s => 
        s.id === dbSection.id 
          ? { ...s, status: 'skipped' as const }
          : s
      )
    )

    setBuildState(newState)

    // Then sync with server (don't block UI)
    if (!demoMode) {
      try {
        const response = await fetch(`/api/section/${dbSection.id}/skip`, { method: 'POST' })
        if (!response.ok) {
          console.error('Failed to sync skip to server:', response.status)
          // State already updated optimistically - could add retry logic here
        }
      } catch (err) {
        console.error('Failed to sync skip to server:', err)
      }
    }

    if (newState.currentSectionIndex >= sectionsForBuild.length) {
      setPhase('review')
      localStorage.removeItem('hatch_current_project')
      if (!demoMode && project) {
        try {
          const response = await fetch(`/api/project/${project.id}/build`, { method: 'POST' })
          if (!response.ok) {
            console.error('Failed to create build:', response.status)
          }
        } catch (err) {
          console.error('Failed to create build:', err)
        }
      }
    }
  }

  const handleSectionClick = (sectionIndex: number) => {
    if (!buildState) return
    
    const section = sectionsForBuild[sectionIndex]
    if (!section) return
    
    const isAccessible = 
      buildState.completedSections.includes(section.id) ||
      buildState.skippedSections.includes(section.id) ||
      sectionIndex === buildState.currentSectionIndex

    if (isAccessible) {
      setBuildState({ ...buildState, currentSectionIndex: sectionIndex })
    }
  }

  const handleNextSection = () => {
    if (!buildState) return
    
    const nextIndex = buildState.currentSectionIndex + 1
    
    if (nextIndex >= sectionsForBuild.length) {
      // All sections done - go to review phase
      setPhase('review')
      // Clear localStorage since project is complete
      localStorage.removeItem('hatch_current_project')
      if (!demoMode && project) {
        // Create build with proper error handling
        fetch(`/api/project/${project.id}/build`, { method: 'POST' })
          .then(res => {
            if (!res.ok) console.error('Failed to create build:', res.status)
          })
          .catch(err => console.error('Failed to create build:', err))
      }
    } else {
      setBuildState({ ...buildState, currentSectionIndex: nextIndex })
    }
  }

  // Assemble all section code into a full page for preview
  const assembledCode = useMemo(() => {
    if (!buildState) return ''
    
    const completedSections = sectionsForBuild
      .filter(s => buildState.completedSections.includes(s.id))
      .map(s => buildState.sectionCode[s.id])
      .filter(Boolean)
    
    if (completedSections.length === 0) return ''
    
    return completedSections.join('\n\n')
  }, [buildState, sectionsForBuild])

  const handleDeploy = async () => {
    if (!project || !assembledCode || isDeploying) return
    
    // Check if user has subscription
    if (!isPaidUser) {
      setShowHatchModal(true)
      return
    }
    
    setIsDeploying(true)
    setError(null)
    
    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: `'use client'\n\nimport { motion } from 'framer-motion'\n\nexport default function GeneratedPage() {\n  return (\n    <main className="min-h-screen bg-zinc-950 text-white">\n${assembledCode}\n    </main>\n  )\n}`,
          projectName: project.name,
        }),
      })
      
      const data = await response.json()
      
      if (data.url) {
        // Poll for deployment readiness
        const startTime = Date.now()
        const maxWait = 120000
        const pollInterval = 4000
        
        await new Promise(r => setTimeout(r, 8000))
        
        while (Date.now() - startTime < maxWait) {
          try {
            const checkResponse = await fetch(`/api/deploy?check=${encodeURIComponent(data.url)}`)
            const checkData = await checkResponse.json()
            if (checkData.ready) break
          } catch {
            // Continue polling
          }
          await new Promise(r => setTimeout(r, pollInterval))
        }
        
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
  }

  const handleRunAudit = async () => {
    if (!project || !buildState || demoMode) return

    setIsAuditRunning(true)

    try {
      const response = await fetch(`/api/project/${project.id}/audit`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Audit failed')

      const { auditChanges } = await response.json()

      setBuildState({
        ...buildState,
        finalAuditComplete: true,
        finalAuditChanges: auditChanges,
      })

    } catch (err) {
      console.error('Audit error:', err)
      setError('Audit failed. You can still deploy.')
    } finally {
      setIsAuditRunning(false)
    }
  }

  const handleStartFresh = () => {
    localStorage.removeItem('hatch_current_project')
    setError(null) // Clear any error state
    setProject(null)
    setDbSections([])
    setSelectedTemplate(null)
    setCustomizedSections(null)
    setBrandConfig(null)
    setBuildState(null)
    setPhase('select')
    setDemoMode(false)
    // Use window.location for a clean state reset
    window.location.href = '/builder'
  }

  const handleGoHome = () => {
    router.push('/')
  }

  const handleViewBrand = () => {
    // Go back to branding step to edit brand settings
    setPhase('branding')
  }

  if (isLoading) {
    // Show different message depending on if we're loading existing vs creating new
    const loadingMessage = phase === 'branding' || phase === 'select' 
      ? 'Setting up your project...' 
      : 'Resuming your project...'
    
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
        />
        <p className="text-zinc-400 text-sm">{loadingMessage}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error}</div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700"
            >
              Try Again
            </button>
            <button
              onClick={handleStartFresh}
              className="px-4 py-2 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600"
            >
              Start Fresh
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <AnimatePresence mode="wait">
        {phase === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <TemplateSelector onSelectTemplate={handleTemplateSelect} />
          </motion.div>
        )}

        {phase === 'branding' && selectedTemplate && (
          <motion.div
            key="branding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <BrandingStep
              onComplete={handleBrandingComplete}
              onBack={() => setPhase('select')}
              templateName={selectedTemplate.name}
              templateIcon={selectedTemplate.icon}
            />
          </motion.div>
        )}

        {phase === 'building' && templateForBuild && buildState && (
          <motion.div
            key="building"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-screen overflow-hidden"
          >
            <SectionProgress
              template={templateForBuild}
              buildState={buildState}
              onSectionClick={handleSectionClick}
              onSkip={handleSkipSection}
              onGoHome={handleGoHome}
              onStartOver={handleStartFresh}
              onViewBrand={handleViewBrand}
              brandConfig={brandConfig}
            />

            <div className="flex-1 flex min-h-0 overflow-hidden">
              {getCurrentSection() && getCurrentDbSection() && (project?.id || getCurrentDbSection()!.project_id) && (
                <SectionBuilder
                  section={getCurrentSection()!}
                  dbSection={getCurrentDbSection()!}
                  projectId={project?.id ?? getCurrentDbSection()!.project_id}
                  onComplete={handleSectionComplete}
                  onNextSection={handleNextSection}
                  isLastSection={buildState.currentSectionIndex >= sectionsForBuild.length - 1}
                  allSectionsCode={buildState.sectionCode}
                  demoMode={demoMode}
                  brandConfig={brandConfig}
                  isPaid={isPaid}
                  onShowHatchModal={() => setShowHatchModal(true)}
                />
              )}

              {getCurrentSection() && getCurrentDbSection() && !(project?.id || getCurrentDbSection()!.project_id) && (
                <div className="flex-1 flex items-center justify-center bg-zinc-950">
                  <div className="max-w-md text-center px-6">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h2 className="text-lg font-semibold text-white mb-2">Project data isn't available yet</h2>
                    <p className="text-sm text-zinc-400 mb-6">
                      We can't generate the next section because the project id is missing. Please refresh or start a new project.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700"
                      >
                        Refresh
                      </button>
                      <button
                        onClick={handleStartFresh}
                        className="px-4 py-2 bg-zinc-700 text-zinc-200 rounded-lg hover:bg-zinc-600"
                      >
                        Start Fresh
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {getCurrentSection() && !getCurrentDbSection() && (
                <div className="flex-1 flex items-center justify-center bg-zinc-950">
                  <div className="max-w-md text-center px-6">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h2 className="text-lg font-semibold text-white mb-2">This section isn't in your project</h2>
                    <p className="text-sm text-zinc-400 mb-6">
                      Your selected section list doesn't match the project data. This can happen if the section list was customized.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={handleStartFresh}
                        className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700"
                      >
                        Start Fresh
                      </button>
                      <button
                        onClick={() => setPhase('select')}
                        className="px-4 py-2 bg-zinc-700 text-zinc-200 rounded-lg hover:bg-zinc-600"
                      >
                        Back to Templates
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {phase === 'review' && buildState && templateForBuild && (
          <motion.div
            key="review"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-screen overflow-hidden bg-zinc-950"
          >
            {/* Review Header */}
            <div className="flex-shrink-0 border-b border-zinc-800/50 bg-zinc-950">
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleGoHome}
                    className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Dashboard</span>
                  </button>
                  <div className="h-6 w-px bg-zinc-800" />
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                      <Layout className="w-4 h-4 text-purple-400" />
                    </div>
                    <h1 className="text-lg font-bold text-white tracking-tight">{project?.name || 'Untitled Project'}</h1>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">System Online</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleStartFresh}
                    className="px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors font-mono"
                  >
                    New Project
                  </button>
                  {deployedUrl ? (
                    <a
                      href={deployedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors flex items-center gap-2 font-medium"
                    >
                      <Globe className="w-4 h-4" />
                      <span>View Live Site</span>
                    </a>
                  ) : (
                    <button
                      onClick={handleDeploy}
                      disabled={isDeploying || !assembledCode}
                      className="px-4 py-2 text-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group"
                    >
                      {isDeploying ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Deploying System...</span>
                        </>
                      ) : (
                        <>
                          <Rocket className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                          <span>{isPaidUser ? 'Deploy to Production' : 'Initialize Deployment'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
              {error && (
                <div className="px-6 pb-3">
                  <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                </div>
              )}
            </div>

            {/* Main Content - Split Panel */}
            <div className="flex-1 flex min-h-0 overflow-hidden">
              {/* Left Panel - Section List */}
              <div className="w-80 border-r border-zinc-800/50 flex flex-col bg-zinc-900/20 overflow-hidden">
                <div className="p-4 border-b border-zinc-800/50">
                  <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Architecture Modules</h2>
                </div>
                <div className="flex-1 overflow-auto p-2 space-y-1">
                  {templateForBuild.sections.map((section, index) => {
                    const isCompleted = buildState.completedSections.includes(section.id)
                    const isSkipped = buildState.skippedSections.includes(section.id)
                    
                    return (
                      <button
                        key={section.id}
                        onClick={() => {
                          if (isCompleted) {
                            setEditingSectionIndex(index)
                          }
                        }}
                        className={`w-full text-left p-3 rounded-lg mb-1 transition-all group ${
                          editingSectionIndex === index
                            ? 'bg-purple-500/10 border border-purple-500/20'
                            : isCompleted
                            ? 'hover:bg-zinc-800/50 border border-transparent'
                            : 'opacity-50 cursor-not-allowed border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-mono ${
                            isCompleted 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : isSkipped
                              ? 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                              : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                          }`}>
                            {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-sm font-medium truncate ${
                              editingSectionIndex === index ? 'text-purple-300' : 'text-zinc-300 group-hover:text-white'
                            }`}>{section.name}</h3>
                          </div>
                          {isCompleted && (
                            <Edit3 className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
                
                {/* Run Audit Button */}
                <div className="p-4 border-t border-zinc-800/50 bg-zinc-900/30">
                  <button
                    onClick={handleRunAudit}
                    disabled={isAuditRunning}
                    className="w-full py-3 text-sm bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-700 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 group"
                  >
                    {isAuditRunning ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span className="font-mono">Running Gemini 2.5 Diagnostics...</span>
                      </>
                    ) : (
                      <>
                        <Terminal className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
                        <span className="font-mono">Run System Audit</span>
                      </>
                    )}
                  </button>
                  {buildState.finalAuditComplete && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-xs text-emerald-400 font-mono bg-emerald-500/10 py-1.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Optimized: {buildState.finalAuditChanges?.length || 0} improvements</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel - Full Site Preview */}
              <div className="flex-1 flex flex-col bg-zinc-950 min-h-0 relative">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                
                {/* Preview Header with Device Toggle */}
                <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between relative z-10 bg-zinc-950/80 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Live Preview Environment</h3>
                  </div>
                  
                  <div className="flex items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                    {(['mobile', 'tablet', 'desktop'] as const).map((device) => (
                      <button
                        key={device}
                        onClick={() => setReviewDeviceView(device)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${
                          reviewDeviceView === device
                            ? 'bg-zinc-800 text-white shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {device === 'mobile' ? <Smartphone className="w-3.5 h-3.5" /> : 
                         device === 'tablet' ? <Tablet className="w-3.5 h-3.5" /> : 
                         <Monitor className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">{device.charAt(0).toUpperCase() + device.slice(1)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview Container */}
                <div className="flex-1 flex items-start justify-center overflow-auto p-8 relative z-0">
                  <motion.div
                    initial={false}
                    animate={{ 
                      width: reviewDeviceView === 'mobile' ? '375px' : reviewDeviceView === 'tablet' ? '768px' : '100%' 
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className={`h-full bg-zinc-900 rounded-xl overflow-hidden shadow-2xl border border-zinc-800 transition-all duration-500 ${
                      reviewDeviceView === 'mobile' ? 'border-[8px] border-zinc-800 rounded-[2rem]' : 
                      reviewDeviceView === 'tablet' ? 'border-[8px] border-zinc-800 rounded-[1.5rem]' : ''
                    }`}
                    style={{ maxWidth: '100%', minHeight: '100%' }}
                  >
                    {reviewDeviceView !== 'desktop' && (
                      <div className="h-6 bg-zinc-800 flex items-center justify-center gap-1 border-b border-zinc-700/50">
                        <div className="w-16 h-1 bg-zinc-700 rounded-full" />
                      </div>
                    )}
                    <FullSitePreviewFrame 
                      code={assembledCode} 
                      deviceView={reviewDeviceView}
                    />
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Success Modal after Deploy */}
            <AnimatePresence>
              {deployedUrl && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                  onClick={() => setDeployedUrl(null)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
                    
                    <div className="text-center relative z-10">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
                        className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"
                      >
                        <Rocket className="w-10 h-10 text-emerald-400" />
                      </motion.div>
                      <h2 className="text-2xl font-bold text-white mb-2">System Deployed Successfully</h2>
                      <p className="text-zinc-400 mb-6">Your architecture is now live and accessible worldwide.</p>
                      <a
                        href={deployedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all group"
                      >
                        <Globe className="w-5 h-5" />
                        <span>Visit Live Site</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </a>
                      <div className="mt-4 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg flex items-center justify-between gap-3">
                        <code className="text-xs text-zinc-400 font-mono truncate">{deployedUrl}</code>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(deployedUrl)
                          }}
                          className="text-zinc-500 hover:text-white transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Next Steps */}
                    <div className="mt-8 pt-6 border-t border-zinc-800 relative z-10">
                      <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4">Next Actions</h3>
                      <div className="space-y-2">
                        <button
                          onClick={() => setDeployedUrl(null)}
                          className="w-full flex items-center gap-3 p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors text-left group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <Edit3 className="w-4 h-4 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors">Continue Development</p>
                            <p className="text-xs text-zinc-500">Refine and update your architecture</p>
                          </div>
                        </button>
                        <button
                          onClick={handleStartFresh}
                          className="w-full flex items-center gap-3 p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors text-left group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Plus className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">Initialize New Project</p>
                            <p className="text-xs text-zinc-500">Start a fresh build sequence</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hatch Modal - paywall for deploy */}
      <HatchModal
        isOpen={showHatchModal}
        onClose={() => setShowHatchModal(false)}
        reason="deploy"
      />
    </div>
  )
}