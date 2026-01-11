import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { updateProjectStatus, getProjectById, getLatestBuild, updateBuildDeployStatus } from '@/lib/db'

// =============================================================================
// CONFIRM DEPLOYMENT API
// Called by the builder after Vercel deployment is confirmed ready
// This sets the project status to 'deployed' and updates build record
// =============================================================================

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId } = await params

    // Verify project exists and belongs to user
    const project = await getProjectById(projectId)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    if (project.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Confirm the deployment - set status to 'deployed'
    const deployedSlug = project.deployed_slug
    if (!deployedSlug) {
      return NextResponse.json({ error: 'No deployment in progress' }, { status: 400 })
    }

    // Update project status
    await updateProjectStatus(projectId, 'deployed', deployedSlug)
    
    // Update the latest build record with success status
    const latestBuild = await getLatestBuild(projectId)
    if (latestBuild) {
      await updateBuildDeployStatus(latestBuild.id, 'ready', {
        deployedAt: new Date().toISOString()
      })
    }

    return NextResponse.json({ 
      success: true,
      url: `https://${deployedSlug}.hatchit.dev`
    })

  } catch (error) {
    console.error('Confirm deploy error:', error)
    return NextResponse.json({ error: 'Failed to confirm deployment' }, { status: 500 })
  }
}
