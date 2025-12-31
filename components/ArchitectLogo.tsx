'use client'

import { motion } from 'framer-motion'

interface ArchitectLogoProps {
  className?: string
  animated?: boolean
}

export default function ArchitectLogo({ className = "w-8 h-8", animated = true }: ArchitectLogoProps) {
  return (
    <div className={`${className} relative flex items-center justify-center`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* The Structure - Hexagon/Cube */}
        <motion.path
          d="M50 10 L 85 30 L 85 70 L 50 90 L 15 70 L 15 30 Z"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-emerald-500"
          initial={animated ? { pathLength: 0, opacity: 0 } : undefined}
          animate={animated ? { pathLength: 1, opacity: 1 } : undefined}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        
        {/* Internal Geometry - The Blueprint */}
        <motion.path
          d="M50 50 L 50 90 M 50 50 L 85 30 M 50 50 L 15 30"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-emerald-300"
          initial={animated ? { pathLength: 0, opacity: 0 } : undefined}
          animate={animated ? { pathLength: 1, opacity: 1 } : undefined}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        />

        {/* The Eye - Central Node */}
        <motion.circle
          cx="50"
          cy="50"
          r="5"
          className="fill-white"
          initial={animated ? { scale: 0 } : undefined}
          animate={animated ? { scale: [0, 1.2, 1] } : undefined}
          transition={{ duration: 0.5, delay: 1.2 }}
        />
      </svg>
      
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full -z-10" />
    </div>
  )
}
