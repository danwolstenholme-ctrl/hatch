import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
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

// Price IDs for each tier
const PRICE_IDS = {
  architect: process.env.STRIPE_ARCHITECT_PRICE_ID,    // $19/mo
  visionary: process.env.STRIPE_VISIONARY_PRICE_ID,    // $49/mo
  singularity: process.env.STRIPE_SINGULARITY_PRICE_ID, // $199/mo
} as const

type PriceTier = keyof typeof PRICE_IDS

async function handleCheckout(
  userId: string, 
  tier: PriceTier, 
  projectSlug: string = '', 
  projectName: string = '',
  reqUrl: string
): Promise<{ url?: string, error?: string, status?: number, redirect?: string }> {
  const stripe = getStripe()
  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const existingSubscription = user.publicMetadata?.accountSubscription as AccountSubscription | null

  // Check for existing active subscription
  if (existingSubscription?.status === 'active') {
    if (existingSubscription!.tier === tier) {
      return { redirect: '/dashboard/studio?error=already_subscribed' }
    }

    // Block downgrades through this endpoint
    const tierRank = { architect: 1, visionary: 2, singularity: 3 } as const
    // @ts-ignore
    if (tierRank[tier] < tierRank[existingSubscription!.tier]) {
      return { redirect: '/dashboard/studio?error=downgrade_not_allowed' }
    }

    // Upgrade path
    try {
      const subscription = await stripe.subscriptions.retrieve(existingSubscription.stripeSubscriptionId)
      const priceId = PRICE_IDS[tier]
      if (!priceId) throw new Error(`Price ID not configured for ${tier} tier`)

      const firstItem = subscription.items.data[0]
      if (!firstItem?.id) throw new Error('Unable to update subscription items for upgrade')

      const updated = await stripe.subscriptions.update(existingSubscription.stripeSubscriptionId, {
        items: [{ id: firstItem.id, price: priceId }],
        proration_behavior: 'create_prorations',
        metadata: { userId, tier, type: 'account_subscription' },
      })

      // Update Clerk metadata immediately (optimistic)
      const periodEndSeconds = (updated as any)?.current_period_end ?? Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
      const periodEnd = periodEndSeconds * 1000
      const accountSubscription: AccountSubscription = {
        tier: tier as AccountSubscription['tier'],
        stripeSubscriptionId: existingSubscription.stripeSubscriptionId,
        stripeCustomerId: existingSubscription.stripeCustomerId,
        status: updated.status === 'active' ? 'active' : 'past_due',
        currentPeriodEnd: new Date(periodEnd).toISOString(),
        createdAt: existingSubscription.createdAt || new Date().toISOString(),
      }

      await client.users.updateUser(userId, {
        publicMetadata: { ...user.publicMetadata, accountSubscription },
      })

      return { redirect: '/dashboard/studio?success=upgraded' }
    } catch (err) {
      console.error('Stripe upgrade error:', err)
      return { redirect: '/dashboard/studio?error=upgrade_failed' }
    }
  }

  // New Subscription
  const priceId = PRICE_IDS[tier]
  if (!priceId) {
    return { error: `Price ID not configured for ${tier} tier`, status: 500 }
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/post-payment?session_id={CHECKOUT_SESSION_ID}&tier=${tier}${projectSlug ? `&project=${encodeURIComponent(projectSlug)}` : ''}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/studio?canceled=true`,
    metadata: { userId, tier, projectSlug, projectName, type: 'account_subscription' },
    subscription_data: { metadata: { userId, tier, type: 'account_subscription' } },
  })

  if (session.url) {
    return { url: session.url }
  } else {
    return { error: 'Failed to create checkout session', status: 500 }
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const searchParams = req.nextUrl.searchParams
    const priceIdParam = searchParams.get('priceId')
    const tierParam = searchParams.get('tier')
    
    let tier: PriceTier | undefined
    if (tierParam && ['architect', 'visionary', 'singularity'].includes(tierParam)) {
      tier = tierParam as PriceTier
    } else if (priceIdParam === 'price_architect') tier = 'architect'
    else if (priceIdParam === 'price_visionary') tier = 'visionary'
    else if (priceIdParam === 'price_singularity') tier = 'singularity'
    
    if (!tier) return NextResponse.json({ error: 'Invalid tier or price ID' }, { status: 400 })

    const projectSlug = searchParams.get('projectSlug') || ''
    const projectName = searchParams.get('projectName') || ''

    const result = await handleCheckout(userId, tier, projectSlug, projectName, req.url)

    if (result.redirect) return NextResponse.redirect(new URL(result.redirect, req.url))
    if (result.url) return NextResponse.redirect(result.url)
    return NextResponse.json({ error: result.error }, { status: result.status || 500 })

  } catch (error) {
    console.error('Checkout GET error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { tier, projectSlug, projectName } = body

    if (!tier || !['architect', 'visionary', 'singularity'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    const result = await handleCheckout(userId, tier as PriceTier, projectSlug, projectName, req.url)

    if (result.redirect) return NextResponse.json({ url: new URL(result.redirect, req.url).toString() })
    if (result.url) return NextResponse.json({ url: result.url })
    return NextResponse.json({ error: result.error }, { status: result.status || 500 })

  } catch (error) {
    console.error('Checkout POST error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
