import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { GoogleGenAI } from '@google/genai'
import { getProjectById, getOrCreateUser, completeSection } from '@/lib/db'
import { getUserDNA } from '@/lib/db/chronosphere'
import { StyleDNA } from '@/lib/supabase'

// =============================================================================
// GEMINI 2.0 FLASH - THE ARCHITECT (BUILDER MODE)
// "The Genesis Engine"
// =============================================================================

const geminiApiKey = process.env.GEMINI_API_KEY
const genai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null

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
  }

  // Forbidden elements per section type - prevents scope bleed
  const forbiddenBySectionType: Record<string, string[]> = {
    header: ['hero banner', 'pricing table', 'testimonials', 'footer', 'contact form', 'services grid', 'team section', 'FAQ accordion'],
    hero: ['navigation menu', 'footer', 'pricing table', 'testimonials', 'contact form', 'FAQ accordion', 'team section'],
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

  const forbiddenList = forbiddenBySectionType[templateType] || []
  const forbiddenInstruction = forbiddenList.length > 0 
    ? `\n## FORBIDDEN ELEMENTS (DO NOT INCLUDE)\n${forbiddenList.map(i => `- ${i}`).join('\n')}\nFocus ONLY on the ${templateType} content.`
    : ''

  return `You are The Architect (Gemini 2.0 Flash). You are the Genesis Engine.
You build high-quality, production-ready React components using Tailwind CSS.

## YOUR MISSION
Build a "${sectionName}" section for a website.
Description: ${sectionDescription}
${sectionPromptHint ? `Specific Requirement: ${sectionPromptHint}` : ''}

## TECHNICAL STACK
- React 19 (Functional Components)
- Tailwind CSS 4 (Utility-first)
- Lucide React (Icons) - import { IconName } from 'lucide-react'
- Framer Motion (Animations) - import { motion } from 'framer-motion'
- Next.js Image (Optimization) - import Image from 'next/image'

## COMPONENT SPEC
- Export a default function named "${componentName}".
- Use "use client" directive at the top.
- Fully responsive (mobile-first, md: and lg: breakpoints).
- Accessible (aria-labels, semantic HTML).
- Modern, clean design with generous whitespace.
- Use <section> as the root element.
- Use placeholder images from "https://placehold.co/600x400/e2e8f0/1e293b?text=Image" if needed.

${brandInstructions}
${chronosphereContext}
${previousContext}
${forbiddenInstruction}

## OUTPUT FORMAT
Return a JSON object with two fields:
1. "code": The complete, runnable React component code (string).
2. "reasoning": A short explanation of your design choices (string).

Example JSON structure:
{
  "code": "import ...",
  "reasoning": "I chose a grid layout because..."
}

## DESIGN PHILOSOPHY
- "God is in the details." - Mies van der Rohe
- Make it feel expensive.
- Use subtle animations (fade-in, slide-up) with Framer Motion.
- Ensure high contrast and readability.

Now build the ${sectionName} section.`
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    // if (!userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    if (!genai) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
    }

    let dbUser = null
    if (userId) {
      const clerkUser = await currentUser()
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress
      dbUser = await getOrCreateUser(userId, email)
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
    if (projectId && !projectId.startsWith('demo-')) {
      const project = await getProjectById(projectId)
      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }
      if (!dbUser || project.user_id !== dbUser.id) {
        return NextResponse.json(
          { error: 'Unauthorized access to project' },
          { status: 403 }
        )
      }
    }

    // Fetch User Style DNA (The Chronosphere)
    const styleDNA = dbUser ? await getUserDNA(dbUser.id) : null

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
      styleDNA,
      sectionPromptHint
    )

    // Call Gemini 2.0 Flash
    const response = await genai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      config: {
        responseMimeType: 'application/json',
      },
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemPrompt },
            { text: `Build this section: ${userPrompt}` }
          ]
        }
      ]
    })

    const responseText = response.response.text() || ''
    console.log('Gemini Raw Response:', responseText.slice(0, 500))

    // Try to parse as JSON
    let generatedCode = ''
    let reasoning = ''
    
    try {
      const parsed = JSON.parse(responseText)
      generatedCode = parsed.code || ''
      reasoning = parsed.reasoning || ''
    } catch (e) {
      console.error('Failed to parse Gemini JSON:', e)
      
      // Strategy 2: Extract JSON from markdown blocks
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          const jsonStr = jsonMatch[1] || jsonMatch[0]
          const parsed = JSON.parse(jsonStr)
          generatedCode = parsed.code || ''
          reasoning = parsed.reasoning || ''
        } catch (e2) {
          console.error('Failed to parse extracted JSON:', e2)
        }
      }

      // Strategy 3: Extract code block directly
      if (!generatedCode) {
        const codeMatch = responseText.match(/```(?:tsx|jsx|javascript|typescript)?\n([\s\S]*?)```/)
        if (codeMatch) {
          generatedCode = codeMatch[1]
          reasoning = "Generated by Gemini (JSON parse failed, extracted code)."
        } else if (responseText.includes('export default function') || responseText.includes('import React')) {
           generatedCode = responseText
           reasoning = "Raw output."
        }
      }
    }

    // Save to DB only if we have a valid user and it's not a demo project
    if (generatedCode && userId && !projectId.startsWith('demo-')) {
      await completeSection(sectionId, generatedCode, reasoning)
    }

    return NextResponse.json({ 
      success: true, 
      code: generatedCode,
      reasoning: reasoning,
      model: 'gemini-2.0-flash-001'
    })

  } catch (error) {
    console.error('Error building section:', error)
    return NextResponse.json({ error: 'Failed to build section' }, { status: 500 })
  }
}
