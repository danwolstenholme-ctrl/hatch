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
  pro: process.env.STRIPE_PRO_PRICE_ID,      // $39/mo
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
      
      if (existingSubscription.tier === 'agency') {
        return NextResponse.json({ 
          error: 'You already have the Agency tier - the highest tier available',
          existingTier: 'agency'
        }, { status: 400 })
      }
      
      // Allow Pro -> Agency upgrade (will be handled below)
    }

    // Validate tier
    if (!tier || !['pro', 'agency'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier. Must be "pro" or "agency"' }, { status: 400 })
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