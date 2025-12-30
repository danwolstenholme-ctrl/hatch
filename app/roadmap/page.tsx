'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import HatchCharacter from '@/components/HatchCharacter'

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
    title: 'V3.1 - Just Shipped! 💭',
    timeline: 'December 2025',
    items: [
      { 
        title: 'AI Reasoning Display', 
        description: 'See WHY the AI made each design decision', 
        status: 'done', 
        date: 'Dec 2025',
        technicalDetails: `Added "Design Reasoning" display to SectionBuilder. The AI now explains its choices: "Used split layout with testimonial on left to build trust before the CTA" or "Three feature cards because odd numbers feel more dynamic."

Updated build-section API prompt to return JSON with both code and reasoning fields. Purple-tinted card with 💭 icon shows the reasoning after generation completes.`
      },
      { 
        title: 'AI Thinking Caption', 
        description: 'Homepage shows rotating AI thoughts as code generates', 
        status: 'done', 
        date: 'Dec 2025',
        technicalDetails: `Replaced static caption under hero demo with rotating AIThinkingCaption component. Shows design reasoning like "Choosing gradient direction to guide eye flow toward CTA" and "Purple CTA on dark = high contrast, draws immediate focus."

Cycles through 6 thoughts every 4 seconds with fade animation. Makes AI feel thoughtful and opinionated, not mechanical.`
      },
      { 
        title: 'DB-Backed Generation Limits', 
        description: 'Proper free tier enforcement that persists across deploys', 
        status: 'done', 
        date: 'Dec 2025',
        technicalDetails: `Moved generation tracking from in-memory Map to Supabase. Added generation_count and generation_date columns to users table with atomic increment function.

Free tier now properly enforces 5/day limit. Previously, serverless cold starts would reset the counter, allowing unlimited generations.`
      },
      { 
        title: 'Security Hardening', 
        description: 'Improved webhook handling and API key validation', 
        status: 'done', 
        date: 'Dec 2025',
        technicalDetails: `Added findUserByStripeInfo helper for webhook user lookup with subscription metadata fallback. Proper Gemini API key validation with user-friendly errors.

Created shared subscription types in types/subscriptions.ts for consistent tier handling across checkout, webhooks, and API routes.`
      },
    ]
  },
  {
    title: 'V3.0 - The Big Update 🥚',
    timeline: 'December 2025',
    items: [
      { 
        title: 'Three-Model AI Pipeline', 
        description: 'Sonnet builds. Opus polishes. Gemini audits.', 
        status: 'done', 
        date: 'Dec 2025',
        technicalDetails: `Replaced single-model approach with specialized pipeline. Claude Sonnet 4 (claude-sonnet-4-20250514) generates initial code fast. Claude Opus 4 (claude-opus-4-20250514) refines for accessibility, semantic HTML, and quality. Gemini 2.5 Pro (gemini-2.5-pro-preview-06-05) audits final output for best practices.

Each model has a specific role and system prompt optimized for its task. The pipeline runs sequentially: Sonnet → Opus → (optional) Gemini audit.`
      },
      { 
        title: 'Meet Hatch 🥚', 
        description: 'Your friendly egg companion who writes prompts for you', 
        status: 'done', 
        date: 'Dec 2025',
        technicalDetails: `Created HatchCharacter.tsx component with 5 animated states: idle, thinking, excited, watching, sleeping. Powered by Claude Haiku (claude-3-5-haiku-20241022) for instant responses.

Floating button in SectionBuilder opens popup where Hatch writes prompts based on your branding and current section. Visual design: cute egg with soft ◠ ◠ eyes, pink blush, sparkles when excited, crack animation.`
      },
      { 
        title: 'Section-by-Section Building', 
        description: 'Build your site one section at a time with templates', 
        status: 'done', 
        date: 'Dec 2025',
        technicalDetails: `New BuildFlowController orchestrates the flow: Template Selection → Branding Step → Section Building. Templates define section order (e.g., Website: header, hero, features, how-it-works, testimonials, pricing, cta, faq, footer).

SectionProgress component shows progress with clickable dots. Each section is built and refined before moving to the next, with skip option available.`
      },
      { 
        title: 'Branding Step', 
        description: 'Set colors, fonts, and business details before building', 
        status: 'done', 
        date: 'Dec 2025',
        technicalDetails: `BrandingStep.tsx collects: businessName, tagline, primaryColor, accentColor, style (modern/minimal/bold/playful). Visual color picker with preset palettes.

Brand config is passed to every AI prompt, ensuring consistent styling across all sections. Stored in project object and persisted to Supabase.`
      },
      { 
        title: 'AI Suggestions Popup', 
        description: 'Opus suggests improvements after each section', 
        status: 'done', 
        date: 'Dec 2025',
        technicalDetails: `After Sonnet generates a section, Opus analyzes and returns suggestions via suggest-improvements API. Displayed in friendly popup with Hatch: "I have some ideas! ✨"

Suggestions are contextual to the section type. Click to apply, or dismiss and continue to next section.`
      },
      { 
        title: 'Website Template', 
        description: 'New 9-section template for complete business sites', 
        status: 'done', 
        date: 'Dec 2025',
        technicalDetails: `Added as first template option. Sections: header, hero, features, how-it-works, testimonials, pricing, cta, faq, footer.

Optimized prompts for each section type. Removed Blog template, repositioned Portfolio and SaaS templates.`
      },
    ]
  },
  {
    title: 'V2.0 - Previously Shipped',
    timeline: 'December 2025',
    items: [
      { 
        title: 'Live Code Streaming', 
        description: 'Watch your code being generated in real-time', 
        status: 'done', 
        date: 'Dec 28',
        technicalDetails: `Created a new /api/generate-stream endpoint using Anthropic's streaming API with Server-Sent Events (SSE). The streaming request runs in parallel with our robust non-streaming endpoint — streaming is purely visual while the actual code parsing uses the original endpoint for stability.

Visual effects include: purple glow border around the Code tab, "Generating..." badge with pulsing indicator, code text in purple tint during streaming, animated cursor (▌) at the end that follows new lines, and auto-scroll to keep the latest code visible. A pulsing dot appears on the Code tab when streaming if you're viewing the Preview tab.`
      },
      { 
        title: 'Hatch Project Rebrand', 
        description: 'Renamed "Upgrade" to "Hatch Project" with improved messaging', 
        status: 'done', 
        date: 'Dec 28',
        technicalDetails: `Renamed the upgradeModal.tsx component to HatchModal.tsx and updated all imports across the codebase. Changed the messaging to better reflect the product metaphor — your project "hatches" when it's ready to go live.`
      },
      { 
        title: 'Cross-Device Sync', 
        description: 'Access your deployed projects from any device', 
        status: 'done', 
        date: 'Dec 27',
        technicalDetails: `Projects are stored in Clerk user metadata for persistence. When a project is "hatched" (paid), we store the project ID and Stripe subscription in Clerk, which syncs across all devices where the user is logged in.`
      },
      { 
        title: 'Start Again Feature', 
        description: 'Clear code and start fresh without deleting projects', 
        status: 'done', 
        date: 'Dec 28',
        technicalDetails: `Added a "Start Again" button in the project menu that resets the code to the default starter template while preserving project name, ID, and payment status.`
      },
    ]
  },
  {
    title: 'Coming Soon',
    timeline: 'Q1 2026',
    items: [
      { title: 'Visual Editor', description: 'Click-to-edit elements directly in the preview', status: 'in-progress' },
      { title: 'Generation Timeline', description: 'Visual history of all prompts and versions', status: 'planned' },
      { title: 'SEO Optimizer', description: 'AI scans and fixes meta tags, headings, alt text', status: 'planned' },
      { title: 'Form Backend', description: 'Built-in form submissions with email notifications', status: 'planned' },
      { title: 'Export to Framework', description: 'Download as Next.js or Vite project structure', status: 'planned' },
    ]
  },
  {
    title: 'Future',
    timeline: 'Q2 2026+',
    items: [
      { title: 'Screenshot-to-Code', description: 'Upload a design image, get matching code', status: 'planned' },
      { title: 'Voice-to-Website', description: 'Speak your description, generate on command', status: 'planned' },
      { title: 'Component Marketplace', description: 'Browse and add community-built components', status: 'planned' },
      { title: 'Multiplayer Editing', description: 'Real-time collaboration with team members', status: 'planned' },
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
    <div className="min-h-screen bg-zinc-950 text-white relative">
      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-2xl md:blur-[100px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-500/15 rounded-full blur-2xl md:blur-[100px]" />
        <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-2xl md:blur-[100px]" />
      </div>

      {/* Content */}
      <main className="relative z-10 px-6 pt-20 pb-16">
        <div className="max-w-5xl mx-auto">
          {/* Hero */}
          <motion.div 
            className="text-center mb-24"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <span className="text-lg">🗓️</span>
              <span>What We&apos;ve Built & What&apos;s Next</span>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
                Product Roadmap
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              We build in public and ship fast. See what we&apos;ve shipped, what we&apos;re working on, and what&apos;s coming next.
            </motion.p>
            
            <div className="flex items-center justify-center gap-6 flex-wrap text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                <span className="text-zinc-400">Shipped</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-zinc-400">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-600"></div>
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
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      {section.title.includes('🥚') ? (
                        <>
                          {section.title.replace(' 🥚', '')}
                          <span className="inline-block"><HatchCharacter state="excited" size="sm" /></span>
                        </>
                      ) : (
                        section.title
                      )}
                    </h2>
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
