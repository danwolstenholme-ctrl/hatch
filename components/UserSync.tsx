'use client'

import { useEffect } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import { createClerkSupabaseClient } from '@/lib/supabase'

export default function UserSync() {
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !user) return

      try {
        // Note: Requires "supabase" JWT template in Clerk dashboard
        // If template doesn't exist, silently skip sync
        const token = await getToken({ template: 'supabase' }).catch(() => null)
        if (!token) return

        const supabase = createClerkSupabaseClient(token)

        const { error } = await supabase
          .from('users')
          .upsert({
            id: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            full_name: user.fullName,
            avatar_url: user.imageUrl,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          })

        if (error) {
          console.error('Error syncing user to Supabase:', error)
        }
      } catch (err) {
        // Silently fail - user sync is not critical
        console.debug('User sync skipped:', err)
      }
    }

    syncUser()
  }, [isLoaded, user, getToken])

  return null
}
