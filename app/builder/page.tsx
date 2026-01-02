'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Lock, CreditCard, ArrowRight } from 'lucide-react'
import BuildFlowController from '@/components/BuildFlowController'
import { AccountSubscription } from '@/types/subscriptions'

// =============================================================================
// BUILDER PAGE WRAPPER
// V3 Structured Build Flow - REQUIRES ACTIVE SUBSCRIPTION
// URL: /builder
// =============================================================================

function BuilderContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, isSignedIn, isLoaded } = useUser()
  const projectId = searchParams.get('project')
  const upgrade = searchParams.get('upgrade')
  const mode = searchParams.get('mode')
  const prompt = searchParams.get('prompt')
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [isImportingGuest, setIsImportingGuest] = useState(false)

  // Local dev: always allow guest mode so testing skips auth
  const forceGuest = (process.env.NEXT_PUBLIC_APP_ENV || '').startsWith('local')
  const isGuest = forceGuest || mode === 'guest'

  // Get subscription from Clerk metadata
  const subscription = user?.publicMetadata?.accountSubscription as AccountSubscription | null
  const hasActiveSubscription = subscription?.status === 'active'

  // Handle upgrade param OR no subscription - redirect to Stripe checkout
  useEffect(() => {
    if (!isLoaded) return
    
    // Not signed in? Go to sign-up (unless guest)
    if (!isSignedIn && !isGuest) {
      router.push('/sign-up')
      return
    }

    // Check URL param first, then localStorage fallback (for OAuth flows)
    const pendingTier = upgrade || (typeof window !== 'undefined' ? localStorage.getItem('pendingUpgradeTier') : null)
    
    // Has a pending tier to checkout
    if (pendingTier && ['lite', 'pro', 'agency'].includes(pendingTier)) {
      setIsRedirecting(true)
      
      // Clear both URL param and localStorage
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('upgrade')
      window.history.replaceState({}, '', newUrl.toString())
      localStorage.removeItem('pendingUpgradeTier')
      
      // Trigger checkout
      fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: pendingTier })
      })
        .then(res => res.json())
        .then(data => {
          if (data.url) {
            window.location.href = data.url
          }
        })
        .catch(err => {
          console.error('Checkout redirect failed:', err)
          setIsRedirecting(false)
        })
      return
    }

    // Signed in but NO active subscription and NO pending checkout - block and redirect (unless guest)
    if (!hasActiveSubscription && !pendingTier && !isGuest) {
      router.push('/sign-up')
    }
  }, [isLoaded, isSignedIn, upgrade, hasActiveSubscription, router, isGuest])

  // Migrate guest build into a real project after signup
  useEffect(() => {
    if (!isLoaded || !isSignedIn || isGuest || isRedirecting) return

    const payloadStr = typeof window !== 'undefined' ? localStorage.getItem('hatch_guest_handoff') : null
    if (!payloadStr) return

    const migrate = async () => {
      try {
        setIsImportingGuest(true)
        const payload = JSON.parse(payloadStr)
        const res = await fetch('/api/project/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          localStorage.removeItem('hatch_guest_handoff')
          const data = await res.json()
          if (data?.projectId) {
            router.replace(`/builder?project=${data.projectId}`)
          }
        }
      } catch (err) {
        console.error('Guest import failed', err)
      } finally {
        setIsImportingGuest(false)
      }
    }

    migrate()
  }, [isLoaded, isSignedIn, isGuest, isRedirecting, router])

  // Loading state
  if (!isLoaded || isRedirecting || isImportingGuest) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-zinc-500 text-sm">
            {isRedirecting ? 'Redirecting to checkout...' : isImportingGuest ? 'Importing your guest build...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  // Not signed in and not guest - redirect handled above, show nothing
  if (!isSignedIn && !isGuest) {
    return null
  }

  // Signed in but no subscription - BLOCKED (unless guest)
  if (!hasActiveSubscription && !isGuest) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-zinc-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Subscription Required</h1>
          <p className="text-zinc-400 mb-6">
            Choose a plan to unlock the builder and start creating.
          </p>
          <button
            onClick={() => router.push('/sign-up')}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            View Plans
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    )
  }

  // HAS ACTIVE SUBSCRIPTION OR GUEST - show builder
  return (
    <div className="relative min-h-screen">
      <BuildFlowController 
        existingProjectId={projectId || undefined} 
        guestMode={isGuest}
        initialPrompt={prompt || undefined}
      />
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full"
        />
      </div>
    }>
      <BuilderContent />
    </Suspense>
  )
}
