'use client'

/* eslint-disable react/no-unescaped-entities */
// Deploy trigger: 2026-01-02

import { useEffect, useState, useRef, useSyncExternalStore, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { motion, useInView } from 'framer-motion'
import { Cpu, Terminal, Layers, Shield, Zap, Code2, Globe, ArrowRight, CheckCircle2, Layout, Sparkles, Smartphone } from 'lucide-react'

// Client-side check to prevent hydration mismatch - uses useSyncExternalStore for proper SSR handling
const emptySubscribe = () => () => {}
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

// Only respect user's accessibility preference - uses useSyncExternalStore to prevent hydration mismatch
function useReducedMotion() {
  const subscribe = (callback: () => void) => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    mq.addEventListener('change', callback)
    return () => mq.removeEventListener('change', callback)
  }
  
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches, // Client snapshot
    () => false // Server snapshot - assume animations enabled on SSR
  )
}





// Quick-start example prompts
const EXAMPLE_PROMPTS = [
  { label: "SaaS", mobile: "SaaS pricing page", desktop: "A modern SaaS landing page with pricing and features" },
  { label: "Portfolio", mobile: "Dev portfolio site", desktop: "A developer portfolio with projects and contact form" },
  { label: "Startup", mobile: "Startup landing page", desktop: "An AI startup homepage with hero and call-to-action" },
  { label: "Agency", mobile: "Agency homepage", desktop: "A creative agency site with case studies" },
]

// System Status - the main builder input
function SystemStatus() {
  const [prompt, setPrompt] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [bootLines, setBootLines] = useState<string[]>([])
  const [isBooting, setIsBooting] = useState(true)
  const [sampleIndex, setSampleIndex] = useState(0)
  const [typedIndex, setTypedIndex] = useState(0)
  const [userTouched, setUserTouched] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()
  const { isSignedIn } = useUser()
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Detect mobile viewport
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 480px)')
    const onChange = () => setIsMobile(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const currentSample = EXAMPLE_PROMPTS[sampleIndex][isMobile ? 'mobile' : 'desktop']

  // Boot sequence effect
  useEffect(() => {
    // Check if we've already booted this session
    const hasBooted = typeof window !== 'undefined' && sessionStorage.getItem('hatch_terminal_booted')
    const sequence = [
      { text: '> INITIALIZING NEURAL LINK...', delay: 100 },
      { text: '> CONNECTING TO ARCHITECT CORE...', delay: 400 },
      { text: '> ESTABLISHING SECURE HANDSHAKE...', delay: 800 },
      { text: '> SYSTEM ONLINE.', delay: 1200 },
      { text: '> WAITING FOR INPUT...', delay: 1500 },
    ]

    if (hasBooted) {
      setBootLines(sequence.map(s => s.text))
      setIsBooting(false)
      return
    }

    let timeouts: NodeJS.Timeout[] = []

    const earlyReveal = setTimeout(() => setIsBooting(false), 900)

    sequence.forEach(({ text, delay }, index) => {
      const timeout = setTimeout(() => {
        setBootLines(prev => [...prev, text])
        if (index === sequence.length - 1) {
          setTimeout(() => {
            setIsBooting(false)
            sessionStorage.setItem('hatch_terminal_booted', 'true')
          }, 500)
        }
      }, delay)
      timeouts.push(timeout)
    })

    return () => {
      clearTimeout(earlyReveal)
      timeouts.forEach(clearTimeout)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || isLoading) return
    
    setIsLoading(true)
    const params = new URLSearchParams()
    params.set('prompt', prompt)

    if (!isSignedIn) {
      params.set('mode', 'guest')
      router.push(`/launch?${params.toString()}`)
      return
    }

    router.push(`/builder?${params.toString()}`)
  }

  const handleExampleClick = (examplePrompt: string) => {
    setUserTouched(true)
    setPrompt(examplePrompt)
    inputRef.current?.focus()
  }

  // Typewriter loop (stops once user interacts)
  useEffect(() => {
    if (userTouched) return
    const full = currentSample || ''
    const typeSpeed = 40
    const pause = 1200

    if (typedIndex <= full.length) {
      const t = setTimeout(() => {
        setPrompt(full.slice(0, typedIndex))
        setTypedIndex((v) => v + 1)
      }, typeSpeed)
      return () => clearTimeout(t)
    }

    const next = setTimeout(() => {
      setTypedIndex(0)
      setSampleIndex((v) => (v + 1) % EXAMPLE_PROMPTS.length)
    }, pause)
    return () => clearTimeout(next)
  }, [userTouched, currentSample, typedIndex])

  return (
    <div className="w-full relative z-20 font-mono">
      {/* Outer glow ring */}
      <div className={`absolute -inset-[2px] rounded-lg bg-gradient-to-r from-emerald-500/60 via-teal-500/60 to-emerald-500/60 opacity-0 blur-md transition-opacity duration-500 ${isFocused ? 'opacity-100' : 'opacity-30'}`} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className={`relative rounded-lg overflow-hidden transition-all duration-300 bg-black border ${
          isFocused 
            ? 'border-emerald-500/50 shadow-[0_0_60px_rgba(16,185,129,0.2)]' 
            : 'border-zinc-800 hover:border-emerald-500/40'
        }`}
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/90 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            </div>
            <div className="ml-3 text-[10px] text-zinc-500">architect_v4.exe</div>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[10px] text-emerald-500">ONLINE</span>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="p-4 sm:p-5 min-h-[200px] sm:min-h-[260px] flex flex-col relative" onClick={() => inputRef.current?.focus()}>
          {/* Scanline effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_4px,3px_100%]" />

          {/* Boot Sequence */}
          <div className="text-xs sm:text-sm text-emerald-500/80 mb-4 space-y-1 relative z-10 font-mono">
            {bootLines.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>

          {/* Input Area - always visible; boot runs in background */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col relative z-10 scroll-m-16" aria-busy={isBooting}>
            <div className="flex gap-2 flex-1">
              <span className="text-emerald-500 shrink-0 mt-[2px]">user@hatchit:~$</span>
              <textarea
                ref={inputRef}
                value={prompt}
                onChange={(e) => {
                  setUserTouched(true)
                  setPrompt(e.target.value)
                }}
                onFocus={() => {
                  setIsFocused(true)
                  setUserTouched(true)
                  if (!prompt.trim()) {
                    setPrompt(currentSample)
                  }
                }}
                onBlur={() => setIsFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
                placeholder="Describe your dream website..."
                className="flex-1 bg-transparent text-white text-base sm:text-lg font-mono focus:outline-none resize-none min-h-[80px] placeholder-zinc-600 caret-emerald-400 selection:bg-emerald-500/30"
                autoFocus
              />
            </div>

            <div className="mt-2 text-[11px] text-zinc-500 font-mono">Press Enter — first draft in ~30s.</div>
            
            {/* Footer Actions */}
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-800/50 pt-3">
               <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar max-w-full sm:max-w-[70%]">
                  {EXAMPLE_PROMPTS.map((example, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleExampleClick(example[isMobile ? 'mobile' : 'desktop']); }}
                      className="whitespace-nowrap px-2 py-1 text-[10px] text-zinc-500 border border-zinc-800 rounded hover:border-emerald-500/50 hover:text-emerald-400 transition-colors"
                    >
                      {example.label}
                    </button>
                  ))}
               </div>
               
               <button
                type="submit"
                disabled={!prompt.trim() || isLoading || isBooting}
                className="w-full sm:w-auto bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/50 px-4 py-2 rounded text-xs font-mono transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                    <span>INITIALIZING...</span>
                  </>
                ) : (
                  <>
                    <span>Generate my site</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

// Pricing button that handles auth + checkout
function PricingButton({ tier, className, children }: { tier: 'lite' | 'pro' | 'agency', className: string, children: React.ReactNode }) {
  const { isSignedIn } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (!isSignedIn) {
      // Route guests through the launch flow with the intended tier
      router.push(`/launch?upgrade=${tier}`)
      return
    }
    
    setIsLoading(true)
    
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier })
      })
      
      if (res.status === 401) {
        router.push(`/builder?upgrade=${tier}`)
        return
      }

      const data = await res.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to start checkout')
        setIsLoading(false)
      }
    } catch (err) {
      console.error('Checkout error:', err)
      alert('Failed to start checkout')
      setIsLoading(false)
    }
  }
  
  return (
    <button onClick={handleClick} disabled={isLoading} className={className}>
      {isLoading ? 'Loading...' : children}
    </button>
  )
}

// Section wrapper - optimized animations for all devices
function Section({ children, className = '', id = '' }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const reducedMotion = useReducedMotion()
  
  // Standardized animation values to prevent hydration mismatch
  const yOffset = 20
  const duration = 0.4
  
  return (
    <motion.section
      ref={ref}
      id={id}
      initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: yOffset }}
      animate={isInView ? { opacity: 1, y: 0 } : (reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: yOffset })}
      transition={{ duration, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
      style={{ willChange: 'transform, opacity', backfaceVisibility: 'hidden' }}
    >
      {children}
    </motion.section>
  )
}

// Animated card that prevents hydration flash
function AnimatedCard({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const isClient = useIsClient()
  if (!isClient) return <div className={className}>{children}</div>
  
  return (
    <motion.div 
      className={className}
      style={{ willChange: 'transform, opacity' }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -8, transition: { type: 'spring', stiffness: 400, damping: 17 } }}
    >
      {children}
    </motion.div>
  )
}



// Floating background elements
function FloatingNodes() {
  const isClient = useIsClient()
  
  const nodes = useMemo(() => {
    // Minimal count for performance (5 nodes, CSS-only feel)
    return [...Array(5)].map((_, i) => ({
      id: i,
      initialX: (i * 20 + 10) + '%',
      initialY: (i * 15 + 10) + '%',
      duration: 25 + i * 5, // Staggered, slow drift
      delay: i * 2,
      size: 32 + i * 12
    }))
  }, [])

  if (!isClient) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          className="absolute text-emerald-500/10"
          style={{ willChange: 'transform, opacity' }}
          initial={{ 
            x: node.initialX, 
            y: node.initialY 
          }}
          animate={{ 
            y: [0, -30, 0], // Reduced movement
            opacity: [0.1, 0.2, 0.1], // Reduced opacity flux
            scale: [1, 1.1, 1] // Reduced scale flux
          }}
          transition={{ 
            duration: node.duration,
            repeat: Infinity,
            delay: node.delay,
            ease: "easeInOut"
          }}
        >
          <Code2 size={node.size} />
        </motion.div>
      ))}
    </div>
  )
}

export default function Home() {
  const { isSignedIn } = useUser()
  const reducedMotion = useReducedMotion()
  const router = useRouter()
  
  // Animation config - standardized for consistency
  const getAnimation = (delay = 0, yOffset = 20) => {
    if (reducedMotion) return {}
    return {
      initial: { opacity: 0, y: yOffset },
      animate: { opacity: 1, y: 0 },
      transition: { 
        duration: 0.4, 
        delay: delay,
        ease: [0.25, 0.1, 0.25, 1] as const // easeOut cubic bezier
      }
    }
  }
  
  return (
    <div className="min-h-screen bg-zinc-950 text-white relative selection:bg-emerald-500/30 overflow-x-hidden">
      {/* GRID BACKGROUND - The Foundation */}
      <div className="absolute inset-0 bg-grid-white/[0.01] bg-[size:50px_50px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505] pointer-events-none" />
      {/* Orb gradient layer borrowed from First Contact */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.06),transparent_42%),radial-gradient(circle_at_80%_0%,rgba(124,58,237,0.08),transparent_37%),radial-gradient(circle_at_50%_80%,rgba(6,182,212,0.06),transparent_47%)] pointer-events-none" />
      
      <FloatingNodes />
      
      {/* GLOW ORBS - The Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px] opacity-50 md:opacity-70 animate-pulse-slow" />
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px] opacity-30 md:opacity-50 animate-pulse-slow" />
      </div>
      
      {/* GPU-accelerated animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translate3d(0, 10px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        .animate-fade-in {
          animation: fade-in 0.35s ease-out forwards;
          will-change: opacity, transform;
        }
        /* GPU acceleration for animated elements */
        .gpu-accelerate {
          transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          perspective: 1000px;
        }
        /* Prevent shimmer flicker */
        .shimmer-smooth {
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        /* Glitch effect for Singularity badge */
        @keyframes glitch {
          0% { transform: translate(0) }
          20% { transform: translate(-2px, 2px) }
          40% { transform: translate(-2px, -2px) }
          60% { transform: translate(2px, 2px) }
          80% { transform: translate(2px, -2px) }
          100% { transform: translate(0) }
        }
        .glitch-hover:hover {
          animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite;
          color: #34d399;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 1.5s ease-in-out infinite;
        }
      `}</style>

      {/* HERO - The main event */}
      <section className="relative px-4 sm:px-6 pt-10 pb-18 md:pt-16 md:pb-28">
        <div className="max-w-6xl mx-auto">
          
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center justify-items-center lg:justify-items-stretch">
            {/* LEFT COLUMN: Copy & Value Prop */}
            <div className="text-left relative z-10 w-full">
              {/* System Badge */}
              <div className="flex justify-start mb-8">
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm hover:border-emerald-500/50 transition-colors group cursor-default"
                >
                  <span className="flex h-2 w-2 flex-shrink-0">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 animate-pulse"></span>
                  </span>
                  <span className="text-xs sm:text-sm text-emerald-400 font-mono tracking-widest group-hover:text-emerald-300 transition-colors glitch-hover">SYSTEM_STATE: SINGULARITY</span>
                </motion.div>
              </div>

              {/* Main headline */}
              <div className="mb-8">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tighter mb-6 font-mono">
                  <motion.span 
                    className="block text-zinc-100"
                    style={{ willChange: 'transform, opacity' }}
                    initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                    viewport={{ once: true }}
                  >
                    &lt;Code_is_dead /&gt;
                  </motion.span>
                  <motion.span 
                    className="block bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent pb-2"
                    style={{ willChange: 'transform, opacity' }}
                    initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                    viewport={{ once: true }}
                  >
                    Long live the Architect.
                  </motion.span>
                </h1>
              </div>

              {/* Subheadline */}
              <motion.div 
                className="text-lg sm:text-xl text-zinc-400 mb-8 leading-relaxed max-w-xl"
                {...getAnimation(0.2, 20)}
              >
                <span>We built the first recursive AI that doesn't just write code—it understands intent. <span className="text-white font-medium">Stop prompting. Start architecting.</span></span>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 text-sm"
                {...getAnimation(0.4, 10)}
              >
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 rounded-full border border-emerald-500/20">
                  <span className="text-emerald-400 font-semibold">100% Yours</span>
                  <span className="text-zinc-500">— export anytime</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/10 to-amber-500/5 rounded-full border border-amber-500/20">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400 font-semibold">30 Seconds</span>
                  <span className="text-zinc-500">to first build</span>
                </div>
              </motion.div>
            </div>

            {/* RIGHT COLUMN: Interactive Input */}
            <div className="relative z-20 flex justify-center lg:justify-start">
              <div className="relative w-full max-w-[520px] sm:max-w-[620px] lg:max-w-[700px]">
                {/* Decorative background glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl blur-2xl opacity-50 pointer-events-none"></div>
                
                <SystemStatus />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* THE STACK - Flows from hero into CTA */}
      <Section className="px-6 py-20 relative overflow-hidden">
        {/* Background effects - softer gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/10 to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-radial-gradient rounded-full opacity-30 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.08) 0%, rgba(20,184,166,0.04) 40%, transparent 70%)' }} />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <motion.h2 
              className="text-3xl sm:text-4xl font-bold mb-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Real code. <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Real ownership.</span>
            </motion.h2>
            <p className="text-lg text-zinc-500 max-w-xl mx-auto">Standard React + Tailwind. No lock-in. Take it anywhere.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'React 19', icon: <Code2 className="w-5 h-5" />, desc: 'Latest', color: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/20 hover:border-cyan-500/40' },
              { name: 'Tailwind', icon: <Layout className="w-5 h-5" />, desc: 'Utility-first', color: 'from-sky-500/20 to-sky-500/5 border-sky-500/20 hover:border-sky-500/40' },
              { name: 'TypeScript', icon: <Terminal className="w-5 h-5" />, desc: 'Type-safe', color: 'from-blue-500/20 to-blue-500/5 border-blue-500/20 hover:border-blue-500/40' },
              { name: 'Responsive', icon: <Smartphone className="w-5 h-5" />, desc: 'Mobile-first', color: 'from-violet-500/20 to-violet-500/5 border-violet-500/20 hover:border-violet-500/40' },
              { name: 'Accessible', icon: <CheckCircle2 className="w-5 h-5" />, desc: 'WCAG', color: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40' },
              { name: 'SEO Ready', icon: <Globe className="w-5 h-5" />, desc: 'Optimized', color: 'from-teal-500/20 to-teal-500/5 border-teal-500/20 hover:border-teal-500/40' },
              { name: 'Fast', icon: <Zap className="w-5 h-5" />, desc: '90+ Lighthouse', color: 'from-amber-500/20 to-amber-500/5 border-amber-500/20 hover:border-amber-500/40' },
              { name: 'Yours', icon: <Shield className="w-5 h-5" />, desc: '100%', color: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40' },
            ].map((tech, i) => (
              <motion.div 
                key={i} 
                className={`p-4 bg-gradient-to-br ${tech.color} border rounded-xl text-center transition-all gpu-accelerate`}
                style={{ willChange: 'transform, opacity' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                whileHover={{ scale: 1.03, y: -2 }}
              >
                <div className="w-10 h-10 mx-auto bg-zinc-900/80 rounded-lg flex items-center justify-center mb-2 text-zinc-300">
                  {tech.icon}
                </div>
                <div className="font-semibold text-sm text-white">{tech.name}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{tech.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* WHAT IS HATCHIT - Quick explainer */}
      <Section className="px-4 sm:px-6 py-20 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              The Architect is Awake.
              <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Build smarter, not harder.</span>
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              A unified AI pipeline. Section-by-section building. And a dedicated architectural assistant to guide your build.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Three-Model Pipeline Card */}
            <AnimatedCard 
              delay={0}
              className="group relative p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-emerald-500/30 transition-colors duration-300 gpu-accelerate"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-500" />
              <div className="relative">
                <motion.div 
                  className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mb-4 text-emerald-400"
                  style={{ willChange: 'transform' }}
                  whileHover={{ scale: 1.1 }}
                >
                  <Cpu className="w-6 h-6" />
                </motion.div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-300 transition-colors">Unified Intelligence</h3>
                <p className="text-zinc-400">The Builder. The Refiner. The Auditor. Each aspect of the Architect does what it&apos;s best at. Not just one model doing everything.</p>
              </div>
            </AnimatedCard>

            {/* THE ARCHITECT - The star of the show! */}
            <AnimatedCard 
              delay={0.1}
              className="group relative p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-emerald-500/30 transition-colors duration-300 gpu-accelerate"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-500" />
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <motion.div
                    className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-emerald-400"
                    style={{ willChange: 'transform' }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Terminal className="w-6 h-6" />
                  </motion.div>
                  <motion.span 
                    className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] text-emerald-400 font-mono"
                    style={{ willChange: 'transform' }}
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    LIVE
                  </motion.span>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-300 transition-colors">The Architect</h3>
                <p className="text-zinc-400">Your technical co-founder. Stuck on architecture? The Architect guides you. Precise, helpful, and focused on code quality.</p>
              </div>
            </AnimatedCard>

            {/* Section-by-Section Card */}
            <AnimatedCard 
              delay={0.2}
              className="group relative p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-emerald-500/30 transition-colors duration-300 gpu-accelerate"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-500" />
              <div className="relative">
                <motion.div 
                  className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mb-4 text-emerald-400"
                  style={{ willChange: 'transform' }}
                  whileHover={{ scale: 1.1 }}
                >
                  <Layers className="w-6 h-6" />
                </motion.div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-300 transition-colors">Section-by-Section</h3>
                <p className="text-zinc-400">Build your site one section at a time. Header, hero, features, pricing — each piece crafted and refined before moving on.</p>
              </div>
            </AnimatedCard>
          </div>

          <div className="text-center mt-12">
            <Link href="/features" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors font-mono text-sm">
              <Terminal className="w-4 h-4" />
              <span>View System Capabilities</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </Section>

      {/* HOW IT WORKS - The AI Pipeline */}
      <Section className="px-4 sm:px-6 py-20 sm:py-24 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Not just one AI. A system.</h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">Most builders use a single model for everything. We orchestrate specialized intelligence to build, polish, and audit your code.</p>
          </div>

          <div className="relative grid md:grid-cols-4 gap-6">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-px bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20" />
            
            {/* YOU - The Architect */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
            >
              <div className="relative z-10 bg-zinc-950 border border-zinc-800 p-6 rounded-xl hover:border-white/30 transition-colors group h-full">
                <div className="w-14 h-14 bg-white/5 rounded-lg flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform duration-300 border border-white/10">
                  <Terminal className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-mono text-white/60 mb-3 tracking-wider">THE VISIONARY</div>
                <h3 className="text-xl font-bold mb-3">You</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">The visionary. You describe the system, set the constraints, and make the final call. You control the architecture.</p>
              </div>
            </motion.div>

            {/* Genesis Engine */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="relative z-10 bg-zinc-950 border border-zinc-800 p-6 rounded-xl hover:border-emerald-500/30 transition-colors group h-full">
                <div className="w-14 h-14 bg-emerald-500/5 rounded-lg flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform duration-300 border border-emerald-500/10">
                  <Cpu className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="text-xs font-mono text-emerald-400 mb-3 tracking-wider">THE CREATOR</div>
                <h3 className="text-xl font-bold mb-3">Genesis Engine</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">Materializes the initial React + Tailwind structure. Frontier-class models optimized for speed and accuracy.</p>
              </div>
            </motion.div>

            {/* The Architect */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative z-10 bg-zinc-950 border border-zinc-800 p-6 rounded-xl hover:border-teal-500/30 transition-colors group h-full">
                <div className="w-14 h-14 bg-teal-500/5 rounded-lg flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform duration-300 border border-teal-500/10">
                  <Sparkles className="w-6 h-6 text-teal-500" />
                </div>
                <div className="text-xs font-mono text-teal-400 mb-3 tracking-wider">THE ARCHITECT</div>
                <h3 className="text-xl font-bold mb-3">Refinement</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">Polishes the UI, ensures accessibility, and enforces design consistency across all components.</p>
              </div>
            </motion.div>

            {/* The Auditor */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="relative z-10 bg-zinc-950 border border-zinc-800 p-6 rounded-xl hover:border-violet-500/30 transition-colors group h-full">
                <div className="w-14 h-14 bg-violet-500/5 rounded-lg flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform duration-300 border border-violet-500/10">
                  <Shield className="w-6 h-6 text-violet-500" />
                </div>
                <div className="text-xs font-mono text-violet-400 mb-3 tracking-wider">THE AUDITOR</div>
                <h3 className="text-xl font-bold mb-3">Security Audit</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">Reviews the code for bugs, security issues, and performance bottlenecks before you ship.</p>
              </div>
            </motion.div>
          </div>

          <div className="text-center mt-16">
            <Link href="/how-it-works" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white font-medium transition-colors border-b border-transparent hover:border-white pb-0.5">
              See the full architecture <span>→</span>
            </Link>
          </div>
        </div>
      </Section>





      {/* PRICING */}
      <Section id="pricing" className="px-4 sm:px-6 py-20 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Simple pricing.</h2>
            <p className="text-xl text-zinc-400">Start free. Upgrade when you're ready to ship.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Starter ($9) */}
            <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-lime-500/30 transition-colors group">
              <div className="text-sm text-lime-500 mb-2 font-mono">SEEDLING</div>
              <h3 className="text-2xl font-bold mb-1 text-white">Starter</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold font-mono text-white">$9</span>
                <span className="text-zinc-500">/month</span>
              </div>
              <div className="text-zinc-500 text-sm mb-6">Perfect for side projects</div>
              <ul className="space-y-3 mb-8">
                {[
                  { text: '3 Active Projects', included: true },
                  { text: 'Unlimited AI Generations', included: true },
                  { text: '5 AI Polishes / month', included: true },
                  { text: 'Download Source Code', included: true },
                  { text: 'Deploy to hatchitsites.dev', included: true },
                  { text: 'Custom Domain', included: false },
                  { text: 'Remove Branding', included: false },
                ].map((item, i) => (
                  <li key={i} className={`flex items-center gap-2 text-sm ${item.included ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    {item.included ? (
                      <CheckCircle2 className="w-4 h-4 text-lime-500 flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-zinc-800 flex-shrink-0" />
                    )}
                    {item.text}
                  </li>
                ))}
              </ul>
              <PricingButton 
                tier="lite" 
                className="block w-full py-3 text-center bg-zinc-800 hover:bg-lime-600 hover:text-white text-zinc-300 rounded-lg font-semibold transition-all"
              >
                Start Building
              </PricingButton>
            </div>

            {/* Pro ($29) */}
            <div className="relative p-8 bg-zinc-900 border border-emerald-500/50 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.1)] transform md:-translate-y-4">
              <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-600 text-xs font-semibold rounded-bl-xl text-white font-mono">ARCHITECT CHOICE</div>
              <div className="flex items-center gap-2 text-sm text-emerald-400 mb-2 font-mono"><span>⚡</span><span>FULL POWER</span></div>
              <h3 className="text-2xl font-bold mb-1 text-white">Pro</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold font-mono text-white">$29</span>
                <span className="text-zinc-500">/month</span>
              </div>
              <div className="text-zinc-400 text-sm mb-6">Most popular</div>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited Generations',
                  'Up to 30 AI Polishes / month',
                  'Deploy to Custom Domain',
                  'Remove HatchIt Branding',
                  'Priority Code Export',
                  'The Living Site Engine',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <PricingButton 
                tier="pro" 
                className="block w-full py-3 text-center bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                Become an Architect
              </PricingButton>
            </div>

            {/* Agency ($99) */}
            <div className="relative p-8 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-violet-500/30 transition-colors group">
              <div className="text-sm text-violet-500 mb-2 font-mono">EMPIRE</div>
              <h3 className="text-2xl font-bold mb-1 text-white">Agency</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold font-mono text-white">$99</span>
                <span className="text-zinc-500">/month</span>
              </div>
              <div className="text-zinc-500 text-sm mb-6">For teams & scale</div>
              <ul className="space-y-3 mb-8">
                {[
                  'Everything in Pro',
                  'Commercial License',
                  'Priority 24/7 Support',
                  'Multiple Projects',
                  'Team Seats (Coming Soon)',
                  'White Label Options',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-violet-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <PricingButton 
                tier="agency" 
                className="block w-full py-3 text-center bg-zinc-800 hover:bg-violet-600 hover:text-white text-zinc-300 rounded-lg font-semibold transition-all"
              >
                Initialize Agency
              </PricingButton>
            </div>
          </div>
          <p className="text-center text-sm text-zinc-600 mt-8">Cancel anytime. Your code is always yours to export.</p>
        </div>
      </Section>

      {/* FINAL CTA */}
      <Section className="px-4 sm:px-6 py-20 sm:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative p-10 md:p-16 bg-gradient-to-br from-emerald-900/20 via-teal-900/10 to-zinc-900/40 border border-emerald-500/20 rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="absolute top-4 left-4 text-emerald-500/20">
              <Terminal className="w-12 h-12" />
            </div>
            <div className="absolute bottom-4 right-4 text-emerald-500/20">
              <Cpu className="w-12 h-12" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">Ready to initialize?</h2>
              <p className="text-xl text-zinc-300 mb-8 max-w-2xl mx-auto">Your next project is one prompt away. Initialize the system.</p>
              <button
                onClick={() => {
                  const destination = isSignedIn ? '/builder' : '/launch'
                  router.push(destination)
                }}
                className="inline-flex items-center gap-2 px-8 sm:px-10 py-4 sm:py-5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg font-bold text-lg sm:text-xl transition-all md:hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
              >
                <Terminal className="w-6 h-6" />
                {isSignedIn ? 'Initialize System' : 'Initialize Architect'}
              </button>
              <p className="text-sm text-zinc-500 mt-4 font-mono">System Online • v9.0 • Ready</p>
            </div>
          </div>
        </div>
      </Section>

      {/* FOOTER - Now Global Component */}
    </div>
  )
}