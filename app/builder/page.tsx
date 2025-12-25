'use client'
import { useState, useEffect, useRef } from 'react'
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
}

const generateId = () => Math.random().toString(36).substring(2, 9)

const createNewProject = (name?: string): Project => ({
  id: generateId(),
  name: name || 'Untitled Project',
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
  const [isPaid, setIsPaid] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState<'generation_limit' | 'code_access' | 'deploy' | 'download'>('deploy')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const domainInputRef = useRef<HTMLInputElement>(null)

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
    // Wait for Clerk to finish loading before checking paid status
    if (!isLoaded) return
    
    // Check Clerk metadata for paid status
    if (user?.publicMetadata?.paid === true) {
      setIsPaid(true)
    } else {
      setIsPaid(false)
    }
  }, [isLoaded, user?.publicMetadata?.paid])

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
    if (showDomainModal && (domainStatus === 'idle' || domainStatus === 'error')) {
      domainInputRef.current?.focus()
    }
  }, [showDomainModal, customDomain, domainStatus])

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccessModal(true)
      window.history.replaceState({}, '', '/builder')
    }
  }, [searchParams])

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
    // Free users can only have 1 project
    if (!isPaid && projects.length >= 1) {
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
    if (!currentProjectId || projects.length <= 1) return
    const newProjects = projects.filter(p => p.id !== currentProjectId)
    setProjects(newProjects)
    setCurrentProjectId(newProjects[0]?.id || null)
    setShowDeleteModal(false)
    setDeployedUrl(null)
  }

  const duplicateProject = () => {
    // Free users can only have 1 project
    if (!isPaid && projects.length >= 1) {
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

  const handleShipClick = () => {
    if (!isPaid) {
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
    if (!isPaid) {
      setUpgradeReason('deploy')
      setShowUpgradeModal(true)
      return
    }
    setShowDomainModal(true)
    setDomainStatus('idle')
    setCustomDomain(currentProject?.customDomain || '')
  }

  const handleDownloadClick = async () => {
    if (!isPaid) {
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
    <div ref={dropdownRef} className="absolute top-full left-0 mt-2 w-72 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden">
      <button 
        onClick={createProject} 
        className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-zinc-800 transition-colors border-b border-zinc-800 ${!isPaid && projects.length >= 1 ? 'opacity-50' : ''}`}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${!isPaid && projects.length >= 1 ? 'bg-zinc-700' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}>
          {!isPaid && projects.length >= 1 ? (
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
          {!isPaid && projects.length >= 1 && (
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
          <button onClick={duplicateProject} disabled={!isPaid && projects.length >= 1} className={`flex-1 px-3 py-2 text-xs rounded-lg transition-colors ${!isPaid && projects.length >= 1 ? 'text-zinc-600 cursor-not-allowed opacity-50' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`} title={!isPaid && projects.length >= 1 ? 'Upgrade to duplicate projects' : ''}>Duplicate</button>
          {projects.length > 1 && <button onClick={() => { setShowDeleteModal(true); setShowProjectDropdown(false) }} className="flex-1 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-zinc-800 rounded-lg transition-colors">Delete</button>}
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-4xl w-full mx-4 shadow-2xl max-h-[80vh] flex flex-col">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Version History</h2>
          <button onClick={() => { setShowHistoryModal(false); setPreviewVersionIndex(null) }} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="flex-1 flex overflow-hidden">
          <div className="w-72 border-r border-zinc-800 overflow-y-auto">
            {versions.length === 0 ? (
              <div className="p-4 text-zinc-500 text-sm text-center">No versions yet</div>
            ) : (
              [...versions].reverse().map((version, reversedIndex) => {
                const index = versions.length - 1 - reversedIndex
                const isCurrent = index === currentVersionIndex
                const isPreviewing = index === previewVersionIndex
                return (
                  <button key={version.id} onClick={() => setPreviewVersionIndex(index)} className={`w-full px-4 py-3 text-left border-b border-zinc-800/50 transition-colors ${isPreviewing ? 'bg-blue-600/20' : isCurrent ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">v{index + 1}</span>
                      {isCurrent && <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">CURRENT</span>}
                    </div>
                    <div className="text-xs text-zinc-500 mb-1">{formatRelativeTime(version.timestamp)}</div>
                    {version.prompt && <div className="text-xs text-zinc-400 truncate">&quot;{version.prompt}&quot;</div>}
                  </button>
                )
              })
            )}
          </div>
          <div className="flex-1 flex flex-col min-w-0">
            {previewVersionIndex !== null ? (
              <>
                <div className="flex-1 overflow-auto bg-zinc-950"><LivePreview code={versions[previewVersionIndex]?.code || ''} isLoading={false} isPaid={isPaid} setShowUpgradeModal={setShowUpgradeModal} /></div>
                <div className="px-4 py-3 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Previewing v{previewVersionIndex + 1}</span>
                  {previewVersionIndex !== currentVersionIndex && <button onClick={() => restoreVersion(previewVersionIndex)} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors">Restore This Version</button>}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-zinc-500">Select a version to preview</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const DeployConfirmModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
        <h2 className="text-lg font-semibold text-white mb-2">{isDeployed ? 'Update Site' : 'Deploy Site'}</h2>
        <p className="text-zinc-400 text-sm mb-4">{isDeployed ? 'Update your live site with the latest changes' : 'Choose a name for your site URL'}</p>
        {isDeployed ? (
          <div className="text-sm text-zinc-500 mb-6">Updating: <span className="text-blue-400">{currentProject?.deployedSlug}.hatchitsites.dev</span></div>
        ) : (
          <>
            <input type="text" value={deployName} onChange={(e) => setDeployName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 mb-2" placeholder="my-awesome-site" autoFocus />
            <div className="text-sm text-zinc-500 mb-6">Your site will be live at: <span className="text-blue-400">{deployName || 'your-site'}.hatchitsites.dev</span></div>
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4 mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 className="text-lg font-semibold text-white mb-2 text-center">{isDeployed ? 'Site Updated! 🔄' : 'Site Deployed! 🚀'}</h2>
        <p className="text-zinc-400 text-sm mb-4 text-center">Your site is now live at:</p>
        <a href={deployedUrl!} target="_blank" rel="noopener noreferrer" className="block w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-blue-400 hover:text-blue-300 text-center text-sm break-all transition-colors">{deployedUrl}</a>
        <div className="flex gap-2 mt-4">
          <button onClick={() => setDeployedUrl(null)} className="px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors">Close</button>
          <a href={deployedUrl!} target="_blank" rel="noopener noreferrer" className="flex-1 px-3 py-2 text-sm bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl transition-colors text-center flex items-center justify-center gap-1.5 whitespace-nowrap">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            View Site
          </a>
          <button onClick={() => { navigator.clipboard.writeText(deployedUrl!); setCopied(true); setTimeout(() => setCopied(false), 2000) }} className="flex-1 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors whitespace-nowrap">{copied ? '✓ Copied!' : 'Copy URL'}</button>
        </div>
      </div>
    </div>
  )

  const DomainModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-lg mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Domain Settings</h2>
          <button onClick={() => setShowDomainModal(false)} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="mb-4">
          <div className="text-xs text-zinc-500 mb-1">Base Domain</div>
          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            <a href={`https://${currentProject?.deployedSlug}.hatchitsites.dev`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              {currentProject?.deployedSlug}.hatchitsites.dev
            </a>
            <button onClick={() => { navigator.clipboard.writeText(`https://${currentProject?.deployedSlug}.hatchitsites.dev`); setCopied(true); setTimeout(() => setCopied(false), 2000) }} className="ml-auto text-zinc-400 hover:text-white">
              {copied ? <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
            </button>
          </div>
        </div>
        <div className="border-t border-zinc-800 pt-4">
          <div className="text-xs text-zinc-500 mb-2">Custom Domain</div>
          {currentProject?.customDomain && domainStatus !== 'idle' && domainStatus !== 'adding' && domainStatus !== 'error' ? (
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800 rounded-lg mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              <a href={`https://${currentProject.customDomain}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                {currentProject.customDomain}
              </a>
              <button onClick={() => { setDomainStatus('idle'); setCustomDomain('') }} className="ml-auto text-xs text-zinc-500 hover:text-white">Change</button>
            </div>
          ) : null}
          {domainStatus === 'idle' || domainStatus === 'adding' || domainStatus === 'error' ? (
            <>
              <input ref={domainInputRef} type="text" value={customDomain} onChange={(e) => setCustomDomain(e.target.value.toLowerCase())} onKeyDown={(e) => e.key === 'Enter' && customDomain && connectDomain()} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 mb-2" placeholder="example.com or www.example.com" autoFocus />
              {domainError && <p className="text-red-400 text-sm mb-2">{domainError}</p>}
              <button onClick={connectDomain} disabled={!customDomain || domainStatus === 'adding'} className="w-full px-4 py-3 text-sm bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center justify-center gap-2">
                {domainStatus === 'adding' ? (
                  <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Adding Domain...</>
                ) : currentProject?.customDomain ? 'Update Domain' : 'Connect Domain'}
              </button>
            </>
          ) : domainStatus === 'pending' || domainStatus === 'success' ? (
            <>
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span className="text-amber-400 text-sm">DNS Configuration Required</span>
              </div>
              <div className="bg-zinc-800 rounded-xl p-4 mb-4 space-y-3">
                <div><div className="text-xs text-zinc-500 mb-1">Type</div><div className="text-white font-mono text-sm">CNAME</div></div>
                <div><div className="text-xs text-zinc-500 mb-1">Name / Host</div><div className="text-white font-mono text-sm">{customDomain.startsWith('www.') ? 'www' : '@'}</div></div>
                <div><div className="text-xs text-zinc-500 mb-1">Value / Target</div><div className="text-white font-mono text-sm flex items-center gap-2">cname.vercel-dns.com<button onClick={() => { navigator.clipboard.writeText('cname.vercel-dns.com'); setCopied(true); setTimeout(() => setCopied(false), 2000) }} className="text-zinc-400 hover:text-white">{copied ? <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}</button></div></div>
              </div>
              <p className="text-zinc-500 text-xs mb-4">DNS changes can take 5-30 minutes to propagate.</p>
              <div className="flex gap-2">
                <button onClick={() => setShowDomainModal(false)} className="flex-1 px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">Done</button>
                <a href={`https://${customDomain}`} target="_blank" rel="noopener noreferrer" className="flex-1 px-4 py-2 text-sm bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl transition-colors text-center">Check Domain</a>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )

  const MobileModal = ({ type, onClose }: { type: 'preview' | 'code', onClose: () => void }) => (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div className="flex gap-1">
            <button onClick={() => setMobileModal('preview')} className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${type === 'preview' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Preview</button>
            <button onClick={() => setMobileModal('code')} className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${type === 'code' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Code</button>
          </div>
        </div>
        {type === 'preview' && <div className="flex items-center gap-2 text-xs text-zinc-600"><span className="px-2 py-1 bg-zinc-800/50 rounded-md">{typeof window !== 'undefined' && window.innerWidth < 640 ? 'Mobile' : 'Tablet'}</span></div>}
      </div>
      <div className="flex-1 overflow-auto">{type === 'preview' ? <LivePreview code={code} isLoading={isGenerating} isPaid={isPaid} setShowUpgradeModal={setShowUpgradeModal} /> : <CodePreview code={code} isPaid={isPaid} />}</div>
    </div>
  )

  const ProjectSelector = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="relative">
      <button onClick={() => setShowProjectDropdown(!showProjectDropdown)} className={`flex items-center gap-2 hover:bg-zinc-800 rounded-lg transition-colors ${mobile ? 'px-2 py-1.5' : 'px-3 py-1.5'}`}>
        <span className={`font-medium text-white truncate ${mobile ? 'max-w-[120px] text-sm' : 'max-w-[180px]'}`}>{currentProject?.name || 'Select Project'}</span>
        {isDeployed && <span className="text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded">LIVE</span>}
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-zinc-500 transition-transform ${showProjectDropdown ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {showProjectDropdown && <ProjectDropdown />}
    </div>
  )

  const HistoryButton = () => (
    <button onClick={() => setShowHistoryModal(true)} disabled={versions.length === 0} className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed" title={`Version history (${versions.length} versions)`}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    </button>
  )

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

  if (isMobile) {
    return (
      <div className="h-screen bg-zinc-950 flex flex-col">
        {showRenameModal && <RenameModal />}
        {showDeleteModal && <DeleteModal />}
        {showDeployModal && <DeployConfirmModal />}
        {showHistoryModal && <HistoryModal />}
        {showDomainModal && <DomainModal />}
        {deployedUrl && <DeployedModal />}
        {showShipModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-zinc-900 rounded-xl p-8 max-w-md w-full mx-4 border border-zinc-800">
              <h2 className="text-2xl font-bold mb-2">Ship your site</h2>
              <p className="text-zinc-400 mb-6">Manage your deployed project</p>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleDeploy()}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
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
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
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
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
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
        {showUpgradeModal && <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} reason={upgradeReason} />}
        {mobileModal && <MobileModal type={mobileModal} onClose={() => setMobileModal(null)} />}
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xl font-black hover:opacity-80 transition-opacity">
              <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">Hatch</span>
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">It</span>
            </Link>
            <span className="text-zinc-700">|</span>
            <ProjectSelector mobile />
            {isPaid && <HatchedBadge />}
          </div>
          <div className="flex items-center gap-1">
            <HistoryButton />
            {canRedo && <button onClick={handleRedo} className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all" title="Redo"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg></button>}
            {canUndo && <button onClick={handleUndo} className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all" title="Undo"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg></button>}
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <Chat onGenerate={handleGenerate} isGenerating={isGenerating} currentCode={code} key={currentProjectId} />
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
    <div className="h-screen bg-zinc-950 p-3">
      {showRenameModal && <RenameModal />}
      {showDeleteModal && <DeleteModal />}
      {showDeployModal && <DeployConfirmModal />}
      {showHistoryModal && <HistoryModal />}
      {showDomainModal && <DomainModal />}
      {deployedUrl && <DeployedModal />}
      {showUpgradeModal && <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} reason={upgradeReason} />}
      {showSuccessModal && <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} />}
      <Group orientation="horizontal" className="h-full rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
        <Panel id="chat" defaultSize={28} minSize={20}>
          <div className="h-full flex flex-col bg-zinc-900">
            <div className="px-4 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/" className="text-xl font-black hover:opacity-80 transition-opacity">
                  <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">Hatch</span>
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">It</span>
                </Link>
                <span className="text-zinc-700">|</span>
                <ProjectSelector />
                {isPaid && <HatchedBadge />}
              </div>
              <div className="flex items-center gap-1">
                <HistoryButton />
                {canRedo && <button onClick={handleRedo} className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all" title="Redo"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg></button>}
                {canUndo && <button onClick={handleUndo} className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all" title="Undo"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg></button>}
              </div>
            </div>
            <Chat onGenerate={handleGenerate} isGenerating={isGenerating} currentCode={code} key={currentProjectId} />
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
              {activeTab === 'preview' ? <LivePreview code={code} isLoading={isGenerating} isPaid={isPaid} setShowUpgradeModal={setShowUpgradeModal} /> : <CodePreview code={code} isPaid={isPaid} />}
            </div>
          </div>
        </Panel>
      </Group>
    </div>
  )
}