'use client'

import { useState } from 'react'
import UpgradeModal from './upgradeModal'

interface CodePreviewProps {
  code: string
  isPaid?: boolean
  onCodeChange?: (newCode: string) => void
}

export default function CodePreview({ code, isPaid = false, onCodeChange }: CodePreviewProps) {
  const [copied, setCopied] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

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
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <span className="text-zinc-600">📁</span>
          <span>app/</span>
          <span className="text-purple-400 font-semibold">page.tsx</span>
          {!isPaid && (
            <span className="ml-2 px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs font-medium">(Preview)</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onCodeChange && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              {isEditing ? 'Done' : 'Edit'}
            </button>
          )}
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
      </div>

      <div className="flex-1 overflow-auto relative bg-zinc-950">
        {isEditing ? (
          <textarea
            value={code}
            onChange={(e) => onCodeChange?.(e.target.value)}
            className="w-full h-full p-4 bg-zinc-950 text-zinc-300 font-mono text-sm leading-relaxed resize-none focus:outline-none"
            spellCheck={false}
          />
        ) : (
          <>
            <pre className="p-4 text-sm font-mono leading-relaxed">
              <code>
                {visibleLines.map((line, i) => (
                  <div key={i} className="flex hover:bg-zinc-900/30 transition-colors">
                    <span className="w-10 text-zinc-700 text-right pr-4 select-none flex-shrink-0 text-xs">
                      {String(i + 1).padStart(3, ' ')}
                    </span>
                    <span className="text-zinc-300">{line || '\u00A0'}</span>
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
          </>
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