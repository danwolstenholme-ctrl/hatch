'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import SingularityLoader from '@/components/singularity/SingularityLoader'
import BuildFlowController from '@/components/BuildFlowController'

// =============================================================================
// DEMO PAGE - Full builder experience, localStorage only
// Premium actions (deploy, download) show signup modal
// If signed in, redirect to /dashboard to migrate guest work
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
  
  // Show loading while checking auth
  if (!isLoaded) {
    return <SingularityLoader text="INITIALIZING SYSTEM" />
  }
  
  // If signed in, don't render - we're redirecting
  if (isSignedIn) {
    return <SingularityLoader text="AUTHENTICATING" />
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
    <Suspense fallback={<SingularityLoader text="LOADING CORE" />}>
      <DemoContent />
    </Suspense>
  )
}
