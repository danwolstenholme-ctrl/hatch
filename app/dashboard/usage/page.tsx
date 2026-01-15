'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow, format } from 'date-fns'
import { 
  Zap, 
  Folder, 
  Globe, 
  Layers,
  Clock,
  Calendar,
  TrendingUp,
  ArrowRight
} from 'lucide-react'

interface UserAnalytics {
  generations: {
    usedToday: number
    dailyLimit: number
    isUnlimited: boolean
    resetsAt: string
  }
  projects: {
    total: number
    limit: number
    deployed: number
  }
  builds: {
    totalBuilds: number
    totalSections: number
    lastBuildAt: string | null
  }
  deployments: {
    totalDeploys: number
    lastDeployAt: string | null
    activeSites: number
  }
  account: {
    tier: string
    memberSince: string
  }
}

export default function DashboardUsagePage() {
  const { isLoaded } = useUser()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) return
    
    fetch('/api/analytics')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setAnalytics(data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [isLoaded])

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-xs text-zinc-600">Loading usage data...</p>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-xs text-zinc-500">Unable to load analytics</p>
      </div>
    )
  }

  const tier = analytics.account.tier

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-lg font-medium text-white">Usage</h1>
        <p className="text-xs text-zinc-500 mt-1">Your activity and resource usage</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={<Folder className="w-4 h-4" />}
          label="Projects"
          value={analytics.projects.total}
          subtext={analytics.projects.limit === -1 ? 'Unlimited' : `of ${analytics.projects.limit}`}
        />
        <StatCard
          icon={<Globe className="w-4 h-4" />}
          label="Live Sites"
          value={analytics.deployments.activeSites}
          subtext="deployed"
          accent="emerald"
        />
        <StatCard
          icon={<Layers className="w-4 h-4" />}
          label="Sections"
          value={analytics.builds.totalSections}
          subtext="built"
        />
        <StatCard
          icon={<Zap className="w-4 h-4" />}
          label="Builds"
          value={analytics.builds.totalBuilds}
          subtext="total"
        />
      </div>

      {/* Generations (Free tier only) */}
      {!analytics.generations.isUnlimited && (
        <div>
          <h2 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">Daily Generations</h2>
          <div className="border border-zinc-800/50 rounded-lg overflow-hidden bg-zinc-900/30 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-zinc-500" />
                <div>
                  <p className="text-sm text-zinc-200">
                    {analytics.generations.usedToday} / {analytics.generations.dailyLimit} used today
                  </p>
                  <p className="text-[10px] text-zinc-600">
                    Resets at {analytics.generations.resetsAt}
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push('/dashboard/billing')}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Get unlimited →
              </button>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all"
                style={{ 
                  width: `${Math.min((analytics.generations.usedToday / analytics.generations.dailyLimit) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Activity Section */}
      <div>
        <h2 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">Activity</h2>
        <div className="border border-zinc-800/50 rounded-lg overflow-hidden divide-y divide-zinc-800/30">
          {/* Last Build */}
          <div className="p-4 flex items-center justify-between bg-zinc-900/30">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-zinc-500" />
              <div>
                <p className="text-xs text-zinc-400">Last build</p>
                <p className="text-sm text-zinc-200">
                  {analytics.builds.lastBuildAt 
                    ? formatDistanceToNow(new Date(analytics.builds.lastBuildAt), { addSuffix: true })
                    : 'No builds yet'}
                </p>
              </div>
            </div>
          </div>

          {/* Last Deploy */}
          <div className="p-4 flex items-center justify-between bg-zinc-900/30">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-zinc-500" />
              <div>
                <p className="text-xs text-zinc-400">Last deployment</p>
                <p className="text-sm text-zinc-200">
                  {analytics.deployments.lastDeployAt 
                    ? formatDistanceToNow(new Date(analytics.deployments.lastDeployAt), { addSuffix: true })
                    : 'No deployments yet'}
                </p>
              </div>
            </div>
            {tier !== 'free' && analytics.deployments.activeSites > 0 && (
              <span className="text-[10px] text-emerald-500">
                {analytics.deployments.activeSites} site{analytics.deployments.activeSites !== 1 ? 's' : ''} live
              </span>
            )}
          </div>

          {/* Member Since */}
          <div className="p-4 flex items-center justify-between bg-zinc-900/30">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-zinc-500" />
              <div>
                <p className="text-xs text-zinc-400">Member since</p>
                <p className="text-sm text-zinc-200">
                  {format(new Date(analytics.account.memberSince), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium capitalize ${
              tier === 'singularity' 
                ? 'bg-amber-500/10 text-amber-400'
                : tier === 'visionary'
                ? 'bg-emerald-500/10 text-emerald-400'
                : tier === 'architect'
                ? 'bg-zinc-800 text-zinc-300'
                : 'bg-zinc-800 text-zinc-500'
            }`}>
              {tier}
            </span>
          </div>
        </div>
      </div>

      {/* Upgrade CTA (Free tier only) */}
      {tier === 'free' && (
        <div className="border border-emerald-500/20 rounded-lg overflow-hidden bg-emerald-500/5 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-sm text-zinc-200">Ready to deploy?</p>
                <p className="text-[11px] text-zinc-500">Upgrade to publish your sites and unlock more features</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard/billing')}
              className="px-3 py-1.5 text-xs font-medium text-black bg-emerald-500 hover:bg-emerald-400 rounded transition-colors flex items-center gap-1"
            >
              Upgrade <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ 
  icon, 
  label, 
  value, 
  subtext, 
  accent 
}: { 
  icon: React.ReactNode
  label: string
  value: number
  subtext: string
  accent?: 'emerald'
}) {
  return (
    <div className="border border-zinc-800/50 rounded-lg p-3 bg-zinc-900/30">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-zinc-500">{icon}</span>
        <span className="text-[10px] text-zinc-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-xl font-semibold ${accent === 'emerald' ? 'text-emerald-400' : 'text-white'}`}>
        {value}
      </p>
      <p className="text-[10px] text-zinc-600">{subtext}</p>
    </div>
  )
}
