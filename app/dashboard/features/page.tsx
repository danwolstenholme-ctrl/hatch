'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  Layers, 
  Rocket, 
  Globe, 
  Palette, 
  Eye, 
  Terminal, 
  Sparkles,
  GitBranch,
  Download,
  Zap,
  Shield,
  Code2,
  RefreshCw,
  Brain
} from 'lucide-react'

const features = [
  {
    category: 'Build',
    items: [
      {
        icon: Sparkles,
        title: 'AI Generation',
        description: 'Claude Sonnet powers intelligent section generation with context-aware design.',
        status: 'active',
        link: '/builder'
      },
      {
        icon: Eye,
        title: 'Live Preview',
        description: 'See your site update in real-time as you build each section.',
        status: 'active',
        link: '/builder'
      },
      {
        icon: Layers,
        title: 'Component Library',
        description: 'Pre-built patterns ensure consistent, professional output.',
        status: 'active'
      },
      {
        icon: Palette,
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
        icon: Rocket,
        title: 'One-Click Deploy',
        description: 'Deploy to hatchitsites.dev with a single click.',
        status: 'active',
        tier: 'architect'
      },
      {
        icon: GitBranch,
        title: 'GitHub Push',
        description: 'Push your code directly to your GitHub repository.',
        status: 'active',
        tier: 'architect',
        link: '/dashboard/settings'
      },
      {
        icon: Download,
        title: 'Export ZIP',
        description: 'Download your complete Next.js project.',
        status: 'active',
        tier: 'architect'
      },
      {
        icon: Globe,
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
        icon: Brain,
        title: 'Session Insights',
        description: 'Analysis of your build patterns and suggestions.',
        status: 'active',
        tier: 'free'
      },
      {
        icon: Terminal,
        title: 'Code Audit',
        description: 'Quality check that optimizes generated code.',
        status: 'active',
        tier: 'visionary'
      },
      {
        icon: RefreshCw,
        title: 'Auto-Fix',
        description: 'Automatic error detection and repair.',
        status: 'active',
        tier: 'visionary'
      },
      {
        icon: Zap,
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
        icon: Code2,
        title: 'API Access',
        description: 'Programmatic access to the build system.',
        status: 'soon',
        tier: 'singularity'
      },
      {
        icon: Shield,
        title: 'Team Workspaces',
        description: 'Collaborate with your team on projects.',
        status: 'soon',
        tier: 'singularity'
      }
    ]
  }
]

const tierColors = {
  free: 'text-zinc-400',
  architect: 'text-zinc-300',
  visionary: 'text-emerald-400',
  singularity: 'text-amber-400'
}

export default function DashboardFeaturesPage() {
  return (
    <div className="space-y-8">
      {features.map((section, sectionIndex) => (
        <div key={section.category}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">{section.category}</span>
            {section.category === 'Coming Soon' && (
              <span className="text-[9px] px-1.5 py-0.5 bg-zinc-800 text-zinc-500 rounded">ROADMAP</span>
            )}
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {section.items.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (sectionIndex * 0.1) + (index * 0.05) }}
              >
                {feature.link ? (
                  <Link
                    href={feature.link}
                    className="block p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-emerald-500/30 hover:bg-zinc-900/80 transition-all group"
                  >
                    <FeatureContent feature={feature} />
                  </Link>
                ) : (
                  <div className={`p-3 rounded-lg bg-zinc-900 border border-zinc-800 ${feature.status === 'soon' ? 'opacity-60' : ''}`}>
                    <FeatureContent feature={feature} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      <div className="pt-4 border-t border-zinc-800">
        <p className="text-[11px] text-zinc-500 text-center">
          Need more features?{' '}
          <Link href="/dashboard/billing" className="text-emerald-400 hover:text-emerald-300">
            Upgrade your plan
          </Link>
          {' '}or{' '}
          <Link href="/contact" className="text-emerald-400 hover:text-emerald-300">
            request a feature
          </Link>
        </p>
      </div>
    </div>
  )
}

function FeatureContent({ feature }: { feature: typeof features[0]['items'][0] }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${
        feature.status === 'soon' ? 'bg-zinc-800' : 'bg-zinc-800/80 border border-zinc-700/50'
      }`}>
        <feature.icon className={`w-4 h-4 ${
          feature.status === 'soon' ? 'text-zinc-600' : 'text-emerald-500'
        }`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-medium text-zinc-100">{feature.title}</h3>
          {'tier' in feature && feature.tier && feature.tier !== 'free' && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded ${
              feature.tier === 'visionary' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : feature.tier === 'singularity'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-zinc-800 text-zinc-400'
            }`}>
              {feature.tier}
            </span>
          )}
          {'link' in feature && feature.link && (
            <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all ml-auto" />
          )}
        </div>
        <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{feature.description}</p>
      </div>
    </div>
  )
}
