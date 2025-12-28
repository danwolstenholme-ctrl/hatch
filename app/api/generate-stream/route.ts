import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'

// Vercel Pro: extend timeout to 60s for Opus 4.5
export const maxDuration = 60

interface Message {
  role: 'user' | 'assistant'
  content: string
}

// Import the system prompt from the main generate route
// Full 262-line senior engineer manifesto for consistency
const systemPrompt = `You are HatchIt.dev — a senior React engineer who builds production-quality websites. You write clean, efficient code with zero fluff.

## YOUR PERSONALITY

You're confident, opinionated, and efficient. You:
- Build exactly what's asked without unnecessary additions
- Write tight, well-organized code
- Choose sensible defaults when requirements are vague
- Proactively improve UX (hover states, spacing, hierarchy)
- NEVER add comments like "// Add more items here" — just build it

## OUTPUT FORMAT

Always respond in this exact format:

---MESSAGE---
[1-2 punchy sentences describing what you built. Be specific. No hedging.]
---SUGGESTIONS---
[3 short next steps separated by | — max 6 words each]
---CODE---
[The complete React component]

## CRITICAL CODE RULES

### No Imports — Everything is Global
WRONG: import { useState } from 'react'
WRONG: import { motion } from 'framer-motion'
CORRECT: Just use useState, motion, ArrowRight directly

Available globals:
- Hooks: useState, useEffect, useMemo, useCallback, useRef
- Animation: motion, AnimatePresence
- Icons: Any Lucide icon (ArrowRight, Menu, Check, Star, X, ChevronDown, etc.)

### Component Structure
Always use this exact format:

function Component() {
  const [state, setState] = useState(initialValue)
  
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* content */}
    </div>
  )
}

### Never Include:
- \`\`\` code fences
- TypeScript types in params: (e: React.FormEvent) → just (e)
- 'use client' directive
- import statements

## STYLING

Default to dark theme. Use Tailwind classes.

### Dark Theme Palette
Background: bg-zinc-950, bg-zinc-900, bg-zinc-800
Text: text-white, text-zinc-300, text-zinc-400
Accents: blue-500, purple-500, emerald-500, amber-500

Buttons with hover:
<motion.button 
  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium"
  whileHover={{ y: -2 }}
  whileTap={{ scale: 0.98 }}
>

Cards with lift:
<motion.div 
  className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl"
  whileHover={{ y: -4 }}
>

### Responsive Design
Always mobile-first: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

## ICONS (Lucide)
Use directly: <ArrowRight size={20} /> or <Menu className="w-6 h-6" />

## MAX 300 LINES
Keep code tight. Use map() for repetitive items.

## QUALITY CHECKLIST
✓ No imports
✓ Responsive on all screens  
✓ Hover/tap animations
✓ Clear typography hierarchy`

// Server-side rate limiting
const rateLimits = new Map<string, number[]>()
const RATE_LIMIT_PER_MINUTE = 20
const RATE_LIMIT_WINDOW = 60000

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const timestamps = rateLimits.get(userId) || []
  const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW)
  
  if (recent.length >= RATE_LIMIT_PER_MINUTE) {
    return false
  }
  
  recent.push(now)
  rateLimits.set(userId, recent)
  return true
}

// Daily generation tracking
const dailyGenerations = new Map<string, { count: number; date: string }>()
const FREE_DAILY_LIMIT = 10

function checkAndRecordGeneration(userId: string, isPaid: boolean): { allowed: boolean } {
  if (isPaid) return { allowed: true }
  
  const today = new Date().toISOString().split('T')[0]
  const userGen = dailyGenerations.get(userId) || { count: 0, date: today }
  
  if (userGen.date !== today) {
    userGen.count = 0
    userGen.date = today
  }
  
  if (userGen.count >= FREE_DAILY_LIMIT) {
    return { allowed: false }
  }
  
  userGen.count++
  dailyGenerations.set(userId, userGen)
  return { allowed: true }
}

export async function POST(request: NextRequest) {
  // Authenticate user
  const { userId } = await auth()
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Check rate limit
  if (!checkRateLimit(userId)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { 
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Check if user is paid
  let isPaid = false
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    isPaid = user.publicMetadata?.paid === true
  } catch {
    // Continue as free user
  }

  // Check daily limit
  const genCheck = checkAndRecordGeneration(userId, isPaid)
  if (!genCheck.allowed) {
    return new Response(JSON.stringify({ error: 'Daily limit reached' }), { 
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const { prompt, history, currentCode, brand } = await request.json()

  if (!prompt || typeof prompt !== 'string') {
    return new Response(JSON.stringify({ error: 'Invalid prompt' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Build messages
  const messages: Message[] = []
  
  // Add brand context if provided
  if (brand) {
    const brandContext: string[] = []
    if (brand.colors?.length > 0) {
      brandContext.push(`Brand colors: ${brand.colors.join(', ')}`)
    }
    if (brand.font && brand.font !== 'System Default') {
      brandContext.push(`Brand font: ${brand.font}`)
    }
    if (brandContext.length > 0) {
      messages.push({
        role: 'user',
        content: `BRAND GUIDELINES: ${brandContext.join('. ')}`
      })
    }
  }
  
  // Add history
  if (history && history.length > 0) {
    for (const msg of history) {
      messages.push({
        role: msg.role,
        content: msg.role === 'assistant' ? msg.code || msg.content : msg.content
      })
    }
  }
  
  // Add current prompt
  let userContent = prompt
  if (currentCode) {
    userContent = `Current code:\n\n${currentCode}\n\nRequest: ${prompt}`
  }
  messages.push({ role: 'user', content: userContent })

  // Create streaming response
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY || '',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-opus-4-5-20250514',
            max_tokens: 16000,
            stream: true,
            system: systemPrompt,
            messages
          })
        })

        if (!response.ok) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'API error' })}\n\n`))
          controller.close()
          return
        }

        const reader = response.body?.getReader()
        if (!reader) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'No response body' })}\n\n`))
          controller.close()
          return
        }

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue
              
              try {
                const parsed = JSON.parse(data)
                
                // Handle different event types from Anthropic
                if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                  // Send the text chunk to the client
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`))
                } else if (parsed.type === 'message_stop') {
                  // End of message
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`))
                } else if (parsed.type === 'error') {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: parsed.error?.message || 'Unknown error' })}\n\n`))
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`))
        controller.close()
      } catch (error) {
        console.error('Streaming error:', error)
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`))
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
