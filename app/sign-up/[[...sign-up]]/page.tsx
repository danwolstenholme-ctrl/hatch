'use client'

import { SignUp } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, Check, Zap, Building2 } from 'lucide-react'

const tiers = [
  {
    name: 'Starter',
    price: '$9',
    tag: 'SEEDLING',
    tagColor: 'text-emerald-400',
    description: 'Perfect for side projects',
    features: ['3 Active Projects', 'Unlimited AI Generations', 'Download Source Code', 'Deploy to hatchitsites.dev'],
    cta: 'Start Building',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$29',
    tag: 'FULL POWER',
    tagColor: 'text-amber-400',
    description: 'Most popular',
    features: ['Unlimited Generations', 'Unlimited AI Refinements', 'Deploy to Custom Domain', 'Remove HatchIt Branding', 'Priority Code Export', 'The Living Site Engine'],
    cta: 'Become an Architect',
    highlight: true,
  },
  {
    name: 'Agency',
    price: '$99',
    tag: 'EMPIRE',
    tagColor: 'text-violet-400',
    description: 'For teams & scale',
    features: ['Everything in Pro', 'Commercial License', 'Priority 24/7 Support', 'Multiple Projects', 'Team Seats (Coming Soon)', 'White Label Options'],
    cta: 'Initialize Agency',
    highlight: false,
  },
]

export default function SignUpPage() {
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect_url') || '/builder'
  const selectedTier = searchParams.get('upgrade') || searchParams.get('tier')
  
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col lg:flex-row relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-zinc-950/50 to-zinc-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] pointer-events-none" />

      {/* Left: Sign Up Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Header Branding */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 mb-4 shadow-lg shadow-emerald-500/10">
              <Sparkles className="w-6 h-6 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
              Create your account
            </h1>
            <p className="text-zinc-400 text-sm">
              {selectedTier ? `Sign up to continue with ${selectedTier} plan` : 'Start building in seconds'}
            </p>
          </div>

          {/* Card */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-1 shadow-2xl shadow-black/50">
            <div className="bg-zinc-950/50 rounded-xl p-6">
              <SignUp 
                forceRedirectUrl={redirectUrl} 
                appearance={{
                  elements: {
                    rootBox: 'w-full',
                    card: 'bg-transparent shadow-none p-0 w-full',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                    formButtonPrimary: 'bg-emerald-600 hover:bg-emerald-500 text-white w-full py-3 rounded-lg font-medium transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] text-sm',
                    formFieldInput: 'bg-zinc-900/50 border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 text-white rounded-lg py-3 text-sm transition-all',
                    formFieldLabel: 'text-zinc-400 text-xs font-medium mb-1.5',
                    socialButtonsBlockButton: 'bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 h-10 rounded-lg transition-all',
                    socialButtonsBlockButtonText: 'font-medium text-sm',
                    socialButtonsBlockButtonArrow: 'hidden',
                    footerActionLink: 'text-emerald-500 hover:text-emerald-400 font-medium',
                    identityPreviewText: 'text-zinc-300',
                    formFieldInputShowPasswordButton: 'text-zinc-500 hover:text-zinc-300',
                    dividerLine: 'bg-zinc-800',
                    dividerText: 'text-zinc-500 bg-zinc-950 px-2',
                    alertText: 'text-red-400 text-sm',
                    alert: 'bg-red-950/30 border border-red-900/50 text-red-400 rounded-lg',
                    formFieldAction: 'text-emerald-500 hover:text-emerald-400 text-xs',
                  },
                  layout: {
                    socialButtonsPlacement: 'top',
                    showOptionalFields: false,
                  }
                }} 
              />
            </div>
          </div>

          {/* Status */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-500 text-[10px] font-mono">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              SYSTEM STATUS: ONLINE
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right: Pricing - Hidden on mobile, visible on lg+ */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 border-l border-zinc-800/50 relative z-10 bg-zinc-900/30">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-xl"
        >
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-white mb-2">Choose your plan</h2>
            <p className="text-sm text-zinc-400">Upgrade anytime after signing up</p>
          </div>

          <div className="space-y-4">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                className={`relative p-4 rounded-xl border transition-all ${
                  tier.highlight 
                    ? 'bg-zinc-800/80 border-emerald-500/50 shadow-lg shadow-emerald-500/10' 
                    : selectedTier?.toLowerCase() === tier.name.toLowerCase()
                    ? 'bg-zinc-800/60 border-violet-500/50'
                    : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-emerald-500 rounded-full text-[10px] font-bold text-black">
                    RECOMMENDED
                  </div>
                )}
                
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold ${tier.tagColor}`}>{tier.tag}</span>
                      {tier.name === 'Pro' && <Zap className="w-3 h-3 text-amber-400" />}
                      {tier.name === 'Agency' && <Building2 className="w-3 h-3 text-violet-400" />}
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold text-white">{tier.price}</span>
                      <span className="text-xs text-zinc-500">/month</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">{tier.description}</p>
                  </div>
                  
                  <div className="text-right">
                    <ul className="space-y-1">
                      {tier.features.slice(0, 3).map((feature) => (
                        <li key={feature} className="flex items-center gap-1.5 text-xs text-zinc-400 justify-end">
                          <span className="truncate max-w-[140px]">{feature}</span>
                          <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                        </li>
                      ))}
                      {tier.features.length > 3 && (
                        <li className="text-[10px] text-zinc-500">+{tier.features.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-xs text-zinc-500 mt-6">
            Free tier includes 3 builds • No credit card required to start
          </p>
        </motion.div>
      </div>

      {/* Mobile: Compact pricing preview */}
      <div className="lg:hidden px-6 pb-8 relative z-10">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-sm text-zinc-400 mb-2">Plans from <span className="text-white font-bold">$9/mo</span></p>
          <p className="text-xs text-zinc-500">Free tier • 3 builds • No credit card</p>
        </div>
      </div>
    </div>
  )
}
