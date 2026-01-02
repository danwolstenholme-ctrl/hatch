'use client'

import { SignIn } from '@clerk/nextjs'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'

// =============================================================================
// DEV BYPASS MODE - Set to true for local testing without Clerk
// =============================================================================
const DEV_BYPASS = false

export default function SignInPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const redirectUrl = searchParams.get('redirect_url') || '/builder'
  
  const handleBypass = () => {
    router.push(redirectUrl)
  }
  
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
            Welcome Back
          </h1>
          <p className="text-zinc-400 text-sm">
            Resume your session
          </p>
        </div>

        {/* DEV BYPASS Card */}
        {DEV_BYPASS ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
                DEV BYPASS ACTIVE
              </div>
              <p className="text-zinc-400 text-sm">
                Auth bypassed for development. Click below to continue.
              </p>
              <button
                onClick={handleBypass}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                Continue to {redirectUrl}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Original Clerk Card - uncomment for production */
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-1 shadow-2xl shadow-black/50 ring-1 ring-white/5">
            <div className="bg-zinc-950/50 rounded-xl p-6 sm:p-8">
              {/* <SignIn forceRedirectUrl={redirectUrl} ... /> */}
              <p className="text-zinc-500 text-center">Clerk SignIn disabled</p>
            </div>
          </div>
        )}

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
