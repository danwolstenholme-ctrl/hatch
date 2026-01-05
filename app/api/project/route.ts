import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { 
  getOrCreateUser, 
  createProject, 
  getProjectsByUserId,
  createSectionsFromTemplate,
} from '@/lib/db'
import { getTemplateById, Section } from '@/lib/templates'

// Tier project limits (server-side enforcement)
function getProjectLimit(tier: string): number {
  if (tier === 'singularity' || tier === 'visionary') return Infinity
  if (tier === 'architect') return 3
  return 3 // Free tier gets 3 projects
}

// =============================================================================
// POST: Create a new project with sections and brand config
// =============================================================================
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await currentUser()
    const email = user?.emailAddresses?.[0]?.emailAddress

    // Get or create our user record
    const dbUser = await getOrCreateUser(clerkId, email)
    if (!dbUser) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Server-side project limit check
    const accountSubscription = user?.publicMetadata?.accountSubscription as any
    const tier = accountSubscription?.tier || 'free'
    const limit = getProjectLimit(tier)
    
    const existingProjects = await getProjectsByUserId(dbUser.id)
    if (existingProjects.length >= limit) {
      return NextResponse.json(
        { error: 'Project limit reached', limit, current: existingProjects.length },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { templateId, name, sections: customSections, brand, initialPrompt } = body

    if (!templateId || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: templateId, name' },
        { status: 400 }
      )
    }

    // Validate template
    const template = getTemplateById(templateId)
    if (!template) {
      return NextResponse.json({ error: 'Invalid template' }, { status: 400 })
    }

    // Create project with brand config
    const project = await createProject(dbUser.id, name, templateId, brand || null)
    if (!project) {
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }

    // Create sections from template (or custom sections if provided)
    const sectionsToCreate: Section[] = customSections || template.sections
    const dbSections = await createSectionsFromTemplate(project.id, sectionsToCreate, initialPrompt)

    return NextResponse.json({
      project,
      sections: dbSections,
    })

  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// =============================================================================
// GET: List user's projects
// =============================================================================
export async function GET() {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await currentUser()
    const email = user?.emailAddresses?.[0]?.emailAddress

    // Get or create our user record
    const dbUser = await getOrCreateUser(clerkId, email)
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const projects = await getProjectsByUserId(dbUser.id)

    return NextResponse.json({ projects })

  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
