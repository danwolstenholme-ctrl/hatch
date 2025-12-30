'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Section } from '@/lib/templates'
import { DbSection } from '@/lib/supabase'
import { SectionCompleteIndicator } from './SectionProgress'
import SectionPreview from './SectionPreview'
import { BrandConfig } from './BrandingStep'
import HatchCharacter, { HatchState } from './HatchCharacter'
import { useSubscription } from '@/contexts/SubscriptionContext'

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
        <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
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
  const [opusSuggestions, setOpusSuggestions] = useState<string[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<number>>(new Set())
  const [isOpusPolishing, setIsOpusPolishing] = useState(false) // Opt-in Opus polish
  const [expandedPreview, setExpandedPreview] = useState(false) // Expand preview on desktop
  
  // Get subscription info for Opus credits
  const { tier, subscription } = useSubscription()
  const opusCreditsUsed = (typeof window !== 'undefined' && subscription) 
    ? (window as unknown as { __opusUsed?: number }).__opusUsed || 0 
    : 0
  const opusCreditsTotal = tier === 'agency' ? Infinity : tier === 'pro' ? 30 : 0
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
  const refineTextareaRef = useRef<HTMLTextAreaElement>(null)
  const helperInputRef = useRef<HTMLInputElement>(null)
  const helperChatRef = useRef<HTMLDivElement>(null)

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

  // Reset when section changes
  useEffect(() => {
    setPrompt(dbSection.user_prompt || '')
    setStage(dbSection.status === 'complete' ? 'complete' : 'input')
    setGeneratedCode(dbSection.code || '')
    setRefined(dbSection.refined)
    setRefinementChanges(dbSection.refinement_changes || [])
    setError(null)
    setRefinePrompt('')
    setIsUserRefining(false)
    setOpusSuggestions([])
    setAppliedSuggestions(new Set())
    // Reset prompt helper
    setShowPromptHelper(false)
    setHelperMessages([])
    setHelperInput('')
    setGeneratedPrompt(null)
    setHatchState('idle')
  }, [dbSection.id])

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
    } catch (err) {
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

  // Fetch proactive suggestions from Opus
  const fetchOpusSuggestions = async (code: string) => {
    if (demoMode) {
      // Demo suggestions
      setOpusSuggestions([
        'Add a subtle gradient background for more depth',
        'Include a secondary CTA for users not ready to commit',
        'Add trust badges or security icons near the form',
        'Consider adding an FAQ accordion below',
      ])
      return
    }

    setIsLoadingSuggestions(true)
    try {
      const response = await fetch('/api/suggest-improvements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          sectionType: section.id,
          sectionName: section.name,
          userPrompt: prompt,
        }),
      })

      if (response.ok) {
        const { suggestions } = await response.json()
        setOpusSuggestions(suggestions || [])
      }
    } catch (err) {
      console.error('Failed to fetch suggestions:', err)
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  // Apply a suggestion
  const handleApplySuggestion = async (suggestion: string, index: number) => {
    if (appliedSuggestions.has(index)) return
    
    setRefinePrompt(suggestion)
    // Auto-trigger refinement
    setAppliedSuggestions(prev => new Set([...prev, index]))
  }

  const handleRebuild = () => {
    setStage('input')
    setGeneratedCode('')
    setRefined(false)
    setRefinementChanges([])
    setRefinePrompt('')
    setIsUserRefining(false)
    setOpusSuggestions([])
    setAppliedSuggestions(new Set())
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
      const response = await fetch('/api/refine-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: dbSection.id,
          code: generatedCode,
          sectionType: section.id,
          sectionName: section.name,
          userPrompt: prompt,
          refineRequest: refinePrompt, // User's specific refinement request
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
    <div className="flex-1 flex min-h-0 max-h-full overflow-hidden">
      {/* Left: Input Panel - Collapsible on desktop when preview is expanded */}
      <div className={`${expandedPreview ? 'w-80 min-w-80' : 'w-[40%] min-w-[350px]'} border-r border-zinc-800 flex flex-col min-h-0 max-h-full overflow-hidden relative transition-all duration-300`}>
        {/* Section Header */}
        <div className="p-4 lg:p-6 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
              <span className="text-lg">🐣</span>
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-white">{section.name}</h2>
              <p className="text-xs lg:text-sm text-zinc-500">{section.estimatedTime}</p>
            </div>
          </div>
          <p className="text-sm text-zinc-400 mt-2">{section.description}</p>
        </div>

        {/* Input Area */}
        <div className="flex-1 p-4 lg:p-6 flex flex-col min-h-0 overflow-auto">
          <label className="text-sm font-medium text-zinc-300 mb-2">
            {section.prompt}
          </label>
          
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={stage !== 'input'}
            placeholder="Describe what you want for this section..."
            className="flex-1 min-h-[180px] bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 disabled:opacity-50 no-swipe-navigation resize-none"
          />

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
              {/* Hatch character */}
              <HatchCharacter state="idle" size="sm" />
              {/* Speech bubble */}
              <div className="relative bg-zinc-800/80 border border-zinc-700 rounded-xl px-3 py-1.5 group-hover:border-amber-400/30 group-hover:bg-zinc-800 transition-colors">
                <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-zinc-800/80 border-l border-b border-zinc-700 rotate-45 group-hover:border-amber-400/30"></div>
                <span className="text-sm text-zinc-400 group-hover:text-amber-300 transition-colors">Need help? I can write your prompt! ✨</span>
              </div>
            </motion.button>
          )}

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2"
            >
              {error}
            </motion.div>
          )}

          {/* Action Button */}
          <div className="mt-4">
            <AnimatePresence mode="wait">
              {stage === 'input' && (
                <motion.button
                  key="build"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleBuildSection}
                  disabled={!prompt.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-emerald-500/20 transition-shadow"
                >
                  Build Section →
                </motion.button>
              )}

              {stage === 'generating' && (
                <motion.div
                  key="generating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full py-3 rounded-xl bg-zinc-800 text-center"
                >
                  <div className="flex items-center justify-center gap-3 text-zinc-300">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="inline-block"
                    >
                      ⚡
                    </motion.span>
                    <span>Sonnet is building...</span>
                  </div>
                </motion.div>
              )}

              {stage === 'refining' && (
                <motion.div
                  key="refining"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full py-3 rounded-xl bg-violet-500/20 border border-violet-500/30 text-center"
                >
                  <div className="flex items-center justify-center gap-3 text-violet-300">
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="inline-block"
                    >
                      🐣
                    </motion.span>
                    <span>Opus is polishing...</span>
                  </div>
                </motion.div>
              )}

              {stage === 'complete' && (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
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
                      className="flex items-start gap-3 px-4 py-3 bg-purple-500/10 border border-purple-500/20 rounded-xl"
                    >
                      <span className="text-lg mt-0.5">💭</span>
                      <div className="flex-1">
                        <p className="text-sm text-purple-300/90 font-medium mb-1">Design Reasoning</p>
                        <p className="text-sm text-zinc-400 leading-relaxed">{reasoning}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Contact Form Instructions */}
                  {isContactSection && <ContactFormInstructions />}

                  {/* Collapsible refinement options - hidden by default */}
                  
                  {/* Compact Refine Input - cleaner */}
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="text-xs text-zinc-500 mb-1 block">Want changes? Tell me what to tweak:</label>
                      <input
                        type="text"
                        value={refinePrompt}
                        onChange={(e) => setRefinePrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && refinePrompt.trim() && handleUserRefine()}
                        disabled={isUserRefining}
                        placeholder="e.g., Make the buttons larger..."
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50"
                      />
                    </div>
                    <button
                      onClick={handleUserRefine}
                      disabled={!refinePrompt.trim() || isUserRefining}
                      className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-medium hover:bg-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {isUserRefining ? '...' : 'Refine'}
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
                        <span className="text-2xl">🐣</span>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-violet-300 mb-1">Polish with Opus?</h4>
                          <p className="text-xs text-zinc-400 mb-3">
                            Opus will review for accessibility, semantic HTML, and best practices.
                          </p>
                          <div className="flex items-center justify-between">
                            <button
                              onClick={handleOpusPolish}
                              disabled={isOpusPolishing}
                              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50"
                            >
                              ✨ Polish with Opus
                            </button>
                            <span className="text-xs text-zinc-500">
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
                        <motion.span 
                          animate={{ rotate: 360 }} 
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          className="text-2xl"
                        >
                          🐣
                        </motion.span>
                        <div>
                          <p className="text-sm font-medium text-violet-300">Opus is polishing...</p>
                          <p className="text-xs text-zinc-500">Checking accessibility & best practices</p>
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
                        <span className="text-xl">✅</span>
                        <div>
                          <h4 className="text-sm font-semibold text-violet-300 mb-2">Opus polished this section!</h4>
                          <ul className="text-xs text-zinc-400 space-y-1">
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
                    <button
                      onClick={onNextSection}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
                    >
                      Looks good! Continue to Next Section →
                    </button>
                  ) : (
                    <button
                      onClick={onNextSection}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold text-lg hover:shadow-lg hover:shadow-violet-500/20 transition-all"
                    >
                      🎉 Finish & Review Full Site
                    </button>
                  )}
                  
                  {/* Rebuild - subtle */}
                  <button
                    onClick={handleRebuild}
                    className="w-full py-2 text-xs text-zinc-600 hover:text-red-400 transition-colors"
                  >
                    🔄 Start Over
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Minimal AI Pipeline Info - only show during input stage */}
        {stage === 'input' && (
          <div className="px-4 py-3 bg-zinc-900/30 border-t border-zinc-800 flex-shrink-0">
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Sonnet builds</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span> Opus polishes</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Gemini audits</span>
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

      {/* Right: Preview Panel - Expands on desktop */}
      <div className={`${expandedPreview ? 'flex-1' : 'w-[60%]'} flex flex-col bg-zinc-900/30 min-h-0 max-h-full overflow-hidden transition-all duration-300`}>
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
                className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors flex items-center gap-1"
              >
                {showCode ? '← Preview' : (
                  <>
                    View Code
                    {!isPaid && <span className="text-amber-400 ml-1">🔒</span>}
                  </>
                )}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
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
            <div className="flex-1 overflow-auto p-4 bg-zinc-950">
              <pre className="text-xs font-mono whitespace-pre-wrap p-4">
                <code className="text-emerald-400">{generatedCode}</code>
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
              allSectionsCode={allSectionsCode}
              darkMode={true}
            />
          )}
        </div>
      </div>
    </div>
  )
}
