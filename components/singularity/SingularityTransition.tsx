'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import Pip from '@/components/Pip'

// Singularity-branded transition - confident, minimal, fast
const TRANSITION_STATES = [
  { text: "WARMING UP", progress: 25 },
  { text: "GATHERING IDEAS", progress: 50 },
  { text: "PREPARING CANVAS", progress: 75 },
  { text: "LET'S BUILD", progress: 100 }
]

export default function SingularityTransition({ onComplete }: { onComplete: () => void }) {
  const [stateIndex, setStateIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStateIndex(prev => {
        if (prev >= TRANSITION_STATES.length - 1) {
          clearInterval(interval)
          setTimeout(onComplete, 400)
          return prev
        }
        return prev + 1
      })
    }, 500) // Faster transitions

    return () => clearInterval(interval)
  }, [onComplete])

  const currentState = TRANSITION_STATES[stateIndex]

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-zinc-950 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
    >
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      
      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Pip - the idea given form */}
        <motion.div 
          className="mb-8"
          animate={{ 
            y: [0, -6, 0],
            rotate: [0, 2, 0, -2, 0]
          }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Pip size={80} animate={true} float={false} glow={true} />
          </motion.div>
        </motion.div>

        {/* Status text - mono, uppercase, tracked */}
        <div className="h-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={stateIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="text-zinc-500 text-xs font-mono tracking-[0.2em] uppercase"
            >
              {currentState.text}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress bar - clean, emerald accent */}
        <div className="mt-8 w-48 h-px bg-zinc-800 overflow-hidden">
          <motion.div
            className="h-full bg-emerald-500"
            initial={{ width: "0%" }}
            animate={{ width: `${currentState.progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  )
}
