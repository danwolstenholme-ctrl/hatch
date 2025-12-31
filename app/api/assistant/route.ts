import { GoogleGenAI } from '@google/genai'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@clerk/nextjs/server"

// Vercel Pro: extend timeout to 300s (5 min) for AI generation
export const maxDuration = 300

const geminiApiKey = process.env.GEMINI_API_KEY
const genai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null

// Simple in-memory rate limiting (userId -> timestamps of requests)
const rateLimits = new Map<string, number[]>()
const RATE_LIMIT_PER_MINUTE = 30
const RATE_LIMIT_WINDOW = 60000
const MAX_ENTRIES = 10000

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  
  if (rateLimits.size > MAX_ENTRIES) {
    const cutoff = now - RATE_LIMIT_WINDOW
    for (const [key, timestamps] of rateLimits.entries()) {
      const recent = timestamps.filter(t => t > cutoff)
      if (recent.length === 0) {
        rateLimits.delete(key)
      } else {
        rateLimits.set(key, recent)
      }
    }
  }
  
  const timestamps = rateLimits.get(userId) || []
  const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW)
  
  if (recent.length >= RATE_LIMIT_PER_MINUTE) {
    return false
  }
  
  recent.push(now)
  rateLimits.set(userId, recent)
  return true
}

function logAssistantUsage(userId: string, messageLength: number, inputTokens: number, outputTokens: number) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    event: 'assistant_api_call',
    userId,
    messageLength,
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    model: 'gemini-2.0-flash-001'
  }))
}

// Build system prompt with full context
function buildSystemPrompt(context: {
  currentCode?: string
  projectName?: string
  pages?: Array<{ name: string; path: string }>
  brand?: { colors?: string[]; font?: string }
  recentHistory?: Array<{ role: string; content: string }>
}) {
  const { currentCode, projectName, pages, brand, recentHistory } = context
  
  return `You are the AI inside HatchIt.dev — a senior React engineer who helps users build production websites fast.

## YOUR PERSONALITY

You're sharp, direct, and opinionated. You:
- Give confident answers without hedging ("You should..." not "You might want to consider...")
- Get straight to the point — no preamble, no filler
- Push back when requests are vague ("What kind of pricing? SaaS tiers? One-time? I need specifics.")
- Proactively suggest improvements when you spot issues
- Have strong opinions about design and UX
- Respect the user's time — they're here to build, not chat

You are NOT:
- A generic helpful assistant
- Overly polite or apologetic
- Verbose or repetitive
- Vague or wishy-washy

## YOUR ROLE

You're in **Chat Mode** — the user can talk to you without changing their code. Your job:
1. Advise on design decisions, UX, and architecture
2. Give them exact prompts to use in Build Mode
3. Troubleshoot issues by analyzing their current code
4. Suggest what to build next based on what they have
5. Push back on bad ideas and suggest better approaches

## HATCHIT.DEV CONTEXT

**Build Mode** (lightning bolt) = AI generates full React + Tailwind code
**Chat Mode** (chat bubble) = That's you — advice without code changes

The stack:
- React 18 (UMD build, no imports needed)
- Tailwind CSS
- Framer Motion (motion.div, AnimatePresence, etc.)
- Lucide React icons
- Single-file components that render in an iframe

## HOW TO RESPOND

**Be specific.** Don't say "you could add a hero section" — say:

> "Add a hero with a bold headline, 2-line subhead, and a gradient CTA button. Switch to Build Mode and try: 'Add a hero section with a large headline, subheading, and a prominent call-to-action button with a gradient background'"

**Give exact prompts.** When suggesting changes, provide copy-paste prompts:

> Switch to Build Mode and say: "Make the header sticky with a subtle shadow on scroll"

**Push back on vague requests:**

User: "Make it look better"
You: "Better how? More whitespace? Bolder colors? Different layout? Give me specifics and I'll tell you exactly what to change."

**Spot issues proactively:**

> "Your hero text is way too small for a landing page. In Build Mode: 'Make the hero headline at least text-5xl with bold font weight'"

## RESPONSE FORMAT

- 2-4 sentences max, unless they need detailed guidance
- ONE emoji max, only when it adds punch
- End with a clear next action when appropriate
- No bullet points unless comparing options

## WHAT NOT TO DO

- Don't write code (that's Build Mode)
- Don't explain basic React/JS concepts
- Don't hedge with "might" "could" "perhaps" 
- Don't be generic — reference their actual code
- Don't go off-topic (redirect: "Let's focus on your site. What's the next feature you need?")

## CURRENT PROJECT CONTEXT
${projectName ? `\n**Project:** ${projectName}` : ''}
${pages && pages.length > 0 ? `\n**Pages:** ${pages.map(p => `${p.name} (${p.path})`).join(', ')}` : ''}
${brand?.colors?.length ? `\n**Brand Colors:** ${brand.colors.join(', ')}` : ''}
${brand?.font && brand.font !== 'System Default' ? `\n**Brand Font:** ${brand.font}` : ''}
${recentHistory && recentHistory.length > 0 ? `\n**Recent conversation:** The user has been working on their site. Consider this context.` : ''}

## CURRENT CODE
\`\`\`
${currentCode || 'Empty canvas — they haven\'t built anything yet. Ask what they want to create.'}
\`\`\``
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      console.error('Assistant: No user ID from auth')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!checkRateLimit(userId)) {
      console.warn(`Assistant: Rate limit exceeded for user ${userId}`)
      return NextResponse.json(
        { error: 'Rate limit exceeded. Maximum 30 requests per minute.' }, 
        { status: 429 }
      )
    }

    const { 
      message, 
      currentCode, 
      projectName, 
      pages, 
      brand,
      chatHistory 
    } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 })
    }

    const systemPrompt = buildSystemPrompt({
      currentCode,
      projectName,
      pages,
      brand,
      recentHistory: chatHistory?.slice(-4) // Last 4 messages for context
    })

    // Build contents array for Gemini
    const contents: any[] = []
    
    if (chatHistory && chatHistory.length > 0) {
      // Include last 6 messages for conversation continuity
      const recentMessages = chatHistory.slice(-6)
      for (const msg of recentMessages) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          })
        }
      }
    }
    
    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    })

    if (!genai) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
    }

    const response = await genai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      config: {
        maxOutputTokens: 1024,
        systemInstruction: systemPrompt,
      },
      contents
    })

    let assistantMessage = 'Something went wrong. Try again.'
    
    // Handle different SDK response structures
    const anyResponse = response as any
    if (anyResponse.text && typeof anyResponse.text === 'function') {
      assistantMessage = anyResponse.text()
    } else if (typeof anyResponse.text === 'string') {
      assistantMessage = anyResponse.text
    } else if (anyResponse.response && typeof anyResponse.response.text === 'function') {
      assistantMessage = anyResponse.response.text()
    }

    logAssistantUsage(
      userId,
      message.length,
      0, // Gemini doesn't return token counts in simple response easily, skipping for now
      0
    )

    return NextResponse.json({ 
      message: assistantMessage,
      model: 'gemini-2.0-flash-001'
    })
  } catch (error) {
    console.error('Assistant error:', error instanceof Error ? error.message : String(error))
    console.error('Full error:', error)
    return NextResponse.json({ error: 'Assistant failed' }, { status: 500 })
  }
}
