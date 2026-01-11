import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import Stripe from 'stripe'

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
  })
}

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await currentUser()
    const accountSubscription = user?.publicMetadata?.accountSubscription as {
      stripeCustomerId?: string
      stripeSubscriptionId?: string
    } | undefined

    if (!accountSubscription?.stripeSubscriptionId) {
      return NextResponse.json({ error: 'No subscription' }, { status: 404 })
    }

    // Fetch subscription from Stripe
    const stripe = getStripe()
    const subscription = await stripe.subscriptions.retrieve(accountSubscription.stripeSubscriptionId)
    
    // Get payment method
    let paymentMethod = null
    if (subscription.default_payment_method) {
      const pm = await stripe.paymentMethods.retrieve(
        typeof subscription.default_payment_method === 'string' 
          ? subscription.default_payment_method 
          : subscription.default_payment_method.id
      )
      paymentMethod = {
        brand: pm.card?.brand,
        last4: pm.card?.last4
      }
    }

    return NextResponse.json({
      currentPeriodEnd: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      status: subscription.status,
      paymentMethod
    })
  } catch (error) {
    console.error('Error fetching billing info:', error)
    return NextResponse.json({ error: 'Failed to fetch billing info' }, { status: 500 })
  }
}
