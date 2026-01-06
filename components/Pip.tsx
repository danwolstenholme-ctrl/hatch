'use client'

import { motion } from 'framer-motion'

interface PipProps {
  size?: number
  animate?: boolean
  className?: string
  float?: boolean
  glow?: boolean
}

// The HatchIt mascot - "an idea given form"
export default function Pip({ 
  size = 60, 
  animate = true, 
  className = '',
  float = false,
  glow = true
}: PipProps) {
  const scale = size / 60 // Base size is 60

  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: size, height: size * 1.1 }}
      animate={float ? {
        y: [0, -8, 0],
        rotate: [0, 3, 0, -2, 0],
      } : undefined}
      transition={float ? {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      } : undefined}
    >
      <svg 
        viewBox="0 0 60 66" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <filter id={`pip-glow-${size}`} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation={3 * scale} result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
          
          <filter id={`pip-cheek-${size}`} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation={1.5 * scale}/>
          </filter>
          
          <radialGradient id={`pip-body-${size}`} cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#34d399"/>
            <stop offset="60%" stopColor="#10b981"/>
            <stop offset="100%" stopColor="#059669"/>
          </radialGradient>
          
          <radialGradient id={`pip-inner-${size}`} cx="50%" cy="35%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="white" stopOpacity="0"/>
          </radialGradient>
        </defs>

        <g transform="translate(30, 33)">
          {/* Soft glow aura */}
          {glow && (
            <motion.ellipse 
              cx="0" 
              cy="4" 
              rx="22" 
              ry="24" 
              fill="#10b981" 
              opacity={animate ? undefined : 0.15}
              filter={`url(#pip-glow-${size})`}
              animate={animate ? { opacity: [0.1, 0.2, 0.1] } : undefined}
              transition={animate ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : undefined}
            />
          )}
          
          {/* Body */}
          <path 
            d="M0 -22 C 15 -16, 19 0, 18 13 C 16 24, 8 30, 0 30 C -8 30, -16 24, -18 13 C -19 0, -15 -16, 0 -22 Z" 
            fill={`url(#pip-body-${size})`}
            filter={glow ? `url(#pip-glow-${size})` : undefined}
          />
          
          {/* Inner light */}
          <ellipse cx="0" cy="3" rx="10" ry="14" fill={`url(#pip-inner-${size})`}/>
          
          {/* Top highlight/shine */}
          <ellipse cx="0" cy="-16" rx="4" ry="2" fill="white" opacity="0.3"/>
          
          {/* Rosy cheeks */}
          <ellipse cx="-12" cy="8" rx="4" ry="3" fill="#fca5a5" opacity="0.25" filter={`url(#pip-cheek-${size})`}/>
          <ellipse cx="12" cy="8" rx="4" ry="3" fill="#fca5a5" opacity="0.25" filter={`url(#pip-cheek-${size})`}/>
          
          {/* Eyes */}
          <g transform="translate(-1, 4)">
            {/* Left eye */}
            <ellipse cx="-6" cy="0" rx="2.5" ry="3" fill="#09090b" opacity="0.9"/>
            <motion.circle 
              cx="-6.5" 
              cy="0.8" 
              r="0.9" 
              fill="white" 
              opacity="0.9"
              animate={animate ? { scale: [1, 1.1, 1] } : undefined}
              transition={animate ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : undefined}
            />
            
            {/* Right eye */}
            <ellipse cx="6" cy="0" rx="2.5" ry="3" fill="#09090b" opacity="0.9"/>
            <motion.circle 
              cx="5.5" 
              cy="0.8" 
              r="0.9" 
              fill="white" 
              opacity="0.9"
              animate={animate ? { scale: [1, 1.1, 1] } : undefined}
              transition={animate ? { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.1 } : undefined}
            />
          </g>
          
          {/* Tiny smile */}
          <path 
            d="M-3 12 Q 0 14, 3 12" 
            stroke="#09090b" 
            strokeWidth="1.2" 
            strokeLinecap="round"
            fill="none"
            opacity="0.35"
          />
        </g>
      </svg>
    </motion.div>
  )
}

// Compact version for tight spaces (nav, footer, badges)
export function PipMini({ size = 24, className = '' }: { size?: number; className?: string }) {
  return <Pip size={size} animate={false} float={false} glow={false} className={className} />
}
