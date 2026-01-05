'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, Clock } from 'lucide-react'
import { buildProgress, BuildStage } from '@/lib/build-progress'

/**
 * BUILD PROGRESS DISPLAY
 * Shows honest progress stages during code generation.
 * No fake "AI consciousness" - just real build status.
 */

const STAGE_LABELS: Record<BuildStage, string> = {
  idle: 'Ready',
  analyzing: 'Analyzing prompt',
  structuring: 'Designing structure',
  generating: 'Writing code',
  styling: 'Adding polish',
  optimizing: 'Final touches',
  complete: 'Complete',
};

export default function BuildProgressDisplay() {
  const [message, setMessage] = useState<string>('Preparing build...')
  const [stage, setStage] = useState<BuildStage>('analyzing')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const startTimeRef = useRef(Date.now())

  // Build timer
  useEffect(() => {
    startTimeRef.current = Date.now()
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Progress listener
  useEffect(() => {
    const handleProgress = (update: { stage: BuildStage; message: string }) => {
      setStage(update.stage)
      setMessage(update.message)
    }

    buildProgress.on('progress', handleProgress)
    buildProgress.startBuild()

    return () => {
      buildProgress.off('progress', handleProgress)
      buildProgress.reset()
    }
  }, [])

  // Progress percentage based on stage
  const getProgress = () => {
    const stages: BuildStage[] = ['analyzing', 'structuring', 'generating', 'styling', 'optimizing', 'complete']
    const index = stages.indexOf(stage)
    return Math.min(((index + 1) / stages.length) * 100, 95) // Cap at 95% until truly complete
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-6 space-y-4 w-full max-w-md mx-auto">
      {/* Progress Ring */}
      <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
        {/* Background ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="rgba(16,185,129,0.1)"
            strokeWidth="3"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="rgba(16,185,129,0.6)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45} ${2 * Math.PI * 45}`}
            animate={{ 
              strokeDashoffset: 2 * Math.PI * 45 * (1 - getProgress() / 100) 
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </svg>
        
        {/* Center icon */}
        <div className="relative z-10 bg-zinc-950 rounded-full p-2.5 md:p-3 border border-emerald-500/30">
          <Cpu className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
        </div>
      </div>

      {/* Status Message */}
      <div className="w-full text-center space-y-1">
        <div className="h-10 md:h-12 relative w-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={message}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <span className="text-[10px] font-mono text-emerald-500/60 mb-0.5 tracking-widest uppercase">
                {STAGE_LABELS[stage]}
              </span>
              <span className="text-xs md:text-sm font-medium text-emerald-400">
                {message}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Timer & Model Info */}
      <div className="flex gap-4 text-[9px] md:text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Claude Sonnet 4.5
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-2.5 h-2.5 md:w-3 md:h-3 text-zinc-400" />
          <span className="text-zinc-400">{elapsedSeconds}s</span>
        </div>
      </div>
    </div>
  )
}
