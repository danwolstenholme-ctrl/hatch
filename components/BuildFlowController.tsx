'use client'

/* eslint-disable react/no-unescaped-entities */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Globe, 
  Rocket, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  RefreshCw, 
  Layers,
  Layout,
  MessageSquare,
  Share2,
  Edit3,
  Plus,
  Terminal,
  ArrowRight,
  Sparkles,
  Crown,
  Zap,
  Star,
  Download,
  ExternalLink,
  Lock,
  Check,
  X,
  Menu,
  Code
} from 'lucide-react'
import { track } from '@vercel/analytics'
import SectionProgress from './SectionProgress'
import SectionBuilder from './SectionBuilder'
import PaywallTransition from './PaywallTransition'
import HatchModal from './HatchModal'
import TheWitness from './singularity/TheWitness'
import WelcomeModal from './WelcomeModal'
import BuilderWelcome from './BuilderWelcome'
import DemoWelcome from './DemoWelcome'
import SiteSettingsModal, { SiteSettings } from './SiteSettingsModal'
import AssistantModal from './builder/AssistantModal'
import PromptHelperModal from './builder/PromptHelperModal'
import { useGitHub } from '@/hooks/useGitHub'
import { Github } from 'lucide-react'
import FullSitePreviewFrame from './builder/FullSitePreviewFrame'
import BuildSuccessModal from './BuildSuccessModal'
import Button from './singularity/Button'
import ReplicatorModal from './ReplicatorModal'
import { Sidebar } from './builder'
import { chronosphere } from '@/lib/chronosphere'
import { Template, Section, getTemplateById, getSectionById, createInitialBuildState, BuildState, websiteTemplate } from '@/lib/templates'
import { DbProject, DbSection, DbBrandConfig } from '@/lib/supabase'
import { AccountSubscription } from '@/types/subscriptions'
import { useSubscription } from '@/contexts/SubscriptionContext'

const OLD_WELCOME_KEYS = ['hatch_welcome_v1_seen', 'hatch_v1_welcome_seen']

type ReplicationData = {
  projectName?: string
  description?: string
  sections?: Array<{
    type?: string
    prompt?: string
  }>
}

type DemoRestoredSection = {
  sectionId: string
  code?: string | null
  userPrompt?: string | null
  refined?: boolean
  refinementChanges?: string[] | null
}

type DemoRestoreData = {
  brand?: DbBrandConfig
  templateId?: string
  sections?: DemoRestoredSection[]
}

// =============================================================================
// BUILD FLOW CONTROLLER
// Orchestrates the entire V3.0 build experience
// =============================================================================

type BuildPhase = 'initializing' | 'building' | 'review'

interface BuildFlowControllerProps {
  existingProjectId?: string
  initialPrompt?: string
  isDemo?: boolean // Demo mode: localStorage only, premium actions show signup
}

const generateId = () => Math.random().toString(36).substring(2, 15)

// Default System Template
// Minimal starter - Header, Hero, Footer. Users add more as needed.
const MINIMAL_SECTIONS: Section[] = [
  {
    id: 'header',
    name: 'Header/Navigation',
    description: 'Logo, nav links, and CTA button.',
    prompt: 'Define your brand name and navigation links.',
    estimatedTime: '~20s',
    required: true,
    order: 0,
  },
  {
    id: 'hero',
    name: 'Hero',
    description: 'Your main headline and call-to-action.',
    prompt: 'What\'s the main value proposition?',
    estimatedTime: '~30s',
    required: true,
    order: 1,
  },
  {
    id: 'footer',
    name: 'Footer',
    description: 'Links, contact info, and legal.',
    prompt: 'Contact details and social links.',
    estimatedTime: '~20s',
    required: true,
    order: 2,
  },
]

const SINGULARITY_TEMPLATE: Template = {
  ...websiteTemplate,
  id: 'singularity',
  name: 'Build Mode',
  description: 'Start minimal. Add sections as you go.',
  sections: MINIMAL_SECTIONS
}

export default function BuildFlowController({ existingProjectId, initialPrompt, isDemo = false }: BuildFlowControllerProps) {
  const { user, isLoaded, isSignedIn } = useUser()
  const { isPaidUser } = useSubscription()
  const router = useRouter()

  const [openSettingsFromQuery, setOpenSettingsFromQuery] = useState(false)
  
  const [demoMode, setDemoMode] = useState(isDemo)
  const [phase, setPhase] = useState<BuildPhase>('initializing')
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(SINGULARITY_TEMPLATE)
  const [customizedSections, setCustomizedSections] = useState<Section[]>(SINGULARITY_TEMPLATE.sections)
  const [brandConfig, setBrandConfig] = useState<DbBrandConfig | null>(null)
  const [buildState, setBuildState] = useState<BuildState | null>(null)
  const [project, setProject] = useState<DbProject | null>(null)
  const [hatchModalReason, setHatchModalReason] = useState<'generation_limit' | 'code_access' | 'deploy' | 'download' | 'proactive' | 'running_low' | 'guest_lock'>('proactive')
  const [showPaywallTransition, setShowPaywallTransition] = useState(false)
  const [paywallReason] = useState<'limit_reached' | 'site_complete'>('limit_reached')
  // Skip the loading screen when:
  // 1. Coming from FirstContact with a prompt (initialPrompt)
  // 2. Coming from dashboard with an existing project (page already handled auth loading)
  const skipLoadingScreen = !!initialPrompt || !!existingProjectId
  
  const [dbSections, setDbSections] = useState<DbSection[]>([])
  const [isLoading, setIsLoading] = useState(true) // Start loading immediately
  const [error, setError] = useState<string | null>(null)
  const [isAuditRunning, setIsAuditRunning] = useState(false)
  const [showHatchModal, setShowHatchModal] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null)
  const [shareUrlCopied, setShareUrlCopied] = useState(false)
  const [reviewMobileTab, setReviewMobileTab] = useState<'modules' | 'preview'>('preview')
  const [buildMobileTab, setBuildMobileTab] = useState<'build' | 'preview'>('build')
  const [justCreatedProjectId, setJustCreatedProjectId] = useState<string | null>(null)
  const [showSignupGate, setShowSignupGate] = useState(false)
  const [showDemoNudge, setShowDemoNudge] = useState(false)
  const [demoSectionsBuilt, setDemoSectionsBuilt] = useState(0)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [previewEditMode, setPreviewEditMode] = useState(false)

  // Reset legacy welcome flags so V2 intro shows for all users (esp. mobile)
  useEffect(() => {
    try {
      OLD_WELCOME_KEYS.forEach((key) => localStorage.removeItem(key))
    } catch (err) {
      console.warn('Welcome key cleanup failed', err)
    }
  }, [])
  
  // The Witness State
  const [showWitness, setShowWitness] = useState(false)
  const [witnessNote, setWitnessNote] = useState<string | null>(null)
  const [isWitnessLoading, setIsWitnessLoading] = useState(false)

  // Healer State (self-healing background process)
  const [isHealing, setIsHealing] = useState(false)
  const [lastHealMessage, setLastHealMessage] = useState<string | null>(null)

  // Singularity Feature Modals
  const [showReplicator, setShowReplicator] = useState(false)
  const [showOracle, setShowOracle] = useState(false)
  const [showArchitect, setShowArchitect] = useState(false)

  const [showReset, setShowReset] = useState(false)
  const [isReplicationReady, setIsReplicationReady] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showBuildSuccess, setShowBuildSuccess] = useState(false)
  const [showBuilderWelcome, setShowBuilderWelcome] = useState(false)
  const [showDemoWelcome, setShowDemoWelcome] = useState(false)
  const [lastCompletedSection] = useState<string>('')
  const [guestBuildsUsed, setGuestBuildsUsed] = useState(0)
  
  // GitHub integration
  const github = useGitHub()
  const [showDeployOptions, setShowDeployOptions] = useState(false)
  const [githubRepoName, setGithubRepoName] = useState('')
  const [githubPushResult, setGithubPushResult] = useState<{
    success: boolean
    repoUrl?: string
    vercelImportUrl?: string
    error?: string
  } | null>(null)

  // Show builder welcome for authenticated users (first time only)
  useEffect(() => {
    if (!isSignedIn) return // Only show welcome for signed-in users
    const hasSeen = localStorage.getItem('hatch_builder_welcome_seen')
    if (!hasSeen) {
      setShowBuilderWelcome(true)
    }
  }, [isSignedIn])

  // Show demo welcome for demo mode users
  useEffect(() => {
    if (demoMode) {
      setShowDemoWelcome(true)
    }
  }, [demoMode])

  // Deep link support: /builder?project=...&settings=1
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('settings') === '1') {
      setOpenSettingsFromQuery(true)
    }
  }, [])

  useEffect(() => {
    if (!openSettingsFromQuery) return
    if (!project?.id && !existingProjectId) return
    setIsSettingsOpen(true)
    setOpenSettingsFromQuery(false)
  }, [openSettingsFromQuery, project?.id, existingProjectId])
  
  // Keep demoMode in sync with isDemo prop and auth state
  // Ensures signed-in users on /builder never show sandbox mode
  useEffect(() => {
    if (!isLoaded) return
    // If signed in and not explicitly in demo, force live mode
    if (isSignedIn && !isDemo) {
      if (demoMode) {
        console.log('[Builder] Forcing demoMode=false for signed-in user')
        setDemoMode(false)
      }
    }
  }, [isLoaded, isSignedIn, isDemo, demoMode])

  // Sync guest credit counts from localStorage (only for guests)
  useEffect(() => {
    if (isSignedIn) return // Signed in users don't use guest credits
    
    const syncCredits = () => {
      const builds = parseInt(localStorage.getItem('hatch_guest_builds') || '0', 10)
      setGuestBuildsUsed(builds)
    }
    
    syncCredits()
    // Listen for storage changes from SectionBuilder
    window.addEventListener('storage', syncCredits)
    return () => window.removeEventListener('storage', syncCredits)
  }, [isSignedIn])

  const handleSaveSettings = async (settings: SiteSettings) => {
    if (!project) return
    
    // Handle Demo Mode - Update local state only (no persistence)
    if (demoMode) {
      const updatedBrandConfig: DbBrandConfig = {
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

      setProject(prev => prev ? ({ ...prev, brand_config: updatedBrandConfig }) : null)
      setBrandConfig(updatedBrandConfig)
      return
    }

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
      
      if (!response.ok) throw new Error('Failed to update settings')
      
      const data = await response.json()
      setProject(data.project)
      setBrandConfig(data.project.brand_config)
      
    } catch (err) {
      console.error('Error saving settings:', err)
    }
  }
  // Show unlock banner for guests or free users
  const showUnlockBanner = useMemo(() => !isSignedIn || (!isPaidUser && !demoMode), [isSignedIn, isPaidUser, demoMode])

  // NO MORE GENERATION LIMITS - Paywall is at DEPLOY/EXPORT only
  // Free users can generate unlimited, they pay to ship
  
  // Guest handoff REMOVED - Demo is a demo, users start fresh after signup

  // Handle Replicator Mode & Onboarding Mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const mode = params.get('mode')
    const data = params.get('data')

    if (mode === 'replicate' && data) {
      try {
        const replicationData = JSON.parse(decodeURIComponent(data)) as ReplicationData
        // Transform replication data into a template
        const replicatedTemplate: Template = {
          ...SINGULARITY_TEMPLATE,
          name: replicationData.projectName || 'Replicated Project',
          description: replicationData.description || 'Imported from URL',
          sections: (replicationData.sections ?? []).map((section, index) => ({
            id: section.type || `section-${index}`,
            name: section.type ? section.type.charAt(0).toUpperCase() + section.type.slice(1) : `Section ${index + 1}`,
            description: section.prompt || '',
            prompt: section.prompt || '',
            estimatedTime: '~20s',
            required: true,
            order: index + 1
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
            colors: {
              primary: '#10b981',
              secondary: '#09090b',
              accent: '#34d399'
            },
            fontStyle: 'Inter',
            styleVibe: 'modern'
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



  // Can deploy: Any paid tier (architect, visionary, singularity)
  const canDeploy = useMemo(() => {
    return accountSubscription?.status === 'active' && ['architect', 'visionary', 'singularity'].includes(accountSubscription.tier)
  }, [accountSubscription])
  
  // Visionary features: Custom domain, remove branding (visionary/singularity only)
  const isProUser = useMemo(() => {
    return accountSubscription?.status === 'active' && (accountSubscription.tier === 'visionary' || accountSubscription.tier === 'singularity')
  }, [accountSubscription])

  // Tier display config for badges and features
  const tierConfig = useMemo(() => {
    const tier = accountSubscription?.tier
    if (tier === 'singularity') return {
      name: 'Singularity',
      color: 'amber',
      icon: Crown,
      projectLimit: Infinity,
      features: ['Unlimited Projects', 'Custom Domains', 'Remove Branding', 'Commercial License', 'Priority Support'],
      gradient: 'from-amber-500 to-orange-500',
      badge: {
        wrapper: 'bg-gradient-to-r from-amber-500/10 to-orange-500/10',
        border: 'border-amber-500/30',
        icon: 'text-amber-300',
        text: 'text-amber-200'
      }
    }
    if (tier === 'visionary') return {
      name: 'Visionary',
      color: 'violet',
      icon: Zap,
      projectLimit: Infinity,
      features: ['Unlimited Projects', 'Custom Domains', 'Remove Branding', 'Evolution Engine'],
      gradient: 'from-violet-500 to-purple-500',
      badge: {
        wrapper: 'bg-gradient-to-r from-violet-500/10 to-purple-500/10',
        border: 'border-violet-500/30',
        icon: 'text-violet-200',
        text: 'text-violet-100'
      }
    }
    if (tier === 'architect') return {
      name: 'Architect',
      color: 'emerald',
      icon: Star,
      projectLimit: 3,
      features: ['3 Active Projects', 'Deploy to hatchitsites.dev', 'Code Download'],
      gradient: 'from-emerald-500 to-teal-500',
      badge: {
        wrapper: 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10',
        border: 'border-emerald-500/30',
        icon: 'text-emerald-200',
        text: 'text-emerald-100'
      }
    }
    return null
  }, [accountSubscription?.tier])

  // Check if project is paid (hatched) - now based on account subscription
  const isPaid = isPaidUser

  // The FULL section list for the template (used in review to show placeholders)
  const allTemplateSections = useMemo(() => {
    return customizedSections && customizedSections.length > 0
      ? customizedSections
      : selectedTemplate.sections
  }, [customizedSections, selectedTemplate])

  // All users can build all sections now
  // Free users get the full building experience, they just can't deploy/export
  // This showcases the full power of the platform to drive conversions
  const sectionsForBuild = useMemo(() => {
    return allTemplateSections
  }, [allTemplateSections])

  const templateForBuild = useMemo(() => {
    return { ...selectedTemplate, sections: sectionsForBuild }
  }, [selectedTemplate, sectionsForBuild])

  // Track if we're in the middle of creating a project to prevent reload
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const autoInitAttemptedRef = useRef(false)
  const previewIframeRef = useRef<HTMLIFrameElement>(null)

  // AUTO-INITIALIZATION LOGIC
  useEffect(() => {
    // Wait for auth to load before making decisions
    if (!isLoaded) return
    
    // If we have an existing project ID from URL, load it
    if (existingProjectId) {
      // Optimization: If we already have this project loaded, skip
      if (project?.id === existingProjectId) {
        return
      }

      loadExistingProject(existingProjectId)
      return
    }

    // If we just created a project, do nothing (we are already set up)
    if (justCreatedProjectId) {
      return
    }

    // If we already have a project loaded (e.g. via demo mode), skip
    if (project) {
      autoInitAttemptedRef.current = false
      return
    }

    // If we are already creating, wait
    if (isCreatingProject) {
      return
    }

    // For signed-in users: Check for last project in localStorage
    if (isSignedIn && !isDemo) {
      const lastProjectId = localStorage.getItem('hatch_current_project')
      if (lastProjectId) {
        console.log('[Builder] Resuming last project:', lastProjectId)
        loadExistingProject(lastProjectId)
        return
      }
    }

    // Otherwise, INITIALIZE A NEW PROJECT IMMEDIATELY
    if (autoInitAttemptedRef.current) {
      return
    }
    autoInitAttemptedRef.current = true
    initializeProject()
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingProjectId, justCreatedProjectId, isCreatingProject, isLoaded, isReplicationReady, isDemo, isSignedIn])

  const initializeProject = async () => {
    setIsCreatingProject(true)
    setIsLoading(true)
    
    // Use selected template (which might be replicated)
    const template = selectedTemplate
    // Use customized sections (which might be replicated)
    const sections = customizedSections.length > 0 ? customizedSections : template.sections
    
    // Use the prompt from First Contact if available
    const projectPrompt = initialPrompt
    
    const brand: DbBrandConfig = {
      brandName: brandConfig?.brandName || (template.name === 'The Singularity' ? 'Untitled Project' : template.name),
      colors: {
        primary: '#10b981', // Emerald-500
        secondary: '#09090b', // Zinc-950
        accent: '#34d399' // Emerald-400
      },
      fontStyle: 'Inter',
      styleVibe: brandConfig?.styleVibe || 'modern'
    }

    const setupDemoMode = (restoredData?: DemoRestoreData) => {
      const mockProjectId = `demo-${generateId()}`
      
      // Use restored data if available
      const finalBrand = restoredData?.brand || brand
      const finalSections: DbSection[] = restoredData?.sections
        ? restoredData.sections.map((section, index) => ({
            id: generateId(),
            project_id: mockProjectId,
            section_id: section.sectionId,
            code: section.code || null,
            user_prompt: section.userPrompt || null,
            refined: section.refined || false,
            refinement_changes: section.refinementChanges || null,
            status: section.code ? 'complete' : 'pending',
            order_index: index,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }))
        : sections.map((s, index) => ({
            id: generateId(),
            project_id: mockProjectId,
            section_id: s.id,
            code: null,
            user_prompt: index === 0 && projectPrompt ? projectPrompt : null,
            refined: false,
            refinement_changes: null,
            status: 'pending' as const,
            order_index: index,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }))

      const mockProject: DbProject = {
        id: mockProjectId,
        user_id: 'demo-user',
        name: finalBrand.brandName,
        slug: mockProjectId,
        template_id: restoredData?.templateId || template.id,
        status: 'building',
        brand_config: finalBrand,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      setProject(mockProject)
      setDbSections(finalSections)
      setBrandConfig(finalBrand)
      
      // Reconstruct build state from restored sections
      const state = createInitialBuildState(restoredData?.templateId || template.id)
      finalSections.forEach((s) => {
        if (s.status === 'complete') {
          state.completedSections.push(s.section_id)
          if (s.code) state.sectionCode[s.section_id] = s.code
          if (s.refined) state.sectionRefined[s.section_id] = true
          if (s.refinement_changes) state.sectionChanges[s.section_id] = s.refinement_changes
        }
      })
      
      // Find first pending section - but clamp to hero only for free/demo users
      // Demo users only have access to hero section, so if hero is complete,
      // keep index at 0 to show the completed preview instead of black screen
      const heroSection = finalSections.find((s) => s.section_id === 'hero')
      if (heroSection?.status === 'complete') {
        // Hero is done - stay on hero to show preview
        state.currentSectionIndex = 0
      } else {
        // Hero not done - find first pending (should be hero at index 0)
        const firstPending = finalSections.findIndex((s) => s.status === 'pending')
        state.currentSectionIndex = firstPending === -1 ? 0 : Math.min(firstPending, 0)
      }

      setBuildState(state)
      setPhase('building')
      setDemoMode(true)
      setIsCreatingProject(false)
      setIsLoading(false)
    }

    // If user is not signed in, redirect to sign up - NO MORE DEMO MODE LOOPHOLE
    if (!isSignedIn || !user) {
      // ALLOW GUEST MODE IF EXPLICITLY REQUESTED
      if (isDemo) {
        // Start fresh demo - no session restore (demo is ephemeral)
        setupDemoMode()
        return
      }

      // Track the gate hit
      track('Sign Up Gate Hit', { source: 'builder_init' })
      
      // Redirect to sign up page instead of entering demo mode
      // Preserving intent to return to builder AND keeping any replication/template params
      const currentParams = window.location.search
      const returnUrl = '/dashboard' + currentParams
      router.push(`/sign-up?redirect_url=${encodeURIComponent(returnUrl)}`)
      return
    }

    // Check project limit before attempting to create
    // If at limit, open an existing project instead of failing
    try {
      const listRes = await fetch('/api/project/list')
      if (listRes.ok) {
        const { projects } = await listRes.json()
        const accountSub = user.publicMetadata?.accountSubscription as { tier?: string } | undefined
        const tier = accountSub?.tier || 'free'
        const limit = (tier === 'singularity' || tier === 'visionary') ? Infinity : (tier === 'architect' ? 3 : 1)
        
        if (projects.length >= limit) {
          // At limit - open the most recent project instead of hard-failing
          const sorted = [...projects].sort((a: DbProject, b: DbProject) => {
            const aTime = a.updated_at ? new Date(a.updated_at).getTime() : 0
            const bTime = b.updated_at ? new Date(b.updated_at).getTime() : 0
            return bTime - aTime
          })
          const mostRecent = sorted[0]
          if (mostRecent?.id) {
            await loadExistingProject(mostRecent.id)
            return
          }
        }
      }
    } catch {
      // If check fails, continue and let project creation handle it
    }

    // Create fresh project for signed-in users (no guest handoff - demo is a demo)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout for creation

      let response: Response
      try {
        response = await fetch('/api/project', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateId: template.id,
            name: brand.brandName,
            sections: sections,
            brand: brand,
            initialPrompt: projectPrompt,
          }),
          signal: controller.signal,
        })
      } finally {
        clearTimeout(timeoutId)
      }

      if (!response.ok) {
        // If we hit a project limit (403), treat it as a normal control-plane state:
        // open the most recent existing project instead of throwing a scary console error.
        if (response.status === 403) {
          console.warn('[Builder] Project limit reached (403). Opening existing project…')
          try {
            // Try to confirm it really is the limit case, but don't depend on it.
            const body = (await response.json().catch(() => null)) as { error?: string } | null
            const isLimit = body?.error === 'Project limit reached'

            const listRes = await fetch('/api/project/list')
            if (listRes.ok) {
              const listData = (await listRes.json().catch(() => ({}))) as { projects?: unknown }
              const raw = Array.isArray(listData.projects) ? listData.projects : []
              const safe = (raw.filter(Boolean) as DbProject[])

              const sorted = safe.sort((a, b) => {
                const aTime = a?.updated_at ? new Date(a.updated_at).getTime() : 0
                const bTime = b?.updated_at ? new Date(b.updated_at).getTime() : 0
                return bTime - aTime
              })
              const mostRecent = sorted[0]
              if (mostRecent?.id) {
                if (isLimit) setError(null)
                await loadExistingProject(mostRecent.id)
                return
              }
            }
          } catch {
            // ignore and fall through to error
          }
        } else {
          console.error('[Builder] API failed:', response.status)
        }

        setError('Failed to create project. Please try again.')
        setIsLoading(false)
        return
      }

      const { project: newProject, sections: dbSectionsData } = await response.json()

      setProject(newProject)
      setDbSections(dbSectionsData)
      autoInitAttemptedRef.current = false
      
      // Set up build state for fresh project
      const state = createInitialBuildState(template.id)
      dbSectionsData.forEach((s: DbSection) => {
        if (s.status === 'complete') {
          state.completedSections.push(s.section_id)
          if (s.code) state.sectionCode[s.section_id] = s.code
          if (s.refined) state.sectionRefined[s.section_id] = true
          if (s.refinement_changes) state.sectionChanges[s.section_id] = s.refinement_changes
        }
      })
      const firstPending = dbSectionsData.findIndex((s: DbSection) => s.status === 'pending' || s.status === 'building')
      state.currentSectionIndex = firstPending === -1 ? Math.max(0, dbSectionsData.length - 1) : firstPending
      
      setBuildState(state)
      setPhase('building')
      
      setJustCreatedProjectId(newProject.id)
      router.replace(`/builder?project=${newProject.id}`, { scroll: false })
      localStorage.setItem('hatch_current_project', newProject.id)

    } catch (err) {
      // Aborts and transient network issues can surface as "Failed to fetch" depending on browser.
      const message = err instanceof Error ? err.message : String(err)
      const isAbort = err instanceof DOMException ? err.name === 'AbortError' : false
      const isFailedFetch = err instanceof TypeError && message.toLowerCase().includes('failed to fetch')

      if (isAbort) {
        setError('Project creation timed out. Please try again.')
      } else if (isFailedFetch) {
        setError('Network error creating project. Please retry.')
      } else {
        console.error('Error creating project:', err)
        setError('Failed to create project. Please try again.')
      }
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

      let response: Response
      try {
        response = await fetch(`/api/project/${projectId}`, { signal: controller.signal })
      } finally {
        clearTimeout(timeoutId)
      }
      
      if (response.status === 401 || response.status === 403 || response.status === 404) {
        localStorage.removeItem('hatch_current_project')
        
        if (response.status === 401) {
          router.replace('/dashboard', { scroll: false })
        } else if (window.location.pathname !== '/builder' || window.location.search) {
          router.replace('/builder', { scroll: false })
        }
        
        setJustCreatedProjectId(null)
        loadingProjectIdRef.current = null

        // Fall back to a fresh project so the UI doesn't stay blank
        await initializeProject()
        return
      }
      
      if (!response.ok) throw new Error('Failed to load project')
      
      const { project: proj, sections } = await response.json()
      
      // Use Singularity template if ID matches, otherwise fallback to website template
      const template = (proj.template_id === 'singularity' || proj.template_id === 'architect') ? SINGULARITY_TEMPLATE : (getTemplateById(proj.template_id) || websiteTemplate)

      setProject(proj)
      setDbSections(sections)
      setSelectedTemplate(template)
      autoInitAttemptedRef.current = false

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
      state.currentSectionIndex = firstPending === -1 ? Math.max(0, reconstructed.length - 1) : firstPending
      
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

    // Demo mode: track sections built for soft nudge
    if (!isSignedIn) {
      const newCount = demoSectionsBuilt + 1
      setDemoSectionsBuilt(newCount)
      if (newCount === 3) {
        setShowDemoNudge(true)
      }
    }

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
      // Stay on building phase - user can deploy from there
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
      
      // Scroll to section in preview iframe
      if (previewIframeRef.current?.contentWindow) {
        previewIframeRef.current.contentWindow.postMessage(
          { type: 'scrollToSection', sectionId: section.id },
          '*'
        )
      }
    }
  }

  const handleMoveSection = async (fromIndex: number, toIndex: number) => {
    if (!buildState) return
    if (fromIndex === toIndex) return
    if (fromIndex < 0 || toIndex < 0) return
    if (fromIndex >= sectionsForBuild.length || toIndex >= sectionsForBuild.length) return

    const pinnedTopId = 'header'
    const pinnedBottomId = 'footer'

    const fromId = sectionsForBuild[fromIndex]?.id
    const toId = sectionsForBuild[toIndex]?.id
    const lastIndex = sectionsForBuild.length - 1

    // Keep header at index 0 and footer at last index
    if (fromId === pinnedTopId || fromId === pinnedBottomId) return
    if (toIndex === 0 || toIndex === lastIndex) return
    if (toId === pinnedTopId || toId === pinnedBottomId) return

    const activeSectionId = sectionsForBuild[buildState.currentSectionIndex]?.id
    if (!activeSectionId) return

    const nextSections = (() => {
      const next = [...sectionsForBuild]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })()

    // Update section ordering used by the UI
    setCustomizedSections(nextSections)

    // Keep DB sections in the same order for any UI that relies on it
    setDbSections((prev) => {
      const nextOrderIds = new Set(nextSections.map(s => s.id))
      const bySectionId = new Map(prev.map(s => [s.section_id, s]))

      const ordered: DbSection[] = nextSections
        .map((s) => bySectionId.get(s.id))
        .filter((s): s is DbSection => !!s)
        .map((s, index) => ({ ...s, order_index: index }))

      // Preserve any sections that aren't in nextSections (shouldn't happen, but keep safe)
      const leftovers = prev.filter(s => !nextOrderIds.has(s.section_id))
      return [...ordered, ...leftovers]
    })

    // Maintain the currently active section by ID
    const nextActiveIndex = nextSections.findIndex(s => s.id === activeSectionId)
    if (nextActiveIndex !== -1) {
      setBuildState({ ...buildState, currentSectionIndex: nextActiveIndex })
    }

    // Persist ordering for live projects
    if (!demoMode && project?.id) {
      try {
        const response = await fetch(`/api/project/${project.id}/sections/order`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: nextSections.map(s => s.id) }),
        })
        if (!response.ok) {
          console.error('Failed to persist section order:', response.status)
        }
      } catch (err) {
        console.error('Failed to persist section order:', err)
      }
    }
  }

  const handleNextSection = () => {
    if (!buildState) return

    const nextIndex = buildState.currentSectionIndex + 1
    
    if (nextIndex >= sectionsForBuild.length) {
      // All sections done - stay on building phase, user can deploy from tabs
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

  // Add a new section of a specific type
  const handleAddSection = async (sectionType: string) => {
    if (!buildState) return

    // Define section metadata for each type
    const sectionMeta: Record<string, { name: string; description: string; prompt: string }> = {
      hero: { name: 'Hero', description: 'The main headline and call-to-action', prompt: 'Describe the main value proposition' },
      features: { name: 'Features', description: 'Showcase key features or benefits', prompt: 'List the main features to highlight' },
      services: { name: 'Services', description: 'Display your service offerings', prompt: 'Describe the services you offer' },
      about: { name: 'About', description: 'Tell your story', prompt: 'Share background info about you or your business' },
      testimonials: { name: 'Testimonials', description: 'Social proof from customers', prompt: 'Add customer testimonials or reviews' },
      pricing: { name: 'Pricing', description: 'Display pricing tiers', prompt: 'Describe your pricing structure' },
      stats: { name: 'Stats', description: 'Show key metrics and numbers', prompt: 'What numbers or achievements to highlight?' },
      work: { name: 'Work/Portfolio', description: 'Showcase your projects', prompt: 'Describe projects or work examples' },
      faq: { name: 'FAQ', description: 'Answer common questions', prompt: 'What questions do customers often ask?' },
      cta: { name: 'Call to Action', description: 'Drive user action', prompt: 'What action should visitors take?' },
      contact: { name: 'Contact', description: 'Contact information and form', prompt: 'How should people reach you?' },
    }

    const meta = sectionMeta[sectionType]
    if (!meta) return // Invalid section type

    // Check if this section type already exists
    const existingIndex = sectionsForBuild.findIndex(s => s.id === sectionType)
    if (existingIndex >= 0) {
      // Just navigate to the existing section instead of adding duplicate
      setBuildState({ ...buildState, currentSectionIndex: existingIndex })
      return
    }

    // Create the new section
    const newSection: Section = {
      id: sectionType,
      name: meta.name,
      description: meta.description,
      prompt: meta.prompt,
      estimatedTime: '~30 seconds',
      required: false,
      order: sectionsForBuild.length,
    }

    // Find the position to insert (before footer if it exists, otherwise at end)
    const footerIndex = sectionsForBuild.findIndex(s => s.id === 'footer')
    const insertAt = footerIndex >= 0 ? footerIndex : sectionsForBuild.length

    // Insert the new section
    const nextSections = [...sectionsForBuild]
    nextSections.splice(insertAt, 0, newSection)

    // Update sections
    setCustomizedSections(nextSections)

    // Create a placeholder dbSection for the new section (so it can be built)
    const placeholderDbSection: DbSection = {
      id: `temp-${sectionType}-${Date.now()}`, // Temporary ID
      project_id: project?.id || 'demo',
      section_id: sectionType,
      order_index: insertAt,
      status: 'pending',
      code: null,
      user_prompt: null,
      refined: false,
      refinement_changes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    // Insert dbSection at the right position
    setDbSections(prev => {
      const next = [...prev]
      next.splice(insertAt, 0, placeholderDbSection)
      return next
    })

    // Navigate to the new section
    setBuildState({ ...buildState, currentSectionIndex: insertAt })
    
    // Persist to DB if not in demo mode
    if (!demoMode && project?.id) {
      try {
        await fetch(`/api/project/${project.id}/sections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sectionId: sectionType, orderIndex: insertAt }),
        })
      } catch (err) {
        console.error('Failed to persist new section:', err)
      }
    }
  }

  // Remove a section by index
  const handleRemoveSection = (index: number) => {
    if (!buildState) return
    const section = sectionsForBuild[index]
    if (!section) return

    // Don't allow removing header/footer
    if (section.id === 'header' || section.id === 'footer') return

    // Remove the section
    const nextSections = sectionsForBuild.filter((_, i) => i !== index)
    setCustomizedSections(nextSections)

    // Also remove from dbSections if it exists
    setDbSections(prev => prev.filter(s => s.section_id !== section.id))

    // Adjust current section index if needed
    let nextIndex = buildState.currentSectionIndex
    if (index < nextIndex) {
      nextIndex = Math.max(0, nextIndex - 1)
    } else if (index === nextIndex) {
      nextIndex = Math.min(nextIndex, nextSections.length - 1)
    }
    setBuildState({ ...buildState, currentSectionIndex: nextIndex })
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

  // Prepare sections for the preview frame (array format for Babel processing)
  const previewSections = useMemo(() => {
    if (!buildState) return []
    
    return sectionsForBuild
      .filter(s => buildState.completedSections.includes(s.id))
      .map(s => ({
        id: s.id,
        code: buildState.sectionCode[s.id]
      }))
      .filter(s => !!s.code)
  }, [buildState, sectionsForBuild])

  const completedModuleCount = buildState?.completedSections.length ?? 0
  const totalModules = sectionsForBuild.length

  const builderTabs = useMemo(() => ([
    {
      id: 'building' as const,
      label: 'Build',
      meta: `${completedModuleCount}/${totalModules}`,
      icon: Layout,
      action: () => setPhase('building'),
      active: phase === 'building',
    },
    {
      id: 'oracle' as const,
      label: 'Assistant',
      meta: 'Help',
      icon: MessageSquare,
      action: () => setShowOracle(true),
      active: false,
    },
    {
      id: 'deploy' as const,
      label: 'Deploy',
      meta: canDeploy ? 'Ship it' : 'Upgrade',
      icon: Rocket,
      action: () => {
        if (!canDeploy || !assembledCode) {
          setHatchModalReason('deploy')
          setShowHatchModal(true)
          return
        }
        handleDeploy()
      },
      active: false,
      disabled: !canDeploy || !assembledCode,
    },
  ]), [completedModuleCount, totalModules, phase, canDeploy, assembledCode, handleDeploy])

  const BuilderTabRail = ({ variant = 'glass' }: { variant?: 'glass' | 'flat' }) => (
    <div
      className={
        variant === 'glass'
          ? 'border-b border-zinc-800/50 bg-zinc-900/30 backdrop-blur-xl'
          : 'border-b border-zinc-800/50 bg-zinc-950'
      }
    >
      <div className="flex gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3">
        {builderTabs.map((tab) => {
          const Icon = tab.icon
          const isDisabled = Boolean(tab.disabled)
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => !isDisabled && tab.action()}
              disabled={isDisabled}
              className={`group flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl border px-2 sm:px-3 py-1.5 sm:py-2 text-left transition-all ${
                tab.active
                  ? 'border-zinc-600 bg-zinc-800/80 text-white'
                  : 'border-zinc-800/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
              } ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <div className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md sm:rounded-lg ${
                tab.active ? 'bg-zinc-700 text-white' : 'bg-zinc-800/30 text-zinc-600'
              }`}>
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs sm:text-sm font-medium leading-tight">{tab.label}</p>
                <p className="text-[10px] sm:text-xs text-zinc-500">{tab.meta}</p>
              </div>
              {/* Mobile: just show label */}
              <span className="sm:hidden text-xs font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )

  // Direct checkout - skip modal, go straight to Stripe
  const handleDirectCheckout = async (tier: 'architect' | 'visionary' | 'singularity' = 'architect') => {
    // If not signed in, redirect to sign-up with tier pre-selected
    if (!isSignedIn) {
      const currentUrl = new URL(window.location.href)
      currentUrl.searchParams.set('upgrade', tier)
      router.push(`/sign-up?upgrade=${tier}&redirect_url=${encodeURIComponent(currentUrl.toString())}`)
      return
    }

    // Already paid? Just refresh to sync
    if (isPaidUser) {
      window.location.reload()
      return
    }

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })

      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else if (data.existingTier) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Direct checkout error:', error)
      // Fallback to modal
      setHatchModalReason('proactive')
      setShowHatchModal(true)
    }
  }

  async function handleDeploy() {
    if (!project || !assembledCode || isDeploying || !buildState) return
    
    // Guests: Always show signup modal for deploy
    if (!isSignedIn) {
      setHatchModalReason('deploy')
      setShowHatchModal(true)
      return
    }
    
    // Check if user has any paid subscription (Architect, Visionary, or Singularity can deploy)
    if (!canDeploy) {
      setHatchModalReason('deploy')
      setShowHatchModal(true)
      return
    }
    
    setIsDeploying(true)
    setError(null)
    
    try {
      // Process sections to create a valid single-file component
      const processedSections = sectionsForBuild
        .filter(s => buildState.sectionCode[s.id])
        .map((section, index) => {
          let code = buildState.sectionCode[section.id]
          
          // Strip directives and imports
          code = code
            .replace(/'use client';?/g, '')
            .replace(/"use client";?/g, '')
            .replace(/import\s+.*?from\s+['"][^'"]+['"];?\s*/g, '')

          // Transform export default function to a local const
          if (code.includes('export default function')) {
             code = code.replace(/export\s+default\s+function\s+(\w+)?/, (match, name) => {
               return `const Section_${index} = function ${name || 'Component'}`
             })
          } else if (code.includes('export default')) {
             code = code.replace(/export\s+default\s+/, `const Section_${index} = `)
          }
          
          return { code, index }
        })

      // Extract Lucide icon names from ALL sections
      const lucideIconRegex = /<([A-Z][a-zA-Z0-9]*)\s/g
      const potentialIcons = new Set<string>()
      
      // Scan original code for icons
      const fullSource = sectionsForBuild.map(s => buildState.sectionCode[s.id] || '').join('\n')
      let match
      while ((match = lucideIconRegex.exec(fullSource)) !== null) {
        const name = match[1]
        // Filter out known non-icon components
        if (!['AnimatePresence', 'Image', 'Link', 'Component', 'Fragment'].includes(name)) {
          potentialIcons.add(name)
        }
      }
      
      // Build the imports string
      const lucideImports = potentialIcons.size > 0 
        ? `import { ${Array.from(potentialIcons).join(', ')} } from 'lucide-react'\n`
        : ''
      
      const wrappedCode = `'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
${lucideImports}

// --- SECTIONS ---
${processedSections.map(s => s.code).join('\n\n')}

// --- MAIN PAGE ---
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
        body: JSON.stringify({
          code: wrappedCode,
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
          setWitnessNote("System check complete. Your creation is ready.")
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

  const handleDownload = async () => {
    if (!project || !assembledCode || !buildState) return
    
    // Guests: Always show signup modal for download
    if (!isSignedIn) {
      setHatchModalReason('download')
      setShowHatchModal(true)
      return
    }
    
    // Only Visionary and Singularity can download code - Architect cannot
    if (!isProUser) {
      setHatchModalReason('download')
      setShowHatchModal(true)
      return
    }
    
    try {
      // Process sections to create a valid single-file component
      const processedSections = sectionsForBuild
        .filter(s => buildState.sectionCode[s.id])
        .map((section, index) => {
          let code = buildState.sectionCode[section.id]
          
          // Strip directives and imports
          code = code
            .replace(/'use client';?/g, '')
            .replace(/"use client";?/g, '')
            .replace(/import\s+.*?from\s+['"][^'"]+['"];?\s*/g, '')

          // Transform export default function to a local const
          if (code.includes('export default function')) {
             code = code.replace(/export\s+default\s+function\s+(\w+)?/, (match, name) => {
               return `const Section_${index} = function ${name || 'Component'}`
             })
          } else if (code.includes('export default')) {
             code = code.replace(/export\s+default\s+/, `const Section_${index} = `)
          }
          
          return { code, index }
        })

      // Extract Lucide icon names from ALL sections
      const lucideIconRegex = /<([A-Z][a-zA-Z0-9]*)\s/g
      const potentialIcons = new Set<string>()
      
      // Scan original code for icons
      const fullSource = sectionsForBuild.map(s => buildState.sectionCode[s.id] || '').join('\n')
      let match
      while ((match = lucideIconRegex.exec(fullSource)) !== null) {
        const name = match[1]
        // Filter out known non-icon components
        if (!['AnimatePresence', 'Image', 'Link', 'Component', 'Fragment'].includes(name)) {
          potentialIcons.add(name)
        }
      }
      
      // Build the imports string
      const lucideImports = potentialIcons.size > 0 
        ? `import { ${Array.from(potentialIcons).join(', ')} } from 'lucide-react'\n`
        : ''
      
      const wrappedCode = `'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
${lucideImports}

// --- SECTIONS ---
${processedSections.map(s => s.code).join('\n\n')}

// --- MAIN PAGE ---
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
          assets: [] // Future: Include uploaded images/assets from sections
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
  }

  const handleGitHubPush = async () => {
    if (!assembledCode || !buildState) return
    
    // If not connected to GitHub, initiate OAuth
    if (!github.connected) {
      github.connect()
      return
    }
    
    // Generate default repo name from project
    const defaultName = project?.name?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'hatchit-site'
    if (!githubRepoName) {
      setGithubRepoName(defaultName)
    }
    
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
    
    // Push to GitHub
    const result = await github.push(
      githubRepoName || defaultName,
      assembledCode,
      undefined, // pages - single page for now
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
  }

  const handleRunAudit = async () => {
    if (!project || !buildState || demoMode) return

    setIsAuditRunning(true)

    try {
      const response = await fetch(`/api/project/${project.id}/audit`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Audit failed')

      const { changes, scores, passed } = await response.json() as {
        changes?: Array<string | { fix?: string }>
        scores?: BuildState['auditScores']
        passed?: boolean
      }
      
      // Convert changes objects to strings if necessary
      const changeStrings = Array.isArray(changes)
        ? changes
            .map((c) => (typeof c === 'string' ? c : (c?.fix || '')))
            .filter(Boolean)
        : []

      setBuildState({
        ...buildState,
        finalAuditComplete: true,
        finalAuditChanges: changeStrings,
        auditScores: scores,
        auditPassed: passed
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

  // Skip loading UI - pages handle their own loading states
  if (isLoading && !skipLoadingScreen) {
    return null
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
  
  // Note: Loading is handled above with skipLoadingScreen check
  // phase === 'initializing' is handled there too

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Paywall Transition - Full screen immersive */}
      {showPaywallTransition && (
        <PaywallTransition
          reason={paywallReason}
          onClose={() => setShowPaywallTransition(false)}
        />
      )}
      
      <AnimatePresence mode="wait">
        {phase === 'building' && templateForBuild && buildState ? (
          <motion.div
            key="building"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex flex-col h-screen overflow-hidden bg-zinc-950 text-white"
          >
            <div className="pointer-events-none absolute inset-0 bg-zinc-950" />
            <div 
              className="builder-ambient-glow pointer-events-none absolute top-[-100px] left-1/2 -translate-x-1/2 w-[1000px] h-[700px]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent" />

            {/* Top Header - Dense, professional */}
            <div className="relative z-20 flex-shrink-0 h-12 border-b border-zinc-800/50 bg-zinc-950/90 backdrop-blur-xl">
              <div className="h-full px-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Mobile Sidebar Toggle */}
                  <button
                    onClick={() => setShowMobileSidebar(true)}
                    className="xl:hidden p-1.5 -ml-1 text-zinc-500 hover:text-white transition-colors"
                    aria-label="Open sections"
                  >
                    <Menu className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="p-1.5 text-zinc-500 hover:text-white transition-colors"
                    aria-label="Back to dashboard"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center gap-1.5">
                  {/* Progress counter */}
                  <span className="text-[10px] text-zinc-600 tabular-nums hidden lg:inline mr-2">{buildState.currentSectionIndex + 1}/{sectionsForBuild.length}</span>
                  
                  {/* Mobile Sections */}
                  <button
                    onClick={() => setShowMobileSidebar(true)}
                    className="xl:hidden p-1.5 text-zinc-500 hover:text-white transition-colors"
                    aria-label="View sections"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  
                  {/* Export */}
                  <button
                    onClick={handleDownload}
                    disabled={!assembledCode}
                    className="p-1.5 text-zinc-500 hover:text-white transition-colors disabled:opacity-40"
                    title="Export ZIP"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  
                  {/* Ship */}
                  {deployedUrl ? (
                    <a
                      href={deployedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-emerald-500 text-white rounded-md hover:bg-emerald-400 transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Live</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <Button
                      onClick={handleDeploy}
                      disabled={!assembledCode || isDeploying}
                      loading={isDeploying}
                      size="sm"
                      icon={<Rocket className="w-3.5 h-3.5" />}
                      iconPosition="left"
                    >
                      Ship
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="relative z-10 flex flex-1 min-h-0 overflow-hidden">
            {/* Mobile Sidebar Drawer */}
            <AnimatePresence>
              {showMobileSidebar && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 xl:hidden"
                    onClick={() => setShowMobileSidebar(false)}
                  />
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed inset-y-0 left-0 w-72 z-50 xl:hidden"
                  >
                    <div className="h-full bg-zinc-900 border-r border-zinc-800 shadow-2xl">
                      {/* Close button */}
                      <button
                        onClick={() => setShowMobileSidebar(false)}
                        className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-colors z-10"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <Sidebar
                        userTier={demoMode ? 'demo' : (accountSubscription?.status === 'active' ? accountSubscription?.tier : 'free') as 'demo' | 'free' | 'architect' | 'visionary' | 'singularity'}
                        projectName={project?.name || brandConfig?.brandName || (demoMode ? 'Demo Project' : 'Untitled Project')}
                        currentSection={buildState.currentSectionIndex + 1}
                        totalSections={sectionsForBuild.length}
                        sectionNames={sectionsForBuild.map(s => s.name)}
                        sectionIds={sectionsForBuild.map(s => s.id)}
                        completedSectionIds={buildState.completedSections}
                        isGenerating={false}
                        isHealing={isHealing}
                        lastHealMessage={lastHealMessage ?? undefined}
                        onAddSection={() => {
                          if (buildState.currentSectionIndex < sectionsForBuild.length - 1) {
                            handleNextSection()
                          }
                        }}
                        onAddSectionOfType={(type) => {
                          handleAddSection(type)
                          setShowMobileSidebar(false)
                        }}
                        onRemoveSection={handleRemoveSection}
                        onSelectSection={(index) => {
                          handleSectionClick(index)
                          setShowMobileSidebar(false)
                        }}
                        onMoveSection={handleMoveSection}
                        onOpenOracle={() => {
                          setShowOracle(true)
                          setShowMobileSidebar(false)
                        }}
                        onOpenWitness={() => {
                          setShowWitness(true)
                          setShowMobileSidebar(false)
                        }}
                        onOpenArchitect={() => {
                          setShowArchitect(true)
                          setShowMobileSidebar(false)
                        }}
                        onOpenSettings={() => {
                          setIsSettingsOpen(true)
                          setShowMobileSidebar(false)
                        }}
                        onSignUp={demoMode ? () => router.push('/sign-up?redirect_url=/builder') : undefined}
                      />
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Sidebar - XL screens and up */}
            <div className="hidden xl:flex w-64 flex-shrink-0 flex-col border-r border-zinc-800 bg-zinc-900/30 backdrop-blur-xl overflow-y-auto">
              <Sidebar
                userTier={demoMode ? 'demo' : (accountSubscription?.status === 'active' ? accountSubscription?.tier : 'free') as 'demo' | 'free' | 'architect' | 'visionary' | 'singularity'}
                projectName={project?.name || brandConfig?.brandName || (demoMode ? 'Demo Project' : 'Untitled Project')}
                currentSection={buildState.currentSectionIndex + 1}
                totalSections={sectionsForBuild.length}
                sectionNames={sectionsForBuild.map(s => s.name)}
                sectionIds={sectionsForBuild.map(s => s.id)}
                completedSectionIds={buildState.completedSections}
                isGenerating={false}
                isHealing={isHealing}
                lastHealMessage={lastHealMessage ?? undefined}
                onAddSection={() => {
                  if (buildState.currentSectionIndex < sectionsForBuild.length - 1) {
                    handleNextSection()
                  }
                }}
                onAddSectionOfType={handleAddSection}
                onRemoveSection={handleRemoveSection}
                onSelectSection={handleSectionClick}
                onMoveSection={handleMoveSection}
                onOpenOracle={() => setShowOracle(true)}
                onOpenWitness={() => {
                  setShowWitness(true)
                  if (demoMode) {
                    setIsWitnessLoading(true)
                    fetch('/api/witness', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        context: 'Demo user exploring the builder',
                        prompt: 'A user is trying out the demo builder for the first time',
                        isDemo: true
                      })
                    })
                      .then(res => res.json())
                      .then(data => {
                        setWitnessNote(data.note || "Welcome to the Singularity. I'm here to guide your creative journey.")
                        setIsWitnessLoading(false)
                      })
                      .catch(() => {
                        setWitnessNote("Welcome to the Singularity. I'm here to guide your creative journey.")
                        setIsWitnessLoading(false)
                      })
                  }
                }}
                onOpenArchitect={() => setShowArchitect(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onSignUp={demoMode ? () => router.push('/sign-up?redirect_url=/builder') : undefined}
              />
            </div>

            {/* Main Build Area - Glass container with padding */}
            <div className="flex-1 flex flex-col overflow-hidden p-2 sm:p-3 lg:p-4">
              {/* Mobile Tab Switcher for Build/Preview */}
              <div className="flex lg:hidden mb-2 sm:mb-3">
                <div className="flex w-full bg-zinc-900/50 rounded-lg p-0.5 border border-zinc-800/50 backdrop-blur-xl">
                  <button
                    onClick={() => setBuildMobileTab('build')}
                    className={`flex-1 py-2 text-xs font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-1.5 ${
                      buildMobileTab === 'build' 
                        ? 'bg-zinc-800 text-white shadow-sm' 
                        : 'text-zinc-400 hover:text-zinc-300'
                    }`}
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>Build</span>
                  </button>
                  <button
                    onClick={() => setBuildMobileTab('preview')}
                    className={`flex-1 py-2 text-xs font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-1.5 ${
                      buildMobileTab === 'preview' 
                        ? 'bg-zinc-800 text-white shadow-sm' 
                        : 'text-zinc-400 hover:text-zinc-300'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                </div>
              </div>
              
              {/* Glass container wrapper */}
              <div className="flex-1 flex min-h-0 overflow-hidden rounded-2xl border border-zinc-700/30 bg-zinc-900/40 backdrop-blur-2xl shadow-2xl shadow-black/20">
                {getCurrentSection() && getCurrentDbSection() && (project?.id || getCurrentDbSection()!.project_id) && (
                  <div className={`flex-1 overflow-hidden ${buildMobileTab === 'build' ? 'flex' : 'hidden'} lg:flex`}>
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
                      isDemo={isDemo}
                      initialPrompt={buildState.currentSectionIndex === 0 ? initialPrompt : undefined}
                      onHealingStateChange={(healing, message) => {
                        setIsHealing(healing)
                        if (message) setLastHealMessage(message)
                      }}
                      onOpenAssistant={() => setShowOracle(true)}
                      onOpenPromptHelper={() => setShowArchitect(true)}
                    />
                  </div>
                )}
                
                {/* Mobile Preview Panel - visible when preview tab active */}
                {buildMobileTab === 'preview' && previewSections.length > 0 && (
                  <div className="flex-1 flex lg:hidden flex-col overflow-hidden">
                    <FullSitePreviewFrame 
                      sections={previewSections}
                      deviceView="mobile"
                      seo={brandConfig?.seo ? {
                        title: brandConfig.seo.title || '',
                        description: brandConfig.seo.description || '',
                        keywords: brandConfig.seo.keywords || ''
                      } : undefined}
                    />
                  </div>
                )}
                
                {buildMobileTab === 'preview' && previewSections.length === 0 && (
                  <div className="flex-1 flex lg:hidden items-center justify-center">
                    <div className="text-center p-6">
                      <Eye className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                      <p className="text-sm text-zinc-500">Build a section to see preview</p>
                    </div>
                  </div>
                )}

                {getCurrentSection() && getCurrentDbSection() && !(project?.id || getCurrentDbSection()!.project_id) && (
                  <div className="flex-1 flex items-center justify-center px-10 text-center">
                    <div className="max-w-sm">
                      <p className="text-xs text-zinc-500 mb-4">Project data unavailable</p>
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => window.location.reload()}
                          className="px-3 py-1.5 text-xs rounded-md border border-zinc-800 bg-zinc-900 text-white hover:border-zinc-700"
                        >
                          Refresh
                        </button>
                        <button
                          onClick={handleStartFresh}
                          className="px-3 py-1.5 text-xs rounded-md border border-zinc-800 text-zinc-400 hover:border-zinc-700"
                        >
                          Start Fresh
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {getCurrentSection() && !getCurrentDbSection() && (
                  <div className="flex-1 flex items-center justify-center px-10 text-center">
                    <div className="max-w-sm">
                      <p className="text-xs text-zinc-500 mb-4">Section not found in project</p>
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={handleStartFresh}
                          className="px-3 py-1.5 text-xs rounded-md border border-zinc-800 bg-zinc-900 text-white hover:border-zinc-700"
                        >
                          Start Fresh
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Desktop Live Preview Panel - Responsive, fills available space */}
                <div className="hidden lg:flex flex-1 flex-col border-l border-zinc-800/30 bg-zinc-950/50 min-w-[400px]">
                  {/* Preview Header - Minimal */}
                  <div className="flex-shrink-0 h-10 px-4 border-b border-zinc-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-xs text-zinc-400 font-medium">Live Preview</span>
                    </div>
                    
                    {previewSections.length > 0 && (
                      <div className="flex items-center gap-2">
                        {/* Edit Toggle */}
                        <button
                          onClick={() => setPreviewEditMode(!previewEditMode)}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all ${
                            previewEditMode ? 'text-white bg-zinc-700' : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                          title={previewEditMode ? 'Editing enabled' : 'Enable text editing'}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          {previewEditMode && <span>Edit Mode</span>}
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Preview Content - Scales to fit */}
                  <div className="flex-1 overflow-hidden relative bg-zinc-900/30 p-4">
                    {previewSections.length > 0 ? (
                      <div className="w-full h-full rounded-lg overflow-hidden border border-zinc-800/50 bg-white shadow-2xl">
                        <FullSitePreviewFrame 
                          sections={previewSections}
                          deviceView="desktop"
                          ref={previewIframeRef}
                          seo={brandConfig?.seo ? {
                            title: brandConfig.seo.title || '',
                            description: brandConfig.seo.description || '',
                            keywords: brandConfig.seo.keywords || ''
                          } : undefined}
                        />
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                          <Eye className="w-6 h-6 text-zinc-700 mx-auto mb-2" />
                          <p className="text-sm text-zinc-500">Build a section to see preview</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            </div>
          </motion.div>
        ) : null}
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
              <div className="px-3 py-2.5 sm:px-6 sm:py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-4">
                  <button
                    onClick={handleGoHome}
                    className="text-zinc-500 hover:text-white transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </button>
                  <div className="h-5 sm:h-6 w-px bg-zinc-800 hidden sm:block" />
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                      <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400" />
                    </div>
                    <h1 className="text-base sm:text-lg font-semibold text-white tracking-tight truncate max-w-[120px] sm:max-w-none">{project?.name || 'Untitled Project'}</h1>
                  </div>
                  
                  {/* Tier Badge */}
                  {tierConfig?.badge && (
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${tierConfig.badge.border} ${tierConfig.badge.wrapper}`}>
                      <tierConfig.icon className={`w-3.5 h-3.5 ${tierConfig.badge.icon}`} />
                      <span className={`text-xs font-bold uppercase tracking-wider ${tierConfig.badge.text}`}>
                        {tierConfig.name}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 sm:gap-3">
                  <button
                    onClick={handleStartFresh}
                    className="hidden sm:block px-4 py-2.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors font-medium"
                  >
                    New Project
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={!assembledCode}
                    className="px-3 py-2 sm:px-4 sm:py-2.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors font-medium flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                  
                  {/* Deploy Options Dropdown */}
                  <div className="relative">
                    {deployedUrl ? (
                      <a
                        href={deployedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-white text-zinc-900 border border-zinc-200 rounded-lg hover:bg-zinc-100 transition-colors flex items-center gap-1.5 sm:gap-2 font-medium"
                      >
                        <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Live</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <button
                        onClick={() => setShowDeployOptions(!showDeployOptions)}
                        disabled={!assembledCode}
                        className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group ${
                          tierConfig?.color === 'amber' 
                            ? 'bg-white text-zinc-900 hover:bg-zinc-100'
                            : tierConfig?.color === 'lime'
                            ? 'bg-white text-zinc-900 hover:bg-zinc-100'
                            : 'bg-white text-zinc-900 hover:bg-zinc-100'
                        }`}
                      >
                        <Rocket className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>Ship</span>
                        <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                    
                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {showDeployOptions && !deployedUrl && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowDeployOptions(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 top-full mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden"
                          >
                            <div className="p-2">
                              {/* Push to GitHub */}
                              <button
                                onClick={() => {
                                  setShowDeployOptions(false)
                                  handleGitHubPush()
                                }}
                                disabled={github.pushing}
                                className="w-full flex items-center gap-3 p-3 hover:bg-zinc-800 rounded-lg transition-colors text-left group"
                              >
                                <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center">
                                  <Github className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-white group-hover:text-zinc-200">
                                    {github.connected ? 'Push to GitHub' : 'Connect GitHub'}
                                  </p>
                                  <p className="text-xs text-zinc-500">
                                    {github.connected ? `@${github.username}` : 'Your repo, your code'}
                                  </p>
                                </div>
                                {github.pushing && <RefreshCw className="w-4 h-4 text-zinc-500 animate-spin" />}
                              </button>
                              
                              {/* Deploy to hatchitsites.dev */}
                              <button
                                onClick={() => {
                                  setShowDeployOptions(false)
                                  handleDeploy()
                                }}
                                disabled={isDeploying}
                                className="w-full flex items-center gap-3 p-3 hover:bg-zinc-800 rounded-lg transition-colors text-left group"
                              >
                                <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center">
                                  <Rocket className="w-5 h-5 text-zinc-400" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-white group-hover:text-zinc-200">Deploy to HatchIt</p>
                                  <p className="text-xs text-zinc-500">Live on hatchitsites.dev</p>
                                </div>
                                {!canDeploy && <Lock className="w-4 h-4 text-zinc-500" />}
                              </button>
                              
                              {/* Download ZIP */}
                              <button
                                onClick={() => {
                                  setShowDeployOptions(false)
                                  handleDownload()
                                }}
                                className="w-full flex items-center gap-3 p-3 hover:bg-zinc-800 rounded-lg transition-colors text-left group"
                              >
                                <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center">
                                  <Download className="w-5 h-5 text-zinc-400" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-white group-hover:text-zinc-200">Download ZIP</p>
                                  <p className="text-xs text-zinc-500">Full Next.js project</p>
                                </div>
                              </button>
                            </div>
                            
                            {/* GitHub Push Result */}
                            {githubPushResult?.success && (
                              <div className="border-t border-zinc-800 p-3 bg-zinc-800/50">
                                <p className="text-xs text-white font-medium mb-2">Pushed to GitHub</p>
                                <div className="flex gap-2">
                                  <a
                                    href={githubPushResult.repoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 text-xs text-center py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white"
                                  >
                                    View Repo
                                  </a>
                                  <a
                                    href={githubPushResult.vercelImportUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 text-xs text-center py-2 bg-white text-black hover:bg-zinc-200 rounded-lg font-medium"
                                  >
                                    Deploy on Vercel →
                                  </a>
                                </div>
                              </div>
                            )}
                            {githubPushResult?.error && (
                              <div className="border-t border-zinc-800 p-3 bg-red-500/5">
                                <p className="text-xs text-red-400">{githubPushResult.error}</p>
                              </div>
                            )}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
              {error && (
                <div className="px-3 sm:px-6 pb-2 sm:pb-3">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 flex items-center gap-2 backdrop-blur-xl"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {error}
                    <button onClick={() => setError(null)} className="ml-auto text-red-400/60 hover:text-red-400" aria-label="Dismiss error">
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                </div>
              )}
            </div>

            <BuilderTabRail variant="flat" />

            {/* Main Content - Split Panel */}
            <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
              
              {/* Mobile Tab Switcher for Review */}
              <div className="flex md:hidden border-b border-zinc-800/50 bg-zinc-950 p-1.5">
                <div className="flex w-full bg-zinc-900/50 rounded-lg p-0.5 border border-zinc-800/50">
                  <button
                    onClick={() => setReviewMobileTab('modules')}
                    className={`flex-1 py-2 text-xs font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-1.5 ${
                      reviewMobileTab === 'modules' 
                        ? 'bg-zinc-800 text-white shadow-sm' 
                        : 'text-zinc-400 hover:text-zinc-300'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Modules</span>
                  </button>
                  <button
                    onClick={() => setReviewMobileTab('preview')}
                    className={`flex-1 py-2 text-xs font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-1.5 ${
                      reviewMobileTab === 'preview' 
                        ? 'bg-zinc-800 text-white shadow-sm' 
                        : 'text-zinc-400 hover:text-zinc-300'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                </div>
              </div>

              {/* Left Panel - Section List */}
              <div className={`
                ${reviewMobileTab === 'modules' ? 'flex' : 'hidden'} md:flex
                w-full md:w-72 border-r border-zinc-800/50 flex-col bg-zinc-900/20 overflow-hidden
              `}>
                <div className="p-3 sm:p-4 border-b border-zinc-800/50">
                  <h2 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Your Full Site</h2>
                  {!isPaidUser && (
                    <p className="text-xs text-zinc-500 mt-1">Hero complete • {allTemplateSections.length - 1} sections ready to customize</p>
                  )}
                </div>
                <div className="flex-1 overflow-auto p-1.5 sm:p-2 space-y-0.5 sm:space-y-1">
                  {/* Show only completed hero section */}
                  {allTemplateSections.filter(section => buildState.completedSections.includes(section.id)).map((section, index) => {
                    const isCompleted = buildState.completedSections.includes(section.id)
                    
                    return (
                      <button
                        key={section.id}
                        onClick={() => {
                          if (isCompleted) {
                            // Go back to building mode for this section
                            const sectionIndex = sectionsForBuild.findIndex(s => s.id === section.id)
                            if (sectionIndex >= 0) {
                              setBuildState(prev => prev ? ({ ...prev, currentSectionIndex: sectionIndex }) : null)
                              setPhase('building')
                            }
                          }
                        }}
                        className="w-full text-left p-2 sm:p-3 rounded-lg mb-0.5 sm:mb-1 transition-all group hover:bg-zinc-800/50 border border-transparent cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded flex items-center justify-center text-xs bg-zinc-800 text-zinc-400 border border-zinc-700">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium truncate text-zinc-200 group-hover:text-white">{section.name}</h3>
                          </div>
                          <Edit3 className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400" />
                        </div>
                      </button>
                    )
                  })}
                </div>
                
                {/* Run Audit Button */}
                <div className="p-4 border-t border-zinc-800 bg-zinc-900/20">
                  <button
                    onClick={handleRunAudit}
                    disabled={isAuditRunning}
                    className="w-full py-3 text-sm bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg hover:bg-zinc-700 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 group font-medium"
                  >
                    {isAuditRunning ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Running Diagnostics...</span>
                      </>
                    ) : (
                      <>
                        <Terminal className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200" />
                        <span>Run System Audit</span>
                      </>
                    )}
                  </button>
                  {buildState.finalAuditComplete && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-xs text-zinc-400 font-mono bg-zinc-800 py-1.5 rounded border border-zinc-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Optimized: {buildState.finalAuditChanges?.length || 0} improvements</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel - Full Site Preview */}
              <div className={`
                ${reviewMobileTab === 'preview' ? 'flex' : 'hidden'} md:flex
                flex-1 flex-col bg-zinc-950 min-h-0 relative
              `}>
                
                {/* Preview Header */}
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between relative z-10 bg-zinc-950">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                    <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Live Preview</h3>
                  </div>
                </div>

                {/* Preview Container - Responsive Desktop */}
                <div className="flex-1 overflow-auto relative z-0">
                    <FullSitePreviewFrame 
                      sections={previewSections} 
                      deviceView="desktop"
                      seo={project?.brand_config?.seo}
                    />
                </div>
              </div>
            </div>



            {/* Success Modal after Deploy - "Ship it. Share it." */}
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
                    
                    <div className="text-center relative z-10">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
                        className="w-20 h-20 mx-auto mb-6 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center"
                      >
                        <Rocket className="w-10 h-10 text-emerald-400" />
                      </motion.div>
                      <h2 className="text-2xl font-bold text-white mb-2">Ship it. Share it.</h2>
                      <p className="text-zinc-400 mb-6">Your site is live — now show it off.</p>
                      
                      {/* Big prominent share button */}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(deployedUrl)
                          setShareUrlCopied(true)
                          setTimeout(() => setShareUrlCopied(false), 2000)
                        }}
                        className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/40 hover:bg-emerald-500/30 text-white font-semibold rounded-xl transition-colors group mb-4"
                      >
                        {shareUrlCopied ? (
                          <>
                            <Check className="w-5 h-5" />
                            <span>Link Copied!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-5 h-5" />
                            <span>Copy Share Link</span>
                          </>
                        )}
                      </button>
                      
                      <a
                        href={deployedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium rounded-xl hover:bg-zinc-800 hover:text-white transition-colors group"
                      >
                        <Globe className="w-5 h-5" />
                        <span>View Live Site</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </a>
                      
                      <div className="mt-4 p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                        <code className="text-xs text-zinc-400 font-mono break-all">{deployedUrl}</code>
                      </div>
                    </div>

                    {/* Next Steps - Tier-aware */}
                    <div className="mt-8 pt-6 border-t border-zinc-800 relative z-10">
                      <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4">What's Next</h3>
                      <div className="space-y-2">
                        {/* Push to GitHub */}
                        <button
                          onClick={() => {
                            setDeployedUrl(null)
                            handleGitHubPush()
                          }}
                          disabled={github.pushing}
                          className="w-full flex items-center gap-3 p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors text-left group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                            <Github className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white group-hover:text-emerald-300 transition-colors">
                              {github.connected ? 'Push to GitHub' : 'Connect GitHub'}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {github.connected ? `Own your code @${github.username}` : 'Your repo, your control'}
                            </p>
                          </div>
                          {github.pushing && <RefreshCw className="w-4 h-4 text-zinc-500 animate-spin" />}
                        </button>
                        
                        <button
                          onClick={() => setDeployedUrl(null)}
                          className="w-full flex items-center gap-3 p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors text-left group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                            <Edit3 className="w-4 h-4 text-teal-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white group-hover:text-teal-300 transition-colors">Continue Building</p>
                            <p className="text-xs text-zinc-500">Refine sections and add new modules</p>
                          </div>
                        </button>
                        
                        {/* Pro Feature: Custom Domain */}
                        {isProUser ? (
                          <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="w-full flex items-center gap-3 p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors text-left group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                              <Globe className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white group-hover:text-emerald-300 transition-colors">Connect Custom Domain</p>
                              <p className="text-xs text-zinc-500">Use your own domain name</p>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-400 bg-zinc-800 px-2 py-0.5 rounded">PRO</span>
                          </button>
                        ) : (
                          <div className="w-full flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-lg opacity-50 cursor-not-allowed">
                            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                              <Globe className="w-4 h-4 text-zinc-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-zinc-500">Custom Domain</p>
                              <p className="text-xs text-zinc-600">Upgrade to Pro to unlock</p>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">PRO</span>
                          </div>
                        )}
                        
                        <button
                          onClick={handleStartFresh}
                          className="w-full flex items-center gap-3 p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors text-left group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                            <Plus className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white group-hover:text-emerald-300 transition-colors">Start New Project</p>
                            <p className="text-xs text-zinc-500">
                              {tierConfig?.projectLimit === Infinity 
                                ? 'Unlimited projects on your plan' 
                                : `${tierConfig?.projectLimit || 3} projects on your plan`}
                            </p>
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
        reason={hatchModalReason}
      />

      {/* Builder Welcome - first-time orientation for authenticated users */}
      {showBuilderWelcome && (
        <BuilderWelcome onClose={() => setShowBuilderWelcome(false)} />
      )}

      {/* Demo Welcome - orientation for demo/guest users */}
      {showDemoWelcome && (
        <DemoWelcome onClose={() => setShowDemoWelcome(false)} />
      )}

      {/* Build Success Modal - celebration + upgrade nudge for guests */}
      <BuildSuccessModal
        isOpen={showBuildSuccess}
        onClose={() => setShowBuildSuccess(false)}
        onContinue={() => {
          setShowBuildSuccess(false)
          track('Build Success Modal - Continue')
        }}
        onUpgrade={() => {
          setShowBuildSuccess(false)
          setHatchModalReason('proactive')
          setShowHatchModal(true)
          track('Build Success Modal - Upgrade')
        }}
        sectionName={lastCompletedSection}
        buildsRemaining={Math.max(0, 3 - guestBuildsUsed)}
        isGuest={!isSignedIn}
      />

      <TheWitness
        isOpen={showWitness}
        onClose={() => setShowWitness(false)}
        note={witnessNote}
        isLoading={isWitnessLoading}
      />

      <WelcomeModal 
        trigger="manual" 
        isOpen={showSignupGate} 
        onClose={() => {
          // If they close it, they stay on the current section but can't advance
          // We don't force it open, but the "Next" button will trigger it again
          setShowSignupGate(false)
        }} 
      />

      {/* Demo Soft Nudge - non-blocking prompt to sign up after 3 sections */}
      <AnimatePresence>
        {showDemoNudge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDemoNudge(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-black/90 border border-white/10 rounded-xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                  <Sparkles className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Momentum Building</h3>
                <p className="text-zinc-400 text-sm">
                  You&apos;ve built {demoSectionsBuilt} sections. Sign up to save your work and unlock deploy + download.
                </p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowDemoNudge(false)
                    router.push('/sign-up?redirect_url=/dashboard')
                  }}
                  className="w-full py-3 px-4 bg-emerald-500/15 border border-emerald-500/40 hover:bg-emerald-500/20 hover:border-emerald-500/50 text-white font-semibold rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center justify-center gap-2"
                >
                  <span>Sign Up Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowDemoNudge(false)}
                  className="w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
                >
                  Keep Building
                </button>
              </div>
              
              <p className="text-xs text-zinc-500 text-center mt-4">
                Your work is saved locally. Sign up anytime to keep it.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SiteSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        projectId={project?.id || ''}
        currentBrand={project?.brand_config || undefined}
        onSave={handleSaveSettings}
        projectName={project?.name || brandConfig?.brandName || 'Untitled Project'}
        onProjectNameChange={async (name: string) => {
          if (!project || demoMode) return
          try {
            const response = await fetch(`/api/project/${project.id}/name`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name })
            })
            if (response.ok) {
              setProject(prev => prev ? { ...prev, name } : null)
            }
          } catch (err) {
            console.error('Failed to update project name:', err)
          }
        }}
        currentSectionName={getCurrentSection()?.name}
        thought={getCurrentSection()?.name ? `Building ${getCurrentSection()?.name}` : undefined}
        demoMode={demoMode}
        promptsUsed={!isSignedIn ? guestBuildsUsed : 0}
        promptsLimit={!isSignedIn ? 3 : undefined}
        onUpgrade={() => {
          setHatchModalReason('generation_limit')
          setShowHatchModal(true)
        }}
      />

      {/* Replicator Modal - Clone any website (Singularity tier) */}
      <ReplicatorModal
        isOpen={showReplicator}
        onClose={() => setShowReplicator(false)}
        onReplicate={(data) => {
          // Handle replicated site data - could populate sections with cloned content
          console.log('Replicated site data:', data)
          setShowReplicator(false)
        }}
      />

      {/* Assistant Modal - AI help chat */}
      <AssistantModal
        isOpen={showOracle}
        onClose={() => setShowOracle(false)}
        currentCode={buildState?.sectionCode[getCurrentSection()?.id || ''] || ''}
        sectionName={getCurrentSection()?.name}
        projectName={project?.name}
      />

      {/* Prompt Helper Modal - Enhance prompts */}
      <PromptHelperModal
        isOpen={showArchitect}
        onClose={() => setShowArchitect(false)}
        currentSectionType={getCurrentSection()?.name}
        onUsePrompt={(prompt) => {
          // Set the prompt in the active section's input
          setShowArchitect(false)
          // Could dispatch to prompt input - for now just copy to clipboard
          navigator.clipboard.writeText(prompt)
        }}
      />
    </div>
  )
}





