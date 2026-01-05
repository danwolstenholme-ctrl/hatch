'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Terminal, Cpu, Zap, Globe, Shield, Database, Search, Layers, Code2, ArrowRight } from 'lucide-react'

export default function VisionPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden selection:bg-emerald-500/30 relative">
      {/* Ambient void background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPC9zdmc+')] opacity-20 mix-blend-overlay" />

      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      {/* Radial Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-30%,#10b98115,transparent)] pointer-events-none" />

      {/* Hero */}
      <section className="relative px-6 pt-24 pb-24 text-center z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="inline-flex items-center gap-2 text-emerald-400 mb-6 font-mono text-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Terminal className="w-4 h-4" />
            <span>PROTOCOL: EVOLUTION</span>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight font-mono tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            The Vision for
            <br />
            <span className="text-emerald-400">
              The Singularity
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-lg text-zinc-400 max-w-2xl mx-auto font-mono leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            We are not building a website builder. We are building an Architect. A recursive, self-improving system that renders human intent into digital reality.
          </motion.p>
        </div>
      </section>

      {/* 2026 Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center gap-4 mb-12 border-b border-white/10 pb-6">
          <div className="w-12 h-12 rounded-sm bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white font-mono">CYCLE_2026</h2>
            <p className="text-emerald-500/60 font-mono text-sm">FOUNDATION_LAYER</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Q1 2026 */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-8 hover:border-emerald-500/30 transition-colors group backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20">PHASE_01</span>
              <span className="text-zinc-500 text-xs font-mono uppercase">Jan - Mar</span>
            </div>
            <h3 className="text-xl font-bold text-zinc-100 mb-6 font-mono group-hover:text-emerald-400 transition-colors">Infrastructure & Scale</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Database className="w-4 h-4 text-emerald-500 mt-1" />
                <div>
                  <span className="font-bold text-zinc-200 text-sm font-mono block mb-1">Cloud Persistence</span>
                  <p className="text-xs text-zinc-400 font-mono leading-relaxed">Migration from local storage to distributed cloud database. Permanent project retention.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Layers className="w-4 h-4 text-emerald-500 mt-1" />
                <div>
                  <span className="font-bold text-zinc-200 text-sm font-mono block mb-1">Vector Gallery</span>
                  <p className="text-xs text-zinc-400 font-mono leading-relaxed">Launch of 50+ specialized template vectors. Instant initialization for diverse use cases.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Q2 2026 */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-8 hover:border-emerald-500/30 transition-colors group backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20">PHASE_02</span>
              <span className="text-zinc-500 text-xs font-mono uppercase">Apr - Jun</span>
            </div>
            <h3 className="text-xl font-bold text-zinc-100 mb-6 font-mono group-hover:text-emerald-400 transition-colors">Neural Expansion</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Cpu className="w-4 h-4 text-emerald-500 mt-1" />
                <div>
                  <span className="font-bold text-zinc-200 text-sm font-mono block mb-1">Next-Gen Integration</span>
                  <p className="text-xs text-zinc-400 font-mono leading-relaxed">Immediate integration of Claude 4 and Gemini 2 Ultra upon release. Enhanced cognitive capabilities.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Search className="w-4 h-4 text-emerald-500 mt-1" />
                <div>
                  <span className="font-bold text-zinc-200 text-sm font-mono block mb-1">Visual Input Processing</span>
                  <p className="text-xs text-zinc-400 font-mono leading-relaxed">Screenshot-to-Code conversion module. Pixel-perfect replication of visual references.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Q3 2026 */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-8 hover:border-emerald-500/30 transition-colors group backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20">PHASE_03</span>
              <span className="text-zinc-500 text-xs font-mono uppercase">Jul - Sep</span>
            </div>
            <h3 className="text-xl font-bold text-zinc-100 mb-6 font-mono group-hover:text-emerald-400 transition-colors">System Parity</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Database className="w-4 h-4 text-emerald-500 mt-1" />
                <div>
                  <span className="font-bold text-zinc-200 text-sm font-mono block mb-1">CMS Integration</span>
                  <p className="text-xs text-zinc-400 font-mono leading-relaxed">Connectors for Sanity, Contentful, and Strapi. Dynamic content injection for static builds.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Globe className="w-4 h-4 text-emerald-500 mt-1" />
                <div>
                  <span className="font-bold text-zinc-200 text-sm font-mono block mb-1">Global Localization</span>
                  <p className="text-xs text-zinc-400 font-mono leading-relaxed">Automated i18n support. AI-powered translation for multi-region deployment.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Q4 2026 */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-8 hover:border-emerald-500/30 transition-colors group backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20">PHASE_04</span>
              <span className="text-zinc-500 text-xs font-mono uppercase">Oct - Dec</span>
            </div>
            <h3 className="text-xl font-bold text-zinc-100 mb-6 font-mono group-hover:text-emerald-400 transition-colors">Scale & Solidify</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-emerald-500 mt-1" />
                <div>
                  <span className="font-bold text-zinc-200 text-sm font-mono block mb-1">Enterprise Protocol</span>
                  <p className="text-xs text-zinc-400 font-mono leading-relaxed">SSO, dedicated support channels, and SLA guarantees for high-volume entities.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Code2 className="w-4 h-4 text-emerald-500 mt-1" />
                <div>
                  <span className="font-bold text-zinc-200 text-sm font-mono block mb-1">API Access</span>
                  <p className="text-xs text-zinc-400 font-mono leading-relaxed">Programmatic generation access. Build on top of the Hatch infrastructure.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 2027 Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-zinc-800">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-sm bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-zinc-100 font-mono">CYCLE_2027</h2>
            <p className="text-emerald-500/60 font-mono text-sm">AUTONOMOUS_ERA</p>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-8 md:p-12 mb-8 relative overflow-hidden backdrop-blur-sm">
          <div className="absolute inset-0 bg-emerald-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500" />
          
          <h3 className="text-2xl font-bold text-zinc-100 mb-6 font-mono relative z-10">Autonomous Agent Deployment</h3>
          <p className="text-lg text-zinc-400 mb-12 max-w-3xl font-mono leading-relaxed relative z-10">
            The paradigm shifts. Instead of you building with AI assistance, AI agents build autonomously—
            checking their own work, iterating, and deploying. You become the Architect, not the laborer.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 relative z-10">
            <div className="bg-zinc-950 border border-zinc-800 p-6 hover:border-emerald-500/30 transition-colors">
              <div className="text-emerald-500 mb-4"><Cpu className="w-6 h-6" /></div>
              <h4 className="text-sm font-bold text-zinc-100 mb-2 font-mono">Self-Healing Structures</h4>
              <p className="text-xs text-zinc-400 font-mono leading-relaxed">Agents monitor your site 24/7. Broken link? Fixed. Slow image? Optimized. Error? Patched.</p>
            </div>
            
            <div className="bg-zinc-950 border border-zinc-800 p-6 hover:border-emerald-500/30 transition-colors">
              <div className="text-emerald-500 mb-4"><Search className="w-6 h-6" /></div>
              <h4 className="text-sm font-bold text-zinc-100 mb-2 font-mono">Autonomous Optimization</h4>
              <p className="text-xs text-zinc-400 font-mono leading-relaxed">AI generates variants, runs tests, picks winners—all automatically. Continuous conversion optimization.</p>
            </div>
            
            <div className="bg-zinc-950 border border-zinc-800 p-6 hover:border-emerald-500/30 transition-colors">
              <div className="text-emerald-500 mb-4"><Shield className="w-6 h-6" /></div>
              <h4 className="text-sm font-bold text-zinc-100 mb-2 font-mono">Security Sentinels</h4>
              <p className="text-xs text-zinc-400 font-mono leading-relaxed">Real-time vulnerability scanning. Zero-day patches applied before you even know there was a threat.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
