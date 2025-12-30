'use client'

/* eslint-disable react/no-unescaped-entities */

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'

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
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={transition()}
          >
            <span className="text-lg">🐣</span>
            <span>The Story</span>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={transition(0.1)}
          >
            I didn't learn to code.
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
              I learned to conduct.
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-zinc-400 max-w-2xl mx-auto"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={transition(0.2)}
          >
            HatchIt is proof that you don't need to be a developer to build developer-grade software. 
            You just need to know what you want—and how to orchestrate the AI that builds it.
          </motion.p>
        </div>
      </div>

      {/* The Story */}
      <div ref={storyRef} className="px-6 py-24 bg-zinc-900/30 border-y border-zinc-800/50">
        <div className="max-w-3xl mx-auto">
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate={storyInView ? "visible" : "hidden"}
            transition={transition()}
          >
            <h2 className="text-3xl font-bold text-center mb-12">How HatchIt Was Built</h2>
            <div className="space-y-6 text-lg text-zinc-300 leading-relaxed">
              <p>
                <span className="text-white font-medium">Christmas 2025.</span> I had an idea for an AI website builder. 
                Not another drag-and-drop template machine—something that writes real React code. 
                Code that developers would actually want to maintain.
              </p>
              <p>
                There was one problem: I didn't know React.
              </p>
              <p>
                So I did something different. Instead of spending months learning a framework, I opened Claude 
                and started describing what I wanted to build. Three days later, V1 was live.
              </p>
              <p>
                <span className="text-white font-medium">Now we're on V3.0.</span> A three-model AI pipeline where Claude Sonnet 4 builds your sections, 
                Claude Opus 4 polishes for accessibility, and Gemini 2.5 Pro audits the final result. Plus Hatch 🥚 — your friendly 
                egg companion who helps you write prompts when you're stuck.
              </p>
              <p>
                The secret isn't any single AI. It's the combination. Different models, different strengths. 
                Section-by-section building with branding that flows through everything.
              </p>
              <p className="text-zinc-400 italic">
                I built this product using this product. If that's not proof it works, I don't know what is.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* The Philosophy */}
      <div className="px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={transition()}
          >
            <h2 className="text-3xl font-bold mb-4">The Philosophy</h2>
            <p className="text-xl text-zinc-400">Code you can maintain, not code that just renders.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '🎯',
                title: 'Real Code',
                description: 'Not proprietary blocks. Standard React + Tailwind that works anywhere, maintained by anyone.',
              },
              {
                icon: '🔓',
                title: 'Zero Lock-in',
                description: 'Export anytime. Your code, your servers, your choice. We don\'t hold your project hostage.',
              },
              {
                icon: '⚡',
                title: 'AI Orchestra',
                description: 'Multiple models, multiple perspectives. Claude builds. Gemini audits. You decide.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl"
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={transition(i * 0.1)}
              >
                <span className="text-3xl mb-4 block">{item.icon}</span>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-zinc-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* The Tech */}
      <div className="px-6 py-24 bg-zinc-900/30 border-y border-zinc-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={transition()}
          >
            <h2 className="text-3xl font-bold mb-4">The Stack</h2>
            <p className="text-zinc-400 mb-8">Built on the latest, outputs the latest.</p>
          </motion.div>
          
          <div className="flex flex-wrap justify-center gap-3">
            {[
              'Next.js 16',
              'React 19',
              'TypeScript',
              'Tailwind CSS 4',
              'Claude Sonnet 4',
              'Claude Opus 4',
              'Claude Haiku',
              'Gemini 2.5 Pro',
            ].map((tech, i) => (
              <motion.span
                key={tech}
                className="px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-full text-sm text-zinc-300"
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={transition(i * 0.05)}
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </div>
      </div>

      {/* The Founder */}
      <div className="px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="relative p-8 md:p-12 bg-gradient-to-br from-purple-900/20 to-pink-900/10 border border-purple-500/20 rounded-3xl"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={transition()}
          >
            <div className="absolute -left-2 -top-2 text-6xl text-purple-500/20">"</div>
            <blockquote className="text-xl sm:text-2xl font-medium text-zinc-200 leading-relaxed mb-6">
              The AI writes the code, I make the decisions. That's not a limitation—it's a superpower. 
              I focus on what matters: the product, the user, the vision. The implementation details? 
              That's what the machines are for.
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl font-bold">
                D
              </div>
              <div>
                <div className="font-medium">Dan</div>
                <div className="text-sm text-zinc-500">Founder, HatchIt</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={transition()}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to build something?</h2>
            <p className="text-xl text-zinc-400 mb-8">See what you can create in minutes.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/builder"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold text-lg transition-all"
              >
                Start Building
              </Link>
              <Link
                href="/how-it-works"
                className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl font-semibold text-lg transition-all"
              >
                See How It Works
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
