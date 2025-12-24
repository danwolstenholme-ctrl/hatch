'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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

interface ResizeHandle {
  id: string
  x: number
  y: number
  cursor: string
}

interface Layer {
  id: string
  type: 'path' | 'shape' | 'text'
  index: number
  name: string
  visible: boolean
  icon: string
  element: Path | Shape | TextElement
}

export default function CanvasPage() {
  const [selectedTool, setSelectedTool] = useState('select')
  const [selectedColor, setSelectedColor] = useState('#3b82f6')
  const [fillColor, setFillColor] = useState('transparent')
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [projectName, setProjectName] = useState('HatchIt Canvas')
  const [isEditing, setIsEditing] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)
  const [showColorPalette, setShowColorPalette] = useState(false)
  const [showFillPalette, setShowFillPalette] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [paths, setPaths] = useState<Path[]>([])
  const [currentPath, setCurrentPath] = useState<Point[]>([])
  const [shapes, setShapes] = useState<Shape[]>([])
  const [texts, setTexts] = useState<TextElement[]>([])
  const [startPoint, setStartPoint] = useState<Point | null>(null)
  const [currentShape, setCurrentShape] = useState<Shape | null>(null)
  const [selectedElement, setSelectedElement] = useState<number | null>(null)
  const [selectedElementType, setSelectedElementType] = useState<'path' | 'shape' | 'text' | null>(null)
  const [history, setHistory] = useState<{ paths: Path[]; shapes: Shape[]; texts: TextElement[] }[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isAddingText, setIsAddingText] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [textPosition, setTextPosition] = useState<Point | null>(null)
  const [aiPrompt, setAIPrompt] = useState('')
  const [aiStyle, setAIStyle] = useState('minimalist')
  const [isGenerating, setIsGenerating] = useState(false)
  const [activePanel, setActivePanel] = useState('properties')
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState<Point | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const tools: Tool[] = [
    { id: 'select', icon: '↖', name: 'Select' },
    { id: 'pen', icon: '✎', name: 'Pen' },
    { id: 'rectangle', icon: '□', name: 'Rectangle' },
    { id: 'circle', icon: '○', name: 'Circle' },
    { id: 'text', icon: 'T', name: 'Text' },
    { id: 'eraser', icon: '⌦', name: 'Eraser' }
  ]

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
    '#000000', '#ffffff', '#6b7280', '#fbbf24', '#34d399', '#e11d48'
  ]

  const fillColors = [
    'transparent', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
    '#000000', '#ffffff', '#6b7280', '#fbbf24', '#34d399', '#e11d48'
  ]

  const aiStyles = [
    { value: 'minimalist', label: 'Minimalist' },
    { value: 'abstract', label: 'Abstract' },
    { value: 'geometric', label: 'Geometric' }
  ]

  const shortcuts = [
    { key: 'V', action: 'Select' },
    { key: 'P', action: 'Pen' },
    { key: 'R', action: 'Rectangle' },
    { key: 'C', action: 'Circle' },
    { key: 'T', action: 'Text' },
    { key: 'E', action: 'Eraser' },
    { key: 'Ctrl+Z', action: 'Undo' },
    { key: 'Ctrl+Y', action: 'Redo' },
    { key: 'Ctrl+C', action: 'Copy' },
    { key: 'Delete', action: 'Delete Selected' }
  ]

  const showToastNotification = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  const copyElement = () => {
    if (selectedElement !== null && selectedElementType) {
      showToastNotification('Copied!')
    }
  }

  const getAllLayers = (): Layer[] => {
    const layers: Layer[] = []

    paths.forEach((path, index) => {
      layers.push({
        id: `path-${index}`,
        type: 'path',
        index,
        name: `Path ${index + 1}`,
        visible: path.visible !== false,
        icon: '✎',
        element: path
      })
    })

    shapes.forEach((shape, index) => {
      layers.push({
        id: `shape-${index}`,
        type: 'shape',
        index,
        name: `${shape.type === 'rectangle' ? 'Rectangle' : 'Circle'} ${index + 1}`,
        visible: shape.visible !== false,
        icon: shape.type === 'rectangle' ? '□' : '○',
        element: shape
      })
    })

    texts.forEach((text, index) => {
      layers.push({
        id: `text-${index}`,
        type: 'text',
        index,
        name: text.text.length > 15 ? `${text.text.substring(0, 15)}...` : text.text,
        visible: text.visible !== false,
        icon: 'T',
        element: text
      })
    })

    return layers.reverse()
  }

  const toggleLayerVisibility = (layerId: string, type: 'path' | 'shape' | 'text', index: number) => {
    if (type === 'path') {
      setPaths(prev => prev.map((path, i) =>
        i === index ? { ...path, visible: path.visible !== false ? false : true } : path
      ))
    } else if (type === 'shape') {
      setShapes(prev => prev.map((shape, i) =>
        i === index ? { ...shape, visible: shape.visible !== false ? false : true } : shape
      ))
    } else if (type === 'text') {
      setTexts(prev => prev.map((text, i) =>
        i === index ? { ...text, visible: text.visible !== false ? false : true } : text
      ))
    }
    saveToHistory()
  }

  const deleteLayer = (type: 'path' | 'shape' | 'text', index: number) => {
    if (type === 'path') {
      setPaths(prev => prev.filter((_, i) => i !== index))
    } else if (type === 'shape') {
      setShapes(prev => prev.filter((_, i) => i !== index))
    } else if (type === 'text') {
      setTexts(prev => prev.filter((_, i) => i !== index))
    }

    if (selectedElement === index && selectedElementType === type) {
      setSelectedElement(null)
      setSelectedElementType(null)
    }

    saveToHistory()
  }

  const deleteSelectedElement = () => {
    if (selectedElement !== null && selectedElementType) {
      deleteLayer(selectedElementType, selectedElement)
    }
  }

  const selectLayer = (type: 'path' | 'shape' | 'text', index: number) => {
    setSelectedElement(index)
    setSelectedElementType(type)
    setSelectedTool('select')
  }

  const isPointInRectangle = (px: number, py: number, rect: Shape) => {
    const x = Math.min(rect.startX, rect.endX)
    const y = Math.min(rect.startY, rect.endY)
    const width = Math.abs(rect.endX - rect.startX)
    const height = Math.abs(rect.endY - rect.startY)

    return px >= x && px <= x + width && py >= y && py <= y + height
  }

  const isPointInCircle = (px: number, py: number, circle: Shape) => {
    const centerX = (circle.startX + circle.endX) / 2
    const centerY = (circle.startY + circle.endY) / 2
    const radiusX = Math.abs(circle.endX - circle.startX) / 2
    const radiusY = Math.abs(circle.endY - circle.startY) / 2

    const normalizedX = (px - centerX) / radiusX
    const normalizedY = (py - centerY) / radiusY

    return (normalizedX * normalizedX + normalizedY * normalizedY) <= 1
  }

  const isPointNearPath = (px: number, py: number, path: Path, threshold = 10) => {
    return path.points.some(point =>
      Math.abs(point.x - px) < threshold && Math.abs(point.y - py) < threshold
    )
  }

  const isPointNearText = (px: number, py: number, text: TextElement, threshold = 20) => {
    const width = text.text.length * (text.size * 0.6)
    const height = text.size

    return px >= text.x - threshold &&
      px <= text.x + width + threshold &&
      py >= text.y - height - threshold &&
      py <= text.y + threshold
  }

  const findElementAtPoint = (x: number, y: number): { type: 'path' | 'shape' | 'text'; index: number } | null => {
    for (let i = texts.length - 1; i >= 0; i--) {
      if (texts[i].visible !== false && isPointNearText(x, y, texts[i])) {
        return { type: 'text', index: i }
      }
    }

    for (let i = shapes.length - 1; i >= 0; i--) {
      if (shapes[i].visible !== false) {
        if (shapes[i].type === 'rectangle' && isPointInRectangle(x, y, shapes[i])) {
          return { type: 'shape', index: i }
        } else if (shapes[i].type === 'circle' && isPointInCircle(x, y, shapes[i])) {
          return { type: 'shape', index: i }
        }
      }
    }

    for (let i = paths.length - 1; i >= 0; i--) {
      if (paths[i].visible !== false && isPointNearPath(x, y, paths[i])) {
        return { type: 'path', index: i }
      }
    }

    return null
  }

  const getResizeHandles = (element: Shape | TextElement, type: 'shape' | 'text'): ResizeHandle[] => {
    if (type === 'shape') {
      const shape = element as Shape
      const x = Math.min(shape.startX, shape.endX)
      const y = Math.min(shape.startY, shape.endY)
      const width = Math.abs(shape.endX - shape.startX)
      const height = Math.abs(shape.endY - shape.startY)

      return [
        { id: 'nw', x: x, y: y, cursor: 'nw-resize' },
        { id: 'ne', x: x + width, y: y, cursor: 'ne-resize' },
        { id: 'sw', x: x, y: y + height, cursor: 'sw-resize' },
        { id: 'se', x: x + width, y: y + height, cursor: 'se-resize' },
        { id: 'n', x: x + width / 2, y: y, cursor: 'n-resize' },
        { id: 's', x: x + width / 2, y: y + height, cursor: 's-resize' },
        { id: 'w', x: x, y: y + height / 2, cursor: 'w-resize' },
        { id: 'e', x: x + width, y: y + height / 2, cursor: 'e-resize' }
      ]
    } else if (type === 'text') {
      const text = element as TextElement
      const width = text.text.length * (text.size * 0.6)
      const height = text.size

      return [
        { id: 'nw', x: text.x, y: text.y - height, cursor: 'nw-resize' },
        { id: 'ne', x: text.x + width, y: text.y - height, cursor: 'ne-resize' },
        { id: 'sw', x: text.x, y: text.y, cursor: 'sw-resize' },
        { id: 'se', x: text.x + width, y: text.y, cursor: 'se-resize' }
      ]
    }

    return []
  }

  const isPointInHandle = (px: number, py: number, handle: ResizeHandle, threshold = 6) => {
    return Math.abs(px - handle.x) < threshold && Math.abs(py - handle.y) < threshold
  }

  const findHandleAtPoint = (x: number, y: number): ResizeHandle | undefined => {
    if (selectedElement !== null && selectedElementType && selectedElementType !== 'path') {
      let element: Shape | TextElement | undefined
      if (selectedElementType === 'shape') element = shapes[selectedElement]
      else if (selectedElementType === 'text') element = texts[selectedElement]
      else return undefined

      if (!element) return undefined

      const handles = getResizeHandles(element, selectedElementType)
      return handles.find(handle => isPointInHandle(x, y, handle))
    }
    return undefined
  }

  const addNewLayer = () => {
    const newShape: Shape = {
      type: 'rectangle',
      startX: 100 + (shapes.length * 20),
      startY: 100 + (shapes.length * 20),
      endX: 200 + (shapes.length * 20),
      endY: 160 + (shapes.length * 20),
      color: selectedColor,
      fillColor: 'transparent',
      strokeWidth: strokeWidth,
      visible: true
    }

    setShapes(prev => [...prev, newShape])
    saveToHistory()
  }

  const saveToHistory = () => {
    const state = { paths: [...paths], shapes: [...shapes], texts: [...texts] }
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(state)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

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
      setSelectedElement(null)
      setSelectedElementType(null)
    }
  }

  const getMousePos = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pos = {
      x: (e.clientX - rect.left) * (100 / zoomLevel),
      y: (e.clientY - rect.top) * (100 / zoomLevel)
    }
    setMousePos(pos)
    return pos
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const pos = getMousePos(e)

    if (selectedTool === 'select') {
      const handle = findHandleAtPoint(pos.x, pos.y)

      if (handle) {
        setIsResizing(true)
        setResizeHandle(handle.id)
        setDragStart(pos)
        return
      }

      const element = findElementAtPoint(pos.x, pos.y)

      if (element) {
        setSelectedElement(element.index)
        setSelectedElementType(element.type)

        if (selectedElement === element.index && selectedElementType === element.type) {
          setIsDragging(true)
          setDragStart(pos)
        }
      } else {
        setSelectedElement(null)
        setSelectedElementType(null)
      }
      return
    }

    if (selectedTool === 'text') {
      setIsAddingText(true)
      setTextPosition(pos)
      setTextInput('')
      return
    }

    if (selectedTool === 'pen') {
      setIsDrawing(true)
      setCurrentPath([pos])
    } else if (selectedTool === 'rectangle' || selectedTool === 'circle') {
      setIsDrawing(true)
      setStartPoint(pos)
      setCurrentShape({
        type: selectedTool as 'rectangle' | 'circle',
        startX: pos.x,
        startY: pos.y,
        endX: pos.x,
        endY: pos.y,
        color: selectedColor,
        fillColor: fillColor,
        strokeWidth: strokeWidth,
        visible: true
      })
    } else if (selectedTool === 'eraser') {
      const threshold = 10
      setPaths(prev => prev.filter(path => {
        return !path.points.some(point =>
          Math.abs(point.x - pos.x) < threshold && Math.abs(point.y - pos.y) < threshold
        )
      }))
      setShapes(prev => prev.filter(shape => {
        const centerX = (shape.startX + shape.endX) / 2
        const centerY = (shape.startY + shape.endY) / 2
        return !(Math.abs(centerX - pos.x) < threshold && Math.abs(centerY - pos.y) < threshold)
      }))
      setTexts(prev => prev.filter(text =>
        !(Math.abs(text.x - pos.x) < threshold && Math.abs(text.y - pos.y) < threshold)
      ))
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const pos = getMousePos(e)

    if (selectedTool === 'select' && isResizing && resizeHandle && selectedElement !== null && dragStart) {
      const deltaX = pos.x - dragStart.x
      const deltaY = pos.y - dragStart.y

      if (selectedElementType === 'shape') {
        setShapes(prev => prev.map((shape, i) => {
          if (i !== selectedElement) return shape

          const newShape = { ...shape }
          const currentX = Math.min(shape.startX, shape.endX)
          const currentY = Math.min(shape.startY, shape.endY)
          const currentWidth = Math.abs(shape.endX - shape.startX)
          const currentHeight = Math.abs(shape.endY - shape.startY)

          switch (resizeHandle) {
            case 'nw':
              newShape.startX = currentX + deltaX
              newShape.startY = currentY + deltaY
              newShape.endX = currentX + currentWidth
              newShape.endY = currentY + currentHeight
              break
            case 'ne':
              newShape.startX = currentX
              newShape.startY = currentY + deltaY
              newShape.endX = currentX + currentWidth + deltaX
              newShape.endY = currentY + currentHeight
              break
            case 'sw':
              newShape.startX = currentX + deltaX
              newShape.startY = currentY
              newShape.endX = currentX + currentWidth
              newShape.endY = currentY + currentHeight + deltaY
              break
            case 'se':
              newShape.startX = currentX
              newShape.startY = currentY
              newShape.endX = currentX + currentWidth + deltaX
              newShape.endY = currentY + currentHeight + deltaY
              break
            case 'n':
              newShape.startX = currentX
              newShape.startY = currentY + deltaY
              newShape.endX = currentX + currentWidth
              newShape.endY = currentY + currentHeight
              break
            case 's':
              newShape.startX = currentX
              newShape.startY = currentY
              newShape.endX = currentX + currentWidth
              newShape.endY = currentY + currentHeight + deltaY
              break
            case 'w':
              newShape.startX = currentX + deltaX
              newShape.startY = currentY
              newShape.endX = currentX + currentWidth
              newShape.endY = currentY + currentHeight
              break
            case 'e':
              newShape.startX = currentX
              newShape.startY = currentY
              newShape.endX = currentX + currentWidth + deltaX
              newShape.endY = currentY + currentHeight
              break
          }

          return newShape
        }))
      }
      return
    }

    if (selectedTool === 'select' && isDragging && selectedElement !== null && dragStart) {
      const deltaX = pos.x - dragStart.x
      const deltaY = pos.y - dragStart.y

      if (selectedElementType === 'shape') {
        setShapes(prev => prev.map((shape, i) => {
          if (i !== selectedElement) return shape
          return {
            ...shape,
            startX: shape.startX + deltaX,
            startY: shape.startY + deltaY,
            endX: shape.endX + deltaX,
            endY: shape.endY + deltaY
          }
        }))
      } else if (selectedElementType === 'text') {
        setTexts(prev => prev.map((text, i) => {
          if (i !== selectedElement) return text
          return {
            ...text,
            x: text.x + deltaX,
            y: text.y + deltaY
          }
        }))
      }

      setDragStart(pos)
      return
    }

    if (!isDrawing) return

    if (selectedTool === 'pen') {
      setCurrentPath(prev => [...prev, pos])
    } else if ((selectedTool === 'rectangle' || selectedTool === 'circle') && startPoint) {
      setCurrentShape(prev => prev ? {
        ...prev,
        endX: pos.x,
        endY: pos.y
      } : null)
    }
  }

  const handleMouseUp = () => {
    if (isResizing) {
      setIsResizing(false)
      setResizeHandle(null)
      setDragStart(null)
      saveToHistory()
      return
    }

    if (isDragging) {
      setIsDragging(false)
      setDragStart(null)
      saveToHistory()
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
      saveToHistory()
    } else if ((selectedTool === 'rectangle' || selectedTool === 'circle') && currentShape) {
      const width = Math.abs(currentShape.endX - currentShape.startX)
      const height = Math.abs(currentShape.endY - currentShape.startY)

      if (width > 5 && height > 5) {
        setShapes(prev => [...prev, currentShape])
        saveToHistory()
      }
    }

    setIsDrawing(false)
    setCurrentPath([])
    setStartPoint(null)
    setCurrentShape(null)
  }

  const handleTextSubmit = () => {
    if (textInput.trim() && textPosition) {
      setTexts(prev => [...prev, {
        text: textInput,
        x: textPosition.x,
        y: textPosition.y,
        color: selectedColor,
        size: 16,
        visible: true
      }])
      saveToHistory()
    }
    setIsAddingText(false)
    setTextInput('')
    setTextPosition(null)
  }

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return

    setIsGenerating(true)

    await new Promise(resolve => setTimeout(resolve, 2000))

    const newShape: Shape = {
      type: 'rectangle',
      startX: 100,
      startY: 100,
      endX: 250,
      endY: 180,
      color: aiStyle === 'minimalist' ? '#000000' : aiStyle === 'abstract' ? '#8b5cf6' : '#3b82f6',
      fillColor: aiStyle === 'minimalist' ? 'transparent' : aiStyle === 'abstract' ? '#ec4899' : '#10b981',
      strokeWidth: aiStyle === 'minimalist' ? 1 : 2,
      visible: true
    }

    setShapes(prev => [...prev, newShape])
    saveToHistory()

    setIsGenerating(false)
    setShowAIModal(false)
    setAIPrompt('')
  }

  const pathToSVGPath = (points: Point[]) => {
    if (points.length < 2) return ''

    let path = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`
    }
    return path
  }

  const clearCanvas = () => {
    setPaths([])
    setShapes([])
    setTexts([])
    setCurrentPath([])
    setCurrentShape(null)
    setSelectedElement(null)
    setSelectedElementType(null)
    saveToHistory()
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      undo()
    } else if (e.ctrlKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault()
      redo()
    } else if (e.ctrlKey && e.key === 'c') {
      e.preventDefault()
      copyElement()
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      deleteSelectedElement()
      e.preventDefault()
    }

    const toolMap: Record<string, string> = { 'v': 'select', 'p': 'pen', 'r': 'rectangle', 'c': 'circle', 't': 'text', 'e': 'eraser' }
    if (toolMap[e.key.toLowerCase()] && !e.ctrlKey && !e.altKey) {
      setSelectedTool(toolMap[e.key.toLowerCase()])
    }
  }

  useEffect(() => {
    if (history.length === 0) {
      saveToHistory()
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedElement, selectedElementType, historyIndex, history])

  return (
    <div className="h-screen bg-zinc-950 p-3">
      <div className="h-full bg-gray-900 text-white flex flex-col overflow-hidden rounded-2xl border border-zinc-800">
        {/* Built with HatchIt Badge */}
        <Link
          href="/builder"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3 py-2 bg-zinc-800/90 backdrop-blur-sm border border-zinc-700 rounded-full text-xs text-zinc-400 hover:text-white hover:border-zinc-600 transition-all"
        >
          <span>Built with</span>
          <span className="font-bold">
            <span className="text-white">Hatch</span>
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">It</span>
          </span>
        </Link>

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-pulse">
            <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
              <span className="text-sm">✓</span>
              <span className="text-sm font-medium">{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Link href="/" className="text-xl font-black">
              <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">Hatch</span>
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">It</span>
            </Link>
            <span className="text-zinc-600">|</span>
            {isEditing ? (
              <input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onBlur={() => setIsEditing(false)}
                onKeyPress={(e) => e.key === 'Enter' && setIsEditing(false)}
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                autoFocus
              />
            ) : (
              <h1
                className="text-sm text-zinc-400 cursor-pointer hover:text-white transition-colors"
                onClick={() => setIsEditing(true)}
              >
                {projectName}
              </h1>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAIModal(true)}
              className="p-2 hover:bg-gray-700 rounded transition-colors flex items-center space-x-1"
              title="AI Generate"
            >
              <span>✨</span>
              <span className="text-sm hidden sm:inline">AI Generate</span>
            </button>
            <button
              onClick={clearCanvas}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="Clear Canvas"
            >
              🗑
            </button>
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className={`p-2 rounded transition-colors ${historyIndex <= 0 ? 'text-gray-600' : 'hover:bg-gray-700'}`}
              title="Undo"
            >
              ↶
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className={`p-2 rounded transition-colors ${historyIndex >= history.length - 1 ? 'text-gray-600' : 'hover:bg-gray-700'}`}
              title="Redo"
            >
              ↷
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors text-sm"
            >
              Share
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Toolbar */}
          <div className="w-16 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-4 space-y-2">
            {tools.map(tool => (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl transition-colors ${selectedTool === tool.id
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-700 text-gray-400'
                  }`}
                title={tool.name}
              >
                {tool.icon}
              </button>
            ))}

            <div className="text-xs text-gray-400 mt-4">Stroke</div>
            <div className="w-8 h-8 border-2 border-gray-600 cursor-pointer rounded"
              style={{ backgroundColor: selectedColor }}
              onClick={() => setShowColorPalette(!showColorPalette)}>
            </div>

            <div className="text-xs text-gray-400 mt-2">Fill</div>
            <div
              className="w-8 h-8 border-2 border-gray-600 cursor-pointer rounded relative"
              style={{ backgroundColor: fillColor === 'transparent' ? 'transparent' : fillColor }}
              onClick={() => setShowFillPalette(!showFillPalette)}
            >
              {fillColor === 'transparent' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-0.5 bg-red-500 rotate-45"></div>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-col items-center space-y-1">
              <div className="text-xs text-gray-400">Size</div>
              <input
                type="range"
                min="1"
                max="10"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-10 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-xs">{strokeWidth}</div>
            </div>
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 relative overflow-hidden">
            <div
              className="w-full h-full relative origin-top-left"
              style={{
                backgroundImage: `radial-gradient(circle, rgba(75, 85, 99, 0.5) 1px, transparent 1px)`,
                backgroundSize: `${20 * (zoomLevel / 100)}px ${20 * (zoomLevel / 100)}px`,
                cursor: selectedTool === 'pen' || selectedTool === 'eraser' ? 'crosshair' :
                  selectedTool === 'rectangle' || selectedTool === 'circle' ? 'crosshair' :
                    selectedTool === 'text' ? 'text' :
                      selectedTool === 'select' ? 'default' : 'default',
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: '0 0',
                width: `${100 * (100 / zoomLevel)}%`,
                height: `${100 * (100 / zoomLevel)}%`
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {paths.map((path, index) => path.visible !== false && (
                  <g key={`path-${index}`}>
                    <path
                      d={pathToSVGPath(path.points)}
                      stroke={path.color}
                      strokeWidth={path.strokeWidth || 2}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {selectedElement === index && selectedElementType === 'path' && (
                      <path
                        d={pathToSVGPath(path.points)}
                        stroke="#3b82f6"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="5,5"
                      />
                    )}
                  </g>
                ))}

                {shapes.map((shape, index) => {
                  if (shape.visible === false) return null

                  const isSelected = selectedElement === index && selectedElementType === 'shape'

                  if (shape.type === 'rectangle') {
                    const x = Math.min(shape.startX, shape.endX)
                    const y = Math.min(shape.startY, shape.endY)
                    const width = Math.abs(shape.endX - shape.startX)
                    const height = Math.abs(shape.endY - shape.startY)

                    return (
                      <g key={`rect-${index}`}>
                        <rect
                          x={x}
                          y={y}
                          width={width}
                          height={height}
                          stroke={shape.color}
                          strokeWidth={shape.strokeWidth || 2}
                          fill={shape.fillColor === 'transparent' ? 'none' : shape.fillColor}
                        />
                        {isSelected && (
                          <>
                            <rect
                              x={x - 2}
                              y={y - 2}
                              width={width + 4}
                              height={height + 4}
                              stroke="#3b82f6"
                              strokeWidth="2"
                              fill="none"
                              strokeDasharray="5,5"
                            />
                            {getResizeHandles(shape, 'shape').map(handle => (
                              <rect
                                key={handle.id}
                                x={handle.x - 4}
                                y={handle.y - 4}
                                width="8"
                                height="8"
                                fill="#3b82f6"
                                stroke="#ffffff"
                                strokeWidth="1"
                                className="pointer-events-auto cursor-pointer"
                                style={{ cursor: handle.cursor }}
                              />
                            ))}
                          </>
                        )}
                      </g>
                    )
                  } else if (shape.type === 'circle') {
                    const centerX = (shape.startX + shape.endX) / 2
                    const centerY = (shape.startY + shape.endY) / 2
                    const radiusX = Math.abs(shape.endX - shape.startX) / 2
                    const radiusY = Math.abs(shape.endY - shape.startY) / 2

                    return (
                      <g key={`circle-${index}`}>
                        <ellipse
                          cx={centerX}
                          cy={centerY}
                          rx={radiusX}
                          ry={radiusY}
                          stroke={shape.color}
                          strokeWidth={shape.strokeWidth || 2}
                          fill={shape.fillColor === 'transparent' ? 'none' : shape.fillColor}
                        />
                        {isSelected && (
                          <>
                            <ellipse
                              cx={centerX}
                              cy={centerY}
                              rx={radiusX + 2}
                              ry={radiusY + 2}
                              stroke="#3b82f6"
                              strokeWidth="2"
                              fill="none"
                              strokeDasharray="5,5"
                            />
                            {getResizeHandles(shape, 'shape').map(handle => (
                              <rect
                                key={handle.id}
                                x={handle.x - 4}
                                y={handle.y - 4}
                                width="8"
                                height="8"
                                fill="#3b82f6"
                                stroke="#ffffff"
                                strokeWidth="1"
                                className="pointer-events-auto cursor-pointer"
                                style={{ cursor: handle.cursor }}
                              />
                            ))}
                          </>
                        )}
                      </g>
                    )
                  }
                  return null
                })}

                {texts.map((text, index) => {
                  if (text.visible === false) return null

                  const isSelected = selectedElement === index && selectedElementType === 'text'

                  return (
                    <g key={`text-${index}`}>
                      <text
                        x={text.x}
                        y={text.y}
                        fill={text.color}
                        fontSize={text.size}
                        fontFamily="Arial, sans-serif"
                      >
                        {text.text}
                      </text>
                      {isSelected && (
                        <>
                          <rect
                            x={text.x - 2}
                            y={text.y - text.size - 2}
                            width={text.text.length * (text.size * 0.6) + 4}
                            height={text.size + 4}
                            stroke="#3b82f6"
                            strokeWidth="2"
                            fill="none"
                            strokeDasharray="5,5"
                          />
                          {getResizeHandles(text, 'text').map(handle => (
                            <rect
                              key={handle.id}
                              x={handle.x - 3}
                              y={handle.y - 3}
                              width="6"
                              height="6"
                              fill="#3b82f6"
                              stroke="#ffffff"
                              strokeWidth="1"
                              className="pointer-events-auto cursor-pointer"
                              style={{ cursor: handle.cursor }}
                            />
                          ))}
                        </>
                      )}
                    </g>
                  )
                })}

                {isDrawing && selectedTool === 'pen' && currentPath.length > 1 && (
                  <path
                    d={pathToSVGPath(currentPath)}
                    stroke={selectedColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {isDrawing && currentShape && (
                  <>
                    {currentShape.type === 'rectangle' && (
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
                    )}
                    {currentShape.type === 'circle' && (
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
                    )}
                  </>
                )}
              </svg>

              {isAddingText && textPosition && (
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onBlur={handleTextSubmit}
                  onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
                  className="absolute bg-transparent border-b border-gray-400 text-white outline-none"
                  style={{
                    left: textPosition.x,
                    top: textPosition.y,
                    color: selectedColor,
                    fontSize: '16px'
                  }}
                  autoFocus
                  placeholder="Type text..."
                />
              )}
            </div>

            {showColorPalette && (
              <div className="absolute top-4 left-20 bg-gray-800 border border-gray-700 rounded-lg p-2 grid grid-cols-5 gap-1 shadow-lg z-10">
                <div className="col-span-5 text-xs text-gray-400 mb-2 px-1">Stroke Color</div>
                {colors.map(color => (
                  <div
                    key={color}
                    className={`w-8 h-8 rounded cursor-pointer border-2 hover:scale-110 transition-transform ${color === '#ffffff' ? 'border-gray-400' : 'border-gray-600'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setSelectedColor(color)
                      setShowColorPalette(false)
                    }}
                  />
                ))}
              </div>
            )}

            {showFillPalette && (
              <div className="absolute top-4 left-20 bg-gray-800 border border-gray-700 rounded-lg p-2 grid grid-cols-5 gap-1 shadow-lg z-10">
                <div className="col-span-5 text-xs text-gray-400 mb-2 px-1">Fill Color</div>
                {fillColors.map((color) => (
                  <div
                    key={color}
                    className={`w-8 h-8 rounded cursor-pointer border-2 hover:scale-110 transition-transform relative ${color === '#ffffff' ? 'border-gray-400' : 'border-gray-600'}`}
                    style={{ backgroundColor: color === 'transparent' ? '#374151' : color }}
                    onClick={() => {
                      setFillColor(color)
                      setShowFillPalette(false)
                    }}
                  >
                    {color === 'transparent' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-0.5 bg-red-500 rotate-45"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowShortcuts(!showShortcuts)}
              className="absolute bottom-4 left-4 text-xs text-gray-500 hover:text-gray-400 cursor-pointer"
            >
              Press ? for shortcuts
            </button>

            {showShortcuts && (
              <div className="absolute bottom-12 left-4 bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg z-10">
                <div className="text-xs font-medium mb-2">Keyboard Shortcuts</div>
                {shortcuts.map(shortcut => (
                  <div key={shortcut.key} className="flex justify-between text-xs py-1">
                    <span className="text-gray-400">{shortcut.key}</span>
                    <span className="ml-4">{shortcut.action}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="w-64 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setActivePanel('properties')}
                className={`flex-1 px-4 py-2 text-sm transition-colors ${activePanel === 'properties'
                    ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
              >
                Properties
              </button>
              <button
                onClick={() => setActivePanel('layers')}
                className={`flex-1 px-4 py-2 text-sm transition-colors ${activePanel === 'layers'
                    ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
              >
                Layers
              </button>
            </div>

            {activePanel === 'properties' && (
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Tool</label>
                    <div className="text-sm">{tools.find(t => t.id === selectedTool)?.name}</div>
                  </div>

                  {selectedElement !== null && selectedElementType && (
                    <div>
                      <label className="text-sm text-gray-400">Selected</label>
                      <div className="text-sm text-blue-400">
                        {selectedElementType === 'shape' && shapes[selectedElement] &&
                          `${shapes[selectedElement].type} ${selectedElement + 1}`}
                        {selectedElementType === 'path' && `Path ${selectedElement + 1}`}
                        {selectedElementType === 'text' && texts[selectedElement] &&
                          texts[selectedElement].text}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm text-gray-400">Stroke Color</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <div
                        className="w-6 h-6 rounded border border-gray-600"
                        style={{ backgroundColor: selectedColor }}
                      />
                      <span className="text-sm">{selectedColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Fill Color</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <div
                        className="w-6 h-6 rounded border border-gray-600 relative"
                        style={{ backgroundColor: fillColor === 'transparent' ? 'transparent' : fillColor }}
                      >
                        {fillColor === 'transparent' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-4 h-0.5 bg-red-500 rotate-45"></div>
                          </div>
                        )}
                      </div>
                      <span className="text-sm">{fillColor === 'transparent' ? 'None' : fillColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Stroke Width</label>
                    <div className="text-sm">{strokeWidth}px</div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Elements</label>
                    <div className="text-sm">{paths.length + shapes.length + texts.length}</div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Mouse Position</label>
                    <div className="text-xs text-gray-500">X: {Math.round(mousePos.x)}, Y: {Math.round(mousePos.y)}</div>
                  </div>
                </div>
              </div>
            )}

            {activePanel === 'layers' && (
              <div className="flex-1 flex flex-col">
                <div className="p-3 border-b border-gray-700">
                  <button
                    onClick={addNewLayer}
                    className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>+</span>
                    <span>New Layer</span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="p-2 space-y-1">
                    {getAllLayers().length === 0 ? (
                      <div className="text-center text-gray-500 text-sm py-8">
                        No layers yet
                      </div>
                    ) : (
                      getAllLayers().map((layer) => (
                        <div
                          key={layer.id}
                          className={`group flex items-center space-x-2 px-2 py-2 rounded cursor-pointer transition-colors ${selectedElement === layer.index && selectedElementType === layer.type
                              ? 'bg-blue-600/20 border border-blue-500/50'
                              : 'hover:bg-gray-700'
                            }`}
                          onClick={() => selectLayer(layer.type, layer.index)}
                        >
                          <span className="text-xs">{layer.icon}</span>

                          <div className="flex-1 min-w-0">
                            <div className="text-xs truncate">{layer.name}</div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleLayerVisibility(layer.id, layer.type, layer.index)
                            }}
                            className={`opacity-0 group-hover:opacity-100 transition-opacity text-xs ${layer.visible ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-400'}`}
                          >
                            {layer.visible ? '👁' : '🚫'}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteLayer(layer.type, layer.index)
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-red-400 hover:text-red-300"
                          >
                            🗑
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-t border-gray-700 text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setZoomLevel(Math.max(25, zoomLevel - 25))}
                className="px-2 py-1 hover:bg-gray-700 rounded"
              >
                -
              </button>
              <span className="min-w-12 text-center">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(Math.min(400, zoomLevel + 25))}
                className="px-2 py-1 hover:bg-gray-700 rounded"
              >
                +
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="px-2 py-1 hover:bg-gray-700 rounded text-xs"
              >
                Reset
              </button>
            </div>

            <div className="text-gray-400">
              {selectedElement !== null && selectedElementType ? 'Element selected' : 'Ready'}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-400">HatchIt Canvas</span>
          </div>
        </div>

        {/* AI Generate Modal */}
        {showAIModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-96 border border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-xl">✨</span>
                <h3 className="text-lg font-medium">AI Generate</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Describe what you want to create</label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAIPrompt(e.target.value)}
                    placeholder="e.g., Create a modern dashboard layout with cards and charts"
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Style</label>
                  <select
                    value={aiStyle}
                    onChange={(e) => setAIStyle(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                  >
                    {aiStyles.map(style => (
                      <option key={style.value} value={style.value}>
                        {style.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setShowAIModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAIGenerate}
                  disabled={!aiPrompt.trim() || isGenerating}
                  className={`px-4 py-2 rounded text-sm transition-colors flex items-center space-x-2 ${!aiPrompt.trim() || isGenerating
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>Generate</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-96 border border-gray-700">
              <h3 className="text-lg font-medium mb-4">Share Project</h3>
              <div className="flex space-x-2 mb-4">
                <input
                  value={typeof window !== 'undefined' ? window.location.href : ''}
                  readOnly
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                />
                <button
                  onClick={() => navigator.clipboard?.writeText(window.location.href)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                >
                  Copy
                </button>
              </div>
              <div className="text-xs text-gray-400 mb-4">
                Share this link with others to show them the canvas
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}