import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { getTemplateById } from '@/lib/templates'
import { getOrCreateUser, createProject, createSectionsFromTemplate, getSectionsByProjectId, completeSection, updateSectionRefinement, getProjectsByUserId } from '@/lib/db'

// Tier project limits (server-side enforcement)
function getProjectLimit(tier: string): number {
  if (tier === 'singularity' || tier === 'visionary') return Infinity
  if (tier === 'architect') return 3
  return 3 // Free tier gets 3 projects
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await currentUser()
    const email = user?.emailAddresses?.[0]?.emailAddress
    const dbUser = await getOrCreateUser(userId, email)
    if (!dbUser) return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })

    // Server-side project limit check
    const accountSubscription = user?.publicMetadata?.accountSubscription as any
    const tier = accountSubscription?.tier || 'free'
    const limit = getProjectLimit(tier)
    
    const existingProjects = await getProjectsByUserId(dbUser.id)
    if (existingProjects.length >= limit) {
      return NextResponse.json(
        { error: 'Project limit reached. Upgrade to import more projects.', limit, current: existingProjects.length },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { templateId, projectName, brand, sections } = body || {}

    if (!templateId || !projectName || !Array.isArray(sections)) {
      return NextResponse.json({ error: 'Missing required fields: templateId, projectName, sections' }, { status: 400 })
    }

    const template = getTemplateById(templateId)
    if (!template) return NextResponse.json({ error: 'Invalid template' }, { status: 400 })

    const project = await createProject(dbUser.id, projectName, templateId, brand || null)
    if (!project) return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })

    await createSectionsFromTemplate(project.id, template.sections)
    const dbSections = await getSectionsByProjectId(project.id)

    for (const dbSection of dbSections) {
      const source = sections.find((s: any) => s.sectionId === dbSection.section_id)
      if (!source || !source.code) continue
      await completeSection(dbSection.id, source.code, source.userPrompt || '')
      if (source.refined) {
        await updateSectionRefinement(dbSection.id, true, source.code, source.refinementChanges || [])
      }
    }

    return NextResponse.json({ imported: true, projectId: project.id, slug: project.slug })
  } catch (err) {
    console.error('Import project error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
