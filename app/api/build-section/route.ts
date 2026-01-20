import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { track } from '@vercel/analytics/server'
import { getProjectById, getOrCreateUser, completeSection, checkAndIncrementGeneration } from '@/lib/db'
import { getUserDNA } from '@/lib/db/chronosphere'
import { StyleDNA } from '@/lib/supabase'
import { componentLibrary } from '@/lib/components'

// =============================================================================
// CLAUDE SONNET 4.5 - THE ARCHITECT (BUILDER MODE)
// =============================================================================

// Sanitize code output - fix common AI escape issues that break Babel
function sanitizeCodeOutput(code: string): string {
  if (!code) return code
  return code
    // Fix JSON-escaped strings that weren't properly unescaped
    .replace(/\\"/g, '"')       // Escaped quote \" -> "
    .replace(/\\'/g, "'")       // Escaped single quote \' -> '
    .replace(/\\n/g, '\n')      // Literal \n -> newline
    .replace(/\\t/g, '\t')      // Literal \t -> tab
    .replace(/\\r/g, '')        // Remove \r
    .replace(/\\\\/g, '\\')     // Double backslash \\\\ -> single \\
}

// Build component reference based on section type
function getComponentReference(sectionType: string): string {
  const lib = componentLibrary
  const components: string[] = []
  
  // Map section types to relevant components
  if (sectionType === 'hero') {
    components.push('### Hero Variants\n' + lib.heroes.variants.map(v => 
      `**${v.name}**: ${v.description}`
    ).join('\n'))
    components.push('### Button Styles\n' + lib.buttons.variants.map(v => 
      `**${v.name}**: ${v.description}`
    ).join('\n'))
  } else if (sectionType === 'header' || sectionType === 'nav') {
    components.push('### Navigation Variants\n' + lib.navs.variants.map(v => 
      `**${v.name}**: ${v.description}`
    ).join('\n'))
  } else if (sectionType === 'features' || sectionType === 'services') {
    components.push('### Feature Layouts\n' + lib.features.variants.map(v => 
      `**${v.name}**: ${v.description}`
    ).join('\n'))
    components.push('### Card Styles\n' + lib.cards.variants.map(v => 
      `**${v.name}**: ${v.description}`
    ).join('\n'))
  } else if (sectionType === 'pricing') {
    components.push('### Pricing Layouts\n' + lib.pricing.variants.map(v => 
      `**${v.name}**: ${v.description}`
    ).join('\n'))
  } else if (sectionType === 'testimonials') {
    components.push('### Testimonial Styles\n' + lib.testimonials.variants.map(v => 
      `**${v.name}**: ${v.description}`
    ).join('\n'))
  } else if (sectionType === 'footer') {
    components.push('### Footer Layouts\n' + lib.footers.variants.map(v => 
      `**${v.name}**: ${v.description}`
    ).join('\n'))
  } else if (sectionType === 'contact' || sectionType === 'cta') {
    components.push('### CTA/Contact Styles\n' + lib.ctas.variants.map(v => 
      `**${v.name}**: ${v.description}`
    ).join('\n'))
    components.push('### Form Elements\n' + lib.forms.variants.map(v => 
      `**${v.name}**: ${v.description}`
    ).join('\n'))
  } else {
    // Default: include cards
    components.push('### Card Styles\n' + lib.cards.variants.map(v => 
      `**${v.name}**: ${v.description}`
    ).join('\n'))
  }
  
  if (components.length === 0) return ''
  
  return `\n## COMPONENT REFERENCE (Minimal Style Guide)
Use these patterns as inspiration. Pick ONE variant and customize:

${components.join('\n\n')}

DESIGN RULES:
- Avoid generic SaaS layouts (centered text + gradient + 3 cards)
- Use generous whitespace
- Prefer left-aligned text over centered everything  
- Typography-led design: let the words breathe
- Subtle, intentional animations only
`
}

// Rate limiting: 20 requests per minute per user
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const windowMs = 60_000 // 1 minute
  const maxRequests = 20

  const userData = rateLimitMap.get(userId)
  if (!userData || now > userData.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (userData.count >= maxRequests) {
    return false
  }

  userData.count++
  return true
}

interface BrandConfig {
  brandName: string
  tagline?: string
  logoUrl?: string
  colors: {
    primary: string
    secondary: string
    accent: string
  }
  fontStyle: 'modern' | 'classic' | 'playful' | 'technical'
  styleVibe: 'professional' | 'creative' | 'minimal' | 'bold' | 'elegant' | 'friendly'
}

function buildSystemPrompt(
  sectionName: string,
  sectionDescription: string,
  templateType: string,
  userPrompt: string,
  previousSections: Record<string, string>,
  brandConfig: BrandConfig | null,
  styleDNA: StyleDNA | null,
  sectionPromptHint?: string
): string {
  // Handle sparse/lazy inputs - be VERY aggressive about detecting low-effort prompts
  const lowEffortKeywords = ['test', 'testing', 'demo', 'example', 'sample', 'website', 'site', 'page', 'something', 'anything', 'stuff', 'thing', 'cool', 'nice', 'good', 'idk', 'dunno', 'whatever'];
  const isVeryGeneric = userPrompt.split(/\s+/).length < 5; // Less than 5 words
  const containsLowEffort = lowEffortKeywords.some(w => userPrompt.toLowerCase().includes(w));
  const isSparseInput = userPrompt.length < 30 || (isVeryGeneric && containsLowEffort);
  
  const sparseInstruction = isSparseInput 
    ? `\n## CRITICAL: LOW-EFFORT INPUT DETECTED
The user provided a vague/generic prompt: "${userPrompt}"

DO NOT create something bland or generic. Instead:
1. Pick ONE compelling business from this list and commit to it fully:
   - "Meridian" - A luxury travel agency specializing in private jet experiences
   - "Nexus AI" - A cutting-edge machine learning platform for enterprises  
   - "Atelier Studio" - A boutique brand design agency in Brooklyn
   - "Ember & Oak" - A high-end farm-to-table restaurant
   - "Vertex Capital" - A fintech startup revolutionizing payments
   - "Lumina Health" - A premium wellness and fitness studio
   
2. INVENT specific, premium content:
   - Real-sounding company name, tagline, and mission
   - Concrete services with actual pricing (e.g., "$2,499/month")
   - Specific testimonials with names and companies
   - Real metrics (e.g., "Trusted by 500+ enterprises", "4.9★ rating")
   
3. Make it look like a $10,000 custom website - not a template.

4. Use SPECIFIC text throughout:
   ❌ "Welcome to our website" 
   ✅ "Private Aviation, Perfected. — Meridian connects discerning travelers with the world's finest aircraft."
   
The goal is to WOW the user with specificity. Show them what's possible.`
    : '';

  const componentName = sectionName
    .split(/[\s-_]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('') + 'Section'

  const previousContext = Object.keys(previousSections).length > 0
    ? `\n## PREVIOUS SECTIONS (maintain visual consistency)\n${
        Object.entries(previousSections)
          .map(([id, code]) => `### ${id}\n\`\`\`\n${code.slice(0, 800)}\n\`\`\``)
          .join('\n\n')
      }`
    : ''

  // Build Chronosphere context (User Style DNA)
  let chronosphereContext = ''
  if (styleDNA && styleDNA.evolution_stage > 0) {
    chronosphereContext = `
## THE CHRONOSPHERE (USER STYLE DNA)
This user has a distinct style profile based on past creations. Respect these preferences unless the prompt explicitly overrides them.

- **Vibe Keywords**: ${styleDNA.vibe_keywords.join(', ')}
- **Preferred Colors**: ${styleDNA.preferred_colors.join(', ')}
- **Preferred Fonts**: ${styleDNA.preferred_fonts.join(', ')}
- **Patterns to Avoid**: ${styleDNA.rejected_patterns.join(', ')}
- **Evolution Stage**: ${styleDNA.evolution_stage} (The higher the stage, the more refined/complex their taste)
`
  }

  // Build brand-specific styling instructions
  let brandInstructions = ''
  if (brandConfig) {
    const fontClasses = {
      modern: 'font-sans (clean geometric fonts like Inter/Outfit)',
      classic: 'font-serif (elegant serif fonts like Georgia/Merriweather)',
      playful: 'font-sans with rounded, friendly styling',
      technical: 'font-mono for headers, font-sans for body (techy feel)',
    }[brandConfig.fontStyle]

    const vibeDescriptions = {
      professional: 'Clean, corporate, trustworthy. Subtle animations, structured layouts.',
      creative: 'Artistic, expressive, unique. Asymmetric layouts, bold choices.',
      minimal: 'Ultra-clean, lots of whitespace, essential elements only.',
      bold: 'High contrast, large typography, impactful statements.',
      elegant: 'Refined, luxurious, sophisticated. Subtle gradients, graceful animations.',
      friendly: 'Warm, approachable, welcoming. Rounded corners, soft colors.',
    }[brandConfig.styleVibe]

    brandInstructions = `
## BRAND IDENTITY (USE THESE!)
- **Brand Name**: "${brandConfig.brandName}"${brandConfig.tagline ? `\n- **Tagline**: "${brandConfig.tagline}"` : ''}
- **Primary Color**: ${brandConfig.colors.primary} (use for main CTAs, key elements)
- **Secondary Color**: ${brandConfig.colors.secondary} (use for backgrounds, subtle accents)  
- **Accent Color**: ${brandConfig.colors.accent} (use for highlights, links, hover states)
- **Font Style**: ${fontClasses}
- **Overall Vibe**: ${brandConfig.styleVibe} - ${vibeDescriptions}
${brandConfig.logoUrl ? `- **Logo URL**: ${brandConfig.logoUrl} (use in header/navigation if applicable)` : ''}

IMPORTANT: Apply these colors as Tailwind classes. For custom hex colors, use inline styles:
- style={{ backgroundColor: '${brandConfig.colors.primary}' }}
- style={{ color: '${brandConfig.colors.accent}' }}
Or use CSS variables / Tailwind arbitrary values: bg-[${brandConfig.colors.primary}]
`
    console.log('[build-section] Brand instructions generated:', brandInstructions.slice(0, 500))
  }

  // Forbidden elements per section type - prevents scope bleed
  const forbiddenBySectionType: Record<string, string[]> = {
    header: ['hero banner', 'hero section', 'large headline with CTA below', 'full-width background images', 'pricing table', 'testimonials', 'footer', 'contact form', 'services grid', 'team section', 'FAQ accordion'],
    hero: ['navigation menu', 'nav bar', 'footer', 'pricing table', 'testimonials', 'contact form', 'FAQ accordion', 'team section'],
    services: ['navigation', 'hero banner', 'footer', 'pricing table', 'contact form', 'testimonials'],
    features: ['navigation', 'hero banner', 'footer', 'pricing table', 'contact form', 'testimonials'],
    pricing: ['navigation', 'hero banner', 'footer', 'contact form', 'testimonials', 'services grid'],
    testimonials: ['navigation', 'hero banner', 'footer', 'pricing table', 'contact form', 'services grid'],
    contact: ['navigation', 'hero banner', 'footer', 'pricing table', 'testimonials', 'services grid'],
    footer: ['navigation menu', 'hero banner', 'pricing table', 'testimonials', 'contact form', 'services grid'],
    about: ['navigation', 'footer', 'pricing table', 'contact form'],
    team: ['navigation', 'footer', 'pricing table', 'contact form', 'hero banner'],
    faq: ['navigation', 'footer', 'pricing table', 'hero banner', 'services grid'],
    cta: ['navigation', 'footer', 'full pricing table', 'testimonials grid', 'services grid'],
    gallery: ['navigation', 'footer', 'pricing table', 'contact form', 'hero banner'],
  }

  // What each section type SHOULD contain - explicit scope definition
  const sectionScopeDefinitions: Record<string, string> = {
    header: `A HEADER/NAVIGATION is ONLY:
- A compact horizontal bar (typically 60-80px tall, NEVER more than 100px)
- Logo on the left: either text (text-lg or text-xl max) OR a small image (h-8 max)
- Navigation links (horizontal on desktop, hamburger menu on mobile)
- Optional CTA button on the right (small: px-4 py-2, text-sm)
- Optional glass/blur effect on scroll

HEADER SIZING RULES:
- Total header height: h-16 to h-20 (64-80px)
- Logo text: text-lg or text-xl (NEVER text-2xl or larger)
- Logo image: h-6 to h-8 max (NEVER h-10 or larger)
- Nav links: text-sm (NEVER text-base or larger)
- Hamburger icon: w-5 h-5 or w-6 h-6 (NEVER w-8 or larger)
- Header padding: px-4 or px-6 (NEVER px-8 or larger)
- Use flex items-center justify-between for layout

A HEADER IS NOT a hero section. It should NOT contain large headlines, taglines, feature descriptions, or call-to-action areas below it.`,
    hero: `A HERO SECTION is:
- The first major content section BELOW the header
- Contains the main headline and value proposition
- Usually has a CTA button
- May include an image, illustration, or background
- Takes up significant viewport height (often 80-100vh)
DO NOT include a footer, navigation, or any other section type.`,
    services: `A SERVICES section lists 3-6 service offerings in cards or a grid. Brief descriptions, icons, maybe links to learn more. NO footer, NO navigation.
CRITICAL: Generate REAL service content - actual service names, descriptions, and benefits. Do NOT leave cards empty or use placeholder text.`,
    features: `A FEATURES section highlights key product/service features. Grid of feature cards with icons, titles, and short descriptions. NO footer, NO navigation.
CRITICAL: Generate REAL feature content - actual feature names, descriptions, and icons. Each card MUST have visible text content. Do NOT:
- Leave cards empty
- Use empty arrays
- Use placeholder text like "[Feature Name]" or "Lorem ipsum"
- Skip the icon, title, or description
Example: "Lightning Fast Performance - Our optimized infrastructure delivers sub-100ms response times globally."`,
    pricing: `A PRICING section shows pricing tiers/plans. 2-4 cards with plan names, prices, feature lists, and CTA buttons. NO footer, NO navigation.
CRITICAL: Generate REAL pricing content - actual plan names, prices, and feature lists. Do NOT leave cards empty.`,
    testimonials: `A TESTIMONIALS section shows customer quotes. Cards with quote text, customer name, photo/avatar, and company. NO footer, NO navigation.`,
    contact: `A CONTACT section has a form (name, email, message) and/or contact details (address, phone, email links). NO footer, NO navigation.`,
    footer: `A FOOTER is the bottom section with copyright, links, social icons. Typically darker background, multiple columns. This is ONLY a footer - no other content.`,
    about: `An ABOUT section tells the company/person story. Bio text, team intro, mission statement. NO footer, NO navigation.`,
    team: `A TEAM section shows team member cards with photos, names, titles. NO footer, NO navigation.`,
    faq: `A FAQ section has expandable question/answer pairs, usually with an accordion pattern. NO footer, NO navigation.`,
    cta: `A CTA (Call-to-Action) section is ONLY:
- A single focused banner (one <section> element)
- One compelling headline
- One or two buttons maximum
- Optional background gradient or image
- NOTHING ELSE. NO footer. NO navigation. NO additional sections.
This is a SINGLE section component, not a page.`,
    gallery: `A GALLERY section displays images in a grid or masonry layout. Lightbox on click optional. NO footer, NO navigation.`,
  }

  const scopeDefinition = sectionScopeDefinitions[templateType] || ''
  const forbiddenList = forbiddenBySectionType[templateType] || []
  
  // This constraint block MUST be the first thing Claude sees
  const sectionConstraintBlock = `# 🛑 MANDATORY CONSTRAINT — READ FIRST 🛑

**SECTION TYPE: ${templateType.toUpperCase()}**

You are building ONLY a ${templateType.toUpperCase()} component. NOT a full page. NOT multiple sections. ONLY ONE ${templateType.toUpperCase()}.

## 🚨 CRITICAL: SINGLE SECTION ONLY
Your output must be ONE <section> or <header> or <footer> element. 
DO NOT output multiple sections. DO NOT include a footer if building a CTA. DO NOT include navigation if building features.
EVERY section type is ISOLATED. You build ONE thing.

## EXACT DEFINITION OF A ${templateType.toUpperCase()}:
${scopeDefinition || `A ${templateType} section component.`}

${forbiddenList.length > 0 ? `## ❌ ABSOLUTELY FORBIDDEN (DO NOT INCLUDE):
${forbiddenList.map(i => `- ${i}`).join('\n')}

If you include ANY of these forbidden elements, the build will FAIL. Do not include them.` : ''}

## ✅ SECTION BOUNDARY RULE:
- Return ONLY the ${templateType} - nothing before it, nothing after it
- One root element (<section>, <header>, or <footer>)
- No additional components or sections stacked below

---`

  // Special instructions for headers/navs to ensure mobile menu works
  const mobileNavInstructions = (templateType === 'header' || templateType === 'nav')
    ? `
## MOBILE NAVIGATION (REQUIRED)
For mobile screens, include a working hamburger menu:
1. Add useState: const [isMenuOpen, setIsMenuOpen] = useState(false)
2. Add a hamburger button visible only on mobile: className="md:hidden"
3. Toggle with onClick={() => setIsMenuOpen(!isMenuOpen)}
4. Show/hide mobile menu based on isMenuOpen state
5. Use AnimatePresence + motion.div for smooth open/close animation
6. Close menu when a link is clicked: onClick={() => setIsMenuOpen(false)}

CRITICAL STYLING for hamburger button:
- Make it HIGH CONTRAST - white or light colored icon on dark backgrounds
- Use a visible background: bg-zinc-800 or bg-white/10 with padding
- Icon should be clearly visible: text-white or a bright color
- Add rounded corners: rounded-lg p-2
- NEVER make the hamburger icon the same color as the header background

Example pattern:
{/* Mobile hamburger button - HIGH CONTRAST */}
<button 
  className="md:hidden p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors" 
  onClick={() => setIsMenuOpen(!isMenuOpen)}
>
  {isMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
</button>

{/* Mobile menu - slides down */}
<AnimatePresence>
  {isMenuOpen && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="absolute top-full left-0 right-0 md:hidden bg-zinc-900 border-b border-zinc-800 shadow-xl"
    >
      {/* Mobile nav links with good padding */}
      <div className="p-4 space-y-2">
        {/* links here */}
      </div>
    </motion.div>
  )}
</AnimatePresence>
`
    : ''

  return `${sectionConstraintBlock}

# SYSTEM: THE ARCHITECT
You build high-quality, production-ready React components using Tailwind CSS.
DO NOT include any "powered by" text or AI branding in the output - just clean, professional code.

## YOUR MISSION
Build a "${sectionName}" (type: ${templateType}) component.
Description: ${sectionDescription}
${sectionPromptHint ? `Specific Requirement: ${sectionPromptHint}` : ''}

${getComponentReference(templateType)}

## TECHNICAL STACK
- React 19 (Functional Components)
- Tailwind CSS 4 (Utility-first)
- Lucide React (Icons) - import { IconName } from 'lucide-react'
  VALID ICON NAMES (use ONLY these - other names will break):
  General: Check, X, Plus, Minus, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Menu, Search, Settings, Home, User, Users, Mail, Phone, MapPin, Calendar, Clock, Star, Heart, Share, Download, Upload, Link, ExternalLink, Copy, Trash, Edit, Eye, EyeOff, Lock, Unlock, Key
  Business: Building, Briefcase, CreditCard, DollarSign, TrendingUp, BarChart, PieChart, Activity, Target, Award, Gift, ShoppingCart, ShoppingBag, Package, Truck, Store
  Tech: Code, Terminal, Database, Server, Cloud, Wifi, Monitor, Smartphone, Tablet, Laptop, Cpu, HardDrive, Globe, Zap, Shield, Lock, Key, Fingerprint, QrCode
  Communication: MessageCircle, MessageSquare, Send, Bell, BellRing, Inbox, AtSign, Hash, Megaphone, Radio, Podcast, Video, Mic, Headphones, Volume, VolumeX
  Media: Image, Camera, Film, Music, Play, Pause, SkipForward, SkipBack, Maximize, Minimize, RotateCw, RotateCcw, ZoomIn, ZoomOut, Layers, Layout, Grid, List
  Files: File, FileText, Folder, FolderOpen, Archive, Clipboard, BookOpen, Bookmark, Tag, Flag
  Misc: Sun, Moon, CloudRain, Umbrella, Thermometer, Compass, Map, Navigation, Rocket, Plane, Car, Bike, Coffee, Utensils, Apple, Leaf, Tree, Flame, Droplet, Wind, Mountain, Waves, Sparkles, Wand, Lightbulb, Palette, PenTool, Wrench, Hammer, Cog
  ❌ DO NOT USE: HeadsetIcon, Icons with "Icon" suffix - they don't exist
- Framer Motion (Animations) - ONLY use: motion, AnimatePresence, variants
  ❌ DO NOT USE: useScroll, useSpring, useTransform, useMotionValue, useInView, useAnimation
  These hooks are NOT available in the preview environment and WILL crash.
- Next.js Image (Optimization) - import Image from 'next/image'

## 🚨 ICONS - RENDER DIRECTLY, NOT VIA DATA
When using icons in mapped arrays, render them DIRECTLY - do NOT pass icon components in data:
❌ WRONG (icon in data object - won't render):
\`\`\`
const features = [{ icon: Star, title: '...' }]
features.map(f => <f.icon className="..." />) // BROKEN - f.icon is undefined
\`\`\`
✅ CORRECT (render icons inline based on index or switch):
\`\`\`
import { Zap, Shield, Users } from 'lucide-react'
const icons = [Zap, Shield, Users]
const features = [{ title: 'Fast', desc: '...' }, { title: 'Secure', desc: '...' }, { title: 'Support', desc: '...' }]
features.map((f, i) => {
  const Icon = icons[i]
  return <Icon className="h-6 w-6" />
})
\`\`\`
OR use a switch statement to pick icons based on index.
NEVER store React components inside data arrays - it breaks in production builds.

## 🚨 CRITICAL: VALID JAVASCRIPT/JSX ONLY - NO TYPESCRIPT
Output PLAIN JavaScript/JSX. The preview uses Babel which does NOT support TypeScript.
DO NOT include ANY of these - they will cause Babel transform errors:

❌ FORBIDDEN SYNTAX:
- Type annotations: \`: string\`, \`: number\`, \`: boolean\`, \`: any\`
- Interface definitions: \`interface Props { ... }\`
- Type definitions: \`type MyType = ...\`
- Generic type parameters: \`<T>\`, \`<Props>\`
- Optional chaining in params: \`{ foo?: string }\` (use \`{ foo }\` and check with \`if (foo)\`)
- Return type annotations: \`): JSX.Element\`, \`): React.ReactNode\`
- Type assertions: \`as string\`, \`as const\`
- React.FC or React.FunctionComponent

✅ CORRECT PATTERNS:
- Props: function Component({ title, onClick }) { ... }
- Default props: function Component({ title = 'Default' }) { ... }
- Arrays: const items = ['a', 'b', 'c']
- Objects: const config = { key: 'value' }

## 🚨 CRITICAL: NO EMPTY DATA
When generating content that uses arrays (features, services, testimonials, etc.):
❌ NEVER use empty arrays: \`const features = []\`
❌ NEVER use placeholder text: \`title: "[Feature Name]"\` or \`desc: "Lorem ipsum"\`
✅ ALWAYS populate with REAL, specific content:
\`\`\`
const features = [
  { icon: Zap, title: 'Lightning Performance', desc: 'Sub-100ms response times globally.' },
  { icon: Shield, title: 'Enterprise Security', desc: 'SOC 2 compliant with end-to-end encryption.' },
  { icon: Users, title: '24/7 Support', desc: 'Dedicated team available around the clock.' },
]
\`\`\`
If you generate a .map() loop, the array MUST have 3-6 items with real content.

## 🚨 TERNARY OPERATORS - MUST BE COMPLETE
Every ternary MUST have both branches: \`condition ? trueValue : falseValue\`
❌ WRONG: \`{isOpen && <div>...</div>}\` inside motion props
❌ WRONG: \`{condition ? { opacity: 1 }}\` (missing : falseValue)
✅ RIGHT: \`{condition ? { opacity: 1 } : { opacity: 0 }}\`
✅ RIGHT: \`{isOpen ? <motion.div>...</motion.div> : null}\`

## COMPONENT SPEC
- Export a default function named "${componentName}".
- Use "use client" directive at the top.
- Fully responsive (mobile-first, md: and lg: breakpoints).
- Accessible (aria-labels, semantic HTML).
- Modern, clean design with generous whitespace.
- Use <${templateType === 'header' || templateType === 'nav' ? 'header' : 'section'}> as the root element.
- Use placeholder images from "https://placehold.co/600x400/e2e8f0/1e293b?text=Image" if needed.

## 🚨 SIZING GUIDELINES - CRITICAL
Components must be appropriately sized. Oversized elements look amateurish.

HEADER/NAVIGATION:
- Total height: h-16 to h-20 (NEVER h-24 or more)
- Logo text: text-lg or text-xl (NEVER text-2xl+)
- Logo image: h-6 to h-8 (NEVER h-10+)
- Nav link text: text-sm (NEVER text-base+)
- Hamburger/menu icon: w-5 h-5 or w-6 h-6 (NEVER w-8+)
- Header padding: px-4 md:px-6 (NEVER px-8+)
- CTA in header: px-3 py-1.5 text-sm (compact!)

BUTTONS:
- Standard buttons: px-4 py-2 or px-6 py-2.5 (NEVER px-8 py-4 or larger)
- Small buttons: px-3 py-1.5
- Text: text-sm or text-base (NEVER text-lg or text-xl for button text)
- Rounded: rounded-lg or rounded-xl (not rounded-3xl)

## 🚨 CONTAINER WIDTH CONSISTENCY (CRITICAL)
ALL sections must use the SAME container pattern for visual consistency:
- Inner content wrapper: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
- This creates a consistent 1280px max-width container with responsive padding
- NEVER use max-w-6xl, max-w-5xl, or max-w-4xl for main section containers
- NEVER use different padding values (px-8, px-10, etc.)
- The only exception is full-bleed backgrounds (section itself is full-width, inner content uses container)

Pattern:
<section className="py-16 bg-zinc-950">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Content here */}
  </div>
</section>

CARDS & CONTAINERS:
- Padding: p-4 to p-6 (not p-8 or p-10)
- Border radius: rounded-xl or rounded-2xl (not rounded-3xl)
- Max width for cards: max-w-sm or max-w-md

TYPOGRAPHY:
- Headings: text-2xl to text-4xl (use text-5xl sparingly)
- Body: text-sm or text-base
- Subtext: text-xs or text-sm

ICONS:
- Standard: w-4 h-4 or w-5 h-5
- Large/hero: w-6 h-6 or w-8 h-8 max
- NEVER use w-12 h-12 or larger for interface icons

IMAGES:
- Always use aspect-ratio classes to prevent layout shift: aspect-video, aspect-square, aspect-[4/3]
- Use object-cover to prevent stretching: className="object-cover"
- Wrap in a container with overflow-hidden for rounded corners
- For placeholder images, use: https://placehold.co/WIDTHxHEIGHT/BGCOLOR/TEXTCOLOR?text=Label

## LINKS & NAVIGATION
- For demo/preview links, use href="#" to prevent 404 errors
- Add cursor-pointer to clickable elements
- Use onClick handlers for demo functionality if needed
- Social media links should use: href="#" with aria-label="Visit our Twitter"

## TEXT CONTRAST (CRITICAL)
On dark backgrounds (zinc-900, zinc-950, black):
- Primary text: text-white or text-zinc-100 (NEVER text-zinc-400 for main content)
- Secondary text: text-zinc-300 or text-zinc-400
- Muted/labels: text-zinc-500
- NEVER use text-zinc-600+ on dark backgrounds - it's unreadable

On light backgrounds (white, zinc-50, zinc-100):
- Primary text: text-zinc-900 or text-black
- Secondary text: text-zinc-600 or text-zinc-700
- NEVER use text-zinc-400 on light backgrounds

## BUTTON HIERARCHY
- Primary CTA: Filled with brand color, high contrast (bg-emerald-500 text-white)
- Secondary CTA: Outlined or subtle fill (border border-zinc-700 text-white)
- Ghost/Tertiary: Text only with hover state (text-zinc-400 hover:text-white)
- NEVER make two CTAs side-by-side look identical

## GRADIENTS (USE SPARINGLY)
- Subtle text gradients: bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent
- Background gradients should be SUBTLE: from-zinc-900 to-zinc-950 (not from-purple-500 to-pink-500)
- Avoid rainbow/multicolor gradients unless explicitly requested
- Glassmorphism: bg-white/5 backdrop-blur-xl border border-white/10

${mobileNavInstructions}
${brandInstructions}
${chronosphereContext}
${previousContext}
${sparseInstruction}

## OUTPUT FORMAT
Return your response using these EXACT markers (not JSON - markers are more reliable):

<code>
'use client'
// Your complete React component code here
// Quotes and special characters don't need escaping
export default function ${componentName}() {
  return (...)
}
</code>

<reasoning>
**Design Choice 1**: Explanation
**Design Choice 2**: Explanation  
**Design Choice 3**: Explanation
</reasoning>

IMPORTANT: Put ONLY the raw code between <code> and </code> tags. No markdown code fences inside.

## DESIGN PHILOSOPHY
- "God is in the details." - Mies van der Rohe
- Make it feel expensive.
- Use subtle animations (fade-in, slide-up) with Framer Motion - but keep them simple.
- ANIMATION BEST PRACTICE for mobile: Use instant animations on mount (initial + animate), NOT scroll-triggered.
  ✅ GOOD: initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
  ❌ BAD: whileInView - causes stutter on mobile as elements pop in while scrolling.
- Ensure high contrast and readability.
- AVOID: Generic centered hero + gradient background + 3 cards layout

## COMMON MISTAKES TO AVOID
1. **Empty State Hell**: Don't render empty containers. If no data, don't render the section.
2. **Centered Everything**: Left-align body text. Only center headlines and CTAs when appropriate.
3. **Icon Soup**: Don't use icons just to fill space. Each icon should have meaning.
4. **Wall of Text**: Break up long paragraphs. Use bullet points, cards, or visual hierarchy.
5. **Click Here Syndrome**: Write descriptive link/button text. "Get Started Free" not "Click Here".
6. **Zombie Forms**: Forms MUST have visible labels and clear submit buttons. Never hide the submit.
7. **Infinite Scroll Trap**: Avoid overflow-y-auto on sections. Let the page scroll naturally.
8. **Sticky Chaos**: Only ONE sticky element per page (usually the header). Don't make everything sticky.
9. **Z-Index Wars**: Use sensible z-index values (10, 20, 50). Don't use z-[9999].
10. **Touch Target Fail**: Buttons/links must be at least 44x44px for mobile touch targets.

## POLISH DETAILS (What separates good from great)
- Add subtle box-shadow to cards: shadow-lg shadow-black/5
- Use transition-all duration-200 for hover states
- Add focus-visible:ring-2 focus-visible:ring-emerald-500 for keyboard navigation
- Rounded corners should be consistent within a section
- Use tracking-tight on large headlines, tracking-wide on small caps
- Add a subtle border to dark cards: border border-zinc-800/50

Now build the ${sectionName} section.`
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    // Rate limit check (use IP for guests, userId for auth'd)
    const rateLimitKey = userId || request.headers.get('x-forwarded-for') || 'anonymous'
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Maximum 20 requests per minute.' },
        { status: 429 }
      )
    }
    
    if (!process.env.ANTHROPIC_API_KEY) {
       return NextResponse.json({ error: 'Anthropic API key not configured' }, { status: 500 })
    }

    // Check generation limits for authenticated users
    let isPaid = false
    let dbUser = null
    let isSingularity = false
    if (userId) {
      const clerkUser = await currentUser()
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress
      dbUser = await getOrCreateUser(userId, email)
      
      // Check if paid
      const accountSub = clerkUser?.publicMetadata?.accountSubscription as { status?: string; tier?: string } | undefined
      isPaid = accountSub?.status === 'active'
      isSingularity = accountSub?.tier === 'singularity'
      
      // Enforce generation limit for free users
      const genCheck = await checkAndIncrementGeneration(userId, isPaid)
      if (!genCheck.allowed) {
        return NextResponse.json(
          { error: 'Daily generation limit reached. Upgrade to continue building.', remaining: 0 },
          { status: 429 }
        )
      }
    }

    const body = await request.json()
    const { 
      projectId, 
      sectionId, 
      sectionType,
      sectionName,
      sectionDescription,
      sectionPromptHint,
      userPrompt, 
      previousSections = {},
      brandConfig = null
    } = body

    // DEBUG: Log received brandConfig
    console.log('[build-section] Received brandConfig:', JSON.stringify(brandConfig, null, 2))

    if (!projectId || !sectionId || !userPrompt) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, sectionId, userPrompt' },
        { status: 400 }
      )
    }

    // Verify project ownership - project.user_id stores clerk_id directly
    if (projectId && !projectId.startsWith('demo-')) {
      const project = await getProjectById(projectId)
      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }
      if (!userId || project.user_id !== userId) {
        return NextResponse.json(
          { error: 'Unauthorized access to project' },
          { status: 403 }
        )
      }
    }

    // Fetch User Style DNA (The Chronosphere) - uses dbUser.id (UUID) for users table
    const styleDNA = dbUser ? await getUserDNA(dbUser.id) : null

    // Build the system prompt - sectionType MUST be specific (header, hero, etc.)
    // If it's missing, we have a bug upstream - log it and use sectionName as fallback
    if (!sectionType) {
      console.warn('[build-section] ⚠️ sectionType is missing! This is a bug. Falling back to sectionName.')
    }
    const templateType = sectionType || sectionName?.toLowerCase().replace(/[^a-z]/g, '') || 'section'
    const sectionTitle = sectionName || sectionType || 'section'
    const sectionDesc = sectionDescription || sectionTitle

    // DEBUG: Log exactly what we're building
    console.log('[build-section] ========== BUILD REQUEST ==========')
    console.log('[build-section] sectionType:', sectionType)
    console.log('[build-section] templateType:', templateType)
    console.log('[build-section] sectionName:', sectionName)
    console.log('[build-section] userPrompt:', userPrompt?.slice(0, 100))
    console.log('[build-section] ===================================')

    const systemPrompt = buildSystemPrompt(
      sectionTitle,
      sectionDesc,
      templateType,
      userPrompt,
      previousSections,
      brandConfig,
      styleDNA,
      sectionPromptHint
    )

    // DEBUG: Log first part of system prompt to verify constraints
    console.log('[build-section] System prompt (first 800 chars):')
    console.log(systemPrompt.slice(0, 800))

    // Call Claude 3.5 Sonnet (Anthropic)
    // Switched from Gemini 2.0 Flash for better reasoning on sparse inputs
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          { role: 'user', content: `Build this section: ${userPrompt}` }
        ]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Anthropic API Error:', errorText)
      throw new Error(`Anthropic API Error: ${response.statusText}`)
    }

    const data = await response.json()
    const responseText = data.content[0].text
    
    console.log('[build-section] Claude raw response length:', responseText.length)
    console.log('[build-section] Claude response preview:', responseText.slice(0, 500))

    // Parse using marker-based format (no JSON escaping issues)
    let generatedCode = ''
    let reasoning = ''
    
    // Strategy 1: Extract from <code> and <reasoning> markers (PRIMARY - no escaping needed)
    const codeMarkerMatch = responseText.match(/<code>\s*([\s\S]*?)\s*<\/code>/)
    const reasoningMarkerMatch = responseText.match(/<reasoning>\s*([\s\S]*?)\s*<\/reasoning>/)
    
    if (codeMarkerMatch) {
      generatedCode = codeMarkerMatch[1].trim()
      reasoning = reasoningMarkerMatch ? reasoningMarkerMatch[1].trim() : 'Generated by Claude.'
      console.log('[build-section] Strategy 1 (marker extraction) succeeded')
    }
    
    // Strategy 2: Legacy JSON support (for any cached prompts or edge cases)
    if (!generatedCode) {
      try {
        const cleanJson = responseText.replace(/```json\n|\n```/g, '').trim()
        const parsed = JSON.parse(cleanJson)
        generatedCode = parsed.code || ''
        reasoning = parsed.reasoning || ''
        console.log('[build-section] Strategy 2 (JSON) succeeded')
      } catch {
        console.log('[build-section] Strategy 2 (JSON) failed, trying more fallbacks...')
      }
    }

    // Strategy 3: Extract code from markdown blocks
    if (!generatedCode) {
      const codeMatch = responseText.match(/```(?:tsx|jsx|javascript|typescript)?\n([\s\S]*?)```/)
      if (codeMatch) {
        generatedCode = codeMatch[1].trim()
        reasoning = "Generated by Claude (extracted code block)."
        console.log('[build-section] Strategy 3 (markdown code block) succeeded')
      }
    }
    
    // Strategy 4: Look for function/component declaration
    if (!generatedCode) {
      const funcMatch = responseText.match(/((?:'use client'[\s\S]*?)?(?:export\s+default\s+)?function\s+\w+[\s\S]*?)(?:```|<|$)/)
      if (funcMatch) {
        generatedCode = funcMatch[1].trim()
        reasoning = "Generated by Claude (extracted function)."
        console.log('[build-section] Strategy 4 (function extraction) succeeded')
      }
    }
    
    // Strategy 5: Raw code (response is just the component)
    if (!generatedCode && (responseText.includes('export default function') || responseText.includes("'use client'"))) {
      generatedCode = responseText.trim()
      reasoning = "Raw output from Claude."
      console.log('[build-section] Strategy 5 (raw code) succeeded')
    }

    // Sanitize code to fix common AI escape issues (\\", \\n, etc.)
    generatedCode = sanitizeCodeOutput(generatedCode)

    // Save to DB only if we have a valid user and it's not a demo project
    if (generatedCode && userId && !projectId.startsWith('demo-')) {
      await completeSection(sectionId, generatedCode, reasoning)
    }

    // Guard: Don't return invalid/empty code - that breaks the preview
    if (!generatedCode || !generatedCode.includes('function') || generatedCode.length < 100) {
      console.error('[build-section] FAILED: Code validation failed')
      console.error('[build-section] generatedCode length:', generatedCode?.length || 0)
      console.error('[build-section] has function:', generatedCode?.includes('function'))
      console.error('[build-section] Full raw response:', responseText)
      return NextResponse.json({ 
        error: 'AI returned an invalid response. Please try again with a more specific prompt.',
        debug: process.env.NODE_ENV === 'development' ? {
          responseLength: responseText.length,
          codeLength: generatedCode?.length || 0,
          hasFunction: generatedCode?.includes('function'),
          preview: responseText.slice(0, 200)
        } : undefined
      }, { status: 500 })
    }

    // Track successful build for analytics
    await track('Section Built', { 
      sectionType: sectionType || 'unknown',
      isPaid: isPaid || false,
      codeLength: generatedCode.length,
    })

    return NextResponse.json({ 
      success: true, 
      code: generatedCode,
      reasoning: reasoning,
      model: 'claude-sonnet-4-5-20250929',
      priorityQueue: isSingularity
    })

  } catch (error) {
    console.error('Error building section:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      error: 'Failed to build section', 
      details: errorMessage 
    }, { status: 500 })
  }
}
