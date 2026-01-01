'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useSubscription } from '@/contexts/SubscriptionContext'

/**
 * Subtle glow border effect that wraps the page for paid users
 * Shows their tier color around the viewport edges
 */
export function TierGlowOverlay() {
  const { isPaidUser, tier, tierColor } = useSubscription()

  if (!isPaidUser) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[9998]">
      {/* Top edge glow */}
      <div 
        className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${tierColor.gradient} opacity-40`}
      />
      <div 
        className={`absolute top-0 left-0 right-0 h-8 bg-gradient-to-b ${
          tier === 'agency' ? 'from-emerald-500/10' : 'from-teal-500/10'
        } to-transparent`}
      />
      
      {/* Bottom edge glow */}
      <div 
        className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${tierColor.gradient} opacity-40`}
      />
      <div 
        className={`absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t ${
          tier === 'agency' ? 'from-emerald-500/10' : 'from-teal-500/10'
        } to-transparent`}
      />
      
      {/* Left edge */}
      <div 
        className={`absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b ${tierColor.gradient} opacity-30`}
      />
      
      {/* Right edge */}
      <div 
        className={`absolute top-0 bottom-0 right-0 w-[2px] bg-gradient-to-b ${tierColor.gradient} opacity-30`}
      />
      
      {/* Corner accents */}
      <div className={`absolute top-0 left-0 w-16 h-16 bg-gradient-to-br ${
        tier === 'agency' ? 'from-emerald-500/20' : 'from-teal-500/20'
      } to-transparent`} />
      <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl ${
        tier === 'agency' ? 'from-emerald-500/20' : 'from-teal-500/20'
      } to-transparent`} />
      <div className={`absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr ${
        tier === 'agency' ? 'from-emerald-500/20' : 'from-teal-500/20'
      } to-transparent`} />
      <div className={`absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl ${
        tier === 'agency' ? 'from-emerald-500/20' : 'from-teal-500/20'
      } to-transparent`} />
    </div>
  )
}

/**
 * Subscription badge showing tier and renewal info
 * Displays in navigation or wherever needed
 */
export function SubscriptionBadge({ showRenewal = true, compact = false }: { showRenewal?: boolean; compact?: boolean }) {
  const { tier, isPaidUser, daysUntilRenewal, tierColor, isSyncing } = useSubscription()

  if (!isPaidUser) return null

  const tierEmoji = tier === 'agency' ? '⚡' : tier === 'pro' ? '🐣' : tier === 'lite' ? '🌱' : '🥚'
  const tierName = tier === 'agency' ? 'Agency' : tier === 'pro' ? 'Pro' : tier === 'lite' ? 'Starter' : 'Free'

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r ${tierColor.gradient} text-xs font-semibold text-white`}>
        <span>{tierEmoji}</span>
        <span>{tierName}</span>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${tierColor.bgSubtle} border ${tierColor.border}`}
    >
      <span className="text-sm">{tierEmoji}</span>
      <div className="flex flex-col leading-tight">
        <span className={`text-xs font-semibold bg-gradient-to-r ${tierColor.gradient} bg-clip-text text-transparent`}>
          {tierName}
        </span>
        {showRenewal && daysUntilRenewal !== null && (
          <span className="text-[9px] text-zinc-500">
            {daysUntilRenewal <= 0 ? 'Renews today' : 
             daysUntilRenewal === 1 ? 'Tomorrow' : 
             `${daysUntilRenewal}d left`}
          </span>
        )}
      </div>
      {isSyncing && (
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-3 h-3 border border-zinc-500 border-t-transparent rounded-full"
        />
      )}
    </motion.div>
  )
}

/**
 * Floating renewal timer that can be shown anywhere
 */
export function RenewalTimer({ className = '' }: { className?: string }) {
  const { isPaidUser, tier, daysUntilRenewal, renewalDate, tierColor } = useSubscription()

  if (!isPaidUser || daysUntilRenewal === null) return null

  const isUrgent = daysUntilRenewal <= 3
  const tierEmoji = tier === 'agency' ? '⚡' : tier === 'pro' ? '🐣' : tier === 'lite' ? '🌱' : '🥚'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${tierColor.bgSubtle} border ${tierColor.border} ${className}`}
      >
        <span>{tierEmoji}</span>
        <div className="flex flex-col">
          <span className={`text-xs ${isUrgent ? 'text-red-400' : tierColor.text}`}>
            {daysUntilRenewal <= 0 
              ? 'Renews today' 
              : daysUntilRenewal === 1 
              ? 'Renews tomorrow'
              : `${daysUntilRenewal} days until renewal`}
          </span>
          {renewalDate && (
            <span className="text-[10px] text-zinc-600">
              {renewalDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Full subscription status card for settings/profile pages
 */
export function SubscriptionStatusCard() {
  const { 
    subscription, 
    tier, 
    isPaidUser, 
    daysUntilRenewal, 
    renewalDate, 
    tierColor,
    syncSubscription,
    isSyncing 
  } = useSubscription()

  const tierEmoji = tier === 'agency' ? '⚡' : tier === 'pro' ? '🐣' : tier === 'lite' ? '🌱' : '🥚'
  const tierName = tier === 'agency' ? 'Agency' : tier === 'pro' ? 'Pro' : tier === 'lite' ? 'Starter' : 'Free'
  const price = tier === 'agency' ? '$99' : tier === 'pro' ? '$29' : tier === 'lite' ? '$9' : '$0'

  return (
    <div className={`p-6 rounded-2xl ${tierColor.bgSubtle} border ${tierColor.border}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{tierEmoji}</span>
          <div>
            <h3 className={`text-xl font-bold bg-gradient-to-r ${tierColor.gradient} bg-clip-text text-transparent`}>
              {tierName} Plan
            </h3>
            <p className="text-sm text-zinc-400">{price}/month</p>
          </div>
        </div>
        
        <button
          onClick={syncSubscription}
          disabled={isSyncing}
          className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
        >
          {isSyncing ? 'Syncing...' : 'Sync'}
        </button>
      </div>

      {isPaidUser && subscription && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Status</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              subscription.status === 'active' 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {subscription.status}
            </span>
          </div>
          
          {renewalDate && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Renews</span>
              <span className="text-white">
                {renewalDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </span>
            </div>
          )}
          
          {daysUntilRenewal !== null && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Days remaining</span>
              <span className={`font-semibold ${daysUntilRenewal <= 3 ? 'text-red-400' : tierColor.text}`}>
                {daysUntilRenewal}
              </span>
            </div>
          )}

          {/* Progress bar for billing cycle */}
          <div className="mt-4">
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, Math.min(100, ((30 - (daysUntilRenewal || 0)) / 30) * 100))}%` }}
                className={`h-full bg-gradient-to-r ${tierColor.gradient}`}
              />
            </div>
            <p className="text-xs text-zinc-500 mt-1 text-center">
              Billing cycle progress
            </p>
          </div>
        </div>
      )}

      {!isPaidUser && (
        <div className="text-center py-4">
          <p className="text-zinc-400 mb-4">Upgrade to unlock all features</p>
          <Link
            href="/#pricing"
            className="inline-block px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all"
          >
            View Plans
          </Link>
        </div>
      )}
    </div>
  )
}
