import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
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

/**
 * GET /api/subscription/sync
 * Syncs subscription status from Stripe to Clerk metadata
 * Useful for recovering from webhook failures
 */
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stripe = getStripe()
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    
    let customerId = user.publicMetadata?.stripeCustomerId as string | undefined
    const existingSubscription = user.publicMetadata?.accountSubscription as AccountSubscription | null
    const userEmail = user.emailAddresses?.[0]?.emailAddress
    
    // Strategy 1: Search subscriptions directly by userId in metadata
    // This handles cases where payment email differs from signup email
    console.log('Searching for subscription with metadata.userId:', userId)
    const subscriptionsByMetadata = await stripe.subscriptions.search({
      query: `metadata["userId"]:"${userId}" AND status:"active"`,
      limit: 1,
    })
    
    if (subscriptionsByMetadata.data[0]) {
      const sub = subscriptionsByMetadata.data[0]
      console.log('Found subscription by userId metadata:', sub.id)
      customerId = sub.customer as string
      
      // Determine tier
      const priceId = sub.items.data[0]?.price?.id
      let tier: 'lite' | 'pro' | 'agency' = 'pro'
      if (priceId === process.env.STRIPE_AGENCY_PRICE_ID) {
        tier = 'agency'
      } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
        tier = 'pro'
      } else if (priceId === process.env.STRIPE_LITE_PRICE_ID) {
        tier = 'lite'
      } else {
        tier = (sub.metadata?.tier as 'lite' | 'pro' | 'agency') || 'pro'
      }
      
      // Safely get period end - cast to access property (search API types differ)
      const subData = sub as unknown as { current_period_end?: number }
      const periodEnd = subData.current_period_end || Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
      const periodEndDate = new Date(periodEnd * 1000)
      
      const accountSubscription: AccountSubscription = {
        tier,
        stripeSubscriptionId: sub.id,
        stripeCustomerId: customerId,
        status: 'active',
        currentPeriodEnd: periodEndDate.toISOString(),
        createdAt: new Date().toISOString(),
      }
      
      await client.users.updateUser(userId, {
        publicMetadata: {
          ...user.publicMetadata,
          stripeCustomerId: customerId,
          accountSubscription,
          opusRefinementsUsed: 0,
          opusRefinementsResetDate: periodEndDate.toISOString(),
        },
      })
      
      return NextResponse.json({
        synced: true,
        message: `Successfully synced ${tier} subscription (found by userId)`,
        subscription: accountSubscription
      })
    }
    
    // Strategy 2: If no customer ID, try to find by email
    if (!customerId && userEmail) {
      console.log('No stripeCustomerId, searching by email:', userEmail)
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      })
      if (customers.data[0]) {
        customerId = customers.data[0].id
        console.log('Found customer by email:', customerId)
      }
    }
    
    // If still no customer ID, can't sync
    if (!customerId) {
      return NextResponse.json({ 
        synced: false,
        message: 'No Stripe subscription found for this account. Make sure the subscription metadata contains your userId.',
        subscription: null
      })
    }

    // Look up active subscriptions for this customer
    let activeSubscription: Stripe.Subscription | null = null
    
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    })
    activeSubscription = subscriptions.data[0] || null

    // If no active subscription found, clear the metadata
    if (!activeSubscription) {
      if (existingSubscription) {
        await client.users.updateUser(userId, {
          publicMetadata: {
            ...user.publicMetadata,
            accountSubscription: null,
          },
        })
        return NextResponse.json({
          synced: true,
          message: 'Subscription expired or canceled. Cleared from metadata.',
          subscription: null
        })
      }
      return NextResponse.json({
        synced: false,
        message: 'No active subscription found in Stripe.',
        subscription: null
      })
    }

    // Determine tier from price ID
    const priceId = activeSubscription.items.data[0]?.price?.id
    let tier: 'pro' | 'agency' = 'pro'
    
    if (priceId === process.env.STRIPE_AGENCY_PRICE_ID) {
      tier = 'agency'
    } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
      tier = 'pro'
    } else {
      // Fallback: check metadata
      tier = (activeSubscription.metadata?.tier as 'pro' | 'agency') || 'pro'
    }

    // Safely get period end - cast to access property
    const subData = activeSubscription as unknown as { current_period_end?: number }
    const periodEnd = subData.current_period_end || Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
    const periodEndDate = new Date(periodEnd * 1000)

    const accountSubscription: AccountSubscription = {
      tier,
      stripeSubscriptionId: activeSubscription.id,
      stripeCustomerId: customerId || activeSubscription.customer as string,
      status: 'active',
      currentPeriodEnd: periodEndDate.toISOString(),
      createdAt: existingSubscription?.createdAt || new Date().toISOString(),
    }

    // Update user metadata
    await client.users.updateUser(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        stripeCustomerId: accountSubscription.stripeCustomerId,
        accountSubscription,
      },
    })

    return NextResponse.json({
      synced: true,
      message: `Successfully synced ${tier} subscription`,
      subscription: accountSubscription
    })

  } catch (error) {
    console.error('Subscription sync error:', error)
    return NextResponse.json({ 
      error: 'Failed to sync subscription',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
