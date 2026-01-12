'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sliders, ChevronDown, ChevronUp, Lock, Check } from 'lucide-react'
import { DesignTokens, defaultTokens, tokenPresets } from '@/lib/tokens'

interface DesignPanelProps {
  tokens: DesignTokens
  onChange: (tokens: DesignTokens) => void
  isLocked?: boolean
  onUpgrade?: () => void
}

// Detect which preset matches current tokens (if any)
function detectActivePreset(tokens: DesignTokens): string | null {
  for (const [name, preset] of Object.entries(tokenPresets)) {
    let matches = true
    for (const [key, value] of Object.entries(preset)) {
      if (tokens[key as keyof DesignTokens] !== value) {
        matches = false
        break
      }
    }
    if (matches) return name
  }
  return null
}

export default function DesignPanel({ tokens, onChange, isLocked = false, onUpgrade }: DesignPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [justApplied, setJustApplied] = useState<string | null>(null)
  const presetsRef = useRef<HTMLDivElement>(null)

  // Detect active preset when tokens change
  useEffect(() => {
    setActivePreset(detectActivePreset(tokens))
  }, [tokens])

  const updateToken = <K extends keyof DesignTokens>(key: K, value: DesignTokens[K]) => {
    if (isLocked) return
    onChange({ ...tokens, [key]: value })
  }

  const applyPreset = (presetName: string) => {
    if (isLocked) return
    const preset = tokenPresets[presetName]
    if (preset) {
      onChange({ ...tokens, ...preset })
      setJustApplied(presetName)
      setTimeout(() => setJustApplied(null), 600)
    }
  }

  return (
    <div className="border-t border-zinc-800/50">
      {/* Toggle Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-zinc-800/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-medium text-zinc-300">Design Controls</span>
          {isLocked && <Lock className="w-3 h-3 text-amber-400" />}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-zinc-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-500" />
        )}
      </button>

      {/* Panel Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {isLocked ? (
              <div className="px-4 py-6 text-center">
                <Lock className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                <p className="text-sm text-zinc-400 mb-3">
                  Design controls unlock with Visionary
                </p>
                <button
                  onClick={onUpgrade}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold rounded-lg transition-colors"
                >
                  Upgrade
                </button>
              </div>
            ) : (
              <div className="px-4 pb-4 space-y-5">
                {/* Presets - Horizontal Scroll */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2 block">
                    Quick Presets
                  </label>
                  <div 
                    ref={presetsRef}
                    className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {Object.keys(tokenPresets).map((name) => {
                      const isActive = activePreset === name
                      const wasJustApplied = justApplied === name
                      
                      return (
                        <motion.button
                          key={name}
                          onClick={() => applyPreset(name)}
                          whileTap={{ scale: 0.95 }}
                          animate={wasJustApplied ? { 
                            scale: [1, 1.05, 1],
                            transition: { duration: 0.3 }
                          } : {}}
                          className={`relative flex-shrink-0 px-3 py-2 text-xs rounded-lg border transition-all capitalize ${
                            isActive
                              ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400'
                              : 'bg-zinc-800/80 border-zinc-700/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            {isActive && <Check className="w-3 h-3" />}
                            {name}
                          </span>
                          {wasJustApplied && (
                            <motion.div
                              initial={{ opacity: 0.8, scale: 1 }}
                              animate={{ opacity: 0, scale: 1.5 }}
                              transition={{ duration: 0.5 }}
                              className="absolute inset-0 rounded-lg bg-emerald-500/30"
                            />
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                {/* Section Padding - Smooth 1px steps */}
                <SliderControl
                  label="Section Padding"
                  value={tokens.sectionPadding}
                  min={32}
                  max={128}
                  step={1}
                  unit="px"
                  onChange={(v) => updateToken('sectionPadding', v)}
                />

                {/* Border Radius */}
                <SliderControl
                  label="Border Radius"
                  value={tokens.borderRadius}
                  min={0}
                  max={32}
                  step={1}
                  unit="px"
                  onChange={(v) => updateToken('borderRadius', v)}
                />

                {/* Component Gap */}
                <SliderControl
                  label="Component Gap"
                  value={tokens.componentGap}
                  min={4}
                  max={48}
                  step={1}
                  unit="px"
                  onChange={(v) => updateToken('componentGap', v)}
                />

                {/* Heading Size */}
                <SliderControl
                  label="Heading Size"
                  value={tokens.headingSizeMultiplier}
                  min={0.7}
                  max={1.6}
                  step={0.05}
                  unit="x"
                  onChange={(v) => updateToken('headingSizeMultiplier', Math.round(v * 100) / 100)}
                  formatValue={(v) => v.toFixed(2)}
                />

                {/* Shadow Intensity */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2 block">
                    Shadow
                  </label>
                  <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                    {(['none', 'subtle', 'medium', 'strong'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => updateToken('shadowIntensity', level)}
                        className={`flex-1 min-w-[60px] px-2 py-2 text-xs rounded-lg border transition-all capitalize ${
                          tokens.shadowIntensity === level
                            ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400'
                            : 'bg-zinc-800/80 border-zinc-700/50 text-zinc-500 hover:border-zinc-600 hover:text-zinc-400'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Weight */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2 block">
                    Font Weight
                  </label>
                  <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                    {(['normal', 'medium', 'semibold', 'bold'] as const).map((weight) => (
                      <button
                        key={weight}
                        onClick={() => updateToken('fontWeight', weight)}
                        className={`flex-1 min-w-[60px] px-2 py-2 text-xs rounded-lg border transition-all capitalize ${
                          tokens.fontWeight === weight
                            ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400'
                            : 'bg-zinc-800/80 border-zinc-700/50 text-zinc-500 hover:border-zinc-600 hover:text-zinc-400'
                        }`}
                      >
                        {weight}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Polished slider with custom styling
function SliderControl({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  formatValue,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (value: number) => void
  formatValue?: (value: number) => string
}) {
  const percentage = ((value - min) / (max - min)) * 100
  const displayValue = formatValue ? formatValue(value) : value.toString()

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-[10px] uppercase tracking-wider text-zinc-500">
          {label}
        </label>
        <span className="text-xs text-emerald-400/80 font-mono tabular-nums">
          {displayValue}{unit}
        </span>
      </div>
      <div className="relative h-6 flex items-center">
        {/* Track Background */}
        <div className="absolute inset-x-0 h-1.5 bg-zinc-800 rounded-full" />
        
        {/* Filled Track */}
        <div 
          className="absolute left-0 h-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full transition-all duration-75"
          style={{ width: `${percentage}%` }}
        />
        
        {/* Native Input (for dragging) */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        {/* Thumb */}
        <div 
          className="absolute w-4 h-4 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/30 pointer-events-none transition-all duration-75"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
    </div>
  )
}
