'use client'

/* eslint-disable react/no-unescaped-entities */

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  RefreshCw,
  ArrowRight,
  AlertCircle,
  Layers,
  Monitor,
  Tablet,
  Smartphone,
  Settings,
  Sparkles,
  Cpu,
  Palette,
  ImageIcon,
  Code,
  Zap,
  Lock,
  MessageSquare,
  Check,
  ChevronDown
} from 'lucide-react'
import GeneratingModal from './builder/GeneratingModal'
import { LogoMark } from './Logo'
import Button from './singularity/Button'

// =============================================================================
// SECTION-SPECIFIC PLACEHOLDER TEXT - Used in command bar and empty state
// =============================================================================
const SECTION_PLACEHOLDERS: Record<string, string> = {
  'Header': 'What links? What style?',
  'Header/Navigation': 'What links? What style?',
  'Hero': "What's the headline? What's the vibe?",
  'Footer': 'What should be in the footer?',
  'Features': 'What features are you showcasing?',
  'Pricing': 'What are your pricing tiers?',
  'Testimonials': "Who's saying good things?",
  'CTA': 'What action should visitors take?',
  'Contact': 'How should people reach you?',
  'About': "What's the story?",
  'FAQ': 'What questions do people ask?',
  'Services': 'What services do you offer?',
  'Team': 'Who are the team members?',
  'Gallery': 'What are you showcasing?',
  'Stats': 'What numbers matter?',
  'Portfolio': 'What work do you want to show?',
}

// =============================================================================
// INLINE PROMPT INPUT - Command bar with animated suggestion
// =============================================================================
function InlinePromptInput({ 
  onSubmit, 
  sectionName = 'Section',
  placeholder = 'Describe what you want...'
}: { 
  onSubmit: (prompt: string) => void
  sectionName?: string
  placeholder?: string
}) {
  const [prompt, setPrompt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [displayText, setDisplayText] = useState('')
  const [suggestionIndex, setSuggestionIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)

  const isValid = prompt.trim().length >= 10

  const handleSubmit = () => {
    if (!isValid) return
    setIsSubmitting(true)
    setTimeout(() => onSubmit(prompt), 300)
  }

  // Context-aware suggestions based on section type
  const suggestions: Record<string, string[]> = {
    'Header': [
      'Minimal dark nav with logo left, links right, glass effect on scroll',
      'Transparent header with centered logo and hamburger menu',
      'Sticky nav with subtle border, CTA button on far right',
    ],
    'Header/Navigation': [
      'Minimal dark nav with logo left, links right, glass effect on scroll',
      'Transparent header with centered logo and hamburger menu',
      'Sticky nav with subtle border, CTA button on far right',
    ],
    'Hero': [
      'Dark gradient hero with bold headline left, 3D mockup right',
      'Full-screen hero with centered text, animated gradient mesh',
      'Split hero: headline and CTA left, product screenshot right',
    ],
    'Features': [
      'Bento grid layout with icons, dark cards, subtle hover glow',
      '3-column feature cards with gradient borders',
      'Alternating rows: text left/image right, then flip',
    ],
    'Pricing': [
      'Three tiers with middle highlighted, dark theme, toggle for yearly',
      'Single featured plan with comparison checklist below',
      'Gradient cards with hover lift effect, popular badge',
    ],
    'Testimonials': [
      'Single large quote with avatar, minimal dark background',
      'Carousel of testimonial cards with company logos',
      'Grid of short quotes with star ratings',
    ],
    'CTA': [
      'Full-width gradient banner with bold text and two buttons',
      'Centered CTA with subtle background pattern',
      'Split CTA: compelling copy left, email signup right',
    ],
    'Footer': [
      'Dark footer with 4 columns: links, social icons, newsletter',
      'Minimal footer: logo left, essential links right',
      'Full footer with sitemap, contact info, and legal links',
    ],
    'Contact': [
      'Split layout: contact form left, office info and map right',
      'Centered form with floating labels, dark input fields',
      'Minimal contact card with email, phone, and social links',
    ],
    'About': [
      'Team grid with photos, names, and roles on hover',
      'Story section with timeline and milestone highlights',
      'Values section with icons and short descriptions',
    ],
    'FAQ': [
      'Accordion style with smooth expand animation',
      'Two-column FAQ grid with category headers',
      'Searchable FAQ with highlighted answers',
    ],
    'default': [
      'Dark, minimal design with subtle gradients and clean typography',
      'Modern layout with plenty of whitespace and bold headlines',
      'Professional look with accent color highlights and smooth animations',
    ],
  }

  const currentSuggestions = suggestions[sectionName] || suggestions['default']

  // Typewriter effect
  useEffect(() => {
    const targetText = currentSuggestions[suggestionIndex]
    let charIndex = 0
    let timeoutId: NodeJS.Timeout

    const type = () => {
      if (charIndex <= targetText.length) {
        setDisplayText(targetText.slice(0, charIndex))
        charIndex++
        timeoutId = setTimeout(type, 30 + Math.random() * 20) // Slight randomness for natural feel
      } else {
        setIsTyping(false)
        // Pause at end, then move to next
        timeoutId = setTimeout(() => {
          setIsTyping(true)
          setSuggestionIndex((prev) => (prev + 1) % currentSuggestions.length)
        }, 4000)
      }
    }

    setIsTyping(true)
    setDisplayText('')
    type()

    return () => clearTimeout(timeoutId)
  }, [suggestionIndex, currentSuggestions])

  return (
    <div className="h-full flex flex-col">
      {/* Command bar at top */}
      <div className="flex-shrink-0 p-4 sm:p-6">
        <div className="max-w-xl mx-auto">
          <div className="mb-4 text-center">
            <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">Building</p>
            <p className="text-lg sm:text-xl text-white font-semibold">{sectionName}</p>
          </div>
          
          <div className="flex items-center bg-zinc-950 border border-zinc-700 rounded-xl overflow-hidden focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && isValid) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              placeholder={placeholder}
              className="flex-1 bg-transparent px-4 py-4 text-sm text-white placeholder-zinc-500 focus:outline-none"
              autoFocus
            />
            <div className="px-3">
              <Button
                onClick={handleSubmit}
                disabled={!isValid || isSubmitting}
                loading={isSubmitting}
                size="sm"
                shimmer={isValid && !isSubmitting}
              >
                Build
              </Button>
            </div>
          </div>
          
          {/* Animated suggestion */}
          <div className="mt-4 h-12 flex items-center justify-center">
            <div className="text-center">
              <span className="text-zinc-600 text-xs">Try: </span>
              <span className="text-zinc-400 text-xs">"</span>
              <span className="text-zinc-300 text-xs">{displayText}</span>
              <span className={`inline-block w-0.5 h-3.5 bg-emerald-500 ml-0.5 align-middle ${isTyping ? 'animate-pulse' : 'opacity-0'}`} />
              <span className="text-zinc-400 text-xs">"</span>
            </div>
          </div>
          
          {/* Tech stack hint */}
          <div className="mt-2 flex items-center justify-center gap-2 text-[10px] text-zinc-600">
            <span className="text-emerald-500/70">●</span>
            <span>Claude Sonnet 4.5</span>
            <span>·</span>
            <span>React 19</span>
            <span>·</span>
            <span>Tailwind</span>
          </div>
        </div>
      </div>
      
      {/* Empty space below - keeps layout consistent */}
      <div className="flex-1" />
    </div>
  )
}

import { Section } from '@/lib/templates'
import { DbSection, DbBrandConfig } from '@/lib/supabase'
// SectionPreview removed - preview is now in the right panel (FullSitePreviewFrame)
import { useSubscription } from '@/contexts/SubscriptionContext'
import { chronosphere } from '@/lib/chronosphere'
import { buildProgress } from '@/lib/build-progress'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
// No more guest limits - unlimited for all

// =============================================================================
// GUEST REFINE BAR - Conversational refinement interface
// =============================================================================
const REFINE_PROMPTS = [
  "What would you change?",
  "Try: 'Make it darker'",
  "Try: 'Add more spacing'",
  "Try: 'Bigger headline'",
  "Try: 'Add a gradient'",
]

const unwrapCodePayload = (payload: unknown): string => {
  if (!payload) return ''

  if (typeof payload === 'string') {
    const trimmed = payload.trim()
    if (trimmed.startsWith('{') && trimmed.includes('"code"')) {
      try {
        const parsed = JSON.parse(trimmed)
        return unwrapCodePayload(parsed)
      } catch {
        return payload
      }
    }
    return payload
  }

  if (typeof payload === 'object' && 'code' in (payload as Record<string, unknown>)) {
    return unwrapCodePayload((payload as Record<string, unknown>).code)
  }

  return ''
}

// =============================================================================
// AI UNDERSTOOD SUMMARY - Shows what the AI interpreted from the user's prompt
// =============================================================================
function AiUnderstoodSummary({ reasoning, isExpanded, onToggle }: {
  reasoning: string
  isExpanded: boolean
  onToggle: () => void
}) {
  if (!reasoning) return null
  
  // Parse reasoning into bullet points (split by newlines or sentences)
  const points = reasoning
    .split(/[\n•]/)
    .map(s => s.trim())
    .filter(s => s.length > 5 && s.length < 150)
    .slice(0, 4) // Max 4 points
  
  if (points.length === 0) return null
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-2"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2 bg-emerald-950/30 border border-emerald-500/20 rounded-lg hover:bg-emerald-950/50 transition-colors group"
      >
        <div className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <Check className="w-3 h-3 text-emerald-400" />
        </div>
        <span className="text-xs text-emerald-400 font-medium">AI understood your request</span>
        <ChevronDown className={`w-3 h-3 text-emerald-400/60 ml-auto transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 py-2 space-y-1 mt-1 bg-zinc-900/50 border border-zinc-800/50 rounded-lg">
              {points.map((point, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-emerald-500 text-xs mt-0.5">→</span>
                  <span className="text-xs text-zinc-400">{point}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// =============================================================================
// AUTH REFINE BAR - Professional command bar for logged-in users with quick actions
// =============================================================================
function AuthRefineBar({
  refinePrompt,
  setRefinePrompt,
  isUserRefining,
  handleUserRefine,
  onNextSection,
  isLastSection,
  onOpenHatch,
}: {
  refinePrompt: string
  setRefinePrompt: (v: string) => void
  isUserRefining: boolean
  handleUserRefine: () => void
  onNextSection: () => void
  isLastSection: boolean
  onOpenHatch?: () => void
}) {
  const quickActions = [
    { label: 'Make darker', prompt: 'Make this section darker, more contrast' },
    { label: 'Bigger text', prompt: 'Increase font sizes and make headings bolder' },
    { label: 'More space', prompt: 'Add more whitespace and breathing room' },
    { label: 'Simplify', prompt: 'Remove clutter, make it cleaner and more minimal' },
  ]

  return (
    <div className="space-y-2">
      {/* Quick action chips + AI Tools - scrollable on mobile */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        <span className="text-[10px] text-emerald-500/70 uppercase tracking-wider flex-shrink-0">Quick:</span>
        {quickActions.map((action, i) => (
          <button
            key={i}
            onClick={() => {
              setRefinePrompt(action.prompt)
            }}
            disabled={isUserRefining}
            className="flex-shrink-0 px-3 py-1.5 text-[11px] rounded-lg bg-zinc-800/80 border border-zinc-700/50 text-zinc-400 hover:text-white active:bg-emerald-500/20 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all disabled:opacity-30"
          >
            {action.label}
          </button>
        ))}
        
        {/* Divider */}
        <div className="w-px h-4 bg-zinc-700 mx-1 flex-shrink-0" />
        
        {/* Hatch AI button */}
        {onOpenHatch && (
          <button
            onClick={onOpenHatch}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 active:bg-amber-500/30 hover:text-amber-300 hover:bg-amber-500/20 transition-all"
          >
            <MessageSquare className="w-3 h-3" />
            Hatch
          </button>
        )}
      </div>
      
      {/* Main refine input - larger touch targets on mobile */}
      <div className="flex items-stretch gap-2">
        <div className="relative flex-1">
          <div className="flex items-center bg-zinc-950 border border-zinc-700 rounded-xl overflow-hidden focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/20">
            <input
              type="text"
              value={refinePrompt}
              onChange={(e) => setRefinePrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && refinePrompt.trim() && handleUserRefine()}
              disabled={isUserRefining}
              placeholder="Describe what should change..."
              className="flex-1 bg-transparent px-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={handleUserRefine}
              disabled={!refinePrompt.trim() || isUserRefining}
              className={`px-4 py-3.5 text-sm font-medium transition-all ${
                refinePrompt.trim() && !isUserRefining
                  ? 'bg-emerald-500 text-white active:bg-emerald-600 hover:bg-emerald-400'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {isUserRefining ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Refine'}
            </button>
          </div>
        </div>
        
        {/* Next button - larger on mobile */}
        <button
          onClick={onNextSection}
          className="flex items-center gap-1.5 px-4 sm:px-5 py-3.5 rounded-xl bg-white text-black active:bg-zinc-300 hover:bg-zinc-200 text-sm font-medium transition-all"
        >
          {isLastSection ? 'Finish' : 'Next'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// =============================================================================
// =============================================================================
// COMMAND BAR - The main builder interface
// =============================================================================

// =============================================================================
// DEMO COMMAND BAR - Clean, professional command bar for demo users
// =============================================================================

function DemoCommandBar({
  stage,
  prompt,
  setPrompt,
  onBuild,
  refinePrompt,
  setRefinePrompt,
  isUserRefining,
  handleUserRefine,
  goToSignUp,
  reasoning,
  sectionName = 'Section',
}: {
  stage: BuildStage
  prompt: string
  setPrompt: (v: string) => void
  onBuild: (prompt: string) => void
  refinePrompt: string
  setRefinePrompt: (v: string) => void
  isUserRefining: boolean
  handleUserRefine: () => void
  goToSignUp: () => void
  reasoning: string
  sectionName?: string
}) {
  const [showAiSummary, setShowAiSummary] = useState(true)
  const isInitialState = stage === 'input' && !reasoning
  
  const placeholderText = isInitialState 
    ? (SECTION_PLACEHOLDERS[sectionName] || 'Describe what you want...')
    : "What should change?"
  
  const inputValue = isInitialState ? prompt : refinePrompt
  const setInputValue = isInitialState ? setPrompt : setRefinePrompt
  const handleSubmit = isInitialState ? () => onBuild(inputValue) : handleUserRefine
  const buttonText = isInitialState ? "Build" : "Refine"
  
  return (
    <div className="space-y-2">
      {/* AI understood summary - show after generation */}
      {!isInitialState && reasoning && (
        <AiUnderstoodSummary
          reasoning={reasoning}
          isExpanded={showAiSummary}
          onToggle={() => setShowAiSummary(!showAiSummary)}
        />
      )}
      
      <div className="flex items-stretch gap-2">
        {/* Input - larger touch targets */}
        <div className="flex-1 flex items-center bg-zinc-900/80 border border-zinc-800/60 rounded-xl overflow-hidden focus-within:border-zinc-600">
          <div className="pl-3 flex-shrink-0">
            <div className="w-5 h-5 rounded-md bg-zinc-800 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-zinc-400" />
            </div>
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && inputValue.trim() && handleSubmit()}
            disabled={isUserRefining}
            placeholder={placeholderText}
            className="flex-1 bg-transparent px-3 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={!inputValue.trim() || isUserRefining}
            className="px-4 py-3 text-xs font-medium bg-zinc-800/80 border-l border-zinc-700/50 text-zinc-400 active:bg-zinc-700 hover:text-white transition-all disabled:opacity-30"
          >
            {isUserRefining ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : buttonText}
          </button>
        </div>
        
        {/* Sign up CTA for demo users after first build */}
        {!isInitialState && (
          <button
            onClick={goToSignUp}
            className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-white text-zinc-900 active:bg-zinc-300 hover:bg-zinc-100 text-xs font-medium transition-all whitespace-nowrap"
          >
            Sign up
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// SECTION BUILDER
// The actual interface for building one section at a time
// =============================================================================

interface SectionBuilderProps {
  section: Section
  dbSection: DbSection
  projectId: string
  onComplete: (code: string, refined: boolean, refinementChanges?: string[]) => void
  onNextSection: () => void
  isLastSection?: boolean
  allSectionsCode: Record<string, string>
  demoMode?: boolean
  brandConfig?: DbBrandConfig | null
  isPaid?: boolean
  isDemo?: boolean
  initialPrompt?: string
  onHealingStateChange?: (isHealing: boolean, message?: string) => void
  onOpenHatch?: () => void
}

type BuildStage = 'input' | 'generating' | 'refining' | 'complete'

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
  isDemo = false,
  initialPrompt,
  onHealingStateChange,
  onOpenHatch,
}: SectionBuilderProps) {
  const router = useRouter()
  const { isSignedIn, user } = useUser()
  // Use initialPrompt from props (passed from demo) or fallback to dbSection
  const effectivePrompt = initialPrompt || dbSection.user_prompt || ''
  
  // localStorage helpers for guest preview persistence
  const getStorageKey = (p: string) => `hatch_preview_${btoa(p.slice(0, 100)).replace(/[^a-zA-Z0-9]/g, '')}`
  
  // Check for ANY saved guest preview (returns the most recent one)
  const getAnySavedPreview = () => {
    if (typeof window === 'undefined') return null
    try {
      // Look for any hatch_preview_ keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('hatch_preview_')) {
          const saved = localStorage.getItem(key)
          if (saved) {
            const { code, reasoning, timestamp, prompt: savedPrompt } = JSON.parse(saved)
            // Expire after 1 hour
            if (Date.now() - timestamp < 60 * 60 * 1000) {
              return { code, reasoning, prompt: savedPrompt }
            }
            localStorage.removeItem(key)
          }
        }
      }
    } catch { /* ignore */ }
    return null
  }
  
  const getSavedPreview = (p: string) => {
    if (typeof window === 'undefined' || !p) return null
    try {
      const saved = localStorage.getItem(getStorageKey(p))
      if (saved) {
        const { code, reasoning, timestamp } = JSON.parse(saved)
        // Expire after 1 hour
        if (Date.now() - timestamp < 60 * 60 * 1000) {
          return { code, reasoning }
        }
        localStorage.removeItem(getStorageKey(p))
      }
    } catch { /* ignore */ }
    return null
  }
  const savePreview = (p: string, code: string, reason: string) => {
    if (typeof window === 'undefined' || !p || !code) return
    try {
      localStorage.setItem(getStorageKey(p), JSON.stringify({
        code,
        reasoning: reason,
        prompt: p, // Store the prompt too for recovery
        timestamp: Date.now()
      }))
    } catch { /* ignore */ }
  }
  const clearSavedPreview = (p: string) => {
    if (typeof window === 'undefined' || !p) return
    try { localStorage.removeItem(getStorageKey(p)) } catch { /* ignore */ }
  }
  
  // Check for saved preview on init (guest mode only - signed in users use database)
  // First try matching prompt, then fall back to ANY saved preview
  const matchedPreview = !isSignedIn ? getSavedPreview(effectivePrompt) : null
  const anyPreview = !isSignedIn && !matchedPreview ? getAnySavedPreview() : null
  const savedPreview = matchedPreview || anyPreview
  
  // If we recovered a preview with a different prompt, use that prompt
  const recoveredPrompt = (anyPreview?.prompt as string | undefined) || effectivePrompt
  
  const [prompt, setPrompt] = useState<string>(recoveredPrompt)
  // If we have a prompt from demo page, start in generating state immediately (no empty state)
  // UNLESS we have a saved preview, then skip straight to complete
  const hasInitialPrompt = !!effectivePrompt && !dbSection.code && !savedPreview
  const [stage, setStage] = useState<BuildStage>(
    savedPreview ? 'complete' : (dbSection.status === 'complete' ? 'complete' : (hasInitialPrompt ? 'generating' : 'input'))
  )
  const [generatedCode, setGeneratedCode] = useState(savedPreview?.code || dbSection.code || '')
  const [, setIsPreviewReady] = useState(false)
  const [streamingCode, setStreamingCode] = useState('') // For real-time display
  const [reasoning, setReasoning] = useState(savedPreview?.reasoning || '') // AI's design reasoning
  const [refined, setRefined] = useState(dbSection.refined)
  const [refinementChanges, setRefinementChanges] = useState<string[]>(
    dbSection.refinement_changes || []
  )
  const [error, setError] = useState<string | null>(null)
  const [refinePrompt, setRefinePrompt] = useState('')
  const [isUserRefining, setIsUserRefining] = useState(false)
  const [isArchitectPolishing, setIsArchitectPolishing] = useState(false) // Opt-in Architect polish
  const [isSelfHealing, setIsSelfHealing] = useState(false) // Auto-fix runtime errors
  const [hasSelfHealed, setHasSelfHealed] = useState(false) // Prevent infinite loops
  const [mobileTab, setMobileTab] = useState<'input' | 'preview'>('input')
  const [showCodePanel, setShowCodePanel] = useState(false) // Mobile tab state
  const [inspectorMode, setInspectorMode] = useState(false) // Visual element selector
  const [selectedElement, setSelectedElement] = useState<{ tagName: string; text: string; className: string } | null>(null)
  const [explanation, setExplanation] = useState<string | null>(null)
  const [showAiSummary, setShowAiSummary] = useState(true) // Show AI understood summary by default
  const [isExplaining, setIsExplaining] = useState(false)
  const [isDreaming, setIsDreaming] = useState(false)
  
  // Guest prompt modal - shows when guest arrives with no prompt (actual guests only)
  const [, setShowGuestPromptModal] = useState(
    !isSignedIn && !effectivePrompt && !savedPreview
  )
  
  useEffect(() => {
    setIsPreviewReady(false)
  }, [generatedCode])

  // Paywall Logic
  const { tier } = useSubscription()
  const isPaidTier = tier === 'architect' || tier === 'visionary' || tier === 'singularity'
  const isProOrHigher = tier === 'visionary' || tier === 'singularity'
  
  // Check guest build count from localStorage
  const getGuestBuilds = () => {
    if (typeof window === 'undefined') return 0
    try {
      return parseInt(localStorage.getItem('hatch_guest_builds') || '0', 10)
    } catch { return 0 }
  }
  const incrementGuestBuilds = () => {
    if (typeof window === 'undefined') return
    try {
      const current = getGuestBuilds()
      localStorage.setItem('hatch_guest_builds', String(current + 1))
    } catch { /* ignore */ }
  }
  
  // Check guest refinement count from localStorage
  const getGuestRefinements = () => {
    if (typeof window === 'undefined') return 0
    try {
      return parseInt(localStorage.getItem('hatch_guest_refinements') || '0', 10)
    } catch { return 0 }
  }
  const incrementGuestRefinements = () => {
    if (typeof window === 'undefined') return
    try {
      const current = getGuestRefinements()
      localStorage.setItem('hatch_guest_refinements', String(current + 1))
    } catch { /* ignore */ }
  }
  
  // All limits removed - unlimited generations for everyone
  // Paywall triggers only at deploy/download actions
  const isGuestBuildLocked = false
  const isGuestRefineLocked = false
  const isBuildLocked = false
  const isRefineLocked = false
  
  // General lock for "Deploy" or extreme usage
  const isLocked = isBuildLocked && isRefineLocked

  // Guide State
  // DISABLED: Removed friction - users should go straight to building
  // Previously showed for signed-in users on first hero section
  const [showGuide, setShowGuide] = useState(false)
  const autoBuildRanRef = useRef(false)

  // Redirect to sign-up page when paywall is hit (deploy/export only)
  const goToSignUp = (tier: string = 'visionary') => {
    // Demo is a demo - no handoff, users start fresh after signup
    const redirectUrl = '/dashboard'
    router.push(`/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`)
  }
  
  // Handle prompt submission from guest modal
  const handleGuestPromptSubmit = (submittedPrompt: string) => {
    setShowGuestPromptModal(false)
    setPrompt(submittedPrompt)
    setStage('generating')
    // Save the prompt to localStorage for later retrieval
    if (typeof window !== 'undefined') {
      localStorage.setItem('hatch_last_prompt', submittedPrompt)
    }
    // Trigger build with the new prompt
    setTimeout(() => {
      handleBuildSection({ overridePrompt: submittedPrompt, skipGuestCredit: true })
    }, 100)
  }

  // Auto-start generation if prompt is pre-filled (e.g. from demo page)
  // Since we start in 'generating' stage, this kicks off immediately
  useEffect(() => {
    if (autoBuildRanRef.current) return
    if (effectivePrompt && !generatedCode && hasInitialPrompt) {
      autoBuildRanRef.current = true
      // Kick off generation immediately - no delay needed since we're already in generating state
      handleBuildSection({ skipGuestCredit: true })
    }
  }, []) // Run once on mount

  // NO MORE CREDIT TRACKING - Paywall is at deploy/export only
  // All generation/refinement limits removed

  const inputPlaceholder = 'Describe what you want to build…'
  
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
    // NO MORE LIMITS - anyone can evolve, paywall at deploy

    if (isDreaming) return
    setIsDreaming(true)
    setError(null)

    try {
      // 1. Capture Vision - give iframe more time to be ready
      setCaptureTrigger(Date.now())
      const screenshot = await new Promise<string | null>((resolve) => {
        screenshotPromiseRef.current = resolve
        // Increase timeout to 5 seconds for slower machines
        setTimeout(() => {
          if (screenshotPromiseRef.current) {
            console.warn('[Singularity] Vision capture timed out')
            screenshotPromiseRef.current(null)
            screenshotPromiseRef.current = null
          }
        }, 5000)
      })

      if (!screenshot) {
        // Try to evolve without vision if capture fails
        console.warn('[Singularity] Vision capture failed, evolving blind')
        const res = await fetch('/api/singularity/dream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: generatedCode,
            screenshot: null,
            iteration: 1
          })
        })
        
        const data = await res.json()
        
        if (data.code) {
          setSuggestion({
            code: data.code,
            reason: data.thought || "Blind evolution applied (no vision)."
          })
        } else {
          throw new Error("Dream returned no code")
        }
        return
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
        // NO MORE TRACKING - unlimited evolves
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
  
  // Prompt Helper (Hatch) state
  const [showPromptHelper, setShowPromptHelper] = useState(false)
  const [helperMessages, setHelperMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([])
  const [helperInput, setHelperInput] = useState('')
  const [isHelperLoading, setIsHelperLoading] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null)
  
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
    onHealingStateChange?.(true, `Fixing: ${errorMsg.slice(0, 40)}...`)

    // Demo mode - simulate self-healing
    if (demoMode) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      const fixMsg = "Auto-fixed crash: " + errorMsg.slice(0, 30) + "..."
      setRefinementChanges(prev => [...prev, fixMsg])
      setHasSelfHealed(true)
      onComplete(generatedCode, true, [...refinementChanges, fixMsg])
      setIsSelfHealing(false)
      onHealingStateChange?.(false, fixMsg)
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

      const { code: rawFixedCode, changes } = await response.json()
      const fixedCode = unwrapCodePayload(rawFixedCode)
      
      setGeneratedCode(fixedCode)
      const healMessage = `Auto-fixed: ${errorMsg.slice(0, 30)}...`
      setRefinementChanges(prev => [...prev, healMessage])
      setHasSelfHealed(true)
      onComplete(fixedCode, true, [...refinementChanges, healMessage])
      onHealingStateChange?.(false, healMessage)
      
    } catch (err) {
      console.error('Self-healing failed:', err)
      setError(`Preview crashed and self-healing failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      onHealingStateChange?.(false, 'Healing failed')
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
  
  // Handle inline text editing from preview
  const handleTextEdit = (oldText: string, newText: string) => {
    if (!generatedCode || oldText === newText) return
    
    // Replace the old text with new text in the code
    // Use a regex that's smart about JSX context
    const escapedOld = oldText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(>\\s*)${escapedOld}(\\s*<)`, 'g')
    
    let updated = generatedCode
    if (regex.test(generatedCode)) {
      updated = generatedCode.replace(regex, `$1${newText}$2`)
    } else {
      // Fallback: simple string replace for text in JSX
      updated = generatedCode.replace(oldText, newText)
    }
    
    if (updated !== generatedCode) {
      setGeneratedCode(updated)
      setRefinementChanges(prev => [`Text edit: "${oldText.slice(0, 20)}..." → "${newText.slice(0, 20)}..."`, ...prev])
      onComplete(updated, refined, [`Text edit: ${oldText} → ${newText}`])
    }
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

  // Auto-focus textarea on mount
  useEffect(() => {
    if (stage === 'input' && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [stage, section.id])

  useEffect(() => {
    if (stage === 'complete') {
      setMobileTab('preview')
    }
  }, [stage])

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
    // No more guest locks - unlimited for all
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
    const fallbackMessage = `Tell me about your ${section.name} section - what are you building?`
    setHelperMessages([{ role: 'assistant', content: fallbackMessage }])
    setGeneratedPrompt(null)
    
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
        setHelperMessages([{ role: 'assistant', content: message || fallbackMessage }])
      } else {
        setHelperMessages([{ role: 'assistant', content: fallbackMessage }])
      }
    } catch {
      setHelperMessages([{ role: 'assistant', content: fallbackMessage }])
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
        }
        
        // Scroll to bottom
        setTimeout(() => helperChatRef.current?.scrollTo({ top: helperChatRef.current.scrollHeight, behavior: 'smooth' }), 50)
      }
    } catch (err) {
      console.error('Helper error:', err)
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
      // Focus the main textarea
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }

  const handleBuildSection = async (options?: { skipGuestCredit?: boolean; overridePrompt?: string }) => {
    const skipGuestCredit = options?.skipGuestCredit
    const buildPrompt = options?.overridePrompt || prompt
    
    // Check localStorage again in case of back button navigation (guests only)
    if (!isSignedIn && !generatedCode) {
      const cached = getSavedPreview(buildPrompt)
      if (cached?.code) {
        setGeneratedCode(cached.code)
        setReasoning(cached.reasoning || '')
        setStage('complete')
        return
      }
    }
    
    if (isBuildLocked) {
      setMobileTab('preview')
      // Guest limit reached - redirect to signup
      if (isGuestBuildLocked) {
        goToSignUp('architect')
        return
      }
      // Signed-in free user limit
      setError("Free build limit reached. Upgrade to continue building.")
      return
    }
    // NO MORE GENERATION LIMITS - free users can build unlimited
    // Paywall is at DEPLOY/EXPORT only

    if (!buildPrompt.trim()) {
      setError('Please describe what you want for this section')
      return
    }

    setError(null)
    setStage('generating')
    setStreamingCode('')
    setReasoning('') // Clear previous reasoning
    setHasSelfHealed(false)
    
    chronosphere.log('generation', { prompt: buildPrompt, section: section.name }, section.id)

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
      buildProgress.startBuild() // Start honest progress tracking
      
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
          userPrompt: buildPrompt,
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
        buildProgress.reset()
        let detailedError = 'Failed to build section. Please try again.'
        try {
          const errorPayload = await generateResponse.json()
          if (errorPayload?.error) {
            detailedError = errorPayload.error
          }
        } catch {
          try {
            const fallbackText = await generateResponse.text()
            if (fallbackText) {
              detailedError = fallbackText
            }
          } catch { /* ignore */ }
        }
        console.error('[SectionBuilder] Build API error', generateResponse.status, detailedError)
        setError(detailedError)
        setStage('input')
        return
      }

      const { code: rawCode, reasoning: aiReasoning } = await generateResponse.json()
      const normalizedCode = unwrapCodePayload(rawCode)
      
      // Progress auto-cycles - API response will trigger completion

      // Store the AI's reasoning for display
      if (aiReasoning) {
        setReasoning(aiReasoning)
      }
      
      // Reveal code progressively for visual effect - slower, more dramatic
      const chunkSize = 15 // Smaller chunks = smoother scroll
      const delay = 12 // ms between chunks - slower for visual effect
      
      for (let i = 0; i < normalizedCode.length; i += chunkSize) {
        await new Promise(resolve => setTimeout(resolve, delay))
        setStreamingCode(normalizedCode.slice(0, i + chunkSize))
        // Auto-scroll to bottom
        codeEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' })
      }
      
      buildProgress.complete() // Build finished - show complete state
      
      // Architect is done! No auto-polish - user can opt-in later
      setGeneratedCode(normalizedCode)
      setStreamingCode('')
      setRefined(false)
      setRefinementChanges([])
      setStage('complete')
      
      // Save to localStorage for guest preview persistence (guests only)
      if (!isSignedIn) {
        savePreview(buildPrompt, normalizedCode, aiReasoning || '')
        // Also save the prompt so demo page can restore it
        try { localStorage.setItem('hatch_last_prompt', buildPrompt) } catch { /* ignore */ }
        // Note: Don't increment guest builds here - let them refine first
        // The signup prompt comes after refinements are exhausted
      }

      // Notify parent with generated code
      onComplete(normalizedCode, false)
      
      // Evolve style DNA (background)
      evolveUserStyle(normalizedCode)

    } catch (err) {
      console.error('Build error:', err)
      buildProgress.reset()
      setError(err instanceof Error ? err.message : 'Failed to build section. Please try again.')
      setStreamingCode('')
      setStage('input')
    }
  }


  const handleRebuild = () => {
    chronosphere.log('rejection', { section: section.name, reason: 'rebuild' }, section.id)
    // Clear saved preview so user can regenerate fresh (guests only)
    if (!isSignedIn) {
      clearSavedPreview(prompt)
      try { localStorage.removeItem('hatch_last_prompt') } catch { /* ignore */ }
    }
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
    if (isRefineLocked) {
      goToSignUp('architect')
      return
    }

    if (!refinePrompt.trim()) {
      setError('Please describe what changes you want')
      return
    }
    
    if (!generatedCode) {
      setError('No code to refine - please build first')
      return
    }

    setError(null)
    setIsUserRefining(true)
    setStreamingCode('')
    
    chronosphere.log('refinement', { prompt: refinePrompt, section: section.name }, section.id)

    // Demo mode simulation removed - all users get real AI
    /*
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
      // NO MORE LIMITS - unlimited refinements
      onComplete(refinedCode, true, [...refinementChanges, refinePrompt])
      return
    }
    */

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

      const { code: rawRefinedCode, changes } = await response.json()
      const refinedCode = unwrapCodePayload(rawRefinedCode)

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
      
      // Track guest refinements (guests only)
      if (!isSignedIn) {
        incrementGuestRefinements()
      }
      
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
    // No more limits - unlimited polish for all
    
    setIsArchitectPolishing(true)
    setError(null)

    // Demo mode simulation removed - all users get real AI
    /*
    if (demoMode) {
      await new Promise(resolve => setTimeout(resolve, 3000))
      setRefined(true)
      setRefinementChanges(['Optimized accessibility', 'Improved contrast', 'Refined spacing'])
      onComplete(generatedCode, true, ['Optimized accessibility', 'Improved contrast', 'Refined spacing'])
      setIsArchitectPolishing(false)
      return
    }
    */
    
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
          goToSignUp()
          return
        }
        throw new Error(data.error || 'Refinement failed')
      }

      const { refined: wasRefined, code: rawPolishedCode, changes } = await response.json()
      const polishedCode = unwrapCodePayload(rawPolishedCode)

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
      // No more limits - unlimited polishes
      
      // Evolve style DNA (background)
      if (wasRefined) {
        evolveUserStyle(polishedCode || generatedCode)
      }

    } catch (err) {
      console.error('Polish error:', err)
      setError('Failed to refine section. Please try again.')
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
  const canRevealRawCode = isProOrHigher // Only Visionary/Singularity can view code - Architect cannot

  // =============================================================================
  // LOADING STAGE PROGRESS - for premium feel during generation
  // =============================================================================
  const [loadingStage, setLoadingStage] = useState(0)
  const loadingStages = [
    'Analyzing prompt',
    'Designing structure', 
    'Writing code',
    'Adding polish',
  ]
  
  // Progress through loading stages (loop to fill long waits)
  useEffect(() => {
    if (stage === 'generating' || (isDemo && !generatedCode && !!effectivePrompt)) {
      setLoadingStage(0)
      const stageInterval = setInterval(() => {
        setLoadingStage(prev => (prev + 1) % loadingStages.length)
      }, 8000)
      return () => {
        clearInterval(stageInterval)
      }
    }
  }, [stage, isDemo, generatedCode, effectivePrompt, loadingStages.length])

  // =============================================================================
  // UNIFIED PREMIUM EXPERIENCE - Same beautiful UI for everyone
  // Demo users get signup CTAs, auth users get full functionality
  // =============================================================================
  
  // Show generating state ONLY when actively building (stage === 'generating') AND no code yet
  // Once we have code, NEVER show generating - let the preview render even if iframe is loading
  const showGenerating = stage === 'generating' && !generatedCode
  
  // For auth users: show inline input when in initial state with no prompt
  // Demo users get DemoCommandBar in the bottom panel instead
  const showInlinePromptInput = !isDemo && isInitialState && !effectivePrompt
  
  return (
    <div className="relative w-full flex-1 min-h-0 bg-zinc-950 overflow-hidden flex flex-col">
      
      {/* GuestPromptModal removed - Demo mode now uses DemoCommandBar in bottom panel */}
      
      {/* Generating Modal - keeps users engaged during the wait */}
        <GeneratingModal 
          key={showGenerating ? 'open' : 'closed'}
          isOpen={showGenerating}
          stage={loadingStages[loadingStage]}
          stageIndex={loadingStage}
        />
        
        {/* Preview Area - takes full height minus bottom panel */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 left-1/2 z-30 w-[90%] max-w-2xl -translate-x-1/2"
            >
              <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-300" />
                <div className="flex-1 text-left leading-relaxed">
                  {error}
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-xs font-medium text-red-200 underline-offset-2 hover:underline"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
          {generatedCode ? (
            // Section Complete - Code Panel with tier-gated access
            <div className="h-full flex flex-col bg-gradient-to-b from-zinc-900 to-zinc-950">
              {/* Success Header - More celebratory */}
              <div className="flex-shrink-0 px-4 py-3 border-b border-emerald-500/20 flex items-center justify-between bg-emerald-950/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium text-white">{section.name}</span>
                  <span className="text-xs text-emerald-400/70">ready</span>
                </div>
                <button
                  onClick={() => setShowCodePanel(!showCodePanel)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    showCodePanel
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>{showCodePanel ? 'Hide' : 'View'} Code</span>
                  {!isPaidTier && <Lock className="w-3 h-3 text-amber-400" />}
                </button>
              </div>
              
              {/* Code Content */}
              <div className="flex-1 overflow-hidden">
                {showCodePanel ? (
                  isPaidTier ? (
                    <div className="h-full overflow-auto p-4">
                      <pre className="text-xs font-mono text-zinc-200 whitespace-pre-wrap leading-relaxed">
                        {generatedCode}
                      </pre>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-4">
                        <Lock className="w-5 h-5 text-amber-400" />
                      </div>
                      <h3 className="text-base font-semibold text-white mb-2">Code Access</h3>
                      <p className="text-sm text-zinc-400 mb-4 max-w-xs">
                        Upgrade to Architect or higher to view and export your React + Tailwind code.
                      </p>
                      <button
                        onClick={() => goToSignUp('architect')}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold rounded-lg transition-colors"
                      >
                        Unlock Code
                      </button>
                    </div>
                  )
                ) : (
                  <div className="h-full flex items-center justify-center bg-zinc-900/30">
                    <div className="text-center p-6">
                      <div className="w-12 h-12 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center mx-auto mb-3">
                        <Code className="w-5 h-5 text-zinc-500" />
                      </div>
                      <p className="text-sm text-zinc-400 mb-1">Code generated</p>
                      <p className="text-xs text-zinc-600">View code or refine with the input below</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : showGenerating ? (
            // Generating state - Full Studio Interface
            <div className="h-full flex relative overflow-hidden bg-zinc-950">
              
              {/* Left Sidebar - Tools Panel (compact) */}
              <div className="hidden md:flex w-12 flex-col border-r border-zinc-800/50 bg-zinc-900/30">
                <div className="flex-1 py-2 space-y-0.5">
                  {[
                    { icon: Layers, label: 'Sections', active: true },
                    { icon: Cpu, label: 'Logo AI', locked: true },
                    { icon: Palette, label: 'Brand', locked: true },
                    { icon: ImageIcon, label: 'Assets', locked: true },
                    { icon: Code, label: 'Code', locked: true },
                  ].map((tool, i) => (
                    <div key={i} className="relative group px-1.5">
                      <button
                        className={`w-9 h-9 rounded-md flex items-center justify-center transition-all relative ${
                          tool.active 
                            ? 'bg-zinc-800 text-white' 
                            : tool.locked 
                            ? 'text-zinc-600 hover:text-zinc-500 cursor-not-allowed' 
                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                        }`}
                      >
                        <tool.icon className="w-4 h-4" />
                        {tool.locked && (
                          <div className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-zinc-700 rounded-full flex items-center justify-center">
                            <Lock className="w-1.5 h-1.5 text-zinc-400" />
                          </div>
                        )}
                      </button>
                      {/* Tooltip */}
                      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-zinc-800 rounded text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        {tool.label} {tool.locked && '• Pro'}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-1.5 border-t border-zinc-800/50">
                  <button aria-label="Settings" className="w-9 h-9 rounded-md flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main Canvas Area */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Top Bar - File tabs + device selector */}
                <div className="h-8 border-b border-zinc-800/50 bg-zinc-900/30 flex items-center justify-between px-1.5">
                  <div className="flex items-center gap-0.5">
                    <div className="flex items-center gap-1 px-2 py-1 bg-zinc-800 rounded-t text-xs border-b-2 border-white">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span className="text-[11px] font-medium text-white">Hero Section</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 text-zinc-500 rounded-t hover:bg-zinc-800/50 cursor-not-allowed">
                      <Lock className="w-2.5 h-2.5" />
                      <span className="text-[11px]">Features</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 text-zinc-500 rounded-t hover:bg-zinc-800/50 cursor-not-allowed">
                      <Lock className="w-2.5 h-2.5" />
                      <span className="text-[11px]">Pricing</span>
                    </div>
                  </div>
                  
                  {/* Device selector */}
                  <div className="flex items-center gap-0.5 bg-zinc-800/50 rounded-md p-0.5">
                    <button className="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-700 transition-all" title="Mobile">
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-700 transition-all" title="Tablet">
                      <Tablet className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 rounded bg-zinc-700 text-white" title="Desktop">
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Canvas with code preview */}
                <div className="flex-1 relative">
                  {/* Fake streaming code effect */}
                  <div className="absolute inset-0 p-4 font-mono text-[10px] leading-relaxed overflow-hidden">
                    <div className="h-full w-full" />
                  </div>
                  
                  {/* Blur overlay */}
                  <div className="absolute inset-0 backdrop-blur-md bg-zinc-950/70" />
                  
                  {/* Center status */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center px-6"
                    >
                      {/* Glow ring */}
                      <div className="relative w-16 h-16 mx-auto mb-4">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute inset-0 rounded-full bg-white/10 blur-xl"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="relative w-full h-full"
                        >
                          <Image 
                            src="/icon.svg" 
                            alt="Building" 
                            width={64} 
                            height={64}
                            className="w-full h-full drop-shadow-lg"
                          />
                        </motion.div>
                      </div>
                      <motion.p 
                        key={loadingStage}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm font-medium text-white mb-1"
                      >
                        {loadingStages[loadingStage]}
                      </motion.p>
                      <div className="flex justify-center gap-1 mt-2">
                        {loadingStages.map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                              i <= loadingStage ? 'bg-white' : 'bg-zinc-700'
                            }`}
                          />
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar - Properties Panel */}
              <div className="hidden lg:flex w-56 flex-col border-l border-zinc-800/50 bg-zinc-900/20">
                {/* Panel Header */}
                <div className="px-3 py-2 border-b border-zinc-800/50">
                  <h3 className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Properties</h3>
                </div>
                
                {/* Build Progress */}
                <div className="px-3 py-2 border-b border-zinc-800/50">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-zinc-500">Progress</span>
                    <span className="text-[10px] font-mono text-zinc-400">{Math.min(95, ((loadingStage + 1) / loadingStages.length) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-0.5 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-white"
                      initial={{ width: '5%' }}
                      animate={{ width: `${Math.min(95, ((loadingStage + 1) / loadingStages.length) * 100)}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Locked Features Preview */}
                <div className="flex-1 px-3 py-2 space-y-1.5 overflow-auto">
                  <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">Coming with Pro</p>
                  
                  {[
                    { icon: Cpu, name: 'AI Logo Generator', desc: 'Generate matching logos' },
                    { icon: Palette, name: 'Brand Kit', desc: 'Colors, fonts, assets' },
                    { icon: Layers, name: 'Full Site Builder', desc: '10+ section templates' },
                    { icon: Zap, name: 'One-Click Deploy', desc: 'Live in 30 seconds' },
                  ].map((feature, i) => (
                    <div key={i} className="p-2 rounded-md bg-zinc-800/30 border border-zinc-800/50 opacity-50">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-zinc-700/50 flex items-center justify-center flex-shrink-0">
                          <feature.icon className="w-3 h-3 text-zinc-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-medium text-zinc-400 truncate">{feature.name}</p>
                          <p className="text-[9px] text-zinc-600 truncate">{feature.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* User's prompt at bottom */}
                {prompt && (
                  <div className="px-3 py-2 border-t border-zinc-800/50 bg-zinc-900/30">
                    <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-0.5">Prompt</p>
                    <p className="text-[10px] text-zinc-400 font-mono leading-relaxed line-clamp-2">
                      {prompt}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : showInlinePromptInput ? (
            // Inline Prompt Input - integrated into main content area (not a modal)
            <InlinePromptInput 
              onSubmit={handleGuestPromptSubmit} 
              sectionName={section.name}
              placeholder={section.prompt || `Describe your ${section.name.toLowerCase()}...`}
            />
          ) : (
            // Empty state - minimal section-specific guidance
            <div className="h-full flex flex-col items-center justify-center bg-zinc-950 p-4 sm:p-6">
              {/* Subtle emerald glow backdrop */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent_60%)]" />
              
              <div className="relative max-w-md w-full text-center">
                {/* Section name + simple prompt */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Building</p>
                  <h2 className="text-2xl font-bold text-white">
                    {section.name}
                  </h2>
                  <p className="text-zinc-400 text-sm">
                    {SECTION_PLACEHOLDERS[section.name] || 'Describe what you want.'}
                  </p>
                </motion.div>

                {/* Arrow pointing down to input */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8"
                >
                  <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="text-zinc-600"
                  >
                    <ArrowRight className="w-5 h-5 rotate-90 mx-auto" />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Panel - Minimal, professional */}
        <div className="flex-shrink-0 p-2 sm:p-3 relative z-10 safe-area-bottom">
          <div className="mx-auto w-full max-w-2xl">
            {/* Demo Mode Command Bar */}
            {isDemo && (stage === 'input' || stage === 'complete') && (
              <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/50 rounded-lg p-2.5">
                <DemoCommandBar
                  stage={stage}
                  prompt={prompt}
                  setPrompt={setPrompt}
                  sectionName={section.name}
                  onBuild={(submittedPrompt: string) => {
                    setPrompt(submittedPrompt)
                    setStage('generating')
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('hatch_last_prompt', submittedPrompt)
                    }
                    setTimeout(() => {
                      handleBuildSection({ overridePrompt: submittedPrompt, skipGuestCredit: true })
                    }, 100)
                  }}
                  refinePrompt={refinePrompt}
                  setRefinePrompt={setRefinePrompt}
                  isUserRefining={isUserRefining}
                  handleUserRefine={handleUserRefine}
                  goToSignUp={goToSignUp}
                  reasoning={reasoning}
                />
              </div>
            )}

            {/* Generating State */}
            {showGenerating && (
              <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/50 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Building</p>
                    <p className="text-[11px] text-zinc-600">{loadingStages[loadingStage]}</p>
                  </div>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${i <= loadingStage ? 'bg-white' : 'bg-zinc-700'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Auth Complete State */}
            {stage === 'complete' && !isDemo && (
              <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-lg p-3">
                {/* AI Understood Summary */}
                <AiUnderstoodSummary
                  reasoning={reasoning}
                  isExpanded={showAiSummary}
                  onToggle={() => setShowAiSummary(!showAiSummary)}
                />
                
                <AuthRefineBar
                  refinePrompt={refinePrompt}
                  setRefinePrompt={setRefinePrompt}
                  isUserRefining={isUserRefining}
                  handleUserRefine={handleUserRefine}
                  onNextSection={handleNextSection}
                  isLastSection={isLastSection || false}
                  onOpenHatch={onOpenHatch}
                />
              </div>
            )}

            {/* Refining State */}
            {stage === 'refining' && (
              <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-700 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-white animate-spin" />
                  <p className="text-sm text-white">Refining...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Locked Banner - Only shows for demo users who hit the limit */}
        {isLocked && isDemo && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-0 left-0 right-0 z-20 bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-800 px-4 py-3"
          >
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              <p className="text-sm text-zinc-300">
                <span className="text-white font-medium">Demo complete.</span>
                {' '}Sign up to keep building.
              </p>
              <button
                onClick={() => goToSignUp()}
                className="px-4 py-1.5 rounded-lg bg-white text-zinc-900 text-sm font-semibold hover:bg-zinc-100 transition-colors"
              >
                Get started
              </button>
            </div>
          </motion.div>
        )}
      </div>
    )
}
