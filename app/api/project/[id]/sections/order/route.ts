import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getProjectById, getSectionsByProjectId, updateSectionOrderBySectionIds } from '@/lib/db'

export async function PATCH(
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

    const body = (await request.json().catch(() => null)) as null | { order?: unknown }
    const order = body?.order
    if (!Array.isArray(order) || order.some((v) => typeof v !== 'string')) {
      return NextResponse.json({ error: 'Invalid order payload' }, { status: 400 })
    }

    const orderedSectionIds = order as string[]

    const existing = await getSectionsByProjectId(projectId)
    const existingIds = existing.map((s) => s.section_id)

    // Require a full permutation of the current set to prevent accidental drops/dupes.
    if (orderedSectionIds.length !== existingIds.length) {
      return NextResponse.json({ error: 'Order must include all sections' }, { status: 400 })
    }

    const existingSet = new Set(existingIds)
    const incomingSet = new Set(orderedSectionIds)

    if (incomingSet.size !== orderedSectionIds.length) {
      return NextResponse.json({ error: 'Order contains duplicates' }, { status: 400 })
    }

    for (const sectionId of orderedSectionIds) {
      if (!existingSet.has(sectionId)) {
        return NextResponse.json({ error: `Unknown section_id: ${sectionId}` }, { status: 400 })
      }
    }

    if (incomingSet.size !== existingSet.size) {
      return NextResponse.json({ error: 'Order does not match existing sections' }, { status: 400 })
    }

    const sections = await updateSectionOrderBySectionIds(projectId, orderedSectionIds)
    return NextResponse.json({ sections })
  } catch (error) {
    console.error('Error updating section order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
