'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useClerk, useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Check, Zap, Building2, ArrowLeft, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { Suspense, useEffect } from 'react'

const tiers = [
  {
    name: 'Lite',
    price: '$9',
    period: '/2 wks',
    tag: 'SEEDLING',
    tagColor: 'text-lime-400',
    description: 'Perfect to explore',
    features: ['Full Builder Access', 'Unlimited AI Generations', 'Live Preview', 'Deploy to subdomain'],
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/mo',
    tag: 'FULL ACCESS',
    tagColor: 'text-emerald-400',
    description: 'Everything. Unlimited.',
    features: ['Download Source Code', 'Custom Domain', 'Remove Branding', 'Commercial License', 'Priority Support'],
    highlight: true,
  },
  {
    name: 'Agency',
    price: '$99',
    period: '/mo',
    tag: 'TEAMS',
    tagColor: 'text-violet-400',
    description: 'For agencies & teams',
    features: ['Everything in Pro', 'Unlimited Projects', 'Team Features', 'White-label', 'Priority 24/7 Support'],
    highlight: false,
  },
]

function SignUpContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { openSignUp } = useClerk()
  const { isSignedIn } = useUser()
  const selectedTier = searchParams.get('upgrade')

  useEffect(() => {
    if (isSignedIn && selectedTier) {
      router.push(`/builder?upgrade=${selectedTier}`)
    }
  }, [isSignedIn, selectedTier, router])

  const handleSelectTier = (tierName: string) => {
    // Store tier in localStorage as backup (OAuth sometimes drops URL params)
    localStorage.setItem('pendingUpgradeTier', tierName.toLowerCase())
    
    // Open Clerk sign-up modal
    openSignUp({
      afterSignUpUrl: `/builder?upgrade=${tierName.toLowerCase()}`,
      afterSignInUrl: `/builder?upgrade=${tierName.toLowerCase()}`,
    })
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-zinc-900/50 to-black" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.05),transparent_50%)]" />
      
      {/* Header */}
      <div className="relative z-10 p-6 flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <Image 
          src="/assets/hatchit_definitive.svg" 
          alt="HatchIt" 
          width={100} 
          height={28}
          className="opacity-80"
        />
        <div className="w-16" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
            <Sparkles className="w-3 h-3" />
            Start building in seconds
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Choose your plan
          </h1>
          <p className="text-zinc-400 text-lg max-w-md mx-auto">
            Select a tier to create your account and start building
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          {tiers.map((tier, i) => (
            <motion.button
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
              onClick={() => handleSelectTier(tier.name)}
              className={`relative p-6 rounded-2xl border text-left transition-all group cursor-pointer ${
                tier.highlight 
                  ? 'bg-zinc-800/80 border-emerald-500/50 shadow-xl shadow-emerald-500/10 scale-105' 
                  : selectedTier?.toLowerCase() === tier.name.toLowerCase()
                  ? 'bg-zinc-800/60 border-violet-500/50 hover:border-violet-400'
                  : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/40'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 rounded-full text-xs font-bold text-black">
                  RECOMMENDED
                </div>
              )}
              
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-bold ${tier.tagColor}`}>{tier.tag}</span>
                {tier.name === 'Pro' && <Zap className="w-3.5 h-3.5 text-amber-400" />}
                {tier.name === 'Agency' && <Building2 className="w-3.5 h-3.5 text-violet-400" />}
              </div>
              
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-white">{tier.price}</span>
                <span className="text-sm text-zinc-500">{tier.period}</span>
              </div>
              <p className="text-sm text-zinc-500 mb-4">{tier.description}</p>
              
              <ul className="space-y-2 mb-6">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-zinc-400">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className={`w-full py-2.5 rounded-lg text-center text-sm font-medium transition-all ${
                tier.highlight
                  ? 'bg-emerald-500 text-black group-hover:bg-emerald-400'
                  : 'bg-zinc-800 text-white group-hover:bg-zinc-700'
              }`}>
                Get started
              </div>
            </motion.button>
          ))}
        </div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center text-sm text-zinc-500 mt-12"
        >
          Cancel anytime • Secure payment via Stripe
        </motion.p>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-zinc-500">Loading...</div>
      </div>
    }>
      <SignUpContent />
    </Suspense>
  )
}
