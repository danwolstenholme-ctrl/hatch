'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { Project, Page, Version, DeployedProject } from '@/types/builder'
import { AccountSubscription } from '@/types/subscriptions'
import { 
  generateId, 
  createNewProject, 
  migrateProject, 
  migrateToMultiPage, 
  isMultiPageProject, 
  getCurrentPage
} from '@/lib/project-utils'
import { showSuccessToast, showErrorToast } from '@/app/lib/toast'

interface UseProjectsReturn {
  // Project state
  projects: Project[]
  currentProject: Project | undefined
  currentProjectId: string | null
  setCurrentProjectId: (id: string | null) => void
  
  // Current page (for multi-page projects)
  currentPage: Page | null
  versions: Version[]
  currentVersionIndex: number
  code: string
  previewPages: { id: string; name: string; path: string; code: string }[] | undefined
  
  // Subscription state
  accountSubscription: AccountSubscription | null
  currentProjectSlug: string
  isPaidUser: boolean
  
  // Deployed projects
  deployedProjects: DeployedProject[]
  projectsToPull: DeployedProject[]
  
  // Flags
  isDeployed: boolean
  canUndo: boolean
  canRedo: boolean
  
  // Actions
  updateCurrentProject: (updates: Partial<Project>) => void
  createProject: () => boolean // returns false if blocked by paywall
  switchProject: (id: string) => void
  renameProject: (newName: string) => void
  deleteProject: (id?: string) => void
  deleteAllProjects: () => void
  duplicateProject: () => boolean // returns false if blocked by paywall
  
  // Page actions
  addPage: (name: string, path?: string) => void
  deletePage: (pageId: string) => void
  deleteAllPagesExceptFirst: () => void
  switchPage: (pageId: string) => void
  
  // Version actions
  handleUndo: () => void
  handleRedo: () => void
  restoreVersion: (index: number) => void
  handleCodeChange: (newCode: string) => void
  
  // Pull project from cloud
  pullProject: (deployedProject: DeployedProject) => void
  
  // Brand actions
  applyBrandColorChange: (oldColor: string, newColor: string) => void
}

// Initialize projects from localStorage (run once on load)
function getInitialProjects(): { projects: Project[], currentId: string | null } {
  if (typeof window === 'undefined') {
    const defaultProject = createNewProject('My First Project')
    return { projects: [defaultProject], currentId: defaultProject.id }
  }
  
  try {
    const savedProjects = localStorage.getItem('hatchit-projects')
    const savedCurrentId = localStorage.getItem('hatchit-current-project')
    
    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects) as Project[]
        const migrated = parsed.map(p => migrateToMultiPage(migrateProject(p)))
        const currentId = savedCurrentId && migrated.find(p => p.id === savedCurrentId) 
          ? savedCurrentId 
          : (migrated.length > 0 ? migrated[0].id : null)
        return { projects: migrated, currentId }
      } catch {
        localStorage.removeItem('hatchit-projects')
      }
    }
  } catch {
    // localStorage unavailable
  }
  
  const defaultProject = createNewProject('My First Project')
  return { projects: [defaultProject], currentId: defaultProject.id }
}

export function useProjects(): UseProjectsReturn {
  // Use lazy initialization to avoid setState in effect
  const [projects, setProjects] = useState<Project[]>(() => getInitialProjects().projects)
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(() => getInitialProjects().currentId)
  const { user } = useUser()
  
  // Save projects to localStorage
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('hatchit-projects', JSON.stringify(projects))
    }
  }, [projects])
  
  // Save current project ID to localStorage
  useEffect(() => {
    if (currentProjectId) {
      localStorage.setItem('hatchit-current-project', currentProjectId)
    }
  }, [currentProjectId])
  
  // Derived state
  const currentProject = projects.find(p => p.id === currentProjectId)
  const currentPage = currentProject ? getCurrentPage(currentProject) : null
  const versions = useMemo(
    () => currentPage?.versions || currentProject?.versions || [],
    [currentPage?.versions, currentProject?.versions]
  )
  const currentVersionIndex = currentPage?.currentVersionIndex ?? currentProject?.currentVersionIndex ?? -1
  const code = versions[currentVersionIndex]?.code || ''
  
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
  
  // Account subscription from user metadata (Architect, Visionary, or Singularity tier)
  const accountSubscription = useMemo(() => {
    return (user?.publicMetadata?.accountSubscription as AccountSubscription) || null
  }, [user?.publicMetadata?.accountSubscription])
  
  // Current project slug
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const currentProjectSlug = useMemo(() => {
    if (!currentProject || !user?.id) return ''
    if (currentProject.deployedSlug) return currentProject.deployedSlug
    const userSuffix = user.id.slice(-6).toLowerCase()
    const baseSlug = currentProject.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'site'
    return `${baseSlug}-${userSuffix}`
  }, [currentProject, user?.id])
  
  // Check if user has an active account subscription
  const isPaidUser = useMemo(() => {
    return accountSubscription?.status === 'active'
  }, [accountSubscription])
  
  // Deployed projects from Clerk metadata
  const deployedProjects = useMemo(() => {
    return (user?.publicMetadata?.deployedProjects as DeployedProject[]) || []
  }, [user?.publicMetadata?.deployedProjects])
  
  const projectsToPull = useMemo(() => {
    return deployedProjects.filter(deployed => 
      !projects.some(local => local.deployedSlug === deployed.slug)
    )
  }, [deployedProjects, projects])
  
  // Actions
  const updateCurrentProject = useCallback((updates: Partial<Project>) => {
    if (!currentProjectId) return
    setProjects(prev => prev.map(p => 
      p.id === currentProjectId 
        ? { ...p, ...updates, updatedAt: new Date().toISOString() } 
        : p
    ))
  }, [currentProjectId])
  
  const createProjectAction = useCallback(() => {
    // Tier-based project limits
    // accountSubscription?.tier is 'architect' | 'visionary' | 'singularity' or undefined (free)
    const tier = accountSubscription?.tier
    const projectLimit = !tier ? 1 : tier === 'architect' ? 3 : Infinity
    
    if (projects.length >= projectLimit) {
      return false // Blocked by paywall
    }
    const newProject = createNewProject()
    setProjects(prev => [newProject, ...prev])
    setCurrentProjectId(newProject.id)
    return true
  }, [accountSubscription?.tier, projects.length])
  
  const switchProject = useCallback((id: string) => {
    if (id === currentProjectId) return
    setCurrentProjectId(id)
  }, [currentProjectId])
  
  const renameProjectAction = useCallback((newName: string) => {
    if (!newName.trim() || !currentProjectId) return
    updateCurrentProject({ name: newName.trim() })
  }, [currentProjectId, updateCurrentProject])
  
  const deleteProjectAction = useCallback((id?: string) => {
    const targetId = id || currentProjectId
    if (!targetId) return

    setProjects(prev => {
      const next = prev.filter(p => p.id !== targetId)
      // If we deleted the current project, switch to another one or null
      if (targetId === currentProjectId) {
        const nextProject = next.length > 0 ? next[0] : null
        setCurrentProjectId(nextProject ? nextProject.id : null)
      }
      return next
    })
  }, [currentProjectId])
  
  const deleteAllProjectsAction = useCallback(() => {
    const freshProject = createNewProject()
    setProjects([freshProject])
    setCurrentProjectId(freshProject.id)
    // Clear chat history from localStorage
    const keysToRemove = Object.keys(localStorage).filter(key => 
      key.startsWith('chat-build-') || key.startsWith('chat-chat-')
    )
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }, [])
  
  const duplicateProjectAction = useCallback(() => {
    if (!isPaidUser && projects.length >= 1) {
      return false
    }
    if (!currentProject) return false
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
    return true
  }, [isPaidUser, projects.length, currentProject])
  
  // Page actions
  const addPage = useCallback((name: string, pathInput?: string) => {
    if (!currentProject || !name.trim()) return
    const path = pathInput?.trim() || `/${name.toLowerCase().replace(/\s+/g, '-')}`
    const newPage: Page = {
      id: generateId(),
      name: name.trim(),
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
  }, [currentProject])
  
  const deletePage = useCallback((pageId: string) => {
    if (!currentProject || !currentProject.pages) return
    if (currentProject.pages.length <= 1) return
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
  }, [currentProject])
  
  const deleteAllPagesExceptFirst = useCallback(() => {
    if (!currentProject || !currentProject.pages || currentProject.pages.length <= 1) return
    const firstPage = currentProject.pages[0]
    const updatedProject = {
      ...currentProject,
      pages: [firstPage],
      currentPageId: firstPage.id,
      updatedAt: new Date().toISOString()
    }
    setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProject : p))
  }, [currentProject])
  
  const switchPage = useCallback((pageId: string) => {
    if (!currentProject) return
    const updatedProject = { ...currentProject, currentPageId: pageId }
    setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProject : p))
  }, [currentProject])
  
  // Version actions
  const handleUndo = useCallback(() => {
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
  }, [canUndo, currentProject, currentPage, currentVersionIndex, updateCurrentProject])
  
  const handleRedo = useCallback(() => {
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
  }, [canRedo, currentProject, currentPage, currentVersionIndex, updateCurrentProject])
  
  const restoreVersion = useCallback((index: number) => {
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
  }, [currentProject, currentPage, updateCurrentProject])
  
  const handleCodeChange = useCallback((newCode: string) => {
    if (!currentProject) return
    const newVersion: Version = {
      id: generateId(),
      code: newCode,
      timestamp: new Date().toISOString(),
      prompt: 'Manual edit'
    }
    if (isMultiPageProject(currentProject) && currentPage) {
      const updatedPages = currentProject.pages!.map(page => 
        page.id === currentPage.id
          ? {
              ...page,
              versions: [...page.versions, newVersion],
              currentVersionIndex: page.versions.length
            }
          : page
      )
      updateCurrentProject({ pages: updatedPages })
    } else {
      const updatedVersions = [...(currentProject.versions || []), newVersion]
      updateCurrentProject({ 
        versions: updatedVersions, 
        currentVersionIndex: updatedVersions.length - 1 
      })
    }
  }, [currentProject, currentPage, updateCurrentProject])
  
  const pullProject = useCallback((deployedProject: DeployedProject) => {
    let newProject: Project
    if (deployedProject.pages && deployedProject.pages.length > 0) {
      const pages: Page[] = deployedProject.pages.map((p) => ({
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
  }, [])
  
  const applyBrandColorChange = useCallback((oldColor: string, newColor: string) => {
    if (!code || !currentProject) return
    const updatedCode = code.replaceAll(oldColor, newColor)
    if (updatedCode === code) {
      showErrorToast('Color not found in current code')
      return
    }
    const newVersion: Version = { 
      id: generateId(), 
      code: updatedCode, 
      timestamp: new Date().toISOString(), 
      prompt: `Changed color ${oldColor} to ${newColor}` 
    }
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
      const newVersions = currentVersionIndex >= 0 
        ? [...versions.slice(0, currentVersionIndex + 1), newVersion] 
        : [newVersion]
      updateCurrentProject({ 
        versions: newVersions, 
        currentVersionIndex: newVersions.length - 1, 
        brand: { ...currentProject.brand!, colors: newBrandColors } 
      })
    }
    showSuccessToast('Color updated!')
  }, [code, currentProject, currentPage, currentVersionIndex, versions, updateCurrentProject])
  
  return {
    projects,
    currentProject,
    currentProjectId,
    setCurrentProjectId,
    currentPage,
    versions,
    currentVersionIndex,
    code,
    previewPages,
    accountSubscription,
    currentProjectSlug,
    isPaidUser,
    deployedProjects,
    projectsToPull,
    isDeployed,
    canUndo,
    canRedo,
    updateCurrentProject,
    createProject: createProjectAction,
    switchProject,
    renameProject: renameProjectAction,
    deleteProject: deleteProjectAction,
    deleteAllProjects: deleteAllProjectsAction,
    duplicateProject: duplicateProjectAction,
    addPage,
    deletePage,
    deleteAllPagesExceptFirst,
    switchPage,
    handleUndo,
    handleRedo,
    restoreVersion,
    handleCodeChange,
    pullProject,
    applyBrandColorChange,
  }
}
