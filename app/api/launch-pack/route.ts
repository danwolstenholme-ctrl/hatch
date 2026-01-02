import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import Stripe from 'stripe'
import { AccountSubscription } from '@/types/subscriptions'

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
  })
}

// One-time launch pack (e.g., $199) available post-purchase
const LAUNCH_PACK_PRICE_ID = process.env.STRIPE_LAUNCH_PACK_PRICE_ID

export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!LAUNCH_PACK_PRICE_ID) {
      return NextResponse.json({ error: 'Launch pack price ID is not configured' }, { status: 500 })
    }

    const stripe = getStripe()
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const accountSubscription = user.publicMetadata?.accountSubscription as AccountSubscription | undefined

    // Only offer to paying users to keep it post-purchase
    if (!accountSubscription || accountSubscription.status !== 'active') {
      return NextResponse.json({ error: 'Active subscription required for the launch pack' }, { status: 403 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: LAUNCH_PACK_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/post-payment?launch_pack=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/post-payment?launch_pack=cancelled`,
      metadata: {
        userId,
        type: 'launch_pack',
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Launch pack checkout error:', error)
    return NextResponse.json({ error: 'Failed to create launch pack checkout' }, { status: 500 })
  }
}
