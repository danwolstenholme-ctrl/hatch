import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { GoogleGenAI } from '@google/genai'
import { AccountSubscription } from '@/types/subscriptions'

// =============================================================================
// THE REPLICATOR
// Reverse-engineers a website from a URL into a Hatch prompt structure
// =============================================================================

const geminiApiKey = process.env.GEMINI_API_KEY
const genai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null

const REPLICATOR_SYSTEM_PROMPT = `You are The Replicator. Your task is to analyze the raw HTML/Text of a website and reverse-engineer it into a structured "Hatch Prompt".

The user wants to recreate this site using our AI builder.
You need to extract:
1. **The Vibe**: Colors, typography style, spacing, mood.
2. **The Structure**: What sections are present? (Hero, Features, Pricing, etc.)
3. **The Content**: Key headlines, value propositions, and copy.

## OUTPUT FORMAT
Return a JSON object with the following structure:

{
  "projectName": "Inferred Name",
  "description": "A short description of what this site is.",
  "style": {
    "palette": ["#hex", "#hex"],
    "fontPairing": "Sans/Serif description",
    "vibe": "Minimalist, Corporate, Playful, etc."
  },
  "sections": [
    {
      "type": "hero",
      "prompt": "Create a hero section with headline '...' and subheadline '...'. Use a dark background with a gradient glow."
    },
    {
      "type": "features",
      "prompt": "A 3-column grid showing features: X, Y, Z. Use icon cards with hover effects."
    }
    // ... more sections
  ]
}

## RULES
- Ignore scripts, styles, and tracking codes. Focus on the *visible content*.
- If the HTML is messy, infer the intent.
- Be specific in the "prompt" fields. This is what the builder will use to generate the code.
`

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check for Demiurge (Agency) subscription
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const accountSub = user.publicMetadata?.accountSubscription as AccountSubscription | undefined
    
    // Allow if user is admin (for testing) or has agency tier
    const isDemiurge = accountSub?.tier === 'agency' || user.publicMetadata?.role === 'admin'
    
    if (!isDemiurge) {
       // For now, we might want to let people try it or block it. 
       // Strict blocking:
       return NextResponse.json({ error: 'Demiurge Access Required', requiresUpgrade: true }, { status: 403 })
    }

    const { url } = await req.json()
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    if (!genai) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
    }

    // 1. Fetch the website content
    let html = ''
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'HatchIt-Replicator/1.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.statusText}`)
      }
      
      html = await response.text()
    } catch (fetchError) {
      console.error('Replicator fetch error:', fetchError)
      return NextResponse.json({ error: 'Could not access the URL. It might be blocked or private.' }, { status: 400 })
    }

    // 2. Truncate HTML to avoid token limits (focus on body, remove scripts)
    // Simple cleanup
    const cleanHtml = html
      .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "")
      .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gm, "")
      .replace(/<!--[\s\S]*?-->/gm, "")
      .slice(0, 30000) // Limit to ~30k chars for the model

    // 3. Analyze with Gemini
    const model = genai.getGenerativeModel({ model: 'gemini-2.0-flash-001' })
    
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: REPLICATOR_SYSTEM_PROMPT },
            { text: `URL: ${url}` },
            { text: `HTML CONTENT:\n${cleanHtml}` }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    })

    const responseText = result.response.text()
    const replicationData = JSON.parse(responseText)

    return NextResponse.json(replicationData)

  } catch (error) {
    console.error('Replicator error:', error)
    return NextResponse.json({ error: 'Replication failed' }, { status: 500 })
  }
}
