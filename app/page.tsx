'use client'

/* eslint-disable react/no-unescaped-entities */

import { useEffect, useState, useRef, useSyncExternalStore, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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



// Typewriter effect for code demo
function TypewriterCode({ code, speed = 30 }: { code: string; speed?: number }) {
  const [displayedCode, setDisplayedCode] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isThinking, setIsThinking] = useState(false)

  useEffect(() => {
    if (currentIndex < code.length) {
      // Simulate "thinking" pauses at newlines or braces
      const char = code[currentIndex]
      const isPauseChar = char === '\n' || char === '{' || char === '}'
      const randomVariance = Math.random() * 20
      const currentSpeed = isThinking ? 400 : (isPauseChar ? speed * 4 : speed + randomVariance)

      const timeout = setTimeout(() => {
        setDisplayedCode(prev => prev + char)
        setCurrentIndex(prev => prev + 1)
        setIsThinking(false)
      }, currentSpeed)
      
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, code, speed, isThinking])

  // Reset and restart
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayedCode('')
      setCurrentIndex(0)
      setIsThinking(true) // Start with a "thought"
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <pre className="text-[10px] sm:text-xs md:text-sm font-mono text-left overflow-x-auto max-w-full h-full">
      <code className="break-words">
        {displayedCode}
        <span className="animate-pulse text-emerald-500">_</span>
      </code>
    </pre>
  )
}

// Animated counter
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      const duration = 2000
      const steps = 60
      const increment = value / steps
      let current = 0
      const timer = setInterval(() => {
        current += increment
        if (current >= value) {
          setCount(value)
          clearInterval(timer)
        } else {
          setCount(Math.floor(current))
        }
      }, duration / steps)
      return () => clearInterval(timer)
    }
  }, [isInView, value])

  return <span ref={ref}>{count}{suffix}</span>
}

// System Status - shows technical initialization messages
function SystemStatus() {
  const statusMessages = [
    { icon: <Terminal className="w-3 h-3" />, text: 'Initializing Architect core...' },
    { icon: <Layout className="w-3 h-3" />, text: 'Refining UI components...' },
    { icon: <Shield className="w-3 h-3" />, text: 'Running security audit...' },
    { icon: <Zap className="w-3 h-3" />, text: 'Optimizing for Core Web Vitals...' },
    { icon: <Code2 className="w-3 h-3" />, text: 'Generating production-ready React code...' },
    { icon: <Globe className="w-3 h-3" />, text: 'System ready for deployment.' },
  ]
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % statusMessages.length)
        setIsVisible(true)
      }, 300)
    }, 3000)
    return () => clearInterval(interval)
  }, [statusMessages.length])
  
  const current = statusMessages[currentIndex]
  
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <motion.div
        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-md"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -5 }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-emerald-500 animate-pulse">{current.icon}</span>
        <span className="text-xs font-mono text-emerald-400/90">{current.text}</span>
      </motion.div>
    </div>
  )
}

// Pricing button that handles auth + checkout
function PricingButton({ tier, className, children }: { tier: 'pro' | 'agency', className: string, children: React.ReactNode }) {
  const { isSignedIn } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (!isSignedIn) {
      // Redirect to sign in, then back to builder with upgrade param
      window.location.href = `/sign-in?redirect_url=/builder?upgrade=${tier}`
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
        window.location.href = `/sign-in?redirect_url=${encodeURIComponent(window.location.href)}`
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

const demoCode = `// The Architect v9.0
export default function Singularity() {
  const [reality, setReality] = useState('optimizing')
  
  return (
    <div className="neural-interface">
      <DirectLine 
        onVoiceInput={(intent) => {
          // Latency: <16ms
          const architecture = await generate(intent)
          return <LivePreview code={architecture} />
        }}
      />
      <SelfHealingBoundary>
        {/* I fix my own runtime errors */}
        <App />
      </SelfHealingBoundary>
    </div>
  )
}`

// Floating background elements
function FloatingNodes() {
  const isClient = useIsClient()
  
  const nodes = useMemo(() => {
    // Reduced count for better performance (8 instead of 12)
    return [...Array(8)].map((_, i) => ({
      id: i,
      initialX: Math.random() * 100 + '%',
      initialY: Math.random() * 100 + '%',
      duration: 20 + Math.random() * 10, // Slower duration (was 10+)
      delay: Math.random() * 5,
      size: 24 + Math.random() * 48
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
  const reducedMotion = useReducedMotion()
  
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
    <div className="min-h-screen bg-zinc-950 text-white relative">
      <FloatingNodes />
      
      {/* Subtle gradient orb */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] opacity-50 md:opacity-100" />
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
      `}</style>

      {/* HERO - The main event */}
      <section className="relative px-4 sm:px-6 pt-6 pb-16 md:pt-16 md:pb-32">
        <div className="max-w-6xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <motion.div 
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-zinc-900/80 border border-emerald-500/30 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.2)] cursor-default group"
              {...getAnimation(0, 20)}
              whileHover={{ scale: 1.05, borderColor: 'rgba(16,185,129,0.6)' }}
            >
              <span className="flex h-2 w-2 flex-shrink-0">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 animate-pulse"></span>
              </span>
              <span className="text-xs sm:text-sm text-emerald-400 font-mono tracking-widest group-hover:text-emerald-300 transition-colors glitch-hover">SYSTEM_STATE: SINGULARITY</span>
            </motion.div>
          </div>

          {/* Main headline */}
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black leading-[0.95] sm:leading-[0.9] tracking-tighter mb-6">
              <motion.span 
                className="block"
                style={{ willChange: 'transform, opacity' }}
                initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                viewport={{ once: true }}
              >
                Don't just build.
              </motion.span>
              <motion.span 
                className="block bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent pb-2"
                style={{ willChange: 'transform, opacity' }}
                initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                viewport={{ once: true }}
              >
                Manifest.
              </motion.span>
            </h1>
          </div>

          {/* Subheadline */}
          <motion.div 
            className="text-center text-lg sm:text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-8 leading-relaxed"
            {...getAnimation(0.2, 20)}
          >
            <span>The first recursive AI Architect. It writes code, heals itself, and speaks your language. <span className="text-white font-medium">Welcome to the post-prompt era.</span></span>
          </motion.div>

          {/* CTAs */}
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
            {...getAnimation(0.3, 20)}
            style={{ willChange: 'transform, opacity' }}
          >
            <motion.div
              style={{ willChange: 'transform' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Link href="/builder" className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <Terminal className="w-5 h-5" />
                <span>Initialize Project</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div
              style={{ willChange: 'transform' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Link href="/how-it-works" className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2">
                <Layers className="w-5 h-5 text-zinc-400" />
                <span>System Architecture</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="flex flex-wrap justify-center gap-6 text-sm text-zinc-500 mb-16 font-mono"
            {...getAnimation(0.4, 10)}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>5 free generations/day</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>100% Code Ownership</span>
            </div>
          </motion.div>

          {/* LIVE CODE DEMO */}
          <motion.div 
            className="relative max-w-5xl mx-auto"
            initial={reducedMotion ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="relative bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/5">
              {/* Browser chrome */}
              <div className="bg-zinc-900/50 px-4 py-3 border-b border-zinc-800 flex items-center justify-between backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                    <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                    <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                  </div>
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-zinc-950 rounded border border-zinc-800 px-4 py-1.5 text-xs text-zinc-400 max-w-md mx-auto flex items-center gap-2 font-mono">
                    <Shield className="w-3 h-3 text-emerald-500" />
                    hatchit.dev/builder
                  </div>
                </div>
                <div className="text-xs text-zinc-500 font-mono">⌘K</div>
              </div>
              
              {/* Split view */}
              <div className="grid md:grid-cols-2">
                {/* Code panel */}
                <div className="bg-[#0d1117] p-3 sm:p-6 border-r border-zinc-800 h-[250px] sm:h-[400px] overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="px-2 py-1 bg-zinc-800 rounded text-[10px] text-zinc-400 font-mono">tsx</div>
                  </div>
                  <div className="flex items-center gap-2 mb-4 text-xs text-zinc-500 font-mono">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span>Architect Generating...</span>
                  </div>
                  <div className="text-emerald-400/90 font-mono text-xs leading-relaxed">
                    <TypewriterCode code={demoCode} speed={25} />
                  </div>
                </div>
                
                {/* Preview panel */}
                <div className="bg-zinc-900 p-4 sm:p-8 h-[250px] sm:h-[400px] flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                  <div className="relative z-10">
                    <div className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4 tracking-tight">Build Something Amazing</div>
                    <p className="text-sm sm:text-lg text-zinc-400 mb-4 sm:mb-6">Your vision, brought to life with AI.</p>
                    <div>
                      <Link href="/builder" className="relative inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-sm sm:text-base transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 group">
                        <span>Initialize Sequence</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Status bar */}
              <div className="bg-zinc-900/50 px-4 py-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500 font-mono">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    System Online
                  </span>
                  <span>React 19 + Tailwind 4</span>
                </div>
                <span>Auto-deploy enabled</span>
              </div>
            </div>
            
            {/* System Status */}
            <SystemStatus />
          </motion.div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <Section className="px-6 py-16 bg-zinc-900/30 border-y border-zinc-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute -left-4 top-0 text-6xl text-emerald-500/20 font-serif">{"\""}</div>
            <blockquote className="text-xl sm:text-2xl md:text-3xl text-center font-medium text-zinc-200 leading-relaxed pl-8">
              I rebuilt HatchIt with a unified AI pipeline. <span className="text-emerald-400">The Architect builds, refines, and audits.</span> Section by section, with full architectural control.
            </blockquote>
            <div className="mt-6 text-center">
              <div className="text-zinc-400 font-medium">Dan</div>
              <div className="text-sm text-zinc-600 font-mono">Lead Architect, HatchIt.dev</div>
            </div>
          </div>
        </div>
      </Section>
      {/* WHAT IS HATCHIT - Quick explainer */}
      <Section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              The Architect is here.
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
      <Section className="px-6 py-24 bg-zinc-900/30">
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
                <p className="text-sm text-zinc-400 leading-relaxed">Materializes the initial React + Tailwind structure. Powered by Gemini 2.0 Flash for instant generation.</p>
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

      {/* THE STACK */}
      <Section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Real code. Real ownership.</h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">Not proprietary lock-in. Standard React + Tailwind you can take anywhere.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'React 19', icon: <Code2 className="w-6 h-6" />, desc: 'Latest React' },
              { name: 'Tailwind CSS', icon: <Layout className="w-6 h-6" />, desc: 'Utility-first' },
              { name: 'TypeScript', icon: <Terminal className="w-6 h-6" />, desc: 'Type-safe' },
              { name: 'Responsive', icon: <Smartphone className="w-6 h-6" />, desc: 'Mobile-first' },
              { name: 'Accessible', icon: <CheckCircle2 className="w-6 h-6" />, desc: 'WCAG ready' },
              { name: 'SEO Ready', icon: <Globe className="w-6 h-6" />, desc: 'Optimized' },
              { name: 'Fast', icon: <Zap className="w-6 h-6" />, desc: 'Performance' },
              { name: 'Yours', icon: <Shield className="w-6 h-6" />, desc: '100% ownership' },
            ].map((tech, i) => (
              <motion.div 
                key={i} 
                className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-center hover:border-emerald-500/30 transition-colors gpu-accelerate"
                style={{ willChange: 'transform, opacity' }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
                whileHover={{ scale: 1.05, y: -4 }}
              >
                <motion.div 
                  className="w-12 h-12 mx-auto bg-zinc-800 rounded-lg flex items-center justify-center mb-3 text-zinc-400"
                  style={{ willChange: 'transform' }}
                  whileHover={{ scale: 1.1, color: '#10b981' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  {tech.icon}
                </motion.div>
                <div className="font-medium text-sm">{tech.name}</div>
                <div className="text-xs text-zinc-600 font-mono mt-1">{tech.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* STATS */}
      <Section className="px-6 py-16 bg-zinc-900/30 border-y border-zinc-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 30, suffix: 's', label: 'Avg. generation' },
              { value: 100, suffix: '%', label: 'Code ownership' },
              { value: 10, suffix: '', label: 'Days to build V3' },
              { value: 1, suffix: '', label: 'Person team' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2 font-mono">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-zinc-500 font-mono">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* PRICING */}
      <Section id="pricing" className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Simple pricing.</h2>
            <p className="text-xl text-zinc-400">Start free. Upgrade when you're ready to ship.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-xl">
              <div className="text-sm text-zinc-500 mb-2 font-mono">For exploring</div>
              <h3 className="text-2xl font-bold mb-1">Free</h3>
              <div className="text-4xl font-bold mb-2 font-mono">$0</div>
              <div className="text-zinc-500 text-sm mb-6">forever</div>
              <ul className="space-y-3 mb-8">
                {[
                  { text: '5 generations per day', included: true },
                  { text: 'AI builds', included: true },
                  { text: 'Live preview', included: true },
                  { text: 'AI refinements', included: false },
                  { text: 'Deploy to web', included: false },
                  { text: 'Code export', included: false },
                ].map((item, i) => (
                  <li key={i} className={`flex items-center gap-2 text-sm ${item.included ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {item.included ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-zinc-700 flex-shrink-0" />
                    )}
                    {item.text}
                  </li>
                ))}
              </ul>
              <Link href="/builder" className="block w-full py-3 text-center bg-zinc-800 hover:bg-zinc-700 rounded-lg font-semibold transition-colors">Start Free</Link>
            </div>

            {/* Pro */}
            <div className="relative p-8 bg-gradient-to-br from-teal-900/10 to-cyan-900/10 border border-teal-500/30 rounded-xl overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-teal-600 to-cyan-600 text-xs font-semibold rounded-bl-xl text-white font-mono">POPULAR</div>
              <div className="flex items-center gap-2 text-sm text-teal-400 mb-2 font-mono"><span>💠</span><span>For shipping projects</span></div>
              <h3 className="text-2xl font-bold mb-1">Pro</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold font-mono">$19</span>
                <span className="text-zinc-500">/month</span>
              </div>
              <div className="text-zinc-400 text-sm mb-6">per account</div>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited AI builds',
                  '30 AI refinements/mo',
                  'Deploy to hatchitsites.dev',
                  'Code export (ZIP)',
                  'Version history',
                  'Cloud sync',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <PricingButton 
                tier="pro" 
                className="block w-full py-3 text-center bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 rounded-lg font-semibold transition-all disabled:opacity-50 text-white shadow-[0_0_20px_rgba(20,184,166,0.2)]"
              >
                Get Pro
              </PricingButton>
            </div>

            {/* Agency */}
            <div className="relative p-8 bg-gradient-to-br from-emerald-900/10 to-teal-900/10 border border-emerald-500/30 rounded-xl overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-xs font-semibold text-white rounded-bl-xl font-mono">UNLIMITED</div>
              <div className="flex items-center gap-2 text-sm text-emerald-300 mb-2 font-mono"><span>⚡</span><span>For power users</span></div>
              <h3 className="text-2xl font-bold mb-1">Agency</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold font-mono">$49</span>
                <span className="text-zinc-500">/month</span>
              </div>
              <div className="text-zinc-400 text-sm mb-6">per account</div>
              <ul className="space-y-3 mb-8">
                {[
                  'Everything in Pro',
                  'Unlimited AI refinements',
                  'Custom domains',
                  'Priority support',
                  'Early access to features',
                  'Dedicated onboarding',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <PricingButton 
                tier="agency" 
                className="block w-full py-3 text-center bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-lg font-semibold transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              >
                Get Agency
              </PricingButton>
            </div>
          </div>
          <p className="text-center text-sm text-zinc-600 mt-8">Cancel anytime. Your code is always yours to export.</p>
        </div>
      </Section>

      {/* FINAL CTA */}
      <Section className="px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-12 md:p-16 bg-gradient-to-br from-emerald-900/20 via-teal-900/10 to-zinc-900/40 border border-emerald-500/20 rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="absolute top-4 left-4 text-emerald-500/20">
              <Terminal className="w-12 h-12" />
            </div>
            <div className="absolute bottom-4 right-4 text-emerald-500/20">
              <Cpu className="w-12 h-12" />
            </div>
            <div className="relative">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">Ready to initialize?</h2>
              <p className="text-xl text-zinc-300 mb-8 max-w-2xl mx-auto">Your next project is one prompt away. Initialize the system.</p>
              <Link href="/builder" className="inline-flex items-center gap-2 px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg font-bold text-xl transition-all md:hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <Terminal className="w-6 h-6" />
                Initialize System
              </Link>
              <p className="text-sm text-zinc-500 mt-4 font-mono">No credit card • No signup required to try</p>
            </div>
          </div>
        </div>
      </Section>

      {/* COMMUNITY / SOCIAL PROOF */}
      <Section className="px-6 py-24 border-t border-zinc-800 bg-zinc-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Built by developers, for developers.</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Placeholders for "Featured on Product Hunt", "Hacker News", etc. since we don't have real logos yet */}
             <div className="flex items-center justify-center font-bold text-xl hover:text-orange-500 transition-colors cursor-default font-mono">Product Hunt</div>
             <div className="flex items-center justify-center font-bold text-xl hover:text-orange-600 transition-colors cursor-default font-mono">Hacker News</div>
             <div className="flex items-center justify-center font-bold text-xl hover:text-blue-400 transition-colors cursor-default font-mono">Twitter / X</div>
             <div className="flex items-center justify-center font-bold text-xl hover:text-red-500 transition-colors cursor-default font-mono">Reddit</div>
          </div>
          <div className="mt-12">
            <a href="https://x.com/HatchItD" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-500 hover:text-emerald-400 transition-colors font-mono">
              Join the conversation on X →
            </a>
          </div>
        </div>
      </Section>

      {/* FOOTER - Now Global Component */}
    </div>
  )
}