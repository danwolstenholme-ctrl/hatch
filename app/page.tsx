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

// The Start Button - hands off to launch page for the immersive experience
function StartButton({ isSignedIn, router, onLaunch }: { isSignedIn: boolean | undefined, router: AppRouterInstance, onLaunch: () => void }) {
  
  const handleClick = () => {
    onLaunch()
  }
  
  return (
    <button
      onClick={handleClick}
      className="group relative w-full sm:w-auto inline-flex justify-center items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-white hover:bg-zinc-200 text-black rounded-md font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
    >
      <div className="relative z-10 flex items-center gap-3">
        <span className="tracking-tight">Start Building</span>
        <ArrowRight className="w-5 h-5 text-black/70 group-hover:translate-x-1 transition-transform" />
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

// Static Code Preview - Professional Studio Look
function CodePreview() {
  return (
    <div className="text-left font-mono text-[13px] leading-relaxed text-zinc-300">
      <div className="flex gap-2">
        <span className="text-purple-400">export</span>
        <span className="text-purple-400">default</span>
        <span className="text-blue-400">function</span>
        <span className="text-yellow-200">Hero</span>
        <span className="text-zinc-400">()</span>
        <span className="text-zinc-400">{'{'}</span>
      </div>
      <div className="pl-4 flex gap-2">
        <span className="text-purple-400">return</span>
        <span className="text-zinc-400">(</span>
      </div>
      <div className="pl-8 flex gap-2">
        <span className="text-zinc-500">&lt;</span>
        <span className="text-blue-300">section</span>
        <span className="text-sky-300">className</span>
        <span className="text-zinc-400">=</span>
        <span className="text-orange-300">"relative min-h-screen flex..."</span>
        <span className="text-zinc-500">&gt;</span>
      </div>
      <div className="pl-12 flex gap-2">
        <span className="text-zinc-500">&lt;</span>
        <span className="text-blue-300">h1</span>
        <span className="text-sky-300">className</span>
        <span className="text-zinc-400">=</span>
        <span className="text-orange-300">"text-6xl font-bold..."</span>
        <span className="text-zinc-500">&gt;</span>
      </div>
      <div className="pl-16 text-white">
        Build beautiful software.
      </div>
      <div className="pl-12 flex gap-2">
        <span className="text-zinc-500">&lt;/</span>
        <span className="text-blue-300">h1</span>
        <span className="text-zinc-500">&gt;</span>
      </div>
      <div className="pl-8 flex gap-2">
        <span className="text-zinc-500">&lt;/</span>
        <span className="text-blue-300">section</span>
        <span className="text-zinc-500">&gt;</span>
      </div>
      <div className="pl-4 text-zinc-400">)</div>
      <div className="text-zinc-400">{'}'}</div>
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
    // Instant transition for professional feel
    handleTransitionComplete()
  }
  
  return (
    <main className="min-h-screen bg-zinc-950 text-white relative overflow-hidden selection:bg-white/20">
      {/* Ambient void background - Global */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Deep, subtle orbs - no neon green */}
        <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-zinc-800/[0.05] rounded-full blur-[150px]" />
      </div>

      {/* No Scanlines - Clean Studio Look */}

      {/* 
      <AnimatePresence>
        {isTransitioning && <SingularityTransition onComplete={handleTransitionComplete} />}
      </AnimatePresence>
      
      <HomepageWelcome onStart={triggerTransition} />
      */}
      
      {/* CSS for smooth scroll */}
      <style jsx global>{`
        html { scroll-behavior: smooth; }
        @keyframes grid-flow {
          0% { background-position: 0px 0px; }
          100% { background-position: 0px 60px; }
        }
        .bg-grid-flow {
          animation: grid-flow 20s linear infinite;
        }
      `}</style>

      {/* HERO SECTION - Clean and confident */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center pt-28 sm:pt-32 pb-12 px-4 sm:px-6 overflow-hidden">
        {/* Layered depth background */}
        <div className="absolute inset-0 bg-zinc-950" />
        
        {/* Perspective grid - fades into distance - subtle white/zinc */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute inset-0 opacity-[0.07] bg-grid-flow"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
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
        
        {/* Radial depth layers - Deep and Dark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-zinc-500/[0.03] rounded-full blur-[150px]" />
        
        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(9,9,11,0.8)_70%,rgba(9,9,11,1)_100%)]" />
        
        <div className="max-w-4xl mx-auto w-full relative z-10 flex flex-col items-center text-center">
            
            {/* Main headline - clean, no gimmicks */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight leading-[1.1] mb-8 text-white"
            >
              Describe it.
              <span className="block text-zinc-500">Watch it build.</span>
            </motion.h1>

            {/* Subheadline - let it breathe */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg sm:text-xl text-zinc-400 max-w-xl mx-auto leading-relaxed mb-12"
            >
              Type what you want. Get production-ready React + Tailwind in seconds.
            </motion.p>
            
            {/* Mini code preview - shows what you're building */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative w-full max-w-lg mb-12 hidden sm:block"
            >
              <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5 font-mono text-sm overflow-hidden shadow-2xl ring-1 ring-white/5">
                <div className="flex items-center justify-between mb-4 text-zinc-500 border-b border-zinc-800/50 pb-3">
                  <span className="text-xs font-medium text-zinc-400">PageBuilder.tsx</span>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-zinc-800" />
                    <div className="w-2 h-2 rounded-full bg-zinc-800" />
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <CodePreview />
                </motion.div>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-16"
            >
              <StartButton isSignedIn={isSignedIn} router={router} onLaunch={triggerTransition} />
            </motion.div>

            {/* Trust signals - simple row */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-medium text-zinc-500 uppercase tracking-wider"
            >
              <span className="flex items-center gap-2 hover:text-zinc-300 transition-colors">
                <Zap className="w-4 h-4" />
                ~15s Build Time
              </span>
              <span className="w-px h-3 bg-zinc-800 hidden sm:block" />
              <span className="flex items-center gap-2 hover:text-zinc-300 transition-colors">
                <Code2 className="w-4 h-4" />
                Full Source Export
              </span>
              <span className="w-px h-3 bg-zinc-800 hidden sm:block" />
              <span className="flex items-center gap-2 hover:text-zinc-300 transition-colors">
                <Shield className="w-4 h-4" />
                Zero Lock-in
              </span>
            </motion.div>
        </div>
      </section>

      {/* THE STACK */}
      <Section className="px-6 py-20 relative overflow-hidden border-t border-zinc-900">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight text-white">
              Real code. Real ownership.
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              No proprietary formats. No vendor lock-in. Just clean, production-ready React + Tailwind that runs anywhere.
            </p>
          </div>

          {/* Key differentiators */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="p-6 bg-zinc-900/20 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all group">
              <div className="w-12 h-12 bg-zinc-800/50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-white group-hover:text-black transition-all">
                <Code2 className="w-6 h-6 text-zinc-400 group-hover:text-black transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Download Anytime</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Export your full source code with one click. It&apos;s your code from day one.</p>
            </div>
            <div className="p-6 bg-zinc-900/20 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all group">
              <div className="w-12 h-12 bg-zinc-800/50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-white group-hover:text-black transition-all">
                <Shield className="w-6 h-6 text-zinc-400 group-hover:text-black transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">No Lock-in</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Host it yourself, use any deployment platform. We don&apos;t trap your code.</p>
            </div>
            <div className="p-6 bg-zinc-900/20 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all group">
              <div className="w-12 h-12 bg-zinc-800/50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-white group-hover:text-black transition-all">
                <Layout className="w-6 h-6 text-zinc-400 group-hover:text-black transition-colors" />
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
              },
              { 
                name: 'Tailwind', 
                icon: <Layout className="w-5 h-5" />, 
                desc: 'Utility-first', 
              },
              { 
                name: 'TypeScript', 
                icon: <Terminal className="w-5 h-5" />, 
                desc: 'Type-safe', 
              },
              { 
                name: 'Framer Motion', 
                icon: <Layers className="w-5 h-5" />, 
                desc: 'Cinematic', 
              },
              { 
                name: 'Responsive', 
                icon: <Smartphone className="w-5 h-5" />, 
                desc: 'Mobile-first', 
              },
              { 
                name: 'Accessible', 
                icon: <CheckCircle2 className="w-5 h-5" />, 
                desc: 'WCAG', 
              },
              { 
                name: 'SEO Ready', 
                icon: <Globe className="w-5 h-5" />, 
                desc: 'Optimized', 
              },
              { 
                name: 'Yours', 
                icon: <Shield className="w-5 h-5" />, 
                desc: '100%', 
              },
            ].map((tech, i) => (
              <div 
                key={i} 
                className="group p-4 bg-zinc-900/20 border border-zinc-800 rounded-xl text-center transition-all duration-300 cursor-default hover:bg-zinc-900 hover:border-zinc-700"
              >
                <div className="w-10 h-10 mx-auto bg-zinc-800/50 rounded-lg flex items-center justify-center mb-2 text-zinc-400 group-hover:text-white group-hover:bg-zinc-800 transition-all">
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
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-white">
              How it works
            </h2>
            <p className="text-lg text-zinc-400">From idea to deployed site in minutes</p>
          </div>

          {/* 3-step process */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="w-14 h-14 mx-auto bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Describe your site</h3>
              <p className="text-zinc-400 text-sm">Tell us what you&apos;re building. A landing page, portfolio, SaaS app — whatever you need.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 mx-auto bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">AI builds each section</h3>
              <p className="text-zinc-400 text-sm">Our multi-model pipeline generates, refines, and audits real React + Tailwind code.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 mx-auto bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Export or deploy</h3>
              <p className="text-zinc-400 text-sm">Download the source code or deploy instantly. Your code, your choice.</p>
            </div>
          </div>
        </div>
      </Section>

      {/* THE AI PIPELINE */}
      <Section className="px-4 sm:px-6 py-24 bg-zinc-900/20 border-y border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight text-white">Multi-model AI pipeline</h2>
            <p className="text-zinc-400 text-lg">Specialized models for each stage: generate, refine, audit.</p>
          </div>

          <div className="relative grid md:grid-cols-4 gap-8">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-px bg-zinc-800" />
            
            {/* Step 1: You */}
            <div className="relative z-10 bg-zinc-950 border border-zinc-800 p-6 rounded-xl hover:border-zinc-600 transition-colors group">
              <div className="w-14 h-14 bg-zinc-900 rounded-lg flex items-center justify-center mb-6 border border-zinc-800 shadow-lg">
                <Terminal className="w-6 h-6 text-white" />
              </div>
              <div className="text-xs font-mono text-zinc-500 mb-2 tracking-wider">STEP 1</div>
              <h3 className="text-xl font-bold mb-2 text-white">Describe</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Tell us what you need. You&apos;re in control. Speak your intent.</p>
            </div>

            {/* Step 2: Generate */}
            <div className="relative z-10 bg-zinc-950 border border-zinc-800 p-6 rounded-xl hover:border-zinc-600 transition-colors group">
              <div className="w-14 h-14 bg-zinc-900 rounded-lg flex items-center justify-center mb-6 border border-zinc-800 shadow-lg">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <div className="text-xs font-mono text-zinc-500 mb-2 tracking-wider">STEP 2</div>
              <h3 className="text-xl font-bold mb-2 text-white">Generate</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Our AI builds the initial code fast. React + Tailwind.</p>
            </div>

            {/* Step 3: Refine */}
            <div className="relative z-10 bg-zinc-950 border border-zinc-800 p-6 rounded-xl hover:border-zinc-600 transition-colors group">
              <div className="w-14 h-14 bg-zinc-900 rounded-lg flex items-center justify-center mb-6 border border-zinc-800 shadow-lg">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
              <div className="text-xs font-mono text-zinc-500 mb-2 tracking-wider">STEP 3</div>
              <h3 className="text-xl font-bold mb-2 text-white">Refine</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Polish UI, ensure accessibility, fix edge cases automatically.</p>
            </div>

            {/* Step 4: Audit */}
            <div className="relative z-10 bg-zinc-950 border border-zinc-800 p-6 rounded-xl hover:border-zinc-600 transition-colors group">
              <div className="w-14 h-14 bg-zinc-900 rounded-lg flex items-center justify-center mb-6 border border-zinc-800 shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="text-xs font-mono text-zinc-500 mb-2 tracking-wider">STEP 4</div>
              <h3 className="text-xl font-bold mb-2 text-white">Audit</h3>
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
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
              maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
            }}
          />
          {/* Central glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[100px]" />
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight text-white"
            >
              Choose your reality.
            </motion.h2>
            <p className="text-xl text-zinc-400">Access the Singularity Engine.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-sm sm:max-w-none mx-auto">
            {/* Starter ($19/mo) */}
            <motion.div 
              className="group relative p-8 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-zinc-600 transition-all duration-500 flex flex-col overflow-hidden"
              whileHover={{ y: -4 }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
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
                      <div className={`w-1.5 h-1.5 rounded-full ${item.included ? 'bg-white' : 'bg-zinc-800'}`} />
                      <span className={item.included ? '' : 'line-through decoration-zinc-800'}>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Pro ($49) */}
            <motion.div 
              className="group relative p-8 bg-zinc-950 border border-zinc-700 rounded-xl shadow-[0_0_50px_rgba(255,255,255,0.05)] hover:shadow-[0_0_80px_rgba(255,255,255,0.1)] transition-all duration-500 flex flex-col overflow-hidden lg:-translate-y-4"
              whileHover={{ y: -12 }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-transparent opacity-100" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-mono text-white uppercase tracking-widest">Recommended</div>
                  <div className="px-2 py-0.5 rounded bg-white/10 border border-white/20 text-[10px] font-mono text-white uppercase">Unlimited</div>
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
                      <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Agency ($199) */}
            <motion.div 
              className="group relative p-8 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-zinc-600 transition-all duration-500 flex flex-col overflow-hidden"
              whileHover={{ y: -4 }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">God Mode</div>
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
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
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
              className="group relative inline-flex items-center gap-3 px-12 py-5 bg-white hover:bg-zinc-200 text-black rounded-full font-bold text-lg transition-all shadow-lg hover:scale-105 active:scale-95"
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
            <div className="flex flex-col items-center gap-4 p-8 rounded-xl border border-zinc-900 bg-zinc-950/50 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all duration-500">
              <div className="flex items-center gap-3 text-zinc-500 group-hover:text-white transition-colors">
                <Terminal className="w-5 h-5" />
                <span className="font-mono text-sm tracking-widest uppercase">System Message</span>
              </div>
              <p className="font-mono text-zinc-500 text-center max-w-lg group-hover:text-zinc-300 transition-colors">
                &quot;We are not building websites. We are building the interface for the next intelligence.&quot;
              </p>
              <div className="text-xs font-mono text-zinc-500/0 group-hover:text-white transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100">
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[150px]" />
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-6xl font-black mb-6 tracking-tighter text-white">Enter the void.</h2>
          <p className="text-xl text-zinc-400 mb-10">Your website is waiting to be born.</p>
          <div className="flex justify-center">
            <StartButton isSignedIn={isSignedIn} router={router} onLaunch={triggerTransition} />
          </div>
        </div>
      </Section>

      {/* FOOTER - Now Global Component */}
    </main>
  )
}