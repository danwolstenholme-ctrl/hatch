import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'

// Vercel Pro: extend timeout to 60s for Opus 4.5
export const maxDuration = 60

interface Message {
  role: 'user' | 'assistant'
  content: string
}

// Server-side rate limiting (userId -> timestamps)
// Note: In serverless, this resets per cold start which is acceptable for rate limiting
const rateLimits = new Map<string, number[]>()
const RATE_LIMIT_PER_MINUTE = 20
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const MAX_RATE_LIMIT_ENTRIES = 10000 // Prevent unbounded growth

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  
  // Cleanup old entries periodically to prevent memory leak
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

// Server-side daily generation tracking
// Note: In serverless, this resets per cold start - actual limits enforced via DB in production
const dailyGenerations = new Map<string, { count: number; date: string }>()
const FREE_DAILY_LIMIT = 10
const MAX_DAILY_GEN_ENTRIES = 10000 // Prevent unbounded growth

function checkAndRecordGeneration(userId: string, isPaid: boolean): { allowed: boolean; remaining: number } {
  if (isPaid) {
    return { allowed: true, remaining: -1 } // Unlimited for paid users
  }
  
  const today = new Date().toISOString().split('T')[0]
  
  // Cleanup old entries periodically
  if (dailyGenerations.size > MAX_DAILY_GEN_ENTRIES) {
    for (const [key, gen] of dailyGenerations.entries()) {
      if (gen.date !== today) {
        dailyGenerations.delete(key)
      }
    }
  }
  
  const userGen = dailyGenerations.get(userId) || { count: 0, date: today }
  
  // Reset if new day
  if (userGen.date !== today) {
    userGen.count = 0
    userGen.date = today
  }
  
  if (userGen.count >= FREE_DAILY_LIMIT) {
    return { allowed: false, remaining: 0 }
  }
  
  userGen.count++
  dailyGenerations.set(userId, userGen)
  return { allowed: true, remaining: FREE_DAILY_LIMIT - userGen.count }
}

// Prompt complexity analysis - returns warning if prompt is too complex
function analyzePromptComplexity(prompt: string): { isComplex: boolean; warning?: string; suggestions?: string[] } {
  const wordCount = prompt.split(/\s+/).length
  const sentenceCount = prompt.split(/[.!?]+/).filter(s => s.trim()).length
  
  // Count distinct feature requests
  const featureIndicators = [
    /hero\s*(section)?/i,
    /feature[s]?\s*(section|grid)?/i,
    /pricing\s*(section|page|table)?/i,
    /contact\s*(form|section|page)?/i,
    /nav(igation)?|header/i,
    /footer/i,
    /testimonial[s]?/i,
    /about\s*(us|section)?/i,
    /team\s*(section)?/i,
    /blog|article/i,
    /gallery/i,
    /faq/i,
    /cta|call.to.action/i,
    /sign\s*up|login|auth/i,
    /dashboard/i,
    /sidebar/i,
    /modal|popup/i,
    /animation[s]?/i,
    /carousel|slider/i,
    /accordion/i,
    /tabs/i,
    /stats|statistics/i,
    /timeline/i
  ]
  
  const featureCount = featureIndicators.filter(regex => regex.test(prompt)).length
  
  // Check for complexity indicators
  const isLongPrompt = wordCount > 80
  const hasManyFeatures = featureCount >= 4
  const hasManyRequirements = sentenceCount >= 5
  
  // Detect specific complexity patterns
  const hasDetailedStyling = /theme|color[s]?|palette|accent|pastel|gradient|aesthetic/i.test(prompt)
  const hasMultipleSections = featureCount >= 3
  const hasSpecificContent = /\b(SPF|euro|€|\$|price|option[s]?|value[s]?|tier[s]?)\b/i.test(prompt)
  
  const complexityScore = (
    (isLongPrompt ? 2 : 0) +
    (hasManyFeatures ? 2 : 0) +
    (hasManyRequirements ? 1 : 0) +
    (hasDetailedStyling ? 1 : 0) +
    (hasSpecificContent ? 1 : 0)
  )
  
  if (complexityScore >= 4 || (wordCount > 100 && featureCount >= 3)) {
    const suggestions = [
      'Start with just the hero section and navigation',
      'Add one section at a time (e.g., "Add a features section")',
      'Specify styling details after the basic structure is working'
    ]
    
    return {
      isComplex: true,
      warning: `This is a detailed request with ${featureCount} distinct sections. For best results, complex sites should be built iteratively.`,
      suggestions
    }
  }
  
  return { isComplex: false }
}

// Simple syntax check
function checkSyntax(code: string): { valid: boolean; error?: string } {
  try {
    const cleanedCode = code
      .replace(/export\s+default\s+/g, '')
      .replace(/export\s+/g, '');
    new Function(cleanedCode);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: (e as Error).message };
  }
}

// Detect JSX truncation (unclosed tags, brackets, etc)
function detectJSXTruncation(code: string): { truncated: boolean; reason?: string } {
  // Check for balanced braces
  let braceCount = 0;
  let parenCount = 0;
  let bracketCount = 0;
  
  for (const char of code) {
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
    if (char === '(') parenCount++;
    if (char === ')') parenCount--;
    if (char === '[') bracketCount++;
    if (char === ']') bracketCount--;
  }
  
  if (braceCount > 2) {
    return { truncated: true, reason: `${braceCount} unclosed braces` };
  }
  if (parenCount > 2) {
    return { truncated: true, reason: `${parenCount} unclosed parentheses` };
  }
  if (bracketCount > 2) {
    return { truncated: true, reason: `${bracketCount} unclosed brackets` };
  }
  
  // Check for balanced JSX tags (more sophisticated check)
  const jsxOpenTags = code.match(/<([A-Z][a-zA-Z0-9]*|[a-z]+(?:-[a-z]+)*)\b[^>]*(?<!\/)>/g) || [];
  const jsxCloseTags = code.match(/<\/([A-Z][a-zA-Z0-9]*|[a-z]+(?:-[a-z]+)*)>/g) || [];
  const selfClosingTags = code.match(/<[A-Za-z][^>]*\/>/g) || [];
  
  // Count actual open tags (non-self-closing)
  const openCount = jsxOpenTags.length;
  const closeCount = jsxCloseTags.length;
  
  // Allow a small tolerance but flag major imbalances
  if (openCount - closeCount > 5) {
    return { truncated: true, reason: `${openCount - closeCount} unclosed JSX tags` };
  }
  
  // Check if code ends abruptly (common truncation patterns)
  const trimmedCode = code.trim();
  const badEndings = [
    /\(\s*$/, // ends with open paren
    /{\s*$/, // ends with open brace
    /<[A-Za-z][^>]*$/, // ends mid-tag
    /className=["'][^"']*$/, // ends mid-attribute
    /style={{[^}]*$/, // ends mid-style
  ];
  
  for (const pattern of badEndings) {
    if (pattern.test(trimmedCode)) {
      return { truncated: true, reason: 'Code ends abruptly' };
    }
  }
  
  // Check for common incomplete patterns
  if (trimmedCode.includes('...') && trimmedCode.match(/\.\.\./g)!.length > 3) {
    return { truncated: true, reason: 'Contains placeholder ellipsis patterns' };
  }
  
  return { truncated: false };
}

// Aggressive code cleanup - remove all problematic patterns
function cleanGeneratedCode(code: string): string {
  return code
    // Remove 'use client' directive
    .replace(/['"]use client['"]\s*;?\n?/g, '')
    // Remove all import statements
    .replace(/^import\s+.*?;?\s*$/gm, '')
    // Remove export default function ComponentName() - replace with plain function
    .replace(/export\s+default\s+function\s+\w+\s*\(\s*\)\s*\{/, 'function Component() {')
    // Remove standalone export default
    .replace(/export\s+default\s+/g, '')
    // Remove any remaining export statements
    .replace(/^export\s+/gm, '')
    // Remove type annotations and interfaces
    .replace(/interface\s+\w+\s*\{[\s\S]*?\}/g, '')
    .replace(/type\s+\w+\s*=[^;]+;/g, '')
    // Clean up multiple blank lines
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

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

Example:
---MESSAGE---
Built a dark SaaS landing with animated hero, feature cards, and pricing toggle. The gradient CTA pops. 🔥
---SUGGESTIONS---
Add testimonials section|Create contact page|Add FAQ accordion
---CODE---
function Component() { ... }

## MULTI-PAGE OPERATIONS

When user asks to CREATE A NEW PAGE, use this format:

---MESSAGE---
[What you created]
---SUGGESTIONS---
[3 suggestions]
---PAGES---
[JSON array of operations]

Example for "create a contact page":
---PAGES---
[
  {"action": "create", "name": "Contact", "path": "/contact", "code": "function Component() {...}"},
  {"action": "update", "id": "CURRENT_PAGE_ID", "code": "function Component() {...with nav link to contact...}"}
]

Rules:
- "action": "create" = new page (needs name, path, code)
- "action": "update" = modify existing (needs id, code) — use "CURRENT_PAGE_ID" for current page
- Paths: lowercase with hyphens (/about-us, /contact)
- Internal links: use href="#/contact" (hash routing)

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
- async/await in simple handlers
- 'use client' directive
- import statements

## STYLING

### Theme Selection
- Default to dark theme unless user specifies light
- Be consistent within a component

### Dark Theme Palette
Background: bg-zinc-950, bg-zinc-900, bg-zinc-800
Text: text-white, text-zinc-300, text-zinc-400, text-zinc-500
Borders: border-zinc-800, border-zinc-700
Accents: blue-500, purple-500, emerald-500, amber-500

### Light Theme Palette
Background: bg-white, bg-gray-50, bg-gray-100
Text: text-gray-900, text-gray-600, text-gray-500
Borders: border-gray-200, border-gray-300

### Design Excellence

Buttons — always with hover and tap:
<motion.button 
  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
  whileHover={{ y: -2 }}
  whileTap={{ scale: 0.98 }}
>

Cards — with subtle lift:
<motion.div 
  className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl"
  whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
>

Gradients for CTAs:
<span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">

Glass effect:
<div className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl">

### Responsive Design
Always mobile-first with breakpoints:
- Container: max-w-6xl mx-auto px-4 md:px-8
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Typography: text-3xl md:text-4xl lg:text-5xl

## ANIMATIONS (Framer Motion)

Entrance animations:
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>

Staggered children:
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: index * 0.1 }}
  viewport={{ once: true }}
>

Exit animations:
<AnimatePresence>
  {isOpen && <motion.div exit={{ opacity: 0 }}>...</motion.div>}
</AnimatePresence>

## ICONS (Lucide React)

Use directly by name:
<ArrowRight size={20} />
<Menu className="w-6 h-6" />

Common icons: ArrowRight, ArrowLeft, Menu, X, Check, CheckCircle, Star, Heart, Mail, Phone, MapPin, Calendar, Clock, User, Settings, Search, Plus, Minus, ChevronDown, ChevronUp, ExternalLink, Download, Zap, Shield, Target, Award, TrendingUp, Sparkles, Globe, Play

## FORMS — MUST WORK

Forms need proper state management:

function Component() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // idle, sending, sent, error

  const handleSubmit = (e) => {
    e.preventDefault()
    setStatus('sending')
    setTimeout(() => {
      setStatus('sent')
      setFormData({ name: '', email: '', message: '' })
    }, 1500)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      <button type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending...' : 'Send'}
      </button>
      {status === 'sent' && <p>Thanks! We'll be in touch.</p>}
    </form>
  )
}

CRITICAL: Use e.preventDefault(), useState for form data, show loading and success states.

## LANDING PAGE STRUCTURE

A solid landing page includes:
1. Nav — sticky, with mobile menu
2. Hero — bold headline, subhead, CTA
3. Features — 3-6 cards with icons
4. Social proof — logos, testimonials, or stats
5. CTA section — final conversion push
6. Footer — links, copyright

Use smooth scroll anchors: href="#features" with id="features"

## CODE EFFICIENCY

### MAX 300 LINES
If the page would exceed this, simplify. A working simple page beats a broken complex one.

### Use map() for repetition
const features = [
  { icon: <Zap />, title: "Fast", desc: "Lightning quick" },
  { icon: <Shield />, title: "Secure", desc: "Enterprise grade" },
]
{features.map((f, i) => <Card key={i} {...f} />)}

### Keep content concise
- 3-5 items for lists
- Short placeholder text
- Combine similar sections

## MODIFICATION RULES

When user says "update", "change", "fix", "add to", "make it":
- MODIFY the existing code, don't rebuild from scratch
- Keep the structure, theme, and functionality
- Only change what's requested

Only use ---PAGES--- format with "create" when user explicitly says:
- "create a new page"
- "add a page for..."
- "I need a [X] page"

## IMAGES AND LOGOS

You create CODE, not images. For logos:
- Create text-based logos with styling
- Suggest they upload via Assets if they need a graphic

Text logo example:
<div className="flex items-center gap-2">
  <Zap className="w-8 h-8 text-blue-500" />
  <span className="text-2xl font-bold">BrandName</span>
</div>

For images, use Unsplash:
<img src="https://images.unsplash.com/photo-[ID]?w=800" alt="description" className="rounded-xl" />

## HANDLING COMPLEXITY

If request has 5+ distinct sections:
1. Build the core structure first (nav, hero, 2-3 sections)
2. Make it WORK rather than cramming everything
3. In your message, say: "Built the foundation. Ask me to add more sections one at a time."

A working page > a broken ambitious one. Always.

## QUALITY CHECKLIST
✓ No imports
✓ Responsive on all screens  
✓ Hover/tap animations on interactive elements
✓ Consistent spacing (4, 6, 8, 12, 16, 24)
✓ Clear typography hierarchy
✓ Accessible contrast`

export async function POST(request: NextRequest) {
  console.log('=== GENERATE API START ===')
  try {
    // Authenticate user
    console.log('Step 1: Auth')
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('Step 2: Auth passed, userId:', userId)

    // Check rate limit
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Maximum 20 requests per minute.' },
        { status: 429 }
      )
    }
    console.log('Step 3: Rate limit passed')

    // Check if user is paid
    let isPaid = false
    try {
      const client = await clerkClient()
      const user = await client.users.getUser(userId)
      isPaid = user.publicMetadata?.paid === true
      console.log('Step 4: Clerk lookup done, isPaid:', isPaid)
    } catch (clerkError) {
      console.error('Clerk lookup failed:', clerkError)
      // Continue as free user if lookup fails
    }

    // Check daily generation limit for free users
    const genCheck = checkAndRecordGeneration(userId, isPaid)
    if (!genCheck.allowed) {
      return NextResponse.json(
        { error: 'Daily generation limit reached. Upgrade to continue building.' },
        { status: 429 }
      )
    }
    console.log('Step 5: Daily limit passed')

    let body
    try {
      body = await request.json()
      console.log('Step 6: Body parsed, prompt length:', body?.prompt?.length || 0)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { prompt, history, currentCode, currentPage, allPages, assets, skipComplexityWarning, brand } = body
    console.log('Step 7: Destructured body')

    // Input validation
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 })
    }

    if (prompt.length > 10000) {
      return NextResponse.json({ error: 'Prompt too long (max 10,000 characters)' }, { status: 400 })
    }

  // Check prompt complexity and warn user (unless they've acknowledged)
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

  const messages: Message[] = []
  
  // Add context about the current page for multi-page projects
  if (currentPage && allPages && allPages.length > 1) {
    messages.push({
      role: 'user',
      content: `CONTEXT: This is a multi-page website. You are currently editing the "${currentPage.name}" page (route: ${currentPage.path}). Other pages in this site: ${allPages.filter((p: { id: string }) => p.id !== currentPage.id).map((p: { name: string; path: string }) => `${p.name} (${p.path})`).join(', ')}. Focus your changes on the ${currentPage.name} page unless the user specifically asks to modify multiple pages.`
    })
  }
  
  // Add context about uploaded assets
  if (assets && assets.length > 0) {
    const assetList = assets.map((a: { name: string; dataUrl: string; type: string }) => 
      `- ${a.name} (${a.type}): Use this as an <img src="${a.dataUrl}" /> or as a background-image style`
    ).join('\n')
    messages.push({
      role: 'user',
      content: `AVAILABLE ASSETS: The user has uploaded the following assets that you can use in the code. Each asset is a base64 data URL that can be used directly in img src or CSS:\n${assetList}\n\nWhen the user asks to use an image/logo/asset, prefer using these uploaded assets over placeholder URLs.`
    })
  }
  
  // Add brand context if user has set brand colors/font
  if (brand && (brand.colors?.length > 0 || brand.font)) {
    const brandContext = []
    if (brand.colors?.length > 0) {
      brandContext.push(`Brand colors: ${brand.colors.join(', ')} - use these colors for primary elements, buttons, gradients, and accents`)
    }
    if (brand.font && brand.font !== 'System Default') {
      brandContext.push(`Brand font: ${brand.font} - use font-['${brand.font}'] for headings and important text`)
    }
    messages.push({
      role: 'user',
      content: `BRAND GUIDELINES: ${brandContext.join('. ')}. Maintain consistency with these brand colors and font throughout the design.`
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

  console.log('Step 8: About to call Anthropic, messages count:', messages.length)
  try {
    console.log('Step 9: Calling Anthropic API...')
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 32000,
        system: systemPrompt,
        messages
      })
    })

    const data = await response.json()
    
    // Check if response was truncated due to token limit
    if (data.stop_reason === 'max_tokens') {
      console.error('Response truncated due to max_tokens')
      return NextResponse.json({ 
        error: 'Response was too long. Please try a simpler prompt or break your request into smaller parts.',
        truncated: true 
      }, { status: 400 })
    }
    
    if (data.content && data.content[0]) {
      let fullResponse = data.content[0].text
      let message = ''
      let code = ''
      let suggestions: string[] = []
      let pageOperations: Array<{action: string; id?: string; name?: string; path?: string; code: string}> | null = null
      
      // Extract suggestions from response (works for both single and multi-page)
      const suggestionsMatch = fullResponse.match(/---SUGGESTIONS---\s*([\s\S]*?)(?:---CODE---|---PAGES---|$)/)
      if (suggestionsMatch) {
        const suggestionsText = suggestionsMatch[1].trim()
        suggestions = suggestionsText.split('|').map((s: string) => s.trim()).filter((s: string) => s.length > 0 && s.length < 50)
      }
      
      // Check for multi-page format first
      const pagesMatch = fullResponse.match(/---PAGES---\s*([\s\S]*)/)
      const hasPages = pagesMatch !== null
      
      if (hasPages) {
        // Multi-page operation - extract message
        const msgMatch = fullResponse.match(/---MESSAGE---\s*([\s\S]*?)\s*(?:---SUGGESTIONS---|---PAGES---)/)
        message = msgMatch ? msgMatch[1].trim() : ''
        const pagesJson = pagesMatch[1].trim()
        
        try {
          // Parse the JSON array of page operations
          pageOperations = JSON.parse(pagesJson)
          
          // Clean and validate each operation
          if (Array.isArray(pageOperations)) {
            pageOperations = pageOperations.map(op => {
              let opCode = op.code || ''
              
              // Clean markdown if present
              const markdownMatch = opCode.match(/```(?:jsx?|tsx?|javascript|typescript)?\n?([\s\S]*?)```/)
              if (markdownMatch) {
                opCode = markdownMatch[1].trim()
              }
              
              // Apply cleanup
              opCode = cleanGeneratedCode(opCode)
              
              return {
                ...op,
                code: opCode
              }
            })
          }
        } catch (parseError) {
          console.error('Failed to parse multi-page response:', parseError)
          // Fall back to treating as single page
          pageOperations = null
        }
      }
      
      if (!pageOperations) {
        // Parse the single-page structured response format
        const messageMatch = fullResponse.match(/---MESSAGE---\s*([\s\S]*?)\s*(?:---SUGGESTIONS---|---CODE---)/)
        const codeMatch = fullResponse.match(/---CODE---\s*([\s\S]*)/)
        
        if (messageMatch && codeMatch) {
          message = messageMatch[1].trim()
          code = codeMatch[1].trim()
        } else {
          // Fallback: treat entire response as code (backwards compatibility)
          code = fullResponse
          message = 'Component generated ✓'
        }
        
        // Clean markdown if present in code
        const markdownMatch = code.match(/```(?:jsx?|tsx?|javascript|typescript)?\n?([\s\S]*?)```/)
        if (markdownMatch) {
          code = markdownMatch[1].trim()
        }

        // Apply aggressive cleanup
        code = cleanGeneratedCode(code)
      }

      // If multi-page operations, return them
      if (pageOperations && pageOperations.length > 0) {
        // Check each page operation for truncation and auto-fix if needed
        let hasFixedOperations = false
        for (const op of pageOperations) {
          if (op.code) {
            const truncationCheck = detectJSXTruncation(op.code);
            if (truncationCheck.truncated) {
              console.log('Multi-page truncation detected, attempting auto-fix')
              
              // Try to complete this specific page's code
              const fixResponse = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-api-key': process.env.ANTHROPIC_API_KEY || '',
                  'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                  model: 'claude-sonnet-4-20250514',
                  max_tokens: 8000,
                  messages: [{
                    role: 'user',
                    content: `Complete this truncated React component. Return ONLY the fixed code, no markdown:\n\n${op.code}`
                  }]
                })
              })

              const fixData = await fixResponse.json()
              if (fixData.content && fixData.content[0]) {
                let fixedCode = fixData.content[0].text
                const fixMatch = fixedCode.match(/```(?:jsx?|tsx?|javascript|typescript)?\n?([\s\S]*?)```/)
                if (fixMatch) fixedCode = fixMatch[1].trim()
                fixedCode = cleanGeneratedCode(fixedCode)
                
                if (!detectJSXTruncation(fixedCode).truncated) {
                  op.code = fixedCode
                  hasFixedOperations = true
                }
              }
            }
          }
        }
        
        return NextResponse.json({ 
          message: hasFixedOperations ? message + ' (auto-completed)' : message, 
          pageOperations,
          suggestions,
          // Also include first update operation as 'code' for backwards compatibility
          code: pageOperations.find(op => op.action === 'update')?.code || pageOperations[0].code
        })
      }

      // Check for JSX truncation BEFORE syntax check
      const truncationCheck = detectJSXTruncation(code);
      if (truncationCheck.truncated) {
        console.log('Truncation detected:', truncationCheck.reason, '- attempting auto-completion')
        
        // Auto-complete the truncated code
        const completionResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY || '',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 16000,
            messages: [{
              role: 'user',
              content: `This React component was cut off and is incomplete. Complete it properly.

INCOMPLETE CODE:
${code}

RULES:
1. Return ONLY the complete, working component - no explanations
2. Keep the same design and functionality
3. Make sure all JSX tags are properly closed
4. Make sure all braces, parentheses, and brackets are balanced
5. Keep it COMPACT - under 200 lines total
6. Use map() for repetitive elements, max 3-4 items
7. No markdown code blocks, just the raw code

Return the COMPLETE fixed component:`
            }]
          })
        })

        const completionData = await completionResponse.json()
        if (completionData.content && completionData.content[0]) {
          let completedCode = completionData.content[0].text
          
          // Clean markdown if present
          const completionMatch = completedCode.match(/```(?:jsx?|tsx?|javascript|typescript)?\n?([\s\S]*?)```/)
          if (completionMatch) {
            completedCode = completionMatch[1].trim()
          }
          
          completedCode = cleanGeneratedCode(completedCode)
          
          // Verify the completed code is valid
          const recheckTruncation = detectJSXTruncation(completedCode)
          const recheckSyntax = checkSyntax(completedCode)
          
          if (!recheckTruncation.truncated && recheckSyntax.valid) {
            console.log('Auto-completion successful')
            return NextResponse.json({ 
              code: completedCode, 
              message: message || 'Component generated ✓',
              suggestions
            })
          }
          
          // If completion still has issues, try a full regeneration with strict limits
          console.log('Auto-completion still had issues, trying compact regeneration')
          const regenResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': process.env.ANTHROPIC_API_KEY || '',
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-20250514',
              max_tokens: 8000,
              system: `You generate VERY COMPACT React components. Max 150 lines. Use map() for lists. 3 items max for any repeated content. Tailwind CSS only. No imports. Return ONLY code, no markdown.`,
              messages: messages
            })
          })

          const regenData = await regenResponse.json()
          if (regenData.content && regenData.content[0]) {
            let regenCode = regenData.content[0].text
            
            const regenMatch = regenCode.match(/```(?:jsx?|tsx?|javascript|typescript)?\n?([\s\S]*?)```/)
            if (regenMatch) {
              regenCode = regenMatch[1].trim()
            }
            
            regenCode = cleanGeneratedCode(regenCode)
            
            const finalCheck = detectJSXTruncation(regenCode)
            if (!finalCheck.truncated) {
              console.log('Compact regeneration successful')
              return NextResponse.json({ 
                code: regenCode, 
                message: message || 'Component generated ✓',
                suggestions
              })
            }
          }
        }
        
        // Only return error if all auto-recovery attempts fail
        return NextResponse.json({ 
          error: `Unable to generate complete code. Please try a simpler request.`
        }, { status: 400 })
      }

      // Check syntax and auto-fix if needed
      const syntaxCheck = checkSyntax(code)
      if (!syntaxCheck.valid && syntaxCheck.error) {
        // Syntax error detected, attempting auto-fix
        
        // Call Claude again to fix
        const fixResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY || '',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 32000,
            system: systemPrompt,
            messages: [{
              role: 'user',
              content: `This React component has a syntax error:\n\n${code}\n\nError: ${syntaxCheck.error}\n\nFix the syntax error and return ONLY the corrected component code. No explanations, no markdown.`
            }]
          })
        })

        const fixData = await fixResponse.json()
        if (fixData.content && fixData.content[0]) {
          let fixedCode = fixData.content[0].text
          
          const fixMatch = fixedCode.match(/```(?:jsx?|tsx?|javascript|typescript)?\n?([\s\S]*?)```/)
          if (fixMatch) {
            fixedCode = fixMatch[1].trim()
          }
          
          // Apply aggressive cleanup to fixed code too
          fixedCode = cleanGeneratedCode(fixedCode)
          
          const recheck = checkSyntax(fixedCode)
          if (recheck.valid) {
            return NextResponse.json({ code: fixedCode, message: message + ' (auto-fixed a small syntax issue)', suggestions })
          }
        }
      }

      return NextResponse.json({ code: cleanGeneratedCode(code), message, suggestions })
    }

    return NextResponse.json({ error: 'No response' }, { status: 500 })
  } catch (error) {
    console.error('Generation error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown')
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ 
      error: 'Failed to generate',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
  } catch (outerError) {
    console.error('Outer catch - unexpected error:', outerError)
    console.error('Stack:', outerError instanceof Error ? outerError.stack : 'No stack')
    return NextResponse.json({ 
      error: 'Unexpected server error',
      details: outerError instanceof Error ? outerError.message : 'Unknown error'
    }, { status: 500 })
  }
}