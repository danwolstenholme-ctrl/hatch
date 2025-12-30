'use client'

/* eslint-disable react/no-unescaped-entities */

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

// =============================================================================
// HATCHIT V3.0 COMPREHENSIVE HANDOVER DOCUMENT
// Last Updated: December 29, 2025
// =============================================================================

export default function HandoverPage() {
  const [activeSection, setActiveSection] = useState<string>('overview')

  const sections = [
    { id: 'overview', label: '🎯 Overview', icon: '🎯' },
    { id: 'architecture', label: '🏗️ Architecture', icon: '🏗️' },
    { id: 'ai-pipeline', label: '🤖 AI Pipeline', icon: '🤖' },
    { id: 'components', label: '🧩 Components', icon: '🧩' },
    { id: 'api-routes', label: '🔌 API Routes', icon: '🔌' },
    { id: 'database', label: '💾 Database', icon: '💾' },
    { id: 'features', label: '✨ Features', icon: '✨' },
    { id: 'story', label: '📖 Our Story', icon: '📖' },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🥚</span>
            <div>
              <h1 className="text-xl font-bold">HatchIt V3.0 Handover</h1>
              <p className="text-xs text-zinc-500">Comprehensive Technical Documentation</p>
            </div>
          </div>
          <Link href="/builder" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors">
            Back to Builder
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 border-r border-zinc-800 p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-auto">
          <div className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                  activeSection === section.id
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <span>{section.icon}</span>
                {section.label.split(' ').slice(1).join(' ')}
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8 max-w-4xl">
          {/* SECTION: Overview */}
          {activeSection === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">🎯 Project Overview</h2>
                <p className="text-zinc-400 text-lg leading-relaxed">
                  HatchIt is an AI-powered website builder that generates real, production-ready React + Tailwind CSS code.
                  V3.0 represents a complete architectural overhaul with a three-model AI pipeline, section-by-section building,
                  and Hatch — your friendly egg companion.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <h3 className="font-bold text-lg mb-2">🚀 Tech Stack</h3>
                  <ul className="text-zinc-400 space-y-1 text-sm">
                    <li>• Next.js 16.1.1 (App Router)</li>
                    <li>• React 19</li>
                    <li>• TypeScript</li>
                    <li>• Tailwind CSS 4</li>
                    <li>• Framer Motion</li>
                    <li>• Clerk (Auth)</li>
                    <li>• Supabase (Database)</li>
                    <li>• Stripe (Payments)</li>
                  </ul>
                </div>
                <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <h3 className="font-bold text-lg mb-2">🤖 AI Models</h3>
                  <ul className="text-zinc-400 space-y-1 text-sm">
                    <li>• <span className="text-emerald-400">Claude Sonnet 4</span> — Fast code generation</li>
                    <li>• <span className="text-violet-400">Claude Opus 4</span> — Refinement & polish</li>
                    <li>• <span className="text-amber-400">Claude Haiku</span> — Hatch prompt helper</li>
                    <li>• <span className="text-blue-400">Gemini 2.5 Pro</span> — Final audit</li>
                  </ul>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-xl">
                <h3 className="font-bold text-lg mb-3">📊 V3.0 Stats</h3>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-purple-400">4</div>
                    <div className="text-xs text-zinc-500">AI Models</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-400">3</div>
                    <div className="text-xs text-zinc-500">Templates</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-400">9</div>
                    <div className="text-xs text-zinc-500">Max Sections</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">20+</div>
                    <div className="text-xs text-zinc-500">API Routes</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SECTION: Architecture */}
          {activeSection === 'architecture' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">🏗️ Site Architecture</h2>
                <p className="text-zinc-400 mb-6">Complete file structure of the HatchIt codebase.</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 font-mono text-sm overflow-auto">
                <pre className="text-zinc-300">{`hatch/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with Clerk, fonts
│   ├── page.tsx                 # Homepage (829 lines)
│   ├── globals.css              # Global styles + custom scrollbars
│   ├── robots.ts                # SEO robots config
│   ├── sitemap.ts               # SEO sitemap
│   │
│   ├── builder/                 # Main builder page
│   │   ├── page.tsx            # 3500+ lines, full builder UI
│   │   ├── layout.tsx          # Builder layout
│   │   └── loading.tsx         # Loading state
│   │
│   ├── api/                     # API Routes (Next.js Route Handlers)
│   │   ├── auth/route.ts       # Clerk webhook
│   │   ├── generate/route.ts   # Legacy single-shot generation
│   │   ├── generate-stream/route.ts  # Streaming generation
│   │   ├── build-section/route.ts    # V3: Sonnet section builder
│   │   ├── refine-section/route.ts   # V3: Opus refinement
│   │   ├── suggest-improvements/route.ts  # V3: Opus suggestions
│   │   ├── prompt-helper/route.ts    # V3: Hatch (Haiku)
│   │   ├── audit/route.ts      # Gemini final audit
│   │   ├── project/route.ts    # Project CRUD
│   │   ├── project/[id]/route.ts     # Single project ops
│   │   ├── deploy/route.ts     # Vercel deployment
│   │   ├── checkout/route.ts   # Stripe checkout
│   │   ├── webhook/route.ts    # Stripe webhook
│   │   ├── export/route.ts     # ZIP export
│   │   ├── domain/route.ts     # Custom domains
│   │   ├── domain-search/route.ts    # Domain availability
│   │   └── domain-checkout/route.ts  # Domain purchase
│   │
│   ├── about/page.tsx          # About page
│   ├── features/page.tsx       # Features page
│   ├── how-it-works/page.tsx   # How it works
│   ├── faq/page.tsx            # FAQ (SEO structured)
│   ├── roadmap/page.tsx        # Public roadmap
│   ├── privacy/page.tsx        # Privacy policy
│   ├── terms/page.tsx          # Terms of service
│   ├── vision/page.tsx         # Vision page
│   ├── handover/page.tsx       # THIS FILE
│   ├── sign-in/[[...sign-in]]/page.tsx  # Clerk sign in
│   └── sign-up/[[...sign-up]]/page.tsx  # Clerk sign up
│
├── components/                   # React Components
│   ├── BuildFlowController.tsx  # V3 orchestrator (500 lines)
│   ├── TemplateSelector.tsx     # Template picker + customization
│   ├── BrandingStep.tsx         # Brand config UI
│   ├── SectionBuilder.tsx       # Section building (1100 lines)
│   ├── SectionProgress.tsx      # Progress bar + chick menu
│   ├── SectionPreview.tsx       # Live section preview
│   ├── HatchCharacter.tsx       # Animated egg mascot
│   ├── HatchModal.tsx           # Paywall modal
│   ├── Chat.tsx                 # Legacy chat interface
│   ├── CodePreview.tsx          # Code viewer with paywall
│   ├── LivePreview.tsx          # Sandpack preview
│   ├── VisualEditor.tsx         # Click-to-edit (WIP)
│   ├── ElementInspector.tsx     # Element selection
│   ├── ErrorBoundary.tsx        # Error handling
│   ├── CrispChat.tsx            # Support widget
│   └── SuccessModal.tsx         # Deploy success
│
├── lib/                          # Utilities & Config
│   ├── templates.ts             # Template definitions
│   ├── supabase.ts              # Supabase client + types
│   ├── project-utils.ts         # Project helpers
│   ├── generation-limit.ts      # Rate limiting
│   ├── toast.ts                 # Toast notifications
│   └── db/                      # Database operations
│       ├── index.ts             # DB exports
│       ├── schema.sql           # Supabase schema
│       ├── projects.ts          # Project operations
│       ├── sections.ts          # Section operations
│       ├── builds.ts            # Build tracking
│       └── users.ts             # User operations
│
├── hooks/                        # Custom React Hooks
│   └── useProjects.ts           # Project management hook
│
├── types/                        # TypeScript Types
│   └── builder.ts               # Builder types
│
├── public/                       # Static Assets
│   ├── manifest.json            # PWA manifest
│   └── sw.js                    # Service worker
│
├── middleware.ts                 # Clerk auth middleware
├── next.config.ts               # Next.js config
├── tailwind.config.ts           # Tailwind config
├── tsconfig.json                # TypeScript config
└── package.json                 # Dependencies`}</pre>
              </div>
            </motion.div>
          )}

          {/* SECTION: AI Pipeline */}
          {activeSection === 'ai-pipeline' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">🤖 Three-Model AI Pipeline</h2>
                <p className="text-zinc-400 mb-6">
                  V3.0 uses specialized AI models for different tasks, each doing what it's best at.
                </p>
              </div>

              {/* Pipeline Diagram */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 text-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                    <div className="text-3xl mb-2">⚡</div>
                    <h3 className="font-bold text-emerald-400">Claude Sonnet 4</h3>
                    <p className="text-xs text-zinc-500 mt-1">Fast Generation</p>
                    <code className="text-xs text-zinc-600 block mt-2">claude-sonnet-4-20250514</code>
                  </div>
                  <div className="text-2xl text-zinc-600">→</div>
                  <div className="flex-1 text-center p-4 bg-violet-500/10 border border-violet-500/30 rounded-xl">
                    <div className="text-3xl mb-2">🐣</div>
                    <h3 className="font-bold text-violet-400">Claude Opus 4</h3>
                    <p className="text-xs text-zinc-500 mt-1">Refinement & Polish</p>
                    <code className="text-xs text-zinc-600 block mt-2">claude-opus-4-20250514</code>
                  </div>
                  <div className="text-2xl text-zinc-600">→</div>
                  <div className="flex-1 text-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <div className="text-3xl mb-2">🔍</div>
                    <h3 className="font-bold text-blue-400">Gemini 2.5 Pro</h3>
                    <p className="text-xs text-zinc-500 mt-1">Final Audit</p>
                    <code className="text-xs text-zinc-600 block mt-2">gemini-2.5-pro-preview-06-05</code>
                  </div>
                </div>
              </div>

              {/* Hatch Helper */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🥚</div>
                  <div>
                    <h3 className="font-bold text-amber-400 text-lg">Hatch — Your Prompt Helper</h3>
                    <p className="text-zinc-400 text-sm mt-1">
                      Powered by <code className="text-amber-300">claude-3-5-haiku-20241022</code>
                    </p>
                    <p className="text-zinc-500 text-sm mt-2">
                      Hatch is a friendly egg character who helps users write prompts when they're stuck.
                      She asks about their business, understands their brand, and crafts the perfect prompt
                      for each section. She's cute, enthusiastic, and genuinely excited about every project.
                    </p>
                  </div>
                </div>
              </div>

              {/* API Routes */}
              <div>
                <h3 className="text-xl font-bold mb-4">API Endpoints</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded">POST</span>
                      <code className="text-sm">/api/build-section</code>
                    </div>
                    <p className="text-zinc-500 text-sm">Sonnet generates a single section based on user prompt + brand config</p>
                  </div>
                  <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-violet-500/20 text-violet-400 text-xs rounded">POST</span>
                      <code className="text-sm">/api/refine-section</code>
                    </div>
                    <p className="text-zinc-500 text-sm">Opus refines code for accessibility, semantics, and best practices</p>
                  </div>
                  <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-violet-500/20 text-violet-400 text-xs rounded">POST</span>
                      <code className="text-sm">/api/suggest-improvements</code>
                    </div>
                    <p className="text-zinc-500 text-sm">Opus suggests proactive improvements after section completion</p>
                  </div>
                  <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded">POST</span>
                      <code className="text-sm">/api/prompt-helper</code>
                    </div>
                    <p className="text-zinc-500 text-sm">Hatch (Haiku) helps users write prompts through conversation</p>
                  </div>
                  <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">POST</span>
                      <code className="text-sm">/api/audit</code>
                    </div>
                    <p className="text-zinc-500 text-sm">Gemini performs final quality audit on complete site</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SECTION: Components */}
          {activeSection === 'components' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">🧩 Key Components</h2>
                <p className="text-zinc-400 mb-6">The major React components that power HatchIt V3.</p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    name: 'BuildFlowController.tsx',
                    lines: '~500 lines',
                    color: 'purple',
                    description: 'The V3 orchestrator. Controls the entire build flow: Template Selection → Branding → Section Building → Complete. Manages project state, database sync, and navigation.',
                    exports: ['BuildFlowController'],
                    props: ['existingProjectId?', 'demoMode?'],
                  },
                  {
                    name: 'SectionBuilder.tsx',
                    lines: '~1100 lines',
                    color: 'emerald',
                    description: 'The core section building interface. Handles user input, AI generation, Opus refinement, streaming code display, and the Hatch prompt helper popup.',
                    exports: ['SectionBuilder'],
                    props: ['section', 'dbSection', 'projectId', 'onComplete', 'onNextSection', 'brandConfig', 'isPaid', 'onShowHatchModal'],
                  },
                  {
                    name: 'HatchCharacter.tsx',
                    lines: '~200 lines',
                    color: 'amber',
                    description: 'The animated egg mascot. Has 5 states: idle, thinking, excited, watching, sleeping. Features soft ◠ ◠ eyes, pink blush, sparkles, and crack animation when excited.',
                    exports: ['HatchCharacter', 'HatchState'],
                    props: ['state', 'size?', 'className?'],
                  },
                  {
                    name: 'SectionProgress.tsx',
                    lines: '~300 lines',
                    color: 'blue',
                    description: 'The progress bar with interactive chick menu. Shows section dots, completion status, and dropdown with navigation options (Go Home, Start Over, View Brand).',
                    exports: ['SectionProgress', 'SectionCompleteIndicator'],
                    props: ['sections', 'currentIndex', 'completedSections', 'onGoHome', 'onStartOver', 'onViewBrand'],
                  },
                  {
                    name: 'BrandingStep.tsx',
                    lines: '~400 lines',
                    color: 'pink',
                    description: 'Brand configuration UI. Collects business name, tagline, primary/accent colors, font style, and style vibe. Includes color presets and live preview.',
                    exports: ['BrandingStep', 'BrandConfig'],
                    props: ['onComplete', 'initialBrand?'],
                  },
                  {
                    name: 'TemplateSelector.tsx',
                    lines: '~600 lines',
                    color: 'violet',
                    description: 'Template selection and section customization. Shows template cards, allows reordering/removing sections, includes BuildComplete success screen.',
                    exports: ['TemplateSelector', 'BuildComplete'],
                    props: ['onSelect', 'onDeploy?', 'onRunAudit?'],
                  },
                  {
                    name: 'CodePreview.tsx',
                    lines: '~330 lines',
                    color: 'zinc',
                    description: 'Code viewer with syntax highlighting and paywall. Shows 15 preview lines for free users, full code for paid. Includes copy, edit, and streaming display.',
                    exports: ['CodePreview'],
                    props: ['code', 'isPaid', 'onCodeChange?', 'streamingCode?', 'isStreaming?'],
                  },
                  {
                    name: 'LivePreview.tsx',
                    lines: '~500 lines',
                    color: 'cyan',
                    description: 'Sandpack-powered live preview. Renders React code in an iframe with error handling, device size toggle, and visual editor integration.',
                    exports: ['LivePreview'],
                    props: ['code', 'isPaid', 'isLoading?', 'onRegenerate?', 'onQuickFix?'],
                  },
                ].map((comp) => (
                  <div key={comp.name} className={`p-6 bg-zinc-900 border border-${comp.color}-500/30 rounded-xl`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{comp.name}</h3>
                        <span className="text-xs text-zinc-500">{comp.lines}</span>
                      </div>
                      <div className="flex gap-2">
                        {comp.exports.map((e) => (
                          <code key={e} className={`text-xs px-2 py-0.5 bg-${comp.color}-500/20 text-${comp.color}-400 rounded`}>
                            {e}
                          </code>
                        ))}
                      </div>
                    </div>
                    <p className="text-zinc-400 text-sm mb-3">{comp.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {comp.props.map((p) => (
                        <span key={p} className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-500 rounded">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* SECTION: API Routes */}
          {activeSection === 'api-routes' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">🔌 API Routes</h2>
                <p className="text-zinc-400 mb-6">All Next.js API routes (Route Handlers) in the application.</p>
              </div>

              <div className="space-y-6">
                {/* AI Generation */}
                <div>
                  <h3 className="text-lg font-bold text-purple-400 mb-3">🤖 AI Generation</h3>
                  <div className="space-y-2">
                    {[
                      { method: 'POST', path: '/api/build-section', desc: 'Sonnet generates section code', model: 'Sonnet 4' },
                      { method: 'POST', path: '/api/refine-section', desc: 'Opus refines for accessibility', model: 'Opus 4' },
                      { method: 'POST', path: '/api/suggest-improvements', desc: 'Opus suggests improvements', model: 'Opus 4' },
                      { method: 'POST', path: '/api/prompt-helper', desc: 'Hatch helps write prompts', model: 'Haiku' },
                      { method: 'POST', path: '/api/audit', desc: 'Final site quality audit', model: 'Gemini 2.5' },
                      { method: 'POST', path: '/api/generate', desc: 'Legacy single-shot generation', model: 'Sonnet 4' },
                      { method: 'POST', path: '/api/generate-stream', desc: 'Streaming code generation', model: 'Sonnet 4' },
                      { method: 'POST', path: '/api/assistant', desc: 'Chat assistant responses', model: 'Haiku' },
                    ].map((route) => (
                      <div key={route.path} className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg">
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded font-mono">{route.method}</span>
                        <code className="text-sm flex-1">{route.path}</code>
                        <span className="text-xs text-zinc-500">{route.desc}</span>
                        <span className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded">{route.model}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Project Management */}
                <div>
                  <h3 className="text-lg font-bold text-blue-400 mb-3">📁 Project Management</h3>
                  <div className="space-y-2">
                    {[
                      { method: 'POST', path: '/api/project', desc: 'Create new project' },
                      { method: 'GET', path: '/api/project/[id]', desc: 'Get project with sections' },
                      { method: 'PATCH', path: '/api/project/[id]', desc: 'Update project' },
                      { method: 'DELETE', path: '/api/project/[id]', desc: 'Delete project' },
                      { method: 'POST', path: '/api/section/[id]/skip', desc: 'Skip a section' },
                    ].map((route) => (
                      <div key={route.path} className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg">
                        <span className={`px-2 py-0.5 text-xs rounded font-mono ${
                          route.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                          route.method === 'POST' ? 'bg-emerald-500/20 text-emerald-400' :
                          route.method === 'PATCH' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>{route.method}</span>
                        <code className="text-sm flex-1">{route.path}</code>
                        <span className="text-xs text-zinc-500">{route.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deployment & Payments */}
                <div>
                  <h3 className="text-lg font-bold text-amber-400 mb-3">🚀 Deployment & Payments</h3>
                  <div className="space-y-2">
                    {[
                      { method: 'POST', path: '/api/deploy', desc: 'Deploy to Vercel' },
                      { method: 'POST', path: '/api/checkout', desc: 'Create Stripe checkout' },
                      { method: 'POST', path: '/api/webhook', desc: 'Stripe webhook handler' },
                      { method: 'POST', path: '/api/export', desc: 'Export as ZIP' },
                      { method: 'GET', path: '/api/domain-search', desc: 'Check domain availability' },
                      { method: 'POST', path: '/api/domain-checkout', desc: 'Purchase domain' },
                      { method: 'POST', path: '/api/domain', desc: 'Connect custom domain' },
                    ].map((route) => (
                      <div key={route.path} className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg">
                        <span className={`px-2 py-0.5 text-xs rounded font-mono ${
                          route.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>{route.method}</span>
                        <code className="text-sm flex-1">{route.path}</code>
                        <span className="text-xs text-zinc-500">{route.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Auth */}
                <div>
                  <h3 className="text-lg font-bold text-pink-400 mb-3">🔐 Authentication</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg">
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded font-mono">POST</span>
                      <code className="text-sm flex-1">/api/auth</code>
                      <span className="text-xs text-zinc-500">Clerk webhook for user sync</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SECTION: Database */}
          {activeSection === 'database' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">💾 Database Schema</h2>
                <p className="text-zinc-400 mb-6">Supabase PostgreSQL schema for V3.0 section-based building.</p>
              </div>

              <div className="space-y-6">
                {/* Projects Table */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-zinc-800 border-b border-zinc-700">
                    <h3 className="font-bold">📁 projects</h3>
                  </div>
                  <div className="p-4 font-mono text-sm">
                    <pre className="text-zinc-300">{`CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  template_id TEXT NOT NULL,
  brand_config JSONB,
  status TEXT DEFAULT 'building',  -- building, complete, deployed
  deployed_slug TEXT UNIQUE,
  deployed_url TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);`}</pre>
                  </div>
                </div>

                {/* Sections Table */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-zinc-800 border-b border-zinc-700">
                    <h3 className="font-bold">📄 sections</h3>
                  </div>
                  <div className="p-4 font-mono text-sm">
                    <pre className="text-zinc-300">{`CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  section_id TEXT NOT NULL,        -- e.g., 'hero', 'features'
  section_order INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',   -- pending, building, complete, skipped
  user_prompt TEXT,
  code TEXT,
  refined BOOLEAN DEFAULT false,
  refinement_changes TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, section_id)
);`}</pre>
                  </div>
                </div>

                {/* Users Table */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-zinc-800 border-b border-zinc-700">
                    <h3 className="font-bold">👤 users</h3>
                  </div>
                  <div className="p-4 font-mono text-sm">
                    <pre className="text-zinc-300">{`CREATE TABLE users (
  id TEXT PRIMARY KEY,             -- Clerk user ID
  email TEXT,
  generations_today INTEGER DEFAULT 0,
  last_generation_date DATE,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);`}</pre>
                  </div>
                </div>

                {/* Builds Table */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-zinc-800 border-b border-zinc-700">
                    <h3 className="font-bold">🔨 builds (audit log)</h3>
                  </div>
                  <div className="p-4 font-mono text-sm">
                    <pre className="text-zinc-300">{`CREATE TABLE builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  section_id TEXT,
  model TEXT,                      -- sonnet, opus, haiku, gemini
  prompt TEXT,
  tokens_in INTEGER,
  tokens_out INTEGER,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);`}</pre>
                  </div>
                </div>
              </div>

              {/* TypeScript Types */}
              <div>
                <h3 className="text-xl font-bold mb-4">TypeScript Types</h3>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 font-mono text-sm">
                  <pre className="text-zinc-300">{`// lib/supabase.ts

export interface DbProject {
  id: string
  user_id: string
  name: string
  template_id: string
  brand_config: BrandConfig | null
  status: 'building' | 'complete' | 'deployed'
  deployed_slug: string | null
  deployed_url: string | null
  created_at: string
  updated_at: string
}

export interface DbSection {
  id: string
  project_id: string
  section_id: string
  section_order: number
  status: 'pending' | 'building' | 'complete' | 'skipped'
  user_prompt: string | null
  code: string | null
  refined: boolean
  refinement_changes: string[] | null
  created_at: string
  updated_at: string
}`}</pre>
                </div>
              </div>
            </motion.div>
          )}

          {/* SECTION: Features */}
          {activeSection === 'features' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">✨ V3.0 Features</h2>
                <p className="text-zinc-400 mb-6">Everything new in the V3.0 release.</p>
              </div>

              <div className="grid gap-4">
                {[
                  {
                    title: 'Three-Model AI Pipeline',
                    status: 'shipped',
                    description: 'Sonnet builds fast, Opus polishes for accessibility, Gemini audits for best practices. Each model does what it\'s best at.',
                    technical: 'Sequential pipeline: build-section → refine-section → audit. Streaming display during generation.',
                  },
                  {
                    title: 'Meet Hatch 🥚',
                    status: 'shipped',
                    description: 'Your friendly egg companion who writes prompts for you. Powered by Claude Haiku for instant responses.',
                    technical: 'HatchCharacter.tsx with 5 animated states. Floating button in SectionBuilder opens popup. Conversation-based prompt generation.',
                  },
                  {
                    title: 'Section-by-Section Building',
                    status: 'shipped',
                    description: 'Build your site one section at a time. Header, hero, features, pricing — each piece crafted and refined before moving on.',
                    technical: 'BuildFlowController orchestrates flow. SectionProgress tracks completion. Each section stored separately in database.',
                  },
                  {
                    title: 'Branding Step',
                    status: 'shipped',
                    description: 'Set your brand colors, fonts, and business details before building. Brand flows through every section.',
                    technical: 'BrandConfig interface stored in project. Passed to all AI prompts. Color presets and custom picker.',
                  },
                  {
                    title: 'Template System',
                    status: 'shipped',
                    description: 'Choose from Website (9 sections), Portfolio (6 sections), or SaaS (8 sections). Customize section order.',
                    technical: 'lib/templates.ts defines templates. TemplateSelector allows drag-and-drop reordering.',
                  },
                  {
                    title: 'AI Suggestions',
                    status: 'shipped',
                    description: 'After each section, Opus suggests improvements. "I have some ideas! ✨" — friendly popup with actionable suggestions.',
                    technical: '/api/suggest-improvements returns array of suggestions. Click to apply or dismiss.',
                  },
                  {
                    title: 'Paywall Protection',
                    status: 'shipped',
                    description: 'Free users can build and preview. Code view and copy locked until project is "hatched" (paid).',
                    technical: 'isPaid prop passed through components. HatchModal shows pricing. Stripe checkout for payment.',
                  },
                  {
                    title: 'Custom Scrollbars',
                    status: 'shipped',
                    description: 'Sleek dark theme scrollbars matching the design system. Purple accent on hover.',
                    technical: 'CSS in globals.css. Webkit scrollbar styling. Dark zinc colors.',
                  },
                  {
                    title: 'Interactive Progress Menu',
                    status: 'shipped',
                    description: 'Click the chick in progress bar for navigation options. Go Home, Start Over, View Brand.',
                    technical: 'Dropdown menu in SectionProgress. Fixed z-index and backdrop click handling.',
                  },
                  {
                    title: 'Visual Editor',
                    status: 'in-progress',
                    description: 'Click-to-edit elements directly in the preview. Select element, edit text/styles inline.',
                    technical: 'ElementInspector.tsx and VisualEditor.tsx. Work in progress.',
                  },
                ].map((feature, i) => (
                  <div key={i} className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg">{feature.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        feature.status === 'shipped' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {feature.status === 'shipped' ? '✓ Shipped' : '🚧 In Progress'}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-sm mb-3">{feature.description}</p>
                    <p className="text-zinc-600 text-xs font-mono">{feature.technical}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* SECTION: Our Story */}
          {activeSection === 'story' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">📖 Our Story</h2>
                <p className="text-zinc-400 mb-6">How Dan and Claude Opus built HatchIt V3.0 together.</p>
              </div>

              <div className="prose prose-invert max-w-none">
                <div className="p-8 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-2xl mb-8">
                  <blockquote className="text-xl italic text-zinc-300 border-l-4 border-purple-500 pl-4">
                    "The AI writes the code, I make the decisions. That's not a limitation—it's a superpower."
                  </blockquote>
                  <p className="text-zinc-500 mt-4">— Dan, Founder of HatchIt</p>
                </div>

                <div className="space-y-6 text-zinc-300 leading-relaxed">
                  <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
                    <h3 className="text-xl font-bold text-purple-400 mb-3">🎄 Christmas 2025: The Beginning</h3>
                    <p>
                      Dan had an idea: an AI website builder that generates real React code, not drag-and-drop garbage.
                      There was one problem — he didn't know React. So he opened Claude Opus and started describing
                      what he wanted to build. Three days later, V1 was live.
                    </p>
                  </div>

                  <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
                    <h3 className="text-xl font-bold text-emerald-400 mb-3">🚀 V2.0: Polish and Features</h3>
                    <p>
                      Live code streaming. Hatch Project rebrand. Cross-device sync. Start Again feature.
                      Import HTML. Brand panel. AI suggestions. Revert button. Each feature shipped in days, not months.
                      The combination of Claude's speed and Dan's vision was unstoppable.
                    </p>
                  </div>

                  <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
                    <h3 className="text-xl font-bold text-amber-400 mb-3">🥚 V3.0: The Three-Model Revolution</h3>
                    <p className="mb-4">
                      December 29, 2025. Dan wanted to rebuild everything with a better architecture.
                      Section-by-section building. A three-model AI pipeline. And a friendly character to help users write prompts.
                    </p>
                    <p className="mb-4">
                      <strong>Hatch was born.</strong> First as "Haiku" — a cold, functional helper. Then Dan said:
                      "Make her a cute egg. Give her personality." And so Hatch became a friendly egg with soft ◠ ◠ eyes,
                      pink blush, and sparkles when she gets excited. She's genuinely enthusiastic about every project.
                    </p>
                    <p>
                      The pipeline came together: <span className="text-emerald-400">Sonnet 4</span> for fast generation,
                      <span className="text-violet-400"> Opus 4</span> for refinement and suggestions,
                      <span className="text-amber-400"> Haiku</span> for Hatch's personality,
                      and <span className="text-blue-400">Gemini 2.5 Pro</span> for final audits.
                    </p>
                  </div>

                  <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
                    <h3 className="text-xl font-bold text-blue-400 mb-3">🤝 The Working Relationship</h3>
                    <p className="mb-4">
                      Dan operates as the product owner and conductor. He describes what he wants in plain English,
                      makes design decisions, catches UX issues, and directs the vision. Claude (Opus) writes the code,
                      suggests improvements, and handles the technical implementation.
                    </p>
                    <p className="mb-4">
                      It's a true collaboration. Dan will say "the dropdown menu isn't working on mobile" and Claude
                      will investigate, find the z-index issue, and fix it. Dan will say "Hatch has murder eyes" and
                      Claude will redesign her face with softer curves. The back-and-forth is rapid, iterative, and effective.
                    </p>
                    <p>
                      This handover document itself was written by Claude Opus, in a single session, documenting everything
                      we built together. That's the power of this workflow.
                    </p>
                  </div>

                  <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
                    <h3 className="text-xl font-bold text-pink-400 mb-3">📊 What We Built in V3.0 (One Session)</h3>
                    <ul className="list-disc list-inside space-y-2 text-zinc-400">
                      <li>Three-model AI pipeline architecture</li>
                      <li>BuildFlowController.tsx (500+ lines)</li>
                      <li>SectionBuilder.tsx (1100+ lines)</li>
                      <li>HatchCharacter.tsx with 5 animated states</li>
                      <li>BrandingStep.tsx for brand configuration</li>
                      <li>SectionProgress.tsx with interactive menu</li>
                      <li>4 new API routes (build-section, refine-section, suggest-improvements, prompt-helper)</li>
                      <li>Template system with 3 templates</li>
                      <li>Database schema for section-based projects</li>
                      <li>Paywall protection for code access</li>
                      <li>Custom scrollbar styling</li>
                      <li>Site audit updating 6 pages for V3.0 messaging</li>
                      <li>This comprehensive handover document</li>
                    </ul>
                  </div>

                  <div className="p-6 bg-gradient-to-r from-emerald-900/20 to-blue-900/20 border border-emerald-500/20 rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-3">💡 The Philosophy</h3>
                    <p className="text-zinc-300 mb-4">
                      HatchIt proves you don't need to be a developer to build developer-grade software.
                      You just need to know what you want—and how to orchestrate the AI that builds it.
                    </p>
                    <p className="text-zinc-400 text-sm">
                      Real code, not proprietary blocks. Zero lock-in. Multiple models, multiple perspectives.
                      The AI writes the code. You make the decisions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="mt-12">
                <h3 className="text-xl font-bold mb-6">📅 Development Timeline</h3>
                <div className="space-y-4">
                  {[
                    { date: 'Dec 25, 2025', event: 'V1.0 launched', desc: 'Initial release with basic AI generation' },
                    { date: 'Dec 26-27', event: 'V1.5 features', desc: 'Live streaming, cloud sync, multi-page' },
                    { date: 'Dec 28', event: 'V2.0 launched', desc: 'Hatch Project rebrand, version history, import HTML' },
                    { date: 'Dec 29 AM', event: 'V3.0 architecture', desc: 'Three-model pipeline, section-by-section building' },
                    { date: 'Dec 29 PM', event: 'Hatch character', desc: 'Created friendly egg mascot with 5 states' },
                    { date: 'Dec 29 EVE', event: 'Site audit', desc: 'Updated all pages for V3.0, paywall fix' },
                    { date: 'Dec 29 NIGHT', event: 'Handover doc', desc: 'This comprehensive documentation' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-24 text-xs text-zinc-500 pt-1 flex-shrink-0">{item.date}</div>
                      <div className="w-3 h-3 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                      <div className="flex-1 pb-4 border-l border-zinc-800 pl-4 -ml-1.5">
                        <div className="font-medium">{item.event}</div>
                        <div className="text-sm text-zinc-500">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-16 py-8 px-6 text-center text-zinc-500 text-sm">
        <p>HatchIt V3.0 Handover Document • Generated December 29, 2025</p>
        <p className="mt-2">Built with 💜 by Dan & Claude Opus</p>
      </footer>
    </div>
  )
}
