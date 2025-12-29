import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { clerkClient } from '@clerk/nextjs/server'
import { track } from '@vercel/analytics/server'
import type { User } from '@clerk/nextjs/server'
import { AccountSubscription } from '@/types/subscriptions'

// Legacy site subscription type (for backwards compatibility with existing users)
interface SiteSubscription {
  projectSlug: string
  projectName: string
  stripeSubscriptionId: string
  status: 'active' | 'canceled' | 'past_due'
  createdAt: string
}

// Lazy initialization to prevent build-time errors when env vars are missing
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
  })
}

/**
 * Find a Clerk user by userId (direct) or stripeCustomerId (fallback search)
 * Prefers direct lookup when userId is available from subscription metadata
 */
async function findUserByStripeInfo(
  userId: string | undefined,
  customerId: string
): Promise<User | null> {
  const client = await clerkClient()
  
  // Prefer direct lookup if we have userId (for new subscriptions with metadata)
  if (userId) {
    try {
      return await client.users.getUser(userId)
    } catch {
      console.warn(`Direct user lookup failed for ${userId}, falling back to search`)
    }
  }
  
  // Fallback: search by stripeCustomerId (for legacy subscriptions)
  // Note: This is O(n) and will break at scale. New subscriptions should always have userId in metadata.
  const allUsers = await client.users.getUserList({ limit: 100 })
  return allUsers.data.find(u => u.publicMetadata?.stripeCustomerId === customerId) || null
}

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // ==========================================================================
  // CHECKOUT COMPLETED
  // ==========================================================================
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId
    const metadataType = session.metadata?.type

    // ------------------------------------------------------------------------
    // DOMAIN PURCHASE (one-time payment)
    // ------------------------------------------------------------------------
    if (metadataType === 'domain_purchase') {
      const domain = session.metadata?.domain
      const projectSlug = session.metadata?.projectSlug

      if (domain && projectSlug) {
        try {
          // Buy domain via Vercel API
          const buyResponse = await fetch('https://api.vercel.com/v4/domains/buy', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: domain }),
          })

          if (buyResponse.ok) {
            console.log(`Domain ${domain} purchased successfully`)

            // Add domain to the user's project
            const addResponse = await fetch(`https://api.vercel.com/v10/projects/${projectSlug}/domains`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ name: domain }),
            })

            if (addResponse.ok) {
              console.log(`Domain ${domain} added to project ${projectSlug}`)
            } else {
              console.error(`Failed to add domain to project:`, await addResponse.json())
            }
          } else {
            console.error(`Failed to buy domain ${domain}:`, await buyResponse.json())
          }
        } catch (err) {
          console.error('Domain purchase error:', err)
        }
      }
      return NextResponse.json({ received: true })
    }

    // ------------------------------------------------------------------------
    // ACCOUNT SUBSCRIPTION (Pro or Agency) - NEW!
    // ------------------------------------------------------------------------
    if (metadataType === 'account_subscription' && userId) {
      const tier = session.metadata?.tier as 'pro' | 'agency'
      const subscriptionId = session.subscription as string
      const customerId = session.customer as string

      if (tier && subscriptionId) {
        try {
          const stripe = getStripe()
          const client = await clerkClient()
          const user = await client.users.getUser(userId)
          
          // Get subscription details for period end
          const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId)
          const periodEnd = (subscriptionResponse as unknown as { current_period_end: number }).current_period_end
          
          const accountSubscription: AccountSubscription = {
            tier,
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: customerId,
            status: 'active',
            currentPeriodEnd: new Date(periodEnd * 1000).toISOString(),
            createdAt: new Date().toISOString(),
          }

          await client.users.updateUser(userId, {
            publicMetadata: {
              ...user.publicMetadata,
              stripeCustomerId: customerId,
              accountSubscription,
              // Reset refinement count on new subscription
              opusRefinementsUsed: 0,
              opusRefinementsResetDate: new Date(periodEnd * 1000).toISOString(),
            },
          })

          console.log(`✅ Account subscription created: ${tier} for user ${userId}`)
          
          // Track subscription event
          await track('Account Subscription Created', { tier })
        } catch (err) {
          console.error('Failed to create account subscription:', err)
        }
      }
      return NextResponse.json({ received: true })
    }
  }

  // ==========================================================================
  // SUBSCRIPTION DELETED (Canceled)
  // ==========================================================================
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const subscriptionId = subscription.id
    const customerId = subscription.customer as string
    const userId = subscription.metadata?.userId
    
    console.log(`Subscription ${subscriptionId} canceled for customer: ${customerId}, userId: ${userId || 'unknown'}`)

    try {
      const client = await clerkClient()
      const user = await findUserByStripeInfo(userId, customerId)

      if (user) {
        const accountSub = user.publicMetadata?.accountSubscription as AccountSubscription | undefined
        const existingSubscriptions = (user.publicMetadata?.subscriptions as SiteSubscription[]) || []
        
        // Check if this is the account subscription
        if (accountSub?.stripeSubscriptionId === subscriptionId) {
          // Remove account subscription
          await client.users.updateUser(user.id, {
            publicMetadata: {
              ...user.publicMetadata,
              accountSubscription: null,
            },
          })
          console.log(`✅ Removed account subscription (${accountSub.tier}) for user ${user.id}`)
        } else {
          // Legacy: Check site subscriptions
          const canceledSub = existingSubscriptions.find(s => s.stripeSubscriptionId === subscriptionId)
          
          if (canceledSub) {
            const updatedSubscriptions = existingSubscriptions.filter(
              s => s.stripeSubscriptionId !== subscriptionId
            )

            await client.users.updateUser(user.id, {
              publicMetadata: {
                ...user.publicMetadata,
                subscriptions: updatedSubscriptions,
              },
            })

            console.log(`Removed legacy site subscription for project ${canceledSub.projectSlug} from user ${user.id}`)

            // Delete the deployed project from Vercel
            const vercelToken = process.env.VERCEL_TOKEN
            if (vercelToken && canceledSub.projectSlug) {
              try {
                const deleteResponse = await fetch(
                  `https://api.vercel.com/v9/projects/${canceledSub.projectSlug}`,
                  {
                    method: 'DELETE',
                    headers: {
                      'Authorization': `Bearer ${vercelToken}`,
                    },
                  }
                )

                if (deleteResponse.ok) {
                  console.log(`Deleted Vercel project: ${canceledSub.projectSlug}`)
                } else {
                  console.error(`Failed to delete Vercel project ${canceledSub.projectSlug}:`, deleteResponse.status)
                }
              } catch (err) {
                console.error(`Error deleting Vercel project:`, err)
              }
            }
          }
        }
      } else {
        console.warn(`No user found for customer ${customerId}`)
      }
    } catch (err) {
      console.error('Failed to process subscription cancellation:', err)
    }
  }

  // ==========================================================================
  // PAYMENT FAILED - Mark as past_due
  // ==========================================================================
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice
    const subscriptionId = (invoice as { subscription?: string }).subscription
    const customerId = invoice.customer as string
    
    console.log(`Payment failed for subscription ${subscriptionId}, customer: ${customerId}`)

    if (subscriptionId && customerId) {
      try {
        const stripe = getStripe()
        const client = await clerkClient()
        
        // Try to get userId from subscription metadata
        let userId: string | undefined
        try {
          const sub = await stripe.subscriptions.retrieve(subscriptionId)
          userId = sub.metadata?.userId
        } catch {
          // Subscription might be deleted
        }
        
        const user = await findUserByStripeInfo(userId, customerId)

        if (user) {
          const accountSub = user.publicMetadata?.accountSubscription as AccountSubscription | undefined
          const existingSubscriptions = (user.publicMetadata?.subscriptions as SiteSubscription[]) || []
          
          // Check if this is the account subscription
          if (accountSub?.stripeSubscriptionId === subscriptionId) {
            await client.users.updateUser(user.id, {
              publicMetadata: {
                ...user.publicMetadata,
                accountSubscription: { ...accountSub, status: 'past_due' },
              },
            })
            console.log(`Marked account subscription as past_due for user ${user.id}`)
          } else {
            // Legacy: site subscriptions
            const updatedSubscriptions = existingSubscriptions.map(s => 
              s.stripeSubscriptionId === subscriptionId 
                ? { ...s, status: 'past_due' as const }
                : s
            )

            await client.users.updateUser(user.id, {
              publicMetadata: {
                ...user.publicMetadata,
                subscriptions: updatedSubscriptions,
              },
            })

            console.log(`Marked legacy subscription ${subscriptionId} as past_due for user ${user.id}`)
          }
        }
      } catch (err) {
        console.error('Failed to process payment failure:', err)
      }
    }
  }

  // ==========================================================================
  // PAYMENT SUCCEEDED - Restore to active & reset refinement count
  // ==========================================================================
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice
    const subscriptionId = (invoice as { subscription?: string }).subscription
    const customerId = invoice.customer as string
    
    if (subscriptionId && customerId) {
      try {
        const stripe = getStripe()
        const client = await clerkClient()
        
        // Try to get userId from subscription metadata
        let userId: string | undefined
        try {
          const sub = await stripe.subscriptions.retrieve(subscriptionId)
          userId = sub.metadata?.userId
        } catch {
          // Subscription might be deleted
        }
        
        const user = await findUserByStripeInfo(userId, customerId)

        if (user) {
          const accountSub = user.publicMetadata?.accountSubscription as AccountSubscription | undefined
          const existingSubscriptions = (user.publicMetadata?.subscriptions as SiteSubscription[]) || []
          
          // Check if this is the account subscription
          if (accountSub?.stripeSubscriptionId === subscriptionId) {
            // Get new period end
            const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId)
            const periodEnd = (subscriptionResponse as unknown as { current_period_end: number }).current_period_end
            
            await client.users.updateUser(user.id, {
              publicMetadata: {
                ...user.publicMetadata,
                accountSubscription: { 
                  ...accountSub, 
                  status: 'active',
                  currentPeriodEnd: new Date(periodEnd * 1000).toISOString(),
                },
                // Reset Opus refinement count for new billing period
                opusRefinementsUsed: 0,
                opusRefinementsResetDate: new Date(periodEnd * 1000).toISOString(),
              },
            })
            console.log(`✅ Renewed account subscription for user ${user.id}, reset refinement count`)
          } else {
            // Legacy: site subscriptions
            const hasChange = existingSubscriptions.some(s => 
              s.stripeSubscriptionId === subscriptionId && s.status === 'past_due'
            )

            if (hasChange) {
              const updatedSubscriptions = existingSubscriptions.map(s => 
                s.stripeSubscriptionId === subscriptionId && s.status === 'past_due'
                  ? { ...s, status: 'active' as const }
                  : s
              )

              await client.users.updateUser(user.id, {
                publicMetadata: {
                  ...user.publicMetadata,
                  subscriptions: updatedSubscriptions,
                },
              })
              console.log(`Restored legacy subscription ${subscriptionId} to active for user ${user.id}`)
            }
          }
        }
      } catch (err) {
        console.error('Failed to process payment success:', err)
      }
    }
  }

  return NextResponse.json({ received: true })
}
