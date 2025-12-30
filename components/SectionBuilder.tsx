'use client'

/* eslint-disable react/no-unescaped-entities */

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  Wand2, 
  Send, 
  RefreshCw, 
  Check, 
  Copy, 
  Code, 
  Maximize2, 
  Minimize2, 
  MessageSquare, 
  Zap,
  Cpu,
  Hammer,
  Terminal,
  Eye,
  Edit3,
  Bot,
  Layers,
  ChevronRight,
  Play,
  CheckCircle2,
  X,
  MousePointer2,
  Trash2,
  CopyPlus,
  Info
} from 'lucide-react'

// Suggestions based on section type
const getSuggestions = (id: string) => {
  switch(id) {
    case 'hero': return ['Modern & Minimal', 'Bold Typography', 'With Video Background', 'Dark Mode Aesthetic'];
    case 'features': return ['Grid Layout', 'Alternating Side-by-Side', 'With Icons', 'Glassmorphism Cards'];
    case 'testimonials': return ['Carousel Slider', 'Masonry Grid', 'Minimalist Quotes', 'With Avatars'];
    case 'contact': return ['Simple Form', 'With Map', 'Split Layout', 'Floating Card'];
    case 'pricing': return ['3-Tier Cards', 'Comparison Table', 'Simple List', 'Highlighted Preferred Option'];
    case 'faq': return ['Accordion Style', 'Grid Layout', 'Simple List', 'Categorized'];
    default: return ['Modern Style', 'Minimalist', 'Bold & Colorful', 'Professional', 'High Contrast'];
  }
}

import { Section } from '@/lib/templates'
import { DbSection } from '@/lib/supabase'
import { SectionCompleteIndicator } from './SectionProgress'
import SectionPreview from './SectionPreview'
import { BrandConfig } from './BrandingStep'
import HatchCharacter, { HatchState } from './HatchCharacter'
import { useSubscription } from '@/contexts/SubscriptionContext'
import ThinkingLog from './ThinkingLog'
import VoiceInput from './VoiceInput'

// =============================================================================
// SECTION BUILDER
// The actual interface for building one section at a time
// Now with opt-in Opus refinement (not automatic)
// =============================================================================

interface SectionBuilderProps {
  section: Section
  dbSection: DbSection
  projectId: string
  onComplete: (code: string, refined: boolean, refinementChanges?: string[]) => void
  onNextSection: () => void // Navigate to next section
  isLastSection?: boolean // Hide "Next" on last section
  allSectionsCode: Record<string, string> // For preview context
  demoMode?: boolean // Local testing without API
  brandConfig?: BrandConfig | null // Brand styling from branding step
  isPaid?: boolean // Whether project is hatched (paid)
  onShowHatchModal?: () => void // Show paywall modal
}

type BuildStage = 'input' | 'generating' | 'refining' | 'complete'

// Contact form handling instructions
const ContactFormInstructions = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl"
  >
    <div className="flex items-start gap-3">
      <span className="text-xl">📬</span>
      <div>
        <h4 className="text-sm font-semibold text-blue-400 mb-2">Contact Form Setup</h4>
        <p className="text-xs text-zinc-400 mb-3">
          Your contact form is ready! Here's how to handle enquiries:
        </p>
        <ul className="text-xs text-zinc-400 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-400">1.</span>
            <span>Form submissions will be sent to your configured email or webhook endpoint</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">2.</span>
            <span>Add your email in the deployment settings, or integrate with Formspree/Netlify Forms</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">3.</span>
            <span>For custom handling, set up a serverless function at <code className="text-blue-300">/api/contact</code></span>
          </li>
        </ul>
        <a 
          href="https://formspree.io" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-3 text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          Learn more about form handling →
        </a>
      </div>
    </div>
  </motion.div>
)

// Demo mode mock code generator
const generateMockCode = (sectionType: string, sectionName: string, userPrompt: string): string => {
  return `{/* ${sectionName} Section */}
<section className="py-20 px-6 bg-zinc-950">
  <div className="max-w-6xl mx-auto">
    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
      ${sectionName}
    </h2>
    <p className="text-xl text-zinc-400 max-w-2xl">
      ${userPrompt.slice(0, 200)}${userPrompt.length > 200 ? '...' : ''}
    </p>
    <div className="mt-10 grid md:grid-cols-3 gap-6">
      <div className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800">
        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
          <span className="text-2xl">🐣</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Feature One</h3>
        <p className="text-zinc-400 text-sm">Demo content for ${sectionType}</p>
      </div>
      <div className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800">
        <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center mb-4">
          <span className="text-2xl">🚀</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Feature Two</h3>
        <p className="text-zinc-400 text-sm">Placeholder for your content</p>
      </div>
      <div className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800">
        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
          <span className="text-2xl">💡</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Feature Three</h3>
        <p className="text-zinc-400 text-sm">AI will generate real content</p>
      </div>
    </div>
  </div>
</section>`
}

// Brand Quick Reference - Shows current brand settings in the builder
function BrandQuickReference({ brandConfig }: { brandConfig: BrandConfig }) {
  const [expanded, setExpanded] = useState(false)
  
  return (
    <motion.div 
      className="mt-4 bg-zinc-800/50 border border-zinc-700/50 rounded-xl overflow-hidden"
      initial={false}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-zinc-800/80 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">🎨</span>
          <span className="text-xs font-medium text-zinc-300">
            {brandConfig.brandName}
          </span>
          {/* Color dots preview */}
          <div className="flex items-center gap-1 ml-2">
            <span 
              className="w-3 h-3 rounded-full border border-white/20" 
              style={{ backgroundColor: brandConfig.colors.primary }}
              title="Primary"
            />
            <span 
              className="w-3 h-3 rounded-full border border-white/20" 
              style={{ backgroundColor: brandConfig.colors.secondary }}
              title="Secondary"
            />
            <span 
              className="w-3 h-3 rounded-full border border-white/20" 
              style={{ backgroundColor: brandConfig.colors.accent }}
              title="Accent"
            />
          </div>
        </div>
        <motion.span 
          animate={{ rotate: expanded ? 180 : 0 }}
          className="text-zinc-500 text-xs"
        >
          ▼
        </motion.span>
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-zinc-700/50"
          >
            <div className="px-3 py-3 space-y-3 text-xs">
              {/* Brand Name & Tagline */}
              <div>
                <span className="text-zinc-500">Brand:</span>
                <p className="text-white font-medium">{brandConfig.brandName}</p>
                {brandConfig.tagline && (
                  <p className="text-zinc-400 italic">"{brandConfig.tagline}"</p>
                )}
              </div>
              
              {/* Colors */}
              <div>
                <span className="text-zinc-500 block mb-1.5">Colors:</span>
                <div className="flex gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-zinc-900/50 px-2 py-1 rounded">
                    <span 
                      className="w-4 h-4 rounded border border-white/20" 
                      style={{ backgroundColor: brandConfig.colors.primary }}
                    />
                    <span className="text-zinc-300">Primary</span>
                    <span className="text-zinc-500 font-mono text-[10px]">{brandConfig.colors.primary}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-zinc-900/50 px-2 py-1 rounded">
                    <span 
                      className="w-4 h-4 rounded border border-white/20" 
                      style={{ backgroundColor: brandConfig.colors.secondary }}
                    />
                    <span className="text-zinc-300">Secondary</span>
                    <span className="text-zinc-500 font-mono text-[10px]">{brandConfig.colors.secondary}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-zinc-900/50 px-2 py-1 rounded">
                    <span 
                      className="w-4 h-4 rounded border border-white/20" 
                      style={{ backgroundColor: brandConfig.colors.accent }}
                    />
                    <span className="text-zinc-300">Accent</span>
                    <span className="text-zinc-500 font-mono text-[10px]">{brandConfig.colors.accent}</span>
                  </div>
                </div>
              </div>
              
              {/* Style & Font */}
              <div className="flex gap-4">
                <div>
                  <span className="text-zinc-500">Style:</span>
                  <p className="text-zinc-300 capitalize">{brandConfig.styleVibe}</p>
                </div>
                <div>
                  <span className="text-zinc-500">Font:</span>
                  <p className="text-zinc-300 capitalize">{brandConfig.fontStyle}</p>
                </div>
              </div>
              
              {/* Logo */}
              {brandConfig.logoUrl && (
                <div>
                  <span className="text-zinc-500 block mb-1">Logo:</span>
                  <div className="w-10 h-10 bg-zinc-900 rounded-lg overflow-hidden relative">
                    <Image 
                      src={brandConfig.logoUrl} 
                      alt="Brand logo" 
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              )}
              
              {/* AI Notice */}
              <div className="pt-2 border-t border-zinc-700/50">
                <p className="text-zinc-500 flex items-center gap-1">
                  <span>✨</span>
                  AI will use these settings when building sections
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function SectionBuilder({
  section,
  dbSection,
  projectId,
  onComplete,
  onNextSection,
  isLastSection = false,
  allSectionsCode,
  demoMode = false,
  brandConfig = null,
  isPaid = false,
  onShowHatchModal,
}: SectionBuilderProps) {
  const [prompt, setPrompt] = useState(dbSection.user_prompt || '')
  const [stage, setStage] = useState<BuildStage>(
    dbSection.status === 'complete' ? 'complete' : 'input'
  )
  const [generatedCode, setGeneratedCode] = useState(dbSection.code || '')
  const [streamingCode, setStreamingCode] = useState('') // For real-time display
  const [reasoning, setReasoning] = useState('') // AI's design reasoning
  const [refined, setRefined] = useState(dbSection.refined)
  const [refinementChanges, setRefinementChanges] = useState<string[]>(
    dbSection.refinement_changes || []
  )
  const [error, setError] = useState<string | null>(null)
  const [showCode, setShowCode] = useState(false)
  const [copied, setCopied] = useState(false)
  const [refinePrompt, setRefinePrompt] = useState('')
  const [isUserRefining, setIsUserRefining] = useState(false)
  const [isOpusPolishing, setIsOpusPolishing] = useState(false) // Opt-in Opus polish
  const [isSelfHealing, setIsSelfHealing] = useState(false) // Auto-fix runtime errors
  const [hasSelfHealed, setHasSelfHealed] = useState(false) // Prevent infinite loops
  const [expandedPreview, setExpandedPreview] = useState(false) // Expand preview on desktop
  const [mobileTab, setMobileTab] = useState<'input' | 'preview'>('input') // Mobile tab state
  const [inspectorMode, setInspectorMode] = useState(false) // Visual element selector
  const [selectedElement, setSelectedElement] = useState<{ tagName: string; text: string; className: string } | null>(null)
  const [hudTab, setHudTab] = useState<'styles' | 'animate' | 'explain'>('styles') // Style HUD tab state
  const [explanation, setExplanation] = useState<string | null>(null)
  const [isExplaining, setIsExplaining] = useState(false)
  
  // Inline Code Editing
  const [editingLineIndex, setEditingLineIndex] = useState<number | null>(null)
  const [editingLineContent, setEditingLineContent] = useState('')
  
  // Get subscription info for Opus credits
  const { tier, subscription } = useSubscription()
  const opusCreditsUsed = (typeof window !== 'undefined' && subscription) 
    ? (window as unknown as { __opusUsed?: number }).__opusUsed || 0 
    : 0
  const opusCreditsRemaining = tier === 'agency' ? '∞' : Math.max(0, 30 - opusCreditsUsed)
  
  // Prompt Helper (Hatch) state
  const [showPromptHelper, setShowPromptHelper] = useState(false)
  const [helperMessages, setHelperMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([])
  const [helperInput, setHelperInput] = useState('')
  const [isHelperLoading, setIsHelperLoading] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null)
  const [hatchState, setHatchState] = useState<HatchState>('idle')
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const codeEndRef = useRef<HTMLDivElement>(null)
  const helperInputRef = useRef<HTMLInputElement>(null)
  const helperChatRef = useRef<HTMLDivElement>(null)

  // Self-healing: Automatically fix runtime errors detected in preview
  const handleRuntimeError = async (errorMsg: string) => {
    // Only attempt self-healing once per generation to avoid loops
    if (isSelfHealing || hasSelfHealed || !generatedCode) return
    
    console.log('Attempting self-healing for error:', errorMsg)
    setIsSelfHealing(true)
    
    try {
      const response = await fetch('/api/refine-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: dbSection.id,
          code: generatedCode,
          sectionType: section.id,
          sectionName: section.name,
          userPrompt: prompt,
          refineRequest: `FIX RUNTIME ERROR: ${errorMsg}. The previous code crashed with this error. Please fix the React component so it renders correctly without errors. Do not change the design, just fix the crash.`,
        }),
      })

      if (!response.ok) throw new Error('Self-healing failed')

      const { code: fixedCode, changes } = await response.json()
      
      setGeneratedCode(fixedCode)
      setRefinementChanges(prev => [...prev, `Auto-fixed crash: ${errorMsg.slice(0, 30)}...`])
      setHasSelfHealed(true)
      onComplete(fixedCode, true, [...refinementChanges, `Auto-fixed crash: ${errorMsg.slice(0, 30)}...`])
      
    } catch (err) {
      console.error('Self-healing failed:', err)
    } finally {
      setIsSelfHealing(false)
    }
  }

  // Handle element selection from inspector
  const handleElementSelect = (element: { tagName: string; text: string; className: string }) => {
    setSelectedElement(element)
    setInspectorMode(false) // Turn off inspector after selection
    setExplanation(null) // Reset explanation
    // Focus refine input
    setTimeout(() => {
      const input = document.querySelector('input[placeholder*="Refinement Directive"]') as HTMLInputElement
      if (input) input.focus()
    }, 100)
  }

  // Handle inline code editing
  const handleSaveLine = (index: number) => {
    if (!generatedCode) return
    const lines = generatedCode.split('\n')
    lines[index] = editingLineContent
    const newCode = lines.join('\n')
    setGeneratedCode(newCode)
    setEditingLineIndex(null)
    // Update parent/DB without triggering a full rebuild
    onComplete(newCode, refined, refinementChanges)
  }

  const handleExplainElement = async () => {
    if (!selectedElement) return
    setIsExplaining(true)
    setExplanation(null)
    
    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Mock explanation for now - in a real app this would call an API
    const explanations = [
      `I used a <${selectedElement.tagName}> here to ensure semantic validity. The class "${selectedElement.className.split(' ')[0]}..." provides the core structure.`,
      `This element is styled with Tailwind utility classes for maximum flexibility. The spacing ensures good readability on mobile devices.`,
      `I applied these specific styles to match your brand's "Modern" aesthetic. The contrast ratio meets WCAG AA standards.`
    ]
    setExplanation(explanations[Math.floor(Math.random() * explanations.length)])
    setIsExplaining(false)
  }

  const handleCopyCode = () => {
    // Paywall: only paid users can copy code
    if (!isPaid) {
      onShowHatchModal?.()
      return
    }
    const codeToCopy = streamingCode || generatedCode
    if (codeToCopy) {
      navigator.clipboard.writeText(codeToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Paywall: only paid users can view full code
  const handleViewCode = () => {
    if (!isPaid) {
      onShowHatchModal?.()
      return
    }
    setShowCode(!showCode)
  }

  // Auto-focus textarea on mount
  useEffect(() => {
    if (stage === 'input' && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [stage, section.id])

  // Reset when section changes - intentionally only depends on dbSection.id
  // We read the current dbSection values inside the effect, not as reactive deps
  useEffect(() => {
    setPrompt(dbSection.user_prompt || '')
    setStage(dbSection.status === 'complete' ? 'complete' : 'input')
    setGeneratedCode(dbSection.code || '')
    setRefined(dbSection.refined)
    setRefinementChanges(dbSection.refinement_changes || [])
    setError(null)
    setRefinePrompt('')
    setIsUserRefining(false)
    // Reset prompt helper
    setShowPromptHelper(false)
    setHelperMessages([])
    setHelperInput('')
    setGeneratedPrompt(null)
    setHatchState('idle')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbSection.id]) // Only reset when switching to a different section

  // Auto-resize textarea to fit content
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    
    // Reset height to recalculate
    textarea.style.height = 'auto'
    // Set to scroll height but cap at max for very long content
    const maxHeight = 400
    const newHeight = Math.min(textarea.scrollHeight, maxHeight)
    textarea.style.height = `${Math.max(newHeight, 200)}px`
    // Show scrollbar if content exceeds max
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [prompt])

  // Initialize prompt helper with first message from Hatch
  const initializePromptHelper = async () => {
    setShowPromptHelper(true)
    setHelperMessages([])
    setGeneratedPrompt(null)
    setHatchState('excited')
    
    // Wait for modal to render, then focus
    setTimeout(() => helperInputRef.current?.focus(), 100)
    
    // Get initial greeting from Hatch
    setIsHelperLoading(true)
    try {
      const response = await fetch('/api/prompt-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionType: section.id,
          sectionName: section.name,
          templateType: 'Landing Page',
          userMessage: 'Start',
          conversationHistory: [],
          brandName: brandConfig?.brandName,
          brandTagline: brandConfig?.tagline,
        }),
      })
      
      if (response.ok) {
        const { message } = await response.json()
        setHelperMessages([{ role: 'assistant', content: message }])
        setHatchState('idle')
      } else {
        setHelperMessages([{ 
          role: 'assistant', 
          content: `Hey! I'm Hatch 🥚✨ Let's write an awesome ${section.name} section! Tell me about your business - what do you do?` 
        }])
        setHatchState('idle')
      }
    } catch {
      setHelperMessages([{ 
        role: 'assistant', 
        content: `Hey! I'm Hatch 🥚✨ Let's write an awesome ${section.name} section! Tell me about your business - what do you do?` 
      }])
      setHatchState('idle')
    } finally {
      setIsHelperLoading(false)
    }
  }

  // Send message to prompt helper
  const sendHelperMessage = async () => {
    if (!helperInput.trim() || isHelperLoading) return
    
    const userMessage = helperInput.trim()
    setHelperInput('')
    setHelperMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsHelperLoading(true)
    setHatchState('thinking')
    
    // Scroll to bottom
    setTimeout(() => helperChatRef.current?.scrollTo({ top: helperChatRef.current.scrollHeight, behavior: 'smooth' }), 50)
    
    try {
      const response = await fetch('/api/prompt-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionType: section.id,
          sectionName: section.name,
          templateType: 'Landing Page',
          userMessage,
          conversationHistory: helperMessages,
          brandName: brandConfig?.brandName,
          brandTagline: brandConfig?.tagline,
        }),
      })
      
      if (response.ok) {
        const { message, isPromptReady } = await response.json()
        setHelperMessages(prev => [...prev, { role: 'assistant', content: message }])
        
        if (isPromptReady) {
          setGeneratedPrompt(message)
          setHatchState('excited')
        } else {
          setHatchState('idle')
        }
        
        // Scroll to bottom
        setTimeout(() => helperChatRef.current?.scrollTo({ top: helperChatRef.current.scrollHeight, behavior: 'smooth' }), 50)
      }
    } catch (err) {
      console.error('Helper error:', err)
      setHatchState('idle')
    } finally {
      setIsHelperLoading(false)
      setTimeout(() => helperInputRef.current?.focus(), 50)
    }
  }

  // Use the generated prompt
  const useGeneratedPrompt = () => {
    if (generatedPrompt) {
      setPrompt(generatedPrompt)
      setShowPromptHelper(false)
      setHelperMessages([])
      setGeneratedPrompt(null)
      setHatchState('idle')
      // Focus the main textarea
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }

  const handleBuildSection = async () => {
    if (!prompt.trim()) {
      setError('Please describe what you want for this section')
      return
    }

    setError(null)
    setStage('generating')
    setStreamingCode('')
    setReasoning('') // Clear previous reasoning
    setHasSelfHealed(false)

    // Demo mode - simulate generation with mock code
    if (demoMode) {
      const mockCode = generateMockCode(section.id, section.name, prompt)
      // Simulate streaming effect - slower for visual appeal
      for (let i = 0; i < mockCode.length; i += 12) {
        await new Promise(resolve => setTimeout(resolve, 15))
        setStreamingCode(mockCode.slice(0, i + 12))
        codeEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' })
      }
      setGeneratedCode(mockCode)
      setStreamingCode(mockCode)
      setStage('refining')
      
      // Simulate Opus refining - show purple code
      await new Promise(resolve => setTimeout(resolve, 1200))
      const mockChanges = Math.random() > 0.5 
        ? ['Added focus states to buttons', 'Improved color contrast'] 
        : []
      
      setRefined(mockChanges.length > 0)
      setRefinementChanges(mockChanges)
      setStage('complete')
      onComplete(mockCode, mockChanges.length > 0, mockChanges)
      return
    }

    try {
      // Stage 1: Sonnet generates the section
      const generateResponse = await fetch('/api/build-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          sectionId: dbSection.id,
          sectionType: section.id,
          sectionName: section.name,
          sectionDescription: section.description,
          sectionPromptHint: section.prompt,
          userPrompt: prompt,
          previousSections: allSectionsCode,
          brandConfig: brandConfig ? {
            brandName: brandConfig.brandName,
            tagline: brandConfig.tagline,
            logoUrl: brandConfig.logoUrl,
            colors: brandConfig.colors,
            fontStyle: brandConfig.fontStyle,
            styleVibe: brandConfig.styleVibe,
          } : null,
        }),
      })

      if (!generateResponse.ok) {
        throw new Error('Generation failed')
      }

      const { code: sonnetCode, reasoning: aiReasoning } = await generateResponse.json()
      
      // Store the AI's reasoning for display
      if (aiReasoning) {
        setReasoning(aiReasoning)
      }
      
      // Reveal code progressively for visual effect - slower, more dramatic
      const chunkSize = 15 // Smaller chunks = smoother scroll
      const delay = 12 // ms between chunks - slower for visual effect
      
      for (let i = 0; i < sonnetCode.length; i += chunkSize) {
        await new Promise(resolve => setTimeout(resolve, delay))
        setStreamingCode(sonnetCode.slice(0, i + chunkSize))
        // Auto-scroll to bottom
        codeEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' })
      }
      
      // Sonnet is done! No auto-Opus - user can opt-in later
      setGeneratedCode(sonnetCode)
      setStreamingCode('')
      setRefined(false)
      setRefinementChanges([])
      setStage('complete')

      // Notify parent with Sonnet-only code
      onComplete(sonnetCode, false)

    } catch (err) {
      console.error('Build error:', err)
      setError('Failed to build section. Please try again.')
      setStreamingCode('')
      setStage('input')
    }
  }


  const handleRebuild = () => {
    setStage('input')
    setGeneratedCode('')
    setRefined(false)
    setRefinementChanges([])
    setRefinePrompt('')
    setIsUserRefining(false)
    setHasSelfHealed(false)
  }

  const handleRemix = () => {
    setPrompt(prev => `Create a completely different variation of this section. ${prev}`)
    setStage('input')
    setGeneratedCode('')
    setRefined(false)
    setRefinementChanges([])
    setRefinePrompt('')
    setIsUserRefining(false)
    setHasSelfHealed(false)
    setTimeout(() => textareaRef.current?.focus(), 100)
  }

  const handleUserRefine = async () => {
    if (!refinePrompt.trim() || !generatedCode) {
      setError('Please describe what changes you want')
      return
    }

    setError(null)
    setIsUserRefining(true)
    setStreamingCode('')

    // Demo mode - simulate refinement
    if (demoMode) {
      const refinedCode = generatedCode.replace(
        'Feature One',
        'Updated Feature'
      )
      // Simulate streaming
      for (let i = 0; i < refinedCode.length; i += 15) {
        await new Promise(resolve => setTimeout(resolve, 10))
        setStreamingCode(refinedCode.slice(0, i + 15))
        codeEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' })
      }
      setGeneratedCode(refinedCode)
      setStreamingCode('')
      setRefined(true)
      setRefinementChanges([...refinementChanges, refinePrompt])
      setRefinePrompt('')
      setIsUserRefining(false)
      onComplete(refinedCode, true, [...refinementChanges, refinePrompt])
      return
    }

    try {
      // Construct context-aware refinement prompt
      let finalRefineRequest = refinePrompt
      if (selectedElement) {
        finalRefineRequest = `TARGET ELEMENT: <${selectedElement.tagName} class="${selectedElement.className}">${selectedElement.text}</${selectedElement.tagName}>. USER REQUEST: ${refinePrompt}. Focus changes specifically on this element.`
      }

      const response = await fetch('/api/refine-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: dbSection.id,
          code: generatedCode,
          sectionType: section.id,
          sectionName: section.name,
          userPrompt: prompt,
          refineRequest: finalRefineRequest,
        }),
      })

      if (!response.ok) {
        throw new Error('Refinement failed')
      }

      const { code: refinedCode, changes } = await response.json()

      // Show refined code streaming
      for (let i = 0; i < refinedCode.length; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 8))
        setStreamingCode(refinedCode.slice(0, i + 20))
        codeEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' })
      }

      setGeneratedCode(refinedCode)
      setStreamingCode('')
      setRefined(true)
      setRefinementChanges([...refinementChanges, ...(changes || [refinePrompt])])
      setRefinePrompt('')
      setSelectedElement(null) // Clear selection after refine
      onComplete(refinedCode, true, [...refinementChanges, ...(changes || [refinePrompt])])

    } catch (err) {
      console.error('Refine error:', err)
      setError('Failed to refine section. Please try again.')
    } finally {
      setIsUserRefining(false)
    }
  }

  // Handle opt-in Opus polish (not automatic anymore)
  const handleOpusPolish = async () => {
    if (!generatedCode || isOpusPolishing) return
    
    setIsOpusPolishing(true)
    setError(null)
    
    try {
      const response = await fetch('/api/refine-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: dbSection.id,
          code: generatedCode,
          sectionType: section.id,
          sectionName: section.name,
          userPrompt: prompt,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.upgradeRequired) {
          onShowHatchModal?.()
          return
        }
        throw new Error(data.error || 'Refinement failed')
      }

      const { refined: wasRefined, code: polishedCode, changes } = await response.json()

      if (wasRefined && polishedCode !== generatedCode) {
        // Show polished code streaming
        setStreamingCode('')
        for (let i = 0; i < polishedCode.length; i += 20) {
          await new Promise(resolve => setTimeout(resolve, 8))
          setStreamingCode(polishedCode.slice(0, i + 20))
          codeEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' })
        }
        setGeneratedCode(polishedCode)
        setStreamingCode('')
      }

      setRefined(wasRefined)
      setRefinementChanges(changes || [])
      onComplete(polishedCode || generatedCode, wasRefined, changes)

    } catch (err) {
      console.error('Opus polish error:', err)
      setError('Failed to polish with Opus. Please try again.')
    } finally {
      setIsOpusPolishing(false)
    }
  }

  // Check if this is a contact section
  const isContactSection = section.id === 'contact' || 
    section.name.toLowerCase().includes('contact') ||
    generatedCode.toLowerCase().includes('contact form') ||
    generatedCode.toLowerCase().includes('type="email"')

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-0 max-h-full overflow-hidden bg-zinc-950">
      {/* Mobile Tab Switcher - Modern Segmented Control */}
      <div className="flex md:hidden border-b border-zinc-800/50 bg-zinc-950 p-2">
        <div className="flex w-full bg-zinc-900/50 rounded-lg p-1 border border-zinc-800/50">
          <button
            onClick={() => setMobileTab('input')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
              mobileTab === 'input' 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Architect</span>
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
              mobileTab === 'preview' 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Left: Input Panel - Full width on mobile when active, collapsible on desktop */}
      <div className={`
        ${mobileTab === 'input' ? 'flex' : 'hidden'} md:flex
        ${expandedPreview ? 'md:w-80 md:min-w-80' : 'md:w-[40%] md:min-w-[350px]'} 
        flex-col min-h-0 max-h-full overflow-hidden relative transition-all duration-300 
        border-r-0 md:border-r border-zinc-800/50 bg-zinc-950
      `}>
        {/* Section Header */}
        <div className="p-4 lg:p-6 border-b border-zinc-800/50 flex-shrink-0 bg-zinc-950">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                <Cpu className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">{section.name}</h2>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">System Ready</p>
                </div>
              </div>
            </div>
            <div className="px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-500 font-mono">
              {section.estimatedTime}
            </div>
          </div>
          
          <p className="text-sm text-zinc-400 leading-relaxed">{section.description}</p>
          
          {/* Brand Quick Reference - Collapsible */}
          {brandConfig && (
            <BrandQuickReference brandConfig={brandConfig} />
          )}
        </div>

        {/* Input Area */}
        <div className="flex-1 p-4 lg:p-6 flex flex-col min-h-0 overflow-auto">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
              Directive
            </label>
            <button 
              onClick={() => initializePromptHelper()}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask Hatch</span>
            </button>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm" />
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={stage !== 'input'}
              placeholder="Describe the architecture of this section..."
              className="relative w-full min-h-[180px] bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 text-sm font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-0 focus:border-purple-500/50 disabled:opacity-50 resize-none transition-all"
            />
            {/* Voice Input Button */}
            <div className="absolute bottom-3 right-3 z-10">
              <VoiceInput 
                onTranscript={(text) => {
                  // If we are in refinement mode (stage is complete) or an element is selected, update refinePrompt
                  if (stage === 'complete' || selectedElement) {
                    setRefinePrompt(prev => prev ? `${prev} ${text}` : text)
                  } else {
                    // Otherwise update the main prompt
                    setPrompt(prev => prev ? `${prev} ${text}` : text)
                  }
                }} 
              />
            </div>
          </div>

          {/* Smart Suggestions */}
          {stage === 'input' && (
            <div className="mt-3 flex flex-wrap gap-2">
              {getSuggestions(section.id).map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setPrompt(prev => prev ? `${prev} ${suggestion}` : suggestion)}
                  className="px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-xs text-zinc-400 hover:text-white hover:bg-zinc-700 hover:border-zinc-600 transition-all"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Hatch - Your friendly prompt helper */}
          {stage === 'input' && (
            <motion.button
              onClick={initializePromptHelper}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-3 self-start flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 group-hover:border-amber-500/30 transition-colors">
                <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-zinc-900 border-l border-b border-zinc-800 rotate-45 group-hover:border-amber-500/30"></div>
                <span className="text-xs font-mono text-zinc-400 group-hover:text-amber-300 transition-colors">Need inspiration? Initialize Hatch Assistant.</span>
              </div>
            </motion.button>
          )}

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {error}
            </motion.div>
          )}

          {/* Action Button */}
          <div className="mt-6">
            <AnimatePresence mode="wait">
              {stage === 'input' && (
                <motion.button
                  key="build"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleBuildSection}
                  disabled={!prompt.trim()}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(147,51,234,0.3)] active:scale-[0.98] transition-all min-h-[52px] flex items-center justify-center gap-2 group"
                >
                  <Hammer className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span>Initialize Construction</span>
                </motion.button>
              )}

              {stage === 'generating' && (
                <motion.div
                  key="generating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden relative"
                >
                  <ThinkingLog />
                </motion.div>
              )}

              {stage === 'refining' && (
                <motion.div
                  key="refining"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full py-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-center"
                >
                  <div className="flex items-center justify-center gap-3 text-violet-300">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                    <span className="font-mono text-sm">Architect Polishing...</span>
                  </div>
                </motion.div>
              )}

              {stage === 'complete' && (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <SectionCompleteIndicator
                    sectionName={section.name}
                    wasRefined={refined}
                    changes={refinementChanges}
                  />

                  {/* AI Reasoning Display */}
                  {reasoning && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl"
                    >
                      <Terminal className="w-5 h-5 text-zinc-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider mb-1">System Logic</p>
                        <p className="text-sm text-zinc-400 leading-relaxed font-mono text-xs">{reasoning}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Contact Form Instructions */}
                  {isContactSection && <ContactFormInstructions />}

                  {/* Style HUD - Shows when element is selected */}
                  <AnimatePresence>
                    {selectedElement && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: 10, height: 0 }}
                        className="mb-3 overflow-hidden"
                      >
                        <div className="bg-zinc-900 border border-purple-500/30 rounded-xl p-3 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                                &lt;{selectedElement.tagName}&gt;
                              </span>
                              <div className="flex bg-zinc-800 rounded-lg p-0.5">
                                <button
                                  onClick={() => setHudTab('styles')}
                                  className={`px-2 py-0.5 text-[10px] font-medium rounded-md transition-all ${
                                    hudTab === 'styles' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'
                                  }`}
                                >
                                  Styles
                                </button>
                                <button
                                  onClick={() => setHudTab('animate')}
                                  className={`px-2 py-0.5 text-[10px] font-medium rounded-md transition-all ${
                                    hudTab === 'animate' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'
                                  }`}
                                >
                                  Animate
                                </button>
                                <button
                                  onClick={() => {
                                    setHudTab('explain')
                                    if (!explanation) handleExplainElement()
                                  }}
                                  className={`px-2 py-0.5 text-[10px] font-medium rounded-md transition-all ${
                                    hudTab === 'explain' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'
                                  }`}
                                >
                                  Explain
                                </button>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => setRefinePrompt('Duplicate this element')}
                                className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-white transition-colors"
                                title="Duplicate Element"
                              >
                                <CopyPlus className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={() => setRefinePrompt('Delete this element')}
                                className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-red-400 transition-colors"
                                title="Delete Element"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(selectedElement.className)
                                  setCopied(true)
                                  setTimeout(() => setCopied(false), 1000)
                                }}
                                className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-white transition-colors"
                                title="Copy classes"
                              >
                                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                          
                          {hudTab === 'styles' ? (
                            <>
                              {/* Class List */}
                              <div className="bg-zinc-950 rounded-lg p-2 border border-zinc-800 mb-2 max-h-24 overflow-y-auto">
                                <code className="text-[10px] text-zinc-400 font-mono leading-relaxed break-all">
                                  {selectedElement.className || 'No classes'}
                                </code>
                              </div>

                              {/* Quick Actions */}
                              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                {[
                                  { label: 'Clear Styles', action: 'Remove all classes' },
                                  { label: 'Make Red', action: 'Change text color to red-500' },
                                  { label: 'Add Padding', action: 'Add p-4' },
                                  { label: 'Center', action: 'Add flex items-center justify-center' }
                                ].map((qa) => (
                                  <button
                                    key={qa.label}
                                    onClick={() => setRefinePrompt(qa.action)}
                                    className="flex-shrink-0 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-[10px] text-zinc-300 transition-colors whitespace-nowrap"
                                  >
                                    {qa.label}
                                  </button>
                                ))}
                              </div>
                            </>
                          ) : hudTab === 'animate' ? (
                            /* Animation Studio */
                            <div className="space-y-2">
                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  { label: 'Fade In', action: 'Add a Fade In animation using framer-motion (opacity 0 to 1)' },
                                  { label: 'Slide Up', action: 'Add a Slide Up animation (y: 20 to 0, opacity 0 to 1)' },
                                  { label: 'Scale Up', action: 'Add a Scale Up animation (scale 0.9 to 1)' },
                                  { label: 'Bounce', action: 'Add a Bounce animation' },
                                  { label: 'Pulse', action: 'Add a continuous Pulse animation' },
                                  { label: 'Hover Lift', action: 'Add a whileHover={{ y: -5 }} animation' }
                                ].map((anim) => (
                                  <button
                                    key={anim.label}
                                    onClick={() => setRefinePrompt(anim.action)}
                                    className="px-2 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-[10px] text-zinc-300 transition-colors text-center"
                                  >
                                    {anim.label}
                                  </button>
                                ))}
                              </div>
                              <button
                                onClick={() => setRefinePrompt('Choose the best animation for this element based on its context and apply it using framer-motion')}
                                className="w-full py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>Magic Animate</span>
                              </button>
                            </div>
                          ) : (
                            /* Explain Element */
                            <div className="space-y-2">
                              {isExplaining ? (
                                <div className="flex items-center justify-center py-8 text-zinc-500 gap-2">
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  <span className="text-xs font-mono">Analyzing element logic...</span>
                                </div>
                              ) : explanation ? (
                                <div className="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800/50">
                                  <div className="flex items-start gap-2 mb-2">
                                    <div className="w-5 h-5 rounded bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                      <Info className="w-3 h-3 text-blue-400" />
                                    </div>
                                    <p className="text-xs text-zinc-300 leading-relaxed">
                                      {explanation}
                                    </p>
                                  </div>
                                  <div className="flex justify-end">
                                    <button 
                                      onClick={handleExplainElement}
                                      className="text-[10px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
                                    >
                                      <RefreshCw className="w-3 h-3" />
                                      Regenerate
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-4">
                                  <button
                                    onClick={handleExplainElement}
                                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-xs text-zinc-300 transition-colors"
                                  >
                                    Explain this element
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Compact Refine Input - cleaner */}
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="text-xs text-zinc-500 mb-1 block font-mono uppercase">
                        {selectedElement ? (
                          <span className="text-purple-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                            Refining: {selectedElement.tagName}
                          </span>
                        ) : 'Refinement Directive'}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={refinePrompt}
                          onChange={(e) => setRefinePrompt(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && refinePrompt.trim() && handleUserRefine()}
                          disabled={isUserRefining}
                          placeholder={selectedElement ? `How should I change this ${selectedElement.tagName}?` : "e.g., Increase padding, darken background..."}
                          className={`w-full bg-zinc-900 border rounded-lg pl-3 pr-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 disabled:opacity-50 font-mono transition-colors ${
                            selectedElement 
                              ? 'border-purple-500/50 focus:ring-purple-500/50 focus:border-purple-500' 
                              : 'border-zinc-800 focus:ring-purple-500/50 focus:border-purple-500/50'
                          }`}
                        />
                        {selectedElement && (
                          <button
                            onClick={() => setSelectedElement(null)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleUserRefine}
                      disabled={!refinePrompt.trim() || isUserRefining}
                      className="px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm font-medium hover:bg-zinc-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
                    >
                      {isUserRefining ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Edit3 className="w-4 h-4" />
                          <span>Refine</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Opus Polish Button - Opt-in for Pro/Agency users */}
                  {isPaid && !refined && !isOpusPolishing && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20 rounded-xl"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-violet-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-violet-300 mb-1">Initialize Architect Polish?</h4>
                          <p className="text-xs text-zinc-400 mb-3 font-mono">
                            The Architect will review for accessibility, semantic HTML, and best practices.
                          </p>
                          <div className="flex items-center justify-between">
                            <button
                              onClick={handleOpusPolish}
                              disabled={isOpusPolishing}
                              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Polish with Architect</span>
                            </button>
                            <span className="text-xs text-zinc-500 font-mono">
                              {tier === 'agency' ? '∞ credits' : `${opusCreditsRemaining}/30 credits left`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Show Opus polishing state */}
                  {isOpusPolishing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <motion.div 
                          animate={{ rotate: 360 }} 
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        >
                          <RefreshCw className="w-5 h-5 text-violet-400" />
                        </motion.div>
                        <div>
                          <p className="text-sm font-medium text-violet-300 font-mono">Architect is polishing...</p>
                          <p className="text-xs text-zinc-500 font-mono">Checking accessibility & best practices</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Show refinement changes if Opus polished */}
                  {refined && refinementChanges.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-violet-400 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold text-violet-300 mb-2 font-mono">Architect Optimization Complete</h4>
                          <ul className="text-xs text-zinc-400 space-y-1 font-mono">
                            {refinementChanges.slice(0, 3).map((change, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-violet-400">•</span>
                                <span>{change}</span>
                              </li>
                            ))}
                            {refinementChanges.length > 3 && (
                              <li className="text-zinc-500">+{refinementChanges.length - 3} more improvements</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Clear Next Section CTA */}
                  {!isLastSection ? (
                    <>
                      {/* Mobile: View Preview button */}
                      <button
                        onClick={() => setMobileTab('preview')}
                        className="w-full py-4 rounded-xl border border-zinc-700 text-zinc-300 font-medium md:hidden hover:bg-zinc-800 active:bg-zinc-700 transition-colors min-h-[52px] flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Preview</span>
                      </button>
                      <button
                        onClick={onNextSection}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg hover:shadow-[0_0_20px_rgba(147,51,234,0.3)] active:scale-[0.98] transition-all min-h-[56px] flex items-center justify-center gap-2 group"
                      >
                        <span>Continue to Next Module</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Mobile: View Preview button */}
                      <button
                        onClick={() => setMobileTab('preview')}
                        className="w-full py-4 rounded-xl border border-zinc-700 text-zinc-300 font-medium md:hidden hover:bg-zinc-800 active:bg-zinc-700 transition-colors min-h-[52px] flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Preview</span>
                      </button>
                      <button
                        onClick={onNextSection}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-[0.98] transition-all min-h-[56px] flex items-center justify-center gap-2 group"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Finalize System Architecture</span>
                      </button>
                    </>
                  )}
                  
                  {/* Remix Button */}
                  <button
                    onClick={handleRemix}
                    className="w-full py-3 rounded-xl border border-purple-500/30 text-purple-300 font-medium hover:bg-purple-500/10 transition-colors flex items-center justify-center gap-2 mb-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>Remix Variation</span>
                  </button>

                  {/* Rebuild - subtle */}
                  <button
                    onClick={handleRebuild}
                    className="w-full py-2 text-xs text-zinc-600 hover:text-red-400 transition-colors font-mono flex items-center justify-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset Module</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Minimal AI Pipeline Info - only show during input stage */}
        {stage === 'input' && (
          <div className="px-4 py-3 bg-zinc-900/30 border-t border-zinc-800 flex-shrink-0">
            <div className="flex items-center gap-4 text-xs text-zinc-500 font-mono">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Architect builds</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span> Architect polishes</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span> Architect audits</span>
            </div>
          </div>
        )}

        {/* Prompt Helper Mini-Chat Modal */}
        <AnimatePresence>
          {showPromptHelper && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-center justify-center p-4"
              onClick={(e) => e.target === e.currentTarget && setShowPromptHelper(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-gradient-to-r from-amber-500/5 to-yellow-500/5">
                  <div className="flex items-center gap-3">
                    <HatchCharacter state={hatchState} size="md" />
                    <div>
                      <h3 className="font-semibold text-white text-sm">Hatch</h3>
                      <p className="text-xs text-amber-400/70">Your prompt helper~</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPromptHelper(false)}
                    className="w-8 h-8 rounded-full hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Chat Messages */}
                <div 
                  ref={helperChatRef}
                  className="h-64 overflow-y-auto p-4 space-y-3"
                >
                  {helperMessages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                          msg.role === 'user'
                            ? 'bg-emerald-500/20 text-emerald-100 rounded-br-sm'
                            : 'bg-zinc-800 text-zinc-200 rounded-bl-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isHelperLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-zinc-800 px-4 py-3 rounded-xl rounded-bl-sm flex items-center gap-3">
                        <HatchCharacter state="thinking" size="sm" />
                        <span className="text-sm text-zinc-400">Hmm, let me think... 🥚💭</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Generated Prompt Action */}
                {generatedPrompt && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-4 py-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-t border-emerald-500/20"
                  >
                    <motion.button
                      onClick={useGeneratedPrompt}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                      >
                        ✨
                      </motion.span>
                      Use This Prompt
                    </motion.button>
                    <p className="text-xs text-emerald-400/60 text-center mt-2">One click and you're ready to build~</p>
                  </motion.div>
                )}

                {/* Input */}
                <div className="p-3 border-t border-zinc-800">
                  <div className="flex gap-2">
                    <input
                      ref={helperInputRef}
                      type="text"
                      value={helperInput}
                      onChange={(e) => {
                        setHelperInput(e.target.value)
                        // Hatch watches when user types
                        if (e.target.value && !isHelperLoading) {
                          setHatchState('watching')
                        } else if (!isHelperLoading) {
                          setHatchState('idle')
                        }
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendHelperMessage()}
                      placeholder="Tell me about your business..."
                      disabled={isHelperLoading}
                      className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 disabled:opacity-50"
                    />
                    <button
                      onClick={sendHelperMessage}
                      disabled={!helperInput.trim() || isHelperLoading}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg transition-colors"
                    >
                      →
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right: Preview Panel - Full width on mobile when active, expands on desktop */}
      <div className={`
        ${mobileTab === 'preview' ? 'flex' : 'hidden'} md:flex
        ${expandedPreview ? 'md:flex-1' : 'md:w-[60%]'} 
        flex-col bg-zinc-900/30 min-h-0 max-h-full overflow-hidden transition-all duration-300
      `}>
        <div className="p-3 border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            {stage === 'generating' ? (
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full"
                />
                <span className="text-sm font-medium bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Sonnet is building...
                </span>
              </div>
            ) : isSelfHealing ? (
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full"
                />
                <span className="text-sm font-medium text-red-400">
                  Self-healing code...
                </span>
              </div>
            ) : stage === 'refining' || isUserRefining || isOpusPolishing ? (
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-violet-400"
                >
                  🐣
                </motion.div>
                <span className="text-sm font-medium bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                  {isUserRefining ? 'Applying your changes...' : isOpusPolishing ? 'Opus is polishing...' : 'Refining...'}
                </span>
              </div>
            ) : (
              <h3 className="text-sm font-medium text-zinc-400">
                {showCode ? 'Code' : 'Preview'}
              </h3>
            )}
            {generatedCode && stage === 'complete' && !isUserRefining && (
              <button
                onClick={handleViewCode}
                className={`text-xs px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                  showCode 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                }`}
              >
                {showCode ? (
                  <>
                    <Eye className="w-3 h-3" />
                    <span>Preview</span>
                  </>
                ) : (
                  <>
                    <Code className="w-3 h-3" />
                    <span>Code</span>
                    {!isPaid && <span className="text-amber-400 ml-1">🔒</span>}
                  </>
                )}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Inspector Toggle */}
            {(generatedCode || streamingCode) && (
              <button
                onClick={() => setInspectorMode(!inspectorMode)}
                className={`text-xs px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                  inspectorMode 
                    ? 'bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]' 
                    : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                }`}
                title="Click elements in preview to refine them"
              >
                <MousePointer2 className="w-3 h-3" />
                <span>{inspectorMode ? 'Select Element' : 'Inspect'}</span>
              </button>
            )}

            {/* Expand/Collapse Preview Button */}
            <button
              onClick={() => setExpandedPreview(!expandedPreview)}
              className="hidden lg:flex text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors items-center gap-1"
              title={expandedPreview ? 'Collapse preview' : 'Expand preview'}
            >
              {expandedPreview ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                  </svg>
                  <span>Collapse</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0-4h4m-4 4l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  <span>Expand</span>
                </>
              )}
            </button>
            {(generatedCode || streamingCode) && (
              <>
                <button
                  onClick={handleCopyCode}
                  className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors flex items-center gap-1"
                >
                  {copied ? (
                    <><span className="text-emerald-400">✓</span> Copied!</>
                  ) : (
                    <>
                      <span>📋</span> Copy
                      {!isPaid && <span className="text-amber-400 ml-1">🔒</span>}
                    </>
                  )}
                </button>
                {stage === 'complete' && (
                  <>
                    <span className="text-emerald-400 text-xs">⚡ Sonnet</span>
                    {refined && <span className="text-violet-400 text-xs">+ 🐣 Opus</span>}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          {/* Show streaming code during generation or user refinement - ONLY for paid users */}
          {((stage === 'generating' || stage === 'refining') && streamingCode) || ((isUserRefining || isOpusPolishing) && streamingCode) ? (
            isPaid ? (
              <div className="flex-1 overflow-auto p-4 bg-zinc-950">
                <pre className="text-xs font-mono whitespace-pre-wrap">
                  <code className={(stage === 'refining' || isUserRefining) ? 'text-violet-400' : 'text-emerald-400'}>
                    {streamingCode}
                  </code>
                  <span className="animate-pulse">▊</span>
                </pre>
                <div ref={codeEndRef} />
              </div>
            ) : (
              /* Free users see building animation, not actual code */
              <div className="flex-1 flex items-center justify-center bg-zinc-950">
                <div className="text-center p-8">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-6xl mb-4"
                  >
                    {stage === 'refining' || isUserRefining ? '🐣' : '⚡'}
                  </motion.div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {stage === 'refining' || isUserRefining ? 'Opus is polishing...' : 'Sonnet is building...'}
                  </h3>
                  <p className="text-sm text-zinc-500 mb-4">Your section is being crafted</p>
                  <div className="flex justify-center gap-1">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-emerald-500"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )
          ) : isPaid && showCode && generatedCode ? (
            /* Fix #2: Only show code view if isPaid AND showCode */
            <div className="flex-1 overflow-auto p-4 bg-zinc-950 relative">
              <pre className="text-xs font-mono whitespace-pre-wrap p-4">
                {generatedCode.split('\n').map((line, i) => {
                  // Simple heuristic to highlight lines related to selected element
                  const isHighlighted = selectedElement && 
                    (line.includes(selectedElement.className) || 
                     (line.includes(`<${selectedElement.tagName}`) && line.includes('className=')));
                  
                  const isEditing = editingLineIndex === i;

                  return (
                    <div 
                      key={i} 
                      className={`${isHighlighted ? 'bg-purple-500/20 -mx-4 px-4 border-l-2 border-purple-500' : ''} group relative`}
                    >
                      <span className="text-zinc-600 select-none mr-4 w-6 inline-block text-right">{i + 1}</span>
                      
                      {isEditing ? (
                        <input
                          autoFocus
                          type="text"
                          value={editingLineContent}
                          onChange={(e) => setEditingLineContent(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveLine(i)
                            if (e.key === 'Escape') setEditingLineIndex(null)
                          }}
                          onBlur={() => handleSaveLine(i)}
                          className="bg-zinc-800 text-emerald-400 outline-none w-[calc(100%-3rem)] px-1 rounded font-mono"
                        />
                      ) : (
                        <code 
                          className="text-emerald-400 cursor-text hover:bg-zinc-800/50 rounded px-1 transition-colors"
                          onClick={() => {
                            setEditingLineIndex(i)
                            setEditingLineContent(line)
                          }}
                          title="Click to edit line"
                        >
                          {line}
                        </code>
                      )}
                    </div>
                  )
                })}
                {refined && (
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <span className="text-xs text-violet-400">{/* Polished by Opus */}</span>
                  </div>
                )}
              </pre>
            </div>
          ) : (
            <SectionPreview 
              code={generatedCode} 
              darkMode={true}
              onRuntimeError={handleRuntimeError}
              inspectorMode={inspectorMode}
              onElementSelect={handleElementSelect}
            />
          )}
        </div>
      </div>
    </div>
  )
}
