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
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* The Singularity Glow */}
          <filter id="glow-definitive" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          {/* Glassy Face Gradients */}
          <linearGradient id="face-left-def" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#064e3b" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#022c22" stopOpacity="0.8"/>
          </linearGradient>
          
          <linearGradient id="face-right-def" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#065f46" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#022c22" stopOpacity="0.8"/>
          </linearGradient>

          {/* The "Energy" Gradient for the Stroke */}
          <linearGradient id="stroke-def" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" /> {/* Emerald 400 */}
            <stop offset="100%" stopColor="#059669" /> {/* Emerald 600 */}
          </linearGradient>
        </defs>

        <g transform="translate(256, 270) scale(1.15)">
          
          {/* THE CORE: The Hatching Singularity */}
          <motion.ellipse 
            cx="0" cy="75" rx="22" ry="28" 
            fill="white" 
            filter="url(#glow-definitive)"
            initial={animated ? { opacity: 0.8, ry: 28 } : undefined}
            animate={animated ? { opacity: [0.8, 1, 0.8], ry: [28, 30, 28] } : undefined}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* THE SHELL: The Cube Base */}
          {/* Left Face */}
          <path d="M0 0 L-86.6 50 L-86.6 150 L0 200 L0 0" fill="url(#face-left-def)" stroke="url(#stroke-def)" strokeWidth="6" strokeLinejoin="round" />
          {/* Right Face */}
          <path d="M0 0 L86.6 50 L86.6 150 L0 200 L0 0" fill="url(#face-right-def)" stroke="url(#stroke-def)" strokeWidth="6" strokeLinejoin="round" />
          {/* Center Seam */}
          <line x1="0" y1="0" x2="0" y2="200" stroke="url(#stroke-def)" strokeWidth="6" />

          {/* THE HATCH: The Lifting Lid */}
          <motion.g transform="translate(0, -55)">
            <motion.path 
              d="M0 0 L86.6 -50 L0 -100 L-86.6 -50 Z" 
              fill="#10b981" 
              fillOpacity="0.15" 
              stroke="url(#stroke-def)" 
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
            stroke="#34d399" 
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
