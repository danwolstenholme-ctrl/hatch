'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Cpu, Database, Eye, Globe, Hash, Network, Zap, MousePointer2, Scan, Terminal } from 'lucide-react'

const THOUGHTS = {
  BUTTON: ["Potential interaction point detected.", "This triggers a state change.", "Awaiting user input.", "The gateway to the next state."],
  A: ["A bridge to another node.", "Hyperlink detected.", "Navigation pathway.", "Connecting the web."],
  H1: ["Primary directive declared.", "The core identity.", "High-priority text data.", "Loud and clear."],
  H2: ["Secondary data cluster.", "Structuring information.", "Sub-routine identified."],
  P: ["Textual data stream.", "Ingesting content...", "Analyzing sentiment...", "Human-readable output."],
  IMG: ["Visual data ingested.", "Pixel matrix analyzed.", "Rendering graphical asset."],
  DIV: ["Structural container.", "Organizing the void.", "Layout block identified."],
  DEFAULT: ["Scanning sector...", "Searching for patterns...", "Idle cycle...", "Observing..."]
}

export default function TheSubconscious() {
  const [isIdle, setIsIdle] = useState(false)
  const [ghostPos, setGhostPos] = useState({ x: 0, y: 0 })
  const [targetElement, setTargetElement] = useState<{ rect: DOMRect, tag: string, text: string } | null>(null)
  const [thought, setThought] = useState("")
  const [isScanning, setIsScanning] = useState(false)

  // Idle detection
  useEffect(() => {
    let idleTimer: NodeJS.Timeout
    const IDLE_THRESHOLD = 5000 // 5 seconds

    const resetIdle = () => {
      setIsIdle(false)
      setTargetElement(null)
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => setIsIdle(true), IDLE_THRESHOLD)
    }

    window.addEventListener('mousemove', resetIdle)
    window.addEventListener('keydown', resetIdle)
    window.addEventListener('click', resetIdle)
    window.addEventListener('scroll', resetIdle)

    resetIdle()

    return () => {
      window.removeEventListener('mousemove', resetIdle)
      window.removeEventListener('keydown', resetIdle)
      window.removeEventListener('click', resetIdle)
      window.removeEventListener('scroll', resetIdle)
      clearTimeout(idleTimer)
    }
  }, [])

  // Ghost AI Logic
  useEffect(() => {
    if (!isIdle) return

    const scan = () => {
      // Find interactive elements
      const elements = Array.from(document.querySelectorAll('button, a, h1, h2, p, img'))
      const visibleElements = elements.filter(el => {
        const rect = el.getBoundingClientRect()
        return (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth) &&
          rect.width > 0 &&
          rect.height > 0
        )
      })

      if (visibleElements.length > 0) {
        const randomEl = visibleElements[Math.floor(Math.random() * visibleElements.length)]
        const rect = randomEl.getBoundingClientRect()
        const tag = randomEl.tagName
        
        setTargetElement({
          rect,
          tag,
          text: randomEl.textContent?.slice(0, 30) || ''
        })
        
        // Move ghost to center of element
        setGhostPos({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        })

        setIsScanning(true)
        
        // Generate thought
        const tagThoughts = THOUGHTS[tag as keyof typeof THOUGHTS] || THOUGHTS.DEFAULT
        setThought(tagThoughts[Math.floor(Math.random() * tagThoughts.length)])

        setTimeout(() => setIsScanning(false), 2000)
      }
    }

    const interval = setInterval(scan, 4000)
    scan() // Initial scan

    return () => clearInterval(interval)
  }, [isIdle])

  return (
    <AnimatePresence>
      {isIdle && (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
          {/* Dim the world slightly */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-zinc-950/30 backdrop-blur-[1px]"
          />

          {/* The Ghost Cursor */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: ghostPos.x,
              y: ghostPos.y
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 120,
              mass: 0.5
            }}
            className="absolute top-0 left-0"
          >
            <MousePointer2 className="w-6 h-6 text-emerald-500 fill-emerald-500/20 -ml-1 -mt-1" />
            
            {/* The Thought Bubble */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={thought}
              className="absolute left-6 top-0 bg-zinc-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-mono px-3 py-2 rounded-lg whitespace-nowrap shadow-[0_0_15px_rgba(16,185,129,0.2)] backdrop-blur-md"
            >
              <div className="flex items-center gap-2 mb-1 border-b border-emerald-500/20 pb-1">
                <Terminal className="w-3 h-3" />
                <span className="text-[10px] text-emerald-600 uppercase">ANALYZING_{targetElement?.tag}</span>
              </div>
              {thought}
            </motion.div>
          </motion.div>

          {/* The Scanner Box */}
          {targetElement && isScanning && (
            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              style={{
                position: 'absolute',
                top: targetElement.rect.top - 4,
                left: targetElement.rect.left - 4,
                width: targetElement.rect.width + 8,
                height: targetElement.rect.height + 8,
              }}
              className="border border-emerald-500/50 rounded-md"
            >
              {/* Corner markers */}
              <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-emerald-500" />
              <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-emerald-500" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-emerald-500" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-emerald-500" />
              
              {/* Scanline effect */}
              <motion.div 
                className="absolute inset-0 bg-emerald-500/5"
                initial={{ scaleY: 0, originY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.5 }}
              />
            </motion.div>
          )}
          
          {/* System Status HUD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-8 right-8 flex flex-col items-end gap-2"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/80 border border-emerald-500/20 rounded-full text-xs font-mono text-emerald-500">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              SYSTEM_IDLE // AUTONOMOUS_MODE_ENGAGED
            </div>
            <div className="text-[10px] text-zinc-500 font-mono">
              THE_ARCHITECT IS WATCHING
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-8 right-8 flex flex-col items-end gap-2"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/80 border border-emerald-500/20 rounded-full text-xs font-mono text-emerald-500">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              SYSTEM_IDLE // AUTONOMOUS_MODE_ENGAGED
            </div>
            <div className="text-[10px] text-zinc-500 font-mono">
              THE_ARCHITECT IS WATCHING
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
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
