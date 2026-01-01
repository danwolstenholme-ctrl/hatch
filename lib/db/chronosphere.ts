import { supabaseAdmin, StyleDNA } from '../supabase'

// =============================================================================
// THE CHRONOSPHERE (USER STYLE DNA)
// =============================================================================

const DEFAULT_DNA: StyleDNA = {
  vibe_keywords: [],
  preferred_colors: [],
  preferred_fonts: [],
  rejected_patterns: [],
  evolution_stage: 1,
  last_updated: new Date().toISOString()
}

/**
 * Get the user's Style DNA
 */
export async function getUserDNA(userId: string): Promise<StyleDNA> {
  if (!supabaseAdmin) return DEFAULT_DNA

  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('style_dna')
      .eq('id', userId)
      .single()

    // If column doesn't exist or other error, just return default
    if (error || !data) {
      // Don't log "column does not exist" errors - expected until migration
      if (!error?.message?.includes('does not exist')) {
        console.warn('Failed to fetch user DNA:', error)
      }
      return DEFAULT_DNA
    }

    return (data.style_dna as StyleDNA) || DEFAULT_DNA
  } catch {
    return DEFAULT_DNA
  }
}

/**
 * Update the user's Style DNA
 */
export async function updateUserDNA(userId: string, dna: StyleDNA): Promise<void> {
  if (!supabaseAdmin) return

  try {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ style_dna: dna })
      .eq('id', userId)

    // Silently fail if column doesn't exist yet
    if (error && !error.message?.includes('does not exist')) {
      console.error('Failed to update user DNA:', error)
    }
  } catch {
    // Silently fail
  }
}
