'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Eye, Brain, Sparkles, Zap, Activity, Lock } from 'lucide-react'

interface SingularitySidebarProps {
  currentSection: number
  totalSections: number
  isGenerating: boolean
  thought?: string
  promptsUsed: number
  promptsLimit: number
  isPaid: boolean
  onUpgrade?: () => void
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
    logs.push('[NEURAL] Synthesizing component structure...')
    logs.push('[VISUAL] Generating layout patterns...')
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
  onUpgrade
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

  const promptsRemaining = promptsLimit - promptsUsed
  const isRunningLow = !isPaid && promptsRemaining <= 2 && promptsRemaining > 0
  const isAtLimit = !isPaid && promptsRemaining <= 0

  return (
    <div className="w-72 border-r border-zinc-800/50 bg-black/40 backdrop-blur-sm flex flex-col font-mono text-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800/50">
        <div className="flex items-center gap-2 text-emerald-400">
          <Brain className="w-4 h-4" />
          <span className="uppercase tracking-wider font-semibold">Singularity</span>
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
      <div className="p-4 border-t border-zinc-800/50">
        {!isPaid ? (
          <div className={`p-3 rounded-lg border ${
            isAtLimit 
              ? 'bg-red-500/10 border-red-500/30' 
              : isRunningLow 
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-zinc-900/50 border-zinc-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Prompts</span>
              <span className={`text-sm font-bold ${
                isAtLimit ? 'text-red-400' : isRunningLow ? 'text-amber-400' : 'text-white'
              }`}>
                {promptsRemaining} / {promptsLimit}
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-3">
              <div 
                className={`h-full transition-all ${
                  isAtLimit ? 'bg-red-500' : isRunningLow ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.max(0, (promptsRemaining / promptsLimit) * 100)}%` }}
              />
            </div>
            
            {(isAtLimit || isRunningLow) && (
              <button
                onClick={onUpgrade}
                className={`w-full py-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  isAtLimit 
                    ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                    : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                }`}
              >
                {isAtLimit ? <Lock className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                {isAtLimit ? 'Unlock to continue' : 'Running low'}
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-emerald-400">
            <Activity className="w-3 h-3" />
            <span className="text-[10px] uppercase tracking-wider">Unlimited</span>
          </div>
        )}
      </div>
    </div>
  )
}
