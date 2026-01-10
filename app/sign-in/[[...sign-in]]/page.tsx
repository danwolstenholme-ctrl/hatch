'use client'

import { SignIn } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'
import { LogoMark } from '@/components/Logo'

export default function SignInPage() {
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect_url') || '/dashboard'
  
  return (
    <div className="min-h-screen bg-zinc-950 flex relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />

      {/* Left side - Welcome back */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-center px-12 xl:px-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md"
        >
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-3 mb-10 group">
            <LogoMark size={40} />
            <span className="text-xl font-bold text-white tracking-tight">HatchIt</span>
          </Link>

          {/* Headline */}
          <h1 className="text-3xl xl:text-4xl font-bold text-white mb-4 tracking-tight">
            Welcome back
          </h1>
          
          <p className="text-zinc-400 text-base mb-8 leading-relaxed">
            Your projects are waiting. Pick up right where you left off.
          </p>

          {/* Quick tip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-300 font-medium mb-1">Pro tip</p>
                <p className="text-xs text-zinc-500">Use the refinement panel to iterate on any section. Your changes are saved automatically.</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right side - Sign in form */}
      <div className="flex-1 lg:flex-none lg:w-[520px] flex flex-col items-center justify-center p-6 sm:p-8 relative z-10">
        {/* Mobile logo */}
        <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
          <LogoMark size={32} />
          <span className="text-lg font-bold text-white">HatchIt</span>
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Mobile headline */}
          <div className="lg:hidden text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-sm text-zinc-400">Sign in to continue building</p>
          </div>

          <SignIn 
            forceRedirectUrl={redirectUrl}
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/50 shadow-2xl shadow-black/50 rounded-2xl',
                headerTitle: 'text-white font-bold text-xl',
                headerSubtitle: 'text-zinc-400',
                socialButtonsBlockButton: 'bg-zinc-800/60 backdrop-blur-xl border border-zinc-700/50 text-white hover:bg-zinc-700/60 hover:border-zinc-600 transition-all rounded-xl h-11',
                socialButtonsBlockButtonText: 'text-zinc-200 font-medium',
                dividerLine: 'bg-zinc-800',
                dividerText: 'text-zinc-500',
                formFieldLabel: 'text-zinc-300 text-sm',
                formFieldInput: 'bg-zinc-800/60 border-zinc-700/50 text-white focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl h-11',
                footerActionLink: 'text-emerald-400 hover:text-emerald-300 font-medium',
                identityPreviewText: 'text-zinc-300',
                identityPreviewEditButton: 'text-emerald-400 hover:text-emerald-300',
                formButtonPrimary: 'bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl h-11 shadow-lg shadow-emerald-500/20 transition-all',
                formButtonReset: 'text-emerald-400 hover:text-emerald-300',
                alertText: 'text-zinc-300',
                footerActionText: 'text-zinc-400',
                footer: 'hidden',
              }
            }}
          />

          {/* Custom footer */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-sm text-zinc-500 mt-6"
          >
            Don't have an account?{' '}
            <Link href="/sign-up" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Sign up free
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
