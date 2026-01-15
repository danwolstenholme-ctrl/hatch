import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getGenerationCount } from '@/lib/db/users'

// =============================================================================
// USER ANALYTICS API
// Returns aggregated usage stats for the current user
// =============================================================================

interface UserAnalytics {
  // Generation tracking
  generations: {
    usedToday: number
    dailyLimit: number
    isUnlimited: boolean
    resetsAt: string
  }
  // Project stats
  projects: {
    total: number
    limit: number
    deployed: number
  }
  // Build activity
  builds: {
    totalBuilds: number
    totalSections: number
    lastBuildAt: string | null
  }
  // Deployment activity
  deployments: {
    totalDeploys: number
    lastDeployAt: string | null
    activeSites: number
  }
  // Account info
  account: {
    tier: string
    memberSince: string
  }
}

const TIER_LIMITS: Record<string, { projects: number; generations: number }> = {
  free: { projects: 1, generations: 5 },
  architect: { projects: 3, generations: -1 },
  visionary: { projects: -1, generations: -1 },
  singularity: { projects: -1, generations: -1 },
}

export async function GET() {
  const { userId } = await auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const accountSub = user.publicMetadata?.accountSubscription as { tier?: string } | undefined
    const tier = accountSub?.tier || 'free'
    const limits = TIER_LIMITS[tier] || TIER_LIMITS.free
    const isPaid = tier !== 'free'

    // Get generation count (only relevant for free tier)
    const genData = await getGenerationCount(userId)

    // Get project stats from Supabase
    const projectStats = { total: 0, deployed: 0 }
    const buildStats = { totalBuilds: 0, totalSections: 0, lastBuildAt: null as string | null }
    const deployStats = { totalDeploys: 0, lastDeployAt: null as string | null, activeSites: 0 }

    if (supabaseAdmin) {
      // Project counts
      const { data: projects } = await supabaseAdmin
        .from('projects')
        .select('id, status, deployed_at')
        .eq('user_id', userId)

      if (projects) {
        projectStats.total = projects.length
        projectStats.deployed = projects.filter(p => p.status === 'deployed').length
        deployStats.activeSites = projectStats.deployed

        // Find last deploy
        const deployed = projects.filter(p => p.deployed_at).sort((a, b) => 
          new Date(b.deployed_at!).getTime() - new Date(a.deployed_at!).getTime()
        )
        if (deployed.length > 0) {
          deployStats.lastDeployAt = deployed[0].deployed_at!
        }
      }

      // Build counts - get all builds for user's projects
      if (projects && projects.length > 0) {
        const projectIds = projects.map(p => p.id)
        
        const { data: builds, count } = await supabaseAdmin
          .from('builds')
          .select('created_at, deploy_status', { count: 'exact' })
          .in('project_id', projectIds)
          .order('created_at', { ascending: false })

        if (builds) {
          buildStats.totalBuilds = count || builds.length
          buildStats.lastBuildAt = builds.length > 0 ? builds[0].created_at : null
          deployStats.totalDeploys = builds.filter(b => b.deploy_status === 'ready').length
        }

        // Section counts
        const { count: sectionCount } = await supabaseAdmin
          .from('sections')
          .select('*', { count: 'exact', head: true })
          .in('project_id', projectIds)
          .eq('status', 'complete')

        buildStats.totalSections = sectionCount || 0
      }
    }

    const analytics: UserAnalytics = {
      generations: {
        usedToday: genData.used,
        dailyLimit: genData.limit,
        isUnlimited: isPaid,
        resetsAt: genData.resetsAt,
      },
      projects: {
        total: projectStats.total,
        limit: limits.projects,
        deployed: projectStats.deployed,
      },
      builds: {
        totalBuilds: buildStats.totalBuilds,
        totalSections: buildStats.totalSections,
        lastBuildAt: buildStats.lastBuildAt,
      },
      deployments: {
        totalDeploys: deployStats.totalDeploys,
        lastDeployAt: deployStats.lastDeployAt,
        activeSites: deployStats.activeSites,
      },
      account: {
        tier,
        memberSince: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
      },
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
