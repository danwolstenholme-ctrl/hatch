'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Eye, Sparkles, Code2, Lock, RefreshCw, Zap, List } from 'lucide-react'

const FREE_TOTAL_CREDITS = parseInt(process.env.NEXT_PUBLIC_FREE_TOTAL_CREDITS || '9', 10)

type SavedSection = {
  sectionId: string
  code: string
  userPrompt: string
  refined?: boolean
  refinementChanges?: string[]
}

type GuestHandoff = {
  templateId?: string
  projectName?: string
  brand?: any
  sections?: SavedSection[]
}

function LaunchReviewContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isSignedIn } = useUser()
  const [handoff, setHandoff] = useState<GuestHandoff | null>(null)
  const [creditsUsed, setCreditsUsed] = useState(0)
  const [lockReason, setLockReason] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'preview' | 'blueprint' | 'next'>('preview')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('hatch_guest_handoff')
      if (stored) {
        setHandoff(JSON.parse(stored))
      }
      const used = parseInt(localStorage.getItem('hatch_guest_total') || '0')
      setCreditsUsed(Number.isFinite(used) ? used : 0)
      const persistedReason = localStorage.getItem('hatch_guest_lock_reason')
      setLockReason(persistedReason || searchParams.get('reason'))
    } catch (err) {
      console.warn('Failed to load guest handoff', err)
    }
  }, [searchParams])

  const sections = useMemo(() => handoff?.sections || [], [handoff?.sections])
  const projectName = handoff?.projectName || 'Guest Project'
  const creditsRemaining = Math.max(FREE_TOTAL_CREDITS - creditsUsed, 0)

  const clearLock = () => {
    try {
      localStorage.removeItem('hatch_guest_locked')
      localStorage.removeItem('hatch_guest_lock_reason')
    } catch (err) {
      console.warn('Failed to clear guest lock', err)
    }
  }

  const restart = () => {
    clearLock()
    router.push('/launch')
  }

  const signUp = () => {
    clearLock()
    router.push('/sign-up?upgrade=pro')
  }

  const resume = () => {
    clearLock()
    const path = isSignedIn ? '/builder' : '/launch'
    router.push(path)
  }

  const tabButton = (id: 'preview' | 'blueprint' | 'next', label: string) => (
    <button
      key={id}
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 rounded-lg border text-sm transition ${
        activeTab === id
          ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-100'
          : 'border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:border-emerald-500/30'
      }`}
    >
      {label}
    </button>
  )

  const hasData = sections.length > 0

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.08),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.08),transparent_40%),radial-gradient(circle_at_50%_80%,rgba(6,182,212,0.08),transparent_45%)]" />
      <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:46px_46px] opacity-30" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
        <div className="flex items-center justify-between mb-6">
          <button onClick={restart} className="text-sm text-zinc-400 hover:text-white inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Restart intro
          </button>
          <div className="text-xs text-emerald-300/80 font-mono flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Credits spent: {creditsUsed}/{FREE_TOTAL_CREDITS}
          </div>
        </div>

        <div className="mb-6 p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm text-emerald-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Review wall
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">{projectName}</h1>
            <p className="text-emerald-100/80 text-sm">
              {lockReason || 'Free credits are exhausted. Sign up to keep building, refining, and exporting.'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={signUp}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-semibold hover:bg-emerald-100 transition"
            >
              Upgrade & continue
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={resume}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-emerald-500/40 text-emerald-100 rounded-lg hover:border-emerald-300/60 transition"
            >
              I already signed in
            </button>
          </div>
        </div>

        <div className="flex gap-3 mb-5 flex-wrap">
          {tabButton('preview', 'Preview')}
          {tabButton('blueprint', 'Blueprint')}
          {tabButton('next', 'Next steps')}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
          {activeTab === 'preview' && (
            <div className="space-y-4">
              {hasData ? (
                sections.map((section) => (
                  <motion.div
                    key={section.sectionId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm text-emerald-200">
                        <Eye className="w-4 h-4" />
                        <span className="font-semibold uppercase tracking-wide text-xs">{section.sectionId}</span>
                      </div>
                      {section.refined && (
                        <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-200 text-[11px] border border-emerald-500/40">Polished</span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-300 mt-2">{section.userPrompt || 'Prompt unavailable'}</p>
                    <div className="mt-3 text-xs text-emerald-200/80 flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5" />
                      Credits remaining: {creditsRemaining}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  No saved sections. Start fresh and we will capture your build.
                </div>
              )}
            </div>
          )}

          {activeTab === 'blueprint' && (
            <div className="space-y-3">
              {hasData ? (
                sections.map((section) => (
                  <div key={section.sectionId} className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60">
                    <div className="flex items-center gap-2 text-sm text-emerald-200 mb-2">
                      <Code2 className="w-4 h-4" />
                      <span className="font-semibold uppercase tracking-wide text-xs">{section.sectionId}</span>
                    </div>
                    <pre className="text-xs text-zinc-200 bg-black/50 border border-zinc-800 rounded-lg p-3 overflow-x-auto max-h-48 whitespace-pre-wrap">
                      {section.code?.slice(0, 1200) || '// Code will appear here after your next build.'}
                    </pre>
                    {section.refinementChanges && section.refinementChanges.length > 0 && (
                      <div className="mt-2 text-[11px] text-emerald-200/80">
                        Changes: {section.refinementChanges.join(', ')}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <List className="w-4 h-4" />
                  We will log your sections here once you build.
                </div>
              )}
            </div>
          )}

          {activeTab === 'next' && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                <div className="text-sm text-emerald-100 flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4" />
                  Continue without limits
                </div>
                <p className="text-emerald-50/80 text-sm mb-3">
                  Sign up to unlock unlimited generations, refinements, and exports. Your captured project will migrate automatically after you log in.
                </p>
                <button
                  onClick={signUp}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-semibold hover:bg-emerald-100 transition"
                >
                  Create account
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/70">
                <div className="text-sm text-zinc-200 flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4" />
                  Other options
                </div>
                <div className="space-y-2 text-sm text-zinc-300">
                  <div className="flex items-center justify-between gap-2">
                    <span>Refresh the 9-credit trial</span>
                    <button onClick={restart} className="text-emerald-300 hover:text-emerald-200 text-xs">Restart intro</button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span>Already upgraded?</span>
                    <button onClick={resume} className="text-emerald-300 hover:text-emerald-200 text-xs">Open builder</button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span>Want a new prompt?</span>
                    <button onClick={restart} className="text-emerald-300 hover:text-emerald-200 text-xs">Start over</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LaunchReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}> 
      <LaunchReviewContent />
    </Suspense>
  )
}
