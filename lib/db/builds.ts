import { supabaseAdmin, DbBuild, DbSection } from '../supabase'
import { getSectionsByProjectId } from './sections'

// =============================================================================
// BUILD DATABASE OPERATIONS
// =============================================================================

/**
 * Assemble all section code into a full page
 * This combines completed sections in order
 */
export function assembleSectionsIntoCode(sections: DbSection[]): string {
  const completedSections = sections
    .filter(s => s.status === 'complete' && s.code)
    .sort((a, b) => a.order_index - b.order_index)

  if (completedSections.length === 0) {
    return ''
  }

  const header = completedSections.find(s => s.section_id === 'header')
  const footer = completedSections.find(s => s.section_id === 'footer')

  const bodySections = completedSections
    .filter(s => s.section_id !== 'header' && s.section_id !== 'footer')
    .map(section => {
      return `{/* ========== ${section.section_id.toUpperCase()} ========== */}\n${section.code}`
    })
    .join('\n\n')

  // Wrap in a full page component
  return `'use client'

import { motion } from 'framer-motion'

export default function GeneratedPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {${header ? 'true' : 'false'} ? (
        <header className="shrink-0">
          {/* ========== HEADER ========== */}
          ${header ? header.code : ''}
        </header>
      ) : null}

      <main className="flex-1">
        ${bodySections}
      </main>

      {${footer ? 'true' : 'false'} ? (
        <footer className="shrink-0">
          {/* ========== FOOTER ========== */}
          ${footer ? footer.code : ''}
        </footer>
      ) : null}
    </div>
  )
}
`
}

/**
 * Create a new build from completed sections
 */
export async function createBuild(projectId: string): Promise<DbBuild | null> {
  if (!supabaseAdmin) {
    console.error('Supabase admin client not configured')
    return null
  }

  // Get all sections for the project
  const sections = await getSectionsByProjectId(projectId)
  
  // Assemble the full code
  const fullCode = assembleSectionsIntoCode(sections)

  if (!fullCode) {
    console.error('No completed sections to build')
    return null
  }

  // Use a transaction-safe approach: insert with subquery to get next version atomically
  // This prevents race conditions where two concurrent builds get the same version
  const { data, error } = await supabaseAdmin.rpc('create_build_atomic', {
    p_project_id: projectId,
    p_full_code: fullCode
  })

  // If RPC doesn't exist, fall back to regular insert (with potential race condition)
  if (error && error.message?.includes('function') && error.message?.includes('does not exist')) {
    // Get current version number (fallback - has race condition risk)
    const { data: existingBuilds } = await supabaseAdmin
      .from('builds')
      .select('version')
      .eq('project_id', projectId)
      .order('version', { ascending: false })
      .limit(1)

    const nextVersion = existingBuilds && existingBuilds.length > 0 
      ? existingBuilds[0].version + 1 
      : 1

    // Create the build
    const { data: fallbackData, error: fallbackError } = await supabaseAdmin
      .from('builds')
      .insert({
        project_id: projectId,
        full_code: fullCode,
        version: nextVersion,
        audit_complete: false,
        audit_changes: null,
        deployed_url: null,
      })
      .select()
      .single()

    if (fallbackError) {
      console.error('Error creating build:', fallbackError)
      return null
    }

    // Sync with pages/versions for dashboard compatibility
    await syncBuildToPage(projectId, fullCode, nextVersion)

    return fallbackData as DbBuild
  }

  if (error) {
    console.error('Error creating build:', error)
    return null
  }

  // Sync with pages/versions for dashboard compatibility
  if (data) {
    await syncBuildToPage(projectId, fullCode, data.version)
  }

  return data as DbBuild
}

/**
 * Helper to sync build to pages/versions tables
 * This ensures the Dashboard (which uses useProjects) sees the latest build
 */
async function syncBuildToPage(projectId: string, code: string, versionIndex: number) {
  if (!supabaseAdmin) return

  try {
    // 1. Get or Create Home Page
    let { data: page } = await supabaseAdmin
      .from('pages')
      .select('id')
      .eq('project_id', projectId)
      .eq('path', '/')
      .single()

    if (!page) {
      // Create home page
      // We use a random ID for the page
      const pageId = Math.random().toString(36).substring(2, 15)
      
      const { data: newPage, error: pageError } = await supabaseAdmin
        .from('pages')
        .insert({
          id: pageId,
          project_id: projectId,
          name: 'Home',
          path: '/',
          current_version_index: versionIndex
        })
        .select()
        .single()
        
      if (pageError) {
        console.error('Failed to create sync page:', pageError)
        return
      }
      page = newPage
    } else {
      // Update current version index
      await supabaseAdmin
        .from('pages')
        .update({ current_version_index: versionIndex })
        .eq('id', page.id)
    }

    if (!page) return

    // 2. Create Version
    await supabaseAdmin
      .from('versions')
      .insert({
        page_id: page.id,
        code: code,
        prompt: 'Auto-generated from build',
        version_index: versionIndex
      })
  } catch (err) {
    console.error('Error syncing build to page:', err)
  }
}

/**
 * Get the latest build for a project
 */
export async function getLatestBuild(projectId: string): Promise<DbBuild | null> {
  if (!supabaseAdmin) return null

  const { data, error } = await supabaseAdmin
    .from('builds')
    .select('*')
    .eq('project_id', projectId)
    .order('version', { ascending: false })
    .limit(1)
    .single()

  if (error) return null
  return data as DbBuild
}

/**
 * Get a build by ID
 */
export async function getBuildById(id: string): Promise<DbBuild | null> {
  if (!supabaseAdmin) return null

  const { data, error } = await supabaseAdmin
    .from('builds')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as DbBuild
}

/**
 * Get all builds for a project
 */
export async function getBuildsByProjectId(projectId: string): Promise<DbBuild[]> {
  if (!supabaseAdmin) return []

  const { data, error } = await supabaseAdmin
    .from('builds')
    .select('*')
    .eq('project_id', projectId)
    .order('version', { ascending: false })

  if (error) {
    console.error('Error fetching builds:', error)
    return []
  }

  return data as DbBuild[]
}

/**
 * Update build with Gemini audit results
 */
export async function updateBuildAudit(
  id: string,
  auditComplete: boolean,
  auditChanges: string[] | null,
  updatedCode?: string
): Promise<DbBuild | null> {
  if (!supabaseAdmin) return null

  const updateData: Partial<DbBuild> = {
    audit_complete: auditComplete,
    audit_changes: auditChanges,
  }

  if (updatedCode) {
    updateData.full_code = updatedCode
  }

  const { data, error } = await supabaseAdmin
    .from('builds')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating build audit:', error)
    return null
  }

  return data as DbBuild
}

/**
 * Update build with deployment URL
 */
export async function updateBuildDeployment(
  id: string,
  deployedUrl: string
): Promise<DbBuild | null> {
  if (!supabaseAdmin) return null

  const { data, error } = await supabaseAdmin
    .from('builds')
    .update({ deployed_url: deployedUrl })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating build deployment:', error)
    return null
  }

  return data as DbBuild
}
