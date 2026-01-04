'use client'

// =============================================================================
// VOID TRANSITION
// Fast, clean transition for /demo → /builder
// Just a quick fade to black and route - no spinners
// =============================================================================

import { motion } from 'framer-motion'
import { useEffect } from 'react'
import Image from 'next/image'

interface VoidTransitionProps {
  onComplete: () => void
  prompt?: string
}

export default function VoidTransition({ onComplete }: VoidTransitionProps) {
  useEffect(() => {
    // Fast transition - just 600ms total
    const timer = setTimeout(onComplete, 600)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-zinc-950 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Simple centered logo - breathing animation */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Image 
          src="/assets/hatchit_definitive.svg" 
          alt="HatchIt" 
          width={48} 
          height={48}
          className="opacity-60"
        />
      </motion.div>
    </motion.div>
  )
}
