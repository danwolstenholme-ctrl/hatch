'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Section } from '@/lib/templates'
import { DbSection } from '@/lib/supabase'
import { SectionCompleteIndicator } from './SectionProgress'
import SectionPreview from './SectionPreview'
import { BrandConfig } from './BrandingStep'
import HatchCharacter, { HatchState } from './HatchCharacter'

// =============================================================================
// SECTION BUILDER
// The actual interface for building one section at a time
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
}: SectionBuilderProps) {
  const [prompt, setPrompt] = useState(dbSection.user_prompt || '')
  const [stage, setStage] = useState<BuildStage>(
    dbSection.status === 'complete' ? 'complete' : 'input'
  )
  const [generatedCode, setGeneratedCode] = useState(dbSection.code || '')
  const [streamingCode, setStreamingCode] = useState('') // For real-time display
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
    const codeToCopy = streamingCode || generatedCode
    if (codeToCopy) {
      navigator.clipboard.writeText(codeToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
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

      const { code: sonnetCode } = await generateResponse.json()
      
      // Reveal code progressively for visual effect - slower, more dramatic
      const chunkSize = 15 // Smaller chunks = smoother scroll
      const delay = 12 // ms between chunks - slower for visual effect
      
      for (let i = 0; i < sonnetCode.length; i += chunkSize) {
        await new Promise(resolve => setTimeout(resolve, delay))
        setStreamingCode(sonnetCode.slice(0, i + chunkSize))
        // Auto-scroll to bottom
        codeEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' })
      }
      
      setGeneratedCode(sonnetCode)
      setStreamingCode(sonnetCode) // Keep showing for refine stage
      setStage('refining')

      // Stage 2: Opus refines the section
      const refineResponse = await fetch('/api/refine-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: dbSection.id,
          code: sonnetCode,
          sectionType: section.id,
          sectionName: section.name,
          userPrompt: prompt,
        }),
      })

      if (!refineResponse.ok) {
        // Refinement failed, but generation succeeded - continue with original
        console.error('Refinement failed, using original code')
        setRefined(false)
        setStreamingCode('')
        setStage('complete')
        onComplete(sonnetCode, false)
        return
      }

      const { refined: wasRefined, code: finalCode, changes } = await refineResponse.json()

      // Show refined code streaming if it changed - purple Opus color
      if (wasRefined && finalCode !== sonnetCode) {
        setStreamingCode('') // Reset to show from start in purple
        for (let i = 0; i < finalCode.length; i += 20) {
          await new Promise(resolve => setTimeout(resolve, 8))
          setStreamingCode(finalCode.slice(0, i + 20))
          codeEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' })
        }
      }

      setGeneratedCode(finalCode)
      setStreamingCode('')
      setRefined(wasRefined)
      setRefinementChanges(changes || [])
      setStage('complete')

      // Notify parent
      onComplete(finalCode, wasRefined, changes)

      // Fetch proactive Opus suggestions
      fetchOpusSuggestions(finalCode)

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

  // Check if this is a contact section
  const isContactSection = section.id === 'contact' || 
    section.name.toLowerCase().includes('contact') ||
    generatedCode.toLowerCase().includes('contact form') ||
    generatedCode.toLowerCase().includes('type="email"')

  return (
    <div className="flex-1 flex min-h-0 max-h-full overflow-hidden">
      {/* Left: Input Panel */}
      <div className="w-1/2 border-r border-zinc-800 flex flex-col min-h-0 max-h-full overflow-hidden relative">
        {/* Section Header */}
        <div className="p-6 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
              <span className="text-lg">🐣</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{section.name}</h2>
              <p className="text-sm text-zinc-500">{section.estimatedTime}</p>
            </div>
          </div>
          <p className="text-zinc-400 mt-3">{section.description}</p>
        </div>

        {/* Input Area */}
        <div className="flex-1 p-6 flex flex-col min-h-0 overflow-auto">
          <label className="text-sm font-medium text-zinc-300 mb-2">
            {section.prompt}
          </label>
          
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={stage !== 'input'}
            placeholder="Describe what you want for this section..."
            className="flex-1 min-h-[200px] bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-white placeholder-zinc-600 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 disabled:opacity-50"
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

                  {/* Contact Form Instructions */}
                  {isContactSection && <ContactFormInstructions />}

                  {/* Opus Proactive Suggestions */}
                  {(opusSuggestions.length > 0 || isLoadingSuggestions) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">🐣</span>
                        <h4 className="text-sm font-semibold text-violet-400">
                          Opus suggests...
                        </h4>
                        {isLoadingSuggestions && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-3 h-3 border border-violet-400 border-t-transparent rounded-full"
                          />
                        )}
                      </div>
                      <div className="space-y-2">
                        {opusSuggestions.map((suggestion, index) => (
                          <motion.button
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleApplySuggestion(suggestion, index)}
                            disabled={appliedSuggestions.has(index) || isUserRefining}
                            className={`w-full text-left p-3 rounded-lg text-sm transition-all flex items-start gap-2 ${
                              appliedSuggestions.has(index)
                                ? 'bg-violet-500/20 text-violet-300 opacity-50'
                                : 'bg-zinc-800/50 text-zinc-300 hover:bg-violet-500/20 hover:text-violet-300'
                            }`}
                          >
                            <span className="mt-0.5">
                              {appliedSuggestions.has(index) ? '✓' : '→'}
                            </span>
                            <span>{suggestion}</span>
                          </motion.button>
                        ))}
                      </div>
                      <p className="text-xs text-zinc-500 mt-3">
                        Click a suggestion to apply it, or type your own below
                      </p>
                    </motion.div>
                  )}
                  
                  {/* Refine Prompt Input */}
                  <div className="mt-4">
                    <label className="text-xs font-medium text-zinc-400 mb-2 block">
                      {opusSuggestions.length > 0 ? 'Or describe your own changes:' : 'Want to make changes? Describe what to refine:'}
                    </label>
                    <div className="flex gap-2">
                      <textarea
                        ref={refineTextareaRef}
                        value={refinePrompt}
                        onChange={(e) => setRefinePrompt(e.target.value)}
                        disabled={isUserRefining}
                        placeholder="e.g., Make the buttons larger, change the color to blue..."
                        className="flex-1 min-h-[60px] max-h-[100px] bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-sm text-white placeholder-zinc-600 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 disabled:opacity-50"
                      />
                    </div>
                    <button
                      onClick={handleUserRefine}
                      disabled={!refinePrompt.trim() || isUserRefining}
                      className="w-full mt-2 py-2 rounded-lg bg-violet-500/20 border border-violet-500/30 text-violet-300 text-sm font-medium hover:bg-violet-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isUserRefining ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="inline-block"
                          >
                            🐣
                          </motion.span>
                          Refining...
                        </>
                      ) : (
                        <>🐣 Refine Section</>
                      )}
                    </button>
                  </div>

                  {/* Review prompt */}
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <p className="text-xs text-emerald-400 text-center">
                      👀 Review the preview and make any refinements before continuing
                    </p>
                  </div>
                  
                  {/* Next Section Button */}
                  {!isLastSection && (
                    <button
                      onClick={onNextSection}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
                    >
                      Looks good! Continue to Next Section →
                    </button>
                  )}
                  
                  {/* Rebuild Button */}
                  <button
                    onClick={handleRebuild}
                    className="w-full py-2 text-sm text-red-400/70 hover:text-red-400 transition-colors flex items-center justify-center gap-1"
                  >
                    <span>🔄</span> Start Over (Rebuild from scratch)
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Tips & AI Pipeline Info */}
        <div className="p-4 bg-zinc-900/30 border-t border-zinc-800 flex-shrink-0">
          <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
            AI Pipeline
          </h4>
          <ul className="text-xs text-zinc-600 space-y-1">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span><strong className="text-emerald-400">Sonnet</strong> builds your section</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-500"></span>
              <span><strong className="text-violet-400">Opus</strong> polishes accessibility & details</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span><strong className="text-blue-400">Gemini</strong> audits final site consistency</span>
            </li>
          </ul>
        </div>

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

      {/* Right: Preview Panel */}
      <div className="w-1/2 flex flex-col bg-zinc-900/30 min-h-0 max-h-full overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
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
            ) : stage === 'refining' || isUserRefining ? (
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-violet-400"
                >
                  🐣
                </motion.div>
                <span className="text-sm font-medium bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                  {isUserRefining ? 'Applying your changes...' : 'Opus is polishing...'}
                </span>
              </div>
            ) : (
              <h3 className="text-sm font-medium text-zinc-400">
                {showCode ? 'Code' : 'Preview'}
              </h3>
            )}
            {generatedCode && stage === 'complete' && !isUserRefining && (
              <button
                onClick={() => setShowCode(!showCode)}
                className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
              >
                {showCode ? '← Preview' : 'View Code →'}
              </button>
            )}
          </div>
          {(generatedCode || streamingCode) && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors flex items-center gap-1"
              >
                {copied ? (
                  <><span className="text-emerald-400">✓</span> Copied!</>
                ) : (
                  <><span>📋</span> Copy Code</>
                )}
              </button>
              {stage === 'complete' && (
                <>
                  <span className="text-emerald-400 text-xs">⚡ Sonnet</span>
                  {refined && <span className="text-violet-400 text-xs">+ 🐣 Opus</span>}
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 flex min-h-0">
          {/* Show streaming code during generation or user refinement */}
          {((stage === 'generating' || stage === 'refining') && streamingCode) || (isUserRefining && streamingCode) ? (
            <div className="flex-1 overflow-auto p-4 bg-zinc-950">
              <pre className="text-xs font-mono whitespace-pre-wrap">
                <code className={(stage === 'refining' || isUserRefining) ? 'text-violet-400' : 'text-emerald-400'}>
                  {streamingCode}
                </code>
                <span className="animate-pulse">▊</span>
              </pre>
              <div ref={codeEndRef} />
            </div>
          ) : showCode && generatedCode ? (
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
