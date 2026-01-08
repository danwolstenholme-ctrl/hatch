'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Zap, TrendingUp, Sparkles } from 'lucide-react'
import { track } from '@vercel/analytics'

interface GuestCreditBadgeProps {
  buildsUsed: number
  buildsLimit: number
  refinementsUsed: number
  refinementsLimit: number
  onUpgrade: () => void
}

export default function GuestCreditBadge({ 
  buildsUsed, 
  buildsLimit, 
  refinementsUsed, 
  refinementsLimit,
  onUpgrade 
}: GuestCreditBadgeProps) {
  const buildsRemaining = Math.max(0, buildsLimit - buildsUsed)
  const refinementsRemaining = Math.max(0, refinementsLimit - refinementsUsed)
  const totalRemaining = buildsRemaining + refinementsRemaining
  const totalLimit = buildsLimit + refinementsLimit
  
  const isLow = totalRemaining <= 2
  const isCritical = totalRemaining === 1
  const isOut = totalRemaining === 0

  const getStatusColor = () => {
    if (isOut) return 'red'
    if (isCritical) return 'orange'
    if (isLow) return 'amber'
    return 'emerald'
  }

  const getStatusMessage = () => {
    if (isOut) return 'Trial Complete'
    if (isCritical) return 'Last Action!'
    if (isLow) return 'Running Low'
    return 'Trial Active'
  }

  const color = getStatusColor()

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* Main Badge */}
      <div className={`
        relative overflow-hidden rounded-xl border
        ${color === 'emerald' ? 'bg-zinc-900 border-emerald-500/30' : ''}
        ${color === 'amber' ? 'bg-zinc-900 border-amber-500/40' : ''}
        ${color === 'orange' ? 'bg-zinc-900 border-orange-500/50' : ''}
        ${color === 'red' ? 'bg-zinc-900 border-red-500/40' : ''}
      `}>

        <div className="relative p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center
                ${color === 'emerald' ? 'bg-zinc-800' : ''}
                ${color === 'amber' ? 'bg-zinc-800' : ''}
                ${color === 'orange' ? 'bg-zinc-800' : ''}
                ${color === 'red' ? 'bg-zinc-800' : ''}
              `}>
                <Zap className={`w-3.5 h-3.5
                  ${color === 'emerald' ? 'text-emerald-400' : ''}
                  ${color === 'amber' ? 'text-amber-400' : ''}
                  ${color === 'orange' ? 'text-orange-400' : ''}
                  ${color === 'red' ? 'text-red-400' : ''}
                `} />
              </div>
              <span className="text-xs font-semibold text-white tracking-wide">
                {getStatusMessage()}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={totalRemaining}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className={`text-xl font-black
                  ${color === 'emerald' ? 'text-emerald-400' : ''}
                  ${color === 'amber' ? 'text-amber-400' : ''}
                  ${color === 'orange' ? 'text-orange-400' : ''}
                  ${color === 'red' ? 'text-red-400' : ''}
                `}
              >
                {totalRemaining}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress Bars */}
          <div className="space-y-2 mb-3">
            {/* Builds */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Builds</span>
                <span className="text-[10px] text-zinc-400 font-mono">{buildsRemaining}/{buildsLimit}</span>
              </div>
              <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(buildsUsed / buildsLimit) * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`h-full rounded-full
                    ${buildsRemaining === 0 ? 'bg-red-500' : color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'}
                  `}
                />
              </div>
            </div>

            {/* Refinements */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Polishes</span>
                <span className="text-[10px] text-zinc-400 font-mono">{refinementsRemaining}/{refinementsLimit}</span>
              </div>
              <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(refinementsUsed / refinementsLimit) * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                  className={`h-full rounded-full
                    ${refinementsRemaining === 0 ? 'bg-red-500' : color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'}
                  `}
                />
              </div>
            </div>
          </div>

          {/* CTA */}
          <motion.button
            onClick={() => {
              track('Guest Credit Badge - Upgrade Clicked', { 
                buildsRemaining, 
                refinementsRemaining,
                totalRemaining 
              })
              onUpgrade()
            }}
            whileTap={{ scale: 0.98 }}
            className={`
              w-full py-2.5 px-3 rounded-lg font-semibold text-xs
              flex items-center justify-center gap-2
              transition-all
              ${isOut || isCritical 
                ? 'bg-emerald-500/15 border border-emerald-500/40 hover:bg-emerald-500/20 hover:border-emerald-500/50 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
              }
            `}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isOut ? 'Continue Building' : isLow ? 'Upgrade Now' : 'Go Unlimited'}</span>
            <TrendingUp className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      {/* Pulse Effect for Critical State */}
      {isCritical && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-orange-500/50 pointer-events-none"
          animate={{
            opacity: [0, 0.5, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}
    </motion.div>
  )
}
