'use client'

import { motion } from 'framer-motion'
import { Lock, Wand2, Sparkles, Target, Eye, TrendingUp } from 'lucide-react'
import { track } from '@vercel/analytics'

interface PremiumFeature {
  id: string
  icon: React.ReactNode
  name: string
  description: string
  tier: 'visionary' | 'singularity'
  stats?: string
  gradient: string
}

interface PremiumFeaturesShowcaseProps {
  onFeatureClick: (featureId: string, tier: string) => void
}

export default function PremiumFeaturesShowcase({ onFeatureClick }: PremiumFeaturesShowcaseProps) {
  const features: PremiumFeature[] = [
    {
      id: 'auditor',
      icon: <Target className="w-4 h-4" />,
      name: 'The Auditor',
      description: 'AI quality check for accessibility & performance',
      tier: 'visionary',
      stats: '1.2k audits today',
      gradient: 'from-violet-500 to-purple-500'
    },
    {
      id: 'healer',
      icon: <Wand2 className="w-4 h-4" />,
      name: 'The Healer',
      description: 'Auto-fix errors and optimize code',
      tier: 'visionary',
      stats: '847 fixes today',
      gradient: 'from-violet-500 to-fuchsia-500'
    },
    {
      id: 'replicator',
      icon: <Sparkles className="w-4 h-4" />,
      name: 'The Replicator',
      description: 'Clone any website from URL',
      tier: 'singularity',
      stats: '247 sites cloned',
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      id: 'chronosphere',
      icon: <TrendingUp className="w-4 h-4" />,
      name: 'Chronosphere',
      description: 'Evolve your style DNA over time',
      tier: 'singularity',
      stats: '89 evolutions',
      gradient: 'from-amber-500 to-yellow-500'
    },
    {
      id: 'witness',
      icon: <Eye className="w-4 h-4" />,
      name: 'The Witness',
      description: 'AI deployment insights & reflections',
      tier: 'singularity',
      stats: '156 insights',
      gradient: 'from-orange-500 to-red-500'
    }
  ]

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="px-1">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Premium Features
          </span>
        </div>
        <p className="text-[10px] text-zinc-600 leading-relaxed">
          Unlock advanced AI tools and capabilities
        </p>
      </div>

      {/* Features Grid */}
      <div className="space-y-2">
        {features.map((feature, index) => (
          <motion.button
            key={feature.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => {
              track('Premium Feature Clicked', { 
                feature: feature.id, 
                tier: feature.tier 
              })
              onFeatureClick(feature.id, feature.tier)
            }}
            className="group relative w-full text-left overflow-hidden rounded-lg border border-zinc-800/50 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/50 transition-all duration-300"
          >
            {/* Gradient Glow */}
            <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            
            {/* Lock Icon Overlay */}
            <div className="absolute top-2 right-2 opacity-30 group-hover:opacity-50 transition-opacity">
              <Lock className="w-3 h-3 text-zinc-500" />
            </div>

            <div className="relative p-3">
              {/* Icon & Name */}
              <div className="flex items-start gap-2.5 mb-2">
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${feature.gradient} opacity-80 flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      {feature.name}
                    </span>
                    {feature.tier === 'singularity' && (
                      <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                        Elite
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-snug">
                    {feature.description}
                  </p>
                </div>
              </div>

              {/* Stats */}
              {feature.stats && (
                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-zinc-800/50">
                  <div className="w-1 h-1 rounded-full bg-emerald-500/50 animate-pulse" />
                  <span className="text-[9px] text-zinc-600 font-medium">
                    {feature.stats}
                  </span>
                </div>
              )}

              {/* Hover Indicator */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="pt-2 px-1"
      >
        <div className="p-3 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 border border-violet-500/10 rounded-lg">
          <p className="text-[10px] text-zinc-400 leading-relaxed mb-2">
            <span className="text-violet-400 font-semibold">Visionary</span> unlocks 2 features. 
            <span className="text-amber-400 font-semibold"> Singularity</span> unlocks all 5.
          </p>
          <div className="flex items-center justify-between text-[9px]">
            <span className="text-zinc-600">Starting at</span>
            <span className="text-white font-bold">$19/month</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
