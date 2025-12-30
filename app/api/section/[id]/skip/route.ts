import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { skipSection, getSectionById, getProjectById } from '@/lib/db'

// =============================================================================
// POST: Skip a section
// =============================================================================
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: sectionId } = await params

    // Verify ownership: section -> project -> user
    const existingSection = await getSectionById(sectionId)
    if (!existingSection) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }
    const project = await getProjectById(existingSection.project_id)
    if (!project || project.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const section = await skipSection(sectionId)
    if (!section) {
      return NextResponse.json(
        { error: 'Failed to skip section' },
        { status: 500 }
      )
    }

    return NextResponse.json({ section })

  } catch (error) {
    console.error('Error skipping section:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
