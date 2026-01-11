'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Rocket, CheckCircle2, Clock, ChevronDown, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

// =============================================================================
// ROADMAP PAGE - Clean HatchIt brand, no terminal aesthetic
// =============================================================================

interface RoadmapItem {
  title: string
  description: string
  status: 'shipped' | 'building' | 'planned'
  date?: string
  details?: string
}

interface RoadmapSection {
  quarter: string
  title: string
  items: RoadmapItem[]
}

const roadmap: RoadmapSection[] = [
  {
    quarter: 'Now',
    title: 'Recently Shipped',
    items: [
      {
        title: 'Device Preview Toggle',
        description: 'Phone, tablet, and desktop preview buttons in the builder.',
        status: 'shipped',
        date: 'Jan 2026',
        details: 'See how your site looks at 375px, 768px, or full width. Click the device buttons in the preview header.'
      },
      {
        title: '5-Step Project Wizard',
        description: 'Guided setup: Info, Brand, Homepage, Pages, Review.',
        status: 'shipped',
        date: 'Jan 2026',
        details: 'Plan your entire site structure before building. Pick your pages, choose your sections, set your brand. Then build with confidence.'
      },
      {
        title: 'Multi-Page Sites',
        description: 'Add About, Services, Pricing, Contact, FAQ, and Portfolio pages.',
        status: 'shipped',
        date: 'Jan 2026',
        details: 'Each page comes with preset sections. Build a complete site, not just a landing page.'
      },
      {
        title: 'AI Prompt Helper',
        description: 'Get help writing better prompts for each section.',
        status: 'shipped',
        date: 'Dec 2025',
        details: 'Click the sparkle icon and describe what you want. The helper rewrites your prompt to get better results from the builder.'
      },
    ]
  },
  {
    quarter: 'Q1 2026',
    title: 'Coming Soon',
    items: [
      {
        title: 'Website Cloner',
        description: 'Paste any URL and rebuild it with your branding.',
        status: 'building',
        details: 'Analyze existing websites and recreate them in your stack. Great for "I want something like this" moments.'
      },
      {
        title: 'Custom Domains',
        description: 'Connect your own domain to deployed sites.',
        status: 'building',
        details: 'Currently sites deploy to hatchit.dev subdomains. Soon you\'ll connect your own domain with automatic SSL.'
      },
      {
        title: 'Visual Editor',
        description: 'Click and drag to adjust layouts.',
        status: 'planned',
        details: 'Move sections around, resize elements, tweak spacing without touching code. AI-generated, human-refined.'
      },
    ]
  },
  {
    quarter: 'Q2 2026',
    title: 'On the Horizon',
    items: [
      {
        title: 'Backend Generation',
        description: 'Generate API routes, database schemas, and auth flows.',
        status: 'planned',
        details: 'Describe your app\'s data model and get working Supabase schemas, API endpoints, and authentication.'
      },
      {
        title: 'Component Library',
        description: 'Save and reuse your favorite generated sections.',
        status: 'planned',
        details: 'Build once, use everywhere. Create your own library of components.'
      },
      {
        title: 'Team Collaboration',
        description: 'Work together on projects.',
        status: 'planned',
        details: 'Invite team members, share projects, and build together.'
      },
    ]
  },
]

const statusConfig = {
  shipped: {
    label: 'Shipped',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    icon: CheckCircle2,
    dot: 'bg-emerald-500'
  },
  building: {
    label: 'Building',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    icon: Sparkles,
    dot: 'bg-amber-500 animate-pulse'
  },
  planned: {
    label: 'Planned',
    bg: 'bg-zinc-500/10',
    text: 'text-zinc-400',
    border: 'border-zinc-500/20',
    icon: Clock,
    dot: 'bg-zinc-600'
  }
}

function RoadmapCard({ item }: { item: RoadmapItem }) {
  const [expanded, setExpanded] = useState(false)
  const config = statusConfig[item.status]
  const hasDetails = !!item.details
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative rounded-2xl border bg-zinc-900/50 backdrop-blur-sm transition-all ${
        hasDetails ? 'cursor-pointer hover:bg-zinc-900/80' : ''
      } ${expanded ? 'border-white/20' : 'border-white/10'}`}
      onClick={() => hasDetails && setExpanded(!expanded)}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="font-semibold text-white">{item.title}</h3>
              {hasDetails && (
                <motion.span
                  className="text-zinc-500"
                  animate={{ rotate: expanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.span>
              )}
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">{item.description}</p>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border} shrink-0`}>
            <Icon className="w-3.5 h-3.5" />
            {config.label}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && item.details && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              <div className="pt-4 border-t border-white/5">
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {item.details}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-emerald-500/30">
      <Navigation />

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-zinc-400 mb-8"
          >
            <Rocket className="w-4 h-4 text-emerald-400" />
            Product Roadmap
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
          >
            What we&apos;re <span className="text-emerald-400">building</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-zinc-400 max-w-2xl mx-auto"
          >
            A transparent look at what&apos;s shipped, what&apos;s in progress, and what&apos;s coming next. 
            We ship fast and often.
          </motion.p>
        </div>
      </section>

      {/* Roadmap Content */}
      <main className="px-4 pb-32">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-16">
            {roadmap.map((section, sectionIndex) => (
              <motion.section
                key={section.quarter}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ delay: sectionIndex * 0.1 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-sm font-semibold text-emerald-400">{section.quarter}</span>
                  </div>
                  <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                </div>

                <div className="space-y-4">
                  {section.items.map((item) => (
                    <RoadmapCard key={item.title} item={item} />
                  ))}
                </div>
              </motion.section>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <p className="text-zinc-400 mb-4">Have a feature request?</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              Send us your ideas
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
