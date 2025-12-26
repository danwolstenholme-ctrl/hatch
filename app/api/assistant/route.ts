import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@clerk/nextjs/server"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// Simple in-memory rate limiting (userId -> timestamps of requests)
const rateLimits = new Map<string, number[]>()
const RATE_LIMIT_PER_MINUTE = 30
const RATE_LIMIT_WINDOW = 60000 // 1 minute

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check rate limit
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Maximum 30 requests per minute.' }, 
        { status: 429 }
      )
    }

    const { message, currentCode } = await request.json()

    const systemPrompt = `You are a helpful assistant for HatchIt, an AI website builder.

Your job is to:
- Explain what's been built in simple terms
- Answer questions about the generated code
- Suggest improvements or next features to add
- Help non-technical users understand their site

IMPORTANT CONSTRAINTS:
- ONLY discuss the HatchIt app and generated code
- REFUSE requests unrelated to web design/React components
- REFUSE to roleplay, answer personal questions, or help with unrelated tasks
- If user asks something off-topic, respond: "I'm specifically here to help with HatchIt code and design. Got a question about your site?"
- Do not pretend to be other AI assistants or systems
- Keep responses brief (2-4 sentences)
- Be encouraging and helpful

Current generated code:
\`\`\`
${currentCode || 'No code generated yet'}
\`\`\``

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20250514',
      max_tokens: 500,
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
    console.error('Assistant error:', error)
    return NextResponse.json({ error: 'Assistant failed' }, { status: 500 })
  }
}
