'use client'

import { useState, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { Modal } from './singularity'

// =============================================================================
// BUILDER WELCOME - Welcome back for authenticated users
// Minimal. One CTA. No feature lists.
// =============================================================================

interface BuilderWelcomeProps {
  onClose: () => void
}

export default function BuilderWelcome({ onClose }: BuilderWelcomeProps) {
  const { user } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const SEEN_KEY = 'hatch_builder_welcome_seen'

  const firstName = user?.firstName || 'there'

  useEffect(() => {
    const hasSeen = localStorage.getItem(SEEN_KEY)
    if (!hasSeen) {
      const timer = setTimeout(() => setIsOpen(true), 500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(SEEN_KEY, 'true')
    setIsOpen(false)
    setTimeout(onClose, 300)
  }

  return (
    <Modal isOpen={isOpen} onClose={handleDismiss} size="sm" showClose={false}>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-white mb-2">
          Welcome back, {firstName}
        </h2>
        <p className="text-sm text-zinc-400 mb-6">
          Projects sync automatically.
        </p>

        <div className="flex gap-3">
          <Link
            href="/dashboard"
            className="flex-1 text-center px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium rounded-lg transition-colors"
          >
            Dashboard
          </Link>
          <button
            onClick={handleDismiss}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500/15 border border-emerald-500/40 hover:bg-emerald-500/20 hover:border-emerald-500/50 text-white font-medium rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)]"
          >
            Build
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  )
}
