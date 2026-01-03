'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Sparkles, Zap, ArrowRight } from 'lucide-react'

export default function LaunchPage() {
  return (
    <Suspense fallback={<LaunchSkeleton />}> 
      <LaunchPageInner />
    </Suspense>
  )
}

function LaunchPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [phase, setPhase] = useState<'void' | 'neural' | 'spark' | 'ready'>('void')

  const prompt = searchParams.get('prompt') || ''
  const upgrade = searchParams.get('upgrade') || ''
  const mode = searchParams.get('mode') || 'demo'

  useEffect(() => {
    // Phase sequence: void -> neural -> spark -> ready
    const t1 = setTimeout(() => setPhase('neural'), 600)
    const t2 = setTimeout(() => setPhase('spark'), 1200)
    const t3 = setTimeout(() => setPhase('ready'), 1800)
    
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  const handleEnter = () => {
    const params = new URLSearchParams()
    if (prompt) params.set('prompt', prompt)
    if (upgrade) params.set('upgrade', upgrade)
    params.set('mode', mode)
    router.push(`/builder?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden flex items-center justify-center">
      {/* THE VOID - pulsing orbs */}
      <div className="absolute inset-0 bg-zinc-950" />
      
      {/* Central void portal - grows with each phase */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[150px]"
        initial={{ width: 200, height: 200, backgroundColor: 'rgba(16,185,129,0.05)' }}
        animate={{ 
          width: phase === 'void' ? 300 : phase === 'neural' ? 500 : phase === 'spark' ? 700 : 1200,
          height: phase === 'void' ? 300 : phase === 'neural' ? 500 : phase === 'spark' ? 700 : 1200,
          backgroundColor: phase === 'void' ? 'rgba(16,185,129,0.06)' : phase === 'neural' ? 'rgba(139,92,246,0.08)' : phase === 'spark' ? 'rgba(6,182,212,0.1)' : 'rgba(16,185,129,0.15)'
        }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      
      {/* Inner orb */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]"
        initial={{ width: 100, height: 100, backgroundColor: 'rgba(20,184,166,0.08)' }}
        animate={{ 
          width: phase === 'void' ? 150 : phase === 'neural' ? 300 : phase === 'spark' ? 450 : 800,
          height: phase === 'void' ? 150 : phase === 'neural' ? 300 : phase === 'spark' ? 450 : 800,
          backgroundColor: phase === 'void' ? 'rgba(20,184,166,0.08)' : phase === 'neural' ? 'rgba(168,85,247,0.1)' : phase === 'spark' ? 'rgba(34,211,238,0.12)' : 'rgba(52,211,153,0.2)'
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
      
      {/* Radial fade */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(9,9,11,0.5)_50%,rgba(9,9,11,1)_100%)]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-6 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-4"
          >
            {/* Icon */}
            <div className="relative">
              {phase === 'void' && (
                <div className="w-16 h-16 rounded-full border-2 border-emerald-500/50 border-t-transparent animate-spin" />
              )}
              {phase === 'neural' && (
                <div className="w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-violet-400 animate-pulse" />
                </div>
              )}
              {phase === 'spark' && (
                <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
                </div>
              )}
              {phase === 'ready' && (
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  <Zap className="w-10 h-10 text-emerald-400" />
                </div>
              )}
            </div>

            {/* Text */}
            <div className="min-h-[120px] flex flex-col items-center justify-center">
              {phase === 'void' && (
                <span className="text-emerald-500/80 font-mono text-sm tracking-widest">INITIALIZING...</span>
              )}
              {phase === 'neural' && (
                <span className="text-violet-400 font-mono text-sm tracking-widest">CONNECTING NEURAL LACE...</span>
              )}
              {phase === 'spark' && (
                <span className="text-cyan-400 font-mono text-sm tracking-widest">IGNITING SPARK...</span>
              )}
              {phase === 'ready' && (
                <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">System Ready</h2>
                    <p className="text-zinc-400 text-sm max-w-xs mx-auto leading-relaxed">
                      We built this entire platform using the tool you are about to use.
                    </p>
                  </div>
                  
                  <a 
                    href="https://reddit.com/r/hatchit" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-zinc-500 hover:text-[#FF4500] transition-colors group"
                  >
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                    </svg>
                    Join us on r/hatchit
                  </a>

                  <button
                    onClick={handleEnter}
                    className="group relative inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all hover:scale-105 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)]"
                  >
                    <span>ENTER THE BUILDER</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function LaunchSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/[0.05] rounded-full blur-[120px]" />
      <div className="w-16 h-16 rounded-full border-2 border-emerald-500/50 border-t-transparent animate-spin" />
    </div>
  )
}
