'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { 
  Plus, 
  Layers, 
  Sparkles, 
  MessageSquare, 
  Eye,
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
  onOpenOracle?: () => void
  onOpenWitness?: () => void
  onOpenArchitect?: () => void
  onOpenReplicator?: () => void
  onRunAudit?: () => void
  onDeploy?: () => void
  onExport?: () => void
  onAddPage?: () => void
  onSelectSection?: (index: number) => void
  onMoveSection?: (fromIndex: number, toIndex: number) => void
  onUpgrade?: (requiredTier: Tier) => void
  onSignUp?: () => void
}

const AI_TOOLS: Array<{
  id: string
  icon: typeof Plus
  name: string
  desc: string
  tier: Tier
  action: keyof SidebarProps
}> = [
  { id: 'oracle', icon: MessageSquare, name: 'Assistant', desc: 'Get help', tier: 'free', action: 'onOpenOracle' },
  { id: 'architect', icon: Sparkles, name: 'Prompt Helper', desc: 'Optimize prompts', tier: 'free', action: 'onOpenArchitect' },
  { id: 'witness', icon: Eye, name: 'Witness', desc: 'AI insights', tier: 'singularity', action: 'onOpenWitness' },
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
  onOpenOracle,
  onOpenWitness,
  onOpenArchitect,
  onSelectSection,
  onMoveSection,
  onUpgrade,
  onSignUp,
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
      onOpenOracle,
      onOpenWitness,
      onOpenArchitect,
    }
    
    callbacks[tool.action]?.()
  }

  const availableSectionTypes = SECTION_TYPES.filter(type => {
    if (!('pinned' in type)) return true
    return !sectionIds?.includes(type.id)
  })

  const unlockedAITools = AI_TOOLS.filter(t => canAccess(userTier, t.tier))

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 border-r border-zinc-800">
      {/* Project Header - Solid */}
      <div className="px-4 py-4 border-b border-zinc-800 bg-zinc-900/50">
        <h2 className="text-sm font-semibold text-white truncate">{projectName}</h2>
        <div className="flex items-center gap-2 mt-1.5">
          <div className={`w-2 h-2 rounded-full ${isHealing ? 'bg-amber-400 animate-pulse' : isGenerating ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="text-xs text-zinc-400 font-medium">
            {isHealing ? 'Fixing...' : isGenerating ? 'Building...' : 'Ready'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Sections Header */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">Sections</span>
          <span className="text-[11px] font-medium text-emerald-400">{completedSectionIds.length}/{totalSections} built</span>
        </div>

        {/* Sections List */}
        <div className="px-2 pb-4">
          <LayoutGroup>
            <div className="space-y-1">
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
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                        isActive 
                          ? 'bg-emerald-500/15 border border-emerald-500/40' 
                          : isClickable 
                            ? 'hover:bg-zinc-800/80 border border-transparent cursor-pointer' 
                            : 'opacity-50 cursor-not-allowed border border-transparent'
                      }`}
                    >
                      {/* Status indicator */}
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${
                        isCurrentlyBuilding ? 'bg-amber-400 animate-pulse' : isBuilt ? 'bg-emerald-500' : isActive ? 'bg-emerald-400' : 'bg-zinc-700'
                      }`} />
                      
                      {/* Icon */}
                      <SectionIcon className={`w-4 h-4 flex-shrink-0 transition-colors ${
                        isActive ? 'text-emerald-400' : isBuilt ? 'text-zinc-400' : 'text-zinc-600'
                      }`} />
                      
                      {/* Label */}
                      <span className={`flex-1 text-sm truncate transition-colors ${
                        isActive ? 'text-white font-medium' : isBuilt ? 'text-zinc-300' : 'text-zinc-500'
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
                            width={16}
                            height={16}
                            className="flex-shrink-0"
                          />
                        </motion.div>
                      ) : isBuilt && !isActive ? (
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : null}
                    </button>

                    {/* Move/Delete actions */}
                    {(canMoveUp || canMoveDown || canRemove) && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900/90 rounded px-1">
                        {canMoveUp && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onMoveSection?.(i, i - 1) }}
                            className="p-1 rounded hover:bg-zinc-700"
                          >
                            <ArrowUp className="w-3 h-3 text-zinc-400" />
                          </button>
                        )}
                        {canMoveDown && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onMoveSection?.(i, i + 1) }}
                            className="p-1 rounded hover:bg-zinc-700"
                          >
                            <ArrowDown className="w-3 h-3 text-zinc-400" />
                          </button>
                        )}
                        {canRemove && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onRemoveSection?.(i) }}
                            className="p-1 rounded hover:bg-red-500/20"
                          >
                            <Trash2 className="w-3 h-3 text-zinc-400 hover:text-red-400" />
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
            <div className="relative mt-3">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium transition-all"
              >
                <Plus className="w-4 h-4" />
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
                      className="absolute left-0 right-0 bottom-full mb-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden"
                    >
                      <div className="p-2">
                        <div className="grid grid-cols-2 gap-1 max-h-60 overflow-y-auto">
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
                                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-emerald-500/10 text-left transition-all group"
                              >
                                <Icon className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400" />
                                <span className="text-xs text-zinc-400 group-hover:text-white">{type.name}</span>
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
        <div className="px-4 py-3 border-t border-zinc-800">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 mb-2">AI Tools</p>
          <div className="space-y-1">
            {unlockedAITools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleAIToolClick(tool)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800/80 transition-all group"
              >
                <tool.icon className="w-4 h-4 text-emerald-500/70 group-hover:text-emerald-400" />
                <span className="flex-1 text-left text-sm text-zinc-400 group-hover:text-white">{tool.name}</span>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom - Settings / Sign Up */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-900/30">
        {isDemo && onSignUp ? (
          <button
            onClick={onSignUp}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white text-zinc-900 hover:bg-zinc-100 text-sm font-medium transition-all"
          >
            Sign Up Free
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : onOpenSettings ? (
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800/80 transition-all group"
          >
            <Settings className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
            <span className="text-sm text-zinc-400 group-hover:text-white">Settings</span>
          </button>
        ) : null}
      </div>
    </div>
  )
}
