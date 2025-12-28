import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover',
})

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectSlug, projectName } = await req.json()

    if (!projectSlug) {
      return NextResponse.json({ error: 'Project slug required' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          // $19/month recurring subscription
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
        {
          // $30 one-time setup fee (early bird)
          price: process.env.STRIPE_SETUP_FEE_ID!,
          quantity: 1,
        },
      ],
      // Allow promo codes at checkout (Golden Ticket, etc.)
      allow_promotion_codes: true,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/builder?success=true&project=${encodeURIComponent(projectSlug)}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/builder?canceled=true`,
      metadata: {
        userId,
        projectSlug,
        projectName: projectName || projectSlug,
        type: 'site_subscription',
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}