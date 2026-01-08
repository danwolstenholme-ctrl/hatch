'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildProgress, BuildStage } from '@/lib/build-progress'

/**
 * BUILD PROGRESS DISPLAY
 * ----------------------
 * Terminal-style build progress. Clean, infrastructure-focused.
 */

const STAGE_CONFIG: Record<BuildStage, { label: string }> = {
  idle: { label: 'ready' },
  analyzing: { label: 'analyzing prompt' },
  structuring: { label: 'structuring layout' },
  generating: { label: 'generating code' },
  styling: { label: 'applying styles' },
  optimizing: { label: 'optimizing' },
  complete: { label: 'complete' },
}

export default function BuildProgressDisplay() {
  const [stage, setStage] = useState<BuildStage>('analyzing')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const startTimeRef = useRef(Date.now())

  useEffect(() => {
    startTimeRef.current = Date.now()
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleProgress = (update: { stage: BuildStage; message: string }) => {
      setStage(update.stage)
      setLogs(prev => [...prev.slice(-8), STAGE_CONFIG[update.stage].label])
    }

    buildProgress.on('progress', handleProgress)
    buildProgress.startBuild()

    return () => {
      buildProgress.off('progress', handleProgress)
      buildProgress.reset()
    }
  }, [])

  const getProgress = () => {
    const stages: BuildStage[] = ['analyzing', 'structuring', 'generating', 'styling', 'optimizing', 'complete']
    const index = stages.indexOf(stage)
    return Math.min(((index + 1) / stages.length) * 100, 95)
  }

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
        {/* Terminal header */}
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border-b border-zinc-800">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          </div>
          <span className="text-xs text-zinc-500 font-mono ml-2">build</span>
        </div>

        {/* Terminal content */}
        <div className="p-4 font-mono text-xs space-y-1 min-h-[140px]">
          <div className="text-zinc-500">$ hatchit build</div>
          
          {logs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-zinc-400"
            >
              <span className="text-emerald-500">✓</span>
              <span>{log}</span>
            </motion.div>
          ))}

          {stage !== 'complete' && (
            <motion.div 
              className="flex items-center gap-2 text-zinc-300"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <span className="text-emerald-500">▸</span>
              <span>{STAGE_CONFIG[stage].label}</span>
              <span className="text-zinc-600">_</span>
            </motion.div>
          )}
        </div>

        {/* Progress bar */}
        <div className="px-4 pb-4">
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500"
              animate={{ width: `${getProgress()}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-zinc-600 font-mono">
            <span>claude sonnet 4.5</span>
            <span>{elapsedSeconds}s</span>
          </div>
        </div>
      </div>
    </div>
  )
}
