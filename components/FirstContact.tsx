'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Mail, MessageSquare, Rocket, Heart, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

interface FirstContactProps {
  onComplete: (prompt?: string) => void
  defaultPrompt?: string
}

const CONTACT_CARDS = [
  {
    title: 'Community (fastest)',
    desc: 'Ask or report in r/HatchIt — we reply quickly.',
    href: 'https://www.reddit.com/r/HatchIt/',
    badge: 'Best',
    tone: 'from-orange-500/15 to-red-500/15',
    border: 'border-orange-500/40',
    icon: MessageSquare,
  },
  {
    title: 'Email',
    desc: 'support@hatchit.dev',
    href: 'mailto:support@hatchit.dev',
    badge: 'Direct',
    tone: 'from-emerald-500/10 to-teal-500/10',
    border: 'border-emerald-500/30',
    icon: Mail,
  },
  {
    title: 'Feature Requests',
    desc: 'Drop ideas, vote on priorities.',
    href: 'https://www.reddit.com/r/HatchIt/',
    badge: 'Open',
    tone: 'from-violet-500/10 to-fuchsia-500/10',
    border: 'border-violet-500/30',
    icon: Heart,
  },
  {
    title: 'Bug Report',
    desc: 'If v1 hiccups, ping us. We fix fast.',
    href: 'https://www.reddit.com/r/HatchIt/',
    badge: 'Response: fast',
    tone: 'from-amber-500/10 to-orange-500/10',
    border: 'border-amber-500/30',
    icon: ShieldAlert,
  },
]

export default function FirstContact({ onComplete, defaultPrompt }: FirstContactProps) {
  const handleStart = () => {
    onComplete(defaultPrompt)
  }

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 text-white overflow-y-auto">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.08),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(124,58,237,0.1),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(6,182,212,0.08),transparent_45%)]" />

      <div className="relative max-w-3xl mx-auto px-5 sm:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="space-y-3 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            ARCHITECT // MOBILE INTRO v2
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome to Hatch v2</h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto">
            Mobile-first intro, calmer loading, same Architect speed. Skim the update then start building.
          </p>
          <a
            href="https://www.reddit.com/r/HatchIt/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-emerald-200 underline underline-offset-4"
          >
            Full v2 update (Reddit)
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>

        {/* Contact grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CONTACT_CARDS.map((card, i) => (
            <motion.a
              key={card.title}
              href={card.href}
              target={card.href.startsWith('http') ? '_blank' : undefined}
              rel={card.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className={`group relative rounded-xl border ${card.border} bg-gradient-to-br ${card.tone} p-4 flex gap-3 items-start overflow-hidden`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <div className="w-10 h-10 rounded-lg bg-zinc-900/70 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                <card.icon className="w-5 h-5 text-emerald-300" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white truncate">{card.title}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-300 border border-white/10 whitespace-nowrap">{card.badge}</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{card.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-300 transition-colors" />
            </motion.a>
          ))}
        </div>

        {/* CTA */}
        <div className="space-y-3 text-center">
          <motion.button
            onClick={handleStart}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 font-semibold shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-400 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Start building
            <ArrowRight className="w-4 h-4" />
          </motion.button>
          <div className="text-xs text-zinc-500">
            Prefer details first? <Link href="/contact" className="text-emerald-300 hover:text-emerald-200 underline underline-offset-4">Visit the full contact page</Link>.
          </div>
        </div>
      </div>
    </div>
  )
}
