'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function Navigation() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/features', label: 'Features' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/roadmap', label: 'Roadmap' },
    { href: '/about', label: 'About' },
  ]

  return (
    <motion.nav 
      className={`sticky top-0 z-50 px-6 transition-all duration-300 ${
        scrolled 
          ? 'py-3 bg-zinc-950/95 backdrop-blur-lg border-b border-zinc-800/50 shadow-lg' 
          : 'py-5 bg-zinc-950'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <motion.span 
            className="text-2xl inline-block"
            style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
            whileHover={{ scale: 1.1, rotate: 15 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            🐣
          </motion.span>
          <span className="text-xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
            HatchIt
          </span>
        </Link>
        
        {/* Nav Links */}
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
        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-zinc-400 hover:text-white transition-colors text-sm font-medium hidden sm:block px-3 py-2">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'w-9 h-9'
                }
              }}
            />
          </SignedIn>
          <Link 
            href="/builder" 
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-semibold text-sm transition-all hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105"
          >
            Start Building
          </Link>
        </div>
      </div>
    </motion.nav>
  )
}
