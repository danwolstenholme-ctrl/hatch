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
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* The Architect Glow (Violet) */}
          <filter id="glow-architect" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          {/* Glassy Face Gradients (Violet/Indigo) */}
          <linearGradient id="face-left-arch" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4c1d95" stopOpacity="0.4"/> {/* Violet 900 */}
            <stop offset="100%" stopColor="#2e1065" stopOpacity="0.8"/> {/* Violet 950 */}
          </linearGradient>
          
          <linearGradient id="face-right-arch" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5b21b6" stopOpacity="0.4"/> {/* Violet 800 */}
            <stop offset="100%" stopColor="#2e1065" stopOpacity="0.8"/> {/* Violet 950 */}
          </linearGradient>

          {/* The "Energy" Gradient for the Stroke (Violet/Purple) */}
          <linearGradient id="stroke-arch" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" /> {/* Violet 400 */}
            <stop offset="100%" stopColor="#7c3aed" /> {/* Violet 600 */}
          </linearGradient>
        </defs>

        <g transform="translate(256, 270) scale(1.15)">
          
          {/* THE CORE: The Architect's Mind */}
          <motion.ellipse 
            cx="0" cy="75" rx="22" ry="28" 
            fill="white" 
            filter="url(#glow-architect)"
            initial={animated ? { opacity: 0.8, ry: 28 } : undefined}
            animate={animated ? { opacity: [0.8, 1, 0.8], ry: [28, 30, 28] } : undefined}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* THE SHELL: The Cube Base */}
          {/* Left Face */}
          <path d="M0 0 L-86.6 50 L-86.6 150 L0 200 L0 0" fill="url(#face-left-arch)" stroke="url(#stroke-arch)" strokeWidth="6" strokeLinejoin="round" />
          {/* Right Face */}
          <path d="M0 0 L86.6 50 L86.6 150 L0 200 L0 0" fill="url(#face-right-arch)" stroke="url(#stroke-arch)" strokeWidth="6" strokeLinejoin="round" />
          {/* Center Seam */}
          <line x1="0" y1="0" x2="0" y2="200" stroke="url(#stroke-arch)" strokeWidth="6" />

          {/* THE HATCH: The Lifting Lid */}
          <motion.g transform="translate(0, -55)">
            <motion.path 
              d="M0 0 L86.6 -50 L0 -100 L-86.6 -50 Z" 
              fill="#8b5cf6" 
              fillOpacity="0.15" 
              stroke="url(#stroke-arch)" 
              strokeWidth="6" 
              strokeLinejoin="round"
              initial={animated ? { y: 0 } : undefined}
              animate={animated ? { y: [0, -8, 0] } : undefined}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.g>
          
          {/* THE CONNECTION: The Spark */}
          <motion.line 
            x1="0" y1="0" x2="0" y2="-55" 
            stroke="#a78bfa" 
            strokeWidth="3" 
            strokeDasharray="4 4" 
            opacity="0.8"
            initial={animated ? { strokeDashoffset: 8 } : undefined}
            animate={animated ? { strokeDashoffset: 0 } : undefined}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />

        </g>
      </svg>
    </div>
  )
}
