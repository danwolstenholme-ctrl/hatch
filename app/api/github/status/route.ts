import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

// =============================================================================
// GITHUB STATUS - Check if user has GitHub connected
// =============================================================================

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ connected: false })
  }

  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const githubUsername = user.publicMetadata?.githubUsername as string | undefined
    const githubData = user.privateMetadata?.github as { accessToken?: string } | undefined

    if (!githubData?.accessToken || !githubUsername) {
      return NextResponse.json({ connected: false })
    }

    // Verify token is still valid
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${githubData.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) {
      return NextResponse.json({ connected: false, expired: true })
    }

    return NextResponse.json({ 
      connected: true, 
      username: githubUsername 
    })
  } catch {
    return NextResponse.json({ connected: false })
  }
}
