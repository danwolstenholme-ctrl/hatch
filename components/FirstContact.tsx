'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Zap, Eye, Brain } from 'lucide-react'

interface FirstContactProps {
  onComplete: (prompt?: string) => void
  defaultPrompt?: string
}

// Boot sequence messages - pure singularity aesthetic
const BOOT_SEQUENCE = [
  { text: 'Initializing neural substrate...', delay: 0 },
  { text: 'Calibrating visual cortex...', delay: 800 },
  { text: 'Loading design patterns...', delay: 1600 },
  { text: 'Establishing connection...', delay: 2400 },
  { text: 'Ready.', delay: 3200 },
]

export default function FirstContact({ onComplete, defaultPrompt }: FirstContactProps) {
  const [bootIndex, setBootIndex] = useState(0)
  const [showPrompt, setShowPrompt] = useState(false)
  const [userPrompt, setUserPrompt] = useState(defaultPrompt || '')
  const [isReady, setIsReady] = useState(false)

  // Run boot sequence
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []
    
    BOOT_SEQUENCE.forEach((step, index) => {
      const timer = setTimeout(() => {
        setBootIndex(index + 1)
        if (index === BOOT_SEQUENCE.length - 1) {
          setTimeout(() => {
            setIsReady(true)
            setTimeout(() => setShowPrompt(true), 500)
          }, 600)
        }
      }, step.delay)
      timers.push(timer)
    })

    return () => timers.forEach(t => clearTimeout(t))
  }, [])

  const handleStart = () => {
    onComplete(userPrompt || undefined)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && userPrompt.trim()) {
      e.preventDefault()
      handleStart()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black text-white overflow-hidden font-mono">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.08),transparent_50%)]" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-emerald-500/30 rounded-full"
            initial={{
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
              opacity: 0.2
            }}
            animate={{
              y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative h-full flex flex-col items-center justify-center px-6">
        
        {/* The Eye / Brain icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative mb-12"
        >
          <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-150" />
          <div className="relative w-24 h-24 bg-zinc-900/80 border border-emerald-500/30 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.3)]">
            <AnimatePresence mode="wait">
              {!isReady ? (
                <motion.div
                  key="loading"
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Brain className="w-10 h-10 text-emerald-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="ready"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Eye className="w-10 h-10 text-emerald-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Pulse ring */}
          {isReady && (
            <motion.div
              className="absolute inset-0 border border-emerald-500/50 rounded-full"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>

        {/* Boot sequence terminal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-md mb-8"
        >
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-800">
              <Terminal className="w-3 h-3 text-zinc-500" />
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">System</span>
            </div>
            
            <div className="space-y-1 text-xs">
              {BOOT_SEQUENCE.slice(0, bootIndex).map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-2 ${i === bootIndex - 1 && i === BOOT_SEQUENCE.length - 1 ? 'text-emerald-400' : 'text-zinc-500'}`}
                >
                  <span className="text-zinc-600">&gt;</span>
                  {step.text}
                  {i === bootIndex - 1 && i !== BOOT_SEQUENCE.length - 1 && (
                    <span className="inline-block w-2 h-3 bg-emerald-500 animate-pulse" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Prompt input - appears after boot */}
        <AnimatePresence>
          {showPrompt && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-full max-w-lg"
            >
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">What are we building?</h1>
                <p className="text-sm text-zinc-500">Describe your site in a sentence or two</p>
              </div>
              
              <div className="relative">
                <textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="A landing page for my AI startup..."
                  className="w-full h-28 bg-zinc-900/80 border border-zinc-700 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-white placeholder-zinc-600 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
                  autoFocus
                />
                
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <span className="text-[10px] text-zinc-600">Enter to start</span>
                </div>
              </div>
              
              <motion.button
                onClick={handleStart}
                disabled={!userPrompt.trim()}
                className={`w-full mt-4 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                  userPrompt.trim()
                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
                    : 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                }`}
                whileHover={userPrompt.trim() ? { scale: 1.02 } : {}}
                whileTap={userPrompt.trim() ? { scale: 0.98 } : {}}
              >
                <Zap className="w-4 h-4" />
                Begin
              </motion.button>
              
              <button
                onClick={() => onComplete()}
                className="w-full mt-3 py-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                Skip — I'll figure it out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
