'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// =============================================================================
// ELEMENT INSPECTOR SIDEBAR
// Edit properties of the selected element
// =============================================================================

interface ElementInfo {
  id: string
  tagName: string
  className: string
  textContent: string | null
  rect: DOMRect
  path: string[]
  innerHTML: string
}

interface ElementInspectorProps {
  element: ElementInfo | null
  onClassChange: (newClassName: string) => void
  onTextChange: (newText: string) => void
  onDelete: () => void
  onAskAI: (prompt: string) => void
}

// Tailwind class categories for toggles
const TAILWIND_CATEGORIES = {
  typography: {
    label: 'Typography',
    classes: {
      'Size': ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl'],
      'Weight': ['font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold'],
      'Color': ['text-white', 'text-zinc-100', 'text-zinc-300', 'text-zinc-400', 'text-zinc-500', 'text-emerald-400', 'text-emerald-500'],
      'Align': ['text-left', 'text-center', 'text-right'],
    }
  },
  spacing: {
    label: 'Spacing',
    classes: {
      'Padding': ['p-0', 'p-2', 'p-4', 'p-6', 'p-8', 'p-10', 'p-12', 'p-16', 'p-20'],
      'Margin': ['m-0', 'm-2', 'm-4', 'm-6', 'm-8', 'm-auto'],
      'Gap': ['gap-0', 'gap-2', 'gap-4', 'gap-6', 'gap-8'],
    }
  },
  layout: {
    label: 'Layout',
    classes: {
      'Display': ['block', 'inline-block', 'flex', 'inline-flex', 'grid', 'hidden'],
      'Flex Dir': ['flex-row', 'flex-col'],
      'Justify': ['justify-start', 'justify-center', 'justify-end', 'justify-between', 'justify-around'],
      'Align': ['items-start', 'items-center', 'items-end', 'items-stretch'],
      'Width': ['w-full', 'w-auto', 'w-1/2', 'w-1/3', 'w-2/3', 'max-w-md', 'max-w-lg', 'max-w-xl', 'max-w-2xl', 'max-w-4xl', 'max-w-6xl'],
    }
  },
  background: {
    label: 'Background',
    classes: {
      'Color': ['bg-transparent', 'bg-zinc-900', 'bg-zinc-800', 'bg-zinc-950', 'bg-emerald-500', 'bg-emerald-500/10', 'bg-emerald-500/20'],
      'Gradient': ['bg-gradient-to-r', 'bg-gradient-to-br', 'from-emerald-500', 'to-teal-500', 'from-zinc-900', 'to-zinc-950'],
    }
  },
  borders: {
    label: 'Borders',
    classes: {
      'Radius': ['rounded-none', 'rounded', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-full'],
      'Width': ['border-0', 'border', 'border-2'],
      'Color': ['border-zinc-800', 'border-zinc-700', 'border-zinc-600', 'border-emerald-500', 'border-emerald-500/50'],
    }
  },
  effects: {
    label: 'Effects',
    classes: {
      'Shadow': ['shadow-none', 'shadow-sm', 'shadow', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl'],
      'Opacity': ['opacity-100', 'opacity-75', 'opacity-50', 'opacity-25', 'opacity-0'],
    }
  },
}

export default function ElementInspector({
  element,
  onClassChange,
  onTextChange,
  onDelete,
  onAskAI,
}: ElementInspectorProps) {
  const [activeCategory, setActiveCategory] = useState<string>('typography')
  const [showCodeEditor, setShowCodeEditor] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [editedClasses, setEditedClasses] = useState(element?.className || '')

  const currentClasses = editedClasses.split(' ').filter(Boolean)

  const toggleClass = useCallback((className: string) => {
    const classes = new Set(currentClasses)
    
    // Find if this is a mutually exclusive class (same category)
    for (const category of Object.values(TAILWIND_CATEGORIES)) {
      for (const [, groupClasses] of Object.entries(category.classes)) {
        if (groupClasses.includes(className)) {
          // Remove other classes from same group
          groupClasses.forEach(c => classes.delete(c))
          break
        }
      }
    }

    // Toggle the class
    if (currentClasses.includes(className)) {
      classes.delete(className)
    } else {
      classes.add(className)
    }

    const newClassName = Array.from(classes).join(' ')
    setEditedClasses(newClassName)
    onClassChange(newClassName)
  }, [currentClasses, onClassChange])

  const handleAIRequest = () => {
    if (aiPrompt.trim()) {
      onAskAI(aiPrompt)
      setAiPrompt('')
    }
  }

  if (!element) {
    return (
      <div className="w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-800">
          <h3 className="text-sm font-medium text-white">Element Inspector</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-zinc-500">
            <div className="text-3xl mb-2">👆</div>
            <p className="text-sm">Click an element in the preview to inspect and edit it</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              <span className="text-blue-400">&lt;{element.tagName}&gt;</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-1 truncate" title={element.path.join(' > ')}>
              {element.path.slice(-2).join(' > ')}
            </p>
          </div>
          <button
            onClick={onDelete}
            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Delete element"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Text content editor (if applicable) */}
      {element.textContent && (
        <div className="p-4 border-b border-zinc-800">
          <label className="text-xs text-zinc-500 block mb-2">Text Content</label>
          <textarea
            value={element.textContent}
            onChange={(e) => onTextChange(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
        </div>
      )}

      {/* Category tabs */}
      <div className="flex border-b border-zinc-800 overflow-x-auto">
        {Object.entries(TAILWIND_CATEGORIES).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`px-3 py-2 text-xs whitespace-nowrap transition-colors ${
              activeCategory === key
                ? 'text-white border-b-2 border-emerald-500'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Class toggles */}
      <div className="flex-1 overflow-y-auto p-4">
        {Object.entries(TAILWIND_CATEGORIES[activeCategory as keyof typeof TAILWIND_CATEGORIES]?.classes || {}).map(([group, classes]) => (
          <div key={group} className="mb-4">
            <div className="text-xs text-zinc-500 mb-2">{group}</div>
            <div className="flex flex-wrap gap-1">
              {classes.map((cls) => (
                <button
                  key={cls}
                  onClick={() => toggleClass(cls)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    currentClasses.includes(cls)
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  {cls.replace('text-', '').replace('bg-', '').replace('font-', '')}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Code editor toggle */}
      <div className="border-t border-zinc-800">
        <button
          onClick={() => setShowCodeEditor(!showCodeEditor)}
          className="w-full px-4 py-3 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-between"
        >
          <span>Edit classes as code</span>
          <span>{showCodeEditor ? '▼' : '▶'}</span>
        </button>
        
        <AnimatePresence>
          {showCodeEditor && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4">
                <textarea
                  value={editedClasses}
                  onChange={(e) => {
                    setEditedClasses(e.target.value)
                    onClassChange(e.target.value)
                  }}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-xs text-white font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter Tailwind classes..."
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI assist */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
        <div className="text-xs text-zinc-500 mb-2">Ask AI to change this</div>
        <div className="flex gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAIRequest()}
            placeholder="Make it bigger, add shadow..."
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            onClick={handleAIRequest}
            disabled={!aiPrompt.trim()}
            className="px-3 py-2 bg-violet-500/20 text-violet-400 rounded-lg hover:bg-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✨
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// =============================================================================
// COMBINED VISUAL EDITOR WITH INSPECTOR
// =============================================================================

interface VisualEditorPageProps {
  onAskAI: (prompt: string, element: ElementInfo) => void
}

export function VisualEditorPage({
  onAskAI,
}: VisualEditorPageProps) {
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(null)
  const iframeRef = { current: null as HTMLIFrameElement | null }

  const handleClassChange = (newClassName: string) => {
    iframeRef.current?.contentWindow?.postMessage({ 
      type: 'update-class', 
      className: newClassName 
    }, '*')
  }

  const handleTextChange = (newText: string) => {
    iframeRef.current?.contentWindow?.postMessage({ 
      type: 'update-text', 
      text: newText 
    }, '*')
  }

  const handleDelete = () => {
    iframeRef.current?.contentWindow?.postMessage({ 
      type: 'delete-element' 
    }, '*')
    setSelectedElement(null)
  }

  const handleAskAI = (prompt: string) => {
    if (selectedElement) {
      onAskAI(prompt, selectedElement)
    }
  }

  return (
    <div className="flex h-full">
      {/* Visual Editor */}
      <div className="flex-1">
        {/* VisualEditor component would be rendered here */}
      </div>

      {/* Inspector Sidebar */}
      <ElementInspector
        key={selectedElement?.id ?? 'no-selection'}
        element={selectedElement}
        onClassChange={handleClassChange}
        onTextChange={handleTextChange}
        onDelete={handleDelete}
        onAskAI={handleAskAI}
      />
    </div>
  )
}
