'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { motion, useAnimation } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
}

// Reusable animated section component
function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInUp}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <motion.nav 
        className="relative z-50 px-8 py-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black">
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">Hatch</span>
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">It</span>
          </h1>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-zinc-400 hover:text-white transition-colors hidden sm:block">Features</a>
            <a href="#pricing" className="text-zinc-400 hover:text-white transition-colors hidden sm:block">Pricing</a>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-zinc-400 hover:text-white transition-colors text-sm cursor-pointer hidden sm:block">Sign In</button>
              </SignInButton>
              <Link href="/builder" className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-semibold text-sm transition-all">
                Start Building
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/builder" className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-semibold text-sm transition-all">
                Start Building
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative px-8 pt-12 pb-20 md:pt-20 md:pb-32">
        <motion.div 
          className="max-w-6xl mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div className="mb-8 md:mb-12" variants={fadeInUp} transition={{ duration: 0.6 }}>
            <motion.div 
              className="inline-flex items-center gap-2 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-full px-4 py-2 md:px-6 md:py-3 mb-6"
              variants={scaleIn}
              transition={{ duration: 0.5 }}
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-zinc-400">Build for free. Pay when you go live.</span>
            </motion.div>
            
            {/* Hero logo - hidden on mobile since it's in nav */}
            <motion.h1 
              className="hidden md:block text-6xl md:text-8xl font-black mb-6 leading-tight"
              variants={fadeInUp}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                Hatch
              </span>
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                It
              </span>
              <span className="text-zinc-600">.</span>
            </motion.h1>
            
            <motion.div 
              className="text-4xl md:text-5xl font-bold mb-6 md:mb-8"
              variants={fadeInUp}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-zinc-300 to-zinc-500 bg-clip-text text-transparent">Describe. </span>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Build. Ship.</span>
            </motion.div>
            
            <motion.p 
              className="text-xl md:text-2xl text-zinc-400 max-w-4xl mx-auto leading-relaxed mb-3"
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              AI-powered website builder that outputs real code.
            </motion.p>
            <motion.p 
              className="text-lg md:text-xl text-zinc-500 max-w-3xl mx-auto mb-8 md:mb-12"
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Describe what you want. Get production-ready React + Tailwind. Deploy in one click.
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-4 mb-10 md:mb-16"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Link href="/builder" className="group px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-purple-500/20">
              Start Building — Free
            </Link>
          </motion.div>

          {/* Social Proof */}
          <motion.div 
            className="flex flex-wrap justify-center items-center gap-4 md:gap-8 text-zinc-500 text-sm"
            variants={fadeIn}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="flex items-center gap-2">
              <span className="text-green-400">●</span>
              <span>No coding required</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⚡</span>
              <span>Powered by Claude</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>🔧</span>
              <span>Auto-fixes errors</span>
            </div>
          </motion.div>

          {/* Product Preview */}
          <motion.div 
            className="mt-16 max-w-5xl mx-auto"
            variants={fadeInUp}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <div className="relative rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl shadow-purple-500/10">
              {/* Browser chrome */}
              <div className="bg-zinc-900 px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                  <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                  <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-500 max-w-xs mx-auto">
                    hatchit.dev/builder
                  </div>
                </div>
              </div>
              {/* Interactive CTA */}
              <div className="bg-zinc-950 aspect-video flex flex-col items-center justify-center p-4 sm:p-8">
                <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🐣</div>
                <p className="text-lg sm:text-xl text-zinc-400 mb-4 sm:mb-6">See it in action</p>
                <Link href="/builder" className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl text-white font-semibold transition-all text-sm sm:text-base">
                  Try the Builder →
                </Link>
              </div>
            </div>
            <p className="text-center text-zinc-600 text-sm mt-4">Type a prompt → Watch it build → Ship in one click</p>
          </motion.div>
        </motion.div>
      </section>

      {/* What Makes Us Different */}
      <section className="relative px-8 py-24 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-zinc-200 to-zinc-400 bg-clip-text text-transparent">Not another AI toy.</span>
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              Other tools give you throwaway code. HatchIt.dev gives you a platform to build real products.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            <AnimatedSection delay={0.1}>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 hover:border-zinc-700 transition-all h-full">
                <div className="text-red-400 text-sm font-semibold mb-4">❌ Others</div>
                <h3 className="text-xl font-bold text-zinc-300 mb-3">Generate & Forget</h3>
                <p className="text-zinc-500">Copy code, paste somewhere else, lose context, start over every time.</p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl p-8 ring-1 ring-purple-500/20 h-full">
                <div className="text-green-400 text-sm font-semibold mb-4">✓ HatchIt.dev</div>
                <h3 className="text-xl font-bold text-white mb-3">Build & Iterate</h3>
                <p className="text-zinc-400">Keep context. Undo mistakes. Auto-fix errors. Ship when ready.</p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.3}>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 hover:border-zinc-700 transition-all h-full">
                <div className="text-red-400 text-sm font-semibold mb-4">❌ Others</div>
                <h3 className="text-xl font-bold text-zinc-300 mb-3">Locked-in Code</h3>
                <p className="text-zinc-500">Proprietary formats, hashed filenames, code you can't maintain.</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative px-8 py-32">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 pb-1 bg-gradient-to-r from-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Everything you need to ship
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              From idea to live website, all in one place.
            </p>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {[
              {
                icon: "⚡",
                title: "AI Generation",
                description: "Describe what you want, get production React + Tailwind in seconds.",
                gradient: "from-yellow-500 to-orange-500"
              },
              {
                icon: "👁️",
                title: "Live Preview",
                description: "See your site render in real-time. Test responsive breakpoints instantly.",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                icon: "🔧",
                title: "Auto-Fix",
                description: "Broken code? We detect and fix it automatically. No more white screens.",
                gradient: "from-green-500 to-emerald-500"
              },
              {
                icon: "�",
                title: "One-Click Deploy",
                description: "Go live instantly. Custom domains. SSL included. No server setup.",
                gradient: "from-amber-500 to-orange-500"
              }
            ].map((feature, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <motion.div 
                  className="group relative h-full"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl blur from-zinc-600 to-zinc-800"></div>
                  <div className="relative bg-zinc-900/90 backdrop-blur-sm p-8 rounded-2xl border border-zinc-800 group-hover:border-zinc-700 transition-all duration-300 h-full">
                    <motion.div 
                      className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 text-2xl`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <h4 className="text-xl font-bold text-zinc-100 mb-4">{feature.title}</h4>
                    <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative px-8 py-32 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              From idea to live site in 60 seconds
            </h2>
            <p className="text-zinc-500 text-lg">No kidding. We timed it.</p>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              { step: "01", title: "Describe", desc: "\"Build a landing page for my coffee shop with a menu and contact form.\"", example: "~10 seconds to type", color: "from-blue-500 to-cyan-500" },
              { step: "02", title: "Watch it build", desc: "AI generates production React + Tailwind. See it render in real-time.", example: "~30 seconds", color: "from-purple-500 to-pink-500" },
              { step: "03", title: "Ship it", desc: "Click deploy. Get a live URL. Share with the world.", example: "~20 seconds", color: "from-orange-500 to-red-500" }
            ].map((item, index) => (
              <AnimatedSection key={index} delay={index * 0.15} className="text-center">
                <div className="relative mb-8">
                  <motion.div 
                    className={`w-24 h-24 mx-auto bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-2xl font-black text-white mb-4 shadow-2xl`}
                    whileHover={{ scale: 1.1, rotate: 3 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    {item.step}
                  </motion.div>
                  {index < 2 && (
                    <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-zinc-700 to-transparent"></div>
                  )}
                </div>
                <h4 className="text-2xl font-bold text-zinc-200 mb-2">{item.title}</h4>
                <p className="text-zinc-400 leading-relaxed max-w-xs mx-auto mb-2">{item.desc}</p>
                <p className="text-zinc-600 text-sm">{item.example}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative px-8 py-24">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 pb-1 bg-gradient-to-r from-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Simple pricing
            </h2>
            <p className="text-xl text-zinc-400">
              Build for free. Pay when you go live.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Project */}
            <AnimatedSection delay={0.1}>
              <motion.div 
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 h-full"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                    <span className="text-2xl opacity-50">🐣</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Free Project</h3>
                    <p className="text-zinc-500 text-sm">Build and experiment</p>
                  </div>
                </div>
                <div className="text-4xl font-black text-white mb-2">$0</div>
                <p className="text-zinc-500 text-sm mb-6">forever free to build</p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Unlimited projects",
                    "10 generations/day",
                    "Live preview",
                    "Undo/rollback",
                    "Auto-fix errors"
                  ].map((feature, i) => (
                    <motion.li 
                      key={i} 
                      className="flex items-center gap-3 text-zinc-300"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      viewport={{ once: true }}
                    >
                      <span className="text-zinc-500">✓</span>
                      {feature}
                    </motion.li>
                  ))}
                </ul>
                <Link href="/builder" className="block w-full py-3 text-center bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg font-semibold transition-all">
                  Start Building
                </Link>
              </motion.div>
            </AnimatedSection>

            {/* Hatched Project */}
            <AnimatedSection delay={0.2}>
              <motion.div 
                className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-amber-500/30 rounded-2xl p-8 ring-1 ring-amber-500/20 relative h-full"
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                  50% OFF EARLY BIRD
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 via-yellow-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/20 to-amber-400/0 animate-pulse" />
                    <span className="text-2xl relative z-10">🐣</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Go Hatched</h3>
                    <p className="text-amber-400/80 text-sm">Ship to the world</p>
                  </div>
                </div>
                <div className="mb-2">
                  <span className="text-lg text-zinc-500 line-through">$49</span>
                  <span className="text-4xl font-black text-white ml-2">$24</span>
                  <span className="text-lg text-zinc-500 font-normal"> first month</span>
                </div>
                <p className="text-zinc-400 text-sm mb-1">then <span className="text-white font-semibold">$19/month</span> to stay live</p>
                <p className="text-zinc-600 text-xs mb-6">or $190/year (2 months free)</p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Deploy to live URL",
                    "Custom domain",
                    "Buy domains in-app",
                    "Download clean code",
                    "Unlimited edits & updates",
                    "Version history",
                    "SSL included",
                    "Cancel anytime — export & self-host"
                  ].map((feature, i) => (
                    <motion.li 
                      key={i} 
                      className="flex items-center gap-3 text-zinc-300"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      viewport={{ once: true }}
                    >
                      <span className="text-amber-400">✓</span>
                      {feature}
                    </motion.li>
                  ))}
                </ul>
                <Link href="/builder" className="block w-full py-3 text-center bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black rounded-lg font-semibold transition-all">
                  Start Building
                </Link>
              </motion.div>
            </AnimatedSection>
          </div>

          <div className="mt-12 text-center">
            <p className="text-zinc-500 text-sm">
              Have 10+ projects? <a href="mailto:support@hatchit.dev" className="text-amber-400 hover:text-amber-300">Contact us</a> for agency pricing.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-8 py-32 bg-zinc-900/30">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection>
            <div className="relative">
              <motion.div 
                className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-lg opacity-30"
                animate={{ 
                  opacity: [0.2, 0.4, 0.2],
                  scale: [1, 1.02, 1]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <div className="relative bg-zinc-900/90 backdrop-blur-sm p-16 rounded-3xl border border-zinc-800 text-center">
                <motion.h2 
                  className="text-4xl md:text-5xl font-bold mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <span className="bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                    Ready to build something?
                  </span>
                </motion.h2>
                <motion.p 
                  className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-3xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  Stop thinking. Start building. Ship today.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <Link href="/builder" className="inline-block px-12 py-5 bg-gradient-to-r from-white to-zinc-100 text-zinc-900 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl">
                    Start Building — Free
                  </Link>
                </motion.div>
                <motion.div 
                  className="mt-8 flex flex-wrap justify-center items-center gap-8 text-zinc-500"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-2">
                    <span>✓</span>
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✓</span>
                    <span>10 free builds per day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400">🐣</span>
                    <span>$24 to launch, $19/mo to stay live</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <motion.footer 
        className="relative px-8 py-12 border-t border-zinc-800"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black">
                <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">Hatch</span>
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">It</span>
              </h1>
            </div>
            <div className="flex items-center gap-8 text-zinc-500 text-sm">
              <Link href="/builder" className="hover:text-white transition-colors">Builder</Link>
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            </div>
            <div className="flex flex-col items-center md:items-end gap-1">
              <p className="text-zinc-600 text-sm">© 2025 HatchIt.dev. Built with HatchIt.dev.</p>
              <p className="text-zinc-700 text-xs">V1.0 • Launched December 2025</p>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}