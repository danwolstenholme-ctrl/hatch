'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { track } from '@vercel/analytics'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useSubscription } from '@/contexts/SubscriptionContext'

interface HatchModalProps {
  isOpen: boolean
  onClose: () => void
  reason: 'generation_limit' | 'code_access' | 'deploy' | 'download' | 'proactive' | 'running_low' | 'guest_lock'
  projectSlug?: string
  projectName?: string
  generationsRemaining?: number
}

export default function HatchModal({ isOpen, onClose, reason, projectSlug = '', generationsRemaining }: HatchModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isPaidUser, tier, syncSubscription, isSyncing } = useSubscription()
  const { isSignedIn } = useUser()
  const router = useRouter()

  // Track when modal is shown
  useEffect(() => {
    if (isOpen) {
      track('Hatch Modal Shown', { reason })
    }
  }, [isOpen, reason])

  if (!isOpen) return null

  const messages = {
    generation_limit: {
      title: "Guest trial complete",
      description: "You've used your trial builds. Sign up and pick a plan to keep creating.",
    },
    running_low: {
      title: `${generationsRemaining} builds remaining`,
      description: "Running low! Upgrade for unlimited builds.",
    },
    proactive: {
      title: "Ready to build more?",
      description: "Create an account and unlock unlimited generations, deploy, and full code export.",
    },
    guest_lock: {
      title: "Save and ship your site",
      description: "Sign up to save, deploy, and export your generated site.",
    },
    code_access: {
      title: "Unlock your code",
      description: "Upgrade to view, copy, and download your full source code.",
    },
    deploy: {
      title: "Ready to go live?",
      description: "Upgrade to deploy your projects with a custom domain.",
    },
    download: {
      title: "Download your project",
      description: "Get your clean, production-ready code.",
    }
  }

  const { title, description } = messages[reason]

  const handleHatch = async (selectedTier: 'architect' | 'visionary' | 'singularity' = 'visionary') => {
    // If not signed in, go to split-screen sign-up page with tier pre-selected
    if (!isSignedIn) {
      onClose()
      // Redirect to portal after signup so the project list and migrations load first
      const redirectUrl = '/dashboard'
      router.push(`/sign-up?upgrade=${selectedTier}&redirect_url=${encodeURIComponent(redirectUrl)}`)
      return
    }

    // Double-check they don't already have a subscription
    if (isPaidUser) {
      setError(`You already have a ${tier} subscription!`)
      // Try to sync to make sure the UI updates
      await syncSubscription()
      return
    }
    
    setIsLoading(true)
    setError(null)
    track('Hatch Started', { reason, projectSlug, tier: selectedTier })
    try {
      // Direct redirect to checkout endpoint with params
      const checkoutUrl = new URL('/api/checkout', window.location.origin)
      checkoutUrl.searchParams.set('tier', selectedTier)
      if (projectSlug) checkoutUrl.searchParams.set('project', projectSlug)
      
      window.location.href = checkoutUrl.toString()
      
    } catch (error) {
      console.error('Checkout error:', error)
      setError('Failed to start checkout. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 safe-area-modal">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-zinc-950 border border-zinc-800 rounded-2xl p-6 md:p-8 w-full max-w-4xl shadow-2xl shadow-black/50 overflow-y-auto max-h-[90vh] select-text"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors active:bg-zinc-800 rounded-lg z-10"
              aria-label="Close"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {title}
              </h2>
              <p className="text-zinc-400 text-lg">
                {description}
              </p>
            </div>

            {/* 3-Tier Pricing Grid - Compact like billing page */}
            <div className="grid md:grid-cols-3 gap-3 mb-6">
              
              {/* ARCHITECT - $19/mo */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col hover:border-zinc-700 transition-all">
                <div className="mb-3">
                  <span className="text-[10px] font-medium text-zinc-500 tracking-wider">STARTER</span>
                  <h3 className="text-sm font-semibold text-white mt-0.5">Architect</h3>
                  <div className="flex items-baseline gap-0.5 mt-1">
                    <span className="text-xl font-bold text-white">$19</span>
                    <span className="text-zinc-500 text-[10px]">/mo</span>
                  </div>
                </div>
                
                <div className="space-y-1.5 flex-1 text-[11px]">
                  {[
                    'Unlimited AI generations',
                    'Deploy to hatchitsites.dev',
                    'Full Next.js export',
                    'Push to GitHub',
                    '3 projects',
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-zinc-400">
                      <span className="text-zinc-500">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleHatch('architect')}
                  disabled={isLoading || isSyncing}
                  className="w-full mt-4 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium transition-all disabled:opacity-50"
                >
                  Get Started
                </button>
              </div>

              {/* VISIONARY - $49 (Highlighted) */}
              <div className="bg-zinc-900 border-2 border-emerald-500/40 rounded-xl p-4 flex flex-col relative shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-[9px] font-bold px-2.5 py-0.5 rounded-full">
                  RECOMMENDED
                </div>
                
                <div className="mb-3">
                  <span className="text-[10px] font-medium text-emerald-400 tracking-wider">PROFESSIONAL</span>
                  <h3 className="text-sm font-semibold text-white mt-0.5">Visionary</h3>
                  <div className="flex items-baseline gap-0.5 mt-1">
                    <span className="text-xl font-bold text-white">$49</span>
                    <span className="text-zinc-500 text-[10px]">/mo</span>
                  </div>
                </div>
                
                <div className="space-y-1.5 flex-1 text-[11px]">
                  {[
                    'Everything in Architect',
                    'Unlimited projects',
                    'Custom domain',
                    'Remove branding',
                    'Code audit + auto-fix',
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-zinc-300">
                      <span className="text-emerald-400">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleHatch('visionary')}
                  disabled={isLoading || isSyncing}
                  className="w-full mt-4 py-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Upgrade'}
                </button>
              </div>

              {/* SINGULARITY - $199 */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col hover:border-zinc-700 transition-all">
                <div className="mb-3">
                  <span className="text-[10px] font-medium text-amber-400 tracking-wider">AGENCY</span>
                  <h3 className="text-sm font-semibold text-white mt-0.5">Singularity</h3>
                  <div className="flex items-baseline gap-0.5 mt-1">
                    <span className="text-xl font-bold text-white">$199</span>
                    <span className="text-zinc-500 text-[10px]">/mo</span>
                  </div>
                </div>
                
                <div className="space-y-1.5 flex-1 text-[11px]">
                  {[
                    'Everything in Visionary',
                    'Site cloner',
                    'White-label license',
                    'API access',
                    'Priority support',
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-zinc-400">
                      <span className="text-amber-400">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleHatch('singularity')}
                  disabled={isLoading || isSyncing}
                  className="w-full mt-4 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium transition-all disabled:opacity-50"
                >
                  Go Agency
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Already subscribed message */}
            {isPaidUser && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-zinc-900 border border-zinc-700 rounded-xl text-center"
              >
                <p className="text-emerald-400 font-semibold mb-1">You&apos;re already a {tier === 'singularity' ? 'Singularity' : tier === 'visionary' ? 'Visionary' : 'Architect'} member!</p>
                <p className="text-zinc-400 text-sm">You have full access to all features.</p>
                <button
                  onClick={onClose}
                  className="mt-3 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
                >
                  Continue Building
                </button>
              </motion.div>
            )}

            {/* Footer */}
            <div className="flex flex-col items-center gap-3 pt-4 border-t border-zinc-800">
              <button
                onClick={syncSubscription}
                disabled={isSyncing}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {isSyncing ? 'Syncing...' : 'Already paid? Click to sync'}
              </button>
              <div className="flex items-center gap-4 text-zinc-600 text-xs">
                <a href="/terms" className="hover:text-white transition-colors">Terms</a>
                <span>•</span>
                <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
