'use client'

import { ReactNode } from 'react'
import ErrorBoundary from '@/components/ErrorBoundary'

// =============================================================================
// BUILDER LAYOUT - Clean slate for builder
// =============================================================================

export default function BuilderLayout({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-zinc-950 text-white">
        {children}
      </div>
    </ErrorBoundary>
  )
}