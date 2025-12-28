'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface RoadmapItem {
  title: string
  description: string
  status: 'done' | 'in-progress' | 'planned'
  date?: string
  technicalDetails?: string
}

interface RoadmapSection {
  title: string
  timeline: string
  items: RoadmapItem[]
}

const roadmap: RoadmapSection[] = [
  {
    title: 'Recently Shipped',
    timeline: 'December 2025',
    items: [
      { 
        title: 'Live Code Streaming', 
        description: 'Watch your code being generated in real-time', 
        status: 'done', 
        date: 'Dec 28',
        technicalDetails: `Created a new /api/generate-stream endpoint using Anthropic's streaming API with Server-Sent Events (SSE). The streaming request runs in parallel with our robust non-streaming endpoint — streaming is purely visual while the actual code parsing uses the original endpoint for stability.

Visual effects include: purple glow border around the Code tab, "Generating..." badge with pulsing indicator, code text in purple tint during streaming, animated cursor (▌) at the end that follows new lines, and auto-scroll to keep the latest code visible. A pulsing dot appears on the Code tab when streaming if you're viewing the Preview tab.

Technical stack: Anthropic claude-sonnet-4-20250514 with stream: true, TextEncoder for chunked responses, accumulated state management with setStreamingCode(), and useRef for auto-scroll behavior.`
      },
      { 
        title: 'Hatch Project Rebrand', 
        description: 'Renamed "Upgrade" to "Hatch Project" with improved messaging', 
        status: 'done', 
        date: 'Dec 28',
        technicalDetails: `Renamed the upgradeModal.tsx component to HatchModal.tsx and updated all imports across the codebase. Changed the messaging to better reflect the product metaphor — your project "hatches" when it's ready to go live.

Updated pricing display: $24 one-time setup + $19/month subscription clearly explained. Added tier comparison between Free (preview mode, unlimited generations) and Hatched (full code access, custom domain, hosting).`
      },
      { 
        title: 'Cross-Device Sync', 
        description: 'Access your deployed projects from any device', 
        status: 'done', 
        date: 'Dec 27',
        technicalDetails: `Projects are stored in Clerk user metadata for persistence. When a project is "hatched" (paid), we store the project ID and Stripe subscription in Clerk, which syncs across all devices where the user is logged in.

LocalStorage still handles the primary project data for speed, but deployed projects are fetched from Clerk metadata on page load, ensuring paid features persist across devices.`
      },
      { 
        title: 'Start Again Feature', 
        description: 'Clear code and start fresh without deleting projects', 
        status: 'done', 
        date: 'Dec 28',
        technicalDetails: `Added a "Start Again" button in the project menu that resets the code to the default starter template while preserving project name, ID, and payment status. Chat history is also cleared.

Uses a confirmation modal to prevent accidental resets. The previousCode state is also cleared so revert doesn't bring back old code.`
      },
      { 
        title: 'Truncation Protection', 
        description: 'Prevent saving broken/cut-off code', 
        status: 'done', 
        date: 'Dec 28',
        technicalDetails: `Added validation in the API response handling to detect truncated code. Checks for: unbalanced braces/brackets, missing export default, incomplete JSX tags, and responses that end mid-statement.

If truncation is detected, we show an error message and keep the previous working code rather than saving broken code that would crash the preview.`
      },
      { 
        title: 'Import HTML', 
        description: 'Upload existing HTML files to convert and edit', 
        status: 'done', 
        date: 'Dec 28',
        technicalDetails: `File upload accepts .html files, reads content with FileReader API, then sends to the AI with a specialized prompt to convert to React/Tailwind.

The AI preserves the structure and styling while converting to our JSX format. Handles inline styles, external CSS references, and common HTML patterns.`
      },
      { 
        title: 'Brand Panel', 
        description: 'Save and apply brand colors & fonts (PRO)', 
        status: 'done', 
        date: 'Dec 20',
        technicalDetails: `Brand settings stored in project object: { brand: { primaryColor, secondaryColor, accentColor, font } }. Color pickers use native HTML input[type="color"] with hex value storage.

Brand context is passed to the AI in every generation request, with instructions to use the brand colors for primary CTAs, headings, and accent elements. Font is applied via Tailwind's font-family utilities.`
      },
      { 
        title: 'AI Suggestions', 
        description: '"What\'s next?" prompts after generation', 
        status: 'done', 
        date: 'Dec 18',
        technicalDetails: `The AI returns suggestions in a SUGGESTIONS: block after generating code. We parse this with regex and display as clickable chips below the chat.

Suggestions are context-aware based on current code — if you just built a landing page, it might suggest "Add a pricing section" or "Create a contact form". Clicking a suggestion auto-fills and sends it as a prompt.`
      },
      { 
        title: 'Revert Button', 
        description: 'One-click undo to previous version', 
        status: 'done', 
        date: 'Dec 18',
        technicalDetails: `Before each generation, we store the current code in previousCode state. The Revert button (↶) appears after generation and swaps currentCode with previousCode.

Only stores one level of history to keep it simple. The button disappears after reverting or starting a new generation.`
      },
    ]
  },
  {
    title: 'January 2026',
    timeline: 'Jan 1 - Jan 31',
    items: [
      { title: 'Template Gallery', description: 'Start from pre-built templates (Landing, Portfolio, etc.)', status: 'planned' },
      { title: 'One-Click Components', description: 'Quick-add navbar, footer, contact form, pricing table', status: 'planned' },
      { title: 'Generation Timeline', description: 'Visual history of all prompts and versions', status: 'planned' },
      { title: 'SEO Optimizer', description: 'AI scans and fixes meta tags, headings, alt text', status: 'planned' },
    ]
  },
  {
    title: 'Q1 2026',
    timeline: 'Feb - Mar',
    items: [
      { title: 'Form Backend', description: 'Built-in form submissions with email notifications', status: 'planned' },
      { title: 'Export to Framework', description: 'Download as Next.js or Vite project structure', status: 'planned' },
      { title: 'Analytics Dashboard', description: 'Page views and visitor stats for deployed sites', status: 'planned' },
      { title: 'Screenshot-to-Code', description: 'Upload a design image, get matching code', status: 'planned' },
      { title: 'Accessibility Checker', description: 'Scan for a11y issues with auto-fix suggestions', status: 'planned' },
    ]
  },
  {
    title: 'Future',
    timeline: 'Q2 2026+',
    items: [
      { title: 'Voice-to-Website', description: 'Speak your description, generate on command', status: 'planned' },
      { title: 'Component Marketplace', description: 'Browse and add community-built components', status: 'planned' },
      { title: 'Multiplayer Editing', description: 'Real-time collaboration with team members', status: 'planned' },
      { title: 'Agency White-Label', description: 'Custom-branded builder for agencies', status: 'planned' },
      { title: 'Figma Import', description: 'Paste a Figma link, convert to code', status: 'planned' },
    ]
  }
]

const statusConfig = {
  'done': { label: 'Shipped', bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', dot: 'bg-green-500' },
  'in-progress': { label: 'In Progress', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', dot: 'bg-blue-500 animate-pulse' },
  'planned': { label: 'Planned', bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/20', dot: 'bg-zinc-500' }
}

function RoadmapCard({ item, sectionIndex, itemIndex }: { item: RoadmapItem; sectionIndex: number; itemIndex: number }) {
  const [expanded, setExpanded] = useState(false)
  const config = statusConfig[item.status]
  const hasDetails = !!item.technicalDetails

  return (
    <motion.div
      className={`relative p-4 rounded-xl border ${config.bg} ${config.border} ${hasDetails ? 'cursor-pointer' : ''}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: sectionIndex * 0.1 + itemIndex * 0.05 }}
      onClick={() => hasDetails && setExpanded(!expanded)}
    >
      {/* Timeline dot */}
      <div className={`absolute -left-[41px] top-5 w-3 h-3 rounded-full ${config.dot} ring-4 ring-zinc-950`}></div>
      
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white">{item.title}</h3>
            {item.date && (
              <span className="text-xs text-zinc-600">{item.date}</span>
            )}
            {hasDetails && (
              <motion.span 
                className="text-zinc-500 text-xs"
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                ▼
              </motion.span>
            )}
          </div>
          <p className="text-zinc-400 text-sm">{item.description}</p>
        </div>
        <span className={`flex-shrink-0 px-2 py-1 rounded-md text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}>
          {config.label}
        </span>
      </div>

      {/* Expandable Technical Details */}
      <AnimatePresence>
        {expanded && item.technicalDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Technical Details</span>
                <div className="flex-1 h-px bg-zinc-800"></div>
              </div>
              <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line font-mono bg-zinc-900/50 rounded-lg p-3 text-xs">
                {item.technicalDetails}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <nav className="relative z-50 px-8 py-6 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-black flex items-center gap-1">
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">Hatch</span>
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">It</span>
            <span className="text-lg">🐣</span>
          </Link>
          <Link href="/builder" className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-semibold text-sm transition-all">
            Start Building
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="relative z-10 px-8 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Roadmap</span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              See what we&apos;ve shipped and what&apos;s coming next. We build in public and ship fast.
            </p>
            <div className="flex items-center justify-center gap-6 mt-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-zinc-400">Shipped</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-zinc-400">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-zinc-500"></div>
                <span className="text-zinc-400">Planned</span>
              </div>
            </div>
          </motion.div>

          {/* Timeline */}
          <div className="space-y-12">
            {roadmap.map((section, sectionIndex) => (
              <motion.div 
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
              >
                {/* Section Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      sectionIndex === 0 ? 'bg-green-500/20 text-green-400' :
                      sectionIndex === 1 ? 'bg-blue-500/20 text-blue-400' :
                      'bg-zinc-800 text-zinc-400'
                    }`}>
                      {sectionIndex === 0 ? '✓' : sectionIndex === 1 ? '⚡' : '🗓️'}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{section.title}</h2>
                    <p className="text-zinc-500 text-sm">{section.timeline}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="ml-6 pl-10 border-l-2 border-zinc-800 space-y-4">
                  {section.items.map((item, itemIndex) => (
                    <RoadmapCard 
                      key={item.title} 
                      item={item} 
                      sectionIndex={sectionIndex} 
                      itemIndex={itemIndex} 
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div 
            className="mt-16 text-center p-8 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-zinc-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-2">Have a feature request?</h2>
            <p className="text-zinc-400 mb-6">We&apos;d love to hear what you want to build next.</p>
            <a 
              href="https://x.com/HatchItD" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-semibold transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Tell us on X
            </a>
          </motion.div>

          {/* Back link */}
          <div className="mt-12 text-center">
            <Link href="/" className="text-zinc-500 hover:text-white transition-colors text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-8 border-t border-zinc-800 mt-16">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-600 text-sm">© 2025 HatchIt</p>
          <div className="flex items-center gap-6 text-zinc-500 text-sm">
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
