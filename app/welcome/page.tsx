"use client"

import { useEffect, useMemo, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { track } from "@vercel/analytics"
import { useSubscription } from "@/contexts/SubscriptionContext"

type WelcomeTier = "lite" | "pro" | "agency"

const TIER_CONFIG: Record<WelcomeTier, {
  title: string
  subtitle: string
  description: string
  price: string
  gradient: string
  accent: string
}> = {
  lite: {
    title: "Protocol: SEEDLING",
    subtitle: "Growth sequence initiated.",
    description: "Launch up to 3 active projects. Unlimited generations. 5 polishes/mo.",
    price: "$9/mo",
    gradient: "from-lime-400 to-emerald-400",
    accent: "text-lime-400",
  },
  pro: {
    title: "Protocol: ARCHITECT",
    subtitle: "Full neural link established.",
    description: "Unlimited generations, ~30 polishes/mo, deploy and export anywhere.",
    price: "$29/mo",
    gradient: "from-emerald-400 to-teal-400",
    accent: "text-emerald-400",
  },
  agency: {
    title: "Protocol: DEMIURGE",
    subtitle: "Reality distortion field active.",
    description: "White-label, priority support, and fleet deployment for teams.",
    price: "$99/mo",
    gradient: "from-amber-400 to-orange-400",
    accent: "text-amber-400",
  },
}

export default function WelcomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoaded } = useUser()
  const { syncSubscription } = useSubscription()

  const urlTier = (searchParams.get("tier") || "pro").toLowerCase()
  const tier: WelcomeTier = ["lite", "pro", "agency"].includes(urlTier) ? (urlTier as WelcomeTier) : "pro"

  // Sync subscription once on mount
  useEffect(() => {
    syncSubscription().catch(() => {})
  }, [syncSubscription])

  // Track fresh signups (created within 5 minutes)
  const hasTracked = useRef(false)
  useEffect(() => {
    if (!isLoaded || !user || hasTracked.current) return
    const createdAt = user.createdAt ? new Date(user.createdAt).getTime() : 0
    const fresh = Date.now() - createdAt < 5 * 60 * 1000
    if (fresh) {
      track("Sign Up Completed", { tier, source: "welcome" })
    }
    hasTracked.current = true
  }, [isLoaded, user, tier])

  const config = useMemo(() => TIER_CONFIG[tier], [tier])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.12),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.1),transparent_45%),radial-gradient(circle_at_50%_80%,rgba(245,158,11,0.08),transparent_45%)]" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 flex flex-col items-center text-center gap-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-emerald-300"
        >
          SYSTEM: ACCESS GRANTED
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.45 }}
          className="text-4xl sm:text-5xl font-black leading-tight"
        >
          {config.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45 }}
          className={`text-lg sm:text-xl bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}
        >
          {config.subtitle}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45 }}
          className="text-zinc-400 max-w-2xl"
        >
          {config.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm font-mono text-white/80"
        >
          {config.price}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          onClick={() => router.push("/builder")}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-colors"
        >
          Enter the Builder
        </motion.button>

        <div className="text-xs text-zinc-500 font-mono">Tier: <span className={config.accent}>{tier.toUpperCase()}</span></div>
      </div>
    </div>
  )
}
