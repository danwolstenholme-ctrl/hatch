import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

// =============================================================================
// GITHUB OAUTH CALLBACK - Exchange code for token, store in Clerk
// =============================================================================

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state')

  if (!code || !state) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/builder?error=github_auth_failed`)
  }

  // Decode and validate state
  let stateData: { userId: string; timestamp: number; returnUrl: string }
  try {
    stateData = JSON.parse(Buffer.from(state, 'base64').toString())
    
    // Check state is not expired (5 min)
    if (Date.now() - stateData.timestamp > 5 * 60 * 1000) {
      throw new Error('State expired')
    }
  } catch {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/builder?error=invalid_state`)
  }

  // Verify current user matches state
  const { userId } = await auth()
  if (userId !== stateData.userId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/builder?error=user_mismatch`)
  }

  // Exchange code for access token
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  })

  const tokenData = await tokenResponse.json()

  if (tokenData.error || !tokenData.access_token) {
    console.error('GitHub token error:', tokenData)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/builder?error=token_failed`)
  }

  // Get GitHub user info
  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  })
  const githubUser = await userResponse.json()

  // Store GitHub connection in Clerk metadata
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    
    await client.users.updateUser(userId, {
      privateMetadata: {
        ...user.privateMetadata,
        github: {
          accessToken: tokenData.access_token,
          username: githubUser.login,
          connectedAt: new Date().toISOString(),
        },
      },
      publicMetadata: {
        ...user.publicMetadata,
        githubUsername: githubUser.login,
      },
    })
  } catch (err) {
    console.error('Failed to store GitHub token:', err)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/builder?error=storage_failed`)
  }

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}${stateData.returnUrl}?github=connected`)
}
