'use client'

import { useState } from 'react'
import UpgradeModal from './upgradeModal'

interface CodePreviewProps {
  code: string
  isPaid?: boolean
}

export default function CodePreview({ code, isPaid = false }: CodePreviewProps) {
  const [copied, setCopied] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const lines = code.split('\n')
  const visibleLines = isPaid ? lines : lines.slice(0, 15)
  const hiddenCount = isPaid ? 0 : Math.max(0, lines.length - 15)

  const handleCopy = async () => {
    if (!isPaid) {
      setShowUpgradeModal(true)
      return
    }
    
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full bg-zinc-950 flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
        <span className="text-xs text-zinc-500 font-medium">
          component.tsx
          {!isPaid && (
            <span className="ml-2 text-amber-500">(Preview)</span>
          )}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors"
        >
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {isPaid ? 'Copy' : 'Copy Code'}
            </>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-auto relative">
        <pre className="p-4 text-sm font-mono">
          <code>
            {visibleLines.map((line, i) => (
              <div key={i} className="flex">
                <span className="w-8 text-zinc-600 text-right pr-4 select-none text-xs">
                  {i + 1}
                </span>
                <span className="text-zinc-300 whitespace-pre">{line}</span>
              </div>
            ))}
          </code>
        </pre>

        {!isPaid && hiddenCount > 0 && (
          <div className="absolute bottom-0 left-0 right-0">
            <div className="h-32 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent" />
            
            <div className="bg-zinc-950 px-4 pb-4">
              <pre className="text-sm font-mono blur-sm select-none pointer-events-none opacity-50">
                <code>
                  {lines.slice(15, 25).map((line, i) => (
                    <div key={i} className="flex">
                      <span className="w-8 text-zinc-600 text-right pr-4 text-xs">
                        {i + 16}
                      </span>
                      <span className="text-zinc-300 whitespace-pre">{line}</span>
                    </div>
                  ))}
                </code>
              </pre>
            </div>

            <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-center pb-8 pt-16 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent">
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 text-center max-w-sm mx-4">
                <div className="text-2xl mb-2">🔒</div>
                <h3 className="text-white font-semibold mb-1">
                  {hiddenCount} more lines
                </h3>
                <p className="text-zinc-400 text-sm mb-4">
                  Upgrade to view and copy your full code
                </p>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm rounded-lg font-medium transition-all"
                >
                  Unlock Code — $49/mo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason="code_access"
      />
    </div>
  )
}