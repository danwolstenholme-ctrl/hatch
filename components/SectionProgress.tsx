'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import HatchLogo from './HatchLogo'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Layers, ChevronDown, Menu as MenuIcon, X, Clock, AlertCircle } from 'lucide-react'
import { Template, BuildState } from '@/lib/templates'
import { BrandConfig } from './BrandingStep'

// Interactive Logo with dropdown menu - Using actual HatchIt logo
interface HatchLogoMenuProps {
  progress: number
  onGoHome?: () => void
  onStartOver?: () => void
  onViewBrand?: () => void
  brandConfig?: BrandConfig | null
}

const HatchLogoMenu = ({ progress, onGoHome, onStartOver, onViewBrand, brandConfig }: HatchLogoMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  return (
    <div className="relative" ref={menuRef}>
      <motion.button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-zinc-800/50 transition-colors cursor-pointer z-10"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        title="HatchIt Menu"
      >
        {/* Animated Logo */}
        <motion.div
          animate={{ 
            y: [0, -2, 0],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <HatchLogo className="w-8 h-8" />
        </motion.div>
        
        {/* Logo text */}
        <span className="hidden sm:flex items-center text-base font-bold">
          <span className="text-white">Hatch</span>
          <span className="bg-gradient-to-r from-emerald-500 to-emerald-400 bg-clip-text text-transparent">It</span>
        </span>
        
        {/* Progress indicator glow */}
        {progress > 0 && (
          <motion.div 
            className="absolute -inset-1 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 -z-10"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop to catch clicks */}
            <div 
              className="fixed inset-0 z-[998]" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 w-56 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-[999]"
              style={{ backgroundColor: '#18181b' }}
            >
            {/* Brand Preview (if configured) */}
            {brandConfig && (
              <div className="px-4 py-3 border-b border-zinc-800" style={{ backgroundColor: '#27272a' }}>
                <div className="flex items-center gap-3">
                  {brandConfig.logoUrl ? (
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                      <Image 
                        src={brandConfig.logoUrl} 
                        alt="Logo" 
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: brandConfig.colors.primary }}
                    >
                      {brandConfig.brandName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{brandConfig.brandName}</p>
                    {brandConfig.tagline && (
                      <p className="text-xs text-zinc-400 truncate">{brandConfig.tagline}</p>
                    )}
                  </div>
                </div>
                {/* Color swatches */}
                <div className="flex gap-1 mt-2">
                  <div 
                    className="w-5 h-5 rounded-full border border-zinc-600" 
                    style={{ backgroundColor: brandConfig.colors.primary }}
                    title="Primary"
                  />
                  <div 
                    className="w-5 h-5 rounded-full border border-zinc-600" 
                    style={{ backgroundColor: brandConfig.colors.secondary }}
                    title="Secondary"
                  />
                  <div 
                    className="w-5 h-5 rounded-full border border-zinc-600" 
                    style={{ backgroundColor: brandConfig.colors.accent }}
                    title="Accent"
                  />
                  <span className="text-xs text-zinc-500 ml-2">{brandConfig.styleVibe}</span>
                </div>
              </div>
            )}

            {/* Menu Items */}
            <div className="py-1">
              {onViewBrand && brandConfig && (
                <button
                  type="button"
                  onClick={() => { onViewBrand(); setIsOpen(false); }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="text-base">🎨</span>
                  <span>Edit Branding</span>
                </button>
              )}
              
              {onStartOver && (
                <button
                  type="button"
                  onClick={() => { onStartOver(); setIsOpen(false); }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="text-base">🔄</span>
                  <span>Start New Project</span>
                </button>
              )}

              <div className="h-px bg-zinc-800 my-1" />

              {onGoHome && (
                <button
                  type="button"
                  onClick={() => { onGoHome(); setIsOpen(false); }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="text-base">🏠</span>
                  <span>Back to Home</span>
                </button>
              )}

              <a
                href="/roadmap"
                className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <span className="text-base">🗺️</span>
                <span>Roadmap</span>
              </a>

              <a
                href="/vision"
                className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <span className="text-base">💡</span>
                <span>Vision</span>
              </a>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-zinc-800" style={{ backgroundColor: '#1f1f23' }}>
              <p className="text-xs text-zinc-500 text-center">
                🐣 HatchIt v3.0
              </p>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

interface SectionProgressProps {
  template: Template
  buildState: BuildState
  onSectionClick?: (sectionIndex: number) => void
  onSkip?: () => void
  onGoHome?: () => void
  onStartOver?: () => void
  onViewBrand?: () => void
  brandConfig?: BrandConfig | null
}

export default function SectionProgress({
  template,
  buildState,
  onSectionClick,
  onSkip,
  onGoHome,
  onStartOver,
  onViewBrand,
  brandConfig,
}: SectionProgressProps) {
  const [showMobileDrawer, setShowMobileDrawer] = useState(false)
  const { currentSectionIndex, completedSections, skippedSections, sectionRefined, sectionChanges } = buildState
  const sections = template.sections
  const currentSection = sections[currentSectionIndex]

  // Calculate progress
  const totalSections = sections.length
  const doneCount = completedSections.length + skippedSections.length
  const progressPercent = Math.round((doneCount / totalSections) * 100)

  return (
    <>
    <div className="w-full bg-zinc-950 border-b border-zinc-800/50 relative z-50">
      {/* Progress Bar */}
      <div className="h-0.5 bg-zinc-900 w-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Section Navigation */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between overflow-visible">
        {/* Left: HatchIt Logo + Template Info */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <HatchLogoMenu 
              progress={progressPercent} 
              onGoHome={onGoHome}
              onStartOver={onStartOver}
              onViewBrand={onViewBrand}
              brandConfig={brandConfig}
            />
            <div className="h-8 w-px bg-zinc-800/50 mx-2 hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight">{template.name}</span>
                <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-500 font-mono uppercase">
                  v3.0
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 font-mono">
                  Step {currentSectionIndex + 1}/{totalSections}
                </span>
                <span className="text-xs text-zinc-400 font-medium">
                  {currentSection?.name || 'System Complete'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Section Dots */}
        <div className="hidden md:flex items-center gap-1.5">
          {sections.map((section, index) => {
            const isCompleted = completedSections.includes(section.id)
            const isSkipped = skippedSections.includes(section.id)
            const isCurrent = index === currentSectionIndex
            const isRefined = sectionRefined[section.id]
            const changes = sectionChanges[section.id]

            return (
              <div key={section.id} className="relative group">
                <motion.button
                  onClick={() => onSectionClick?.(index)}
                  disabled={!isCompleted && !isSkipped && !isCurrent}
                  className={`
                    w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium
                    transition-all duration-200 cursor-pointer border
                    ${isCurrent
                      ? 'bg-purple-500/10 border-purple-500/50 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                      : isCompleted
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                        : isSkipped
                          ? 'bg-zinc-900 border-zinc-800 text-zinc-600'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-700 opacity-50 cursor-not-allowed'
                    }
                  `}
                  whileHover={isCompleted || isSkipped || isCurrent ? { scale: 1.05 } : {}}
                  whileTap={isCompleted || isSkipped || isCurrent ? { scale: 0.95 } : {}}
                >
                  {isCompleted ? (
                    <div className="relative">
                      <CheckCircle2 className="w-4 h-4" />
                      {isRefined && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute -top-1 -right-1 w-2 h-2 bg-violet-500 rounded-full border border-zinc-950"
                        />
                      )}
                    </div>
                  ) : isSkipped ? (
                    <span className="text-lg leading-none">-</span>
                  ) : (
                    <span className="font-mono">{index + 1}</span>
                  )}
                </motion.button>

                {/* Tooltip - shows below */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {/* Arrow pointing up */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[-1px] border-4 border-transparent border-b-zinc-800" />
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm whitespace-nowrap shadow-xl">
                    <div className="font-medium text-white text-xs font-mono uppercase tracking-wider">{section.name}</div>
                    {section.required && (
                      <div className="text-[10px] text-amber-400 mt-0.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Required Module
                      </div>
                    )}
                    {isCompleted && isRefined && changes && changes.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-zinc-800">
                        <div className="text-xs text-violet-400 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          Opus Polished
                        </div>
                        <ul className="text-[10px] text-zinc-400 mt-1 space-y-0.5 font-mono">
                          {changes.slice(0, 3).map((change, i) => (
                            <li key={i}>• {change}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Mobile: Section drawer trigger */}
        <button
          onClick={() => setShowMobileDrawer(true)}
          className="md:hidden flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm active:bg-zinc-800 transition-colors"
          aria-label="View all sections"
        >
          <Layers className="w-4 h-4" />
          <span className="font-mono text-xs">{currentSectionIndex + 1}/{totalSections}</span>
          <ChevronDown className="w-3 h-3 text-zinc-500" />
        </button>

        {/* Right: Skip Button (for optional sections) */}
        <div className="hidden sm:flex items-center gap-4">
          {currentSection && !currentSection.required && (
            <motion.button
              onClick={onSkip}
              className="text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Skip Module →
            </motion.button>
          )}
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">
            <Clock className="w-3 h-3 text-zinc-500" />
            <span className="text-xs font-mono text-zinc-400">
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Current Section Description - hidden on mobile for space */}
      {currentSection && (
        <motion.div
          key={currentSection.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden sm:block px-4 pb-3 -mt-1"
        >
          <p className="text-xs text-zinc-500 font-mono max-w-2xl truncate">
            <span className="text-purple-400 mr-2">❯</span>
            {currentSection.description}
          </p>
        </motion.div>
      )}
    </div>

    {/* Mobile Section Drawer */}
    <AnimatePresence>
      {showMobileDrawer && onSectionClick && (
        <MobileSectionDrawer
          isOpen={showMobileDrawer}
          onClose={() => setShowMobileDrawer(false)}
          template={template}
          buildState={buildState}
          onSectionClick={onSectionClick}
        />
      )}
    </AnimatePresence>
    </>
  )
}

// =============================================================================
// SECTION COMPLETE INDICATOR
// Shows when a section is complete, with Opus refinement status
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
        <div className="text-sm font-medium text-white font-mono">{sectionName} Module Complete</div>
        
        {wasRefined ? (
          <div className="group relative inline-block">
            <span className="text-xs text-violet-400 flex items-center gap-1 cursor-help font-mono mt-1">
              <CheckCircle2 className="w-3 h-3" />
              Opus 4.5 Polished
              {changes.length > 0 && (
                <span className="text-zinc-500">({changes.length} optimizations)</span>
              )}
            </span>
            
            {/* Tooltip with changes */}
            {changes.length > 0 && (
              <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-xl">
                  <div className="font-medium text-violet-400 mb-1 font-mono">Opus 4.5 Optimizations:</div>
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
          <span className="text-xs text-zinc-500 font-mono mt-1">Architecture verified stable</span>
        )}
      </div>
    </motion.div>
  )
}

// =============================================================================
// MOBILE SECTION DRAWER (for smaller screens)
// =============================================================================
interface MobileSectionDrawerProps {
  isOpen: boolean
  onClose: () => void
  template: Template
  buildState: BuildState
  onSectionClick: (sectionIndex: number) => void
}

export function MobileSectionDrawer({
  isOpen,
  onClose,
  template,
  buildState,
  onSectionClick,
}: MobileSectionDrawerProps) {
  const { completedSections, skippedSections, currentSectionIndex, sectionRefined } = buildState

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 md:hidden"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="absolute bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 rounded-t-2xl max-h-[70vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{template.icon}</span>
            <span className="font-medium text-white">{template.name} Sections</span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white active:bg-zinc-700 transition-colors min-w-[44px] min-h-[44px]"
            aria-label="Close section drawer"
          >
            ✕
          </button>
        </div>
        
        <div className="p-4 space-y-2">
          {template.sections.map((section, index) => {
            const isCompleted = completedSections.includes(section.id)
            const isSkipped = skippedSections.includes(section.id)
            const isCurrent = index === currentSectionIndex
            const isRefined = sectionRefined[section.id]

            return (
              <button
                key={section.id}
                onClick={() => {
                  onSectionClick(index)
                  onClose()
                }}
                className={`
                  w-full text-left p-3 rounded-lg transition-all
                  ${isCurrent
                    ? 'bg-purple-500/20 border border-purple-500/50'
                    : 'bg-zinc-800/50 border border-zinc-700 hover:border-zinc-600'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs
                      ${isCompleted
                        ? 'bg-purple-500/20 text-purple-400'
                        : isSkipped
                          ? 'bg-zinc-700 text-zinc-500'
                          : 'bg-zinc-700 text-zinc-400'
                      }
                    `}>
                      {isCompleted ? '✓' : isSkipped ? '–' : index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-white">{section.name}</div>
                      <div className="text-xs text-zinc-500">{section.description}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {section.required && (
                      <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                        Required
                      </span>
                    )}
                    {isRefined && (
                      <span className="text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/20 px-1.5 py-0.5 rounded font-mono">
                        Opus 4.5
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
