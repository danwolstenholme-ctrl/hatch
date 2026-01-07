'use client'

import { motion } from 'framer-motion'
import { Settings, Check, Sparkles, Cpu, Code2, Database, ArrowRight, Home } from 'lucide-react'
import Link from 'next/link'

interface SingularitySidebarProps {
  currentSection: number
  totalSections: number
  sectionNames?: string[]
  isGenerating: boolean
  thought?: string
  projectName?: string
  onOpenSettings?: () => void
  onSignUp?: () => void
  demoMode?: boolean
}

const STACK_PILLS = [
  { icon: Code2, label: 'React 18', meta: 'Server + Client' },
  { icon: Sparkles, label: 'AI Orchestration', meta: 'Describe → Ship' },
  { icon: Cpu, label: 'Next.js 14', meta: 'App Router' },
  { icon: Database, label: 'Supabase', meta: 'Auth & Data' }
]

export default function SingularitySidebar({
  currentSection,
  totalSections,
  sectionNames,
  isGenerating,
  thought,
  projectName = 'Untitled Project',
  onOpenSettings,
  onSignUp,
  demoMode
}: SingularitySidebarProps) {
  const getSectionLabel = (index: number) => {
    if (sectionNames && sectionNames[index]) {
      return sectionNames[index].replace(/Section/i, '').trim()
    }
    return `Step ${index + 1}`
  }

  const activeLabel = getSectionLabel(Math.max(currentSection - 1, 0))

  return (
    <div className="w-72 flex flex-col h-full relative overflow-hidden">
      {/* Glass background - matches HomepageWelcome exactly */}
      <div className="absolute inset-0 bg-zinc-900/70 backdrop-blur-xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.04),transparent_60%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-zinc-700/50 to-transparent" />
      
      <div className="relative flex-1 overflow-y-auto px-5 py-6 space-y-5 scrollbar-thin">
        {/* Back to Dashboard/Home */}
        <Link
          href={demoMode ? '/' : '/dashboard'}
          className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors -mt-2 mb-2"
        >
          <Home className="w-3.5 h-3.5" />
          {demoMode ? 'Exit Demo' : 'Dashboard'}
        </Link>

        {/* Project Capsule - HomepageWelcome card style */}
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-xl" />
          <div className="absolute inset-0 border border-zinc-800/50 rounded-2xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
          
          <div className="relative p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">
                  {demoMode ? 'Sandbox Mode' : 'Active Build'}
                </p>
                <h2 className="text-base font-semibold text-zinc-200 mt-1.5 truncate">{projectName}</h2>
              </div>
              {!demoMode && (
                <div className="px-2.5 py-1 text-[10px] rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-medium shrink-0">
                  Live
                </div>
              )}
            </div>
            <p className="text-[13px] text-zinc-400 leading-relaxed">
              {thought || `Building ${activeLabel}...`}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {STACK_PILLS.map(({ icon: Icon, label, meta }) => (
                <div key={label} className="bg-zinc-900/40 border border-zinc-800/50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-300">
                    <Icon className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="font-medium truncate">{label}</span>
                  </div>
                  <p className="text-[9px] text-zinc-500 mt-0.5 truncate">{meta}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline - HomepageWelcome card style */}
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-xl" />
          <div className="absolute inset-0 border border-zinc-800/50 rounded-2xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
          
          <div className="relative p-4">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/50">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Build timeline</p>
                <p className="text-sm text-zinc-200 font-medium mt-1">{currentSection}/{totalSections} in progress</p>
              </div>
              <motion.div 
                className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2.2, repeat: Infinity }}
              />
            </div>

            <div className="relative mt-5">
              <div className="absolute left-2 top-0 bottom-0 w-px bg-zinc-800/50" />
              <div className="space-y-4 pl-6">
                {Array.from({ length: totalSections }).map((_, i) => {
                  const isActive = i === currentSection - 1
                  const isCompleted = i < currentSection - 1

                  return (
                    <div key={i} className="relative">
                      <div className={`absolute -left-6 top-1 w-3 h-3 rounded-full border ${
                        isActive ? 'border-emerald-400 bg-black' : isCompleted ? 'border-emerald-400 bg-emerald-500/30' : 'border-zinc-700 bg-zinc-900'
                      } flex items-center justify-center`}
                      >
                        {isCompleted ? <Check className="w-2 h-2 text-emerald-400" /> : null}
                        {isActive && !isCompleted && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                      </div>
                      <div className={`transition-all ${isActive ? 'text-zinc-200' : 'text-zinc-500'}`}>
                        <p className="text-sm font-medium">{getSectionLabel(i)}</p>
                        {isActive && (
                          <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-400 mt-0.5">
                            {isGenerating ? 'Building' : 'Live Editing'}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="relative p-4">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />
        
        {demoMode ? (
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-zinc-900/40" />
              <div className="absolute inset-0 border border-zinc-800/50 rounded-2xl" />
              
              <div className="relative px-4 py-3 text-center">
                <p className="text-[12px] text-zinc-400 leading-relaxed">
                  Sign up free to save your work and continue in the full builder.
                </p>
              </div>
            </div>
            
            <button
              onClick={onSignUp}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 hover:border-emerald-500/40 transition-all"
            >
              <span className="text-sm font-semibold text-zinc-100">Continue in Studio</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        ) : (
          onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 hover:border-emerald-500/30 transition-all"
            >
              <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/50">
                <Settings className="w-4 h-4 text-zinc-300" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-medium text-zinc-200">Project console</span>
                <span className="text-[11px] text-zinc-400">SEO, branding, integrations</span>
              </div>
            </button>
          )
        )}
      </div>
    </div>
  )
}
