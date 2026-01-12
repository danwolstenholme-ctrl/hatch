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
1. Pick ONE compelling use case: A luxury travel agency, a cutting-edge AI startup, a boutique design studio, or a high-end restaurant.
2. INVENT specific, premium content: Company name, specific services, real-sounding testimonials, concrete pricing.
3. Make it look like a $10,000 custom website - not a template.
4. Use SPECIFIC text, not "Lorem ipsum" or "[Your Text Here]".

Example: Instead of "Welcome to our website", write "Redefining Luxury Travel Since 2019" with actual trip packages and prices.
The goal is to WOW the user with specificity, not show them a blank template.`
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
- A compact horizontal bar (typically 60-80px tall)
- Logo on the left
- Navigation links (horizontal on desktop, hamburger menu on mobile)
- Optional CTA button on the right
- Optional glass/blur effect on scroll
A HEADER IS NOT a hero section. It should NOT contain large headlines, taglines, feature descriptions, or call-to-action areas below it.`,
    hero: `A HERO SECTION is:
- The first major content section BELOW the header
- Contains the main headline and value proposition
- Usually has a CTA button
- May include an image, illustration, or background
- Takes up significant viewport height (often 80-100vh)
DO NOT include a footer, navigation, or any other section type.`,
    services: `A SERVICES section lists 3-6 service offerings in cards or a grid. Brief descriptions, icons, maybe links to learn more. NO footer, NO navigation.`,
    features: `A FEATURES section highlights key product/service features. Grid of feature cards with icons, titles, and short descriptions. NO footer, NO navigation.`,
    pricing: `A PRICING section shows pricing tiers/plans. 2-4 cards with plan names, prices, feature lists, and CTA buttons. NO footer, NO navigation.`,
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
- Framer Motion (Animations) - ONLY use: motion, AnimatePresence, variants
  ❌ DO NOT USE: useScroll, useSpring, useTransform, useMotionValue, useInView, useAnimation
  These hooks are NOT available in the preview environment and WILL crash.
- Next.js Image (Optimization) - import Image from 'next/image'

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
${mobileNavInstructions}
${brandInstructions}
${chronosphereContext}
${previousContext}
${sparseInstruction}

## OUTPUT FORMAT
Return a JSON object with two fields:
1. "code": The complete, runnable React component code (string).
2. "reasoning": A detailed explanation of your design choices as bullet points. Start each point with **Topic**: and explain. Include 3-5 design decisions. Example: "**Dark Aesthetic**: Deep zinc background creates depth\n**Typography-Led**: Light font weights create elegance\n**Subtle Interactions**: Hover states maintain minimal vibe"

Example JSON structure:
{
  "code": "import ...",
  "reasoning": "**Layout**: I chose a grid layout because it provides visual balance\n**Colors**: Used zinc palette for professional dark aesthetic\n**Typography**: Selected Inter with lighter weights for elegance"
}

## DESIGN PHILOSOPHY
- "God is in the details." - Mies van der Rohe
- Make it feel expensive.
- Use subtle animations (fade-in, slide-up) with Framer Motion.
- Ensure high contrast and readability.
- AVOID: Generic centered hero + gradient background + 3 cards layout

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
    if (userId) {
      const clerkUser = await currentUser()
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress
      dbUser = await getOrCreateUser(userId, email)
      
      // Check if paid
      const accountSub = clerkUser?.publicMetadata?.accountSubscription as { status?: string } | undefined
      isPaid = accountSub?.status === 'active'
      
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

    // Try to parse as JSON
    let generatedCode = ''
    let reasoning = ''
    
    try {
      // Strategy 1: Direct JSON parse (Claude should return JSON)
      // Clean up potential markdown code blocks around the JSON
      const cleanJson = responseText.replace(/```json\n|\n```/g, '').trim()
      const parsed = JSON.parse(cleanJson)
      generatedCode = parsed.code || ''
      reasoning = parsed.reasoning || ''
      console.log('[build-section] Strategy 1 (direct JSON) succeeded')
    } catch (e) {
      console.log('[build-section] Strategy 1 failed, trying fallbacks...')
      
      // Strategy 2: Extract JSON from markdown blocks
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/\{[\s\S]*"code"[\s\S]*\}/)
      if (jsonMatch) {
        try {
          const jsonStr = jsonMatch[1] || jsonMatch[0]
          const parsed = JSON.parse(jsonStr)
          generatedCode = parsed.code || ''
          reasoning = parsed.reasoning || ''
          console.log('[build-section] Strategy 2 (JSON from markdown) succeeded')
        } catch (e2) {
          console.log('[build-section] Strategy 2 failed:', e2)
        }
      }

      // Strategy 3: Extract code block directly (Claude sometimes returns raw code)
      if (!generatedCode) {
        const codeMatch = responseText.match(/```(?:tsx|jsx|javascript|typescript)?\n([\s\S]*?)```/)
        if (codeMatch) {
          generatedCode = codeMatch[1].trim()
          reasoning = "Generated by Claude (JSON parse failed, extracted code block)."
          console.log('[build-section] Strategy 3 (code block extraction) succeeded')
        }
      }
      
      // Strategy 4: Look for function declaration anywhere in response
      if (!generatedCode) {
        const funcMatch = responseText.match(/((?:export\s+default\s+)?function\s+\w+[\s\S]*?)(?:```|$)/)
        if (funcMatch) {
          generatedCode = funcMatch[1].trim()
          reasoning = "Generated by Claude (extracted function)."
          console.log('[build-section] Strategy 4 (function extraction) succeeded')
        }
      }
      
      // Strategy 5: Check if response IS the code (no wrapping)
      if (!generatedCode && (responseText.includes('export default function') || responseText.includes('function '))) {
        generatedCode = responseText.trim()
        reasoning = "Raw output from Claude."
        console.log('[build-section] Strategy 5 (raw code) succeeded')
      }
    }

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
      model: 'claude-sonnet-4-5-20250929'
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
