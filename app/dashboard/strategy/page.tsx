'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, CheckCircle2, Circle, Rocket, Target, TrendingUp } from 'lucide-react'

export default function StrategyPage() {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header - stacks on mobile */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-mono font-bold text-zinc-100">GTM Plan</h1>
          <p className="text-zinc-400 text-xs md:text-sm mt-1">Tactical roadmap for market penetration.</p>
        </div>
        <div className="flex items-center gap-3 px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg">
          <p className="text-[10px] md:text-xs font-mono text-zinc-500">LAUNCH</p>
          <p className="font-mono font-bold text-emerald-400 text-sm md:text-base">T-30 DAYS</p>
        </div>
      </div>

      {/* KPI Cards - horizontal scroll on mobile */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3">
        <MetricCard label="Signups" value="1,500" target="2,000" progress={75} />
        <MetricCard label="Conv Rate" value="2.4%" target="3.5%" progress={68} />
        <MetricCard label="CAC" value="$12.50" target="$10" progress={80} inverse />
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        <TimelineItem 
          day="01-05"
          title="Foundation"
          description="Establish digital footprint and core messaging."
          status="completed"
          tasks={[
            "Deploy landing page v1.0",
            "Setup social media",
            "Configure analytics"
          ]}
        />

        <TimelineItem 
          day="06-15"
          title="Awareness"
          description="Initial outreach to early adopters."
          status="active"
          tasks={[
            "Launch content marketing",
            "Engage niche communities",
            "Run targeted ads"
          ]}
        />

        <TimelineItem 
          day="16-25"
          title="Conversion"
          description="Refine funnel based on data."
          status="pending"
          tasks={[
            "A/B test value props",
            "Email nurture sequence",
            "Optimize checkout"
          ]}
        />

        <TimelineItem 
          day="26-30"
          title="Launch"
          description="Full-scale public release."
          status="pending"
          tasks={[
            "Press release",
            "Product Hunt",
            "Influencer activation"
          ]}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 md:p-6">
        <div className="flex items-center gap-2 mb-3 md:mb-4">
          <Rocket className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
          <h3 className="font-mono font-bold text-sm md:text-base">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
          <button className="py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] border border-zinc-700 rounded-md text-xs md:text-sm font-mono text-left transition-all">
            Draft Press Release
          </button>
          <button className="py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] border border-zinc-700 rounded-md text-xs md:text-sm font-mono text-left transition-all">
            Schedule Posts
          </button>
          <button className="py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] border border-zinc-700 rounded-md text-xs md:text-sm font-mono text-left transition-all">
            Review Ads
          </button>
        </div>
      </div>
    </div>
  )
}

function TimelineItem({ day, title, description, status, tasks }: { day: string; title: string; description: string; status: 'completed' | 'active' | 'pending'; tasks: string[] }) {
  const isCompleted = status === 'completed'
  const isActive = status === 'active'

  return (
    <div className={`p-4 md:p-5 bg-zinc-900/50 border rounded-lg transition-colors ${
      isActive ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-zinc-800'
    }`}>
      <div className="flex items-start gap-3">
        {/* Status icon */}
        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center shrink-0 ${
          isCompleted ? 'border-emerald-500/30 bg-emerald-500/10' : 
          isActive ? 'border-emerald-500 bg-emerald-500/20' : 
          'border-zinc-700 bg-zinc-800'
        }`}>
          {isCompleted ? (
            <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
          ) : isActive ? (
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-emerald-500 rounded-full animate-pulse" />
          ) : (
            <Circle className="w-4 h-4 md:w-5 md:h-5 text-zinc-600" />
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`font-mono text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded ${
              isActive ? 'bg-emerald-500/20 text-emerald-400' : 
              isCompleted ? 'bg-zinc-800 text-emerald-500' : 
              'bg-zinc-800 text-zinc-500'
            }`}>
              D{day}
            </span>
            <h3 className="text-sm md:text-base font-bold font-mono text-zinc-100">{title}</h3>
          </div>
          <p className="text-xs md:text-sm text-zinc-400 mb-3">{description}</p>
          
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {tasks.map((task, i) => (
              <span key={i} className={`text-[10px] md:text-xs px-2 py-1 rounded-full ${
                isCompleted ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {task}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, target, progress, inverse }: { label: string; value: string; target: string; progress: number; inverse?: boolean }) {
  return (
    <div className="min-w-[140px] md:min-w-0 p-3 md:p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
      <p className="text-[10px] md:text-xs text-zinc-500 mb-1">{label}</p>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-lg md:text-xl font-mono font-bold text-zinc-100">{value}</span>
        <span className="text-[10px] md:text-xs text-zinc-600">/ {target}</span>
      </div>
      <div className="h-1.5 md:h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${inverse ? 'bg-amber-500' : 'bg-emerald-500'}`} 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
