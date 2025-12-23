'use client'

import { useState, useEffect } from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import Chat from '@/components/Chat'
import CodePreview from '@/components/CodePreview'
import LivePreview from '@/components/LivePreview'

interface Message {
  role: 'user' | 'assistant'
  content: string
  code?: string
}

export default function Home() {
  const [code, setCode] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview')

  // Load from localStorage on mount
  useEffect(() => {
    const savedCode = localStorage.getItem('hatchit-code')
    if (savedCode) {
      setCode(savedCode)
    }
  }, [])

  // Save to localStorage when code changes
  useEffect(() => {
    if (code) {
      localStorage.setItem('hatchit-code', code)
    }
  }, [code])

  const handleGenerate = async (prompt: string, history: Message[], currentCode: string) => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, history, currentCode }),
      })
      const data = await response.json()
      if (data.code) {
        setCode(data.code)
      }
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="h-screen bg-zinc-950 p-4">
      <Group orientation="horizontal" className="h-full rounded-xl overflow-hidden border border-zinc-700">
        {/* Chat Panel - Left */}
        <Panel id="chat" defaultSize={30} minSize={20}>
          <div className="h-full flex flex-col bg-zinc-900">
            <div className="p-4 border-b border-zinc-800">
              <h1 className="text-xl font-semibold text-zinc-100">Hatch</h1>
              <p className="text-sm text-zinc-500">Code you can maintain</p>
            </div>
            <Chat onGenerate={handleGenerate} isGenerating={isGenerating} currentCode={code} />
          </div>
        </Panel>

        <Separator className="w-2 bg-zinc-800 hover:bg-zinc-600 transition-colors cursor-col-resize" />

        {/* Right Panel - Tabbed Preview/Code */}
        <Panel id="right" defaultSize={70} minSize={40}>
          <div className="h-full flex flex-col bg-zinc-900">
            {/* Tab Header */}
            <div className="flex items-center justify-between border-b border-zinc-800">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'preview'
                      ? 'text-zinc-100 border-b-2 border-zinc-100'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'code'
                      ? 'text-zinc-100 border-b-2 border-zinc-100'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Code
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto min-h-0">
              {activeTab === 'preview' ? (
                <LivePreview code={code} />
              ) : (
                <CodePreview code={code} />
              )}
            </div>
          </div>
        </Panel>
      </Group>
    </div>
  )
}