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
  return 1 // Free tier gets 1 project
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
    const accountSubscription = user?.publicMetadata?.accountSubscription as { tier?: string } | undefined
    const tier = accountSubscription?.tier || 'free'
    const limit = getProjectLimit(tier)
    
    const existingProjects = await getProjectsByUserId(clerkId)
    if (existingProjects.length >= limit) {
      return NextResponse.json(
        { error: 'Project limit reached', limit, current: existingProjects.length },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { 
      templateId, 
      name, 
      sections: customSections, 
      brand, 
      initialPrompt, 
      guestSections,
      // Wizard fields
      description,
      siteType,
      pages,
      seo
    } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      )
    }

    // Validate template if provided
    const template = templateId ? getTemplateById(templateId) : null
    
    // Build brand config from wizard data or use provided brand
    const brandConfig = brand || (siteType ? {
      primaryColor: body.primaryColor || '#10b981',
      secondaryColor: body.secondaryColor || '#059669',
      font: body.bodyFont || 'Inter',
      headingFont: body.headingFont || 'Inter',
      mode: body.mode || 'dark',
      seo: seo || {
        title: body.seoTitle || name,
        description: body.seoDescription || description || '',
        keywords: body.seoKeywords || ''
      }
    } : null)

    // Create project with brand config (use clerkId, not dbUser.id)
    const project = await createProject(clerkId, name, templateId || 'website', brandConfig)
    if (!project) {
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }

    // Determine sections to create
    // Priority: wizard pages > customSections (IDs or objects) > template sections
    let sectionsToCreate: Section[] = []
    const sectionOrder = ['header', 'hero', 'features', 'services', 'about', 'testimonials', 'pricing', 'stats', 'work', 'faq', 'cta', 'contact', 'footer']
    
    if (pages && pages.length > 0) {
      // Use sections from wizard pages (flatten all page sections, deduplicate)
      const allSectionIds = new Set<string>()
      pages.forEach((page: { sections: string[] }) => {
        page.sections?.forEach((sectionId: string) => allSectionIds.add(sectionId))
      })
      // Convert section IDs to Section objects
      sectionsToCreate = Array.from(allSectionIds).map(id => ({
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        description: `${id.charAt(0).toUpperCase() + id.slice(1)} section`,
        prompt: '',
        estimatedTime: '~30 seconds',
        required: id === 'header' || id === 'footer',
        order: sectionOrder.indexOf(id) >= 0 ? sectionOrder.indexOf(id) : 99
      })).sort((a, b) => a.order - b.order)
    } else if (customSections && customSections.length > 0) {
      // Check if it's an array of IDs (strings) or full Section objects
      if (typeof customSections[0] === 'string') {
        // Convert IDs to Section objects
        sectionsToCreate = (customSections as string[]).map((id, idx) => ({
          id,
          name: id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' '),
          description: `${id.charAt(0).toUpperCase() + id.slice(1)} section`,
          prompt: '',
          estimatedTime: '~30 seconds',
          required: id === 'header' || id === 'footer',
          order: sectionOrder.indexOf(id) >= 0 ? sectionOrder.indexOf(id) : idx
        })).sort((a, b) => a.order - b.order)
      } else {
        // Already full Section objects
        sectionsToCreate = customSections
      }
    } else if (template) {
      sectionsToCreate = template.sections
    } else {
      // Default sections
      sectionsToCreate = [
        { id: 'header', name: 'Header', description: 'Site header', prompt: '', estimatedTime: '~30 seconds', required: true, order: 0 },
        { id: 'hero', name: 'Hero', description: 'Hero section', prompt: '', estimatedTime: '~30 seconds', required: false, order: 1 },
        { id: 'features', name: 'Features', description: 'Features section', prompt: '', estimatedTime: '~30 seconds', required: false, order: 2 },
        { id: 'cta', name: 'CTA', description: 'Call to action', prompt: '', estimatedTime: '~30 seconds', required: false, order: 3 },
        { id: 'footer', name: 'Footer', description: 'Site footer', prompt: '', estimatedTime: '~30 seconds', required: true, order: 4 }
      ]
    }
    
    const dbSections = await createSectionsFromTemplate(project.id, sectionsToCreate, initialPrompt, guestSections)

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

    // Get projects by clerk ID directly (projects.user_id stores clerk_id)
    const projects = await getProjectsByUserId(clerkId)

    return NextResponse.json({ projects })

  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
