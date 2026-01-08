'use client'

import { useState, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import { Modal } from './singularity'
import { LogoMark } from './Logo'

// =============================================================================
// DEMO WELCOME - First-time orientation for demo/guest users
// Minimal. One CTA. No feature lists.
// =============================================================================

interface DemoWelcomeProps {
  onClose: () => void
}

export default function DemoWelcome({ onClose }: DemoWelcomeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const SEEN_KEY = 'hatch_demo_welcome_seen'

  useEffect(() => {
    const hasSeen = sessionStorage.getItem(SEEN_KEY)
    if (!hasSeen) {
      const timer = setTimeout(() => setIsOpen(true), 300)
      return () => clearTimeout(timer)
    } else {
      onClose()
    }
  }, [onClose])

  const handleDismiss = () => {
    sessionStorage.setItem(SEEN_KEY, 'true')
    setIsOpen(false)
    setTimeout(onClose, 200)
  }

  return (
    <Modal isOpen={isOpen} onClose={handleDismiss} size="sm" showClose={false}>
      <div className="text-center">
        {/* Logo */}
        <div className="mb-4">
          <LogoMark size={48} className="w-12 h-12 mx-auto" />
        </div>
        
        <h2 className="text-lg font-semibold text-white mb-2">Sandbox Mode</h2>
        <p className="text-sm text-zinc-400 mb-5">
          Describe what you want. Work saves locally.
        </p>

        <button
          onClick={handleDismiss}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/15 border border-emerald-500/40 hover:bg-emerald-500/20 hover:border-emerald-500/50 text-white font-medium text-sm rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)]"
        >
          Start Building
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-xs text-zinc-500 mt-4">
          <a href="/sign-up" className="text-emerald-400 hover:text-emerald-300 transition-colors">Sign up free</a> to save to cloud.
        </p>
      </div>
    </Modal>
  )
}
