'use client'

import { useState } from 'react'
import DesignPanel from '@/components/DesignPanel'
import { DesignTokens, defaultTokens } from '@/lib/tokens'
import Image from 'next/image'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { 
  Plus, 
  Layers, 
  Sparkles, 
  MessageSquare,
  Zap,
  ChevronRight,
  Settings,
  Check,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Trash2,
  Layout,
  Type,
  Image as ImageIcon,
  Quote,
  DollarSign,
  HelpCircle,
  Mail,
  BarChart3,
  Users,
  Briefcase,
  Menu as MenuIcon,
  Star
} from 'lucide-react'

// =============================================================================
// BUILDER SIDEBAR - Clean, solid, infrastructure-focused
// =============================================================================

type Tier = 'demo' | 'free' | 'architect' | 'visionary' | 'singularity'

const SECTION_TYPES = [
  { id: 'header', name: 'Header', icon: MenuIcon, pinned: 'top' },
  { id: 'hero', name: 'Hero', icon: Layout },
  { id: 'features', name: 'Features', icon: Star },
  { id: 'services', name: 'Services', icon: Briefcase },
  { id: 'about', name: 'About', icon: Users },
  { id: 'testimonials', name: 'Testimonials', icon: Quote },
  { id: 'pricing', name: 'Pricing', icon: DollarSign },
  { id: 'stats', name: 'Stats', icon: BarChart3 },
  { id: 'work', name: 'Portfolio', icon: ImageIcon },
  { id: 'faq', name: 'FAQ', icon: HelpCircle },
  { id: 'cta', name: 'CTA', icon: Zap },
  { id: 'contact', name: 'Contact', icon: Mail },
  { id: 'footer', name: 'Footer', icon: Type, pinned: 'bottom' },
] as const

interface SidebarProps {
  currentSection: number
  totalSections: number
  sectionNames?: string[]
  allSectionNames?: string[]
  sectionIds?: string[]
  completedSectionIds?: string[]
  isGenerating: boolean
  projectName?: string
  userTier: Tier
  isHealing?: boolean
  lastHealMessage?: string
  onOpenSettings?: () => void
  onAddSection?: () => void
  onAddSectionOfType?: (sectionType: string) => void
  onRemoveSection?: (index: number) => void
  onOpenHatch?: () => void
  onOpenReplicator?: () => void
  onRunAudit?: () => void
  onDeploy?: () => void
  onExport?: () => void
  onAddPage?: () => void
  onSelectSection?: (index: number) => void
  onMoveSection?: (fromIndex: number, toIndex: number) => void
  onUpgrade?: (requiredTier: Tier) => void
  onSignUp?: () => void
  designTokens?: DesignTokens
  onDesignTokensChange?: (tokens: DesignTokens) => void
}

const AI_TOOLS: Array<{
  id: string
  icon: typeof Plus
  name: string
  desc: string
  tier: Tier
  action: keyof SidebarProps
}> = [
  { id: 'ai-help', icon: MessageSquare, name: 'AI Help', desc: 'Get building tips', tier: 'free', action: 'onOpenHatch' },
]

const TIER_ORDER: Tier[] = ['demo', 'free', 'architect', 'visionary', 'singularity']

function canAccess(userTier: Tier, requiredTier: Tier): boolean {
  return TIER_ORDER.indexOf(userTier) >= TIER_ORDER.indexOf(requiredTier)
}

function getSectionIcon(sectionId: string) {
  const type = SECTION_TYPES.find(t => t.id === sectionId)
  return type?.icon || Layers
}

export default function LiveSidebar({
  currentSection,
  totalSections,
  sectionNames,
  allSectionNames,
  sectionIds,
  completedSectionIds = [],
  isGenerating,
  projectName = 'Untitled',
  userTier,
  isHealing,
  onOpenSettings,
  onAddSection,
  onAddSectionOfType,
  onRemoveSection,
  onOpenHatch,
  onSelectSection,
  onMoveSection,
  onUpgrade,
  onSignUp,
  designTokens,
  onDesignTokensChange,
}: SidebarProps) {
  const [showAddMenu, setShowAddMenu] = useState(false)
  const isDemo = userTier === 'demo'

  const getSectionLabel = (index: number) => {
    const names = allSectionNames || sectionNames
    if (names && names[index]) {
      return names[index].replace(/Section/i, '').trim()
    }
    return `Section ${index + 1}`
  }

  const handleAIToolClick = (tool: typeof AI_TOOLS[0]) => {
    if (!canAccess(userTier, tool.tier)) {
      if (isDemo && onSignUp) {
        onSignUp()
      } else {
        onUpgrade?.(tool.tier)
      }
      return
    }
    
    const callbacks: Record<string, (() => void) | undefined> = {
      onOpenHatch,
    }
    
    callbacks[tool.action]?.()
  }

  const availableSectionTypes = SECTION_TYPES.filter(type => {
    if (!('pinned' in type)) return true
    return !sectionIds?.includes(type.id)
  })

  const unlockedAITools = AI_TOOLS.filter(t => canAccess(userTier, t.tier))

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950">
      {/* Project Header - Compact */}
      <div className="px-3 py-3 border-b border-zinc-800/60">
        <h2 className="text-xs font-medium text-white truncate">{projectName}</h2>
        <div className="flex items-center gap-1.5 mt-1">
          <div className={`w-1.5 h-1.5 rounded-full ${isHealing ? 'bg-amber-400 animate-pulse' : isGenerating ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="text-[10px] text-zinc-500">
            {isHealing ? 'Fixing...' : isGenerating ? 'Building...' : 'Ready'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Sections Header */}
        <div className="px-3 pt-3 pb-1.5 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wide text-zinc-500">Sections</span>
          <span className="text-[10px] text-zinc-400">{completedSectionIds.length}/{totalSections} built</span>
        </div>

        {/* Sections List */}
        <div className="px-2 pb-3">
          <LayoutGroup>
            <div className="space-y-0.5">
              {Array.from({ length: allSectionNames?.length || totalSections }).map((_, i) => {
                const isActive = i === currentSection - 1
                const id = sectionIds?.[i]
                const isBuilt = id ? completedSectionIds.includes(id) : false
                const isClickable = isBuilt || isActive
                const SectionIcon = getSectionIcon(id || '')
                const isCurrentlyBuilding = isActive && isGenerating

                const isHeader = id === 'header'
                const isFooter = id === 'footer'
                const wouldSwapWithHeader = sectionIds?.[i - 1] === 'header'
                const wouldSwapWithFooter = sectionIds?.[i + 1] === 'footer'

                const canMoveUp = i > 0 && !isHeader && !isFooter && !wouldSwapWithHeader && isBuilt
                const canMoveDown = i < (totalSections - 1) && !isHeader && !isFooter && !wouldSwapWithFooter && isBuilt
                const canRemove = !isHeader && !isFooter && onRemoveSection && isBuilt
                
                return (
                  <motion.div 
                    key={id || i} 
                    layout
                    layoutId={id || `section-${i}`}
                    className="group relative"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <button
                      onClick={() => isClickable && onSelectSection?.(i)}
                      disabled={!isClickable}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md transition-all text-left ${
                        isActive 
                          ? 'bg-zinc-800/80 border border-zinc-700/50' 
                          : isClickable 
                            ? 'hover:bg-zinc-900 border border-transparent cursor-pointer' 
                            : 'opacity-40 cursor-not-allowed border border-transparent'
                      }`}
                    >
                      {/* Status indicator */}
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        isCurrentlyBuilding ? 'bg-amber-400 animate-pulse' : isBuilt ? 'bg-emerald-500' : isActive ? 'bg-zinc-400' : 'bg-zinc-700'
                      }`} />
                      
                      {/* Icon */}
                      <SectionIcon className={`w-3.5 h-3.5 flex-shrink-0 ${
                        isActive ? 'text-zinc-300' : isBuilt ? 'text-zinc-500' : 'text-zinc-600'
                      }`} />
                      
                      {/* Label */}
                      <span className={`flex-1 text-xs truncate ${
                        isActive ? 'text-white' : isBuilt ? 'text-zinc-400' : 'text-zinc-600'
                      }`}>
                        {getSectionLabel(i)}
                      </span>
                      
                      {/* Built checkmark or building indicator */}
                      {isCurrentlyBuilding ? (
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Image
                            src="/assets/hatchit_definitive.svg"
                            alt=""
                            width={14}
                            height={14}
                            className="flex-shrink-0"
                          />
                        </motion.div>
                      ) : isBuilt && !isActive ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500/70 flex-shrink-0" />
                      ) : null}
                    </button>

                    {/* Move/Delete actions */}
                    {(canMoveUp || canMoveDown || canRemove) && (
                      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900/95 rounded px-0.5">
                        {canMoveUp && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onMoveSection?.(i, i - 1) }}
                            className="p-0.5 rounded hover:bg-zinc-700"
                          >
                            <ArrowUp className="w-3 h-3 text-zinc-500" />
                          </button>
                        )}
                        {canMoveDown && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onMoveSection?.(i, i + 1) }}
                            className="p-0.5 rounded hover:bg-zinc-700"
                          >
                            <ArrowDown className="w-3 h-3 text-zinc-500" />
                          </button>
                        )}
                        {canRemove && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onRemoveSection?.(i) }}
                            className="p-0.5 rounded hover:bg-red-500/20"
                          >
                            <Trash2 className="w-3 h-3 text-zinc-500 hover:text-red-400" />
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </LayoutGroup>
          
          {/* Add Section Button */}
          {userTier !== 'demo' && (
            <div className="relative mt-2">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md hover:bg-zinc-900 border border-zinc-800/60 text-emerald-400 text-xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Section
              </button>

              <AnimatePresence>
                {showAddMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowAddMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute left-0 right-0 bottom-full mb-1.5 bg-zinc-900 border border-zinc-800/50 rounded-md shadow-xl z-50 overflow-hidden"
                    >
                      <div className="p-1.5">
                        <div className="grid grid-cols-2 gap-0.5 max-h-48 overflow-y-auto">
                          {availableSectionTypes.map((type) => {
                            const Icon = type.icon
                            return (
                              <button
                                key={type.id}
                                onClick={() => {
                                  if (onAddSectionOfType) {
                                    onAddSectionOfType(type.id)
                                  } else if (onAddSection) {
                                    onAddSection()
                                  }
                                  setShowAddMenu(false)
                                }}
                                className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-zinc-800 text-left transition-all group"
                              >
                                <Icon className="w-3 h-3 text-zinc-600 group-hover:text-zinc-300" />
                                <span className="text-[10px] text-zinc-500 group-hover:text-white">{type.name}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* AI Tools */}
        <div className="px-3 py-2 border-t border-zinc-800/60">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1.5">AI Tools</p>
          <div className="space-y-0.5">
            {unlockedAITools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleAIToolClick(tool)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-amber-950/30 transition-all group"
              >
                <div className="w-5 h-5 rounded bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                  <tool.icon className="w-3 h-3 text-amber-400" />
                </div>
                <span className="flex-1 text-left text-xs text-zinc-400 group-hover:text-white">{tool.name}</span>
                <ChevronRight className="w-3 h-3 text-zinc-700 group-hover:text-amber-400" />
              </button>
            ))}
          </div>
          
          {/* Self-healing indicator for Visionary+ */}
          {(userTier === 'visionary' || userTier === 'singularity') && (
            <div className="mt-2 px-2.5 py-1.5 rounded-md bg-emerald-950/20 border border-emerald-500/10">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400/70">Auto-fix enabled</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Design Controls */}
      <DesignPanel
        tokens={designTokens || defaultTokens}
        onChange={(tokens) => onDesignTokensChange?.(tokens)}
        isLocked={userTier === 'demo' || userTier === 'free'}
        onUpgrade={() => onUpgrade?.('visionary')}
      />

      {/* Bottom - Settings / Sign Up */}
      <div className="p-2 border-t border-zinc-800/60">
        {isDemo && onSignUp ? (
          <button
            onClick={onSignUp}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-white text-zinc-900 hover:bg-zinc-100 text-xs font-medium transition-all"
          >
            Sign Up Free
            <ArrowRight className="w-3 h-3" />
          </button>
        ) : onOpenSettings ? (
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-zinc-900 transition-all group"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400" />
            <span className="text-xs text-zinc-500 group-hover:text-white">Settings</span>
          </button>
        ) : null}
      </div>
    </div>
  )
}
