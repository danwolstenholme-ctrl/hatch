'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Bot, User, Copy, Check, Sparkles, Wand2, Bug, Palette, Code, Lightbulb, Zap } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface HatchModalProps {
  isOpen: boolean
  onClose: () => void
  currentCode?: string
  sectionName?: string
  projectName?: string
  onUsePrompt?: (prompt: string) => void
}

export default function HatchModal({
  isOpen,
  onClose,
  currentCode,
  sectionName,
  projectName,
  onUsePrompt,
}: HatchModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [showIntro, setShowIntro] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setMessages([])
      setInput('')
      setShowIntro(true)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    setShowIntro(false)
    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          currentCode,
          projectName,
          sectionType: sectionName,
          conversationHistory: messages.slice(-6),
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (error) {
      console.error('Hatch error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Oops! Something went wrong. Let me try again - just resend your question!' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const copyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const useAsPrompt = (text: string) => {
    if (onUsePrompt) {
      onUsePrompt(text)
      onClose()
    }
  }

  const quickActions = [
    { icon: Lightbulb, label: 'Ideas', prompt: 'What would make this section more engaging?', color: 'amber' },
    { icon: Bug, label: 'Fix issue', prompt: 'Something looks off - can you spot what\'s wrong?', color: 'red' },
    { icon: Palette, label: 'Style tips', prompt: 'How can I improve the visual design?', color: 'purple' },
    { icon: Wand2, label: 'Enhance', prompt: 'Can you suggest a more polished version of this?', color: 'emerald' },
  ]

  const promptStarters = [
    'Make my hero section more dynamic with animations',
    'Add a gradient background that looks modern',
    'Create a pricing section with 3 tiers',
    'Design a testimonial carousel',
  ]

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
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="relative w-full sm:max-w-2xl h-[85vh] sm:h-[600px] bg-zinc-950 sm:border border-zinc-800 sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header - Warm orange/amber theme for Hatch */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-gradient-to-r from-amber-950/40 to-orange-950/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Hatch</h2>
                  <p className="text-[10px] text-amber-400/70">Your building buddy</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {showIntro && messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  {/* Hatch intro */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4 shadow-xl shadow-amber-500/30"
                  >
                    <Zap className="w-10 h-10 text-white" />
                  </motion.div>
                  
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h3 className="text-lg font-semibold text-white mb-1">Hey! I'm Hatch 👋</h3>
                    <p className="text-sm text-zinc-400 mb-6 max-w-sm">
                      I'm here to help you build something amazing. Ask me anything about your site - 
                      I can suggest ideas, fix issues, or help craft the perfect prompt.
                    </p>
                  </motion.div>
                  
                  {/* Quick actions */}
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-2 gap-2 w-full max-w-sm mb-6"
                  >
                    {quickActions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(action.prompt)}
                        className="flex items-center gap-2 p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-left hover:border-amber-500/30 hover:bg-amber-950/20 transition-all group"
                      >
                        <div className={`w-8 h-8 rounded-lg bg-${action.color}-500/10 flex items-center justify-center`}>
                          <action.icon className={`w-4 h-4 text-${action.color}-400 group-hover:text-amber-400 transition-colors`} />
                        </div>
                        <span className="text-xs text-zinc-400 group-hover:text-white transition-colors">{action.label}</span>
                      </button>
                    ))}
                  </motion.div>

                  {/* Prompt starters */}
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="w-full max-w-sm"
                  >
                    <p className="text-[10px] text-zinc-600 mb-2 uppercase tracking-wider">Try asking...</p>
                    <div className="space-y-1.5">
                      {promptStarters.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => setInput(prompt)}
                          className="w-full text-left px-3 py-2 bg-zinc-900/50 border border-zinc-800/50 rounded-lg text-xs text-zinc-500 hover:text-amber-400 hover:border-amber-500/30 transition-all"
                        >
                          "{prompt}"
                        </button>
                      ))}
                    </div>
                  </motion.div>
                  
                  {currentCode && (
                    <p className="text-[10px] text-amber-500/50 mt-4">
                      ● Working on: {sectionName || 'Current section'}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${
                        msg.role === 'user' 
                          ? 'bg-zinc-800' 
                          : 'bg-gradient-to-br from-amber-500 to-orange-500'
                      }`}>
                        {msg.role === 'user' 
                          ? <User className="w-3.5 h-3.5 text-zinc-400" />
                          : <Zap className="w-3.5 h-3.5 text-white" />
                        }
                      </div>
                      <div className={`flex-1 max-w-[85%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                        <div className={`inline-block px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-amber-600 text-white rounded-br-md'
                            : 'bg-zinc-800 text-zinc-200 rounded-bl-md'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        {msg.role === 'assistant' && (
                          <div className="mt-1 flex items-center gap-2">
                            <button
                              onClick={() => copyMessage(msg.content, i)}
                              className="text-[10px] text-zinc-600 hover:text-zinc-400 flex items-center gap-1"
                            >
                              {copiedIndex === i ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              {copiedIndex === i ? 'Copied' : 'Copy'}
                            </button>
                            {onUsePrompt && (
                              <button
                                onClick={() => useAsPrompt(msg.content)}
                                className="text-[10px] text-amber-600 hover:text-amber-400 flex items-center gap-1"
                              >
                                <Sparkles className="w-3 h-3" />
                                Use as prompt
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                        <Zap className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-2">
                        <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-zinc-800 bg-zinc-900/30">
              <div className="flex items-end gap-2 bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/20">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Ask Hatch anything..."
                  disabled={isLoading}
                  rows={1}
                  className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none disabled:opacity-50 resize-none max-h-32"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-3 text-amber-400 hover:text-amber-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[10px] text-zinc-600 text-center mt-2">
                Hatch knows about HatchIt's tools and can help with your specific build
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
