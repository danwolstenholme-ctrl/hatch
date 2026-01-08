'use client'

import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { Activity, Gauge, ServerCog, Wifi, Clock3, AlertTriangle } from 'lucide-react'

type SystemStatusProps = {
  uptime?: number
  deploySuccessRate?: number
  queueDepth?: number
  builderLoad?: number
  incidentsPast30Days?: number
  edgeLatencyMs?: number
  medianDeploySeconds?: number | null
}

type StatusMetric = {
  label: string
  value: string
  helper: string
  tone: 'good' | 'warn' | 'info'
  icon: LucideIcon
}

const toneClasses: Record<StatusMetric['tone'], string> = {
  good: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  warn: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  info: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
}

export default function SystemStatus({
  uptime = 99.982,
  deploySuccessRate = 98.6,
  queueDepth = 0,
  builderLoad = 42,
  incidentsPast30Days = 0,
  edgeLatencyMs = 185,
  medianDeploySeconds = 12,
}: SystemStatusProps) {
  // Minimal, robust rendering to avoid parser pitfalls while preserving props
  const uptimeLabel = `${Math.round(uptime)}%`
  const successLabel = `${Math.round(deploySuccessRate)}%`
  const queueLabel = queueDepth ? `${queueDepth} active` : 'Idle'

  return (
    <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/40 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-zinc-500">Stack status</p>
          <p className="text-sm font-semibold text-zinc-100">All systems stable</p>
        </div>
        <div className="text-sm font-semibold text-emerald-400">{uptimeLabel}</div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-xs text-zinc-500">
          <div className="font-semibold text-zinc-200">{successLabel}</div>
          <div className="mt-1">Deploy success</div>
        </div>
        <div className="text-xs text-zinc-500">
          <div className="font-semibold text-zinc-200">{queueLabel}</div>
          <div className="mt-1">Queue</div>
        </div>
        <div className="text-xs text-zinc-500">
          <div className="font-semibold text-zinc-200">{medianDeploySeconds ?? '—'}s</div>
          <div className="mt-1">Median deploy</div>
        </div>
      </div>
    </div>
  )
}
