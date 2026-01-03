import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { 
  getLatestBuild, 
  updateBuildAudit,
  createBuild,
  getProjectById,
  getOrCreateUser,
} from '@/lib/db'

// =============================================================================
// CLAUDE SONNET 4.5 - THE AUDITOR
// Final review with fresh eyes from the smartest model available
// =============================================================================

const AUDITOR_SYSTEM_PROMPT = `You are The Auditor — a high-precision quality assurance system performing a FINAL AUDIT on a React + Tailwind page.

CONTEXT: This code was constructed by The Architect (Sonnet 4.5).
You are The Auditor (Sonnet 4.5) — the final gatekeeper.
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
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await currentUser()
    const email = user?.emailAddresses?.[0]?.emailAddress
    const dbUser = await getOrCreateUser(clerkId, email)
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { projectId } = body

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing required field: projectId' },
        { status: 400 }
      )
    }

    // Verify project ownership using internal user ID
    const project = await getProjectById(projectId)
    if (!project || project.user_id !== dbUser.id) {
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

    // Call Claude Sonnet 4.5 for audit
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 64000,
        system: AUDITOR_SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: `Audit this complete React + Tailwind page:\n\n${fullCode}` }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Anthropic API error:', error)
      return NextResponse.json({ error: 'Audit failed' }, { status: 500 })
    }

    const data = await response.json()
    const responseText = data.content[0]?.text || ''

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
      console.error('[audit] Failed to parse Claude response:', parseError)
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
      model: 'claude-sonnet-4.5',
    })

  } catch (error) {
    console.error('Error auditing project:', error)
    return NextResponse.json({ error: 'Failed to audit project' }, { status: 500 })
  }
}
