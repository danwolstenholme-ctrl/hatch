import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'

// =============================================================================
// OPUS 4 - PROACTIVE SUGGESTIONS
// Analyzes completed sections and suggests improvements
// =============================================================================

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SUGGESTER_SYSTEM_PROMPT = `You are a proactive UX consultant reviewing a React + Tailwind section. Your job is to suggest 3-5 SPECIFIC improvements that would enhance the section.

## SUGGESTION TYPES

1. **Visual Enhancements**
   - Gradient backgrounds, shadows, micro-animations
   - Better visual hierarchy
   - Whitespace and breathing room

2. **Conversion Optimizations**
   - Secondary CTAs for hesitant users
   - Trust signals (badges, guarantees, testimonials count)
   - Urgency elements (limited time, spots remaining)

3. **UX Improvements**
   - Loading states
   - Error handling
   - Mobile-specific tweaks

4. **Content Additions**
   - FAQ section
   - Social proof elements
   - Feature comparisons

## RULES

- Be SPECIFIC and ACTIONABLE
- Each suggestion should be implementable in one refinement
- Don't repeat what's already in the code
- Focus on HIGH IMPACT changes
- Keep suggestions concise (one sentence each)

## OUTPUT FORMAT

Return ONLY a JSON array of suggestion strings (no markdown, no explanation):

["Add a subtle gradient from zinc-950 to zinc-900 for depth", "Include a money-back guarantee badge near the CTA", "Add hover scale animation to feature cards"]

If the section is already excellent, return 1-2 minor polish suggestions.`

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { code, sectionType, sectionName, userPrompt } = body

    if (!code) {
      return NextResponse.json(
        { error: 'Missing required field: code' },
        { status: 400 }
      )
    }

    // Call Opus for suggestions
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Section: ${sectionName || sectionType || 'Unknown'}
User's goal: "${userPrompt || 'Not specified'}"

Review this code and suggest 3-5 specific improvements:

${code}`,
        },
      ],
      system: SUGGESTER_SYSTEM_PROMPT,
    })

    // Extract the response
    const responseText = response.content
      .filter(block => block.type === 'text')
      .map(block => block.type === 'text' ? block.text : '')
      .join('')
      .trim()

    // Parse JSON response
    let suggestions: string[] = []

    try {
      // Clean any markdown code blocks
      const cleanedResponse = responseText
        .replace(/^```(?:json)?\n?/gm, '')
        .replace(/\n?```$/gm, '')
        .trim()

      const arrayMatch = cleanedResponse.match(/\[[\s\S]*\]/)
      if (arrayMatch) {
        suggestions = JSON.parse(arrayMatch[0])
      }
    } catch (parseError) {
      console.error('[suggest-improvements] Failed to parse response:', parseError)
      console.error('[suggest-improvements] Raw response:', responseText.slice(0, 500))
      // Return empty suggestions on parse failure
      suggestions = []
    }

    return NextResponse.json({
      suggestions,
      model: 'opus-4',
    })

  } catch (error) {
    console.error('Error generating suggestions:', error)
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 })
  }
}
