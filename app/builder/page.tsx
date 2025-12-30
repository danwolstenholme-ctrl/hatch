'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import BuildFlowController from '@/components/BuildFlowController'
import LegacyBuilder from '@/components/LegacyBuilder'

// =============================================================================
// BUILDER PAGE WRAPPER
// Switches between V3 structured flow and legacy freeform builder
// URL: /builder → V3 (default)
// URL: /builder?mode=legacy → Legacy builder
// =============================================================================

function BuilderContent() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')
  const projectId = searchParams.get('project') // For resuming V3 projects

  // V3 Structured Build Flow (default)
  if (mode !== 'legacy') {
    return <BuildFlowController existingProjectId={projectId || undefined} />
  }

  // Legacy freeform builder
  return <LegacyBuilder />
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
