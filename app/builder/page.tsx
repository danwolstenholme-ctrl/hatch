'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
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
  const [codeHistory, setCodeHistory] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview')
  const [previewWidth, setPreviewWidth] = useState(0)
  const [showClearModal, setShowClearModal] = useState(false)
  const previewContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedCode = localStorage.getItem('hatchit-code')
    const savedHistory = localStorage.getItem('hatchit-history')
    if (savedCode) {
      setCode(savedCode)
    }
    if (savedHistory) {
      setCodeHistory(JSON.parse(savedHistory))
    }
  }, [])

  useEffect(() => {
    if (code) {
      localStorage.setItem('hatchit-code', code)
    }
  }, [code])

  useEffect(() => {
    localStorage.setItem('hatchit-history', JSON.stringify(codeHistory))
  }, [codeHistory])

  useEffect(() => {
    if (!previewContainerRef.current) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setPreviewWidth(entry.contentRect.width)
      }
    })

    observer.observe(previewContainerRef.current)
    return () => observer.disconnect()
  }, [])

  const breakpoint = previewWidth < 640 ? 'Mobile' : previewWidth < 1024 ? 'Tablet' : 'Desktop'

  const handleGenerate = async (prompt: string, history: Message[], currentCode: string) => {
    setIsGenerating(true)
    
    if (code) {
      setCodeHistory(prev => [...prev, code])
    }
    
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

  const handleUndo = () => {
    if (codeHistory.length > 0) {
      const previousCode = codeHistory[codeHistory.length - 1]
      setCodeHistory(prev => prev.slice(0, -1))
      setCode(previousCode)
    }
  }

  const handleClearProject = () => {
    setCode('')
    setCodeHistory([])
    localStorage.removeItem('hatchit-code')
    localStorage.removeItem('hatchit-history')
    setShowClearModal(false)
  }

  return (
    <div className="h-screen bg-zinc-950 p-3">
      {/* Clear Project Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">Start New Project?</h2>
            <p className="text-zinc-400 text-sm mb-6">This will clear all current code and chat history. This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearProject}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors"
              >
                Clear Project
              </button>
            </div>
          </div>
        </div>
      )}

      <Group orientation="horizontal" className="h-full rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
        {/* Chat Panel - Left */}
        <Panel id="chat" defaultSize={28} minSize={20}>
          <div className="h-full flex flex-col bg-zinc-900">
            {/* Header */}
            <div className="px-4 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-baseline space-x-3">
                <Link href="/" className="text-xl font-black hover:opacity-80 transition-opacity">
                  <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">Hatch</span>
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">It</span>
                </Link>
                <span className="text-zinc-700">|</span>
                <span className="text-zinc-500 text-sm">Builder</span>
              </div>
              <div className="flex items-center gap-1">
                {codeHistory.length > 0 && (
                  <button
                    onClick={handleUndo}
                    className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                    title={`Undo (${codeHistory.length} in history)`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 7v6h6"/>
                      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
                    </svg>
                  </button>
                )}
                {code && (
                  <button
                    onClick={() => setShowClearModal(true)}
                    className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                    title="New Project"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <Chat onGenerate={handleGenerate} isGenerating={isGenerating} currentCode={code} />
          </div>
        </Panel>

        <Separator className="w-px bg-zinc-800 hover:bg-purple-500/50 transition-colors cursor-col-resize" />

        {/* Right Panel - Tabbed Preview/Code */}
        <Panel id="right" defaultSize={72} minSize={40}>
          <div className="h-full flex flex-col bg-zinc-900">
            {/* Tab Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-4">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-3 text-sm font-medium transition-all relative ${
                    activeTab === 'preview'
                      ? 'text-white'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Preview
                  {activeTab === 'preview' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-4 py-3 text-sm font-medium transition-all relative ${
                    activeTab === 'code'
                      ? 'text-white'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Code
                  {activeTab === 'code' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  )}
                </button>
              </div>
              {activeTab === 'preview' && previewWidth > 0 && (
                <div className="flex items-center gap-2 text-xs text-zinc-600">
                  <span className="px-2 py-1 bg-zinc-800/50 rounded-md">{breakpoint}</span>
                  <span className="text-zinc-700">•</span>
                  <span className="font-mono">{Math.round(previewWidth)}px</span>
                </div>
              )}
            </div>

            {/* Tab Content */}
            <div ref={previewContainerRef} className="flex-1 overflow-auto min-h-0">
              {activeTab === 'preview' ? (
                <LivePreview code={code} isLoading={isGenerating} />
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