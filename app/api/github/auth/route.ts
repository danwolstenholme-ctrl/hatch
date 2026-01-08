import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// =============================================================================
// GITHUB OAUTH - Initiate authorization flow
// =============================================================================

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: 'GitHub not configured' }, { status: 500 })
  }

  // Store state for CSRF protection
  const state = Buffer.from(JSON.stringify({ 
    userId, 
    timestamp: Date.now(),
    returnUrl: req.nextUrl.searchParams.get('returnUrl') || '/builder'
  })).toString('base64')

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/github/callback`,
    scope: 'repo', // Full repo access to create and push
    state,
  })

  return NextResponse.redirect(`https://github.com/login/oauth/authorize?${params}`)
}
