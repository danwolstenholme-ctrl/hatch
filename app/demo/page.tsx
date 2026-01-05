'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import BuildFlowController from '@/components/BuildFlowController'

// =============================================================================
// DEMO PAGE - Full builder experience, localStorage only
// Premium actions (deploy, download) show signup modal
// If signed in, redirect to /dashboard/studio to migrate guest work
// =============================================================================

function DemoContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isSignedIn, isLoaded } = useUser()
  const prompt = searchParams.get('prompt')
  
  // If user is signed in, redirect to studio to migrate their demo work
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Always go to studio - that's where migration logic lives
      router.replace('/dashboard/studio')
    }
  }, [isLoaded, isSignedIn, router])
  
  // Show loading while checking auth
  if (!isLoaded) {
    return <div className="min-h-screen bg-zinc-950" />
  }
  
  // If signed in, don't render - we're redirecting
  if (isSignedIn) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
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
    <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}>
      <DemoContent />
    </Suspense>
  )
}
