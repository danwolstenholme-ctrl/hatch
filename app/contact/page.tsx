'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MessageSquare, ArrowLeft, Rocket, Heart, Send } from 'lucide-react'
import Link from 'next/link'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', topic: 'General', message: '', website: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'sending') return
    setStatus('sending')
    setError(null)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to send. Try again.')
      }

      setStatus('sent')
      setForm({ name: '', email: '', topic: 'General', message: '', website: '' })
    } catch (err: any) {
      setStatus('error')
      setError(err.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-20 pb-12 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.08),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(124,58,237,0.1),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(6,182,212,0.08),transparent_45%)] pointer-events-none" />
      <div className="max-w-4xl mx-auto relative">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-emerald-400 transition-colors mb-6 group text-sm"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        {/* Header with Early Days badge */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
              Let's Talk
            </span>
          </h1>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
            <Rocket className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 text-xs font-medium">Early Access — Your feedback shapes everything</span>
          </div>
        </div>

        <p className="text-zinc-400 mb-8 text-sm max-w-2xl">
          Bugs, features, partnerships, or a quick hello — drop a note. We route everything to a human at support@hatchit.dev.
        </p>

        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 shadow-[0_0_60px_rgba(16,185,129,0.08)] backdrop-blur"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-wide">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Ada Lovelace"
                  className="mt-2 w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:ring-emerald-500/30 outline-none transition"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-wide">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@company.com"
                  className="mt-2 w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:ring-emerald-500/30 outline-none transition"
                />
              </div>
            </div>

            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-wide">Topic</label>
                <select
                  name="topic"
                  value={form.topic}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:ring-emerald-500/30 outline-none transition"
                >
                  <option>General</option>
                  <option>Support</option>
                  <option>Feature Request</option>
                  <option>Partnership</option>
                  <option>Bug Report</option>
                </select>
              </div>
              <div className="hidden">
                <label className="text-xs text-zinc-400 uppercase tracking-wide">Website</label>
                <input
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs text-zinc-400 uppercase tracking-wide">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                minLength={10}
                placeholder="Tell us how we can help..."
                className="mt-2 w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-3 text-sm text-white focus:border-emerald-500 focus:ring-emerald-500/30 outline-none transition h-32 resize-none"
              />
            </div>

            {error && (
              <div className="mt-3 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {status === 'sent' && (
              <div className="mt-3 text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
                Message received — a human will reply from support@hatchit.dev.
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === 'sending' ? (
                <>
                  <div className="w-4 h-4 border-2 border-emerald-900 border-t-emerald-100 rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send to the team
                </>
              )}
            </button>
          </motion.form>

          {/* Secondary channels */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-2 border-orange-500/30 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-orange-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white">r/HatchIt</h3>
                    <span className="text-[10px] bg-orange-500/20 text-orange-200 px-2 py-0.5 rounded-full">Fastest</span>
                  </div>
                  <p className="text-xs text-orange-100/80">Community, feature votes, bug reports.</p>
                  <Link href="https://www.reddit.com/r/HatchIt/" target="_blank" rel="noopener noreferrer" className="text-xs text-orange-100 underline underline-offset-4">Open Reddit</Link>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white">Email</h3>
                  <p className="text-xs text-emerald-200/80">support@hatchit.dev</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white">Feature Requests</h3>
                  <p className="text-xs text-zinc-400">Post & vote on Reddit.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <p className="text-center text-zinc-600 text-xs mt-8">Built by humans who actually respond.</p>
      </div>
    </div>
  )
}
