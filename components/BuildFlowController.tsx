'use client'

/* eslint-disable react/no-unescaped-entities */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
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
  Copy,
  Sparkles
} from 'lucide-react'
// TemplateSelector and BrandingStep removed - The Architect decides now.
import SectionProgress from './SectionProgress'
import SectionBuilder from './SectionBuilder'
import HatchModal from './HatchModal'
import Scorecard from './Scorecard'
import TheWitness from './TheWitness'
import { chronosphere } from '@/lib/chronosphere'
import { Template, Section, getTemplateById, getSectionById, createInitialBuildState, BuildState, websiteTemplate } from '@/lib/templates'
import { DbProject, DbSection, DbBrandConfig } from '@/lib/supabase'
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
      // Remove imports (handling multiline)
      .replace(/import\s+[\s\S]*?from\s+['"].*?['"]\s*;?/g, '')
      // Remove export default and named exports
      .replace(/export\s+default\s+/g, '')
      .replace(/export\s+(const|function|class|let|var)\s+/g, '$1 ')
      // Fix React.* usage
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
}`.replace(/\|\s*{\/\*.*?\*\/}/g, '') // Remove weird pipe artifacts like "17 | {/* ... */}"

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
  <script>
    window.onerror = function(message, source, lineno, colno, error) {
      console.error('Preview Error:', message);
      const root = document.getElementById('root');
      if (root) {
        root.innerHTML = '<div style="color: #ef4444; padding: 20px; font-family: monospace; background: #18181b; border-radius: 8px; margin: 20px; border: 1px solid #3f3f46;">' +
          '<h3 style="font-weight: bold; margin-bottom: 10px;">Runtime Error</h3>' +
          '<div style="margin-bottom: 10px;">' + message + '</div>' +
          '<div style="opacity: 0.7; font-size: 0.9em;">Line: ' + lineno + '</div>' +
          '</div>';
      }
    };
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
  
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js" crossorigin></script>
  <script src="https://cdn.jsdelivr.net/npm/framer-motion@11/dist/framer-motion.js" crossorigin></script>
  <script src="https://unpkg.com/lucide-react@0.294.0/dist/umd/lucide-react.js" crossorigin></script>
  
  <script>
    window.motion = window.Motion?.motion || { div: 'div', span: 'span', button: 'button', a: 'a', p: 'p', h1: 'h1', h2: 'h2', h3: 'h3', section: 'section', nav: 'nav', ul: 'ul', li: 'li', img: 'img', form: 'form', input: 'input' };
    window.AnimatePresence = window.Motion?.AnimatePresence || function(p) { return p.children; };
    window.useInView = window.Motion?.useInView || function() { return true; };
    window.useScroll = window.Motion?.useScroll || function() { return { scrollY: 0, scrollYProgress: 0 }; };
    window.useTransform = window.Motion?.useTransform || function(v) { return v; };
    window.useMotionValue = window.Motion?.useMotionValue || function(v) { return { get: () => v, set: () => {} }; };
    window.useSpring = window.Motion?.useSpring || function(v) { return v; };
    window.useAnimation = window.Motion?.useAnimation || function() { return { start: () => {}, stop: () => {} }; };
    
    // Robust Lucide Icons Proxy
    window.LucideIcons = window.lucideReact || {};
    window.LucideIcons = new Proxy(window.LucideIcons, {
      get: (target, prop) => {
        if (prop in target) return target[prop];
        // Return a dummy component that renders nothing (or a placeholder)
        return function DummyIcon(props) { return null; };
      }
    });
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
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
      title="Full Site Preview"
    />
  )
}

// =============================================================================
// BUILD FLOW CONTROLLER
// Orchestrates the entire V3.0 build experience
// =============================================================================

type BuildPhase = 'initializing' | 'building' | 'review'

interface BuildFlowControllerProps {
  existingProjectId?: string
  demoMode?: boolean
}

const generateId = () => Math.random().toString(36).substring(2, 15)

// The Singularity Default Template
// Minimal, clean, ready for anything.
const SINGULARITY_TEMPLATE: Template = {
  ...websiteTemplate,
  id: 'singularity',
  name: 'The Singularity',
  description: 'The Architect\'s default canvas.',
  sections: websiteTemplate.sections
}

export default function BuildFlowController({ existingProjectId, demoMode: forceDemoMode }: BuildFlowControllerProps) {
  const { user, isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  
  const [demoMode, setDemoMode] = useState(forceDemoMode ?? false)
  const [phase, setPhase] = useState<BuildPhase>('initializing')
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(SINGULARITY_TEMPLATE)
  const [customizedSections, setCustomizedSections] = useState<Section[]>(SINGULARITY_TEMPLATE.sections)
  const [brandConfig, setBrandConfig] = useState<any>(null) // Brand config is now implicit or AI-driven
  const [buildState, setBuildState] = useState<BuildState | null>(null)
  const [project, setProject] = useState<DbProject | null>(null)
  const [dbSections, setDbSections] = useState<DbSection[]>([])
  const [isLoading, setIsLoading] = useState(true) // Start loading immediately
  const [error, setError] = useState<string | null>(null)
  const [isAuditRunning, setIsAuditRunning] = useState(false)
  const [showHatchModal, setShowHatchModal] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null)
  const [reviewDeviceView, setReviewDeviceView] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [reviewMobileTab, setReviewMobileTab] = useState<'modules' | 'preview'>('preview')
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null)
  const [justCreatedProjectId, setJustCreatedProjectId] = useState<string | null>(null)
  const [showScorecard, setShowScorecard] = useState(false)
  
  // The Witness State
  const [showWitness, setShowWitness] = useState(false)
  const [witnessNote, setWitnessNote] = useState<string | null>(null)
  const [isWitnessLoading, setIsWitnessLoading] = useState(false)

  const [showReset, setShowReset] = useState(false)
  const [isReplicationReady, setIsReplicationReady] = useState(false)

  // Handle Replicator Mode & Onboarding Mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const mode = params.get('mode')
    const data = params.get('data')

    if (mode === 'replicate' && data) {
      try {
        const replicationData = JSON.parse(decodeURIComponent(data))
        // Transform replication data into a template
        const replicatedTemplate: Template = {
          ...SINGULARITY_TEMPLATE,
          name: replicationData.projectName || 'Replicated Project',
          description: replicationData.description || 'Imported from URL',
          sections: replicationData.sections.map((s: any, i: number) => ({
            id: s.type || `section-${i}`,
            name: s.type ? s.type.charAt(0).toUpperCase() + s.type.slice(1) : `Section ${i + 1}`,
            description: s.prompt,
            prompt: s.prompt,
            estimatedTime: '~20s',
            required: true,
            order: i + 1
          }))
        }
        
        setSelectedTemplate(replicatedTemplate)
        setCustomizedSections(replicatedTemplate.sections)
        setIsReplicationReady(true)
      } catch (e) {
        console.error('Failed to parse replication data', e)
        setError('Failed to load replicated project data')
        setIsReplicationReady(true) // Proceed anyway to avoid hanging
      }
    } else if (mode === 'onboarding') {
      try {
        const onboardingDataStr = localStorage.getItem('hatch_onboarding_data')
        if (onboardingDataStr) {
          const onboardingData = JSON.parse(onboardingDataStr)
          
          // Update template with onboarding data
          const newTemplate: Template = {
            ...SINGULARITY_TEMPLATE,
            name: onboardingData.brandName || 'New Entity',
            description: onboardingData.description || 'A new digital presence.',
          }
          
          setSelectedTemplate(newTemplate)
          setBrandConfig({
            brandName: onboardingData.brandName,
            description: onboardingData.description,
            archetype: onboardingData.archetype
          })
        }
      } catch (e) {
        console.error('Failed to load onboarding data', e)
      }
      setIsReplicationReady(true)
    } else {
      setIsReplicationReady(true)
    }
  }, [])

  // Show reset button if loading takes too long
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isLoading) {
      timer = setTimeout(() => setShowReset(true), 3000) // 3 seconds
    } else {
      setShowReset(false)
    }
    return () => clearTimeout(timer)
  }, [isLoading])

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
    return customizedSections && customizedSections.length > 0
      ? customizedSections
      : selectedTemplate.sections
  }, [customizedSections, selectedTemplate])

  const templateForBuild = useMemo(() => {
    return { ...selectedTemplate, sections: sectionsForBuild }
  }, [selectedTemplate, sectionsForBuild])

  // Track if we're in the middle of creating a project to prevent reload
  const [isCreatingProject, setIsCreatingProject] = useState(false)

  // AUTO-INITIALIZATION LOGIC
  useEffect(() => {
    console.log('BuildFlowController: useEffect triggered', { existingProjectId, justCreatedProjectId, isCreatingProject, isLoaded })

    // If we have an existing project ID, load it
    if (existingProjectId) {
      // Optimization: If we already have this project loaded, skip
      if (project?.id === existingProjectId) {
        console.log('BuildFlowController: Project already loaded, skipping')
        return
      }

      console.log('BuildFlowController: Loading existing project', existingProjectId)
      loadExistingProject(existingProjectId)
      return
    }

    // If we just created a project, do nothing (we are already set up)
    if (justCreatedProjectId) {
      console.log('BuildFlowController: Just created project, skipping')
      return
    }

    // If we already have a project loaded (e.g. via demo mode), skip
    if (project) {
      console.log('BuildFlowController: Project already loaded (state), skipping')
      return
    }

    // If we are already creating, wait
    if (isCreatingProject) {
      console.log('BuildFlowController: Already creating project, skipping')
      return
    }

    // If we are not loaded yet, wait
    if (!isLoaded) {
      console.log('BuildFlowController: Clerk not loaded yet, waiting')
      return
    }

    // Wait for replication data to be processed
    if (!isReplicationReady) {
      console.log('BuildFlowController: Waiting for replication data')
      return
    }

    // Check for saved project in localStorage to resume
    const savedProjectId = localStorage.getItem('hatch_current_project')
    if (savedProjectId) {
      console.log('BuildFlowController: Found saved project, redirecting', savedProjectId)
      router.replace(`/builder?project=${savedProjectId}`)
      return
    }

    // Otherwise, INITIALIZE A NEW PROJECT IMMEDIATELY
    console.log('BuildFlowController: Initializing new project')
    initializeProject()
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingProjectId, justCreatedProjectId, isCreatingProject, isLoaded, isReplicationReady])

  const initializeProject = async () => {
    console.log('BuildFlowController: initializeProject started')
    setIsCreatingProject(true)
    setIsLoading(true)
    
    // Use selected template (which might be replicated)
    const template = selectedTemplate
    // Use customized sections (which might be replicated)
    const sections = customizedSections.length > 0 ? customizedSections : template.sections
    
    const brand: DbBrandConfig = {
      brandName: brandConfig?.brandName || (template.name === 'The Singularity' ? 'Untitled Project' : template.name),
      colors: {
        primary: '#10b981', // Emerald-500
        secondary: '#09090b', // Zinc-950
        accent: '#34d399' // Emerald-400
      },
      fontStyle: 'Inter',
      styleVibe: brandConfig?.archetype ? 'modern' : 'modern'
    }

    const setupDemoMode = () => {
      const mockProjectId = `demo-${generateId()}`
      const mockProject: DbProject = {
        id: mockProjectId,
        user_id: 'demo-user',
        name: brand.brandName,
        slug: mockProjectId,
        template_id: template.id,
        status: 'building',
        brand_config: brand,
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
      setBuildState(createInitialBuildState(template.id))
      setPhase('building')
      setDemoMode(true)
      setIsCreatingProject(false)
      setIsLoading(false)
    }

    // If user is not signed in, use demo mode
    if (!isSignedIn || !user) {
      // Small delay for effect
      setTimeout(setupDemoMode, 1500)
      return
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout for creation

      const response = await fetch('/api/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: template.id,
          name: brand.brandName,
          sections: sections,
          brand: brand,
        }),
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        console.warn('API failed, falling back to demo mode')
        setupDemoMode()
        return
      }

      const { project: newProject, sections: dbSectionsData } = await response.json()

      setProject(newProject)
      setDbSections(dbSectionsData)
      setBuildState(createInitialBuildState(template.id))
      setPhase('building')
      
      setJustCreatedProjectId(newProject.id)
      router.replace(`/builder?project=${newProject.id}`, { scroll: false })
      localStorage.setItem('hatch_current_project', newProject.id)

    } catch (err) {
      console.error('Error creating project:', err)
      setupDemoMode()
    } finally {
      setIsLoading(false)
      setIsCreatingProject(false)
    }
  }

  // Track loading state to prevent duplicate requests
  const loadingProjectIdRef = useRef<string | null>(null)

  const loadExistingProject = async (projectId: string) => {
    // Prevent duplicate loads
    if (loadingProjectIdRef.current === projectId) return
    loadingProjectIdRef.current = projectId

    setIsLoading(true)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

      const response = await fetch(`/api/project/${projectId}`, { signal: controller.signal })
      clearTimeout(timeoutId)
      
      if (response.status === 403 || response.status === 404) {
        console.log('Project not found, starting fresh')
        localStorage.removeItem('hatch_current_project')
        
        // Only redirect if we are not already at /builder (to avoid loop)
        if (window.location.pathname !== '/builder' || window.location.search) {
           router.replace('/builder', { scroll: false })
        }
        
        setJustCreatedProjectId(null)
        setIsLoading(false) 
        loadingProjectIdRef.current = null
        return
      }
      
      if (!response.ok) throw new Error('Failed to load project')
      
      const { project: proj, sections } = await response.json()
      
      // Use Singularity template if ID matches, otherwise fallback to website template
      const template = proj.template_id === 'singularity' ? SINGULARITY_TEMPLATE : (getTemplateById(proj.template_id) || websiteTemplate)

      setProject(proj)
      setDbSections(sections)
      setSelectedTemplate(template)

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
      loadingProjectIdRef.current = null
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

        // Trigger The Witness
        setShowWitness(true)
        setIsWitnessLoading(true)
        try {
          const witnessRes = await fetch('/api/witness', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dna: chronosphere.getDNA() })
          })
          const witnessData = await witnessRes.json()
          setWitnessNote(witnessData.note)
        } catch (e) {
          console.error('Witness failed', e)
          setWitnessNote("The Architect nods in approval. Your creation is complete.")
        } finally {
          setIsWitnessLoading(false)
        }
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

      const { changes, scores, passed } = await response.json()
      
      // Convert changes objects to strings if necessary
      const changeStrings = Array.isArray(changes) 
        ? changes.map((c: any) => typeof c === 'string' ? c : c.fix)
        : []

      setBuildState({
        ...buildState,
        finalAuditComplete: true,
        finalAuditChanges: changeStrings,
        auditScores: scores,
        auditPassed: passed
      })
      
      setShowScorecard(true)

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
    // setSelectedTemplate(null) // Keep default template
    // setCustomizedSections(null)
    setBrandConfig(null)
    setBuildState(null)
    setPhase('initializing')
    setDemoMode(false)
    setJustCreatedProjectId(null)
    // Use window.location for a clean state reset
    window.location.href = '/builder'
  }

  const handleGoHome = () => {
    router.push('/')
  }

  const handleViewBrand = () => {
    // Branding is now handled via chat or settings, not a separate phase
    // setPhase('branding')
    alert("Brand settings are now managed by The Architect. Just ask to change colors or fonts.")
  }

  if (isLoading) {
    // Show different message depending on if we're loading existing vs creating new
    let loadingMessage = 'Initializing The Architect...'
    if (existingProjectId) loadingMessage = 'Resuming your project...'
    else if (!isLoaded) loadingMessage = 'Connecting to neural network...'
    
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full"
        />
        <p className="text-zinc-400 text-sm font-mono">{loadingMessage}</p>
        
        {showReset && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex flex-col items-center gap-2"
          >
            <p className="text-zinc-500 text-xs">Taking longer than expected?</p>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  // Clear local storage and reload
                  localStorage.removeItem('hatch_current_project')
                  window.location.href = '/builder'
                }}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Reset & Start New Project
              </button>
              <button 
                onClick={() => {
                  // Force demo mode
                  setIsLoading(false)
                  setDemoMode(true)
                  setPhase('building')
                  setBuildState(createInitialBuildState(SINGULARITY_TEMPLATE.id))
                }}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Force Demo Mode
              </button>
            </div>
            <div className="mt-4 p-2 bg-zinc-900/50 rounded text-[10px] text-zinc-600 font-mono max-w-md overflow-auto">
              DEBUG: loaded={String(isLoaded)} creating={String(isCreatingProject)} existing={String(existingProjectId)} rep={String(isReplicationReady)}
            </div>
          </motion.div>
        )}
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
        {phase === 'initializing' && (
          <motion.div
            key="initializing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-screen bg-zinc-950"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full animate-pulse" />
              <div className="relative w-24 h-24 bg-zinc-900 border border-emerald-500/30 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <Terminal className="w-10 h-10 text-emerald-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Initializing The Architect</h2>
            <div className="flex items-center gap-2 text-emerald-400/80 font-mono text-sm">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span>Establishing Direct Line...</span>
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3 }}
              className="mt-8"
            >
              <button 
                onClick={() => {
                  localStorage.removeItem('hatch_current_project')
                  window.location.href = '/builder'
                }}
                className="text-xs text-zinc-500 hover:text-zinc-300 underline decoration-zinc-700 underline-offset-4 transition-colors"
              >
                Stuck? Start Over
              </button>
            </motion.div>
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
                        onClick={() => setPhase('initializing')}
                        className="px-4 py-2 bg-zinc-700 text-zinc-200 rounded-lg hover:bg-zinc-600"
                      >
                        Back to Start
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
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <Terminal className="w-4 h-4 text-emerald-400" />
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
                      className="px-6 py-2.5 text-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-lg hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    >
                      {isDeploying ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Deploying System...</span>
                        </>
                      ) : (
                        <>
                          <Rocket className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                          <span>{isPaidUser ? 'Launch to Production' : 'Initialize Deployment'}</span>
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
            <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
              
              {/* Mobile Tab Switcher for Review */}
              <div className="flex md:hidden border-b border-zinc-800/50 bg-zinc-950 p-2">
                <div className="flex w-full bg-zinc-900/50 rounded-lg p-1 border border-zinc-800/50">
                  <button
                    onClick={() => setReviewMobileTab('modules')}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
                      reviewMobileTab === 'modules' 
                        ? 'bg-zinc-800 text-white shadow-sm' 
                        : 'text-zinc-400 hover:text-zinc-300'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>Modules</span>
                  </button>
                  <button
                    onClick={() => setReviewMobileTab('preview')}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
                      reviewMobileTab === 'preview' 
                        ? 'bg-zinc-800 text-white shadow-sm' 
                        : 'text-zinc-400 hover:text-zinc-300'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview</span>
                  </button>
                </div>
              </div>

              {/* Left Panel - Section List */}
              <div className={`
                ${reviewMobileTab === 'modules' ? 'flex' : 'hidden'} md:flex
                w-full md:w-80 border-r border-zinc-800/50 flex-col bg-zinc-900/20 overflow-hidden
              `}>
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
                            // Go back to building mode for this section
                            setBuildState(prev => prev ? ({ ...prev, currentSectionIndex: index }) : null)
                            setPhase('building')
                          }
                        }}
                        className={`w-full text-left p-3 rounded-lg mb-1 transition-all group ${
                          isCompleted
                            ? 'hover:bg-zinc-800/50 border border-transparent cursor-pointer'
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
                            <h3 className="text-sm font-medium truncate text-zinc-300 group-hover:text-white">{section.name}</h3>
                          </div>
                          {isCompleted && (
                            <Edit3 className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400" />
                          )}
                        </div>
                      </button>
                    )
                  })}{`
                ${reviewMobileTab === 'preview' ? 'flex' : 'hidden'} md:flex
                flex-1 flex-col bg-zinc-950 min-h-0 relative
              `}
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

            {/* Scorecard Modal */}
            <AnimatePresence>
              {showScorecard && buildState.auditScores && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                  onClick={() => setShowScorecard(false)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full shadow-2xl relative overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Scorecard 
                      scores={buildState.auditScores} 
                      passed={buildState.auditPassed ?? false} 
                    />
                    <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 flex justify-end">
                      <button
                        onClick={() => setShowScorecard(false)}
                        className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 text-sm font-medium"
                      >
                        Close Report
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

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

      <TheWitness
        isOpen={showWitness}
        onClose={() => setShowWitness(false)}
        note={witnessNote}
        isLoading={isWitnessLoading}
      />
    </div>
  )
}