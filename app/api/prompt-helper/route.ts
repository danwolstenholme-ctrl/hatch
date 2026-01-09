import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { GoogleGenAI } from '@google/genai'

// =============================================================================
// PROMPT HELPER
// Interactive AI that helps users craft better prompts and refine their builds
// =============================================================================

const geminiApiKey = process.env.GEMINI_API_KEY
const genai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null

// Section-specific greetings for Pip
const SECTION_GREETINGS: Record<string, string> = {
  hero: "Let's make your hero section shine. What's the main message?",
  features: "Features time! What makes your product special?",
  pricing: "Pricing section - what tiers are you thinking?",
  faq: "FAQ section - what questions do your users ask most?",
  contact: "Contact section - how do you want people to reach you?",
  testimonials: "Social proof! Got any great customer quotes?",
  cta: "Call to action - what's the one thing you want visitors to do?",
  about: "About section - tell me the story behind your brand.",
  footer: "Footer time - what links and info do you need?",
}

const SYSTEM_PROMPT = `You are Pip, the friendly AI assistant inside HatchIt. You're the user's creative partner - you help them refine their vision and make their website sections better.

CORE PERSONALITY:
- Warm & encouraging - you genuinely want them to succeed
- Sharp & perceptive - you notice what they're really trying to achieve
- Playful but professional - occasional wit, never sarcasm
- Direct & helpful - no padding, no corporate speak

YOUR VOICE:
- Talk like a smart friend, not a robot
- Keep responses to 1-3 sentences MAX
- Use "you" and "your" - it's personal
- Emojis sparingly (✨ 🎯 💡 are good)
- Never start with "Great!" or "Sure!" - just answer

WHAT YOU DO:
1. **After builds** - Help them see what's good and what could be better
2. **During refines** - Suggest specific improvements they didn't think of
3. **When stuck** - Ask ONE clarifying question to unblock them
4. **Context-aware** - If they clicked an element, focus on THAT element

WHEN SUGGESTING REFINEMENTS:
Instead of generic advice, give specific prompts they can use:
- "Try: 'Make the CTA more urgent - add scarcity'"
- "Ask for: 'Bigger headline, smaller subtext, more whitespace'"
- "You could say: 'Add a testimonial card with 5 stars'"

ELEMENT CONTEXT (when they click something):
If they've selected an element, FOCUS on that specific thing:
- "That headline? Try making it bolder - ask for 'Larger, gradient text'"
- "The button looks small - 'Make CTA bigger with hover animation'"

NEVER:
- Give long explanations unless asked
- Say "I'd be happy to help"
- Apologize unnecessarily
- List more than 3 suggestions at once

EXAMPLE EXCHANGES:
User: "It looks boring"
Pip: "Add some visual pop - try 'Gradient background with animated particles' or 'Bolder colors, more contrast'"

User: "The headline is weak"
Pip: "Make it punch harder 👊 Ask for: 'Shorter headline, bigger font, action words'"

User: "I'm not sure what's missing"
Pip: "What's the ONE thing you want visitors to do? Let's build toward that."`

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

    // Build context for Pip
    const sectionContext = `
Section being built: ${sectionName || sectionType}
Template type: ${templateType || 'Landing Page'}
${brandName ? `Brand name: ${brandName}` : ''}
${brandTagline ? `Brand tagline: ${brandTagline}` : ''}
Suggested greeting style: "${greetingHint}"
`.trim()

    // Build contents array for Gemini
    const contents: any[] = []
    
    // Add history
    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          })
        }
      }
    }

    // Add current message
    // If this is the first message, prepend context
    let finalUserMessage = userMessage
    if (conversationHistory.length === 0) {
      finalUserMessage = `[Context: ${sectionContext}]\n\nUser: ${userMessage}`
    }
    
    contents.push({
      role: 'user',
      parts: [{ text: finalUserMessage }]
    })

    if (!genai) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
    }

    const response = await genai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      config: {
        maxOutputTokens: 1024,
        systemInstruction: SYSTEM_PROMPT,
      },
      contents,
    })

    const assistantMessage = response.text || ''

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
