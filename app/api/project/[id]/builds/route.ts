import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getBuildsByProjectId, getProjectById } from '@/lib/db'

// =============================================================================
// GET: List all builds for a project
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

    const { id: projectId } = await params

    const project = await getProjectById(projectId)
    if (!project || project.user_id !== clerkId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const builds = await getBuildsByProjectId(projectId)
    return NextResponse.json({ builds })
  } catch (error) {
    console.error('Error listing builds:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
