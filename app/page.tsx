'use client'

/* eslint-disable react/no-unescaped-entities */
// Deploy trigger: 2026-01-02

import { useEffect, useState, useRef, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Cpu, Terminal, Layers, Shield, Zap, Code2, Globe, ArrowRight, CheckCircle2, Layout, Wand2, Smartphone, Brain } from 'lucide-react'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import HomepageWelcome from '@/components/HomepageWelcome'
import SingularityTransition from '@/components/singularity/SingularityTransition'

// Client-side check to prevent hydration mismatch
const emptySubscribe = () => () => {}
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

// The Void Button - hands off to launch page for the immersive experience
function VoidButton({ isSignedIn, router, onLaunch }: { isSignedIn: boolean | undefined, router: AppRouterInstance, onLaunch: () => void }) {
  
  const handleClick = () => {
    onLaunch()
  }
  
  return (
    <button
      onClick={handleClick}
      className="group relative w-full sm:w-auto inline-flex justify-center items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-zinc-900/80 hover:bg-zinc-900 border border-emerald-500/30 hover:border-emerald-500/60 rounded-md font-bold text-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_60px_rgba(16,185,129,0.15)] hover:shadow-[0_0_80px_rgba(16,185,129,0.25)] overflow-hidden"
    >
      {/* Glow ring on hover - Always active on mobile via CSS animation */}
      <div className="absolute -inset-[2px] rounded-md bg-gradient-to-r from-emerald-500/40 via-teal-500/40 to-emerald-500/40 opacity-50 sm:opacity-0 sm:group-hover:opacity-100 blur-md transition-opacity duration-500 animate-pulse sm:animate-none" />
      
      <div className="relative z-10 flex items-center gap-3">
        <span className="text-white tracking-wide font-mono uppercase">Initialize System</span>
        <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  )
}

// Section wrapper - simple fade-in on scroll
function Section({ children, className = '', id = '' }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  
  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
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



// FloatingNodes removed to reduce background layering and potential scroll jank

// Typewriter effect for hero code preview
function TypewriterCode() {
  const [displayedText, setDisplayedText] = useState('')
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  
  const prompts = [
    '"A modern hero with gradient background and CTA"',
    '"Pricing table with 3 tiers and toggle"',
    '"Testimonial carousel with avatars"',
    '"Feature grid with icons and hover effects"',
  ]
  
  useEffect(() => {
    const currentPrompt = prompts[currentPromptIndex]
    let charIndex = 0
    
    // Type out
    const typeInterval = setInterval(() => {
      if (charIndex <= currentPrompt.length) {
        setDisplayedText(currentPrompt.slice(0, charIndex))
        charIndex++
      } else {
        clearInterval(typeInterval)
        // Wait, then clear and move to next
        setTimeout(() => {
          setDisplayedText('')
          setCurrentPromptIndex((prev) => (prev + 1) % prompts.length)
        }, 2000)
      }
    }, 50)
    
    return () => clearInterval(typeInterval)
  }, [currentPromptIndex])
  
  return (
    <div className="text-left">
      <span className="text-zinc-500">{'> '}</span>
      <span className="text-emerald-400">{displayedText}</span>
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="text-emerald-400"
      >
        |
      </motion.span>
    </div>
  )
}

export default function Home() {
  const { isSignedIn } = useUser()
  const router = useRouter()
  const [showLaunch, setShowLaunch] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleTransitionComplete = () => {
    // Go straight to builder - no /demo intermediary
    router.push(isSignedIn ? '/builder' : '/builder?mode=guest')
  }

  const triggerTransition = () => {
    setIsTransitioning(true)
  }
  
  return (
    <main className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      {/* Ambient void background - Global */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Scanline Effect - Global */}
      <div className="fixed inset-0 pointer-events-none z-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPC9zdmc+')] opacity-20 mix-blend-overlay" />

      <AnimatePresence>
        {isTransitioning && <SingularityTransition onComplete={handleTransitionComplete} />}
      </AnimatePresence>
      
      <HomepageWelcome onStart={triggerTransition} />
      {/* LaunchAnimation removed for faster flow */}
      
      {/* CSS for smooth scroll */}
      <style jsx global>{`
        html { scroll-behavior: smooth; }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes grid-flow {
          0% { background-position: 0px 0px; }
          100% { background-position: 0px 60px; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }
        .bg-grid-flow {
          animation: grid-flow 3s linear infinite;
        }
      `}</style>

      {/* HERO SECTION - Clean and confident */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center pt-28 sm:pt-32 pb-12 px-4 sm:px-6 overflow-hidden">
        {/* Layered depth background */}
        <div className="absolute inset-0 bg-zinc-950" />
        
        {/* Perspective grid - fades into distance */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute inset-0 opacity-[0.15] bg-grid-flow"
            style={{
              backgroundImage: `
                linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
              maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 50%, transparent 90%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%, black 50%, transparent 90%)',
              transform: 'perspective(500px) rotateX(60deg) translateY(-50%)',
              transformOrigin: 'center top',
              height: '200%',
              top: '30%',
            }}
          />
        </div>
        
        {/* Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
             style={{ 
               backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
               backgroundSize: '100% 2px, 3px 100%'
             }} 
        />
        
        {/* Radial depth layers */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/[0.08] rounded-full blur-[150px]" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-teal-500/[0.05] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-emerald-600/[0.04] rounded-full blur-[80px]" />
        
        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(9,9,11,0.6)_70%,rgba(9,9,11,0.9)_100%)]" />
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${10 + i * 12}%`,
                top: `${15 + (i % 4) * 20}%`,
                width: i % 2 === 0 ? '3px' : '2px',
                height: i % 2 === 0 ? '3px' : '2px',
                background: i % 3 === 0 ? 'rgba(16,185,129,0.4)' : 'rgba(20,184,166,0.3)',
              }}
              animate={{
                y: [0, -40, 0],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 4 + i * 0.7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.4,
              }}
            />
          ))}
        </div>
        
        <div className="max-w-4xl mx-auto w-full relative z-10 flex flex-col items-center text-center">
            
            {/* Main headline - clean, no gimmicks */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[1.1] mb-6"
            >
              <span className="block text-white">Describe it.</span>
              <motion.span 
                className="block bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent animate-gradient"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              >
                Watch it build.
              </motion.span>
            </motion.h1>

            {/* Subheadline - let it breathe */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg sm:text-xl text-zinc-400 max-w-xl mx-auto leading-relaxed mb-10"
            >
              Type what you want. Get production-ready React + Tailwind in seconds.
            </motion.p>
            
            {/* Mini code preview - shows what you're building */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="relative w-full max-w-lg mb-10 hidden sm:block"
            >
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-md p-4 font-mono text-sm overflow-hidden backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3 text-zinc-500">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-zinc-700" />
                    <div className="w-2 h-2 rounded-full bg-zinc-700" />
                    <div className="w-2 h-2 rounded-full bg-zinc-700" />
                  </div>
                  <span className="text-xs uppercase tracking-wider">architect_protocol.tsx</span>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <TypewriterCode />
                </motion.div>
              </div>
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-md blur-xl opacity-50 -z-10" />
            </motion.div>

            {/* CTA */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mb-16"
            >
              <VoidButton isSignedIn={isSignedIn} router={router} onLaunch={triggerTransition} />
            </motion.div>

            {/* Trust signals - simple row */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-mono text-zinc-500 uppercase tracking-wider"
            >
              <motion.span 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05, color: '#10b981' }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Zap className="w-3 h-3 text-emerald-500/70" />
                ~15s Build Time
              </motion.span>
              <span className="w-0.5 h-3 bg-zinc-800 hidden sm:block" />
              <motion.span 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05, color: '#10b981' }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Code2 className="w-3 h-3 text-emerald-500/70" />
                Full Source Export
              </motion.span>
              <span className="w-0.5 h-3 bg-zinc-800 hidden sm:block" />
              <motion.span 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05, color: '#10b981' }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Shield className="w-3 h-3 text-emerald-500/70" />
                Zero Lock-in
              </motion.span>
            </motion.div>
        </div>
      </section>

      {/* THE STACK */}
      <Section className="px-6 py-20 relative overflow-hidden border-t border-zinc-900">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight">
              Real code. <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Real ownership.</span>
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              No proprietary formats. No vendor lock-in. Just clean, production-ready React + Tailwind that runs anywhere.
            </p>
          </div>

          {/* Key differentiators */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="p-6 bg-zinc-900/50 border border-zinc-800 sm:border-zinc-800 border-emerald-500/20 rounded-md hover:border-emerald-500/30 transition-all group">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Code2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Download Anytime</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Export your full source code with one click. It&apos;s your code from day one.</p>
            </div>
            <div className="p-6 bg-zinc-900/50 border border-zinc-800 sm:border-zinc-800 border-teal-500/20 rounded-md hover:border-teal-500/30 transition-all group">
              <div className="w-12 h-12 bg-teal-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">No Lock-in</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Host it yourself, use any deployment platform. We don&apos;t trap your code.</p>
            </div>
            <div className="p-6 bg-zinc-900/50 border border-zinc-800 sm:border-zinc-800 border-teal-500/20 rounded-md hover:border-teal-500/30 transition-all group">
              <div className="w-12 h-12 bg-teal-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Layout className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Standard Stack</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">React 19 + Tailwind CSS. Industry standard. Any developer can work with it.</p>
            </div>
          </div>

          {/* Tech badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { 
                name: 'React 19', 
                icon: <Code2 className="w-5 h-5" />, 
                desc: 'Latest', 
                bg: 'from-emerald-500/10', 
                text: 'group-hover:text-emerald-400', 
                hover: 'hover:border-emerald-400/50 hover:shadow-emerald-500/20' 
              },
              { 
                name: 'Tailwind', 
                icon: <Layout className="w-5 h-5" />, 
                desc: 'Utility-first', 
                bg: 'from-teal-500/10', 
                text: 'group-hover:text-teal-400', 
                hover: 'hover:border-teal-400/50 hover:shadow-teal-500/20' 
              },
              { 
                name: 'TypeScript', 
                icon: <Terminal className="w-5 h-5" />, 
                desc: 'Type-safe', 
                bg: 'from-emerald-500/10', 
                text: 'group-hover:text-emerald-400', 
                hover: 'hover:border-emerald-400/50 hover:shadow-emerald-500/20' 
              },
              { 
                name: 'Framer Motion', 
                icon: <Layers className="w-5 h-5" />, 
                desc: 'Cinematic', 
                bg: 'from-teal-500/10', 
                text: 'group-hover:text-teal-400', 
                hover: 'hover:border-teal-400/50 hover:shadow-teal-500/20' 
              },
              { 
                name: 'Responsive', 
                icon: <Smartphone className="w-5 h-5" />, 
                desc: 'Mobile-first', 
                bg: 'from-emerald-500/10', 
                text: 'group-hover:text-emerald-400', 
                hover: 'hover:border-emerald-400/50 hover:shadow-emerald-500/20' 
              },
              { 
                name: 'Accessible', 
                icon: <CheckCircle2 className="w-5 h-5" />, 
                desc: 'WCAG', 
                bg: 'from-teal-500/10', 
                text: 'group-hover:text-teal-400', 
                hover: 'hover:border-teal-400/50 hover:shadow-teal-500/20' 
              },
              { 
                name: 'SEO Ready', 
                icon: <Globe className="w-5 h-5" />, 
                desc: 'Optimized', 
                bg: 'from-emerald-500/10', 
                text: 'group-hover:text-emerald-400', 
                hover: 'hover:border-emerald-400/50 hover:shadow-emerald-500/20' 
              },
              { 
                name: 'Yours', 
                icon: <Shield className="w-5 h-5" />, 
                desc: '100%', 
                bg: 'from-teal-500/10', 
                text: 'group-hover:text-teal-400', 
                hover: 'hover:border-teal-400/50 hover:shadow-teal-500/20' 
              },
            ].map((tech, i) => (
              <div 
                key={i} 
                className={`group p-4 bg-gradient-to-br ${tech.bg} to-transparent border border-zinc-800 rounded-md text-center transition-all duration-300 cursor-default hover:scale-[1.02] hover:shadow-lg ${tech.hover}`}
              >
                <div className={`w-10 h-10 mx-auto bg-zinc-900/80 rounded-lg flex items-center justify-center mb-2 text-zinc-400 ${tech.text} transition-colors`}>
                  {tech.icon}
                </div>
                <div className="font-semibold text-sm text-white">{tech.name}</div>
                <div className="text-xs text-zinc-500 mt-0.5 group-hover:text-zinc-400 transition-colors">{tech.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* HOW IT WORKS - Simple 3-step */}
      <Section className="px-4 sm:px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
              How it works
            </h2>
            <p className="text-lg text-zinc-400">From idea to deployed site in minutes</p>
          </div>

          {/* 3-step process */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="w-14 h-14 mx-auto bg-emerald-500/10 border border-emerald-500/20 rounded-md flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-emerald-400">1</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Describe your site</h3>
              <p className="text-zinc-400 text-sm">Tell us what you&apos;re building. A landing page, portfolio, SaaS app — whatever you need.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 mx-auto bg-teal-500/10 border border-teal-500/20 rounded-md flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-teal-400">2</span>
              </div>
              <h3 className="text-lg font-bold mb-2">AI builds each section</h3>
              <p className="text-zinc-400 text-sm">Our multi-model pipeline generates, refines, and audits real React + Tailwind code.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 mx-auto bg-amber-500/10 border border-amber-500/20 rounded-md flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-amber-400">3</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Export or deploy</h3>
              <p className="text-zinc-400 text-sm">Download the source code or deploy instantly. Your code, your choice.</p>
            </div>
          </div>
        </div>
      </Section>

      {/* THE AI PIPELINE */}
      <Section className="px-4 sm:px-6 py-24 bg-zinc-900/20 border-y border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight">Multi-model AI pipeline</h2>
            <p className="text-zinc-400 text-lg">Specialized models for each stage: generate, refine, audit.</p>
          </div>

          <div className="relative grid md:grid-cols-4 gap-8">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-px bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20" />
            
            {/* Step 1: You */}
            <div className="relative z-10 bg-zinc-950 border border-zinc-800 p-6 rounded-md hover:border-white/30 transition-colors group">
              <div className="w-14 h-14 bg-white/5 rounded-md flex items-center justify-center mb-6 border border-white/10 shadow-lg shadow-white/5">
                <Terminal className="w-6 h-6 text-white" />
              </div>
              <div className="text-xs font-mono text-white/60 mb-2 tracking-wider">STEP 1</div>
              <h3 className="text-xl font-bold mb-2">Describe</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Tell us what you need. You&apos;re in control. Speak your intent.</p>
            </div>

            {/* Step 2: Generate */}
            <div className="relative z-10 bg-zinc-950 border border-zinc-800 p-6 rounded-md hover:border-emerald-500/30 transition-colors group">
              <div className="w-14 h-14 bg-emerald-500/5 rounded-md flex items-center justify-center mb-6 border border-emerald-500/10 shadow-lg shadow-emerald-500/5">
                <Cpu className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="text-xs font-mono text-emerald-400 mb-2 tracking-wider">STEP 2</div>
              <h3 className="text-xl font-bold mb-2">Generate</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Our AI builds the initial code fast. React + Tailwind.</p>
            </div>

            {/* Step 3: Refine */}
            <div className="relative z-10 bg-zinc-950 border border-zinc-800 p-6 rounded-md hover:border-teal-500/30 transition-colors group">
              <div className="w-14 h-14 bg-teal-500/5 rounded-md flex items-center justify-center mb-6 border border-teal-500/10 shadow-lg shadow-teal-500/5">
                <Wand2 className="w-6 h-6 text-teal-500" />
              </div>
              <div className="text-xs font-mono text-teal-400 mb-2 tracking-wider">STEP 3</div>
              <h3 className="text-xl font-bold mb-2">Refine</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Polish UI, ensure accessibility, fix edge cases automatically.</p>
            </div>

            {/* Step 4: Audit */}
            <div className="relative z-10 bg-zinc-950 border border-zinc-800 p-6 rounded-md hover:border-amber-500/30 transition-colors group">
              <div className="w-14 h-14 bg-amber-500/5 rounded-md flex items-center justify-center mb-6 border border-amber-500/10 shadow-lg shadow-amber-500/5">
                <Shield className="w-6 h-6 text-amber-500" />
              </div>
              <div className="text-xs font-mono text-amber-400 mb-2 tracking-wider">STEP 4</div>
              <h3 className="text-xl font-bold mb-2">Audit</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Security check and performance audit before you ship.</p>
            </div>
          </div>
        </div>
      </Section>





      {/* PRICING */}
      <Section id="pricing" className="px-4 sm:px-6 py-24 relative overflow-hidden">
        {/* Depth background for pricing */}
        <div className="absolute inset-0">
          {/* Grid with perspective */}
          <div 
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
              maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
            }}
          />
          {/* Central glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/[0.05] rounded-full blur-[100px]" />
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight"
            >
              Choose your reality.
            </motion.h2>
            <p className="text-xl text-zinc-400">Access the Singularity Engine.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-sm sm:max-w-none mx-auto">
            {/* Starter ($19/mo) */}
            <motion.div 
              className="group relative p-8 bg-zinc-950 border border-zinc-800 rounded-md hover:border-emerald-500/30 transition-all duration-500 flex flex-col overflow-hidden"
              whileHover={{ y: -4 }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">Initiate</div>
                <h3 className="text-2xl font-bold text-white mb-2">Architect</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-mono font-bold text-white tracking-tighter">$19</span>
                  <span className="text-zinc-600 font-mono text-sm">/mo</span>
                </div>
                
                <div className="h-px w-full bg-zinc-900 mb-6" />
                
                <ul className="space-y-4 mb-8">
                  {[
                    { text: 'Singularity Engine Access', included: true },
                    { text: 'Unlimited AI Generations', included: true },
                    { text: 'Live Neural Preview', included: true },
                    { text: 'Deploy to hatchitsites.dev', included: true },
                    { text: 'Download Source Code', included: false },
                    { text: 'Custom Domain', included: false },
                  ].map((item, i) => (
                    <li key={i} className={`flex items-center gap-3 text-sm ${item.included ? 'text-zinc-300' : 'text-zinc-700'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${item.included ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
                      <span className={item.included ? '' : 'line-through decoration-zinc-800'}>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Pro ($49) */}
            <motion.div 
              className="group relative p-8 bg-zinc-950 border border-emerald-500/50 rounded-md shadow-[0_0_50px_rgba(16,185,129,0.1)] hover:shadow-[0_0_80px_rgba(16,185,129,0.2)] transition-all duration-500 flex flex-col overflow-hidden lg:-translate-y-4"
              whileHover={{ y: -12 }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent opacity-100" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Recommended</div>
                  <div className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-mono text-emerald-300 uppercase">Unlimited</div>
                </div>
                
                <h3 className="text-3xl font-bold text-white mb-2">Visionary</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-5xl font-mono font-bold text-white tracking-tighter">$49</span>
                  <span className="text-zinc-500 font-mono text-sm">/mo</span>
                </div>
                
                <div className="h-px w-full bg-emerald-500/20 mb-6" />
                
                <ul className="space-y-4 mb-8">
                  {[
                    'Unlimited AI Generations',
                    'Full Source Code Export',
                    'Custom Domain Deployment',
                    'White Label (No Branding)',
                    'Commercial License',
                    'Priority Neural Processing',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-white">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Agency ($199) */}
            <motion.div 
              className="group relative p-8 bg-zinc-950 border border-zinc-800 rounded-md hover:border-amber-500/30 transition-all duration-500 flex flex-col overflow-hidden"
              whileHover={{ y: -4 }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="text-xs font-mono text-amber-500 uppercase tracking-widest mb-4">God Mode</div>
                <h3 className="text-2xl font-bold text-white mb-2">Singularity</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-mono font-bold text-white tracking-tighter">$199</span>
                  <span className="text-zinc-600 font-mono text-sm">/mo</span>
                </div>
                
                <div className="h-px w-full bg-zinc-900 mb-6" />
                
                <ul className="space-y-4 mb-8">
                  {[
                    'Everything in Visionary',
                    'Unlimited Projects',
                    'Direct Line to Founders',
                    'Early Access to New Models',
                    'API Access (Coming Soon)',
                    'Dedicated Infrastructure',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Single Sign Up CTA */}
          <motion.div 
            className="flex flex-col items-center gap-6 mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Link 
              href="/sign-up"
              className="group relative inline-flex items-center gap-3 px-12 py-5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-md font-bold text-lg transition-all shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95"
            >
              <span>Sign Up Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-sm text-zinc-500">Start building now • Upgrade anytime from your dashboard</p>
          </motion.div>
          
          <p className="text-center text-sm text-zinc-600 mt-8">Cancel anytime. The code belongs to you.</p>
        </div>
      </Section>

      {/* MANIFESTO TEASER - THE SIGNAL */}
      <Section className="py-12 border-t border-zinc-900/50 bg-black overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <Link href="/manifesto" className="group block w-full">
            <div className="flex flex-col items-center gap-4 p-8 rounded-md border border-zinc-900 bg-zinc-950/50 hover:border-emerald-500/30 hover:bg-zinc-900/80 transition-all duration-500">
              <div className="flex items-center gap-3 text-emerald-500/50 group-hover:text-emerald-400 transition-colors">
                <Terminal className="w-5 h-5" />
                <span className="font-mono text-sm tracking-widest uppercase">System Message</span>
              </div>
              <p className="font-mono text-zinc-500 text-center max-w-lg group-hover:text-zinc-300 transition-colors">
                &quot;We are not building websites. We are building the interface for the next intelligence.&quot;
              </p>
              <div className="text-xs font-mono text-emerald-500/0 group-hover:text-emerald-500 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100">
                [ DECRYPT MANIFESTO ]
              </div>
            </div>
          </Link>
        </div>
      </Section>

      {/* FINAL CTA - THE PORTAL */}
      <Section className="px-4 sm:px-6 py-32 relative overflow-hidden">
        {/* Void background for CTA */}
        <div className="absolute inset-0 bg-zinc-950" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/[0.05] rounded-full blur-[150px] glow-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-teal-500/[0.07] rounded-full blur-[100px] glow-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(9,9,11,0.6)_70%,rgba(9,9,11,1)_100%)]" />
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-6xl font-black mb-6 tracking-tighter">Enter the void.</h2>
          <p className="text-xl text-zinc-400 mb-10">Your website is waiting to be born.</p>
          <div className="flex justify-center">
            <VoidButton isSignedIn={isSignedIn} router={router} onLaunch={triggerTransition} />
          </div>
        </div>
      </Section>

      {/* FOOTER - Now Global Component */}
    </main>
  )
}