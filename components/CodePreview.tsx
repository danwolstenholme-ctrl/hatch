'use client'

import { useState, useCallback } from 'react'
import HatchModal from './HatchModal'

interface CodePreviewProps {
  code: string
  isPaid?: boolean
  onCodeChange?: (newCode: string) => void
  pagePath?: string // e.g. '/' or '/contact'
}

// Basic syntax validation for JSX/TSX code
function validateSyntax(code: string): { valid: boolean; error?: string } {
  // Check for balanced braces (but ignore braces inside strings)
  let braceCount = 0
  let parenCount = 0
  let bracketCount = 0
  let inString = false
  let stringChar = ''
  let inTemplate = false
  
  for (let i = 0; i < code.length; i++) {
    const char = code[i]
    const prevChar = i > 0 ? code[i - 1] : ''
    
    // Handle string detection (skip escaped quotes)
    if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
      if (!inString && !inTemplate) {
        if (char === '`') {
          inTemplate = true
        } else {
          inString = true
          stringChar = char
        }
      } else if (inTemplate && char === '`') {
        inTemplate = false
      } else if (inString && char === stringChar) {
        inString = false
        stringChar = ''
      }
      continue
    }
    
    // Skip counting inside strings
    if (inString || inTemplate) continue
    
    if (char === '{') braceCount++
    if (char === '}') braceCount--
    if (char === '(') parenCount++
    if (char === ')') parenCount--
    if (char === '[') bracketCount++
    if (char === ']') bracketCount--
    
    if (braceCount < 0) return { valid: false, error: 'Unexpected closing brace }' }
    if (parenCount < 0) return { valid: false, error: 'Unexpected closing parenthesis )' }
    if (bracketCount < 0) return { valid: false, error: 'Unexpected closing bracket ]' }
  }
  
  if (braceCount !== 0) return { valid: false, error: `Unbalanced braces: ${braceCount > 0 ? 'missing }' : 'extra }'}` }
  if (parenCount !== 0) return { valid: false, error: `Unbalanced parentheses: ${parenCount > 0 ? 'missing )' : 'extra )'}` }
  if (bracketCount !== 0) return { valid: false, error: `Unbalanced brackets: ${bracketCount > 0 ? 'missing ]' : 'extra ]'}` }
  
  // Skip JSX tag validation - it's too unreliable with complex code
  // Let Babel handle actual JSX syntax errors in the preview
  
  // Check for export default (but be lenient - code might be a component that gets wrapped)
  const hasExport = code.includes('export default') || 
                    code.includes('export function') ||
                    code.includes('function ') ||
                    code.includes('const ') ||
                    code.includes('class ')
  
  if (!hasExport) {
    return { valid: false, error: 'No component or function found' }
  }
  
  return { valid: true }
}

export default function CodePreview({ code, isPaid = false, onCodeChange, pagePath = '/' }: CodePreviewProps) {
  const [copied, setCopied] = useState(false)
  const [showHatchModal, setShowHatchModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedCode, setEditedCode] = useState(code)
  const [syntaxError, setSyntaxError] = useState<string | null>(null)

  const lines = code.split('\n')
  const visibleLines = isPaid ? lines : lines.slice(0, 15)
  const hiddenCount = isPaid ? 0 : Math.max(0, lines.length - 15)

  const handleCopy = async () => {
    if (!isPaid) {
      setShowHatchModal(true)
      return
    }
    
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEditToggle = useCallback(() => {
    if (!isPaid) {
      setShowHatchModal(true)
      return
    }
    
    if (isEditing) {
      // Validate before saving
      const validation = validateSyntax(editedCode)
      if (!validation.valid) {
        setSyntaxError(validation.error || 'Invalid syntax')
        return
      }
      setSyntaxError(null)
      onCodeChange?.(editedCode)
    } else {
      setEditedCode(code)
      setSyntaxError(null)
    }
    setIsEditing(!isEditing)
  }, [isEditing, editedCode, code, onCodeChange, isPaid])

  const handleCodeEdit = useCallback((newCode: string) => {
    setEditedCode(newCode)
    // Clear error when user starts typing
    if (syntaxError) {
      const validation = validateSyntax(newCode)
      if (validation.valid) {
        setSyntaxError(null)
      }
    }
  }, [syntaxError])

  return (
    <div className="h-full bg-zinc-950 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <span className="text-zinc-600">📁</span>
          <span>app{pagePath === '/' ? '/' : pagePath + '/'}</span>
          <span className="text-purple-400 font-semibold">page.tsx</span>
          {!isPaid && (
            <span className="ml-2 px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs font-medium">(Preview)</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onCodeChange && (
            <button
              onClick={handleEditToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                isEditing 
                  ? 'bg-green-600 hover:bg-green-500 text-white' 
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white'
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {isEditing ? (
                  <path d="M20 6L9 17l-5-5" />
                ) : (
                  <>
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </>
                )}
              </svg>
              {isEditing ? 'Save' : 'Edit'}
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
        {syntaxError && (
          <div className="absolute top-2 left-2 right-2 z-10 px-3 py-2 bg-red-900/90 border border-red-700 rounded-lg text-red-200 text-xs font-mono flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {syntaxError}
          </div>
        )}
        {isEditing ? (
          <textarea
            value={editedCode}
            onChange={(e) => handleCodeEdit(e.target.value)}
            className={`w-full h-full p-4 bg-zinc-950 text-zinc-300 font-mono text-sm leading-relaxed resize-none focus:outline-none ${
              syntaxError ? 'pt-12' : ''
            }`}
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
                      Hatch to view and copy your full code
                    </p>
                    <button
                      onClick={() => setShowHatchModal(true)}
                      className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm rounded-lg font-medium transition-all"
                    >
                      🐣 Hatch Project — $24
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <HatchModal
        isOpen={showHatchModal}
        onClose={() => setShowHatchModal(false)}
        reason="code_access"
      />
    </div>
  )
}