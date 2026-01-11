import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { AccountSubscription } from '@/types/subscriptions'

// =============================================================================
// CUSTOM DOMAIN - Add/remove custom domain from deployed site
// TIER: Visionary+ (required for custom domains)
// =============================================================================

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check tier - Visionary or higher required for custom domains
  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const accountSub = user.publicMetadata?.accountSubscription as AccountSubscription | undefined

  const hasCustomDomainAccess = ['visionary', 'singularity'].includes(accountSub?.tier || '')

  if (!hasCustomDomainAccess) {
    return NextResponse.json({
      error: 'Custom domains require Visionary tier or higher',
      requiresUpgrade: true,
      requiredTier: 'visionary',
    }, { status: 403 })
  }

  const { domain, projectSlug, action } = await req.json()

  if (!domain || !projectSlug) {
    return NextResponse.json({ error: 'Missing domain or projectSlug' }, { status: 400 })
  }

  // Validate domain format
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i
  if (!domainRegex.test(domain)) {
    return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 })
  }

  // Block adding hatchit.dev subdomains
  if (domain.endsWith('hatchit.dev')) {
    return NextResponse.json({ error: 'Cannot add hatchit.dev domains' }, { status: 400 })
  }

  const vercelToken = process.env.VERCEL_TOKEN
  const teamId = 'team_jFQEvL36dljJxRCn3ekJ9WdF'

  try {
    if (action === 'remove') {
      // Remove domain from project
      const response = await fetch(
        `https://api.vercel.com/v9/projects/${projectSlug}/domains/${domain}?teamId=${teamId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${vercelToken}` },
        }
      )

      if (!response.ok && response.status !== 404) {
        const error = await response.json()
        return NextResponse.json({ error: error.message || 'Failed to remove domain' }, { status: 400 })
      }

      return NextResponse.json({ success: true, removed: true })
    }

    // Add domain to project
    const addResponse = await fetch(
      `https://api.vercel.com/v10/projects/${projectSlug}/domains?teamId=${teamId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: domain }),
      }
    )

    const addResult = await addResponse.json()

    if (!addResponse.ok) {
      return NextResponse.json({ 
        error: addResult.error?.message || 'Failed to add domain',
        code: addResult.error?.code,
      }, { status: 400 })
    }

    // Get verification/configuration info
    const configResponse = await fetch(
      `https://api.vercel.com/v6/domains/${domain}/config?teamId=${teamId}`,
      {
        headers: { Authorization: `Bearer ${vercelToken}` },
      }
    )

    const configResult = await configResponse.json()

    return NextResponse.json({
      success: true,
      domain,
      verified: addResult.verified,
      verification: addResult.verification,
      // DNS configuration instructions
      dns: {
        type: configResult.cnames?.length > 0 ? 'CNAME' : 'A',
        name: domain.startsWith('www.') ? 'www' : '@',
        value: configResult.cnames?.[0] || '76.76.21.21',
        // Alternative A records
        aRecords: ['76.76.21.21'],
      },
    })

  } catch (error) {
    console.error('Domain API error:', error)
    return NextResponse.json({ error: 'Failed to configure domain' }, { status: 500 })
  }
}

// Check domain verification status
export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const domain = req.nextUrl.searchParams.get('domain')
  const projectSlug = req.nextUrl.searchParams.get('projectSlug')

  if (!domain || !projectSlug) {
    return NextResponse.json({ error: 'Missing domain or projectSlug' }, { status: 400 })
  }

  const vercelToken = process.env.VERCEL_TOKEN
  const teamId = 'team_jFQEvL36dljJxRCn3ekJ9WdF'

  try {
    // Check domain status
    const response = await fetch(
      `https://api.vercel.com/v9/projects/${projectSlug}/domains/${domain}?teamId=${teamId}`,
      {
        headers: { Authorization: `Bearer ${vercelToken}` },
      }
    )

    if (!response.ok) {
      return NextResponse.json({ verified: false, exists: false })
    }

    const result = await response.json()

    return NextResponse.json({
      verified: result.verified,
      exists: true,
      verification: result.verification,
    })

  } catch (error) {
    console.error('Domain check error:', error)
    return NextResponse.json({ error: 'Failed to check domain' }, { status: 500 })
  }
}
