'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Zap, Code2, Palette, Rocket, Shield, Clock, Check } from 'lucide-react'
import Image from 'next/image'

// =============================================================================
// GENERATING MODAL - Keeps users engaged during the 60-90s generation wait
// Pops up when generation starts, shows progress + selling points
// =============================================================================

interface GeneratingModalProps {
  isOpen: boolean
  stage: string // Current loading stage text
  stageIndex: number // 0-3 for progress
}

const SELLING_POINTS = [
  {
    icon: Code2,
    title: "Your Code, Forever",
    desc: "Export clean React + Tailwind. No lock-in. Deploy anywhere.",
  },
  {
    icon: Zap,
    title: "2.5x Faster Than Templates",
    desc: "Skip the customization nightmare. Get exactly what you described.",
  },
  {
    icon: Palette,
    title: "Production-Ready Output",
    desc: "Responsive, accessible, and optimized. Ready to ship.",
  },
  {
    icon: Shield,
    title: "Built by Claude Sonnet",
    desc: "Anthropic's most capable coding model. Not a template mashup.",
  },
  {
    icon: Rocket,
    title: "One-Click Deploy",
    desc: "Go live in 30 seconds with our Pro plan. Your own domain.",
  },
  {
    icon: Clock,
    title: "Iterate Instantly",
    desc: 'After this, say "make it darker" and watch it update live.',
  },
]

const PROGRESS_STAGES = [
  { label: 'Analyzing prompt', icon: Sparkles },
  { label: 'Designing structure', icon: Palette },
  { label: 'Writing code', icon: Code2 },
  { label: 'Adding polish', icon: Check },
]

export default function GeneratingModal({ isOpen, stage, stageIndex }: GeneratingModalProps) {
  const [factIndex, setFactIndex] = useState(0)
  
  // Rotate through selling points
  useEffect(() => {
    if (!isOpen) return
    const interval = setInterval(() => {
      setFactIndex(prev => (prev + 1) % SELLING_POINTS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [isOpen])
  
  // Reset fact index when modal opens
  useEffect(() => {
    if (isOpen) setFactIndex(0)
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
            className="relative w-full max-w-lg"
          >
            {/* Outer glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 via-teal-500/20 to-emerald-500/30 rounded-3xl blur-2xl opacity-60" />
            
            {/* Glass card */}
            <div className="relative bg-zinc-900/70 backdrop-blur-2xl backdrop-saturate-150 border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
              {/* Top highlight - mimics light source */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <div className="relative p-6 sm:p-8">
                {/* Header */}
                <div className="text-center mb-6">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-16 h-16 mx-auto mb-4"
                  >
                    <Image 
                      src="/assets/hatchit_definitive.svg" 
                      alt="HatchIt" 
                      width={64} 
                      height={64}
                      className="w-full h-full"
                    />
                  </motion.div>
                  <h2 className="text-xl font-bold text-white mb-1">Building Your Section</h2>
                  <p className="text-sm text-zinc-500">This typically takes 60-90 seconds</p>
                </div>

                {/* Progress stages */}
                <div className="mb-6 space-y-2">
                  {PROGRESS_STAGES.map((s, i) => {
                    const isComplete = i < stageIndex
                    const isCurrent = i === stageIndex
                    const Icon = s.icon
                    
                    return (
                      <motion.div
                        key={s.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                          isCurrent 
                            ? 'bg-emerald-500/10 border border-emerald-500/30' 
                            : isComplete 
                            ? 'bg-zinc-900/50 border border-zinc-800' 
                            : 'bg-zinc-900/30 border border-zinc-800/50 opacity-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCurrent 
                            ? 'bg-emerald-500/20' 
                            : isComplete 
                            ? 'bg-emerald-500/10' 
                            : 'bg-zinc-800'
                        }`}>
                          {isComplete ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : isCurrent ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <Icon className="w-4 h-4 text-emerald-400" />
                            </motion.div>
                          ) : (
                            <Icon className="w-4 h-4 text-zinc-600" />
                          )}
                        </div>
                        <span className={`text-sm font-medium ${
                          isCurrent ? 'text-emerald-400' : isComplete ? 'text-zinc-400' : 'text-zinc-600'
                        }`}>
                          {s.label}
                        </span>
                        {isCurrent && (
                          <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="ml-auto text-xs text-emerald-500 font-mono"
                          >
                            Processing...
                          </motion.div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent mb-6" />

                {/* Rotating selling point */}
                <div className="min-h-[80px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={factIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-start gap-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        {(() => {
                          const Icon = SELLING_POINTS[factIndex].icon
                          return <Icon className="w-5 h-5 text-emerald-400" />
                        })()}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-1">
                          {SELLING_POINTS[factIndex].title}
                        </h3>
                        <p className="text-sm text-zinc-400">
                          {SELLING_POINTS[factIndex].desc}
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Progress dots */}
                <div className="flex justify-center gap-1.5 mt-4">
                  {SELLING_POINTS.map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        i === factIndex ? 'bg-emerald-500 w-4' : 'bg-zinc-700'
                      }`}
                    />
                  ))}
                </div>

                {/* Stay on page note */}
                <div className="mt-6 text-center">
                  <p className="text-xs text-zinc-600">
                    ⚡ Keep this tab open for the magic to happen
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
