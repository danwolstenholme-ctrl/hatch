'use client'

import { useEffect, useRef, Suspense } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import HatchCharacter from '@/components/HatchCharacter'
import { AccountSubscription } from '@/types/subscriptions'
import { useSubscription } from '@/contexts/SubscriptionContext'

// =============================================================================
// WELCOME PAGE
// A creative, animated welcome experience for all user types
// Free: Grey theme, friendly intro
// Pro: Purple theme with Hatch character
// Agency: Gold/amber theme with golden chicken
// =============================================================================

type WelcomeTier = 'free' | 'pro' | 'agency'

// Tier-specific content and theming
const tierConfig = {
  free: {
    emoji: '⚡',
    title: 'Protocol: INITIATE',
    subtitle: "Access granted. System resources allocated.",
    description: "You have been granted basic access to the Architect's tools. Prove your worth to unlock higher functions.",
    price: '$0 / mo',
    ctaText: 'Initialize Builder',
    ctaUrl: '/builder',
    gradient: 'from-zinc-600 to-zinc-400',
    accentColor: 'zinc',
    features: [
      { icon: '👁️', text: '5 Neural Generations/day' },
      { icon: '🖥️', text: 'Live DOM Manipulation' },
      { icon: '🧩', text: 'Component Assembly' },
      { icon: '🤖', text: 'Basic Architect Guidance' },
    ],
  },
  pro: {
    emoji: '🧠',
    title: "Protocol: ARCHITECT",
    subtitle: 'Full neural link established.',
    description: "You are now one with the system. Create, deploy, and manifest without limits. The code obeys your thought.",
    price: '$29 / mo',
    ctaText: 'Enter the Matrix',
    ctaUrl: '/builder',
    gradient: 'from-emerald-500 to-teal-500',
    accentColor: 'emerald',
    features: [
      { icon: '∞', text: 'Unlimited Neural Generations' },
      { icon: '🚀', text: 'Direct-to-Edge Deployment' },
      { icon: '💾', text: 'Full Source Export' },
      { icon: '🌐', text: 'Custom Domain Binding' },
      { icon: '🎨', text: 'Deep Style Injection' },
      { icon: '⚡', text: 'Priority Kernel Access' },
    ],
  },
  agency: {
    emoji: '🔮',
    title: 'Protocol: DEMIURGE',
    subtitle: 'Reality distortion field active.',
    description: "You build worlds for others. White-label the Architect and deploy fleets of sites. You are the system administrator.",
    price: '$199 / mo',
    ctaText: 'Access Control Plane',
    ctaUrl: '/builder',
    gradient: 'from-amber-400 to-orange-500',
    accentColor: 'amber',
    features: [
      { icon: '👑', text: 'All Architect Privileges' },
      { icon: '🏢', text: 'Unlimited Client Instances' },
      { icon: '🏷️', text: 'White-Label Interface' },
      { icon: '📊', text: 'Priority Support Line' },
      { icon: '🔑', text: 'API Key Provisioning' },
      { icon: '💼', text: 'Commercial Rights' },
    ],
  },
}

// Golden Chicken for Agency tier
function GoldenChicken() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', bounce: 0.5, delay: 0.3 }}
      className="relative w-48 h-48 flex items-center justify-center"
    >
      {/* Subtle glow effect */}
      <div className="absolute inset-0 blur-3xl bg-amber-500/20 rounded-full scale-150" />
      
      {/* Rotating Rings */}
      <motion.div 
        className="absolute inset-0 border-2 border-amber-500/30 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="absolute inset-4 border-2 border-amber-500/50 rounded-full border-dashed"
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />

      {/* Core */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10"
      >
        <div className="text-6xl">🔮</div>
      </motion.div>
      
      {/* Orbiting Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-amber-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "linear"
          }}
          style={{
            transformOrigin: "center center",
            top: "50%",
            left: "50%",
            marginTop: "-1px",
            marginLeft: "-1px",
            transform: `rotate(${i * 60}deg) translateX(60px)`
          }}
        />
      ))}
    </motion.div>
  )
}

// Pro tier Hatch character with special effects
function ProHatchCharacter() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', bounce: 0.5, delay: 0.3 }}
      className="relative w-48 h-48 flex items-center justify-center"
    >
      {/* Subtle glow */}
      <div className="absolute inset-0 blur-3xl bg-emerald-500/20 rounded-full scale-150" />
      
      {/* Rotating Rings */}
      <motion.div 
        className="absolute inset-0 border border-emerald-500/30 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10"
      >
        <div className="text-6xl">🧠</div>
      </motion.div>
    </motion.div>
  )
}

// Free tier friendly egg
function FreeEgg() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', bounce: 0.4, delay: 0.3 }}
      className="relative"
    >
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="text-9xl"
      >
        🥚
      </motion.div>
    </motion.div>
  )
}

function WelcomeContent() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasTriggeredSyncRef = useRef(false)
  const { syncSubscription } = useSubscription()

  const urlTier = searchParams.get('tier') as WelcomeTier | null
  const hasValidUrlTier = !!urlTier && (urlTier === 'pro' || urlTier === 'agency')

  const accountSub = user?.publicMetadata?.accountSubscription as AccountSubscription | null
  const derivedTier: WelcomeTier = hasValidUrlTier
    ? (urlTier as WelcomeTier)
    : (accountSub?.status === 'active' ? (accountSub.tier as WelcomeTier) : 'free')

  const tier = derivedTier

  // Trigger a sync when returning from checkout with a tier param.
  useEffect(() => {
    if (!isLoaded) return
    if (!hasValidUrlTier) return
    if (hasTriggeredSyncRef.current) return
    syncSubscription()
    hasTriggeredSyncRef.current = true
  }, [hasValidUrlTier, isLoaded, syncSubscription])

  const config = tierConfig[derivedTier]

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Background effects - subtle, matching site aesthetic */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -left-40 w-80 h-80 ${
          tier === 'agency' ? 'bg-orange-500/10' :
          tier === 'pro' ? 'bg-purple-500/10' :
          'bg-zinc-500/5'
        } rounded-full blur-[100px]`} />
        <div className={`absolute top-1/3 -right-40 w-96 h-96 ${
          tier === 'agency' ? 'bg-amber-500/10' :
          tier === 'pro' ? 'bg-pink-500/10' :
          'bg-zinc-500/5'
        } rounded-full blur-[100px]`} />
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-2xl"
      >
        {/* Character/Icon */}
        <div className="mb-8 flex justify-center">
          {tier === 'agency' ? (
            <GoldenChicken />
          ) : tier === 'pro' ? (
            <ProHatchCharacter />
          ) : (
            <FreeEgg />
          )}
        </div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold text-white mb-4"
        >
          {config.title}
        </motion.h1>

        {/* Price Tag (New) */}
        {/* @ts-ignore */}
        {config.price && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className={`inline-block px-4 py-1 rounded-full border border-white/10 bg-white/5 text-sm font-mono mb-6 ${
              tier === 'agency' ? 'text-amber-400' :
              tier === 'pro' ? 'text-emerald-400' :
              'text-zinc-400'
            }`}
          >
            {/* @ts-ignore */}
            {config.price}
          </motion.div>
        )}

        {/* Subtitle with gradient */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`text-xl md:text-2xl font-medium bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent mb-6`}
        >
          {config.subtitle}
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-zinc-400 text-lg mb-10 max-w-md mx-auto"
        >
          {config.description}
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`bg-zinc-900/80 backdrop-blur-sm border ${
            tier === 'agency' ? 'border-orange-500/30' :
            tier === 'pro' ? 'border-purple-500/30' :
            'border-zinc-800'
          } rounded-2xl p-6 mb-10`}
        >
          <div className="grid grid-cols-2 gap-4">
            {config.features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-center gap-3 text-left"
              >
                <span className="text-xl">{feature.icon}</span>
                <span className="text-sm text-zinc-300">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: 'spring', bounce: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push(config.ctaUrl)}
          className={`px-8 py-4 ${
            tier === 'agency' 
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/25' 
              : tier === 'pro'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-purple-500/25'
              : 'bg-gradient-to-r from-zinc-600 to-zinc-500 shadow-zinc-500/25'
          } text-white font-semibold rounded-xl shadow-lg transition-all text-lg`}
        >
          {config.ctaText} →
        </motion.button>

        {/* User greeting */}
        {user && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 text-zinc-500 text-sm"
          >
            Signed in as <span className="text-zinc-400">{user.emailAddresses[0]?.emailAddress}</span>
          </motion.p>
        )}
      </motion.div>

      {/* Skip link */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        onClick={() => router.push('/builder')}
        className="absolute bottom-8 text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
      >
        Skip to builder →
      </motion.button>
    </div>
  )
}

export default function WelcomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full"
        />
      </div>
    }>
      <WelcomeContent />
    </Suspense>
  )
}
