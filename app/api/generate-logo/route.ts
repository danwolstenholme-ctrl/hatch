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

    // Craft optimized logo prompt for SVG generation
    const logoPrompt = `Create a professional SVG logo design for: ${prompt}

Style: ${style || 'modern, minimal'}

Requirements:
- Return ONLY the raw SVG code. No markdown, no explanations.
- The SVG should be square (viewBox="0 0 512 512" or similar).
- Use simple shapes and solid colors.
- Ensure it works well on dark and light backgrounds.
- Do not use external fonts or images. Convert text to paths if necessary or use standard fonts.
- The SVG code must be valid and complete.`

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: logoPrompt,
    })

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (text) {
      // Clean up the response to get just the SVG
      const svgMatch = text.match(/<svg[\s\S]*?<\/svg>/)
      const svgCode = svgMatch ? svgMatch[0] : text

      if (svgCode.includes('<svg')) {
        // Convert to base64 data URL
        const base64Svg = Buffer.from(svgCode).toString('base64')
        const dataUrl = `data:image/svg+xml;base64,${base64Svg}`
        
        return NextResponse.json({
          success: true,
          image: dataUrl
        })
      }
    }

    return NextResponse.json({ error: 'Failed to generate valid SVG' }, { status: 500 })

  } catch (error) {
    console.error('Logo generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate logo' },
      { status: 500 }
    )
  }
}
