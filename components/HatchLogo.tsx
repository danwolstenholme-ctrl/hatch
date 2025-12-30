'use client'

import { motion } from 'framer-motion'

interface HatchLogoProps {
  className?: string
  animated?: boolean
}

export default function HatchLogo({ className = "w-8 h-8", animated = true }: HatchLogoProps) {
  return (
    <div className={`${className} relative flex items-center justify-center`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Outer Shell - System Node */}
        <motion.path
          d="M50 5 C 25 5, 10 35, 10 60 C 10 85, 25 95, 50 95 C 75 95, 90 85, 90 60 C 90 35, 75 5, 50 5 Z"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          className="text-emerald-500"
          initial={animated ? { pathLength: 0, opacity: 0 } : undefined}
          animate={animated ? { pathLength: 1, opacity: 1 } : undefined}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        
        {/* Inner Circuitry / Cracks */}
        <motion.path
          d="M50 20 L 50 40 L 35 55 L 65 55 L 50 70 L 50 80"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-emerald-300"
          initial={animated ? { pathLength: 0, opacity: 0 } : undefined}
          animate={animated ? { pathLength: 1, opacity: 1 } : undefined}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        />

        {/* The Core - Pulse */}
        <motion.circle
          cx="50"
          cy="50"
          r="6"
          className="fill-white"
          initial={animated ? { scale: 0 } : undefined}
          animate={animated ? { scale: [1, 1.2, 1] } : undefined}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
      
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full -z-10" />
    </div>
  )
}
