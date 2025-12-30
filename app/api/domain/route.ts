import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { AccountSubscription } from '@/types/subscriptions'

// Helper to check if user has active account subscription
async function isPaidUser(userId: string): Promise<boolean> {
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const accountSubscription = user.publicMetadata?.accountSubscription as AccountSubscription | undefined
    return accountSubscription?.status === 'active'
  } catch {
    return false
  }
}

// Helper to verify project ownership
async function verifyProjectOwnership(userId: string, projectSlug: string): Promise<boolean> {
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const deployedProjects = user.publicMetadata?.deployedProjects as Array<{slug: string}> | undefined
    return deployedProjects?.some(p => p.slug === projectSlug) ?? false
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    let body: { domain?: string; projectSlug?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 })
    }
    
    const { domain, projectSlug } = body

    if (!domain || !projectSlug) {
      return NextResponse.json({ success: false, error: 'Missing domain or project' }, { status: 400 })
    }
    
    // Validate projectSlug format (prevent path injection)
    const safeProjectSlug = projectSlug.replace(/[^a-z0-9-]/gi, '')
    if (safeProjectSlug !== projectSlug || projectSlug.length > 100) {
      return NextResponse.json({ success: false, error: 'Invalid project slug' }, { status: 400 })
    }

    // Check if user has an active subscription
    if (!await isPaidUser(userId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Pro subscription required for custom domains',
        requiresUpgrade: true 
      }, { status: 403 })
    }
    
    // Verify project ownership
    if (!await verifyProjectOwnership(userId, projectSlug)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Project not found or not owned by you' 
      }, { status: 403 })
    }

    // Clean the domain
    const cleanDomain = domain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim()
    
    // Validate domain length
    if (cleanDomain.length > 253 || cleanDomain.length < 3) {
      return NextResponse.json({ success: false, error: 'Invalid domain length' }, { status: 400 })
    }

    // Project name matches the slug used in deploy (no prefix)
    const projectName = projectSlug

    // Add domain to Vercel project
    const vercelResponse = await fetch(`https://api.vercel.com/v10/projects/${projectName}/domains`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: cleanDomain,
      }),
    })

    const data = await vercelResponse.json()

    if (!vercelResponse.ok) {
      console.error('Vercel domain error:', data)
      
      // Handle specific error cases
      if (data.error?.code === 'domain_already_in_use') {
        return NextResponse.json({ 
          success: false, 
          error: 'This domain is already connected to another project' 
        }, { status: 400 })
      }
      
      if (data.error?.code === 'invalid_domain') {
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid domain format' 
        }, { status: 400 })
      }

      return NextResponse.json({ 
        success: false, 
        error: data.error?.message || 'Failed to add domain' 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      domain: cleanDomain,
      verified: data.verified || false,
      verification: data.verification || null,
    })

  } catch (error) {
    console.error('Domain API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// Check domain verification status
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')
    const projectSlug = searchParams.get('projectSlug')

    if (!domain || !projectSlug) {
      return NextResponse.json({ success: false, error: 'Missing domain or project' }, { status: 400 })
    }
    
    // Validate projectSlug format
    const safeProjectSlug = projectSlug.replace(/[^a-z0-9-]/gi, '')
    if (safeProjectSlug !== projectSlug) {
      return NextResponse.json({ success: false, error: 'Invalid project slug' }, { status: 400 })
    }
    
    // Verify project ownership
    if (!await verifyProjectOwnership(userId, projectSlug)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Project not found or not owned by you' 
      }, { status: 403 })
    }

    const projectName = projectSlug

    const vercelResponse = await fetch(
      `https://api.vercel.com/v9/projects/${projectName}/domains/${domain}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
        },
      }
    )

    const data = await vercelResponse.json()

    if (!vercelResponse.ok) {
      return NextResponse.json({ 
        success: false, 
        error: data.error?.message || 'Failed to check domain' 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      verified: data.verified || false,
      domain: data.name,
    })

  } catch (error) {
    console.error('Domain check error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}