'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { track } from '@vercel/analytics'

interface HatchModalProps {
  isOpen: boolean
  onClose: () => void
  reason: 'generation_limit' | 'code_access' | 'deploy' | 'download' | 'proactive' | 'running_low'
  projectSlug?: string
  projectName?: string
  generationsRemaining?: number
}

export default function HatchModal({ isOpen, onClose, reason, projectSlug = '', projectName = 'this project', generationsRemaining }: HatchModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Track when modal is shown
  useEffect(() => {
    if (isOpen) {
      track('Hatch Modal Shown', { reason })
    }
  }, [isOpen, reason])

  if (!isOpen) return null

  const messages = {
    generation_limit: {
      title: "You've hit today's limit",
      description: "Free accounts get 5 generations per day. Upgrade to Pro for unlimited builds.",
      icon: "⚡"
    },
    running_low: {
      title: `${generationsRemaining} generations left today`,
      description: "Running low! Upgrade to Pro for unlimited generations.",
      icon: "⏳"
    },
    proactive: {
      title: "Ready to go Pro?",
      description: "Unlock unlimited generations, deploy all your projects, and get full code access.",
      icon: "🐣"
    },
    code_access: {
      title: "Unlock your code",
      description: "Upgrade to Pro to view, copy, and download your full source code.",
      icon: "🔓"
    },
    deploy: {
      title: "Ready to go live?",
      description: "Upgrade to Pro to deploy your projects with a custom domain.",
      icon: "🚀"
    },
    download: {
      title: "Download your project",
      description: "Upgrade to Pro to download your projects as clean, production-ready code.",
      icon: "📦"
    }
  }

  const { title, description, icon } = messages[reason]

  const handleHatch = async () => {
    setIsLoading(true)
    track('Hatch Started', { reason, projectSlug })
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: 'pro' }),
      })
      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Failed to start checkout. Please try again.')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingBottom: 'max(1rem, env(safe-area-inset-bottom))', paddingLeft: 'max(1rem, env(safe-area-inset-left))', paddingRight: 'max(1rem, env(safe-area-inset-right))' }}>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl shadow-black/50 overflow-y-auto max-h-[90vh] select-text ring-1 ring-white/5"
          >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-zinc-500 hover:text-white transition-colors active:bg-zinc-800 rounded-lg md:p-2"
          aria-label="Close"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="text-5xl mb-6 text-center">{icon}</div>

        <h2 className="text-2xl font-bold text-white text-center mb-3">
          {title}
        </h2>
        <p className="text-zinc-400 text-center mb-6">
          {description}
        </p>

        {/* What's included */}
        <div className="bg-gradient-to-br from-zinc-800/50 to-zinc-900 border border-purple-500/30 rounded-xl p-6 mb-6 ring-1 ring-purple-500/20 relative overflow-hidden">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">🐣</span>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Pro Account</span>
          </div>
          
          {/* Price */}
          <div className="flex items-baseline justify-center gap-2 mb-1">
            <span className="text-4xl font-bold text-white">$39</span>
            <span className="text-zinc-400">/month</span>
          </div>
          <p className="text-zinc-400 text-sm text-center mb-4">Unlock everything for all your projects</p>
          
          <div className="space-y-2">
            {[
              'Unlimited AI generations',
              'Deploy all projects',
              'Custom domains',
              'Download clean code',
              'Version history',
              'Cloud sync',
              'Priority support',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="text-purple-400">✓</span>
                {feature}
              </div>
            ))}
          </div>
        </div>

        <motion.button
          onClick={handleHatch}
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
        >
          {isLoading ? 'Loading...' : (
            <>
              <span>🐣</span>
              <span>Get Pro — $39/mo</span>
            </>
          )}
        </motion.button>

        <p className="text-zinc-600 text-xs text-center mt-4">
          Cancel anytime. Your code is always yours.
        </p>

        <div className="flex items-center justify-center gap-4 text-zinc-500 text-xs mt-6 pt-4 border-t border-zinc-800">
          <a href="/terms" className="hover:text-white transition-colors">Terms</a>
          <span>•</span>
          <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
        </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
