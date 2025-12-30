'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
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
          <Image 
            src="/assets/logo.png" 
            alt="HatchIt" 
            width={32} 
            height={32} 
            className="w-8 h-8"
          />
        </motion.div>
        
        {/* Logo text */}
        <span className="hidden sm:flex items-center text-base font-bold">
          <span className="text-white">Hatch</span>
          <span className="bg-gradient-to-r from-amber-500 to-amber-400 bg-clip-text text-transparent">It</span>
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
    <div className="w-full bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 relative z-50">
      {/* Progress Bar */}
      <div className="h-1 bg-zinc-800">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
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
            <div>
              <span className="text-xs sm:text-sm font-medium text-white">{template.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">
                  {currentSectionIndex + 1}/{totalSections}
                </span>
                <span className="text-xs text-zinc-400">
                  {currentSection?.name || 'Complete!'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Section Dots */}
        <div className="hidden md:flex items-center gap-2">
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
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                    transition-all duration-200 cursor-pointer
                    ${isCurrent
                      ? 'bg-purple-500 text-white ring-2 ring-purple-400 ring-offset-2 ring-offset-zinc-900'
                      : isCompleted
                        ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                        : isSkipped
                          ? 'bg-zinc-700 text-zinc-500 hover:bg-zinc-600'
                          : 'bg-zinc-800 text-zinc-500 opacity-50 cursor-not-allowed'
                    }
                  `}
                  whileHover={isCompleted || isSkipped || isCurrent ? { scale: 1.1 } : {}}
                  whileTap={isCompleted || isSkipped || isCurrent ? { scale: 0.95 } : {}}
                  animate={isCurrent ? {
                    boxShadow: [
                      '0 0 0 0 rgba(16, 185, 129, 0.4)',
                      '0 0 0 8px rgba(16, 185, 129, 0)',
                      '0 0 0 0 rgba(16, 185, 129, 0)'
                    ]
                  } : {}}
                  transition={isCurrent ? {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeOut'
                  } : {}}
                >
                  {isCompleted ? (
                    <span className="flex items-center">
                      ✓
                      {isRefined && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute -top-1 -right-1 w-3 h-3 bg-violet-500 rounded-full"
                        />
                      )}
                    </span>
                  ) : isSkipped ? (
                    '–'
                  ) : (
                    index + 1
                  )}
                </motion.button>

                {/* Tooltip - shows below */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {/* Arrow pointing up */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[-1px] border-4 border-transparent border-b-zinc-800" />
                  <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm whitespace-nowrap shadow-xl">
                    <div className="font-medium text-white">{section.name}</div>
                    {section.required && (
                      <div className="text-xs text-amber-400">Required</div>
                    )}
                    {isCompleted && isRefined && changes && changes.length > 0 && (
                      <div className="mt-1 pt-1 border-t border-zinc-700">
                        <div className="text-xs text-violet-400 flex items-center gap-1">
                          ✓ Polished
                        </div>
                        <ul className="text-xs text-zinc-400 mt-1 space-y-0.5">
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
          className="md:hidden flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm min-h-[44px] active:bg-zinc-700 transition-colors"
          aria-label="View all sections"
        >
          <span className="font-medium">{currentSectionIndex + 1}/{totalSections}</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Right: Skip Button (for optional sections) */}
        <div className="hidden sm:flex items-center gap-3">
          {currentSection && !currentSection.required && (
            <motion.button
              onClick={onSkip}
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-800"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Skip →
            </motion.button>
          )}
          
          <div className="text-sm text-zinc-500">
            {progressPercent}%
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
          <p className="text-sm text-zinc-400">
            {currentSection.description}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            ⏱ {currentSection.estimatedTime}
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
      className="flex items-center gap-3 bg-zinc-800/50 rounded-lg px-4 py-3 border border-zinc-700"
    >
      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
        <span className="text-purple-400">✓</span>
      </div>
      
      <div className="flex-1">
        <div className="text-sm font-medium text-white">{sectionName} complete</div>
        
        {wasRefined ? (
          <div className="group relative inline-block">
            <span className="text-xs text-violet-400 flex items-center gap-1 cursor-help">
              ✓ Polished
              {changes.length > 0 && (
                <span className="text-zinc-500">({changes.length} improvements)</span>
              )}
            </span>
            
            {/* Tooltip with changes */}
            {changes.length > 0 && (
              <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-xl">
                  <div className="font-medium text-violet-400 mb-1">Opus improvements:</div>
                  <ul className="text-zinc-300 space-y-0.5">
                    {changes.map((change, i) => (
                      <li key={i}>• {change}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ) : (
          <span className="text-xs text-zinc-500">Code was already good 🐣</span>
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
                      <span className="text-xs bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded">
                        Polished
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
