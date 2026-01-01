'use client'

import { motion } from 'framer-motion'
import { Terminal, GitCommit, Tag, Calendar, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const changes = [
  {
    version: '1.5.1',
    date: '2026-01-01',
    title: 'Preview Stability Hardening',
    items: [
      'SectionPreview now uses Babel for transformation and injects full Next.js/Framer/Lucide stubs with var to avoid redeclaration crashes.',
      'LivePreview and BuildFlowController stubs synchronized: added useRouter/navigation stubs, head/script/font stubs, CSS import no-ops, and synchronous script exposure to prevent race conditions.',
      'Added CODEX_TASK_PREVIEW_STABILITY.md to codify required stub coverage and error-handling rules for preview engines.'
    ]
  },
  {
    version: '1.5.0',
    date: '2026-01-01',
    title: 'The Singularity Brand & Freemium Pivot',
    items: [
      'Brand Unification: Established "The Definitive HatchIt" (Emerald Egg) as the primary logo and "The Architect" (Violet Cube) as the AI persona.',
      'Visual Identity: Updated all site headers, favicons, and social assets to match the new V3 "Hatching" aesthetic.',
      'Business Model: Pivoted to Freemium. Free users can build/preview; Paid users (Pro/Agency) can export/deploy.',
      'Engine Upgrade: Switched Builder Engine from Claude 3.5 Sonnet to GPT-5.1-Codex-Max (OpenAI).',
      'Infrastructure: Configured Local Sandbox for full Stripe Test Mode simulation (Sign Up -> Build -> Upgrade).',
      'Maintenance: Added <MaintenanceOverlay /> to lock production builder during the engine upgrade (bypassed in local dev).'
    ]
  },
  {
    version: '1.4.0',
    date: '2026-01-01',
    title: 'The "Ultra Audit" & Marketing Launch',
    items: [
      'Performance: Lazy-loaded @babel/standalone to reduce initial bundle size and improve TTI (Time to Interactive).',
      'Optimization: Refactored TheSubconscious to remove expensive mousemove event listeners, saving user battery life.',
      'Analytics: Integrated Google Analytics 4 (@next/third-parties) with IP-blocking logic to exclude the Founder\'s traffic.',
      'Security: Updated Permissions-Policy in next.config.ts to allow Microphone access (fixing Voice Input).',
      'Marketing: Created high-fidelity SVG assets for Reddit Ads (Desktop, Mobile, Short).',
      'Strategy: Finalized GOOGLE_ADS_READY.md and REDDIT_ORGANIC_POSTS.md for the Jan 1st launch.'
    ]
  },
  {
    version: '1.3.0',
    date: '2025-12-31',
    title: 'The Engineer\'s Update',
    items: [
      'Core User Journey Audit: Fixed critical breaks in onboarding, dashboard, and builder initialization.',
      'Onboarding Persistence: User data is now saved and correctly hydrates the builder.',
      'Dashboard Actions: Added "New Project" and "Continue Setup" flows.',
      'Robust Preview: Rewrote regex engine to handle complex AI-generated code without crashing.',
      'System Stability: Verified deployment and export pipelines.'
    ]
  },
  {
    version: '1.2.1',
    date: '2025-12-28',
    title: 'Fixed',
    items: [
      'Contact page generation: AI now generates working contact forms that render in preview',
      'Forms use client-side state with visual feedback instead of form actions that break preview',
      'Better TypeScript type stripping (React.FormEvent, ChangeEvent, etc.)'
    ]
  },
  {
    version: '1.2.0',
    date: '2025-12-28',
    title: 'Added',
    items: [
      'Required project naming: New projects must be named (no more random names)',
      'Welcome Back modal: Shows on new device when you have cloud projects, auto-pulls paid projects',
      'Sync from Cloud button: Always accessible in menu to pull deployed projects'
    ]
  }
]

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-emerald-500/30">
      <Navigation />
      
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-16 relative">
            <div className="absolute -left-12 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent hidden md:block" />
            
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-zinc-500 hover:text-emerald-400 transition-colors mb-8 text-sm font-mono group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Return to Base</span>
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <GitCommit className="w-6 h-6 text-emerald-500" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                System <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Changelog</span>
              </h1>
            </motion.div>
            
            <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
              The Architect is constantly evolving. Track the latest updates, engine upgrades, and system optimizations here.
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-12 relative">
            {/* Vertical Line */}
            <div className="absolute left-0 md:left-6 top-4 bottom-0 w-px bg-zinc-800/50 hidden md:block" />

            {changes.map((change, index) => (
              <motion.div
                key={change.version}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-0 md:pl-20"
              >
                {/* Node */}
                <div className="absolute left-4 top-2 w-4 h-4 rounded-full bg-zinc-950 border-2 border-emerald-500/50 hidden md:block z-10">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-pulse" />
                </div>

                <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-6 md:p-8 hover:border-emerald-500/20 transition-colors group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-sm font-medium flex items-center gap-2">
                        <Tag className="w-3 h-3" />
                        v{change.version}
                      </div>
                      <div className="text-zinc-500 text-sm font-mono flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {change.date}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors">
                    {change.title}
                  </h3>

                  <ul className="space-y-3">
                    {change.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-zinc-400 leading-relaxed">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-zinc-700 flex-shrink-0 group-hover:bg-emerald-500/50 transition-colors" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
