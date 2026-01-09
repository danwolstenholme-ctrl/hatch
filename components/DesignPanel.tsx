'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sliders, ChevronDown, ChevronUp, Lock } from 'lucide-react'
import { DesignTokens, defaultTokens, tokenPresets } from '@/lib/tokens'

interface DesignPanelProps {
  tokens: DesignTokens
  onChange: (tokens: DesignTokens) => void
  isLocked?: boolean
  onUpgrade?: () => void
}

export default function DesignPanel({ tokens, onChange, isLocked = false, onUpgrade }: DesignPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateToken = <K extends keyof DesignTokens>(key: K, value: DesignTokens[K]) => {
    if (isLocked) return
    onChange({ ...tokens, [key]: value })
  }

  const applyPreset = (presetName: string) => {
    if (isLocked) return
    const preset = tokenPresets[presetName]
    if (preset) {
      onChange({ ...tokens, ...preset })
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
              <div className="px-4 pb-4 space-y-4">
                {/* Presets */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2 block">
                    Quick Presets
                  </label>
                  <div className="flex gap-1.5">
                    {Object.keys(tokenPresets).map((name) => (
                      <button
                        key={name}
                        onClick={() => applyPreset(name)}
                        className="px-2.5 py-1.5 text-xs rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-emerald-500/50 hover:text-white transition-all capitalize"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section Padding */}
                <SliderControl
                  label="Section Padding"
                  value={tokens.sectionPadding}
                  min={40}
                  max={120}
                  step={8}
                  unit="px"
                  onChange={(v) => updateToken('sectionPadding', v)}
                />

                {/* Border Radius */}
                <SliderControl
                  label="Border Radius"
                  value={tokens.borderRadius}
                  min={0}
                  max={32}
                  step={2}
                  unit="px"
                  onChange={(v) => updateToken('borderRadius', v)}
                />

                {/* Component Gap */}
                <SliderControl
                  label="Component Gap"
                  value={tokens.componentGap}
                  min={8}
                  max={48}
                  step={4}
                  unit="px"
                  onChange={(v) => updateToken('componentGap', v)}
                />

                {/* Heading Size */}
                <SliderControl
                  label="Heading Size"
                  value={tokens.headingSizeMultiplier}
                  min={0.8}
                  max={1.5}
                  step={0.1}
                  unit="x"
                  onChange={(v) => updateToken('headingSizeMultiplier', v)}
                />

                {/* Shadow Intensity */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2 block">
                    Shadow
                  </label>
                  <div className="flex gap-1.5">
                    {(['none', 'subtle', 'medium', 'strong'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => updateToken('shadowIntensity', level)}
                        className={`flex-1 px-2 py-1.5 text-xs rounded-md border transition-all capitalize ${
                          tokens.shadowIntensity === level
                            ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
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
                  <div className="flex gap-1.5">
                    {(['normal', 'medium', 'semibold', 'bold'] as const).map((weight) => (
                      <button
                        key={weight}
                        onClick={() => updateToken('fontWeight', weight)}
                        className={`flex-1 px-2 py-1.5 text-xs rounded-md border transition-all capitalize ${
                          tokens.fontWeight === weight
                            ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
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

// Reusable slider component
function SliderControl({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (value: number) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-[10px] uppercase tracking-wider text-zinc-500">
          {label}
        </label>
        <span className="text-xs text-zinc-400 font-mono">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
      />
    </div>
  )
}
