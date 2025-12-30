'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { SubscriptionBadge } from './SubscriptionIndicator'
import { useSubscription } from '@/contexts/SubscriptionContext'

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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

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
            : 'py-4 sm:py-5 bg-zinc-950'
        }`}
        initial={false}
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
              <Image src="/assets/logo.png" alt="HatchIt" width={36} height={36} className="w-9 h-9" />
            </motion.div>
            <span className="text-xl font-bold group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
              <span className="text-white">Hatch</span><span className="bg-gradient-to-r from-amber-500 to-amber-400 bg-clip-text text-transparent">It</span>
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

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute right-0 top-0 h-full w-64 bg-zinc-900 border-l border-zinc-800 shadow-2xl"
            >
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                <span className="font-semibold text-white">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-zinc-400 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-4 space-y-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
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
              
              {/* Mobile Sign In */}
              <SignedOut>
                <div className="p-4 border-t border-zinc-800">
                  <SignInButton mode="modal">
                    <button className="w-full py-3 text-center text-zinc-300 hover:text-white transition-colors font-medium">
                      Sign In
                    </button>
                  </SignInButton>
                </div>
              </SignedOut>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
