'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Rocket, Code2, Globe, Zap, Crown, ArrowRight, Shield, Cloud } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

// =============================================================================
// BUILDER WELCOME - First-time orientation for authenticated users
// Shows tier perks, quick tips, and sets expectations
// =============================================================================

interface BuilderWelcomeProps {
  onClose: () => void
}

export default function BuilderWelcome({ onClose }: BuilderWelcomeProps) {
  const { user } = useUser()
  const [isVisible, setIsVisible] = useState(false)
  const SEEN_KEY = 'hatch_builder_welcome_seen'

  const accountSubscription = user?.publicMetadata?.accountSubscription as {
    tier?: 'architect' | 'visionary' | 'singularity'
    status?: string
  } | undefined
  
  const tier = accountSubscription?.tier || 'free'
  const firstName = user?.firstName || 'there'

  // Tier-specific config
  const tierConfig = {
    free: {
      name: 'Free',
      icon: Sparkles,
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-500',
      perks: [
        { icon: Cloud, text: 'Auto-saved to secure cloud' },
        { icon: Shield, text: 'Your work is protected' },
        { icon: Zap, text: 'Unlimited AI generations' },
      ],
      upgradeHint: 'Upgrade to deploy your site live',
    },
    architect: {
      name: 'Architect',
      icon: Zap,
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-500',
      perks: [
        { icon: Cloud, text: 'Auto-saved to secure cloud' },
        { icon: Rocket, text: 'Deploy to hatchitsites.dev' },
        { icon: Code2, text: 'Download source code' },
      ],
      upgradeHint: null,
    },
    visionary: {
      name: 'Visionary',
      icon: Crown,
      color: 'violet',
      gradient: 'from-violet-500 to-purple-500',
      perks: [
        { icon: Cloud, text: 'Auto-saved to secure cloud' },
        { icon: Globe, text: 'Custom domain support' },
        { icon: Rocket, text: 'Unlimited projects' },
      ],
      upgradeHint: null,
    },
    singularity: {
      name: 'Singularity',
      icon: Crown,
      color: 'amber',
      gradient: 'from-amber-500 to-orange-500',
      perks: [
        { icon: Shield, text: 'Priority infrastructure' },
        { icon: Globe, text: 'White-label & API access' },
        { icon: Rocket, text: 'Everything unlimited' },
      ],
      upgradeHint: null,
    },
  }

  const config = tierConfig[tier] || tierConfig.free
  const TierIcon = config.icon

  useEffect(() => {
    // Check if user has seen the welcome
    const hasSeen = localStorage.getItem(SEEN_KEY)
    if (!hasSeen) {
      // Small delay to let the page settle
      const timer = setTimeout(() => setIsVisible(true), 500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(SEEN_KEY, 'true')
    setIsVisible(false)
    setTimeout(onClose, 300) // Wait for animation
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
        >
          {/* Semi-transparent backdrop with blur */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity" 
            onClick={handleDismiss}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
            className="relative z-10 w-full max-w-xs sm:max-w-sm"
          >
            {/* Outer glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-emerald-500/20 rounded-3xl blur-2xl opacity-60" />
            
            {/* Glass card - matching HomepageWelcome style */}
            <div className="relative bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/50 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.04),transparent_60%)]" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
              
              {/* Top highlight */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
              
              {/* Close button */}
              <button
                onClick={handleDismiss}
                aria-label="Close welcome modal"
                className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-zinc-800 z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="relative p-4 sm:p-6">
                {/* Logo + Greeting */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3 mb-4 sm:mb-6"
                >
                  {/* Geometric H mark */}
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 relative">
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 sm:w-1 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full" />
                      <div className="absolute right-0 top-0 bottom-0 w-0.5 sm:w-1 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full" />
                      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 sm:h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      Welcome, {firstName}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <TierIcon className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                      <span className="text-xs sm:text-sm text-zinc-400 font-medium">
                        {config.name} Plan
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Capabilities */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-4 sm:mb-6"
                >
                  <div className="space-y-2">
                    {config.perks.map((perk, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        className="flex items-center gap-2 text-zinc-200"
                      >
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                          <perk.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-400" />
                        </div>
                        <span className="text-xs sm:text-sm">{perk.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Upgrade hint for free users */}
                {config.upgradeHint && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-[10px] sm:text-xs text-zinc-500 text-center mb-3 sm:mb-4"
                  >
                    {config.upgradeHint}
                  </motion.p>
                )}

                {/* CTA - Primary shimmer style */}
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDismiss}
                  className="group relative w-full py-2.5 sm:py-3 px-4 bg-emerald-500/15 backdrop-blur-2xl border border-emerald-500/40 hover:bg-emerald-500/20 hover:border-emerald-500/50 text-white text-sm font-semibold rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center justify-center gap-2 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent rounded-xl pointer-events-none" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="relative">Enter the Studio</span>
                  <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
