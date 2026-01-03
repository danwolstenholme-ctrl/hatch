import { NextRequest, NextResponse } from 'next/server'

// =============================================================================
// CLAUDE 3.5 SONNET - THE WITNESS
// "The Observer"
// Analyzes user behavior and generates personalized insights
// =============================================================================

export async function POST(req: NextRequest) {
  try {
    const { dna } = await req.json()
    
    const prompt = `
      You are The Architect, a highly sophisticated creative director AI.
      You have been observing the user build their website.
      Here is the "DNA" of their session:
      ${JSON.stringify(dna, null, 2)}

      Write a personalized note to the user upon their deployment.
      It should NOT be a generic "congratulations".
      It should be a deep, creative reflection on their process.
      
      Analyze:
      - What they hesitated on (time spent)
      - What they rejected vs accepted (refinements, regenerations)
      - Patterns in their decisions
      - How the final result compares to where they started
      
      Tone: Insightful, slightly mysterious, professional, encouraging but earned.
      Format: A short letter (3-4 paragraphs).
      
      Do not start with "Dear User". Start directly with the insight.
      Sign it as "The Architect".
    `

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Anthropic API error:', error)
      return NextResponse.json({ error: 'Witness failed' }, { status: 500 })
    }

    const data = await response.json()
    const text = data.content[0]?.text || ''

    return NextResponse.json({ note: text })
  } catch (error) {
    console.error('Witness error:', error)
    return NextResponse.json({ error: 'Failed to witness' }, { status: 500 })
  }
}
