'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HowItWorksPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/demo')
  }, [router])
  
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-zinc-500 text-sm">Redirecting to demo...</div>
    </div>
  )
}
