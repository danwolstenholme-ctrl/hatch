'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Rocket, Code2, Globe, Zap, Crown, ArrowRight, Shield, Cloud } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'

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
            className="relative z-10 w-full max-w-md"
          >
            {/* Outer glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-emerald-500/20 rounded-3xl blur-2xl opacity-60" />
            
            {/* Glass card */}
            <div className="relative bg-zinc-900/70 backdrop-blur-2xl backdrop-saturate-150 border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
              {/* Top highlight */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-white/10 z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="relative p-8">
                {/* Logo + Greeting */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-4 mb-8"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/30 blur-xl rounded-full" />
                    <div className="relative w-14 h-14 bg-white/5 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                      <Image 
                        src="/assets/hatchit_definitive.svg"
                        alt="HatchIt"
                        width={32}
                        height={32}
                      />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Welcome, {firstName}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <TierIcon className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-emerald-400 font-medium">
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
                  className="mb-8"
                >
                  <div className="space-y-3">
                    {config.perks.map((perk, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        className="flex items-center gap-3 text-white/80"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                          <perk.icon className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="text-sm">{perk.text}</span>
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
                    className="text-xs text-white/30 text-center mb-6"
                  >
                    {config.upgradeHint}
                  </motion.p>
                )}

                {/* CTA - Void Button style */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={handleDismiss}
                  className="group relative w-full py-4 px-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 backdrop-blur-md rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_-10px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_-10px_rgba(16,185,129,0.5)] overflow-hidden flex items-center justify-center gap-3"
                >
                  {/* Glow ring on hover */}
                  <div className="absolute -inset-[2px] rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500" />
                  
                  <span className="relative z-10 text-white">Enter the Studio</span>
                  <ArrowRight className="relative z-10 w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
