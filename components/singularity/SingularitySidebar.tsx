'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Eye, Brain, Sparkles, Zap, Activity, Lock, Settings } from 'lucide-react'
import ArchitectLogo from './ArchitectLogo'

interface SingularitySidebarProps {
  currentSection: number
  totalSections: number
  isGenerating: boolean
  thought?: string
  promptsUsed: number
  promptsLimit: number
  isPaid: boolean
  onUpgrade?: () => void
  onOpenSettings?: () => void
}

// Live system log messages based on state
const getSystemLogs = (isGenerating: boolean, currentSection: number, promptsUsed: number) => {
  const logs: string[] = []
  
  if (promptsUsed === 0) {
    logs.push('[SYSTEM] Awaiting first instruction...')
  } else {
    logs.push(`[SYSTEM] ${promptsUsed} generation${promptsUsed > 1 ? 's' : ''} processed`)
  }
  
  if (isGenerating) {
    logs.push('[BUILDER] Synthesizing component structure...')
    logs.push('[LAYOUT] Generating layout patterns...')
  } else {
    logs.push(`[STATUS] Section ${currentSection} active`)
    logs.push('[READY] Awaiting input...')
  }
  
  return logs
}

export default function SingularitySidebar({
  currentSection,
  totalSections,
  isGenerating,
  thought,
  promptsUsed,
  promptsLimit,
  isPaid,
  onUpgrade,
  onOpenSettings
}: SingularitySidebarProps) {
  const [logs, setLogs] = useState<string[]>([])
  const [displayThought, setDisplayThought] = useState(thought || 'Observing...')
  const logsRef = useRef<HTMLDivElement>(null)

  // Update logs based on state changes
  useEffect(() => {
    const newLogs = getSystemLogs(isGenerating, currentSection, promptsUsed)
    setLogs(prev => [...newLogs, ...prev].slice(0, 20))
  }, [isGenerating, currentSection, promptsUsed])

  // Update thought with typing effect
  useEffect(() => {
    if (thought && thought !== displayThought) {
      setDisplayThought(thought)
    }
  }, [thought, displayThought])

  const promptsRemaining = promptsLimit < 0 ? Infinity : promptsLimit - promptsUsed
  const isUnlimited = promptsLimit < 0
  const isRunningLow = !isPaid && !isUnlimited && promptsRemaining <= 2 && promptsRemaining > 0
  const isAtLimit = !isPaid && !isUnlimited && promptsRemaining <= 0

  return (
    <div className="w-72 border-r border-zinc-800/50 bg-black/40 backdrop-blur-sm flex flex-col font-mono text-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <ArchitectLogo className="w-6 h-6" />
          <span className="uppercase tracking-wider font-bold text-white">HatchIt</span>
        </div>
      </div>

      {/* Status */}
      <div className="p-4 border-b border-zinc-800/50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Status</span>
          <span className={`flex items-center gap-1.5 ${isGenerating ? 'text-amber-400' : 'text-emerald-400'}`}>
            {isGenerating ? (
              <>
                <Sparkles className="w-3 h-3 animate-spin" />
                Generating
              </>
            ) : (
              <>
                <Eye className="w-3 h-3" />
                Ready
              </>
            )}
          </span>
        </div>
        
        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-zinc-500">Progress</span>
            <span className="text-zinc-400">{currentSection} / {totalSections}</span>
          </div>
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-emerald-500/50"
              initial={{ width: 0 }}
              animate={{ width: `${(currentSection / totalSections) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Current Thought */}
      <div className="p-4 border-b border-zinc-800/50">
        <span className="text-zinc-500 uppercase tracking-wider text-[10px] block mb-2">Thought</span>
        <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
          <p className="text-emerald-400/80 text-[11px] leading-relaxed italic">
            "{displayThought}"
          </p>
        </div>
      </div>

      {/* System Logs */}
      <div className="flex-1 p-4 overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <Terminal className="w-3 h-3 text-zinc-500" />
          <span className="text-zinc-500 uppercase tracking-wider text-[10px]">System</span>
        </div>
        <div 
          ref={logsRef}
          className="flex-1 bg-black/50 border border-zinc-800/50 rounded-lg p-2 overflow-y-auto"
        >
          <AnimatePresence mode="popLayout">
            {logs.map((log, i) => (
              <motion.div
                key={`${log}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-[10px] text-zinc-500 py-0.5 border-b border-zinc-900/50 last:border-0"
              >
                {log}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Prompts Counter / Upgrade */}
      <div className="p-4 border-t border-zinc-800/50 space-y-3">
        {/* Always show unlimited now - The Architect's gift */}
        <div className="flex items-center gap-2 text-emerald-400">
          <Activity className="w-3 h-3" />
          <span className="text-[10px] uppercase tracking-wider">Unlimited Generations</span>
        </div>

        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center justify-center gap-2 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-zinc-400 hover:text-white transition-colors text-[10px] uppercase tracking-wider"
          >
            <Settings className="w-3 h-3" />
            Site Settings
          </button>
        )}
      </div>
    </div>
  )
}
