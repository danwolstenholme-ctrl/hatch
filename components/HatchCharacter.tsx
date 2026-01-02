'use client'

import { motion, AnimatePresence } from 'framer-motion'

// =============================================================================
// THE ARCHITECT'S AVATAR
// The visual representation of the Architect.
// Abstract, geometric, pulsing. No faces. No eggs.
// =============================================================================

export type HatchState = 'idle' | 'thinking' | 'excited' | 'watching' | 'sleeping'
export type HatchSize = 'sm' | 'md' | 'lg' | 'xl'

interface HatchCharacterProps {
  state?: HatchState
  size?: HatchSize
  showSpeechBubble?: boolean
  speechText?: string
  className?: string
}

const sizeMap = {
  sm: { node: 'w-6 h-6', core: 'w-2 h-2' },
  md: { node: 'w-10 h-10', core: 'w-3 h-3' },
  lg: { node: 'w-16 h-16', core: 'w-5 h-5' },
  xl: { node: 'w-24 h-24', core: 'w-8 h-8' },
}

export default function HatchCharacter({ 
  state = 'idle', 
  size = 'md',
  showSpeechBubble = false,
  speechText = '',
  className = ''
}: HatchCharacterProps) {
  const sizes = sizeMap[size]
  
  // Animation variants based on state
  const coreAnimations = {
    idle: {
      scale: [1, 1.2, 1],
      opacity: [0.8, 1, 0.8],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const }
    },
    thinking: {
      scale: [1, 0.8, 1],
      rotate: [0, 180, 360],
      transition: { duration: 1, repeat: Infinity, ease: 'linear' as const }
    },
    excited: {
      scale: [1, 1.5, 1],
      boxShadow: ['0 0 10px #10b981', '0 0 20px #10b981', '0 0 10px #10b981'],
      transition: { duration: 0.5, repeat: Infinity }
    },
    watching: {
      scale: 1,
      x: [-2, 2, -2],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const }
    },
    sleeping: {
      opacity: [0.3, 0.5, 0.3],
      scale: [0.9, 1, 0.9],
      transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const }
    }
  }

  const ringAnimations = {
    idle: {
      rotate: 360,
      transition: { duration: 20, repeat: Infinity, ease: 'linear' as const }
    },
    thinking: {
      rotate: -360,
      scale: [1, 1.1, 1],
      transition: { duration: 2, repeat: Infinity, ease: 'linear' as const }
    },
    excited: {
      rotate: 360,
      scale: [1, 1.2, 1],
      transition: { duration: 1, repeat: Infinity, ease: 'linear' as const }
    },
    watching: {
      rotate: 180,
      transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' as const }
    },
    sleeping: {
      rotate: 360,
      opacity: 0.2,
      transition: { duration: 30, repeat: Infinity, ease: 'linear' as const }
    }
  }

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Speech Bubble */}
      <AnimatePresence>
        {showSpeechBubble && speechText && (
          <motion.div
            initial={{ opacity: 0, x: -5, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -5, scale: 0.9 }}
            className="absolute left-full ml-4 whitespace-nowrap z-10"
          >
            <div className="relative bg-zinc-900 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-mono shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              {/* Tail pointing to node */}
              <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-emerald-500/30" />
              <span className="mr-2">System:</span>
              {speechText}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Node Container */}
      <div className={`${sizes.node} relative flex items-center justify-center`}>
        
        {/* Outer Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border border-emerald-500/30 border-t-emerald-400 border-r-transparent"
          animate={ringAnimations[state]}
        />
        
        {/* Inner Ring */}
        <motion.div
          className="absolute inset-1 rounded-full border border-emerald-500/20 border-b-emerald-400 border-l-transparent"
          animate={ringAnimations[state]}
          style={{ rotate: 180 }}
        />

        {/* The Core */}
        <motion.div
          className={`${sizes.core} rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]`}
          animate={coreAnimations[state]}
        />

        {/* Data Particles (Thinking) */}
        {state === 'thinking' && (
          <>
            <motion.div className="absolute w-1 h-1 bg-emerald-400 rounded-full" animate={{ x: [0, 10, 0], y: [0, -10, 0], opacity: [0, 1, 0] }} transition={{ duration: 1, repeat: Infinity }} />
            <motion.div className="absolute w-1 h-1 bg-emerald-400 rounded-full" animate={{ x: [0, -10, 0], y: [0, 10, 0], opacity: [0, 1, 0] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }} />
          </>
        )}

        {/* Z's for sleeping (Low Power Mode) */}
        {state === 'sleeping' && (
          <motion.div
            className="absolute -top-2 -right-2 font-mono text-[10px] text-emerald-500/50"
            animate={{ opacity: [0, 1, 0], y: [0, -5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            STANDBY
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Mini version for inline use
export function HatchMini({ state = 'idle' }: { state?: HatchState }) {
  return <HatchCharacter state={state} size="sm" />
}

// With speech bubble wrapper for buttons
export function HatchWithBubble({ 
  state = 'idle',
  text = "System Ready",
  onClick
}: { 
  state?: HatchState
  text?: string
  onClick?: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center gap-2 group"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <HatchCharacter state={state} size="sm" />
      <div className="relative bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-1.5 group-hover:border-emerald-500/30 group-hover:bg-zinc-900 transition-colors">
        <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-zinc-900/80 border-l border-b border-zinc-800 rotate-45 group-hover:border-emerald-500/30" />
        <span className="text-xs font-mono text-zinc-500 group-hover:text-emerald-400 transition-colors">{text}</span>
      </div>
    </motion.button>
  )
}
