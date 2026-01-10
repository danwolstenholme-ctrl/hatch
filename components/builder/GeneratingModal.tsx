'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Code2, Layers, Palette } from 'lucide-react'

// =============================================================================
// GENERATING MODAL - Clean, professional build progress
// No emojis, no spam - just elegant feedback
// =============================================================================

interface GeneratingModalProps {
  isOpen: boolean
  stage: string
  stageIndex: number
}

const BUILD_STAGES = [
  { 
    label: 'Analyzing', 
    icon: Sparkles,
    detail: 'Understanding your requirements'
  },
  { 
    label: 'Designing', 
    icon: Layers,
    detail: 'Planning component structure'
  },
  { 
    label: 'Writing', 
    icon: Code2,
    detail: 'Generating React + Tailwind'
  },
  { 
    label: 'Polishing', 
    icon: Palette,
    detail: 'Adding responsive design'
  },
]

export default function GeneratingModal({ isOpen, stageIndex }: GeneratingModalProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  
  useEffect(() => {
    if (!isOpen) return

    const timeInterval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timeInterval)
  }, [isOpen])
  
  const currentStage = BUILD_STAGES[Math.min(stageIndex, BUILD_STAGES.length - 1)]
  // Slower progress: ~0.8% per second means 60 seconds to reach ~50% from time alone
  const progressPercent = Math.min(90, ((stageIndex) / BUILD_STAGES.length) * 100 + (elapsedSeconds * 0.8))

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-40 flex items-center justify-center"
        >
          {/* Backdrop with emerald glow */}
          <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-md" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08),transparent_60%)]" />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-sm px-6"
          >
            {/* Main card */}
            <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-6 shadow-2xl shadow-black/50">
              {/* Subtle top glow */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent rounded-t-2xl" />
              
              {/* Animated icon */}
              <div className="flex justify-center mb-6">
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="relative"
                >
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <currentStage.icon className="w-7 h-7 text-emerald-400" />
                  </div>
                  {/* Pulse ring */}
                  <motion.div
                    animate={{ scale: [1, 1.4], opacity: [0.3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 rounded-2xl border border-emerald-500/50"
                  />
                </motion.div>
              </div>
              
              {/* Stage label */}
              <div className="text-center mb-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={stageIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-lg font-semibold text-white mb-1">
                      {currentStage.label}
                    </h2>
                    <p className="text-sm text-zinc-500">
                      {currentStage.detail}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
              
              {/* Progress bar */}
              <div className="mb-4">
                <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                  />
                </div>
              </div>
              
              {/* Time hint */}
              <p className="text-center text-[11px] text-zinc-600 mb-3">
                {elapsedSeconds > 20 ? 'Complex designs take 30-60s' : ''}
              </p>
              
              {/* Stage dots */}
              <div className="flex items-center justify-center gap-3">
                {BUILD_STAGES.map((stage, i) => (
                  <motion.div
                    key={i}
                    initial={false}
                    animate={{
                      scale: i === stageIndex ? 1.2 : 1,
                      backgroundColor: i < stageIndex 
                        ? 'rgb(16, 185, 129)' 
                        : i === stageIndex 
                          ? 'rgb(52, 211, 153)' 
                          : 'rgb(63, 63, 70)'
                    }}
                    className={`w-2 h-2 rounded-full ${
                      i === stageIndex ? 'shadow-[0_0_8px_rgba(16,185,129,0.6)]' : ''
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {/* Timer - subtle */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-xs text-zinc-600 mt-4"
            >
              {elapsedSeconds < 60 
                ? `${elapsedSeconds}s` 
                : `${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s`
              }
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
