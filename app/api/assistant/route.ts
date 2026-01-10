import { NextRequest, NextResponse } from 'next/server'

// =============================================================================
// AI ASSISTANT API - Help with design, debugging, and prompts
// Uses Claude Haiku 4.5 for fast, helpful responses
// =============================================================================

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'API not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { 
      message, 
      currentCode, 
      projectName, 
      sectionType,
      conversationHistory = []
    } = body

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    // Build context
    const context = []
    if (projectName) context.push(`Project: ${projectName}`)
    if (sectionType) context.push(`Current section: ${sectionType}`)
    if (currentCode) context.push(`Current code preview:\n\`\`\`tsx\n${currentCode.slice(0, 1500)}\n\`\`\``)

    const systemPrompt = `You are an AI assistant inside HatchIt, a website builder. You help users build websites using AI-generated React/Tailwind code.

IMPORTANT: You are embedded IN the HatchIt builder. Users are currently building a website. They don't need generic coding advice.

Your role:
1. Help write better prompts - "Try: 'Dark hero with gradient mesh, bold heading left, two CTAs'"
2. Suggest design tweaks - "Add more whitespace, try a different color accent"
3. Troubleshoot HatchIt-specific issues

COMMON ISSUES & QUICK FIXES:
- "Preview not showing" → Usually means section is still generating. Wait for the green checkmark, then it appears.
- "Black screen" → Try regenerating the section with a simpler prompt. Some complex prompts cause render errors.
- "Section looks wrong" → Use the Refine button below the prompt bar. Describe what to change.
- "Want to change text" → Click the Edit button (pencil icon) in the preview toolbar, then double-click any text.
- "How to deploy" → Click Ship button (top right) → Choose Deploy to HatchIt, Push to GitHub, or Download ZIP.

DON'T:
- Give generic React/Tailwind tutorials
- Suggest installing packages or editing config files
- Provide code the user needs to copy-paste manually
- Mention browser console, npm commands, or file editing

DO:
- Keep answers short (2-3 sentences max)
- Reference HatchIt UI elements by name (Ship button, Refine, Edit mode)
- Suggest specific prompt improvements
- Be encouraging and helpful

${context.length > 0 ? `\nContext:\n${context.join('\n')}` : ''}`

    // Build messages array for Claude
    const messages = [
      ...conversationHistory.map((msg: Message) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ]

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        messages
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Anthropic API error:', error)
      return NextResponse.json({ error: 'AI service error' }, { status: 500 })
    }

    const data = await response.json()
    const assistantResponse = data.content?.[0]?.text || 'Sorry, I could not generate a response.'

    return NextResponse.json({ response: assistantResponse })

  } catch (error) {
    console.error('Assistant API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
