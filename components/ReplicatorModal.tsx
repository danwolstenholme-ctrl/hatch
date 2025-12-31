'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Globe, Loader2, ArrowRight, Zap, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ReplicatorModalProps {
  isOpen: boolean
  onClose: () => void
  onReplicate: (data: any) => void
}

export default function ReplicatorModal({ isOpen, onClose, onReplicate }: ReplicatorModalProps) {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<'idle' | 'fetching' | 'analyzing' | 'complete' | 'error'>('idle')
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    // Basic URL validation
    let targetUrl = url
    if (!targetUrl.startsWith('http')) {
      targetUrl = 'https://' + targetUrl
    }

    setStatus('fetching')
    setError('')
    setProgress(10)

    try {
      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 10
        })
      }, 500)

      const res = await fetch('/api/replicator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      })

      clearInterval(progressInterval)

      if (!res.ok) {
        const data = await res.json()
        if (res.status === 403 && data.requiresUpgrade) {
          throw new Error('UPGRADE_REQUIRED')
        }
        throw new Error(data.error || 'Failed to replicate site')
      }

      setStatus('analyzing')
      setProgress(95)
      
      const data = await res.json()
      
      setStatus('complete')
      setProgress(100)
      
      // Small delay to show success state
      setTimeout(() => {
        onReplicate(data)
        onClose()
      }, 1000)

    } catch (err: any) {
      setStatus('error')
      if (err.message === 'UPGRADE_REQUIRED') {
        setError('The Replicator is a Demiurge-tier feature. Please upgrade to access.')
      } else {
        setError(err.message || 'Something went wrong. The site might be blocked.')
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">The Replicator</h2>
                  <p className="text-xs text-zinc-400">Clone any website's DNA instantly</p>
                </div>
              </div>
              <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {status === 'error' ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-500/10 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-white font-medium mb-1">Replication Failed</h3>
                  <p className="text-sm text-zinc-400 mb-4">{error}</p>
                  <button 
                    onClick={() => setStatus('idle')}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : status === 'complete' ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h3 className="text-white font-medium mb-1">DNA Extracted</h3>
                  <p className="text-sm text-zinc-400">Initializing Genesis Engine...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Target URL</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                        disabled={status !== 'idle'}
                      />
                    </div>
                  </div>

                  {status !== 'idle' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-zinc-500">
                        <span>{status === 'fetching' ? 'Accessing mainframe...' : 'Decoding structure...'}</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-purple-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!url || status !== 'idle'}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/20"
                  >
                    {status === 'idle' ? (
                      <>
                        Replicate Site <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Processing
                      </>
                    )}
                  </button>
                  
                  <p className="text-xs text-center text-zinc-500">
                    Available exclusively for Demiurge tier.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
