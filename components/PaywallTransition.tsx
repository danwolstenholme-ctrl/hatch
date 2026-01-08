'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Zap, Crown, Eye, Sparkles, CheckCircle2, ArrowRight, Terminal } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PaywallTransitionProps {
  reason: 'limit_reached' | 'site_complete'
  onClose?: () => void
  onUpgrade?: () => void
}

const TRANSITION_MESSAGES = {
  limit_reached: [
    { text: 'Trial capacity reached...', delay: 0 },
    { text: 'Preserving your progress...', delay: 800 },
    { text: 'Your site is safe.', delay: 1600 },
  ],
  site_complete: [
    { text: 'Build sequence complete...', delay: 0 },
    { text: 'All sections generated...', delay: 800 },
    { text: 'Ready for deployment.', delay: 1600 },
  ]
}

const TIERS = [
  {
    id: 'architect',
    name: 'Architect',
    price: '$19',
    period: '/month',
    description: 'Ship your projects',
    features: [
      'Unlimited AI generations',
      'Deploy to hatchitsites.dev',
      'Download source code (ZIP)',
      'Push to your GitHub',
      '3 projects',
    ],
    color: 'emerald',
    popular: false,
  },
  {
    id: 'visionary',
    name: 'Visionary',
    price: '$49',
    period: '/month',
    description: 'Professional tools',
    features: [
      'Everything in Architect',
      'Unlimited projects',
      'Custom domain support',
      'Remove HatchIt branding',
      'The Auditor & Healer',
    ],
    color: 'violet',
    popular: true,
  },
  {
    id: 'singularity',
    name: 'Singularity',
    price: '$199',
    period: '/month',
    description: 'Agency & teams',
    features: [
      'Everything in Visionary',
      'The Replicator (clone sites)',
      'Commercial / white-label',
      'API access',
      'Priority support',
    ],
    color: 'amber',
    popular: false,
  },
]

export default function PaywallTransition({ reason, onClose, onUpgrade }: PaywallTransitionProps) {
  const router = useRouter()
  const [messageIndex, setMessageIndex] = useState(0)
  const [showPricing, setShowPricing] = useState(false)

  const messages = TRANSITION_MESSAGES[reason]

  // Run transition sequence
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []
    
    messages.forEach((msg, index) => {
      const timer = setTimeout(() => {
        setMessageIndex(index + 1)
        if (index === messages.length - 1) {
          setTimeout(() => setShowPricing(true), 1000)
        }
      }, msg.delay)
      timers.push(timer)
    })

    return () => timers.forEach(t => clearTimeout(t))
  }, [messages])

  const handleSelectTier = (tierId: string) => {
    // Navigate to signup with the selected tier
    router.push(`/sign-up?tier=${tierId}&redirect_url=/dashboard`)
  }

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 text-white overflow-y-auto font-mono">

      <AnimatePresence mode="wait">
        {!showPricing ? (
          /* Transition Animation */
          <motion.div
            key="transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative h-full flex flex-col items-center justify-center px-6"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="mb-12"
            >
              <div className="w-24 h-24 bg-zinc-900 border border-zinc-700 rounded-full flex items-center justify-center">
                {reason === 'limit_reached' ? (
                  <Lock className="w-10 h-10 text-amber-400" />
                ) : (
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                )}
              </div>
            </motion.div>

            {/* Messages */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 w-full max-w-md backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-800">
                <Terminal className="w-3 h-3 text-zinc-500" />
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">System</span>
              </div>
              
              <div className="space-y-1 text-xs">
                {messages.slice(0, messageIndex).map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center gap-2 ${
                      i === messageIndex - 1 ? 'text-emerald-400' : 'text-zinc-500'
                    }`}
                  >
                    <span className="text-zinc-600">&gt;</span>
                    {msg.text}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          /* Pricing Section */
          <motion.div
            key="pricing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative min-h-full py-16 px-6"
          >
            {/* Header */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-700 mb-6"
              >
                <Eye className="w-4 h-4 text-zinc-400" />
                <span className="text-xs text-zinc-300 uppercase tracking-wider">
                  {reason === 'limit_reached' ? 'Unlock Full Access' : 'Your Site is Ready'}
                </span>
              </motion.div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {reason === 'limit_reached' 
                  ? 'Continue building' 
                  : 'Deploy your site'
                }
              </h1>
              <p className="text-zinc-400 max-w-md mx-auto">
                {reason === 'limit_reached'
                  ? 'Your progress is saved. Choose a plan to keep building.'
                  : 'Sign up to deploy, export code, and keep editing.'
                }
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
              {TIERS.map((tier, index) => (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`relative p-6 rounded-2xl border ${
                    tier.popular
                      ? 'bg-zinc-900 border-emerald-500/50'
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  } transition-colors`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-xs font-semibold text-black rounded-full">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                    <p className="text-xs text-zinc-500">{tier.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-bold text-white">{tier.price}</span>
                    <span className="text-zinc-500 text-sm">{tier.period}</span>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${
                          tier.popular ? 'text-emerald-400' : 'text-zinc-500'
                        }`} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelectTier(tier.id)}
                    className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                      tier.popular
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                    }`}
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="text-center mt-12">
              <p className="text-xs text-zinc-600 mb-4">
                Your code is always yours. Export anytime.
              </p>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-4 transition-colors"
                >
                  Continue in trial mode
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
