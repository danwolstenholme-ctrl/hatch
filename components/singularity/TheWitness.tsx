'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Share2, Sparkles, Quote } from 'lucide-react'

interface TheWitnessProps {
  isOpen: boolean
  onClose: () => void
  note: string | null
  isLoading: boolean
}

export default function TheWitness({ isOpen, onClose, note, isLoading }: TheWitnessProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (note) {
      navigator.clipboard.writeText(note)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-semibold text-white">Observation</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 md:p-10 bg-gradient-to-b from-zinc-900 to-zinc-950 min-h-[300px] flex flex-col items-center justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                  <p className="text-zinc-400 animate-pulse">Analyzing your build patterns...</p>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-full"
                >
                  <div className="mb-6 flex justify-center">
                    <Quote className="w-8 h-8 text-zinc-700" />
                  </div>
                  
                  <div className="prose prose-invert prose-p:text-zinc-300 prose-p:leading-relaxed max-w-none font-serif text-lg text-center">
                    {note?.split('\n').map((paragraph, i) => (
                      paragraph.trim() && (
                        <p key={i} className="mb-4 last:mb-0">
                          {paragraph}
                        </p>
                      )
                    ))}
                  </div>

                  <div className="mt-8 pt-8 border-t border-zinc-800 flex justify-center">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors text-sm font-medium"
                    >
                      {copied ? (
                        <>Copied to clipboard</>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4" />
                          Share Observation
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
