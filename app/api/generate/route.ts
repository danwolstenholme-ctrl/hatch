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

export async function POST(request: NextRequest) {
  const { prompt, history, currentCode } = await request.json()

  const systemPrompt = `You are a React component generator and modifier. You help users create and iterate on React components.

Rules:
- Use TypeScript
- Use Tailwind CSS for all styling
- Name the component "Component" (export default function Component)
- No imports needed - React hooks (useState, useEffect, etc.) are available globally as standalone functions, not as React.useState
- Output ONLY the raw code - no markdown, no backticks, no language tags, no explanations
- Make it visually polished and production-ready
- Use modern, clean design patterns

When modifying existing code, maintain the overall structure and only change what the user requests.`

  // Build messages array from history
  const messages: Message[] = []
  
  if (history && history.length > 0) {
    for (const msg of history) {
      messages.push({
        role: msg.role,
        content: msg.role === 'assistant' ? msg.code || msg.content : msg.content
      })
    }
  }
  
  // Add current request
  let userContent = prompt
  if (currentCode) {
    userContent = `Here is the current code:\n\n${currentCode}\n\nUser request: ${prompt}`
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