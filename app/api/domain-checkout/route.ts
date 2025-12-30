import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import Stripe from 'stripe'
import { AccountSubscription } from '@/types/subscriptions'

// Lazy initialization to prevent build-time errors when env vars are missing
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
  })
}

// Markup percentage (e.g., 0.20 = 20% markup)
const MARKUP = 0.20

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
    const stripe = getStripe()
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: { domain?: string; price?: number; projectSlug?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    
    const { domain, price, projectSlug } = body

    if (!domain || !price || !projectSlug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Validate price is a reasonable number (prevent manipulation)
    if (typeof price !== 'number' || price < 1 || price > 10000) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
    }
    
    // Validate projectSlug format
    const safeProjectSlug = projectSlug.replace(/[^a-z0-9-]/gi, '')
    if (safeProjectSlug !== projectSlug || projectSlug.length > 100) {
      return NextResponse.json({ error: 'Invalid project slug' }, { status: 400 })
    }

    // Check if user has an active account subscription
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const accountSubscription = user.publicMetadata?.accountSubscription as AccountSubscription | undefined

    if (!accountSubscription || accountSubscription.status !== 'active') {
      return NextResponse.json({ 
        error: 'Pro subscription required to buy domains',
        requiresUpgrade: true 
      }, { status: 403 })
    }
    
    // Verify project ownership
    if (!await verifyProjectOwnership(userId, projectSlug)) {
      return NextResponse.json({ 
        error: 'Project not found or not owned by you' 
      }, { status: 403 })
    }

    // Calculate price with markup (price from Vercel is in dollars)
    const priceWithMarkup = Math.ceil(price * (1 + MARKUP) * 100) // Convert to cents

    // Create Stripe checkout session for one-time domain purchase
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Domain: ${domain}`,
              description: '1 year registration via HatchIt.dev',
            },
            unit_amount: priceWithMarkup,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/builder?domain_success=true&domain=${encodeURIComponent(domain)}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/builder?domain_canceled=true`,
      metadata: {
        userId,
        domain,
        projectSlug,
        type: 'domain_purchase',
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Domain checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
  }
}
