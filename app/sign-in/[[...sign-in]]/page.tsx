'use client'

import { SignIn } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export default function SignInPage() {
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
        className="w-full max-w-md relative z-10 mt-20"
      >
        {/* Clerk Sign In */}
        <div className="flex justify-center">
          <SignIn 
            forceRedirectUrl={redirectUrl}
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'bg-black border border-white/10 shadow-2xl shadow-black/50',
                headerTitle: 'text-white',
                headerSubtitle: 'text-zinc-400',
                socialButtonsBlockButton: 'bg-white/5 border-white/10 text-white hover:bg-white/10',
                formFieldLabel: 'text-zinc-300',
                formFieldInput: 'bg-white/5 border-white/10 text-white',
                footerActionLink: 'text-emerald-400 hover:text-emerald-300',
                identityPreviewText: 'text-zinc-300',
                identityPreviewEditButton: 'text-emerald-400',
                formButtonPrimary: 'bg-emerald-600 hover:bg-emerald-500',
              }
            }}
          />
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
