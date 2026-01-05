'use client'

import { motion } from 'framer-motion'
import { Settings, Check } from 'lucide-react'
import Image from 'next/image'

interface SingularitySidebarProps {
  currentSection: number
  totalSections: number
  sectionNames?: string[]
  isGenerating: boolean
  thought?: string
  promptsUsed: number
  promptsLimit: number
  isPaid: boolean
  projectName?: string
  onUpgrade?: () => void
  onOpenSettings?: () => void
}

export default function SingularitySidebar({
  currentSection,
  totalSections,
  sectionNames,
  isGenerating,
  projectName = "Untitled Project",
  onOpenSettings
}: SingularitySidebarProps) {
  
  // Generate a clean label for each section
  const getSectionLabel = (index: number) => {
    if (sectionNames && sectionNames[index]) {
      // Convert "Hero Section" to "Hero" for cleaner UI
      return sectionNames[index].replace(/Section/i, '').trim()
    }
    return `Step ${index + 1}`
  }

  return (
    <div className="w-64 border-r border-white/10 bg-black flex flex-col h-full relative overflow-hidden">
      {/* Subtle Void Gradient */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.03),transparent_40%)]" />

      {/* Header - Minimalist Logo & Context */}
      <div className="relative p-6 flex items-center gap-4 border-b border-white/10 overflow-hidden">
        {/* Subtle ambient glow */}
        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-emerald-500/5 to-transparent opacity-50" />
        
        <div className="relative z-10 group cursor-default shrink-0">
          <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <Image 
            src="/assets/hatchit_definitive.svg" 
            alt="HatchIt" 
            width={36} 
            height={36} 
            className="w-9 h-9 relative z-10 opacity-100 transition-opacity duration-500" 
          />
        </div>

        {/* Project Context - Very subtle */}
        <div className="relative z-10 flex flex-col justify-center">
          <div className="h-3 w-px bg-white/10 absolute -left-2 top-1/2 -translate-y-1/2" />
          <span className="text-xs font-medium text-zinc-300 tracking-wide truncate max-w-[140px]">
            {projectName}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
            <span className="text-[9px] text-zinc-600 font-medium uppercase tracking-wider">
              Environment Active
            </span>
          </div>
        </div>
      </div>

      {/* Studio Timeline */}
      <div className="flex-1 overflow-y-auto py-8 px-6 custom-scrollbar">
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/10" />

          {Array.from({ length: totalSections }).map((_, i) => {
            const isActive = i === currentSection - 1
            const isCompleted = i < currentSection - 1

            return (
              <div key={i} className="relative flex items-center gap-4 mb-6 last:mb-0 group">
                {/* Status Dot */}
                <div className={`relative z-10 flex items-center justify-center w-4 h-4 rounded-full border transition-all duration-500 ${
                  isActive ? 'bg-black border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.15)]' : 
                  isCompleted ? 'bg-emerald-500/5 border-emerald-500/30' : 
                  'bg-black border-white/10'
                }`}>
                  {isCompleted ? (
                    <Check className="w-2.5 h-2.5 text-emerald-500/70" />
                  ) : isActive ? (
                    <div className="w-1.5 h-1.5 bg-emerald-500/80 rounded-full animate-pulse" />
                  ) : (
                    <div className="w-1 h-1 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors" />
                  )}
                </div>

                {/* Label */}
                <div className={`flex flex-col transition-all duration-500 ${
                  isActive ? 'opacity-100 translate-x-1' : 
                  isCompleted ? 'opacity-60' : 
                  'opacity-40'
                }`}>
                  <span className={`text-sm font-medium tracking-wide ${isActive ? 'text-white' : 'text-zinc-400'}`}>
                    {getSectionLabel(i)}
                  </span>
                  {isActive && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[10px] text-emerald-600 font-medium tracking-wider uppercase mt-0.5"
                    >
                      {isGenerating ? 'Building...' : 'Current Step'}
                    </motion.span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-4 border-t border-zinc-900 bg-zinc-950/50 backdrop-blur-sm">
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/50 hover:border-zinc-700 transition-all group"
          >
            <div className="p-1.5 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 transition-colors">
              <Settings className="w-4 h-4 text-zinc-400 group-hover:text-white" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs font-medium text-zinc-300 group-hover:text-white">Project Settings</span>
              <span className="text-[10px] text-zinc-500">Configure SEO & Brand</span>
            </div>
          </button>
        )}
      </div>
    </div>
  )
}
