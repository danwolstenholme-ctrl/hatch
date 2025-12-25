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
}

const thinkingMessages = [
  "On it...",
  "Building that...",
  "Working on it...",
  "Let me cook...",
  "Generating...",
  "On the case...",
]

const responses = [
  "Done — take a look →",
  "There you go ✓",
  "Ready for you",
  "Built it →",
  "All set",
  "That's live now",
  "Fresh out the oven 🍳",
  "Shipped it →",
  "Your turn to break it",
  "Made the thing",
]

function getRandomThinking() {
  return thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)]
}

function getRandomResponse() {
  return responses[Math.floor(Math.random() * responses.length)]
}

export default function Chat({ onGenerate, isGenerating, currentCode }: ChatProps) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [isPaid, setIsPaid] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setRemaining(getGenerationsRemaining())
    setIsPaid(isPaidUser())
  }, [])

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
      {/* Generation limit indicator for free users */}
      {!isPaid && remaining !== null && (
        <div className="px-4 py-2 border-b border-zinc-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={remaining <= 5 ? 'text-amber-400' : 'text-zinc-500'}>
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span className={`text-xs ${remaining <= 5 ? 'text-amber-400' : 'text-zinc-500'}`}>
                {remaining} generations left today
              </span>
            </div>
            {remaining <= 10 && (
              <button 
                onClick={() => setShowUpgradeModal(true)}
                className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Upgrade
              </button>
            )}
          </div>
          {/* Progress bar */}
          <div className="mt-1.5 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                remaining <= 5 ? 'bg-amber-500' : 'bg-blue-500'
              }`}
              style={{ width: `${(remaining / limit) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4">
              <span className="text-2xl">✨</span>
            </div>
            <p className="text-zinc-300 text-sm font-medium mb-1">What do you want to build?</p>
            <p className="text-zinc-600 text-xs max-w-[200px]">Describe a component, page, or full site and watch it come to life.</p>
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
            placeholder={isGenerating ? "" : messages.length === 0 ? "A landing page for my coffee shop..." : "What's next?"}
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