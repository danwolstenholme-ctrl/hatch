'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Terminal, Sparkles, MessageSquare, Users, Rocket, Heart, Share2, Download, Globe } from 'lucide-react'

interface WelcomeModalProps {
  trigger?: 'auto' | 'manual' | 'post-demo'
  isOpen?: boolean
  onClose?: () => void
}

export default function WelcomeModal({ trigger = 'auto', isOpen: externalIsOpen, onClose }: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const SEEN_KEY = 'hatch_intro_v2_seen'

  useEffect(() => {
    // If controlled externally, use that state
    if (trigger === 'manual' || trigger === 'post-demo') {
      setIsOpen(externalIsOpen ?? false)
      return
    }
    
    // Auto trigger for first-time users (disabled - now triggered post-demo)
    // const hasSeenWelcome = localStorage.getItem(SEEN_KEY)
    // if (!hasSeenWelcome) {
    //   const timer = setTimeout(() => setIsOpen(true), 1500)
    //   return () => clearTimeout(timer)
    // }
  }, [trigger, externalIsOpen])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    localStorage.setItem(SEEN_KEY, 'true')
    onClose?.()
  }, [onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-zinc-900 border border-emerald-500/30 rounded-2xl shadow-[0_0_80px_rgba(16,185,129,0.2)] overflow-hidden"
          >
            {/* Header gradient bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />
            
            {/* Close button */}
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-zinc-800 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Welcome Header */}
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Terminal className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Welcome to Hatch v2</h2>
                <p className="text-sm text-zinc-400">New mobile intro, smoother builds, same instant code.</p>
              </div>

              {/* Update callout */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-200 font-medium text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>What's new</span>
                </div>
                <ul className="text-xs text-emerald-100/80 space-y-1 list-disc list-inside">
                  <li>Mobile-first intro before you build.</li>
                  <li>Cleaner previews + fewer loading glitches.</li>
                  <li>Architect Polish available in guest mode (3x3x3).</li>
                </ul>
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <a 
                  href="https://www.reddit.com/r/HatchIt/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors border border-zinc-700"
                >
                  <Users className="w-4 h-4" />
                  <span>Reddit update</span>
                </a>
                <a 
                  href="https://www.reddit.com/r/HatchIt/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-medium transition-colors border border-zinc-800"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Report a bug</span>
                </a>
              </div>

              <p className="text-[11px] text-emerald-200/80 text-center">
                Mod on duty: <a href="https://www.reddit.com/user/Imaginary-Coffee8035" target="_blank" rel="noopener noreferrer" className="text-emerald-200 underline underline-offset-4">u/Imaginary-Coffee8035</a>
              </p>

              {/* CTA */}
              <button 
                onClick={handleClose}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all text-sm shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 flex items-center justify-center gap-2"
              >
                <Rocket className="w-4 h-4" />
                <span>Continue</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Hook to trigger welcome modal after first build
export function useFirstTimeWelcome() {
  const [showWelcome, setShowWelcome] = useState(false)
  const SEEN_KEY = 'hatch_intro_v2_seen'

  const triggerWelcome = useCallback(() => {
    const hasSeenWelcome = localStorage.getItem(SEEN_KEY)
    if (!hasSeenWelcome) {
      // Small delay for impact after build completes
      setTimeout(() => setShowWelcome(true), 800)
    }
  }, [])

  const closeWelcome = useCallback(() => {
    setShowWelcome(false)
    localStorage.setItem(SEEN_KEY, 'true')
  }, [])

  return { showWelcome, triggerWelcome, closeWelcome }
}
