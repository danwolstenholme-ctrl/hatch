'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'
import { Group, Panel, Separator } from 'react-resizable-panels'
import Chat from '@/components/Chat'
import CodePreview from '@/components/CodePreview'
import LivePreview from '@/components/LivePreview'
import UpgradeModal from '@/components/upgradeModal'    
import SuccessModal from '@/components/SuccessModal'
import { isPaidUser } from '@/app/lib/generation-limit'

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

interface Project {
  id: string
  name: string
  versions: Version[]
  currentVersionIndex: number
  createdAt: string
  updatedAt: string
  deployedSlug?: string
  customDomain?: string
  code?: string
  codeHistory?: string[]
  assets?: Asset[]
}

interface Asset {
  id: string
  name: string
  type: 'logo' | 'image' | 'icon'
  dataUrl: string
  createdAt: string
}

// Type for site subscription (from user metadata)
interface SiteSubscription {
  projectSlug: string
  projectName: string
  stripeSubscriptionId: string
  status: 'active' | 'canceled' | 'past_due'
  createdAt: string
}

const generateId = () => Math.random().toString(36).substring(2, 9)

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

const createNewProject = (name?: string): Project => ({
  id: generateId(),
  name: name || generateProjectName(),
  versions: [],
  currentVersionIndex: -1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

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

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [previewVersionIndex, setPreviewVersionIndex] = useState<number | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
  const currentProject = projects.find(p => p.id === currentProjectId)
  const versions = currentProject?.versions || []
  const currentVersionIndex = currentProject?.currentVersionIndex ?? -1
  const code = previewVersionIndex !== null 
    ? versions[previewVersionIndex]?.code || ''
    : versions[currentVersionIndex]?.code || ''
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
  const [mobileModal, setMobileModal] = useState<'preview' | 'code' | null>(null)
  const [copied, setCopied] = useState(false)
  const { user, isLoaded } = useUser()
  const searchParams = useSearchParams()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState<'generation_limit' | 'code_access' | 'deploy' | 'download'>('deploy')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showFaqModal, setShowFaqModal] = useState(false)
  const [showAssetsModal, setShowAssetsModal] = useState(false)
  const [domainSearch, setDomainSearch] = useState('')
  const [domainSearchResult, setDomainSearchResult] = useState<{ domain: string; available: boolean; price?: number } | null>(null)
  const [isSearchingDomain, setIsSearchingDomain] = useState(false)
  const [isBuyingDomain, setIsBuyingDomain] = useState(false)
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const domainInputRef = useRef<HTMLInputElement>(null)

  // Get subscriptions from user metadata
  const subscriptions = useMemo(() => {
    return (user?.publicMetadata?.subscriptions as SiteSubscription[]) || []
  }, [user?.publicMetadata?.subscriptions])

  // Get the project slug for the current project (what it would be when deployed)
  const currentProjectSlug = useMemo(() => {
    if (!currentProject) return ''
    return currentProject.deployedSlug || 
      currentProject.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }, [currentProject])

  // Check if CURRENT PROJECT has an active subscription
  const isCurrentProjectPaid = useMemo(() => {
    if (!currentProjectSlug) return false
    return subscriptions.some(s => s.projectSlug === currentProjectSlug && s.status === 'active')
  }, [subscriptions, currentProjectSlug])

  // Legacy: check if user has ANY paid subscription (for things like unlimited generations)
  const hasAnyPaidSubscription = useMemo(() => {
    return subscriptions.some(s => s.status === 'active')
  }, [subscriptions])

  useEffect(() => {
    const savedProjects = localStorage.getItem('hatchit-projects')
    const savedCurrentId = localStorage.getItem('hatchit-current-project')
    if (savedProjects) {
      const parsed = JSON.parse(savedProjects) as Project[]
      const migrated = parsed.map(migrateProject)
      setProjects(migrated)
      if (savedCurrentId && migrated.find(p => p.id === savedCurrentId)) {
        setCurrentProjectId(savedCurrentId)
      } else if (migrated.length > 0) {
        setCurrentProjectId(migrated[0].id)
      }
    } else {
      const defaultProject = createNewProject('My First Project')
      setProjects([defaultProject])
      setCurrentProjectId(defaultProject.id)
    }
  }, [])

  useEffect(() => {
    if (projects.length > 0) localStorage.setItem('hatchit-projects', JSON.stringify(projects))
  }, [projects])

  useEffect(() => {
    if (currentProjectId) localStorage.setItem('hatchit-current-project', currentProjectId)
  }, [currentProjectId])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowProjectDropdown(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
      setShowSuccessModal(true)
      window.history.replaceState({}, '', '/builder')
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
    
    const newProject = createNewProject()
    setProjects(prev => [newProject, ...prev])
    setCurrentProjectId(newProject.id)
    setShowProjectDropdown(false)
    setDeployedUrl(null)
  }

  const switchProject = (id: string) => {
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

  const handleGenerate = async (prompt: string, history: Message[], currentCode: string) => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, history, currentCode }),
      })
      const data = await response.json()
      if (data.code) {
        const newVersion: Version = { id: generateId(), code: data.code, timestamp: new Date().toISOString(), prompt }
        const newVersions = currentVersionIndex >= 0 ? [...versions.slice(0, currentVersionIndex + 1), newVersion] : [newVersion]
        updateCurrentProject({ versions: newVersions, currentVersionIndex: newVersions.length - 1 })
        if (isMobile) setMobileModal('preview')
      }
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUndo = () => { if (canUndo) updateCurrentProject({ currentVersionIndex: currentVersionIndex - 1 }) }
  const handleRedo = () => { if (canRedo) updateCurrentProject({ currentVersionIndex: currentVersionIndex + 1 }) }
  const restoreVersion = (index: number) => { updateCurrentProject({ currentVersionIndex: index }); setShowHistoryModal(false); setPreviewVersionIndex(null) }

  const handleDeploy = async (customName?: string) => {
    if (!code || isDeploying) return
    const slugName = customName || currentProject?.deployedSlug || currentProject?.name
    setIsDeploying(true)
    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, projectName: slugName }),
      })
      const data = await response.json()
      if (data.url) {
        await new Promise(resolve => setTimeout(resolve, 45000))
        const startTime = Date.now()
        while (Date.now() - startTime < 90000) {
          try { await fetch(data.url, { method: 'HEAD', mode: 'no-cors' }); break } catch { await new Promise(r => setTimeout(r, 3000)) }
        }
        setDeployedUrl(data.url)
        updateCurrentProject({ deployedSlug: customName || slugName?.toLowerCase().replace(/[^a-z0-9-]/g, '-') })
      } else {
        alert('Deploy failed: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Deploy failed:', error)
      alert('Deploy failed')
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
    <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full">
      <span className="text-xs">🐣</span>
      <span className="text-xs font-medium bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Hatched</span>
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
            {project.id === currentProjectId && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}
          </button>
        ))}
      </div>
      {currentProject && (
        <div className="border-t border-zinc-800 p-2 flex gap-1">
          <button onClick={() => { setRenameValue(currentProject.name); setShowRenameModal(true); setShowProjectDropdown(false) }} className="flex-1 px-3 py-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">Rename</button>
          <button onClick={duplicateProject} disabled={!hasAnyPaidSubscription && projects.length >= 1} className={`flex-1 px-3 py-2 text-xs rounded-lg transition-colors ${!hasAnyPaidSubscription && projects.length >= 1 ? 'text-zinc-600 cursor-not-allowed opacity-50' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`} title={!hasAnyPaidSubscription && projects.length >= 1 ? 'Upgrade to duplicate projects' : ''}>Duplicate</button>
          <button onClick={() => { setShowDeleteModal(true); setShowProjectDropdown(false) }} className="flex-1 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-zinc-800 rounded-lg transition-colors">Delete</button>
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
                <div className="flex-1 overflow-auto bg-zinc-950 min-h-0"><LivePreview code={versions[previewVersionIndex]?.code || ''} isLoading={false} isPaid={isCurrentProjectPaid} setShowUpgradeModal={setShowUpgradeModal} /></div>
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
          <button onClick={() => { setShowDeployModal(false); handleDeploy(isDeployed ? currentProject?.deployedSlug : deployName) }} disabled={!isDeployed && !deployName} className="flex-1 px-4 py-2 text-sm bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-xl transition-colors">{isDeployed ? 'Update 🔄' : 'Deploy 🚀'}</button>
        </div>
      </div>
    </div>
  )

  const DeployedModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4\">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl\">
        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4 mx-auto\">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 className="text-lg font-semibold text-white mb-2 text-center">{isDeployed ? 'Site Updated! 🔄' : 'Site Deployed! 🚀'}</h2>
        <p className="text-zinc-400 text-sm mb-4 text-center">Your site is now live at:</p>
        <a href={deployedUrl!} target="_blank" rel="noopener noreferrer" className="block w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-blue-400 hover:text-blue-300 text-center text-sm break-all transition-colors mb-4">{deployedUrl}</a>
        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={() => setDeployedUrl(null)} className="px-3 py-2.5 text-sm text-zinc-400 hover:text-white transition-colors border border-zinc-700 rounded-lg\">Close</button>
          <a href={deployedUrl!} target="_blank" rel="noopener noreferrer" className="flex-1 px-3 py-2.5 text-sm bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors text-center flex items-center justify-center gap-1.5 whitespace-nowrap\">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            View
          </a>
          <button onClick={() => { navigator.clipboard.writeText(deployedUrl!); setCopied(true); setTimeout(() => setCopied(false), 2000) }} className="flex-1 px-3 py-2.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors\">{copied ? '✓ Copied!' : 'Copy URL'}</button>
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
                        <span className="block text-xs text-zinc-400 mt-1">${Math.ceil(domainSearchResult.price * 1.2)}/year</span>
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
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col overflow-hidden">
      <div className="flex items-center px-3 py-2.5 border-b border-zinc-800 bg-zinc-900 flex-shrink-0 gap-3">
        <button onClick={onClose} className="p-2 -ml-1 text-zinc-400 hover:text-white transition-colors flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <span className="text-sm font-medium text-white truncate flex-1 min-w-0">{currentProject?.name}</span>
        {type === 'preview' && <span className="text-xs text-zinc-500 px-2 py-1 bg-zinc-800/50 rounded flex-shrink-0">{typeof window !== 'undefined' && window.innerWidth < 640 ? 'Mobile' : 'Tablet'}</span>}
      </div>
      <div className="flex-1 overflow-auto">{type === 'preview' ? <LivePreview code={code} isLoading={isGenerating} isPaid={isCurrentProjectPaid} setShowUpgradeModal={setShowUpgradeModal} /> : <CodePreview code={code} isPaid={isCurrentProjectPaid} />}</div>
    </div>
  )

  const ProjectSelector = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="relative z-[9999]">
      <button onClick={() => setShowProjectDropdown(!showProjectDropdown)} className={`flex items-center gap-2 hover:bg-zinc-800 rounded-lg transition-colors ${mobile ? 'px-2 py-1.5' : 'px-3 py-1.5'}`}>
        <span className={`font-medium text-white truncate ${mobile ? 'max-w-[120px] text-sm' : 'max-w-[180px]'}`}>{currentProject?.name || 'Select Project'}</span>
        {isDeployed && <span className="text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded">LIVE</span>}
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-zinc-500 transition-transform ${showProjectDropdown ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {showProjectDropdown && <ProjectDropdown />}
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
        <h2 className="text-2xl font-bold mb-2">Ship your site</h2>
        <p className="text-zinc-400 mb-6">Manage your deployed project</p>
        
        <div className="space-y-3">
          <button
            onClick={() => handleDeploy()}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 active:scale-95">
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
            <p className="text-sm text-zinc-400">Landing pages, portfolios, coming soon pages, pricing pages, showcase pages, and more. Anything you can describe, we can generate as production-ready React code.</p>
          </div>
          <div className="border-t border-zinc-800 pt-4">
            <h3 className="font-medium text-white mb-2 flex items-center gap-2">
              <span>📝</span> How do forms work?
            </h3>
            <p className="text-sm text-zinc-400 mb-2">We use <span className="text-blue-400 font-medium">Formspree.io</span> for form handling. Sign up free at formspree.io, get your form ID, then replace <span className="font-mono text-xs bg-zinc-800 px-1.5 py-0.5 rounded">YOUR_ID</span> in the generated code.</p>
          </div>
          <div className="border-t border-zinc-800 pt-4">
            <h3 className="font-medium text-white mb-2 flex items-center gap-2">
              <span>⚡</span> Is this real code?
            </h3>
            <p className="text-sm text-zinc-400">Yes! Production-ready React 18 + Tailwind CSS. You can deploy it to Vercel, Netlify, or download as a ZIP and host anywhere. It's real, standalone code.</p>
          </div>
          <div className="border-t border-zinc-800 pt-4">
            <h3 className="font-medium text-white mb-2 flex items-center gap-2">
              <span>🔒</span> Privacy & legal?
            </h3>
            <p className="text-sm text-zinc-400">For privacy policies and terms, we recommend <span className="text-blue-400 font-medium">termly.io</span> (free generator) or <span className="text-blue-400 font-medium">iubenda.com</span>. Coming soon: built-in legal page templates.</p>
          </div>
        </div>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <div className="h-dvh bg-zinc-950 flex flex-col overflow-x-hidden">
        {showRenameModal && <RenameModal />}
        {showDeleteModal && <DeleteModal />}
        {showDeployModal && <DeployConfirmModal />}
        {showHistoryModal && <HistoryModal />}
        {showAssetsModal && <AssetsModal />}
        {showDomainModal && <DomainModal />}
        {deployedUrl && <DeployedModal />}
        {showFaqModal && <FaqModal />}
        {showShipModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-xl p-6 md:p-8 w-full max-w-md border border-zinc-800">
              <h2 className="text-2xl font-bold mb-2">Ship your site</h2>
              <p className="text-zinc-400 mb-6">Manage your deployed project</p>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleDeploy()}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 active:scale-95">
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
            <div className="absolute right-4 top-14 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl py-2 min-w-[180px]" onClick={e => e.stopPropagation()}>
              <button onClick={() => { setShowAssetsModal(true); setShowMobileMenu(false) }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                Assets
              </button>
              <button onClick={() => { isCurrentProjectPaid ? setShowHistoryModal(true) : (setUpgradeReason('deploy'), setShowUpgradeModal(true)); setShowMobileMenu(false) }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                History {!isCurrentProjectPaid && <span className="text-xs text-purple-400">PRO</span>}
              </button>
              <div className="border-t border-zinc-800 my-1" />
              <button onClick={() => { setShowFaqModal(true); setShowMobileMenu(false) }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                Help & FAQ
              </button>
            </div>
          </div>
        )}
        <div className="px-3 py-2.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
          <div className="flex items-center gap-2 min-w-0">
            <ProjectSelector mobile />
            {isCurrentProjectPaid && <span className="text-xs">🐣</span>}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {canUndo && <button onClick={handleUndo} className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all" title="Undo"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg></button>}
            {canRedo && <button onClick={handleRedo} className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all" title="Redo"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg></button>}
            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all" title="Menu">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <Chat onGenerate={handleGenerate} isGenerating={isGenerating} currentCode={code} isPaid={isCurrentProjectPaid} onOpenAssets={() => setShowAssetsModal(true)} projectSlug={currentProjectSlug} projectName={currentProject?.name || 'My Project'} key={currentProjectId} />
        </div>
        {code && (
          <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-900 flex gap-2" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
            <button onClick={() => setMobileModal('preview')} className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              Preview
            </button>
            <ShipButton mobile />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-dvh bg-zinc-950 p-3">
      {showRenameModal && <RenameModal />}
      {showDeleteModal && <DeleteModal />}
      {showDeployModal && <DeployConfirmModal />}
      {showHistoryModal && <HistoryModal />}
      {showAssetsModal && <AssetsModal />}
      {showDomainModal && <DomainModal />}
      {showShipModal && <ShipModal />}
      {deployedUrl && <DeployedModal />}
      {showUpgradeModal && <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} reason={upgradeReason} projectSlug={currentProjectSlug} projectName={currentProject?.name || 'My Project'} />}
      {showSuccessModal && <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} />}
      <Group orientation="horizontal" className="h-full rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
        <Panel id="chat" defaultSize={28} minSize={20}>
          <div className="h-full flex flex-col bg-zinc-900">
            <div className="px-4 py-3 border-b border-zinc-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link href="/" className="text-lg font-black hover:opacity-80 transition-opacity flex-shrink-0">
                    <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">Hatch</span>
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">It</span>
                  </Link>
                  <span className="text-zinc-700 flex-shrink-0">|</span>
                  <ProjectSelector />
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <button onClick={() => setShowFaqModal(true)} className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all" title="Help & FAQ"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg></button>
                  <AssetsButton />
                  <HistoryButton />
                </div>
              </div>
              <div className="flex items-center justify-between">
                {isCurrentProjectPaid && <HatchedBadge />}
                <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
                  {canRedo && <button onClick={handleRedo} className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all" title="Redo"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg></button>}
                  {canUndo && <button onClick={handleUndo} className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all" title="Undo"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg></button>}
                </div>
              </div>
            </div>
            <Chat onGenerate={handleGenerate} isGenerating={isGenerating} currentCode={code} isPaid={isCurrentProjectPaid} onOpenAssets={() => setShowAssetsModal(true)} projectSlug={currentProjectSlug} projectName={currentProject?.name || 'My Project'} key={currentProjectId} />
          </div>
        </Panel>
        <Separator className="w-2 bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-col-resize flex items-center justify-center group">
          <div className="w-1 h-8 bg-zinc-600 group-hover:bg-purple-500 rounded-full transition-colors" />
        </Separator>
        <Panel id="right" defaultSize={72} minSize={40}>
          <div className="h-full flex flex-col bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-800 px-4">
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
            <div ref={previewContainerRef} className="flex-1 overflow-auto min-h-0">
              {activeTab === 'preview' ? <LivePreview code={code} isLoading={isGenerating} isPaid={isCurrentProjectPaid} setShowUpgradeModal={setShowUpgradeModal} /> : <CodePreview code={code} isPaid={isCurrentProjectPaid} />}
            </div>
          </div>
        </Panel>
      </Group>
    </div>
  )
}