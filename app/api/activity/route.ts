import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

// =============================================================================
// ACTIVITY FEED API
// Returns recent user activity derived from builds, sections, and projects
// =============================================================================

interface ActivityItem {
  id: string
  type: 'build' | 'deploy' | 'section' | 'project_created'
  title: string
  description: string
  timestamp: string
  projectId?: string
  projectName?: string
  metadata?: Record<string, unknown>
}

export async function GET() {
  const { userId } = await auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ activities: [] })
    }

    const activities: ActivityItem[] = []

    // Get user's projects first
    const { data: projects } = await supabaseAdmin
      .from('projects')
      .select('id, name, created_at, deployed_at, status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!projects || projects.length === 0) {
      return NextResponse.json({ activities: [] })
    }

    const projectIds = projects.map(p => p.id)
    const projectMap = new Map(projects.map(p => [p.id, p.name]))

    // Get recent builds (last 20)
    const { data: builds } = await supabaseAdmin
      .from('builds')
      .select('id, project_id, created_at, deploy_status, deployed_at, version')
      .in('project_id', projectIds)
      .order('created_at', { ascending: false })
      .limit(20)

    if (builds) {
      for (const build of builds) {
        // Add build activity
        activities.push({
          id: `build-${build.id}`,
          type: 'build',
          title: 'Site built',
          description: `Version ${build.version || 1}`,
          timestamp: build.created_at,
          projectId: build.project_id,
          projectName: projectMap.get(build.project_id) || 'Unknown',
        })

        // Add deploy activity if deployed
        if (build.deploy_status === 'ready' && build.deployed_at) {
          activities.push({
            id: `deploy-${build.id}`,
            type: 'deploy',
            title: 'Site deployed',
            description: 'Deployment successful',
            timestamp: build.deployed_at,
            projectId: build.project_id,
            projectName: projectMap.get(build.project_id) || 'Unknown',
          })
        }
      }
    }

    // Get recent section completions (last 20)
    const { data: sections } = await supabaseAdmin
      .from('sections')
      .select('id, project_id, section_id, updated_at, status, refined')
      .in('project_id', projectIds)
      .eq('status', 'complete')
      .order('updated_at', { ascending: false })
      .limit(20)

    if (sections) {
      for (const section of sections) {
        const sectionLabel = section.section_id
          .split('-')
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')

        activities.push({
          id: `section-${section.id}`,
          type: 'section',
          title: section.refined ? 'Section refined' : 'Section built',
          description: sectionLabel,
          timestamp: section.updated_at,
          projectId: section.project_id,
          projectName: projectMap.get(section.project_id) || 'Unknown',
        })
      }
    }

    // Add project creation activities
    for (const project of projects.slice(0, 10)) {
      activities.push({
        id: `project-${project.id}`,
        type: 'project_created',
        title: 'Project created',
        description: project.name,
        timestamp: project.created_at,
        projectId: project.id,
        projectName: project.name,
      })
    }

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    // Return top 30 activities
    return NextResponse.json({ 
      activities: activities.slice(0, 30) 
    })

  } catch (error) {
    console.error('Error fetching activity:', error)
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 })
  }
}
