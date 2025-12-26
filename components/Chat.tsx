'use client'
import { useState, FormEvent, useRef, useEffect } from 'react'
import { canGenerate, recordGeneration, getGenerationsRemaining, getDailyLimit, isPaidUser } from '@/app/lib/generation-limit'
import UpgradeModal from './upgradeModal'

interface Message {
  role: 'user' | 'assistant'
  content: string
  code?: string
  isThinking?: boolean
}

interface ChatProps {
  onGenerate: (prompt: string, history: Message[], currentCode: string) => Promise<void>
  isGenerating: boolean
  currentCode: string
  isPaid?: boolean
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

export default function Chat({ onGenerate, isGenerating, currentCode, isPaid = false }: ChatProps) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setRemaining(getGenerationsRemaining())
  }, [isPaid])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isGenerating) return

    // Check generation limit for free users
    if (!isPaid && !canGenerate()) {
      setShowUpgradeModal(true)
      return
    }

    const userMessage = input.trim()
    setInput('')

    const newUserMessage: Message = { role: 'user', content: userMessage }
    const thinkingMessage: Message = { role: 'assistant', content: getRandomThinking(), isThinking: true }

    setMessages(prev => [...prev, newUserMessage, thinkingMessage])

    await onGenerate(userMessage, messages, currentCode)

    // Record the generation for free users
    if (!isPaid) {
      const result = recordGeneration()
      setRemaining(result.remaining)
    }

    setMessages(prev => {
      const withoutThinking = prev.filter(m => !m.isThinking)
      return [...withoutThinking, { role: 'assistant', content: getRandomResponse(), code: currentCode }]
    })
  }

  const clearChat = () => {
    setMessages([])
  }

  const limit = getDailyLimit()

  return (
    <div className="flex flex-col h-full">
      {/* Generation limit indicator */}
      {remaining !== null && (
        <div className="px-4 py-2 border-b border-zinc-800/50">
          {isPaid ? (
            // Paid users - unlimited
            <div className="flex items-center gap-2">
              <span className="text-lg text-zinc-200">∞</span>
              <span className="text-xs text-zinc-400">Unlimited generations</span>
            </div>
          ) : (
            // Free users - countdown
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={remaining <= 3 ? 'text-amber-400' : 'text-zinc-500'}>
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  <span className={`text-xs ${remaining <= 3 ? 'text-amber-400' : 'text-zinc-500'}`}>
                    {remaining} generations left today
                  </span>
                </div>
                <button 
                  onClick={() => setShowUpgradeModal(true)}
                  className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  Upgrade
                </button>
              </div>
              {/* Progress bar */}
              <div className="mt-1.5 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    remaining <= 3 ? 'bg-amber-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${(remaining / limit) * 100}%` }}
                />
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <p className="text-zinc-300 text-sm font-medium mb-2">Describe. Generate. Ship.</p>
            <p className="text-zinc-600 text-xs max-w-[220px]">Tell us what UI you want. We'll generate production React code in real-time. Not a chatbot — instant component generation.</p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`text-sm px-3 py-2 rounded-2xl max-w-[85%] ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-auto' 
                    : msg.isThinking
                      ? 'bg-zinc-800/80 text-zinc-500 italic animate-pulse'
                      : 'bg-zinc-800/80 text-zinc-300'
                }`}
              >
                {msg.content}
              </div>
            ))}
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

      <div className="p-3 border-t border-zinc-800/50">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
            placeholder={isGenerating ? "" : messages.length === 0 ? "A landing page with a hero section and pricing table..." : "Modify the design..."}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 resize-none transition-all"
            rows={3}
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={isGenerating || !input.trim()}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isGenerating ? 'Generating...' : messages.length === 0 ? 'Generate' : 'Update'}
          </button>
        </form>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason="generation_limit"
      />
    </div>
  )
}