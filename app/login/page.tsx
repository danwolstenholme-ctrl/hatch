'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

   if (res.ok) {
  router.push('/builder')
    } else {
      setError('Wrong password')
    }
  }

  return (
    <div className="h-screen bg-zinc-950 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-zinc-900 p-8 rounded-xl border border-zinc-700 w-80">
        <h1 className="text-xl font-semibold text-zinc-100 mb-6">HatchIt</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 mb-4"
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          type="submit"
          className="w-full px-4 py-2 bg-zinc-100 text-zinc-900 rounded-lg text-sm font-medium hover:bg-white transition-colors"
        >
          Enter
        </button>
      </form>
    </div>
  )
}