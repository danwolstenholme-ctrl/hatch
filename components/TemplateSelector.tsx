'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { templates, Template, Section } from '@/lib/templates'
import Link from 'next/link'

// Interactive Header Chick for TemplateSelector
const HeaderChick = () => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  return (
    <div className="relative" ref={menuRef}>
      <motion.button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-zinc-800/50 transition-colors cursor-pointer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.span 
          className="text-2xl"
          animate={{ y: [0, -2, 0], rotate: [-2, 2, -2] }}
          transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          🐣
        </motion.span>
        <span className="text-white font-semibold hidden sm:inline">HatchIt</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-52 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden z-50"
          >
            <div className="py-1">
              <Link
                href="/"
                className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <span className="text-base">🏠</span>
                <span>Home</span>
              </Link>
              
              <Link
                href="/roadmap"
                className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <span className="text-base">🗺️</span>
                <span>Roadmap</span>
              </Link>

              <Link
                href="/vision"
                className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <span className="text-base">💡</span>
                <span>Vision</span>
              </Link>

              <Link
                href="/features"
                className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <span className="text-base">✨</span>
                <span>Features</span>
              </Link>
            </div>

            <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-800/30">
              <p className="text-xs text-zinc-500 text-center">
                🐣 HatchIt v3.0
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Suggested sections that can be added to any template
const suggestedSections: Section[] = [
  {
    id: 'cta',
    name: 'Call to Action',
    description: 'Drive conversions with a strong CTA.',
    prompt: 'What action do you want visitors to take? What\'s the benefit?',
    estimatedTime: '~20s',
    required: false,
    order: 99,
  },
  {
    id: 'contact',
    name: 'Contact Form',
    description: 'Let visitors reach out directly.',
    prompt: 'What fields do you need? Email, name, message? Any specific questions?',
    estimatedTime: '~25s',
    required: false,
    order: 99,
  },
  {
    id: 'team',
    name: 'Team Section',
    description: 'Introduce your team members.',
    prompt: 'How many team members? Names, roles, and short bios?',
    estimatedTime: '~30s',
    required: false,
    order: 99,
  },
  {
    id: 'blog-preview',
    name: 'Blog Preview',
    description: 'Showcase latest posts.',
    prompt: 'What topics do you write about? Show 3 sample post titles.',
    estimatedTime: '~25s',
    required: false,
    order: 99,
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    description: 'Capture email signups.',
    prompt: 'What do subscribers get? Weekly tips, product updates, exclusive content?',
    estimatedTime: '~20s',
    required: false,
    order: 99,
  },
  {
    id: 'stats',
    name: 'Stats/Metrics',
    description: 'Impressive numbers.',
    prompt: 'What numbers are impressive? Users, downloads, uptime, satisfaction rate?',
    estimatedTime: '~20s',
    required: false,
    order: 99,
  },
  {
    id: 'comparison',
    name: 'Comparison',
    description: 'Compare plans or competitors.',
    prompt: 'What are you comparing? Features across plans or vs competitors?',
    estimatedTime: '~30s',
    required: false,
    order: 99,
  },
  {
    id: 'gallery',
    name: 'Gallery',
    description: 'Showcase images or screenshots.',
    prompt: 'What images? Product screenshots, portfolio work, or photos?',
    estimatedTime: '~25s',
    required: false,
    order: 99,
  },
]

// Check if section is a structural element (header/footer)
const isStructuralSection = (sectionId: string) => 
  sectionId === 'header' || sectionId === 'footer'

// Structural sections that can be re-added
const structuralSections: Section[] = [
  {
    id: 'header',
    name: 'Header/Navigation',
    description: 'Logo, nav links, and CTA button.',
    prompt: 'Company/product name, main nav links (3-5), and CTA button text?',
    estimatedTime: '~20s',
    required: false,
    order: 0,
  },
  {
    id: 'footer',
    name: 'Footer',
    description: 'Navigation, legal links, and contact info.',
    prompt: 'What links and info should be in the footer? Social links, legal pages, contact?',
    estimatedTime: '~20s',
    required: false,
    order: 999,
  },
]

interface TemplateSelectorProps {
  onSelectTemplate: (template: Template, customizedSections?: Section[]) => void
}

export default function TemplateSelector({ onSelectTemplate }: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [editingSections, setEditingSections] = useState<Section[]>([])
  const [showSectionEditor, setShowSectionEditor] = useState(false)
  const [showAddSection, setShowAddSection] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)

  const handleTemplateClick = (template: Template) => {
    setSelectedTemplate(template)
    setEditingSections([...template.sections])
    setShowSectionEditor(true)
  }

  const handleStartBuilding = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate, editingSections)
    }
  }

  const handleBack = () => {
    setShowSectionEditor(false)
    setSelectedTemplate(null)
    setShowAddSection(false)
    setConfirmRemove(null)
  }

  const reorderSection = (sectionId: string, direction: 'up' | 'down') => {
    // Don't allow reordering header (always first) or footer (always last)
    if (isStructuralSection(sectionId)) return
    
    const index = editingSections.findIndex(s => s.id === sectionId)
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    // Check bounds and don't swap with header/footer
    if (targetIndex < 0 || targetIndex >= editingSections.length) return
    if (isStructuralSection(editingSections[targetIndex].id)) return

    const newSections = [...editingSections]
    ;[newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]]
    
    newSections.forEach((s, i) => s.order = i + 1)
    setEditingSections(newSections)
  }

  const handleRemoveClick = (sectionId: string) => {
    if (isStructuralSection(sectionId)) {
      setConfirmRemove(sectionId)
    } else {
      removeSection(sectionId)
    }
  }

  const removeSection = (sectionId: string) => {
    setEditingSections(prev => prev.filter(s => s.id !== sectionId))
    setConfirmRemove(null)
  }

  const addSection = (section: Section) => {
    // Header always goes first
    if (section.id === 'header') {
      setEditingSections(prev => [{ ...section, order: 0 }, ...prev])
    }
    // Footer always goes last
    else if (section.id === 'footer') {
      setEditingSections(prev => [...prev, { ...section, order: prev.length + 1 }])
    }
    // Regular sections go before footer if exists, otherwise at end
    else {
      setEditingSections(prev => {
        const footerIndex = prev.findIndex(s => s.id === 'footer')
        if (footerIndex !== -1) {
          const newSections = [...prev]
          newSections.splice(footerIndex, 0, { ...section, order: footerIndex + 1 })
          return newSections
        }
        return [...prev, { ...section, order: prev.length + 1 }]
      })
    }
    setShowAddSection(false)
  }

  // Get available sections (not already added) - include structural sections that were removed
  const availableSections = [
    ...suggestedSections.filter(s => !editingSections.some(e => e.id === s.id)),
  ]
  
  // Check if header/footer were removed
  const headerRemoved = !editingSections.some(s => s.id === 'header')
  const footerRemoved = !editingSections.some(s => s.id === 'footer')

  const requiredCount = editingSections.filter(s => s.required).length
  const optionalCount = editingSections.filter(s => !s.required).length
  const estimatedMinutes = Math.ceil(editingSections.length * 0.5)

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col relative overflow-hidden">
      {/* Sticky Header with Interactive Chick */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <HeaderChick />
          <div className="flex items-center gap-3">
            <Link 
              href="/features" 
              className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block"
            >
              Features
            </Link>
            <Link 
              href="/roadmap" 
              className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block"
            >
              Roadmap
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[120px]"
          animate={{
            x: ['-10%', '5%', '-10%'],
            y: ['-10%', '10%', '-10%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ top: '-20%', left: '-10%' }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[100px]"
          animate={{
            x: ['10%', '-5%', '10%'],
            y: ['5%', '-10%', '5%'],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ top: '30%', right: '-10%' }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full bg-blue-500/8 blur-[80px]"
          animate={{
            x: ['-5%', '10%', '-5%'],
            y: ['10%', '-5%', '10%'],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ bottom: '-10%', left: '30%' }}
        />
        {/* Subtle grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        {!showSectionEditor ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-5xl relative z-10"
          >
            <div className="text-center mb-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 }}
                className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-4"
              >
                <span className="text-emerald-400 text-sm">🐣</span>
                <span className="text-emerald-400 text-sm font-medium">Let's build something amazing</span>
              </motion.div>
              <motion.h1 
                className="text-4xl md:text-5xl font-bold text-white mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                What are you building?
              </motion.h1>
              <motion.p 
                className="text-zinc-400 text-lg max-w-xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Choose a template to get started. You can customize every section.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template, index) => (
                <motion.button
                  key={template.id}
                  onClick={() => handleTemplateClick(template)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative text-left p-5 rounded-2xl border transition-all duration-200 backdrop-blur-sm
                    ${template.isAdvanced
                      ? 'bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/30 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/80 hover:shadow-lg hover:shadow-zinc-900/50'
                    }
                  `}
                >
                  {template.isAdvanced && (
                    <div className="absolute top-3 right-3 text-[10px] bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full font-medium">
                      Advanced
                    </div>
                  )}

                  <div className="text-3xl mb-3">{template.icon}</div>

                  <h3 className="text-lg font-semibold text-white mb-1.5">
                    {template.name}
                  </h3>

                  <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
                    {template.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      {template.sections.filter(s => s.required).length} required
                    </span>
                    {template.sections.filter(s => !s.required).length > 0 && (
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
                        {template.sections.filter(s => !s.required).length} optional
                      </span>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* AI Pipeline Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-10"
            >
              <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6">
                <div className="text-center mb-5">
                  <h3 className="text-2xl font-semibold text-white mb-1">Powered by 3 AI Models</h3>
                  <p className="text-lg text-zinc-500">Working together to build production-ready code</p>
                </div>
                <div className="flex items-center justify-center gap-3 md:gap-6">
                  <motion.div 
                    className="text-center flex-1 max-w-[140px]"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="w-14 h-14 mx-auto mb-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <span className="text-2xl">⚡</span>
                    </div>
                    <div className="text-emerald-400 font-semibold text-lg">Sonnet 4</div>
                    <div className="text-base text-zinc-500">Writes code</div>
                  </motion.div>
                  
                  <div className="text-zinc-600 text-xl">→</div>
                  
                  <motion.div 
                    className="text-center flex-1 max-w-[140px]"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="w-14 h-14 mx-auto mb-2 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                      <span className="text-2xl">🐣</span>
                    </div>
                    <div className="text-violet-400 font-semibold text-lg">Opus 4</div>
                    <div className="text-base text-zinc-500">Polishes & fixes</div>
                  </motion.div>
                  
                  <div className="text-zinc-600 text-xl">→</div>
                  
                  <motion.div 
                    className="text-center flex-1 max-w-[140px]"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="w-14 h-14 mx-auto mb-2 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <span className="text-2xl">🔍</span>
                    </div>
                    <div className="text-blue-400 font-semibold text-lg">Gemini 2.5</div>
                    <div className="text-base text-zinc-500">Quality audit</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-5xl relative z-10"
          >
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={handleBack}
                className="w-10 h-10 rounded-full bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors backdrop-blur-sm border border-zinc-700/50"
              >
                ←
              </button>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedTemplate?.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedTemplate?.name}
                  </h2>
                  <p className="text-sm text-zinc-500">Customize your sections below</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl overflow-hidden">
              {/* Remove Confirmation Modal */}
              <AnimatePresence>
                {confirmRemove && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                    onClick={() => setConfirmRemove(null)}
                  >
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      onClick={e => e.stopPropagation()}
                      className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm w-full"
                    >
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Remove {confirmRemove === 'header' ? 'Header' : 'Footer'}?
                      </h3>
                      <p className="text-sm text-zinc-400 mb-4">
                        {confirmRemove === 'header' 
                          ? 'Your site won\'t have navigation or branding at the top. Visitors may find it harder to navigate.'
                          : 'Your site won\'t have footer links, contact info, or legal pages. This is unusual for most websites.'}
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setConfirmRemove(null)}
                          className="flex-1 py-2 px-4 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-sm font-medium transition-colors"
                        >
                          Keep it
                        </button>
                        <button
                          onClick={() => removeSection(confirmRemove)}
                          className="flex-1 py-2 px-4 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm font-medium transition-colors"
                        >
                          Remove anyway
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {editingSections.map((section, index) => {
                const isStructural = isStructuralSection(section.id)
                const isHeader = section.id === 'header'
                const isFooter = section.id === 'footer'
                
                return (
                  <motion.div
                    key={section.id}
                    layout
                    className={`
                      flex items-center gap-4 px-5 py-4 border-b border-zinc-800 last:border-b-0
                      ${isStructural 
                        ? isHeader 
                          ? 'bg-blue-500/10 border-l-2 border-l-blue-500' 
                          : 'bg-violet-500/10 border-l-2 border-l-violet-500'
                        : 'bg-transparent hover:bg-zinc-800/30'}
                    `}
                  >
                    {/* Reorder buttons - hidden for structural */}
                    <div className={`flex flex-col gap-1 ${isStructural ? 'opacity-0 pointer-events-none' : ''}`}>
                      <button
                        onClick={() => reorderSection(section.id, 'up')}
                        disabled={index === 0 || isStructuralSection(editingSections[index - 1]?.id)}
                        className="text-zinc-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed text-sm leading-none"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => reorderSection(section.id, 'down')}
                        disabled={index === editingSections.length - 1 || isStructuralSection(editingSections[index + 1]?.id)}
                        className="text-zinc-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed text-sm leading-none"
                      >
                        ▼
                      </button>
                    </div>

                    {/* Number badge */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium
                      ${isHeader ? 'bg-blue-500/20 text-blue-400' : isFooter ? 'bg-violet-500/20 text-violet-400' : 'bg-zinc-800 text-zinc-400'}
                    `}>
                      {isHeader ? '📌' : isFooter ? '📌' : index + 1}
                    </div>

                    {/* Section info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-medium text-white truncate">{section.name}</span>
                        {section.required && (
                          <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded shrink-0">
                            Required
                          </span>
                        )}
                        {isStructural && (
                          <span className={`text-xs px-2 py-0.5 rounded shrink-0
                            ${isHeader ? 'bg-blue-500/20 text-blue-400' : 'bg-violet-500/20 text-violet-400'}
                          `}>
                            Fixed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Remove/Skip button */}
                    <button
                      onClick={() => handleRemoveClick(section.id)}
                      className={`text-sm px-3 py-1.5 rounded transition-colors
                        ${isStructural 
                          ? 'text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10' 
                          : 'text-zinc-500 hover:text-red-400 hover:bg-red-500/10'}
                      `}
                    >
                      {section.required || isStructural ? 'Remove' : 'Skip'}
                    </button>

                    {/* Time estimate */}
                    <div className="text-sm text-zinc-600 w-14 text-right">
                      {section.estimatedTime}
                    </div>
                  </motion.div>
                )
              })}
              
              {/* Add Section Button */}
              <motion.button
                onClick={() => setShowAddSection(!showAddSection)}
                className="w-full px-5 py-4 flex items-center justify-center gap-2 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800/50 transition-colors border-t border-zinc-800"
              >
                <span className="text-lg">{showAddSection ? '−' : '+'}</span>
                <span className="text-base font-medium">{showAddSection ? 'Hide Sections' : 'Add Section'}</span>
              </motion.button>
            </div>
            
            {/* Add Section Panel - Collapsible */}
            <AnimatePresence>
              {showAddSection && (availableSections.length > 0 || headerRemoved || footerRemoved) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 bg-zinc-900/60 backdrop-blur-sm border border-emerald-500/20 rounded-xl overflow-hidden">
                    {/* Re-add structural sections */}
                    {(headerRemoved || footerRemoved) && (
                      <div className="p-4 border-b border-zinc-800">
                        <p className="text-sm text-zinc-500 mb-3">Restore structural sections:</p>
                        <div className="flex gap-3">
                          {headerRemoved && (
                            <button
                              onClick={() => addSection(structuralSections[0])}
                              className="flex-1 p-3 flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition-colors"
                            >
                              <span className="text-blue-400">📌</span>
                              <span className="text-base text-blue-400">Add Header</span>
                            </button>
                          )}
                          {footerRemoved && (
                            <button
                              onClick={() => addSection(structuralSections[1])}
                              className="flex-1 p-3 flex items-center gap-2 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 rounded-lg transition-colors"
                            >
                              <span className="text-violet-400">📌</span>
                              <span className="text-base text-violet-400">Add Footer</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Regular suggested sections */}
                    {availableSections.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
                        {availableSections.map((section) => (
                          <button
                            key={section.id}
                            onClick={() => addSection(section)}
                            className="p-4 flex flex-col items-center gap-2 text-center bg-zinc-800/30 hover:bg-emerald-500/10 hover:border-emerald-500/30 border border-transparent rounded-xl transition-colors"
                          >
                            <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-base">
                              +
                            </div>
                            <div>
                              <span className="text-base font-medium text-white block">{section.name}</span>
                              <span className="text-sm text-zinc-500">{section.estimatedTime}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">
              <span>{editingSections.length} sections</span>
              <span>~{estimatedMinutes} min</span>
            </div>

            <motion.button
              onClick={handleStartBuilding}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-shadow"
            >
              Start Building →
            </motion.button>

            <div className="mt-5 p-4 bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-xl">
              <div className="flex items-center justify-between text-sm text-zinc-500">
                <span className="flex items-center gap-2">
                  <span className="text-emerald-400">1.</span> You describe
                </span>
                <span className="text-zinc-700">→</span>
                <span className="flex items-center gap-2">
                  <span className="text-violet-400">2.</span> Sonnet builds
                </span>
                <span className="text-zinc-700">→</span>
                <span className="flex items-center gap-2">
                  <span className="text-blue-400">3.</span> Opus polishes
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  )
}

interface BuildCompleteProps {
  onDeploy: () => void
  onRunAudit: () => void
  isAuditRunning?: boolean
  auditComplete?: boolean
  auditChanges?: string[] | null
}

export function BuildComplete({
  onDeploy,
  onRunAudit,
  isAuditRunning = false,
  auditComplete = false,
  auditChanges = null,
}: BuildCompleteProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center p-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15, delay: 0.1 }}
        className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center"
      >
        <span className="text-4xl">✅</span>
      </motion.div>

      <h2 className="text-2xl font-bold text-white mb-2">All sections complete!</h2>
      <p className="text-zinc-400 mb-8">Your site is ready to deploy</p>

      {auditComplete && auditChanges && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-left"
        >
          <div className="flex items-center gap-2 text-blue-400 font-medium mb-2">
            <span>🔍</span>
            <span>Gemini Audit Complete</span>
          </div>
          {auditChanges.length > 0 ? (
            <ul className="text-sm text-zinc-300 space-y-1">
              {auditChanges.map((change, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-400">✓</span>
                  {typeof change === 'string' ? change : (change as { fix?: string }).fix || String(change)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-400">No issues found. Your code passed! 🐣</p>
          )}
        </motion.div>
      )}

      <motion.button
        onClick={onDeploy}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-shadow"
      >
        Deploy Now 🚀
      </motion.button>

      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-zinc-800" />
        <span className="text-zinc-600 text-sm">or</span>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>

      {!auditComplete && (
        <motion.button
          onClick={onRunAudit}
          disabled={isAuditRunning}
          whileHover={{ scale: isAuditRunning ? 1 : 1.02 }}
          whileTap={{ scale: isAuditRunning ? 1 : 0.98 }}
          className={`
            w-full py-4 rounded-xl border transition-all
            ${isAuditRunning
              ? 'bg-zinc-800 border-zinc-700 text-zinc-400 cursor-wait'
              : 'bg-zinc-900 border-zinc-700 text-white hover:border-blue-500/50 hover:bg-blue-500/10'
            }
          `}
        >
          {isAuditRunning ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                🔍
              </motion.span>
              Running audit...
            </span>
          ) : (
            <span className="flex flex-col items-center">
              <span className="flex items-center gap-2 font-semibold">
                <span>🔍</span>
                Run final audit
              </span>
              <span className="text-xs text-zinc-500 mt-1">
                A different AI checks accessibility, performance, and consistency
              </span>
            </span>
          )}
        </motion.button>
      )}
    </motion.div>
  )
}