import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { clerkClient } from '@clerk/nextjs/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover',
})

// Type for site subscription
interface SiteSubscription {
  projectSlug: string
  projectName: string
  stripeSubscriptionId: string
  status: 'active' | 'canceled' | 'past_due'
  createdAt: string
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
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId
    const metadataType = session.metadata?.type

    // Handle domain purchase (one-time payment)
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

    // Handle site subscription purchase
    if (metadataType === 'site_subscription' && userId) {
      const projectSlug = session.metadata?.projectSlug
      const projectName = session.metadata?.projectName || projectSlug
      const subscriptionId = session.subscription as string

      if (projectSlug && subscriptionId) {
        try {
          const client = await clerkClient()
          const user = await client.users.getUser(userId)
          
          // Get existing subscriptions array or create new one
          const existingSubscriptions = (user.publicMetadata?.subscriptions as SiteSubscription[]) || []
          
          // Check if this project already has a subscription
          const existingIndex = existingSubscriptions.findIndex(s => s.projectSlug === projectSlug)
          
          const newSubscription: SiteSubscription = {
            projectSlug,
            projectName: projectName || projectSlug,
            stripeSubscriptionId: subscriptionId,
            status: 'active',
            createdAt: new Date().toISOString(),
          }

          let updatedSubscriptions: SiteSubscription[]
          if (existingIndex >= 0) {
            // Update existing subscription
            updatedSubscriptions = [...existingSubscriptions]
            updatedSubscriptions[existingIndex] = newSubscription
          } else {
            // Add new subscription
            updatedSubscriptions = [...existingSubscriptions, newSubscription]
          }

          await client.users.updateUser(userId, {
            publicMetadata: {
              ...user.publicMetadata,
              stripeCustomerId: session.customer,
              subscriptions: updatedSubscriptions,
            },
          })

          console.log(`Added subscription for project ${projectSlug} for user ${userId}`)
        } catch (err) {
          console.error('Failed to update user subscriptions:', err)
        }
      }
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const subscriptionId = subscription.id
    const customerId = subscription.customer as string
    
    console.log(`Subscription ${subscriptionId} canceled for customer: ${customerId}`)

    try {
      const client = await clerkClient()
      
      // Find user by stripeCustomerId
      const allUsers = await client.users.getUserList({ limit: 100 })
      const user = allUsers.data.find(
        u => u.publicMetadata?.stripeCustomerId === customerId
      )

      if (user) {
        const existingSubscriptions = (user.publicMetadata?.subscriptions as SiteSubscription[]) || []
        
        // Find the subscription being canceled
        const canceledSub = existingSubscriptions.find(s => s.stripeSubscriptionId === subscriptionId)
        
        if (canceledSub) {
          // Remove from subscriptions array
          const updatedSubscriptions = existingSubscriptions.filter(
            s => s.stripeSubscriptionId !== subscriptionId
          )

          // Update user metadata
          await client.users.updateUser(user.id, {
            publicMetadata: {
              ...user.publicMetadata,
              subscriptions: updatedSubscriptions,
            },
          })

          console.log(`Removed subscription for project ${canceledSub.projectSlug} from user ${user.id}`)

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
      } else {
        console.warn(`No user found for customer ${customerId}`)
      }
    } catch (err) {
      console.error('Failed to process subscription cancellation:', err)
    }
  }

  return NextResponse.json({ received: true })
}