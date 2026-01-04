'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

// =============================================================================
// HOMEPAGE WELCOME - First Contact
// A dismissible popup that introduces the "Text to React" concept.
// =============================================================================

function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState('')
  const [started, setStarted] = useState(false)
  
  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(startTimer)
  }, [delay])
  
  useEffect(() => {
    if (!started) return
    let i = 0
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(interval)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [text, started])
  
  return (
    <span className="relative inline-block">
      <motion.span 
        className="bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-400 bg-[length:200%_auto] bg-clip-text text-transparent font-bold"
        animate={{ backgroundPosition: ['0% center', '200% center'] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        {displayed}
      </motion.span>
      
      {/* Cursor */}
      {started && displayed.length < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="text-emerald-400 ml-0.5"
        >
          _
        </motion.span>
      )}
    </span>
  )
}

export default function HomepageWelcome({ onStart }: { onStart?: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [phase, setPhase] = useState<'init' | 'ready'>('init')
  const router = useRouter()
  const SEEN_KEY = 'hatch_homepage_welcome_seen'
  const PREVIEW_PREFIX = 'hatch_preview_'

  useEffect(() => {
    const hasSeen = localStorage.getItem(SEEN_KEY)
    
    // Check if user has a cached preview - if so, skip welcome and go to builder
    const cachedKey = Object.keys(localStorage).find(key => key.startsWith(PREVIEW_PREFIX))
    if (cachedKey) {
      // User has work in progress - extract the cached data and restore their session
      try {
        const cached = localStorage.getItem(cachedKey)
        if (cached) {
          const { code, timestamp } = JSON.parse(cached)
          // Check if cache is still valid (within 1 hour)
          if (Date.now() - timestamp < 60 * 60 * 1000 && code) {
            // Also check if they have a last prompt stored
            const lastPrompt = localStorage.getItem('hatch_last_prompt') || ''
            // Send them straight to builder with their cached prompt
            router.push(`/builder?mode=guest${lastPrompt ? `&prompt=${encodeURIComponent(lastPrompt)}` : ''}`)
            return
          } else {
            // Cache expired, remove it
            localStorage.removeItem(cachedKey)
          }
        }
      } catch {
        // Invalid cache data, remove it
        localStorage.removeItem(cachedKey)
      }
    }
    
    if (!hasSeen) {
      // Open after a brief delay to let the homepage load first
      const timer = setTimeout(() => {
        setIsOpen(true)
        // Progress to ready phase after typing animation
        setTimeout(() => setPhase('ready'), 1500)
      }, 800)

      return () => clearTimeout(timer)
    }
  }, [router])

  const handleStart = () => {
    localStorage.setItem(SEEN_KEY, 'true')
    setIsOpen(false)
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'welcome_cta_click', {
        event_category: 'engagement',
        event_label: 'first_contact_modal',
      })
    }
    
    if (onStart) {
      onStart()
    } else {
      router.push('/builder?mode=guest')
    }
  }

  const handleDismiss = () => {
    localStorage.setItem(SEEN_KEY, 'true')
    setIsOpen(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
        >
          {/* Semi-transparent backdrop - allows seeing the homepage behind */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={handleDismiss}
          />
          
          {/* Main content - Glass Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
            className="relative z-10 w-full max-w-xl bg-zinc-950/90 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/50"
          >
            {/* Close button */}
            <button 
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-zinc-800/50 z-20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 md:p-10 text-center">
              {/* Logo */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-12 h-12 mx-auto mb-6 relative"
              >
                <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                <Image 
                  src="/assets/hatchit_definitive.svg" 
                  alt="HatchIt" 
                  width={48} 
                  height={48}
                  className="w-full h-full relative z-10"
                />
              </motion.div>
              
              {/* Hero Text */}
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                  <span className="text-zinc-400">Text</span>
                  <span className="mx-3 text-zinc-600">→</span>
                  <TypewriterText text="React" delay={400} />
                </h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: phase === 'ready' ? 1 : 0, y: phase === 'ready' ? 0 : 10 }}
                  className="text-zinc-400 text-lg leading-relaxed max-w-sm mx-auto"
                >
                  Describe your vision in plain English.
                  <br />
                  <span className="text-zinc-200">We generate the code instantly.</span>
                </motion.p>
              </div>

              {/* CTA Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: phase === 'ready' ? 1 : 0, y: phase === 'ready' ? 0 : 10 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col gap-3"
              >
                <button
                  onClick={handleStart}
                  className="w-full py-3.5 px-6 bg-white hover:bg-zinc-100 text-black font-semibold text-base rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 group"
                >
                  Start Building Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button
                  onClick={handleDismiss}
                  className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors py-2"
                >
                  No thanks, I'm just browsing
                </button>
              </motion.div>
            </div>
            
            {/* Bottom decorative line */}
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
