import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getProjectById } from '@/lib/db'
import { supabaseAdmin } from '@/lib/supabase'

// =============================================================================
// DELETE SECTION FROM PROJECT
// DELETE /api/project/[id]/sections/[sectionId]
// =============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId, sectionId } = await params

    // Verify project ownership
    const project = await getProjectById(projectId)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    if (project.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Don't allow deleting header or footer
    if (sectionId === 'header' || sectionId === 'footer') {
      return NextResponse.json({ error: 'Cannot delete header or footer' }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    // Delete the section
    const { error } = await supabaseAdmin
      .from('sections')
      .delete()
      .eq('project_id', projectId)
      .eq('section_id', sectionId)

    if (error) {
      console.error('Error deleting section:', error)
      return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 })
    }

    // Re-index remaining sections
    if (supabaseAdmin) {
      const { data: remaining } = await supabaseAdmin
        .from('sections')
        .select('id, section_id, order_index')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true })

      if (remaining && remaining.length > 0) {
        for (const section of remaining) {
          const idx = remaining.indexOf(section)
          await supabaseAdmin
            .from('sections')
            .update({ order_index: idx })
            .eq('id', section.id)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/project/[id]/sections/[sectionId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
