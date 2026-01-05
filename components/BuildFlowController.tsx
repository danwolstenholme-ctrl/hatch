'use client'

/* eslint-disable react/no-unescaped-entities */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  ArrowLeft, 
  Globe, 
  Rocket, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  RefreshCw, 
  Home,
  Layers,
  Layout,
  Maximize2,
  Minimize2,
  Share2,
  Edit3,
  Plus,
  Terminal,
  ArrowRight,
  Copy,
  Sparkles,
  Crown,
  Zap,
  Star,
  Download,
  ExternalLink,
  Lock,
  Check
} from 'lucide-react'
import Image from 'next/image'
import { track } from '@vercel/analytics'
import SectionProgress from './SectionProgress'
import SectionBuilder from './SectionBuilder'
import SingularitySidebar from './singularity/SingularitySidebar'
import PaywallTransition from './PaywallTransition'
import HatchModal from './HatchModal'
import TheWitness from './singularity/TheWitness'
import WelcomeModal from './WelcomeModal'
import BuilderWelcome from './BuilderWelcome'
import SiteSettingsModal, { SiteSettings } from './SiteSettingsModal'
import FullSitePreviewFrame from './builder/FullSitePreviewFrame'
import GuestCreditBadge from './GuestCreditBadge'
import PremiumFeaturesShowcase from './PremiumFeaturesShowcase'
import BuildSuccessModal from './BuildSuccessModal'
import SingularityLoader from './singularity/SingularityLoader'
import { chronosphere } from '@/lib/chronosphere'
import { Template, Section, getTemplateById, getSectionById, createInitialBuildState, BuildState, websiteTemplate } from '@/lib/templates'
import { DbProject, DbSection, DbBrandConfig } from '@/lib/supabase'
import { AccountSubscription } from '@/types/subscriptions'
import { useSubscription } from '@/contexts/SubscriptionContext'

// Sanitize SVG data URLs to prevent XSS
const sanitizeSvgDataUrls = (input: string) => {
  return input.replace(/url\(['"]?(data:image\/svg\+xml[^'")\s]+)['"]?\)/gi, (match, data) => {
    const safe = data.replace(/"/g, '%22').replace(/'/g, '%27')
    return `url("${safe}")`
  })
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
// Minimal, clean, ready for anything.
const SINGULARITY_TEMPLATE: Template = {
  ...websiteTemplate,
  id: 'singularity',
  name: 'Build Mode',
  description: 'Default canvas ready for live generation.',
  sections: websiteTemplate.sections
}

export default function BuildFlowController({ existingProjectId, initialPrompt, isDemo = false }: BuildFlowControllerProps) {
  const { user, isLoaded, isSignedIn } = useUser()
  const { isPaidUser } = useSubscription()
  const router = useRouter()
  
  const [demoMode, setDemoMode] = useState(isDemo)
  const [phase, setPhase] = useState<BuildPhase>('initializing')
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(SINGULARITY_TEMPLATE)
  const [customizedSections, setCustomizedSections] = useState<Section[]>(SINGULARITY_TEMPLATE.sections)
  const [brandConfig, setBrandConfig] = useState<DbBrandConfig | null>(null)
  const [buildState, setBuildState] = useState<BuildState | null>(null)
  const [project, setProject] = useState<DbProject | null>(null)
  // Initialize guest count from localStorage to stay in sync with SectionBuilder
  const [guestInteractionCount, setGuestInteractionCount] = useState(() => {
    if (typeof window === 'undefined') return 0
    const stored = localStorage.getItem('hatch_guest_generations')
    return stored ? parseInt(stored, 10) || 0 : 0
  })
  const [hatchModalReason, setHatchModalReason] = useState<'generation_limit' | 'code_access' | 'deploy' | 'download' | 'proactive' | 'running_low' | 'guest_lock'>('proactive')
  const [showPaywallTransition, setShowPaywallTransition] = useState(false)
  const [paywallReason, setPaywallReason] = useState<'limit_reached' | 'site_complete'>('limit_reached')
  
  const WELCOME_SEEN_KEY = 'hatch_intro_v2_seen'
  const OLD_WELCOME_KEYS = ['hatch_welcome_v1_seen', 'hatch_v1_welcome_seen']
  const skipFirstGuestCreditRef = useRef<boolean>(!!initialPrompt)
  const skipLoadingScreen = !!initialPrompt
  
  const [dbSections, setDbSections] = useState<DbSection[]>([])
  const [isLoading, setIsLoading] = useState(true) // Start loading immediately
  const [error, setError] = useState<string | null>(null)
  const [isAuditRunning, setIsAuditRunning] = useState(false)
  const [showHatchModal, setShowHatchModal] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null)
  const [shareUrlCopied, setShareUrlCopied] = useState(false)
  const [reviewDeviceView, setReviewDeviceView] = useState<'mobile' | 'tablet' | 'desktop'>('mobile')
  const [reviewMobileTab, setReviewMobileTab] = useState<'modules' | 'preview'>('preview')
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null)
  const [justCreatedProjectId, setJustCreatedProjectId] = useState<string | null>(null)
  const [showScorecard, setShowScorecard] = useState(false)
  const [showSignupGate, setShowSignupGate] = useState(false)
  const [showDemoNudge, setShowDemoNudge] = useState(false)
  const [demoSectionsBuilt, setDemoSectionsBuilt] = useState(0)

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

  const [showReset, setShowReset] = useState(false)
  const [isReplicationReady, setIsReplicationReady] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showBuildSuccess, setShowBuildSuccess] = useState(false)
  const [showBuilderWelcome, setShowBuilderWelcome] = useState(false)
  const [lastCompletedSection, setLastCompletedSection] = useState<string>('')
  const [guestBuildsUsed, setGuestBuildsUsed] = useState(0)
  const [guestRefinementsUsed, setGuestRefinementsUsed] = useState(0)

  // Show builder welcome for authenticated users (first time only)
  useEffect(() => {
    if (!isSignedIn) return // Only show welcome for signed-in users
    const hasSeen = localStorage.getItem('hatch_builder_welcome_seen')
    if (!hasSeen) {
      setShowBuilderWelcome(true)
    }
  }, [isSignedIn])

  // Sync guest credit counts from localStorage (only for guests)
  useEffect(() => {
    if (isSignedIn) return // Signed in users don't use guest credits
    
    const syncCredits = () => {
      const builds = parseInt(localStorage.getItem('hatch_guest_builds') || '0', 10)
      const refinements = parseInt(localStorage.getItem('hatch_guest_refinements') || '0', 10)
      setGuestBuildsUsed(builds)
      setGuestRefinementsUsed(refinements)
    }
    
    syncCredits()
    // Listen for storage changes from SectionBuilder
    window.addEventListener('storage', syncCredits)
    return () => window.removeEventListener('storage', syncCredits)
  }, [isSignedIn])

  const handleSaveSettings = async (settings: SiteSettings) => {
    if (!project) return
    
    // Handle Demo Mode - Update local state only
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
      
      // Persist to guest handoff if needed
      if (!isSignedIn) {
        // Manually persist the updated brand config
        const payload = {
          templateId: selectedTemplate?.id || SINGULARITY_TEMPLATE.id,
          projectName: updatedBrandConfig.brandName || 'Untitled Project',
          brand: updatedBrandConfig,
          sections: dbSections.map((s) => {
            const code = buildState?.sectionCode?.[s.section_id] || s.code || ''
            return {
              sectionId: s.section_id,
              code,
              userPrompt: s.user_prompt || '',
              refined: s.refined || false,
              refinementChanges: s.refinement_changes || [],
            }
          }),
        }
        localStorage.setItem('hatch_guest_handoff', JSON.stringify(payload))
      }
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
  
  // Persist guest build locally for post-signup migration
  const persistGuestHandoff = useCallback((sectionsSnapshot?: DbSection[], codeSnapshot?: Record<string, string>) => {
    // Only persist for guests (not signed in) - signed in users save to Supabase
    if (isSignedIn) return
    
    const sectionsToUse = sectionsSnapshot || dbSections
    const payload = {
      templateId: selectedTemplate?.id || SINGULARITY_TEMPLATE.id,
      projectName: brandConfig?.brandName || 'Untitled Project',
      brand: brandConfig,
      sections: sectionsToUse.map((s) => {
        const code = codeSnapshot?.[s.section_id] || buildState?.sectionCode?.[s.section_id] || s.code || ''
        return {
          sectionId: s.section_id,
          code,
          userPrompt: s.user_prompt || '',
          refined: s.refined || false,
          refinementChanges: s.refinement_changes || [],
        }
      }),
    }
    
    // Debug logging
    console.log('[GuestHandoff] Persisting:', {
      projectName: payload.projectName,
      templateId: payload.templateId,
      sectionsCount: payload.sections.length,
      sectionsWithCode: payload.sections.filter(s => s.code && s.code.length > 0).length,
      sectionIds: payload.sections.map(s => s.sectionId),
    })
    
    try {
      localStorage.setItem('hatch_guest_handoff', JSON.stringify(payload))
      console.log('[GuestHandoff] Saved to localStorage successfully')
    } catch (err) {
      console.error('[GuestHandoff] Failed to persist:', err)
    }
  }, [isSignedIn, selectedTemplate?.id, brandConfig, dbSections, buildState])

  // NO MORE GENERATION LIMITS - Paywall is at DEPLOY/EXPORT only
  // Free users can generate unlimited, they pay to ship

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
      gradient: 'from-amber-500 to-orange-500'
    }
    if (tier === 'visionary') return {
      name: 'Visionary',
      color: 'violet',
      icon: Zap,
      projectLimit: Infinity,
      features: ['Unlimited Projects', 'Custom Domains', 'Remove Branding', 'Evolution Engine'],
      gradient: 'from-violet-500 to-purple-500'
    }
    if (tier === 'architect') return {
      name: 'Architect',
      color: 'emerald',
      icon: Star,
      projectLimit: 3,
      features: ['3 Active Projects', 'Deploy to hatchitsites.dev', 'Code Download'],
      gradient: 'from-emerald-500 to-teal-500'
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

  // For FREE users: Only build the HERO section first
  // For PAID users: Build all sections
  // This creates a faster "aha moment" - they see their hero, then the full site potential
  const sectionsForBuild = useMemo(() => {
    if (isPaidUser) {
      return allTemplateSections
    }
    // Free users only build hero initially
    return allTemplateSections.filter(s => s.id === 'hero')
  }, [allTemplateSections, isPaidUser])

  const templateForBuild = useMemo(() => {
    return { ...selectedTemplate, sections: sectionsForBuild }
  }, [selectedTemplate, sectionsForBuild])

  // Track if we're in the middle of creating a project to prevent reload
  const [isCreatingProject, setIsCreatingProject] = useState(false)

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

    const setupDemoMode = (restoredData?: any) => {
      const mockProjectId = `demo-${generateId()}`
      
      // Use restored data if available
      const finalBrand = restoredData?.brand || brand
      const finalSections = restoredData?.sections ? restoredData.sections.map((s: any, i: number) => ({
        id: generateId(),
        project_id: mockProjectId,
        section_id: s.sectionId,
        code: s.code || null,
        user_prompt: s.userPrompt || null,
        refined: s.refined || false,
        refinement_changes: s.refinementChanges || null,
        status: s.code ? 'complete' : 'pending',
        order_index: i,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })) : sections.map((s, index) => ({
        id: generateId(),
        project_id: mockProjectId,
        section_id: s.id,
        code: null,
        user_prompt: (index === 0 && projectPrompt) ? projectPrompt : null,
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
      finalSections.forEach((s: any) => {
        if (s.status === 'complete') {
          state.completedSections.push(s.section_id)
          if (s.code) state.sectionCode[s.section_id] = s.code
          if (s.refined) state.sectionRefined[s.section_id] = true
          if (s.refinement_changes) state.sectionChanges[s.section_id] = s.refinement_changes
        }
      })
      
      // Find first pending section
      const firstPending = finalSections.findIndex((s: any) => s.status === 'pending')
      state.currentSectionIndex = firstPending === -1 ? finalSections.length : firstPending

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
        // Check for restored guest session FIRST
        try {
          const savedGuestSession = localStorage.getItem('hatch_guest_handoff')
          if (savedGuestSession) {
            const parsedSession = JSON.parse(savedGuestSession)
            console.log('[GuestHandoff] Restoring session:', parsedSession)
            setupDemoMode(parsedSession)
            return
          }
        } catch (e) {
          console.error('Failed to restore guest session', e)
        }

        // Run immediately to avoid stuck loading state
        setupDemoMode()
        return
      }

      // Track the gate hit
      track('Sign Up Gate Hit', { source: 'builder_init' })
      
      // Redirect to sign up page instead of entering demo mode
      // Preserving intent to return to builder AND keeping any replication/template params
      const currentParams = window.location.search
      const returnUrl = '/builder' + currentParams
      router.push(`/sign-up?redirect_url=${encodeURIComponent(returnUrl)}`)
      
      // ROLLBACK PLAN: Uncomment this block to restore Demo Mode
      /*
      // Small delay for effect
      setTimeout(setupDemoMode, 1500)
      return
      */
      return
    }

    // Check for guest handoff data (user just signed up from demo)
    let guestHandoff: any = null
    try {
      const savedGuestSession = localStorage.getItem('hatch_guest_handoff')
      if (savedGuestSession) {
        guestHandoff = JSON.parse(savedGuestSession)
        console.log('[Builder] Found guest handoff:', {
          projectName: guestHandoff?.projectName,
          sectionsCount: guestHandoff?.sections?.length,
        })
      }
    } catch (e) {
      console.error('[Builder] Failed to parse guest handoff', e)
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout for creation

      // Use guest handoff data if available
      const projectBrand = guestHandoff?.brand || brand
      const projectSections = guestHandoff?.sections || sections.map(s => ({
        sectionId: s.id,
        code: null,
        userPrompt: null,
        refined: false,
      }))

      const response = await fetch('/api/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: guestHandoff?.templateId || template.id,
          name: projectBrand.brandName || brand.brandName,
          sections: guestHandoff ? projectSections : sections,
          brand: projectBrand,
          initialPrompt: projectPrompt,
          // Pass the guest sections with their code if they exist
          guestSections: guestHandoff?.sections,
        }),
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        console.warn('API failed, falling back to demo mode')
        setupDemoMode(guestHandoff)
        return
      }

      const { project: newProject, sections: dbSectionsData } = await response.json()

      // Clear guest handoff after successful import
      localStorage.removeItem('hatch_guest_handoff')
      localStorage.removeItem('hatch_last_prompt')
      localStorage.removeItem('hatch_guest_builds')
      localStorage.removeItem('hatch_guest_refinements')
      localStorage.removeItem('hatch_guest_generations')

      setProject(newProject)
      setDbSections(dbSectionsData)
      
      // Reconstruct build state from imported sections
      const state = createInitialBuildState(guestHandoff?.templateId || template.id)
      dbSectionsData.forEach((s: DbSection) => {
        if (s.status === 'complete') {
          state.completedSections.push(s.section_id)
          if (s.code) state.sectionCode[s.section_id] = s.code
          if (s.refined) state.sectionRefined[s.section_id] = true
          if (s.refinement_changes) state.sectionChanges[s.section_id] = s.refinement_changes
        }
      })
      const firstPending = dbSectionsData.findIndex((s: DbSection) => s.status === 'pending' || s.status === 'building')
      state.currentSectionIndex = firstPending === -1 ? dbSectionsData.length : firstPending
      
      setBuildState(state)
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
        localStorage.removeItem('hatch_current_project')
        
        // Only redirect if we are not already at /builder (to avoid loop)
        if (window.location.pathname !== '/builder' || window.location.search) {
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

    // Persist demo progress for post-signup migration (only for guests)
    if (!isSignedIn) {
      persistGuestHandoff(dbSections.map(s => s.id === dbSection.id ? { ...s, code, refined, refinement_changes: refinementChanges || null } : s), {
        ...(buildState?.sectionCode || {}),
        [currentSection.id]: code,
      })
      
      // Soft nudge after 3 sections built
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

  const handleDeploy = async () => {
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

  const hardReset = useCallback(() => {
    try {
      localStorage.removeItem('hatch_current_project')
      localStorage.removeItem('hatch_guest_handoff')
      localStorage.removeItem('hatch_guest_generations')
      localStorage.removeItem('hatch_guest_refinements')
      localStorage.removeItem('hatch_guest_dreams')
    } catch (err) {
      console.warn('Hard reset failed to clear localStorage', err)
    }

    setError(null)
    setProject(null)
    setDbSections([])
    setBrandConfig(null)
    setBuildState(null)
    setPhase('initializing')
    setDemoMode(false)
    setJustCreatedProjectId(null)
    window.location.href = '/builder'
  }, [])

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
    alert("Brand settings are managed automatically. Ask to change colors or fonts.")
  }

  // Only show loading screen if NOT coming from FirstContact
  if (isLoading && !skipLoadingScreen) {
    // Show different message depending on if we're loading existing vs creating new
    let loadingMessage = 'Initializing the build system...'
    if (existingProjectId) loadingMessage = 'Resuming your project...'
    else if (!isLoaded) loadingMessage = 'Connecting to neural network...'
    
    return <SingularityLoader text={loadingMessage.toUpperCase()} />
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
  
  // Show simple loading state while initializing (especially for guest mode)
  if (phase === 'initializing' || isLoading) {
    return <SingularityLoader text="INITIALIZING SINGULARITY" />
  }

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
        {phase === 'building' && templateForBuild && buildState && (
          <motion.div
            key="building"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-screen overflow-hidden bg-black"
          >
            {/* Singularity Sidebar - Desktop Only */}
            <div className="hidden lg:block w-64 border-r border-zinc-900 bg-zinc-950 flex flex-col h-full overflow-y-auto">
              <SingularitySidebar
                currentSection={buildState.currentSectionIndex + 1}
                totalSections={sectionsForBuild.length}
                isGenerating={false}
                thought={getCurrentSection()?.name ? `Building ${getCurrentSection()?.name}...` : 'Analyzing...'}
                promptsUsed={!isSignedIn ? guestBuildsUsed : 0}
                promptsLimit={!isSignedIn ? 3 : -1}
                isPaid={isPaid}
                onUpgrade={() => {
                  setHatchModalReason('generation_limit')
                  setShowHatchModal(true)
                }}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            </div>

            {/* Main Build Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Section Progress - Now shown for everyone */}
              <SectionProgress
                template={templateForBuild}
                buildState={buildState}
                onSectionClick={handleSectionClick}
                onSkip={handleSkipSection}
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
                    isDemo={isDemo}
                    initialPrompt={buildState.currentSectionIndex === 0 ? initialPrompt : undefined}
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
                  
                  {/* Tier Badge */}
                  {tierConfig && (
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${tierConfig.gradient} bg-opacity-10 border border-${tierConfig.color}-500/30`}
                         style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))`, 
                                  '--tw-gradient-from': `rgb(var(--${tierConfig.color}-500) / 0.1)`, 
                                  '--tw-gradient-to': `rgb(var(--${tierConfig.color}-600) / 0.05)` } as React.CSSProperties}>
                      <tierConfig.icon className={`w-3.5 h-3.5 text-${tierConfig.color}-400`} 
                                       style={{ color: tierConfig.color === 'amber' ? '#fbbf24' : tierConfig.color === 'emerald' ? '#34d399' : '#a3e635' }} />
                      <span className="text-xs font-bold uppercase tracking-wider"
                            style={{ color: tierConfig.color === 'amber' ? '#fbbf24' : tierConfig.color === 'emerald' ? '#34d399' : '#a3e635' }}>
                        {tierConfig.name}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleStartFresh}
                    className="px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors font-mono"
                  >
                    New Project
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={!assembledCode}
                    className="px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors font-mono flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Code</span>
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
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <button
                      onClick={handleDeploy}
                      disabled={isDeploying || !assembledCode}
                      className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group ${
                        tierConfig?.color === 'amber' 
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]'
                          : tierConfig?.color === 'lime'
                          ? 'bg-gradient-to-r from-lime-500 to-green-500 text-black shadow-[0_0_15px_rgba(132,204,22,0.3)] hover:shadow-[0_0_25px_rgba(132,204,22,0.5)]'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]'
                      }`}
                    >
                      {isDeploying ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Deploying...</span>
                        </>
                      ) : (
                        <>
                          <Rocket className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                          <span>Deploy to Production</span>
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

              {showUnlockBanner && (
                <div className="px-6 py-5 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-950/50 via-zinc-900/80 to-emerald-950/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-base text-white font-semibold">Hero Section Deployed</p>
                    </div>
                    <p className="text-sm text-zinc-400">Don't lose your progress. Start your 14-day trial to keep building.</p>
                  </div>
                  <button
                    onClick={() => handleDirectCheckout('architect')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 hover:scale-105"
                  >
                    <Lock className="w-4 h-4" />
                    Unlock — $19/mo
                  </button>
                </div>
              )}

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
                  <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Your Full Site</h2>
                  {!isPaidUser && (
                    <p className="text-xs text-zinc-500 mt-1">Hero complete • {allTemplateSections.length - 1} sections ready to customize</p>
                  )}
                </div>
                <div className="flex-1 overflow-auto p-2 space-y-1">
                  {/* Show ALL template sections, not just built ones */}
                  {allTemplateSections.map((section, index) => {
                    const isCompleted = buildState.completedSections.includes(section.id)
                    const isSkipped = buildState.skippedSections.includes(section.id)
                    const isLocked = !isPaidUser && section.id !== 'hero' // Lock all except hero for free users
                    
                    return (
                      <button
                        key={section.id}
                        onClick={() => {
                          if (isLocked) {
                            // Go DIRECTLY to Stripe checkout - skip the modal
                            handleDirectCheckout('architect')
                          } else if (isCompleted) {
                            // Go back to building mode for this section
                            const sectionIndex = sectionsForBuild.findIndex(s => s.id === section.id)
                            if (sectionIndex >= 0) {
                              setBuildState(prev => prev ? ({ ...prev, currentSectionIndex: sectionIndex }) : null)
                              setPhase('building')
                            }
                          }
                        }}
                        className={`w-full text-left p-3 rounded-lg mb-1 transition-all group ${
                          isLocked
                            ? 'bg-zinc-800/30 border border-zinc-700/50 cursor-pointer hover:border-emerald-500/30'
                            : isCompleted
                            ? 'hover:bg-zinc-800/50 border border-transparent cursor-pointer'
                            : 'opacity-50 cursor-not-allowed border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-mono ${
                            isLocked
                              ? 'bg-zinc-700/50 text-zinc-500 border border-zinc-600'
                            : isCompleted 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : isSkipped
                              ? 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                              : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                          }`}>
                            {isLocked ? <Lock className="w-3 h-3" /> : isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-sm font-medium truncate ${isLocked ? 'text-zinc-500' : 'text-zinc-300 group-hover:text-white'}`}>{section.name}</h3>
                            {isLocked && (
                              <p className="text-[10px] text-emerald-500/70 mt-0.5 group-hover:text-emerald-400">Unlock — $9/2wks</p>
                            )}
                          </div>
                          {isCompleted && !isLocked && (
                            <Edit3 className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400" />
                          )}
                          {isLocked && (
                            <Zap className="w-3.5 h-3.5 text-emerald-500/50 group-hover:text-emerald-400" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
                
                {/* Tier Features Panel */}
                {tierConfig && (
                  <div className="p-4 border-t border-zinc-800/50 bg-zinc-900/20">
                    <div className="flex items-center gap-2 mb-3">
                      <tierConfig.icon className="w-4 h-4" style={{ color: tierConfig.color === 'amber' ? '#fbbf24' : tierConfig.color === 'emerald' ? '#34d399' : '#a3e635' }} />
                      <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Your Plan Features</span>
                    </div>
                    <div className="space-y-1.5">
                      {tierConfig.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-zinc-400">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Upgrade prompt for Architect users */}
                    {accountSubscription?.tier === 'architect' && (
                      <button 
                        onClick={() => window.location.href = '/sign-up?upgrade=visionary'}
                        className="mt-4 w-full py-2 text-xs font-medium bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-2"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        Upgrade to Visionary for Unlimited
                      </button>
                    )}
                  </div>
                )}
                
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
                        <span className="font-mono">Running AI Diagnostics...</span>
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
              <div className={`
                ${reviewMobileTab === 'preview' ? 'flex' : 'hidden'} md:flex
                flex-1 flex-col bg-zinc-950 min-h-0 relative
              `}>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                
                {/* Preview Header with Device Toggle */}
                <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between relative z-10 bg-zinc-950/80 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Live Preview Environment</h3>
                  </div>
                  
                  <div className="hidden md:flex items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800">
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
                <div className="flex-1 flex items-start justify-center overflow-auto p-2 md:p-8 relative z-0">
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
                      sections={previewSections} 
                      deviceView={reviewDeviceView}
                      seo={project?.brand_config?.seo}
                    />
                  </motion.div>
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
                      <h2 className="text-2xl font-bold text-white mb-2">Ship it. Share it.</h2>
                      <p className="text-zinc-400 mb-6">Your site is live — now show it off.</p>
                      
                      {/* Big prominent share button */}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(deployedUrl)
                          setShareUrlCopied(true)
                          setTimeout(() => setShareUrlCopied(false), 2000)
                        }}
                        className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all group mb-4"
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
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-zinc-300 font-medium rounded-xl hover:bg-white/10 hover:text-white transition-all group"
                      >
                        <Globe className="w-5 h-5" />
                        <span>View Live Site</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </a>
                      
                      <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-lg">
                        <code className="text-xs text-zinc-400 font-mono break-all">{deployedUrl}</code>
                      </div>
                    </div>

                    {/* Next Steps - Tier-aware */}
                    <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
                      <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4">What's Next</h3>
                      <div className="space-y-2">
                        <button
                          onClick={() => setDeployedUrl(null)}
                          className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-left group"
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
                            className="w-full flex items-center gap-3 p-3 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 rounded-lg transition-colors text-left group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                              <Globe className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white group-hover:text-emerald-300 transition-colors">Connect Custom Domain</p>
                              <p className="text-xs text-zinc-500">Use your own domain name</p>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">PRO</span>
                          </button>
                        ) : (
                          <div className="w-full flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg opacity-50 cursor-not-allowed">
                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                              <Globe className="w-4 h-4 text-zinc-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-zinc-500">Custom Domain</p>
                              <p className="text-xs text-zinc-600">Upgrade to Pro to unlock</p>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-500 bg-white/10 px-2 py-0.5 rounded">PRO</span>
                          </div>
                        )}
                        
                        <button
                          onClick={handleStartFresh}
                          className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-left group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
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
                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
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
                    router.push('/sign-up?redirect_url=/builder')
                  }}
                  className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <span>Sign Up Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowDemoNudge(false)}
                  className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg transition-colors"
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
      />
    </div>
  )
}