import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

const geminiApiKey = process.env.GEMINI_API_KEY
const genai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null

export async function POST(req: NextRequest) {
  try {
    if (!genai) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
    }

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

    const response = await genai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    })

    const text = response.text || ''

    return NextResponse.json({ note: text })
  } catch (error) {
    console.error('Witness error:', error)
    return NextResponse.json({ error: 'Failed to witness' }, { status: 500 })
  }
}
