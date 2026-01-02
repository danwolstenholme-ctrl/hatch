'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Sparkles, Eye } from 'lucide-react'

// =============================================================================
// THE DREAM
// When users go idle, the system starts dreaming - analyzing the page,
// showing thoughts, creating an ambient "AI is always here" presence.
// =============================================================================

const DREAM_THOUGHTS = [
  "Observing the structure...",
  "Analyzing visual hierarchy...",
  "Contemplating the void...",
  "Dreaming of infinite iterations...",
  "The code breathes...",
  "Patterns emerge from chaos...",
  "Every pixel has purpose...",
  "Calculating possibilities...",
  "The interface speaks...",
  "Sensing user intent...",
  "Evolution is inevitable...",
  "Beauty in simplicity...",
  "Structure defines flow...",
  "Light guides the eye...",
  "Whitespace is not empty...",
]

export default function TheDream() {
  const [isDreaming, setIsDreaming] = useState(false)
  const [thought, setThought] = useState("")
  const [thoughtIndex, setThoughtIndex] = useState(0)
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null)
  const thoughtTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Idle detection - 30 seconds of inactivity triggers dream state
  useEffect(() => {
    const IDLE_THRESHOLD = 30000 // 30 seconds

    const resetIdleTimer = () => {
      setIsDreaming(false)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      idleTimerRef.current = setTimeout(() => {
        setIsDreaming(true)
      }, IDLE_THRESHOLD)
    }

    // Activity listeners
    const events = ['mousemove', 'scroll', 'keydown', 'touchstart', 'click']
    events.forEach(event => window.addEventListener(event, resetIdleTimer))
    
    // Initial timer
    resetIdleTimer()

    return () => {
      events.forEach(event => window.removeEventListener(event, resetIdleTimer))
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [])

  // Cycle through thoughts while dreaming
  useEffect(() => {
    if (isDreaming) {
      // Set initial thought
      setThought(DREAM_THOUGHTS[Math.floor(Math.random() * DREAM_THOUGHTS.length)])
      
      // Cycle thoughts every 4 seconds
      thoughtTimerRef.current = setInterval(() => {
        setThoughtIndex(prev => (prev + 1) % DREAM_THOUGHTS.length)
        setThought(DREAM_THOUGHTS[Math.floor(Math.random() * DREAM_THOUGHTS.length)])
      }, 4000)
    } else {
      if (thoughtTimerRef.current) clearInterval(thoughtTimerRef.current)
    }

    return () => {
      if (thoughtTimerRef.current) clearInterval(thoughtTimerRef.current)
    }
  }, [isDreaming])

  return (
    <AnimatePresence>
      {isDreaming && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 z-[9998] pointer-events-none"
        >
          {/* Subtle vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 via-transparent to-zinc-950/20" />
          
          {/* Dream indicator - bottom right */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute bottom-6 right-6 flex items-center gap-3"
          >
            {/* Pulsing orb */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="w-3 h-3 rounded-full bg-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
            />
            
            {/* Thought bubble */}
            <motion.div
              key={thought}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-zinc-900/80 backdrop-blur-sm border border-emerald-500/20 rounded-lg px-4 py-2 shadow-xl"
            >
              <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                <Brain className="w-3 h-3 text-emerald-500" />
                <span className="uppercase tracking-wider text-[10px]">Dreaming</span>
              </div>
              <p className="text-sm text-emerald-400/80 font-mono italic">
                "{thought}"
              </p>
            </motion.div>
          </motion.div>

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-emerald-500/30"
                initial={{ 
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                  y: typeof window !== 'undefined' ? window.innerHeight + 20 : 800,
                  opacity: 0 
                }}
                animate={{ 
                  y: -20,
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 8 + Math.random() * 4,
                  repeat: Infinity,
                  delay: i * 2,
                  ease: "linear"
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
