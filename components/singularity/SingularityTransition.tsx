'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import Image from 'next/image'

const LOADING_MESSAGES = [
  "Preparing your workspace...",
  "Loading design engine...",
  "Setting up the studio...",
  "Ready to build."
]

export default function SingularityTransition({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => {
        if (prev >= LOADING_MESSAGES.length - 1) {
          clearInterval(interval)
          setTimeout(onComplete, 800)
          return prev
        }
        return prev + 1
      })
    }, 800)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }}
    >
      {/* Subtle Background Gradient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse-slow" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Breathing Logo */}
        <motion.div
          className="relative mb-12"
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* Soft Glow behind logo */}
            <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
            <Image 
              src="/assets/hatchit_definitive.svg" 
              alt="HatchIt" 
              width={48} 
              height={48} 
              className="w-12 h-12 relative z-10"
            />
          </div>
        </motion.div>

        {/* Human-Readable Text */}
        <div className="h-12 flex flex-col items-center justify-center text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-zinc-400 text-sm font-medium tracking-wide"
            >
              {LOADING_MESSAGES[index]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Minimal Progress Line */}
        <div className="mt-8 w-48 h-0.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-emerald-500/80"
            initial={{ width: "0%" }}
            animate={{ width: `${((index + 1) / LOADING_MESSAGES.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>
    </motion.div>
  )
}
