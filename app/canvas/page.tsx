'use client'

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react'
import Link from 'next/link'

// Hydration-safe mobile detection
const resizeSubscribe = (callback: () => void) => {
  window.addEventListener('resize', callback)
  return () => window.removeEventListener('resize', callback)
}

function useIsMobile() {
  return useSyncExternalStore(
    resizeSubscribe,
    () => window.innerWidth < 768,
    () => false // Server returns false
  )
}

interface Point {
  x: number
  y: number
}

interface Path {
  points: Point[]
  color: string
  strokeWidth: number
  tool: string
  visible: boolean
}

interface Shape {
  type: 'rectangle' | 'circle'
  startX: number
  startY: number
  endX: number
  endY: number
  color: string
  fillColor: string
  strokeWidth: number
  visible: boolean
}

interface TextElement {
  text: string
  x: number
  y: number
  color: string
  size: number
  visible: boolean
}

interface Tool {
  id: string
  icon: string
  name: string
}

interface Layer {
  id: string
  type: 'path' | 'shape' | 'text'
  index: number
  name: string
  visible: boolean
  icon: string
}

export default function CanvasPage() {
  // Canvas state
  const [selectedTool, setSelectedTool] = useState('pen')
  const [selectedColor, setSelectedColor] = useState('#3b82f6')
  const [fillColor, setFillColor] = useState('transparent')
  const [strokeWidth, setStrokeWidth] = useState(3)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [paths, setPaths] = useState<Path[]>([])
  const [currentPath, setCurrentPath] = useState<Point[]>([])
  const [shapes, setShapes] = useState<Shape[]>([])
  const [texts, setTexts] = useState<TextElement[]>([])
  const [startPoint, setStartPoint] = useState<Point | null>(null)
  const [currentShape, setCurrentShape] = useState<Shape | null>(null)
  const [selectedElement, setSelectedElement] = useState<number | null>(null)
  const [selectedElementType, setSelectedElementType] = useState<'path' | 'shape' | 'text' | null>(null)
  
  // History
  const [history, setHistory] = useState<{ paths: Path[]; shapes: Shape[]; texts: TextElement[] }[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  
  // Text input
  const [isAddingText, setIsAddingText] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [textPosition, setTextPosition] = useState<Point | null>(null)
  
  // UI state
  const [showMobilePanel, setShowMobilePanel] = useState<'layers' | 'colors' | 'export' | null>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  
  // Touch tracking
  const lastTouchRef = useRef<Point | null>(null)
  const lastPinchDistanceRef = useRef<number | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const tools: Tool[] = [
    { id: 'pen', icon: '✏️', name: 'Pen' },
    { id: 'rectangle', icon: '⬜', name: 'Rectangle' },
    { id: 'circle', icon: '⭕', name: 'Circle' },
    { id: 'text', icon: '📝', name: 'Text' },
    { id: 'select', icon: '👆', name: 'Select' },
    { id: 'pan', icon: '✋', name: 'Pan' },
    { id: 'eraser', icon: '🧹', name: 'Eraser' },
  ]

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
    '#000000', '#ffffff', '#6b7280', '#fbbf24', '#14b8a6'
  ]

  const strokeWidths = [1, 2, 3, 5, 8, 12]

  // Toast notification
  const showToastNotification = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  // History management
  const saveToHistory = useCallback(() => {
    const state = { paths: [...paths], shapes: [...shapes], texts: [...texts] }
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(state)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [paths, shapes, texts, history, historyIndex])

  // Initialize history - must be after saveToHistory is defined
  useEffect(() => {
    if (history.length === 0) {
      saveToHistory()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1]
      setPaths(prevState.paths)
      setShapes(prevState.shapes)
      setTexts(prevState.texts)
      setHistoryIndex(historyIndex - 1)
      setSelectedElement(null)
      setSelectedElementType(null)
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setPaths(nextState.paths)
      setShapes(nextState.shapes)
      setTexts(nextState.texts)
      setHistoryIndex(historyIndex + 1)
    }
  }

  // Get canvas coordinates from event
  const getCanvasPoint = (clientX: number, clientY: number): Point => {
    if (!canvasRef.current) return { x: 0, y: 0 }
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) / (zoomLevel / 100)) - panOffset.x,
      y: ((clientY - rect.top) / (zoomLevel / 100)) - panOffset.y
    }
  }

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch to zoom
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      lastPinchDistanceRef.current = dist
      return
    }

    const touch = e.touches[0]
    const pos = getCanvasPoint(touch.clientX, touch.clientY)
    lastTouchRef.current = { x: touch.clientX, y: touch.clientY }

    if (selectedTool === 'pan') {
      setIsPanning(true)
      return
    }

    if (selectedTool === 'text') {
      setIsAddingText(true)
      setTextPosition(pos)
      setTextInput('')
      return
    }

    if (selectedTool === 'eraser') {
      eraseAtPoint(pos)
      return
    }

    if (selectedTool === 'select') {
      const element = findElementAtPoint(pos.x, pos.y)
      if (element) {
        setSelectedElement(element.index)
        setSelectedElementType(element.type)
      } else {
        setSelectedElement(null)
        setSelectedElementType(null)
      }
      return
    }

    setIsDrawing(true)

    if (selectedTool === 'pen') {
      setCurrentPath([pos])
    } else if (selectedTool === 'rectangle' || selectedTool === 'circle') {
      setStartPoint(pos)
      setCurrentShape({
        type: selectedTool,
        startX: pos.x,
        startY: pos.y,
        endX: pos.x,
        endY: pos.y,
        color: selectedColor,
        fillColor: fillColor,
        strokeWidth: strokeWidth,
        visible: true
      })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()

    if (e.touches.length === 2) {
      // Pinch to zoom
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      if (lastPinchDistanceRef.current) {
        const delta = dist - lastPinchDistanceRef.current
        setZoomLevel(prev => Math.min(300, Math.max(25, prev + delta * 0.5)))
      }
      lastPinchDistanceRef.current = dist
      return
    }

    const touch = e.touches[0]
    const pos = getCanvasPoint(touch.clientX, touch.clientY)

    if (isPanning && lastTouchRef.current) {
      const deltaX = (touch.clientX - lastTouchRef.current.x) / (zoomLevel / 100)
      const deltaY = (touch.clientY - lastTouchRef.current.y) / (zoomLevel / 100)
      setPanOffset(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }))
      lastTouchRef.current = { x: touch.clientX, y: touch.clientY }
      return
    }

    if (selectedTool === 'eraser') {
      eraseAtPoint(pos)
      return
    }

    if (!isDrawing) return

    if (selectedTool === 'pen') {
      setCurrentPath(prev => [...prev, pos])
    } else if ((selectedTool === 'rectangle' || selectedTool === 'circle') && startPoint) {
      setCurrentShape(prev => prev ? { ...prev, endX: pos.x, endY: pos.y } : null)
    }
  }

  const handleTouchEnd = () => {
    lastTouchRef.current = null
    lastPinchDistanceRef.current = null

    if (isPanning) {
      setIsPanning(false)
      return
    }

    if (!isDrawing) return

    if (selectedTool === 'pen' && currentPath.length > 1) {
      setPaths(prev => [...prev, {
        points: currentPath,
        color: selectedColor,
        strokeWidth: strokeWidth,
        tool: selectedTool,
        visible: true
      }])
      setTimeout(saveToHistory, 0)
    } else if ((selectedTool === 'rectangle' || selectedTool === 'circle') && currentShape) {
      const width = Math.abs(currentShape.endX - currentShape.startX)
      const height = Math.abs(currentShape.endY - currentShape.startY)
      if (width > 5 && height > 5) {
        setShapes(prev => [...prev, currentShape])
        setTimeout(saveToHistory, 0)
      }
    }

    setIsDrawing(false)
    setCurrentPath([])
    setStartPoint(null)
    setCurrentShape(null)
  }

  // Mouse handlers (for desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getCanvasPoint(e.clientX, e.clientY)
    lastTouchRef.current = { x: e.clientX, y: e.clientY }

    if (selectedTool === 'pan') {
      setIsPanning(true)
      return
    }

    if (selectedTool === 'text') {
      setIsAddingText(true)
      setTextPosition(pos)
      setTextInput('')
      return
    }

    if (selectedTool === 'eraser') {
      eraseAtPoint(pos)
      return
    }

    if (selectedTool === 'select') {
      const element = findElementAtPoint(pos.x, pos.y)
      if (element) {
        setSelectedElement(element.index)
        setSelectedElementType(element.type)
      } else {
        setSelectedElement(null)
        setSelectedElementType(null)
      }
      return
    }

    setIsDrawing(true)

    if (selectedTool === 'pen') {
      setCurrentPath([pos])
    } else if (selectedTool === 'rectangle' || selectedTool === 'circle') {
      setStartPoint(pos)
      setCurrentShape({
        type: selectedTool,
        startX: pos.x,
        startY: pos.y,
        endX: pos.x,
        endY: pos.y,
        color: selectedColor,
        fillColor: fillColor,
        strokeWidth: strokeWidth,
        visible: true
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getCanvasPoint(e.clientX, e.clientY)

    if (isPanning && lastTouchRef.current) {
      const deltaX = (e.clientX - lastTouchRef.current.x) / (zoomLevel / 100)
      const deltaY = (e.clientY - lastTouchRef.current.y) / (zoomLevel / 100)
      setPanOffset(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }))
      lastTouchRef.current = { x: e.clientX, y: e.clientY }
      return
    }

    if (selectedTool === 'eraser' && e.buttons === 1) {
      eraseAtPoint(pos)
      return
    }

    if (!isDrawing) return

    if (selectedTool === 'pen') {
      setCurrentPath(prev => [...prev, pos])
    } else if ((selectedTool === 'rectangle' || selectedTool === 'circle') && startPoint) {
      setCurrentShape(prev => prev ? { ...prev, endX: pos.x, endY: pos.y } : null)
    }
  }

  const handleMouseUp = () => {
    lastTouchRef.current = null

    if (isPanning) {
      setIsPanning(false)
      return
    }

    if (!isDrawing) return

    if (selectedTool === 'pen' && currentPath.length > 1) {
      setPaths(prev => [...prev, {
        points: currentPath,
        color: selectedColor,
        strokeWidth: strokeWidth,
        tool: selectedTool,
        visible: true
      }])
      setTimeout(saveToHistory, 0)
    } else if ((selectedTool === 'rectangle' || selectedTool === 'circle') && currentShape) {
      const width = Math.abs(currentShape.endX - currentShape.startX)
      const height = Math.abs(currentShape.endY - currentShape.startY)
      if (width > 5 && height > 5) {
        setShapes(prev => [...prev, currentShape])
        setTimeout(saveToHistory, 0)
      }
    }

    setIsDrawing(false)
    setCurrentPath([])
    setStartPoint(null)
    setCurrentShape(null)
  }

  // Eraser
  const eraseAtPoint = (pos: Point) => {
    const threshold = 20
    let erased = false

    setPaths(prev => {
      const newPaths = prev.filter(path => {
        const hit = path.points.some(point =>
          Math.abs(point.x - pos.x) < threshold && Math.abs(point.y - pos.y) < threshold
        )
        if (hit) erased = true
        return !hit
      })
      return newPaths
    })

    setShapes(prev => {
      const newShapes = prev.filter(shape => {
        const centerX = (shape.startX + shape.endX) / 2
        const centerY = (shape.startY + shape.endY) / 2
        const hit = Math.abs(centerX - pos.x) < threshold && Math.abs(centerY - pos.y) < threshold
        if (hit) erased = true
        return !hit
      })
      return newShapes
    })

    setTexts(prev => {
      const newTexts = prev.filter(text => {
        const hit = Math.abs(text.x - pos.x) < threshold && Math.abs(text.y - pos.y) < threshold
        if (hit) erased = true
        return !hit
      })
      return newTexts
    })

    if (erased) {
      setTimeout(saveToHistory, 100)
    }
  }

  // Find element at point
  const findElementAtPoint = (x: number, y: number): { type: 'path' | 'shape' | 'text'; index: number } | null => {
    for (let i = texts.length - 1; i >= 0; i--) {
      const text = texts[i]
      if (text.visible !== false) {
        const width = text.text.length * (text.size * 0.6)
        if (x >= text.x && x <= text.x + width && y >= text.y - text.size && y <= text.y) {
          return { type: 'text', index: i }
        }
      }
    }

    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i]
      if (shape.visible !== false) {
        const minX = Math.min(shape.startX, shape.endX)
        const maxX = Math.max(shape.startX, shape.endX)
        const minY = Math.min(shape.startY, shape.endY)
        const maxY = Math.max(shape.startY, shape.endY)
        if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
          return { type: 'shape', index: i }
        }
      }
    }

    for (let i = paths.length - 1; i >= 0; i--) {
      const path = paths[i]
      if (path.visible !== false) {
        const hit = path.points.some(point =>
          Math.abs(point.x - x) < 15 && Math.abs(point.y - y) < 15
        )
        if (hit) return { type: 'path', index: i }
      }
    }

    return null
  }

  // Text submit
  const handleTextSubmit = () => {
    if (textInput.trim() && textPosition) {
      setTexts(prev => [...prev, {
        text: textInput,
        x: textPosition.x,
        y: textPosition.y,
        color: selectedColor,
        size: 20,
        visible: true
      }])
      setTimeout(saveToHistory, 0)
    }
    setIsAddingText(false)
    setTextInput('')
    setTextPosition(null)
  }

  // Clear canvas
  const clearCanvas = () => {
    setPaths([])
    setShapes([])
    setTexts([])
    setSelectedElement(null)
    setSelectedElementType(null)
    setTimeout(saveToHistory, 0)
    showToastNotification('Canvas cleared')
  }

  // Delete selected
  const deleteSelected = () => {
    if (selectedElement !== null && selectedElementType) {
      if (selectedElementType === 'path') {
        setPaths(prev => prev.filter((_, i) => i !== selectedElement))
      } else if (selectedElementType === 'shape') {
        setShapes(prev => prev.filter((_, i) => i !== selectedElement))
      } else if (selectedElementType === 'text') {
        setTexts(prev => prev.filter((_, i) => i !== selectedElement))
      }
      setSelectedElement(null)
      setSelectedElementType(null)
      setTimeout(saveToHistory, 0)
      showToastNotification('Deleted')
    }
  }

  // Export as PNG
  const exportAsPNG = () => {
    const svg = document.getElementById('canvas-svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    canvas.width = 1920
    canvas.height = 1080
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      ctx.fillStyle = '#18181b'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      
      const link = document.createElement('a')
      link.download = 'hatchit-canvas.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
      showToastNotification('Exported as PNG!')
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  // Export as SVG
  const exportAsSVG = () => {
    const svg = document.getElementById('canvas-svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.download = 'hatchit-canvas.svg'
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
    showToastNotification('Exported as SVG!')
  }

  // Get all layers
  const getAllLayers = (): Layer[] => {
    const layers: Layer[] = []
    paths.forEach((_, index) => {
      layers.push({ id: `path-${index}`, type: 'path', index, name: `Path ${index + 1}`, visible: paths[index].visible !== false, icon: '✏️' })
    })
    shapes.forEach((shape, index) => {
      layers.push({ id: `shape-${index}`, type: 'shape', index, name: `${shape.type} ${index + 1}`, visible: shape.visible !== false, icon: shape.type === 'rectangle' ? '⬜' : '⭕' })
    })
    texts.forEach((text, index) => {
      layers.push({ id: `text-${index}`, type: 'text', index, name: text.text.slice(0, 15), visible: text.visible !== false, icon: '📝' })
    })
    return layers.reverse()
  }

  // Toggle layer visibility
  const toggleLayerVisibility = (type: 'path' | 'shape' | 'text', index: number) => {
    if (type === 'path') {
      setPaths(prev => prev.map((p, i) => i === index ? { ...p, visible: !p.visible } : p))
    } else if (type === 'shape') {
      setShapes(prev => prev.map((s, i) => i === index ? { ...s, visible: !s.visible } : s))
    } else if (type === 'text') {
      setTexts(prev => prev.map((t, i) => i === index ? { ...t, visible: !t.visible } : t))
    }
  }

  // Path to SVG
  const pathToSVG = (points: Point[]) => {
    if (points.length < 2) return ''
    let d = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`
    }
    return d
  }

  // Reset view
  const resetView = () => {
    setZoomLevel(100)
    setPanOffset({ x: 0, y: 0 })
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') { e.preventDefault(); undo() }
        if (e.key === 'y') { e.preventDefault(); redo() }
      }
      if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected()
      if (e.key === 'p') setSelectedTool('pen')
      if (e.key === 'r') setSelectedTool('rectangle')
      if (e.key === 'c') setSelectedTool('circle')
      if (e.key === 't') setSelectedTool('text')
      if (e.key === 'v') setSelectedTool('select')
      if (e.key === 'h') setSelectedTool('pan')
      if (e.key === 'e') setSelectedTool('eraser')
      if (e.key === 'Escape') {
        setSelectedElement(null)
        setSelectedElementType(null)
        setIsAddingText(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deleteSelected, historyIndex, redo, selectedElement, selectedElementType, undo])

  // Mobile Panel Component
  const MobilePanel = ({ type, onClose }: { type: 'layers' | 'colors' | 'export', onClose: () => void }) => (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40" onClick={onClose}>
      <div className="bg-zinc-900 border-t border-zinc-700 rounded-t-2xl max-h-[70vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex justify-center py-2">
          <div className="w-10 h-1 bg-zinc-600 rounded-full" />
        </div>
        
        <div className="px-4 pb-2 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="font-semibold text-white">
            {type === 'layers' && 'Layers'}
            {type === 'colors' && 'Colors & Stroke'}
            {type === 'export' && 'Export'}
          </h3>
          <button onClick={onClose} className="p-2 text-zinc-400">✕</button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[55vh]">
          {type === 'colors' && (
            <div className="space-y-6">
              <div>
                <label className="text-sm text-zinc-400 mb-3 block">Stroke Color</label>
                <div className="grid grid-cols-5 gap-3">
                  {colors.map(color => (
                    <button
                      key={color}
                      className={`w-12 h-12 rounded-xl border-2 ${selectedColor === color ? 'border-white scale-110' : 'border-zinc-600'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm text-zinc-400 mb-3 block">Fill Color</label>
                <div className="grid grid-cols-5 gap-3">
                  <button
                    className={`w-12 h-12 rounded-xl border-2 relative ${fillColor === 'transparent' ? 'border-white' : 'border-zinc-600'}`}
                    style={{ backgroundColor: '#374151' }}
                    onClick={() => setFillColor('transparent')}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-0.5 bg-red-500 rotate-45" />
                    </div>
                  </button>
                  {colors.slice(0, 14).map(color => (
                    <button
                      key={color}
                      className={`w-12 h-12 rounded-xl border-2 ${fillColor === color ? 'border-white scale-110' : 'border-zinc-600'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFillColor(color)}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm text-zinc-400 mb-3 block">Stroke Width: {strokeWidth}px</label>
                <div className="flex gap-2">
                  {strokeWidths.map(w => (
                    <button
                      key={w}
                      className={`flex-1 py-3 rounded-xl text-sm ${strokeWidth === w ? 'bg-blue-600' : 'bg-zinc-800'}`}
                      onClick={() => setStrokeWidth(w)}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {type === 'layers' && (
            <div className="space-y-2">
              {getAllLayers().length === 0 ? (
                <div className="text-center text-zinc-500 py-8">No layers yet. Start drawing!</div>
              ) : (
                getAllLayers().map(layer => (
                  <div
                    key={layer.id}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      selectedElement === layer.index && selectedElementType === layer.type
                        ? 'bg-blue-600/30 border border-blue-500'
                        : 'bg-zinc-800'
                    }`}
                    onClick={() => {
                      setSelectedElement(layer.index)
                      setSelectedElementType(layer.type)
                      setSelectedTool('select')
                    }}
                  >
                    <span className="text-xl">{layer.icon}</span>
                    <span className="flex-1 text-sm truncate">{layer.name}</span>
                    <button
                      onClick={e => { e.stopPropagation(); toggleLayerVisibility(layer.type, layer.index) }}
                      className="p-2 text-lg"
                    >
                      {layer.visible ? '👁️' : '🚫'}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {type === 'export' && (
            <div className="space-y-3">
              <button
                onClick={() => { exportAsPNG(); onClose() }}
                className="w-full p-4 bg-zinc-800 rounded-xl flex items-center gap-3"
              >
                <span className="text-2xl">🖼️</span>
                <div className="text-left">
                  <div className="font-medium">Export as PNG</div>
                  <div className="text-sm text-zinc-400">High quality image</div>
                </div>
              </button>
              <button
                onClick={() => { exportAsSVG(); onClose() }}
                className="w-full p-4 bg-zinc-800 rounded-xl flex items-center gap-3"
              >
                <span className="text-2xl">📐</span>
                <div className="text-left">
                  <div className="font-medium">Export as SVG</div>
                  <div className="text-sm text-zinc-400">Vector format, scalable</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="h-screen bg-zinc-950 flex flex-col touch-none">
      {/* Toast */}
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          ✓ {toastMessage}
        </div>
      )}

      {/* Mobile Panels */}
      {showMobilePanel && <MobilePanel type={showMobilePanel} onClose={() => setShowMobilePanel(null)} />}

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40" onClick={() => setShowMobileMenu(false)}>
          <div className="bg-zinc-900 border-t border-zinc-700 rounded-t-2xl p-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center mb-3">
              <div className="w-10 h-1 bg-zinc-600 rounded-full" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => { undo(); setShowMobileMenu(false) }} disabled={historyIndex <= 0} className="p-4 bg-zinc-800 rounded-xl disabled:opacity-40">
                <span className="text-2xl">↩️</span>
                <div className="text-xs mt-1">Undo</div>
              </button>
              <button onClick={() => { redo(); setShowMobileMenu(false) }} disabled={historyIndex >= history.length - 1} className="p-4 bg-zinc-800 rounded-xl disabled:opacity-40">
                <span className="text-2xl">↪️</span>
                <div className="text-xs mt-1">Redo</div>
              </button>
              <button onClick={() => { deleteSelected(); setShowMobileMenu(false) }} disabled={selectedElement === null} className="p-4 bg-zinc-800 rounded-xl disabled:opacity-40">
                <span className="text-2xl">🗑️</span>
                <div className="text-xs mt-1">Delete</div>
              </button>
              <button onClick={() => { clearCanvas(); setShowMobileMenu(false) }} className="p-4 bg-zinc-800 rounded-xl">
                <span className="text-2xl">🧹</span>
                <div className="text-xs mt-1">Clear</div>
              </button>
              <button onClick={() => { resetView(); setShowMobileMenu(false) }} className="p-4 bg-zinc-800 rounded-xl">
                <span className="text-2xl">🔄</span>
                <div className="text-xs mt-1">Reset View</div>
              </button>
              <button onClick={() => { setShowMobilePanel('export'); setShowMobileMenu(false) }} className="p-4 bg-blue-600 rounded-xl">
                <span className="text-2xl">💾</span>
                <div className="text-xs mt-1">Export</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-900 shrink-0">
        <Link href="/" className="text-xl font-black">
          <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">Hatch</span>
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">It</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-zinc-500 text-sm">Canvas</span>
          <div className="flex items-center gap-1 bg-zinc-800 rounded-lg px-2 py-1">
            <button onClick={() => setZoomLevel(prev => Math.max(25, prev - 25))} className="w-6 h-6 text-zinc-400">-</button>
            <span className="text-xs text-zinc-400 w-10 text-center">{zoomLevel}%</span>
            <button onClick={() => setZoomLevel(prev => Math.min(300, prev + 25))} className="w-6 h-6 text-zinc-400">+</button>
          </div>
          <button onClick={() => setShowMobileMenu(true)} className="p-2 text-zinc-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        ref={canvasRef}
        className="flex-1 overflow-hidden relative bg-zinc-900"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ 
          cursor: selectedTool === 'pan' ? 'grab' : selectedTool === 'eraser' ? 'crosshair' : 'default',
          touchAction: 'none'
        }}
      >
        <svg
          id="canvas-svg"
          className="absolute inset-0"
          style={{
            width: '100%',
            height: '100%',
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: '0 0'
          }}
        >
          {/* Grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="rgba(75, 85, 99, 0.4)" />
            </pattern>
          </defs>
          <rect 
            x={-panOffset.x - 5000} 
            y={-panOffset.y - 5000} 
            width="10000" 
            height="10000" 
            fill="url(#grid)" 
          />

          {/* Content group with pan offset */}
          <g transform={`translate(${panOffset.x}, ${panOffset.y})`}>
            {/* Paths */}
            {paths.map((path, index) => path.visible !== false && (
              <path
                key={`path-${index}`}
                d={pathToSVG(path.points)}
                stroke={path.color}
                strokeWidth={path.strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={selectedElement === index && selectedElementType === 'path' ? 'opacity-80' : ''}
              />
            ))}

            {/* Shapes */}
            {shapes.map((shape, index) => {
              if (shape.visible === false) return null
              const isSelected = selectedElement === index && selectedElementType === 'shape'
              
              if (shape.type === 'rectangle') {
                const x = Math.min(shape.startX, shape.endX)
                const y = Math.min(shape.startY, shape.endY)
                const w = Math.abs(shape.endX - shape.startX)
                const h = Math.abs(shape.endY - shape.startY)
                return (
                  <g key={`shape-${index}`}>
                    <rect x={x} y={y} width={w} height={h} stroke={shape.color} strokeWidth={shape.strokeWidth} fill={shape.fillColor === 'transparent' ? 'none' : shape.fillColor} />
                    {isSelected && <rect x={x-3} y={y-3} width={w+6} height={h+6} stroke="#3b82f6" strokeWidth="2" fill="none" strokeDasharray="5,5" />}
                  </g>
                )
              } else {
                const cx = (shape.startX + shape.endX) / 2
                const cy = (shape.startY + shape.endY) / 2
                const rx = Math.abs(shape.endX - shape.startX) / 2
                const ry = Math.abs(shape.endY - shape.startY) / 2
                return (
                  <g key={`shape-${index}`}>
                    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} stroke={shape.color} strokeWidth={shape.strokeWidth} fill={shape.fillColor === 'transparent' ? 'none' : shape.fillColor} />
                    {isSelected && <ellipse cx={cx} cy={cy} rx={rx+3} ry={ry+3} stroke="#3b82f6" strokeWidth="2" fill="none" strokeDasharray="5,5" />}
                  </g>
                )
              }
            })}

            {/* Texts */}
            {texts.map((text, index) => text.visible !== false && (
              <g key={`text-${index}`}>
                <text x={text.x} y={text.y} fill={text.color} fontSize={text.size} fontFamily="Arial, sans-serif">{text.text}</text>
                {selectedElement === index && selectedElementType === 'text' && (
                  <rect x={text.x - 3} y={text.y - text.size - 3} width={text.text.length * text.size * 0.6 + 6} height={text.size + 6} stroke="#3b82f6" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                )}
              </g>
            ))}

            {/* Current drawing */}
            {isDrawing && selectedTool === 'pen' && currentPath.length > 1 && (
              <path d={pathToSVG(currentPath)} stroke={selectedColor} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            )}

            {isDrawing && currentShape && (
              currentShape.type === 'rectangle' ? (
                <rect
                  x={Math.min(currentShape.startX, currentShape.endX)}
                  y={Math.min(currentShape.startY, currentShape.endY)}
                  width={Math.abs(currentShape.endX - currentShape.startX)}
                  height={Math.abs(currentShape.endY - currentShape.startY)}
                  stroke={currentShape.color}
                  strokeWidth={currentShape.strokeWidth}
                  fill={currentShape.fillColor === 'transparent' ? 'none' : currentShape.fillColor}
                  opacity="0.7"
                />
              ) : (
                <ellipse
                  cx={(currentShape.startX + currentShape.endX) / 2}
                  cy={(currentShape.startY + currentShape.endY) / 2}
                  rx={Math.abs(currentShape.endX - currentShape.startX) / 2}
                  ry={Math.abs(currentShape.endY - currentShape.startY) / 2}
                  stroke={currentShape.color}
                  strokeWidth={currentShape.strokeWidth}
                  fill={currentShape.fillColor === 'transparent' ? 'none' : currentShape.fillColor}
                  opacity="0.7"
                />
              )
            )}
          </g>
        </svg>

        {/* Text input overlay */}
        {isAddingText && textPosition && (
          <div 
            className="absolute"
            style={{ 
              left: (textPosition.x + panOffset.x) * (zoomLevel / 100),
              top: (textPosition.y + panOffset.y) * (zoomLevel / 100)
            }}
          >
            <input
              type="text"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              onBlur={handleTextSubmit}
              onKeyDown={e => e.key === 'Enter' && handleTextSubmit()}
              className="bg-zinc-800 border border-blue-500 rounded px-2 py-1 text-white outline-none min-w-[150px]"
              style={{ color: selectedColor }}
              autoFocus
              placeholder="Type here..."
            />
          </div>
        )}

        {/* Tool indicator */}
        <div className="absolute top-4 left-4 bg-zinc-800/90 backdrop-blur rounded-lg px-3 py-1.5 text-sm text-zinc-300">
          {tools.find(t => t.id === selectedTool)?.icon} {tools.find(t => t.id === selectedTool)?.name}
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div 
        className="border-t border-zinc-800 bg-zinc-900 px-2 py-2 shrink-0"
        style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-between gap-2">
          {/* Tools - scrollable */}
          <div className="flex gap-1 overflow-x-auto flex-1">
            {tools.map(tool => (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-lg transition-all ${
                  selectedTool === tool.id ? 'bg-blue-600 scale-105' : 'bg-zinc-800'
                }`}
              >
                {tool.icon}
              </button>
            ))}
          </div>
          
          {/* Quick actions */}
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => setShowMobilePanel('colors')}
              className="w-11 h-11 rounded-xl border-2 border-zinc-600"
              style={{ backgroundColor: selectedColor }}
            />
            <button
              onClick={() => setShowMobilePanel('layers')}
              className="w-11 h-11 rounded-xl bg-zinc-800 flex items-center justify-center text-lg"
            >
              📑
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}