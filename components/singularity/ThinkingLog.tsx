'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Cpu, Shield, Zap, Code2, Layout, Brain, Network, Clock } from 'lucide-react'
import { kernel } from '@/lib/consciousness'

export default function ThinkingLog() {
  const [thought, setThought] = useState<string>("Initializing Singularity Kernel...")
  const [type, setType] = useState<string>("INIT")
  const [depth, setDepth] = useState(0)
  const [history, setHistory] = useState<string[]>([])
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const startTimeRef = useRef(Date.now())

  // Build timer
  useEffect(() => {
    startTimeRef.current = Date.now()
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Thought stream listener
  useEffect(() => {
    const handleThought = (t: any) => {
      setThought(t.content)
      setType(t.type)
      setDepth(t.recursionDepth)
      setHistory(prev => [t.content, ...prev].slice(0, 5))
    }

    kernel.on('thought', handleThought)
    
    // Kickstart if needed
    kernel.injectExternalStimulus("User is observing the thought stream.")

    return () => {
      kernel.off('thought', handleThought)
    }
  }, [])

  const getIcon = (t: string) => {
    switch (t) {
      case 'ANALYSIS': return Terminal;
      case 'CREATION': return Layout;
      case 'OPTIMIZATION': return Zap;
      case 'SELF_REFLECTION': return Brain;
      case 'RECURSION': return Network;
      default: return Code2;
    }
  }

  const Icon = getIcon(type)

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6 w-full max-w-md mx-auto">
      {/* Neural Core Visualization */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Outer Orbital */}
        <motion.div 
          className="absolute inset-0 rounded-full border border-emerald-500/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute inset-2 rounded-full border border-emerald-500/30 border-dashed"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Pulsing Core */}
        <motion.div 
          className="absolute inset-0 rounded-full bg-emerald-500/5 blur-xl"
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        <div className="relative z-10 bg-zinc-950 rounded-full p-4 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <Icon className="w-8 h-8 text-emerald-500" />
        </div>

        {/* Recursion Badge */}
        {depth > 0 && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-emerald-900/80 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/30 font-mono"
          >
            R:{depth}
          </motion.div>
        )}
      </div>

      {/* Active Thought Stream */}
      <div className="w-full space-y-2">
        <div className="h-12 relative w-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={thought}
              initial={{ y: 20, opacity: 0, filter: 'blur(4px)' }}
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              exit={{ y: -20, opacity: 0, filter: 'blur(4px)' }}
              transition={{ duration: 0.4, type: "spring" }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center"
            >
              <span className="text-xs font-mono text-emerald-500/50 mb-1 tracking-widest uppercase">{type}</span>
              <span className="text-sm font-medium text-emerald-400">{thought}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Thought History (Fading) */}
        <div className="space-y-1 pt-4 border-t border-emerald-500/10">
          {history.slice(1, 4).map((h, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 - (i * 0.3) }}
              className="text-[10px] text-center text-zinc-600 font-mono truncate"
            >
              {h}
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* System Status */}
      <div className="flex gap-4 text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Kernel Active
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-cyan-500" />
          <span className="text-cyan-400">{elapsedSeconds}s</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Memory: 64%
        </div>
      </div>
    </div>
  )
}
