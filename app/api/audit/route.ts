import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { GoogleGenAI } from '@google/genai'
import { 
  getLatestBuild, 
  updateBuildAudit,
  createBuild,
  getProjectById,
} from '@/lib/db'

// =============================================================================
// GEMINI 2.5 PRO - THE AUDITOR
// Final review with fresh eyes from a different AI model
// Catches what Claude misses
// =============================================================================

// Validate Gemini API key at module level
const geminiApiKey = process.env.GEMINI_API_KEY
if (!geminiApiKey) {
  console.warn('GEMINI_API_KEY is not configured - audit feature will be unavailable')
}

// Initialize Gemini client (may be null if API key not set)
const genai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null

const AUDITOR_SYSTEM_PROMPT = `You are a senior frontend engineer performing a FINAL AUDIT on a React + Tailwind page.

CONTEXT: This code was built by Claude Sonnet and refined by Claude Opus.
You are Gemini - a different AI with different strengths.
Your job is to catch what they missed. Be the fresh eyes.

## AUDIT CHECKLIST

### 1. Cross-Section Consistency (check the WHOLE page)
- Uniform section spacing (py-20, py-24 - should be consistent)
- Consistent color palette throughout
- Typography hierarchy makes sense
- Visual rhythm feels right

### 2. Accessibility (WCAG compliance)
- All images have descriptive alt text
- Interactive elements have visible focus states
- Proper ARIA labels where needed
- Semantic HTML (nav, main, section, article, footer)
- Sufficient color contrast (4.5:1 for text)
- Keyboard navigable

### 3. Performance
- Animations use transform/opacity (GPU-accelerated)
- No layout thrashing animations (width, height, top, left)
- Reasonable DOM depth
- No obvious memory leaks in event handlers

### 4. Mobile Responsiveness
- Mobile-first class order
- Touch targets at least 44px
- Text readable without zooming
- No horizontal overflow

### 5. SEO Basics
- Single h1 tag
- Logical heading hierarchy (h1 → h2 → h3)
- Semantic landmarks

## OUTPUT FORMAT

Return ONLY valid JSON (no markdown, no explanation):

{
  "auditedCode": "the complete code with all fixes applied",
  "changes": [
    {"severity": "high", "fix": "Added missing alt text to hero image"},
    {"severity": "medium", "fix": "Fixed inconsistent section padding (py-20 → py-24)"},
    {"severity": "low", "fix": "Improved button focus ring visibility"}
  ],
  "scores": {
    "accessibility": 95,
    "performance": 90,
    "consistency": 88,
    "mobile": 92
  },
  "passed": true
}

Severity levels:
- high: Accessibility violation or major issue
- medium: Inconsistency or best practice violation  
- low: Minor improvement or polish

If code passes all checks with no changes needed:

{
  "auditedCode": "the original code unchanged",
  "changes": [],
  "scores": {
    "accessibility": 100,
    "performance": 100,
    "consistency": 100,
    "mobile": 100
  },
  "passed": true
}

Be thorough but practical. Focus on real issues, not nitpicks.`

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if Gemini is configured
    if (!genai) {
      return NextResponse.json(
        { error: 'Audit feature is currently unavailable. Please try again later.' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { projectId } = body

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing required field: projectId' },
        { status: 400 }
      )
    }

    // Verify project ownership
    const project = await getProjectById(projectId)
    if (!project || project.user_id !== userId) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Get or create the latest build
    let build = await getLatestBuild(projectId)
    
    if (!build) {
      build = await createBuild(projectId)
      if (!build) {
        return NextResponse.json(
          { error: 'Failed to create build - no sections found' },
          { status: 500 }
        )
      }
    }

    const fullCode = build.full_code

    // Call Gemini 2.5 Pro for audit
    const response = await genai.models.generateContent({
      model: 'gemini-2.5-pro-preview-06-05',
      contents: `${AUDITOR_SYSTEM_PROMPT}\n\n---\n\nAudit this complete React + Tailwind page:\n\n${fullCode}`,
    })

    // Extract the response
    const responseText = response.text || ''

    // Parse JSON response
    let auditedCode = fullCode
    let changes: Array<{severity: string, fix: string}> = []
    let scores = { accessibility: 0, performance: 0, consistency: 0, mobile: 0 }
    let passed = true

    try {
      const cleanedResponse = responseText
        .replace(/^```(?:json)?\n?/gm, '')
        .replace(/\n?```$/gm, '')
        .trim()

      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        auditedCode = parsed.auditedCode || fullCode
        changes = parsed.changes || []
        scores = parsed.scores || scores
        passed = parsed.passed !== false
      }
    } catch (parseError) {
      console.error('[audit] Failed to parse Gemini response:', parseError)
      auditedCode = fullCode
      changes = []
    }

    // Update build with audit results
    const changeDescriptions = changes.map(c => typeof c === 'string' ? c : c.fix)
    await updateBuildAudit(
      build.id,
      true,
      changeDescriptions,
      changes.length > 0 ? auditedCode : undefined
    )

    return NextResponse.json({
      auditComplete: true,
      changes,
      scores,
      passed,
      hasChanges: changes.length > 0,
      model: 'gemini-2.5-pro',
    })

  } catch (error) {
    console.error('Error auditing project:', error)
    return NextResponse.json({ error: 'Failed to audit project' }, { status: 500 })
  }
}