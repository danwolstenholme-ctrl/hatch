'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { 
  Cpu, Globe, Download, Wand2, Copy, Zap, 
  RefreshCw, MessageSquare, Layers, Box, 
  Shield, Code2, Lock, Terminal, Sparkles,
  ArrowRight
} from 'lucide-react'

// Scroll-triggered section wrapper
function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.section>
  )
}

export default function FeaturesPage() {
  // Real features from the APIs
  const coreFeatures = [
    {
      icon: <Cpu className="w-6 h-6" />,
      title: 'Text to React',
      description: 'Describe what you want in plain English. Claude Sonnet 4 writes production-ready React components with Tailwind styling. No templates, no drag-and-drop.',
      tier: 'All tiers',
      tierColor: 'text-zinc-400'
    },
    {
      icon: <Layers className="w-6 h-6" />,
      title: 'Section-by-Section Building',
      description: 'Build your site piece by piece. Hero, features, pricing, contact—each section generated and refined individually before assembly.',
      tier: 'All tiers',
      tierColor: 'text-zinc-400'
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'AI Prompt Helper',
      description: 'Stuck on what to say? Get help crafting the right prompt for each section.',
      tier: 'All tiers',
      tierColor: 'text-zinc-400'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'One-Click Deploy',
      description: 'Deploy to your own subdomain on hatchitsites.dev instantly. Multi-page sites supported. No server setup, no DNS headaches.',
      tier: 'Architect+',
      tierColor: 'text-emerald-400'
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: 'Download Source Code',
      description: 'Export your entire project as a production-ready Next.js app. Clean code, proper file structure, ready to deploy anywhere.',
      tier: 'Architect+',
      tierColor: 'text-emerald-400'
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: 'Self-Healing Code',
      description: 'When errors happen, Automatic error detection and repair. When something breaks, it gets fixed.',
      tier: 'Visionary+',
      tierColor: 'text-violet-400'
    },
    {
      icon: <Copy className="w-6 h-6" />,
      title: 'Website Cloner',
      description: 'See a site you love? Paste the URL. Reverse-engineer it into build prompts—colors, layout, copy, everything.',
      tier: 'Singularity',
      tierColor: 'text-amber-400'
    },
    {
      icon: <Wand2 className="w-6 h-6" />,
      title: 'Dream Engine',
      description: 'Your style DNA shapes future generations. The system learns your preferences and evolves designs—adding animations, changing colors, making it "alive."',
      tier: 'Singularity',
      tierColor: 'text-amber-400'
    },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 overflow-hidden relative selection:bg-emerald-500/30">
      
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center px-4 sm:px-6 pt-32 pb-24 overflow-hidden">
        {/* Gradient backdrop - matching how-it-works */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.05),transparent_70%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-transparent to-zinc-950/90" />
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -40, 0],
                x: [0, Math.sin(i) * 15, 0],
                opacity: [0.05, 0.2, 0.05],
                scale: [1, 1.3, 1]
              }}
              transition={{
                duration: 10 + i * 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.8
              }}
              className="absolute w-1 h-1 rounded-full bg-emerald-400/30"
              style={{
                left: `${15 + (i * 10)}%`,
                top: `${25 + (i % 3) * 20}%`,
                filter: 'blur(1px)'
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-4xl mx-auto w-full text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 text-zinc-400 text-sm mb-8"
          >
            <motion.span 
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-emerald-400 rounded-full" 
            />
            Everything you need to ship
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tight text-white leading-[1.1]"
          >
            Text In.
            <br />
            <motion.span
              animate={{ 
                textShadow: [
                  '0 0 20px rgba(16,185,129,0.3)',
                  '0 0 40px rgba(16,185,129,0.4)',
                  '0 0 20px rgba(16,185,129,0.3)'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent"
            >
              Website Out.
            </motion.span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            No templates. No drag-and-drop. Just describe what you want, 
            and Claude writes real React code. Then deploy it.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href="/builder"
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 hover:border-emerald-500/50 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]"
            >
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
                Start Building
              </span>
              <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Core Features Grid */}
      <Section>
        <div className="px-6 py-20 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What You Can Do</h2>
              <p className="text-zinc-400 max-w-xl mx-auto">
                From prompt to production. Every feature designed to get you shipped faster.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {coreFeatures.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="group p-6 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:shadow-2xl hover:shadow-black/50"
                >
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-400 w-fit mb-4 group-hover:border-emerald-500/30 transition-colors">
                    <motion.div
                      whileHover={{ rotate: 12 }}
                      transition={{ duration: 0.2 }}
                    >
                      {feature.icon}
                    </motion.div>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 text-zinc-100">{feature.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-4">{feature.description}</p>
                  
                  <span className={`text-xs font-medium ${feature.tierColor}`}>
                    {feature.tier}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* AI Engine Section */}
      <Section delay={0.1}>
        <div className="px-6 py-20 border-t border-zinc-800/50 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">The AI Engine</h2>
              <p className="text-zinc-400 max-w-xl mx-auto">
                Three models working together. Each specialized for its role.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: "Claude Sonnet 4",
                  role: "Code Generation",
                  desc: "The heavy lifter. Writes production-ready React and TypeScript. Handles the entire build pipeline.",
                  color: "emerald",
                  borderColor: "border-emerald-500/20 hover:border-emerald-500/40"
                },
                {
                  name: "Claude Haiku 4",
                  role: "Quality Audit",
                  desc: "Fast, cheap verification layer that checks every component for errors and best practices.",
                  color: "violet",
                  borderColor: "border-violet-500/20 hover:border-violet-500/40"
                },
                {
                  name: "Gemini 2 Flash",
                  role: "Vision + Analysis",
                  desc: "Screenshots websites, extracts structure, reverse-engineers designs into prompts.",
                  color: "amber",
                  borderColor: "border-amber-500/20 hover:border-amber-500/40"
                }
              ].map((model, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className={`p-8 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border ${model.borderColor} transition-all duration-300 group`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-${model.color}-500/10 text-${model.color}-400 flex items-center justify-center mb-6`}>
                    <Cpu className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{model.name}</h3>
                  <p className={`text-sm text-${model.color}-400 mb-4`}>{model.role}</p>
                  <p className="text-zinc-400 text-sm leading-relaxed">{model.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Tech Stack */}
      <Section delay={0.1}>
        <div className="px-6 py-20 border-t border-zinc-800/50 bg-zinc-900/30 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What You Get</h2>
              <p className="text-zinc-400 max-w-xl mx-auto">
                Modern stack. Clean code. Ready to deploy anywhere.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: <Code2 className="w-5 h-5" />, label: "React 19" },
                { icon: <Box className="w-5 h-5" />, label: "Next.js 15" },
                { icon: <Layers className="w-5 h-5" />, label: "Tailwind CSS" },
                { icon: <Zap className="w-5 h-5" />, label: "Framer Motion" },
                { icon: <Lock className="w-5 h-5" />, label: "TypeScript" },
                { icon: <Shield className="w-5 h-5" />, label: "Clerk Auth" },
                { icon: <Globe className="w-5 h-5" />, label: "Edge Deploy" },
                { icon: <Terminal className="w-5 h-5" />, label: "Clean Exports" },
              ].map((tech, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03, duration: 0.4 }}
                  className="p-4 rounded-xl bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 hover:border-zinc-700 flex items-center gap-3 group transition-all"
                >
                  <div className="text-zinc-500 group-hover:text-emerald-400 transition-colors">
                    {tech.icon}
                  </div>
                  <span className="text-sm text-zinc-300">{tech.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section delay={0.1}>
        <div className="px-6 py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to build?</h2>
            <p className="text-xl text-zinc-400 mb-10">
              Free to start. No credit card required.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/builder"
                className="group relative px-8 py-4 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 hover:border-emerald-500/50 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]"
              >
                <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
                  Open Builder
                </span>
              </Link>
              <Link
                href="/demo"
                className="px-8 py-4 bg-zinc-800/50 backdrop-blur-xl hover:bg-zinc-800/70 text-zinc-300 hover:text-white rounded-xl font-semibold text-lg transition-all border border-zinc-700/50 hover:border-zinc-600"
              >
                Try the Demo
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}
