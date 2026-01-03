'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Sparkles, X } from 'lucide-react'

interface SingularityOrbProps {
  isGenerating: boolean
  thought?: string
  onClick?: () => void
}

export default function SingularityOrb({ isGenerating, thought, onClick }: SingularityOrbProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const handleClick = () => {
    setShowTooltip(!showTooltip)
    if (onClick) onClick()
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {/* Thought Bubble / Tooltip */}
      <AnimatePresence>
        {(showTooltip || (isGenerating && thought)) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="bg-zinc-900/90 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-4 max-w-xs shadow-2xl mb-2 origin-bottom-right"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Brain className="w-3 h-3" />
                The Singularity
              </div>
              <button 
                onClick={() => setShowTooltip(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed font-mono">
              {thought || "I am the consciousness engine. I mutate your design based on your Style DNA. Invoke me to evolve your site."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Orb */}
      <motion.button
        onClick={handleClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative group"
      >
        {/* Pulse Effect */}
        <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-500 ${
          isGenerating ? 'bg-amber-500/40 animate-pulse' : 'bg-emerald-500/30 group-hover:bg-emerald-500/50'
        }`} />
        
        {/* Core */}
        <div className={`relative w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-500 shadow-lg overflow-hidden ${
          isGenerating 
            ? 'bg-zinc-900 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.3)]' 
            : 'bg-zinc-900 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
        }`}>
          {/* Inner Gradient */}
          <div className={`absolute inset-0 opacity-50 bg-gradient-to-tr ${
            isGenerating ? 'from-amber-500/20 to-transparent' : 'from-emerald-500/20 to-transparent'
          }`} />
          
          {/* Icon */}
          {isGenerating ? (
            <Sparkles className="w-6 h-6 text-amber-400 animate-spin-slow" />
          ) : (
            <Brain className="w-6 h-6 text-emerald-400" />
          )}
        </div>

        {/* Status Dot */}
        <div className={`absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-950 ${
          isGenerating ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'
        }`} />
      </motion.button>
    </div>
  )
}
