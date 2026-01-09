'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

// Standard homepage sections - always included
const CORE_SECTIONS = [
  { id: 'header', name: 'Header', desc: 'Navigation bar', pinned: 'top' },
  { id: 'hero', name: 'Hero', desc: 'Main banner with headline' },
  { id: 'cta', name: 'CTA', desc: 'Call to action' },
  { id: 'footer', name: 'Footer', desc: 'Site footer', pinned: 'bottom' },
]

// Optional homepage add-on sections
const ADDON_SECTIONS = [
  { id: 'features', name: 'Features', desc: 'Feature grid or list' },
  { id: 'testimonials', name: 'Testimonials', desc: 'Customer reviews' },
]

// Additional page types with default sections
const PAGE_TYPES = [
  { id: 'about', name: 'About', desc: 'Tell your story', sections: ['header', 'about-hero', 'team', 'values', 'cta', 'footer'] },
  { id: 'services', name: 'Services', desc: 'What you offer', sections: ['header', 'services-hero', 'services-grid', 'cta', 'footer'] },
  { id: 'pricing', name: 'Pricing', desc: 'Plans & pricing', sections: ['header', 'pricing-hero', 'pricing-table', 'faq', 'cta', 'footer'] },
  { id: 'contact', name: 'Contact', desc: 'Get in touch', sections: ['header', 'contact-hero', 'contact-form', 'footer'] },
  { id: 'faq', name: 'FAQ', desc: 'Common questions', sections: ['header', 'faq-hero', 'faq-list', 'cta', 'footer'] },
  { id: 'portfolio', name: 'Portfolio', desc: 'Showcase work', sections: ['header', 'portfolio-hero', 'portfolio-grid', 'cta', 'footer'] },
]

const FONT_OPTIONS = [
  // Sans-serif (modern, clean)
  { value: 'Inter', label: 'Inter', style: 'Clean, versatile' },
  { value: 'DM Sans', label: 'DM Sans', style: 'Friendly, geometric' },
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', style: 'Modern, professional' },
  { value: 'Outfit', label: 'Outfit', style: 'Geometric, contemporary' },
  { value: 'Manrope', label: 'Manrope', style: 'Semi-rounded, readable' },
  { value: 'Space Grotesk', label: 'Space Grotesk', style: 'Technical, bold' },
  { value: 'Sora', label: 'Sora', style: 'Futuristic, clean' },
  // Serif (elegant, editorial)
  { value: 'Playfair Display', label: 'Playfair Display', style: 'Elegant, editorial' },
  { value: 'Fraunces', label: 'Fraunces', style: 'Soft serif, quirky' },
  { value: 'Libre Baskerville', label: 'Libre Baskerville', style: 'Classic, trustworthy' },
  // Display/Statement
  { value: 'Clash Display', label: 'Clash Display', style: 'Bold, impactful' },
  { value: 'Cabinet Grotesk', label: 'Cabinet Grotesk', style: 'Strong, modern' },
]

type Step = 'info' | 'brand' | 'sections' | 'pages' | 'review'

export default function NewProjectPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('info')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  // Step 1: Info
  const [siteName, setSiteName] = useState('')
  const [siteDescription, setSiteDescription] = useState('')

  // Step 2: Brand
  const [primaryColor, setPrimaryColor] = useState('#10b981')
  const [secondaryColor, setSecondaryColor] = useState('#059669')
  const [accentColor, setAccentColor] = useState('#34d399')
  const [bodyFont, setBodyFont] = useState('Inter')
  const [headingFont, setHeadingFont] = useState('Inter')
  const [mode, setMode] = useState<'dark' | 'light'>('dark')
  const [logoUrl, setLogoUrl] = useState('')
  const [showHeadingFontDropdown, setShowHeadingFontDropdown] = useState(false)
  const [showBodyFontDropdown, setShowBodyFontDropdown] = useState(false)

  // Step 3: Sections (add-ons only, core is always included)
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['features'])

  // Step 4: Additional pages
  const [selectedPages, setSelectedPages] = useState<string[]>([])

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id)
        : [...prev, id]
    )
  }

  const togglePage = (id: string) => {
    setSelectedPages(prev => {
      if (prev.includes(id)) return prev.filter(p => p !== id)
      if (prev.length >= 4) return prev // Max 4 additional pages
      return [...prev, id]
    })
  }
  
  // Build final homepage sections list
  const getFinalSections = () => {
    const addonOrder = ADDON_SECTIONS.map(s => s.id)
    const orderedAddons = [...selectedAddons].sort((a, b) => addonOrder.indexOf(a) - addonOrder.indexOf(b))
    return ['header', 'hero', ...orderedAddons, 'cta', 'footer']
  }

  // Build full site structure for Supabase
  const getSiteStructure = () => {
    const pages = [
      { type: 'home', route: '/', sections: getFinalSections() },
      ...selectedPages.map(pageId => {
        const pageType = PAGE_TYPES.find(p => p.id === pageId)!
        return { type: pageId, route: `/${pageId}`, sections: pageType.sections }
      })
    ]
    return pages
  }

  const canProceed = () => {
    if (step === 'info') return siteName.trim().length > 0
    if (step === 'brand') return true
    if (step === 'sections') return true // Core sections always satisfy minimum
    if (step === 'pages') return true // Pages are optional
    if (step === 'review') return true
    return false
  }

  const nextStep = () => {
    if (step === 'info') setStep('brand')
    else if (step === 'brand') setStep('sections')
    else if (step === 'sections') setStep('pages')
    else if (step === 'pages') setStep('review')
  }

  const prevStep = () => {
    if (step === 'brand') setStep('info')
    else if (step === 'sections') setStep('brand')
    else if (step === 'pages') setStep('sections')
    else if (step === 'review') setStep('pages')
  }

  const handleCreate = async () => {
    if (!siteName.trim()) return
    setCreating(true)
    setError('')

    try {
      const siteStructure = getSiteStructure()

      const res = await fetch('/api/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: siteName.trim(),
          description: siteDescription.trim(),
          templateId: 'website',
          brandConfig: {
            brandName: siteName.trim(),
            colors: {
              primary: primaryColor,
              secondary: secondaryColor,
              accent: accentColor,
            },
            fontStyle: bodyFont,
            headingFont: headingFont,
            styleVibe: 'modern',
            mode: mode,
            logoUrl: logoUrl.trim() || undefined,
            seo: {
              title: siteName.trim(),
              description: siteDescription.trim(),
              keywords: '',
            },
          },
          pages: siteStructure, // Full site skeleton
          sections: siteStructure[0].sections, // Homepage sections for backwards compat
        }),
      })

      const data = await res.json()

      if (res.ok && data.project) {
        router.push(`/builder?project=${data.project.id}`)
      } else if (res.status === 403) {
        router.push('/dashboard/billing')
      } else {
        setError(data.error || 'Failed to create project')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setCreating(false)
    }
  }

  const stepNumber = step === 'info' ? 1 : step === 'brand' ? 2 : step === 'sections' ? 3 : step === 'pages' ? 4 : 5

  return (
    <div className="space-y-4 max-w-md">
      {/* Header */}
      <div>
        <Link href="/dashboard/projects" className="text-[11px] text-zinc-500 hover:text-zinc-300 mb-1 block">
          ← Back
        </Link>
        <h1 className="text-sm font-medium text-white">New Project</h1>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => {
          const stepMap: Record<number, Step> = { 1: 'info', 2: 'brand', 3: 'sections', 4: 'pages', 5: 'review' }
          const canClick = n < stepNumber // Can only go back to completed steps
          return (
            <div key={n} className="flex items-center gap-1.5">
              <button
                onClick={() => canClick && setStep(stepMap[n])}
                disabled={!canClick}
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium transition-colors ${
                  n < stepNumber ? 'bg-emerald-500 text-white hover:bg-emerald-400 cursor-pointer' :
                  n === stepNumber ? 'bg-white text-black cursor-default' :
                  'bg-zinc-800 text-zinc-500 cursor-default'
                }`}
              >
                {n < stepNumber ? '✓' : n}
              </button>
              {n < 5 && <div className={`w-4 h-px ${n < stepNumber ? 'bg-emerald-500' : 'bg-zinc-800'}`} />}
            </div>
          )
        })}
        <span className="text-[10px] text-zinc-500 ml-1">
          {step === 'info' ? 'Info' : step === 'brand' ? 'Brand' : step === 'sections' ? 'Home' : step === 'pages' ? 'Pages' : 'Review'}
        </span>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.15 }}
        >
          {step === 'info' && (
            <div className="space-y-3">
              <div className="border border-zinc-800/50 rounded-md p-4 bg-zinc-900/30">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Site Name *</label>
                    <input
                      type="text"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      placeholder="My Awesome Site"
                      className="w-full px-3 py-1.5 text-xs bg-zinc-800/50 border border-zinc-700/50 rounded text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Description</label>
                    <textarea
                      value={siteDescription}
                      onChange={(e) => setSiteDescription(e.target.value)}
                      placeholder="Brief description..."
                      rows={2}
                      className="w-full px-3 py-1.5 text-xs bg-zinc-800/50 border border-zinc-700/50 rounded text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'brand' && (
            <div className="space-y-3">
              {/* Colors */}
              <div className="border border-zinc-800/50 rounded-md p-4 bg-zinc-900/30">
                <h3 className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Colors</h3>
                <p className="text-[10px] text-zinc-600 mb-3">The AI uses these exact colors for buttons, backgrounds, and accents.</p>
                <div className="flex gap-2">
                  {[
                    { label: 'Primary', value: primaryColor, set: setPrimaryColor },
                    { label: 'Secondary', value: secondaryColor, set: setSecondaryColor },
                    { label: 'Accent', value: accentColor, set: setAccentColor },
                  ].map((color) => (
                    <div key={color.label} className="flex-1">
                      <label className="text-[10px] text-zinc-500 block mb-1">{color.label}</label>
                      <div className="flex items-center gap-1">
                        <div className="relative">
                          <input
                            type="color"
                            value={color.value}
                            onChange={(e) => color.set(e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 opacity-0 absolute inset-0"
                            title={`${color.label} color`}
                          />
                          <div 
                            className="w-6 h-6 rounded border border-zinc-700 cursor-pointer"
                            style={{ backgroundColor: color.value }}
                          />
                        </div>
                        <input
                          type="text"
                          value={color.value}
                          onChange={(e) => color.set(e.target.value)}
                          className="w-16 px-1.5 py-0.5 text-[9px] bg-transparent border border-zinc-700/50 rounded text-zinc-500 font-mono uppercase"
                          title={`${color.label} hex`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Logo */}
              <div className="border border-zinc-800/50 rounded-md p-4 bg-zinc-900/30">
                <h3 className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Logo</h3>
                <p className="text-[10px] text-zinc-600 mb-2">Optional. Paste a URL or leave blank for text logo.</p>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.svg"
                  className="w-full px-2 py-1.5 text-xs bg-zinc-800/50 border border-zinc-700/50 rounded text-zinc-200 placeholder:text-zinc-600"
                  title="Logo URL"
                />
              </div>

              {/* Typography */}
              <div className="border border-zinc-800/50 rounded-md p-4 bg-zinc-900/30">
                <h3 className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Typography</h3>
                <p className="text-[10px] text-zinc-600 mb-3">Your fonts are referenced in every generated component.</p>
                <div className="flex gap-3">
                  {/* Headings Font */}
                  <div className="flex-1 relative">
                    <label className="text-xs text-zinc-400 block mb-1">Headings</label>
                    <button
                      type="button"
                      onClick={() => { setShowHeadingFontDropdown(!showHeadingFontDropdown); setShowBodyFontDropdown(false) }}
                      className="w-full px-2 py-1.5 text-xs bg-zinc-800/50 border border-zinc-700/50 rounded text-zinc-200 text-left flex items-center justify-between"
                    >
                      <span>{headingFont}</span>
                      <span className="text-zinc-500">▾</span>
                    </button>
                    {showHeadingFontDropdown && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowHeadingFontDropdown(false)} />
                        <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700/50 rounded shadow-xl z-50 max-h-48 overflow-y-auto">
                          {FONT_OPTIONS.map(f => (
                            <button
                              key={f.value}
                              type="button"
                              onClick={() => { setHeadingFont(f.value); setShowHeadingFontDropdown(false) }}
                              className={`w-full px-2 py-1.5 text-left text-xs hover:bg-zinc-800 transition-colors flex justify-between items-center ${
                                headingFont === f.value ? 'text-emerald-400 bg-zinc-800/50' : 'text-zinc-300'
                              }`}
                            >
                              <span>{f.label}</span>
                              <span className="text-[9px] text-zinc-500">{f.style}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  {/* Body Font */}
                  <div className="flex-1 relative">
                    <label className="text-xs text-zinc-400 block mb-1">Body</label>
                    <button
                      type="button"
                      onClick={() => { setShowBodyFontDropdown(!showBodyFontDropdown); setShowHeadingFontDropdown(false) }}
                      className="w-full px-2 py-1.5 text-xs bg-zinc-800/50 border border-zinc-700/50 rounded text-zinc-200 text-left flex items-center justify-between"
                    >
                      <span>{bodyFont}</span>
                      <span className="text-zinc-500">▾</span>
                    </button>
                    {showBodyFontDropdown && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowBodyFontDropdown(false)} />
                        <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700/50 rounded shadow-xl z-50 max-h-48 overflow-y-auto">
                          {FONT_OPTIONS.map(f => (
                            <button
                              key={f.value}
                              type="button"
                              onClick={() => { setBodyFont(f.value); setShowBodyFontDropdown(false) }}
                              className={`w-full px-2 py-1.5 text-left text-xs hover:bg-zinc-800 transition-colors flex justify-between items-center ${
                                bodyFont === f.value ? 'text-emerald-400 bg-zinc-800/50' : 'text-zinc-300'
                              }`}
                            >
                              <span>{f.label}</span>
                              <span className="text-[9px] text-zinc-500">{f.style}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Mode */}
              <div className="border border-zinc-800/50 rounded-md p-4 bg-zinc-900/30">
                <h3 className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Mode</h3>
                <p className="text-[10px] text-zinc-600 mb-2">Sets the default background and text contrast.</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setMode('dark')}
                    className={`px-3 py-1 text-[10px] rounded transition-all ${
                      mode === 'dark'
                        ? 'bg-zinc-700 text-white'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => setMode('light')}
                    className={`px-3 py-1 text-[10px] rounded transition-all ${
                      mode === 'light'
                        ? 'bg-zinc-700 text-white'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Light
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'sections' && (
            <div className="space-y-3">
              {/* Core sections - always included */}
              <div className="border border-zinc-800/50 rounded-md p-4 bg-zinc-900/30">
                <h3 className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Standard Homepage</h3>
                <p className="text-[10px] text-zinc-600 mb-2">Every site gets these essentials.</p>
                
                <div className="space-y-1">
                  {CORE_SECTIONS.map((section) => (
                    <div
                      key={section.id}
                      className="flex items-center justify-between px-3 py-2 rounded bg-zinc-800/30 border border-zinc-700/30"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-sm bg-emerald-500 border-emerald-500 flex items-center justify-center">
                          <span className="text-[8px] text-white">✓</span>
                        </div>
                        <span className="text-xs text-white">{section.name}</span>
                        <span className="text-[10px] text-zinc-600">{section.desc}</span>
                      </div>
                      {section.pinned && (
                        <span className="text-[9px] text-zinc-600">
                          {section.pinned === 'top' ? 'first' : 'last'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add-on sections */}
              <div className="border border-zinc-800/50 rounded-md p-4 bg-zinc-900/30">
                <h3 className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Add-ons</h3>
                <p className="text-[10px] text-zinc-600 mb-2">Optional extras for your homepage.</p>
                
                <div className="space-y-1">
                  {ADDON_SECTIONS.map((section) => {
                    const isSelected = selectedAddons.includes(section.id)
                    return (
                      <button
                        key={section.id}
                        onClick={() => toggleAddon(section.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded text-left transition-colors ${
                          isSelected
                            ? 'bg-zinc-800/80 border border-zinc-700/50'
                            : 'bg-zinc-900/30 border border-transparent hover:border-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${
                            isSelected 
                              ? 'bg-emerald-500 border-emerald-500' 
                              : 'border-zinc-600'
                          }`}>
                            {isSelected && <span className="text-[8px] text-white">✓</span>}
                          </div>
                          <span className={`text-xs ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                            {section.name}
                          </span>
                          <span className="text-[10px] text-zinc-600">{section.desc}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 'pages' && (
            <div className="space-y-3">
              <div className="border border-zinc-800/50 rounded-md p-4 bg-zinc-900/30">
                <h3 className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Additional Pages</h3>
                <p className="text-[10px] text-zinc-600 mb-2">Add up to 4 extra pages. Skip if you just want a homepage.</p>
                
                <div className="space-y-1">
                  {PAGE_TYPES.map((page) => {
                    const isSelected = selectedPages.includes(page.id)
                    const isDisabled = !isSelected && selectedPages.length >= 4
                    return (
                      <button
                        key={page.id}
                        onClick={() => togglePage(page.id)}
                        disabled={isDisabled}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded text-left transition-colors ${
                          isSelected
                            ? 'bg-zinc-800/80 border border-zinc-700/50'
                            : isDisabled
                            ? 'bg-zinc-900/30 border border-transparent opacity-40 cursor-not-allowed'
                            : 'bg-zinc-900/30 border border-transparent hover:border-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${
                            isSelected 
                              ? 'bg-emerald-500 border-emerald-500' 
                              : 'border-zinc-600'
                          }`}>
                            {isSelected && <span className="text-[8px] text-white">✓</span>}
                          </div>
                          <span className={`text-xs ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                            {page.name}
                          </span>
                          <span className="text-[10px] text-zinc-600">{page.desc}</span>
                        </div>
                        <span className="text-[9px] text-zinc-600">/{page.id}</span>
                      </button>
                    )
                  })}
                </div>

                <p className="text-[10px] text-zinc-600 mt-3">
                  {selectedPages.length}/4 pages selected
                </p>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-3">
              {/* Ready message */}
              <div className="border border-emerald-500/30 rounded-md p-4 bg-emerald-500/5">
                <h3 className="text-xs font-medium text-emerald-400 mb-1">Ready to build!</h3>
                <p className="text-[10px] text-zinc-400">
                  The AI knows your brand. Every section will use your colors, fonts, and style.
                </p>
              </div>

              {/* Summary */}
              <div className="border border-zinc-800/50 rounded-md p-4 bg-zinc-900/30 space-y-3">
                {/* Site */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Site</p>
                    <p className="text-xs text-white">{siteName}</p>
                    {siteDescription && <p className="text-[10px] text-zinc-500 mt-0.5">{siteDescription}</p>}
                  </div>
                  <button onClick={() => setStep('info')} className="text-[10px] text-zinc-500 hover:text-white">Edit</button>
                </div>

                <div className="border-t border-zinc-800/50" />

                {/* Brand */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1.5">Brand</p>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: primaryColor }} title="Primary" />
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: secondaryColor }} title="Secondary" />
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: accentColor }} title="Accent" />
                      </div>
                      <span className="text-[10px] text-zinc-500">•</span>
                      <span className="text-[10px] text-zinc-400">{headingFont}</span>
                      <span className="text-[10px] text-zinc-500">•</span>
                      <span className="text-[10px] text-zinc-400">{mode}</span>
                    </div>
                    {logoUrl && <p className="text-[10px] text-zinc-500 mt-1">Logo: ✓</p>}
                  </div>
                  <button onClick={() => setStep('brand')} className="text-[10px] text-zinc-500 hover:text-white">Edit</button>
                </div>

                <div className="border-t border-zinc-800/50" />

                {/* Site Structure */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Site Structure</p>
                    <div className="space-y-1.5">
                      {/* Homepage */}
                      <div>
                        <p className="text-[10px] text-white">/ (Home)</p>
                        <p className="text-[9px] text-zinc-500 truncate">
                          {getFinalSections().join(' → ')}
                        </p>
                      </div>
                      {/* Additional pages */}
                      {selectedPages.map(pageId => {
                        const page = PAGE_TYPES.find(p => p.id === pageId)!
                        return (
                          <div key={pageId}>
                            <p className="text-[10px] text-white">/{pageId} ({page.name})</p>
                            <p className="text-[9px] text-zinc-500 truncate">
                              {page.sections.join(' → ')}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <button onClick={() => setStep('sections')} className="text-[10px] text-zinc-500 hover:text-white ml-2">Edit</button>
                </div>
              </div>

              {/* Note */}
              <p className="text-[10px] text-zinc-600">
                {1 + selectedPages.length} page{selectedPages.length > 0 ? 's' : ''} • Add more sections and pages in the builder.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {/* Navigation */}
      <div className="flex justify-end pt-2">

        {step !== 'review' ? (
          <button
            onClick={nextStep}
            disabled={!canProceed()}
            className="px-4 py-1.5 text-xs font-medium text-black bg-white rounded hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleCreate}
            disabled={creating || !canProceed()}
            className="px-4 py-1.5 text-xs font-medium text-black bg-white rounded hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating...' : 'Create Project'}
          </button>
        )}
      </div>
    </div>
  )
}
