'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Terminal, Layers, Shield, Zap, Code2, Globe, ArrowRight, CheckCircle2, Layout, Smartphone } from 'lucide-react'
import HomepageWelcome from '@/components/HomepageWelcome'
import SingularityTransition from '@/components/singularity/SingularityTransition'

// Section wrapper - staggered fade-in with depth
function Section({ children, className = '', id = '', delay = 0 }: { children: React.ReactNode; className?: string; id?: string; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  )
}

export default function Home() {
  const { isSignedIn } = useUser()
  const router = useRouter()
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleTransitionComplete = () => {
    router.push(isSignedIn ? '/builder' : '/demo')
  }

  const triggerTransition = () => {
    setIsTransitioning(true)
  }
  
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-200">
      <AnimatePresence>
        {isTransitioning && <SingularityTransition onComplete={handleTransitionComplete} />}
      </AnimatePresence>
      
      <HomepageWelcome onStart={triggerTransition} />

      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center px-4 sm:px-6 pt-32 pb-24 border-b border-zinc-900 overflow-hidden">
        {/* Animated gradient backdrop */}
        <motion.div 
          animate={{ 
            background: [
              'radial-gradient(ellipse at 30% 20%, rgba(16,185,129,0.15), transparent 50%)',
              'radial-gradient(ellipse at 70% 30%, rgba(16,185,129,0.12), transparent 50%)',
              'radial-gradient(ellipse at 40% 40%, rgba(16,185,129,0.18), transparent 50%)',
              'radial-gradient(ellipse at 30% 20%, rgba(16,185,129,0.15), transparent 50%)',
            ]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0"
        />
        <motion.div 
          animate={{ 
            background: [
              'radial-gradient(ellipse at 70% 80%, rgba(16,185,129,0.08), transparent 60%)',
              'radial-gradient(ellipse at 30% 70%, rgba(16,185,129,0.1), transparent 60%)',
              'radial-gradient(ellipse at 60% 60%, rgba(16,185,129,0.06), transparent 60%)',
              'radial-gradient(ellipse at 70% 80%, rgba(16,185,129,0.08), transparent 60%)',
            ]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/30 via-transparent to-zinc-950/80" />
        
        {/* Grid overlay for depth */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />
        
          <div className="relative z-10 max-w-5xl mx-auto w-full text-center">
            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -60 - (i * 5), 0],
                    x: [0, Math.sin(i) * 20, 0],
                    opacity: [0.1, 0.4, 0.1],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{
                    duration: 8 + i * 1.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.6
                  }}
                  className="absolute w-1 h-1 rounded-full bg-emerald-400"
                  style={{
                    left: `${10 + (i * 6)}%`,
                    top: `${20 + (i % 4) * 18}%`,
                    filter: 'blur(0.5px)'
                  }}
                />
              ))}
            </div>

            <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-full text-xs text-zinc-400 backdrop-blur-sm"
            >
              <motion.span 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 bg-emerald-400 rounded-full" 
              />
              Production-ready React components
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[1.1]"
            >
              Text to{' '}
              <motion.span
                animate={{ 
                  boxShadow: [
                    '0 0 30px rgba(16,185,129,0.2)',
                    '0 0 50px rgba(16,185,129,0.35)',
                    '0 0 30px rgba(16,185,129,0.2)',
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="relative inline-flex items-center px-4 py-1.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10"
              >
                <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent tracking-tight">
                  React
                </span>
              </motion.span>.<br />
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-500 bg-clip-text text-transparent"
              >
                Instant preview.
              </motion.span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-lg sm:text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto leading-relaxed px-2"
            >
              Describe your vision in plain English. Watch production-ready React + Tailwind materialize in real-time.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 px-2"
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={triggerTransition}
                className="group relative w-full sm:w-auto inline-flex justify-center items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 bg-emerald-500/15 backdrop-blur-2xl border border-emerald-500/40 hover:bg-emerald-500/20 hover:border-emerald-500/50 text-white text-center rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent rounded-xl pointer-events-none" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <span className="relative">Try the Demo</span>
                <ArrowRight className="relative w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <Link
                href="/how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-zinc-800/50 backdrop-blur-xl hover:bg-zinc-800/60 border border-zinc-700/50 hover:border-zinc-600 px-6 sm:px-8 py-3.5 sm:py-4 font-medium text-zinc-200 transition-all"
              >
                See how it works
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-zinc-500 pt-6 sm:pt-8 px-2"
            >
              {[
                { label: 'Live preview', delay: 0, icon: '\u26a1' },
                { label: 'Point-and-click editing', delay: 0.1, icon: '\ud83c\udfaf' },
                { label: 'Real React + Tailwind', delay: 0.2, icon: '\u269b\ufe0f' },
                { label: 'Deploy or download', delay: 0.3 },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + item.delay, duration: 0.4 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {item.label}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
          </div>
      </section>

      {/* THE STACK */}
      <Section id="stack" className="px-6 py-24 border-y border-zinc-900 bg-zinc-950/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05),transparent_70%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/30 to-transparent" />
        
        <div className="relative max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
              Real code. Not screenshots.
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Every component is production-ready React + Tailwind. No magic, no mockups.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'React 19', icon: Code2 },
              { name: 'Tailwind 4', icon: Layout },
              { name: 'TypeScript', icon: Terminal },
              { name: 'Framer Motion', icon: Layers },
              { name: 'Responsive', icon: Smartphone },
              { name: 'Accessible', icon: CheckCircle2 },
              { name: 'SEO Ready', icon: Globe },
              { name: 'Own the code', icon: Shield },
            ].map((tech, i) => (
              <motion.div 
                key={tech.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="flex items-center gap-3 px-4 py-4 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80 rounded-xl transition-all group"
              >
                <motion.div whileHover={{ rotate: 360, transition: { duration: 0.6 } }}>
                  <tech.icon className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                </motion.div>
                <span className="text-sm font-medium text-zinc-300">{tech.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* HOW IT WORKS */}
      <Section id="how-it-works" className="px-4 sm:px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">From idea to live site in minutes</h2>
            <p className="text-xl text-zinc-400">AI-powered builder. Real infrastructure. Zero DevOps.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                step: '01', 
                title: 'Describe & Preview', 
                copy: 'Type in plain English. Watch production React + Tailwind render live. Refine with natural language until pixel-perfect.',
                delay: 0
              },
              { 
                step: '02', 
                title: 'Edit & Customize', 
                copy: 'Point-and-click editing. Live preview updates instantly. We handle responsive design, accessibility, and performance.',
                delay: 0.1
              },
              { 
                step: '03', 
                title: 'Deploy Securely', 
                copy: 'One-click deploy to production infrastructure. Authentication, database, and CDN included. Custom domains supported.',
                delay: 0.2
              },
            ].map((item) => (
              <motion.div 
                key={item.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: item.delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -12, transition: { duration: 0.3 } }}
                className="relative p-8 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-2xl group hover:border-zinc-700 hover:shadow-2xl hover:shadow-black/20 transition-all cursor-pointer"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
                />
                
                <div className="relative">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: item.delay + 0.2, duration: 0.5 }}
                    className="text-6xl font-bold text-zinc-800 mb-4 group-hover:text-zinc-700 transition-colors"
                  >
                    {item.step}
                  </motion.div>
                  <h3 className="text-2xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">{item.copy}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* INFRASTRUCTURE */}
      <Section className="px-4 sm:px-6 py-24 border-y border-zinc-900 bg-zinc-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/50 to-transparent" />
        
        <div className="relative max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
              Real infrastructure. Not a toy.
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              Enterprise-grade deployment pipeline, secure authentication, managed database, and global CDN. We handle the DevOps so you don't have to.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[
              { 
                title: 'Production Deployment',
                features: ['Global CDN with edge caching', 'Automatic SSL certificates', 'Custom domain support', 'Zero-downtime deploys'],
                delay: 0
              },
              { 
                title: 'Authentication & Security',
                features: ['Secure user accounts', 'OAuth integrations', 'Session management', 'Role-based access control'],
                delay: 0.1
              },
              { 
                title: 'Database & Storage',
                features: ['PostgreSQL database', 'Real-time subscriptions', 'File storage & CDN', 'Automatic backups'],
                delay: 0.2
              },
              { 
                title: 'Integrations & Extensions',
                features: ['Form handling (Formspree)', 'Analytics setup (GA, Plausible)', 'Email capture (ConvertKit)', 'Payment processing (Stripe)'],
                delay: 0.3
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: item.delay, duration: 0.5 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="p-6 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 hover:border-zinc-700 rounded-xl group hover:bg-zinc-900/80 transition-all"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <motion.div 
                    className="w-2 h-2 bg-emerald-400 rounded-full"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  {item.title}
                </h3>
                <ul className="space-y-2">
                  {item.features.map((feature, i) => (
                    <motion.li
                      key={feature}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: item.delay + 0.1 + (i * 0.05), duration: 0.3 }}
                      className="text-sm text-zinc-400 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      {feature}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-center"
          >
            <p className="text-sm text-zinc-500 max-w-2xl mx-auto">
              Built on production infrastructure: Vercel for deployment, Supabase for database, Clerk for auth. 
              You get the power of enterprise tools with zero configuration.
            </p>
          </motion.div>
        </div>
      </Section>

      {/* PRICING */}
      <Section id="pricing" className="px-4 sm:px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">Simple, honest pricing</h2>
            <p className="text-xl text-zinc-400">Start free. Scale when ready.</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {[
              {
                tier: 'Architect',
                price: '$19',
                accent: 'emerald',
                featured: false,
                delay: 0,
                perks: [
                  'Unlimited generations',
                  'Live preview',
                  'Deploy to hatchit.dev',
                  '3 projects',
                  'Download source code',
                ],
              },
              {
                tier: 'Visionary',
                price: '$49',
                accent: 'violet',
                featured: true,
                delay: 0.1,
                perks: [
                  'Everything in Architect',
                  'Unlimited projects',
                  'Custom domain',
                  'Remove branding',
                  'Priority support',
                ],
              },
              {
                tier: 'Singularity',
                price: '$199',
                accent: 'amber',
                featured: false,
                delay: 0.2,
                perks: [
                  'Everything in Visionary',
                  'Direct founder access',
                  'Early model access',
                  'API access (soon)',
                  'Custom integrations',
                ],
              },
            ].map((plan) => (
              <motion.div
                key={plan.tier}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: plan.delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
                className={`relative p-8 rounded-2xl bg-zinc-900/70 backdrop-blur-2xl border ${
                  plan.featured 
                    ? 'border-violet-500/30 shadow-xl shadow-violet-500/5' 
                    : 'border-zinc-800'
                } flex flex-col group`}
              >
                {plan.featured && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: plan.delay + 0.2 }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2"
                  >
                    <span className="px-4 py-1.5 bg-violet-500 text-white text-xs font-semibold rounded-full shadow-lg">
                      Most Popular
                    </span>
                  </motion.div>
                )}
                
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-b from-${plan.accent}-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl`}
                />
                
                <div className="relative mb-6">
                  <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 text-${plan.accent}-400`}>
                    {plan.tier}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                    <span className="text-zinc-500">/month</span>
                  </div>
                </div>

                <ul className="space-y-4 flex-1 mb-8">
                  {plan.perks.map((perk, i) => (
                    <li 
                      key={perk}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2 className={`w-5 h-5 text-${plan.accent}-400 mt-0.5 flex-shrink-0`} />
                      <span className="text-zinc-300">{perk}</span>
                    </li>
                  ))}
                </ul>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/sign-up"
                    className={`block w-full py-3.5 px-6 rounded-xl font-semibold text-center transition-all relative overflow-hidden ${
                      plan.featured
                        ? 'bg-violet-500/15 backdrop-blur-2xl border border-violet-500/40 hover:bg-violet-500/20 hover:border-violet-500/50 text-white shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                        : 'bg-zinc-800/50 backdrop-blur-xl hover:bg-zinc-800/60 text-zinc-200 border border-zinc-700/50'
                    }`}
                  >
                    {plan.featured && <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent rounded-xl pointer-events-none" />}
                    Get Started
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <p className="text-sm text-zinc-500">All plans include a free tier to start. Cancel anytime.</p>
          </motion.div>
        </div>
      </Section>

      {/* FINAL CTA */}
      <Section className="px-4 sm:px-6 py-20 sm:py-32 border-t border-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08),transparent_70%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
        
        <div className="relative max-w-4xl mx-auto text-center px-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-zinc-900/50 border border-zinc-800 rounded-full text-xs text-zinc-400 backdrop-blur-sm mb-6 sm:mb-8"
          >
            <motion.span 
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-emerald-400 rounded-full" 
            />
            No credit card required
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-white"
          >
            Build your first section<br className="hidden sm:block" /><span className="sm:hidden"> </span>in under 60 seconds
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg sm:text-xl text-zinc-400 mb-8 sm:mb-10"
          >
            No signup. No setup. Just describe what you want.
          </motion.p>
          
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            whileTap={{ scale: 0.95 }}
            onClick={triggerTransition}
            className="group relative inline-flex items-center justify-center gap-2 sm:gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-emerald-500/15 backdrop-blur-2xl border border-emerald-500/40 hover:bg-emerald-500/20 hover:border-emerald-500/50 text-white text-base sm:text-lg text-center rounded-xl font-semibold transition-all shadow-[0_0_25px_rgba(16,185,129,0.2)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent rounded-xl pointer-events-none" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
              animate={{ x: ['-200%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <span className="relative">Try the Demo</span>
            <ArrowRight className="relative w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </Section>
    </main>
  )
}
