'use client'

import { useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Mail, MessageSquare, ArrowLeft, Send, HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

// =============================================================================
// CONTACT PAGE - Singularity Edition
// =============================================================================

function ContactForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  // If returnUrl is present, use it. Otherwise default to home.
  const returnUrl = searchParams.get('returnUrl') || '/'
  
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
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-200 font-sans selection:bg-emerald-500/30 overflow-hidden flex flex-col relative">
      
      {/* Singularity Background System */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Perspective Grid */}
        <div 
          className="absolute inset-0 opacity-[0.15] bg-grid-flow"
          style={{
            backgroundImage: `
              linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 50%, transparent 90%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%, black 50%, transparent 90%)',
            transform: 'perspective(500px) rotateX(60deg) translateY(-50%)',
            transformOrigin: 'center top',
            height: '200%',
            top: '30%',
          }}
        />
        
        {/* Scanlines */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ 
               backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
               backgroundSize: '100% 2px, 3px 100%'
             }} 
        />

        {/* Ambient Glows */}
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-6 py-8 relative z-10 h-full">
        {/* Header / Nav */}
        <div className="shrink-0 mb-8">
          <Link 
            href={returnUrl}
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group text-sm font-medium px-4 py-2 rounded-full hover:bg-zinc-900/50 border border-transparent hover:border-zinc-800"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </Link>
        </div>

        <div className="flex-1 grid lg:grid-cols-[1fr_400px] gap-16 items-center content-center min-h-0">
          {/* Left Column: Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center h-full max-h-[800px]"
          >
            <div className="mb-8 shrink-0">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                Get in touch
              </h1>
              <p className="text-zinc-400 text-lg leading-relaxed max-w-xl">
                Have a question about the platform? Need help with a project? 
                Drop us a line.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 shrink-0">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Jane Doe"
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-zinc-600 hover:border-zinc-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="jane@example.com"
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-zinc-600 hover:border-zinc-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Topic</label>
                <div className="relative">
                  <select
                    name="topic"
                    value={form.topic}
                    onChange={handleChange}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all appearance-none cursor-pointer hover:border-zinc-700"
                  >
                    <option>General Inquiry</option>
                    <option>Technical Support</option>
                    <option>Billing & Account</option>
                    <option>Feature Request</option>
                    <option>Partnership</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              {/* Honeypot */}
              <div className="hidden">
                <input
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  minLength={10}
                  placeholder="How can we help you?"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all h-32 resize-none placeholder:text-zinc-600 hover:border-zinc-700"
                />
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 text-sm text-red-400 bg-red-500/5 border border-red-500/10 rounded-xl px-4 py-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              {status === 'sent' && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 text-sm text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-4 py-2"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <div>
                    <span className="font-medium">Message sent!</span> We'll get back to you shortly.
                  </div>
                </motion.div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5"
                >
                  {status === 'sending' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Right Column: Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6 lg:pt-0 flex flex-col justify-center"
          >
            <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-500" />
                Support Channels
              </h3>
              
              <div className="space-y-5">
                <a 
                  href="mailto:support@hatchit.dev" 
                  className="flex items-start gap-4 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-zinc-800/50 flex items-center justify-center group-hover:bg-zinc-800 transition-colors border border-zinc-700/50">
                    <Mail className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">Email Support</div>
                    <div className="text-sm text-zinc-500 mt-0.5">support@hatchit.dev</div>
                  </div>
                </a>

                <a 
                  href="https://www.reddit.com/r/HatchIt/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-zinc-800/50 flex items-center justify-center group-hover:bg-zinc-800 transition-colors border border-zinc-700/50">
                    <MessageSquare className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white group-hover:text-orange-400 transition-colors">Community</div>
                    <div className="text-sm text-zinc-500 mt-0.5">Join r/HatchIt</div>
                  </div>
                </a>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900/50 to-zinc-900/10 border border-zinc-800/50">
              <h3 className="font-medium text-white mb-2">Response Time</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                We're a small team but we move fast. Expect a response within 24 hours on business days.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-zinc-950" />}>
      <ContactForm />
    </Suspense>
  )
}
