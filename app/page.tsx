'use client'

/* eslint-disable react/no-unescaped-entities */
// Deploy trigger: 2026-01-02

import { useEffect, useState, useRef, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { motion, useInView } from 'framer-motion'
import { Cpu, Terminal, Layers, Shield, Zap, Code2, Globe, ArrowRight, CheckCircle2, Layout, Sparkles, Smartphone } from 'lucide-react'

// Client-side check to prevent hydration mismatch
const emptySubscribe = () => () => {}
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
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

  // Boot sequence - show immediately, no delays
  useEffect(() => {
    const sequence = [
      '> REAL CODE. React + Tailwind. Yours to keep.',
      '> FIRST BUILD IN ~30 SECONDS.',
      '> NO SIGNUP TO TRY.',
      '> DEPLOY TO YOUR OWN DOMAIN.',
      '> READY.',
    ]
    setBootLines(sequence)
    setIsBooting(false)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    setIsLoading(true)
    
    // Small delay to show the loading state before navigation
    setTimeout(() => {
      const params = new URLSearchParams()
      const nextPrompt = prompt || currentSample || ''
      if (nextPrompt) params.set('prompt', nextPrompt)
      params.set('mode', 'demo')
      router.push(`/builder?${params.toString()}`)
    }, 300)
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
      
      <div
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
            <div className="ml-3 text-[10px] text-zinc-500">builder.exe</div>
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

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col relative z-10 scroll-m-16" aria-busy={isBooting}>
            <div className="flex gap-2 flex-1">
              <span className="text-emerald-500 shrink-0 mt-[2px]">&gt;</span>
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
                disabled={isLoading || isBooting}
                className="w-full sm:w-auto bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/50 px-4 py-2 rounded text-xs font-mono transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                    <span>Launching builder...</span>
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
      </div>
    </div>
  )
}

// Pricing button that handles auth + checkout
function PricingButton({ tier, className, children }: { tier: 'lite' | 'pro' | 'agency', className: string, children: React.ReactNode }) {
  const { isSignedIn } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    params.set('upgrade', tier)
    if (!isSignedIn) params.set('mode', 'demo')
    router.push(`/launch?${params.toString()}`)
  }
  
  return (
    <button onClick={handleClick} disabled={isLoading} className={className}>
      {isLoading ? 'Loading...' : children}
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

export default function Home() {
  const { isSignedIn } = useUser()
  const router = useRouter()
  
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* CSS for smooth scroll and effects */}
      <style jsx global>{`
        html { scroll-behavior: smooth; }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .glow-pulse { animation: glow-pulse 3s ease-in-out infinite; }
      `}</style>

      {/* HERO SECTION */}
      <section className="relative min-h-[80vh] flex items-center pt-16 pb-12 px-4 sm:px-6 overflow-hidden">
        {/* Background - grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-transparent to-zinc-950" />
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-[10%] w-72 h-72 bg-emerald-500/8 rounded-full blur-[80px] glow-pulse" />
        <div className="absolute top-40 right-[15%] w-64 h-64 bg-teal-500/6 rounded-full blur-[70px] glow-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-[20%] w-56 h-56 bg-cyan-500/5 rounded-full blur-[60px] glow-pulse" style={{ animationDelay: '2s' }} />
        
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            
            {/* LEFT - Headlines */}
            <div className="space-y-6">
              {/* Status badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-zinc-900/90 border border-emerald-500/40 rounded-full">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-mono text-emerald-400 tracking-wide">AI BUILDER ONLINE</span>
              </div>

              {/* Main headline - BIG and BOLD */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[0.95]">
                <span className="block text-white">Describe it.</span>
                <span className="block mt-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  We build it.
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-zinc-400 max-w-lg leading-relaxed">
                AI website builder that generates <span className="text-white font-semibold">real React + Tailwind code</span>. Export anytime. No lock-in.
              </p>

              {/* Value props */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-sm">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>~30 sec builds</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-sm">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <span>Export code</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-sm">
                  <Shield className="w-4 h-4 text-violet-400" />
                  <span>100% yours</span>
                </div>
              </div>
            </div>

            {/* RIGHT - Terminal */}
            <div className="w-full">
              <SystemStatus />
            </div>
          </div>
        </div>
        
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
      </section>

      {/* THE STACK */}
      <Section className="px-6 py-16 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
              Real code. <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Real ownership.</span>
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              No proprietary formats. No vendor lock-in. Just clean, production-ready React + Tailwind that runs anywhere.
            </p>
          </div>

          {/* Key differentiators */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-xl">
              <div className="text-emerald-400 font-mono text-sm mb-2">Download Anytime</div>
              <p className="text-zinc-400 text-sm">Export your full source code with one click. It&apos;s your code from day one.</p>
            </div>
            <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-xl">
              <div className="text-teal-400 font-mono text-sm mb-2">No Lock-in</div>
              <p className="text-zinc-400 text-sm">Host it yourself, use any deployment platform. We don&apos;t trap your code.</p>
            </div>
            <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-xl">
              <div className="text-cyan-400 font-mono text-sm mb-2">Standard Stack</div>
              <p className="text-zinc-400 text-sm">React 19 + Tailwind CSS. Industry standard. Any developer can work with it.</p>
            </div>
          </div>

          {/* Tech badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'React 19', icon: <Code2 className="w-5 h-5" />, desc: 'Latest', color: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/20' },
              { name: 'Tailwind', icon: <Layout className="w-5 h-5" />, desc: 'Utility-first', color: 'from-sky-500/20 to-sky-500/5 border-sky-500/20' },
              { name: 'TypeScript', icon: <Terminal className="w-5 h-5" />, desc: 'Type-safe', color: 'from-blue-500/20 to-blue-500/5 border-blue-500/20' },
              { name: 'Responsive', icon: <Smartphone className="w-5 h-5" />, desc: 'Mobile-first', color: 'from-violet-500/20 to-violet-500/5 border-violet-500/20' },
              { name: 'Accessible', icon: <CheckCircle2 className="w-5 h-5" />, desc: 'WCAG', color: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20' },
              { name: 'SEO Ready', icon: <Globe className="w-5 h-5" />, desc: 'Optimized', color: 'from-teal-500/20 to-teal-500/5 border-teal-500/20' },
              { name: 'Fast', icon: <Zap className="w-5 h-5" />, desc: '90+ Lighthouse', color: 'from-amber-500/20 to-amber-500/5 border-amber-500/20' },
              { name: 'Yours', icon: <Shield className="w-5 h-5" />, desc: '100%', color: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20' },
            ].map((tech, i) => (
              <div 
                key={i} 
                className={`p-4 bg-gradient-to-br ${tech.color} border rounded-xl text-center transition-all`}
              >
                <div className="w-10 h-10 mx-auto bg-zinc-900/80 rounded-lg flex items-center justify-center mb-2 text-zinc-300">
                  {tech.icon}
                </div>
                <div className="font-semibold text-sm text-white">{tech.name}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{tech.desc}</div>
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
              <div className="w-14 h-14 mx-auto bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-emerald-400">1</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Describe your site</h3>
              <p className="text-zinc-400 text-sm">Tell us what you&apos;re building. A landing page, portfolio, SaaS app — whatever you need.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 mx-auto bg-teal-500/10 border border-teal-500/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-teal-400">2</span>
              </div>
              <h3 className="text-lg font-bold mb-2">AI builds each section</h3>
              <p className="text-zinc-400 text-sm">Our multi-model pipeline generates, refines, and audits real React + Tailwind code.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 mx-auto bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-violet-400">3</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Export or deploy</h3>
              <p className="text-zinc-400 text-sm">Download the source code or deploy instantly. Your code, your choice.</p>
            </div>
          </div>
        </div>
      </Section>

      {/* THE AI PIPELINE */}
      <Section className="px-4 sm:px-6 py-16 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Multi-model AI pipeline</h2>
            <p className="text-zinc-400">Specialized models for each stage: generate, refine, audit.</p>
          </div>

          <div className="relative grid md:grid-cols-4 gap-6">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-px bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20" />
            
            {/* Step 1: You */}
            <div className="relative z-10 bg-zinc-950 border border-zinc-800 p-5 rounded-xl hover:border-white/30 transition-colors group">
              <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-4 border border-white/10">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <div className="text-xs font-mono text-white/60 mb-2">STEP 1</div>
              <h3 className="text-lg font-bold mb-2">You Describe</h3>
              <p className="text-sm text-zinc-400">Tell us what you need. You&apos;re in control.</p>
            </div>

            {/* Step 2: Generate */}
            <div className="relative z-10 bg-zinc-950 border border-zinc-800 p-5 rounded-xl hover:border-emerald-500/30 transition-colors group">
              <div className="w-12 h-12 bg-emerald-500/5 rounded-lg flex items-center justify-center mb-4 border border-emerald-500/10">
                <Cpu className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="text-xs font-mono text-emerald-400 mb-2">STEP 2</div>
              <h3 className="text-lg font-bold mb-2">AI Generates</h3>
              <p className="text-sm text-zinc-400">Frontier models build the initial code fast.</p>
            </div>

            {/* Step 3: Refine */}
            <div className="relative z-10 bg-zinc-950 border border-zinc-800 p-5 rounded-xl hover:border-teal-500/30 transition-colors group">
              <div className="w-12 h-12 bg-teal-500/5 rounded-lg flex items-center justify-center mb-4 border border-teal-500/10">
                <Sparkles className="w-5 h-5 text-teal-500" />
              </div>
              <div className="text-xs font-mono text-teal-400 mb-2">STEP 3</div>
              <h3 className="text-lg font-bold mb-2">AI Refines</h3>
              <p className="text-sm text-zinc-400">Polish UI, ensure accessibility, fix edge cases.</p>
            </div>

            {/* Step 4: Audit */}
            <div className="relative z-10 bg-zinc-950 border border-zinc-800 p-5 rounded-xl hover:border-violet-500/30 transition-colors group">
              <div className="w-12 h-12 bg-violet-500/5 rounded-lg flex items-center justify-center mb-4 border border-violet-500/10">
                <Shield className="w-5 h-5 text-violet-500" />
              </div>
              <div className="text-xs font-mono text-violet-400 mb-2">STEP 4</div>
              <h3 className="text-lg font-bold mb-2">AI Audits</h3>
              <p className="text-sm text-zinc-400">Security check before you ship.</p>
            </div>
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
              <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-600 text-xs font-semibold rounded-bl-xl text-white font-mono">MOST POPULAR</div>
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
                Get Pro
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
      <Section className="px-4 sm:px-6 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="relative p-8 md:p-12 bg-gradient-to-br from-emerald-900/20 via-teal-900/10 to-zinc-900/40 border border-emerald-500/20 rounded-xl overflow-hidden">
            
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to build?</h2>
              <p className="text-lg text-zinc-400 mb-6">Describe your site. Get real code. Ship it.</p>
              <button
                onClick={() => {
                  const destination = isSignedIn ? '/builder' : '/launch'
                  router.push(destination)
                }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
              >
                Start Building Free
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* FOOTER - Now Global Component */}
    </main>
  )
}