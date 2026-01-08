'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

// =============================================================================
// GUEST PROMPT MODAL - Minimal prompt entry for demo users
// =============================================================================

interface GuestPromptModalProps {
  isOpen: boolean
  onSubmit: (prompt: string) => void
}

export default function GuestPromptModal({ isOpen, onSubmit }: GuestPromptModalProps) {
  const [prompt, setPrompt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isValid = prompt.trim().length >= 10

  const handleSubmit = () => {
    if (!isValid) return
    setIsSubmitting(true)
    setTimeout(() => onSubmit(prompt), 300)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="w-full max-w-lg mx-4"
          >
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
              {/* Terminal header */}
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border-b border-zinc-800">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                </div>
                <span className="text-xs text-zinc-500 font-mono ml-2">new build</span>
              </div>

              <div className="p-6">
                <div className="font-mono text-sm text-zinc-500 mb-4">
                  $ describe your site
                </div>

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && isValid) {
                      e.preventDefault()
                      handleSubmit()
                    }
                  }}
                  placeholder="A landing page for..."
                  className="w-full h-24 bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-zinc-700"
                  autoFocus
                />

                <div className="flex items-center justify-between mt-4">
                  <span className="font-mono text-xs text-zinc-600">
                    {!isValid && prompt.trim().length > 0 && `${10 - prompt.trim().length} more`}
                  </span>
                  <button
                    onClick={handleSubmit}
                    disabled={!isValid || isSubmitting}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-all
                      ${isValid && !isSubmitting
                        ? 'bg-emerald-500/15 border border-emerald-500/40 hover:bg-emerald-500/20 hover:border-emerald-500/50 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                        : 'bg-zinc-800 border border-zinc-700 text-zinc-500 cursor-not-allowed'}`}
                  >
                    {isSubmitting ? 'building...' : 'build'}
                    {!isSubmitting && <ArrowRight className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}