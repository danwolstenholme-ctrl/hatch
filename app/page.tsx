'use client'

import { useEffect, useState, useRef, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { motion, useInView } from 'framer-motion'

// Client-side check to prevent hydration mismatch - uses useSyncExternalStore for proper SSR handling
const emptySubscribe = () => () => {}
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

// Only respect user's accessibility preference - NOT device type
function useReducedMotion() {
  const getReducedMotion = () => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
  
  const [reduced, setReduced] = useState(getReducedMotion)
  
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  
  return reduced
}

// Check if mobile for lighter animations (not disabled, just optimized)
function useIsMobile() {
  const getIsMobile = () => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < 768
  }
  
  const [isMobile, setIsMobile] = useState(getIsMobile)
  
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  
  return isMobile
}

// Typewriter effect for code demo
function TypewriterCode({ code, speed = 30 }: { code: string; speed?: number }) {
  const [displayedCode, setDisplayedCode] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < code.length) {
      const timeout = setTimeout(() => {
        setDisplayedCode(prev => prev + code[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, code, speed])

  // Reset and restart
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayedCode('')
      setCurrentIndex(0)
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <pre className="text-[10px] sm:text-xs md:text-sm font-mono text-left overflow-hidden">
      <code>
        {displayedCode}
        <span className="animate-pulse">|</span>
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

// Floating chicks background - DESKTOP ONLY with premium motion
function FloatingChicks() {
  const isClient = useIsClient()
  const chicks = [
    { left: '15%', top: '20%', delay: 0, duration: 20 },
    { left: '75%', top: '15%', delay: 2, duration: 25 },
    { left: '85%', top: '60%', delay: 4, duration: 22 },
    { left: '10%', top: '70%', delay: 1, duration: 28 },
    { left: '50%', top: '80%', delay: 3, duration: 24 },
  ]
  
  // Don't render until client to prevent hydration flash
  if (!isClient) return null
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block">
      {chicks.map((chick, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          style={{ 
            left: chick.left, 
            top: chick.top,
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden'
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0.08, 0.15, 0.08],
            scale: [0.8, 1, 0.8],
            y: [0, -30, 0],
            x: [0, 10, -10, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: chick.duration,
            delay: chick.delay,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          🐣
        </motion.div>
      ))}
    </div>
  )
}

// Section wrapper - optimized animations for all devices
function Section({ children, className = '', id = '' }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const isClient = useIsClient()
  
  // Mobile: lighter animation (less distance, faster)
  // Desktop: full effect
  const yOffset = isMobile ? 15 : 30
  const duration = isMobile ? 0.35 : 0.5
  
  // On server or before hydration, render without animation to prevent flash
  if (!isClient) {
    return (
      <section id={id} className={className} style={{ opacity: 0 }}>
        {children}
      </section>
    )
  }
  
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

const demoCode = `export default function Hero() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <h1 className="text-6xl font-bold text-white mb-6">
          Build Something Amazing
        </h1>
        <p className="text-xl text-slate-300 mb-8">
          Your vision, brought to life with AI.
        </p>
        <button className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold transition-all">
          Get Started
        </button>
      </div>
    </section>
  )
}`

export default function Home() {
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  
  // Animation config - lighter on mobile, full on desktop
  const getAnimation = (delay = 0, yOffset = 20) => {
    if (reducedMotion) return {}
    return {
      initial: { opacity: 0, y: isMobile ? yOffset * 0.5 : yOffset },
      animate: { opacity: 1, y: 0 },
      transition: { 
        duration: isMobile ? 0.35 : 0.5, 
        delay: isMobile ? delay * 0.7 : delay,
        ease: [0.25, 0.1, 0.25, 1] as const // easeOut cubic bezier
      }
    }
  }
  
  return (
    <div className="min-h-screen bg-zinc-950 text-white relative">
      <FloatingChicks />
      
      {/* Gradient orbs - simplified on mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-2xl md:blur-[100px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-500/15 rounded-full blur-2xl md:blur-[100px] hidden md:block" />
        <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-2xl md:blur-[100px] hidden md:block" />
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
      `}</style>

      {/* Navigation */}
      <nav className="relative z-50 px-6 py-5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <motion.span 
              className="text-2xl inline-block"
              style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
              initial={{ rotate: 0, scale: 1 }}
              animate={{ 
                rotate: [0, -10, 10, -5, 5, 0],
                scale: [1, 1.1, 1, 1.05, 1]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                repeatDelay: 3,
                ease: "easeInOut"
              }}
            >
              🐣
            </motion.span>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">HatchIt</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="/features" className="text-zinc-400 hover:text-white transition-colors text-sm">Features</Link>
            <Link href="/how-it-works" className="text-zinc-400 hover:text-white transition-colors text-sm">How It Works</Link>
            <Link href="/about" className="text-zinc-400 hover:text-white transition-colors text-sm">About</Link>
            <a href="#pricing" className="text-zinc-400 hover:text-white transition-colors text-sm">Pricing</a>
          </div>
          
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-zinc-400 hover:text-white transition-colors text-sm hidden sm:block">Sign In</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <Link href="/builder" className="px-5 py-2.5 bg-white text-zinc-900 hover:bg-zinc-100 rounded-lg font-semibold text-sm transition-all">
              Start Building
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO - The main event */}
      <section className="relative px-4 sm:px-6 pt-6 pb-16 md:pt-16 md:pb-32">
        <div className="max-w-6xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <motion.div 
              className="relative inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-full overflow-hidden gpu-accelerate"
              {...getAnimation(0, 20)}
              style={{ willChange: 'transform, opacity' }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent -skew-x-12 shimmer-smooth"
                initial={{ x: '-200%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
                style={{ willChange: 'transform' }}
              />
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="relative text-xs sm:text-sm text-amber-200/80 text-center">Built in 3 days. Already changing how people build.</span>
            </motion.div>
          </div>

          {/* Main headline */}
          <div className="text-center mb-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black leading-[1] sm:leading-[0.95] tracking-tight mb-6">
              <motion.span 
                className="block"
                style={{ willChange: 'transform, opacity' }}
                initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              >
                Describe it.
              </motion.span>
              <motion.span 
                className="block bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent"
                style={{ willChange: 'transform, opacity' }}
                initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              >
                Watch it build.
              </motion.span>
              <motion.span 
                className="block"
                style={{ willChange: 'transform, opacity' }}
                initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              >
                Ship it.
              </motion.span>
            </h1>
          </div>

          {/* Subheadline */}
          <motion.p 
            className="text-center text-lg sm:text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-8 leading-relaxed"
            {...getAnimation(0.2, 20)}
          >
            The AI website builder that writes <span className="text-white font-medium">real, maintainable</span> React code. Not drag-and-drop garbage. Actual code you own.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
            {...getAnimation(0.3, 20)}
            style={{ willChange: 'transform, opacity' }}
          >
            <motion.div
              style={{ willChange: 'transform' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Link href="/builder" className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-lg flex items-center justify-center gap-2 overflow-hidden gpu-accelerate">
                {/* Glow effect */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"
                />
                <span className="relative">Start Building Free</span>
                <motion.span 
                  className="relative"
                  style={{ willChange: 'transform' }}
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  →
                </motion.span>
              </Link>
            </motion.div>
            <motion.div
              style={{ willChange: 'transform' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Link href="/how-it-works" className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-purple-500/30 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 gpu-accelerate">
                See How It Works
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="flex flex-wrap justify-center gap-6 text-sm text-zinc-500 mb-16"
            {...getAnimation(0.4, 10)}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
              <span>10 free generations/day</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
              <span>Export your code anytime</span>
            </div>
          </motion.div>

          {/* LIVE CODE DEMO - The showstopper */}
          <motion.div 
            className="relative max-w-5xl mx-auto"
            initial={reducedMotion ? false : { opacity: 0, y: isMobile ? 20 : 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: isMobile ? 0.5 : 0.8, delay: isMobile ? 0.35 : 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-amber-500/20 rounded-3xl blur-xl" />
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
              {/* Browser chrome */}
              <div className="bg-zinc-900 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-zinc-800 rounded-lg px-4 py-1.5 text-xs text-zinc-400 max-w-md mx-auto flex items-center gap-2">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    hatchit.dev/builder
                  </div>
                </div>
                <div className="text-xs text-zinc-500">⌘K</div>
              </div>
              
              {/* Split view */}
              <div className="grid md:grid-cols-2">
                {/* Code panel */}
                <div className="bg-[#0d1117] p-3 sm:p-6 border-r border-zinc-800 h-[250px] sm:h-[400px] overflow-hidden">
                  <div className="flex items-center gap-2 mb-4 text-xs text-zinc-500">
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
                    <span>Live generating...</span>
                  </div>
                  <div className="text-green-400/90">
                    <TypewriterCode code={demoCode} speed={25} />
                  </div>
                </div>
                
                {/* Preview panel */}
                <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-8 h-[250px] sm:h-[400px] flex flex-col justify-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">Build Something Amazing</div>
                  <p className="text-sm sm:text-lg text-slate-300 mb-4 sm:mb-6">Your vision, brought to life with AI.</p>
                  <div>
                    <button className="px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base">Get Started</button>
                  </div>
                </div>
              </div>
              
              {/* Status bar */}
              <div className="bg-zinc-900 px-4 py-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    Preview ready
                  </span>
                  <span>React + Tailwind</span>
                </div>
                <span>Auto-saves • One-click deploy</span>
              </div>
            </div>
            
            {/* Caption */}
            <p className="text-center text-sm text-zinc-500 mt-6">↑ This is real. Type a prompt, watch your site get written line by line.</p>
          </motion.div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <Section className="px-6 py-16 bg-zinc-900/30 border-y border-zinc-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute -left-4 top-0 text-6xl text-purple-500/20">{"\""}</div>
            <blockquote className="text-xl sm:text-2xl md:text-3xl text-center font-medium text-zinc-200 leading-relaxed pl-8">
              I built this entire product in 3 days with Claude Opus 4.5. <span className="text-purple-400">The AI writes the code, I make the decisions.</span> This is the future of building.
            </blockquote>
            <div className="mt-6 text-center">
              <div className="text-zinc-400 font-medium">Dan</div>
              <div className="text-sm text-zinc-600">Founder, HatchIt.dev</div>
            </div>
          </div>
        </div>
      </Section>
      {/* WHAT IS HATCHIT - Quick explainer */}
      <Section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              The AI builder that
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">actually works.</span>
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Other AI tools give you bloated, unmaintainable code. HatchIt generates clean React + Tailwind that developers actually want to work with.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🧠', title: 'AI That Gets It', description: 'Powered by Claude Opus 4.5. Understands design, code patterns, and your intent. Not just another GPT wrapper.', gradient: 'from-purple-500 to-indigo-600' },
              { icon: '⚡', title: 'Live Code Streaming', description: 'Watch your site being written in real-time. See the code appear as the AI thinks. Pure magic.', gradient: 'from-amber-500 to-orange-600', badge: 'Hatched' },
              { icon: '🚀', title: 'Ship in One Click', description: 'Deploy to our global CDN instantly. Get a live URL in seconds. Connect your own domain.', gradient: 'from-emerald-500 to-teal-600' },
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                className="group relative p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-colors duration-300 gpu-accelerate"
                style={{ willChange: 'transform, opacity' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                whileHover={{ y: -8, transition: { type: 'spring', stiffness: 400, damping: 17 } }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500`} />
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <motion.span 
                      className="text-4xl block"
                      style={{ willChange: 'transform' }}
                      whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    >
                      {feature.icon}
                    </motion.span>
                    {feature.badge && (
                      <motion.span 
                        className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] text-amber-400"
                        style={{ willChange: 'transform' }}
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        🐣 {feature.badge}
                      </motion.span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-purple-300 transition-colors">{feature.title}</h3>
                  <p className="text-zinc-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/features" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium transition-colors">See all features <span>→</span></Link>
          </div>
        </div>
      </Section>

      {/* HOW IT WORKS - 3 Steps */}
      <Section className="px-6 py-24 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Three steps. Infinite possibilities.</h2>
            <p className="text-xl text-zinc-400">From idea to live website in minutes.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Describe', description: 'Tell the AI what you want in plain English. A dark SaaS landing page with pricing works perfectly.', icon: '💭' },
              { step: '02', title: 'Build', description: 'Watch real React code stream in live. Refine with follow-up prompts. Iterate until perfect.', icon: '⚡' },
              { step: '03', title: 'Ship', description: 'One click. Live URL. Your site is on the internet. Connect your domain if you want.', icon: '🚀' },
            ].map((item, i) => (
              <div key={i} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-[2px] z-0 overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-transparent shimmer-smooth"
                      style={{ willChange: 'transform' }}
                      initial={{ x: '-100%' }}
                      whileInView={{ x: '0%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    />
                  </div>
                )}
                <motion.div 
                  className="relative z-10 text-center md:text-left"
                  style={{ willChange: 'transform, opacity' }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <motion.div 
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-4 gpu-accelerate"
                    style={{ willChange: 'transform' }}
                    whileHover={{ scale: 1.1, borderColor: 'rgba(168, 85, 247, 0.5)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  >
                    <span className="text-3xl">{item.icon}</span>
                  </motion.div>
                  <div className="text-xs font-mono text-purple-400/60 mb-2">STEP {item.step}</div>
                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="text-zinc-400">{item.description}</p>
                </motion.div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/how-it-works" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium transition-colors">Detailed walkthrough <span>→</span></Link>
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
              { name: 'React 19', icon: '⚛️', desc: 'Latest React' },
              { name: 'Tailwind CSS', icon: '🎨', desc: 'Utility-first' },
              { name: 'TypeScript', icon: '📘', desc: 'Type-safe' },
              { name: 'Responsive', icon: '📱', desc: 'Mobile-first' },
              { name: 'Accessible', icon: '♿', desc: 'WCAG ready' },
              { name: 'SEO Ready', icon: '🔍', desc: 'Optimized' },
              { name: 'Fast', icon: '⚡', desc: 'Performance' },
              { name: 'Yours', icon: '💝', desc: '100% ownership' },
            ].map((tech, i) => (
              <motion.div 
                key={i} 
                className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-center hover:border-purple-500/30 transition-colors gpu-accelerate"
                style={{ willChange: 'transform, opacity' }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
                whileHover={{ scale: 1.05, y: -4 }}
              >
                <motion.span 
                  className="text-2xl block mb-2"
                  style={{ willChange: 'transform' }}
                  whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  {tech.icon}
                </motion.span>
                <div className="font-medium text-sm">{tech.name}</div>
                <div className="text-xs text-zinc-600">{tech.desc}</div>
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
              { value: 3, suffix: '', label: 'Days to build this' },
              { value: 1, suffix: '', label: 'Person team' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* PRICING */}
      <Section id="pricing" className="px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Simple pricing.</h2>
            <p className="text-xl text-zinc-400">Start free. Pay when you ship.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free */}
            <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
              <div className="text-sm text-zinc-500 mb-2">For trying it out</div>
              <h3 className="text-2xl font-bold mb-1">Free</h3>
              <div className="text-4xl font-bold mb-6">$0</div>
              <ul className="space-y-3 mb-8">
                {['10 generations per day', 'Full code editor', 'Live preview', 'Export as ZIP', 'Unlimited projects locally'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/builder" className="block w-full py-3 text-center bg-zinc-800 hover:bg-zinc-700 rounded-xl font-semibold transition-colors">Start Free</Link>
            </div>

            {/* Hatched */}
            <div className="relative p-8 bg-gradient-to-br from-purple-900/30 to-pink-900/20 border border-purple-500/30 rounded-2xl overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-xs font-semibold rounded-bl-xl">RECOMMENDED</div>
              <div className="flex items-center gap-2 text-sm text-purple-300 mb-2"><span>🐣</span><span>For shipping projects</span></div>
              <h3 className="text-2xl font-bold mb-1">Hatch Project</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold">$24</span>
                <span className="text-zinc-500">one-time setup</span>
              </div>
              <div className="text-zinc-400 mb-6">+ $19/mo per project</div>
              <ul className="space-y-3 mb-8">
                {['Everything in Free', 'Live code streaming', 'Unlimited generations', 'Custom domains', 'Brand customization', 'Version history', 'Cloud sync', 'Priority support'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                    <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/builder" className="block w-full py-3 text-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold transition-all">Hatch a Project</Link>
            </div>
          </div>
          <p className="text-center text-sm text-zinc-600 mt-8">Cancel anytime. Your code is always yours to export.</p>
        </div>
      </Section>

      {/* FINAL CTA */}
      <Section className="px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-12 md:p-16 bg-gradient-to-br from-purple-900/40 via-pink-900/30 to-amber-900/40 border border-purple-500/20 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="absolute top-4 left-4 text-4xl opacity-30">🐣</div>
            <div className="absolute bottom-4 right-4 text-4xl opacity-30">🐣</div>
            <div className="relative">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">Ready to hatch something?</h2>
              <p className="text-xl text-zinc-300 mb-8 max-w-2xl mx-auto">Your next website is one prompt away. Start building for free.</p>
              <Link href="/builder" className="inline-flex items-center gap-2 px-10 py-5 bg-white text-zinc-900 hover:bg-zinc-100 rounded-xl font-bold text-xl transition-all md:hover:scale-105 active:scale-95">
                Start Building Free <span>→</span>
              </Link>
              <p className="text-sm text-zinc-500 mt-4">No credit card • No signup required to try</p>
            </div>
          </div>
        </div>
      </Section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-800 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4"><span className="text-2xl">🐣</span><span className="font-bold text-xl">HatchIt</span></div>
              <p className="text-sm text-zinc-500 mb-4">AI website builder that outputs real, maintainable code.</p>
              <div className="flex items-center gap-3">
                <a href="https://x.com/HatchItD" target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-zinc-400"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://www.linkedin.com/company/hatchit-dev/" target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-zinc-400"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li><Link href="/builder" className="hover:text-white transition-colors">Builder</Link></li>
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/roadmap" className="hover:text-white transition-colors">Roadmap</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><a href="mailto:hello@hatchit.dev" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-zinc-600">© 2025 HatchIt. All rights reserved.</p>
            <p className="text-sm text-zinc-600">Built with 💜 and way too much coffee</p>
          </div>
        </div>
      </footer>
    </div>
  )
}