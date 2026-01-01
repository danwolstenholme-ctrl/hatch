'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import HatchCharacter from './HatchCharacter'

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
  
  // AI Logo Generation state
  const [logoPrompt, setLogoPrompt] = useState('')
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false)
  const [generatedLogos, setGeneratedLogos] = useState<string[]>([])
  const [logoError, setLogoError] = useState<string | null>(null)
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

  // AI Logo Generation
  const generateLogo = async () => {
    if (!logoPrompt.trim() && !brandName.trim()) {
      setLogoError('Enter a description or brand name first')
      return
    }
    
    setIsGeneratingLogo(true)
    setLogoError(null)
    
    try {
      const response = await fetch('/api/generate-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: logoPrompt || `A logo for ${brandName}${tagline ? ` - ${tagline}` : ''}`,
          style: selectedVibe
        })
      })
      
      const data = await response.json()
      
      if (data.success && data.image) {
        setGeneratedLogos(prev => [data.image, ...prev.slice(0, 3)]) // Keep last 4
        setLogoPreview(data.image)
      } else {
        setLogoError(data.error || 'Failed to generate logo')
      }
    } catch {
      setLogoError('Failed to connect to AI')
    } finally {
      setIsGeneratingLogo(false)
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

  // Skip branding - use defaults
  const handleSkip = () => {
    localStorage.removeItem(STORAGE_KEY)
    onComplete({
      brandName: 'My Project',
      tagline: undefined,
      logoUrl: undefined,
      colorPreset: 'modern',
      colors: {
        primary: '#3B82F6',
        secondary: '#1E293B',
        accent: '#10B981',
      },
      fontStyle: 'clean',
      styleVibe: 'minimal',
    })
  }

  const currentColors = useCustomColors 
    ? customColors 
    : colorPresets.find(p => p.id === selectedColorPreset) || colorPresets[0]

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated gradient background - simplified on mobile for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Static gradient on mobile */}
        <div 
          className="md:hidden absolute inset-0" 
          style={{ background: `radial-gradient(ellipse at 30% 20%, ${currentColors.primary}15 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, ${currentColors.accent}10 0%, transparent 50%)` }}
        />
        {/* Animated on desktop */}
        <motion.div
          className="hidden md:block absolute w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{ backgroundColor: `${currentColors.primary}20` }}
          animate={{
            x: ['-10%', '5%', '-10%'],
            y: ['-10%', '10%', '-10%'],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="hidden md:block absolute w-[500px] h-[500px] rounded-full blur-[100px]"
          style={{ backgroundColor: `${currentColors.accent}15`, top: '30%', right: '-10%' }}
          animate={{
            x: ['10%', '-5%', '10%'],
            y: ['5%', '-10%', '5%'],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onBack}
              className="w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-zinc-800/80 hover:bg-zinc-700 active:bg-zinc-600 flex items-center justify-center text-zinc-400 hover:text-white transition-colors backdrop-blur-sm border border-zinc-700/50 min-w-[44px] min-h-[44px]"
              aria-label="Go back"
            >
              ←
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl">{templateIcon}</span>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Brand Your {templateName}</h1>
                <p className="text-xs sm:text-sm text-zinc-500">Optional — helps AI generate consistent designs</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="self-end sm:self-auto text-sm text-zinc-500 hover:text-zinc-300 active:text-white transition-colors py-2 px-3 -mr-3 min-h-[44px] flex items-center"
          >
            Skip for now →
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column - Brand Info */}
          <div className="space-y-4">
            {/* Brand Name & Tagline */}
            <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-4">
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
                    className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Tagline (optional)</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g., Build faster, ship smarter"
                    className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Logo - Upload or Generate */}
            <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-4">
              <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <span>🖼️</span> Logo
              </h3>
              
              {/* Current Logo Preview */}
              {logoPreview && (
                <div className="mb-3 p-3 bg-zinc-800/50 rounded-lg flex items-center gap-3">
                  <div className="relative h-12 w-12">
                    <Image 
                      src={logoPreview} 
                      alt="Logo preview" 
                      fill
                      className="object-contain rounded"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-purple-400">✓ Logo selected</p>
                  </div>
                  <button
                    onClick={() => setLogoPreview(null)}
                    className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}
              
              {/* AI Generation */}
              <div className="space-y-2 mb-3">
                <label className="block text-xs text-zinc-400">Generate with AI ✨</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={logoPrompt}
                    onChange={(e) => setLogoPrompt(e.target.value)}
                    placeholder={brandName ? `Logo for ${brandName}...` : "Describe your logo idea..."}
                    className="flex-1 px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500/50"
                    disabled={isGeneratingLogo}
                  />
                  <button
                    onClick={generateLogo}
                    disabled={isGeneratingLogo || (!logoPrompt.trim() && !brandName.trim())}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white transition-all flex items-center gap-2 min-h-[44px]"
                  >
                    {isGeneratingLogo ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <>
                        <span>🎨</span>
                        <span className="hidden sm:inline">Generate</span>
                      </>
                    )}
                  </button>
                </div>
                {logoError && (
                  <p className="text-xs text-red-400">{logoError}</p>
                )}
              </div>
              
              {/* Generated Logo History */}
              {generatedLogos.length > 0 && (
                <div className="mb-3">
                  <label className="block text-xs text-zinc-400 mb-2">Generated logos (click to select)</label>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {generatedLogos.map((logo, i) => (
                      <button
                        key={i}
                        onClick={() => setLogoPreview(logo)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all relative ${
                          logoPreview === logo ? 'border-purple-500 ring-2 ring-purple-500/30' : 'border-zinc-700 hover:border-zinc-600'
                        }`}
                      >
                        <Image 
                          src={logo} 
                          alt={`Generated ${i + 1}`} 
                          fill
                          className="object-contain bg-zinc-800"
                          unoptimized
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Upload Option */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">or</span>
                <label className="cursor-pointer text-xs text-purple-400 hover:text-purple-300 transition-colors">
                  upload your own
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Color Palette */}
            <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-4">
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
                        ? 'border-purple-500 bg-purple-500/10'
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
                    ? 'border-purple-500 bg-purple-500/10 text-purple-400'
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
            </div>
          </div>

          {/* Right Column - Style Options */}
          <div className="space-y-4">
            {/* Font Style */}
            <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-4">
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
                        ? 'border-purple-500 bg-purple-500/10'
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
            </div>

            {/* Style Vibe */}
            <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-4">
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
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    <div className="text-lg mb-0.5">{vibe.emoji}</div>
                    <div className="text-xs font-medium text-white">{vibe.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview Card */}
            <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-4">
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
                    <div className="relative h-8 w-auto min-w-[32px]">
                      <Image 
                        src={logoPreview} 
                        alt="Logo" 
                        width={32}
                        height={32}
                        className="h-8 w-auto object-contain"
                        unoptimized
                      />
                    </div>
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
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSkip}
            className="sm:w-auto px-6 py-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-all border border-zinc-700"
          >
            Skip Branding
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-lg shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {brandName || logoPreview ? 'Continue with Branding →' : 'Continue →'}
          </button>
        </div>
        <p className="text-center text-sm text-zinc-500 mt-3">
          No pressure — you can always set this up later
        </p>
      </div>
    </div>
  )
}
