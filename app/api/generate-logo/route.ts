import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prompt, style } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 })
    }

    // Craft optimized logo prompt
    const logoPrompt = `Create a professional logo design for: ${prompt}

Style: ${style || 'modern, minimal'}

Requirements:
- Simple, clean icon or symbol
- Works at small sizes (favicon) and large sizes
- Single focal point
- Professional and memorable
- Suitable for a website/app
- No text in the logo, just the icon/symbol
- Flat design with subtle gradients allowed
- Centered composition on a transparent or solid background`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: logoPrompt,
    })

    // Extract image from response
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return NextResponse.json({
            success: true,
            image: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
          })
        }
      }
    }

    return NextResponse.json({ error: 'No image generated' }, { status: 500 })

  } catch (error) {
    console.error('Logo generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate logo' },
      { status: 500 }
    )
  }
}
