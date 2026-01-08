'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Check, Sparkles, Zap, ArrowRight, TrendingUp, X } from 'lucide-react'
import { track } from '@vercel/analytics'

interface BuildSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  onContinue: () => void
  onUpgrade: () => void
  sectionName: string
  buildsRemaining: number
  isGuest: boolean
}

export default function BuildSuccessModal({
  isOpen,
  onClose,
  onContinue,
  onUpgrade,
  sectionName,
  buildsRemaining,
  isGuest
}: BuildSuccessModalProps) {
  const isLow = buildsRemaining <= 1
  const isOut = buildsRemaining === 0

  if (!isOpen) return null
  
  // Only show for guests when they hit a limit or are very close
  // The user wants the "experience" to be uninterrupted
  if (isGuest && !isLow && !isOut) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md overflow-hidden shadow-2xl"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="relative mx-auto w-16 h-16 mb-6"
            >
              <div className="w-16 h-16 bg-zinc-800 border border-zinc-700 rounded-2xl flex items-center justify-center">
                <Check className="w-8 h-8 text-emerald-500" strokeWidth={2} />
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-6"
            >
              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                {sectionName} Complete
              </h3>
              <p className="text-sm text-zinc-400">
                {isGuest ? (
                  <>
                    {isOut ? (
                      <span className="text-red-400 font-medium">Trial complete. Sign up to continue.</span>
                    ) : isLow ? (
                      <span className="text-amber-400 font-medium">{buildsRemaining} build remaining</span>
                    ) : (
                      <span>{buildsRemaining} builds left in your trial</span>
                    )}
                  </>
                ) : (
                  'Your section has been generated successfully'
                )}
              </p>
            </motion.div>

            {/* Guest-Specific Content */}
            {isGuest && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-6 space-y-3"
              >
                {/* What's Next */}
                <div className={`p-4 rounded-xl border ${
                  isOut || isLow 
                    ? 'bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border-violet-500/20' 
                    : 'bg-zinc-800/30 border-zinc-800'
                }`}>
                  <div className="flex items-start gap-3 mb-3">
                    <Sparkles className={`w-5 h-5 mt-0.5 ${isOut || isLow ? 'text-violet-400' : 'text-emerald-400'}`} />
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-1">
                        {isOut ? 'Keep Building' : isLow ? 'Almost There!' : 'What You Can Do Next'}
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {isOut ? (
                          'Sign up to save your work, deploy your site, and unlock unlimited builds'
                        ) : isLow ? (
                          'You\'re running low on trial builds. Upgrade now to keep the momentum going!'
                        ) : (
                          'Deploy your site, export code, or keep building more sections'
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Upgrade Benefits */}
                  {(isOut || isLow) && (
                    <div className="space-y-2 pt-3 border-t border-zinc-800">
                      <div className="flex items-center gap-2 text-xs text-zinc-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Unlimited builds & refinements</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Deploy to custom domains</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Export full Next.js project</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col gap-3"
            >
              {isGuest && (isOut || isLow) ? (
                <>
                  {/* Primary: Upgrade */}
                  <button
                    onClick={() => {
                      track('Build Success Modal - Upgrade Clicked', { 
                        buildsRemaining,
                        sectionName,
                        trigger: isOut ? 'out' : 'low'
                      })
                      onUpgrade()
                    }}
                    className="group w-full py-3.5 px-6 bg-zinc-900 border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>{isOut ? 'Unlock Unlimited' : 'Upgrade Now'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-emerald-400" />
                  </button>
                  
                  {/* Secondary: Continue if builds remain */}
                  {!isOut && (
                    <button
                      onClick={() => {
                        track('Build Success Modal - Continue Clicked', { buildsRemaining })
                        onContinue()
                      }}
                      className="w-full py-3 px-6 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-all duration-200"
                    >
                      Continue with Trial
                    </button>
                  )}
                </>
              ) : (
                <>
                  {/* Primary: Continue Building */}
                  <button
                    onClick={() => {
                      track('Build Success Modal - Continue Clicked', { buildsRemaining })
                      onContinue()
                    }}
                    className="group w-full py-3.5 px-6 bg-emerald-500/15 border border-emerald-500/40 hover:bg-emerald-500/20 hover:border-emerald-500/50 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  >
                    <span>Continue Building</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                  
                  {/* Secondary: Upgrade (soft sell) */}
                  {isGuest && (
                    <button
                      onClick={() => {
                        track('Build Success Modal - Upgrade Clicked (Soft)', { buildsRemaining })
                        onUpgrade()
                      }}
                      className="w-full py-3 px-6 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>See Upgrade Options</span>
                    </button>
                  )}
                </>
              )}
            </motion.div>

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close success modal"
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
