'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight, Sparkles, Rocket, Shield, Wand2, Zap, ShoppingBag, Loader2 } from 'lucide-react'

interface SubscriptionState {
  tier: 'architect' | 'visionary' | 'singularity' | null
  status: string | null
  synced: boolean
  message?: string
}

function PostPaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoaded } = useUser()
  const [subState, setSubState] = useState<SubscriptionState>({ tier: null, status: null, synced: false })
  const [isSyncing, setIsSyncing] = useState(false)
  const [isLaunchingPack, setIsLaunchingPack] = useState(false)
  const tierParam = searchParams.get('tier') as 'architect' | 'visionary' | 'singularity' | null
  const projectSlug = searchParams.get('project') || undefined
  const launchPackStatus = searchParams.get('launch_pack')

  const tier = useMemo(() => {
    if (tierParam) return tierParam
    const meta = user?.publicMetadata?.accountSubscription as { tier?: 'architect' | 'visionary' | 'singularity'; status?: string } | undefined
    return meta?.tier || null
  }, [tierParam, user?.publicMetadata])

  const actions = [
    {
      title: 'Open the Builder',
      body: 'Jump back into your project. Guest progress will auto-import after login.',
      cta: 'Open Builder',
      onClick: () => {
        const qs = new URLSearchParams()
        if (projectSlug) qs.set('project', projectSlug)
        router.push(`/builder${qs.toString() ? `?${qs.toString()}` : ''}`)
      },
      icon: Rocket,
    },
    {
      title: 'Deploy & Secure',
      body: 'Ship to the edge and wire up your domain. Zero-code deploy with SSL and preview links.',
      cta: 'Go to Deploy',
      onClick: () => router.push('/builder?step=deploy'),
      icon: Shield,
    },
    {
      title: 'Polish & Dream',
      body: 'Use AI to polish and evolve your site. Credits reset monthly.',
      cta: 'Refine now',
      onClick: () => router.push('/builder?step=refine'),
      icon: Wand2,
    },
  ]

  const syncSubscription = async () => {
    setIsSyncing(true)
    try {
      const res = await fetch('/api/subscription/sync', { cache: 'no-store' })
      const data = await res.json()
      setSubState({
        tier: data?.subscription?.tier || tier || null,
        status: data?.subscription?.status || null,
        synced: !!data?.synced,
        message: data?.message,
      })
    } catch (err) {
      console.error('Sync failed', err)
      setSubState({ tier: tier || null, status: null, synced: false, message: 'Sync failed' })
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    if (!isLoaded) return
    syncSubscription()
  }, [isLoaded])

  const startLaunchPackCheckout = async () => {
    setIsLaunchingPack(true)
    try {
      const res = await fetch('/api/launch-pack', { method: 'POST' })
      const data = await res.json()
      if (data?.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Launch pack error', err)
    } finally {
      setIsLaunchingPack(false)
    }
  }

  const tierCopy = {
    architect: {
      badge: 'Architect activated',
      perks: ['Unlimited generations', '5 AI polishes / month', '3 active projects'],
    },
    visionary: {
      badge: 'Visionary activated',
      perks: ['Unlimited generations', '~30 AI polishes / month', 'Custom domains', 'Remove branding'],
    },
    singularity: {
      badge: 'Singularity activated',
      perks: ['Unlimited everything', 'White-label', 'Priority support'],
    },
    null: {
      badge: 'Subscription synced',
      perks: ['Your account is updated'],
    },
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden selection:bg-emerald-500/30">
      {/* Ambient void background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPC9zdmc+')] opacity-20 mix-blend-overlay" />

      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-emerald-300/80 font-mono">
            <CheckCircle2 className="w-4 h-4" />
            {subState.synced ? 'Payment confirmed — access granted' : 'Syncing access'}
          </div>
          <button
            onClick={syncSubscription}
            className="text-xs px-3 py-1 rounded border border-emerald-500/40 text-emerald-100 hover:border-emerald-300/70 flex items-center gap-2"
          >
            {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Sync status
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="p-6 sm:p-8 rounded-sm border border-white/10 bg-white/5 shadow-[0_0_50px_rgba(16,185,129,0.18)]"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-100 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                {tierCopy[tier || 'null']?.badge || 'Access granted'}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">Welcome to the Command Center</h1>
              <p className="text-zinc-200/80 text-sm sm:text-base max-w-2xl">
                Payments synced. We carried over your guest work and cleared the runway. Pick your next move below.
              </p>
              {launchPackStatus === 'success' && (
                <div className="mt-3 text-sm text-emerald-100 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Launch Pack confirmed — assets will be attached to your account.
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 text-sm text-emerald-100">
              {(tierCopy[tier || 'null']?.perks || []).map(perk => (
                <div key={perk} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{perk}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 mt-8">
          {actions.map(action => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              className="p-5 rounded-sm border border-white/10 bg-white/5"
            >
              <div className="flex items-center gap-2 text-sm text-emerald-200 mb-2">
                <action.icon className="w-4 h-4" />
                {action.title}
              </div>
              <p className="text-sm text-zinc-300 mb-3">{action.body}</p>
              <button
                onClick={action.onClick}
                className="inline-flex items-center gap-2 text-emerald-200 hover:text-white text-sm"
              >
                {action.cta}
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 grid md:grid-cols-[1.2fr_1fr] gap-5">
          <div className="p-6 rounded-sm border border-white/10 bg-white/5">
            <div className="flex items-center gap-2 text-sm text-emerald-200 mb-3">
              <Zap className="w-4 h-4" />
              Post-purchase autopilot
            </div>
            <ul className="space-y-3 text-sm text-zinc-200">
              <li>• Import guest build automatically once you open the builder.</li>
              <li>• Run a polish/dream to personalize before sharing preview links.</li>
              <li>• Add a domain and deploy from the Deploy tab; SSL auto-provisioned.</li>
              <li>• Exports stay unlocked; code sovereignty remains yours.</li>
            </ul>
          </div>

          <div className="p-6 rounded-sm border border-white/10 bg-white/5">
            <div className="flex items-center gap-2 text-sm text-emerald-100 mb-2">
              <ShoppingBag className="w-4 h-4" />
              Launch Pack (one-time)
            </div>
            <p className="text-sm text-emerald-50/85 mb-3">Brand assets, copy polish, and a launch checklist. Perfect for your first live push.</p>
            <button
              onClick={startLaunchPackCheckout}
              disabled={isLaunchingPack}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-zinc-950 rounded-sm font-semibold hover:bg-emerald-400 transition disabled:opacity-60"
            >
              {isLaunchingPack ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Purchase $199
            </button>
            <p className="text-xs text-emerald-100/70 mt-2">One-time. Delivered to your account email.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PostPaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}> 
      <PostPaymentContent />
    </Suspense>
  )
}
