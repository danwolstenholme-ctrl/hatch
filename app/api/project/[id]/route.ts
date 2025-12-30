import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { 
  getProjectById, 
  getSectionsByProjectId,
  getSectionById,
  skipSection as dbSkipSection,
} from '@/lib/db'
import { getTemplateById } from '@/lib/templates'

// =============================================================================
// GET: Get project details with sections
// =============================================================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    
    const project = await getProjectById(id)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Verify ownership
    if (project.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const sections = await getSectionsByProjectId(id)
    const template = getTemplateById(project.template_id)

    return NextResponse.json({
      project,
      sections,
      template,
    })

  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
