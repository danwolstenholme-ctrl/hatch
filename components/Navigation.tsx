'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
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
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/roadmap', label: 'Roadmap' },
    { href: '/vision', label: 'Vision' },
    { href: '/about', label: 'About' },
  ]

  return (
    <>
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 w-full bg-zinc-950 border-b border-zinc-800/50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Subtle gradient bottom edge - matches footer top edge */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-4 flex justify-between items-center gap-3">
          {/* Logo - matches footer style */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              className="inline-block"
              style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
              whileHover={{ scale: 1.1, rotate: 15 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Image src="/assets/hatchit_definitive.svg" alt="HatchIt" width={32} height={32} className="w-8 h-8" />
            </motion.div>
          </Link>
          
          {/* Desktop Nav Links - footer style */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className={`text-sm transition-colors ${
                    isActive 
                      ? 'text-white font-medium' 
                      : 'text-zinc-500 hover:text-white'
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
              <SignInButton mode="modal" forceRedirectUrl="/dashboard/projects">
                <button className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/20 hover:from-emerald-500 hover:to-teal-500 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Projects
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-2 sm:gap-3">
                {/* My Projects link */}
                <Link
                  href="/dashboard/projects"
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 text-zinc-900 hover:bg-zinc-200 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Projects
                </Link>
                {/* Subscription badge with renewal timer */}
                <div className="hidden sm:block">
                  <SubscriptionBadge showRenewal={true} />
                </div>
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: `w-7 h-7 sm:w-8 sm:h-8 ${isPaidUser ? `ring-[1.5px] ring-offset-1 ring-offset-zinc-950 ${tier === 'singularity' ? 'ring-amber-500/70' : tier === 'visionary' ? 'ring-violet-500/70' : 'ring-emerald-500/70'}` : ''}`
                    }
                  }}
                />
              </div>
            </SignedIn>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
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
            
            {/* Menu - CSS transform for GPU acceleration */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.2, ease: [0.32, 0.72, 0, 1] }} // Faster, smoother tween instead of spring
              className="absolute right-0 top-0 h-full w-80 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border-l border-emerald-500/20 shadow-[0_20px_70px_rgba(0,0,0,0.45)] overflow-y-auto"
              style={{ willChange: 'transform', backfaceVisibility: 'hidden', touchAction: 'pan-y' }}
            >
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
                <Image src="/assets/hatchit_definitive.svg" alt="HatchIt" width={28} height={28} className="w-7 h-7" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-zinc-400 hover:text-white rounded-lg transition-colors"
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-4 space-y-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                        isActive 
                          ? 'bg-zinc-900 text-white border border-zinc-800' 
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50 hover:pl-6'
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </div>
              
              {/* Mobile My Projects - for signed in users */}
              <SignedIn>
                <div className="p-4 border-t border-emerald-500/15">
                  <Link
                    href="/dashboard/projects"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3.5 text-center bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-emerald-900/30 border border-emerald-400/30"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    My Projects
                  </Link>
                </div>
              </SignedIn>
              
              {/* Mobile Sign In */}
              <SignedOut>
                <div className="p-4 mt-auto border-t border-emerald-500/15 bg-zinc-900/40">
                  <SignInButton mode="modal" forceRedirectUrl="/dashboard/projects">
                    <button className="w-full py-3.5 text-center bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-emerald-900/20">
                      Sign in to Projects
                    </button>
                  </SignInButton>
                </div>
              </SignedOut>
              
              {/* Mobile Footer Info */}
              <div className="p-6 text-center">
                <p className="text-xs text-zinc-600">© 2026 HatchIt.dev</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
