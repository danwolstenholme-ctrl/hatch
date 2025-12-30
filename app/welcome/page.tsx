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
    emoji: '🥚',
    title: 'Welcome to the Nest!',
    subtitle: "You're in. Let's build something amazing.",
    description: "Start creating beautiful websites with AI. When you're ready to hatch your creations into the wild, upgrade to Pro.",
    ctaText: 'Start Building',
    ctaUrl: '/builder',
    gradient: 'from-zinc-400 to-zinc-300',
    accentColor: 'zinc',
    features: [
      { icon: '🎨', text: '5 AI generations per day' },
      { icon: '👀', text: 'Live preview your designs' },
      { icon: '🏗️', text: 'Section-by-section building' },
      { icon: '💡', text: 'Smart prompt assistance' },
    ],
  },
  pro: {
    emoji: '🐣',
    title: "You've Hatched!",
    subtitle: 'Welcome to the Pro flock, creator.',
    description: "You now have unlimited power to create, deploy, and share your websites with the world. Let's make something incredible.",
    ctaText: 'Start Creating',
    ctaUrl: '/builder',
    gradient: 'from-purple-400 to-pink-400',
    accentColor: 'purple',
    features: [
      { icon: '∞', text: 'Unlimited AI generations' },
      { icon: '🚀', text: 'Deploy to live URLs' },
      { icon: '💻', text: 'Full code access & download' },
      { icon: '🌐', text: 'Custom domain support' },
      { icon: '🎨', text: 'Advanced brand customization' },
      { icon: '⚡', text: 'Priority AI responses' },
    ],
  },
  agency: {
    emoji: '🐔',
    title: 'Welcome, Master Builder!',
    subtitle: 'The golden tier. Maximum power unlocked.',
    description: "You're now part of an elite group of creators. Build unlimited sites for clients, access white-label features, and scale your agency.",
    ctaText: 'Enter the Studio',
    ctaUrl: '/builder',
    gradient: 'from-orange-400 to-amber-400',
    accentColor: 'orange',
    features: [
      { icon: '👑', text: 'Everything in Pro, plus...' },
      { icon: '🏢', text: 'Unlimited client sites' },
      { icon: '🏷️', text: 'White-label deployment' },
      { icon: '📊', text: 'Priority support' },
      { icon: '🔑', text: 'API access (coming soon)' },
      { icon: '💼', text: 'Commercial license included' },
    ],
  },
}

// Golden Chicken for Agency tier
function GoldenChicken() {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', bounce: 0.5, delay: 0.3 }}
      className="relative"
    >
      {/* Subtle glow effect */}
      <div className="absolute inset-0 blur-2xl bg-orange-500/20 rounded-full scale-125" />
      
      {/* Main chicken */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="relative text-9xl"
        style={{ filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.3))' }}
      >
        🐔
      </motion.div>
      
      {/* Crown */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, type: 'spring', bounce: 0.6 }}
        className="absolute -top-8 left-1/2 -translate-x-1/2 text-5xl"
      >
        👑
      </motion.div>
      
      {/* Sparkles around chicken */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.3,
          }}
          style={{
            top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 50}%`,
            left: `${50 + Math.cos(i * 60 * Math.PI / 180) * 60}%`,
          }}
        >
          ✨
        </motion.div>
      ))}
    </motion.div>
  )
}

// Pro tier Hatch character with special effects
function ProHatchCharacter() {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', bounce: 0.5, delay: 0.3 }}
      className="relative"
    >
      {/* Subtle purple glow */}
      <div className="absolute inset-0 blur-2xl bg-purple-500/20 rounded-full scale-125" />
      
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
      >
        <HatchCharacter state="excited" size="xl" />
      </motion.div>
      
      {/* Sparkles */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-xl"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.4,
          }}
          style={{
            top: `${20 + Math.sin(i * 90 * Math.PI / 180) * 40}%`,
            left: `${50 + Math.cos(i * 90 * Math.PI / 180) * 50}%`,
          }}
        >
          💜
        </motion.div>
      ))}
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
