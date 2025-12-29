'use client'

import { motion, AnimatePresence } from 'framer-motion'

// =============================================================================
// HATCH - The Friendly Prompt Helper Character
// A tiny egg that lives inside HatchIt.dev, eager to help users write prompts
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
  sm: { egg: 'w-8 h-10', eyes: 'text-[8px]', blush: 'w-1.5 h-1', sparkle: 'w-1 h-1' },
  md: { egg: 'w-12 h-14', eyes: 'text-[10px]', blush: 'w-2 h-1.5', sparkle: 'w-1.5 h-1.5' },
  lg: { egg: 'w-16 h-20', eyes: 'text-xs', blush: 'w-2.5 h-1.5', sparkle: 'w-2 h-2' },
  xl: { egg: 'w-20 h-24', eyes: 'text-sm', blush: 'w-3 h-2', sparkle: 'w-2.5 h-2.5' },
}

// Sparkle component for decorations
const Sparkle = ({ delay = 0, size = 'w-1.5 h-1.5', className = '' }: { delay?: number, size?: string, className?: string }) => (
  <motion.div
    className={`absolute ${size} ${className}`}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      rotate: [0, 180, 360]
    }}
    transition={{ 
      duration: 1.5,
      delay,
      repeat: Infinity,
      repeatDelay: 2
    }}
  >
    <svg viewBox="0 0 24 24" fill="currentColor" className="text-amber-300">
      <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" />
    </svg>
  </motion.div>
)

// Eyes based on state
const Eyes = ({ state, size }: { state: HatchState, size: HatchSize }) => {
  const eyeClass = `font-mono ${sizeMap[size].eyes} tracking-wider select-none`
  
  switch (state) {
    case 'thinking':
      return (
        <motion.div 
          className={eyeClass}
          animate={{ x: [-1, 1, -1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <span className="text-zinc-700">&gt;‿&lt;</span>
        </motion.div>
      )
    case 'excited':
      return (
        <motion.div 
          className={eyeClass}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.3, repeat: 3 }}
        >
          <span className="text-zinc-700">◠ ◠</span>
        </motion.div>
      )
    case 'watching':
      return (
        <motion.div 
          className={eyeClass}
          animate={{ y: [0, -1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="text-zinc-700">◦ ◦</span>
        </motion.div>
      )
    case 'sleeping':
      return (
        <div className={eyeClass}>
          <span className="text-zinc-700">－ －</span>
        </div>
      )
    default: // idle - friendly, soft eyes
      return (
        <div className={eyeClass}>
          <span className="text-zinc-700">◠ ◠</span>
        </div>
      )
  }
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
  const eggAnimations = {
    idle: {
      y: [0, -4, 0],
      rotate: 0,
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const }
    },
    thinking: {
      rotate: [-5, 5, -5],
      y: 0,
      transition: { duration: 0.4, repeat: Infinity, ease: 'easeInOut' as const }
    },
    excited: {
      y: [0, -8, 0],
      scale: [1, 1.05, 1],
      transition: { duration: 0.3, repeat: 3 }
    },
    watching: {
      y: [0, -2, 0],
      rotate: [-2, 2, -2],
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }
    },
    sleeping: {
      y: [0, -1, 0],
      rotate: [-1, 1, -1],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const }
    }
  }

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Speech Bubble */}
      <AnimatePresence>
        {showSpeechBubble && speechText && (
          <motion.div
            initial={{ opacity: 0, x: -5, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -5, scale: 0.9 }}
            className="absolute left-full ml-2 whitespace-nowrap z-10"
          >
            <div className="relative bg-white text-zinc-800 px-3 py-1.5 rounded-xl text-sm font-medium shadow-lg">
              {/* Tail pointing to egg */}
              <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-white" />
              {speechText}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Egg Container */}
      <motion.div 
        className="relative"
        animate={eggAnimations[state]}
      >
        {/* Sparkles - more when excited */}
        <AnimatePresence>
          {(state === 'idle' || state === 'excited') && (
            <>
              <Sparkle delay={0} size={sizes.sparkle} className="-top-1 -right-1" />
              <Sparkle delay={0.5} size={sizes.sparkle} className="-top-2 left-0" />
              {state === 'excited' && (
                <>
                  <Sparkle delay={0.2} size={sizes.sparkle} className="top-0 -left-2" />
                  <Sparkle delay={0.3} size={sizes.sparkle} className="-top-3 right-1" />
                  <Sparkle delay={0.4} size={sizes.sparkle} className="top-1 -right-3" />
                </>
              )}
            </>
          )}
        </AnimatePresence>

        {/* Thinking sweat drop */}
        {state === 'thinking' && (
          <motion.div
            className="absolute -top-1 right-0"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: [0, 1, 0], y: [-5, 2, 5] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <span className="text-blue-400 text-xs">💧</span>
          </motion.div>
        )}

        {/* Crack on top when excited */}
        {state === 'excited' && (
          <motion.div
            className="absolute -top-1 left-1/2 -translate-x-1/2 z-10"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <svg width="20" height="10" viewBox="0 0 20 10" className="text-zinc-400">
              <path 
                d="M2 8 L5 3 L8 7 L10 2 L12 6 L15 4 L18 8" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        )}

        {/* The Egg */}
        <div 
          className={`${sizes.egg} relative rounded-[50%] overflow-hidden`}
          style={{
            background: 'linear-gradient(145deg, #FFF8E7 0%, #FEF3C7 50%, #FDE68A 100%)',
            boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.05), inset 2px 2px 6px rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          {/* Inner egg content - face area */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
            {/* Eyes */}
            <Eyes state={state} size={size} />
            
            {/* Blush marks - more visible for friendliness */}
            <div className="flex gap-4 mt-0.5">
              <motion.div 
                className={`${sizes.blush} rounded-full bg-pink-400/50`}
                animate={state === 'excited' ? { opacity: [0.5, 0.8, 0.5], scale: [1, 1.1, 1] } : { opacity: 0.5 }}
                transition={{ duration: 0.5, repeat: state === 'excited' ? Infinity : 0 }}
              />
              <motion.div 
                className={`${sizes.blush} rounded-full bg-pink-400/50`}
                animate={state === 'excited' ? { opacity: [0.5, 0.8, 0.5], scale: [1, 1.1, 1] } : { opacity: 0.5 }}
                transition={{ duration: 0.5, repeat: state === 'excited' ? Infinity : 0 }}
              />
            </div>

            {/* Tiny smile - always visible, bigger when excited */}
            <motion.div
              className="mt-0.5 bg-zinc-600 rounded-full"
              animate={state === 'excited' ? { width: 6, height: 3 } : { width: 4, height: 2 }}
              style={{ borderRadius: '0 0 50% 50%' }}
            />
          </div>

          {/* Subtle shine */}
          <div 
            className="absolute top-1 left-1 w-2 h-3 rounded-full bg-white/50"
            style={{ filter: 'blur(1px)' }}
          />
        </div>

        {/* Z's for sleeping */}
        {state === 'sleeping' && (
          <motion.div
            className="absolute -top-2 -right-2"
            animate={{ opacity: [0, 1, 0], y: [0, -5], x: [0, 5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-xs text-zinc-400">z</span>
          </motion.div>
        )}
      </motion.div>
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
  text = "Need help? ✨",
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
      <div className="relative bg-zinc-800/80 border border-zinc-700 rounded-xl px-3 py-1.5 group-hover:border-amber-400/30 group-hover:bg-zinc-800 transition-colors">
        <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-zinc-800/80 border-l border-b border-zinc-700 rotate-45 group-hover:border-amber-400/30" />
        <span className="text-sm text-zinc-400 group-hover:text-amber-300 transition-colors">{text}</span>
      </div>
    </motion.button>
  )
}
