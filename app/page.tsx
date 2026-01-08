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
        {/* Clean backdrop - subtle glow */}
        <div className="absolute inset-0 bg-zinc-950" />
        <div 
          className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[1000px] h-[700px]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.18), transparent 65%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
        
        <div className="relative z-10 max-w-5xl mx-auto w-full text-center">

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
              Generate → Deploy → Own
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.15]"
            >
              Ship{' '}
              <motion.span
                animate={{ 
                  boxShadow: [
                    '0 0 20px rgba(16,185,129,0.1)',
                    '0 0 30px rgba(16,185,129,0.2)',
                    '0 0 20px rgba(16,185,129,0.1)',
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="relative inline-block px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 align-baseline"
              >
                <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
                  it live
                </span>
              </motion.span><br />
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-500 bg-clip-text text-transparent"
              >
                in minutes.
              </motion.span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed"
            >
              An AI builder that actually gives you the code — your GitHub, your rules, no lock-in.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-8"
            >
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={triggerTransition}
                className="group relative inline-flex justify-center items-center gap-2 px-5 py-2.5 bg-emerald-500/15 backdrop-blur-2xl border border-emerald-500/40 hover:bg-emerald-500/20 hover:border-emerald-500/50 text-white text-sm font-medium rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent rounded-xl pointer-events-none" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <span className="relative">{isSignedIn ? 'Start Building' : 'Start your project'}</span>
                <ArrowRight className="relative w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </motion.button>
              {isSignedIn ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-lg bg-zinc-800/50 hover:bg-zinc-800/60 border border-zinc-700/50 hover:border-zinc-600 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-all"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center justify-center rounded-lg bg-zinc-800/50 hover:bg-zinc-800/60 border border-zinc-700/50 hover:border-zinc-600 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-all"
                >
                  How it works
                </Link>
              )}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500 pt-12"
            >
              {[
                { label: 'Your GitHub', delay: 0 },
                { label: 'Your deploy', delay: 0.1 },
                { label: 'Your code', delay: 0.2 },
                { label: 'No lock-in', delay: 0.3 },
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

      {/* TRUST BAR */}
      <Section className="px-6 py-16 border-b border-zinc-900 bg-zinc-950/30">
        <div className="max-w-5xl mx-auto">
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-sm text-zinc-500 mb-8"
          >
            Enterprise-grade infrastructure
          </motion.p>
          
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {[
              { label: 'One-click deploy', subtext: 'Live on Vercel instantly' },
              { label: 'Supabase backend', subtext: 'PostgreSQL + realtime' },
              { label: 'Clerk auth', subtext: 'Secure user management' },
              { label: 'Stripe billing', subtext: 'Production payments' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="text-center"
              >
                <div className="text-lg font-semibold text-white">{stat.label}</div>
                <div className="text-xs text-zinc-500">{stat.subtext}</div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-8 mt-10 pt-8 border-t border-zinc-800/50"
          >
            <span className="text-xs text-zinc-600">Powered by</span>
            <div className="flex items-center gap-8">
              {/* Vercel */}
              <div className="flex items-center gap-2 text-zinc-400 hover:text-zinc-300 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 22.525H0l12-21.05 12 21.05z"/>
                </svg>
                <span className="text-sm font-medium">Vercel</span>
              </div>
              {/* Supabase */}
              <div className="flex items-center gap-2 text-zinc-400 hover:text-zinc-300 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.362 9.354H12V.396a.396.396 0 0 0-.716-.233L2.203 12.424l-.401.562a1.04 1.04 0 0 0 .836 1.659H12v8.959a.396.396 0 0 0 .716.233l9.081-12.261.401-.562a1.04 1.04 0 0 0-.836-1.66z"/>
                </svg>
                <span className="text-sm font-medium">Supabase</span>
              </div>
              {/* Clerk */}
              <div className="flex items-center gap-2 text-zinc-400 hover:text-zinc-300 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.812 0h-4.535c-.113 0-.221.045-.301.125l-8.851 8.852a.426.426 0 0 0 0 .602l4.535 4.535a.426.426 0 0 0 .602 0l8.852-8.851a.427.427 0 0 0 .125-.301V.426A.426.426 0 0 0 17.812 0zm-2.132 5.251a1.491 1.491 0 1 1 0-2.981 1.491 1.491 0 0 1 0 2.981zM8.252 14.888a.426.426 0 0 0-.602 0l-2.267 2.267a.426.426 0 0 0 0 .602l4.535 4.535a.426.426 0 0 0 .602 0l2.267-2.267a.426.426 0 0 0 0-.602z"/>
                </svg>
                <span className="text-sm font-medium">Clerk</span>
              </div>
              {/* Stripe */}
              <div className="flex items-center gap-2 text-zinc-400 hover:text-zinc-300 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
                </svg>
                <span className="text-sm font-medium">Stripe</span>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* THE STACK */}
      <Section id="stack" className="px-6 py-16 border-y border-zinc-900 bg-zinc-950/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05),transparent_70%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/30 to-transparent" />
        
        <div className="relative max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-white">
              Real code. Not screenshots.
            </h2>
            <p className="text-base text-zinc-400 max-w-2xl mx-auto">
              Production-ready React + Tailwind. No magic, no mockups.
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
      <Section id="how-it-works" className="px-4 sm:px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-white">From idea to live site in minutes</h2>
            <p className="text-base text-zinc-400">AI-assisted builder with real infrastructure</p>
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
                    className="text-4xl font-bold text-zinc-800 mb-3 group-hover:text-zinc-700 transition-colors"
                  >
                    {item.step}
                  </motion.div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{item.copy}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* INFRASTRUCTURE */}
      <Section className="px-4 sm:px-6 py-16 border-y border-zinc-900 bg-zinc-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/50 to-transparent" />
        
        <div className="relative max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-white">
              Real infrastructure. Not a toy.
            </h2>
            <p className="text-base text-zinc-400 max-w-2xl mx-auto">
              Enterprise-grade deployment, authentication, database, and CDN — all handled.
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

      {/* FINAL CTA */}
      <Section className="px-4 sm:px-6 py-16 sm:py-20 border-t border-zinc-900 relative overflow-hidden">
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
            className="text-2xl sm:text-3xl font-bold mb-3 text-white"
          >
            Build your first section in under 60 seconds
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-base text-zinc-400 mb-8"
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
            className="group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500/15 backdrop-blur-2xl border border-emerald-500/40 hover:bg-emerald-500/20 hover:border-emerald-500/50 text-white text-sm font-medium rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent rounded-xl pointer-events-none" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
              animate={{ x: ['-200%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <span className="relative">Try the Demo</span>
            <ArrowRight className="relative w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </Section>
    </main>
  )
}
