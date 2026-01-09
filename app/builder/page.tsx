'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import BuildFlowController from '@/components/BuildFlowController'

// =============================================================================
// BUILDER PAGE - Auth users only
// Unauthenticated users → /demo
// No page-level loading states - SingularityTransition handles entry from homepage
// BuildFlowController handles its own loading internally
// =============================================================================

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

  // While checking auth, render nothing - let homepage transition or BuildFlowController handle loading
  if (!isLoaded) {
    return null
  }

  // Redirecting to demo - render nothing
  if (!isSignedIn) {
    return null
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
    <Suspense fallback={null}>
      <BuilderContent />
    </Suspense>
  )
}
