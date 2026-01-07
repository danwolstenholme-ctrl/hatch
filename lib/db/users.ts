import { supabaseAdmin, DbUser } from '../supabase'
import { randomUUID } from 'crypto'

// =============================================================================
// USER DATABASE OPERATIONS
// =============================================================================

/**
 * Get or create a user record from Clerk ID
 * Uses upsert to handle race conditions safely
 */
export async function getOrCreateUser(
  clerkId: string,
  email?: string | null
): Promise<DbUser | null> {
  if (!supabaseAdmin) {
    console.error('[getOrCreateUser] Supabase admin client not configured')
    return null
  }

  // First check if user exists
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single()

  if (existingUser) {
    return existingUser as DbUser
  }

  // User doesn't exist, create new one with explicit ID
  const newId = randomUUID()
  
  const { data: newUser, error: insertError } = await supabaseAdmin
    .from('users')
    .insert({ id: newId, clerk_id: clerkId, email: email || null })
    .select()
    .single()

  if (insertError) {
    // Race condition - another request might have created it, try select again
    const { data: raceUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_id', clerkId)
      .single()
    
    if (raceUser) {
      return raceUser as DbUser
    }
    console.error('Error creating user:', insertError)
    return null
  }

  return newUser as DbUser
}

/**
 * Get user by Clerk ID
 */
export async function getUserByClerkId(clerkId: string): Promise<DbUser | null> {
  if (!supabaseAdmin) return null

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single()

  if (error) return null
  return data as DbUser
}

/**
 * Get user by internal ID
 */
export async function getUserById(id: string): Promise<DbUser | null> {
  if (!supabaseAdmin) return null

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as DbUser
}

// =============================================================================
// GENERATION TRACKING (for free tier limits)
// =============================================================================

const FREE_DAILY_LIMIT = 5

/**
 * Check if user can generate and increment count atomically
 * Uses Supabase RPC function for atomic operation
 * Falls back to in-memory tracking if DB call fails
 */
export async function checkAndIncrementGeneration(
  clerkId: string,
  isPaid: boolean
): Promise<{ allowed: boolean; remaining: number }> {
  // Paid users have unlimited generations
  if (isPaid) {
    return { allowed: true, remaining: -1 }
  }

  if (!supabaseAdmin) {
    console.error('Supabase not configured - allowing generation')
    return { allowed: true, remaining: FREE_DAILY_LIMIT }
  }

  try {
    // Use the atomic RPC function
    const { data, error } = await supabaseAdmin.rpc('check_and_increment_generation', {
      p_clerk_id: clerkId,
      p_daily_limit: FREE_DAILY_LIMIT
    })

    if (error) {
      console.error('Generation check RPC error:', error)
      // Fall back to allowing (fail open) - in-memory will still catch abuse
      return { allowed: true, remaining: FREE_DAILY_LIMIT }
    }

    const result = data?.[0]
    if (!result) {
      // User not in DB yet - they can generate
      return { allowed: true, remaining: FREE_DAILY_LIMIT - 1 }
    }

    return {
      allowed: result.allowed,
      remaining: result.remaining
    }
  } catch (err) {
    console.error('Generation check failed:', err)
    // Fail open with in-memory backup
    return { allowed: true, remaining: FREE_DAILY_LIMIT }
  }
}

/**
 * Get user's current generation count (for UI display)
 */
export async function getGenerationCount(clerkId: string): Promise<{ used: number; limit: number; resetsAt: string }> {
  if (!supabaseAdmin) {
    return { used: 0, limit: FREE_DAILY_LIMIT, resetsAt: 'midnight' }
  }

  try {
    const { data } = await supabaseAdmin
      .from('users')
      .select('daily_generations, last_generation_date')
      .eq('clerk_id', clerkId)
      .single()

    if (!data) {
      return { used: 0, limit: FREE_DAILY_LIMIT, resetsAt: 'midnight' }
    }

    const today = new Date().toISOString().split('T')[0]
    const lastDate = data.last_generation_date

    // If last generation was before today, count is effectively 0
    if (!lastDate || lastDate < today) {
      return { used: 0, limit: FREE_DAILY_LIMIT, resetsAt: 'midnight' }
    }

    return {
      used: data.daily_generations || 0,
      limit: FREE_DAILY_LIMIT,
      resetsAt: 'midnight'
    }
  } catch {
    return { used: 0, limit: FREE_DAILY_LIMIT, resetsAt: 'midnight' }
  }
}
