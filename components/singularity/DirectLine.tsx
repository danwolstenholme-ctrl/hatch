'use client'

import { useState } from 'react'
import { Mic } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface DirectLineProps {
  context: {
    stage: string
    prompt: string
    selectedElement: any
  }
  onAction: (action: string, value: string) => void
}

export default function DirectLine({ }: DirectLineProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="relative">
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-14 right-0 w-48 bg-zinc-900/95 border border-zinc-700 backdrop-blur-md p-3 rounded-xl shadow-2xl z-50"
          >
            <div className="flex items-center gap-2 mb-1">
              <Mic className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-emerald-400">Voice Control</span>
            </div>
            <p className="text-xs text-zinc-400">
              Coming soon! Voice commands for faster building.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setShowTooltip(prev => !prev)}
        onBlur={() => setTimeout(() => setShowTooltip(false), 150)}
        className="relative p-3 rounded-full transition-all shadow-lg group bg-zinc-800/50 text-zinc-500 border border-zinc-700/50 cursor-not-allowed opacity-60"
        title="Coming Soon"
      >
        <Mic className="w-5 h-5" />
      </button>
    </div>
  )
}
