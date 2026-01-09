'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Palette,
  Layers,
  Search,
  Check,
  Globe,
  Briefcase,
  ShoppingBag,
  Users,
  Newspaper,
  Rocket,
  Image as ImageIcon,
  Loader2,
  Github,
  Layout,
  Type,
  Quote,
  DollarSign,
  HelpCircle,
  Mail,
  BarChart3,
  Menu as MenuIcon,
  Star,
  Zap,
  RefreshCw
} from 'lucide-react'

// =============================================================================
// PROJECT WIZARD - The Brain of the Project
// Multi-step wizard for comprehensive project setup
// =============================================================================

interface PageConfig {
  name: string
  path: string
  sections: string[]
}

interface ProjectConfig {
  // Step 1: Basics
  name: string
  description: string
  siteType: 'business' | 'portfolio' | 'saas' | 'agency' | 'ecommerce' | 'blog' | 'other'
  
  // Step 2: Brand
  primaryColor: string
  secondaryColor: string
  bodyFont: string
  headingFont: string
  mode: 'dark' | 'light'
  
  // Step 3: Structure
  pages: PageConfig[]
  
  // Step 4: SEO
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  
  // Options
  pushToGithub: boolean
}

const DEFAULT_CONFIG: ProjectConfig = {
  name: '',
  description: '',
  siteType: 'business',
  primaryColor: '#10b981',
  secondaryColor: '#059669',
  bodyFont: 'Inter',
  headingFont: 'Inter',
  mode: 'dark',
  pages: [
    { name: 'Home', path: '/', sections: ['header', 'hero', 'features', 'testimonials', 'cta', 'footer'] }
  ],
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  pushToGithub: false
}

const SITE_TYPES = [
  { id: 'business', name: 'Business', icon: Briefcase, desc: 'Company website with services' },
  { id: 'portfolio', name: 'Portfolio', icon: ImageIcon, desc: 'Showcase your work' },
  { id: 'saas', name: 'SaaS', icon: Rocket, desc: 'Software product landing' },
  { id: 'agency', name: 'Agency', icon: Users, desc: 'Creative agency site' },
  { id: 'ecommerce', name: 'E-commerce', icon: ShoppingBag, desc: 'Online store' },
  { id: 'blog', name: 'Blog', icon: Newspaper, desc: 'Content-focused site' },
  { id: 'other', name: 'Other', icon: Globe, desc: 'Something unique' },
] as const

const FONTS = [
  { name: 'Inter', sample: 'Modern & Clean' },
  { name: 'Poppins', sample: 'Friendly & Round' },
  { name: 'Space Grotesk', sample: 'Tech & Bold' },
  { name: 'DM Sans', sample: 'Geometric & Pro' },
  { name: 'Plus Jakarta Sans', sample: 'Contemporary' },
  { name: 'Outfit', sample: 'Sleek & Minimal' },
]

const COLOR_PRESETS = [
  { name: 'Emerald', primary: '#10b981', secondary: '#059669' },
  { name: 'Blue', primary: '#3b82f6', secondary: '#2563eb' },
  { name: 'Purple', primary: '#8b5cf6', secondary: '#7c3aed' },
  { name: 'Rose', primary: '#f43f5e', secondary: '#e11d48' },
  { name: 'Amber', primary: '#f59e0b', secondary: '#d97706' },
  { name: 'Cyan', primary: '#06b6d4', secondary: '#0891b2' },
]

const SECTION_TYPES = [
  { id: 'header', name: 'Header', icon: MenuIcon, required: true },
  { id: 'hero', name: 'Hero', icon: Layout },
  { id: 'features', name: 'Features', icon: Star },
  { id: 'services', name: 'Services', icon: Briefcase },
  { id: 'about', name: 'About', icon: Users },
  { id: 'testimonials', name: 'Testimonials', icon: Quote },
  { id: 'pricing', name: 'Pricing', icon: DollarSign },
  { id: 'stats', name: 'Stats', icon: BarChart3 },
  { id: 'work', name: 'Portfolio', icon: ImageIcon },
  { id: 'faq', name: 'FAQ', icon: HelpCircle },
  { id: 'cta', name: 'CTA', icon: Zap },
  { id: 'contact', name: 'Contact', icon: Mail },
  { id: 'footer', name: 'Footer', icon: Type, required: true },
]

interface ProjectWizardProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (config: ProjectConfig) => Promise<void>
  githubConnected?: boolean
}

export default function ProjectWizard({ isOpen, onClose, onCreate, githubConnected }: ProjectWizardProps) {
  const [step, setStep] = useState(1)
  const [config, setConfig] = useState<ProjectConfig>(DEFAULT_CONFIG)
  const [isCreating, setIsCreating] = useState(false)
  const [isGeneratingSections, setIsGeneratingSections] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPageIndex, setSelectedPageIndex] = useState(0)
  
  const totalSteps = 5
  
  const updateConfig = useCallback((updates: Partial<ProjectConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }, [])

  // Auto-populate SEO from name/description
  useEffect(() => {
    if (config.name && !config.seoTitle) {
      updateConfig({ seoTitle: config.name })
    }
    if (config.description && !config.seoDescription) {
      updateConfig({ seoDescription: config.description })
    }
  }, [config.name, config.description, config.seoTitle, config.seoDescription, updateConfig])

  // AI section suggestion
  const generateSections = async () => {
    if (!config.name || !config.description) return
    
    setIsGeneratingSections(true)
    try {
      const response = await fetch('/api/generate-structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: config.name,
          description: config.description,
          siteType: config.siteType
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.pages) {
          updateConfig({ pages: data.pages })
        }
      }
    } catch (err) {
      console.error('Failed to generate sections:', err)
    } finally {
      setIsGeneratingSections(false)
    }
  }

  const handleCreate = async () => {
    if (!config.name) {
      setError('Please enter a project name')
      return
    }
    
    setIsCreating(true)
    setError(null)
    
    try {
      await onCreate(config)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project')
    } finally {
      setIsCreating(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1: return config.name.length > 0
      case 2: return true
      case 3: return config.pages.length > 0 && config.pages[0].sections.length >= 2
      case 4: return true
      case 5: return true
      default: return true
    }
  }

  const nextStep = () => {
    if (step < totalSteps && canProceed()) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const toggleSection = (pageIndex: number, sectionId: string) => {
    const page = config.pages[pageIndex]
    if (!page) return
    
    const isRequired = SECTION_TYPES.find(s => s.id === sectionId)?.required
    if (isRequired) return // Can't remove required sections
    
    const newSections = page.sections.includes(sectionId)
      ? page.sections.filter(s => s !== sectionId)
      : [...page.sections, sectionId]
    
    // Keep header first and footer last
    const sorted = sortSections(newSections)
    
    const newPages = [...config.pages]
    newPages[pageIndex] = { ...page, sections: sorted }
    updateConfig({ pages: newPages })
  }

  const sortSections = (sections: string[]) => {
    const order = SECTION_TYPES.map(s => s.id)
    return [...sections].sort((a, b) => order.indexOf(a) - order.indexOf(b))
  }

  const addPage = () => {
    const newPage: PageConfig = {
      name: `Page ${config.pages.length + 1}`,
      path: `/page-${config.pages.length + 1}`,
      sections: ['header', 'footer']
    }
    updateConfig({ pages: [...config.pages, newPage] })
    setSelectedPageIndex(config.pages.length)
  }

  const removePage = (index: number) => {
    if (config.pages.length <= 1) return // Must have at least one page
    const newPages = config.pages.filter((_, i) => i !== index)
    updateConfig({ pages: newPages })
    if (selectedPageIndex >= newPages.length) {
      setSelectedPageIndex(newPages.length - 1)
    }
  }

  const updatePageName = (index: number, name: string) => {
    const newPages = [...config.pages]
    newPages[index] = { ...newPages[index], name, path: index === 0 ? '/' : `/${name.toLowerCase().replace(/\s+/g, '-')}` }
    updateConfig({ pages: newPages })
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Create New Project</h2>
              <p className="text-xs text-zinc-500">Step {step} of {totalSteps}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-zinc-900/50">
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1 rounded-full transition-all ${
                  i < step ? 'bg-emerald-500' : i === step - 1 ? 'bg-emerald-500' : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Basics */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Project Basics</h3>
                  <p className="text-sm text-zinc-400">Tell us about what you&apos;re building</p>
                </div>

                {/* Project Name */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Project Name *</label>
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) => updateConfig({ name: e.target.value })}
                    placeholder="My Awesome Website"
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Description
                    <span className="text-zinc-500 font-normal ml-2">What&apos;s this site for?</span>
                  </label>
                  <textarea
                    value={config.description}
                    onChange={(e) => updateConfig({ description: e.target.value })}
                    placeholder="A modern website for my consulting business. We help startups scale their operations..."
                    rows={3}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 resize-none"
                  />
                </div>

                {/* Site Type */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-3">Site Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SITE_TYPES.map((type) => {
                      const Icon = type.icon
                      const isSelected = config.siteType === type.id
                      return (
                        <button
                          key={type.id}
                          onClick={() => updateConfig({ siteType: type.id as typeof config.siteType })}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs font-medium">{type.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Brand */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-1">
                  <Palette className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Brand System</h3>
                    <p className="text-sm text-zinc-400">Colors and typography for your site</p>
                  </div>
                </div>

                {/* Color Presets */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-3">Color Scheme</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {COLOR_PRESETS.map((preset) => {
                      const isSelected = config.primaryColor === preset.primary
                      return (
                        <button
                          key={preset.name}
                          onClick={() => updateConfig({ primaryColor: preset.primary, secondaryColor: preset.secondary })}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                            isSelected
                              ? 'border-white/30 bg-zinc-800'
                              : 'border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex gap-1">
                            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: preset.primary }} />
                            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: preset.secondary }} />
                          </div>
                          <span className="text-[10px] text-zinc-400">{preset.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Custom Colors */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-2">Primary Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={config.primaryColor}
                        onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                        className="w-10 h-10 rounded-lg border border-zinc-700 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.primaryColor}
                        onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                        className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-2">Secondary Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={config.secondaryColor}
                        onChange={(e) => updateConfig({ secondaryColor: e.target.value })}
                        className="w-10 h-10 rounded-lg border border-zinc-700 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.secondaryColor}
                        onChange={(e) => updateConfig({ secondaryColor: e.target.value })}
                        className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Fonts */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Body Font</label>
                    <select
                      value={config.bodyFont}
                      onChange={(e) => updateConfig({ bodyFont: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    >
                      {FONTS.map((font) => (
                        <option key={font.name} value={font.name}>{font.name} - {font.sample}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Heading Font</label>
                    <select
                      value={config.headingFont}
                      onChange={(e) => updateConfig({ headingFont: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    >
                      {FONTS.map((font) => (
                        <option key={font.name} value={font.name}>{font.name} - {font.sample}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Mode */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-3">Color Mode</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateConfig({ mode: 'dark' })}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                        config.mode === 'dark'
                          ? 'bg-zinc-800 border-emerald-500/40 text-white'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-zinc-900 border border-zinc-600" />
                      <span className="text-sm font-medium">Dark Mode</span>
                    </button>
                    <button
                      onClick={() => updateConfig({ mode: 'light' })}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                        config.mode === 'light'
                          ? 'bg-white border-emerald-500/40 text-zinc-900'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white border border-zinc-200" />
                      <span className="text-sm font-medium">Light Mode</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Structure */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Layers className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">Site Structure</h3>
                      <p className="text-sm text-zinc-400">Pages and sections</p>
                    </div>
                  </div>
                  <button
                    onClick={generateSections}
                    disabled={isGeneratingSections || !config.description}
                    className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingSections ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Dreaming...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>AI Suggest</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Pages Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {config.pages.map((page, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedPageIndex(i)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border whitespace-nowrap transition-all ${
                        selectedPageIndex === i
                          ? 'bg-zinc-800 border-emerald-500/40 text-white'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <span className="text-sm">{page.name}</span>
                      {config.pages.length > 1 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); removePage(i); }}
                          className="p-0.5 hover:bg-zinc-700 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </button>
                  ))}
                  <button
                    onClick={addPage}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-dashed border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-400 transition-all"
                  >
                    <span className="text-sm">+ Add Page</span>
                  </button>
                </div>

                {/* Page Name */}
                {config.pages[selectedPageIndex] && (
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-zinc-400 mb-1">Page Name</label>
                      <input
                        type="text"
                        value={config.pages[selectedPageIndex].name}
                        onChange={(e) => updatePageName(selectedPageIndex, e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-zinc-400 mb-1">Path</label>
                      <input
                        type="text"
                        value={config.pages[selectedPageIndex].path}
                        disabled
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-500 font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Section Picker */}
                {config.pages[selectedPageIndex] && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-3">
                      Sections for {config.pages[selectedPageIndex].name}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {SECTION_TYPES.map((section) => {
                        const Icon = section.icon
                        const isSelected = config.pages[selectedPageIndex].sections.includes(section.id)
                        const isRequired = section.required
                        return (
                          <button
                            key={section.id}
                            onClick={() => toggleSection(selectedPageIndex, section.id)}
                            disabled={isRequired}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                              isSelected
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                            } ${isRequired ? 'opacity-75 cursor-not-allowed' : ''}`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-xs font-medium">{section.name}</span>
                            {isSelected && <Check className="w-3 h-3 ml-auto" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Preview of selected sections */}
                {config.pages[selectedPageIndex] && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <p className="text-xs text-zinc-500 mb-2">Section Order:</p>
                    <div className="flex flex-wrap gap-1">
                      {config.pages[selectedPageIndex].sections.map((sectionId, i) => {
                        const section = SECTION_TYPES.find(s => s.id === sectionId)
                        return (
                          <span
                            key={i}
                            className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-300"
                          >
                            {i + 1}. {section?.name || sectionId}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 4: SEO */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-1">
                  <Search className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">SEO Settings</h3>
                    <p className="text-sm text-zinc-400">Optimize for search engines</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Page Title</label>
                  <input
                    type="text"
                    value={config.seoTitle}
                    onChange={(e) => updateConfig({ seoTitle: e.target.value })}
                    placeholder={config.name || 'My Website - Tagline'}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                  <p className="text-xs text-zinc-500 mt-1">{(config.seoTitle || '').length}/60 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Meta Description</label>
                  <textarea
                    value={config.seoDescription}
                    onChange={(e) => updateConfig({ seoDescription: e.target.value })}
                    placeholder="A brief description of your website for search results..."
                    rows={3}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                  />
                  <p className="text-xs text-zinc-500 mt-1">{(config.seoDescription || '').length}/160 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Keywords</label>
                  <input
                    type="text"
                    value={config.seoKeywords}
                    onChange={(e) => updateConfig({ seoKeywords: e.target.value })}
                    placeholder="consulting, business, services, startup"
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                  <p className="text-xs text-zinc-500 mt-1">Comma-separated</p>
                </div>

                {/* SEO Preview */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <p className="text-xs text-zinc-500 mb-3">Google Preview</p>
                  <div className="space-y-1">
                    <p className="text-blue-400 text-sm hover:underline cursor-pointer">
                      {config.seoTitle || config.name || 'Your Page Title'}
                    </p>
                    <p className="text-xs text-emerald-400">yoursite.com</p>
                    <p className="text-xs text-zinc-400 line-clamp-2">
                      {config.seoDescription || config.description || 'Your meta description will appear here...'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Review & Create */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-1">
                  <Check className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Review & Create</h3>
                    <p className="text-sm text-zinc-400">Everything looks good?</p>
                  </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <p className="text-xs text-zinc-500 mb-2">Project</p>
                    <p className="text-white font-medium">{config.name}</p>
                    <p className="text-xs text-zinc-400 mt-1">{SITE_TYPES.find(t => t.id === config.siteType)?.name}</p>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <p className="text-xs text-zinc-500 mb-2">Brand</p>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: config.primaryColor }} />
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: config.secondaryColor }} />
                      <span className="text-xs text-zinc-400">{config.mode} mode</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">{config.bodyFont}</p>
                  </div>
                </div>

                {/* Pages Summary */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <p className="text-xs text-zinc-500 mb-3">Site Structure ({config.pages.length} pages)</p>
                  <div className="space-y-2">
                    {config.pages.map((page, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-sm text-white">{page.name}</span>
                        <span className="text-xs text-zinc-600">{page.path}</span>
                        <span className="text-xs text-zinc-400 ml-auto">{page.sections.length} sections</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* GitHub Push Option */}
                {githubConnected && (
                  <div 
                    onClick={() => updateConfig({ pushToGithub: !config.pushToGithub })}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      config.pushToGithub
                        ? 'bg-zinc-800 border-emerald-500/40'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      config.pushToGithub ? 'bg-emerald-500/20' : 'bg-zinc-800'
                    }`}>
                      <Github className={`w-5 h-5 ${config.pushToGithub ? 'text-emerald-400' : 'text-zinc-400'}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Push to GitHub</p>
                      <p className="text-xs text-zinc-400">Create repo and push initial scaffold</p>
                    </div>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                      config.pushToGithub ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-700'
                    }`}>
                      {config.pushToGithub && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-900/30">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {step < totalSteps ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  <span>Create Project</span>
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
