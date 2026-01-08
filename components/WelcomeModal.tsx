'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'

// =============================================================================
// WELCOME MODAL (SIGNUP GATE)
// Triggered after Hero section is built.
// Forces signup to save progress.
// =============================================================================

interface WelcomeModalProps {
  trigger?: 'auto' | 'manual' | 'guest' | 'post-demo'
  isOpen?: boolean
  onClose?: () => void
}

export default function WelcomeModal({ isOpen: externalIsOpen, onClose }: WelcomeModalProps) {
  const isOpen = externalIsOpen ?? false
  const router = useRouter()

  const handleClose = useCallback(() => {
    // If triggered manually (gate), we allow closing but it might re-trigger on next action
    onClose?.()
  }, [onClose])

  const handleSignup = () => {
    // Redirect to signup, preserving current state via localStorage (handled by BuildFlowController)
    router.push('/sign-up')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6">
          {/* Backdrop - Non-dismissible for strict gate feel */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', bounce: 0.3 }}
            className="relative w-full max-w-[300px] sm:max-w-sm bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Close button - Optional: Remove to force signup? User said "They NEED to create an account" */}
            <button 
              onClick={handleClose}
              aria-label="Close modal"
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-zinc-800 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-5 text-center">
              <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-700">
                <Lock className="w-6 h-6 text-zinc-400" />
              </div>
              
              <h2 className="text-lg font-bold text-white mb-2">
                Save Your Work
              </h2>
              
              <p className="text-sm text-zinc-400 mb-5 leading-relaxed">
                Create a free account to save your progress and continue building.
              </p>

              <div className="space-y-3">
                <button 
                  onClick={handleSignup}
                  className="w-full py-3 px-4 bg-emerald-500/15 border border-emerald-500/40 hover:bg-emerald-500/20 hover:border-emerald-500/50 text-white font-semibold text-sm rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center justify-center gap-2"
                >
                  Create Free Account
                  <ArrowRight className="w-4 h-4" />
                </button>
                
                <p className="text-[11px] text-zinc-500">
                  Have an account? <button onClick={() => router.push('/sign-in')} className="text-zinc-400 hover:text-white underline">Sign in</button>
                </p>
              </div>
            </div>
            
            <div className="p-3 bg-zinc-950/50 border-t border-zinc-800 text-center">
              <p className="text-[10px] text-zinc-500">
                <span className="text-red-400">Warning:</span> Progress will be lost without signing up.
              </p>
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
