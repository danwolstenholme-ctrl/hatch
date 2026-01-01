'use client'

import { SignUp } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export default function SignUpPage() {
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect_url') || '/builder'
  
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden p-4">
      {/* Optimized Background - No heavy blurs */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-zinc-950/50 to-zinc-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 mb-4 shadow-lg shadow-emerald-500/10">
            <Sparkles className="w-6 h-6 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
            Initialize Architect
          </h1>
          <p className="text-zinc-400 text-sm">
            Join the Singularity. Build at the speed of thought.
          </p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-1 shadow-2xl shadow-black/50 ring-1 ring-white/5">
          <div className="bg-zinc-950/50 rounded-xl p-6 sm:p-8">
            <SignUp 
              forceRedirectUrl={redirectUrl} 
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'bg-transparent shadow-none p-0 w-full',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  
                  // Primary Button
                  formButtonPrimary: 'bg-emerald-600 hover:bg-emerald-500 text-white w-full py-3 rounded-lg font-medium transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] text-sm',
                  
                  // Inputs
                  formFieldInput: 'bg-zinc-900/50 border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 text-white rounded-lg py-3 text-sm transition-all',
                  formFieldLabel: 'text-zinc-400 text-xs font-medium mb-1.5',
                  
                  // Social Buttons (Apple, Google, etc)
                  socialButtonsBlockButton: 'bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 h-10 rounded-lg transition-all',
                  socialButtonsBlockButtonText: 'font-medium text-sm',
                  socialButtonsBlockButtonArrow: 'hidden',
                  
                  // Links & Text
                  footerActionLink: 'text-emerald-500 hover:text-emerald-400 font-medium',
                  identityPreviewText: 'text-zinc-300',
                  formFieldInputShowPasswordButton: 'text-zinc-500 hover:text-zinc-300',
                  dividerLine: 'bg-zinc-800',
                  dividerText: 'text-zinc-500 bg-zinc-950 px-2',
                  
                  // Alerts
                  alertText: 'text-red-400 text-sm',
                  alert: 'bg-red-950/30 border border-red-900/50 text-red-400 rounded-lg',
                  formFieldAction: 'text-emerald-500 hover:text-emerald-400 text-xs',
                },
                layout: {
                  socialButtonsPlacement: 'top',
                  showOptionalFields: false,
                }
              }} 
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-500 text-[10px] font-mono">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            SYSTEM STATUS: ONLINE
          </div>
        </div>
      </motion.div>
    </div>
  )
}
