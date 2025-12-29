'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import TemplateSelector, { BuildComplete } from './TemplateSelector'
import BrandingStep, { BrandConfig } from './BrandingStep'
import SectionProgress from './SectionProgress'
import SectionBuilder from './SectionBuilder'
import { Template, Section, getTemplateById, createInitialBuildState, BuildState } from '@/lib/templates'
import { DbProject, DbSection } from '@/lib/supabase'

// =============================================================================
// BUILD FLOW CONTROLLER
// Orchestrates the entire V3.0 build experience
// =============================================================================

type BuildPhase = 'select' | 'branding' | 'building' | 'complete'

interface BuildFlowControllerProps {
  existingProjectId?: string
  demoMode?: boolean
}

const generateId = () => Math.random().toString(36).substring(2, 15)

export default function BuildFlowController({ existingProjectId, demoMode: forceDemoMode }: BuildFlowControllerProps) {
  const { user } = useUser()
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

  // Check for existing project on mount (from URL or localStorage)
  useEffect(() => {
    if (existingProjectId) {
      loadExistingProject(existingProjectId)
    } else {
      // Check localStorage for in-progress project
      const savedProjectId = localStorage.getItem('hatch_current_project')
      if (savedProjectId && !forceDemoMode) {
        loadExistingProject(savedProjectId)
      }
    }
  }, [existingProjectId])

  const loadExistingProject = async (projectId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/project/${projectId}`)
      if (!response.ok) throw new Error('Failed to load project')
      
      const { project: proj, sections } = await response.json()
      
      const template = getTemplateById(proj.template_id)
      if (!template) throw new Error('Unknown template')

      setProject(proj)
      setDbSections(sections)
      setSelectedTemplate(template)
      
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
      state.currentSectionIndex = firstPending === -1 ? template.sections.length : firstPending
      
      setBuildState(state)
      
      const allDone = sections.every((s: DbSection) => s.status === 'complete' || s.status === 'skipped')
      setPhase(allDone ? 'complete' : 'building')
      
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
      setIsLoading(false)
    }
    
    if (demoMode || forceDemoMode || !user) {
      setupDemoMode()
      return
    }

    setIsLoading(true)
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
      
      // Persist project ID in URL and localStorage
      router.replace(`/builder?project=${newProject.id}`, { scroll: false })
      localStorage.setItem('hatch_current_project', newProject.id)

    } catch (err) {
      console.error('Error creating project:', err)
      console.warn('Falling back to demo mode')
      setupDemoMode()
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentSection = useCallback((): Section | null => {
    if (!selectedTemplate || !buildState) return null
    return selectedTemplate.sections[buildState.currentSectionIndex] || null
  }, [selectedTemplate, buildState])

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
    if (!buildState || !selectedTemplate || !project) return

    const currentSection = getCurrentSection()
    const dbSection = getCurrentDbSection()
    if (!currentSection || !dbSection) return

    const newState: BuildState = {
      ...buildState,
      completedSections: [...buildState.completedSections, currentSection.id],
      sectionCode: { ...buildState.sectionCode, [currentSection.id]: code },
      sectionRefined: { ...buildState.sectionRefined, [currentSection.id]: refined },
      sectionChanges: refinementChanges 
        ? { ...buildState.sectionChanges, [currentSection.id]: refinementChanges }
        : buildState.sectionChanges,
      currentSectionIndex: buildState.currentSectionIndex + 1,
    }

    setDbSections(prev => 
      prev.map(s => 
        s.id === dbSection.id 
          ? { ...s, status: 'complete' as const, code, refined, refinement_changes: refinementChanges || null }
          : s
      )
    )

    setBuildState(newState)

    if (newState.currentSectionIndex >= selectedTemplate.sections.length) {
      setPhase('complete')
      if (!demoMode) {
        await fetch(`/api/project/${project.id}/build`, { method: 'POST' }).catch(console.error)
      }
    }
  }

  const handleSkipSection = async () => {
    if (!buildState || !selectedTemplate || !project) return

    const currentSection = getCurrentSection()
    const dbSection = getCurrentDbSection()
    if (!currentSection || !dbSection) return

    if (!demoMode) {
      await fetch(`/api/section/${dbSection.id}/skip`, { method: 'POST' }).catch(console.error)
    }

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

    if (newState.currentSectionIndex >= selectedTemplate.sections.length) {
      setPhase('complete')
      if (!demoMode) {
        await fetch(`/api/project/${project.id}/build`, { method: 'POST' }).catch(console.error)
      }
    }
  }

  const handleSectionClick = (sectionIndex: number) => {
    if (!buildState || !selectedTemplate) return
    
    const section = selectedTemplate.sections[sectionIndex]
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
    if (!buildState || !selectedTemplate) return
    
    const nextIndex = buildState.currentSectionIndex + 1
    
    if (nextIndex >= selectedTemplate.sections.length) {
      // All sections done - go to complete phase
      setPhase('complete')
      // Clear localStorage since project is complete
      localStorage.removeItem('hatch_current_project')
      if (!demoMode && project) {
        fetch(`/api/project/${project.id}/build`, { method: 'POST' }).catch(console.error)
      }
    } else {
      setBuildState({ ...buildState, currentSectionIndex: nextIndex })
    }
  }

  const handleDeploy = async () => {
    if (!project) return
    window.location.href = `/builder?mode=legacy&deploy=${project.id}`
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
    router.replace('/builder', { scroll: false })
    setProject(null)
    setDbSections([])
    setSelectedTemplate(null)
    setCustomizedSections(null)
    setBrandConfig(null)
    setBuildState(null)
    setPhase('select')
    setDemoMode(false)
  }

  const handleGoHome = () => {
    router.push('/')
  }

  const handleViewBrand = () => {
    // Go back to branding step to edit brand settings
    setPhase('branding')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full"
        />
        <p className="text-zinc-400 text-sm">Resuming your project...</p>
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
              onClick={() => setError(null)}
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

        {phase === 'building' && selectedTemplate && buildState && (
          <motion.div
            key="building"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-screen overflow-hidden"
          >
            <SectionProgress
              template={selectedTemplate}
              buildState={buildState}
              onSectionClick={handleSectionClick}
              onSkip={handleSkipSection}
              onGoHome={handleGoHome}
              onStartOver={handleStartFresh}
              onViewBrand={handleViewBrand}
              brandConfig={brandConfig}
            />

            <div className="flex-1 flex min-h-0 overflow-hidden">
              {getCurrentSection() && getCurrentDbSection() && project && (
                <SectionBuilder
                  section={getCurrentSection()!}
                  dbSection={getCurrentDbSection()!}
                  projectId={project.id}
                  onComplete={handleSectionComplete}
                  onNextSection={handleNextSection}
                  isLastSection={buildState.currentSectionIndex >= selectedTemplate.sections.length - 1}
                  allSectionsCode={buildState.sectionCode}
                  demoMode={demoMode}
                  brandConfig={brandConfig}
                />
              )}
            </div>
          </motion.div>
        )}

        {phase === 'complete' && buildState && (
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md">
              <BuildComplete
                onDeploy={handleDeploy}
                onRunAudit={handleRunAudit}
                isAuditRunning={isAuditRunning}
                auditComplete={buildState.finalAuditComplete}
                auditChanges={buildState.finalAuditChanges}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}