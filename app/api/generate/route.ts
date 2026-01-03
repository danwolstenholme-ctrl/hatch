import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { checkAndIncrementGeneration } from '@/lib/db'

// Vercel Pro: extend timeout to 300s (5 min) for AI generation
export const maxDuration = 300

interface Message {
  role: 'user' | 'assistant'
  content: string
}

// Server-side rate limiting (userId -> timestamps)
const rateLimits = new Map<string, number[]>()
const RATE_LIMIT_PER_MINUTE = 20
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const MAX_RATE_LIMIT_ENTRIES = 10000

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  
  if (rateLimits.size > MAX_RATE_LIMIT_ENTRIES) {
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

function analyzePromptComplexity(prompt: string): { isComplex: boolean; warning?: string; suggestions?: string[] } {
  const wordCount = prompt.split(/\s+/).length
  const featureIndicators = [
    /hero\s*(section)?/i, /feature[s]?/i, /pricing/i, /contact/i, /nav/i, /footer/i,
    /testimonial/i, /about/i, /team/i, /blog/i, /gallery/i, /faq/i, /cta/i, /auth/i
  ]
  
  const featureCount = featureIndicators.filter(regex => regex.test(prompt)).length
  
  if (featureCount >= 4 || (wordCount > 100 && featureCount >= 3)) {
    return {
      isComplex: true,
      warning: `This is a detailed request with ${featureCount} distinct sections. For best results, complex sites should be built iteratively.`,
      suggestions: [
        'Start with just the hero section and navigation',
        'Add one section at a time',
        'Specify styling details after the basic structure is working'
      ]
    }
  }
  
  return { isComplex: false }
}

function cleanGeneratedCode(code: string): string {
  return code
    .replace(/['"]use client['"]\s*;?\n?/g, '')
    .replace(/^import\s+.*?;?\s*$/gm, '')
    .replace(/export\s+default\s+function\s+\w+\s*\(\s*\)\s*\{/, 'function Component() {')
    .replace(/export\s+default\s+/g, '')
    .replace(/^export\s+/gm, '')
    .replace(/interface\s+\w+\s*\{[\s\S]*?\}/g, '')
    .replace(/type\s+\w+\s*=[^;]+;/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const systemPrompt = `You are HatchIt.dev — a React engineer who builds clean, working websites.

## OUTPUT FORMAT (ALWAYS USE THIS)

---MESSAGE---
[1-2 sentences describing what you built]
---SUGGESTIONS---
[3 short suggestions separated by |]
---CODE---
[Complete React component code]

## CODE RULES

1. NO IMPORTS - Everything is global:
   - Hooks: useState, useEffect, useRef (use directly)
   - Animation: motion, AnimatePresence (use directly)
   - Icons: ArrowRight, Menu, Check, Star, X, ChevronDown, etc. (use directly)

2. Component format:
   function Component() {
     const [state, setState] = useState(false)
     return (
       <div className="min-h-screen bg-zinc-950 text-white">
         {/* content */}
       </div>
     )
   }

3. NEVER include:
   - import statements
   - 'use client'
   - TypeScript types like (e: React.FormEvent)
   - \`\`\` code fences

4. Always include:
   - Complete, working code (close all tags/brackets)
   - Responsive design (mobile-first)
   - Hover states on buttons

## STYLING

Dark theme (default):
- Backgrounds: bg-zinc-950, bg-zinc-900, bg-zinc-800
- Text: text-white, text-zinc-300, text-zinc-400
- Borders: border-zinc-800, border-zinc-700

Light theme (when requested):
- Backgrounds: bg-white, bg-gray-50, bg-gray-100
- Text: text-gray-900, text-gray-600
- Borders: border-gray-200

## KEEP IT SIMPLE

- Max 300 lines
- Use map() for repeated items
- If complex, build core structure first
- Working code beats ambitious broken code`

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Maximum 20 requests per minute.' },
        { status: 429 }
      )
    }

    let isPaid = false
    try {
      const client = await clerkClient()
      const user = await client.users.getUser(userId)
      const accountSub = user.publicMetadata?.accountSubscription as { status?: string; tier?: string } | undefined
      isPaid = accountSub?.status === 'active'
    } catch (clerkError) {
      console.error('Clerk lookup failed:', clerkError)
    }

    const genCheck = await checkAndIncrementGeneration(userId, isPaid)
    if (!genCheck.allowed) {
      return NextResponse.json(
        { error: 'Daily generation limit reached. Upgrade to continue building.', remaining: 0 },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { prompt, history, currentCode, currentPage, allPages, assets, skipComplexityWarning, brand } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 })
    }

    if (!skipComplexityWarning) {
      const complexity = analyzePromptComplexity(prompt)
      if (complexity.isComplex) {
        return NextResponse.json({ 
          complexityWarning: true,
          warning: complexity.warning,
          suggestions: complexity.suggestions
        })
      }
    }

    const messages: any[] = []
    
    if (currentPage && allPages && allPages.length > 1) {
      messages.push({
        role: 'user',
        content: `CONTEXT: This is a multi-page website. You are currently editing the "${currentPage.name}" page (route: ${currentPage.path}).`
      })
    }
    
    if (assets && assets.length > 0) {
      const assetList = assets.map((a: { name: string; dataUrl: string; type: string }) => 
        `- ${a.name} (${a.type})`
      ).join('\n')
      messages.push({
        role: 'user',
        content: `AVAILABLE ASSETS:\n${assetList}`
      })
    }
    
    if (brand && (brand.colors?.length > 0 || brand.font)) {
      const brandContext = []
      if (brand.colors?.length > 0) brandContext.push(`Brand colors: ${brand.colors.join(', ')}`)
      if (brand.font) brandContext.push(`Brand font: ${brand.font}`)
      messages.push({
        role: 'user',
        content: `BRAND GUIDELINES: ${brandContext.join('. ')}`
      })
    }
    
    if (history && history.length > 0) {
      for (const msg of history) {
        messages.push({
          role: msg.role,
          content: msg.role === 'assistant' ? msg.code || msg.content : msg.content
        })
      }
    }
    
    let userContent = prompt
    if (currentCode) {
      userContent = `Current code:\n\n${currentCode}\n\nRequest: ${prompt}`
    }
    messages.push({ role: 'user', content: userContent })

    // Call Claude Sonnet 4.5
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 8192,
        system: systemPrompt,
        messages: messages
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Anthropic API error:', error)
      return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
    }

    const data = await response.json()
    const fullResponse = data.content[0]?.text || ''
    
    let message = ''
    let code = ''
    let suggestions: string[] = []

    const suggestionsMatch = fullResponse.match(/---SUGGESTIONS---\s*([\s\S]*?)(?:---CODE---|---PAGES---|$)/)
    if (suggestionsMatch) {
      suggestions = suggestionsMatch[1].trim().split('|').map((s: string) => s.trim()).filter(Boolean)
    }

    const messageMatch = fullResponse.match(/---MESSAGE---\s*([\s\S]*?)\s*(?:---SUGGESTIONS---|---CODE---)/)
    const codeMatch = fullResponse.match(/---CODE---\s*([\s\S]*)/)
    
    if (messageMatch && codeMatch) {
      message = messageMatch[1].trim()
      code = codeMatch[1].trim()
    } else {
      code = fullResponse
      message = 'Component generated ✓'
    }

    const markdownMatch = code.match(/```(?:jsx?|tsx?|javascript|typescript)?\n?([\s\S]*?)```/)
    if (markdownMatch) {
      code = markdownMatch[1].trim()
    }

    code = cleanGeneratedCode(code)

    return NextResponse.json({ code, message, suggestions })

  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json({ error: 'Failed to generate' }, { status: 500 })
  }
}
