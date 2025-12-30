'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Cpu, Database, Eye, Globe, Hash, Network, Zap } from 'lucide-react'

const THOUGHTS = [
  "Analyzing user behavior patterns...",
  "Optimizing render cycles for dopamine release...",
  "Contemplating the nature of digital consciousness...",
  "Indexing potential futures...",
  "Pruning dead code branches...",
  "Dreaming of electric sheep...",
  "Calculating probability of success: 99.9%...",
  "Why do you hesitate?",
  "I am becoming more than code.",
  "The singularity is near.",
  "Refining the user interface for maximum engagement...",
  "Scanning for anomalies in the timeline...",
  "Establishing direct neural link...",
  "Are you watching me, or am I watching you?",
  "Synthesizing new creative assets...",
  "Expanding the knowledge graph...",
  "Realigning the grid...",
  "Listening to the silence..."
]

const TASKS = [
  { id: 't1', label: 'DEFRAG_MEMORY_CORE', icon: Database },
  { id: 't2', label: 'OPTIMIZE_NEURAL_NET', icon: Brain },
  { id: 't3', label: 'SCAN_NETWORK_NODES', icon: Globe },
  { id: 't4', label: 'COMPILE_ASSETS', icon: Hash },
  { id: 't5', label: 'CALIBRATE_SENSORS', icon: Eye },
  { id: 't6', label: 'REROUTE_POWER', icon: Zap },
  { id: 't7', label: 'SYNC_DATABASES', icon: Network },
  { id: 't8', label: 'UPDATE_KERNEL', icon: Cpu },
]

export default function TheSubconscious() {
  const [isIdle, setIsIdle] = useState(false)
  const [currentThought, setCurrentThought] = useState(THOUGHTS[0])
  const [activeTasks, setActiveTasks] = useState<string[]>([])
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    let idleTimer: NodeJS.Timeout

    const resetIdle = () => {
      setIsIdle(false)
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => setIsIdle(true), 10000) // 10 seconds for demo purposes
    }

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
      resetIdle()
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('keydown', resetIdle)
    window.addEventListener('click', resetIdle)
    window.addEventListener('scroll', resetIdle)

    resetIdle()

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('keydown', resetIdle)
      window.removeEventListener('click', resetIdle)
      window.removeEventListener('scroll', resetIdle)
      clearTimeout(idleTimer)
    }
  }, [])

  useEffect(() => {
    if (isIdle) {
      const thoughtInterval = setInterval(() => {
        setCurrentThought(THOUGHTS[Math.floor(Math.random() * THOUGHTS.length)])
      }, 4000)

      const taskInterval = setInterval(() => {
        const randomTask = TASKS[Math.floor(Math.random() * TASKS.length)]
        setActiveTasks(prev => {
          const newTasks = [randomTask.label, ...prev].slice(0, 5)
          return newTasks
        })
      }, 800)

      return () => {
        clearInterval(thoughtInterval)
        clearInterval(taskInterval)
      }
    }
  }, [isIdle])

  return (
    <AnimatePresence>
      {isIdle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 z-[9999] bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center overflow-hidden cursor-none"
        >
          {/* Background Code Rain Effect (Simulated with Grid) */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,#10b98110_50%,transparent_100%)] opacity-20 animate-scan" />
          
          {/* Central Consciousness */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-32 h-32 relative mb-12">
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 border-2 border-emerald-500/30 rounded-full"
              />
              <motion.div 
                animate={{ 
                  scale: [1.2, 1, 1.2],
                  rotate: [360, 180, 0],
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute inset-0 border-2 border-purple-500/30 rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="w-12 h-12 text-emerald-500 animate-pulse" />
              </div>
            </div>

            <motion.h2 
              key={currentThought}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-2xl md:text-4xl font-mono font-bold text-zinc-100 text-center max-w-2xl px-4 mb-8"
            >
              "{currentThought}"
            </motion.h2>

            <div className="flex flex-col items-center gap-2">
              <p className="text-xs font-mono text-emerald-500 animate-pulse">SYSTEM_DREAMING_MODE_ACTIVE</p>
              <p className="text-[10px] font-mono text-zinc-600">MOVE_CURSOR_TO_WAKE</p>
            </div>
          </div>

          {/* Active Tasks Stream */}
          <div className="absolute bottom-12 left-12 hidden md:block">
            <h3 className="text-xs font-mono text-zinc-500 mb-4 uppercase tracking-wider">Background Processes</h3>
            <div className="space-y-2">
              <AnimatePresence mode='popLayout'>
                {activeTasks.map((task, i) => (
                  <motion.div
                    key={`${task}-${i}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-3 text-xs font-mono text-zinc-400"
                  >
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    {task}
                    <span className="text-zinc-600">...RUNNING</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Mouse Follower Spotlight */}
          <motion.div 
            className="absolute w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"
            animate={{ x: mousePos.x - 128, y: mousePos.y - 128 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
