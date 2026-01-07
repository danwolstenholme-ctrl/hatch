'use client'

import { motion } from 'framer-motion'
import Pip from '@/components/Pip'

interface SingularityLoaderProps {
  text?: string
  fullScreen?: boolean
}

export default function SingularityLoader({ text = "INITIALIZING", fullScreen = true }: SingularityLoaderProps) {
  const content = (
    <div className="flex flex-col items-center justify-center relative z-10">
      {/* Pip - the unified loading mascot */}
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

      {/* Status Text - mono, uppercase, tracked */}
      <div className="text-zinc-500 font-mono text-xs tracking-[0.2em] uppercase">
        {text}
      </div>
      
      {/* Progress Line - indeterminate */}
      <div className="w-32 h-px bg-zinc-800 mt-6 overflow-hidden">
        <motion.div 
          className="h-full w-8 bg-emerald-500"
          animate={{ x: ["-100%", "400%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  )

  if (!fullScreen) return content

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      {content}
    </div>
  )
}
