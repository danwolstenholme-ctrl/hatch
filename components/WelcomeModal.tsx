'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageSquare, Heart, Bug, Mail, ArrowRight } from 'lucide-react'

// =============================================================================
// WELCOME MODAL
// A simple thank-you modal for guest users when they land on the builder
// Dismissible, no branding, just gratitude + community links
// =============================================================================

interface WelcomeModalProps {
  trigger?: 'auto' | 'manual' | 'guest' | 'post-demo'
  isOpen?: boolean
  onClose?: () => void
}

export default function WelcomeModal({ trigger = 'auto', isOpen: externalIsOpen, onClose }: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const SEEN_KEY = 'welcome_dismissed'

  useEffect(() => {
    // If controlled externally, use that state
    if (trigger === 'manual' || trigger === 'post-demo') {
      setIsOpen(externalIsOpen ?? false)
      return
    }
    
    // Auto trigger for guests on first visit
    if (trigger === 'guest') {
      const hasSeenWelcome = sessionStorage.getItem(SEEN_KEY)
      if (!hasSeenWelcome) {
        const timer = setTimeout(() => setIsOpen(true), 600)
        return () => clearTimeout(timer)
      }
    }
  }, [trigger, externalIsOpen])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    sessionStorage.setItem(SEEN_KEY, 'true')
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', bounce: 0.3 }}
            className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-zinc-800 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-4">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  WELCOME
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Thanks for trying this out
                </h2>
                <p className="text-zinc-400">
                  We're a tiny team building something new. Your feedback means everything.
                </p>
              </div>

              {/* Community Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <a
                  href="https://reddit.com/r/HatchIt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-emerald-500/30 rounded-xl transition-all"
                >
                  <MessageSquare className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">Community</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">Best</span>
                    </div>
                    <p className="text-sm text-zinc-500">Ask questions, share builds</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
                </a>

                <a
                  href="mailto:support@hatchit.dev"
                  className="group flex items-start gap-3 p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 rounded-xl transition-all"
                >
                  <Mail className="w-5 h-5 text-zinc-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">Email</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-zinc-700 text-zinc-400 rounded">Direct</span>
                    </div>
                    <p className="text-sm text-zinc-500 truncate">support@hatchit.dev</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors flex-shrink-0" />
                </a>

                <a
                  href="https://reddit.com/r/HatchIt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 rounded-xl transition-all"
                >
                  <Heart className="w-5 h-5 text-zinc-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">Feature Requests</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-zinc-700 text-zinc-400 rounded">Open</span>
                    </div>
                    <p className="text-sm text-zinc-500">Vote on what we build next</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors flex-shrink-0" />
                </a>

                <a
                  href="https://reddit.com/r/HatchIt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 rounded-xl transition-all"
                >
                  <Bug className="w-5 h-5 text-zinc-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">Bug Report</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-zinc-700 text-zinc-400 rounded">Fast</span>
                    </div>
                    <p className="text-sm text-zinc-500">Found something? We fix fast.</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors flex-shrink-0" />
                </a>
              </div>

              {/* CTA */}
              <button 
                onClick={handleClose}
                className="w-full py-3 px-6 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Start building
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Hook to trigger welcome modal
export function useWelcomeModal() {
  const [showWelcome, setShowWelcome] = useState(false)
  const SEEN_KEY = 'welcome_dismissed'

  const triggerWelcome = useCallback(() => {
    const hasSeenWelcome = sessionStorage.getItem(SEEN_KEY)
    if (!hasSeenWelcome) {
      setTimeout(() => setShowWelcome(true), 600)
    }
  }, [])

  const closeWelcome = useCallback(() => {
    setShowWelcome(false)
    sessionStorage.setItem(SEEN_KEY, 'true')
  }, [])

  return { showWelcome, triggerWelcome, closeWelcome }
}
