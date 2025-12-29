'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function HowItWorksPage() {
  const steps = [
    {
      number: '01',
      title: 'Describe Your Vision',
      description: 'Tell our AI what you want to build. Be as simple or detailed as you like—from "a landing page for my coffee shop" to specific design requirements.',
      tips: [
        'Mention the style you want (modern, minimal, bold)',
        'Include specific sections (hero, pricing, testimonials)',
        'Reference colors or themes you prefer',
      ],
      example: '"Build a dark-themed SaaS landing page with a gradient hero, animated feature cards, and a pricing table with three tiers"',
      icon: '💭',
      gradient: 'from-purple-500 to-indigo-600',
    },
    {
      number: '02',
      title: 'Watch It Generate',
      description: 'Our AI (powered by Claude Opus 4.5) analyzes your request and writes production-ready React code. With live streaming, you can watch your site come to life in real-time.',
      tips: [
        'Code appears as it\'s being written',
        'Preview updates alongside the code',
        'Generation takes 20-60 seconds',
      ],
      icon: '⚡',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      number: '03',
      title: 'Iterate & Refine',
      description: 'Not quite right? Just tell the AI what to change. "Make the hero bigger", "Add a contact form", "Change the colors to blue"—it understands natural language.',
      tips: [
        'Be specific about what to change',
        'Reference sections by name',
        'Use "keep X but change Y" for targeted updates',
      ],
      example: '"Make the pricing cards have a hover animation and highlight the middle plan as recommended"',
      icon: '🔄',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      number: '04',
      title: 'Deploy & Share',
      description: 'When you\'re happy, deploy with one click. Get a live URL instantly, or connect your own custom domain. Your site is live on our global CDN.',
      tips: [
        'Deploy takes seconds',
        'Get a hatchit.dev subdomain free',
        'Connect custom domains with Hatched',
        'Export as ZIP anytime',
      ],
      icon: '🚀',
      gradient: 'from-blue-500 to-cyan-600',
    },
  ]

  const useCases = [
    {
      title: 'Startup Landing Pages',
      description: 'Launch your MVP landing page in minutes. Collect emails, explain your product, and validate your idea—fast.',
      icon: '🚀',
    },
    {
      title: 'Portfolio Sites',
      description: 'Showcase your work with a beautiful, custom portfolio. Perfect for designers, developers, photographers, and creatives.',
      icon: '🎨',
    },
    {
      title: 'Business Websites',
      description: 'Professional websites for restaurants, consultants, agencies, and local businesses. No templates—fully custom.',
      icon: '💼',
    },
    {
      title: 'Event Pages',
      description: 'Quick landing pages for conferences, weddings, meetups, or product launches. Build it in an afternoon.',
      icon: '🎉',
    },
    {
      title: 'Documentation Sites',
      description: 'Clean, organized documentation for your product or API. Easy to update and maintain.',
      icon: '📚',
    },
    {
      title: 'Prototypes & Mockups',
      description: 'Rapidly prototype ideas before investing in full development. Test concepts with real, working code.',
      icon: '⚡',
    },
  ]

  const faqs = [
    {
      q: 'Do I need to know how to code?',
      a: 'No! HatchIt is designed for anyone. Just describe what you want in plain English, and our AI handles all the technical details.',
    },
    {
      q: 'What kind of code does it generate?',
      a: 'HatchIt generates clean, modern React components styled with Tailwind CSS. The code is production-ready and follows best practices.',
    },
    {
      q: 'Can I edit the code myself?',
      a: 'Absolutely! You can view the code in the editor, and if you know React/Tailwind, you can modify it directly. You can also export the code as a ZIP file.',
    },
    {
      q: 'How is this different from other website builders?',
      a: 'Traditional builders use drag-and-drop with templates. HatchIt generates unique, custom code from your descriptions. No templates, no limitations.',
    },
    {
      q: 'Is it really free?',
      a: 'You get 10 free generations per day. For unlimited generations, live streaming, brand customization, and more, check out our Hatch plan.',
    },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0">
          <div className="absolute top-32 left-1/4 w-72 h-72 bg-green-500/10 rounded-full blur-3xl" />
          <div className="absolute top-48 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-6 pt-32 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ willChange: 'transform, opacity', backfaceVisibility: 'hidden' }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm mb-6">
              <span className="text-lg">🎯</span>
              <span>Simple as 1-2-3-4</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              How
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent"> HatchIt </span>
              Works
            </h1>
            
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              From idea to live website in minutes. No coding required. 
              Just describe, generate, refine, and deploy.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{ willChange: 'transform, opacity', backfaceVisibility: 'hidden' }}
              className="relative mb-16 last:mb-0"
            >
              {/* Connection line */}
              {i < steps.length - 1 && (
                <div className="absolute left-8 top-24 bottom-0 w-px bg-gradient-to-b from-zinc-700 to-transparent hidden md:block" />
              )}
              
              <div className="flex gap-6 md:gap-8">
                {/* Number badge */}
                <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-2xl font-bold shadow-lg`}>
                  {step.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono text-zinc-500">STEP {step.number}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">{step.title}</h2>
                  <p className="text-lg text-zinc-400 mb-6">{step.description}</p>
                  
                  {step.tips && (
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl mb-4">
                      <p className="text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">Pro Tips</p>
                      <ul className="space-y-1">
                        {step.tips.map((tip, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-zinc-300">
                            <span className="text-emerald-400">✓</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {step.example && (
                    <div className="p-4 bg-purple-900/10 border border-purple-500/20 rounded-xl">
                      <p className="text-xs font-medium text-purple-400 mb-2">Example Prompt</p>
                      <p className="text-sm text-zinc-300 italic">{step.example}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Video/Demo placeholder */}
      <section className="py-16 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="aspect-video bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5" />
            <div className="text-center z-10">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25">
                <svg className="w-8 h-8 ml-1" fill="white" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <p className="text-zinc-400">Watch HatchIt in action</p>
              <p className="text-sm text-zinc-600 mt-1">2 minute demo</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Use Cases */}
      <section className="py-24 px-6 bg-gradient-to-b from-zinc-900/50 to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What Can You Build?</h2>
            <p className="text-xl text-zinc-400">HatchIt is perfect for any website project</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-all group"
              >
                <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">{useCase.icon}</span>
                <h3 className="text-xl font-bold mb-2">{useCase.title}</h3>
                <p className="text-zinc-400">{useCase.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick FAQs */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Quick Questions</h2>
            <p className="text-xl text-zinc-400">Everything you need to know to get started</p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl"
              >
                <h3 className="font-bold mb-2 flex items-start gap-2">
                  <span className="text-purple-400">Q:</span>
                  {faq.q}
                </h3>
                <p className="text-zinc-400 ml-6">{faq.a}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <Link href="/faq" className="text-purple-400 hover:text-purple-300 font-medium">
              See all FAQs →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="p-12 bg-gradient-to-br from-emerald-900/30 via-cyan-900/20 to-blue-900/30 border border-emerald-500/20 rounded-3xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Try It?
            </h2>
            <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
              Build your first website in the next 5 minutes. No signup required to start.
            </p>
            <Link
              href="/builder"
              className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 rounded-xl font-bold text-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25"
            >
              <span>Start Building Free</span>
              <span>→</span>
            </Link>
            <p className="text-sm text-zinc-500 mt-4">10 free generations • No credit card</p>
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
            <Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
            <Link href="/roadmap" className="hover:text-white transition-colors">Roadmap</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          </nav>
          <p className="text-sm text-zinc-500">© 2025 HatchIt</p>
        </div>
      </footer>
    </div>
  )
}
