'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const features = [
  {
    category: 'Build',
    items: [
      {
        title: 'AI Generation',
        description: 'Claude Sonnet powers intelligent section generation with context-aware design.',
        status: 'active',
        link: '/builder'
      },
      {
        title: 'Live Preview',
        description: 'See your site update in real-time as you build each section.',
        status: 'active',
        link: '/builder'
      },
      {
        title: 'Component Library',
        description: 'Pre-built patterns ensure consistent, professional output.',
        status: 'active'
      },
      {
        title: 'Brand Settings',
        description: 'Colors, fonts, and style persist across all sections.',
        status: 'active',
        link: '/builder?settings=1'
      }
    ]
  },
  {
    category: 'Ship',
    items: [
      {
        title: 'One-Click Deploy',
        description: 'Deploy to hatchitsites.dev with a single click.',
        status: 'active',
        tier: 'architect'
      },
      {
        title: 'GitHub Push',
        description: 'Push your code directly to your GitHub repository.',
        status: 'active',
        tier: 'architect',
        link: '/dashboard/settings'
      },
      {
        title: 'Export ZIP',
        description: 'Download your complete Next.js project.',
        status: 'active',
        tier: 'architect'
      },
      {
        title: 'Custom Domain',
        description: 'Connect your own domain to deployed sites.',
        status: 'active',
        tier: 'visionary'
      }
    ]
  },
  {
    category: 'AI Tools',
    items: [
      {
        title: 'Session Insights',
        description: 'Analysis of your build patterns and suggestions.',
        status: 'active',
        tier: 'free'
      },
      {
        title: 'Code Audit',
        description: 'Quality check that optimizes generated code.',
        status: 'active',
        tier: 'visionary'
      },
      {
        title: 'Auto-Fix',
        description: 'Automatic error detection and repair.',
        status: 'active',
        tier: 'visionary'
      },
      {
        title: 'Site Cloner',
        description: 'Reverse-engineer any site into build prompts.',
        status: 'active',
        tier: 'singularity'
      }
    ]
  },
  {
    category: 'Coming Soon',
    items: [
      {
        title: 'API Access',
        description: 'Programmatic access to the build system.',
        status: 'soon',
        tier: 'singularity'
      },
      {
        title: 'Team Workspaces',
        description: 'Collaborate with your team on projects.',
        status: 'soon',
        tier: 'singularity'
      }
    ]
  }
]

export default function DashboardFeaturesPage() {
  return (
    <div className="space-y-10">
      {features.map((section, sectionIndex) => (
        <div key={section.category}>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{section.category}</h2>
            {section.category === 'Coming Soon' && (
              <span className="text-[10px] px-1.5 py-0.5 bg-zinc-800/60 text-zinc-500 rounded-sm font-medium">Roadmap</span>
            )}
          </div>
          <div className="grid gap-px bg-zinc-800/50 rounded-md overflow-hidden border border-zinc-800/60">
            {section.items.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (sectionIndex * 0.05) + (index * 0.02) }}
              >
                {feature.link ? (
                  <Link
                    href={feature.link}
                    className={`block px-4 py-3 bg-zinc-900/50 hover:bg-zinc-900 transition-colors group ${
                      feature.status === 'soon' ? 'opacity-50' : ''
                    }`}
                  >
                    <FeatureRow feature={feature} hasLink />
                  </Link>
                ) : (
                  <div className={`px-4 py-3 bg-zinc-900/50 ${feature.status === 'soon' ? 'opacity-50' : ''}`}>
                    <FeatureRow feature={feature} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      <div className="pt-6 border-t border-zinc-800">
        <p className="text-xs text-zinc-500 text-center">
          Need more features?{' '}
          <Link href="/dashboard/billing" className="text-white hover:text-zinc-300 underline underline-offset-2">
            Upgrade your plan
          </Link>
          {' '}or{' '}
          <Link href="/contact" className="text-white hover:text-zinc-300 underline underline-offset-2">
            request a feature
          </Link>
        </p>
      </div>
    </div>
  )
}

function FeatureRow({ feature, hasLink = false }: { feature: typeof features[0]['items'][0]; hasLink?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-zinc-100">{feature.title}</h3>
          {'tier' in feature && feature.tier && feature.tier !== 'free' && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${
              feature.tier === 'visionary'
                ? 'bg-emerald-500/10 text-emerald-400'
                : feature.tier === 'singularity'
                ? 'bg-amber-500/10 text-amber-400'
                : 'bg-zinc-800 text-zinc-400'
            }`}>
              {feature.tier}
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-500 mt-1">{feature.description}</p>
      </div>
      {hasLink && (
        <span className="text-xs text-zinc-600 group-hover:text-zinc-400 transition-colors flex-shrink-0">
          →
        </span>
      )}
    </div>
  )
}
