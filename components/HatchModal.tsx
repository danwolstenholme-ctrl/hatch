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
    guest_lock: {
      title: "You've built something real.",
      description: "Your project is ready. Unlock it for just $9/month.",
      icon: "🚀"
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

  const handleHatch = async (selectedTier: 'pro' | 'lite' = 'pro') => {
    // If not signed in, redirect to sign-up with upgrade param so checkout happens after
    if (!isSignedIn) {
      onClose()
      const currentUrl = new URL(window.location.href)
      currentUrl.searchParams.set('upgrade', selectedTier)
      router.push(`/sign-up?redirect_url=${encodeURIComponent(currentUrl.toString())}`)
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: selectedTier }),
      })

      if (response.status === 401) {
        onClose()
        openSignIn({
          afterSignInUrl: window.location.href,
          afterSignUpUrl: window.location.href,
        })
        return
      }

      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else if (data.existingTier) {
        // User already has subscription - sync and close
        setError(`You already have a ${data.existingTier} subscription! Syncing your account...`)
        await syncSubscription()
        setTimeout(() => {
          onClose()
          window.location.reload()
        }, 2000)
      } else {
        setError(data.error || 'Failed to start checkout. Please try again.')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setError('Failed to start checkout. Please try again.')
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
        {reason === 'guest_lock' ? (
          <div className="space-y-4 mb-6">
            {/* STARTER - THE HERO for guest conversion */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/30 rounded-xl p-5 ring-1 ring-amber-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500 text-zinc-950 text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                BEST VALUE
              </div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚡</span>
                  <span className="text-lg font-bold text-amber-400">Starter</span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">$9</div>
                  <div className="text-[10px] text-zinc-400">/month</div>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                {[
                  'Download your code right now',
                  '20 AI generations per day',
                  'Keep building unlimited sections',
                  'Cancel anytime',
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                    <span className="text-amber-400">✓</span>
                    {feature}
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleHatch('lite')}
                disabled={isLoading || isSyncing}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95"
              >
                {isLoading ? 'Processing...' : 'Unlock for $9/month'}
              </button>
            </div>

            {/* Separator */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-zinc-800"></div>
              <span className="text-xs text-zinc-600">or</span>
              <div className="flex-1 h-px bg-zinc-800"></div>
            </div>

            {/* Free option (secondary) */}
            <button
              onClick={() => {
                const currentParams = window.location.search
                const returnUrl = '/builder' + currentParams
                router.push(`/sign-up?redirect_url=${encodeURIComponent(returnUrl)}`)
              }}
              disabled={isLoading || isSyncing}
              className="w-full py-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-300 text-sm font-medium transition-all"
            >
              Continue with free account (limited)
            </button>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {/* PRO TIER (Highlighted) */}
            <div className="bg-gradient-to-br from-zinc-800/50 to-zinc-900 border border-teal-500/30 rounded-xl p-5 ring-1 ring-teal-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-teal-500 text-zinc-950 text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                RECOMMENDED
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💠</span>
                  <span className="text-lg font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Pro Architect</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">$29</div>
                  <div className="text-[10px] text-zinc-400">/month</div>
                </div>
              </div>
              
              <div className="space-y-1.5 mb-4">
                {[
                  'Unlimited AI builds',
                  'Unlimited AI refinements',
                  'Deploy to custom domain',
                  'Full code export',
                  'Remove HatchIt Branding',
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                    <span className="text-teal-400">✓</span>
                    {feature}
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleHatch('pro')}
                disabled={isLoading || isSyncing}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-sm font-semibold shadow-lg shadow-teal-500/20 transition-all active:scale-95"
              >
                {isLoading ? 'Processing...' : 'Get Pro Access'}
              </button>
            </div>

            {/* LITE TIER */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌱</span>
                  <span className="text-base font-bold text-zinc-300">Starter Pack</span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">$9</div>
                  <div className="text-[10px] text-zinc-400">/month</div>
                </div>
              </div>
              
              <div className="space-y-1.5 mb-4">
                {[
                  '1 Active Project',
                  'Basic Code Download',
                  'No Custom Domain',
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="text-zinc-500">✓</span>
                    {feature}
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleHatch('lite')}
                disabled={isLoading || isSyncing}
                className="w-full py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-all"
              >
                Select Starter
              </button>
            </div>
          </div>
        )}

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
            className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-center"
          >
            <p className="text-green-400 font-semibold mb-1">🎉 You&apos;re already a {tier === 'agency' ? 'Agency' : 'Pro'} member!</p>
            <p className="text-zinc-400 text-sm">You have full access to all features.</p>
            <button
              onClick={onClose}
              className="mt-3 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
            >
              Got it
            </button>
          </motion.div>
        )}

        {/* Sync button for users who paid but it didn't register */}
        <button
          onClick={syncSubscription}
          disabled={isSyncing}
          className="w-full mt-3 py-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {isSyncing ? 'Syncing...' : 'Already paid? Click to sync your subscription'}
        </button>

        <div className="flex items-center justify-center gap-4 text-zinc-500 text-xs mt-4 pt-4 border-t border-zinc-800">
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
