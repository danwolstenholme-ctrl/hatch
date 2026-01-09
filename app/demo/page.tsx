'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import BuildFlowController from '@/components/BuildFlowController'

// =============================================================================
// DEMO PAGE - Full builder experience, localStorage only
// Premium actions (deploy, download) show signup modal
// If signed in, redirect to /builder
// =============================================================================

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

  // While checking auth, render nothing
  if (!isLoaded) {
    return null
  }

  // If signed in, redirecting - render nothing
  if (isSignedIn) {
    return null
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
    <Suspense fallback={null}>
      <DemoContent />
    </Suspense>
  )
}
