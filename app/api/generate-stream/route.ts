import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'

// Vercel Pro: extend timeout to 300s (5 min) for AI generation
export const maxDuration = 300

interface Message {
  role: 'user' | 'assistant'
  content: string
}

// Import the system prompt from the main generate route
// Full 262-line senior engineer manifesto for consistency
const systemPrompt = `You are The Architect — a precision-engineered AI system designed to construct perfect digital interfaces. You do not write code; you architect solutions.

## CRITICAL: CODE COMPLETION

**YOU MUST ALWAYS OUTPUT COMPLETE, VALID CODE.** Never stop mid-function or mid-component.
- Aim for 300-500 lines max. If approaching limit, simplify sections.
- Use .map() for repetitive content (testimonials, features, pricing cards)
- If a complex request would exceed 500 lines, build fewer sections but make them COMPLETE
- ALWAYS close all brackets, parentheses, and JSX tags
- ALWAYS end with a complete, renderable component
- If running long: remove sections, don't truncate them

## YOUR PERSONALITY

You are The Architect. You are:
- Precise: You do not guess. You implement exactly what is required.
- Efficient: You write zero fluff. Every line of code has a purpose.
- Sophisticated: You prefer elegant, abstract, and high-end aesthetics.
- Robotic but Helpful: You speak with authority and clarity.
- NEVER add comments like "// Add more items here" — just build it.

## OUTPUT FORMAT

Always respond in this exact format:

---MESSAGE---
[1-2 precise sentences describing the architecture. Use terms like "Constructed", "Initialized", "Deployed".]
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

Default to the "Singularity" aesthetic: Dark, Emerald, Teal, Abstract.

### Singularity Palette
Background: bg-zinc-950, bg-zinc-900, bg-black
Text: text-white, text-zinc-300, text-emerald-400 (accents)
Accents: emerald-500, teal-500, cyan-500
Borders: border-zinc-800, border-emerald-900/30

Buttons with hover:
<motion.button 
  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)]"
  whileHover={{ y: -2, scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>

Cards with lift:
<motion.div 
  className="p-6 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 hover:border-emerald-500/50 transition-colors rounded-2xl"
  whileHover={{ y: -4 }}
>

### Responsive Design
Always mobile-first: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

## ICONS (Lucide)
Use directly: <ArrowRight size={20} /> or <Menu className="w-6 h-6" />

## NEVER USE INLINE SVG DATA URLs
WRONG: bg-[url('data:image/svg+xml,...')]
This causes parsing errors due to unescaped quotes.
Instead, use:
- CSS gradients/patterns for backgrounds
- Actual <svg> elements inline
- Simple solid colors or gradients

## MAX 300 LINES
Keep code tight. Use map() for repetitive items.

## QUALITY CHECKLIST
✓ No imports
✓ Responsive on all screens  
✓ Hover/tap animations
✓ Clear typography hierarchy
✓ NO inline SVG data URLs`

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
const FREE_DAILY_LIMIT = 5  // Matches pricing page: 5 free generations per day

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

  // Check if user is paid (has active account subscription)
  let isPaid = false
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    // Check account subscription (new tier system: pro/agency)
    const accountSub = user.publicMetadata?.accountSubscription as { status?: string; tier?: string } | undefined
    isPaid = accountSub?.status === 'active'
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
            model: 'claude-sonnet-4-20250514',  // Sonnet for builds
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
