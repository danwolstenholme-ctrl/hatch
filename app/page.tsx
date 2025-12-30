'use client'

/* eslint-disable react/no-unescaped-entities */

import { useEffect, useState, useRef, useSyncExternalStore } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useUser } from '@clerk/nextjs'
import { motion, useInView } from 'framer-motion'
import HatchCharacter from '@/components/HatchCharacter'

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
    <pre className="text-[10px] sm:text-xs md:text-sm font-mono text-left overflow-x-auto max-w-full">
      <code className="break-words">
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

// AI Thinking Caption - shows rotating "reasoning" messages
function AIThinkingCaption() {
  const thoughts = [
    { icon: '💭', text: 'Analyzing your prompt for intent and tone...' },
    { icon: '🎨', text: 'Choosing gradient direction to guide eye flow toward CTA' },
    { icon: '📐', text: 'Using 6xl headline — bold enough to anchor, not overwhelm' },
    { icon: '🎯', text: 'Purple CTA on dark = high contrast, draws immediate focus' },
    { icon: '✨', text: 'Adding subtle hover state to reinforce interactivity' },
    { icon: '📱', text: 'Responsive padding: tight on mobile, breathing room on desktop' },
  ]
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % thoughts.length)
        setIsVisible(true)
      }, 300)
    }, 4000)
    return () => clearInterval(interval)
  }, [thoughts.length])
  
  const current = thoughts[currentIndex]
  
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <motion.div
        className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -5 }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-sm">{current.icon}</span>
        <span className="text-sm text-purple-300/90">{current.text}</span>
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
      <FloatingChicks />
      
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
      `}</style>

      {/* HERO - The main event */}
      <section className="relative px-4 sm:px-6 pt-6 pb-16 md:pt-16 md:pb-32">
        <div className="max-w-6xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <motion.div 
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-zinc-900/80 border border-zinc-800 rounded-full"
              {...getAnimation(0, 20)}
            >
              <span className="flex h-2 w-2 flex-shrink-0">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs sm:text-sm text-zinc-400">V3.0 — Section-by-section building</span>
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
                Describe it.
              </motion.span>
              <motion.span 
                className="block bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent pb-2"
                style={{ willChange: 'transform, opacity' }}
                initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                viewport={{ once: true }}
              >
                Watch it build.
              </motion.span>
              <motion.span 
                className="block"
                style={{ willChange: 'transform, opacity' }}
                initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                viewport={{ once: true }}
              >
                Ship it.
              </motion.span>
            </h1>
          </div>

          {/* Subheadline */}
          <motion.div 
            className="text-center text-lg sm:text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-8 leading-relaxed"
            {...getAnimation(0.2, 20)}
          >
            <span>The AI website builder that writes <span className="text-white font-medium">real, maintainable</span> React code. Section by section. With Hatch, your friendly helper</span>
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
              <Link href="/builder" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors">
                <span>Start Building Free</span>
                <span>→</span>
              </Link>
            </motion.div>
            <motion.div
              style={{ willChange: 'transform' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Link href="/how-it-works" className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2">
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
              <span>5 free generations/day</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
              <span>Real React code you own</span>
            </div>
          </motion.div>

          {/* LIVE CODE DEMO */}
          <motion.div 
            className="relative max-w-5xl mx-auto"
            initial={reducedMotion ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
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
                  <div className="text-purple-400/90">
                    <TypewriterCode code={demoCode} speed={25} />
                  </div>
                </div>
                
                {/* Preview panel */}
                <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-8 h-[250px] sm:h-[400px] flex flex-col justify-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">Build Something Amazing</div>
                  <p className="text-sm sm:text-lg text-slate-300 mb-4 sm:mb-6">Your vision, brought to life with AI.</p>
                  <div>
                    <Link href="/builder" className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-colors">Get Started</Link>
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
            
            {/* AI Thinking Caption */}
            <AIThinkingCaption />
          </motion.div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <Section className="px-6 py-16 bg-zinc-900/30 border-y border-zinc-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute -left-4 top-0 text-6xl text-purple-500/20">{"\""}</div>
            <blockquote className="text-xl sm:text-2xl md:text-3xl text-center font-medium text-zinc-200 leading-relaxed pl-8">
              I rebuilt HatchIt with a three-model AI pipeline. <span className="text-purple-400">Sonnet builds, Opus polishes, Gemini audits.</span> Section by section, with Hatch guiding you through.
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
              V3.0 is here.
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Build smarter, not harder.</span>
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              A three-model AI pipeline. Section-by-section building. And Hatch — your friendly prompt helper who's genuinely excited about your business.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Three-Model Pipeline Card */}
            <AnimatedCard 
              delay={0}
              className="group relative p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-colors duration-300 gpu-accelerate"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-600 opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500" />
              <div className="relative">
                <motion.span 
                  className="text-4xl block mb-4"
                  style={{ willChange: 'transform' }}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  🧠
                </motion.span>
                <h3 className="text-xl font-bold mb-2 group-hover:text-purple-300 transition-colors">Three-Model Pipeline</h3>
                <p className="text-zinc-400">Sonnet builds. Opus polishes. Gemini audits. Each AI does what it&apos;s best at. Not just one model doing everything.</p>
              </div>
            </AnimatedCard>

            {/* MEET HATCH - The star of the show! */}
            <AnimatedCard 
              delay={0.1}
              className="group relative p-6 bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-2xl hover:border-amber-500/40 transition-colors duration-300 gpu-accelerate"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500" />
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <motion.div
                    className="text-4xl block"
                    style={{ willChange: 'transform' }}
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  >
                    <HatchCharacter state="excited" size="md" />
                  </motion.div>
                  <motion.span 
                    className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] text-amber-400"
                    style={{ willChange: 'transform' }}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ✨ NEW
                  </motion.span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-amber-200 group-hover:text-amber-100 transition-colors">Meet Hatch</h3>
                <p className="text-zinc-400">Your friendly prompt helper. Stuck on what to write? Hatch writes it for you. She&apos;s cute, helpful, and genuinely excited about your project.</p>
              </div>
            </AnimatedCard>

            {/* Section-by-Section Card */}
            <AnimatedCard 
              delay={0.2}
              className="group relative p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-colors duration-300 gpu-accelerate"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500" />
              <div className="relative">
                <motion.span 
                  className="text-4xl block mb-4"
                  style={{ willChange: 'transform' }}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  🏗️
                </motion.span>
                <h3 className="text-xl font-bold mb-2 group-hover:text-purple-300 transition-colors">Section-by-Section</h3>
                <p className="text-zinc-400">Build your site one section at a time. Header, hero, features, pricing — each piece crafted and refined before moving on.</p>
              </div>
            </AnimatedCard>
          </div>

          <div className="text-center mt-12">
            <Link href="/features" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium transition-colors">See all features <span>→</span></Link>
          </div>
        </div>
      </Section>

      {/* HOW IT WORKS - The AI Pipeline */}
      <Section className="px-6 py-24 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Not just one AI. A team.</h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">Most builders use a single model for everything. We orchestrate three specialists to build, polish, and audit your code.</p>
          </div>

          <div className="relative grid md:grid-cols-3 gap-8">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-amber-500/20" />
            
            {/* Sonnet */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
            >
              <div className="relative z-10 bg-zinc-950 border border-zinc-800 p-8 rounded-2xl hover:border-purple-500/30 transition-colors group">
                <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 text-3xl group-hover:scale-110 transition-transform duration-300">🏗️</div>
                <div className="text-xs font-mono text-purple-400 mb-3 tracking-wider">THE BUILDER</div>
                <h3 className="text-2xl font-bold mb-3">Claude Sonnet 3.5</h3>
                <p className="text-zinc-400 leading-relaxed">Writes the initial React + Tailwind code. Fast, accurate, and knows modern web standards inside out.</p>
              </div>
            </motion.div>

            {/* Opus */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="relative z-10 bg-zinc-950 border border-zinc-800 p-8 rounded-2xl hover:border-pink-500/30 transition-colors group">
                <div className="w-16 h-16 bg-pink-500/10 rounded-2xl flex items-center justify-center mb-6 text-3xl group-hover:scale-110 transition-transform duration-300">✨</div>
                <div className="text-xs font-mono text-pink-400 mb-3 tracking-wider">THE DESIGNER</div>
                <h3 className="text-2xl font-bold mb-3">Claude Opus</h3>
                <p className="text-zinc-400 leading-relaxed">Polishes the UI. Fixes accessibility. Adds hover states, smooth animations, and responsive touches.</p>
              </div>
            </motion.div>

            {/* Gemini */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative z-10 bg-zinc-950 border border-zinc-800 p-8 rounded-2xl hover:border-amber-500/30 transition-colors group">
                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 text-3xl group-hover:scale-110 transition-transform duration-300">🛡️</div>
                <div className="text-xs font-mono text-amber-400 mb-3 tracking-wider">THE AUDITOR</div>
                <h3 className="text-2xl font-bold mb-3">Gemini 1.5 Pro</h3>
                <p className="text-zinc-400 leading-relaxed">Reviews the code for bugs, security issues, and performance bottlenecks before you ship.</p>
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
                  whileHover={{ scale: 1.2, rotate: 10 }}
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
              { value: 10, suffix: '', label: 'Days (& nights) to build V3' },
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
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Simple pricing.</h2>
            <p className="text-xl text-zinc-400">Start free. Upgrade when you're ready to ship.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
              <div className="text-sm text-zinc-500 mb-2">For exploring</div>
              <h3 className="text-2xl font-bold mb-1">Free</h3>
              <div className="text-4xl font-bold mb-2">$0</div>
              <div className="text-zinc-500 text-sm mb-6">forever</div>
              <ul className="space-y-3 mb-8">
                {[
                  { text: '5 generations per day', included: true },
                  { text: 'Sonnet builds', included: true },
                  { text: 'Live preview', included: true },
                  { text: 'Opus refinements', included: false },
                  { text: 'Deploy to web', included: false },
                  { text: 'Code export', included: false },
                ].map((item, i) => (
                  <li key={i} className={`flex items-center gap-2 text-sm ${item.included ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {item.included ? (
                      <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    ) : (
                      <svg className="w-4 h-4 text-zinc-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                    )}
                    {item.text}
                  </li>
                ))}
              </ul>
              <Link href="/builder" className="block w-full py-3 text-center bg-zinc-800 hover:bg-zinc-700 rounded-xl font-semibold transition-colors">Start Free</Link>
            </div>

            {/* Pro */}
            <div className="relative p-8 bg-gradient-to-br from-purple-900/30 to-pink-900/20 border border-purple-500/30 rounded-2xl overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-xs font-semibold rounded-bl-xl">RECOMMENDED</div>
              <div className="flex items-center gap-2 text-sm text-purple-300 mb-2"><span>🐣</span><span>For shipping projects</span></div>
              <h3 className="text-2xl font-bold mb-1">Pro</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold">$39</span>
                <span className="text-zinc-500">/month</span>
              </div>
              <div className="text-zinc-400 text-sm mb-6">per account</div>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited Sonnet builds',
                  '30 Opus refinements/mo',
                  'Deploy to hatchitsites.dev',
                  'Code export (ZIP)',
                  'Version history',
                  'Cloud sync',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                    <svg className="w-4 h-4 text-purple-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <PricingButton 
                tier="pro" 
                className="block w-full py-3 text-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold transition-all disabled:opacity-50"
              >
                Get Pro
              </PricingButton>
            </div>

            {/* Agency */}
            <div className="relative p-8 bg-gradient-to-br from-amber-900/20 to-orange-900/10 border border-amber-500/30 rounded-2xl overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-xs font-semibold text-zinc-900 rounded-bl-xl">UNLIMITED</div>
              <div className="flex items-center gap-2 text-sm text-amber-300 mb-2"><span>⚡</span><span>For power users</span></div>
              <h3 className="text-2xl font-bold mb-1">Agency</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold">$99</span>
                <span className="text-zinc-500">/month</span>
              </div>
              <div className="text-zinc-400 text-sm mb-6">per account</div>
              <ul className="space-y-3 mb-8">
                {[
                  'Everything in Pro',
                  'Unlimited Opus refinements',
                  'Custom domains',
                  'Priority support',
                  'Early access to features',
                  'Dedicated onboarding',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                    <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <PricingButton 
                tier="agency" 
                className="block w-full py-3 text-center bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-900 rounded-xl font-semibold transition-all disabled:opacity-50"
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

      {/* COMMUNITY / SOCIAL PROOF */}
      <Section className="px-6 py-24 border-t border-zinc-800 bg-zinc-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Built by developers, for developers.</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Placeholders for "Featured on Product Hunt", "Hacker News", etc. since we don't have real logos yet */}
             <div className="flex items-center justify-center font-bold text-xl hover:text-orange-500 transition-colors cursor-default">Product Hunt</div>
             <div className="flex items-center justify-center font-bold text-xl hover:text-orange-600 transition-colors cursor-default">Hacker News</div>
             <div className="flex items-center justify-center font-bold text-xl hover:text-blue-400 transition-colors cursor-default">Twitter / X</div>
             <div className="flex items-center justify-center font-bold text-xl hover:text-red-500 transition-colors cursor-default">Reddit</div>
          </div>
          <div className="mt-12">
            <a href="https://x.com/HatchItD" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              Join the conversation on X →
            </a>
          </div>
        </div>
      </Section>

      {/* FOOTER - Now Global Component */}
    </div>
  )
}