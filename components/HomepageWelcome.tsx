'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { LogoMark } from '@/components/Logo'

export default function HomepageWelcome({ onStart }: { onStart?: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)
  const router = useRouter()
  const { isSignedIn, isLoaded } = useUser()
  const SEEN_KEY = 'hatch_homepage_welcome_seen'
  const PREVIEW_PREFIX = 'hatch_preview_'

  useEffect(() => {
    // Wait for auth to load before checking resume options
    if (!isLoaded) return
    
    const hasSeen = localStorage.getItem(SEEN_KEY)
    
    // For signed-in users: check for a real project
    if (isSignedIn) {
      const savedProjectId = localStorage.getItem('hatch_current_project')
      if (savedProjectId) {
        setResumeUrl(`/builder?project=${savedProjectId}`)
      }
    } else {
      // For guests: check for cached preview
      const cachedKey = Object.keys(localStorage).find(key => key.startsWith(PREVIEW_PREFIX))
      if (cachedKey) {
        // User has work in progress - extract the cached data
        try {
          const cached = localStorage.getItem(cachedKey)
          if (cached) {
            const { code, timestamp } = JSON.parse(cached)
            // Check if cache is still valid (within 24 hours to be generous)
            if (Date.now() - timestamp < 24 * 60 * 60 * 1000 && code) {
              // Guest work - send to demo which will load it
              setResumeUrl('/demo')
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
    }
    
    if (!hasSeen) {
      // Open immediately for instant impact
      setIsOpen(true)
    }
  }, [isLoaded, isSignedIn])

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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-xl" 
            onClick={handleDismiss}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              duration: 0.6, 
              ease: [0.16, 1, 0.3, 1],
              scale: { type: "spring", damping: 20, stiffness: 300 }
            }}
            className="relative w-full max-w-lg"
          >
            <div className="relative bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/50 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.04),transparent_60%)]" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
              
              <div className="relative px-5 pt-6 pb-6 sm:px-6 sm:pt-8 sm:pb-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="text-center mb-5 sm:mb-6"
                >
                  {/* Logo */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.05, duration: 0.5, type: "spring", stiffness: 200 }}
                    className="mx-auto mb-5 sm:mb-6"
                  >
                    <LogoMark size={56} className="w-12 h-12 sm:w-14 sm:h-14 mx-auto" />
                  </motion.div>
                  
                  {/* Headline */}
                  <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 tracking-tight">
                    <span className="text-zinc-200">Describe it.</span>
                    <span className="mx-1.5 sm:mx-2 text-zinc-200">Build it.</span>
                    <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">Ship it.</span>
                  </h1>
                  
                  {/* Subtext */}
                  <p className="text-sm sm:text-base text-zinc-400 mb-1 leading-relaxed">
                    Turn plain English into production React + Tailwind.
                  </p>
                  <p className="text-sm sm:text-base text-zinc-300 font-medium mb-5 sm:mb-6">
                    Push to your GitHub. You own it.
                  </p>

                  {/* Feature grid */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="grid grid-cols-2 gap-2 max-w-sm mx-auto mb-5 sm:mb-6"
                  >
                    {[
                      'Live preview',
                      'React + Tailwind',
                      'Push to GitHub',
                      'Download source',
                    ].map((feature, i) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + (i * 0.05), duration: 0.3 }}
                        className="flex items-center gap-2 text-xs text-zinc-300 bg-zinc-800/40 border border-zinc-700/50 rounded-lg px-2.5 py-2"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>

                {/* Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="space-y-2 max-w-xs mx-auto"
                >
                  {resumeUrl && (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        localStorage.setItem(SEEN_KEY, 'true')
                        setIsOpen(false)
                        router.push(resumeUrl)
                      }}
                      className="group relative w-full py-2.5 px-4 bg-emerald-500/15 backdrop-blur-2xl border border-emerald-500/40 hover:bg-emerald-500/20 hover:border-emerald-500/50 text-white font-medium text-sm text-center rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center justify-center gap-2 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent rounded-xl pointer-events-none" />
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"
                        animate={{ x: ['-200%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                      <span className="relative">Resume Session</span>
                      <ArrowRight className="relative w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  )}

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStart}
                    className={`group relative w-full py-2.5 px-4 font-medium text-sm text-center rounded-xl transition-all flex items-center justify-center gap-2 overflow-hidden ${
                      resumeUrl 
                        ? 'bg-zinc-800/50 backdrop-blur-xl hover:bg-zinc-800/60 text-zinc-200 border border-zinc-700/50'
                        : 'bg-emerald-500/15 backdrop-blur-2xl border border-emerald-500/40 hover:bg-emerald-500/20 hover:border-emerald-500/50 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    }`}
                  >
                    {!resumeUrl && <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent rounded-xl pointer-events-none" />}
                    {!resumeUrl && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"
                        animate={{ x: ['-200%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                    <span className="relative">{resumeUrl ? 'Start Fresh' : 'Start Building'}</span>
                    {!resumeUrl && <ArrowRight className="relative w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  </motion.button>
                  
                  <div className="text-center pt-2">
                    <motion.button
                      onClick={handleDismiss}
                      className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      Continue browsing
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
