'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Color presets with curated palettes
const colorPresets = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean & professional',
    primary: '#3B82F6', // blue-500
    secondary: '#1E293B', // slate-800
    accent: '#10B981', // emerald-500
  },
  {
    id: 'warm',
    name: 'Warm',
    description: 'Friendly & inviting',
    primary: '#F97316', // orange-500
    secondary: '#78350F', // amber-900
    accent: '#FBBF24', // amber-400
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Trust & stability',
    primary: '#1D4ED8', // blue-700
    secondary: '#111827', // gray-900
    accent: '#6366F1', // indigo-500
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple & elegant',
    primary: '#18181B', // zinc-900
    secondary: '#71717A', // zinc-500
    accent: '#A1A1AA', // zinc-400
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    description: 'Bold & energetic',
    primary: '#8B5CF6', // violet-500
    secondary: '#EC4899', // pink-500
    accent: '#06B6D4', // cyan-500
  },
  {
    id: 'nature',
    name: 'Nature',
    description: 'Organic & fresh',
    primary: '#059669', // emerald-600
    secondary: '#065F46', // emerald-800
    accent: '#84CC16', // lime-500
  },
]

// Font style options
const fontStyles = [
  {
    id: 'clean',
    name: 'Clean',
    description: 'Modern sans-serif',
    fontFamily: 'Inter, system-ui, sans-serif',
    preview: 'Aa',
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Elegant serif',
    fontFamily: 'Georgia, serif',
    preview: 'Aa',
  },
  {
    id: 'rounded',
    name: 'Rounded',
    description: 'Friendly & soft',
    fontFamily: 'Nunito, system-ui, sans-serif',
    preview: 'Aa',
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'Strong & impactful',
    fontFamily: 'Poppins, system-ui, sans-serif',
    preview: 'Aa',
  },
]

// Style/vibe options
const styleVibes = [
  { id: 'minimal', name: 'Minimal', emoji: '✨', description: 'Clean, lots of whitespace' },
  { id: 'bold', name: 'Bold', emoji: '💪', description: 'Strong typography, high contrast' },
  { id: 'playful', name: 'Playful', emoji: '🎨', description: 'Fun, colorful, animated' },
  { id: 'professional', name: 'Professional', emoji: '💼', description: 'Corporate, trustworthy' },
  { id: 'luxurious', name: 'Luxurious', emoji: '✨', description: 'Premium, sophisticated' },
  { id: 'techy', name: 'Tech', emoji: '🚀', description: 'Modern, cutting-edge' },
]

export interface BrandConfig {
  brandName: string
  tagline?: string
  logoUrl?: string
  colorPreset: string
  colors: {
    primary: string
    secondary: string
    accent: string
  }
  fontStyle: string
  styleVibe: string
}

interface BrandingStepProps {
  onComplete: (brand: BrandConfig) => void
  onBack: () => void
  templateName: string
  templateIcon: string
}

export default function BrandingStep({ onComplete, onBack, templateName, templateIcon }: BrandingStepProps) {
  const [brandName, setBrandName] = useState('')
  const [tagline, setTagline] = useState('')
  const [selectedColorPreset, setSelectedColorPreset] = useState('modern')
  const [customColors, setCustomColors] = useState({
    primary: '#3B82F6',
    secondary: '#1E293B',
    accent: '#10B981',
  })
  const [useCustomColors, setUseCustomColors] = useState(false)
  const [selectedFont, setSelectedFont] = useState('clean')
  const [selectedVibe, setSelectedVibe] = useState('minimal')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const STORAGE_KEY = 'hatch_branding_draft'

  // Restore saved branding on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        if (data.brandName) setBrandName(data.brandName)
        if (data.tagline) setTagline(data.tagline)
        if (data.selectedColorPreset) setSelectedColorPreset(data.selectedColorPreset)
        if (data.customColors) setCustomColors(data.customColors)
        if (data.useCustomColors !== undefined) setUseCustomColors(data.useCustomColors)
        if (data.selectedFont) setSelectedFont(data.selectedFont)
        if (data.selectedVibe) setSelectedVibe(data.selectedVibe)
        if (data.logoPreview) setLogoPreview(data.logoPreview)
      }
    } catch (e) {
      console.warn('Failed to restore branding draft:', e)
    }
  }, [])

  // Auto-save branding to localStorage on any change
  useEffect(() => {
    const data = {
      brandName,
      tagline,
      selectedColorPreset,
      customColors,
      useCustomColors,
      selectedFont,
      selectedVibe,
      logoPreview,
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.warn('Failed to save branding draft:', e)
    }
  }, [brandName, tagline, selectedColorPreset, customColors, useCustomColors, selectedFont, selectedVibe, logoPreview])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = () => {
    const selectedPreset = colorPresets.find(p => p.id === selectedColorPreset)
    const colors = useCustomColors ? customColors : {
      primary: selectedPreset?.primary || '#3B82F6',
      secondary: selectedPreset?.secondary || '#1E293B',
      accent: selectedPreset?.accent || '#10B981',
    }

    // Clear the draft since we're successfully completing
    localStorage.removeItem(STORAGE_KEY)

    onComplete({
      brandName: brandName || 'My Brand',
      tagline: tagline || undefined,
      logoUrl: logoPreview || undefined,
      colorPreset: useCustomColors ? 'custom' : selectedColorPreset,
      colors,
      fontStyle: selectedFont,
      styleVibe: selectedVibe,
    })
  }

  const currentColors = useCustomColors 
    ? customColors 
    : colorPresets.find(p => p.id === selectedColorPreset) || colorPresets[0]

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{ backgroundColor: `${currentColors.primary}20` }}
          animate={{
            x: ['-10%', '5%', '-10%'],
            y: ['-10%', '10%', '-10%'],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-[100px]"
          style={{ backgroundColor: `${currentColors.accent}15`, top: '30%', right: '-10%' }}
          animate={{
            x: ['10%', '-5%', '10%'],
            y: ['5%', '-10%', '5%'],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl relative z-10"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors backdrop-blur-sm border border-zinc-700/50"
          >
            ←
          </button>
          <motion.span 
            className="text-3xl"
            animate={{ y: [0, -2, 0], rotate: [-2, 2, -2] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            🐣
          </motion.span>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{templateIcon}</span>
            <div>
              <h1 className="text-2xl font-bold text-white">Brand Your {templateName}</h1>
              <p className="text-sm text-zinc-500">Set your brand identity before building</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column - Brand Info */}
          <div className="space-y-4">
            {/* Brand Name & Tagline */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-4"
            >
              <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <span>✏️</span> Brand Identity
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Brand / Company Name *</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g., Acme Inc, TechFlow, MyStartup"
                    className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Tagline (optional)</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g., Build faster, ship smarter"
                    className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            </motion.div>

            {/* Logo Upload */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-4"
            >
              <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <span>🖼️</span> Logo (optional)
              </h3>
              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer">
                  <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                    logoPreview ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-zinc-700 hover:border-zinc-600'
                  }`}>
                    {logoPreview ? (
                      <div className="flex items-center justify-center gap-3">
                        <img src={logoPreview} alt="Logo preview" className="h-8 w-auto object-contain" />
                        <span className="text-xs text-emerald-400">✓</span>
                      </div>
                    ) : (
                      <>
                        <div className="text-xl mb-1">📤</div>
                        <p className="text-xs text-zinc-400">Upload logo</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                {logoPreview && (
                  <button
                    onClick={() => setLogoPreview(null)}
                    className="text-sm text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </motion.div>

            {/* Color Palette */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-4"
            >
              <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <span>🎨</span> Color Palette
              </h3>
              
              {/* Preset Colors */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedColorPreset(preset.id)
                      setUseCustomColors(false)
                    }}
                    className={`p-2.5 rounded-lg border transition-all ${
                      selectedColorPreset === preset.id && !useCustomColors
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex gap-1 mb-1.5 justify-center">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primary }} />
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.secondary }} />
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.accent }} />
                    </div>
                    <div className="text-xs font-medium text-white">{preset.name}</div>
                    <div className="text-[11px] text-zinc-500">{preset.description}</div>
                  </button>
                ))}
              </div>

              {/* Custom Colors Toggle */}
              <button
                onClick={() => setUseCustomColors(!useCustomColors)}
                className={`w-full p-2.5 rounded-lg border text-xs transition-all ${
                  useCustomColors
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                {useCustomColors ? '✓ Using custom colors' : '+ Set custom colors'}
              </button>

              {/* Custom Color Inputs */}
              <AnimatePresence>
                {useCustomColors && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-3 overflow-hidden"
                  >
                    {[
                      { key: 'primary', label: 'Primary' },
                      { key: 'secondary', label: 'Secondary' },
                      { key: 'accent', label: 'Accent' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-3">
                        <input
                          type="color"
                          value={customColors[key as keyof typeof customColors]}
                          onChange={(e) => setCustomColors(prev => ({ ...prev, [key]: e.target.value }))}
                          className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <div className="flex-1">
                          <div className="text-sm text-white">{label}</div>
                          <div className="text-xs text-zinc-500">{customColors[key as keyof typeof customColors]}</div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Right Column - Style Options */}
          <div className="space-y-4">
            {/* Font Style */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-4"
            >
              <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <span>🔤</span> Font Style
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {fontStyles.map((font) => (
                  <button
                    key={font.id}
                    onClick={() => setSelectedFont(font.id)}
                    className={`p-3 rounded-xl border transition-all text-left ${
                      selectedFont === font.id
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    <div 
                      className="text-2xl mb-1 text-white"
                      style={{ fontFamily: font.fontFamily }}
                    >
                      {font.preview}
                    </div>
                    <div className="text-xs font-medium text-white">{font.name}</div>
                    <div className="text-[11px] text-zinc-500">{font.description}</div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Style Vibe */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-4"
            >
              <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <span>✨</span> Overall Vibe
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {styleVibes.map((vibe) => (
                  <button
                    key={vibe.id}
                    onClick={() => setSelectedVibe(vibe.id)}
                    className={`p-2.5 rounded-lg border transition-all text-center ${
                      selectedVibe === vibe.id
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    <div className="text-lg mb-0.5">{vibe.emoji}</div>
                    <div className="text-xs font-medium text-white">{vibe.name}</div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Preview Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-4"
            >
              <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <span>👁️</span> Preview
              </h3>
              <div 
                className="rounded-xl p-6 border"
                style={{ 
                  backgroundColor: `${currentColors.secondary}20`,
                  borderColor: `${currentColors.primary}30`
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="h-8 w-auto" />
                  ) : (
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: currentColors.primary }}
                    >
                      {brandName ? brandName[0]?.toUpperCase() : 'A'}
                    </div>
                  )}
                  <span 
                    className="font-semibold"
                    style={{ 
                      color: currentColors.primary,
                      fontFamily: fontStyles.find(f => f.id === selectedFont)?.fontFamily
                    }}
                  >
                    {brandName || 'Your Brand'}
                  </span>
                </div>
                {tagline && (
                  <p className="text-sm text-zinc-400 mb-4">{tagline}</p>
                )}
                <div className="flex gap-2">
                  <button 
                    className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                    style={{ backgroundColor: currentColors.primary }}
                  >
                    Get Started
                  </button>
                  <button 
                    className="px-4 py-2 rounded-lg text-sm font-medium border"
                    style={{ 
                      color: currentColors.primary,
                      borderColor: currentColors.primary
                    }}
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <button
            onClick={handleSubmit}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Continue to Section Builder →
          </button>
          <p className="text-center text-sm text-zinc-500 mt-3">
            You can always adjust branding later. This helps AI generate consistent designs.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
