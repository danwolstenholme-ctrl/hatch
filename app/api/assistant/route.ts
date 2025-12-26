import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { message, currentCode } = await request.json()

    const systemPrompt = `You are a friendly assistant for HatchIt, an AI website builder.

Your job is to:
- Explain what's been built in simple terms
- Answer questions about the generated code
- Suggest improvements or next features to add
- Help non-technical users understand their site

Current generated code:
\`\`\`
${currentCode || 'No code generated yet'}
\`\`\`

Keep responses brief (2-4 sentences). Be encouraging and helpful. If they ask you to build or change something, tell them to switch to Build mode.`

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20250514',
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }]
    })

    const textContent = response.content.find(block => block.type === 'text')
    const assistantMessage = textContent ? textContent.text : 'Sorry, I couldn\'t process that.'

    return NextResponse.json({ message: assistantMessage })
  } catch (error) {
    console.error('Assistant error:', error)
    return NextResponse.json({ error: 'Assistant failed' }, { status: 500 })
  }
}
