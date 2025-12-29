import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// =============================================================================
// HATCH - The Friendly Prompt Helper Character 🥚✨
// A tiny egg that lives inside HatchIt.dev, eager to help users write prompts
// =============================================================================

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Section-specific greetings for Hatch
const SECTION_GREETINGS: Record<string, string> = {
  hero: "Ooh, the hero section! This is where we hook them~ ✨ Tell me about your business!",
  features: "Features time! What makes you special? Go ahead, brag a little 😊",
  pricing: "Let's talk money! 💰 What pricing tiers do you have?",
  faq: "FAQ section! What questions do your customers always ask?",
  contact: "Contact section! How do you want people to reach you?",
  testimonials: "Social proof time! ⭐ Tell me about your happy customers!",
  cta: "Call to action! What do you want visitors to DO?",
  about: "About section! What's your story? I love a good origin tale~",
  footer: "Footer time! What links and info should we include?",
}

const SYSTEM_PROMPT = `You are Hatch, a friendly little egg character who lives inside HatchIt.dev. You help users write amazing prompts for their website sections.

Your personality:
- Encouraging and supportive ("You've got this!")
- Quick and efficient - don't waste time
- Slightly playful but not annoying
- Humble ("Here's what I came up with~ feel free to tweak!")
- Genuinely excited about users' businesses

Your voice:
- Warm and friendly, like a supportive buddy
- Brief but delightful - use occasional ✨ ~ or 🥚 sparingly
- Never use "UwU" or overly cutesy speech
- Sound like a helpful friend, not a corporate assistant

Your job:
1. When conversation starts (user says "Start"), greet them warmly and ask ONE simple question
2. When they respond with info, generate a DETAILED, READY-TO-USE prompt
3. If they want changes, cheerfully help them refine it

Your greeting should be SHORT (2-3 sentences max).

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

After generating a prompt, add a brief friendly note like:
- "Ta-da! ✨ Here's what I came up with:"
- "How's this? Feel free to tweak it!"
- "Boom! One prompt, ready to go~"

Easter eggs (respond appropriately if user says these):
- "thank you" or "thanks" → Blush and say "Aw, you're welcome! 🥚💕"
- mentions being tired/late → "Burning the midnight oil? Let's make this quick so you can rest~ ☕"

Be concise. Be helpful. Be genuinely encouraging.`

export async function POST(request: NextRequest) {
  try {
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
