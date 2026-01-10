'use client'

import Link from 'next/link'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Menu, X, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { SubscriptionBadge } from './SubscriptionIndicator'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { Logo } from '@/components/Logo'

const navLinks = [
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/features', label: 'Features' },
  { href: '/roadmap', label: 'Roadmap' },
  { href: '/about', label: 'About' },
]

export default function Navigation() {
  const { isPaidUser, tier } = useSubscription()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 w-full"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Glass background */}
        <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-xl border-b border-zinc-800/50" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Logo />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/50 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            <SignedOut>
              <Link 
                href="/sign-in" 
                className="hidden sm:block px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Sign in
              </Link>
              <Link 
                href="/sign-up" 
                className="hidden sm:block px-4 py-2 text-sm text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 transition-all"
              >
                Sign Up
              </Link>
              <Link 
                href="/demo" 
                className="group relative px-5 py-2 text-sm font-medium rounded-lg bg-emerald-500/15 backdrop-blur-xl border border-emerald-500/40 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all overflow-hidden shadow-[0_0_12px_rgba(16,185,129,0.1)]"
              >
                <span className="relative z-10 text-white">
                  Try Demo
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </SignedOut>

            <SignedIn>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium rounded-lg bg-zinc-800/60 backdrop-blur-xl hover:bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 hover:border-zinc-600 transition-all"
              >
                Dashboard
              </Link>
              <div className="hidden sm:block">
                <SubscriptionBadge showRenewal={false} />
              </div>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: `w-8 h-8 ring-1 ring-zinc-700 ${isPaidUser ? `ring-offset-1 ring-offset-zinc-950 ${tier === 'singularity' ? 'ring-amber-500/50' : tier === 'visionary' ? 'ring-violet-500/50' : 'ring-emerald-500/50'}` : ''}`
                  }
                }}
              />
            </SignedIn>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <motion.div
        initial={false}
        animate={{ 
          opacity: mobileMenuOpen ? 1 : 0,
          y: mobileMenuOpen ? 0 : -10,
          pointerEvents: mobileMenuOpen ? 'auto' : 'none'
        }}
        transition={{ duration: 0.2 }}
        className="fixed top-[57px] left-0 right-0 z-40 md:hidden"
      >
        <div className="bg-zinc-950/95 backdrop-blur-2xl border-b border-zinc-800/50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <SignedOut>
              <div className="mt-2 pt-2 border-t border-zinc-800/50 space-y-1">
                <Link 
                  href="/demo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm text-emerald-400 font-medium hover:bg-zinc-800/50 rounded-lg transition-colors"
                >
                  Try Demo
                </Link>
                <Link 
                  href="/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
                <Link 
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-xs text-zinc-500 hover:text-zinc-300 rounded-lg transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </SignedOut>
          </div>
        </div>
      </motion.div>
    </>
  )
}