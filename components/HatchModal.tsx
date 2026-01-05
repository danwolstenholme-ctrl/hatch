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
  const { openSignIn, openSignUp } = useClerk()
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
      // Redirect to /dashboard/studio after signup - that's where migration happens
      const redirectUrl = '/dashboard/studio'
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
      const response = await fetch('/api/checkout', {
        method: 'GET', // Changed to GET for new checkout flow
        headers: { 'Content-Type': 'application/json' },
        // Params are now in query string for GET, but let's check how the new checkout route works.
        // Actually, the new checkout route is a GET that redirects to Stripe.
        // We should just redirect the window location.
      })
      
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
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingBottom: 'max(1rem, env(safe-area-inset-bottom))', paddingLeft: 'max(1rem, env(safe-area-inset-left))', paddingRight: 'max(1rem, env(safe-area-inset-right))' }}>
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

            {/* 3-Tier Pricing Grid */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              
              {/* ARCHITECT - $19/mo */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col">
                <div className="mb-4">
                  <span className="text-xs font-bold text-zinc-500 tracking-wider">FOUNDATION</span>
                  <h3 className="text-xl font-bold text-white mt-1">Architect</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-bold text-white">$19</span>
                    <span className="text-zinc-500 text-sm">/month</span>
                  </div>
                  <p className="text-zinc-500 text-xs mt-1">Start building today</p>
                </div>
                
                <div className="space-y-2.5 flex-1">
                  {[
                    { text: 'Unlimited AI Generations', included: true },
                    { text: 'Live Preview', included: true },
                    { text: 'Deploy to subdomain', included: true },
                    { text: '3 Active Projects', included: true },
                    { text: 'Download Source Code', included: false },
                    { text: 'Custom Domain', included: false },
                    { text: 'Remove Branding', included: false },
                  ].map((feature, i) => (
                    <div key={i} className={`flex items-center gap-2 text-sm ${feature.included ? 'text-zinc-300' : 'text-zinc-600'}`}>
                      <span className={feature.included ? 'text-zinc-400' : 'text-zinc-700'}>
                        {feature.included ? '✓' : '○'}
                      </span>
                      {feature.text}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleHatch('architect')}
                  disabled={isLoading || isSyncing}
                  className="w-full mt-6 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold transition-all"
                >
                  Start Building
                </button>
              </div>

              {/* VISIONARY - $49 (Highlighted) */}
              <div className="bg-zinc-900 border-2 border-emerald-500/50 rounded-xl p-5 flex flex-col relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  MOST POPULAR
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">⚡</span>
                    <span className="text-xs font-bold text-emerald-400 tracking-wider">UNLIMITED</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">Visionary</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-bold text-white">$49</span>
                    <span className="text-zinc-500 text-sm">/month</span>
                  </div>
                  <p className="text-zinc-500 text-xs mt-1">Everything. Unlimited.</p>
                </div>
                
                <div className="space-y-2.5 flex-1">
                  {[
                    'Unlimited AI Generations',
                    'Download Full Source Code',
                    'Deploy to Custom Domain',
                    'Remove Platform Branding',
                    'Evolution Engine Access',
                    'Priority Support',
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                      <span className="text-emerald-400">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleHatch('visionary')}
                  disabled={isLoading || isSyncing}
                  className="w-full mt-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-lg shadow-emerald-500/20"
                >
                  {isLoading ? 'Processing...' : 'Become Visionary'}
                </button>
              </div>

              {/* SINGULARITY - $199 */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col">
                <div className="mb-4">
                  <span className="text-xs font-bold text-amber-400 tracking-wider">EMPIRE</span>
                  <h3 className="text-xl font-bold text-white mt-1">Singularity</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-bold text-white">$199</span>
                    <span className="text-zinc-500 text-sm">/month</span>
                  </div>
                  <p className="text-zinc-500 text-xs mt-1">For teams & scale</p>
                </div>
                
                <div className="space-y-2.5 flex-1">
                  {[
                    'Everything in Visionary',
                    'Commercial License',
                    'Priority 24/7 Support',
                    'Unlimited Projects',
                    'Replicator Access (Clone Sites)',
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                      <span className="text-amber-400">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleHatch('singularity')}
                  disabled={isLoading || isSyncing}
                  className="w-full mt-6 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold transition-all"
                >
                  Enter Singularity
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
                className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center"
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
