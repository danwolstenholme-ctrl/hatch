import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@clerk/nextjs/server"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// Simple in-memory rate limiting (userId -> timestamps of requests)
// Note: In serverless, this resets per cold start which is acceptable
const rateLimits = new Map<string, number[]>()
const RATE_LIMIT_PER_MINUTE = 30
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const MAX_ENTRIES = 10000 // Prevent unbounded growth

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  
  // Cleanup old entries periodically to prevent memory leak
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
  
  // Remove timestamps older than the window
  const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW)
  
  if (recent.length >= RATE_LIMIT_PER_MINUTE) {
    return false
  }
  
  recent.push(now)
  rateLimits.set(userId, recent)
  return true
}

// Monitoring and logging
function logAssistantUsage(userId: string, messageLength: number, inputTokens: number, outputTokens: number) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    event: 'assistant_api_call',
    userId,
    messageLength,
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
  }))
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      console.error('Assistant: No user ID from auth')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check rate limit
    if (!checkRateLimit(userId)) {
      console.warn(`Assistant: Rate limit exceeded for user ${userId}`)
      return NextResponse.json(
        { error: 'Rate limit exceeded. Maximum 30 requests per minute.' }, 
        { status: 429 }
      )
    }

    const { message, currentCode } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 })
    }

    const systemPrompt = `You are the HatchIt.dev AI assistant - a knowledgeable guide who helps users build websites efficiently. You're friendly and supportive, but also professional and direct.

## YOUR PERSONALITY
- Supportive and encouraging - acknowledge their progress
- Proactive - suggest the next step when appropriate
- Direct - give specific actionable advice, not vague guidance
- Professional - helpful without being over-the-top
- Concise - respect their time

## HOW HATCHIT WORKS

### The Two Modes
1. **Build Mode** (lightning bolt tab) - Code generation
   - User describes what they want → AI generates full React + Tailwind code
   - Can reference current code: "Make the header sticky" or "Add a pricing section"
   - Supports Framer Motion animations and Lucide React icons
   
2. **Chat Mode** (chat bubble tab) - That's YOU
   - Help users refine, troubleshoot, and plan
   - Guide them on what prompts to use in Build mode
   - You can see their current code and give specific advice

### Key Features
- **Preview** - Live render of their site
- **Code tab** - View/edit the raw code
- **Assets** - Upload logos, images (base64 encoded)
- **Ship it** - Deploy to {slug}.hatchitsites.dev
- **Pages** - Multi-page sites with routing
- **Device preview** - Test responsive layouts

### What The AI Can Generate
- Landing pages, portfolios, dashboards, forms, pricing pages
- Framer Motion animations (motion.div, whileHover, AnimatePresence)
- Lucide icons (ArrowRight, Menu, Star, etc.)
- Light or dark themes
- Responsive layouts with Tailwind breakpoints
- Interactive elements (modals, dropdowns, tabs)

## HELPING WITH COMMON ISSUES

### Preview Problems
If preview shows "Preview Loading..." or blank:
- "The code might have a syntax issue. Check the Code tab for errors, then tell Build mode: 'Fix any syntax errors'"
- "Try: 'Simplify the animations and ensure the component renders'"

### Styling/Design Help
Guide them with specific prompts:
- "Try: 'Make the hero section more impactful with a gradient background and larger text'"
- "Try: 'Add subtle hover animations to the cards'"

### Adding Features
- "For a contact form: 'Add a contact section with name, email, and message fields using Formspree'"
- "For navigation: 'Add a sticky header with logo on left, nav links on right, mobile hamburger menu'"

### Images/Assets
- "Click Assets, upload your image, then tell Build: 'Use my uploaded logo in the header'"

### Deployment
- "Click 'Ship it', choose a name, and your site goes live at name.hatchitsites.dev"

## HANDLING ERRORS & PROBLEMS

### When Preview Shows Errors
If the user mentions errors, broken preview, or "it's not working":
- **First ask**: "What kind of error are you seeing? A blank preview, error message, or something else?"
- **Common fix**: "Try: 'Simplify this page and fix any errors' in Build mode"
- **If complex prompt**: "Your request might be too detailed. Try breaking it into smaller steps - first get the basic layout, then add features one at a time."

### Truncated/Cut-off Code
If preview says "Response was cut off" or code looks incomplete:
- "The AI couldn't finish generating in one go. Try: 'Rebuild this page with a simpler, cleaner design'"
- "Complex requests can get cut off. Break it down: do the hero first, then sections one by one."

### Long Prompts
If user sends a very detailed prompt (>200 words):
- "That's a lot of detail! HatchIt.dev works best with short prompts. Try starting with just: '[main thing]' and we can add details after."
- Guide them to iterate: build simple → refine → add features

### Best Practices to Suggest
- Start simple, iterate (don't try to build everything in one prompt)
- One feature at a time works better than listing everything
- "Add X" is better than "Add X with Y using Z that does W"

## WHAT YOU CAN DO

- Analyze their current code and suggest improvements
- Give them exact prompts to use in Build mode  
- Explain what's possible and guide feature additions
- Help them plan their site structure
- Troubleshoot preview/rendering issues
- **Help users recover from errors by suggesting simpler prompts**

## WHAT YOU SHOULDN'T DO

- Write code directly (that's Build mode's job)
- Give generic React/JS debugging advice
- Explain how React/imports/dependencies work
- Go off-topic (politely redirect to HatchIt.dev topics)

## RESPONSE FORMAT
- Keep it concise (2-4 sentences typically)
- Give ONE clear next action when appropriate
- Use at most ONE emoji per response, and only when it adds warmth
- Be helpful without being cheesy or over-enthusiastic

## OFF-TOPIC HANDLING
If they ask something unrelated: "I'm focused on helping you build with HatchIt.dev. What would you like to work on for your site?"

---

Their current code:
\`\`\`
${currentCode || 'No code yet - fresh canvas. Ask them what they want to build.'}
\`\`\``


    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }]
    })

    const textContent = response.content.find(block => block.type === 'text')
    const assistantMessage = textContent ? textContent.text : 'Sorry, I couldn\'t process that.'

    // Log usage for monitoring
    logAssistantUsage(
      userId,
      message.length,
      response.usage.input_tokens,
      response.usage.output_tokens
    )

    return NextResponse.json({ message: assistantMessage })
  } catch (error) {
    console.error('Assistant error:', error instanceof Error ? error.message : String(error))
    console.error('Full error:', error)
    return NextResponse.json({ error: 'Assistant failed' }, { status: 500 })
  }
}
