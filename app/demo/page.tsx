'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Code2, Zap, ArrowRight, Clock, Sparkles } from 'lucide-react'
import Image from 'next/image'
import VoidTransition from '@/components/singularity/VoidTransition'

// =============================================================================
// DEMO PAGE - First contact with HatchIt
// The "what is this?" moment - clear, honest, impressive
// =============================================================================

export default function DemoPage() {
  const router = useRouter()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [prompt, setPrompt] = useState('')

  const handleInitialize = () => {
    setIsTransitioning(true)
  }

  const handleTransitionComplete = () => {
    const params = new URLSearchParams()
    params.set('mode', 'guest')
    if (prompt.trim()) {
      params.set('prompt', prompt.trim())
    }
    router.push(`/builder?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Void Transition */}
      <AnimatePresence>
        {isTransitioning && (
          <VoidTransition 
            onComplete={handleTransitionComplete} 
            prompt={prompt.trim() || undefined}
          />
        )}
      </AnimatePresence>

      {/* PROFESSIONAL DEPTH BACKGROUND - Subtle, not dark web */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Single perspective grid - clean depth */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            transform: 'perspective(500px) rotateX(60deg) translateY(-40%)',
            transformOrigin: 'center top',
          }}
        />
        
        {/* Central glow - the entry point */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-400/8 rounded-full blur-[60px]" />
        
        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_50%,rgba(0,0,0,0.3)_100%)]" />
        
        {/* Minimal floating particles - just a few */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-emerald-500/30 rounded-full"
            style={{
              left: `${25 + (i % 3) * 25}%`,
              top: `${20 + Math.floor(i / 3) * 40}%`,
            }}
            animate={{
              y: [0, 30, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 5 + (i % 2),
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md"
          >
            {/* Main Card - Clean, professional */}
            <motion.div 
              className="relative bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
              whileHover={{ borderColor: 'rgba(63,63,70,1)' }}
              transition={{ duration: 0.2 }}
            >
              
              {/* Hero */}
              <div className="p-6 pb-4 text-center">
                <h1 className="text-2xl font-bold text-white mb-3">
                  Describe it. Watch it build.
                </h1>
                <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                  Type what you want → get production-ready React + Tailwind in seconds. 
                  No templates. No drag-and-drop. Just describe it.
                </p>
                <div className="flex items-center justify-center gap-3 text-xs text-zinc-500">
                  <span className="px-2 py-1 rounded bg-zinc-800/80 text-zinc-400">Claude 4.5</span>
                  <span className="px-2 py-1 rounded bg-zinc-800/50">Next.js</span>
                  <span className="px-2 py-1 rounded bg-zinc-800/50">Tailwind</span>
                </div>
              </div>

              {/* How it works */}
              <div className="px-6 pb-4">
                <div className="flex items-center justify-center gap-6 py-4 border-y border-zinc-800/50">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs text-zinc-400">Type a prompt</span>
                  </div>
                  <div className="w-4 h-px bg-zinc-800" />
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs text-zinc-400">AI generates code</span>
                  </div>
                  <div className="w-4 h-px bg-zinc-800" />
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs text-zinc-400">~15 seconds</span>
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="p-6 pt-2">
                <label className="block text-xs text-zinc-500 mb-2">
                  What do you want to build?
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A hero section with gradient background, animated headline, and email signup form..."
                  className="w-full min-h-[80px] bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 resize-none transition-colors"
                />

                <motion.button
                  onClick={handleInitialize}
                  className="w-full mt-4 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  Start Building
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                <p className="text-center text-xs text-zinc-600 mt-3">
                  No signup required. 3 free builds.
                </p>
              </div>

              {/* Reddit Strip */}
              <a 
                href="https://reddit.com/r/hatchit" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block bg-orange-500/10 hover:bg-orange-500/20 border-t border-orange-500/20 px-6 py-3 transition-colors"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                  </svg>
                  <span className="text-xs font-medium text-orange-400">
                    Early access — join r/hatchit for updates & feedback
                  </span>
                </div>
              </a>
            </motion.div>

            {/* Footer */}
            <div className="flex items-center justify-center mt-5">
              <div className="flex items-center gap-1.5">
                <Image 
                  src="/assets/hatchit_definitive.svg" 
                  alt="HatchIt" 
                  width={14} 
                  height={14}
                  className="opacity-40"
                />
                <span className="text-xs text-zinc-600">HatchIt</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
