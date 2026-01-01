'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Sparkles, Construction, Zap } from 'lucide-react'
import BuildFlowController from '@/components/BuildFlowController'

// =============================================================================
// BUILDER PAGE WRAPPER
// V3 Structured Build Flow
// URL: /builder
// =============================================================================

function MaintenanceOverlay() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/90 backdrop-blur-md">
      <div className="relative max-w-lg w-full mx-4 p-1 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <div className="bg-zinc-950 rounded-xl p-8 text-center border border-zinc-800 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse rounded-full" />
              <div className="relative w-16 h-16 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center">
                <Zap className="w-8 h-8 text-indigo-400" />
              </div>
              <motion.div 
                className="absolute -top-2 -right-2 bg-emerald-500 text-zinc-950 text-[10px] font-bold px-2 py-0.5 rounded-full"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                GPT-5.1
              </motion.div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
            Genesis Engine Upgrade
          </h2>
          
          <p className="text-zinc-400 mb-8 leading-relaxed">
            The Architect is currently installing the <span className="text-indigo-400 font-medium">GPT-5.1 Codex God Model</span>. 
            <br />
            Builder capabilities are paused while we calibrate the singularity.
          </p>

          <div className="flex flex-col gap-3">
            <button disabled className="w-full py-3 px-4 bg-zinc-800 text-zinc-500 rounded-lg font-medium cursor-not-allowed flex items-center justify-center gap-2">
              <Construction className="w-4 h-4" />
              System Maintenance
            </button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-zinc-900 flex justify-center gap-6 text-xs text-zinc-600 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              CORE: ONLINE
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              BUILDER: UPGRADING
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function BuilderContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isSignedIn, isLoaded } = useUser()
  const projectId = searchParams.get('project') // For resuming V3 projects
  const mode = searchParams.get('mode')
  const prompt = searchParams.get('prompt')
  const upgrade = searchParams.get('upgrade') // Tier to upgrade to after sign-in
  const isDev = process.env.NODE_ENV === 'development'
  const isGuest = mode === 'guest'

  // Handle upgrade param - redirect to checkout after sign-in
  useEffect(() => {
    if (isLoaded && isSignedIn && upgrade && ['lite', 'pro', 'agency'].includes(upgrade)) {
      // Clear the upgrade param from URL
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('upgrade')
      window.history.replaceState({}, '', newUrl.toString())
      
      // Trigger checkout
      fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: upgrade })
      })
        .then(res => res.json())
        .then(data => {
          if (data.url) {
            window.location.href = data.url
          }
        })
        .catch(err => console.error('Checkout redirect failed:', err))
    }
  }, [isLoaded, isSignedIn, upgrade])

  // Always return V3 Structured Build Flow
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
