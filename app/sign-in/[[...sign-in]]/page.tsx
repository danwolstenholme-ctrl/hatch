'use client'

import { SignIn } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'

export default function SignInPage() {
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect_url') || '/builder'
  
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Matrix/Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Ambient Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 mb-8 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">Identify Yourself</h1>
        <p className="text-emerald-500/60 font-mono text-sm mt-2">The Architect is waiting.</p>
      </div>

      <SignIn forceRedirectUrl={redirectUrl} appearance={{
        elements: {
          rootBox: 'relative z-10',
          card: 'bg-zinc-900 border border-emerald-900/50 shadow-[0_0_50px_rgba(16,185,129,0.1)]',
          headerTitle: 'hidden',
          headerSubtitle: 'hidden',
          formButtonPrimary: 'bg-emerald-600 hover:bg-emerald-500 text-white',
          formFieldInput: 'bg-zinc-900 border-zinc-800 focus:border-emerald-500 text-white',
          formFieldLabel: 'text-zinc-400',
          footerActionLink: 'text-emerald-500 hover:text-emerald-400',
          identityPreviewText: 'text-zinc-300',
          formFieldInputShowPasswordButton: 'text-zinc-400 hover:text-white',
        }
      }} />
    </div>
  )
}
