import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { getProjectById, createProject } from '@/lib/db/projects'
import { getSectionsByProjectId } from '@/lib/db/sections'
import { supabaseAdmin } from '@/lib/supabase'
import { AccountSubscription } from '@/types/subscriptions'

// =============================================================================
// DUPLICATE PROJECT API
// Creates a copy of an existing project with all its sections
// TIER: Architect+ (requires paid plan)
// =============================================================================

const TIER_PROJECT_LIMITS: Record<string, number> = {
  free: 1,
  architect: 3,
  visionary: Infinity,
  singularity: Infinity,
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { projectId } = await req.json()
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    // Get user tier
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const accountSub = user.publicMetadata?.accountSubscription as AccountSubscription | undefined
    const tier = accountSub?.tier || 'free'

    // Check tier access (must be paid)
    if (tier === 'free') {
      return NextResponse.json({ 
        error: 'Project duplication requires a paid plan', 
        requiresUpgrade: true 
      }, { status: 403 })
    }

    // Get current project count
    if (supabaseAdmin) {
      const { count } = await supabaseAdmin
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
      
      const limit = TIER_PROJECT_LIMITS[tier] || 1
      if (limit !== Infinity && (count || 0) >= limit) {
        return NextResponse.json({ 
          error: `Project limit reached (${limit} projects). Upgrade for more.`, 
          requiresUpgrade: true 
        }, { status: 403 })
      }
    }

    // Get source project
    const sourceProject = await getProjectById(projectId)
    if (!sourceProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Verify ownership
    if (sourceProject.user_id !== userId) {
      return NextResponse.json({ error: 'Not authorized to duplicate this project' }, { status: 403 })
    }

    // Get source sections
    const sourceSections = await getSectionsByProjectId(projectId)

    // Create new project with "(Copy)" suffix
    const newName = `${sourceProject.name} (Copy)`
    const newProject = await createProject(
      userId,
      newName,
      sourceProject.template_id || 'custom',
      sourceProject.brand_config
    )

    if (!newProject) {
      return NextResponse.json({ error: 'Failed to create duplicate project' }, { status: 500 })
    }

    // Copy sections with their code
    if (supabaseAdmin && sourceSections.length > 0) {
      const sectionRows = sourceSections.map((section, index) => ({
        project_id: newProject.id,
        section_id: section.section_id,
        order_index: index,
        status: section.status,
        code: section.code,
        user_prompt: section.user_prompt,
        refined: section.refined,
        refinement_changes: section.refinement_changes,
      }))

      const { error: sectionsError } = await supabaseAdmin
        .from('sections')
        .insert(sectionRows)

      if (sectionsError) {
        console.error('Error copying sections:', sectionsError)
        // Project was created, sections failed - still return success but log warning
      }
    }

    return NextResponse.json({ 
      success: true,
      project: newProject,
      message: 'Project duplicated successfully'
    })

  } catch (error) {
    console.error('Error duplicating project:', error)
    return NextResponse.json({ error: 'Failed to duplicate project' }, { status: 500 })
  }
}
