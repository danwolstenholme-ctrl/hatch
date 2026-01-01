'use client'

import { SignUp } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Brain, Cpu, Sparkles, Zap, Shield, Code2, ArrowRight } from 'lucide-react'
import { useState } from 'react'

export default function SignUpPage() {
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect_url') || '/builder'
  
  return (
    <div className="min-h-screen bg-zinc-950 flex relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center p-4 lg:p-8 gap-12 lg:gap-20 relative z-10">
        
        {/* Left Column: The Guide / Welcome */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 max-w-xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            System Status: ONLINE
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold text-white tracking-tight mb-6">
            Welcome to the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Singularity.</span>
          </h1>
          
          <p className="text-zinc-400 text-lg leading-relaxed mb-8">
            You are entering the first recursive AI development environment. 
            HatchIt doesn't just write code; it understands architecture.
          </p>

          <div className="space-y-6 mb-10">
            <div className="flex gap-4 items-start group">
              <div className="w-12 h-12 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:border-emerald-500/30 transition-colors">
                <Brain className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1 flex items-center gap-2">
                  The Architect Node
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">GEMINI 2.0</span>
                </h3>
                <p className="text-sm text-zinc-500">Handles high-level vision, UX strategy, and aesthetic coherence.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start group">
              <div className="w-12 h-12 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:border-purple-500/30 transition-colors">
                <Cpu className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1 flex items-center gap-2">
                  The Engineer Node
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">GPT-CODEX</span>
                </h3>
                <p className="text-sm text-zinc-500">Executes complex logic, refactoring, and type-safe implementation.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start group">
              <div className="w-12 h-12 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:border-amber-500/30 transition-colors">
                <Sparkles className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Self-Healing Code</h3>
                <p className="text-sm text-zinc-500">The system recursively audits itself, fixing bugs before you see them.</p>
              </div>
            </div>
          </div>

          <div className="hidden lg:block p-4 rounded-lg bg-zinc-900/30 border border-zinc-800/50">
            <p className="text-xs text-zinc-500 font-mono mb-2">SYSTEM_MESSAGE:</p>
            <p className="text-sm text-emerald-400/80 font-mono">
              "Identity verification required for neural link establishment. Please proceed to the terminal."
            </p>
          </div>
        </motion.div>

        {/* Right Column: Sign Up Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="relative">
            {/* Glow behind the card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl opacity-50" />
            
            <div className="relative bg-zinc-950 border border-zinc-800 rounded-2xl p-1 shadow-2xl">
              <div className="bg-zinc-900/50 rounded-xl p-6 sm:p-8">
                <div className="mb-6 text-center">
                  <h2 className="text-xl font-bold text-white">Initialize System</h2>
                  <p className="text-zinc-500 text-sm mt-1">Create your Architect account.</p>
                </div>

                <SignUp 
                  forceRedirectUrl={redirectUrl} 
                  appearance={{
                    elements: {
                      rootBox: 'w-full',
                      card: 'bg-transparent shadow-none p-0 w-full',
                      headerTitle: 'hidden',
                      headerSubtitle: 'hidden',
                      formButtonPrimary: 'bg-emerald-600 hover:bg-emerald-500 text-white w-full py-2.5 rounded-lg font-medium transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]',
                      formFieldInput: 'bg-zinc-950 border-zinc-800 focus:border-emerald-500 text-white rounded-lg py-2.5',
                      formFieldLabel: 'text-zinc-400 text-xs uppercase tracking-wider font-mono mb-1.5',
                      footerActionLink: 'text-emerald-500 hover:text-emerald-400 font-medium',
                      identityPreviewText: 'text-zinc-300',
                      formFieldInputShowPasswordButton: 'text-zinc-400 hover:text-white',
                      dividerLine: 'bg-zinc-800',
                      dividerText: 'text-zinc-500 bg-transparent',
                      socialButtonsBlockButton: 'bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-300',
                      socialButtonsBlockButtonText: 'font-medium',
                      formFieldAction: 'text-emerald-500 hover:text-emerald-400',
                      alertText: 'text-red-400',
                      alert: 'bg-red-900/20 border border-red-900/50 text-red-400',
                    },
                    layout: {
                      socialButtonsPlacement: 'bottom',
                      showOptionalFields: false,
                    }
                  }} 
                />
                
                <div className="mt-6 pt-6 border-t border-zinc-800/50 text-center">
                  <p className="text-xs text-zinc-600">
                    By connecting, you agree to the <a href="/terms" className="text-zinc-500 hover:text-zinc-400 underline">Terms</a> and <a href="/privacy" className="text-zinc-500 hover:text-zinc-400 underline">Privacy Policy</a>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
