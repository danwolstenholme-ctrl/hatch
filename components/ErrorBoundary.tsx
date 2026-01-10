'use client'

import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, ShieldCheck, Terminal } from 'lucide-react'
import { motion } from 'framer-motion'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  isHealing: boolean
  healStatus: 'idle' | 'analyzing' | 'patching' | 'resolved' | 'failed'
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null,
      isHealing: false,
      healStatus: 'idle'
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      isHealing: true, // Auto-start healing
      healStatus: 'analyzing'
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[SYSTEM_FAILURE] Component crash detected:', error)
    this.props.onError?.(error, errorInfo)
    
    // Show error state - actual healing happens in SectionBuilder via refiner
    this.showErrorRecovery()
  }

  showErrorRecovery() {
    // Simulate quick analysis then show failed state for manual retry
    this.setState({ healStatus: 'analyzing' })
    
    setTimeout(() => {
      this.setState({ healStatus: 'failed' })
    }, 1500)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-zinc-950/50 border border-red-500/20 rounded-lg p-8 text-center relative overflow-hidden">
          {/* Background Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ef444410_1px,transparent_1px),linear-gradient(to_bottom,#ef444410_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          
          <div className="relative z-10 max-w-md w-full">
            {this.state.healStatus === 'analyzing' && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 mb-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Terminal className="w-8 h-8 text-amber-400 animate-pulse" />
                </div>
                <h2 className="text-xl font-bold text-white font-mono mb-2">ANOMALY DETECTED</h2>
                <p className="text-zinc-400 font-mono text-sm mb-6">Analyzing stack trace for corruption...</p>
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-amber-500"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5 }}
                  />
                </div>
              </motion.div>
            )}

            {this.state.healStatus === 'patching' && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 mb-6 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                </div>
                <h2 className="text-xl font-bold text-white font-mono mb-2">APPLYING FIX</h2>
                <p className="text-zinc-400 font-mono text-sm mb-6">Rewriting component logic...</p>
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-emerald-500"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5 }}
                  />
                </div>
              </motion.div>
            )}

            {this.state.healStatus === 'resolved' && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 mb-6 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-white font-mono mb-2">SYSTEM RESTORED</h2>
                <p className="text-zinc-400 font-mono text-sm">Resuming normal operation...</p>
              </motion.div>
            )}

            {this.state.healStatus === 'failed' && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 mb-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-white font-mono mb-2">CRITICAL FAILURE</h2>
                <p className="text-zinc-400 font-mono text-sm mb-6">
                  {this.state.error?.message || 'Unknown system error'}
                </p>
                <button
                  onClick={() => this.setState({ hasError: false, error: null, isHealing: false, healStatus: 'idle' })}
                  className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-sm text-sm font-mono text-white transition-all hover:border-emerald-500/50"
                >
                  MANUAL_RESET
                </button>
              </motion.div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
