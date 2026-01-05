'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Rocket, Code2, Globe, Zap, Crown, CheckCircle2, ArrowRight } from 'lucide-react'
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
        { icon: Rocket, text: 'Unlimited builds & refinements' },
        { icon: Globe, text: '3 projects to experiment with' },
        { icon: Zap, text: 'AI-powered generation' },
      ],
      upgradeHint: 'Upgrade to deploy your site live',
    },
    architect: {
      name: 'Architect',
      icon: Zap,
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-500',
      perks: [
        { icon: Rocket, text: 'Deploy to hatchitsites.dev' },
        { icon: Globe, text: '3 active projects' },
        { icon: Code2, text: 'Download your code' },
      ],
      upgradeHint: null,
    },
    visionary: {
      name: 'Visionary',
      icon: Crown,
      color: 'violet',
      gradient: 'from-violet-500 to-purple-500',
      perks: [
        { icon: Rocket, text: 'Unlimited projects' },
        { icon: Globe, text: 'Custom domains' },
        { icon: Code2, text: 'Full source code access' },
      ],
      upgradeHint: null,
    },
    singularity: {
      name: 'Singularity',
      icon: Crown,
      color: 'amber',
      gradient: 'from-amber-500 to-orange-500',
      perks: [
        { icon: Rocket, text: 'Everything unlimited' },
        { icon: Globe, text: 'Priority support' },
        { icon: Code2, text: 'API access & white-label' },
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
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleDismiss}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', bounce: 0.3 }}
            className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-zinc-800 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header gradient */}
            <div className={`h-2 w-full bg-gradient-to-r ${config.gradient}`} />

            <div className="p-8">
              {/* Logo + Greeting */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} blur-xl opacity-30`} />
                  <div className="relative w-14 h-14 bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700">
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
                    Welcome, {firstName}!
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <TierIcon className={`w-4 h-4 text-${config.color}-400`} />
                    <span className={`text-sm text-${config.color}-400 font-medium`}>
                      {config.name} Plan
                    </span>
                  </div>
                </div>
              </div>

              {/* What you can do */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
                  Your capabilities
                </h3>
                <div className="space-y-2">
                  {config.perks.map((perk, i) => (
                    <div key={i} className="flex items-center gap-3 text-zinc-300">
                      <div className={`w-8 h-8 rounded-lg bg-${config.color}-500/10 flex items-center justify-center`}>
                        <perk.icon className={`w-4 h-4 text-${config.color}-400`} />
                      </div>
                      <span className="text-sm">{perk.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick tips */}
              <div className="bg-zinc-800/50 rounded-xl p-4 mb-6 border border-zinc-700/50">
                <h3 className="text-sm font-medium text-white mb-2">Quick tips</h3>
                <ul className="text-sm text-zinc-400 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Describe your vision in the prompt box</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Use "Refine" to tweak any section</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Click "Continue" to build the next section</span>
                  </li>
                </ul>
              </div>

              {/* Upgrade hint for free users */}
              {config.upgradeHint && (
                <p className="text-xs text-zinc-500 text-center mb-4">
                  {config.upgradeHint}
                </p>
              )}

              {/* CTA */}
              <button
                onClick={handleDismiss}
                className={`w-full py-4 px-6 bg-gradient-to-r ${config.gradient} text-white font-bold text-lg rounded-xl transition-all hover:shadow-lg hover:shadow-${config.color}-500/20 flex items-center justify-center gap-2 group`}
              >
                Let's Build
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
