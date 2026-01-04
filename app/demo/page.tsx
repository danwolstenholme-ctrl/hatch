'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Command, Sparkles } from 'lucide-react'
import Image from 'next/image'
import VoidTransition from '@/components/singularity/VoidTransition'

// =============================================================================
// DEMO PAGE - The Portal
// Cinematic entrance to HatchIt. Make them feel like they're entering something special.
// =============================================================================

// Animated code rain characters
const CODE_CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン</>{}[];=>'

// Floating code snippet that fades in/out
function FloatingCode({ delay, x, y }: { delay: number; x: string; y: string }) {
  const snippets = [
    '<Hero gradient="emerald" />',
    'const [magic] = useState(true)',
    'className="flex items-center"',
    'export default function App()',
    '<motion.div animate={{}}/>',
    'tailwind.config.ts',
    'npm run build',
    'git push origin main',
  ]
  const snippet = snippets[Math.floor(delay * 10) % snippets.length]
  
  return (
    <motion.div
      className="absolute font-mono text-[10px] text-emerald-500/20 whitespace-nowrap select-none pointer-events-none"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: [0, 0.3, 0.3, 0],
        y: [20, 0, 0, -20],
      }}
      transition={{
        duration: 8,
        delay: delay,
        repeat: Infinity,
        repeatDelay: 4,
      }}
    >
      {snippet}
    </motion.div>
  )
}

// Matrix-style falling character
function MatrixDrop({ column, speed }: { column: number; speed: number }) {
  const [mounted, setMounted] = useState(false)
  const [chars, setChars] = useState<string[]>([])
  const [delay, setDelay] = useState(0)
  
  useEffect(() => {
    setChars(Array.from({ length: 20 }, () => 
      CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
    ))
    setDelay(Math.random() * 5)
    setMounted(true)
  }, [])
  
  if (!mounted) return null
  
  return (
    <motion.div
      className="absolute top-0 flex flex-col items-center font-mono text-[10px] select-none pointer-events-none"
      style={{ left: `${column}%` }}
      initial={{ y: '-100%' }}
      animate={{ y: '100vh' }}
      transition={{
        duration: speed,
        repeat: Infinity,
        ease: 'linear',
        delay: delay,
      }}
    >
      {chars.map((char, i) => (
        <span 
          key={i} 
          className="leading-tight"
          style={{ 
            color: i === 0 ? '#10b981' : `rgba(16, 185, 129, ${0.4 - (i * 0.02)})`,
            textShadow: i === 0 ? '0 0 10px #10b981' : 'none',
          }}
        >
          {char}
        </span>
      ))}
    </motion.div>
  )
}

// Glowing orb that follows mouse subtly
function GlowOrb() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])
  
  return (
    <motion.div
      className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
      style={{
        background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }}
      animate={{
        left: `calc(${mousePos.x}% - 250px)`,
        top: `calc(${mousePos.y}% - 250px)`,
      }}
      transition={{ type: 'spring', damping: 30, stiffness: 100 }}
    />
  )
}

export default function DemoPage() {
  const router = useRouter()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [hasEntered, setHasEntered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  // Entrance animation trigger
  useEffect(() => {
    const timer = setTimeout(() => setHasEntered(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleInitialize = () => {
    setIsTransitioning(true)
  }

  const handleTransitionComplete = () => {
    const params = new URLSearchParams()
    params.set('mode', 'guest')
    if (prompt.trim()) {
      params.set('prompt', prompt.trim())
    }
    router.push(`/builder?${params.toString()}`)
  }

  // Quick prompt suggestions - showcase specific, impressive capabilities
  const suggestions = [
    'Hero with animated gradient background and floating particles',
    'Pricing table with 3 tiers and a "Most Popular" badge',
    'Testimonial carousel with star ratings and avatars',
  ]

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Void Transition */}
      <AnimatePresence>
        {isTransitioning && (
          <VoidTransition 
            onComplete={handleTransitionComplete} 
            prompt={prompt.trim() || undefined}
          />
        )}
      </AnimatePresence>

      {/* === CINEMATIC BACKGROUND === */}
      
      {/* Mouse-following glow */}
      <GlowOrb />
      
      {/* Matrix rain - sparse, elegant */}
      <div className="absolute inset-0 overflow-hidden opacity-40">
        {[5, 15, 25, 35, 45, 55, 65, 75, 85, 95].map((col, i) => (
          <MatrixDrop key={col} column={col} speed={8 + (i % 3) * 2} />
        ))}
      </div>
      
      {/* Floating code snippets */}
      <div className="absolute inset-0 overflow-hidden">
        <FloatingCode delay={0} x="10%" y="20%" />
        <FloatingCode delay={2} x="80%" y="15%" />
        <FloatingCode delay={4} x="15%" y="70%" />
        <FloatingCode delay={6} x="75%" y="75%" />
        <FloatingCode delay={1} x="60%" y="30%" />
        <FloatingCode delay={3} x="25%" y="50%" />
      </div>
      
      {/* Perspective grid floor */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: hasEntered ? 1 : 0 }}
        transition={{ duration: 2, delay: 0.5 }}
      >
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(16,185,129,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16,185,129,1) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            transform: 'perspective(400px) rotateX(60deg) translateY(-30%)',
            transformOrigin: 'center top',
          }}
        />
      </motion.div>
      
      {/* Central glow pulse */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 60%)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_40%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />

      {/* === MAIN CONTENT === */}
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="portal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ duration: 0.5 }}
            className="relative z-10 w-full max-w-lg"
          >
            {/* Headline */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                <span className="bg-gradient-to-r from-white via-white to-emerald-400 bg-clip-text text-transparent">
                  Describe it.
                </span>
                <br />
                <motion.span 
                  className="text-emerald-400"
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Watch it build.
                </motion.span>
              </h1>
              <p className="text-zinc-400 text-lg max-w-md mx-auto">
                Type what you want. Get production-ready React + Tailwind in seconds.
              </p>
            </motion.div>

            {/* Input Card */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {/* Glow behind card when focused */}
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-emerald-400/10 to-emerald-500/20 rounded-2xl blur-xl"
                animate={{ opacity: isFocused ? 0.8 : 0.3 }}
                transition={{ duration: 0.3 }}
              />
              
              <div className={`relative bg-zinc-900/80 backdrop-blur-2xl rounded-2xl border transition-colors duration-300 ${
                isFocused ? 'border-emerald-500/50' : 'border-zinc-800'
              }`}>
                {/* Prompt Input */}
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mb-3">
                    <Command className="w-3 h-3" />
                    <span>What do you want to build?</span>
                  </div>
                  
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="A landing page for my startup with hero, features, and pricing..."
                    className="w-full min-h-[100px] bg-transparent text-white text-lg placeholder-zinc-600 focus:outline-none resize-none leading-relaxed"
                    autoFocus
                  />
                  
                  {/* Quick suggestions */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {suggestions.map((s, i) => (
                      <motion.button
                        key={s}
                        onClick={() => setPrompt(s)}
                        className="px-3 py-1.5 text-xs text-zinc-400 bg-zinc-800/50 hover:bg-zinc-800 hover:text-zinc-300 rounded-full transition-colors border border-zinc-700/50"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + i * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {s}
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                {/* Divider with glow */}
                <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
                
                {/* Action Row */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    <span>Try it free — no account needed</span>
                  </div>
                  
                  <motion.button
                    onClick={handleInitialize}
                    className="group relative px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl transition-all flex items-center gap-2 overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Button shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.5 }}
                    />
                    <span className="relative">Build</span>
                    <ArrowRight className="relative w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Tech Stack Pills */}
            <motion.div
              className="flex justify-center gap-3 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {['React', 'Tailwind', 'TypeScript'].map((tech, i) => (
                <motion.span
                  key={tech}
                  className="px-3 py-1 text-xs text-zinc-500 border border-zinc-800/50 rounded-full bg-zinc-900/30"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + i * 0.1 }}
                >
                  {tech}
                </motion.span>
              ))}
            </motion.div>

            {/* Reddit Link */}
            <motion.a
              href="https://reddit.com/r/hatchit"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 mt-8 text-xs text-zinc-600 hover:text-orange-400 transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
              </svg>
              <span>Join r/hatchit for early access</span>
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
