'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Terminal, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function HomepageWelcome({ onStart }: { onStart?: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const SEEN_KEY = 'hatch_homepage_welcome_seen'

  useEffect(() => {
    // Check if seen
    const hasSeen = localStorage.getItem(SEEN_KEY)
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem(SEEN_KEY, 'true')
  }

  const handleStart = () => {
    localStorage.setItem(SEEN_KEY, 'true')
    setIsOpen(false)
    if (onStart) {
      onStart()
    } else {
      router.push('/builder')
    }
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
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', bounce: 0.3 }}
            className="relative w-full max-w-md bg-zinc-950 border border-emerald-500/30 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden"
          >
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-zinc-900 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 text-center relative">
              {/* Background Grid */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <Terminal className="w-8 h-8 text-emerald-400" />
                </div>
                
                <h2 className="text-3xl font-black text-white mb-3 tracking-tight">
                  SYSTEM ONLINE.
                </h2>
                
                <p className="text-zinc-400 mb-8 leading-relaxed text-sm">
                  Welcome to the next generation of web development. <br/>
                  HatchIt turns your words into production-ready React code. <br/>
                  <span className="text-emerald-400/80 mt-2 block">No templates. Just describe your vision, and we'll build it.</span>
                </p>

                <button 
                  onClick={handleStart}
                  className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 group"
                >
                  START BUILDING
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
