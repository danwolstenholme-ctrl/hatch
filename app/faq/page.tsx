'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef } from 'react'
import { HelpCircle, ChevronDown, Zap, Code2, Globe, CreditCard } from 'lucide-react'
import { useInView } from 'framer-motion'

// =============================================================================
// FAQ PAGE - Clean, on-brand with homepage
// =============================================================================

function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null)

  const faqs = [
    {
      category: 'Getting Started',
      icon: Zap,
      questions: [
        {
          q: 'What is HatchIt?',
          a: 'HatchIt is an AI-powered website builder. Describe what you want in plain English, and it generates production-ready React + Tailwind code. Then deploy it with one click.',
        },
        {
          q: 'How does it work?',
          a: 'You describe each section of your site (hero, features, pricing, etc.) in natural language. The AI writes the code, you preview it live, refine if needed, then deploy. Simple as that.',
        },
        {
          q: 'Do I need to know how to code?',
          a: 'No. The whole point is that you describe what you want and the AI handles the code. That said, if you do know code, you can export the full source and customize it however you like.',
        },
        {
          q: 'What AI model do you use?',
          a: 'Claude Sonnet 4 from Anthropic. It\'s excellent at writing clean, production-ready React code.',
        },
      ],
    },
    {
      category: 'Output & Code',
      icon: Code2,
      questions: [
        {
          q: 'Is the generated code production-ready?',
          a: 'Yes. It\'s clean React + Tailwind CSS. No weird abstractions. No vendor lock-in. You can export it as a full Next.js project and host it anywhere.',
        },
        {
          q: 'Can I edit the code myself?',
          a: 'Absolutely. Export your project as a ZIP and you get a complete Next.js codebase. Edit it however you want, host it wherever you want.',
        },
        {
          q: 'Can I build multi-page sites?',
          a: 'Yes. You can add pages like About, Services, Pricing, Contact, FAQ, and Portfolio. Each comes with preset sections you can customize.',
        },
        {
          q: 'What\'s included in the export?',
          a: 'Everything: React components, Tailwind config, SEO setup (sitemap, robots.txt, OpenGraph images), proper file structure. Run npm install, npm run dev, and it works.',
        },
      ],
    },
    {
      category: 'Deployment',
      icon: Globe,
      questions: [
        {
          q: 'How does deployment work?',
          a: 'One click. Your site goes live on a subdomain (yoursite.hatchit.dev) instantly. Paid plans can connect custom domains.',
        },
        {
          q: 'Who owns the code?',
          a: 'You do. 100%. Export it, modify it, host it elsewhere. No platform lock-in. Once you export, it\'s completely yours.',
        },
        {
          q: 'Can I use my own domain?',
          a: 'Yes, on paid plans. Point your DNS to us and we handle SSL automatically.',
        },
        {
          q: 'Can I host it myself?',
          a: 'Yes. Download the ZIP, deploy to Vercel, Netlify, or your own server. The exported code is a standard Next.js app.',
        },
      ],
    },
    {
      category: 'Pricing',
      icon: CreditCard,
      questions: [
        {
          q: 'Is there a free tier?',
          a: 'Yes. Free users can build unlimited sections and preview everything. You only pay when you want to deploy or export your code.',
        },
        {
          q: 'What do paid plans include?',
          a: 'Architect ($19/mo): Deploy to hatchit.dev, download code, 3 projects. Visionary ($49/mo): Unlimited projects, custom domains, remove branding. Singularity ($199/mo): White-label, API access, website cloning.',
        },
        {
          q: 'Can I cancel anytime?',
          a: 'Yes. No contracts, cancel anytime. Your existing deployed sites stay live, you just can\'t create new ones.',
        },
        {
          q: 'Is there a refund policy?',
          a: 'If you\'re not happy within 7 days, reach out and we\'ll sort it out.',
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 overflow-hidden relative selection:bg-emerald-500/30">
      
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center px-4 sm:px-6 pt-32 pb-16 overflow-hidden">
        {/* Gradient backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-transparent to-zinc-950/90" />
        
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
            Frequently Asked Questions
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight text-white leading-[1.1]"
          >
            Got questions?
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg text-zinc-400 max-w-xl mx-auto"
          >
            Here are the answers to the most common ones.
          </motion.p>
        </div>
      </section>

      {/* FAQ Content */}
      <Section>
        <div className="px-4 sm:px-6 pb-24">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-12">
              {faqs.map((section, sectionIdx) => {
                const Icon = section.icon
                return (
                  <div key={section.category}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <h2 className="text-xl font-semibold text-white">
                        {section.category}
                      </h2>
                    </div>
                    
                    <div className="space-y-3">
                      {section.questions.map((faq, idx) => {
                        const questionId = `${sectionIdx}-${idx}`
                        const isOpen = openIndex === questionId
                        return (
                          <motion.div
                            key={idx}
                            className={`bg-zinc-900/50 border rounded-xl overflow-hidden transition-colors ${
                              isOpen ? 'border-zinc-700' : 'border-zinc-800/50 hover:border-zinc-700/50'
                            }`}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <button
                              onClick={() => setOpenIndex(isOpen ? null : questionId)}
                              className="w-full text-left p-5 flex items-center justify-between gap-4"
                            >
                              <span className="font-medium text-white">
                                {faq.q}
                              </span>
                              <motion.span
                                animate={{ rotate: isOpen ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="text-zinc-500 flex-shrink-0"
                              >
                                <ChevronDown className="w-5 h-5" />
                              </motion.span>
                            </button>
                            
                            <AnimatePresence>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <div className="px-5 pb-5">
                                    <p className="text-zinc-400 leading-relaxed">
                                      {faq.a}
                                    </p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Still have questions? */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-16 text-center p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl"
            >
              <HelpCircle className="w-8 h-8 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Still have questions?</h3>
              <p className="text-zinc-400 mb-4">We're happy to help.</p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors"
              >
                Get in touch
              </a>
            </motion.div>
          </div>
        </div>
      </Section>
    </div>
  )
}
