'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Terminal, HelpCircle, ChevronDown, Search, Database, Shield, Cpu, Zap } from 'lucide-react'

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null)

  const faqs = [
  {
    category: 'System Initialization',
    icon: Terminal,
    questions: [
      {
        q: 'What is the Hatch System?',
        a: 'The Hatch System is an autonomous architectural entity capable of generating production-grade React code from natural language directives. It allows Architects (users) to materialize complex web structures without manual coding.',
      },
      {
        q: 'How does the fabrication process function?',
        a: 'The system utilizes a three-stage pipeline. 1) Vector Selection (Template), 2) Identity Matrix (Branding), 3) Sequential Fabrication (Section Building). The system builds, refines, and audits each section. The prompt helper assists with prompt extrapolation.',
      },
      {
        q: 'Is coding knowledge required for operation?',
        a: 'Negative. The System is designed for natural language interaction. However, the generated source code is fully accessible and editable for Architects with technical proficiency.',
      },
      {
        q: 'Identify the System Architect.',
        a: 'The prompt helper is powered by Claude Haiku, it bridges the gap between User intent and System execution, capable of extrapolating complex prompts from minimal input.',
      },
    ],
  },
  {
    category: 'Capabilities & Output',
    icon: Cpu,
    questions: [
      {
        q: 'Is the output production-grade?',
        a: 'Affirmative. The System generates clean, semantic React + Tailwind CSS code. The multi-stage pipeline ensures accessibility compliance and best-practice adherence before final output.',
      },
      {
        q: 'Can the generated code be modified?',
        a: 'Full modification access is granted. Architects can manipulate code directly via the terminal interface or issue natural language update directives to the System.',
      },
      {
        q: 'Does the System support multi-vector structures?',
        a: 'Yes. Multi-page architectures are supported with automatic routing. Sub-vectors like /about, /contact, and /services can be generated and linked seamlessly.',
      },
      {
        q: 'Can external assets be integrated?',
        a: 'Yes. The Asset Management Module allows for the upload and integration of custom logos, imagery, and iconography directly into the generated structure.',
      },
    ],
  },
  {
    category: 'Resource Allocation',
    icon: Database,
    questions: [
      {
        q: 'What are the resource costs?',
        a: 'System access is tiered. Architect ($19/mo) grants full Singularity Engine access and unlimited generations. Visionary ($49/mo) adds full source code export, white-labeling, and priority processing. Singularity ($199/mo) is for high-volume agency use with dedicated infrastructure.',
      },
      {
        q: 'Is there a trial protocol?',
        a: 'Yes. Guests can initiate the neural handshake and preview the output. Account creation is required to save, refine, or deploy.',
      },
      {
        q: 'What is included in the Visionary Tier?',
        a: 'Unlimited generations, full source export, custom domain deployment, white-labeling (no branding), commercial license, and priority neural processing.',
      },
    ],
  },
  {
    category: 'Deployment & Sovereignty',
    icon: Zap,
    questions: [
      {
        q: 'How is deployment executed?',
        a: 'One-click compilation via the "Ship It" command. The System compiles and deploys to the edge network instantly. Live URL is provisioned immediately.',
      },
      {
        q: 'Who retains code sovereignty?',
        a: 'You retain 100% ownership over all generated code. Full rights to modify, distribute, and commercialize are granted. No platform lock-in.',
      },
      {
        q: 'Can the code be exported?',
        a: 'Yes. Full project export is available as a ZIP archive, containing all React components, configuration files, and dependencies required for independent hosting.',
      },
    ],
  },
]

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-emerald-500/30 relative overflow-hidden">
      {/* Ambient void background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPC9zdmc+')] opacity-20 mix-blend-overlay" />

      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      {/* Radial Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-30%,#10b98115,transparent)] pointer-events-none" />

      {/* Hero */}
      <section className="relative px-6 pt-24 pb-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="inline-flex items-center gap-2 text-emerald-400 mb-6 font-mono text-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <HelpCircle className="w-4 h-4" />
            <span>SYSTEM_DOCUMENTATION</span>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight font-mono tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Knowledge <span className="text-emerald-400">Base</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg text-zinc-400 max-w-2xl font-mono leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Operational protocols and system capabilities.
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <div className="relative px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Quick Links */}
          <div className="flex flex-wrap gap-2 mb-16">
            {faqs.map((section) => (
              <button
                key={section.category}
                onClick={() => {
                  const element = document.getElementById(section.category.toLowerCase().replace(/\s+/g, '-'))
                  element?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="px-4 py-2 bg-zinc-900/70 backdrop-blur-xl hover:bg-zinc-800/70 border border-zinc-800/50 hover:border-emerald-500/30 rounded-sm text-xs font-mono text-zinc-400 hover:text-emerald-400 transition-all uppercase tracking-wider"
              >
                [{section.category}]
              </button>
            ))}
          </div>

          {/* FAQ Sections */}
          <div className="space-y-20">
            {faqs.map((section) => {
              const Icon = section.icon
              return (
                <section key={section.category} id={section.category.toLowerCase().replace(/\s+/g, '-')}>
                  <div className="flex items-center gap-3 mb-8 border-b border-zinc-800/50 pb-4">
                    <Icon className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-xl font-bold text-white font-mono uppercase tracking-wider">
                      {section.category}
                    </h2>
                  </div>
                  
                  <div className="space-y-4">
                    {section.questions.map((faq, idx) => {
                      const questionId = `${section.category}-${idx}`
                      const isOpen = openIndex === questionId
                      return (
                        <motion.div
                          key={idx}
                          className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/50 rounded-sm overflow-hidden hover:border-emerald-500/30 transition-colors shadow-2xl shadow-black/50"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <button
                            onClick={() => setOpenIndex(isOpen ? null : questionId)}
                            className="w-full text-left p-6 flex items-start justify-between gap-4 group"
                          >
                            <span className="font-mono text-sm font-bold text-zinc-300 group-hover:text-emerald-400 transition-colors flex-1 leading-relaxed">
                              <span className="text-emerald-500/50 mr-2">Q:</span>
                              {faq.q}
                            </span>
                            <motion.span
                              animate={{ rotate: isOpen ? 180 : 0 }}
                              className="text-zinc-500 flex-shrink-0"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </motion.span>
                          </button>
                          
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="px-6 pb-6 pt-0">
                                  <div className="h-px w-full border-t border-zinc-800/50 mb-4"></div>
                                  <div className="flex gap-3">
                                    <span className="text-emerald-500/50 font-mono text-sm font-bold">A:</span>
                                    <p className="text-zinc-400 text-sm font-mono leading-relaxed">
                                      {faq.a}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
