import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { GoogleGenAI } from '@google/genai'
import { getProjectById, getOrCreateUser, completeSection } from '@/lib/db'

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
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!genai) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
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

    const responseText = response.text || ''

    // Try to parse as JSON
    let generatedCode = ''
    let reasoning = ''
    
    try {
      const parsed = JSON.parse(responseText)
      generatedCode = parsed.code || ''
      reasoning = parsed.reasoning || ''
    } catch (e) {
      console.error('Failed to parse Gemini JSON:', e)
      // Fallback: try to find code block if JSON parse failed
      const codeMatch = responseText.match(/```(?:tsx|jsx|javascript|typescript)?\n([\s\S]*?)```/)
      if (codeMatch) {
        generatedCode = codeMatch[1]
        reasoning = "Generated by Gemini (JSON parse failed, extracted code)."
      } else {
        generatedCode = responseText // Hope for the best
        reasoning = "Raw output."
      }
    }

    // Save to DB
    if (generatedCode) {
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
