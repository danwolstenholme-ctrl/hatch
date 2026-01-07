import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { 
  getProjectById, 
  getSectionsByProjectId,
  updateProjectBrandConfig,
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
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    
    const project = await getProjectById(id)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Verify ownership - project.user_id is the clerk_id per schema
    if (project.user_id !== clerkId) {
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

// =============================================================================
// PATCH: Update project settings (brand, seo, integrations)
// =============================================================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { brandConfig } = body

    if (!brandConfig) {
      return NextResponse.json({ error: 'Missing brandConfig' }, { status: 400 })
    }

    // Verify ownership - project.user_id stores clerk_id directly
    const project = await getProjectById(id)
    if (!project || project.user_id !== clerkId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updatedProject = await updateProjectBrandConfig(id, brandConfig)
    
    return NextResponse.json({ project: updatedProject })

  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
