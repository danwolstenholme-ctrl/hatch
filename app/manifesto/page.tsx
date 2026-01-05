'use client'

import { motion } from 'framer-motion'
import { Zap, Code2, Eye, Layers, ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function ManifestoPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/30 overflow-x-hidden relative">
      {/* Subtle grid pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Back Link */}
      <Link href="/" className="fixed top-4 left-4 z-50 flex items-center gap-2 text-sm text-zinc-500 hover:text-emerald-400 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <div className="max-w-4xl mx-auto relative z-10 px-6 py-24">
        <header className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <span className="text-xs font-mono text-emerald-500 tracking-widest">OUR PHILOSOPHY</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-6 tracking-tight"
          >
            Build at the Speed of Thought
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-zinc-400 max-w-2xl mx-auto"
          >
            We believe the gap between having an idea and seeing it live should be minutes, not months.
          </motion.p>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-16"
        >
          {/* Section 1 */}
          <section className="relative">
            <div className="flex items-start gap-6">
              <div className="shrink-0 w-12 h-12 bg-zinc-900/50 border border-zinc-800 rounded-sm flex items-center justify-center backdrop-blur-sm">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-4">The Problem We Solve</h2>
                <div className="prose prose-invert prose-zinc max-w-none text-zinc-400 leading-relaxed space-y-4">
                  <p>
                    Most people have ideas for websites, apps, and digital products. Very few can build them.
                    The traditional path—learning to code, or hiring developers—takes months and thousands of dollars.
                  </p>
                  <p>
                    No-code tools promised to fix this, but they traded one problem for another: 
                    complex interfaces, rigid templates, and outputs that look like... well, templates.
                  </p>
                  <p className="text-zinc-100 font-medium border-l-2 border-emerald-500 pl-4">
                    HatchIt uses AI to translate what you say into production-ready React components.
                    No drag-and-drop. No complex UI. Just describe what you want, and it exists.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="relative">
            <div className="flex items-start gap-6">
              <div className="shrink-0 w-12 h-12 bg-zinc-900/50 border border-zinc-800 rounded-sm flex items-center justify-center backdrop-blur-sm">
                <Code2 className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-4">Real Code, Real Ownership</h2>
                <div className="prose prose-invert prose-zinc max-w-none text-zinc-400 leading-relaxed space-y-4">
                  <p>
                    Every component HatchIt generates is real React + Tailwind CSS code. 
                    Not a proprietary format. Not a locked-in platform. Real code you can export, extend, and own forever.
                  </p>
                  <p>
                    We use Claude Sonnet 4.5 to generate production-quality components because we believe
                    AI should amplify your capabilities, not create dependencies.
                  </p>
                  <p className="text-zinc-100 font-medium border-l-2 border-cyan-500 pl-4">
                    Build with AI, but own the result. That&apos;s the deal.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="relative">
            <div className="flex items-start gap-6">
              <div className="shrink-0 w-12 h-12 bg-zinc-900/50 border border-zinc-800 rounded-sm flex items-center justify-center backdrop-blur-sm">
                <Eye className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-4">See It, Refine It, Ship It</h2>
                <div className="prose prose-invert prose-zinc max-w-none text-zinc-400 leading-relaxed space-y-4">
                  <p>
                    Every build shows you a live preview instantly. Don&apos;t like something? 
                    Tell the AI what to change in plain English. &quot;Make the button bigger.&quot; &quot;Add more whitespace.&quot; 
                    &quot;Make it feel more premium.&quot;
                  </p>
                  <p>
                    When you&apos;re happy, hit deploy. Your site goes live on hatchitsites.dev in under 30 seconds.
                    No build pipelines. No server configuration. No DevOps degree required.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="relative">
            <div className="flex items-start gap-6">
              <div className="shrink-0 w-12 h-12 bg-zinc-900/50 border border-zinc-800 rounded-sm flex items-center justify-center backdrop-blur-sm">
                <Layers className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-4">Built for the 99%</h2>
                <div className="prose prose-invert prose-zinc max-w-none text-zinc-400 leading-relaxed space-y-4">
                  <p>
                    HatchIt isn&apos;t for Facebook-scale engineering teams. It&apos;s for the solo founder with an idea.
                    The designer who wants to ship their portfolio. The small business owner who needs a landing page this week.
                  </p>
                  <p>
                    We believe everyone should be able to build on the web—not just the people who learned to code 15 years ago.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="p-8 border border-zinc-800 bg-zinc-900/50 rounded-sm mt-12 text-center backdrop-blur-sm">
            <h3 className="text-xl text-zinc-100 font-bold mb-4">Ready to Build?</h3>
            <p className="text-zinc-400 mb-6 max-w-md mx-auto">
              Stop reading manifestos. Start building. Your first component is free—no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/demo" 
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-sm hover:scale-105 transition-all flex items-center gap-2"
              >
                Try the Demo
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/builder" 
                className="px-6 py-3 border border-zinc-800 hover:border-emerald-500/30 text-zinc-100 font-medium rounded-sm transition-colors"
              >
                Go to Builder
              </Link>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  )
}
