'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Activity, Zap, Volume2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface DirectLineProps {
  context: {
    stage: string
    prompt: string
    selectedElement: any
  }
  onAction: (action: string, value: string) => void
}

export default function DirectLine({ context, onAction }: DirectLineProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [architectMessage, setArchitectMessage] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)

  const contextRef = useRef(context)

  useEffect(() => {
    contextRef.current = context
  }, [context])

  useEffect(() => {
    if (typeof window !== 'undefined' && ((window as any).webkitSpeechRecognition || (window as any).SpeechRecognition)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript
        setIsListening(false)
        await handleArchitectInteraction(transcript)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  const handleArchitectInteraction = async (transcript: string) => {
    setIsProcessing(true)
    try {
      const res = await fetch('/api/direct-line', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          context: contextRef.current
        })
      })
      
      const data = await res.json()
      
      if (data.message) {
        setArchitectMessage(data.message)
        speak(data.message)
      }
      
      if (data.action && data.action !== 'none' && data.suggested_value) {
        onAction(data.action, data.suggested_value)
      }
      
    } catch (err) {
      console.error('Architect connection failed', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true)
      const utterance = new SpeechSynthesisUtterance(text)
      // Try to find a good voice
      const voices = window.speechSynthesis.getVoices()
      const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'))
      if (preferredVoice) utterance.voice = preferredVoice
      
      utterance.rate = 1.1
      utterance.pitch = 0.9
      
      utterance.onend = () => {
        setIsSpeaking(false)
        setTimeout(() => setArchitectMessage(null), 3000)
      }
      
      window.speechSynthesis.speak(utterance)
    }
  }

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
    } else {
      try {
        recognitionRef.current?.start()
        setIsListening(true)
        setArchitectMessage(null)
      } catch (e) {
        console.error('Failed to start speech recognition:', e)
        setIsListening(false)
      }
    }
  }

  return (
    <div className="relative">
      <AnimatePresence>
        {architectMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-14 right-0 w-64 bg-zinc-900/90 border border-green-500/30 backdrop-blur-md p-4 rounded-xl shadow-2xl z-50"
          >
            <div className="flex items-center gap-2 mb-2 border-b border-green-500/20 pb-2">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="text-xs font-bold text-green-400 uppercase tracking-wider">The Architect</span>
            </div>
            <p className="text-xs text-zinc-300 font-mono leading-relaxed">
              "{architectMessage}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={toggleListening}
        className={`relative p-3 rounded-full transition-all shadow-lg group ${
          isListening 
            ? 'bg-red-500 text-white shadow-red-500/20' 
            : isProcessing
            ? 'bg-amber-500 text-white shadow-amber-500/20'
            : isSpeaking
            ? 'bg-green-500 text-white shadow-green-500/20'
            : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 border border-zinc-700'
        }`}
      >
        {isListening ? (
          <MicOff className="w-5 h-5" />
        ) : isProcessing ? (
          <Zap className="w-5 h-5 animate-pulse" />
        ) : isSpeaking ? (
          <Volume2 className="w-5 h-5 animate-pulse" />
        ) : (
          <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
        )}
        
        {/* Ripple effect when listening */}
        {isListening && (
          <span className="absolute inset-0 rounded-full border border-red-500 animate-ping opacity-75"></span>
        )}
      </button>
    </div>
  )
}
