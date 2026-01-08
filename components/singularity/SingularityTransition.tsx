'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

// Singularity-branded transition - confident, minimal, fast
const TRANSITION_STATES = [
  { text: "INIT", progress: 25 },
  { text: "LOAD", progress: 50 },
  { text: "BUILD", progress: 75 },
  { text: "SHIP", progress: 100 }
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
      {/* Clean backdrop - subtle glow (matches homepage) */}
      <div className="absolute inset-0 bg-zinc-950" />
      <div 
        className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[1000px] h-[700px]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.10), transparent 65%)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Favicon-style "It" logo */}
        <motion.div 
          className="mb-8"
          animate={{ 
            scale: [1, 1.02, 1],
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <div className="relative w-20 h-20 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-2 inset-x-6 h-px bg-emerald-500/40" />
            {/* Ambient glow behind text */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15),transparent_60%)]" />
            {/* The "It" text with gradient */}
            <span className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-400 bg-clip-text text-transparent font-sans tracking-tight relative z-10" style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.4))' }}>It</span>
          </div>
        </motion.div>

        {/* Status text - matches homepage style */}
        <div className="h-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={stateIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="text-zinc-400 text-sm font-medium tracking-wider uppercase"
            >
              {currentState.text}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress bar - clean, emerald accent */}
        <div className="mt-8 w-48 h-px bg-zinc-800 overflow-hidden rounded-full">
          <motion.div
            className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
            initial={{ width: "0%" }}
            animate={{ width: `${currentState.progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  )
}
