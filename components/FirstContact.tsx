'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, Zap, Code2, Layers, Globe, Cpu } from 'lucide-react'

// =============================================================================
// FIRST CONTACT - THE THEATRICAL ONBOARDING
// A cinematic introduction that shows what the Architect can do
// Mobile-first, 80% of users are on mobile
// =============================================================================

interface FirstContactProps {
  onComplete: (prompt?: string) => void
  defaultPrompt?: string
}

// Demo sites that showcase real capabilities
const DEMO_BUILDS = [
  {
    name: 'Velocity Fitness',
    type: 'Gym Landing Page',
    prompt: 'A high-energy fitness gym with dark theme, neon accents, membership pricing',
    color: 'from-orange-500 to-red-600',
  },
  {
    name: 'Luna & Sage',
    type: 'Boutique Portfolio',
    prompt: 'An elegant jewelry designer portfolio with soft pastels and luxury feel',
    color: 'from-pink-400 to-purple-500',
  },
  {
    name: 'NexGen AI',
    type: 'Tech Startup',
    prompt: 'A cutting-edge AI startup with cyber aesthetic, dark mode, gradient accents',
    color: 'from-cyan-400 to-blue-600',
  },
]

// Typewriter text effect
function TypewriterText({ 
  text, 
  speed = 30, 
  onComplete,
  className = ''
}: { 
  text: string
  speed?: number
  onComplete?: () => void 
  className?: string
}) {
  const [displayed, setDisplayed] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  
  useEffect(() => {
    setDisplayed('')
    setIsComplete(false)
    let i = 0
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(interval)
        setIsComplete(true)
        onComplete?.()
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed, onComplete])
  
  return (
    <span className={className}>
      {displayed}
      {!isComplete && <span className="animate-pulse">▋</span>}
    </span>
  )
}

// Floating particle effect
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-emerald-500/30 rounded-full"
          initial={{ 
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            opacity: 0 
          }}
          animate={{ 
            y: [null, -100],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeOut'
          }}
        />
      ))}
    </div>
  )
}

// The Architect's visual representation
function ArchitectCore() {
  return (
    <motion.div 
      className="relative w-24 h-24 sm:w-32 sm:h-32"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', duration: 1.2, bounce: 0.4 }}
    >
      {/* Outer pulse ring */}
      <motion.div
        className="absolute inset-0 border-2 border-emerald-500/30 rounded-full"
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Middle ring */}
      <motion.div
        className="absolute inset-2 border border-emerald-500/50 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />
      
      {/* Inner glow */}
      <div className="absolute inset-4 bg-emerald-500/20 rounded-full blur-xl" />
      
      {/* Core */}
      <motion.div
        className="absolute inset-6 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Cpu className="w-6 h-6 sm:w-8 sm:h-8 text-zinc-950" />
      </motion.div>
    </motion.div>
  )
}

// Live demo build animation
function LiveDemoPreview({ demo, isActive }: { demo: typeof DEMO_BUILDS[0], isActive: boolean }) {
  const [buildProgress, setBuildProgress] = useState(0)
  
  useEffect(() => {
    if (!isActive) {
      setBuildProgress(0)
      return
    }
    
    const interval = setInterval(() => {
      setBuildProgress(p => Math.min(p + 2, 100))
    }, 50)
    
    return () => clearInterval(interval)
  }, [isActive])
  
  return (
    <motion.div
      className={`relative rounded-xl overflow-hidden border transition-all duration-300 ${
        isActive 
          ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/20' 
          : 'border-zinc-800 opacity-50'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Mock browser chrome */}
      <div className="bg-zinc-900 px-3 py-2 flex items-center gap-2 border-b border-zinc-800">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
        </div>
        <div className="flex-1 bg-zinc-800 rounded px-2 py-0.5 text-[10px] text-zinc-500 font-mono truncate">
          {demo.name.toLowerCase().replace(/\s/g, '')}.hatchitsites.dev
        </div>
      </div>
      
      {/* Preview area */}
      <div className="relative h-36 sm:h-44 bg-zinc-950">
        {/* Gradient background based on demo */}
        <div className={`absolute inset-0 bg-gradient-to-br ${demo.color} opacity-10`} />
        
        {/* Simulated content blocks */}
        <div className="p-3 space-y-2">
          {/* Header skeleton */}
          <div className="flex justify-between items-center">
            <motion.div 
              className="h-4 w-20 bg-white/20 rounded"
              initial={{ width: 0 }}
              animate={{ width: isActive && buildProgress > 10 ? 80 : 0 }}
              transition={{ duration: 0.3 }}
            />
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <motion.div 
                  key={i}
                  className="h-3 w-10 bg-white/10 rounded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isActive && buildProgress > 20 + i * 5 ? 1 : 0 }}
                />
              ))}
            </div>
          </div>
          
          {/* Hero skeleton */}
          <motion.div 
            className={`h-16 sm:h-20 bg-gradient-to-r ${demo.color} rounded-lg opacity-30 mt-4`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isActive && buildProgress > 40 ? 1 : 0 }}
            style={{ transformOrigin: 'left' }}
          />
          
          {/* Features skeleton */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[1, 2, 3].map(i => (
              <motion.div
                key={i}
                className="h-12 bg-white/5 rounded border border-white/10"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: isActive && buildProgress > 60 + i * 10 ? 1 : 0,
                  scale: isActive && buildProgress > 60 + i * 10 ? 1 : 0.8
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Build progress overlay */}
        {isActive && buildProgress < 100 && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80">
            <div className="text-center">
              <motion.div
                className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <p className="text-xs text-emerald-400 font-mono">{buildProgress}%</p>
            </div>
          </div>
        )}
        
        {/* Complete checkmark */}
        {isActive && buildProgress >= 100 && (
          <motion.div
            className="absolute top-2 right-2 bg-emerald-500 text-zinc-950 rounded-full p-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
          >
            <Zap className="w-3 h-3" />
          </motion.div>
        )}
      </div>
      
      {/* Demo info */}
      <div className="bg-zinc-900/50 px-3 py-2 border-t border-zinc-800">
        <p className="text-xs font-medium text-white truncate">{demo.name}</p>
        <p className="text-[10px] text-zinc-500">{demo.type}</p>
      </div>
    </motion.div>
  )
}

// Quick start prompts for mobile
const QUICK_STARTS = [
  { label: '🚀 Show Me', prompt: 'A dark-mode SaaS landing page for an AI code assistant with animated hero, feature grid with icons, pricing table, and testimonials' },
  { label: 'Portfolio', prompt: 'A creative portfolio for a designer with dark theme and project showcase' },
  { label: 'Startup', prompt: 'A modern SaaS startup landing page with pricing and features' },
  { label: 'Restaurant', prompt: 'An elegant restaurant website with menu, reservations, and location' },
  { label: 'Agency', prompt: 'A professional digital agency website with services and case studies' },
]

// Default show-off prompt for new users
const DEFAULT_PROMPT = 'A dark-mode SaaS landing page for an AI code assistant with animated hero, feature grid with icons, pricing table, and testimonials'

export default function FirstContact({ onComplete, defaultPrompt }: FirstContactProps) {
  const [phase, setPhase] = useState<'intro' | 'demo' | 'ready'>('intro')
  const [currentDemo, setCurrentDemo] = useState(0)
  const [textPhase, setTextPhase] = useState(0)
  const [customPrompt, setCustomPrompt] = useState(defaultPrompt || DEFAULT_PROMPT)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Sync default prompt from entry point (e.g., hero) on first show
  useEffect(() => {
    if (defaultPrompt) {
      setCustomPrompt(defaultPrompt)
    }
  }, [defaultPrompt])
  
  // Auto-advance through intro phases
  useEffect(() => {
    if (phase === 'intro') {
      const timers = [
        setTimeout(() => setTextPhase(1), 2000),
        setTimeout(() => setTextPhase(2), 4500),
        setTimeout(() => setPhase('demo'), 7000),
      ]
      return () => timers.forEach(clearTimeout)
    }
  }, [phase])
  
  // Cycle through demos
  useEffect(() => {
    if (phase === 'demo') {
      const timer = setTimeout(() => {
        if (currentDemo < DEMO_BUILDS.length - 1) {
          setCurrentDemo(d => d + 1)
        } else {
          setPhase('ready')
        }
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [phase, currentDemo])
  
  // Skip intro on tap (mobile friendly)
  const skipToReady = () => {
    setPhase('ready')
  }
  
  return (
    <div className="fixed inset-0 bg-zinc-950 z-50 overflow-hidden">
      <FloatingParticles />
      
      {/* Skip button - always visible */}
      <motion.button
        onClick={skipToReady}
        className="absolute top-4 right-4 z-50 text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-3 py-1.5 rounded-full border border-zinc-800 hover:border-zinc-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Skip intro
      </motion.button>
      
      <AnimatePresence mode="wait">
        {/* PHASE 1: Introduction */}
        {phase === 'intro' && (
          <motion.div
            key="intro"
            className="absolute inset-0 flex flex-col items-center justify-center px-6"
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            onClick={skipToReady}
          >
            <ArchitectCore />
            
            <div className="mt-8 text-center max-w-sm">
              <AnimatePresence mode="wait">
                {textPhase === 0 && (
                  <motion.div
                    key="t0"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <TypewriterText 
                      text="Initializing The Architect..." 
                      className="text-emerald-400 font-mono text-sm"
                    />
                  </motion.div>
                )}
                
                {textPhase === 1 && (
                  <motion.div
                    key="t1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                      I build websites.
                    </h1>
                    <TypewriterText 
                      text="You describe. I create. In seconds." 
                      speed={40}
                      className="text-zinc-400 text-base sm:text-lg"
                    />
                  </motion.div>
                )}
                
                {textPhase === 2 && (
                  <motion.div
                    key="t2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                      Let me show you.
                    </h1>
                    <p className="text-zinc-500 text-sm">Watch what happens...</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Tap to skip hint */}
            <motion.p
              className="absolute bottom-8 text-zinc-600 text-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              Tap anywhere to skip
            </motion.p>
          </motion.div>
        )}
        
        {/* PHASE 2: Live Demo */}
        {phase === 'demo' && (
          <motion.div
            key="demo"
            className="absolute inset-0 flex flex-col items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={skipToReady}
          >
            <motion.p 
              className="text-zinc-400 text-sm mb-4 font-mono"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="text-emerald-400">Building:</span> {DEMO_BUILDS[currentDemo].prompt.slice(0, 40)}...
            </motion.p>
            
            <div className="w-full max-w-md">
              <LiveDemoPreview 
                demo={DEMO_BUILDS[currentDemo]} 
                isActive={true}
              />
            </div>
            
            {/* Progress dots */}
            <div className="flex gap-2 mt-6">
              {DEMO_BUILDS.map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentDemo ? 'bg-emerald-500' : i < currentDemo ? 'bg-emerald-500/50' : 'bg-zinc-700'
                  }`}
                  animate={i === currentDemo ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.5 }}
                />
              ))}
            </div>
            
            <motion.p
              className="mt-6 text-zinc-500 text-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Tap to skip
            </motion.p>
          </motion.div>
        )}
        
        {/* PHASE 3: Ready to Build */}
        {phase === 'ready' && (
          <motion.div
            key="ready"
            className="absolute inset-0 flex flex-col px-4 py-6 sm:py-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                className="inline-flex items-center gap-2 text-emerald-400 text-sm font-mono mb-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ARCHITECT ONLINE
              </motion.div>
              <motion.h1
                className="text-2xl sm:text-4xl font-bold text-white"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                What should I build?
              </motion.h1>
            </div>
            
            {/* Main input area */}
            <motion.div
              className="flex-1 flex flex-col max-w-2xl mx-auto w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Text input */}
              <div className="relative mb-4">
                <textarea
                  ref={inputRef}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe your website... e.g. 'A photography portfolio with dark theme, gallery grid, and contact form'"
                  className="w-full h-28 sm:h-32 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 resize-none focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm sm:text-base"
                  autoFocus
                />
                <div className="absolute bottom-3 right-3 text-xs text-zinc-600">
                  Press Enter or tap Build
                </div>
              </div>
              
              {/* Build button */}
              <motion.button
                onClick={() => onComplete(customPrompt || undefined)}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-zinc-950 font-bold rounded-xl flex items-center justify-center gap-2 hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Sparkles className="w-5 h-5" />
                Build with The Architect
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              
              {/* Quick starts - scrollable on mobile */}
              <div className="mt-6">
                <p className="text-zinc-500 text-xs mb-3 text-center">Or start with a template:</p>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center scrollbar-hide">
                  {QUICK_STARTS.map((qs, i) => (
                    <motion.button
                      key={i}
                      onClick={() => onComplete(qs.prompt)}
                      className="flex-shrink-0 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-sm text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-400 transition-all whitespace-nowrap"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {qs.label}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              {/* Features highlight - mobile optimized */}
              <motion.div
                className="mt-8 grid grid-cols-3 gap-3 sm:gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {[
                  { icon: Zap, label: 'Instant', sub: '<60 seconds' },
                  { icon: Code2, label: 'Real Code', sub: 'React + Tailwind' },
                  { icon: Globe, label: 'Deploy', sub: 'One click' },
                ].map((feat, i) => (
                  <div key={i} className="text-center p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                    <feat.icon className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                    <p className="text-xs font-medium text-white">{feat.label}</p>
                    <p className="text-[10px] text-zinc-500">{feat.sub}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
            
            {/* Footer */}
            <motion.div
              className="text-center mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-zinc-600 text-xs">
                Free to start • No credit card required
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
