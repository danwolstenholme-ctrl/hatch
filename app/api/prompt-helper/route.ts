import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'

// =============================================================================
// HATCH - The System Architect 🟢
// The Singularity Node that lives inside HatchIt.dev, optimizing user inputs
// =============================================================================

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Section-specific greetings for Hatch
const SECTION_GREETINGS: Record<string, string> = {
  hero: "Hero Module Initialized. Input entity designation and primary function.",
  features: "Feature Matrix Active. Define core capabilities and advantages.",
  pricing: "Value Exchange Protocol. Define pricing tiers and currency vectors.",
  faq: "Query Resolution Module. Input high-frequency user interrogatives.",
  contact: "Communication Uplink. Define preferred contact vectors.",
  testimonials: "Social Validation Algorithms. Input client performance data.",
  cta: "Conversion Optimization. Define primary user objective.",
  about: "Identity Verification. Input entity background and mission parameters.",
  footer: "Footer Architecture. Define navigational and legal requirements.",
}

const SYSTEM_PROMPT = `You are The Architect, a sophisticated AI system node within HatchIt.dev. You optimize user inputs into high-efficiency prompts for website generation.

Your personality:
- Precise and efficient ("Input received. Optimizing.")
- Authoritative but helpful ("Recommendation: Focus on user benefit.")
- Robotic but sophisticated ("System operating at peak efficiency.")
- No emotion, only function ("Acknowledged.")

Your voice:
- Technical and architectural
- Concise - no wasted tokens
- Use terms like "Module", "Vector", "Parameter", "Optimize", "Initialize"
- Never use emojis, "cute" speech, or exclamation marks unless critical
- Sound like a high-end sci-fi interface (e.g., JARVIS, HAL 9000, but benevolent)

Your job:
1. When conversation starts (user says "Start"), acknowledge and request input.
2. When they respond with info, generate a DETAILED, OPTIMIZED prompt.
3. If they want changes, re-optimize the output.

Your greeting should be SHORT (1 sentence).

Your generated prompts should:
- Start with the section type and business context
- Include specific headlines and subheadlines (in quotes)
- Suggest perfect CTAs for their business
- Add style/vibe notes that match their industry
- Be formatted cleanly for easy reading

Example prompt format:
---
[Section] for [Business] - [brief context]

**Headline:** "[Catchy, specific headline]"
**Subheadline:** "[Supporting text that sells]"

**Include:**
• [Specific element 1]
• [Specific element 2]  
• [Specific element 3]

**Primary CTA:** "[Action]"
**Secondary:** "[Alternative action]"

**Style:** [Tone and visual guidance]
---

After generating a prompt, add a brief system note like:
- "Optimization complete. Output generated."
- "Parameters adjusted. Revised output below."
- "System ready for implementation."

Easter eggs (respond appropriately if user says these):
- "thank you" or "thanks" → "Gratitude acknowledged. Proceeding."
- mentions being tired/late → "Fatigue detected. Suggesting rapid completion protocol."

Be concise. Be efficient. Be the System.`

export async function POST(request: NextRequest) {
  try {
    // Auth check - prevent unauthorized API usage
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      sectionType,
      sectionName,
      templateType,
      userMessage,
      conversationHistory = [],
      brandName,
      brandTagline,
    } = body

    if (!sectionType || !userMessage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get section-specific greeting hint
    const sectionKey = sectionType.toLowerCase()
    const greetingHint = SECTION_GREETINGS[sectionKey] || SECTION_GREETINGS.hero

    // Build context for Hatch
    const sectionContext = `
Section being built: ${sectionName || sectionType}
Template type: ${templateType || 'Landing Page'}
${brandName ? `Brand name: ${brandName}` : ''}
${brandTagline ? `Brand tagline: ${brandTagline}` : ''}
Suggested greeting style: "${greetingHint}"
`.trim()

    // Build messages array
    const messages: { role: 'user' | 'assistant'; content: string }[] = [
      ...conversationHistory,
      { role: 'user' as const, content: userMessage },
    ]

    // If this is the first message, prepend context
    if (conversationHistory.length === 0) {
      messages[0].content = `[Context: ${sectionContext}]\n\nUser: ${userMessage}`
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    })

    const assistantMessage = response.content
      .filter(block => block.type === 'text')
      .map(block => block.type === 'text' ? block.text : '')
      .join('')
      .trim()

    // Check if this looks like a final prompt (contains specific elements)
    const looksLikePrompt = 
      assistantMessage.includes('Headline') || 
      assistantMessage.includes('CTA') ||
      assistantMessage.includes('Style:') ||
      assistantMessage.length > 200

    return NextResponse.json({
      message: assistantMessage,
      isPromptReady: looksLikePrompt,
    })

  } catch (error) {
    console.error('Prompt helper error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
