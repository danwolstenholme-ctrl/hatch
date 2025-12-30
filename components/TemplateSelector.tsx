'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { templates, Template, Section } from '@/lib/templates'
import Navigation from './Navigation'
import HatchCharacter from './HatchCharacter'

// Hatch's questions to help build the site structure
interface HatchQuestion {
  id: string
  question: string
  section: Section
  emoji: string
}

const hatchQuestions: HatchQuestion[] = [
  {
    id: 'hero',
    question: "Primary Interface Module required. Initialize Hero Section?",
    emoji: "⚡",
    section: {
      id: 'hero',
      name: 'Hero Section',
      description: 'Your main headline, value prop, and primary call-to-action.',
      prompt: 'What do you do and who is it for? What action should visitors take?',
      estimatedTime: '~30s',
      required: false,
      order: 2,
    }
  },
  {
    id: 'services',
    question: "Service Matrix Module available. Integrate Capabilities Display?",
    emoji: "🛠️",
    section: {
      id: 'services',
      name: 'Services/What We Do',
      description: 'Showcase your core offerings or capabilities.',
      prompt: 'What are your 3-4 main services or offerings?',
      estimatedTime: '~30s',
      required: false,
      order: 3,
    }
  },
  {
    id: 'about',
    question: "Identity Verification Module. Establish Entity Trust?",
    emoji: "🆔",
    section: {
      id: 'about',
      name: 'About/Story',
      description: 'Who you are, your mission, or company background.',
      prompt: 'Tell your story. What makes you different?',
      estimatedTime: '~30s',
      required: false,
      order: 4,
    }
  },
  {
    id: 'work',
    question: "Portfolio Database Module. Display Operational History?",
    emoji: "📂",
    section: {
      id: 'work',
      name: 'Work/Portfolio',
      description: 'Showcase past projects, clients, or results.',
      prompt: 'Any projects, clients, or results to highlight?',
      estimatedTime: '~30s',
      required: false,
      order: 5,
    }
  },
  {
    id: 'testimonials',
    question: "Social Proof Algorithms. Integrate User Validation?",
    emoji: "⭐",
    section: {
      id: 'testimonials',
      name: 'Testimonials',
      description: 'Social proof from happy clients or customers.',
      prompt: 'Any quotes or testimonials from clients?',
      estimatedTime: '~25s',
      required: false,
      order: 6,
    }
  },
  {
    id: 'stats',
    question: "Metrics Visualization Module. Display Performance Data?",
    emoji: "📊",
    section: {
      id: 'stats',
      name: 'Stats/Metrics',
      description: 'Key numbers that build credibility.',
      prompt: 'Any impressive numbers? Revenue, clients, years, etc.',
      estimatedTime: '~20s',
      required: false,
      order: 7,
    }
  },
  {
    id: 'cta',
    question: "Conversion Optimization Module. Initialize Final CTA?",
    emoji: "🎯",
    section: {
      id: 'cta',
      name: 'Call to Action',
      description: 'Final push to convert visitors.',
      prompt: 'What action do you want visitors to take?',
      estimatedTime: '~20s',
      required: false,
      order: 8,
    }
  },
  {
    id: 'contact',
    question: "Communication Uplink Module. Enable User Input?",
    emoji: "📡",
    section: {
      id: 'contact',
      name: 'Contact Form',
      description: 'Let visitors reach out directly.',
      prompt: 'What fields do you need? Email, name, message?',
      estimatedTime: '~25s',
      required: false,
      order: 9,
    }
  },
]

// Fixed sections that are always included
const fixedSections: Section[] = [
  {
    id: 'header',
    name: 'Header/Navigation',
    description: 'Logo, nav links, and CTA button.',
    prompt: 'Company/product name, main nav links (3-5), and CTA button text?',
    estimatedTime: '~20s',
    required: true,
    order: 0,
  },
  {
    id: 'footer',
    name: 'Footer',
    description: 'Navigation, legal links, and contact info.',
    prompt: 'What links and info should be in the footer? Social links, legal pages, contact?',
    estimatedTime: '~20s',
    required: true,
    order: 999,
  },
]

interface TemplateSelectorProps {
  onSelectTemplate: (template: Template, customizedSections?: Section[]) => void
}

// Hatch tips for when clicked
const hatchTips = [
  "Modular architecture allows for post-initialization reconfiguration.",
  "Recommendation: Begin with core systems. Expand complexity iteratively.",
  "Optimal configuration detected: 4-6 active modules.",
  "Hero + CTA Modules = Maximum Conversion Efficiency.",
  "Affirmative selection recommended. Redundancy can be pruned later.",
  "System confidence: High. Proceed with architecture.",
  "Efficiency Protocol: Prioritize signal over noise.",
  "User Experience Optimization: Maintain focus.",
]

export default function TemplateSelector({ onSelectTemplate }: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showSectionEditor, setShowSectionEditor] = useState(false)
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null)
  
  // Hatch conversation state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedSections, setSelectedSections] = useState<Section[]>([])
  const [isAsking, setIsAsking] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [hatchTip, setHatchTip] = useState<string | null>(null)
  const [canShowTip, setCanShowTip] = useState(true)

  const handleHatchClick = () => {
    if (!canShowTip) return // Cooldown active
    
    const randomTip = hatchTips[Math.floor(Math.random() * hatchTips.length)]
    setHatchTip(randomTip)
    setCanShowTip(false)
    
    // Hide tip after 3s
    setTimeout(() => setHatchTip(null), 3000)
    // Allow new tip after 6s
    setTimeout(() => setCanShowTip(true), 6000)
  }

  const handleTemplateClick = (template: Template) => {
    setSelectedTemplate(template)
    // Start with just fixed sections (header + footer)
    setSelectedSections([...fixedSections])
    setCurrentQuestionIndex(0)
    
    // For advanced/custom templates, skip Q&A and go straight to branding
    if (template.isAdvanced) {
      // Just pass through with default sections (header + footer)
      const orderedSections = [...fixedSections].map((s, i) => ({ ...s, order: i }))
      onSelectTemplate(template, orderedSections)
      return
    }
    
    setIsAsking(true)
    setShowSummary(false)
    setShowSectionEditor(true)
  }

  const handleAnswer = (addSection: boolean) => {
    if (addSection) {
      const question = hatchQuestions[currentQuestionIndex]
      // Insert before footer
      setSelectedSections(prev => {
        const footerIndex = prev.findIndex(s => s.id === 'footer')
        const newSections = [...prev]
        newSections.splice(footerIndex, 0, { ...question.section, order: footerIndex + 1 })
        return newSections
      })
    }
    
    setTimeout(() => {
      if (currentQuestionIndex < hatchQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1)
      } else {
        setIsAsking(false)
        setShowSummary(true)
      }
    }, 300)
  }

  const handleSkipQuestions = () => {
    setIsAsking(false)
    setShowSummary(true)
  }

  const handleStartBuilding = () => {
    if (selectedTemplate) {
      // Reorder sections properly
      const orderedSections = selectedSections.map((s, i) => ({ ...s, order: i }))
      onSelectTemplate(selectedTemplate, orderedSections)
    }
  }

  const handleBack = () => {
    setShowSectionEditor(false)
    setSelectedTemplate(null)
    setIsAsking(false)
    setShowSummary(false)
    setCurrentQuestionIndex(0)
    setSelectedSections([])
  }

  const toggleSection = (section: Section) => {
    const exists = selectedSections.some(s => s.id === section.id)
    if (exists) {
      setSelectedSections(prev => prev.filter(s => s.id !== section.id))
    } else {
      // Insert before footer
      setSelectedSections(prev => {
        const footerIndex = prev.findIndex(s => s.id === 'footer')
        const newSections = [...prev]
        newSections.splice(footerIndex, 0, section)
        return newSections
      })
    }
  }

  const currentQuestion = hatchQuestions[currentQuestionIndex]
  const estimatedMinutes = Math.ceil(selectedSections.length * 0.5)

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col relative overflow-hidden">
      <Navigation />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {/* Animated gradient background - simplified on mobile for performance */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Static gradient on mobile, animated on desktop */}
        <div className="md:hidden absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-violet-500/10" />
        {/* Gradient orbs - desktop only */}
        <motion.div
          className="hidden md:block absolute w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[120px]"
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
          className="hidden md:block absolute w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[100px]"
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
          className="hidden md:block absolute w-[400px] h-[400px] rounded-full bg-cyan-500/8 blur-[80px]"
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
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-5xl relative z-10"
          >
            <div className="text-center mb-8 md:mb-10">
              <div className="mb-3 md:mb-4">
                <div className="hidden md:block"><HatchCharacter state="excited" size="lg" /></div>
                <div className="md:hidden"><HatchCharacter state="excited" size="md" /></div>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4 px-2">
                Initialize Project Sequence
              </h1>
              <p className="text-zinc-400 text-lg max-w-xl mx-auto">
                Select a structural blueprint. All parameters are mutable.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {templates.map((template) => {
                const isExpanded = expandedTemplate === template.id
                return (
                  <div
                    key={template.id}
                    className={`
                      relative rounded-2xl border transition-all duration-200 backdrop-blur-sm overflow-hidden
                      ${template.isAdvanced
                        ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30 sm:col-span-2'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-600'
                      }
                    `}
                  >
                    {/* Main clickable area */}
                    <button
                      onClick={() => handleTemplateClick(template)}
                      className={`w-full text-left p-5 hover:bg-white/5 transition-colors ${
                        template.isAdvanced ? 'flex items-start gap-6' : ''
                      }`}
                    >
                      {template.isAdvanced && (
                        <div className="absolute top-3 right-3 text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                          Pro
                        </div>
                      )}

                      <div className={template.isAdvanced ? 'text-5xl pt-1' : 'text-3xl mb-3'}>{template.icon}</div>

                      <div className={template.isAdvanced ? 'flex-1' : ''}>
                        <h3 className={`font-semibold text-white mb-1.5 ${template.isAdvanced ? 'text-xl' : 'text-lg'}`}>
                          {template.name}
                        </h3>

                        <p className={`text-zinc-400 mb-3 ${template.isAdvanced ? 'text-sm' : 'text-sm line-clamp-2'}`}>
                          {template.description}
                        </p>

                        {/* Custom template extra info */}
                        {template.isAdvanced && (
                          <div className="flex flex-wrap gap-3 mb-4 text-xs text-zinc-500">
                            <span className="flex items-center gap-1.5">
                              <span className="text-emerald-400">✓</span> Choose any sections
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span className="text-emerald-400">✓</span> Reorder freely
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span className="text-emerald-400">✓</span> No hand-holding
                            </span>
                          </div>
                        )}

                        {/* Metadata badges */}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full leading-none ${
                            template.pageType === 'one-page' 
                              ? 'bg-green-500/20 text-green-400' 
                              : template.pageType === 'multi-page'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            <span>{template.pageType === 'one-page' ? '📄' : template.pageType === 'multi-page' ? '📑' : '⚡'}</span>
                            <span>{template.pageType === 'one-page' ? 'One Page' : template.pageType === 'multi-page' ? 'Multi-Page' : 'Flexible'}</span>
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-zinc-800 text-zinc-400 leading-none">
                            <span>⏱️</span>
                            <span>{template.estimatedBuildTime}</span>
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Expand button - hide for advanced/custom */}
                    {!template.isAdvanced && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setExpandedTemplate(isExpanded ? null : template.id)
                        }}
                        className="w-full px-5 py-2 border-t border-zinc-800/50 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30 transition-colors flex items-center justify-center gap-1"
                      >
                        <span>{isExpanded ? 'Hide Data' : 'Requirements'}</span>
                        <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                      </button>
                    )}

                    {/* Expanded info - hide for advanced/custom */}
                    <AnimatePresence>
                      {isExpanded && !template.isAdvanced && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-zinc-800/50"
                        >
                          <div className="p-4 bg-zinc-900/50 space-y-4">
                            {/* What you'll need */}
                            <div>
                              <h4 className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Required Assets:</h4>
                              <ul className="space-y-1">
                                {template.whatYouNeed.map((item, i) => (
                                  <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                                    <span className="text-emerald-400 mt-0.5">•</span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Best for */}
                            <div>
                              <h4 className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Optimal Use Case:</h4>
                              <div className="flex flex-wrap gap-1">
                                {template.bestFor.map((item, i) => (
                                  <span key={i} className="text-xs px-2 py-1 bg-zinc-800 text-zinc-300 rounded">
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Start button in expanded */}
                            <button
                              onClick={() => handleTemplateClick(template)}
                              className="w-full py-2 rounded-lg bg-emerald-500/20 text-emerald-400 font-medium text-sm hover:bg-emerald-500/30 transition-colors"
                            >
                              Initialize {template.name} →
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>

            {/* AI Pipeline Section */}
            <div className="mt-10">
              <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-4 md:p-6">
                <div className="text-center mb-4 md:mb-5">
                  <h3 className="text-xl md:text-2xl font-semibold text-white mb-1">Multi-Model Synthesis Active</h3>
                  <p className="text-base md:text-lg text-zinc-500">Collaborative Intelligence Grid Online</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <motion.div 
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <span className="text-lg md:text-xl">🎨</span>
                    </div>
                    <div className="text-emerald-400 font-semibold text-sm md:text-base">Gemini Flash</div>
                    <div className="text-xs md:text-sm text-zinc-500">Logo design</div>
                  </motion.div>
                  
                  <motion.div 
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                      <span className="text-lg md:text-xl">⚡</span>
                    </div>
                    <div className="text-teal-400 font-semibold text-sm md:text-base">Sonnet 4</div>
                    <div className="text-xs md:text-sm text-zinc-500">Writes code</div>
                  </motion.div>
                  
                  <motion.div 
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                      <span className="text-lg md:text-xl">✨</span>
                    </div>
                    <div className="text-cyan-400 font-semibold text-sm md:text-base">Opus 4</div>
                    <div className="text-xs md:text-sm text-zinc-500">Polishes & fixes</div>
                  </motion.div>
                  
                  <motion.div 
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                      <span className="text-lg md:text-xl">🔍</span>
                    </div>
                    <div className="text-sky-400 font-semibold text-sm md:text-base">Gemini Pro</div>
                    <div className="text-xs md:text-sm text-zinc-500">Quality audit</div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl relative z-10"
          >
            {/* Back button and title */}
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
                  <p className="text-sm text-zinc-500">Architecting System Structure</p>
                </div>
              </div>
            </div>

            {/* Hatch Conversation Mode */}
            {isAsking && currentQuestion && (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 md:p-8"
              >
                {/* Clickable Hatch character - hide for custom/advanced builds */}
                {!selectedTemplate?.isAdvanced && (
                  <div className="flex items-center justify-center mb-6 gap-4">
                    <motion.button
                      onClick={handleHatchClick}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="cursor-pointer relative"
                      title="Access System Data"
                    >
                      <HatchCharacter state="excited" size="lg" />
                    </motion.button>
                    
                    {/* Speech bubble tip - to the right */}
                    <AnimatePresence>
                      {hatchTip && (
                        <motion.div
                          initial={{ opacity: 0, x: -10, scale: 0.9 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: -10, scale: 0.9 }}
                          className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-4 py-2 text-sm text-emerald-300 max-w-[200px] text-left relative"
                        >
                          <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-3 h-3 bg-emerald-500/20 border-l border-b border-emerald-500/30 rotate-45" />
                          {hatchTip}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Question */}
                <div className="text-center mb-8">
                  <p className="text-xl md:text-2xl text-white font-medium">
                    {currentQuestion.question}
                  </p>
                  <p className="text-sm text-zinc-500 mt-2">
                    {currentQuestion.section.description}
                  </p>
                </div>

                {/* Answer buttons - full width on mobile for better touch targets */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(true)}
                    className="w-full sm:w-auto px-8 py-4 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-lg shadow-lg shadow-emerald-500/20 active:shadow-emerald-500/40 min-h-[48px]"
                  >
                    Confirm Module
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(false)}
                    className="w-full sm:w-auto px-8 py-4 sm:py-3 rounded-xl bg-zinc-800 text-zinc-300 font-medium text-lg hover:bg-zinc-700 active:bg-zinc-600 min-h-[48px]"
                  >
                    Bypass
                  </motion.button>
                </div>

                {/* Progress and skip all */}
                <div className="mt-8 flex items-center justify-between text-sm text-zinc-500">
                  <span>Question {currentQuestionIndex + 1} of {hatchQuestions.length}</span>
                  <button 
                    onClick={handleSkipQuestions}
                    className="text-zinc-500 hover:text-white transition-colors"
                  >
                    Skip remaining →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Summary / Edit Mode */}
            {showSummary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Hatch celebration - hide for custom/advanced builds */}
                {!selectedTemplate?.isAdvanced && (
                  <div className="text-center mb-4">
                    <HatchCharacter state="excited" size="md" />
                    <p className="text-lg text-zinc-300 mt-2">
                      System Architecture Generated.
                    </p>
                  </div>
                )}

                {/* Current sections */}
                <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-800/50">
                    <span className="text-sm text-zinc-400">Active Modules ({selectedSections.length})</span>
                  </div>
                  {selectedSections.map((section) => {
                    const isFixed = section.id === 'header' || section.id === 'footer'
                    return (
                      <div
                        key={section.id}
                        className={`flex items-center justify-between px-5 py-3 border-b border-zinc-800/50 last:border-b-0 ${
                          isFixed ? 'bg-emerald-500/5' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isFixed && <span className="text-emerald-400">📌</span>}
                          <span className="text-white font-medium">{section.name}</span>
                          {isFixed && (
                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                              Fixed
                            </span>
                          )}
                        </div>
                        {!isFixed && (
                          <button
                            onClick={() => toggleSection(section)}
                            className="text-sm text-zinc-500 hover:text-red-400 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Add more sections */}
                <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-4">
                  <p className="text-sm text-zinc-400 mb-3">Available Modules:</p>
                  <div className="flex flex-wrap gap-2">
                    {hatchQuestions
                      .filter(q => !selectedSections.some(s => s.id === q.id))
                      .map(q => (
                        <button
                          key={q.id}
                          onClick={() => toggleSection(q.section)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-emerald-500/20 text-zinc-300 hover:text-white text-sm transition-colors"
                        >
                          <span>{q.emoji}</span>
                          <span>{q.section.name}</span>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Stats and start button */}
                <div className="flex items-center justify-between text-sm text-zinc-500">
                  <span>{selectedSections.length} sections</span>
                  <span>Est. Compilation: {estimatedMinutes}m</span>
                </div>

                <motion.button
                  onClick={handleStartBuilding}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 active:shadow-emerald-500/30 transition-shadow min-h-[56px]"
                >
                  Execute Build Sequence →
                </motion.button>
              </motion.div>
            )}
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

      <h2 className="text-2xl font-bold text-white mb-2">System Architecture Finalized.</h2>
      <p className="text-zinc-400 mb-8">Deployment Protocols Ready.</p>

      {auditComplete && auditChanges && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-sky-500/10 border border-sky-500/30 rounded-xl text-left"
        >
          <div className="flex items-center gap-2 text-sky-400 font-medium mb-2">
            <span>🔍</span>
            <span>Gemini Audit Complete</span>
          </div>
          {auditChanges.length > 0 ? (
            <ul className="text-sm text-zinc-300 space-y-1">
              {auditChanges.map((change, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-sky-400">✓</span>
                  {typeof change === 'string' ? change : (change as { fix?: string }).fix || String(change)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-400">No issues found. System optimized. 🟢</p>
          )}
        </motion.div>
      )}

      <motion.button
        onClick={onDeploy}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-shadow"
      >
        Initiate Deployment Sequence 🚀
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
              : 'bg-zinc-900 border-zinc-700 text-white hover:border-sky-500/50 hover:bg-sky-500/10'
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
                Execute System Audit
              </span>
              <span className="text-xs text-zinc-500 mt-1">
                Heuristic Analysis Protocol
              </span>
            </span>
          )}
        </motion.button>
      )}
    </motion.div>
  )
}
