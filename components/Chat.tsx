'use client'

import { useState, useEffect, FormEvent } from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'

interface Message {
  role: 'user' | 'assistant'
  content: string
  code?: string
}

interface ChatProps {
  onGenerate: (prompt: string, history: Message[], currentCode: string) => Promise<void>
  isGenerating: boolean
  currentCode: string
}

const responses = [
  "Done ✓",
  "Here you go",
  "That's ready",
  "All yours",
  "There we go",
  "Ready to roll",
  "Sorted",
]

function getRandomResponse() {
  return responses[Math.floor(Math.random() * responses.length)]
}

function LoadingIndicator() {
  const [stage, setStage] = useState(0);
  const stages = ['Thinking', 'Building'];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (stage < stages.length - 1) {
        setStage(s => s + 1);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [stage]);

  return (
    <div className="text-sm text-zinc-500 flex items-center gap-1">
      <span>{stages[stage]}</span>
      <span className="flex gap-0.5">
        <span className="animate-bounce [animation-delay:0ms]">.</span>
        <span className="animate-bounce [animation-delay:150ms]">.</span>
        <span className="animate-bounce [animation-delay:300ms]">.</span>
      </span>
    </div>
  );
}

export default function Chat({ onGenerate, isGenerating, currentCode }: ChatProps) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isGenerating) return

    const userMessage = input.trim()
    setInput('')

    const newUserMessage: Message = { role: 'user', content: userMessage }
    const updatedMessages = [...messages, newUserMessage]
    setMessages(updatedMessages)

    await onGenerate(userMessage, messages, currentCode)
    setMessages(prev => [...prev, { role: 'assistant', content: getRandomResponse(), code: currentCode }])
  }

  const clearChat = () => {
    setMessages([])
  }

  return (
    <Group orientation="vertical" className="flex-1">
      {/* Messages */}
      <Panel id="messages" defaultSize={70} minSize={30}>
        <div className="h-full overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-zinc-500 text-sm">
              Describe a component and I'll generate clean React + Tailwind code. Then ask for changes to iterate.
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`text-sm px-3 py-2 rounded-lg max-w-[85%] ${
                    msg.role === 'user' 
                      ? 'bg-zinc-700 text-zinc-100 ml-auto' 
                      : 'bg-zinc-800/50 text-zinc-400'
                  }`}
                >
                  {msg.content}
                </div>
              ))}
              {messages.length > 0 && !isGenerating && (
                <button
                  onClick={clearChat}
                  className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  Clear & start new
                </button>
              )}
            </>
          )}
          {isGenerating && <LoadingIndicator />}
        </div>
      </Panel>

      <Separator className="h-2 bg-zinc-800 hover:bg-zinc-600 transition-colors cursor-row-resize" />

      {/* Input */}
      <Panel id="input" defaultSize={30} minSize={15}>
        <form onSubmit={handleSubmit} className="h-full p-4 flex flex-col">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
            placeholder={isGenerating ? "" : messages.length === 0 ? "A pricing card with three tiers..." : "What's next?"}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 resize-none"
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={isGenerating || !input.trim()}
            className="mt-3 px-4 py-2 bg-zinc-100 text-zinc-900 rounded-lg text-sm font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {messages.length === 0 ? 'Generate' : 'Update'}
          </button>
        </form>
      </Panel>
    </Group>
  )
}