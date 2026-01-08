import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

// =============================================================================
// GITHUB DISCONNECT - Remove GitHub connection
// =============================================================================

export async function POST() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)

    // Remove GitHub data from metadata
    const { github, ...restPrivate } = (user.privateMetadata || {}) as Record<string, unknown>
    const { githubUsername, ...restPublic } = (user.publicMetadata || {}) as Record<string, unknown>

    await client.users.updateUser(userId, {
      privateMetadata: restPrivate,
      publicMetadata: restPublic,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to disconnect GitHub:', error)
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
  }
}
