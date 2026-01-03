'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Sparkles, Zap } from 'lucide-react'

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
  const [phase, setPhase] = useState<'void' | 'neural' | 'spark' | 'launch'>('void')

  const prompt = searchParams.get('prompt') || ''
  const upgrade = searchParams.get('upgrade') || ''
  const mode = searchParams.get('mode') || 'demo'

  useEffect(() => {
    // Phase sequence: void -> neural -> spark -> launch
    const t1 = setTimeout(() => setPhase('neural'), 600)
    const t2 = setTimeout(() => setPhase('spark'), 1200)
    const t3 = setTimeout(() => setPhase('launch'), 1800)
    
    const redirectTimer = setTimeout(() => {
      const params = new URLSearchParams()
      if (prompt) params.set('prompt', prompt)
      if (upgrade) params.set('upgrade', upgrade)
      params.set('mode', mode)
      router.push(`/builder?${params.toString()}`)
    }, 2200)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(redirectTimer)
    }
  }, [prompt, upgrade, mode, router])

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
              {phase === 'launch' && (
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-emerald-400 animate-pulse" />
                </div>
              )}
            </div>
            
            {/* Text */}
            <p className="text-lg font-mono">
              {phase === 'void' && <span className="text-emerald-400">Entering the void...</span>}
              {phase === 'neural' && <span className="text-violet-400">Neural pathways connecting...</span>}
              {phase === 'spark' && <span className="text-cyan-400">Consciousness awakening...</span>}
              {phase === 'launch' && <span className="text-emerald-400">Launching builder...</span>}
            </p>
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
