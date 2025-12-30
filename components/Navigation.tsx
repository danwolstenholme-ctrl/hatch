'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { SubscriptionBadge } from './SubscriptionIndicator'
import { useSubscription } from '@/contexts/SubscriptionContext'
import HatchLogo from './HatchLogo'

export default function Navigation() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isPaidUser, tier, tierColor } = useSubscription()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
        className={`sticky top-0 z-50 px-4 sm:px-6 transition-all duration-300 ${
          scrolled 
            ? 'py-3 bg-zinc-950/95 backdrop-blur-lg border-b border-zinc-800/50 shadow-lg' 
            : 'py-3 sm:py-5 bg-zinc-950'
        }`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              className="inline-block"
              style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
              whileHover={{ scale: 1.1, rotate: 15 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <HatchLogo className="w-9 h-9" />
            </motion.div>
            <span className="text-xl font-bold group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
              <span className="text-white">Hatch</span><span className="bg-gradient-to-r from-emerald-500 to-emerald-400 bg-clip-text text-transparent">It</span>
            </span>
          </Link>
          
          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'text-white' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-zinc-800 rounded-lg -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>
          
          {/* Auth & CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-zinc-400 hover:text-white transition-colors text-sm font-medium hidden sm:block px-3 py-2">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Subscription badge with renewal timer */}
                <div className="hidden sm:block">
                  <SubscriptionBadge showRenewal={true} />
                </div>
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: `w-7 h-7 sm:w-8 sm:h-8 ${isPaidUser ? `ring-[1.5px] ring-offset-1 ring-offset-zinc-950 ${tier === 'agency' ? 'ring-amber-500/70' : 'ring-purple-500/70'}` : ''}`
                    }
                  }}
                />
              </div>
            </SignedIn>
            <Link 
              href="/builder" 
              className={`px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r ${isPaidUser ? tierColor.gradient : 'from-purple-600 to-pink-600'} hover:opacity-90 text-white rounded-lg font-medium text-xs sm:text-sm transition-all`}
            >
              <span className="hidden sm:inline">{isPaidUser ? 'Open Builder' : 'Start Building'}</span>
              <span className="sm:hidden">Build</span>
            </Link>
            
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
              className="absolute right-0 top-0 h-full w-72 bg-zinc-950 border-l border-zinc-800 shadow-2xl overflow-y-auto"
              style={{ willChange: 'transform', backfaceVisibility: 'hidden', touchAction: 'pan-y' }}
            >
              <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <span className="font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Menu
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-zinc-400 hover:text-white bg-zinc-900 rounded-lg transition-colors"
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
              
              {/* Mobile Sign In */}
              <SignedOut>
                <div className="p-4 mt-auto border-t border-zinc-800 bg-zinc-900/30">
                  <SignInButton mode="modal">
                    <button className="w-full py-3.5 text-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-purple-900/20">
                      Sign In
                    </button>
                  </SignInButton>
                </div>
              </SignedOut>
              
              {/* Mobile Footer Info */}
              <div className="p-6 text-center">
                <p className="text-xs text-zinc-600">© 2025 HatchIt.dev</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
