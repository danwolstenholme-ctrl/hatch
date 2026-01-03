'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Zap, Terminal, Cpu, Globe, Sparkles } from 'lucide-react'

export default function LaunchAnimation({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 800),
      setTimeout(() => setStage(2), 1600),
      setTimeout(() => setStage(3), 2400),
      setTimeout(() => onComplete(), 3000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  return (
    <motion.div 
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98110_1px,transparent_1px),linear-gradient(to_bottom,#10b98110_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      
      {/* Central Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        
        {/* Icon Morphing */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {stage === 0 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Terminal className="w-16 h-16 text-emerald-400" />
            </motion.div>
          )}
          {stage === 1 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Cpu className="w-16 h-16 text-emerald-400" />
            </motion.div>
          )}
          {stage === 2 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Globe className="w-16 h-16 text-emerald-400" />
            </motion.div>
          )}
          {stage === 3 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Sparkles className="w-16 h-16 text-emerald-400" />
            </motion.div>
          )}
        </div>

        {/* Text Sequence */}
        <div className="h-8 overflow-hidden flex flex-col items-center">
          <motion.div
            animate={{ y: -stage * 32 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="h-8 flex items-center text-emerald-500 font-mono text-xl tracking-widest">INITIALIZING...</div>
            <div className="h-8 flex items-center text-emerald-400 font-mono text-xl tracking-widest">ANALYZING CONTEXT...</div>
            <div className="h-8 flex items-center text-emerald-300 font-mono text-xl tracking-widest">BUILDING ENVIRONMENT...</div>
            <div className="h-8 flex items-center text-white font-mono text-xl tracking-widest font-bold">LAUNCHING ARCHITECT</div>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-1 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-emerald-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
        </div>
      </div>
    </motion.div>
  )
}
