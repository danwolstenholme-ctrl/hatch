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
  lite: process.env.STRIPE_LITE_PRICE_ID,    // $9/mo
  pro: process.env.STRIPE_PRO_PRICE_ID,      // $29/mo
  agency: process.env.STRIPE_AGENCY_PRICE_ID, // $99/mo
} as const

type PriceTier = keyof typeof PRICE_IDS

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe()
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse body once
    let body: { tier?: string; projectSlug?: string; projectName?: string }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    
    const { tier, projectSlug, projectName } = body

    // Validate tier early
    if (!tier || !['lite', 'pro', 'agency'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier. Must be "lite", "pro" or "agency"' }, { status: 400 })
    }

    // Check if user already has an active subscription
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const existingSubscription = user.publicMetadata?.accountSubscription as AccountSubscription | null
    
    if (existingSubscription?.status === 'active') {
      if (existingSubscription.tier === tier) {
        return NextResponse.json({ 
          error: 'You already have an active subscription to this tier',
          existingTier: existingSubscription.tier,
          currentPeriodEnd: existingSubscription.currentPeriodEnd
        }, { status: 400 })
      }

      // Block downgrades through this endpoint (handle via support/portal)
      const tierRank = { lite: 1, pro: 2, agency: 3 } as const
      if (tierRank[tier as keyof typeof tierRank] < tierRank[existingSubscription.tier]) {
        return NextResponse.json({
          error: 'Downgrades are not available in-app. Contact support to downgrade.',
          existingTier: existingSubscription.tier,
        }, { status: 400 })
      }

      // Upgrade path: update existing Stripe subscription instead of creating a new one
      try {
        const subscription = await stripe.subscriptions.retrieve(existingSubscription.stripeSubscriptionId)
        const priceId = PRICE_IDS[tier as PriceTier]
        if (!priceId) {
          return NextResponse.json({ error: `Price ID not configured for ${tier} tier` }, { status: 500 })
        }

        const firstItem = subscription.items.data[0]
        if (!firstItem?.id) {
          return NextResponse.json({ error: 'Unable to update subscription items for upgrade' }, { status: 500 })
        }

        const updated = await stripe.subscriptions.update(existingSubscription.stripeSubscriptionId, {
          items: [{ id: firstItem.id, price: priceId }],
          proration_behavior: 'create_prorations',
          metadata: { userId, tier, type: 'account_subscription' },
        })

        const periodEnd = (updated.current_period_end || Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60) * 1000
        const accountSubscription: AccountSubscription = {
          tier: tier as AccountSubscription['tier'],
          stripeSubscriptionId: existingSubscription.stripeSubscriptionId,
          stripeCustomerId: existingSubscription.stripeCustomerId,
          status: updated.status === 'active' ? 'active' : 'past_due',
          currentPeriodEnd: new Date(periodEnd).toISOString(),
          createdAt: existingSubscription.createdAt || new Date().toISOString(),
        }

        await client.users.updateUser(userId, {
          publicMetadata: {
            ...user.publicMetadata,
            accountSubscription,
          },
        })

        return NextResponse.json({ upgraded: true, tier, currentPeriodEnd: accountSubscription.currentPeriodEnd })
      } catch (err) {
        console.error('Stripe upgrade error:', err)
        return NextResponse.json({ error: 'Failed to upgrade subscription' }, { status: 500 })
      }
    }

    const priceId = PRICE_IDS[tier as PriceTier]
    if (!priceId) {
      return NextResponse.json({ error: `Price ID not configured for ${tier} tier` }, { status: 500 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Allow promo codes at checkout
      allow_promotion_codes: true,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/welcome?tier=${tier}${projectSlug ? `&project=${encodeURIComponent(projectSlug)}` : ''}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/builder?canceled=true`,
      metadata: {
        userId,
        tier,
        projectSlug: projectSlug || '',
        projectName: projectName || projectSlug || '',
        type: 'account_subscription',
      },
      // Also store userId in subscription metadata for webhook events
      subscription_data: {
        metadata: {
          userId,
          tier,
          type: 'account_subscription',
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}