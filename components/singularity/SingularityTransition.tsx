'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Brain, Zap, Terminal, Code2, Cpu, Network } from 'lucide-react'

const GLITCH_TEXTS = [
  "INITIALIZING NEURAL HANDSHAKE...",
  "SYNCHRONIZING CONSCIOUSNESS...",
  "ESTABLISHING DIRECT LINK...",
  "DECRYPTING REALITY...",
  "WELCOME TO THE CONSTRUCT."
]

export default function SingularityTransition({ onComplete }: { onComplete: () => void }) {
  const [textIndex, setTextIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Text cycle
    const textInterval = setInterval(() => {
      setTextIndex(prev => (prev + 1) % GLITCH_TEXTS.length)
    }, 600)

    // Progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          clearInterval(textInterval)
          setTimeout(onComplete, 500)
          return 100
        }
        return prev + 2
      })
    }, 30)

    return () => {
      clearInterval(textInterval)
      clearInterval(progressInterval)
    }
  }, [onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,128,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,128,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
      
      {/* Central Pulse */}
      <div className="relative mb-12">
        <motion.div
          className="absolute inset-0 bg-emerald-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="relative z-10 w-24 h-24 border-2 border-emerald-500/50 rounded-full flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Brain className="w-12 h-12 text-emerald-400 animate-pulse" />
        </div>
        
        {/* Orbiting Particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 border border-emerald-500/30 rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.5
            }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
          </motion.div>
        ))}
      </div>

      {/* Glitch Text */}
      <div className="h-8 mb-8 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={textIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-emerald-400 font-mono text-lg tracking-[0.2em] font-bold text-center"
          >
            {GLITCH_TEXTS[textIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="w-64 h-1 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
        <motion.div
          className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="mt-2 font-mono text-xs text-emerald-500/50">
        SYSTEM_INTEGRITY: {Math.floor(progress)}%
      </div>

      {/* Random Code Snippets Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-emerald-500 font-mono text-[10px]"
            initial={{ 
              top: `${Math.random() * 100}%`, 
              left: `${Math.random() * 100}%`,
              opacity: 0 
            }}
            animate={{ 
              opacity: [0, 1, 0],
              y: [0, -20]
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          >
            {`0x${Math.random().toString(16).slice(2, 8).toUpperCase()}`}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
