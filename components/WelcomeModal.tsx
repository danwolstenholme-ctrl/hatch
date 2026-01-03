'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageSquare, Heart, Bug, Mail, ArrowRight, Zap, Crown, CheckCircle2, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

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

export default function WelcomeModal({ trigger = 'auto', isOpen: externalIsOpen, onClose }: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const SEEN_KEY = 'welcome_dismissed'
  const router = useRouter()
  const { isSignedIn } = useUser()

  useEffect(() => {
    // If controlled externally, use that state
    if (trigger === 'manual' || trigger === 'post-demo') {
      setIsOpen(externalIsOpen ?? false)
      return
    }
    
    // Auto trigger removed - we now trigger manually from BuildFlowController
  }, [trigger, externalIsOpen])

  const handleClose = useCallback(() => {
    // If triggered manually (gate), we allow closing but it might re-trigger on next action
    setIsOpen(false)
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
            className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Close button - Optional: Remove to force signup? User said "They NEED to create an account" */}
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-zinc-800 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                <Lock className="w-8 h-8 text-emerald-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-3">
                Save Your Masterpiece
              </h2>
              
              <p className="text-zinc-400 mb-8 leading-relaxed">
                You've built a great foundation. To save your progress and continue building the rest of the site, you need to create a free account.
              </p>

              <div className="space-y-4">
                <button 
                  onClick={handleSignup}
                  className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2"
                >
                  Create Free Account
                  <ArrowRight className="w-5 h-5" />
                </button>
                
                <p className="text-xs text-zinc-500">
                  Already have an account? <button onClick={() => router.push('/sign-in')} className="text-zinc-400 hover:text-white underline">Sign in</button>
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-zinc-950/50 border-t border-zinc-800 text-center">
              <p className="text-xs text-zinc-500">
                <span className="text-red-400">Warning:</span> Closing this window without signing up will result in lost progress.
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
