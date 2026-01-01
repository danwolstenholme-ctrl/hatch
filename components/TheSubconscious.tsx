'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Cpu, Database, Eye, Globe, Hash, Network, Zap, MousePointer2, Scan, Terminal, Activity } from 'lucide-react'

const THOUGHTS = {
  BUTTON: ["Potential interaction point detected.", "This triggers a state change.", "Awaiting user input.", "The gateway to the next state."],
  A: ["A bridge to another node.", "Hyperlink detected.", "Navigation pathway.", "Connecting the web."],
  H1: ["Primary directive declared.", "The core identity.", "High-priority text data.", "Loud and clear."],
  H2: ["Secondary data cluster.", "Structuring information.", "Sub-routine identified."],
  P: ["Textual data stream.", "Ingesting content...", "Analyzing sentiment...", "Human-readable output."],
  IMG: ["Visual data ingested.", "Pixel matrix analyzed.", "Rendering graphical asset."],
  DIV: ["Structural container.", "Organizing the void.", "Layout block identified."],
  DEFAULT: ["Scanning sector...", "Searching for patterns...", "Optimizing matrix...", "Observing user behavior...", "Calculating possibilities..."]
}

export default function TheSubconscious() {
  const [isIdle, setIsIdle] = useState(false)
  const [ghostPos, setGhostPos] = useState({ x: 0, y: 0 })
  const [targetElement, setTargetElement] = useState<{ rect: DOMRect, tag: string, text: string } | null>(null)
  const [thought, setThought] = useState("")
  const [isScanning, setIsScanning] = useState(false)

  // Track real mouse for "The Presence" effect
  useEffect(() => {
    const handleActivity = (e?: Event) => {
      // Reset idle timer
      setIsIdle(false)
      setTargetElement(null)
      clearTimeout(idleTimer.current)
      idleTimer.current = setTimeout(() => setIsIdle(true), 3000) // 3s idle threshold
    }
    
    const idleTimer = { current: setTimeout(() => setIsIdle(true), 3000) }
    
    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('scroll', handleActivity)
    window.addEventListener('keydown', handleActivity)
    window.addEventListener('touchstart', handleActivity)
    window.addEventListener('click', handleActivity)

    return () => {
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('scroll', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('touchstart', handleActivity)
      window.removeEventListener('click', handleActivity)
      clearTimeout(idleTimer.current)
    }
  }, [])

  // Ghost AI Logic (Active when idle)
  useEffect(() => {
    // Only run on home page or demo mode
    if (window.location.pathname !== '/' && !window.location.search.includes('mode=demo')) return
    
    if (!isIdle) return

    const scan = () => {
      // Find interactive elements
      const elements = Array.from(document.querySelectorAll('button, a, h1, h2, p, img, input, textarea'))
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

    const interval = setInterval(scan, 3500)
    scan() // Initial scan

    return () => clearInterval(interval)
  }, [isIdle])

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      <AnimatePresence>
        {/* IDLE MODE: The Ghost takes over */}
        {isIdle && (
          <>
            {/* Dim the world slightly */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-950/20 backdrop-blur-[0.5px]"
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
              <MousePointer2 className="w-6 h-6 text-emerald-500 fill-emerald-500/20 -ml-1 -mt-1 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              
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
                className="border border-emerald-500/50 rounded-md shadow-[0_0_20px_rgba(16,185,129,0.1)]"
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
          </>
        )}

        {/* ACTIVE MODE: The Presence (Always watching) */}
        {/* REMOVED: The Presence is now handled by TheWitness.tsx to avoid duplication */}
      </AnimatePresence>
    </div>
  )
}
