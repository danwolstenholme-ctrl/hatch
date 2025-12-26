import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover',
})

// Markup percentage (e.g., 0.20 = 20% markup)
const MARKUP = 0.20

// Type for site subscription
interface SiteSubscription {
  projectSlug: string
  projectName: string
  stripeSubscriptionId: string
  status: 'active' | 'canceled' | 'past_due'
  createdAt: string
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { domain, price, projectSlug } = await request.json()

    if (!domain || !price || !projectSlug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if this specific project has an active subscription
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const subscriptions = (user.publicMetadata?.subscriptions as SiteSubscription[]) || []
    const projectSubscription = subscriptions.find(
      s => s.projectSlug === projectSlug && s.status === 'active'
    )

    if (!projectSubscription) {
      return NextResponse.json({ 
        error: 'Project subscription required to buy domains',
        requiresUpgrade: true 
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
              description: '1 year registration via HatchIt',
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
