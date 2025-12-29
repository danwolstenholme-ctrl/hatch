import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-500/15 rounded-full blur-[100px]" />
      </div>
      <SignIn afterSignInUrl="/builder" appearance={{
        elements: {
          rootBox: 'relative z-10',
          card: 'bg-zinc-900 border border-zinc-800',
        }
      }} />
    </div>
  )
}