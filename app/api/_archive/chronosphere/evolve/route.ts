import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { GoogleGenAI } from '@google/genai'
import { getOrCreateUser } from '@/lib/db'
import { getUserDNA, updateUserDNA } from '@/lib/db/chronosphere'
import { StyleDNA } from '@/lib/supabase'
import { AccountSubscription } from '@/types/subscriptions'

// =============================================================================
// THE CHRONOSPHERE - EVOLUTION ENGINE
// Analyzes code to update User Style DNA
// TIER: Singularity (learns your taste over time)
// =============================================================================

const geminiApiKey = process.env.GEMINI_API_KEY
const genai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null

const EVOLUTION_SYSTEM_PROMPT = `You are The Chronosphere. Your task is to analyze a piece of React/Tailwind code and extract the "Style DNA" of the creator.

You are looking for patterns, preferences, and stylistic choices that define this user's taste.

## INPUT
- Current Style DNA (JSON)
- New Code (React Component)

## OUTPUT
Return a JSON object representing the UPDATED Style DNA.
Merge the new insights with the old DNA.

Rules for merging:
1. **Vibe Keywords**: Add new keywords that describe the code (e.g., "glassmorphism", "brutalist", "playful"). Keep the list to top 10 most frequent.
2. **Preferred Colors**: Extract dominant hex codes or Tailwind color families.
3. **Preferred Fonts**: Extract font families used.
4. **Rejected Patterns**: If the user explicitly removed something (not applicable here, but keep existing).
5. **Evolution Stage**: Increment by 1 if the code shows high complexity or unique styling.

Format:
{
  "vibe_keywords": ["minimal", "dark", ...],
  "preferred_colors": ["#000000", "zinc-900", ...],
  "preferred_fonts": ["Inter", ...],
  "rejected_patterns": [...],
  "evolution_stage": 2,
  "last_updated": "ISO_DATE"
}
`

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check for Singularity tier
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const accountSub = user.publicMetadata?.accountSubscription as AccountSubscription | undefined
    
    const hasChronosphereAccess = accountSub?.tier === 'singularity' || user.publicMetadata?.role === 'admin'
    
    if (!hasChronosphereAccess) {
      return NextResponse.json({ 
        error: 'The Chronosphere requires Singularity tier', 
        requiresUpgrade: true,
        requiredTier: 'singularity'
      }, { status: 403 })
    }

    if (!genai) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
    }

    const { code } = await req.json()
    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 })
    }

    // Get current DNA
    const dbUser = await getOrCreateUser(userId)
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    
    const currentDNA = await getUserDNA(dbUser.id)

    // Evolve DNA with Gemini
    const response = await genai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      config: {
        responseMimeType: 'application/json',
      },
      contents: [
        {
          role: 'user',
          parts: [
            { text: EVOLUTION_SYSTEM_PROMPT },
            { text: `CURRENT DNA: ${JSON.stringify(currentDNA)}` },
            { text: `NEW CODE TO ANALYZE:\n${code.slice(0, 5000)}` }
          ]
        }
      ]
    })

    const responseText = response.text || '{}'
    let newDNA: StyleDNA

    try {
      newDNA = JSON.parse(responseText)
      // Ensure last_updated is set
      newDNA.last_updated = new Date().toISOString()
    } catch (e) {
      console.error('Failed to parse DNA evolution:', e)
      return NextResponse.json({ error: 'Evolution failed' }, { status: 500 })
    }

    // Save updated DNA
    await updateUserDNA(dbUser.id, newDNA)

    return NextResponse.json({ success: true, dna: newDNA })

  } catch (error) {
    console.error('Chronosphere Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
