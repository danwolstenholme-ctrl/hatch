'use client'

import { SignUp } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, Code2, Github, Zap, Shield } from 'lucide-react'
import Link from 'next/link'
import { LogoMark } from '@/components/Logo'

const benefits = [
  { icon: Code2, text: 'Full source code ownership' },
  { icon: Github, text: 'Push directly to your GitHub' },
  { icon: Zap, text: 'Deploy to Vercel in one click' },
  { icon: Shield, text: 'No vendor lock-in, ever' },
]

export default function SignUpPage() {
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect_url') || '/dashboard'
  
  return (
    <div className="min-h-screen bg-zinc-950 flex relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.12),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />

      {/* Left side - Value prop */}
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
          <h1 className="text-3xl xl:text-4xl font-bold text-white mb-4 tracking-tight leading-tight">
            Build production websites<br />
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
              in minutes, not months.
            </span>
          </h1>
          
          <p className="text-zinc-400 text-base mb-8 leading-relaxed">
            Describe what you want. Watch it build. Ship it live. 
            <span className="text-zinc-300"> You own every line of code.</span>
          </p>

          {/* Benefits */}
          <div className="space-y-4 mb-10">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                className="flex items-center gap-3"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <benefit.icon className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-zinc-300 text-sm">{benefit.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="pt-8 border-t border-zinc-800/50"
          >
            <p className="text-xs text-zinc-500 mb-3">POWERED BY</p>
            <div className="flex items-center gap-6 text-zinc-500">
              <span className="text-sm font-medium">Claude Sonnet 4.5</span>
              <span className="text-zinc-700">•</span>
              <span className="text-sm font-medium">React 19</span>
              <span className="text-zinc-700">•</span>
              <span className="text-sm font-medium">Tailwind 4</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right side - Sign up form */}
      <div className="flex-1 lg:flex-none lg:w-[480px] flex flex-col items-center justify-center p-4 sm:p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-sm"
        >
          {/* Mobile headline */}
          <div className="lg:hidden text-center mb-4">
            <h1 className="text-xl font-bold text-white mb-1">Create your account</h1>
            <p className="text-sm text-zinc-400">Start building in minutes</p>
          </div>

          <SignUp 
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

              }
            }}
          />

        </motion.div>
      </div>
    </div>
  )
}
