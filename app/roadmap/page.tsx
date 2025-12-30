'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { GitCommit, Circle, CheckCircle2, Clock, ChevronDown, Terminal, Cpu, Zap } from 'lucide-react'

interface RoadmapItem {
  title: string
  description: string
  status: 'deployed' | 'compiling' | 'queued'
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
    title: 'System Version 3.1 [CURRENT]',
    timeline: 'December 2025',
    items: [
      { 
        title: 'Reasoning Engine Visualization', 
        description: 'Exposed internal logic pathways to the Architect.', 
        status: 'deployed', 
        date: 'Dec 2025',
        technicalDetails: `Added "Design Reasoning" display to SectionBuilder. The System now explains its choices: "Used split layout with testimonial on left to build trust before the CTA" or "Three feature cards because odd numbers feel more dynamic."

Updated build-section API prompt to return JSON with both code and reasoning fields. Emerald-tinted card with terminal icon shows the reasoning after generation completes.`
      },
      { 
        title: 'Cognitive Stream Display', 
        description: 'Real-time visualization of System thought processes.', 
        status: 'deployed', 
        date: 'Dec 2025',
        technicalDetails: `Replaced static caption under hero demo with rotating AIThinkingCaption component. Shows design reasoning like "Choosing gradient direction to guide eye flow toward CTA" and "Emerald CTA on dark = high contrast, draws immediate focus."

Cycles through 6 thoughts every 4 seconds with fade animation. Makes the System feel alive and opinionated, not mechanical.`
      },
      { 
        title: 'Resource Allocation Control', 
        description: 'Database-backed generation limits for stability.', 
        status: 'deployed', 
        date: 'Dec 2025',
        technicalDetails: `Moved generation tracking from in-memory Map to Supabase. Added generation_count and generation_date columns to users table with atomic increment function.

Free tier now properly enforces 5/day limit. Previously, serverless cold starts would reset the counter, allowing unlimited generations.`
      },
      { 
        title: 'Security Protocols', 
        description: 'Enhanced webhook handling and API key validation.', 
        status: 'deployed', 
        date: 'Dec 2025',
        technicalDetails: `Added findUserByStripeInfo helper for webhook user lookup with subscription metadata fallback. Proper Gemini API key validation with user-friendly errors.

Created shared subscription types in types/subscriptions.ts for consistent tier handling across checkout, webhooks, and API routes.`
      },
    ]
  },
  {
    title: 'System Version 3.0',
    timeline: 'December 2025',
    items: [
      { 
        title: 'Tri-Core Neural Pipeline', 
        description: 'Sonnet builds. Opus polishes. Gemini audits.', 
        status: 'deployed', 
        date: 'Dec 2025',
        technicalDetails: `Replaced single-model approach with specialized pipeline. Claude Sonnet 4 (claude-sonnet-4-20250514) generates initial code fast. Claude Opus 4 (claude-opus-4-20250514) refines for accessibility, semantic HTML, and quality. Gemini 2.5 Pro (gemini-2.5-pro-preview-06-05) audits final output for best practices.

Each model has a specific role and system prompt optimized for its task. The pipeline runs sequentially: Sonnet → Opus → (optional) Gemini audit.`
      },
      { 
        title: 'System Architect Interface', 
        description: 'The cognitive interface bridging User and System.', 
        status: 'deployed', 
        date: 'Dec 2025',
        technicalDetails: `Created HatchCharacter.tsx component with 5 animated states: idle, thinking, excited, watching, sleeping. Powered by Claude Haiku (claude-3-5-haiku-20241022) for instant responses.

Floating button in SectionBuilder opens popup where the Architect optimizes prompts based on your branding and current section. Visual design: Abstract geometric node with pulsing core and rotating rings.`
      },
      { 
        title: 'Modular Construction Flow', 
        description: 'Sequential section generation with template logic.', 
        status: 'deployed', 
        date: 'Dec 2025',
        technicalDetails: `New BuildFlowController orchestrates the flow: Template Selection → Branding Step → Section Building. Templates define section order (e.g., Website: header, hero, features, how-it-works, testimonials, pricing, cta, faq, footer).

SectionProgress component shows progress with clickable dots. Each section is built and refined before moving to the next, with skip option available.`
      },
      { 
        title: 'Brand Identity Matrix', 
        description: 'Global style enforcement across all generated modules.', 
        status: 'deployed', 
        date: 'Dec 2025',
        technicalDetails: `BrandingStep.tsx collects: businessName, tagline, primaryColor, accentColor, style (modern/minimal/bold/playful). Visual color picker with preset palettes.

Brand config is passed to every AI prompt, ensuring consistent styling across all sections. Stored in project object and persisted to Supabase.`
      },
      { 
        title: 'Optimization Subroutine', 
        description: 'Opus analyzes and suggests improvements post-generation.', 
        status: 'deployed', 
        date: 'Dec 2025',
        technicalDetails: `After Sonnet generates a section, Opus analyzes and returns suggestions via suggest-improvements API. Displayed in friendly popup with Hatch: "I have some ideas! ✨"

Suggestions are contextual to the section type. Click to apply, or dismiss and continue to next section.`
      },
    ]
  },
  {
    title: 'System Version 2.0',
    timeline: 'December 2025',
    items: [
      { 
        title: 'Real-time Code Streaming', 
        description: 'Visualizing the generation process as it happens.', 
        status: 'deployed', 
        date: 'Dec 28',
        technicalDetails: `Created a new /api/generate-stream endpoint using Anthropic's streaming API with Server-Sent Events (SSE). The streaming request runs in parallel with our robust non-streaming endpoint — streaming is purely visual while the actual code parsing uses the original endpoint for stability.

Visual effects include: emerald glow border around the Code tab, "Generating..." badge with pulsing indicator, code text in emerald tint during streaming, animated cursor (▌) at the end that follows new lines, and auto-scroll to keep the latest code visible.`
      },
      { 
        title: 'Project Persistence', 
        description: 'Cross-device synchronization of System state.', 
        status: 'deployed', 
        date: 'Dec 27',
        technicalDetails: `Projects are stored in Clerk user metadata for persistence. When a project is "hatched" (paid), we store the project ID and Stripe subscription in Clerk, which syncs across all devices where the user is logged in.`
      },
    ]
  },
  {
    title: 'Future Trajectory',
    timeline: 'Q1 2026',
    items: [
      { title: 'Visual Manipulation Interface', description: 'Direct manipulation of generated elements.', status: 'compiling' },
      { title: 'Generation History Log', description: 'Visual timeline of all prompts and versions.', status: 'queued' },
      { title: 'SEO Optimization Module', description: 'Automated meta tag and heading refinement.', status: 'queued' },
      { title: 'Backend Integration', description: 'Built-in form submissions and data handling.', status: 'queued' },
      { title: 'Framework Export', description: 'Download as Next.js or Vite project structure.', status: 'queued' },
    ]
  },
  {
    title: 'Long-term Horizon',
    timeline: 'Q2 2026+',
    items: [
      { title: 'Visual Input Processing', description: 'Screenshot-to-Code conversion capabilities.', status: 'queued' },
      { title: 'Voice Command Interface', description: 'Audio-based generation controls.', status: 'queued' },
      { title: 'Component Library', description: 'Community-driven module marketplace.', status: 'queued' },
      { title: 'Multi-User Synchronization', description: 'Real-time collaborative editing.', status: 'queued' },
    ]
  }
]

const statusConfig = {
  'deployed': { label: 'DEPLOYED', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', icon: CheckCircle2 },
  'compiling': { label: 'COMPILING', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', icon: Cpu },
  'queued': { label: 'QUEUED', bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/20', icon: Clock }
}

function RoadmapCard({ item, sectionIndex, itemIndex }: { item: RoadmapItem; sectionIndex: number; itemIndex: number }) {
  const [expanded, setExpanded] = useState(false)
  const config = statusConfig[item.status]
  const hasDetails = !!item.technicalDetails
  const Icon = config.icon

  return (
    <motion.div
      className={`relative p-4 rounded-sm border ${config.bg} ${config.border} ${hasDetails ? 'cursor-pointer hover:bg-zinc-900/50 transition-colors' : ''}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: sectionIndex * 0.1 + itemIndex * 0.05 }}
      onClick={() => hasDetails && setExpanded(!expanded)}
    >
      {/* Timeline connector */}
      <div className="absolute -left-[41px] top-5 w-px h-full bg-zinc-800 last:hidden"></div>
      <div className={`absolute -left-[45px] top-5 w-2 h-2 rounded-full ${item.status === 'deployed' ? 'bg-emerald-500' : item.status === 'compiling' ? 'bg-amber-500 animate-pulse' : 'bg-zinc-700'}`}></div>
      
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-mono font-bold text-white text-sm tracking-tight">{item.title}</h3>
            {item.date && (
              <span className="text-xs font-mono text-zinc-600">[{item.date}]</span>
            )}
            {hasDetails && (
              <motion.span 
                className="text-zinc-500"
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-3 h-3" />
              </motion.span>
            )}
          </div>
          <p className="text-zinc-400 text-sm font-mono leading-relaxed">{item.description}</p>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-sm text-[10px] font-mono uppercase tracking-wider ${config.bg} ${config.text} border ${config.border}`}>
          <Icon className="w-3 h-3" />
          {config.label}
        </div>
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
            <div className="mt-4 pt-4 border-t border-zinc-800/50">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-wider">System Logs</span>
              </div>
              <div className="text-xs text-zinc-400 font-mono bg-black/50 border border-zinc-800 rounded-sm p-3 whitespace-pre-line leading-relaxed">
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
    <div className="min-h-screen bg-zinc-950 text-white relative selection:bg-emerald-500/30">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      {/* Radial Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-30%,#10b98115,transparent)] pointer-events-none" />

      <main className="relative z-10 px-6 pt-24 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div 
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 text-emerald-400 mb-4 font-mono text-sm">
              <GitCommit className="w-4 h-4" />
              <span>SYSTEM_TRAJECTORY</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight font-mono">
              Evolution <span className="text-emerald-400">Log</span>
            </h1>
            
            <p className="text-lg text-zinc-400 max-w-2xl font-mono leading-relaxed">
              Tracking the development and expansion of the Hatch System capabilities.
              <br />
              <span className="text-emerald-500/50 text-sm">/// UPDATING REAL-TIME</span>
            </p>
          </motion.div>

          {/* Roadmap */}
          <div className="space-y-16 pl-4 border-l border-zinc-800 ml-2 md:ml-0">
            {roadmap.map((section, index) => (
              <div key={index} className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-zinc-950 border border-zinc-700 rounded-full"></div>
                
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-white font-mono mb-1">{section.title}</h2>
                  <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">{section.timeline}</span>
                </div>

                <div className="space-y-4">
                  {section.items.map((item, itemIndex) => (
                    <RoadmapCard 
                      key={itemIndex} 
                      item={item} 
                      sectionIndex={index} 
                      itemIndex={itemIndex} 
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
