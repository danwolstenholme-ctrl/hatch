'use client'

/* eslint-disable react/no-unescaped-entities */

import { motion } from 'framer-motion'
import Link from 'next/link'

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const transition = (delay = 0) => ({
  duration: 0.5,
  delay,
  ease: "easeOut" as const
});

const Step = ({ icon, step, title, description, delay = 0 }: { icon: string, step: string, title: string, description: string, delay?: number }) => (
  <motion.div
    className="flex flex-col items-center text-center"
    variants={sectionVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-50px" }}
    transition={transition(delay)}
  >
    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-4">
      <span className="text-3xl">{icon}</span>
    </div>
    <div className="text-xs font-mono text-purple-400/60 mb-2">STEP {step}</div>
    <h3 className="text-2xl font-bold mb-2">{title}</h3>
    <p className="text-zinc-400">{description}</p>
  </motion.div>
);

export default function HowItWorksPage() {
  return (
    <div className="bg-zinc-950 text-white">
      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-500/15 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Hero */}
      <div className="relative px-6 pt-20 pb-24 text-center">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm mb-8"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={transition()}
          >
            <span className="text-lg">🏗️</span>
            <span>The Process</span>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={transition(0.1)}
          >
            From Idea to Live Site
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
              in Minutes
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-zinc-400 max-w-2xl mx-auto"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={transition(0.2)}
          >
            HatchIt streamlines the development process by turning your natural language prompts into high-quality, production-ready code. Here's how it works.
          </motion.p>
        </div>
      </div>

      {/* Steps */}
      <div className="px-6 py-24 bg-zinc-900/30 border-y border-zinc-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12 items-start">
            <Step 
              icon="🎨"
              step="01"
              title="Choose & Brand"
              description="Pick a template (Website, Portfolio, or SaaS). Set your brand colors, fonts, and business details. Hatch uses this for every section."
              delay={0}
            />
            <Step 
              icon="🏗️"
              step="02"
              title="Build Section by Section"
              description="Work through each section one at a time. Stuck on what to say? Hatch 🥚 writes your prompts. Sonnet builds it, Opus polishes it."
              delay={0.1}
            />
            <Step 
              icon="🚀"
              step="03"
              title="Ship It"
              description="One click deploys your site. Get a live URL instantly. Connect your own domain if you want. You own the code."
              delay={0.2}
            />
          </div>
        </div>
      </div>

      {/* Deeper Dive Section */}
      <div className="px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="relative"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={transition(0.1)}
          >
            <h2 className="text-3xl font-bold text-center mb-12">The V3.0 Experience</h2>
            <div className="space-y-8">
              <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                <h3 className="text-xl font-bold mb-2">Three-Model Pipeline</h3>
                <p className="text-zinc-400">
                  We don't use one AI for everything. Claude Sonnet 4 builds fast. Claude Opus 4 polishes for accessibility and quality. Gemini 2.5 Pro audits the final result. Each model does what it's best at.
                </p>
              </div>
              <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                <h3 className="text-xl font-bold mb-2">Meet Hatch 🥚</h3>
                <p className="text-zinc-400">
                  Your friendly prompt helper. Stuck on what to say? Click the floating egg button and Hatch writes your prompts for you. She's powered by Claude Haiku and genuinely excited about your business.
                </p>
              </div>
              <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                <h3 className="text-xl font-bold mb-2">Real Code, Not Lock-in</h3>
                <p className="text-zinc-400">
                  We generate standard React and Tailwind CSS code. Export at any time as a ZIP file. Full ownership, no proprietary formats, no platform lock-in.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            className="relative p-12 bg-gradient-to-br from-purple-900/40 to-pink-900/30 border border-purple-500/20 rounded-3xl"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={transition(0.2)}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready to build faster?</h2>
            <p className="text-xl text-zinc-300 mb-8">Stop writing boilerplate. Start creating.</p>
            <Link href="/builder" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-zinc-900 hover:bg-zinc-100 rounded-xl font-bold text-lg transition-all">
              Start Building Free <span>→</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
