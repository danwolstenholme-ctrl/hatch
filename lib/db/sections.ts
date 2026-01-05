import { supabaseAdmin, DbSection } from '../supabase'
import { Section } from '../templates'

// =============================================================================
// SECTION DATABASE OPERATIONS
// =============================================================================

/**
 * Create sections for a project from template
 * Called when a project is first created
 * @param initialPrompt - Optional prompt to set on the first section (from First Contact)
 * @param guestSections - Optional array of guest sections with code to import
 */
export async function createSectionsFromTemplate(
  projectId: string,
  sections: Section[],
  initialPrompt?: string,
  guestSections?: Array<{ sectionId: string; code?: string; userPrompt?: string; refined?: boolean; refinementChanges?: string[] }>
): Promise<DbSection[]> {
  if (!supabaseAdmin) {
    console.error('Supabase admin client not configured')
    return []
  }

  // Create a map of guest section data for quick lookup
  const guestMap = new Map(guestSections?.map(s => [s.sectionId, s]) || [])

  const sectionRows = sections.map((section, index) => {
    const guestData = guestMap.get(section.id)
    const hasCode = guestData?.code && guestData.code.length > 0
    
    return {
      project_id: projectId,
      section_id: section.id,
      order_index: index,
      status: hasCode ? 'complete' as const : 'pending' as const,
      code: guestData?.code || null,
      user_prompt: guestData?.userPrompt || ((index === 0 && initialPrompt) ? initialPrompt : null),
      refined: guestData?.refined || false,
      refinement_changes: guestData?.refinementChanges || null,
    }
  })

  const { data, error } = await supabaseAdmin
    .from('sections')
    .insert(sectionRows)
    .select()

  if (error) {
    console.error('Error creating sections:', error)
    return []
  }

  return data as DbSection[]
}

/**
 * Get all sections for a project (ordered)
 */
export async function getSectionsByProjectId(projectId: string): Promise<DbSection[]> {
  if (!supabaseAdmin) return []

  const { data, error } = await supabaseAdmin
    .from('sections')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching sections:', error)
    return []
  }

  return data as DbSection[]
}

/**
 * Get a single section by ID
 */
export async function getSectionById(id: string): Promise<DbSection | null> {
  if (!supabaseAdmin) {
    console.error('[DB] supabaseAdmin is null in getSectionById')
    return null
  }

  const { data, error } = await supabaseAdmin
    .from('sections')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching section:', error)
    return null
  }
  return data as DbSection
}

/**
 * Update section status to 'building'
 */
export async function markSectionBuilding(id: string): Promise<DbSection | null> {
  if (!supabaseAdmin) return null

  const { data, error } = await supabaseAdmin
    .from('sections')
    .update({ status: 'building' })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error marking section as building:', error)
    return null
  }

  return data as DbSection
}

/**
 * Complete a section with generated code
 * Called after Architect generates the code
 */
export async function completeSection(
  id: string,
  code: string,
  userPrompt: string
): Promise<DbSection | null> {
  if (!supabaseAdmin) return null

  const { data, error } = await supabaseAdmin
    .from('sections')
    .update({
      status: 'complete',
      code,
      user_prompt: userPrompt,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error completing section:', error)
    return null
  }

  return data as DbSection
}

/**
 * Update section with Architect refinement
 * Called after Architect reviews and potentially improves the code
 */
export async function updateSectionRefinement(
  id: string,
  refined: boolean,
  refinedCode?: string,
  refinementChanges?: string[]
): Promise<DbSection | null> {
  if (!supabaseAdmin) return null

  const updateData: Partial<DbSection> = {
    refined,
    refinement_changes: refinementChanges || null,
  }

  // Only update code if Architect actually changed it
  if (refined && refinedCode) {
    updateData.code = refinedCode
  }

  const { data, error } = await supabaseAdmin
    .from('sections')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating section refinement:', error)
    return null
  }

  return data as DbSection
}

/**
 * Skip a section
 */
export async function skipSection(id: string): Promise<DbSection | null> {
  if (!supabaseAdmin) return null

  const { data, error } = await supabaseAdmin
    .from('sections')
    .update({ status: 'skipped' })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error skipping section:', error)
    return null
  }

  return data as DbSection
}

/**
 * Reset a section to pending (for re-building)
 */
export async function resetSection(id: string): Promise<DbSection | null> {
  if (!supabaseAdmin) return null

  const { data, error } = await supabaseAdmin
    .from('sections')
    .update({
      status: 'pending',
      code: null,
      user_prompt: null,
      refined: false,
      refinement_changes: null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error resetting section:', error)
    return null
  }

  return data as DbSection
}

/**
 * Get completion stats for a project
 */
export async function getSectionStats(projectId: string): Promise<{
  total: number
  complete: number
  skipped: number
  pending: number
  building: number
}> {
  const sections = await getSectionsByProjectId(projectId)
  
  return {
    total: sections.length,
    complete: sections.filter(s => s.status === 'complete').length,
    skipped: sections.filter(s => s.status === 'skipped').length,
    pending: sections.filter(s => s.status === 'pending').length,
    building: sections.filter(s => s.status === 'building').length,
  }
}
