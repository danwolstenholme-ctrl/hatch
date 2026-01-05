'use client'

import { SignUp } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Terminal } from 'lucide-react'

export default function SignUpPage() {
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect_url') || '/builder'
  
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden p-4">
      {/* Optimized Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-zinc-950/50 to-zinc-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10 mt-20"
      >
        {/* Clerk Sign Up */}
        <div className="flex justify-center">
          <SignUp 
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
                formButtonPrimary: 'bg-emerald-600 hover:bg-emerald-500 text-white',
              }
            }}
          />
        </div>
      </motion.div>
    </div>
  )
}
