'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Zap, AlertTriangle, ArrowRight, MessageSquare, Eye, Wand2 } from 'lucide-react'
import Pip from './Pip'

// =============================================================================
// DEMO WELCOME - First-time orientation for demo/guest users
// Sets expectations: ephemeral, shows the flow, encourages sign up
// =============================================================================

interface DemoWelcomeProps {
  onClose: () => void
}

export default function DemoWelcome({ onClose }: DemoWelcomeProps) {
  const [isVisible, setIsVisible] = useState(false)
  const SEEN_KEY = 'hatch_demo_welcome_seen'

  useEffect(() => {
    const hasSeen = sessionStorage.getItem(SEEN_KEY) // sessionStorage = per session, not persistent
    if (!hasSeen) {
      const timer = setTimeout(() => setIsVisible(true), 300)
      return () => clearTimeout(timer)
    } else {
      onClose()
    }
  }, [onClose])

  const handleDismiss = () => {
    sessionStorage.setItem(SEEN_KEY, 'true')
    setIsVisible(false)
    setTimeout(onClose, 200)
  }

  if (!isVisible) return null

  const steps = [
    { icon: MessageSquare, text: 'Describe what you want to build', color: 'text-emerald-400' },
    { icon: Wand2, text: 'Watch AI generate your code live', color: 'text-violet-400' },
    { icon: Eye, text: 'Preview and refine until perfect', color: 'text-amber-400' },
  ]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={handleDismiss}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Top accent */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
            
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-5">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <Pip size={36} animate={true} float={false} glow={true} />
                <div>
                  <h2 className="text-lg font-semibold text-white">Welcome to HatchIt</h2>
                  <p className="text-xs text-zinc-500">Text-to-React in seconds</p>
                </div>
              </div>

              {/* Pro tip - be specific */}
              <div className="p-3 rounded-lg bg-zinc-800/70 border border-zinc-700/50 mb-4">
                <p className="text-xs text-zinc-400 mb-2">
                  <span className="text-emerald-400 font-medium">Pro tip:</span> Be specific! The more detail you give, the better the result.
                </p>
                <p className="text-xs text-zinc-500 italic">
                  Try: "A hero section for a premium dog walking service in NYC called PawsVIP with a dark theme and gold accents"
                </p>
              </div>

              {/* How it works */}
              <div className="space-y-2 mb-4">
                {steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                    className="flex items-center gap-3 p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
                  >
                    <div className={`p-1.5 rounded-md bg-zinc-800 ${step.color}`}>
                      <step.icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs text-zinc-300">{step.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Demo warning */}
              <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200/80">
                  <span className="font-medium text-amber-300">Demo mode:</span> Work won't be saved. Sign up free to keep projects.
                </p>
              </div>

              {/* CTA */}
              <button
                onClick={handleDismiss}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Let's Build
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
