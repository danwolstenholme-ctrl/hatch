'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
// BUILDER SIDEBAR - Clean, minimal, infrastructure-focused
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
    <div className="w-full h-full flex flex-col bg-zinc-950">
      <div className="flex-1 overflow-y-auto">
        {/* Project Header */}
        <div className="px-4 py-4 border-b border-zinc-800/50">
          <h2 className="text-sm font-medium text-white truncate">{projectName}</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-1.5 h-1.5 rounded-full ${isHealing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-[10px] text-zinc-500">
              {isHealing ? 'Fixing...' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Sections */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Sections</span>
            <span className="text-[10px] text-zinc-600">{currentSection}/{totalSections}</span>
          </div>
          
          <div className="space-y-0.5">
            {Array.from({ length: allSectionNames?.length || totalSections }).map((_, i) => {
              const isActive = i === currentSection - 1
              const isCompleted = i < currentSection - 1
              const isClickable = isCompleted || isActive
              const id = sectionIds?.[i]
              const SectionIcon = getSectionIcon(id || '')

              const isHeader = id === 'header'
              const isFooter = id === 'footer'
              const wouldSwapWithHeader = sectionIds?.[i - 1] === 'header'
              const wouldSwapWithFooter = sectionIds?.[i + 1] === 'footer'

              const canMoveUp = i > 0 && !isHeader && !isFooter && !wouldSwapWithHeader
              const canMoveDown = i < (totalSections - 1) && !isHeader && !isFooter && !wouldSwapWithFooter
              const canRemove = !isHeader && !isFooter && onRemoveSection
              
              return (
                <div key={i} className="group relative">
                  <button
                    onClick={() => isClickable && onSelectSection?.(i)}
                    disabled={!isClickable}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-left ${
                      isActive 
                        ? 'bg-emerald-500/10 border border-emerald-500/30' 
                        : isClickable 
                          ? 'hover:bg-zinc-900 border border-transparent' 
                          : 'opacity-40 cursor-not-allowed border border-transparent'
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      isCompleted ? 'bg-emerald-500' : isActive && isGenerating ? 'bg-amber-400 animate-pulse' : isActive ? 'bg-emerald-400' : 'bg-zinc-700'
                    }`} />
                    <SectionIcon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-zinc-600'}`} />
                    <span className={`flex-1 text-xs truncate ${isActive ? 'text-white' : 'text-zinc-400'}`}>
                      {getSectionLabel(i)}
                    </span>
                    {isCompleted && !isActive && <Check className="w-3 h-3 text-emerald-500/70 flex-shrink-0" />}
                  </button>

                  {(canMoveUp || canMoveDown || canRemove) && (
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {canMoveUp && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onMoveSection?.(i, i - 1) }}
                          className="p-1 rounded hover:bg-zinc-800"
                        >
                          <ArrowUp className="w-3 h-3 text-zinc-500" />
                        </button>
                      )}
                      {canMoveDown && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onMoveSection?.(i, i + 1) }}
                          className="p-1 rounded hover:bg-zinc-800"
                        >
                          <ArrowDown className="w-3 h-3 text-zinc-500" />
                        </button>
                      )}
                      {canRemove && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onRemoveSection?.(i) }}
                          className="p-1 rounded hover:bg-red-500/10"
                        >
                          <Trash2 className="w-3 h-3 text-zinc-500 hover:text-red-400" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          {/* Add Section */}
          <div className="relative mt-3">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Section
            </button>

            <AnimatePresence>
              {showAddMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowAddMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute left-0 right-0 bottom-full mb-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-2 max-h-64 overflow-y-auto">
                      <p className="px-2 py-1.5 text-[10px] text-zinc-500 uppercase tracking-wider">
                        Section Type
                      </p>
                      <div className="grid grid-cols-2 gap-1 mt-1">
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
                              className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-zinc-800 text-left transition-colors"
                            >
                              <Icon className="w-3.5 h-3.5 text-zinc-500" />
                              <span className="text-xs text-zinc-300">{type.name}</span>
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
        </div>

        {/* AI Tools */}
        <div className="px-4 py-3 border-t border-zinc-800/50">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-2">AI Tools</p>
          <div className="space-y-0.5">
            {unlockedAITools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleAIToolClick(tool)}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-zinc-900 transition-all group"
              >
                <tool.icon className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                <div className="flex-1 text-left">
                  <p className="text-xs text-zinc-400 group-hover:text-white transition-colors">{tool.name}</p>
                </div>
                <ChevronRight className="w-3 h-3 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="p-4 border-t border-zinc-800/50">
        {isDemo && onSignUp ? (
          <button
            onClick={onSignUp}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 hover:bg-emerald-500/20 transition-all"
          >
            <span className="text-sm font-medium text-white">Sign Up Free</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        ) : onOpenSettings ? (
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all"
          >
            <Settings className="w-4 h-4 text-zinc-500" />
            <span className="text-xs text-zinc-400">Settings</span>
          </button>
        ) : null}
      </div>
    </div>
  )
}
