'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Save, Globe, Palette, Type, Image as ImageIcon, 
  Upload, Trash2, Check, ChevronDown
} from 'lucide-react'
import { DbBrandConfig } from '@/lib/supabase'

interface SiteSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  currentBrand?: DbBrandConfig
  onSave: (settings: SiteSettings) => Promise<void>
  projectName?: string
  onProjectNameChange?: (name: string) => Promise<void>
  currentSectionName?: string
  thought?: string
  demoMode?: boolean
  promptsUsed?: number
  promptsLimit?: number
  onUpgrade?: () => void
}

export interface SiteSettings {
  seo: {
    title: string
    description: string
    keywords: string
  }
  brand: {
    primaryColor: string
    secondaryColor: string
    font: string
    headingFont: string
    mode: 'dark' | 'light'
    logo?: string
  }
  integrations: {
    formspreeId: string
  }
}

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter', category: 'Sans-Serif', preview: 'Modern & Clean' },
  { value: 'DM Sans', label: 'DM Sans', category: 'Sans-Serif', preview: 'Friendly' },
  { value: 'Space Grotesk', label: 'Space Grotesk', category: 'Sans-Serif', preview: 'Geometric' },
  { value: 'Outfit', label: 'Outfit', category: 'Sans-Serif', preview: 'Contemporary' },
  { value: 'Sora', label: 'Sora', category: 'Sans-Serif', preview: 'Elegant' },
  { value: 'Poppins', label: 'Poppins', category: 'Sans-Serif', preview: 'Rounded' },
  { value: 'Playfair Display', label: 'Playfair Display', category: 'Serif', preview: 'Editorial' },
  { value: 'Fraunces', label: 'Fraunces', category: 'Serif', preview: 'Soft Serif' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono', category: 'Mono', preview: 'Technical' },
]

const COLOR_PRESETS = [
  { name: 'Emerald', primary: '#10b981', secondary: '#059669' },
  { name: 'Blue', primary: '#3b82f6', secondary: '#2563eb' },
  { name: 'Purple', primary: '#8b5cf6', secondary: '#7c3aed' },
  { name: 'Rose', primary: '#f43f5e', secondary: '#e11d48' },
  { name: 'Orange', primary: '#f97316', secondary: '#ea580c' },
  { name: 'Cyan', primary: '#06b6d4', secondary: '#0891b2' },
]

export default function SiteSettingsModal({
  isOpen,
  onClose,
  projectId,
  currentBrand,
  onSave,
  projectName = 'Untitled Project',
  onProjectNameChange,
  demoMode,
  onUpgrade
}: SiteSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'brand' | 'seo'>('general')
  const [isSaving, setIsSaving] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [tempName, setTempName] = useState(projectName)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  
  const [settings, setSettings] = useState<SiteSettings>({
    seo: {
      title: '',
      description: '',
      keywords: ''
    },
    brand: {
      primaryColor: currentBrand?.colors?.primary || '#10b981',
      secondaryColor: currentBrand?.colors?.secondary || '#059669',
      font: currentBrand?.fontStyle || 'Inter',
      headingFont: currentBrand?.fontStyle || 'Inter',
      mode: 'dark',
      logo: undefined
    },
    integrations: {
      formspreeId: ''
    }
  })

  const isDemoPreview = !projectId || !!demoMode

  useEffect(() => {
    if (isOpen) {
      setTempName(projectName)
      const savedSettings = localStorage.getItem(`site_settings_${projectId}`)
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      } else if (currentBrand) {
        setSettings(prev => ({
          ...prev,
          seo: {
            title: currentBrand.seo?.title || prev.seo.title,
            description: currentBrand.seo?.description || prev.seo.description,
            keywords: currentBrand.seo?.keywords || prev.seo.keywords
          },
          brand: {
            primaryColor: currentBrand.colors?.primary || prev.brand.primaryColor,
            secondaryColor: currentBrand.colors?.secondary || prev.brand.secondaryColor,
            font: currentBrand.fontStyle || prev.brand.font,
            headingFont: currentBrand.fontStyle || prev.brand.headingFont,
            mode: 'dark',
            logo: currentBrand.logoUrl || undefined
          }
        }))
      }
    }
  }, [isOpen, projectId, currentBrand, projectName])

  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus()
      nameInputRef.current.select()
    }
  }, [editingName])

  const handleNameSave = async () => {
    if (tempName.trim() && tempName !== projectName) {
      await onProjectNameChange?.(tempName.trim())
    }
    setEditingName(false)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSettings(prev => ({
          ...prev,
          brand: { ...prev.brand, logo: reader.result as string }
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      localStorage.setItem(`site_settings_${projectId}`, JSON.stringify(settings))
      await onSave(settings)
      onClose()
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: 'general' as const, label: 'General', icon: Globe },
    { id: 'brand' as const, label: 'Brand', icon: Palette },
    { id: 'seo' as const, label: 'SEO', icon: Type },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Logo Preview */}
                  <div 
                    className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden cursor-pointer hover:border-zinc-600 transition-colors"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    {settings.brand.logo ? (
                      <img src={settings.brand.logo} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-zinc-500" />
                    )}
                  </div>
                  <input 
                    ref={logoInputRef}
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleLogoUpload}
                  />
                  
                  {/* Project Name */}
                  <div>
                    {editingName ? (
                      <input
                        ref={nameInputRef}
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onBlur={handleNameSave}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleNameSave()
                          if (e.key === 'Escape') {
                            setTempName(projectName)
                            setEditingName(false)
                          }
                        }}
                        className="text-xl font-semibold text-white bg-transparent border-b-2 border-emerald-500 outline-none px-0 py-1"
                      />
                    ) : (
                      <h2 
                        className="text-xl font-semibold text-white cursor-pointer hover:text-zinc-300 transition-colors"
                        onClick={() => !isDemoPreview && setEditingName(true)}
                        title={isDemoPreview ? 'Sign in to edit' : 'Click to edit'}
                      >
                        {projectName}
                      </h2>
                    )}
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {isDemoPreview ? 'Demo Mode' : 'Project Settings'}
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={onClose} 
                  className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Tabs */}
              <div className="flex gap-1 mt-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-zinc-800 text-white'
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {isDemoPreview ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-4">
                    <Palette className="w-8 h-8 text-zinc-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Settings require an account</h3>
                  <p className="text-sm text-zinc-400 mb-6 max-w-sm mx-auto">
                    Sign up to save your brand colors, fonts, SEO settings, and more.
                  </p>
                  <button
                    onClick={() => onUpgrade?.()}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg transition-colors"
                  >
                    Create Free Account
                  </button>
                </div>
              ) : (
                <>
                  {/* General Tab */}
                  {activeTab === 'general' && (
                    <div className="space-y-6">
                      {/* Logo Upload */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-3">Site Logo</label>
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-24 h-24 rounded-xl bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center overflow-hidden cursor-pointer hover:border-zinc-600 transition-colors group"
                            onClick={() => logoInputRef.current?.click()}
                          >
                            {settings.brand.logo ? (
                              <img src={settings.brand.logo} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                              <div className="text-center">
                                <Upload className="w-6 h-6 text-zinc-500 mx-auto group-hover:text-zinc-400 transition-colors" />
                                <span className="text-[10px] text-zinc-500 mt-1 block">Upload</span>
                              </div>
                            )}
                          </div>
                          {settings.brand.logo && (
                            <button
                              onClick={() => setSettings(prev => ({ ...prev, brand: { ...prev.brand, logo: undefined } }))}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 mt-2">PNG, SVG, or JPG. Max 2MB.</p>
                      </div>

                      {/* Site Title for Header */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Site Title</label>
                        <input
                          type="text"
                          value={settings.seo.title}
                          onChange={e => setSettings({...settings, seo: {...settings.seo, title: e.target.value}})}
                          placeholder="My Awesome Website"
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                        />
                        <p className="text-xs text-zinc-500 mt-1">Used in browser tab and as fallback if no logo.</p>
                      </div>
                    </div>
                  )}

                  {/* Brand Tab */}
                  {activeTab === 'brand' && (
                    <div className="space-y-6">
                      {/* Color Presets */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-3">Color Palette</label>
                        <div className="grid grid-cols-6 gap-2 mb-4">
                          {COLOR_PRESETS.map((preset) => (
                            <button
                              key={preset.name}
                              onClick={() => setSettings({
                                ...settings, 
                                brand: { 
                                  ...settings.brand, 
                                  primaryColor: preset.primary,
                                  secondaryColor: preset.secondary
                                }
                              })}
                              className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                                settings.brand.primaryColor === preset.primary 
                                  ? 'border-white scale-105' 
                                  : 'border-transparent hover:border-zinc-600'
                              }`}
                              title={preset.name}
                            >
                              <div 
                                className="absolute inset-0" 
                                style={{ background: `linear-gradient(135deg, ${preset.primary} 0%, ${preset.secondary} 100%)` }}
                              />
                              {settings.brand.primaryColor === preset.primary && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                        
                        {/* Custom Color Pickers */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-zinc-500 mb-2">Primary</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={settings.brand.primaryColor}
                                onChange={e => setSettings({...settings, brand: {...settings.brand, primaryColor: e.target.value}})}
                                className="w-10 h-10 rounded-lg cursor-pointer border border-zinc-700 bg-transparent"
                              />
                              <input
                                type="text"
                                value={settings.brand.primaryColor}
                                onChange={e => setSettings({...settings, brand: {...settings.brand, primaryColor: e.target.value}})}
                                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono text-sm uppercase"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-zinc-500 mb-2">Secondary</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={settings.brand.secondaryColor}
                                onChange={e => setSettings({...settings, brand: {...settings.brand, secondaryColor: e.target.value}})}
                                className="w-10 h-10 rounded-lg cursor-pointer border border-zinc-700 bg-transparent"
                              />
                              <input
                                type="text"
                                value={settings.brand.secondaryColor}
                                onChange={e => setSettings({...settings, brand: {...settings.brand, secondaryColor: e.target.value}})}
                                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono text-sm uppercase"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Typography */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-3">Typography</label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-zinc-500 mb-2">Headings</label>
                            <div className="relative">
                              <select
                                value={settings.brand.headingFont}
                                onChange={e => setSettings({...settings, brand: {...settings.brand, headingFont: e.target.value}})}
                                className="w-full appearance-none bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none cursor-pointer"
                                style={{ fontFamily: settings.brand.headingFont }}
                              >
                                {FONT_OPTIONS.map((font) => (
                                  <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                                    {font.label}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-zinc-500 mb-2">Body Text</label>
                            <div className="relative">
                              <select
                                value={settings.brand.font}
                                onChange={e => setSettings({...settings, brand: {...settings.brand, font: e.target.value}})}
                                className="w-full appearance-none bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none cursor-pointer"
                                style={{ fontFamily: settings.brand.font }}
                              >
                                {FONT_OPTIONS.map((font) => (
                                  <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                                    {font.label}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Font Preview */}
                        <div className="mt-4 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                          <p className="text-xs text-zinc-500 mb-2">Preview</p>
                          <h3 
                            className="text-2xl font-bold text-white mb-1"
                            style={{ fontFamily: settings.brand.headingFont }}
                          >
                            Heading Text
                          </h3>
                          <p 
                            className="text-sm text-zinc-400"
                            style={{ fontFamily: settings.brand.font }}
                          >
                            This is how your body text will appear across your website sections.
                          </p>
                        </div>
                      </div>

                      {/* Theme Mode */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-3">Theme</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setSettings({...settings, brand: {...settings.brand, mode: 'dark'}})}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              settings.brand.mode === 'dark' 
                                ? 'bg-zinc-800 border-emerald-500' 
                                : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                            }`}
                          >
                            <div className="w-full h-8 bg-zinc-950 rounded-lg mb-2 flex items-center justify-center">
                              <div className="w-16 h-2 bg-zinc-700 rounded" />
                            </div>
                            <span className="text-sm font-medium text-white">Dark Mode</span>
                          </button>
                          <button
                            onClick={() => setSettings({...settings, brand: {...settings.brand, mode: 'light'}})}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              settings.brand.mode === 'light' 
                                ? 'bg-zinc-800 border-emerald-500' 
                                : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                            }`}
                          >
                            <div className="w-full h-8 bg-white rounded-lg mb-2 flex items-center justify-center">
                              <div className="w-16 h-2 bg-zinc-300 rounded" />
                            </div>
                            <span className="text-sm font-medium text-white">Light Mode</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SEO Tab */}
                  {activeTab === 'seo' && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Page Title</label>
                        <input
                          type="text"
                          value={settings.seo.title}
                          onChange={e => setSettings({...settings, seo: {...settings.seo, title: e.target.value}})}
                          placeholder="My Awesome Website"
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                        />
                        <p className="text-xs text-zinc-500 mt-1">Appears in browser tabs and search results.</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Meta Description</label>
                        <textarea
                          value={settings.seo.description}
                          onChange={e => setSettings({...settings, seo: {...settings.seo, description: e.target.value}})}
                          placeholder="A brief description of your website..."
                          rows={3}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none resize-none transition-all"
                        />
                        <p className="text-xs text-zinc-500 mt-1">
                          {settings.seo.description.length}/160 characters
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Keywords</label>
                        <input
                          type="text"
                          value={settings.seo.keywords}
                          onChange={e => setSettings({...settings, seo: {...settings.seo, keywords: e.target.value}})}
                          placeholder="react, website, builder, ai"
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                        />
                        <p className="text-xs text-zinc-500 mt-1">Comma-separated list of keywords.</p>
                      </div>
                      
                      {/* SEO Preview */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-3">Search Preview</label>
                        <div className="p-4 bg-white rounded-xl">
                          <p className="text-[#1a0dab] text-lg font-medium truncate hover:underline cursor-pointer">
                            {settings.seo.title || 'Page Title'}
                          </p>
                          <p className="text-[#006621] text-sm truncate">
                            yoursite.com
                          </p>
                          <p className="text-[#545454] text-sm line-clamp-2 mt-1">
                            {settings.seo.description || 'Your meta description will appear here...'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Footer */}
            {!isDemoPreview && (
              <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/80 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
