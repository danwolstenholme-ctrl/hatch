'use client'

import { motion } from 'framer-motion'
import { Template, BuildState } from '@/lib/templates'
import { CheckCircle2 } from 'lucide-react'

interface SectionProgressProps {
  template: Template
  buildState: BuildState
  onSectionClick?: (sectionIndex: number) => void
  onSkip?: () => void
}

export default function SectionProgress({
  template,
  buildState,
}: SectionProgressProps) {
  const { completedSections, skippedSections } = buildState
  const totalSections = template.sections.length
  const doneCount = completedSections.length + skippedSections.length
  const progressPercent = (doneCount / totalSections) * 100

  // Just a thin progress line - no numbers, no distractions
  return (
    <div className="h-0.5 bg-zinc-900 w-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-emerald-500/50 to-teal-500/50"
        initial={{ width: 0 }}
        animate={{ width: `${progressPercent}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  )
}

// =============================================================================
// SECTION COMPLETE INDICATOR
// Shows when a section is complete, with refinement status
// =============================================================================
interface SectionCompleteIndicatorProps {
  sectionName: string
  wasRefined: boolean
  changes?: string[]
}

export function SectionCompleteIndicator({
  sectionName,
  wasRefined,
  changes = [],
}: SectionCompleteIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-3 bg-zinc-900/50 rounded-lg px-4 py-3 border border-zinc-800"
    >
      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      </div>
      
      <div className="flex-1">
        <div className="text-sm font-medium text-white font-mono">{sectionName} Complete</div>
        
        {wasRefined ? (
          <div className="group relative inline-block">
            <span className="text-xs text-emerald-400 flex items-center gap-1 cursor-help font-mono mt-1">
              <CheckCircle2 className="w-3 h-3" />
              Refined
              {changes.length > 0 && (
                <span className="text-zinc-500">({changes.length} changes)</span>
              )}
            </span>
            
            {/* Tooltip with changes */}
            {changes.length > 0 && (
              <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-xl">
                  <div className="font-medium text-emerald-400 mb-1 font-mono">Changes:</div>
                  <ul className="text-zinc-400 space-y-0.5 font-mono">
                    {changes.map((change, i) => (
                      <li key={i}>• {change}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ) : (
          <span className="text-xs text-zinc-500 font-mono mt-1">Verified</span>
        )}
      </div>
    </motion.div>
  )
}
