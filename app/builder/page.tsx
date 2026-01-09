'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import BuildFlowController from '@/components/BuildFlowController'
import { LogoMark } from '@/components/Logo'

// =============================================================================
// BUILDER PAGE - Auth users only
// Unauthenticated users → /demo
// =============================================================================

function BuilderLoading() {
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

function BuilderContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isSignedIn, isLoaded } = useUser()
  const projectId = searchParams.get('project')
  const prompt = searchParams.get('prompt')

  // Redirect unauthenticated users to demo
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      const demoUrl = prompt ? `/demo?prompt=${encodeURIComponent(prompt)}` : '/demo'
      router.replace(demoUrl)
    }
  }, [isLoaded, isSignedIn, prompt, router])

  // While checking auth, show loading
  if (!isLoaded) {
    return <BuilderLoading />
  }

  // Redirecting to demo - show loading
  if (!isSignedIn) {
    return <BuilderLoading />
  }

  // Authenticated user - BuildFlowController handles all loading states
  return (
    <BuildFlowController 
      existingProjectId={projectId || undefined}
      initialPrompt={prompt || undefined}
      isDemo={false}
    />
  )
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<BuilderLoading />}>
      <BuilderContent />
    </Suspense>
  )
}
