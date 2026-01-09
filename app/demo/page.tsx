'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import BuildFlowController from '@/components/BuildFlowController'
import { LogoMark } from '@/components/Logo'

// =============================================================================
// DEMO PAGE - Full builder experience, localStorage only
// Premium actions (deploy, download) show signup modal
// If signed in, redirect to /builder
// =============================================================================

function DemoLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <LogoMark size={32} />
        </motion.div>
      </motion.div>
    </div>
  )
}

function DemoContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isSignedIn, isLoaded } = useUser()
  const prompt = searchParams.get('prompt')

  // If user is signed in, redirect to builder
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/builder')
    }
  }, [isLoaded, isSignedIn, router])

  // While checking auth, show loading
  if (!isLoaded) {
    return <DemoLoading />
  }

  // If signed in, redirecting - show loading
  if (isSignedIn) {
    return <DemoLoading />
  }

  return (
    <BuildFlowController 
      isDemo={true}
      initialPrompt={prompt || undefined}
    />
  )
}

export default function DemoPage() {
  return (
    <Suspense fallback={<DemoLoading />}>
      <DemoContent />
    </Suspense>
  )
}
