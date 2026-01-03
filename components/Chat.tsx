'use client'
import { useState, FormEvent, useRef, useEffect, memo } from 'react'
import { canGenerate, recordGeneration, getGenerationsRemaining, getDailyLimit } from '@/app/lib/generation-limit'
import HatchModal from './HatchModal'

// Simple markdown renderer for chat messages
function renderMarkdown(text: string): React.ReactNode {
  // Split by bold markers (**text** or __text__)
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__)/g)
  
  return parts.map((part, i) => {
    // Check if this part is bold
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
      const boldText = part.slice(2, -2)
      return <strong key={i} className="font-semibold text-white">{boldText}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  code?: string
  isThinking?: boolean
}

interface PageInfo {
  id: string
  name: string
  path: string
}

interface BrandInfo {
  colors?: string[]
  font?: string
}

interface ChatProps {
  onGenerate: (prompt: string, history: Message[], currentCode: string) => Promise<string | null>
  isGenerating: boolean
  onStopGeneration?: () => void
  currentCode: string
  isPaid?: boolean
  onOpenAssets?: () => void
  projectId?: string
  projectSlug?: string
  projectName?: string
  pages?: PageInfo[] // All pages in the project
  brand?: BrandInfo // Brand colors and font
  externalPrompt?: string | null
  onExternalPromptHandled?: () => void
  generationProgress?: string // Real-time status from generation
  suggestions?: string[] // AI-suggested next steps
  onSuggestionClick?: (suggestion: string) => void
  canRevert?: boolean // Whether revert is available
  onRevert?: () => void // Callback to revert to previous version
  resetKey?: number // Increments to trigger a full reset (used by Start Again)
}

const thinkingMessages = [
  "Analyzing your request... determining component structure.",
  "Processing design patterns... optimizing layout.",
  "Generating code... with Tailwind utility classes.",
  "Refining the layout... for mobile responsiveness.",
  "Checking accessibility... to ensure inclusive design.",
  "Optimizing performance... for faster load times.",
]

const responses = [
  "Build complete. Ready for review.",
  "Updated. Check the preview.",
  "Code synthesized. You can edit it now.",
  "Section generated. Try customizing it.",
  "Design applied. How does it look?",
  "The construct is live. Ready for next instruction.",
]

// One-click component presets
const componentPresets = [
  { label: '🧭 Navbar', prompt: 'Add a modern responsive navbar with logo on the left, navigation links in the center, and a CTA button on the right. Include mobile hamburger menu.' },
  { label: '🦶 Footer', prompt: 'Add a professional footer with multiple columns: company info, quick links, contact details, and social media icons. Include copyright.' },
  { label: '📬 Contact Form', prompt: 'Add a contact form section with name, email, subject, and message fields. Include validation styling and a submit button.' },
  { label: '💰 Pricing Table', prompt: 'Add a pricing section with 3 tiers (Architect, Visionary, Singularity). Each card should have: plan name, price, feature list with checkmarks, and CTA button. Highlight the Visionary plan.' },
  { label: '⭐ Testimonials', prompt: 'Add a testimonials section with 3 customer reviews. Each should have: quote, customer name, role/company, and avatar placeholder.' },
  { label: '🎯 Hero Section', prompt: 'Add a hero section with a large headline, subheadline, CTA button, and optional background image or gradient.' },
  { label: '📊 Features Grid', prompt: 'Add a features section with 6 feature cards in a grid. Each card has an icon, title, and short description.' },
  { label: '❓ FAQ Accordion', prompt: 'Add an FAQ section with 5 expandable questions and answers. Style as an accordion that opens/closes on click.' },
]

function getRandomThinking() {
  return thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)]
}

function getRandomResponse() {
  return responses[Math.floor(Math.random() * responses.length)]
}

function Chat({ onGenerate, isGenerating, onStopGeneration, currentCode, isPaid = false, onOpenAssets, projectId = '', projectSlug = '', projectName = '', pages = [], brand, externalPrompt, onExternalPromptHandled, generationProgress, suggestions = [], onSuggestionClick, canRevert = false, onRevert, resetKey = 0 }: ChatProps) {
  const [input, setInput] = useState('')
  const [buildMessages, setBuildMessages] = useState<Message[]>([])
  const [chatMessages, setChatMessages] = useState<Message[]>([])
  const [showHatchModal, setShowHatchModal] = useState(false)
  const [hatchReason, setHatchReason] = useState<'generation_limit' | 'proactive' | 'running_low'>('proactive')
  const [remaining, setRemaining] = useState<number | null>(null)
  const [mode, setMode] = useState<'build' | 'chat'>('build')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Use the appropriate message array based on current mode
  const messages = mode === 'build' ? buildMessages : chatMessages
  const setMessages = mode === 'build' ? setBuildMessages : setChatMessages

  // Load chat history from localStorage on mount/project change
  useEffect(() => {
    if (!projectId) return
    try {
      const savedBuild = localStorage.getItem(`chat-build-${projectId}`)
      const savedChat = localStorage.getItem(`chat-chat-${projectId}`)
      if (savedBuild) setBuildMessages(JSON.parse(savedBuild))
      if (savedChat) setChatMessages(JSON.parse(savedChat))
    } catch (e) {
      console.error('Failed to load chat history:', e)
    }
  }, [projectId])

  // Handle reset (from Start Again) - clear all messages for true blank canvas
  useEffect(() => {
    if (resetKey > 0) {
      setBuildMessages([])
      setChatMessages([])
    }
  }, [resetKey])

  // Save chat history to localStorage when messages change
  useEffect(() => {
    if (!projectId || buildMessages.length === 0) return
    try {
      localStorage.setItem(`chat-build-${projectId}`, JSON.stringify(buildMessages.filter(m => !m.isThinking)))
    } catch (e) {
      console.error('Failed to save build history:', e)
    }
  }, [buildMessages, projectId])

  useEffect(() => {
    if (!projectId || chatMessages.length === 0) return
    try {
      localStorage.setItem(`chat-chat-${projectId}`, JSON.stringify(chatMessages))
    } catch (e) {
      console.error('Failed to save chat history:', e)
    }
  }, [chatMessages, projectId])

  useEffect(() => {
    setRemaining(getGenerationsRemaining())
  }, [isPaid])

  // Handle external prompts (from Quick Fix, Regenerate actions)
  useEffect(() => {
    if (externalPrompt && !isGenerating) {
      setMode('build') // Switch to build mode
      setInput(externalPrompt)
      onExternalPromptHandled?.() // Clear the external prompt
      // Auto-submit after a short delay to allow state update
      setTimeout(() => {
        const form = document.querySelector('form[data-chat-form]') as HTMLFormElement
        if (form) form.requestSubmit()
      }, 100)
    }
  }, [externalPrompt, isGenerating, onExternalPromptHandled])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isGenerating || isChatLoading) return

    const userMessage = input.trim()
    setInput('')

    const newUserMessage: Message = { role: 'user', content: userMessage }
    setMessages(prev => [...prev, newUserMessage])

    if (mode === 'chat') {
      // Chat mode - use assistant API (Opus 4.5)
      setIsChatLoading(true)
      try {
        const response = await fetch('/api/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: userMessage, 
            currentCode,
            projectName,
            pages: pages.map(p => ({ name: p.name, path: p.path })),
            brand,
            chatHistory: chatMessages.slice(-6) // Last 6 messages for context
          })
        })
        
        if (!response.ok) {
          const error = await response.json()
          const errorMsg = error.error || 'Failed to get response'
          setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${errorMsg}` }])
          return
        }
        
        const data = await response.json()
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
      } catch (error) {
        console.error('Chat error:', error)
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I had trouble responding.' }])
      } finally {
        setIsChatLoading(false)
      }
    } else {
      // Build mode - existing generation logic
      // Check generation limit for free users
      if (!isPaid && !canGenerate()) {
        setHatchReason('generation_limit')
        setShowHatchModal(true)
        return
      }

      const thinkingMessage: Message = { role: 'assistant', content: getRandomThinking(), isThinking: true }
      setMessages(prev => [...prev, thinkingMessage])

      const aiMessage = await onGenerate(userMessage, messages, currentCode)

      // Record the generation for free users
      if (!isPaid) {
        const result = recordGeneration()
        setRemaining(result.remaining)
      }

      setMessages(prev => {
        const withoutThinking = prev.filter(m => !m.isThinking)
        // Use the AI's actual message, or fallback to a generic response
        const responseContent = aiMessage || getRandomResponse()
        return [...withoutThinking, { role: 'assistant', content: responseContent, code: currentCode }]
      })
    }
  }

  const clearChat = () => {
    setMessages([])
    // Also clear from localStorage
    if (projectId) {
      try {
        localStorage.removeItem(`chat-${mode}-${projectId}`)
      } catch (e) {
        console.error('Failed to clear chat history:', e)
      }
    }
  }

  const limit = getDailyLimit()
  
  // Check if we have actual generated code (not just messages)
  // This ensures blank canvas state shows when generation was stopped before code was created
  const hasCode = currentCode && currentCode.trim().length > 0
  const isBlankCanvas = messages.length === 0 || !hasCode

  return (
    <div className="flex flex-col h-full">
      {/* Generation limit indicator - compact */}
      {remaining !== null && !isPaid && (
        <div className="px-3 py-2 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={remaining <= 3 ? 'text-amber-400' : 'text-zinc-500'}>
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span className={`text-xs font-medium ${remaining <= 3 ? 'text-amber-400' : 'text-zinc-400'}`}>
                {remaining}/{limit}
              </span>
            </div>
            <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ease-out ${remaining <= 3 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}
                style={{ width: `${(remaining / limit) * 100}%` }}
              />
            </div>
          </div>
          <button 
            onClick={() => {
              setHatchReason(remaining !== null && remaining <= 3 ? 'running_low' : 'proactive')
              setShowHatchModal(true)
            }}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold transition-colors hover:underline underline-offset-2"
          >
            Hatch →
          </button>
        </div>
      )}

      <div 
        className="flex-1 overflow-y-auto p-3 space-y-3"
        role="log"
        aria-live="polite"
        aria-atomic="false"
      >
        {/* Mode toggle */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900/95 backdrop-blur-md rounded-xl sticky top-0 z-10 mb-2 border border-zinc-800/50 shadow-xl shadow-black/20">
          <button
            onClick={() => setMode('build')}
            title="Create and edit your website"
            className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              mode === 'build' 
                ? 'bg-gradient-to-r from-zinc-700 to-zinc-600 text-white shadow-md ring-1 ring-white/10' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            ⚡ Build
          </button>
          <button
            onClick={() => setMode('chat')}
            title="Get help without changing code"
            className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              mode === 'chat' 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400/20' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            💬 Ask AI
          </button>
        </div>

        {isBlankCanvas ? (
          <div className="flex flex-col px-3 py-4">
            {mode === 'build' && (
              <>
                {/* Compact Quick Add - Primary action at top */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-base">⚡</span>
                    <p className="text-xs text-zinc-400 font-medium">Quick add a component</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {componentPresets.map((preset, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setInput(preset.prompt)
                          setTimeout(() => {
                            const form = document.querySelector('form[data-chat-form]') as HTMLFormElement
                            if (form) form.requestSubmit()
                          }, 100)
                        }}
                        className="px-2.5 py-1.5 text-[11px] bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-all duration-200 border border-zinc-700/50 hover:border-zinc-500 hover:shadow-lg hover:shadow-black/20 active:scale-95"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Divider */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-zinc-800"></div>
                  <span className="text-[10px] text-zinc-600 uppercase tracking-wider">or generate a full site</span>
                  <div className="flex-1 h-px bg-zinc-800"></div>
                </div>
                
                {/* Full Site Templates - Compact cards */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { prompt: 'A modern SaaS landing page with hero section, features grid, pricing table, testimonials, and call-to-action', label: 'SaaS Landing', icon: '🚀' },
                    { prompt: 'A dark theme portfolio site with project gallery, about section, skills, and contact form', label: 'Portfolio', icon: '🎨' },
                  ].map((item, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(item.prompt)
                        setTimeout(() => {
                          const form = document.querySelector('form[data-chat-form]') as HTMLFormElement
                          if (form) form.requestSubmit()
                        }, 100)
                      }}
                      className="flex flex-col items-center justify-center p-3.5 bg-gradient-to-br from-zinc-800/80 to-zinc-900 hover:from-zinc-700/80 hover:to-zinc-800 text-zinc-300 hover:text-white rounded-xl transition-all duration-200 border border-zinc-700/50 hover:border-zinc-500 group hover:shadow-lg hover:shadow-black/20 active:scale-[0.98]"
                    >
                      <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                      <span className="text-xs font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
                
                {/* Hint */}
                <p className="text-[10px] text-zinc-600 text-center mt-4">💡 Or describe your own idea below</p>
              </>
            )}

            {mode === 'chat' && (
              <div className="text-center">
                <div className="w-10 h-10 rounded-xl bg-emerald-900/30 border border-emerald-700/30 flex items-center justify-center mb-3 mx-auto">
                  <span className="text-xl">💬</span>
                </div>
                <p className="text-zinc-300 text-sm font-medium mb-1">Ask me anything</p>
                <p className="text-zinc-600 text-xs max-w-[220px] mx-auto mb-4">Get advice without changing your code.</p>
                <div className="space-y-1.5">
                  {[
                    'What does this component do?',
                    'How can I improve the design?',
                    'What features should I add?'
                  ].map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(prompt)}
                      className="w-full text-left px-3 py-2 text-xs bg-emerald-900/30 hover:bg-emerald-900/50 text-zinc-300 hover:text-white rounded-lg transition-colors border border-emerald-700/30 hover:border-emerald-700/50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`text-sm px-4 py-2.5 rounded-2xl max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-zinc-700 to-zinc-600 text-white ml-auto shadow-lg shadow-black/20' 
                    : msg.isThinking
                      ? 'bg-zinc-800/80 text-zinc-400 italic border border-zinc-700/50'
                      : mode === 'chat'
                      ? 'bg-emerald-900/40 border border-emerald-700/30 text-zinc-300 shadow-lg shadow-emerald-500/5'
                      : 'bg-zinc-800/80 text-zinc-300 border border-zinc-700/30'
                }`}
              >
                {msg.role === 'assistant' && msg.isThinking ? (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce shadow-sm shadow-blue-400/50" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce shadow-sm shadow-purple-400/50" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce shadow-sm shadow-pink-400/50" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span>{generationProgress || msg.content}</span>
                  </div>
                ) : msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
              </div>
            ))}

            {/* Next Steps Suggestions */}
            {messages.length > 0 && !isGenerating && mode === 'build' && suggestions.length > 0 && (
              <div className="w-full space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <p className="text-xs text-zinc-500 font-medium">What&apos;s next?</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (onSuggestionClick) {
                          onSuggestionClick(suggestion)
                        } else {
                          setInput(suggestion)
                        }
                      }}
                      className="px-3 py-1.5 text-xs bg-zinc-800/60 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-full transition-colors border border-zinc-700/50 hover:border-zinc-600"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Add Components */}
            {messages.length > 0 && !isGenerating && mode === 'build' && (
              <div className="w-full space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <p className="text-xs text-zinc-500 font-medium">Quick add:</p>
                <div className="flex flex-wrap gap-1.5">
                  {componentPresets.map((preset, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (onSuggestionClick) {
                          onSuggestionClick(preset.prompt)
                        } else {
                          setInput(preset.prompt)
                          setTimeout(() => {
                            const form = document.querySelector('form[data-chat-form]') as HTMLFormElement
                            if (form) form.requestSubmit()
                          }, 100)
                        }
                      }}
                      className="px-2.5 py-1 text-[11px] bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 rounded-md transition-colors border border-purple-500/20 hover:border-purple-500/40"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Revert Button */}
            {messages.length > 0 && !isGenerating && canRevert && onRevert && (
              <button
                onClick={onRevert}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-500 hover:text-amber-400 transition-colors mx-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                Undo last change
              </button>
            )}

            {messages.length > 0 && !isGenerating && (
              <button
                onClick={clearChat}
                className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors mx-auto block"
              >
                Clear chat
              </button>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="p-3 pb-safe border-t border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm">
        <form onSubmit={handleSubmit} data-chat-form className="flex flex-col gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => {
              // Scroll into view on mobile to handle keyboard
              setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
              }, 300)
            }}
            onKeyDown={(e) => {
              // Enter to submit, Shift+Enter for newline
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
              // Cmd/Ctrl + Enter also submits
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
            placeholder={
              isChatLoading ? "" : 
              mode === 'chat' 
                ? messages.length === 0 ? "Ask me anything..." : "Ask a follow-up question..." 
                : isBlankCanvas ? "A landing page with a hero section and pricing table..." : "Modify the design..."
            }
            className="w-full bg-zinc-900/90 border border-zinc-700/50 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 resize-none transition-all duration-200 shadow-inner"
            rows={2}
            disabled={isGenerating || isChatLoading}
          />
          <div className="flex gap-2">
            {onOpenAssets && (
              <button
                type="button"
                onClick={onOpenAssets}
                className="hidden sm:flex px-3 py-2.5 rounded-xl text-sm font-medium bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all duration-200 items-center gap-2 border border-zinc-700/50 hover:border-zinc-600 active:scale-95"
                title="Upload images"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                Assets
              </button>
            )}
            {(isGenerating || isChatLoading) && onStopGeneration ? (
              <button
                type="button"
                onClick={onStopGeneration}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 bg-red-600 hover:bg-red-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={isGenerating || isChatLoading || !input.trim()}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 ${
                  mode === 'chat'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30'
                    : 'bg-gradient-to-r from-zinc-700 to-zinc-600 hover:from-zinc-600 hover:to-zinc-500 text-white shadow-lg shadow-black/20'
                }`}
              >
                {mode === 'chat' ? 'Send' : isBlankCanvas ? 'Build' : 'Update'}
              </button>
            )}
          </div>
        </form>
      </div>

      <HatchModal
        isOpen={showHatchModal}
        onClose={() => setShowHatchModal(false)}
        reason={hatchReason}
        projectSlug={projectSlug}
        projectName={projectName}
        generationsRemaining={remaining ?? undefined}
      />
    </div>
  )
}

export default memo(Chat)