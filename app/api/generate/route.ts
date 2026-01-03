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
  // Multiple-sections info is currently unused, but keep the heuristic available via isComplex.
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

// Detect simple edits that can be handled surgically (find/replace style)
// Returns the edit details if it's a simple edit, null otherwise
// NOTE: Be VERY conservative - only match explicit find/replace patterns
function detectSimpleEdit(prompt: string, currentCode: string): { 
  isSimple: boolean; 
  editType?: 'text' | 'color' | 'style' | 'attribute';
  findPattern?: string;
  description?: string;
} | null {
  if (!currentCode || currentCode.length < 50) return null;
  
  // Only trigger on VERY explicit patterns - be conservative
  const textChangePatterns = [
    /^change\s+["'](.+?)["']\s+to\s+["'](.+?)["']$/i,  // "change 'X' to 'Y'" - requires quotes
    /^replace\s+["'](.+?)["']\s+with\s+["'](.+?)["']$/i,  // "replace 'X' with 'Y'" - requires quotes
  ];
  
  // Check for explicit text changes only (must have quotes)
  for (const pattern of textChangePatterns) {
    if (pattern.test(prompt)) {
      return { isSimple: true, editType: 'text', description: prompt };
    }
  }
  
  return null;
}

// Surgical edit prompt - asks AI to return only find/replace pairs
const surgicalEditPrompt = `You are a precise code editor. The user wants to make a small change to their React component.

TASK: Return ONLY the specific find/replace operations needed. Do NOT rewrite the entire component.

FORMAT your response EXACTLY like this:
---FIND---
[exact text to find in the code]
---REPLACE---
[exact text to replace it with]
---END---

You can include multiple find/replace blocks if needed.

RULES:
1. Find strings must EXACTLY match text in the current code (including quotes, spaces)
2. Only change what's necessary - preserve everything else
3. For text changes, include the surrounding JSX (e.g., the full string with quotes)
4. If you can't find an exact match, explain why in a ---MESSAGE--- block

Example - changing "Welcome" to "Hello":
---FIND---
>Welcome to Our Site</
---REPLACE---
>Hello to Our Site</
---END---

Example - changing button text:
---FIND---
>Get Started</button>
---REPLACE---
>Start Now</button>
---END---
`;

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
  // Self-closing tags are allowed; no special handling needed.
  
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

## WHEN MODIFYING EXISTING CODE

**CRITICAL: PRESERVE everything unless asked to remove it.**
- "Add a header" = Keep existing content, ADD header above it
- "Change the button" = Change ONLY the button, keep everything else
- Include ALL existing code in your response

## MULTI-PAGE (only when user says "create a new page")

---MESSAGE---
[description]
---SUGGESTIONS---
[suggestions]
---PAGES---
[{"action": "create", "name": "Contact", "path": "/contact", "code": "function Component() {...}"}]

## KEEP IT SIMPLE

- Max 300 lines
- Use map() for repeated items
- If complex, build core structure first
- Working code beats ambitious broken code
- NEVER use inline SVG data URLs like bg-[url('data:image/svg+xml,...')] — they cause parse errors`

export async function POST(request: NextRequest) {
  
  try {
    // Authenticate user
    
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    

    // Check rate limit
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Maximum 20 requests per minute.' },
        { status: 429 }
      )
    }
    

    // Check if user is paid (has active account subscription)
    let isPaid = false
    try {
      const client = await clerkClient()
      const user = await client.users.getUser(userId)
      // Check account subscription (new tier system: pro/agency)
      const accountSub = user.publicMetadata?.accountSubscription as { status?: string; tier?: string } | undefined
      isPaid = accountSub?.status === 'active'
      
    } catch (clerkError) {
      console.error('Clerk lookup failed:', clerkError)
      // Continue as free user if lookup fails
    }

    // Check daily generation limit for free users (DB-backed for reliability)
    const genCheck = await checkAndIncrementGeneration(userId, isPaid)
    if (!genCheck.allowed) {
      return NextResponse.json(
        { error: 'Daily generation limit reached. Upgrade to continue building.', remaining: 0 },
        { status: 429 }
      )
    }
    

    let body
    try {
      body = await request.json()
      
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { prompt, history, currentCode, currentPage, allPages, assets, skipComplexityWarning, brand } = body
    

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

  // Check for simple edits that can be handled surgically
  const simpleEdit = detectSimpleEdit(prompt, currentCode)
  if (simpleEdit?.isSimple && currentCode) {
    
    
    try {
      const surgicalResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY || ''}`
        },
        body: JSON.stringify({
          model: 'gpt-5.1-codex-max',  // The God Model
          max_tokens: 2000,
          messages: [
            { role: 'system', content: surgicalEditPrompt },
            {
              role: 'user',
              content: `CURRENT CODE:\n\`\`\`jsx\n${currentCode}\n\`\`\`\n\nEDIT REQUEST: ${prompt}`
            }
          ]
        })
      })

      const surgicalData = await surgicalResponse.json()
      
      if (surgicalData.choices && surgicalData.choices[0]?.message?.content) {
        const surgicalText = surgicalData.choices[0].message.content
        
        // Parse find/replace blocks
        const findReplacePattern = /---FIND---\s*([\s\S]*?)\s*---REPLACE---\s*([\s\S]*?)\s*---END---/g
        let modifiedCode = currentCode
        let replacementCount = 0
        let match
        
        while ((match = findReplacePattern.exec(surgicalText)) !== null) {
          const findStr = match[1].trim()
          const replaceStr = match[2].trim()
          
          if (modifiedCode.includes(findStr)) {
            modifiedCode = modifiedCode.replace(findStr, replaceStr)
            replacementCount++
            console.log(`Surgical edit: replaced "${findStr.slice(0, 50)}..." with "${replaceStr.slice(0, 50)}..."`)
          }
        }
        
        // If we made at least one replacement, return the modified code
        if (replacementCount > 0) {
          console.log(`Surgical edit successful: ${replacementCount} replacement(s)`)
          return NextResponse.json({
            code: modifiedCode,
            message: `Updated! Made ${replacementCount} change${replacementCount > 1 ? 's' : ''} ✓`,
            suggestions: ['Make another text change', 'Update colors', 'Add a new section'],
            surgicalEdit: true
          })
        }
        
        // Check if there's a message explaining why it couldn't find the text
        const messageMatch = surgicalText.match(/---MESSAGE---\s*([\s\S]*?)(?:---|$)/)
        if (messageMatch) {
          
        }
      }
      
      // If surgical edit didn't work, fall through to full generation
      
    } catch (surgicalError) {
      console.error('Surgical edit error, falling back:', surgicalError)
      // Fall through to normal generation
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

  
  try {
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY || ''}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',  // The God Model
        max_tokens: 4096,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ]
      })
    })

    const data = await response.json()
    
    // Log response for debugging
    
    
    // Handle OpenAI API errors
    if (!response.ok || data.error) {
      console.error('OpenAI API error:', data.error || response.statusText)
      const errorMessage = data.error?.message || data.error || 'AI service error'
      return NextResponse.json({ 
        error: `Generation failed: ${errorMessage}` 
      }, { status: response.status || 500 })
    }
    
    // Check if response was truncated due to token limit
    if (data.choices && data.choices[0]?.finish_reason === 'length') {
      console.error('Response truncated due to max_tokens')
      return NextResponse.json({ 
        error: 'Response was too long. Please try a simpler prompt or break your request into smaller parts.',
        truncated: true 
      }, { status: 400 })
    }
    
    if (data.choices && data.choices[0]?.message?.content) {
      const fullResponse = data.choices[0].message.content
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
              
              
              // Try to complete this specific page's code
              const fixResponse = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-api-key': process.env.ANTHROPIC_API_KEY || '',
                  'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                  model: 'claude-sonnet-4-20250514',  // Sonnet for builds
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
        
        
        // Auto-complete the truncated code
        const completionResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY || '',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',  // Sonnet for builds
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
            
            return NextResponse.json({ 
              code: completedCode, 
              message: message || 'Component generated ✓',
              suggestions
            })
          }
          
          // If completion still has issues, try a full regeneration with strict limits
          
          const regenResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': process.env.ANTHROPIC_API_KEY || '',
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-20250514',  // Sonnet for builds
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
            model: 'claude-sonnet-4-20250514',  // Sonnet for builds
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

    // If we got here, no valid content was returned
    console.error('No content in response. Full response:', JSON.stringify(data).slice(0, 500))
    return NextResponse.json({ error: 'No response from AI. Please try again.' }, { status: 500 })
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
