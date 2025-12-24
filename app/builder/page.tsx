'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Group, Panel, Separator } from 'react-resizable-panels'
import Chat from '@/components/Chat'
import CodePreview from '@/components/CodePreview'
import LivePreview from '@/components/LivePreview'

interface Message {
  role: 'user' | 'assistant'
  content: string
  code?: string
}

interface Project {
  id: string
  name: string
  code: string
  codeHistory: string[]
  createdAt: string
  updatedAt: string
}

const generateId = () => Math.random().toString(36).substring(2, 9)

const createNewProject = (name?: string): Project => ({
  id: generateId(),
  name: name || 'Untitled Project',
  code: '',
  codeHistory: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

export default function Home() {
  // Project state
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [renameValue, setRenameValue] = useState('')
  
  // Current project derived state
  const currentProject = projects.find(p => p.id === currentProjectId)
  const code = currentProject?.code || ''
  const codeHistory = currentProject?.codeHistory || []
  
  // UI state
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview')
  const [previewWidth, setPreviewWidth] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileModal, setMobileModal] = useState<'preview' | 'code' | null>(null)
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load projects from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('hatchit-projects')
    const savedCurrentId = localStorage.getItem('hatchit-current-project')
    
    if (savedProjects) {
      const parsed = JSON.parse(savedProjects) as Project[]
      setProjects(parsed)
      
      if (savedCurrentId && parsed.find(p => p.id === savedCurrentId)) {
        setCurrentProjectId(savedCurrentId)
      } else if (parsed.length > 0) {
        setCurrentProjectId(parsed[0].id)
      }
    } else {
      const defaultProject = createNewProject('My First Project')
      setProjects([defaultProject])
      setCurrentProjectId(defaultProject.id)
    }
  }, [])

  // Save projects to localStorage whenever they change
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('hatchit-projects', JSON.stringify(projects))
    }
  }, [projects])

  // Save current project ID
  useEffect(() => {
    if (currentProjectId) {
      localStorage.setItem('hatchit-current-project', currentProjectId)
    }
  }, [currentProjectId])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowProjectDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Preview width observer
  useEffect(() => {
    if (!previewContainerRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setPreviewWidth(entry.contentRect.width)
      }
    })
    observer.observe(previewContainerRef.current)
    return () => observer.disconnect()
  }, [])

  const breakpoint = previewWidth < 640 ? 'Mobile' : previewWidth < 1024 ? 'Tablet' : 'Desktop'

  // Update current project
  const updateCurrentProject = (updates: Partial<Project>) => {
    if (!currentProjectId) return
    setProjects(prev => prev.map(p => 
      p.id === currentProjectId 
        ? { ...p, ...updates, updatedAt: new Date().toISOString() }
        : p
    ))
  }

  // Project actions
  const createProject = () => {
    const newProject = createNewProject()
    setProjects(prev => [newProject, ...prev])
    setCurrentProjectId(newProject.id)
    setShowProjectDropdown(false)
  }

  const switchProject = (id: string) => {
    setCurrentProjectId(id)
    setShowProjectDropdown(false)
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
  }

  const duplicateProject = () => {
    if (!currentProject) return
    const duplicate: Project = {
      ...currentProject,
      id: generateId(),
      name: `${currentProject.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setProjects(prev => [duplicate, ...prev])
    setCurrentProjectId(duplicate.id)
    setShowProjectDropdown(false)
  }

  // Handle code generation
  const handleGenerate = async (prompt: string, history: Message[], currentCode: string) => {
    setIsGenerating(true)
    
    if (code) {
      updateCurrentProject({ codeHistory: [...codeHistory, code] })
    }
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, history, currentCode }),
      })
      const data = await response.json()
      if (data.code) {
        updateCurrentProject({ code: data.code })
        if (isMobile) {
          setMobileModal('preview')
        }
      }
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUndo = () => {
    if (codeHistory.length > 0) {
      const previousCode = codeHistory[codeHistory.length - 1]
      updateCurrentProject({
        code: previousCode,
        codeHistory: codeHistory.slice(0, -1)
      })
    }
  }

  // Project Dropdown Component
  const ProjectDropdown = () => (
    <div 
      ref={dropdownRef}
      className="absolute top-full left-0 mt-2 w-72 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden"
    >
      <button
        onClick={createProject}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-zinc-800 transition-colors border-b border-zinc-800"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </div>
        <span className="text-sm font-medium text-white">New Project</span>
      </button>

      <div className="max-h-64 overflow-y-auto">
        {projects.map(project => (
          <button
            key={project.id}
            onClick={() => switchProject(project.id)}
            className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-zinc-800 transition-colors ${
              project.id === currentProjectId ? 'bg-zinc-800' : ''
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${
              project.id === currentProjectId 
                ? 'bg-blue-600 text-white' 
                : 'bg-zinc-700 text-zinc-400'
            }`}>
              {project.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-medium text-white truncate">{project.name}</div>
              <div className="text-xs text-zinc-500">
                {new Date(project.updatedAt).toLocaleDateString()}
              </div>
            </div>
            {project.id === currentProjectId && (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </button>
        ))}
      </div>

      {currentProject && (
        <div className="border-t border-zinc-800 p-2 flex gap-1">
          <button
            onClick={() => {
              setRenameValue(currentProject.name)
              setShowRenameModal(true)
              setShowProjectDropdown(false)
            }}
            className="flex-1 px-3 py-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Rename
          </button>
          <button
            onClick={duplicateProject}
            className="flex-1 px-3 py-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Duplicate
          </button>
          {projects.length > 1 && (
            <button
              onClick={() => {
                setShowDeleteModal(true)
                setShowProjectDropdown(false)
              }}
              className="flex-1 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )

  const RenameModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
        <h2 className="text-lg font-semibold text-white mb-4">Rename Project</h2>
        <input
          type="text"
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && renameProject()}
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          placeholder="Project name"
          autoFocus
        />
        <div className="flex gap-3 justify-end mt-4">
          <button
            onClick={() => setShowRenameModal(false)}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={renameProject}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )

  const DeleteModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
        <h2 className="text-lg font-semibold text-white mb-2">Delete Project?</h2>
        <p className="text-zinc-400 text-sm mb-6">
          This will permanently delete "{currentProject?.name}". This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={deleteProject}
            className="px-4 py-2 text-sm bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )

  const MobileModal = ({ type, onClose }: { type: 'preview' | 'code', onClose: () => void }) => (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div className="flex gap-1">
            <button
              onClick={() => setMobileModal('preview')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                type === 'preview' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setMobileModal('code')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                type === 'code' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Code
            </button>
          </div>
        </div>
        {type === 'preview' && (
          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <span className="px-2 py-1 bg-zinc-800/50 rounded-md">
              {typeof window !== 'undefined' && window.innerWidth < 640 ? 'Mobile' : 'Tablet'}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-auto">
        {type === 'preview' ? (
          <LivePreview code={code} isLoading={isGenerating} />
        ) : (
          <CodePreview code={code} />
        )}
      </div>
    </div>
  )

  const ProjectSelector = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="relative">
      <button
        onClick={() => setShowProjectDropdown(!showProjectDropdown)}
        className={`flex items-center gap-2 hover:bg-zinc-800 rounded-lg transition-colors ${
          mobile ? 'px-2 py-1.5' : 'px-3 py-1.5'
        }`}
      >
        <span className={`font-medium text-white truncate ${mobile ? 'max-w-[120px] text-sm' : 'max-w-[180px]'}`}>
          {currentProject?.name || 'Select Project'}
        </span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="14" 
          height="14" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          className={`text-zinc-500 transition-transform ${showProjectDropdown ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {showProjectDropdown && <ProjectDropdown />}
    </div>
  )

  if (isMobile) {
    return (
      <div className="h-screen bg-zinc-950 flex flex-col">
        {showRenameModal && <RenameModal />}
        {showDeleteModal && <DeleteModal />}
        {mobileModal && <MobileModal type={mobileModal} onClose={() => setMobileModal(null)} />}

        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xl font-black hover:opacity-80 transition-opacity">
              <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">Hatch</span>
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">It</span>
            </Link>
            <span className="text-zinc-700">|</span>
            <ProjectSelector mobile />
          </div>
          <div className="flex items-center gap-1">
            {codeHistory.length > 0 && (
              <button
                onClick={handleUndo}
                className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                title={`Undo (${codeHistory.length} in history)`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7v6h6"/>
                  <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <Chat 
            onGenerate={handleGenerate} 
            isGenerating={isGenerating} 
            currentCode={code}
            key={currentProjectId}
          />
        </div>

        {code && (
          <div 
            className="px-4 py-3 border-t border-zinc-800 bg-zinc-900 flex gap-2"
            style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
          >
            <button
              onClick={() => setMobileModal('preview')}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Preview
            </button>
            <button
              onClick={() => setMobileModal('code')}
              className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6"/>
                <polyline points="8 6 2 12 8 18"/>
              </svg>
              Code
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-screen bg-zinc-950 p-3">
      {showRenameModal && <RenameModal />}
      {showDeleteModal && <DeleteModal />}

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
              </div>
              <div className="flex items-center gap-1">
                {codeHistory.length > 0 && (
                  <button
                    onClick={handleUndo}
                    className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                    title={`Undo (${codeHistory.length} in history)`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 7v6h6"/>
                      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <Chat 
              onGenerate={handleGenerate} 
              isGenerating={isGenerating} 
              currentCode={code}
              key={currentProjectId}
            />
          </div>
        </Panel>

        <Separator className="w-px bg-zinc-800 hover:bg-purple-500/50 transition-colors cursor-col-resize" />

        <Panel id="right" defaultSize={72} minSize={40}>
          <div className="h-full flex flex-col bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-800 px-4">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-3 text-sm font-medium transition-all relative ${
                    activeTab === 'preview' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Preview
                  {activeTab === 'preview' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-4 py-3 text-sm font-medium transition-all relative ${
                    activeTab === 'code' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Code
                  {activeTab === 'code' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  )}
                </button>
              </div>
              {activeTab === 'preview' && previewWidth > 0 && (
                <div className="flex items-center gap-2 text-xs text-zinc-600">
                  <span className="px-2 py-1 bg-zinc-800/50 rounded-md">{breakpoint}</span>
                  <span className="text-zinc-700">•</span>
                  <span className="font-mono">{Math.round(previewWidth)}px</span>
                </div>
              )}
            </div>

            <div ref={previewContainerRef} className="flex-1 overflow-auto min-h-0">
              {activeTab === 'preview' ? (
                <LivePreview code={code} isLoading={isGenerating} />
              ) : (
                <CodePreview code={code} />
              )}
            </div>
          </div>
        </Panel>
      </Group>
    </div>
  )
}