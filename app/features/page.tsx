'use client'
import Link from 'next/link'
import { motion, useReducedMotion as useFramerReducedMotion } from 'framer-motion'
import { useState, useSyncExternalStore } from 'react'

// Client-side check to prevent hydration mismatch
const emptySubscribe = () => () => {}
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

// Custom hook to detect reduced motion preference - uses useSyncExternalStore to prevent hydration mismatch
function useReducedMotion() {
  const prefersReducedMotion = useFramerReducedMotion()
  
  const subscribe = (callback: () => void) => {
    window.addEventListener('resize', callback)
    return () => window.removeEventListener('resize', callback)
  }
  
  const isMobile = useSyncExternalStore(
    subscribe,
    () => window.innerWidth < 768,
    () => false // Server returns false to prevent hydration mismatch
  )
  
  return prefersReducedMotion || isMobile
}

// Animated card that prevents hydration flash
function AnimatedCard({ children, delay = 0, className = '', onClick }: { children: React.ReactNode; delay?: number; className?: string; onClick?: () => void }) {
  return (
    <motion.div 
      className={className}
      onClick={onClick}
      style={{ willChange: 'transform, opacity', backfaceVisibility: 'hidden' }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  )
}

export default function FeaturesPage() {
  const reducedMotion = useReducedMotion()
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null)

  const coreFeatures = [
    {
      id: 'ai-generation',
      icon: '🧠',
      title: 'Three-Model AI Pipeline',
      subtitle: 'Sonnet + Opus + Gemini',
      description: 'Not just one AI doing everything. Sonnet builds your sections. Opus polishes for accessibility and quality. Gemini audits the final result. Each model does what it\'s best at.',
      details: [
        'Claude Sonnet 4 generates the initial code fast',
        'Claude Opus 4 refines for accessibility and polish',
        'Gemini 2.5 Pro audits for best practices',
        'Section-by-section building for better results',
      ],
      gradient: 'from-purple-500 to-indigo-600',
    },
    {
      id: 'hatch-helper',
      icon: '🥚',
      title: 'Meet Hatch',
      subtitle: 'Your Friendly Prompt Helper',
      description: 'Stuck on what to say? Hatch is your friendly egg companion who writes prompts for you. She\'s genuinely excited about your business and knows exactly what to ask for.',
      details: [
        'Powered by Claude Haiku for instant responses',
        'Understands your brand and business context',
        'Cute animated character with personality',
        'Always available with the floating button',
      ],
      gradient: 'from-amber-500 to-orange-600',
      badge: 'NEW',
    },
    {
      id: 'section-building',
      icon: '🏗️',
      title: 'Section-by-Section',
      subtitle: 'Build Piece by Piece',
      description: 'Build your website one section at a time. Header, hero, features, pricing — each piece is crafted and refined before moving to the next. Better context, better results.',
      details: [
        'Templates with predefined section flow',
        'AI suggestions after each section',
        'Skip sections you don\'t need',
        'Progress tracking with interactive menu',
      ],
      gradient: 'from-emerald-500 to-teal-600',
      badge: 'NEW',
    },
    {
      id: 'multi-page',
      icon: '📄',
      title: 'Multi-Page Websites',
      subtitle: 'Build Complete Web Applications',
      description: 'Go beyond single pages. Create full multi-page websites with our intuitive page management system. Each page is independently customizable while maintaining consistent branding.',
      details: [
        'Unlimited pages per project',
        'Easy page switching and management',
        'Consistent navigation across pages',
        'Independent page-level AI generation',
      ],
      gradient: 'from-blue-500 to-cyan-600',
    },
    {
      id: 'brand-customization',
      icon: '🎨',
      title: 'Brand Customization',
      subtitle: 'Your Colors, Your Fonts, Your Identity',
      description: 'Make every site uniquely yours with deep brand customization. Set your primary and accent colors, choose from premium font pairings, and watch as the AI respects your brand guidelines.',
      details: [
        'Custom primary and accent colors',
        'Curated font pairings for perfect typography',
        'Brand colors applied consistently across all pages',
        'Visual brand preview before applying',
      ],
      gradient: 'from-pink-500 to-rose-600',
      badge: 'Hatched',
    },
    {
      id: 'version-history',
      icon: '⏱️',
      title: 'Version History',
      subtitle: 'Never Lose Your Work',
      description: 'Every generation is saved. Browse through your version history, compare changes, and restore any previous version with one click. Experiment freely knowing you can always go back.',
      details: [
        'Automatic version saving on every generation',
        'Visual diff comparison between versions',
        'One-click restore to any previous state',
        'Unlimited version history',
      ],
      gradient: 'from-violet-500 to-purple-600',
      badge: 'Hatched',
    },
  ]

  const deploymentFeatures = [
    {
      icon: '🚀',
      title: 'One-Click Deploy',
      description: 'Deploy your site to our global CDN with a single click. Get a live URL instantly—no server configuration, no DNS hassles.',
    },
    {
      icon: '🌐',
      title: 'Custom Domains',
      description: 'Connect your own domain or register a new one directly through HatchIt. Full DNS management included.',
    },
    {
      icon: '📦',
      title: 'Export to ZIP',
      description: 'Download your complete project as a ZIP file. Take your code anywhere—it\'s 100% yours.',
    },
    {
      icon: '☁️',
      title: 'Cloud Sync',
      description: 'Access your projects from any device. Our cloud sync keeps everything in perfect harmony.',
    },
  ]

  const developerFeatures = [
    {
      icon: '⚛️',
      title: 'Real React Code',
      description: 'Not a drag-and-drop builder. We generate actual React components with hooks, state management, and modern patterns.',
    },
    {
      icon: '🎭',
      title: 'Tailwind CSS',
      description: 'All styling uses Tailwind CSS utility classes. Clean, maintainable, and infinitely customizable.',
    },
    {
      icon: '📱',
      title: 'Mobile-First',
      description: 'Every component is responsive by default. Your sites look perfect on phones, tablets, and desktops.',
    },
    {
      icon: '♿',
      title: 'Accessibility Built-In',
      description: 'Semantic HTML, ARIA labels, keyboard navigation—accessibility isn\'t an afterthought.',
    },
    {
      icon: '🔍',
      title: 'SEO Optimized',
      description: 'Proper heading hierarchy, meta tags, semantic structure—your sites are born ready to rank.',
    },
    {
      icon: '🖼️',
      title: 'Asset Management',
      description: 'Upload and manage images directly in HatchIt. Reference them in your prompts for AI-powered integration.',
    },
  ]

  const aiCapabilities = [
    { label: 'Understand complex requirements', icon: '🧩' },
    { label: 'Generate responsive layouts', icon: '📐' },
    { label: 'Create custom animations', icon: '✨' },
    { label: 'Build interactive components', icon: '🎮' },
    { label: 'Implement form validation', icon: '✅' },
    { label: 'Add dark/light mode support', icon: '🌓' },
    { label: 'Create data visualizations', icon: '📊' },
    { label: 'Build navigation systems', icon: '🧭' },
    { label: 'Generate placeholder content', icon: '📝' },
    { label: 'Optimize for performance', icon: '⚡' },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-500/15 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-[100px]" />
      </div>

      {/* CSS Animations for mobile */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .animate-fade-in-delay-1 { animation: fade-in 0.5s ease-out 0.1s forwards; opacity: 0; }
        .animate-fade-in-delay-2 { animation: fade-in 0.5s ease-out 0.2s forwards; opacity: 0; }
        /* GPU acceleration */
        .gpu-accelerate {
          transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          will-change: transform, opacity;
        }
      `}</style>
      
      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-24 text-center">
        <div className="max-w-3xl mx-auto">
          <div className={reducedMotion ? 'animate-fade-in' : ''}>
            {reducedMotion ? (
              <>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm mb-8">
                  <span className="text-lg">✨</span>
                  <span>The Future of Web Development</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                  Every Feature You Need.
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
                    None You Don&apos;t.
                  </span>
                </h1>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm mb-8">
                  <span className="text-lg">✨</span>
                  <span>The Future of Web Development</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                  Every Feature You Need.
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
                    None You Don&apos;t.
                  </span>
                </h1>
              </motion.div>
            )}
            
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
              HatchIt combines the most advanced AI with intuitive design to create the ultimate website building experience. 
              Describe what you want, and watch it come to life.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/builder"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold text-lg transition-all md:hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-purple-500/25"
              >
                Start Building Free
              </Link>
              <Link
                href="/about"
                className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-semibold text-lg transition-all border border-zinc-700"
              >
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features - Expandable Cards */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Core Features</h2>
            <p className="text-xl text-zinc-400">The powerful capabilities that set HatchIt apart</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {coreFeatures.map((feature, i) => (
              <AnimatedCard
                key={feature.id}
                delay={i * 0.1}
                className={`relative bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                  expandedFeature === feature.id ? 'ring-2 ring-purple-500/50' : 'hover:border-zinc-700'
                }`}
                onClick={() => setExpandedFeature(expandedFeature === feature.id ? null : feature.id)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-5`} />
                
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl`}>
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{feature.title}</h3>
                        <p className="text-sm text-zinc-500">{feature.subtitle}</p>
                      </div>
                    </div>
                    {feature.badge && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-400">
                        <span>🐣</span> {feature.badge}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-zinc-400 mb-4">{feature.description}</p>
                  
                  <motion.div
                    initial={false}
                    animate={{ height: expandedFeature === feature.id ? 'auto' : 0, opacity: expandedFeature === feature.id ? 1 : 0 }}
                    className="overflow-hidden"
                  >
                    <ul className="space-y-2 pt-4 border-t border-zinc-800">
                      {feature.details.map((detail, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-zinc-300">
                          <span className="text-purple-400 mt-1">✓</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800/50">
                    <span className="text-xs text-zinc-600">Click to {expandedFeature === feature.id ? 'collapse' : 'expand'}</span>
                    <motion.span
                      animate={{ rotate: expandedFeature === feature.id ? 180 : 0 }}
                      className="text-zinc-500"
                    >
                      ↓
                    </motion.span>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* AI Capabilities */}
      <section className="py-24 px-6 bg-gradient-to-b from-zinc-900/50 to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">AI That Understands</h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Our AI doesn&apos;t just follow templates. It understands design, code, and your intent to create exactly what you envision.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {aiCapabilities.map((cap, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col items-center gap-2 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
              >
                <span className="text-2xl">{cap.icon}</span>
                <span className="text-xs text-zinc-400 text-center">{cap.label}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 p-8 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-2xl text-center"
          >
            <p className="text-lg text-zinc-300 mb-4">
              &ldquo;Build me a dark-themed SaaS landing page with a gradient hero, animated feature cards, 
              a pricing table with a highlighted popular plan, and a footer with social links.&rdquo;
            </p>
            <p className="text-sm text-zinc-500">
              This single prompt generates a complete, production-ready page in under 30 seconds.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Deployment Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Ship It</h2>
            <p className="text-xl text-zinc-400">From idea to live website in minutes, not months</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {deploymentFeatures.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-colors group"
              >
                <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">{feature.icon}</span>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Features */}
      <section className="py-24 px-6 bg-gradient-to-b from-zinc-900/50 to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Built for Quality</h2>
            <p className="text-xl text-zinc-400">Professional-grade output that developers respect</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {developerFeatures.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-colors"
              >
                <span className="text-3xl">{feature.icon}</span>
                <div>
                  <h3 className="text-lg font-bold mb-1">{feature.title}</h3>
                  <p className="text-sm text-zinc-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why HatchIt?</h2>
            <p className="text-xl text-zinc-400">The best of all worlds</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-x-auto rounded-2xl border border-zinc-800"
          >
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="bg-zinc-900">
                  <th className="text-left p-4 font-medium text-zinc-400">Feature</th>
                  <th className="p-4 font-medium text-zinc-400">Traditional Builders</th>
                  <th className="p-4 font-medium text-zinc-400">Hand Coding</th>
                  <th className="p-4 font-medium bg-purple-900/30 text-purple-300">HatchIt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {[
                  { feature: 'Time to Launch', trad: 'Hours-Days', code: 'Weeks-Months', hatch: 'Minutes' },
                  { feature: 'Code Quality', trad: 'Bloated', code: 'Variable', hatch: 'Clean & Modern' },
                  { feature: 'Customization', trad: 'Limited', code: 'Unlimited', hatch: 'Unlimited' },
                  { feature: 'Learning Curve', trad: 'Medium', code: 'Steep', hatch: 'None' },
                  { feature: 'Cost', trad: '$$-$$$', code: 'Time', hatch: 'Affordable' },
                  { feature: 'Code Ownership', trad: 'Sometimes', code: '✓', hatch: '✓' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-zinc-900/50">
                    <td className="p-4 font-medium">{row.feature}</td>
                    <td className="p-4 text-center text-zinc-500">{row.trad}</td>
                    <td className="p-4 text-center text-zinc-500">{row.code}</td>
                    <td className="p-4 text-center bg-purple-900/10 text-purple-300 font-medium">{row.hatch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          <div className="p-12 bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-amber-900/30 border border-purple-500/20 rounded-3xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Build Something Amazing?
            </h2>
            <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
              Join thousands of creators who&apos;ve discovered the fastest way to bring their ideas to life.
            </p>
            <Link
              href="/builder"
              className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold text-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
            >
              <span>Start Building Free</span>
              <span>→</span>
            </Link>
            <p className="text-sm text-zinc-500 mt-4">No credit card required • 10 free generations</p>
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
            <Link href="/roadmap" className="hover:text-white transition-colors">Roadmap</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </nav>
          <div className="flex items-center gap-4">
            <a href="https://x.com/HatchItD" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://www.linkedin.com/company/hatchit-dev/" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
