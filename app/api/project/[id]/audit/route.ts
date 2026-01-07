import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { getLatestBuild, updateBuildAudit, getProjectById } from '@/lib/db'
import { GoogleGenAI } from '@google/genai'

// =============================================================================
// POST: Run Gemini audit on project build
// =============================================================================

// Validate Gemini API key
const geminiApiKey = process.env.GEMINI_API_KEY
if (!geminiApiKey) {
  console.warn('GEMINI_API_KEY is not configured - audit feature will be unavailable')
}
const genai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null

const AUDITOR_SYSTEM_PROMPT = `You are a senior frontend engineer performing a final audit on a React + Tailwind page.

Your job is to review the COMPLETE page and check for:

1. **Cross-section consistency**
   - Uniform spacing between sections
   - Consistent color palette
   - Typography hierarchy

2. **Accessibility compliance**
   - Alt text, focus states, ARIA labels
   - Semantic HTML

3. **Performance**
   - No anti-patterns
   - GPU-accelerated animations

4. **Mobile responsiveness**
   - Mobile-first classes
   - Touch-friendly targets

5. **SEO basics**
   - Proper heading hierarchy
   - Semantic landmarks

Return ONLY valid JSON:
{
  "auditedCode": "the complete audited code with all fixes applied",
  "changes": ["Description of fix 1", "Description of fix 2", ...]
}

If no changes needed:
{
  "auditedCode": "original code",
  "changes": []
}`

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if Gemini is configured
    if (!genai) {
      return NextResponse.json(
        { error: 'Audit feature is currently unavailable. Please try again later.' },
        { status: 503 }
      )
    }

    const user = await currentUser()

    // Tier check: Auditor requires Visionary+ tier
    const accountSub = user?.publicMetadata?.accountSubscription as { tier?: string } | undefined
    const hasAuditorAccess = ['visionary', 'singularity'].includes(accountSub?.tier || '') || user?.publicMetadata?.role === 'admin'
    if (!hasAuditorAccess) {
      return NextResponse.json({ error: 'Visionary tier required for audit', requiresUpgrade: true }, { status: 403 })
    }

    const { id: projectId } = await params

    // Verify ownership - project.user_id stores clerk_id directly
    const project = await getProjectById(projectId)
    if (!project || project.user_id !== clerkId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get the latest build
    const build = await getLatestBuild(projectId)
    if (!build) {
      return NextResponse.json(
        { error: 'No build found. Complete all sections first.' },
        { status: 400 }
      )
    }

    const fullCode = build.full_code

    // Call Gemini 2.5 Pro for audit
    const response = await genai.models.generateContent({
      model: 'gemini-2.5-pro-preview-06-05',
      contents: `${AUDITOR_SYSTEM_PROMPT}\n\n---\n\nAudit this React + Tailwind page:\n\n${fullCode}`,
    })

    const responseText = response.text || ''

    let auditedCode = fullCode
    let changes: string[] = []

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        auditedCode = parsed.auditedCode || fullCode
        changes = parsed.changes || []
      }
    } catch (parseError) {
      console.error('Failed to parse auditor response:', parseError)
      auditedCode = fullCode
      changes = []
    }

    // Update build with audit results
    await updateBuildAudit(
      build.id,
      true,
      changes,
      changes.length > 0 ? auditedCode : undefined
    )

    return NextResponse.json({
      auditComplete: true,
      auditChanges: changes,
      hasChanges: changes.length > 0,
    })

  } catch (error) {
    console.error('Error auditing project:', error)
    return NextResponse.json({ error: 'Failed to audit project' }, { status: 500 })
  }
}
