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
  MessageSquare, 
  Zap,
  Cpu,
  Hammer,
  Terminal,
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
  Eye,
  ArrowRight,
  Lock,
  Settings,
  Palette,
  Image as ImageIcon,
  Code2 as Code
} from 'lucide-react'
import GuestPromptModal from './GuestPromptModal'

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

// =============================================================================
// STREAMING CODE EFFECT - Fake code animation for loading state
// =============================================================================
const FAKE_CODE_LINES = [
  { text: "'use client'", color: 'text-purple-400' },
  { text: '', color: '' },
  { text: "import { useState } from 'react'", color: 'text-blue-400' },
  { text: "import { motion } from 'framer-motion'", color: 'text-blue-400' },
  { text: "import { Check, Star, Zap } from 'lucide-react'", color: 'text-blue-400' },
  { text: '', color: '' },
  { text: 'export default function PricingSection() {', color: 'text-yellow-400' },
  { text: '  const [selected, setSelected] = useState(1)', color: 'text-zinc-300' },
  { text: '', color: '' },
  { text: '  const tiers = [', color: 'text-zinc-300' },
  { text: "    { name: 'Starter', price: 19, features: [...] },", color: 'text-emerald-400' },
  { text: "    { name: 'Pro', price: 49, popular: true },", color: 'text-emerald-400' },
  { text: "    { name: 'Enterprise', price: 99 },", color: 'text-emerald-400' },
  { text: '  ]', color: 'text-zinc-300' },
  { text: '', color: '' },
  { text: '  return (', color: 'text-zinc-300' },
  { text: '    <section className="py-24 bg-gradient-to-b">', color: 'text-green-400' },
  { text: '      <div className="max-w-6xl mx-auto px-6">', color: 'text-green-400' },
  { text: '        <motion.h2', color: 'text-yellow-400' },
  { text: '          initial={{ opacity: 0, y: 20 }}', color: 'text-orange-400' },
  { text: '          animate={{ opacity: 1, y: 0 }}', color: 'text-orange-400' },
  { text: '          className="text-4xl font-bold text-center"', color: 'text-green-400' },
  { text: '        >', color: 'text-yellow-400' },
  { text: '          Choose Your Plan', color: 'text-zinc-100' },
  { text: '        </motion.h2>', color: 'text-yellow-400' },
  { text: '', color: '' },
  { text: '        <div className="grid md:grid-cols-3 gap-8 mt-16">', color: 'text-green-400' },
  { text: '          {tiers.map((tier, i) => (', color: 'text-zinc-300' },
  { text: '            <motion.div', color: 'text-yellow-400' },
  { text: '              key={tier.name}', color: 'text-orange-400' },
  { text: '              whileHover={{ scale: 1.02 }}', color: 'text-orange-400' },
  { text: '              className={`rounded-2xl p-8 ${', color: 'text-green-400' },
  { text: "                tier.popular ? 'bg-emerald-500' : 'bg-zinc-900'", color: 'text-emerald-400' },
  { text: '              }`}', color: 'text-green-400' },
  { text: '            >', color: 'text-yellow-400' },
]

function StreamingCodeEffect() {
  const [visibleLines, setVisibleLines] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleLines(prev => {
        if (prev >= FAKE_CODE_LINES.length) {
          return 0 // Reset and loop
        }
        return prev + 1
      })
    }, 400) // New line every 400ms
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="text-[11px] leading-5">
      {FAKE_CODE_LINES.slice(0, visibleLines).map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          className={line.color || 'text-zinc-500'}
        >
          {line.text || '\u00A0'}
        </motion.div>
      ))}
      {visibleLines < FAKE_CODE_LINES.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-2 h-4 bg-emerald-500 ml-0.5"
        />
      )}
    </div>
  )
}

import { Section } from '@/lib/templates'
import { DbSection, DbBrandConfig } from '@/lib/supabase'
import { SectionCompleteIndicator } from './SectionProgress'
import SectionPreview from './SectionPreview'
import { useSubscription } from '@/contexts/SubscriptionContext'
import ThinkingLog from './singularity/ThinkingLog'
import { chronosphere } from '@/lib/chronosphere'
import { kernel } from '@/lib/consciousness'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
// No more guest limits - unlimited for all

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
  brandConfig?: DbBrandConfig | null // Brand styling from branding step
  isPaid?: boolean // Whether project is hatched (paid)
  guestMode?: boolean // Simplified UI for unauthenticated users
  initialPrompt?: string // Prompt passed from demo page - use this to skip empty state
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
function BrandQuickReference({ brandConfig }: { brandConfig: DbBrandConfig }) {
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

// Builder Guide Overlay
const BuilderGuide = ({ onClose }: { onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-4 border border-zinc-700">
          <Terminal className="w-6 h-6 text-emerald-400" />
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">System Initialized</h3>
        <p className="text-zinc-400 text-sm mb-6">
          The interface is ready. Describe your vision to begin.
        </p>
        
        <div className="space-y-4 mb-8">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Wand2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-zinc-200">Build Sections</h4>
              <p className="text-xs text-zinc-500">Generate code instantly. Free users get 10 builds.</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
              <Wand2 className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-zinc-200">Refine & Polish</h4>
              <p className="text-xs text-zinc-500">Refine with AI. Free users get 1 trial refinement.</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-zinc-200">Deploy</h4>
              <p className="text-xs text-zinc-500">Export or deploy live. Requires Architect plan.</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors"
        >
          Initialize Builder
        </button>
      </div>
    </motion.div>
  </motion.div>
)

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
  guestMode = false,
  initialPrompt,
}: SectionBuilderProps) {
  const router = useRouter()
  const { isSignedIn, user } = useUser()
  // Use initialPrompt from props (passed from demo) or fallback to dbSection
  const effectivePrompt = initialPrompt || dbSection.user_prompt || ''
  
  // localStorage helpers for guest preview persistence
  const getStorageKey = (p: string) => `hatch_preview_${btoa(p.slice(0, 100)).replace(/[^a-zA-Z0-9]/g, '')}`
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
        timestamp: Date.now()
      }))
    } catch { /* ignore */ }
  }
  const clearSavedPreview = (p: string) => {
    if (typeof window === 'undefined' || !p) return
    try { localStorage.removeItem(getStorageKey(p)) } catch { /* ignore */ }
  }
  
  // Check for saved preview on init (guest mode)
  const savedPreview = guestMode ? getSavedPreview(effectivePrompt) : null
  
  const [prompt, setPrompt] = useState(effectivePrompt)
  // If we have a prompt from demo page, start in generating state immediately (no empty state)
  // UNLESS we have a saved preview, then skip straight to complete
  const hasInitialPrompt = !!effectivePrompt && !dbSection.code && !savedPreview
  const [stage, setStage] = useState<BuildStage>(
    savedPreview ? 'complete' : (dbSection.status === 'complete' ? 'complete' : (hasInitialPrompt ? 'generating' : 'input'))
  )
  const [generatedCode, setGeneratedCode] = useState(savedPreview?.code || dbSection.code || '')
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
  const [mobileTab, setMobileTab] = useState<'input' | 'preview'>('input') // Mobile tab state
  const [inspectorMode, setInspectorMode] = useState(false) // Visual element selector
  const [selectedElement, setSelectedElement] = useState<{ tagName: string; text: string; className: string } | null>(null)
  const [hudTab, setHudTab] = useState<'styles' | 'animate' | 'explain'>('styles') // Style HUD tab state
  const [explanation, setExplanation] = useState<string | null>(null)
  const [isExplaining, setIsExplaining] = useState(false)
  const [isDreaming, setIsDreaming] = useState(false)
  
  // Guest prompt modal - shows when guest arrives with no prompt
  const [showGuestPromptModal, setShowGuestPromptModal] = useState(
    guestMode && !effectivePrompt && !savedPreview
  )

  // Paywall Logic
  const { subscription, tier } = useSubscription()
  const isPaidTier = tier === 'architect' || tier === 'visionary' || tier === 'singularity'
  const isProOrHigher = tier === 'visionary' || tier === 'singularity'
  const isGuest = !isPaid && !isPaidTier
  
  const freeCreditsUsed = (user?.publicMetadata?.freeCreditsUsed as number) || 0
  const architectRefinementsUsed = (user?.publicMetadata?.architectRefinementsUsed as number) || 0
  
  // TIERED LIMITS:
  // - Guest (not signed in): 1 free build + 3 refinements, then sign up
  // - Free user (signed in): 10 builds to experiment
  // - Paid tiers: Unlimited
  const GUEST_BUILD_LIMIT = 1
  const GUEST_REFINE_LIMIT = 3
  const FREE_BUILD_LIMIT = 10
  const FREE_REFINE_LIMIT = 1
  
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
  
  const isGuestBuildLocked = guestMode && !isSignedIn && getGuestBuilds() >= GUEST_BUILD_LIMIT
  const isGuestRefineLocked = guestMode && !isSignedIn && getGuestRefinements() >= GUEST_REFINE_LIMIT
  const isBuildLocked = isGuestBuildLocked || (!isPaidTier && isSignedIn && freeCreditsUsed >= FREE_BUILD_LIMIT)
  const isRefineLocked = isGuestRefineLocked || (!isPaidTier && isSignedIn && architectRefinementsUsed >= FREE_REFINE_LIMIT)
  
  // General lock for "Deploy" or extreme usage
  const isLocked = isBuildLocked && isRefineLocked

  // Guide State
  // Only show guide if: first section (Hero), no code yet, AND not guest mode (guests see /demo page first)
  const [showGuide, setShowGuide] = useState(section.id === 'hero' && !dbSection.code && !guestMode)
  const autoBuildRanRef = useRef(false)

  // Redirect to sign-up page when paywall is hit (deploy/export only)
  const goToSignUp = (tier: string = 'pro') => {
    const currentUrl = window.location.href
    router.push(`/sign-up?upgrade=${tier}&redirect_url=${encodeURIComponent(currentUrl)}`)
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
  
  // Get subscription info for Architect credits
  const architectCreditsUsed = (typeof window !== 'undefined' && subscription) 
    ? (window as unknown as { __architectUsed?: number }).__architectUsed || 0 
    : 0
  // NO LIMITS - architectCreditsRemaining is now always unlimited for everyone
  const architectCreditsRemaining = '∞'
  
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
      setError(`Preview crashed and self-healing failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
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
    
    // Check localStorage again in case of back button navigation
    if (guestMode && !generatedCode) {
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
      
      // Save to localStorage for guest preview persistence
      if (guestMode) {
        savePreview(buildPrompt, generatedCode, aiReasoning || '')
        // Also save the prompt so demo page can restore it
        try { localStorage.setItem('hatch_last_prompt', buildPrompt) } catch { /* ignore */ }
        // Note: Don't increment guest builds here - let them refine first
        // The signup prompt comes after refinements are exhausted
      }

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
    // Clear saved preview so user can regenerate fresh
    if (guestMode) {
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
      // NO MORE LIMITS - unlimited refinements
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
      
      // Track guest refinements
      if (guestMode && !isSignedIn) {
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
          goToSignUp()
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
    if (stage === 'generating' || (guestMode && !generatedCode && !!effectivePrompt)) {
      setLoadingStage(0)
      const interval = setInterval(() => {
        setLoadingStage(prev => (prev + 1) % loadingStages.length) // Loop back to 0
      }, 8000) // Move to next stage every 8 seconds
      return () => clearInterval(interval)
    }
  }, [stage, guestMode, generatedCode, effectivePrompt])

  // =============================================================================
  // GUEST MODE: Premium demo experience
  // Clean, minimal UI that shows our capability
  // =============================================================================
  if (guestMode) {
    // If we have an initial prompt from demo, always show generating (never empty state)
    const showGenerating = !generatedCode && (stage === 'generating' || !!effectivePrompt)
    
    return (
      <div className="relative h-screen w-full bg-zinc-950 overflow-hidden flex flex-col">
        {/* Guest Prompt Modal - shows when guest has no prompt */}
        <GuestPromptModal 
          isOpen={showGuestPromptModal}
          onSubmit={handleGuestPromptSubmit}
        />
        
        {/* Preview Area - takes full height minus bottom panel */}
        <div className="flex-1 flex flex-col min-h-0">
          {generatedCode ? (
            <SectionPreview 
              code={generatedCode} 
              darkMode={true}
              onRuntimeError={handleRuntimeError}
              inspectorMode={false}
              captureTrigger={captureTrigger}
              onScreenshotCaptured={handleScreenshotCaptured}
              editMode={false}
              allowCodeView={false}
              hideToolbar={true}
            />
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
                  <button className="w-9 h-9 rounded-md flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main Canvas Area */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Top Bar - File tabs style (compact) */}
                <div className="h-8 border-b border-zinc-800/50 bg-zinc-900/30 flex items-center px-1.5 gap-0.5">
                  <div className="flex items-center gap-1 px-2 py-1 bg-zinc-800 rounded-t text-xs border-b-2 border-emerald-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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

                {/* Canvas with code preview */}
                <div className="flex-1 relative">
                  {/* Fake streaming code effect */}
                  <div className="absolute inset-0 p-4 font-mono text-[10px] leading-relaxed overflow-hidden">
                    <StreamingCodeEffect />
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
                      <motion.div
                        animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-12 h-12 mx-auto mb-3"
                      >
                        <Image 
                          src="/assets/hatchit_definitive.svg" 
                          alt="Building" 
                          width={48} 
                          height={48}
                          className="w-full h-full"
                        />
                      </motion.div>
                      <motion.p 
                        key={loadingStage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm font-medium text-white mb-1"
                      >
                        {loadingStages[loadingStage]}
                      </motion.p>
                      <p className="text-xs text-zinc-500">Claude Sonnet 4.5</p>
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
                    <span className="text-[10px] font-mono text-emerald-400">{Math.min(95, ((loadingStage + 1) / loadingStages.length) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-0.5 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-emerald-500"
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
          ) : (
            // Empty state when waiting for prompt modal
            <div className="h-full flex items-center justify-center bg-zinc-950">
              <motion.div
                animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.6, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16"
              >
                <Image 
                  src="/assets/hatchit_definitive.svg" 
                  alt="Loading" 
                  width={64} 
                  height={64}
                  className="w-full h-full"
                />
              </motion.div>
            </div>
          )}
        </div>

        {/* Bottom Panel - fixed at bottom (NO INPUT STAGE - prompt comes from /demo) */}
        <div className="flex-shrink-0 p-4 sm:p-6 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mx-auto max-w-2xl"
          >
            {/* Generating Stage - minimal bottom bar */}
            {(stage === 'generating' || showGenerating) && (
              <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/60 rounded-xl shadow-xl shadow-black/40 px-4 py-3">
                <div className="flex items-center justify-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full"
                  />
                  <p className="text-sm text-zinc-400">
                    Writing production-ready code...
                  </p>
                </div>
              </div>
            )}

            {/* Complete Stage - Premium Studio Panel */}
            {stage === 'complete' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/80 rounded-xl shadow-2xl shadow-black/50"
              >
                {/* Compact toolbar row - Figma/Studio style */}
                <div className="flex items-center gap-2 px-3 py-2.5">
                  {/* Status indicator - matches generating sidebar */}
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-900/50 rounded-md border border-zinc-800/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Ready</span>
                  </div>
                  
                  {/* Divider */}
                  <div className="w-px h-5 bg-zinc-800/50" />
                  
                  {/* Refine input - main focus */}
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={refinePrompt}
                      onChange={(e) => setRefinePrompt(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && refinePrompt.trim() && handleUserRefine()}
                      disabled={isUserRefining}
                      placeholder="Describe changes... (colors, layout, animations)"
                      className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-md px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700 disabled:opacity-50 font-mono"
                    />
                  </div>
                  
                  {/* Refine button - matches sidebar aesthetic */}
                  <button
                    onClick={handleUserRefine}
                    disabled={!refinePrompt.trim() || isUserRefining}
                    className="px-3 py-1.5 rounded-md bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800/50 text-zinc-300 text-[10px] font-medium uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    {isUserRefining ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Edit3 className="w-3 h-3" />
                    )}
                    <span>Refine</span>
                  </button>
                  
                  {/* Export CTA - emerald accent */}
                  <button
                    onClick={() => goToSignUp()}
                    className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-medium uppercase tracking-wider transition-all flex items-center gap-1.5"
                  >
                    <span>Export</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Refining Stage */}
            {stage === 'refining' && (
              <div className="bg-zinc-900/90 backdrop-blur-xl border border-violet-500/30 rounded-2xl shadow-2xl shadow-black/60 p-5">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full"
                  />
                  <p className="text-sm font-medium text-white">Refining...</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Locked Banner */}
        {isLocked && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-0 left-0 right-0 z-20 bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-800 px-4 py-3"
          >
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              <p className="text-sm text-zinc-300">
                <span className="text-emerald-400 font-medium">Demo complete.</span>
                {' '}Sign up to keep building.
              </p>
              <button
                onClick={() => goToSignUp()}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 text-black text-sm font-semibold hover:bg-emerald-400 transition-colors"
              >
                Get started
              </button>
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  // IMMERSIVE INITIAL STATE - Full canvas input experience (for signed-in users only)
  if (isInitialState) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 bg-zinc-950 relative overflow-hidden">
        <AnimatePresence>
          {showGuide && <BuilderGuide onClose={() => setShowGuide(false)} />}
        </AnimatePresence>
        
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
            
            <div className="relative bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 group-focus-within:border-emerald-500/50 rounded-2xl overflow-hidden transition-all">
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
              <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800/30 bg-zinc-900/30">
                <button 
                  onClick={() => initializePromptHelper()}
                  className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Ask Architect
                </button>
                
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
              onClick={() => handleBuildSection()}
              disabled={!prompt.trim()}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
            >
              <Terminal className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Build This Section</span>
            </button>
          </motion.div>

          {/* All tools unlocked - The Architect's gift */}
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
                      onKeyDown={(e) => e.key === 'Enter' && sendHelperMessage()}
                      placeholder="Describe what you're building..."
                      className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
                    />
                    <button
                      onClick={sendHelperMessage}
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

  // =============================================================================
  // PAID/SIGNED-IN MODE: Full builder with side-by-side panels
  // =============================================================================
  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white overflow-hidden">
      <AnimatePresence>
        {showGuide && <BuilderGuide onClose={() => setShowGuide(false)} />}
      </AnimatePresence>

      <div className="flex-1 flex flex-col md:flex-row min-h-0 max-h-full overflow-hidden bg-zinc-950">
      {isLocked && (
        <div className="w-full bg-emerald-500/10 border-b border-emerald-500/30 text-emerald-200 text-sm px-4 py-3 flex items-center justify-between z-30">
          <span className="font-medium">Guest trial complete: preview is unlocked, edits are disabled.</span>
          <button
            onClick={() => goToSignUp('pro')}
            className="ml-3 px-3 py-1.5 rounded-lg bg-emerald-500 text-black text-sm font-semibold hover:bg-emerald-400 transition-colors"
          >
            Unlock builder
          </button>
        </div>
      )}
      {/* Mobile Tab Switcher - Modern Segmented Control */}
      <div className="flex md:hidden border-b border-zinc-800/50 bg-zinc-950 p-2">
        <div className="flex w-full bg-zinc-900/70 rounded-xl p-1 border border-emerald-500/20 shadow-[0_8px_30px_rgba(16,185,129,0.08)]">
          <button
            onClick={() => setMobileTab('input')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
              mobileTab === 'input' 
                ? 'bg-gradient-to-r from-emerald-600/60 to-teal-500/60 text-white shadow-lg shadow-emerald-500/20 border border-emerald-400/30' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Architect</span>
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
              mobileTab === 'preview' 
                ? 'bg-gradient-to-r from-indigo-500/70 to-purple-500/70 text-white shadow-lg shadow-purple-500/20 border border-purple-400/30' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Left: Input Panel - Full width on mobile when active */}
      <div className={`
        ${mobileTab === 'input' ? 'flex' : 'hidden'} md:flex
        md:w-[40%] md:min-w-[320px] 
        flex-col min-h-0 max-h-full overflow-hidden relative transition-all duration-300 
        border-r-0 md:border-r border-zinc-800/50 bg-zinc-950
      `}>
        {/* Input Area - More compact */}
        <div className="flex-1 p-3 lg:p-4 flex flex-col min-h-0 overflow-auto">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              {guestMode ? 'Describe your section' : 'Directive'}
              {/* All tools unlocked */}
            </label>
            {!guestMode && (
              <motion.button 
                onClick={() => initializePromptHelper()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative px-2 py-1 rounded-lg bg-zinc-900 border border-emerald-500/30 hover:border-emerald-500/60 flex items-center gap-1.5 transition-all text-xs"
              >
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                <span className="text-xs font-medium text-emerald-400 group-hover:text-emerald-300">Ask The Architect</span>
              </motion.button>
            )}
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
                    if (!isLocked && prompt.trim()) handleBuildSection()
                }
              }}
                disabled={stage !== 'input' || isLocked}
              placeholder={placeholderText}
              className="relative w-full min-h-[120px] bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 text-sm font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-0 focus:border-purple-500/50 disabled:opacity-50 resize-none transition-all"
            />
          </div>

          {/* Smart Suggestions - scrollable row */}
          {stage === 'input' && (
            <div className="mt-2 flex flex-nowrap gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
              {getSuggestions(section.id).slice(0, guestMode ? 3 : tier === 'free' ? 2 : 4).map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setPrompt(prev => prev ? `${prev} ${suggestion}` : suggestion)}
                  className="px-2.5 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-[10px] text-zinc-400 hover:text-white hover:bg-zinc-700 hover:border-zinc-600 transition-all whitespace-nowrap flex-shrink-0"
                >
                  + {suggestion}
                </button>
              ))}
              {!guestMode && tier === 'free' && (
                 <button
                  onClick={() => goToSignUp()}
                  className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-[10px] text-amber-400 hover:text-amber-300 transition-all whitespace-nowrap flex-shrink-0 flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" />
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
                  onClick={() => handleBuildSection()}
                  disabled={!prompt.trim() || isLocked}
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
                  {guestMode ? (
                    <div className="p-4 flex items-center justify-center gap-3">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-6 h-6"
                      >
                        <Image 
                          src="/assets/hatchit_definitive.svg" 
                          alt="Building" 
                          width={24} 
                          height={24}
                          className="w-full h-full"
                        />
                      </motion.div>
                      <span className="text-sm text-zinc-400">Building...</span>
                    </div>
                  ) : (
                    <ThinkingLog />
                  )}
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
                      animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-5 h-5"
                    >
                      <Image src="/assets/hatchit_definitive.svg" alt="" width={20} height={20} className="w-full h-full" />
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
                        {/* Unlimited refinements - The Architect's gift */}
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
                          disabled={
                            !refinePrompt.trim() ||
                            isUserRefining ||
                            isRefineLocked
                          }
                          aria-disabled={isLocked}
                          className="px-3 py-2 rounded-lg bg-emerald-600/80 border border-emerald-500/40 text-white text-xs font-semibold hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-[0_0_14px_rgba(16,185,129,0.25)]"
                        >
                          {isUserRefining ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <span>Refine</span>
                          )}
                        </button>
                      </div>

                      {/* Architect Polish - now allowed in guest with 3x3x3 policy */}
                      {!refined && !isArchitectPolishing && (
                        <div className="space-y-1">
                          <button
                            onClick={handleArchitectPolish}
                            disabled={isArchitectPolishing}
                            className="w-full py-2 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <Wand2 className="w-3 h-3" />
                            <span>Architect Polish</span>
                            <span className="text-[10px] text-violet-400/60">∞</span>
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

                      {/* THE SINGULARITY - Autonomous Evolution */}
                      {suggestion && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                              <Image src="/assets/hatchit_definitive.svg" alt="" width={16} height={16} />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-emerald-300 mb-1">Evolution Proposed</h4>
                              <p className="text-xs text-zinc-400 mb-3 font-mono italic">
                                "{suggestion.reason}"
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={acceptSuggestion}
                                  className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Accept
                                </button>
                                <button
                                  onClick={rejectSuggestion}
                                  className="flex-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Invoke Singularity Button */}
                      {!isDreaming && !suggestion && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="relative overflow-hidden p-4 bg-zinc-950 border border-emerald-500/30 rounded-xl group hover:border-emerald-500/60 transition-colors"
                        >
                          <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
                          <div className="relative">
                            <h4 className="text-sm font-bold text-emerald-400 mb-1 tracking-wide flex items-center gap-2">
                              THE SINGULARITY
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono uppercase tracking-wider">Alive</span>
                            </h4>
                            <p className="text-xs text-zinc-400 mb-3 font-mono leading-relaxed">
                              Allow the system to mutate this construct based on your Style DNA.
                            </p>
                            <button
                              onClick={evolve}
                              disabled={isDreaming}
                              className="w-full py-2.5 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 text-xs font-mono uppercase tracking-widest rounded transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                            >
                              <Image src="/assets/hatchit_definitive.svg" alt="" width={16} height={16} />
                              <span>Invoke Singularity</span>
                            </button>
                            {/* Unlimited evolutions - The Architect's gift */}
                          </div>
                        </motion.div>
                      )}

                      {/* Singularity Dreaming State */}
                      {isDreaming && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                              className="w-5 h-5"
                            >
                              <Image src="/assets/hatchit_definitive.svg" alt="" width={20} height={20} className="w-full h-full" />
                            </motion.div>
                            <div>
                              <p className="text-sm font-medium text-emerald-300 font-mono">The Singularity is dreaming...</p>
                              <p className="text-xs text-zinc-500 font-mono">Analyzing vision & mutating code</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
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
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
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
                        <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
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
                      onChange={(e) => setHelperInput(e.target.value)}
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
        md:flex-1 
        flex-col bg-zinc-900/30 min-h-0 max-h-full overflow-hidden transition-all duration-300
      `}>
        {/* Status Bar - Only shows during building/refining */}
        <AnimatePresence>
          {(stage === 'generating' || stage === 'refining' || isUserRefining || isArchitectPolishing || isSelfHealing) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/50 flex-shrink-0"
            >
              <div className="flex items-center gap-2">
                {stage === 'generating' ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full"
                    />
                    <span className="text-sm font-medium bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                      Building...
                    </span>
                  </>
                ) : isSelfHealing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full"
                    />
                    <span className="text-sm font-medium text-red-400">
                      Self-healing...
                    </span>
                  </>
                ) : (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-4 h-4"
                    >
                      <Image src="/assets/hatchit_definitive.svg" alt="" width={16} height={16} className="w-full h-full" />
                    </motion.div>
                    <span className="text-sm font-medium bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                      {isUserRefining ? 'Applying changes...' : 'Polishing...'}
                    </span>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex min-h-0 relative">
          {/* Show streaming code during generation or refinement for paid users only */}
          {(((stage === 'generating' || stage === 'refining') && streamingCode) || ((isUserRefining || isArchitectPolishing) && streamingCode)) && canRevealRawCode ? (
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
            <SectionPreview 
              code={generatedCode} 
              darkMode={true}
              onRuntimeError={handleRuntimeError}
              inspectorMode={inspectorMode}
              onElementSelect={handleElementSelect}
              captureTrigger={captureTrigger}
              onScreenshotCaptured={handleScreenshotCaptured}
              editMode={true}
              onTextEdit={handleTextEdit}
              allowCodeView={canRevealRawCode}
              onUpgradeClick={() => goToSignUp('pro')}
            />
          )}

          {(((stage === 'generating' || stage === 'refining') && streamingCode) || ((isUserRefining || isArchitectPolishing) && streamingCode)) && !canRevealRawCode && (
            <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-center px-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full"
              />
              <p className="text-sm text-zinc-300">Rendering preview...</p>
              <p className="text-xs text-zinc-500">Upgrade to view raw code while it streams.</p>
            </div>
          )}

          {isLocked && (
            <div className="absolute top-3 right-3 z-20">
              <button
                onClick={() => goToSignUp('pro')}
                className="px-3 py-2 rounded-lg bg-emerald-600 text-black text-xs font-semibold shadow-lg shadow-emerald-900/30 hover:bg-emerald-500 transition-colors"
              >
                Unlock builder
              </button>
            </div>
          )}
          
          {/* Skip to Preview button - shows after first section is generated */}
          {generatedCode && !isLastSection && stage !== 'generating' && stage !== 'refining' && !isUserRefining && !isArchitectPolishing && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20">
              <button
                onClick={onNextSection}
                className="px-4 py-1.5 rounded-full bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700 text-xs text-zinc-400 hover:text-white transition-all flex items-center gap-1.5 backdrop-blur-sm"
              >
                <span>Skip to preview</span>
                <span>→</span>
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
    </div>
  )
}
