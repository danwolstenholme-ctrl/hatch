'use client'

import type { Metadata } from 'next'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function VisionPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-500/15 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Hero */}
      <section className="relative px-6 pt-20 pb-24 text-center">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-lg">🚀</span>
            <span>2026 → 2028</span>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            The Vision for
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
              Autonomous Development
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-zinc-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            From AI-powered site builder to autonomous web development. This is where we're going—and we're moving fast.
          </motion.p>
          
          <motion.div 
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Link 
              href="/roadmap"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition underline underline-offset-4"
            >
              See what we've shipped recently →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2026 Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/30">
            🌱
          </div>
          <div>
            <h2 className="text-4xl font-bold text-white">2026</h2>
            <p className="text-emerald-400 font-medium">Foundation Year</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Q1 2026 */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm font-bold rounded-full">Q1</span>
              <span className="text-slate-400">January - March</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Infrastructure & Scale</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-slate-300">
                <span className="text-emerald-400 mt-1">🗄️</span>
                <div>
                  <span className="font-medium text-white">Cloud Database</span>
                  <p className="text-sm text-slate-400">Move from localStorage to persistent cloud storage. Your projects, saved forever.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-slate-300">
                <span className="text-emerald-400 mt-1">📚</span>
                <div>
                  <span className="font-medium text-white">Template Gallery</span>
                  <p className="text-sm text-slate-400">Launch with 50+ professional templates. One-click start for landing pages, portfolios, SaaS dashboards.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-slate-300">
                <span className="text-emerald-400 mt-1">🧩</span>
                <div>
                  <span className="font-medium text-white">Component Marketplace</span>
                  <p className="text-sm text-slate-400">Pre-built, tested components. Headers, pricing tables, testimonials—drag and drop.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-slate-300">
                <span className="text-emerald-400 mt-1">👥</span>
                <div>
                  <span className="font-medium text-white">Team Collaboration</span>
                  <p className="text-sm text-slate-400">Real-time editing, comments, and version history for teams.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Q2 2026 */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8 hover:border-teal-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-teal-500/20 text-teal-400 text-sm font-bold rounded-full">Q2</span>
              <span className="text-slate-400">April - June</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">AI Revolution</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-slate-300">
                <span className="text-teal-400 mt-1">🧠</span>
                <div>
                  <span className="font-medium text-white">Next-Gen Models</span>
                  <p className="text-sm text-slate-400">As Anthropic releases Claude 4 and beyond, we integrate immediately. Smarter, faster, more creative.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-slate-300">
                <span className="text-teal-400 mt-1">📸</span>
                <div>
                  <span className="font-medium text-white">Screenshot-to-Code</span>
                  <p className="text-sm text-slate-400">Upload a screenshot, get pixel-perfect React. Your Dribbble inspiration, built in seconds.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-slate-300">
                <span className="text-teal-400 mt-1">🎨</span>
                <div>
                  <span className="font-medium text-white">Figma Plugin</span>
                  <p className="text-sm text-slate-400">Design in Figma, export to HatchIt. Bridge the designer-developer gap.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-slate-300">
                <span className="text-teal-400 mt-1">✨</span>
                <div>
                  <span className="font-medium text-white">Brand Kit AI</span>
                  <p className="text-sm text-slate-400">Upload your logo, AI extracts colors, fonts, and style. Every generation matches your brand.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Q3 2026 */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-sm font-bold rounded-full">Q3</span>
              <span className="text-slate-400">July - September</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Feature Parity & Beyond</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-slate-300">
                <span className="text-cyan-400 mt-1">🔧</span>
                <div>
                  <span className="font-medium text-white">CMS Integration</span>
                  <p className="text-sm text-slate-400">Connect Sanity, Contentful, Strapi. Dynamic content for static sites.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-slate-300">
                <span className="text-cyan-400 mt-1">🛒</span>
                <div>
                  <span className="font-medium text-white">E-commerce Ready</span>
                  <p className="text-sm text-slate-400">Stripe, Shopify, Gumroad integrations. Build stores that convert.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-slate-300">
                <span className="text-cyan-400 mt-1">📊</span>
                <div>
                  <span className="font-medium text-white">Analytics Dashboard</span>
                  <p className="text-sm text-slate-400">Built-in analytics. See visitors, conversions, and performance—no third-party scripts.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-slate-300">
                <span className="text-cyan-400 mt-1">🌍</span>
                <div>
                  <span className="font-medium text-white">i18n Support</span>
                  <p className="text-sm text-slate-400">Multi-language sites out of the box. AI-powered translations.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Q4 2026 */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8 hover:border-blue-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-bold rounded-full">Q4</span>
              <span className="text-slate-400">October - December</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Scale & Solidify</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-slate-300">
                <span className="text-blue-400 mt-1">🎯</span>
                <div>
                  <span className="font-medium text-white">Target: 10K Users</span>
                  <p className="text-sm text-slate-400">10,000 active users. Community growing. Word spreading.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-slate-300">
                <span className="text-blue-400 mt-1">💰</span>
                <div>
                  <span className="font-medium text-white">Target: $50K MRR</span>
                  <p className="text-sm text-slate-400">Sustainable revenue. Reinvesting everything into product.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-slate-300">
                <span className="text-blue-400 mt-1">🏢</span>
                <div>
                  <span className="font-medium text-white">Enterprise Tier</span>
                  <p className="text-sm text-slate-400">Custom domains, SSO, dedicated support, SLAs for serious businesses.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-slate-300">
                <span className="text-blue-400 mt-1">🔌</span>
                <div>
                  <span className="font-medium text-white">API Access</span>
                  <p className="text-sm text-slate-400">Build on HatchIt. Generate sites programmatically for your own products.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 2027 Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-800">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg shadow-violet-500/30">
            🤖
          </div>
          <div>
            <h2 className="text-4xl font-bold text-white">2027</h2>
            <p className="text-violet-400 font-medium">The Agent Era</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-900/30 to-purple-900/30 backdrop-blur border border-violet-500/30 rounded-3xl p-8 md:p-12 mb-8">
          <h3 className="text-3xl font-bold text-white mb-6">AI Agents Take the Wheel</h3>
          <p className="text-lg text-slate-300 mb-8 max-w-3xl">
            The paradigm shifts. Instead of you building with AI assistance, AI agents build autonomously—
            checking their own work, iterating, and deploying. You become the director, not the developer.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 rounded-xl p-6">
              <div className="text-4xl mb-4">🔄</div>
              <h4 className="text-xl font-bold text-white mb-2">Self-Healing Sites</h4>
              <p className="text-slate-400">Agents monitor your site 24/7. Broken link? Fixed. Slow image? Optimized. Error? Patched. While you sleep.</p>
            </div>
            
            <div className="bg-slate-900/50 rounded-xl p-6">
              <div className="text-4xl mb-4">📈</div>
              <h4 className="text-xl font-bold text-white mb-2">Autonomous A/B Testing</h4>
              <p className="text-slate-400">AI generates variants, runs tests, picks winners—all automatically. Continuous conversion optimization.</p>
            </div>
            
            <div className="bg-slate-900/50 rounded-xl p-6">
              <div className="text-4xl mb-4">🎭</div>
              <h4 className="text-xl font-bold text-white mb-2">Personalization Engine</h4>
              <p className="text-slate-400">Every visitor sees a different site. AI tailors content, layout, and CTAs based on behavior and context.</p>
            </div>
            
            <div className="bg-slate-900/50 rounded-xl p-6">
              <div className="text-4xl mb-4">🔍</div>
              <h4 className="text-xl font-bold text-white mb-2">SEO Autopilot</h4>
              <p className="text-slate-400">Agents write blog posts, update metadata, build backlinks. Your site climbs rankings autonomously.</p>
            </div>
            
            <div className="bg-slate-900/50 rounded-xl p-6">
              <div className="text-4xl mb-4">🛡️</div>
              <h4 className="text-xl font-bold text-white mb-2">Security Agents</h4>
              <p className="text-slate-400">Real-time vulnerability scanning. Zero-day patches applied before you even know there was a threat.</p>
            </div>
            
            <div className="bg-slate-900/50 rounded-xl p-6">
              <div className="text-4xl mb-4">💬</div>
              <h4 className="text-xl font-bold text-white mb-2">Customer Support AI</h4>
              <p className="text-slate-400">Embedded AI support that actually knows your product. Train once, support infinitely.</p>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-violet-500/10 border border-violet-500/30 rounded-xl">
            <p className="text-violet-300 font-medium">
              🎯 <span className="text-white">2027 Target:</span> 100K users • $500K MRR • Series A from top AI investors
            </p>
          </div>
        </div>
      </section>

      {/* 2028 Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-800">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">
            🌟
          </div>
          <div>
            <h2 className="text-4xl font-bold text-white">2028</h2>
            <p className="text-amber-400 font-medium">The Endgame</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-900/20 via-orange-900/20 to-rose-900/20 backdrop-blur border border-amber-500/30 rounded-3xl p-8 md:p-12">
          <h3 className="text-3xl font-bold text-white mb-6">AGI-Powered Web Development</h3>
          <p className="text-lg text-slate-300 mb-8 max-w-3xl">
            As AI approaches general intelligence, HatchIt becomes something unprecedented: 
            a platform where you describe a business, and AI builds the entire digital presence—
            website, app, integrations, marketing, support—end to end.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                  💼
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">&quot;Build Me a Business&quot;</h4>
                  <p className="text-slate-400">Describe your idea. AI handles everything: branding, website, app, payment processing, customer support, marketing automation. Launch in hours, not months.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                  🔮
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">Predictive Development</h4>
                  <p className="text-slate-400">AI anticipates what your site needs before you ask. New feature requests from users? AI implements them. Market shift? AI adapts your messaging.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                  🌐
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">The New Web</h4>
                  <p className="text-slate-400">Websites stop being static. They become living, breathing entities that evolve continuously—always optimized, always fresh, always converting.</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-2xl p-8">
              <h4 className="text-2xl font-bold text-white mb-6">Exit Scenarios</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 text-xl">🎯</span>
                  <div>
                    <span className="font-bold text-white">1M+ users</span>
                    <p className="text-slate-400 text-sm">Category leader in AI web development</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-400 text-xl">💰</span>
                  <div>
                    <span className="font-bold text-white">$10M+ ARR</span>
                    <p className="text-slate-400 text-sm">Profitable, high-margin SaaS</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-400 text-xl">🏆</span>
                  <div>
                    <span className="font-bold text-white">Strategic Acquisition</span>
                    <p className="text-slate-400 text-sm">Vercel, Netlify, Wix, or big tech</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pink-400 text-xl">📈</span>
                  <div>
                    <span className="font-bold text-white">IPO Path</span>
                    <p className="text-slate-400 text-sm">If the market supports it</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-500/30 rounded-xl">
            <p className="text-amber-300 text-lg font-medium text-center">
              🐣 Started in Cyprus, December 2025. One developer. One vision. Let&apos;s see where this goes.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          This is Day One
        </h2>
        <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
          The roadmap is ambitious. The technology is ready. The only question: are you building with us?
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/builder"
            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:opacity-90 transition shadow-lg shadow-amber-500/30"
          >
            Start Building Free →
          </Link>
          <Link
            href="https://x.com/HatchItD"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition border border-slate-700"
          >
            Follow the Journey
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐣</span>
            <span className="font-bold text-white">HatchIt.dev</span>
          </div>
          <p className="text-slate-500 text-sm">
            Built with Claude Opus 4.5 • © 2025 HatchIt
          </p>
        </div>
      </footer>
    </main>
  )
}
