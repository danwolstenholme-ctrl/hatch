'use client'

import { motion } from 'framer-motion'

interface SingularityLoaderProps {
  text?: string
  fullScreen?: boolean
}

export default function SingularityLoader({ text = "Loading", fullScreen = true }: SingularityLoaderProps) {
  const content = (
    <div className="flex flex-col items-center justify-center relative z-10">
      {/* Terminal-style status */}
      <div className="font-mono text-sm text-zinc-400 flex items-center gap-2">
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          className="text-emerald-500"
        >
          ▸
        </motion.span>
        <span className="lowercase">{text}</span>
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="text-zinc-600"
        >
          _
        </motion.span>
      </div>
    </div>
  )

  if (!fullScreen) return content

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
      {content}
    </div>
  )
}
