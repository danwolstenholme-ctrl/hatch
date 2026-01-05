'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Wand2, RefreshCw } from 'lucide-react'

// =============================================================================
// BOTTOM BAR - Unified bottom bar for builder (all stages)
// 
// Edit THIS file to change the bottom bar styling.
// Used in: SectionBuilder.tsx
// =============================================================================

type BottomBarStage = 'generating' | 'complete' | 'refining'

interface BottomBarProps {
  stage: BottomBarStage
  // Generating stage
  loadingText?: string
  // Complete stage (refine mode)
  refinePrompt?: string
  setRefinePrompt?: (v: string) => void
  isRefining?: boolean
  isLocked?: boolean
  onRefine?: () => void
  onDeploy?: () => void
  reasoning?: string
  refinementChanges?: string[]
}

const REFINE_PROMPTS = [
  "What would you change?",
  "Try: 'Make it darker'",
  "Try: 'Add more spacing'",
  "Try: 'Bigger headline'",
  "Try: 'Add a gradient'",
]

export default function BottomBar({
  stage,
  loadingText = 'Designing structure',
  refinePrompt = '',
  setRefinePrompt,
  isRefining = false,
  isLocked = false,
  onRefine,
  onDeploy,
  reasoning = '',
  refinementChanges = [],
}: BottomBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [promptIndex, setPromptIndex] = useState(0)
  
  // Cycle through placeholder prompts when focused
  useEffect(() => {
    if (!isFocused) return
    const interval = setInterval(() => {
      setPromptIndex(prev => (prev + 1) % REFINE_PROMPTS.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [isFocused])
  
  // Determine AI message
  const getMessage = () => {
    if (stage === 'generating') {
      return { prefix: "Building.", text: `${loadingText}...` }
    }
    if (stage === 'refining') {
      return { prefix: "Refining.", text: "Applying your changes..." }
    }
    if (isLocked) {
      return { prefix: "Limit reached.", text: "Sign up to keep refining." }
    }
    if (refinementChanges.length > 0) {
      return { prefix: "Done.", text: refinementChanges[refinementChanges.length - 1] }
    }
    if (reasoning) {
      const short = reasoning.length > 60 ? reasoning.slice(0, 60) + '...' : reasoning
      return { prefix: "Built.", text: short }
    }
    return { prefix: "Ready.", text: "Describe what to change below." }
  }
  
  const message = getMessage()
  const isDisabled = stage === 'generating' || stage === 'refining'
  
  return (
    <div className="bg-zinc-950/90 backdrop-blur-xl border border-zinc-800/50 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] p-4">
      <div className="space-y-3">
        {/* AI Message */}
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          key={`${stage}-${refinementChanges.length}`}
          className="flex items-center gap-2 px-1"
        >
          <motion.div 
            className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0"
            animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.p
              key={message.text}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 5 }}
              className="text-xs text-zinc-400"
            >
              <span className="text-emerald-400 font-medium">{message.prefix}</span>{' '}
              <span className="text-zinc-500">{message.text}</span>
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* Input Row */}
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden focus-within:border-emerald-500/50 transition-all shadow-[0_0_20px_-10px_rgba(0,0,0,0.5)]">
            <input
              type="text"
              value={refinePrompt}
              onChange={(e) => setRefinePrompt?.(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => e.key === 'Enter' && refinePrompt.trim() && !isLocked && onRefine?.()}
              disabled={isDisabled || isLocked}
              placeholder={isDisabled ? 'Constructing Reality...' : (isFocused ? REFINE_PROMPTS[promptIndex] : "What would you change?")}
              className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={onRefine}
              disabled={!refinePrompt?.trim() || isDisabled || isLocked}
              className="group relative px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDisabled ? (
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              ) : (
                <Wand2 className="w-4 h-4 text-emerald-400" />
              )}
              <span>{isDisabled ? 'Building' : 'Refine'}</span>
            </button>
          </div>
          
          <button
            onClick={onDeploy}
            disabled={isDisabled}
            className="group relative flex-shrink-0 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 backdrop-blur-md text-white text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_30px_-10px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_-10px_rgba(16,185,129,0.5)] overflow-hidden disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            {/* Glow ring on hover */}
            <div className="absolute -inset-[2px] rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500" />
            <span className="relative z-10">Deploy</span>
          </button>
        </div>
      </div>
    </div>
  )
}
