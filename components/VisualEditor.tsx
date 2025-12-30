'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// =============================================================================
// VISUAL EDITOR
// Click-to-edit interface for the preview
// =============================================================================

interface ElementInfo {
  id: string
  tagName: string
  className: string
  textContent: string | null
  rect: DOMRect
  path: string[] // Path to element in DOM tree
  innerHTML: string
}

interface VisualEditorProps {
  code: string
  onCodeChange: (newCode: string) => void
  onElementSelect?: (element: ElementInfo | null) => void
}

export default function VisualEditor({
  code,
  onCodeChange,
  onElementSelect,
}: VisualEditorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [history, setHistory] = useState<string[]>([code])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [editingText, setEditingText] = useState(false)
  const [editValue, setEditValue] = useState('')

  // Generate the preview HTML with injected styles and scripts
  const generatePreviewHtml = useCallback((sourceCode: string) => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            zinc: {
              800: '#27272a',
              900: '#18181b',
              950: '#09090b',
            },
            emerald: {
              400: '#34d399',
              500: '#10b981',
            },
            teal: {
              400: '#2dd4bf',
              500: '#14b8a6',
            },
          }
        }
      }
    }
  </script>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: #09090b; color: white; font-family: system-ui, sans-serif; }
    
    /* Visual editor overlay styles */
    .ve-hovered {
      outline: 2px dashed rgba(59, 130, 246, 0.5) !important;
      outline-offset: 2px;
    }
    .ve-selected {
      outline: 2px solid #3b82f6 !important;
      outline-offset: 2px;
    }
    .ve-editable:hover {
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div id="preview-root">
    ${sourceCode}
  </div>
  <script>
    // Track all elements for selection
    let selectedEl = null;
    let hoveredEl = null;

    function getElementPath(el) {
      const path = [];
      let current = el;
      while (current && current !== document.body) {
        let selector = current.tagName.toLowerCase();
        if (current.id) selector += '#' + current.id;
        if (current.className && typeof current.className === 'string') {
          selector += '.' + current.className.split(' ').filter(c => c && !c.startsWith('ve-')).join('.');
        }
        path.unshift(selector);
        current = current.parentElement;
      }
      return path;
    }

    function getElementInfo(el) {
      if (!el || el === document.body || el.id === 'preview-root') return null;
      const rect = el.getBoundingClientRect();
      return {
        id: el.id || Math.random().toString(36).slice(2),
        tagName: el.tagName.toLowerCase(),
        className: el.className || '',
        textContent: el.childNodes.length === 1 && el.childNodes[0].nodeType === 3 
          ? el.textContent 
          : null,
        rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
        path: getElementPath(el),
        innerHTML: el.innerHTML,
      };
    }

    document.body.addEventListener('mouseover', (e) => {
      if (e.target === document.body || e.target.id === 'preview-root') return;
      if (hoveredEl) hoveredEl.classList.remove('ve-hovered');
      hoveredEl = e.target;
      if (hoveredEl !== selectedEl) {
        hoveredEl.classList.add('ve-hovered');
      }
      window.parent.postMessage({ 
        type: 'element-hover', 
        element: getElementInfo(e.target) 
      }, '*');
    });

    document.body.addEventListener('mouseout', (e) => {
      if (hoveredEl) {
        hoveredEl.classList.remove('ve-hovered');
        hoveredEl = null;
      }
    });

    document.body.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (e.target === document.body || e.target.id === 'preview-root') {
        if (selectedEl) selectedEl.classList.remove('ve-selected');
        selectedEl = null;
        window.parent.postMessage({ type: 'element-select', element: null }, '*');
        return;
      }

      if (selectedEl) selectedEl.classList.remove('ve-selected');
      selectedEl = e.target;
      selectedEl.classList.add('ve-selected');
      
      window.parent.postMessage({ 
        type: 'element-select', 
        element: getElementInfo(e.target) 
      }, '*');
    });

    // Listen for updates from parent
    window.addEventListener('message', (e) => {
      if (e.data.type === 'update-text' && selectedEl) {
        selectedEl.textContent = e.data.text;
        window.parent.postMessage({ 
          type: 'code-updated', 
          html: document.getElementById('preview-root').innerHTML 
        }, '*');
      }
      if (e.data.type === 'update-class' && selectedEl) {
        selectedEl.className = e.data.className;
      }
      if (e.data.type === 'delete-element' && selectedEl) {
        selectedEl.remove();
        selectedEl = null;
        window.parent.postMessage({ 
          type: 'code-updated', 
          html: document.getElementById('preview-root').innerHTML 
        }, '*');
      }
    });

    window.parent.postMessage({ type: 'preview-ready' }, '*');
  </script>
</body>
</html>`
  }, [])

  // Handle messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'element-select') {
        setSelectedElement(event.data.element)
        onElementSelect?.(event.data.element)
        if (event.data.element?.textContent) {
          setEditValue(event.data.element.textContent)
        }
      }
      if (event.data.type === 'preview-ready') {
        setIsLoading(false)
      }
      if (event.data.type === 'code-updated') {
        const newCode = event.data.html
        onCodeChange(newCode)
        // Add to history
        setHistory(prev => [...prev.slice(0, historyIndex + 1), newCode])
        setHistoryIndex(prev => prev + 1)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onCodeChange, onElementSelect, historyIndex])

  // Undo/Redo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1)
      onCodeChange(history[historyIndex - 1])
    }
  }, [historyIndex, history, onCodeChange])

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1)
      onCodeChange(history[historyIndex + 1])
    }
  }, [historyIndex, history, onCodeChange])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          handleRedo()
        } else {
          handleUndo()
        }
      }
      if (e.key === 'Escape') {
        setSelectedElement(null)
        setEditingText(false)
        onElementSelect?.(null)
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElement && !editingText) {
          e.preventDefault()
          iframeRef.current?.contentWindow?.postMessage({ type: 'delete-element' }, '*')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleUndo, handleRedo, selectedElement, editingText, onElementSelect])

  // Update text in iframe
  const handleTextUpdate = useCallback((text: string) => {
    setEditValue(text)
    iframeRef.current?.contentWindow?.postMessage({ type: 'update-text', text }, '*')
  }, [])

  return (
    <div className="relative w-full h-full bg-zinc-950">
      {/* Toolbar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-zinc-900/90 backdrop-blur-sm border-b border-zinc-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <button
            onClick={handleUndo}
            disabled={historyIndex === 0}
            className="p-2 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-zinc-800"
            title="Undo (Ctrl+Z)"
          >
            ↶
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-zinc-800"
            title="Redo (Ctrl+Shift+Z)"
          >
            ↷
          </button>

          <div className="h-4 w-px bg-zinc-700 mx-2" />

          {/* View controls */}
          <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-1">
            <button className="px-3 py-1 text-xs text-white bg-zinc-700 rounded">Desktop</button>
            <button className="px-3 py-1 text-xs text-zinc-400 hover:text-white rounded">Tablet</button>
            <button className="px-3 py-1 text-xs text-zinc-400 hover:text-white rounded">Mobile</button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          {selectedElement && (
            <span className="text-zinc-400">
              Selected: <span className="text-blue-400">&lt;{selectedElement.tagName}&gt;</span>
            </span>
          )}
        </div>
      </div>

      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 bg-zinc-950 flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview iframe */}
      <iframe
        ref={iframeRef}
        srcDoc={generatePreviewHtml(code)}
        className="w-full h-full border-0 pt-12"
        sandbox="allow-scripts"
        title="Visual Editor Preview"
      />

      {/* Inline text editor popover */}
      <AnimatePresence>
        {selectedElement && selectedElement.textContent && editingText && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-30 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl p-4"
            style={{
              top: (selectedElement.rect.top || 100) + 60,
              left: Math.max(10, (selectedElement.rect.left || 100) - 50),
              minWidth: 300,
            }}
          >
            <div className="text-xs text-zinc-500 mb-2">Edit text content</div>
            <textarea
              value={editValue}
              onChange={(e) => handleTextUpdate(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setEditingText(false)}
                className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick action popover for selected element */}
      <AnimatePresence>
        {selectedElement && !editingText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute z-30 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl overflow-hidden"
            style={{
              top: Math.min(
                (selectedElement.rect.top || 100) + (selectedElement.rect.height || 0) + 70,
                window.innerHeight - 200
              ),
              left: Math.max(10, Math.min((selectedElement.rect.left || 100), window.innerWidth - 220)),
            }}
          >
            <div className="p-2">
              <div className="text-xs text-zinc-500 px-2 py-1">
                &lt;{selectedElement.tagName}&gt;
              </div>
              
              {/* Quick actions */}
              <div className="space-y-1 mt-1">
                {selectedElement.textContent && (
                  <button
                    onClick={() => setEditingText(true)}
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-700 rounded-lg flex items-center gap-2"
                  >
                    <span>✏️</span> Edit text
                  </button>
                )}
                <button
                  onClick={() => {
                    iframeRef.current?.contentWindow?.postMessage({ type: 'delete-element' }, '*')
                    setSelectedElement(null)
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2"
                >
                  <span>🗑️</span> Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// =============================================================================
// VISUAL EDITOR WRAPPER
// Combines VisualEditor with ElementInspector
// =============================================================================

interface VisualEditorWithInspectorProps {
  code: string
  onCodeChange: (newCode: string) => void
}

export function VisualEditorWithInspector({
  code,
  onCodeChange,
}: VisualEditorWithInspectorProps) {
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(null)
  const showInspector = true

  return (
    <div className="flex h-full">
      {/* Main editor */}
      <div className={`flex-1 ${showInspector && selectedElement ? 'mr-80' : ''}`}>
        <VisualEditor
          code={code}
          onCodeChange={onCodeChange}
          onElementSelect={setSelectedElement}
        />
      </div>

      {/* Inspector sidebar - rendered by parent */}
    </div>
  )
}
