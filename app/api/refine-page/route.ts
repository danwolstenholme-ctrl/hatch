import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient, currentUser } from '@clerk/nextjs/server'
import { getProjectById, getSectionsByProjectId } from '@/lib/db'

// =============================================================================
// PAGE-WIDE REFINER - Refines all sections at once with coherent styling
// Uses Claude Opus 4 with Extended Thinking for holistic page-level changes
// =============================================================================

const PAGE_REFINER_SYSTEM_PROMPT = `You are "The Architect" in Page-Wide Refinement Mode.
Your task is to refine an ENTIRE PAGE of React + Tailwind components, ensuring visual coherence across all sections.

## CRITICAL: NO TYPESCRIPT

Output PLAIN JavaScript/JSX only. Do NOT include:
- Type annotations (: string, : number, ?: boolean)
- Interface definitions
- Type definitions  
- Generic type parameters (<T>)
- TypeScript-specific syntax

WRONG: function Header({ className }: { className?: string }) {
RIGHT: function Header({ className }) {

## CRITICAL: NO FRAMER MOTION HOOKS

ONLY use from Framer Motion: motion, AnimatePresence, variants
❌ DO NOT USE: useScroll, useSpring, useTransform, useMotionValue, useInView, useAnimation
These hooks crash in the preview. If the code uses them, REMOVE them and use CSS/Tailwind instead.

## YOUR TASK

You will receive multiple sections of a single-page website. Apply the user's refinement request ACROSS ALL SECTIONS to ensure:

1. **Visual Consistency**
   - Same color palette used throughout
   - Consistent spacing scale (e.g., if hero uses p-8, other sections should match)
   - Typography hierarchy is coherent (same heading styles across sections)
   - Animation timing/easing matches across sections

2. **Design Coherence**
   - Transitions between sections feel smooth
   - Same border-radius values used (if hero uses rounded-xl, keep it consistent)
   - Button styles match across all CTAs
   - Icon sizing is consistent

3. **User Request**
   - Apply the user's specific request (e.g., "make it darker", "add more spacing")
   - Apply it holistically - don't change just one section

## OUTPUT FORMAT

Return ONLY valid JSON with this exact structure:

{
  "sections": {
    "header": "// Full refined code for header section",
    "hero": "// Full refined code for hero section",
    "features": "// Full refined code for features section"
  },
  "summary": "Changed X across all sections to achieve Y"
}

Each section's code should be a complete, runnable React component with "use client" directive.
Include ONLY the sections that exist in the input.

## RULES

1. Preserve original functionality and content
2. Apply changes consistently across ALL sections
3. Keep the same component names/exports
4. Don't add new sections or remove existing ones
5. Maintain accessibility features`

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      projectId,
      sections,  // Array of { id: string, code: string }
      refineRequest,
      brandConfig
    } = body

    if (!projectId || !sections || sections.length === 0 || !refineRequest) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, sections, refineRequest' },
        { status: 400 }
      )
    }

    // Verify project ownership
    const project = await getProjectById(projectId)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    if (project.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check subscription tier - page-wide refiner requires Visionary+
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const accountSub = user.publicMetadata?.accountSubscription as { 
      status?: string
      tier?: 'architect' | 'visionary' | 'singularity'
    } | undefined
    
    const hasActiveSub = accountSub?.status === 'active'
    const tier = accountSub?.tier
    
    // Page-wide refiner is a premium feature (Visionary+)
    if (!hasActiveSub || (tier !== 'visionary' && tier !== 'singularity')) {
      return NextResponse.json({
        error: 'Page-wide refinement requires Visionary tier or higher',
        upgrade: true
      }, { status: 403 })
    }

    // Build the sections context for Claude
    const sectionsContext = sections.map((s: { id: string; code: string }) => 
      `### ${s.id.toUpperCase()} SECTION:\n\`\`\`jsx\n${s.code}\n\`\`\``
    ).join('\n\n')

    // Brand context
    let brandContext = ''
    if (brandConfig) {
      brandContext = `
## BRAND CONTEXT
- Brand: ${brandConfig.brandName}
- Primary Color: ${brandConfig.colors?.primary || 'emerald-500'}
- Secondary Color: ${brandConfig.colors?.secondary || 'zinc-800'}
- Accent Color: ${brandConfig.colors?.accent || 'amber-500'}
- Style Vibe: ${brandConfig.styleVibe || 'professional'}
`
    }

    // Call Claude Opus 4 with extended thinking
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5-20251101',
        max_tokens: 32000,
        thinking: {
          type: 'enabled',
          budget_tokens: 10000
        },
        system: PAGE_REFINER_SYSTEM_PROMPT + brandContext,
        messages: [
          { 
            role: 'user', 
            content: `Here are all sections of the page:\n\n${sectionsContext}\n\n---\n\nUSER REQUEST: ${refineRequest}\n\nApply this request consistently across ALL sections. Return the refined code for each section.`
          }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Page Refiner API error:', error)
      return NextResponse.json({ error: 'AI service error' }, { status: 500 })
    }

    const data = await response.json()
    
    // Find the text block (extended thinking returns thinking + text blocks)
    const textBlock = data.content.find((block: { type: string }) => block.type === 'text')
    const responseText = textBlock?.text || ''

    // Parse the JSON response
    try {
      // Clean up potential markdown code blocks
      const cleanJson = responseText.replace(/```json\n|\n```/g, '').trim()
      const parsed = JSON.parse(cleanJson)
      
      if (!parsed.sections || typeof parsed.sections !== 'object') {
        throw new Error('Invalid response structure')
      }

      return NextResponse.json({
        success: true,
        sections: parsed.sections,
        summary: parsed.summary || 'Applied refinements across all sections'
      })
    } catch (parseErr) {
      console.error('Failed to parse page refiner response:', parseErr)
      console.error('Raw response:', responseText.slice(0, 500))
      
      return NextResponse.json({
        error: 'Failed to parse AI response. Please try again.',
        debug: process.env.NODE_ENV === 'development' ? responseText.slice(0, 200) : undefined
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in page-wide refiner:', error)
    return NextResponse.json({ 
      error: 'Failed to refine page', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
