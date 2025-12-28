'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { track } from '@vercel/analytics'
import Chat from '@/components/Chat'
import CodePreview from '@/components/CodePreview'
import LivePreview from '@/components/LivePreview'
import UpgradeModal from '@/components/upgradeModal'    
import SuccessModal from '@/components/SuccessModal'
import { isPaidUser } from '@/app/lib/generation-limit'
import { showSuccessToast, showErrorToast } from '@/app/lib/toast'

// Type for site subscriptions in user metadata
interface SiteSubscription {
  projectSlug: string
  projectName: string
  stripeSubscriptionId: string
  status: 'active' | 'canceled' | 'past_due'
  createdAt: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  code?: string
}

interface Version {
  id: string
  code: string
  timestamp: string
  prompt?: string
}

interface Page {
  id: string
  name: string
  path: string // URL path like '/', '/about', '/contact'
  versions: Version[]
  currentVersionIndex: number
}

interface Project {
  id: string
  name: string
  pages?: Page[] // New multi-page structure
  currentPageId?: string // Currently active page
  // Legacy single-page support
  versions: Version[]
  currentVersionIndex: number
  createdAt: string
  updatedAt: string
  deployedSlug?: string
  customDomain?: string
  code?: string
  codeHistory?: string[]
  assets?: Asset[]
  brand?: Brand // Auto-detected and user-customizable brand
}

interface Brand {
  colors: string[] // Hex colors detected/set (primary, secondary, accent)
  font: string // Font family name
}

interface Asset {
  id: string
  name: string
  type: 'logo' | 'image' | 'icon'
  dataUrl: string
  createdAt: string
}

// Type for site subscription (from user metadata) - defined above

// Type for deployed project (from user metadata)
interface DeployedProject {
  slug: string
  name: string
  code?: string
  pages?: { name: string; path: string; code: string }[]
  deployedAt: string
}

const generateId = () => Math.random().toString(36).substring(2, 9)

// Client-side truncation detection - prevents saving broken code
const detectTruncatedCode = (code: string): boolean => {
  if (!code || code.length < 100) return false
  
  const trimmed = code.trim()
  
  // Count brackets and braces
  let braces = 0, parens = 0, brackets = 0
  for (const char of trimmed) {
    if (char === '{') braces++
    if (char === '}') braces--
    if (char === '(') parens++
    if (char === ')') parens--
    if (char === '[') brackets++
    if (char === ']') brackets--
  }
  
  // Major imbalances indicate truncation
  if (braces > 3 || parens > 3 || brackets > 3) return true
  
  // Check for code ending with incomplete patterns
  if (/(?:className|style|onClick|onChange|href|src)=["']?[^"']*$/.test(trimmed)) return true
  if (/(?:return|=>)\s*\(?[\s\n]*$/.test(trimmed)) return true
  if (/<[A-Za-z][^>]*$/.test(trimmed)) return true // ends mid-tag
  
  return false
}

const projectNameSuggestions = [
  'Fresh Canvas',
  'Quick Build',
  'New Creation',
  'Blank Slate',
  'Fresh Start',
  'Quick Design',
  'New Project',
  'Fresh Idea',
  'Quick Sketch',
  'New Vision',
]

const generateProjectName = (): string => {
  const suggestion = projectNameSuggestions[Math.floor(Math.random() * projectNameSuggestions.length)]
  const num = Math.floor(Math.random() * 999) + 1
  return `${suggestion} ${num}`
}

const createNewProject = (name?: string): Project => {
  const homePage: Page = {
    id: generateId(),
    name: 'Home',
    path: '/',
    versions: [],
    currentVersionIndex: -1
  }
  
  return {
    id: generateId(),
    name: name || generateProjectName(),
    pages: [homePage],
    currentPageId: homePage.id,
    // Legacy fields for backward compatibility
    versions: [],
    currentVersionIndex: -1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

const migrateProject = (project: Project): Project => {
  if (project.versions && project.versions.length > 0) return project
  
  if (project.code || (project.codeHistory && project.codeHistory.length > 0)) {
    const versions: Version[] = []
    if (project.codeHistory) {
      project.codeHistory.forEach((code, index) => {
        versions.push({
          id: generateId(),
          code,
          timestamp: new Date(Date.now() - (project.codeHistory!.length - index) * 60000).toISOString(),
        })
      })
    }
    if (project.code) {
      versions.push({
        id: generateId(),
        code: project.code,
        timestamp: project.updatedAt || new Date().toISOString(),
      })
    }
    return { ...project, versions, currentVersionIndex: versions.length - 1, code: undefined, codeHistory: undefined }
  }
  
  return { ...project, versions: project.versions || [], currentVersionIndex: project.currentVersionIndex ?? -1 }
}

// Extract brand (colors + font) from generated code
const extractBrandFromCode = (code: string): Brand => {
  // Extract hex colors (prioritize bg- and text- colors)
  const hexMatches = code.match(/#[0-9A-Fa-f]{6}\b/g) || []
  const bgColorMatches = code.match(/bg-\[(#[0-9A-Fa-f]{6})\]/g) || []
  const textColorMatches = code.match(/text-\[(#[0-9A-Fa-f]{6})\]/g) || []
  
  // Also look for common Tailwind color classes and map to hex
  const tailwindToHex: Record<string, string> = {
    'blue-600': '#2563eb', 'blue-500': '#3b82f6', 'blue-700': '#1d4ed8',
    'purple-600': '#9333ea', 'purple-500': '#a855f7', 'purple-700': '#7c3aed',
    'green-600': '#16a34a', 'green-500': '#22c55e', 'emerald-600': '#059669',
    'red-600': '#dc2626', 'red-500': '#ef4444', 'orange-500': '#f97316',
    'pink-600': '#db2777', 'pink-500': '#ec4899', 'indigo-600': '#4f46e5',
    'cyan-500': '#06b6d4', 'teal-500': '#14b8a6', 'amber-500': '#f59e0b',
    'zinc-950': '#09090b', 'zinc-900': '#18181b', 'zinc-800': '#27272a',
  }
  
  const tailwindColorMatches = code.match(/(?:bg|text|from|to|border)-(?:blue|purple|green|red|orange|pink|indigo|cyan|teal|amber|emerald)-(?:500|600|700)/g) || []
  const tailwindHexColors = tailwindColorMatches.map(c => {
    const colorPart = c.replace(/^(?:bg|text|from|to|border)-/, '')
    return tailwindToHex[colorPart]
  }).filter(Boolean)
  
  // Combine all hex colors and get unique ones
  const allHexColors = [...hexMatches, ...bgColorMatches.map(m => m.match(/#[0-9A-Fa-f]{6}/)?.[0] || ''), ...textColorMatches.map(m => m.match(/#[0-9A-Fa-f]{6}/)?.[0] || ''), ...tailwindHexColors]
  const uniqueColors = [...new Set(allHexColors.filter(c => c && c !== '#000000' && c !== '#ffffff' && c !== '#FFFFFF'))]
  
  // Take top 3 most distinctive colors (skip grays)
  const nonGrayColors = uniqueColors.filter(c => {
    const r = parseInt(c.slice(1, 3), 16)
    const g = parseInt(c.slice(3, 5), 16)
    const b = parseInt(c.slice(5, 7), 16)
    const isGray = Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20
    return !isGray
  })
  const brandColors = nonGrayColors.slice(0, 3)
  
  // Extract font family
  const fontMatch = code.match(/font-(?:sans|serif|mono)|font-\[['"]?([^'"\]]+)['"]?\]/i)
  let font = 'System Default'
  if (fontMatch) {
    if (fontMatch[1]) {
      font = fontMatch[1]
    } else if (fontMatch[0] === 'font-sans') {
      font = 'Sans Serif'
    } else if (fontMatch[0] === 'font-serif') {
      font = 'Serif'
    } else if (fontMatch[0] === 'font-mono') {
      font = 'Monospace'
    }
  }
  
  // Check for Google Fonts in code
  const googleFontMatch = code.match(/(?:Inter|Poppins|Roboto|Open Sans|Lato|Montserrat|Playfair Display|Raleway|Nunito|Outfit)/i)
  if (googleFontMatch) {
    font = googleFontMatch[0]
  }
  
  return {
    colors: brandColors.length > 0 ? brandColors : ['#3b82f6', '#9333ea'], // Default blue/purple
    font
  }
}

// Helper to check if project uses new multi-page structure
const isMultiPageProject = (project: Project): boolean => {
  return !!(project.pages && project.pages.length > 0)
}

// Get current page from project
const getCurrentPage = (project: Project): Page | null => {
  if (!isMultiPageProject(project)) return null
  return project.pages!.find(p => p.id === project.currentPageId) || project.pages![0]
}

// Migrate single-page project to multi-page structure
const migrateToMultiPage = (project: Project): Project => {
  if (isMultiPageProject(project)) return project
  
  // Convert single-page to multi-page with a home page
  const homePage: Page = {
    id: generateId(),
    name: 'Home',
    path: '/',
    versions: project.versions || [],
    currentVersionIndex: project.currentVersionIndex ?? 0
  }
  
  return {
    ...project,
    pages: [homePage],
    currentPageId: homePage.id
  }
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false)
  const [showStartOverModal, setShowStartOverModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [previewVersionIndex, setPreviewVersionIndex] = useState<number | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
  const currentProject = projects.find(p => p.id === currentProjectId)
  
  // Support both multi-page and legacy single-page projects
  const currentPage = currentProject ? getCurrentPage(currentProject) : null
  const versions = currentPage?.versions || currentProject?.versions || []
  const currentVersionIndex = currentPage?.currentVersionIndex ?? currentProject?.currentVersionIndex ?? -1
  
  const code = previewVersionIndex !== null 
    ? versions[previewVersionIndex]?.code || ''
    : versions[currentVersionIndex]?.code || ''
  
  // Get all pages with their current code for multi-page preview
  const previewPages = currentProject && isMultiPageProject(currentProject) 
    ? currentProject.pages!.map(page => ({
        id: page.id,
        name: page.name,
        path: page.path,
        code: page.versions[page.currentVersionIndex]?.code || ''
      }))
    : undefined
    
  const isDeployed = !!currentProject?.deployedSlug
  const canUndo = currentVersionIndex > 0
  const canRedo = currentVersionIndex < versions.length - 1
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null)
  const [showDeployModal, setShowDeployModal] = useState(false)
  const [showShipModal, setShowShipModal] = useState(false)
  const [showDomainModal, setShowDomainModal] = useState(false)
  const [customDomain, setCustomDomain] = useState('')
  const [domainStatus, setDomainStatus] = useState<'idle' | 'adding' | 'pending' | 'success' | 'error'>('idle')
  const [domainError, setDomainError] = useState('')
  const [deployName, setDeployName] = useState('')
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview')
  const [previewWidth, setPreviewWidth] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [showPagesPanel, setShowPagesPanel] = useState(false)
  const [showAddPageModal, setShowAddPageModal] = useState(false)
  const [newPageName, setNewPageName] = useState('')
  const [newPagePath, setNewPagePath] = useState('')
  const [mobileModal, setMobileModal] = useState<'preview' | 'code' | null>(null)
  const [copied, setCopied] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [previousCode, setPreviousCode] = useState<string | null>(null)
  const { user, isLoaded } = useUser()
  const searchParams = useSearchParams()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState<'generation_limit' | 'code_access' | 'deploy' | 'download' | 'proactive' | 'running_low'>('deploy')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showFaqModal, setShowFaqModal] = useState(false)
  const [showAssetsModal, setShowAssetsModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showDesktopMenu, setShowDesktopMenu] = useState(false)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [showWelcomeBackModal, setShowWelcomeBackModal] = useState(false)
  const [domainSearch, setDomainSearch] = useState('')
  const [domainSearchResult, setDomainSearchResult] = useState<{ domain: string; available: boolean; price?: number } | null>(null)
  const [isSearchingDomain, setIsSearchingDomain] = useState(false)
  const [isBuyingDomain, setIsBuyingDomain] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [inspectorMode, setInspectorMode] = useState(false)
  const [selectedElement, setSelectedElement] = useState<{ tagName: string; className: string; textContent: string; styles: Record<string, string> } | null>(null)
  const [externalPrompt, setExternalPrompt] = useState<string | null>(null)
  const [generationProgress, setGenerationProgress] = useState<string>('') // Real-time status
  const [complexityWarning, setComplexityWarning] = useState<{ warning: string; suggestions: string[]; prompt: string } | null>(null)
  const [showBrandPanel, setShowBrandPanel] = useState(false)
  const [chatResetKey, setChatResetKey] = useState(0) // Increments to trigger Chat reset
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const domainInputRef = useRef<HTMLInputElement>(null)
  const projectNameInputRef = useRef<HTMLInputElement>(null)
  const generationRequestIdRef = useRef(0)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Get subscriptions from user metadata
  const subscriptions = useMemo(() => {
    return (user?.publicMetadata?.subscriptions as SiteSubscription[]) || []
  }, [user?.publicMetadata?.subscriptions])

  // Get the project slug for the current project (what it would be when deployed)
  // Includes user suffix for uniqueness across all users
  const currentProjectSlug = useMemo(() => {
    if (!currentProject || !user?.id) return ''
    // If already deployed, use the existing slug
    if (currentProject.deployedSlug) return currentProject.deployedSlug
    // Generate new slug with user suffix
    const userSuffix = user.id.slice(-6).toLowerCase()
    const baseSlug = currentProject.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'site'
    return `${baseSlug}-${userSuffix}`
  }, [currentProject, user?.id])

  // Check if CURRENT PROJECT has an active subscription
  const isCurrentProjectPaid = useMemo(() => {
    if (!currentProjectSlug) return false
    return subscriptions.some(s => s.projectSlug === currentProjectSlug && s.status === 'active')
  }, [subscriptions, currentProjectSlug])

  // Legacy: check if user has ANY paid subscription (for things like unlimited generations)
  const hasAnyPaidSubscription = useMemo(() => {
    return subscriptions.some(s => s.status === 'active')
  }, [subscriptions])

  // Get deployed projects from Clerk metadata
  const deployedProjects = useMemo(() => {
    return (user?.publicMetadata?.deployedProjects as DeployedProject[]) || []
  }, [user?.publicMetadata?.deployedProjects])

  // Get projects that exist in Clerk but not in localStorage
  const projectsToPull = useMemo(() => {
    return deployedProjects.filter(deployed => 
      !projects.some(local => local.deployedSlug === deployed.slug)
    )
  }, [deployedProjects, projects])

  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem('hatchit-projects')
      const savedCurrentId = localStorage.getItem('hatchit-current-project')
      if (savedProjects) {
        try {
          const parsed = JSON.parse(savedProjects) as Project[]
          // First migrate old format, then convert to multi-page
          const migrated = parsed.map(p => migrateToMultiPage(migrateProject(p)))
          setProjects(migrated)
          if (savedCurrentId && migrated.find(p => p.id === savedCurrentId)) {
            setCurrentProjectId(savedCurrentId)
          } else if (migrated.length > 0) {
            setCurrentProjectId(migrated[0].id)
          }
        } catch (parseError) {
          console.error('Failed to parse saved projects:', parseError)
          // Clear corrupted data and start fresh
          localStorage.removeItem('hatchit-projects')
          const defaultProject = createNewProject('My First Project')
          setProjects([defaultProject])
          setCurrentProjectId(defaultProject.id)
        }
      } else {
        const defaultProject = createNewProject('My First Project')
        setProjects([defaultProject])
        setCurrentProjectId(defaultProject.id)
        // Don't show onboarding immediately - wait until first generation
      }
    } catch (storageError) {
      // localStorage may be unavailable in private browsing
      console.error('localStorage unavailable:', storageError)
      const defaultProject = createNewProject('My First Project')
      setProjects([defaultProject])
      setCurrentProjectId(defaultProject.id)
    }
    setIsLoadingProjects(false)
  }, [])

  // Check if we should show Welcome Back modal (new device with cloud projects)
  useEffect(() => {
    if (isLoadingProjects || !isLoaded) return
    
    // Check if localStorage was empty/fresh AND user has deployed projects in cloud
    const hasLocalProjects = projects.some(p => p.deployedSlug || (p.versions && p.versions.length > 0) || p.pages?.some(page => page.versions?.length > 0))
    const hasCloudProjects = deployedProjects.length > 0
    const hasSeenWelcome = localStorage.getItem('hatchit-seen-welcome')
    
    if (!hasLocalProjects && hasCloudProjects && !hasSeenWelcome) {
      setShowWelcomeBackModal(true)
    }
  }, [isLoadingProjects, isLoaded, projects, deployedProjects])

  // Pull all Go Hatched (paid) projects from cloud
  const pullAllPaidProjects = () => {
    const paidProjects = deployedProjects.filter(dp => 
      subscriptions.some(s => s.projectSlug === dp.slug && s.status === 'active')
    )
    
    paidProjects.forEach(project => {
      pullProject(project)
    })
    
    localStorage.setItem('hatchit-seen-welcome', 'true')
    setShowWelcomeBackModal(false)
  }

  const skipWelcomeBack = () => {
    localStorage.setItem('hatchit-seen-welcome', 'true')
    setShowWelcomeBackModal(false)
  }

  useEffect(() => {
    if (projects.length > 0) localStorage.setItem('hatchit-projects', JSON.stringify(projects))
  }, [projects])

  useEffect(() => {
    if (currentProjectId) localStorage.setItem('hatchit-current-project', currentProjectId)
  }, [currentProjectId])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowProjectDropdown(false)
      if (showDesktopMenu && !(e.target as Element).closest('.desktop-menu-container')) setShowDesktopMenu(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDesktopMenu])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!previewContainerRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setPreviewWidth(entry.contentRect.width)
    })
    observer.observe(previewContainerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (showDomainModal && domainStatus === 'idle' && !customDomain) {
      // Only auto-focus when modal first opens with no domain entered
      setTimeout(() => domainInputRef.current?.focus(), 100)
    }
  }, [showDomainModal])

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      // Force reload to get fresh user data from Clerk (webhook may have updated metadata)
      const projectSlug = searchParams.get('project')
      setShowSuccessModal(true)
      window.history.replaceState({}, '', '/builder')
      
      // Reload the page after a short delay to ensure Clerk metadata is synced
      // This is needed because the webhook updates Clerk, but client has stale data
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    }
    // Handle domain purchase success
    if (searchParams.get('domain_success') === 'true') {
      const purchasedDomain = searchParams.get('domain')
      if (purchasedDomain) {
        setCustomDomain(purchasedDomain)
        updateCurrentProject({ customDomain: purchasedDomain })
        alert(`🎉 Domain ${purchasedDomain} purchased and connected! It may take a few minutes to go live.`)
      }
      window.history.replaceState({}, '', '/builder')
    }
  }, [searchParams])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Z for undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (canUndo) {
          updateCurrentProject({ currentVersionIndex: currentVersionIndex - 1 })
        }
      }
      // Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y for redo
      if ((e.metaKey || e.ctrlKey) && (e.key === 'z' && e.shiftKey || e.key === 'y')) {
        e.preventDefault()
        if (canRedo) {
          updateCurrentProject({ currentVersionIndex: currentVersionIndex + 1 })
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canUndo, canRedo, currentVersionIndex])

  const getDevice = (width: number) => {
    if (width < 375) return { name: 'iPhone SE', icon: '📱' }
    if (width < 430) return { name: 'iPhone', icon: '📱' }
    if (width < 640) return { name: 'Mobile', icon: '📱' }
    if (width < 768) return { name: 'iPad Mini', icon: '📱' }
    if (width < 1024) return { name: 'iPad', icon: '⬛' }
    if (width < 1280) return { name: 'Laptop', icon: '💻' }
    return { name: 'Desktop', icon: '🖥️' }
  }
  const device = getDevice(previewWidth)

  const updateCurrentProject = (updates: Partial<Project>) => {
    if (!currentProjectId) return
    setProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
  }

  const createProject = () => {
    // Free users can only have 1 project (any paid subscription allows multiple)
    if (!hasAnyPaidSubscription && projects.length >= 1) {
      setUpgradeReason('deploy')
      setShowUpgradeModal(true)
      setShowProjectDropdown(false)
      return
    }
    
    // Show naming modal instead of auto-creating
    setShowNewProjectModal(true)
    setShowProjectDropdown(false)
  }

  const confirmCreateProject = () => {
    const name = projectNameInputRef.current?.value?.trim()
    if (!name) return
    
    const newProject = createNewProject(name)
    setProjects(prev => [newProject, ...prev])
    setCurrentProjectId(newProject.id)
    setShowNewProjectModal(false)
    if (projectNameInputRef.current) projectNameInputRef.current.value = ''
    setDeployedUrl(null)
    track('Project Created', { isPaid: hasAnyPaidSubscription })
  }

  const switchProject = (id: string) => {
    if (id === currentProjectId) {
      setShowProjectDropdown(false)
      return
    }
    setCurrentProjectId(id)
    setShowProjectDropdown(false)
    setDeployedUrl(null)
    setPreviewVersionIndex(null)
  }

  const renameProject = () => {
    if (!renameValue.trim() || !currentProjectId) return
    updateCurrentProject({ name: renameValue.trim() })
    setShowRenameModal(false)
    setRenameValue('')
  }

  const deleteProject = () => {
    if (!currentProjectId) return
    const newProjects = projects.filter(p => p.id !== currentProjectId)
    const remaining = newProjects.length > 0 ? newProjects : [createNewProject()]
    setProjects(remaining)
    setCurrentProjectId(remaining[0]?.id || null)
    setShowDeleteModal(false)
    setDeployedUrl(null)
  }

  const deleteAllProjects = () => {
    const freshProject = createNewProject()
    setProjects([freshProject])
    setCurrentProjectId(freshProject.id)
    setShowDeleteAllModal(false)
    setShowProjectDropdown(false)
    setDeployedUrl(null)
    // Clear chat history from localStorage
    const keysToRemove = Object.keys(localStorage).filter(key => 
      key.startsWith('chat-build-') || key.startsWith('chat-chat-')
    )
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }

  const startOver = () => {
    if (!currentProject) return
    // Clear versions and reset to empty state (doesn't use a generation)
    updateCurrentProject({
      versions: [],
      currentVersionIndex: -1,
      pages: undefined,
      brand: undefined,
    })
    // Clear chat history for this project
    localStorage.removeItem(`chat-build-${currentProjectId}`)
    localStorage.removeItem(`chat-chat-${currentProjectId}`)
    setShowProjectDropdown(false)
    setShowStartOverModal(false)
    setShowMobileMenu(false)
    setShowDesktopMenu(false)
    setPreviousCode(null)
    setSuggestions([]) // Clear AI suggestions
    setChatResetKey(k => k + 1) // Trigger Chat component reset
    showSuccessToast('Project cleared — start fresh!')
  }

  const duplicateProject = () => {
    // Free users can only have 1 project (any paid subscription allows multiple)
    if (!hasAnyPaidSubscription && projects.length >= 1) {
      setUpgradeReason('deploy')
      setShowUpgradeModal(true)
      setShowProjectDropdown(false)
      return
    }
    
    if (!currentProject) return
    const duplicate: Project = {
      ...currentProject,
      id: generateId(),
      name: `${currentProject.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deployedSlug: undefined,
    }
    setProjects(prev => [duplicate, ...prev])
    setCurrentProjectId(duplicate.id)
    setShowProjectDropdown(false)
    setDeployedUrl(null)
  }

  const addPage = () => {
    if (!currentProject || !newPageName.trim()) return
    
    const path = newPagePath.trim() || `/${newPageName.toLowerCase().replace(/\s+/g, '-')}`
    const newPage: Page = {
      id: generateId(),
      name: newPageName.trim(),
      path: path.startsWith('/') ? path : `/${path}`,
      versions: [],
      currentVersionIndex: -1
    }
    
    const updatedProject = {
      ...currentProject,
      pages: [...(currentProject.pages || []), newPage],
      currentPageId: newPage.id,
      updatedAt: new Date().toISOString()
    }
    
    setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProject : p))
    setShowAddPageModal(false)
    setNewPageName('')
    setNewPagePath('')
  }

  const deletePage = (pageId: string) => {
    if (!currentProject || !currentProject.pages) return
    if (currentProject.pages.length <= 1) return // Keep at least one page
    
    const updatedPages = currentProject.pages.filter(p => p.id !== pageId)
    const newCurrentPageId = currentProject.currentPageId === pageId 
      ? updatedPages[0].id 
      : currentProject.currentPageId
    
    const updatedProject = {
      ...currentProject,
      pages: updatedPages,
      currentPageId: newCurrentPageId,
      updatedAt: new Date().toISOString()
    }
    
    setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProject : p))
  }

  const deleteAllPagesExceptFirst = () => {
    if (!currentProject || !currentProject.pages || currentProject.pages.length <= 1) return
    
    const firstPage = currentProject.pages[0]
    const updatedProject = {
      ...currentProject,
      pages: [firstPage],
      currentPageId: firstPage.id,
      updatedAt: new Date().toISOString()
    }
    
    setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProject : p))
  }

  const switchPage = (pageId: string) => {
    if (!currentProject) return
    
    const updatedProject = {
      ...currentProject,
      currentPageId: pageId
    }
    
    setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProject : p))
    setShowPagesPanel(false)
  }

  const handleCodeChange = (newCode: string) => {
    if (!currentProject) return
    
    const newVersion: Version = {
      id: generateId(),
      code: newCode,
      timestamp: new Date().toISOString(),
      prompt: 'Manual edit'
    }
    
    if (isMultiPageProject(currentProject) && currentPage) {
      // Update the current page's versions
      const updatedPages = currentProject.pages!.map(page => 
        page.id === currentPage.id
          ? {
              ...page,
              versions: [...page.versions, newVersion],
              currentVersionIndex: page.versions.length
            }
          : page
      )
      
      const updatedProject = {
        ...currentProject,
        pages: updatedPages,
        updatedAt: new Date().toISOString()
      }
      
      setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProject : p))
    } else {
      // Legacy single-page project
      const updatedProject = {
        ...currentProject,
        versions: [...currentProject.versions, newVersion],
        currentVersionIndex: currentProject.versions.length,
        updatedAt: new Date().toISOString()
      }
      
      setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProject : p))
    }
  }

  const handleCodeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const reader = new FileReader()

    reader.onload = (event) => {
      const content = event.target?.result as string
      if (!content) return

      // Create a new project with uploaded code
      const newProject: Project = {
        id: generateId(),
        name: file.name.replace(/\.(html|htm|txt)$/i, '') || 'Uploaded Project',
        versions: [{
          id: generateId(),
          code: content,
          timestamp: new Date().toISOString(),
          prompt: 'Uploaded from file'
        }],
        currentVersionIndex: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setProjects(prev => [newProject, ...prev])
      setCurrentProjectId(newProject.id)

      showSuccessToast('Code uploaded successfully!')
    }

    reader.readAsText(file)
    e.target.value = '' // Reset input
  }

  const pullProject = (deployedProject: DeployedProject) => {
    // Create a new local project with the deployed code
    let newProject: Project
    
    // Handle multi-page deployed projects
    if (deployedProject.pages && deployedProject.pages.length > 0) {
      const pages: Page[] = deployedProject.pages.map((p, index) => ({
        id: generateId(),
        name: p.name,
        path: p.path,
        versions: [{
          id: generateId(),
          code: p.code,
          timestamp: deployedProject.deployedAt,
          prompt: 'Pulled from deployed project'
        }],
        currentVersionIndex: 0
      }))
      
      newProject = {
        id: generateId(),
        name: deployedProject.name,
        pages,
        currentPageId: pages[0].id,
        versions: [],
        currentVersionIndex: -1,
        createdAt: deployedProject.deployedAt,
        updatedAt: new Date().toISOString(),
        deployedSlug: deployedProject.slug,
      }
    } else {
      // Legacy single-page project
      newProject = {
        id: generateId(),
        name: deployedProject.name,
        versions: [{
          id: generateId(),
          code: deployedProject.code || '',
          timestamp: deployedProject.deployedAt,
          prompt: 'Pulled from deployed project'
        }],
        currentVersionIndex: 0,
        createdAt: deployedProject.deployedAt,
        updatedAt: new Date().toISOString(),
        deployedSlug: deployedProject.slug,
      }
    }
    
    setProjects(prev => [newProject, ...prev])
    setCurrentProjectId(newProject.id)
    
    showSuccessToast('Project pulled successfully!')
  }

  // Preview error action handlers
  const handleViewCode = () => {
    setActiveTab('code')
  }

  const handleRegenerateFromError = () => {
    setExternalPrompt('Regenerate this page with the same design but simpler, cleaner code')
  }

  const handleQuickFix = () => {
    setExternalPrompt('Simplify this page and fix any errors. Keep the same design but use cleaner, simpler code that renders properly.')
  }

  // Generate with option to skip complexity warning (when user proceeds anyway)
  const handleGenerateWithOptions = async (prompt: string, history: Message[], currentCode: string, skipComplexityWarning = false): Promise<string | null> => {
    const requestId = ++generationRequestIdRef.current
    const targetProjectId = currentProjectId
    const targetPageId = currentPage?.id
    
    // Create new AbortController for this request
    abortControllerRef.current = new AbortController()
    
    setIsGenerating(true)
    setGenerationProgress('Analyzing request...')
    try {
      // Prepare page context for multi-page projects
      const payload: Record<string, unknown> = { prompt, history, currentCode, skipComplexityWarning }
      if (currentProject && isMultiPageProject(currentProject)) {
        payload.currentPage = {
          id: currentPage?.id,
          name: currentPage?.name,
          path: currentPage?.path
        }
        payload.allPages = currentProject.pages!.map(p => ({
          id: p.id,
          name: p.name,
          path: p.path
        }))
      }
      
      // Include uploaded assets so AI can reference them
      if (currentProject?.assets && currentProject.assets.length > 0) {
        payload.assets = currentProject.assets.map(a => ({
          name: a.name,
          dataUrl: a.dataUrl,
          type: a.type
        }))
      }
      
      // Pass brand colors/font to AI for consistency
      if (currentProject?.brand) {
        payload.brand = currentProject.brand
      }
      
      // Store previous code for revert functionality
      setPreviousCode(currentCode || null)
      
      setGenerationProgress('Generating code...')
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal,
      })
      const data = await response.json()
      
      // Handle API errors (including truncation failures)
      if (data.error) {
        showErrorToast(data.error)
        return null
      }
      
      // Handle complexity warning
      if (data.complexityWarning) {
        setIsGenerating(false)
        setGenerationProgress('')
        setComplexityWarning({
          warning: data.warning,
          suggestions: data.suggestions || [],
          prompt
        })
        return null
      }
      
      // Capture suggestions from response
      if (data.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions)
      } else {
        setSuggestions([])
      }
      
      setGenerationProgress('Processing response...')
      
      // Handle multi-page operations (creating new pages, updating multiple pages)
      if (data.pageOperations && Array.isArray(data.pageOperations) && data.pageOperations.length > 0) {
        // Check for truncated code in any page operation
        const hasTruncatedCode = data.pageOperations.some((op: { code?: string }) => op.code && detectTruncatedCode(op.code))
        if (hasTruncatedCode) {
          showErrorToast('Response was cut off. Try a simpler prompt or click Regenerate.')
          return null
        }
        
        if (generationRequestIdRef.current !== requestId || currentProjectId !== targetProjectId) return null
        
        // Ensure project is multi-page
        const migratedProject = currentProject ? migrateToMultiPage(currentProject) : null
        if (!migratedProject) return null
        
        let updatedPages = [...(migratedProject.pages || [])]
        let newPageId: string | null = null
        
        for (const op of data.pageOperations) {
          const newVersion: Version = { 
            id: generateId(), 
            code: op.code, 
            timestamp: new Date().toISOString(), 
            prompt 
          }
          
          if (op.action === 'create' && op.name && op.path) {
            // Create a new page
            const createdPage: Page = {
              id: generateId(),
              name: op.name,
              path: op.path,
              versions: [newVersion],
              currentVersionIndex: 0
            }
            updatedPages.push(createdPage)
            newPageId = createdPage.id
          } else if (op.action === 'update') {
            // Update existing page
            const pageIdToUpdate = op.id === 'CURRENT_PAGE_ID' ? targetPageId : op.id
            updatedPages = updatedPages.map(page =>
              page.id === pageIdToUpdate
                ? {
                    ...page,
                    versions: page.currentVersionIndex >= 0 
                      ? [...page.versions.slice(0, page.currentVersionIndex + 1), newVersion]
                      : [newVersion],
                    currentVersionIndex: page.currentVersionIndex >= 0 
                      ? page.currentVersionIndex + 1
                      : 0
                  }
                : page
            )
          }
        }
        
        updateCurrentProject({ 
          pages: updatedPages,
          // Optionally switch to the new page
          // currentPageId: newPageId || migratedProject.currentPageId
        })
        
        if (isMobile) setMobileModal('preview')
        return data.message || 'Pages updated!'
      }
      
      // Handle single page update (backwards compatible)
      if (data.code) {
        // Client-side truncation check - don't save broken code
        if (detectTruncatedCode(data.code)) {
          showErrorToast('Response was cut off. Try a simpler prompt or click Regenerate.')
          return null
        }
        
        if (generationRequestIdRef.current !== requestId || currentProjectId !== targetProjectId) return null
        const newVersion: Version = { id: generateId(), code: data.code, timestamp: new Date().toISOString(), prompt }
        
        // Handle multi-page vs single-page projects
        if (currentProject && isMultiPageProject(currentProject) && currentPage && currentProject.id === targetProjectId && currentPage.id === targetPageId) {
          // Update the current page's versions
          const updatedPages = currentProject.pages!.map(page =>
            page.id === currentPage.id
              ? {
                  ...page,
                  versions: page.currentVersionIndex >= 0 
                    ? [...page.versions.slice(0, page.currentVersionIndex + 1), newVersion]
                    : [newVersion],
                  currentVersionIndex: page.currentVersionIndex >= 0 
                    ? page.currentVersionIndex + 1
                    : 0
                }
              : page
          )
          updateCurrentProject({ pages: updatedPages })
          
          // Extract and save brand from generated code (only if not already set)
          if (!currentProject.brand) {
            const extractedBrand = extractBrandFromCode(data.code)
            updateCurrentProject({ brand: extractedBrand })
          }
        } else {
          // Legacy single-page project
          const newVersions = currentVersionIndex >= 0 ? [...versions.slice(0, currentVersionIndex + 1), newVersion] : [newVersion]
          updateCurrentProject({ versions: newVersions, currentVersionIndex: newVersions.length - 1 })
          
          // Extract and save brand from generated code (only if not already set)
          if (!currentProject?.brand) {
            const extractedBrand = extractBrandFromCode(data.code)
            updateCurrentProject({ brand: extractedBrand })
          }
        }
        
        if (isMobile) setMobileModal('preview')
        
        // Show onboarding tips after first successful generation (not before)
        if (!localStorage.getItem('hatchit-onboarding-seen')) {
          // Small delay to let user see their creation first
          setTimeout(() => {
            setShowOnboarding(true)
          }, 1500)
        }
        
        // Return the AI's message explaining what it built
        return data.message || null
      }
      return null
    } catch (error) {
      // Don't show error toast if user cancelled
      if (error instanceof Error && error.name === 'AbortError') {
        return null
      }
      console.error('Generation failed:', error)
      showErrorToast('Generation failed. Please try again.')
      return null
    } finally {
      setIsGenerating(false)
      setGenerationProgress('')
      abortControllerRef.current = null
    }
  }

  // Wrapper for Chat component - always goes through complexity check first
  const handleGenerate = async (prompt: string, history: Message[], currentCode: string): Promise<string | null> => {
    return handleGenerateWithOptions(prompt, history, currentCode, false)
  }

  // Revert to previous code (one-step undo)
  const handleRevert = () => {
    if (!previousCode || !currentProject) return
    
    // Restore the previous code by going back one version
    if (currentPage && isMultiPageProject(currentProject)) {
      if (currentPage.currentVersionIndex > 0) {
        const updatedPages = currentProject.pages!.map(page =>
          page.id === currentPage.id
            ? { ...page, currentVersionIndex: page.currentVersionIndex - 1 }
            : page
        )
        updateCurrentProject({ pages: updatedPages })
        showSuccessToast('Reverted to previous version')
        setPreviousCode(null)
        setSuggestions([])
      }
    } else if (currentVersionIndex > 0) {
      updateCurrentProject({ currentVersionIndex: currentVersionIndex - 1 })
      showSuccessToast('Reverted to previous version')
      setPreviousCode(null)
      setSuggestions([])
    }
  }

  // Apply brand color change to current code
  const applyBrandColorChange = (oldColor: string, newColor: string) => {
    if (!code || !currentProject) return
    
    // Replace the color in the current code
    const updatedCode = code.replaceAll(oldColor, newColor)
    
    if (updatedCode === code) {
      showErrorToast('Color not found in current code')
      return
    }
    
    // Create a new version with the updated code
    const newVersion: Version = { 
      id: generateId(), 
      code: updatedCode, 
      timestamp: new Date().toISOString(), 
      prompt: `Changed color ${oldColor} to ${newColor}` 
    }
    
    // Update the brand colors
    const newBrandColors = (currentProject.brand?.colors || []).map(c => 
      c.toLowerCase() === oldColor.toLowerCase() ? newColor : c
    )
    
    if (currentPage && isMultiPageProject(currentProject)) {
      const updatedPages = currentProject.pages!.map(page =>
        page.id === currentPage.id
          ? {
              ...page,
              versions: [...page.versions.slice(0, page.currentVersionIndex + 1), newVersion],
              currentVersionIndex: page.currentVersionIndex + 1
            }
          : page
      )
      updateCurrentProject({ pages: updatedPages, brand: { ...currentProject.brand!, colors: newBrandColors } })
    } else {
      const newVersions = currentVersionIndex >= 0 ? [...versions.slice(0, currentVersionIndex + 1), newVersion] : [newVersion]
      updateCurrentProject({ versions: newVersions, currentVersionIndex: newVersions.length - 1, brand: { ...currentProject.brand!, colors: newBrandColors } })
    }
    
    showSuccessToast('Color updated!')
  }

  // Apply brand font change - prompts AI to regenerate with new font
  const applyBrandFontChange = (newFont: string) => {
    if (!currentProject) return
    updateCurrentProject({ brand: { ...currentProject.brand!, font: newFont } })
    setExternalPrompt(`Change all fonts to ${newFont}`)
    showSuccessToast(`Font set to ${newFont}. Click Generate to apply.`)
  }

  // Called when user proceeds despite complexity warning
  const handleProceedWithComplexPrompt = async () => {
    if (!complexityWarning) return
    const prompt = complexityWarning.prompt
    setComplexityWarning(null)
    // Get current build messages from localStorage
    const savedBuild = localStorage.getItem(`chat-build-${currentProjectId}`)
    const history = savedBuild ? JSON.parse(savedBuild) : []
    return handleGenerateWithOptions(prompt, history, code, true)
  }

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsGenerating(false)
      setGenerationProgress('')
    }
  }

  const handleUndo = () => {
    if (!canUndo || !currentProject) return
    if (isMultiPageProject(currentProject) && currentPage) {
      const updatedPages = currentProject.pages!.map(page =>
        page.id === currentPage.id
          ? { ...page, currentVersionIndex: page.currentVersionIndex - 1 }
          : page
      )
      updateCurrentProject({ pages: updatedPages })
    } else {
      updateCurrentProject({ currentVersionIndex: currentVersionIndex - 1 })
    }
  }

  const handleRedo = () => {
    if (!canRedo || !currentProject) return
    if (isMultiPageProject(currentProject) && currentPage) {
      const updatedPages = currentProject.pages!.map(page =>
        page.id === currentPage.id
          ? { ...page, currentVersionIndex: page.currentVersionIndex + 1 }
          : page
      )
      updateCurrentProject({ pages: updatedPages })
    } else {
      updateCurrentProject({ currentVersionIndex: currentVersionIndex + 1 })
    }
  }

  const restoreVersion = (index: number) => {
    if (!currentProject) return
    if (isMultiPageProject(currentProject) && currentPage) {
      const updatedPages = currentProject.pages!.map(page =>
        page.id === currentPage.id
          ? { ...page, currentVersionIndex: index }
          : page
      )
      updateCurrentProject({ pages: updatedPages })
    } else {
      updateCurrentProject({ currentVersionIndex: index })
    }
    setShowHistoryModal(false)
    setPreviewVersionIndex(null)
  }

  const handleDeploy = async (customName?: string) => {
    if ((!code && !previewPages) || isDeploying) return
    const slugName = customName || currentProject?.deployedSlug || currentProject?.name
    setIsDeploying(true)
    try {
      // Prepare payload based on project type
      const payload = previewPages 
        ? { pages: previewPages, projectName: slugName }
        : { code, projectName: slugName }
      
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (data.url) {
        // Poll for deployment readiness instead of fixed wait
        const startTime = Date.now()
        const maxWait = 120000 // 2 minutes max
        const pollInterval = 3000 // Check every 3 seconds
        
        while (Date.now() - startTime < maxWait) {
          try {
            const checkResponse = await fetch(data.url, { method: 'HEAD', mode: 'no-cors' })
            // If we get here without error, site is likely ready
            break
          } catch {
            // Site not ready yet, wait and retry
            await new Promise(r => setTimeout(r, pollInterval))
          }
        }
        setDeployedUrl(data.url)
        updateCurrentProject({ deployedSlug: customName || slugName?.toLowerCase().replace(/[^a-z0-9-]/g, '-') })
        track('Deployment Successful', { isUpdate: !!currentProject?.deployedSlug })
      } else {
        showErrorToast('Deploy failed: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Deploy failed:', error)
      showErrorToast('Deploy failed. Please try again.')
    } finally {
      setIsDeploying(false)
    }
  }

  const formatRelativeTime = (timestamp: string) => {
    const diffMs = Date.now() - new Date(timestamp).getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d ago`
    return new Date(timestamp).toLocaleDateString()
  }

  const connectDomain = async () => {
    if (!customDomain || !currentProject?.deployedSlug) return
    const domain = customDomain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim()
    setDomainStatus('adding')
    setDomainError('')
    try {
      const response = await fetch('/api/domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, projectSlug: currentProject.deployedSlug }),
      })
      const data = await response.json()
      if (data.success) {
        setDomainStatus('pending')
        updateCurrentProject({ customDomain: domain })
      } else {
        setDomainStatus('error')
        setDomainError(data.error || 'Failed to add domain')
      }
    } catch (error) {
      console.error('Domain connection failed:', error)
      setDomainStatus('error')
      setDomainError('Failed to connect domain')
    }
  }

  const searchDomain = async () => {
    if (!domainSearch.trim()) return
    setIsSearchingDomain(true)
    setDomainSearchResult(null)
    try {
      const response = await fetch(`/api/domain-search?domain=${encodeURIComponent(domainSearch.trim())}`)
      const data = await response.json()
      if (data.domain) {
        setDomainSearchResult(data)
      }
    } catch (error) {
      console.error('Domain search failed:', error)
    } finally {
      setIsSearchingDomain(false)
    }
  }

  const buyDomain = async () => {
    if (!domainSearchResult?.available || !domainSearchResult.price || !currentProject?.deployedSlug) return
    setIsBuyingDomain(true)
    try {
      const response = await fetch('/api/domain-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: domainSearchResult.domain,
          price: domainSearchResult.price,
          projectSlug: currentProject.deployedSlug,
        }),
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to start checkout')
      }
    } catch (error) {
      console.error('Domain checkout failed:', error)
      alert('Failed to start checkout')
    } finally {
      setIsBuyingDomain(false)
    }
  }

  const handleShipClick = () => {
    if (!isCurrentProjectPaid) {
      setUpgradeReason('deploy')
      setShowUpgradeModal(true)
      return
    }
    if (isDeployed) {
      setShowShipModal(true)
    } else {
      setDeployName(currentProject?.name?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || '')
      setShowDeployModal(true)
    }
  }

  const handleDomainClick = () => {
    if (!isCurrentProjectPaid) {
      setUpgradeReason('deploy')
      setShowUpgradeModal(true)
      return
    }
    setShowDomainModal(true)
    setDomainStatus('idle')
    setCustomDomain(currentProject?.customDomain || '')
  }

  const handleDownloadClick = async () => {
    if (!isCurrentProjectPaid) {
      setUpgradeReason('download')
      setShowUpgradeModal(true)
      return
    }
    // Trigger download through a custom event
    window.dispatchEvent(new CustomEvent('triggerDownload'))
  }

  const HatchedBadge = () => (
    <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-full">
      <span className="text-xs">🐣</span>
      <span className="text-xs font-medium bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">Hatched</span>
    </div>
  )

  const ProjectDropdown = () => (
    <div ref={dropdownRef} className="absolute top-full left-0 mt-2 w-72 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-[9999] overflow-hidden">
      <button 
        onClick={createProject} 
        className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-zinc-800 transition-colors border-b border-zinc-800 ${!hasAnyPaidSubscription && projects.length >= 1 ? 'opacity-50' : ''}`}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${!hasAnyPaidSubscription && projects.length >= 1 ? 'bg-zinc-700' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}>
          {!hasAnyPaidSubscription && projects.length >= 1 ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          )}
        </div>
        <div className="flex-1 text-left">
          <span className="text-sm font-medium text-white">New Project</span>
          {!hasAnyPaidSubscription && projects.length >= 1 && (
            <span className="block text-xs text-purple-400">Upgrade to unlock</span>
          )}
        </div>
      </button>
      <div className="max-h-64 overflow-y-auto">
        {projects.map(project => (
          <button key={project.id} onClick={() => switchProject(project.id)} className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-zinc-800 transition-colors ${project.id === currentProjectId ? 'bg-zinc-800' : ''}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${project.id === currentProjectId ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-zinc-400'}`}>{project.name.charAt(0).toUpperCase()}</div>
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-medium text-white truncate flex items-center gap-2">
                {project.name}
                {subscriptions.some(s => s.projectSlug === project.deployedSlug && s.status === 'active') && <span className="text-[10px]">🐣</span>}
                {project.deployedSlug && <span className="text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded">LIVE</span>}
              </div>
              <div className="text-xs text-zinc-500">{project.versions?.length || 0} versions</div>
            </div>
          </button>
        ))}
      </div>
      {currentProject && (
        <div className="border-t border-zinc-800 p-2 flex flex-wrap gap-1">
          <button onClick={() => { setRenameValue(currentProject.name); setShowRenameModal(true); setShowProjectDropdown(false) }} className="flex-1 px-3 py-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">Rename</button>
          <button onClick={duplicateProject} disabled={!hasAnyPaidSubscription && projects.length >= 1} className={`flex-1 px-3 py-2 text-xs rounded-lg transition-colors ${!hasAnyPaidSubscription && projects.length >= 1 ? 'text-zinc-600 cursor-not-allowed opacity-50' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`} title={!hasAnyPaidSubscription && projects.length >= 1 ? 'Upgrade to duplicate projects' : ''}>Duplicate</button>
          <button onClick={() => { setShowDeleteModal(true); setShowProjectDropdown(false) }} className="flex-1 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-zinc-800 rounded-lg transition-colors">Delete</button>
          {!currentProject.deployedSlug && (currentProject.versions?.length || 0) > 0 && (
            <button onClick={startOver} className="w-full mt-1 px-3 py-2 text-xs text-amber-400 hover:text-amber-300 hover:bg-zinc-800 rounded-lg transition-colors">Start Over</button>
          )}
        </div>
      )}
      {projects.length > 1 && (
        <div className="border-t border-zinc-800 p-2">
          <button onClick={() => { setShowDeleteAllModal(true); setShowProjectDropdown(false) }} className="w-full px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-zinc-800 rounded-lg transition-colors">Delete All Projects</button>
        </div>
      )}
    </div>
  )

  const RenameModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
        <h2 className="text-lg font-semibold text-white mb-4">Rename Project</h2>
        <input type="text" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && renameProject()} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500" placeholder="Project name" autoFocus />
        <div className="flex gap-3 justify-end mt-4">
          <button onClick={() => setShowRenameModal(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={renameProject} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors">Save</button>
        </div>
      </div>
    </div>
  )

  const DeleteModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
        <h2 className="text-lg font-semibold text-white mb-2">Delete Project?</h2>
        <p className="text-zinc-400 text-sm mb-4">This will permanently delete &quot;{currentProject?.name}&quot;. This action cannot be undone.</p>
        {currentProject?.deployedSlug && (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span className="text-amber-400 text-xs">This site is live at {currentProject.deployedSlug}.hatchitsites.dev</span>
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={deleteProject} className="px-4 py-2 text-sm bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors">Delete</button>
        </div>
      </div>
    </div>
  )

  const DeleteAllModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
        <h2 className="text-lg font-semibold text-white mb-2">Delete All Projects?</h2>
        <p className="text-zinc-400 text-sm mb-4">This will permanently delete all {projects.length} project{projects.length !== 1 ? 's' : ''} and their history. This action cannot be undone.</p>
        {projects.some(p => p.deployedSlug) && (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span className="text-amber-400 text-xs">Some projects are deployed and will remain live</span>
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <button onClick={() => setShowDeleteAllModal(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={deleteAllProjects} className="px-4 py-2 text-sm bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors">Delete All</button>
        </div>
      </div>
    </div>
  )

  const StartOverModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
        <h2 className="text-lg font-semibold text-white mb-2">Start Again?</h2>
        <p className="text-zinc-400 text-sm mb-4">This will clear all code and history for &quot;{currentProject?.name}&quot;. You&apos;ll have a fresh canvas to build something new.</p>
        {currentProject?.deployedSlug && (
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            <span className="text-blue-400 text-xs">Your deployed site will remain live until you redeploy</span>
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <button onClick={() => setShowStartOverModal(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={startOver} className="px-4 py-2 text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white rounded-xl transition-colors">Start Fresh</button>
        </div>
      </div>
    </div>
  )

  const HistoryModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-4 md:px-6 py-4 border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-semibold text-white truncate">Version History</h2>
          <button onClick={() => { setShowHistoryModal(false); setPreviewVersionIndex(null) }} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors flex-shrink-0 ml-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="flex-1 flex overflow-hidden flex-col md:flex-row min-h-0">
          <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-zinc-800 overflow-y-auto max-h-[40vh] md:max-h-none">
            {versions.length === 0 ? (
              <div className="p-4 text-zinc-500 text-sm text-center">No versions yet</div>
            ) : (
              [...versions].reverse().map((version, reversedIndex) => {
                const index = versions.length - 1 - reversedIndex
                const isCurrent = index === currentVersionIndex
                const isPreviewing = index === previewVersionIndex
                return (
                  <button key={version.id} onClick={() => setPreviewVersionIndex(index)} className={`w-full px-4 py-3 text-left border-b border-zinc-800/50 transition-colors text-sm md:text-base ${isPreviewing ? 'bg-blue-600/20' : isCurrent ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">v{index + 1}</span>
                      {isCurrent && <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">CURRENT</span>}
                    </div>
                    <div className="text-xs text-zinc-500 mb-1">{formatRelativeTime(version.timestamp)}</div>
                    {version.prompt && <div className="text-xs text-zinc-400 truncate">&quot;{version.prompt}&quot;</div>}
                  </button>
                )
              })
            )}
          </div>
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            {previewVersionIndex !== null ? (
              <>
                <div className="flex-1 overflow-auto bg-zinc-950 min-h-0"><LivePreview code={versions[previewVersionIndex]?.code || ''} pages={undefined} currentPageId={undefined} isLoading={false} isPaid={isCurrentProjectPaid} setShowUpgradeModal={setShowUpgradeModal} /></div>
                <div className="px-4 py-3 border-t border-zinc-800 flex items-center justify-between flex-shrink-0">
                  <span className="text-sm text-zinc-400">Previewing v{previewVersionIndex + 1}</span>
                  {previewVersionIndex !== currentVersionIndex && <button onClick={() => restoreVersion(previewVersionIndex)} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors whitespace-nowrap ml-2">Restore</button>}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">Select a version</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const DeployConfirmModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-lg font-semibold text-white mb-2">{isDeployed ? 'Update Site' : 'Deploy Site'}</h2>
        <p className="text-zinc-400 text-sm mb-4">{isDeployed ? 'Update your live site with the latest changes' : 'Choose a name for your site URL'}</p>
        {isDeployed ? (
          <div className="text-sm text-zinc-500 mb-6 break-all">Updating: <span className="text-blue-400 font-mono text-xs">{currentProject?.deployedSlug}.hatchitsites.dev</span></div>
        ) : (
          <>
            <input type="text" value={deployName} onChange={(e) => setDeployName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 mb-2 text-base" placeholder="my-awesome-site" autoFocus />
            <div className="text-sm text-zinc-500 mb-6 break-all">Your site will be live at: <span className="text-blue-400 font-mono text-xs">{deployName || 'your-site'}.hatchitsites.dev</span></div>
          </>
        )}
        <div className="flex gap-3">
          <button onClick={() => setShowDeployModal(false)} className="flex-1 px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={() => { setShowDeployModal(false); handleDeploy(isDeployed ? currentProject?.deployedSlug : deployName) }} disabled={!isDeployed && !deployName} className="flex-1 px-4 py-2 text-sm bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-xl transition-colors">{isDeployed ? 'Update 🔄' : 'Deploy �'}</button>
        </div>
      </div>
    </div>
  )

  const DeployedModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4 mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 className="text-lg font-semibold text-white mb-2 text-center">{isDeployed ? 'Site Updated! 🔄' : 'Site Deployed! �'}</h2>
        <p className="text-zinc-400 text-sm mb-4 text-center">Your site is now live at:</p>
        <a href={deployedUrl!} target="_blank" rel="noopener noreferrer" className="block w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-blue-400 hover:text-blue-300 text-center text-sm break-all transition-colors mb-4">{deployedUrl}</a>
        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={() => setDeployedUrl(null)} className="px-3 py-2.5 text-sm text-zinc-400 hover:text-white transition-colors border border-zinc-700 rounded-lg">Close</button>
          <a href={deployedUrl!} target="_blank" rel="noopener noreferrer" className="flex-1 px-3 py-2.5 text-sm bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors text-center flex items-center justify-center gap-1.5 whitespace-nowrap">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            View
          </a>
          <button onClick={() => { navigator.clipboard.writeText(deployedUrl!); setCopied(true); setTimeout(() => setCopied(false), 2000) }} className="flex-1 px-3 py-2.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">{copied ? '✓ Copied!' : 'Copy URL'}</button>
        </div>
      </div>
    </div>
  )

  const DeployingOverlay = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
        <div className="w-16 h-16 mx-auto mb-6 relative">
          <div className="absolute inset-0 border-4 border-zinc-700 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Deploying your site...</h2>
        <p className="text-zinc-400 text-sm mb-4">This usually takes about a minute.</p>
        <div className="flex items-center justify-center gap-2 text-zinc-500 text-xs">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Building & optimizing</span>
        </div>
      </div>
    </div>
  )

  const DomainModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Connect Custom Domain</h2>
            <p className="text-xs text-zinc-500 mt-1">Point your domain to your deployed site</p>
          </div>
          <button onClick={() => setShowDomainModal(false)} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Current deployment domain */}
        <div className="mb-6 pb-6 border-b border-zinc-800">
          <div className="text-xs text-zinc-500 mb-2">Your Current Site</div>
          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            <a href={`https://${currentProject?.deployedSlug}.hatchitsites.dev`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300 transition-colors truncate flex-1">
              {currentProject?.deployedSlug}.hatchitsites.dev
            </a>
            <button onClick={() => { navigator.clipboard.writeText(`https://${currentProject?.deployedSlug}.hatchitsites.dev`); setCopied(true); setTimeout(() => setCopied(false), 2000) }} className="text-zinc-400 hover:text-white flex-shrink-0 p-1 transition-colors">
              {copied ? <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
            </button>
          </div>
        </div>

        {/* Custom domain input */}
        <div className="mb-6">
          <div className="text-xs text-zinc-500 mb-2 font-medium">Custom Domain</div>
          {currentProject?.customDomain && domainStatus !== 'idle' && domainStatus !== 'adding' && domainStatus !== 'error' ? (
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800 rounded-lg mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              <a href={`https://${currentProject.customDomain}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300 transition-colors truncate flex-1">
                {currentProject.customDomain}
              </a>
              <button onClick={() => { setDomainStatus('idle'); setCustomDomain('') }} className="text-xs text-zinc-500 hover:text-white transition-colors">Change</button>
            </div>
          ) : null}
          
          {domainStatus === 'idle' || domainStatus === 'adding' || domainStatus === 'error' ? (
            <div>
              <input 
                ref={domainInputRef} 
                type="text" 
                value={customDomain} 
                onChange={(e) => setCustomDomain(e.target.value.toLowerCase())} 
                onKeyDown={(e) => e.key === 'Enter' && customDomain && connectDomain()} 
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 mb-3 text-base transition-all" 
                placeholder="example.com or www.example.com" 
              />
              {domainError && <p className="text-red-400 text-sm mb-3 flex items-center gap-2"><span>⚠️</span>{domainError}</p>}
              
              <button 
                onClick={connectDomain} 
                disabled={!customDomain || domainStatus === 'adding'} 
                className="w-full px-4 py-3 text-sm bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:cursor-not-allowed disabled:text-zinc-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
              >
                {domainStatus === 'adding' ? (
                  <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Checking Domain...</>
                ) : 'Verify Connection'}
              </button>
            </div>
          ) : null}
        </div>

        {/* DNS Instructions - Show after domain is submitted */}
        {(domainStatus === 'pending' || domainStatus === 'success') && (
          <div className="mb-6 pb-6 border-b border-zinc-800">
            <div className="flex items-center gap-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span className="text-amber-400 text-sm font-medium">DNS Configuration Required</span>
            </div>
            
            <p className="text-xs text-zinc-400 mb-4">Add this CNAME record to your domain provider (GoDaddy, Namecheap, Cloudflare, etc.):</p>
            
            <div className="space-y-3 bg-zinc-800/50 rounded-lg p-4 mb-4 border border-zinc-700">
              <div>
                <div className="text-xs text-zinc-500 mb-1.5 font-medium">Record Type</div>
                <div className="text-sm text-white font-mono bg-zinc-900 px-3 py-2 rounded flex items-center justify-between">
                  CNAME
                  <button onClick={() => { navigator.clipboard.writeText('CNAME'); setCopied(true); setTimeout(() => setCopied(false), 2000) }} className="text-zinc-400 hover:text-white transition-colors">
                    {copied ? '✓' : '⎘'}
                  </button>
                </div>
              </div>
              
              <div>
                <div className="text-xs text-zinc-500 mb-1.5 font-medium">Name/Host</div>
                <div className="text-sm text-white font-mono bg-zinc-900 px-3 py-2 rounded flex items-center justify-between">
                  {customDomain.startsWith('www.') ? 'www' : '@'}
                  <button onClick={() => { navigator.clipboard.writeText(customDomain.startsWith('www.') ? 'www' : '@'); setCopied(true); setTimeout(() => setCopied(false), 2000) }} className="text-zinc-400 hover:text-white transition-colors">
                    {copied ? '✓' : '⎘'}
                  </button>
                </div>
              </div>
              
              <div>
                <div className="text-xs text-zinc-500 mb-1.5 font-medium">Value/Target</div>
                <div className="text-sm text-white font-mono bg-zinc-900 px-3 py-2 rounded flex items-center justify-between">
                  cname.vercel-dns.com
                  <button onClick={() => { navigator.clipboard.writeText('cname.vercel-dns.com'); setCopied(true); setTimeout(() => setCopied(false), 2000) }} className="text-zinc-400 hover:text-white transition-colors">
                    {copied ? '✓' : '⎘'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3 text-xs text-blue-200 mb-4">
              <p className="font-medium mb-1">⏱️ DNS Propagation</p>
              <p>DNS changes can take up to 48 hours to fully propagate, but usually appear within 5-30 minutes.</p>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setShowDomainModal(false)} 
                className="flex-1 px-4 py-2.5 text-sm text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-600 rounded-lg transition-colors font-medium"
              >
                Close
              </button>
              <a 
                href={`https://${customDomain}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex-1 px-4 py-2.5 text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-center font-medium"
              >
                Check Connection
              </a>
            </div>
          </div>
        )}

        {/* Help section */}
        {(domainStatus === 'idle' || domainStatus === 'adding' || domainStatus === 'error') && (
          <div className="pt-4 border-t border-zinc-800">
            {/* Domain Search Section */}
            <div className="mb-4">
              <p className="text-xs font-medium text-zinc-400 mb-3">🔍 Need a domain?</p>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={domainSearch}
                  onChange={(e) => setDomainSearch(e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && searchDomain()}
                  placeholder="Search for a domain..."
                  className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 text-sm"
                />
                <button
                  onClick={searchDomain}
                  disabled={!domainSearch.trim() || isSearchingDomain}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {isSearchingDomain ? '...' : 'Search'}
                </button>
              </div>
              
              {/* Search Result */}
              {domainSearchResult && (
                <div className={`p-3 rounded-lg border ${domainSearchResult.available ? 'bg-emerald-900/20 border-emerald-700/30' : 'bg-red-900/20 border-red-700/30'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-white">{domainSearchResult.domain}</span>
                      {domainSearchResult.available ? (
                        <span className="ml-2 text-xs text-emerald-400">✓ Available</span>
                      ) : (
                        <span className="ml-2 text-xs text-red-400">✗ Taken</span>
                      )}
                      {domainSearchResult.available && domainSearchResult.price && (
                        <span className="block text-xs text-zinc-400 mt-1">${domainSearchResult.price}/year</span>
                      )}
                    </div>
                    {domainSearchResult.available && domainSearchResult.price && (
                      <button
                        onClick={buyDomain}
                        disabled={isBuyingDomain}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        {isBuyingDomain ? 'Loading...' : 'Buy Now →'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-zinc-500">
              <span className="block font-medium text-zinc-400 mb-2">Need help?</span>
              Contact <a href="mailto:support@hatchit.dev" className="text-blue-400 hover:text-blue-300 transition-colors">support@hatchit.dev</a>
            </p>
          </div>
        )}
      </div>
    </div>
  )

  const MobileModal = ({ type, onClose }: { type: 'preview' | 'code', onClose: () => void }) => (
    <div className="fixed inset-0 z-[10000] bg-zinc-950 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-2 py-2 border-b border-zinc-800 bg-zinc-900 flex-shrink-0">
        <button onClick={onClose} className="p-3 text-zinc-400 hover:text-white active:bg-zinc-800 rounded-lg transition-colors flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <span className="text-sm font-medium text-white truncate px-2">{currentProject?.name}</span>
        <button onClick={onClose} className="p-3 text-zinc-400 hover:text-white active:bg-zinc-800 rounded-lg transition-colors flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div className="flex-1 overflow-auto">{type === 'preview' ? <LivePreview code={code} pages={previewPages} currentPageId={currentProject?.currentPageId} isLoading={isGenerating} loadingProgress={generationProgress} isPaid={isCurrentProjectPaid} assets={currentProject?.assets} setShowUpgradeModal={setShowUpgradeModal} onViewCode={() => { onClose(); setActiveTab('code') }} onRegenerate={handleRegenerateFromError} onQuickFix={handleQuickFix} /> : <CodePreview code={code} isPaid={isCurrentProjectPaid} onCodeChange={handleCodeChange} pagePath={currentPage?.path} />}</div>
    </div>
  )

  const ProjectSelector = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="relative z-[9999]">
      <button onClick={() => setShowProjectDropdown(!showProjectDropdown)} className={`flex items-center gap-2 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 rounded-lg transition-colors ${mobile ? 'px-2.5 py-1.5' : 'px-3 py-2'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500 flex-shrink-0"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
        <span className={`font-medium text-white truncate ${mobile ? 'max-w-[100px] text-sm' : 'max-w-[140px]'}`}>{currentProject?.name || 'Select Project'}</span>
        {!mobile && isDeployed && <span className="text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded font-medium">LIVE</span>}
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-zinc-500 flex-shrink-0 transition-transform ${showProjectDropdown ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {showProjectDropdown && <ProjectDropdown />}
    </div>
  )

  const PagesButton = ({ mobile = false }: { mobile?: boolean }) => (
    <button 
      onClick={() => setShowPagesPanel(!showPagesPanel)} 
      className={`flex items-center gap-2 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 rounded-lg transition-colors ${mobile ? 'px-2.5 py-1.5' : 'px-3 py-2'}`}
      title="Manage Pages"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500 flex-shrink-0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      <span className={`text-white ${mobile ? 'text-sm' : ''}`}>{currentPage?.name || 'Home'}</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
  )

  const PagesPanel = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPagesPanel(false)}>
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md max-h-[80vh] flex flex-col border border-zinc-800" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Pages ({currentProject?.pages?.length || 0})</h2>
          <button onClick={() => setShowPagesPanel(false)} className="text-zinc-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div className="space-y-2 mb-4 overflow-y-auto flex-1 min-h-0">
          {currentProject?.pages?.map(page => (
            <div key={page.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${page.id === currentPage?.id ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-zinc-800 hover:bg-zinc-700'}`}>
              <button onClick={() => switchPage(page.id)} className="flex-1 text-left">
                <div className="font-medium text-white">{page.name}</div>
                <div className="text-xs text-zinc-400">{page.path}</div>
              </button>
              {currentProject.pages!.length > 1 && (
                <button onClick={() => {
                  if (confirm(`Delete "${page.name}" page? This cannot be undone.`)) {
                    deletePage(page.id)
                  }
                }} className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => { setShowPagesPanel(false); setShowAddPageModal(true) }} 
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Page
          </button>
          {currentProject?.pages && currentProject.pages.length > 1 && (
            <button 
              onClick={() => {
                if (confirm(`Delete all pages except the first one (${currentProject.pages![0].name})? This cannot be undone.`)) {
                  deleteAllPagesExceptFirst()
                }
              }} 
              className="py-2.5 px-4 bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-red-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border border-red-600/30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              Delete All
            </button>
          )}
        </div>
      </div>
    </div>
  )

  const AddPageModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddPageModal(false)}>
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md border border-zinc-800" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Add New Page</h2>
          <button onClick={() => setShowAddPageModal(false)} className="text-zinc-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Page Name</label>
            <input
              type="text"
              value={newPageName}
              onChange={(e) => setNewPageName(e.target.value)}
              placeholder="About, Contact, Services..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm text-zinc-400 mb-2">URL Path</label>
            <input
              type="text"
              value={newPagePath}
              onChange={(e) => setNewPagePath(e.target.value)}
              placeholder="/about (optional - auto-generated)"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => { setShowAddPageModal(false); setNewPageName(''); setNewPagePath('') }}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={addPage}
              disabled={!newPageName.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              Add Page
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const HistoryButton = () => {
    if (!isCurrentProjectPaid) {
      return (
        <button 
          onClick={() => {
            setUpgradeReason('deploy')
            setShowUpgradeModal(true)
          }} 
          className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all" 
          title="Version history (Hatched feature)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </button>
      )
    }
    return (
      <button onClick={() => setShowHistoryModal(true)} disabled={versions.length === 0} className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed" title={`Version history (${versions.length} versions)`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </button>
    )
  }

  const AssetsButton = () => (
    <button 
      onClick={() => setShowAssetsModal(true)} 
      className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all" 
      title={`Assets (${currentProject?.assets?.length || 0})`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
    </button>
  )

  const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !currentProject) return
    
    const newAssets: Asset[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) continue
      
      // Convert to base64
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })
      
      // Determine type based on filename/usage
      let type: 'logo' | 'image' | 'icon' = 'image'
      const name = file.name.toLowerCase()
      if (name.includes('logo')) type = 'logo'
      else if (name.includes('icon') || name.includes('favicon')) type = 'icon'
      
      newAssets.push({
        id: Date.now().toString() + i,
        name: file.name,
        type,
        dataUrl,
        createdAt: new Date().toISOString()
      })
    }
    
    if (newAssets.length > 0) {
      updateCurrentProject({
        assets: [...(currentProject.assets || []), ...newAssets]
      })
    }
    
    // Reset input
    e.target.value = ''
  }

  const handleAssetDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (!files || !currentProject) return
    
    const newAssets: Asset[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) continue
      
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })
      
      let type: 'logo' | 'image' | 'icon' = 'image'
      const name = file.name.toLowerCase()
      if (name.includes('logo')) type = 'logo'
      else if (name.includes('icon') || name.includes('favicon')) type = 'icon'
      
      newAssets.push({
        id: Date.now().toString() + i,
        name: file.name,
        type,
        dataUrl,
        createdAt: new Date().toISOString()
      })
    }
    
    if (newAssets.length > 0) {
      updateCurrentProject({
        assets: [...(currentProject.assets || []), ...newAssets]
      })
    }
  }

  const deleteAsset = (assetId: string) => {
    if (!currentProject) return
    updateCurrentProject({
      assets: (currentProject.assets || []).filter(a => a.id !== assetId)
    })
  }

  const copyAssetUrl = async (dataUrl: string) => {
    await navigator.clipboard.writeText(dataUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const AssetsModal = () => {
    const assets = currentProject?.assets || []
    const [dragOver, setDragOver] = useState(false)
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAssetsModal(false)}>
        <div 
          className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Assets</h2>
            <button onClick={() => setShowAssetsModal(false)} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          
          <p className="text-sm text-zinc-400 mb-4">
            Upload logos, photos, and icons. You can reference these in your prompts by describing them (e.g. &quot;use my uploaded logo&quot;).
          </p>
          
          {/* Upload Zone */}
          <div 
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all mb-4 ${dragOver ? 'border-purple-500 bg-purple-500/10' : 'border-zinc-700 hover:border-zinc-600'}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { setDragOver(false); handleAssetDrop(e) }}
          >
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={handleAssetUpload}
              className="hidden" 
              id="asset-upload"
            />
            <label htmlFor="asset-upload" className="cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2 text-zinc-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <p className="text-sm text-zinc-400">
                <span className="text-purple-400 font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-zinc-500 mt-1">PNG, JPG, SVG, WebP</p>
            </label>
          </div>
          
          {/* Guidelines */}
          <div className="bg-zinc-800/50 rounded-lg p-3 mb-4">
            <h4 className="text-xs font-medium text-zinc-300 mb-2">📋 Guidelines</h4>
            <ul className="text-xs text-zinc-500 space-y-1">
              <li>• <strong>Logos:</strong> Include &quot;logo&quot; in filename (e.g. my-logo.png)</li>
              <li>• <strong>Icons:</strong> Include &quot;icon&quot; in filename</li>
              <li>• <strong>Best size:</strong> Under 100KB for fast loading</li>
              <li>• <strong>Format:</strong> PNG or SVG for logos, JPG for photos</li>
            </ul>
          </div>
          
          {/* Assets Grid */}
          {assets.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-white">Uploaded ({assets.length})</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {assets.map(asset => (
                  <div key={asset.id} className="group relative bg-zinc-800 rounded-lg overflow-hidden aspect-square">
                    <img 
                      src={asset.dataUrl} 
                      alt={asset.name}
                      className="w-full h-full object-contain p-2"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${asset.type === 'logo' ? 'bg-purple-500/30 text-purple-300' : asset.type === 'icon' ? 'bg-blue-500/30 text-blue-300' : 'bg-green-500/30 text-green-300'}`}>
                        {asset.type}
                      </span>
                      <p className="text-xs text-white truncate px-2 max-w-full">{asset.name}</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => copyAssetUrl(asset.dataUrl)}
                          className="p-1.5 bg-zinc-700 hover:bg-zinc-600 rounded text-white transition-colors"
                          title="Copy data URL"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        </button>
                        <button 
                          onClick={() => deleteAsset(asset.id)}
                          className="p-1.5 bg-red-600/80 hover:bg-red-600 rounded text-white transition-colors"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {assets.length === 0 && (
            <div className="text-center py-6 text-zinc-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-2 opacity-50"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <p className="text-sm">No assets uploaded yet</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const ShipButton = ({ mobile = false }: { mobile?: boolean }) => (
    <button 
      onClick={handleShipClick} 
      disabled={!code || isDeploying} 
      className={`${mobile ? 'flex-1 py-3 rounded-xl font-semibold' : 'px-4 py-1.5 rounded-lg text-sm font-medium'} ${isDeployed ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500'} disabled:bg-zinc-700 disabled:cursor-not-allowed text-white transition-all flex items-center justify-center gap-2`}
    >
      {isDeploying ? (
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span>Shipping...</span>
        </div>
      ) : (
        <>
          <span>{isDeployed ? 'Manage Site' : 'Ship it'}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
        </>
      )}
    </button>
  )

  const DomainButton = ({ mobile = false }: { mobile?: boolean }) => (
    <button 
      onClick={handleDomainClick}
      disabled={!isDeployed}
      className={`${mobile ? 'py-3 px-4 rounded-xl font-semibold' : 'px-2.5 py-1.5 rounded-lg text-xs font-medium'} border border-zinc-700 hover:border-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-1.5`}
      title={isDeployed ? 'Manage domain' : 'Deploy first to connect a domain'}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      {!mobile && (currentProject?.customDomain || 'Domain')}
    </button>
  )

  const ShipModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-xl p-6 md:p-8 w-full max-w-md border border-zinc-800">
        <h2 className="text-2xl font-bold mb-2 text-white">Ship your site</h2>
        <p className="text-zinc-400 mb-6">Manage your deployed project</p>
        
        <div className="space-y-3">
          <button
            onClick={() => handleDeploy()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 active:scale-95">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-6" />
            </svg>
            Push Update
          </button>
          
          <button
            onClick={() => {
              setShowShipModal(false)
              setShowDomainModal(true)
            }}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 active:scale-95">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
            Manage Domain
          </button>
          
          <button
            onClick={() => {
              handleDownloadClick()
              setShowShipModal(false)
            }}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 active:scale-95">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download ZIP
          </button>
        </div>
        
        <button
          onClick={() => setShowShipModal(false)}
          className="w-full mt-4 text-zinc-400 hover:text-zinc-300 font-medium py-2"
        >
          Cancel
        </button>
      </div>
    </div>
  )

  const OnboardingModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[10000] p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-2xl my-8">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">🐣</div>
          <h2 className="text-2xl font-bold text-white mb-2">You're building!</h2>
          <p className="text-zinc-400">Here are a few tips to get the most out of HatchIt.</p>
        </div>
        
        {/* Quick tips - simplified */}
        <div className="bg-zinc-800/50 rounded-xl p-4 mb-6 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">🔄</span>
            <div>
              <p className="text-sm text-white font-medium">Iterate to improve</p>
              <p className="text-xs text-zinc-400">Say "make the header bigger" or "add a contact form"</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">💬</span>
            <div>
              <p className="text-sm text-white font-medium">Ask AI for advice</p>
              <p className="text-xs text-zinc-400">Get help without changing your code</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">🚀</span>
            <div>
              <p className="text-sm text-white font-medium">Deploy when ready</p>
              <p className="text-xs text-zinc-400">Get a live URL you can share with anyone</p>
            </div>
          </div>
        </div>
        
        {/* What works best */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
            <h4 className="text-xs font-semibold text-green-400 mb-2">Works great</h4>
            <ul className="text-xs text-zinc-400 space-y-1">
              <li>• Landing pages</li>
              <li>• Business sites</li>
              <li>• Portfolios</li>
            </ul>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
            <h4 className="text-xs font-semibold text-orange-400 mb-2">Not supported</h4>
            <ul className="text-xs text-zinc-400 space-y-1">
              <li>• Database apps</li>
              <li>• Auth systems</li>
              <li>• E-commerce</li>
            </ul>
          </div>
        </div>
        
        <button
          onClick={() => {
            localStorage.setItem('hatchit-onboarding-seen', 'true')
            setShowOnboarding(false)
          }}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all"
        >
          Got it! →
        </button>
        
        <p className="text-xs text-zinc-500 text-center mt-4">
          10 free generations per day • Unlimited with paid plan
        </p>
      </div>
    </div>
  )

  const FaqModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Help & FAQ</h2>
          <button onClick={() => setShowFaqModal(false)} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-white mb-2 flex items-center gap-2">
              <span>🎨</span> What can I build?
            </h3>
            <p className="text-sm text-zinc-400">Landing pages, portfolios, business sites, pricing pages, and more. Describe what you want and we generate production-ready React code.</p>
          </div>
          <div className="border-t border-zinc-800 pt-4">
            <h3 className="font-medium text-white mb-2 flex items-center gap-2">
              <span>💡</span> Tips for best results
            </h3>
            <p className="text-sm text-zinc-400">Start simple, then iterate. &quot;A landing page for a coffee shop&quot; → &quot;Add a menu section&quot; → &quot;Make it darker&quot;. Short prompts work better than long ones.</p>
          </div>
          <div className="border-t border-zinc-800 pt-4">
            <h3 className="font-medium text-white mb-2 flex items-center gap-2">
              <span>📝</span> How do forms work?
            </h3>
            <p className="text-sm text-zinc-400">We use <span className="text-blue-400 font-medium">Formspree.io</span> for form handling. Sign up free, get your form ID, and replace <span className="font-mono text-xs bg-zinc-800 px-1.5 py-0.5 rounded">YOUR_ID</span> in the code.</p>
          </div>
          <div className="border-t border-zinc-800 pt-4">
            <h3 className="font-medium text-white mb-2 flex items-center gap-2">
              <span>💾</span> Where is my work saved?
            </h3>
            <p className="text-sm text-zinc-400">Your projects are stored locally in your browser. Deploy to save permanently and access from anywhere.</p>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-zinc-800">
          <Link href="/faq" onClick={() => setShowFaqModal(false)} className="flex items-center justify-center gap-2 w-full py-2.5 text-sm text-blue-400 hover:text-blue-300 hover:bg-zinc-800 rounded-lg transition-colors">
            View all FAQs →
          </Link>
        </div>
      </div>
    </div>
  )

  const UploadModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Import HTML</h2>
          <button onClick={() => setShowUploadModal(false)} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-green-400 mt-0.5">✓</span>
            <div>
              <p className="text-sm text-white font-medium">Works with</p>
              <p className="text-xs text-zinc-400">Static HTML pages, exported Webflow/Framer sites, HTML templates</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-400 mt-0.5">⚠</span>
            <div>
              <p className="text-sm text-white font-medium">Not for React projects</p>
              <p className="text-xs text-zinc-400">React/Next.js apps with imports won&apos;t work. Just describe what you want and let AI build it!</p>
            </div>
          </div>
        </div>

        <label className="block">
          <input 
            type="file" 
            accept=".html,.htm" 
            onChange={(e) => { handleCodeUpload(e); setShowUploadModal(false) }} 
            className="hidden" 
          />
          <div className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-center rounded-xl font-semibold cursor-pointer transition-all">
            Choose HTML File
          </div>
        </label>
        
        <p className="text-xs text-zinc-500 text-center mt-3">
          Tip: Most users get better results just describing what they want
        </p>
      </div>
    </div>
  )

  // New Project Naming Modal
  const NewProjectModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Name your project</h2>
          <button onClick={() => setShowNewProjectModal(false)} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        
        <p className="text-sm text-zinc-400 mb-4">Give your project a memorable name. You can change it later.</p>
        
        <input
          ref={projectNameInputRef}
          type="text"
          onKeyDown={(e) => e.key === 'Enter' && confirmCreateProject()}
          placeholder="e.g. My Portfolio, Business Site..."
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 mb-4"
          autoFocus
        />
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowNewProjectModal(false)}
            className="flex-1 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmCreateProject}
            className="flex-1 px-4 py-2.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors font-medium"
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  )

  // Welcome Back Modal (cross-device sync)
  const WelcomeBackModal = () => {
    const paidProjects = deployedProjects.filter(dp => 
      subscriptions.some(s => s.projectSlug === dp.slug && s.status === 'active')
    )
    const freeProjects = deployedProjects.filter(dp => 
      !subscriptions.some(s => s.projectSlug === dp.slug && s.status === 'active')
    )
    
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">👋</div>
            <h2 className="text-xl font-bold text-white mb-2">Welcome back!</h2>
            <p className="text-sm text-zinc-400">We found your projects in the cloud</p>
          </div>
          
          {paidProjects.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                <span>🐣</span> Go Hatched Projects
              </h3>
              <div className="space-y-2">
                {paidProjects.map((project) => (
                  <div key={project.slug} className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                    <div>
                      <div className="text-sm font-medium text-white">{project.name}</div>
                      <div className="text-xs text-zinc-500">{project.slug}.hatchitsites.dev</div>
                    </div>
                    <span className="text-green-400 text-xs">✓ Will sync</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {freeProjects.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Other Projects</h3>
              <div className="space-y-2">
                {freeProjects.map((project) => (
                  <div key={project.slug} className="flex items-center justify-between bg-zinc-800/50 rounded-lg p-3">
                    <div>
                      <div className="text-sm font-medium text-white">{project.name}</div>
                      <div className="text-xs text-zinc-500">{project.slug}.hatchitsites.dev</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={skipWelcomeBack}
              className="flex-1 px-4 py-3 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
            >
              Start Fresh
            </button>
            <button
              onClick={pullAllPaidProjects}
              className="flex-1 px-4 py-3 text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black rounded-xl transition-colors font-semibold"
            >
              {paidProjects.length > 0 ? `Pull ${paidProjects.length} Project${paidProjects.length > 1 ? 's' : ''}` : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="h-dvh bg-zinc-950 flex flex-col overflow-hidden relative">
        {!isLoadingProjects && !isDeployed && (
          <div className="absolute top-0 left-0 right-0 bg-blue-500/20 border-b border-blue-400/30 text-blue-100 text-xs px-3 py-2 z-50">
            <div className="flex items-center gap-2">
              <span role="img" aria-label="rocket">🚀</span>
              <span className="font-medium">Your work saves locally. Deploy to access anywhere!</span>
            </div>
          </div>
        )}
        <div className={`flex-1 flex flex-col min-h-0 ${!isLoadingProjects && !isDeployed ? 'pt-10' : ''}`}>
        {showRenameModal && <RenameModal />}
        {showDeleteModal && <DeleteModal />}
        {showDeleteAllModal && <DeleteAllModal />}
        {showStartOverModal && <StartOverModal />}
        {showDeployModal && <DeployConfirmModal />}
        {showHistoryModal && <HistoryModal />}
        {showAssetsModal && <AssetsModal />}
        {showDomainModal && <DomainModal />}
        {deployedUrl && <DeployedModal />}
        {showFaqModal && <FaqModal />}
        {showUploadModal && <UploadModal />}
        {showOnboarding && <OnboardingModal />}
        {showPagesPanel && <PagesPanel />}
        {showAddPageModal && <AddPageModal />}
        {showNewProjectModal && <NewProjectModal />}
        {showWelcomeBackModal && <WelcomeBackModal />}
        {isDeploying && <DeployingOverlay />}
        
        {/* Brand Panel Modal */}
        {showBrandPanel && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowBrandPanel(false)}>
            <div className="bg-zinc-900 rounded-xl w-full max-w-sm border border-zinc-800 overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="13.5" cy="6.5" r="2.5"/>
                    <circle cx="19" cy="17" r="2.5"/>
                    <circle cx="6" cy="12" r="2.5"/>
                    <path d="M12 2a10 10 0 1 0 10 10"/>
                  </svg>
                  Brand
                </h3>
                <button onClick={() => setShowBrandPanel(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="p-4 space-y-5">
                {/* Colors */}
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-wide font-medium mb-2 block">Colors</label>
                  {currentProject?.brand?.colors && currentProject.brand.colors.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {currentProject.brand.colors.map((color, i) => (
                        <div key={i} className="relative group">
                          <input
                            type="color"
                            value={color}
                            onChange={(e) => applyBrandColorChange(color, e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div 
                            className="w-12 h-12 rounded-lg border-2 border-zinc-700 group-hover:border-zinc-500 transition-colors shadow-lg cursor-pointer"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-zinc-500 font-mono">{color}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-600">Generate something to detect colors</p>
                  )}
                  <p className="text-[10px] text-zinc-600 mt-6">Click a color to change it globally</p>
                </div>
                
                {/* Font */}
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-wide font-medium mb-2 block">Font</label>
                  <select
                    value={currentProject?.brand?.font || 'System Default'}
                    onChange={(e) => applyBrandFontChange(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-600"
                  >
                    <option value="System Default">System Default</option>
                    <option value="Inter">Inter</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Playfair Display">Playfair Display</option>
                    <option value="Raleway">Raleway</option>
                    <option value="Nunito">Nunito</option>
                    <option value="Outfit">Outfit</option>
                    <option value="Space Grotesk">Space Grotesk</option>
                  </select>
                  <p className="text-[10px] text-zinc-600 mt-2">Changing font will prompt a regeneration</p>
                </div>
                
                {/* Re-detect Button */}
                {code && (
                  <button
                    onClick={() => {
                      const newBrand = extractBrandFromCode(code)
                      updateCurrentProject({ brand: newBrand })
                      showSuccessToast('Brand colors re-detected!')
                    }}
                    className="w-full py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
                    </svg>
                    Re-detect from code
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Complexity Warning Modal */}
        {complexityWarning && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-xl p-6 md:p-8 w-full max-w-lg border border-zinc-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">Complex Request Detected</h2>
              </div>
              
              <p className="text-zinc-300 mb-4">{complexityWarning.warning}</p>
              
              <div className="bg-zinc-800/50 rounded-lg p-4 mb-6">
                <p className="text-sm font-medium text-zinc-200 mb-2">💡 For best results:</p>
                <ul className="text-sm text-zinc-400 space-y-1">
                  {complexityWarning.suggestions.map((suggestion, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setComplexityWarning(null)}
                  className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors"
                >
                  Edit Prompt
                </button>
                <button
                  onClick={handleProceedWithComplexPrompt}
                  className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors"
                >
                  Generate Anyway
                </button>
              </div>
            </div>
          </div>
        )}
        
        {showShipModal && !isDeploying && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-xl p-6 md:p-8 w-full max-w-md border border-zinc-800">
              <h2 className="text-2xl font-bold mb-2 text-white">Ship your site</h2>
              <p className="text-zinc-400 mb-6">Manage your deployed project</p>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleDeploy()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 active:scale-95">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-6" />
                  </svg>
                  Push Update
                </button>
                
                <button
                  onClick={() => {
                    setShowShipModal(false)
                    setShowDomainModal(true)
                  }}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 active:scale-95">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                  </svg>
                  Manage Domain
                </button>
                
                <button
                  onClick={() => {
                    handleDownloadClick()
                    setShowShipModal(false)
                  }}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 active:scale-95">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download ZIP
                </button>
              </div>
              
              <button
                onClick={() => setShowShipModal(false)}
                className="w-full mt-4 text-zinc-400 hover:text-zinc-300 font-medium py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {showUpgradeModal && <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} reason={upgradeReason} projectSlug={currentProjectSlug} projectName={currentProject?.name || 'My Project'} />}
        {mobileModal && <MobileModal type={mobileModal} onClose={() => setMobileModal(null)} />}
        {/* Mobile menu overlay */}
        {showMobileMenu && (
          <div className="fixed inset-0 z-[60]" onClick={() => setShowMobileMenu(false)}>
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-4 top-14 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl py-2 min-w-[180px]" onClick={e => e.stopPropagation()}
            >
              <Link href="/" className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Home
              </Link>
              <div className="border-t border-zinc-800 my-1" />
              <button onClick={() => { setShowUploadModal(true); setShowMobileMenu(false) }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Import HTML
              </button>
              <button onClick={() => { setShowAssetsModal(true); setShowMobileMenu(false) }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                Assets
              </button>
              <button onClick={() => { isCurrentProjectPaid ? setShowBrandPanel(true) : (setUpgradeReason('deploy'), setShowUpgradeModal(true)); setShowMobileMenu(false) }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="19" cy="17" r="2.5"/><circle cx="6" cy="12" r="2.5"/><path d="M12 2a10 10 0 1 0 10 10"/></svg>
                Brand {!isCurrentProjectPaid && <span className="text-xs text-purple-400">PRO</span>}
              </button>
              <button onClick={() => { isCurrentProjectPaid ? setShowHistoryModal(true) : (setUpgradeReason('deploy'), setShowUpgradeModal(true)); setShowMobileMenu(false) }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                History {!isCurrentProjectPaid && <span className="text-xs text-purple-400">PRO</span>}
              </button>
              {code && (
                <button onClick={() => { setShowStartOverModal(true); setShowMobileMenu(false) }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-orange-400 hover:bg-zinc-800 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                  Start Again
                </button>
              )}
              <div className="border-t border-zinc-800 my-1" />
              <button onClick={() => { setShowFaqModal(true); setShowMobileMenu(false) }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                Help & FAQ
              </button>
              {deployedProjects.length > 0 && (
                <>
                  <div className="border-t border-zinc-800 my-1" />
                  <button onClick={() => { setShowWelcomeBackModal(true); setShowMobileMenu(false) }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Sync from Cloud
                    {projectsToPull.length > 0 && <span className="ml-auto text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">{projectsToPull.length}</span>}
                  </button>
                </>
              )}
              <div className="border-t border-zinc-800 my-1" />
              <div className="flex items-center justify-center gap-2 px-4 py-2">
                <a href="https://x.com/HatchitD28255" target="_blank" rel="noopener noreferrer" className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors" title="Follow on X">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://www.linkedin.com/company/hatchit-dev/" target="_blank" rel="noopener noreferrer" className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors" title="Follow on LinkedIn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
            </motion.div>
          </div>
        )}
        <div className="px-3 py-2.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`relative flex items-center justify-center w-8 h-8 rounded-lg border transition-all overflow-hidden flex-shrink-0 group ${isCurrentProjectPaid ? 'bg-gradient-to-br from-amber-500/20 via-yellow-500/20 to-orange-500/20 border-amber-500/30' : 'bg-zinc-800 border-zinc-700'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Menu"
            >
              {/* Pulse glow - only for paid */}
              {isCurrentProjectPaid && (
                <motion.div
                  className="absolute inset-0 rounded-lg bg-amber-400/20"
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              {/* Outer glow - only for paid */}
              {isCurrentProjectPaid && (
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-orange-500/20 rounded-lg blur-sm opacity-60" />
              )}
              {/* Emoji */}
              <motion.span 
                className="relative text-base z-10"
                animate={isCurrentProjectPaid ? { y: [0, -1, 0] } : {}}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                🐣
              </motion.span>
            </motion.button>
            <ProjectSelector mobile />
            <PagesButton mobile />
          </div>
        </div>
        {projectsToPull.length > 0 && (
          <div className="p-3 border-b border-zinc-800 bg-zinc-900">
            <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-3">
              <div className="flex items-start gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400 flex-shrink-0 mt-0.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-semibold text-white mb-0.5">Projects on other devices</h3>
                  <p className="text-[10px] text-zinc-400">Pull to continue working</p>
                </div>
              </div>
              <div className="space-y-2">
                {projectsToPull.map((project) => (
                  <div key={project.slug} className="flex items-center justify-between bg-zinc-800/50 rounded-lg p-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-white truncate">{project.name}</div>
                      <div className="text-[10px] text-zinc-500">{new Date(project.deployedAt).toLocaleDateString()}</div>
                    </div>
                    <button
                      onClick={() => pullProject(project)}
                      className="ml-2 px-2 py-1 text-[10px] bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors whitespace-nowrap flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Pull
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          <Chat onGenerate={handleGenerate} isGenerating={isGenerating} onStopGeneration={handleStopGeneration} currentCode={code} isPaid={isCurrentProjectPaid} onOpenAssets={() => setShowAssetsModal(true)} projectId={currentProjectId || ''} projectSlug={currentProjectSlug} projectName={currentProject?.name || 'My Project'} externalPrompt={externalPrompt} onExternalPromptHandled={() => setExternalPrompt(null)} generationProgress={generationProgress} suggestions={suggestions} onSuggestionClick={(s) => setExternalPrompt(s)} canRevert={!!previousCode && currentVersionIndex > 0} onRevert={handleRevert} resetKey={chatResetKey} key={currentProjectId} />
        </div>
        {code && (
          <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-900 flex gap-2" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
            <button onClick={() => setMobileModal('preview')} className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              Preview
            </button>
            <button onClick={() => setMobileModal('code')} className="py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            </button>
            <ShipButton mobile />
          </div>
        )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-dvh bg-zinc-950 p-3 overflow-hidden relative">
      {!isLoadingProjects && !isDeployed && (
        <div className="absolute top-3 left-3 right-3 bg-blue-500/20 border-b border-blue-400/30 text-blue-100 text-xs px-4 py-2 rounded-t-2xl z-50">
          <div className="flex items-center gap-2">
            <span role="img" aria-label="rocket">🚀</span>
            <span className="font-medium">Your work saves locally. Deploy to access anywhere!</span>
          </div>
        </div>
      )}
      {showRenameModal && <RenameModal />}
      {showDeleteModal && <DeleteModal />}
      {showDeleteAllModal && <DeleteAllModal />}
      {showStartOverModal && <StartOverModal />}
      {showDeployModal && <DeployConfirmModal />}
      {showHistoryModal && <HistoryModal />}
      {showAssetsModal && <AssetsModal />}
      {showDomainModal && <DomainModal />}
      {showShipModal && !isDeploying && <ShipModal />}
      {deployedUrl && <DeployedModal />}
      {isDeploying && <DeployingOverlay />}
      {showUpgradeModal && <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} reason={upgradeReason} projectSlug={currentProjectSlug} projectName={currentProject?.name || 'My Project'} />}
      {showSuccessModal && <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} />}
      {showUploadModal && <UploadModal />}
      {showFaqModal && <FaqModal />}
      {showOnboarding && <OnboardingModal />}
      {showPagesPanel && <PagesPanel />}
      {showAddPageModal && <AddPageModal />}
      {showNewProjectModal && <NewProjectModal />}
      {showWelcomeBackModal && <WelcomeBackModal />}
      <div className={`h-full ${!isLoadingProjects && !isDeployed ? 'pt-10' : ''}`}>
      <Group orientation="horizontal" className="h-full rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
        <Panel id="chat" defaultSize={28} minSize={20}>
          <div className="h-full flex flex-col bg-zinc-900">
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* HatchIt Menu */}
                <div className="relative desktop-menu-container">
                  <motion.button
                    onClick={() => setShowDesktopMenu(!showDesktopMenu)}
                    className={`relative flex items-center justify-center w-9 h-9 rounded-lg border transition-all overflow-hidden group ${isCurrentProjectPaid ? 'bg-gradient-to-br from-amber-500/20 via-yellow-500/20 to-orange-500/20 border-amber-500/30' : 'bg-zinc-800 border-zinc-700'}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Menu"
                  >
                    {/* Animated glow ring - only for paid */}
                    {isCurrentProjectPaid && (
                      <motion.div
                        className="absolute inset-0 rounded-lg bg-gradient-to-r from-amber-400/0 via-amber-400/30 to-amber-400/0"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      />
                    )}
                    {/* Pulse glow - only for paid */}
                    {isCurrentProjectPaid && (
                      <motion.div
                        className="absolute inset-0 rounded-lg bg-amber-400/20"
                        animate={{ opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}
                    {/* Outer glow - only for paid */}
                    {isCurrentProjectPaid && (
                      <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-orange-500/20 rounded-xl blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
                    )}
                    {/* Emoji */}
                    <motion.span 
                      className="relative text-lg z-10"
                      animate={isCurrentProjectPaid ? { y: [0, -1, 0] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      🐣
                    </motion.span>
                  </motion.button>
                  <AnimatePresence>
                    {showDesktopMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full mt-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl py-2 min-w-[200px] z-50"
                        onClick={e => e.stopPropagation()}
                      >
                        <Link href="/" className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                          Home
                        </Link>
                        <div className="border-t border-zinc-800 my-1" />
                        <button onClick={() => { setShowUploadModal(true); setShowDesktopMenu(false) }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                          Import HTML
                        </button>
                        <button onClick={() => { setShowAssetsModal(true); setShowDesktopMenu(false) }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          Assets
                        </button>
                        <button onClick={() => { isCurrentProjectPaid ? (setShowBrandPanel(true), setShowDesktopMenu(false)) : (setUpgradeReason('deploy'), setShowUpgradeModal(true), setShowDesktopMenu(false)) }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="19" cy="17" r="2.5"/><circle cx="6" cy="12" r="2.5"/><path d="M12 2a10 10 0 1 0 10 10"/></svg>
                          Brand {!isCurrentProjectPaid && <span className="text-xs text-purple-400">PRO</span>}
                        </button>
                        <button onClick={() => { isCurrentProjectPaid ? (setShowHistoryModal(true), setShowDesktopMenu(false)) : (setUpgradeReason('deploy'), setShowUpgradeModal(true), setShowDesktopMenu(false)) }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          History {!isCurrentProjectPaid && <span className="text-xs text-purple-400">PRO</span>}
                        </button>
                        {code && (
                          <button onClick={() => { setShowStartOverModal(true); setShowDesktopMenu(false) }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-orange-400 hover:bg-zinc-800 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                            Start Again
                          </button>
                        )}
                        <div className="border-t border-zinc-800 my-1" />
                        <button onClick={() => { setShowFaqModal(true); setShowDesktopMenu(false) }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                          Help & FAQ
                        </button>
                        {deployedProjects.length > 0 && (
                          <>
                            <div className="border-t border-zinc-800 my-1" />
                            <button onClick={() => { setShowWelcomeBackModal(true); setShowDesktopMenu(false) }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                              Sync from Cloud
                              {projectsToPull.length > 0 && <span className="ml-auto text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">{projectsToPull.length}</span>}
                            </button>
                          </>
                        )}
                        <div className="border-t border-zinc-800 my-1" />
                        <div className="flex items-center justify-center gap-2 px-4 py-2">
                          <a href="https://x.com/HatchitD28255" target="_blank" rel="noopener noreferrer" className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors" title="Follow on X">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                          </a>
                          <a href="https://www.linkedin.com/company/hatchit-dev/" target="_blank" rel="noopener noreferrer" className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors" title="Follow on LinkedIn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <ProjectSelector />
                <PagesButton />
              </div>
              </div>
            {projectsToPull.length > 0 && (
              <div className="p-4 border-b border-zinc-800">
                <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400 flex-shrink-0 mt-0.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white mb-1">You have projects on other devices</h3>
                      <p className="text-xs text-zinc-400">Pull them to this device to continue working</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {projectsToPull.map((project) => (
                      <div key={project.slug} className="flex items-center justify-between bg-zinc-800/50 rounded-lg p-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{project.name}</div>
                          <div className="text-xs text-zinc-500">Deployed {new Date(project.deployedAt).toLocaleDateString()}</div>
                        </div>
                        <button
                          onClick={() => pullProject(project)}
                          className="ml-3 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors whitespace-nowrap flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                          Pull Code
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <Chat onGenerate={handleGenerate} isGenerating={isGenerating} onStopGeneration={handleStopGeneration} currentCode={code} isPaid={isCurrentProjectPaid} onOpenAssets={() => setShowAssetsModal(true)} projectId={currentProjectId || ''} projectSlug={currentProjectSlug} projectName={currentProject?.name || 'My Project'} externalPrompt={externalPrompt} onExternalPromptHandled={() => setExternalPrompt(null)} generationProgress={generationProgress} suggestions={suggestions} onSuggestionClick={(s) => setExternalPrompt(s)} canRevert={!!previousCode && currentVersionIndex > 0} onRevert={handleRevert} resetKey={chatResetKey} key={currentProjectId} />
            </div>
          </div>
        </Panel>
        <Separator className="w-2 bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-col-resize flex items-center justify-center group">
          <div className="w-1 h-8 bg-zinc-600 group-hover:bg-purple-500 rounded-full transition-colors" />
        </Separator>
        <Panel id="right" defaultSize={72} minSize={40}>
          <div className="h-full flex flex-col bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-2">
              <div className="flex">
                <button onClick={() => setActiveTab('preview')} className={`px-4 py-3 text-sm font-medium transition-all relative ${activeTab === 'preview' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                  Preview
                  {activeTab === 'preview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>}
                </button>
                <button onClick={() => setActiveTab('code')} className={`px-4 py-3 text-sm font-medium transition-all relative ${activeTab === 'code' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                  Code
                  {activeTab === 'code' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>}
                </button>
              </div>
              <div className="flex items-center gap-3">
                {activeTab === 'preview' && previewWidth > 0 && (
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-zinc-800/50 rounded-md">
                      <span>{device.icon}</span>
                      <span>{device.name}</span>
                    </span>
                    <span className="font-mono text-zinc-600">{Math.round(previewWidth)}px</span>
                  </div>
                )}
                <ShipButton />
              </div>
            </div>
            <div ref={previewContainerRef} className="flex-1 overflow-auto min-h-0 relative">
              {activeTab === 'preview' ? <LivePreview code={code} pages={previewPages} currentPageId={currentProject?.currentPageId} isLoading={isGenerating} loadingProgress={generationProgress} isPaid={isCurrentProjectPaid} assets={currentProject?.assets} setShowUpgradeModal={setShowUpgradeModal} inspectorMode={inspectorMode} onElementSelect={setSelectedElement} onViewCode={handleViewCode} onRegenerate={handleRegenerateFromError} onQuickFix={handleQuickFix} /> : <CodePreview code={code} isPaid={isCurrentProjectPaid} onCodeChange={handleCodeChange} pagePath={currentPage?.path} />}
              
              {/* Element Inspector Popover */}
              {inspectorMode && selectedElement && (
                <div className="absolute bottom-4 right-4 w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-20">
                  <div className="flex items-center justify-between p-3 border-b border-zinc-800 bg-zinc-800/50">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 font-mono text-sm">&lt;{selectedElement.tagName}&gt;</span>
                    </div>
                    <button
                      onClick={() => setSelectedElement(null)}
                      className="p-1 text-zinc-500 hover:text-white transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-3 space-y-3 text-sm max-h-64 overflow-y-auto">
                    {selectedElement.className && (
                      <div>
                        <span className="text-zinc-500 text-xs uppercase tracking-wide">Class</span>
                        <p className="text-zinc-300 font-mono text-xs break-all mt-1">{selectedElement.className.slice(0, 150)}</p>
                      </div>
                    )}
                    {selectedElement.textContent && (
                      <div>
                        <span className="text-zinc-500 text-xs uppercase tracking-wide">Text</span>
                        <p className="text-zinc-300 text-xs mt-1 line-clamp-2">{selectedElement.textContent}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-zinc-500 text-xs uppercase tracking-wide">Styles</span>
                      <div className="mt-1 grid grid-cols-2 gap-1 text-xs">
                        {Object.entries(selectedElement.styles).filter(([, v]) => v && v !== 'rgba(0, 0, 0, 0)').slice(0, 6).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-1">
                            <span className="text-zinc-500">{key}:</span>
                            <span className="text-zinc-300 font-mono truncate">{String(value).slice(0, 15)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border-t border-zinc-800 bg-zinc-800/30">
                    <button
                      onClick={() => {
                        const suggestion = `Edit the ${selectedElement.tagName} element${selectedElement.textContent ? ` with text "${selectedElement.textContent.slice(0, 30)}..."` : ''}`
                        // Could trigger a prompt in the chat, for now just copy
                        navigator.clipboard.writeText(suggestion)
                        showSuccessToast('Copied edit suggestion!')
                        setSelectedElement(null)
                        setInspectorMode(false)
                      }}
                      className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Copy Edit Prompt
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Panel>
      </Group>
      </div>
    </div>
  )
}