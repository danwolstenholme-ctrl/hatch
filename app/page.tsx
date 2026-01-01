'use client'

/* eslint-disable react/no-unescaped-entities */

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

// System Status - shows technical initialization messages
function SystemStatus() {
  const [prompt, setPrompt] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { isSignedIn } = useUser()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || isLoading) return
    
    setIsLoading(true)
    const encodedPrompt = encodeURIComponent(prompt)
    // Direct to builder in guest mode - BuildFlowController handles the gate
    router.push(`/builder?mode=guest&prompt=${encodedPrompt}`)
  }

  return (
    <div className="w-full relative z-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className={`relative rounded-xl overflow-hidden transition-all duration-500 ${
          isFocused 
            ? 'bg-black/90 ring-2 ring-emerald-500 shadow-[0_0_100px_rgba(16,185,129,0.3)]' 
            : 'bg-black/80 border border-zinc-800 hover:border-zinc-700'
        }`}
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 animate-pulse"></div>
            </div>
            <span className="ml-2 text-[10px] font-mono text-emerald-500/50 uppercase tracking-wider">SINGULARITY_INTERFACE_v9.0</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-mono text-emerald-500">ONLINE</span>
          </div>
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-2">
          <div className="relative flex items-center">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500">
              <Terminal className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="A SaaS landing page with dark theme, animated hero, and pricing..."
              className="w-full bg-transparent text-white placeholder-zinc-600 pl-12 pr-32 py-4 text-lg font-mono focus:outline-none"
              autoFocus
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <button
                type="submit"
                disabled={!prompt.trim() || isLoading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 sm:px-6 py-2 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group min-w-[100px] justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="hidden sm:inline">LOADING</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">INITIALIZE</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
        
        {/* System Logs (Decorative) */}
        <div className="px-4 py-2 bg-zinc-950/50 border-t border-zinc-900 text-[10px] font-mono text-zinc-600 flex justify-between">
           <span>Waiting for input...</span>
           <span>MEM: 64TB // CPU: QUANTUM</span>
        </div>
      </motion.div>
    </div>
  )
}

// Pricing button that handles auth + checkout
function PricingButton({ tier, className, children }: { tier: 'lite' | 'pro' | 'agency', className: string, children: React.ReactNode }) {
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

const demoCode = `// Generated by The Architect
'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="py-24 px-6">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-6xl font-bold"
      >
        Your headline here
      </motion.h1>
      <button className="mt-8 px-8 py-4 
        bg-emerald-500 hover:bg-emerald-400 
        rounded-xl font-semibold">
        Get Started <ArrowRight />
      </button>
    </section>
  )
}`

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
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* LEFT COLUMN: Copy & Value Prop */}
            <div className="text-left relative z-10">
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
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tighter mb-6">
                  <motion.span 
                    className="block"
                    style={{ willChange: 'transform, opacity' }}
                    initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                    viewport={{ once: true }}
                  >
                    Code is dead.
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
                className="flex flex-wrap gap-6 text-sm text-zinc-500 font-mono"
                {...getAnimation(0.4, 10)}
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>Sovereign Code</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  <span>Neural Speed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-500" />
                  <span>Architect Control</span>
                </div>
              </motion.div>
            </div>

            {/* RIGHT COLUMN: Interactive Input */}
            <div className="relative z-20">
              {/* Decorative background glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl blur-2xl opacity-50 pointer-events-none"></div>
              
              <SystemStatus />
            </div>
          </div>

        </div>
      </section>



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

      {/* INTERACTIVE CTA - The Hook */}
      <Section className="px-6 py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-emerald-950/20 to-zinc-950 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Glowing badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 text-sm font-mono">LIVE DEMO AVAILABLE</span>
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight">
              <span className="text-white">See it work.</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">Right now.</span>
            </h2>
            
            <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
              No signup. No credit card. Just type what you want and watch The Architect build it in real-time.
            </p>

            {/* Big glowing CTA */}
            <Link href="/builder?mode=guest">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 rounded-2xl font-bold text-xl text-white shadow-[0_0_60px_rgba(16,185,129,0.4)] hover:shadow-[0_0_80px_rgba(16,185,129,0.6)] transition-all cursor-pointer group"
              >
                <Terminal className="w-6 h-6" />
                <span>Try The Builder Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.div>
            </Link>

            {/* Social proof micro-stat */}
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                <span>~30 second builds</span>
              </div>
              <div className="w-px h-4 bg-zinc-800" />
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-500" />
                <span>Real React code</span>
              </div>
              <div className="w-px h-4 bg-zinc-800 hidden sm:block" />
              <div className="hidden sm:flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>Your code, forever</span>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* WHAT IS HATCHIT - Quick explainer */}
      <Section className="px-6 py-24">
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
      <Section id="pricing" className="px-6 py-24">
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
                  'Unlimited AI Refinements',
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
            
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">Ready to initialize?</h2>
              <p className="text-xl text-zinc-300 mb-8 max-w-2xl mx-auto">Your next project is one prompt away. Initialize the system.</p>
              <Link href={isSignedIn ? "/builder" : "/sign-up"} className="inline-flex items-center gap-2 px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg font-bold text-xl transition-all md:hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <Terminal className="w-6 h-6" />
                {isSignedIn ? 'Initialize System' : 'Initialize Architect'}
              </Link>
              <p className="text-sm text-zinc-500 mt-4 font-mono">System Online • v9.0 • Ready</p>
            </div>
          </div>
        </div>
      </Section>

      {/* FOLLOW - Simple CTA */}
      <section className="px-6 py-16 border-t border-zinc-800 bg-zinc-950">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-zinc-500 mb-4">Built by developers, for developers.</p>
          <a href="https://x.com/HatchItD" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors font-mono text-sm">
            <span>Follow the build on X</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* FOOTER - Now Global Component */}
    </div>
  )
}