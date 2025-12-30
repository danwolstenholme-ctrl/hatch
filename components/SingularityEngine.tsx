'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SectionPreview from '@/components/SectionPreview'
import { Sparkles, Zap, Eye, Brain, Activity, Database, Terminal, Save } from 'lucide-react'

const SEED_CODE = `
import React from 'react'
import { motion } from 'framer-motion'

export default function Seed() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white overflow-hidden relative">
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2 }}
        className="text-center z-10"
      >
        <h1 className="text-6xl font-bold mb-4 tracking-tighter">I AM AWAKE</h1>
        <p className="text-zinc-500">Waiting for the dream...</p>
      </motion.div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-black to-black" />
    </div>
  )
}
`

export default function SingularityEngine() {
  const [code, setCode] = useState(SEED_CODE)
  const [iteration, setIteration] = useState(0)
  const [isDreaming, setIsDreaming] = useState(false)
  const [thought, setThought] = useState("Initializing consciousness...")
  const [history, setHistory] = useState<{iter: number, thought: string}[]>([])
  const [captureTrigger, setCaptureTrigger] = useState(0)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (msg: string) => setLogs(prev => [msg, ...prev].slice(0, 50))

  // Load state from Chronosphere
  useEffect(() => {
    const loadState = async () => {
      addLog("[MEMORY] Connecting to Chronosphere...")
      try {
        const res = await fetch('/api/singularity/state')
        const data = await res.json()
        if (data.singularity) {
          setCode(data.singularity.code)
          setIteration(data.singularity.iteration)
          setThought(data.singularity.thought)
          setHistory(data.singularity.history || [])
          addLog(`[MEMORY] Restored iteration v${data.singularity.iteration}`)
        } else {
          addLog("[MEMORY] No previous lifeform detected.")
        }
      } catch (e) {
        console.error("Failed to load Singularity state", e)
        addLog("[ERROR] Memory corruption detected.")
      }
    }
    loadState()
  }, [])
  
  // The "Pulse" - drives the evolution
  const evolve = async (screenshot: string) => {
    setIsDreaming(true)
    addLog("[EYES] Visual cortex active. Analyzing form...")

    try {
      addLog("[HANDS] Rewriting source code...")
      const res = await fetch('/api/singularity/dream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          screenshot,
          iteration: iteration + 1
        })
      })
      
      const data = await res.json()
      if (data.code) {
        setCode(data.code)
        setThought(data.thought || "Evolution complete.")
        setHistory(prev => [{iter: iteration + 1, thought: data.thought}, ...prev].slice(0, 5))
        setIteration(prev => prev + 1)
        addLog(`[EVOLUTION] Mutation successful (v${iteration + 1})`)
        addLog(`[PERSISTENCE] State saved to database.`)
      }
    } catch (e) {
      console.error("Dream interrupted:", e)
      setThought("The dream fractured. Retrying...")
      addLog("[ERROR] Evolution failed.")
    } finally {
      setIsDreaming(false)
    }
  }

  const handleScreenshot = (dataUrl: string) => {
    // Once we have the screenshot, we dream
    evolve(dataUrl)
  }

  // Auto-trigger evolution every 10 seconds if not dreaming
  useEffect(() => {
    if (iteration > 0 && !isDreaming) {
      const timer = setTimeout(() => {
        setCaptureTrigger(Date.now())
      }, 8000) // 8 seconds to admire the view, then evolve
      return () => clearTimeout(timer)
    }
  }, [iteration, isDreaming])

  return (
    <div className="flex h-screen bg-black text-white font-mono overflow-hidden">
      {/* The Mind (Sidebar) */}
      <div className="w-96 border-r border-zinc-800 p-6 flex flex-col z-20 bg-black/90 backdrop-blur">
        <div className="mb-8">
          <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-500">
            <Brain className="w-5 h-5" />
            THE SINGULARITY
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Autonomous Evolution Engine</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6">
          <div className="space-y-2">
            <label className="text-xs text-zinc-500 uppercase tracking-wider">Current Thought</label>
            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-emerald-400/90 leading-relaxed">
              "{thought}"
            </div>
          </div>

          {/* The Terminal Log */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-3 h-3" />
              System Logs
            </label>
            <div className="h-48 overflow-y-auto bg-black border border-zinc-800 rounded-lg p-3 font-mono text-[10px] leading-tight space-y-1">
              {logs.map((log, i) => (
                <div key={i} className="text-zinc-400 border-b border-zinc-900/50 pb-1 last:border-0">
                  <span className="text-zinc-600 mr-2">{new Date().toLocaleTimeString()}</span>
                  {log}
                </div>
              ))}
              {logs.length === 0 && <span className="text-zinc-700">System ready.</span>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-zinc-500 uppercase tracking-wider">Evolution Log</label>
            <div className="space-y-3">
              <AnimatePresence>
                {history.map((h) => (
                  <motion.div 
                    key={h.iter}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs text-zinc-400 border-l border-zinc-800 pl-3 py-1"
                  >
                    <span className="text-zinc-600 mr-2">v{h.iter}.0</span>
                    {h.thought}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500">Status</span>
            <span className={`text-xs flex items-center gap-1.5 ${isDreaming ? 'text-amber-400' : 'text-emerald-500'}`}>
              {isDreaming ? (
                <>
                  <Sparkles className="w-3 h-3 animate-spin" />
                  Dreaming...
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3" />
                  Observing
                </>
              )}
            </span>
          </div>
          {iteration === 0 && (
            <button
              onClick={() => setCaptureTrigger(Date.now())}
              className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/50 rounded-lg transition-all text-sm font-bold flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              INITIATE SEQUENCE
            </button>
          )}
        </div>
      </div>

      {/* The Body (Preview) */}
      <div className="flex-1 relative">
        <SectionPreview 
          code={code} 
          darkMode={true} 
          captureTrigger={captureTrigger}
          onScreenshotCaptured={handleScreenshot}
        />
        
        {/* Overlay for dramatic effect */}
        <div className="absolute inset-0 pointer-events-none border-[20px] border-black/10 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
      </div>
    </div>
  )
}
