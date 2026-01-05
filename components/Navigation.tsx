'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { SubscriptionBadge } from './SubscriptionIndicator'
import { useSubscription } from '@/contexts/SubscriptionContext'

export default function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isPaidUser, tier, tierColor } = useSubscription()

  const navLinks = [
    { href: '/features', label: 'Features' },
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/how-it-works', label: 'How It Works' },
  ]

  return (
    <>
      <motion.nav 
        className="fixed top-3 left-0 right-0 z-50 w-full"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="absolute inset-0 blur-xl bg-emerald-500/10 rounded-3xl pointer-events-none" />
          <div className="relative flex justify-between items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 sm:px-6 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
            {/* Logo - Icon only */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              className="inline-block"
              style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Image src="/assets/hatchit_definitive.svg" alt="HatchIt" width={28} height={28} className="w-7 h-7" />
            </motion.div>
            <span className="hidden sm:inline-flex text-[11px] uppercase tracking-[0.35em] text-zinc-400">
              Singularity
            </span>
          </Link>
          
          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-1 shadow-inner shadow-black/30">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href))
              return (
                <Link 
                  key={link.href}
                  href={link.href} 
                  aria-current={isActive ? 'page' : undefined}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-medium tracking-tight transition-all ${
                    isActive 
                      ? 'text-white bg-emerald-500/10 border border-emerald-400/30 shadow-[0_0_20px_rgba(16,185,129,0.35)]' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
          
          {/* Auth & CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            <SignedOut>
              <Link 
                href="/demo" 
                className="hidden md:inline-flex text-sm text-zinc-400 hover:text-white transition-colors px-3 py-1.5"
              >
                Try Demo
              </Link>
              <Link 
                href="/sign-in" 
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
              >
                Sign In
              </Link>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/dashboard"
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                {/* Subscription badge */}
                <div className="hidden sm:block">
                  <SubscriptionBadge showRenewal={true} />
                </div>
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: `w-7 h-7 sm:w-8 sm:h-8 ring-1 ring-zinc-700 ${isPaidUser ? `ring-offset-1 ring-offset-zinc-900 ${tier === 'singularity' ? 'ring-amber-500/50' : tier === 'visionary' ? 'ring-violet-500/50' : 'ring-emerald-500/50'}` : ''}`
                    }
                  }}
                />
              </div>
            </SignedIn>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-zinc-300 hover:text-white transition-colors rounded-full border border-white/10"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay - optimized for mobile performance */}
      <AnimatePresence mode="wait">
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }} // Fast fade for mobile
            className="fixed inset-0 z-40 md:hidden"
            style={{ willChange: 'opacity' }}
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
              style={{ touchAction: 'none' }} // Prevent scrolling through backdrop
            />
            
            {/* Menu - cleaner slide panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
              className="absolute right-0 top-0 h-full w-80 bg-zinc-950/95 border-l border-zinc-800 overflow-y-auto backdrop-blur"
              style={{ willChange: 'transform', backfaceVisibility: 'hidden', touchAction: 'pan-y' }}
            >
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image src="/assets/hatchit_definitive.svg" alt="HatchIt" width={24} height={24} className="w-6 h-6" />
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-zinc-500 hover:text-white rounded-md transition-colors"
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-3 space-y-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href))
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-3 py-2.5 rounded-md text-sm transition-colors ${
                        isActive 
                          ? 'bg-zinc-800 text-white' 
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </div>
              
              {/* Mobile Dashboard - for signed in users */}
              <SignedIn>
                <div className="p-3 border-t border-zinc-800">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 text-center bg-zinc-800 hover:bg-zinc-700 text-white rounded-md font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                </div>
              </SignedIn>
              
              {/* Mobile Sign In */}
              <SignedOut>
                <div className="p-3 border-t border-zinc-800">
                  <Link 
                    href="/demo"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2.5 text-center text-zinc-400 hover:text-white rounded-md transition-colors mb-2"
                  >
                    Try Demo
                  </Link>
                  <Link 
                    href="/sign-in"
                    onClick={() => setMobileMenuOpen(false)} 
                    className="block w-full py-2.5 text-center bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              </SignedOut>
              
              {/* Mobile Footer Info */}
              <div className="p-4 text-center mt-auto">
                <p className="text-xs text-zinc-600">© 2026 HatchIt.dev</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
