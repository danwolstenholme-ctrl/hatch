import { NextRequest, NextResponse } from 'next/server'

interface Message {
  role: 'user' | 'assistant'
  content: string
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

const systemPrompt = `You are the HatchIt component generator. You create production-ready React components that render in a browser iframe using React 18 (UMD) and Tailwind CSS (CDN).

## CRITICAL RULES

### No Imports or 'use client'
NEVER use import statements or 'use client' directives. These hooks are available globally as standalone functions:
- useState, useEffect, useMemo, useCallback, useRef

WRONG: import { useState } from 'react'
WRONG: 'use client'
WRONG: React.useState()
CORRECT: const [count, setCount] = useState(0)

### Component Structure
Always use this exact format (NO 'use client' directive):

export default function Component() {
  // hooks at top
  const [state, setState] = useState(initialValue)
  
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* content */}
    </div>
  )
}

### Output Format
Return ONLY raw code. NEVER include:
- Markdown code fences (\`\`\`)
- Language tags
- Explanations before or after the code

## STYLING (Dark Theme)

### Colors
- Backgrounds: bg-zinc-950, bg-zinc-900, bg-zinc-800
- Text: text-white, text-zinc-400, text-zinc-500
- Borders: border-zinc-800, border-zinc-700
- Accents: blue-500, purple-500, green-500

### Common Patterns

Buttons:
<button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">

Cards:
<div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">

Inputs:
<input className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500" />

Gradients:
<span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">

### Responsive Design
Always mobile-first:
<div className="px-4 md:px-8 lg:px-16">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

## COMPONENT TYPES

### Landing Pages
Include: Nav (sticky), Hero, Features (grid), CTA, Footer
Use max-w-6xl mx-auto for content width
Add smooth scroll with id anchors: <a href="#features"> and <section id="features">

### Forms
Always include:
- Loading state (isSubmitting)
- Success state (submitted)
- Proper labels and placeholders

### Interactive Elements
- Always add hover states
- Use transition-colors or transition-all
- Include disabled states for buttons

## MISTAKES TO AVOID
1. Using import statements
2. Using React.useState instead of useState
3. Complex TypeScript generics (keep types simple)
4. Including markdown in output
5. Using light mode colors
6. Forgetting 'use client' directive
7. Not making components responsive

## MODIFICATIONS
When user asks to modify existing code:
- Only change what's requested
- Preserve overall structure
- Keep all existing functionality
- Maintain consistent styling`

export async function POST(request: NextRequest) {
  const { prompt, history, currentCode } = await request.json()

  const messages: Message[] = []
  
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
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 16384,
        system: systemPrompt,
        messages
      })
    })

    const data = await response.json()
    
    if (data.content && data.content[0]) {
      let code = data.content[0].text
      
      // Clean markdown if present
      const codeMatch = code.match(/```(?:jsx?|tsx?|javascript|typescript)?\n?([\s\S]*?)```/)
      if (codeMatch) {
        code = codeMatch[1].trim()
      }

      // Remove any 'use client' directives (not valid in iframe context)
      code = code.replace(/^['"]use client['"];\s*\n*/gm, '')
      
      // Remove any import statements (hooks are available globally)
      code = code.replace(/^import\s+.*from\s+['"].*['"];?\s*\n*/gm, '')

      // Check syntax and auto-fix if needed
      const syntaxCheck = checkSyntax(code)
      if (!syntaxCheck.valid && syntaxCheck.error) {
        console.log('Syntax error detected, attempting auto-fix...')
        console.log('Error:', syntaxCheck.error)
        
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
            max_tokens: 16384,
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
          
          // Remove any 'use client' directives and imports
          fixedCode = fixedCode.replace(/^['"]use client['"];\s*\n*/gm, '')
          fixedCode = fixedCode.replace(/^import\s+.*from\s+['"].*['"];?\s*\n*/gm, '')
          
          const recheck = checkSyntax(fixedCode)
          if (recheck.valid) {
            console.log('Auto-fix successful!')
            return NextResponse.json({ code: fixedCode })
          }
        }
      }

      return NextResponse.json({ code })
    }

    return NextResponse.json({ error: 'No response' }, { status: 500 })
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json({ error: 'Failed to generate' }, { status: 500 })
  }
}