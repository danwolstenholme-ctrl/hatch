'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function AboutPage() {
  const timeline = [
    {
      year: '2025',
      title: 'The Spark',
      description: 'Frustrated with the gap between idea and execution, we asked: what if anyone could build professional websites just by describing them?',
    },
    {
      year: '2025',
      title: 'HatchIt is Born',
      description: 'After months of development and iteration, HatchIt launched with a simple mission: democratize web development through AI.',
    },
    {
      year: '2025',
      title: 'Hatched Features',
      description: 'Live code streaming, brand customization, and version history join the platform—taking AI website building to the next level.',
    },
    {
      year: 'Future',
      title: 'The Vision',
      description: 'AI agents, collaborative editing, full-stack generation, and integrations that make HatchIt the only tool you need.',
    },
  ]

  const values = [
    {
      icon: '🎯',
      title: 'Simplicity First',
      description: 'Complex technology should feel effortless. We obsess over removing friction from every interaction.',
    },
    {
      icon: '⚡',
      title: 'Speed Matters',
      description: 'Your time is valuable. We\'re relentless about making HatchIt faster—in generation, deployment, and iteration.',
    },
    {
      icon: '🔓',
      title: 'Your Code, Your Rules',
      description: 'No lock-in, no proprietary formats. Export your code anytime. It\'s 100% standard React and Tailwind.',
    },
    {
      icon: '🌱',
      title: 'Always Evolving',
      description: 'AI moves fast. We move faster. New features, improvements, and capabilities ship constantly.',
    },
  ]

  const stats = [
    { value: '30s', label: 'Average generation time' },
    { value: '100%', label: 'Code ownership' },
    { value: '10', label: 'Free generations daily' },
    { value: '∞', label: 'Possibilities' },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute top-60 right-1/3 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-6 pt-32 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ willChange: 'transform, opacity', backfaceVisibility: 'hidden' }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm mb-6">
              <span className="text-lg">🐣</span>
              <span>Our Story</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Websites Should Be
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Easy to Build.
              </span>
            </h1>
            
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              We believe the best ideas shouldn&apos;t be held back by technical barriers. 
              HatchIt exists to turn &ldquo;I wish I could build that&rdquo; into &ldquo;I just did.&rdquo;
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative p-8 md:p-12 bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative">
              <span className="text-6xl mb-6 block">🎯</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-xl text-zinc-300 leading-relaxed mb-6">
                To democratize web development by making it possible for anyone—regardless of technical background—to 
                create professional, production-ready websites through the power of AI.
              </p>
              <p className="text-lg text-zinc-400 leading-relaxed">
                We&apos;re not building another drag-and-drop builder. We&apos;re building a tool that understands your vision 
                and writes real code to make it happen. Code you own. Code you can customize. Code that works.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{ willChange: 'transform, opacity', backfaceVisibility: 'hidden' }}
                className="text-center p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-zinc-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Problem We Solve */}
      <section className="py-24 px-6 bg-gradient-to-b from-zinc-900/50 to-transparent">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">The Problem</h2>
            <p className="text-xl text-zinc-400">Building websites has been broken for too long</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{ willChange: 'transform, opacity', backfaceVisibility: 'hidden' }}
              className="p-8 bg-red-900/10 border border-red-900/30 rounded-2xl"
            >
              <h3 className="text-2xl font-bold text-red-400 mb-4">❌ The Old Way</h3>
              <ul className="space-y-3 text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Hire a developer for $5,000+ or spend months learning to code</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Use a template builder and get a cookie-cutter site that looks like everyone else&apos;s</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Get locked into proprietary platforms that own your content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Struggle with bloated code that&apos;s impossible to customize</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{ willChange: 'transform, opacity', backfaceVisibility: 'hidden' }}
              className="p-8 bg-green-900/10 border border-green-900/30 rounded-2xl"
            >
              <h3 className="text-2xl font-bold text-green-400 mb-4">✓ The HatchIt Way</h3>
              <ul className="space-y-3 text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Describe what you want in plain English—AI handles the rest</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Every site is unique, generated from your exact requirements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Export your code anytime. It&apos;s yours, forever</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Clean React + Tailwind code that any developer can work with</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Journey</h2>
            <p className="text-xl text-zinc-400">From idea to the future of web development</p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500 via-pink-500 to-amber-500" />
            
            {timeline.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative flex items-center gap-8 mb-12 ${
                  i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Dot */}
                <div className="absolute left-8 md:left-1/2 w-4 h-4 -ml-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border-4 border-zinc-950" />
                
                {/* Content */}
                <div className={`flex-1 ml-16 md:ml-0 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                  <span className="text-sm font-bold text-purple-400">{item.year}</span>
                  <h3 className="text-xl font-bold mt-1 mb-2">{item.title}</h3>
                  <p className="text-zinc-400">{item.description}</p>
                </div>
                
                {/* Spacer for alternating layout */}
                <div className="hidden md:block flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6 bg-gradient-to-b from-zinc-900/50 to-transparent">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What We Believe</h2>
            <p className="text-xl text-zinc-400">The principles that guide everything we build</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-colors"
              >
                <span className="text-4xl mb-4 block">{value.icon}</span>
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <p className="text-zinc-400">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Powered By</h2>
            <p className="text-xl text-zinc-400">The technology behind the magic</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Claude Opus 4.5', desc: 'AI Generation', icon: '🧠' },
              { name: 'React 19', desc: 'UI Framework', icon: '⚛️' },
              { name: 'Next.js 15', desc: 'App Framework', icon: '▲' },
              { name: 'Tailwind CSS', desc: 'Styling', icon: '🎨' },
              { name: 'Vercel', desc: 'Deployment', icon: '▲' },
              { name: 'Clerk', desc: 'Authentication', icon: '🔐' },
              { name: 'Stripe', desc: 'Payments', icon: '💳' },
              { name: 'TypeScript', desc: 'Type Safety', icon: '📘' },
            ].map((tech, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-center hover:border-zinc-700 transition-colors"
              >
                <span className="text-2xl mb-2 block">{tech.icon}</span>
                <div className="font-medium text-sm">{tech.name}</div>
                <div className="text-xs text-zinc-500">{tech.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Source Commitment */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="p-8 md:p-12 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-3xl text-center">
            <span className="text-5xl mb-6 block">💝</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Code. Your Freedom.</h2>
            <p className="text-lg text-zinc-300 max-w-2xl mx-auto mb-6">
              Every line of code HatchIt generates is yours. Export it, modify it, host it anywhere. 
              We believe in empowering creators, not locking them in. The code we generate uses only 
              standard, open-source technologies that work everywhere.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {['React', 'Tailwind CSS', 'Framer Motion', 'TypeScript'].map((tech) => (
                <span key={tech} className="px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-full text-sm">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Join Us on This Journey
          </h2>
          <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
            We&apos;re just getting started. Be part of the community that&apos;s reshaping how websites are built.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/builder"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
            >
              Start Building
            </Link>
            <Link
              href="/roadmap"
              className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-semibold text-lg transition-all border border-zinc-700"
            >
              See the Roadmap
            </Link>
          </div>
          
          <div className="mt-12 flex justify-center gap-6">
            <a 
              href="https://x.com/HatchItD" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              <span>Follow on X</span>
            </a>
            <a 
              href="https://www.linkedin.com/company/hatchit-dev/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              <span>LinkedIn</span>
            </a>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐣</span>
            <span className="font-bold text-xl">HatchIt</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-zinc-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/features" className="hover:text-white transition-colors">Features</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/roadmap" className="hover:text-white transition-colors">Roadmap</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </nav>
          <p className="text-sm text-zinc-500">© 2025 HatchIt. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
