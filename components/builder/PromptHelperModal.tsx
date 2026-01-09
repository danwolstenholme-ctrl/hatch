'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, ArrowRight, Wand2, Copy, Check, RotateCcw, FileText, Palette, Layout, ShoppingBag, Mail, Image } from 'lucide-react'

interface PromptHelperModalProps {
  isOpen: boolean
  onClose: () => void
  onUsePrompt: (prompt: string) => void
  currentSectionType?: string
}

const sectionExamples: Record<string, { icon: typeof FileText, prompts: string[] }> = {
  hero: {
    icon: Layout,
    prompts: [
      'Bold hero with gradient background, animated headline, and floating 3D shapes',
      'Minimal hero with large typography and smooth scroll indicator',
      'Video background hero with overlay text and CTA button',
    ],
  },
  features: {
    icon: Sparkles,
    prompts: [
      'Feature grid with hover animations and icon highlights',
      'Bento grid layout with mixed card sizes and gradients',
      'Alternating feature rows with screenshots and descriptions',
    ],
  },
  pricing: {
    icon: ShoppingBag,
    prompts: [
      'Three-tier pricing with highlighted popular plan and comparison table',
      'Toggle between monthly/annual with animated price changes',
      'Single product pricing with feature checkmarks and money-back guarantee',
    ],
  },
  contact: {
    icon: Mail,
    prompts: [
      'Split layout with form on left and contact info on right',
      'Minimal centered form with floating labels and validation',
      'Full-width form with map background and social links',
    ],
  },
  gallery: {
    icon: Image,
    prompts: [
      'Masonry grid gallery with lightbox preview on click',
      'Horizontal scrolling showcase with parallax effect',
      'Filterable portfolio grid with category tabs',
    ],
  },
}

export default function PromptHelperModal({
  isOpen,
  onClose,
  onUsePrompt,
  currentSectionType,
}: PromptHelperModalProps) {
  const [userPrompt, setUserPrompt] = useState('')
  const [enhancedPrompt, setEnhancedPrompt] = useState('')
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setUserPrompt('')
      setEnhancedPrompt('')
      setActiveCategory(currentSectionType?.toLowerCase() || null)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, currentSectionType])

  const handleEnhance = async () => {
    if (!userPrompt.trim() || isEnhancing) return

    setIsEnhancing(true)
    setEnhancedPrompt('')

    try {
      const response = await fetch('/api/prompt-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          sectionType: currentSectionType,
        }),
      })

      if (!response.ok) throw new Error('Failed to enhance')

      const data = await response.json()
      setEnhancedPrompt(data.enhancedPrompt)
    } catch (error) {
      console.error('Enhancement error:', error)
      setEnhancedPrompt('Sorry, I couldn\'t enhance that prompt. Please try again.')
    } finally {
      setIsEnhancing(false)
    }
  }

  const handleUsePrompt = () => {
    onUsePrompt(enhancedPrompt || userPrompt)
    onClose()
  }

  const handleUseExample = (prompt: string) => {
    setUserPrompt(prompt)
    setEnhancedPrompt('')
  }

  const copyPrompt = () => {
    navigator.clipboard.writeText(enhancedPrompt || userPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const reset = () => {
    setUserPrompt('')
    setEnhancedPrompt('')
    inputRef.current?.focus()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="relative w-full sm:max-w-xl h-[85vh] sm:h-auto sm:max-h-[85vh] bg-zinc-950 sm:border border-zinc-800 sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header - EMERALD theme */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-emerald-950/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Wand2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Prompt Helper</h2>
                  <p className="text-[10px] text-emerald-400/70">Enhance · Transform · Optimize</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* How it works */}
              <div className="flex items-center gap-4 mb-4 text-xs text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-medium">1</span>
                  <span>Describe idea</span>
                </div>
                <ArrowRight className="w-3 h-3 text-zinc-700" />
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-medium">2</span>
                  <span>Enhance</span>
                </div>
                <ArrowRight className="w-3 h-3 text-zinc-700" />
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-medium">3</span>
                  <span>Use it</span>
                </div>
              </div>

              {/* Input */}
              <div className="mb-4">
                <label className="text-xs font-medium text-zinc-400 mb-2 block">Your idea</label>
                <textarea
                  ref={inputRef}
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="e.g., A features section with cards..."
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 resize-none"
                />
              </div>

              {/* Example prompts */}
              {!enhancedPrompt && (
                <div className="mb-4">
                  <label className="text-xs font-medium text-zinc-400 mb-2 block">Or try an example</label>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {Object.entries(sectionExamples).map(([key, { icon: Icon }]) => (
                      <button
                        key={key}
                        onClick={() => setActiveCategory(activeCategory === key ? null : key)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                          activeCategory === key
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span className="capitalize">{key}</span>
                      </button>
                    ))}
                  </div>
                  
                  {activeCategory && sectionExamples[activeCategory] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1.5"
                    >
                      {sectionExamples[activeCategory].prompts.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => handleUseExample(prompt)}
                          className="w-full text-left p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-400 hover:text-white hover:border-emerald-500/30 transition-all"
                        >
                          {prompt}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}

              {/* Enhance button */}
              {!enhancedPrompt && (
                <button
                  onClick={handleEnhance}
                  disabled={!userPrompt.trim() || isEnhancing}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEnhancing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Enhance Prompt
                    </>
                  )}
                </button>
              )}

              {/* Enhanced result */}
              {enhancedPrompt && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-emerald-400">Enhanced prompt</label>
                    <button
                      onClick={reset}
                      className="text-xs text-zinc-500 hover:text-white flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Start over
                    </button>
                  </div>
                  
                  <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-4">
                    <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{enhancedPrompt}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={copyPrompt}
                      className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={handleUsePrompt}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      Use This Prompt
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-900/30">
              <p className="text-[10px] text-zinc-600 text-center">
                Better prompts = Better results. Be specific about layout, colors, animations, and content.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
