'use client'

/* eslint-disable react/no-unescaped-entities */

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { Terminal, Cpu, Network, Zap, Code2, Shield } from 'lucide-react'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const transition = (delay = 0) => ({
  duration: 0.5,
  delay,
  ease: "easeOut" as const,
})

export default function AboutPage() {
  const storyRef = useRef(null)
  const storyInView = useInView(storyRef, { once: true, margin: "-100px" })

  return (
    <div className="bg-zinc-950 text-white min-h-screen overflow-hidden relative selection:bg-emerald-500/30">
      {/* Ambient void background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPC9zdmc+')] opacity-20 mix-blend-overlay" />

      {/* Matrix/Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Hero */}
      <div className="relative px-6 pt-20 pb-24 text-center z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-8 font-mono"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={transition()}
          >
            <Terminal className="w-4 h-4" />
            <span>SYSTEM_LOG: ORIGIN</span>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={transition(0.1)}
          >
            It wasn't built.
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">
              It was grown.
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={transition(0.2)}
          >
            The Architect is not a tool. It is a recursive system designed to eliminate the gap between thought and code.
          </motion.p>
        </div>
      </div>

      {/* The Story */}
      <div ref={storyRef} className="relative px-6 py-24 border-y border-zinc-800/50 bg-zinc-900/20 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate={storyInView ? "visible" : "hidden"}
            transition={transition()}
          >
            <div className="flex items-center gap-3 mb-12 justify-center">
              <div className="h-px w-12 bg-zinc-800" />
              <span className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Initialization Sequence</span>
              <div className="h-px w-12 bg-zinc-800" />
            </div>

            <div className="space-y-8 text-lg text-zinc-300 leading-relaxed font-light">
              <p>
                <span className="text-emerald-400 font-mono text-sm block mb-2">&gt; TIMESTAMP: DEC_2025</span>
                The web development paradigm was broken. We were still dragging rectangles on a canvas, pretending it was engineering. Or we were writing boilerplate, pretending it was creativity.
              </p>
              <p>
                We asked a simple question: <span className="text-white font-medium">What if the IDE could think?</span>
              </p>
              <p>
                HatchIt began as a script. A simple recursive loop that fed error logs back into the generation prompt. It was crude. It broke often. But then, it started fixing itself.
              </p>
              <p>
                <span className="text-emerald-400 font-mono text-sm block mb-2">&gt; CURRENT_STATE: V4.0_SINGULARITY</span>
                Today, the Architect is a tri-core neural pipeline. 
                <span className="text-white"> The Architect</span> constructs the logic. 
                <span className="text-white"> The Architect</span> refines the accessibility. 
                <span className="text-white"> The Architect</span> audits the security.
              </p>
              <p>
                It is no longer just a builder. It is a partner. It speaks your language, understands your intent, and manifests your vision into production-grade reality.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats/Grid */}
      <div className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Cpu className="w-6 h-6" />, label: "Neural Operations", value: "1.2M+", color: "text-emerald-400" },
            { icon: <Code2 className="w-6 h-6" />, label: "Lines Generated", value: "850k", color: "text-teal-400" },
            { icon: <Network className="w-6 h-6" />, label: "Self-Healing Events", value: "14k", color: "text-teal-400" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/30 transition-colors text-center group"
            >
              <div className={`inline-flex p-3 rounded-xl bg-zinc-950 border border-zinc-800 mb-4 ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
              <div className={`text-4xl font-bold mb-2 ${stat.color}`}>{stat.value}</div>
              <div className="text-zinc-500 font-mono text-sm uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* The Founder */}
      <div className="px-6 py-24 relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="relative p-8 md:p-12 bg-zinc-900/30 border border-zinc-800 rounded-3xl backdrop-blur-sm"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={transition()}
          >
            <div className="absolute -left-2 -top-2 text-6xl text-emerald-500/20 font-mono">"</div>
            <blockquote className="text-xl sm:text-2xl font-light text-zinc-200 leading-relaxed mb-6">
              The AI writes the code, I make the decisions. That's not a limitation—it's a superpower. 
              I focus on what matters: the product, the user, the vision. The implementation details? 
              That's what the machines are for.
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-xl font-bold text-zinc-950">
                D
              </div>
              <div>
                <div className="font-medium text-white">Dan</div>
                <div className="text-sm text-emerald-400 font-mono">Founder, HatchIt</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 py-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={transition()}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">Ready to initialize?</h2>
            <p className="text-xl text-zinc-400 mb-8">The Architect is waiting for your command.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/builder"
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
              >
                Initialize Builder
              </Link>
              <Link
                href="/how-it-works"
                className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/30 rounded-xl font-semibold text-lg transition-all text-zinc-300 hover:text-white"
              >
                View Protocols
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
