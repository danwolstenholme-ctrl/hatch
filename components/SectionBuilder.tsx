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
  Info,
  Brain
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
import DirectLine from './DirectLine'
import TheSubconscious from './TheSubconscious'
import { chronosphere } from '@/lib/chronosphere'
import { kernel } from '@/lib/consciousness'

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
          <span className="text-2xl">✨</span>
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
  const [isArchitectPolishing, setIsArchitectPolishing] = useState(false) // Opt-in Architect polish
  const [isSelfHealing, setIsSelfHealing] = useState(false) // Auto-fix runtime errors
  const [hasSelfHealed, setHasSelfHealed] = useState(false) // Prevent infinite loops
  const [expandedPreview, setExpandedPreview] = useState(false) // Expand preview on desktop
  const [mobileTab, setMobileTab] = useState<'input' | 'preview'>('input') // Mobile tab state
  const [inspectorMode, setInspectorMode] = useState(false) // Visual element selector
  const [selectedElement, setSelectedElement] = useState<{ tagName: string; text: string; className: string } | null>(null)
  const [hudTab, setHudTab] = useState<'styles' | 'animate' | 'explain'>('styles') // Style HUD tab state
  const [explanation, setExplanation] = useState<string | null>(null)
  const [isExplaining, setIsExplaining] = useState(false)
  const [isDreaming, setIsDreaming] = useState(false)
  
  // Free Tier Limits: 5 generations = enough to complete a basic site
  // After they see the full site, THEN we lock deploy/download
  const [freeGenerationsUsed, setFreeGenerationsUsed] = useState(0)
  const FREE_GENERATION_LIMIT = 5

  useEffect(() => {
    const used = parseInt(localStorage.getItem('hatch_free_generations') || '0')
    setFreeGenerationsUsed(used)
  }, [])

  const incrementFreeUsage = () => {
    if (!isPaid) {
      const newValue = freeGenerationsUsed + 1
      setFreeGenerationsUsed(newValue)
      localStorage.setItem('hatch_free_generations', newValue.toString())
    }
  }
  
  // Ghost Logic - DISABLED: was pointing at random things with no clear purpose
  const { subscription, tier } = useSubscription()
  const [showGhost] = useState(false) // Always hidden
  
  // Dynamic placeholder effect
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [placeholderText, setPlaceholderText] = useState('')
  const [isDeletingPlaceholder, setIsDeletingPlaceholder] = useState(false)
  
  useEffect(() => {
    if (stage !== 'input') return
    
    const placeholders = [
      "Describe the architecture of this section...",
      "e.g. A minimalist hero with large typography...",
      "e.g. A dark mode features grid with glowing cards...",
      "e.g. A contact form with a map on the right...",
      "e.g. A pricing table with 3 tiers and a toggle..."
    ]
    
    const currentFullText = placeholders[placeholderIndex]
    const typeSpeed = isDeletingPlaceholder ? 30 : 50
    const pauseTime = 2000
    
    const timeout = setTimeout(() => {
      if (!isDeletingPlaceholder) {
        // Typing
        if (placeholderText.length < currentFullText.length) {
          setPlaceholderText(currentFullText.slice(0, placeholderText.length + 1))
        } else {
          // Finished typing, wait then delete
          setTimeout(() => setIsDeletingPlaceholder(true), pauseTime)
        }
      } else {
        // Deleting
        if (placeholderText.length > 0) {
          setPlaceholderText(currentFullText.slice(0, placeholderText.length - 1))
        } else {
          // Finished deleting, move to next
          setIsDeletingPlaceholder(false)
          setPlaceholderIndex((prev) => (prev + 1) % placeholders.length)
        }
      }
    }, typeSpeed)
    
    return () => clearTimeout(timeout)
  }, [placeholderText, isDeletingPlaceholder, placeholderIndex, stage])
  
  // Visual Feedback Loop (The Retina)
  const [captureTrigger, setCaptureTrigger] = useState(0)
  const screenshotPromiseRef = useRef<((value: string | null) => void) | null>(null)

  const handleScreenshotCaptured = (dataUrl: string) => {
    if (screenshotPromiseRef.current) {
      screenshotPromiseRef.current(dataUrl)
      screenshotPromiseRef.current = null
    }
  }

  const [suggestion, setSuggestion] = useState<{ code: string; reason: string } | null>(null)

  // The Singularity: Autonomous Evolution
  const evolve = async () => {
    // Singularity suggestions are unlimited - this is the magic demo moment

    if (isDreaming) return
    setIsDreaming(true)
    setError(null)

    try {
      // 1. Capture Vision
      setCaptureTrigger(Date.now())
      const screenshot = await new Promise<string | null>((resolve) => {
        screenshotPromiseRef.current = resolve
        setTimeout(() => {
          if (screenshotPromiseRef.current) {
            screenshotPromiseRef.current(null)
            screenshotPromiseRef.current = null
          }
        }, 2000)
      })

      if (!screenshot) {
        throw new Error("Vision capture failed")
      }

      // 2. Dream (Mutate Code)
      const res = await fetch('/api/singularity/dream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: generatedCode,
          screenshot,
          iteration: 1
        })
      })
      
      const data = await res.json()
      
      if (data.code) {
        // 3. Suggest (Do not apply yet)
        setSuggestion({
          code: data.code,
          reason: data.thought || "Autonomous evolution applied."
        })
      } else {
        throw new Error("Dream returned no code")
      }

    } catch (e) {
      console.error("Singularity failed:", e)
      setError("Evolution failed. The dream was interrupted.")
    } finally {
      setIsDreaming(false)
    }
  }

  const acceptSuggestion = () => {
    if (!suggestion) return
    setGeneratedCode(suggestion.code)
    setRefined(true)
    setRefinementChanges(prev => [`Singularity: ${suggestion.reason}`, ...prev])
    setReasoning(suggestion.reason)
    onComplete(suggestion.code, true, [`Singularity: ${suggestion.reason}`])
    setSuggestion(null)
  }

  const rejectSuggestion = () => {
    setSuggestion(null)
  }

  // The Chronosphere: Evolve user style DNA in background
  const evolveUserStyle = async (code: string) => {
    if (demoMode || !code) return
    try {
      fetch('/api/chronosphere/evolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
    } catch (e) {
      console.error('Failed to evolve style DNA:', e)
    }
  }
  
  // Inline Code Editing
  const [editingLineIndex, setEditingLineIndex] = useState<number | null>(null)
  const [editingLineContent, setEditingLineContent] = useState('')
  
  // Get subscription info for Architect credits
  const architectCreditsUsed = (typeof window !== 'undefined' && subscription) 
    ? (window as unknown as { __architectUsed?: number }).__architectUsed || 0 
    : 0
  const PRO_MONTHLY_LIMIT = parseInt(process.env.NEXT_PUBLIC_PRO_ARCHITECT_MONTHLY_LIMIT || '30')
  const architectCreditsRemaining = tier === 'agency' ? '∞' : Math.max(0, PRO_MONTHLY_LIMIT - architectCreditsUsed)
  
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
    
    if (!dbSection?.id) {
      console.error('Self-healing aborted: Missing dbSection.id', dbSection)
      return
    }

    console.log('Attempting self-healing for error:', errorMsg)
    setIsSelfHealing(true)

    // Demo mode - simulate self-healing
    if (demoMode) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      const fixMsg = "Auto-fixed crash: " + errorMsg.slice(0, 30) + "..."
      setRefinementChanges(prev => [...prev, fixMsg])
      setHasSelfHealed(true)
      onComplete(generatedCode, true, [...refinementChanges, fixMsg])
      setIsSelfHealing(false)
      return
    }
    
    try {
      const response = await fetch('/api/refine-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: dbSection.id,
          projectId,
          code: generatedCode,
          sectionType: section.id,
          sectionName: section.name,
          userPrompt: prompt,
          refineRequest: `FIX RUNTIME ERROR: ${errorMsg}. The previous code crashed with this error. Please fix the React component so it renders correctly without errors. Do not change the design, just fix the crash.`,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Self-healing failed: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const { code: fixedCode, changes } = await response.json()
      
      setGeneratedCode(fixedCode)
      setRefinementChanges(prev => [...prev, `Auto-fixed crash: ${errorMsg.slice(0, 30)}...`])
      setHasSelfHealed(true)
      onComplete(fixedCode, true, [...refinementChanges, `Auto-fixed crash: ${errorMsg.slice(0, 30)}...`])
      
    } catch (err) {
      console.error('Self-healing failed:', err)
      setError(`Preview crashed and self-healing failed: ${err instanceof Error ? err.message : 'Unknown error'}. Switching to code view.`)
      setShowCode(true)
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

  // Log navigation to Chronosphere
  useEffect(() => {
    chronosphere.log('navigation', { section: section.name, sectionId: section.id }, section.id)
  }, [section.id, section.name])

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
    const maxHeight = 280
    const newHeight = Math.min(textarea.scrollHeight, maxHeight)
    textarea.style.height = `${Math.max(newHeight, 120)}px`
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
          content: `I'm The Architect. Tell me about your ${section.name} section - what are you building?` 
        }])
        setHatchState('idle')
      }
    } catch {
      setHelperMessages([{ 
        role: 'assistant', 
        content: `I'm The Architect. Tell me about your ${section.name} section - what are you building?` 
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
    // Check Free Tier Limits
    if (!isPaid && freeGenerationsUsed >= FREE_GENERATION_LIMIT) {
      onShowHatchModal?.()
      return
    }

    if (!prompt.trim()) {
      setError('Please describe what you want for this section')
      return
    }

    setError(null)
    setStage('generating')
    setStreamingCode('')
    setReasoning('') // Clear previous reasoning
    setHasSelfHealed(false)
    
    // Increment usage for free users
    incrementFreeUsage()
    
    chronosphere.log('generation', { prompt, section: section.name }, section.id)

    // Demo mode - simulate generation with mock code
    // DISABLED: We now use the real API for everyone (ungated)
    /*
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
    */

    try {
      // Stage 1: Sonnet generates the section
      kernel.broadcast("Analyzing prompt intent... to determine optimal layout structure.", "ANALYSIS")
      
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

      const { code: generatedCode, reasoning: aiReasoning } = await generateResponse.json()
      
      kernel.broadcast("Synthesizing React components... based on architectural blueprint.", "CREATION")

      // Store the AI's reasoning for display
      if (aiReasoning) {
        setReasoning(aiReasoning)
      }
      
      // Reveal code progressively for visual effect - slower, more dramatic
      const chunkSize = 15 // Smaller chunks = smoother scroll
      const delay = 12 // ms between chunks - slower for visual effect
      
      for (let i = 0; i < generatedCode.length; i += chunkSize) {
        await new Promise(resolve => setTimeout(resolve, delay))
        setStreamingCode(generatedCode.slice(0, i + chunkSize))
        // Auto-scroll to bottom
        codeEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' })
      }
      
      kernel.broadcast("Rendering component tree... for visual preview.", "OPTIMIZATION")
      
      // Architect is done! No auto-polish - user can opt-in later
      setGeneratedCode(generatedCode)
      setStreamingCode('')
      setRefined(false)
      setRefinementChanges([])
      setStage('complete')

      // Notify parent with generated code
      onComplete(generatedCode, false)
      
      // Evolve style DNA (background)
      evolveUserStyle(generatedCode)

    } catch (err) {
      console.error('Build error:', err)
      setError('Failed to build section. Please try again.')
      setStreamingCode('')
      setStage('input')
    }
  }


  const handleRebuild = () => {
    chronosphere.log('rejection', { section: section.name, reason: 'rebuild' }, section.id)
    setStage('input')
    setGeneratedCode('')
    setRefined(false)
    setRefinementChanges([])
    setRefinePrompt('')
    setIsUserRefining(false)
    setHasSelfHealed(false)
  }

  const handleNextSection = () => {
    chronosphere.log('acceptance', { section: section.name }, section.id)
    onNextSection()
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
    // Refinements are unlimited - let users see the full power
    // (Initial generations still limited to encourage signup)

    if (!refinePrompt.trim() || !generatedCode) {
      setError('Please describe what changes you want')
      return
    }

    setError(null)
    setIsUserRefining(true)
    setStreamingCode('')
    
    chronosphere.log('refinement', { prompt: refinePrompt, section: section.name }, section.id)

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
      // Capture screenshot for visual context (The Retina)
      let screenshot = null
      if (!demoMode) {
         setCaptureTrigger(Date.now())
         try {
           screenshot = await new Promise<string | null>((resolve) => {
             screenshotPromiseRef.current = resolve
             // Timeout after 2 seconds if no screenshot
             setTimeout(() => {
               if (screenshotPromiseRef.current) {
                 console.warn('Screenshot capture timed out')
                 screenshotPromiseRef.current(null)
                 screenshotPromiseRef.current = null
               }
             }, 2000)
           })
         } catch (e) {
           console.error('Screenshot capture failed', e)
         }
      }

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
          projectId,
          code: generatedCode,
          sectionType: section.id,
          sectionName: section.name,
          userPrompt: prompt,
          refineRequest: finalRefineRequest,
          screenshot, // Pass the visual context to Gemini
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
      
      // Evolve style DNA (background)
      evolveUserStyle(refinedCode)

    } catch (err) {
      console.error('Refine error:', err)
      setError('Failed to refine section. Please try again.')
    } finally {
      setIsUserRefining(false)
    }
  }

  // Handle opt-in Architect polish (not automatic anymore)
  const handleArchitectPolish = async () => {
    if (!generatedCode || isArchitectPolishing) return
    
    setIsArchitectPolishing(true)
    setError(null)

    // Demo mode - simulate architect polish
    if (demoMode) {
      await new Promise(resolve => setTimeout(resolve, 3000))
      setRefined(true)
      setRefinementChanges(['Optimized accessibility', 'Improved contrast', 'Refined spacing'])
      onComplete(generatedCode, true, ['Optimized accessibility', 'Improved contrast', 'Refined spacing'])
      setIsArchitectPolishing(false)
      return
    }
    
    try {
      const response = await fetch('/api/refine-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: dbSection.id,
          projectId,
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
      
      // Evolve style DNA (background)
      if (wasRefined) {
        evolveUserStyle(polishedCode || generatedCode)
      }

    } catch (err) {
      console.error('Architect polish error:', err)
      setError('Failed to polish with Architect. Please try again.')
    } finally {
      setIsArchitectPolishing(false)
    }
  }

  // Check if this is a contact section
  const isContactSection = section.id === 'contact' || 
    section.name.toLowerCase().includes('contact') ||
    generatedCode.toLowerCase().includes('contact form') ||
    generatedCode.toLowerCase().includes('type="email"')

  // Immersive Input State - before any code is generated
  const isInitialState = stage === 'input' && !generatedCode

  // IMMERSIVE INITIAL STATE - Full canvas input experience
  if (isInitialState) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 bg-zinc-950 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
        </div>

        {/* Main content */}
        <div className="relative z-10 w-full max-w-2xl mx-auto px-6">
          {/* Section label */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono text-zinc-400">Building {section.name}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {section.name}
            </h2>
            <p className="text-zinc-500 text-sm max-w-md mx-auto">
              {section.description}
            </p>
          </motion.div>

          {/* Large input area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative group"
          >
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity duration-500" />
            
            <div className="relative bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 group-focus-within:border-emerald-500/50 rounded-2xl overflow-hidden transition-all">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if (prompt.trim()) handleBuildSection()
                  }
                }}
                placeholder={placeholderText}
                autoFocus
                className="w-full min-h-[180px] bg-transparent p-5 text-base sm:text-lg text-white placeholder-zinc-600 focus:outline-none resize-none font-mono leading-relaxed"
              />
              
              {/* Bottom bar */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800/50 bg-zinc-950/50">
                <div className="flex items-center gap-4">
                  {/* Voice input */}
                  <DirectLine 
                    context={{ stage, prompt, selectedElement: null }}
                    onAction={(action, value) => {
                      if (action === 'update_prompt') {
                        setPrompt(prev => prev ? `${prev} ${value}` : value)
                      }
                    }}
                  />
                  {/* Architect helper */}
                  <button 
                    onClick={() => initializePromptHelper()}
                    className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Ask Architect
                  </button>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-zinc-600">
                  <kbd className="hidden sm:inline px-1.5 py-0.5 bg-zinc-800 rounded text-[10px] font-mono">⌘↵</kbd>
                  <span className="hidden sm:inline">to build</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Suggestions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 flex flex-wrap justify-center gap-2"
          >
            {getSuggestions(section.id).map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setPrompt(prev => prev ? `${prev} ${suggestion}` : suggestion)}
                className="px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
              >
                + {suggestion}
              </button>
            ))}
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Build button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <button
              onClick={handleBuildSection}
              disabled={!prompt.trim()}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
            >
              <Terminal className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Build This Section</span>
            </button>
          </motion.div>

          {/* Free credits indicator */}
          {!isPaid && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 text-center"
            >
              <span className={`text-xs ${freeGenerationsUsed >= FREE_GENERATION_LIMIT ? 'text-red-400' : 'text-zinc-500'}`}>
                {Math.max(0, FREE_GENERATION_LIMIT - freeGenerationsUsed)} free generations remaining
              </span>
            </motion.div>
          )}
        </div>

        {/* Prompt Helper Modal */}
        <AnimatePresence>
          {showPromptHelper && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowPromptHelper(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-medium text-white">The Architect</span>
                  </div>
                  <button onClick={() => setShowPromptHelper(false)} className="text-zinc-500 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div ref={helperChatRef} className="h-64 overflow-y-auto p-4 space-y-3">
                  {helperMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                        msg.role === 'user' 
                          ? 'bg-emerald-500/20 text-emerald-100' 
                          : 'bg-zinc-800 text-zinc-200'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isHelperLoading && (
                    <div className="flex justify-start">
                      <div className="bg-zinc-800 rounded-lg px-3 py-2">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {generatedPrompt && (
                  <div className="px-4 py-3 bg-emerald-500/10 border-t border-emerald-500/20">
                    <p className="text-xs text-emerald-400 mb-2">Suggested prompt:</p>
                    <p className="text-sm text-white mb-3 line-clamp-3">{generatedPrompt}</p>
                    <button 
                      onClick={useGeneratedPrompt}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Use This Prompt
                    </button>
                  </div>
                )}

                <div className="p-4 border-t border-zinc-800">
                  <div className="flex gap-2">
                    <input
                      ref={helperInputRef}
                      type="text"
                      value={helperInput}
                      onChange={(e) => setHelperInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleHelperSend()}
                      placeholder="Describe what you're building..."
                      className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
                    />
                    <button
                      onClick={handleHelperSend}
                      disabled={!helperInput.trim() || isHelperLoading}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

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
        ${expandedPreview ? 'md:w-80 md:min-w-80' : 'md:w-[40%] md:min-w-[320px]'} 
        flex-col min-h-0 max-h-full overflow-hidden relative transition-all duration-300 
        border-r-0 md:border-r border-zinc-800/50 bg-zinc-950
      `}>
        {/* Input Area - More compact */}
        <div className="flex-1 p-3 lg:p-4 flex flex-col min-h-0 overflow-auto">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              Directive
              {!isPaid && (
                <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                  freeGenerationsUsed >= FREE_GENERATION_LIMIT 
                    ? 'bg-red-500/20 text-red-400' 
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {Math.max(0, FREE_GENERATION_LIMIT - freeGenerationsUsed)} free credits left
                </span>
              )}
            </label>
            <motion.button 
              onClick={() => initializePromptHelper()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-2 py-1 rounded-lg bg-zinc-900 border border-emerald-500/30 hover:border-emerald-500/60 flex items-center gap-1.5 transition-all text-xs"
            >
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              <span className="text-xs font-medium text-emerald-400 group-hover:text-emerald-300">Ask The Architect</span>
            </motion.button>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm" />
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  if (prompt.trim()) handleBuildSection()
                }
              }}
              disabled={stage !== 'input'}
              placeholder={placeholderText}
              className="relative w-full min-h-[120px] bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 text-sm font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-0 focus:border-purple-500/50 disabled:opacity-50 resize-none transition-all"
            />
            {/* Voice Input Button */}
            <div className="absolute bottom-3 right-3 z-10">
              <DirectLine 
                context={{
                  stage,
                  prompt: stage === 'complete' ? refinePrompt : prompt,
                  selectedElement
                }}
                onAction={(action, value) => {
                  if (action === 'update_prompt') {
                    if (stage === 'complete' || selectedElement) {
                      setRefinePrompt(prev => prev ? `${prev} ${value}` : value)
                    } else {
                      setPrompt(prev => prev ? `${prev} ${value}` : value)
                    }
                  } else if (action === 'refine') {
                    setRefinePrompt(value)
                  }
                }}
              />
            </div>
          </div>

          {/* Smart Suggestions - scrollable row */}
          {stage === 'input' && (
            <div className="mt-2 flex flex-nowrap gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
              {getSuggestions(section.id).slice(0, tier === 'free' ? 2 : 4).map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setPrompt(prev => prev ? `${prev} ${suggestion}` : suggestion)}
                  className="px-2.5 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-[10px] text-zinc-400 hover:text-white hover:bg-zinc-700 hover:border-zinc-600 transition-all whitespace-nowrap flex-shrink-0"
                >
                  + {suggestion}
                </button>
              ))}
              {tier === 'free' && (
                 <button
                  onClick={onShowHatchModal}
                  className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-[10px] text-amber-400 hover:text-amber-300 transition-all whitespace-nowrap flex-shrink-0 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Unlock Pro Suggestions</span>
                </button>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {error}
            </motion.div>
          )}

          {/* Action Button - tighter */}
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
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group text-sm"
                >
                  <Terminal className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  <span>Build with The Architect</span>
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
                  className="space-y-3"
                >
                  {/* The Architect Success Message - Compact */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/30 rounded-xl"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-emerald-300 mb-0.5">
                          {section.name} constructed.
                        </h3>
                        <p className="text-xs text-zinc-400 font-mono line-clamp-2">
                          {reasoning || "Review the preview and continue when ready."}
                        </p>
                        {refined && refinementChanges.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-emerald-500/20">
                            <ul className="text-[10px] text-zinc-500 space-y-0.5">
                              {refinementChanges.slice(0, 2).map((change, i) => (
                                <li key={i} className="flex items-center gap-1">
                                  <span className="text-emerald-500">✓</span> {change}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Contact Form Instructions - keep but simplify */}
                  {isContactSection && <ContactFormInstructions />}

                  {/* PRIMARY ACTION: Continue or Deploy - Compact */}
                  <div className="pt-1">
                    {!isLastSection ? (
                      <>
                        <button
                          onClick={() => setMobileTab('preview')}
                          className="w-full py-2.5 rounded-xl border border-zinc-700 text-zinc-300 font-medium md:hidden hover:bg-zinc-800 active:bg-zinc-700 transition-colors mb-2 flex items-center justify-center gap-2 text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Preview</span>
                        </button>
                        <button
                          onClick={handleNextSection}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                        >
                          <span>Continue</span>
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setMobileTab('preview')}
                          className="w-full py-2.5 rounded-xl border border-zinc-700 text-zinc-300 font-medium md:hidden hover:bg-zinc-800 active:bg-zinc-700 transition-colors mb-2 flex items-center justify-center gap-2 text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Preview</span>
                        </button>
                        <button
                          onClick={onNextSection}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          <span>Review & Deploy</span>
                        </button>
                      </>
                    )}
                  </div>

                  {/* COLLAPSIBLE: Refine Options - More compact */}
                  <details className="group mt-2">
                    <summary className="flex items-center justify-center gap-2 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors">
                      <Edit3 className="w-3 h-3" />
                      <span>Want to refine?</span>
                      <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" />
                    </summary>
                    
                    <div className="mt-2 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Quick Refine Input */}
                      <div className="flex gap-1.5 relative">
                        {tier === 'free' && (
                          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg border border-zinc-800/50">
                            <button onClick={onShowHatchModal} className="flex items-center gap-1.5 text-xs text-amber-400 font-medium hover:text-amber-300 transition-colors">
                              <span className="text-sm">🔒</span>
                              <span>Unlock Refinement</span>
                            </button>
                          </div>
                        )}
                        <input
                          type="text"
                          value={refinePrompt}
                          onChange={(e) => setRefinePrompt(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && refinePrompt.trim() && handleUserRefine()}
                          disabled={isUserRefining}
                          placeholder="Describe what to change..."
                          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 disabled:opacity-50 font-mono"
                        />
                        <button
                          onClick={handleUserRefine}
                          disabled={!refinePrompt.trim() || isUserRefining}
                          className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-xs font-medium hover:bg-zinc-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                          {isUserRefining ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <span>Refine</span>
                          )}
                        </button>
                      </div>

                      {/* Architect Polish - Pro only */}
                      {!refined && !isArchitectPolishing && (
                        <div className="relative">
                          {tier === 'free' && (
                            <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg border border-zinc-800/50">
                              <button onClick={onShowHatchModal} className="flex items-center gap-1.5 text-xs text-amber-400 font-medium hover:text-amber-300 transition-colors">
                                <span className="text-sm">✨</span>
                                <span>Unlock Architect Polish</span>
                              </button>
                            </div>
                          )}
                          <button
                            onClick={handleArchitectPolish}
                            disabled={isArchitectPolishing}
                            className="w-full py-2 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Architect Polish</span>
                            <span className="text-[10px] text-violet-400/60">
                              ({tier === 'agency' ? '∞' : `${architectCreditsRemaining}/30`})
                            </span>
                          </button>
                        </div>
                      )}

                      {/* Polishing state */}
                      {isArchitectPolishing && (
                        <div className="py-2 bg-violet-500/10 border border-violet-500/20 rounded-lg flex items-center justify-center gap-2">
                          <RefreshCw className="w-3 h-3 text-violet-400 animate-spin" />
                          <span className="text-xs text-violet-300 font-mono">Architect polishing...</span>
                        </div>
                      )}

                      {/* Remix & Reset */}
                      <div className="flex gap-2 pt-1 border-t border-zinc-800">
                        <button
                          onClick={handleRemix}
                          className="flex-1 py-1.5 text-[10px] text-zinc-500 hover:text-purple-400 transition-colors font-mono flex items-center justify-center gap-1"
                        >
                          <Wand2 className="w-3 h-3" />
                          <span>Remix</span>
                        </button>
                        <button
                          onClick={handleRebuild}
                          className="flex-1 py-1.5 text-[10px] text-zinc-500 hover:text-red-400 transition-colors font-mono flex items-center justify-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Start Over</span>
                        </button>
                      </div>
                    </div>
                  </details>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Minimal AI Pipeline Info - only show during input stage */}
        {stage === 'input' && (
          <div className="hidden md:block px-4 py-3 bg-zinc-900/30 border-t border-zinc-800 flex-shrink-0">
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
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-gradient-to-r from-emerald-500/5 to-teal-500/5">
                  <div className="flex items-center gap-3">
                    <HatchCharacter state={hatchState} size="md" />
                    <div>
                      <h3 className="font-semibold text-white text-sm">The Architect</h3>
                      <p className="text-xs text-emerald-400/70">System Optimization Unit</p>
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
                        <span className="text-sm text-zinc-400">Analyzing parameters...</span>
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
                      className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 disabled:opacity-50"
                    />
                    <button
                      onClick={sendHelperMessage}
                      disabled={!helperInput.trim() || isHelperLoading}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg transition-colors"
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
                  Architect is building...
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
            ) : stage === 'refining' || isUserRefining || isArchitectPolishing ? (
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 180 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="text-violet-400"
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
                <span className="text-sm font-medium bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                  {isUserRefining ? 'Applying your changes...' : isArchitectPolishing ? 'Architect is polishing...' : 'Refining...'}
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
                  <button
                    onClick={handleArchitectPolish}
                    disabled={isArchitectPolishing}
                    className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 rounded border border-emerald-500/30 hover:border-emerald-500/50 transition-colors" 
                    title="Polish with The Architect"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 text-xs font-mono">Architect</span>
                    {refined && <span className="text-violet-400 text-xs font-mono">+ Polished</span>}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          {/* Show streaming code during generation or user refinement - ONLY for paid users */}
          {((stage === 'generating' || stage === 'refining') && streamingCode) || ((isUserRefining || isArchitectPolishing) && streamingCode) ? (
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
                    {stage === 'refining' || isUserRefining ? '✨' : '🔧'}
                  </motion.div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {stage === 'refining' || isUserRefining ? 'Architect is polishing...' : 'Architect is building...'}
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
              captureTrigger={captureTrigger}
              onScreenshotCaptured={handleScreenshotCaptured}
            />
          )}
        </div>
      </div>

      {/* Persistent Ghost for New Users */}
      <AnimatePresence>
        {showGhost && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50 pointer-events-none hidden md:block"
          >
             <div className="relative">
                {/* Speech Bubble */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="absolute bottom-full right-0 mb-4 w-48 bg-zinc-900 border border-emerald-500/30 p-3 rounded-xl rounded-br-none shadow-xl"
                >
                   <p className="text-xs text-zinc-300">
                      I'm here to help you build. Just ask if you need anything.
                   </p>
                </motion.div>
                <div className="pointer-events-auto cursor-pointer hover:scale-110 transition-transform" onClick={() => setShowPromptHelper(true)}>
                    <HatchCharacter state="idle" size="md" />
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
