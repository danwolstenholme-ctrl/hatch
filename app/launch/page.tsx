'use client'

import { Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Shield, Compass, Zap, LayoutDashboard, Wand2 } from 'lucide-react'

const highlightPillars = [
  {
    title: 'Immersive intro',
    body: 'Set context, show the machine, and pull them into the build without immediate friction.',
    icon: Sparkles
  },
  {
    title: 'V2 deep dive',
    body: 'Preview the evolved builder, the 9 pooled credits, and the upgrade paths at a glance.',
    icon: LayoutDashboard
  },
  {
    title: 'Credit-aware handoff',
    body: 'Carry their prompt, guardrail the 9 credits, and funnel to signup the moment they run out.',
    icon: Shield
  }
]

const steps = [
  'Step 1: Dramatic arrival',
  'Step 2: V2 walkthrough',
  'Step 3: Build with 9 credits',
  'Step 4: Review lock → signup'
]

function LaunchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isSignedIn } = useUser()
  const prompt = searchParams.get('prompt') || ''
  const upgrade = searchParams.get('upgrade') || ''

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    if (prompt) params.set('prompt', prompt)
    if (upgrade) params.set('upgrade', upgrade)
    return params.toString()
  }, [prompt, upgrade])

  const goToV2 = () => {
    const path = queryString ? `/launch/v2?${queryString}` : '/launch/v2'
    router.push(path)
  }

  const startBuilder = () => {
    const params = new URLSearchParams()
    if (prompt) params.set('prompt', prompt)
    if (!isSignedIn) params.set('mode', 'guest')
    if (upgrade) params.set('upgrade', upgrade)
    const path = params.toString() ? `/builder?${params.toString()}` : '/builder'
    router.push(path)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.08),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.08),transparent_40%),radial-gradient(circle_at_50%_80%,rgba(6,182,212,0.08),transparent_45%)]" />
      <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:50px_50px] opacity-40" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="flex items-center gap-3 text-sm text-emerald-300/80 mb-6 font-mono">
          <Shield className="w-4 h-4" />
          <span>Guest flow • Guided</span>
        </div>

        <div className="grid md:grid-cols-[1.4fr_1fr] gap-10 md:gap-14 items-start">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-5xl font-bold leading-tight mb-4"
            >
              Lead guests through the Architect before they build
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="text-lg text-zinc-400 max-w-2xl mb-8"
            >
              This path warms them up with a cinematic intro, showcases the V2 surface, then drops them into the builder with their prompt and 9 pooled credits intact.
            </motion.p>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-8">
              <button
                onClick={goToV2}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-500 text-black rounded-lg font-semibold shadow-[0_0_24px_rgba(16,185,129,0.35)] hover:bg-emerald-400 transition"
              >
                <Sparkles className="w-4 h-4" />
                Step into V2
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={startBuilder}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-zinc-800 bg-zinc-900/60 rounded-lg text-sm text-zinc-200 hover:border-emerald-500/60 transition"
              >
                <Wand2 className="w-4 h-4" />
                Skip to builder
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              {steps.map((step) => (
                <div key={step} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/70">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span className="text-zinc-200">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {highlightPillars.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * i }}
                className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                    <pillar.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{pillar.title}</h3>
                    <p className="text-sm text-zinc-400">{pillar.body}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-sm text-emerald-50">
              <div className="flex items-center gap-2 font-semibold">
                <Zap className="w-4 h-4" />
                9 pooled credits for guests
              </div>
              <p className="text-emerald-100/80 mt-1">Carry this into V2 and the builder. We lock to review the moment they are gone.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LaunchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}> 
      <LaunchContent />
    </Suspense>
  )
}
