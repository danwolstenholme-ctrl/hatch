'use client'
import { useState, FormEvent, useRef, useEffect } from 'react'
import { canGenerate, recordGeneration, getGenerationsRemaining, getDailyLimit, isPaidUser } from '@/app/lib/generation-limit'
import UpgradeModal from './upgradeModal'

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
  externalPrompt?: string | null
  onExternalPromptHandled?: () => void
  generationProgress?: string // Real-time status from generation
  suggestions?: string[] // AI-suggested next steps
  onSuggestionClick?: (suggestion: string) => void
  canRevert?: boolean // Whether revert is available
  onRevert?: () => void // Callback to revert to previous version
}

const thinkingMessages = [
  "Architecting your site...",
  "Spinning up the code...",
  "Weaving the magic...",
  "Compiling your vision...",
  "Crafting the component...",
  "Building in real-time...",
]

const responses = [
  "Code's ready — take a look",
  "Component generated ✓",
  "Preview is live",
  "Fresh React built",
  "Ready to preview",
  "Markup complete",
  "Component shipped",
  "Go break it →",
  "Your turn to edit",
  "Generated and live",
]

function getRandomThinking() {
  return thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)]
}

function getRandomResponse() {
  return responses[Math.floor(Math.random() * responses.length)]
}

export default function Chat({ onGenerate, isGenerating, onStopGeneration, currentCode, isPaid = false, onOpenAssets, projectId = '', projectSlug = '', projectName = '', externalPrompt, onExternalPromptHandled, generationProgress, suggestions = [], onSuggestionClick, canRevert = false, onRevert }: ChatProps) {
  const [input, setInput] = useState('')
  const [buildMessages, setBuildMessages] = useState<Message[]>([])
  const [chatMessages, setChatMessages] = useState<Message[]>([])
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState<'generation_limit' | 'proactive' | 'running_low'>('proactive')
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
      // Chat mode - use assistant API
      setIsChatLoading(true)
      try {
        const response = await fetch('/api/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: userMessage, 
            currentCode 
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
        setUpgradeReason('generation_limit')
        setShowUpgradeModal(true)
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

  return (
    <div className="flex flex-col h-full">
      {/* Generation limit indicator - compact */}
      {remaining !== null && !isPaid && (
        <div className="px-3 py-1.5 border-b border-zinc-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={remaining <= 3 ? 'text-amber-400' : 'text-zinc-500'}>
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span className={`text-xs ${remaining <= 3 ? 'text-amber-400' : 'text-zinc-500'}`}>
                {remaining}/{limit}
              </span>
            </div>
            <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${remaining <= 3 ? 'bg-amber-500' : 'bg-blue-500'}`}
                style={{ width: `${(remaining / limit) * 100}%` }}
              />
            </div>
          </div>
          <button 
            onClick={() => {
              setUpgradeReason(remaining !== null && remaining <= 3 ? 'running_low' : 'proactive')
              setShowUpgradeModal(true)
            }}
            className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            Upgrade
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Mode toggle */}
        <div className="flex items-center gap-1 p-1.5 bg-zinc-900/95 backdrop-blur-sm rounded-xl sticky top-0 z-10 mb-2 border border-zinc-800/50 shadow-lg">
          <button
            onClick={() => setMode('build')}
            title="Create and edit your website"
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'build' 
                ? 'bg-zinc-700 text-white shadow-md' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            ⚡ Build
          </button>
          <button
            onClick={() => setMode('chat')}
            title="Get help without changing code"
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'chat' 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            💬 Ask AI
          </button>
        </div>

        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center mb-3">
              <span className="text-xl">{mode === 'chat' ? '💬' : '⚡'}</span>
            </div>
            <p className="text-zinc-300 text-sm font-medium mb-1">{mode === 'chat' ? 'Ask me anything' : 'What would you like to build?'}</p>
            <p className="text-zinc-600 text-xs max-w-[220px] mb-4">{mode === 'chat' ? 'Get advice without changing your code.' : 'Describe your idea — we\'ll build real React code in seconds.'}</p>
            
            {mode === 'build' && (
              <div className="w-full space-y-2">
                <p className="text-xs text-zinc-500 font-medium mb-2">Click to try:</p>
                {[
                  { prompt: 'A modern landing page for a SaaS product with hero, features, and pricing', label: '🚀 SaaS Landing Page' },
                  { prompt: 'A portfolio site with dark theme, project gallery, and contact form', label: '🎨 Portfolio Site' },
                  { prompt: 'A restaurant website with menu, hours, location map, and reservations', label: '🍽️ Restaurant Site' }
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(item.prompt)
                      // Auto-submit after setting input
                      setTimeout(() => {
                        const form = document.querySelector('form[data-chat-form]') as HTMLFormElement
                        if (form) form.requestSubmit()
                      }, 100)
                    }}
                    className="w-full text-left px-3 py-2.5 text-xs bg-zinc-800/50 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-all border border-zinc-700/30 hover:border-zinc-600 group"
                  >
                    <span className="font-medium">{item.label}</span>
                    <span className="block text-zinc-500 group-hover:text-zinc-400 mt-0.5 text-[11px]">{item.prompt.slice(0, 50)}...</span>
                  </button>
                ))}
                <p className="text-[10px] text-zinc-600 text-center mt-3">💡 Or describe your own idea above</p>
              </div>
            )}

            {mode === 'chat' && (
              <div className="w-full space-y-2">
                <p className="text-xs text-zinc-500 font-medium mb-2">Try asking:</p>
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
            )}
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`text-sm px-3 py-2 rounded-2xl max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                  msg.role === 'user' 
                    ? 'bg-zinc-700 text-white ml-auto' 
                    : msg.isThinking
                      ? 'bg-zinc-800/80 text-zinc-500 italic'
                      : mode === 'chat'
                      ? 'bg-emerald-900/40 border border-emerald-700/30 text-zinc-300'
                      : 'bg-zinc-800/80 text-zinc-300'
                }`}
              >
                {msg.role === 'assistant' && msg.isThinking ? (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
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

      <div className="p-3 pb-safe border-t border-zinc-800/50">
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
                : messages.length === 0 ? "A landing page with a hero section and pricing table..." : "Modify the design..."
            }
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 resize-none transition-all"
            rows={2}
            disabled={isGenerating || isChatLoading}
          />
          <div className="flex gap-2">
            {onOpenAssets && (
              <button
                type="button"
                onClick={onOpenAssets}
                className="hidden sm:flex px-3 py-2 rounded-xl text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all items-center gap-2"
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
                className="flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all bg-red-600 hover:bg-red-500 text-white flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={isGenerating || isChatLoading || !input.trim()}
                className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  mode === 'chat'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
                    : 'bg-zinc-700 hover:bg-zinc-600 text-white'
                }`}
              >
                {mode === 'chat' ? 'Send' : messages.length === 0 ? 'Build' : 'Update'}
              </button>
            )}
          </div>
        </form>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason={upgradeReason}
        projectSlug={projectSlug}
        projectName={projectName}
        generationsRemaining={remaining ?? undefined}
      />
    </div>
  )
}