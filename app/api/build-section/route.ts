import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'
import { getProjectById, getOrCreateUser, completeSection } from '@/lib/db'

// =============================================================================
// SONNET 4.5 - THE BUILDER
// Fast, high-quality section generation
// =============================================================================

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

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
  sectionPromptHint?: string
): string {
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
  }

  const scopeRules = `
## STRICT SCOPE (MOST IMPORTANT)
- You are generating ONLY the **${sectionName}** section.
- Do NOT include any other sections (no hero, no services grid, no testimonials, no pricing, no footer, etc.) even if the user asks.
- If the user's prompt contains requirements for other sections, ignore those parts and only implement what belongs in **${sectionName}**.
- Keep the output tightly aligned to: ${sectionDescription || sectionName}
${sectionPromptHint ? `- The UI asked the user: "${sectionPromptHint}"` : ''}
`

  return `You are building a ${sectionName} section for a ${templateType}.
${scopeRules}
${brandInstructions}
## OUTPUT FORMAT (MANDATORY - READ THIS CAREFULLY)

You MUST return a named function component. Here's the EXACT format:

function ${componentName}() {
  return (
    <section className="...">
      {/* your content here */}
    </section>
  )
}

❌ WRONG - This will BREAK the preview:
<section className="...">...</section>

❌ WRONG - No exports:
export default function ${componentName}() { ... }

❌ WRONG - No imports:
import { useState } from 'react'

✅ CORRECT - Just the function:
function ${componentName}() {
  return (
    <section>...</section>
  )
}

This is NON-NEGOTIABLE. Raw JSX will not render.

## SECTION PURPOSE
${sectionDescription}

## USER REQUEST
"${userPrompt}"

Build EXACTLY what they asked for. Be specific to their request, not generic.

## TECHNICAL REQUIREMENTS
- Responsive: mobile-first with sm:, md:, lg: breakpoints
- Accessible: ARIA labels, semantic HTML, focus states, alt text
- Self-contained: no imports, no exports, just the function
- React hooks available: useState, useEffect, useRef, useMemo, useCallback
- Framer Motion available: motion.div, motion.button, AnimatePresence, etc.
- Lucide icons available: ArrowRight, Check, Menu, X, etc. (use directly, no import)

## STYLE GUIDE${brandConfig ? ' (ADAPT TO BRAND COLORS ABOVE)' : ''}
${brandConfig ? `- Use the brand colors specified above as primary styling
- Dark backgrounds: bg-zinc-950, bg-zinc-900 (or brand secondary if dark)
- Text colors: text-white, text-zinc-400, text-zinc-500
- Accent: Use brand primary/accent colors for CTAs and highlights` :
`- Dark backgrounds: bg-zinc-950, bg-zinc-900
- Text colors: text-white, text-zinc-400, text-zinc-500
- Accent colors: Use cyan-500, cyan-400 for CTAs and highlights`}
- Borders: border-zinc-800, border-zinc-700
- Rounded corners: rounded-xl, rounded-2xl for cards, rounded-full for badges
- Shadows: shadow-lg, shadow-xl, add glow effects with brand colors
- Spacing: py-20, py-24 for sections, gap-4, gap-6, gap-8 for flex/grid
- Typography: text-4xl/text-5xl for headlines, text-lg/text-xl for body

## ANIMATIONS (USE SPARINGLY)
- Fade in: motion.div with initial={{ opacity: 0 }} animate={{ opacity: 1 }}
- Slide up: initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
- Hover scale: whileHover={{ scale: 1.02 }}
- Transitions: transition={{ duration: 0.3 }}

${previousContext}

## OUTPUT FORMAT

Return your response as JSON with both code and reasoning:

{
  "code": "function ${componentName}() { return ( <section>...</section> ) }",
  "reasoning": "Brief 1-2 sentence explanation of key design decisions - what you chose and WHY"
}

Example reasoning:
- "Used a split layout with testimonial on left to build trust before the CTA. Chose 'Start Free Trial' over 'Sign Up' for lower commitment feel."
- "Added gradient accent behind headline to draw eye flow. Three feature cards because odd numbers feel more dynamic than even."

The reasoning should make you sound thoughtful and opinionated, not generic. Explain your CHOICES.

Now build the ${sectionName} section.`
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clerkUser = await currentUser()
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress
    const dbUser = await getOrCreateUser(userId, email)
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
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

    if (!projectId || !sectionId || !userPrompt) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, sectionId, userPrompt' },
        { status: 400 }
      )
    }

    // Verify project ownership using internal user ID
    const project = await getProjectById(projectId)
    if (!project || project.user_id !== dbUser.id) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Build the system prompt
    const templateType = sectionType || 'landing page'
    const sectionTitle = sectionName || sectionType || 'section'
    const sectionDesc = sectionDescription || sectionTitle

    const systemPrompt = buildSystemPrompt(
      sectionTitle,
      sectionDesc,
      templateType,
      userPrompt,
      previousSections,
      brandConfig,
      sectionPromptHint
    )

    // Call Sonnet 4
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: `Build this section: ${userPrompt}`,
        },
      ],
      system: systemPrompt,
    })

    // Extract the generated response
    const responseText = response.content
      .filter(block => block.type === 'text')
      .map(block => block.type === 'text' ? block.text : '')
      .join('')
      .trim()

    // Try to parse as JSON (new format with reasoning)
    let generatedCode = ''
    let reasoning = ''
    
    try {
      // Clean up any markdown code blocks around JSON
      const jsonText = responseText
        .replace(/^```(?:json)?\n?/gm, '')
        .replace(/\n?```$/gm, '')
        .trim()
      
      const parsed = JSON.parse(jsonText)
      generatedCode = parsed.code || ''
      reasoning = parsed.reasoning || ''
    } catch {
      // Fallback: treat entire response as code (backwards compatibility)
      generatedCode = responseText
    }

    // Clean up any markdown code blocks if Sonnet added them
    generatedCode = generatedCode
      .replace(/^```(?:jsx|tsx|javascript|typescript)?\n?/gm, '')
      .replace(/\n?```$/gm, '')
      .trim()

    // FALLBACK: If Sonnet returned raw JSX, wrap it in a function
    if (generatedCode.startsWith('<') && !generatedCode.includes('function ')) {
      const componentName = (sectionName || sectionType || 'Generated')
        .split(/[\s-_]+/)
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('') + 'Section'
      
      generatedCode = `function ${componentName}() {\n  return (\n    ${generatedCode}\n  )\n}`
      console.log(`[build-section] Wrapped raw JSX in function: ${componentName}`)
    }

    // SAVE TO DATABASE - persist the generated code
    await completeSection(sectionId, generatedCode, userPrompt)

    return NextResponse.json({
      code: generatedCode,
      reasoning,
      sectionId,
      model: 'sonnet-4.5',
    })

  } catch (error) {
    console.error('Error building section:', error)
    return NextResponse.json({ error: 'Failed to build section' }, { status: 500 })
  }
}