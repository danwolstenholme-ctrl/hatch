'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Terminal, Sparkles, MessageSquare, Bug } from 'lucide-react'

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check if user has seen the welcome modal
    const hasSeenWelcome = localStorage.getItem('hatch_v1_welcome_seen')
    if (!hasSeenWelcome) {
      // Small delay for impact
      const timer = setTimeout(() => setIsOpen(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem('hatch_v1_welcome_seen', 'true')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-zinc-900 border border-emerald-500/30 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-6 pb-0">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
              <button 
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Terminal className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">System Online: v1.0</h2>
                  <p className="text-xs text-emerald-400 font-mono">THE ARCHITECT IS LISTENING</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 pt-2 space-y-4">
              <p className="text-zinc-300 leading-relaxed">
                Welcome to the <strong className="text-white">HatchIt V1 Launch</strong>. 
                We are live, stable, and ready to build.
              </p>
              
              <div className="p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl space-y-3">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-white">Build & Share</h3>
                    <p className="text-xs text-zinc-400">Create full websites, deploy them, and download the code. The $9 Starter pack gets you everything.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-white">We Need Your Feedback</h3>
                    <p className="text-xs text-zinc-400">This is just the beginning. Tell us what features you want. Report bugs. Break things.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <a 
                  href="https://www.reddit.com/r/HatchIt/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  Join r/HatchIt
                </a>
                <button 
                  onClick={handleClose}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-colors text-sm shadow-lg shadow-emerald-900/20"
                >
                  Initialize Builder
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
