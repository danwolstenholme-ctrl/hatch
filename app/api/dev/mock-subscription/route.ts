import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { AccountSubscription } from '@/types/subscriptions'

const DEV_GUARD = process.env.NODE_ENV === 'production' || process.env.ALLOW_DEV_MOCK_SUB !== 'true'

export async function POST(req: NextRequest) {
  if (DEV_GUARD) {
    return NextResponse.json({ error: 'Dev mock endpoint is disabled' }, { status: 403 })
  }

  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { tier?: 'lite' | 'pro' | 'agency'; clear?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { tier, clear } = body

  if (!clear && (!tier || !['lite', 'pro', 'agency'].includes(tier))) {
    return NextResponse.json({ error: 'Invalid tier. Use lite, pro, or agency.' }, { status: 400 })
  }

  const client = await clerkClient()
  const user = await client.users.getUser(userId)

  if (clear) {
    await client.users.updateUser(userId, {
      publicMetadata: { ...user.publicMetadata, accountSubscription: null },
    })
    return NextResponse.json({ cleared: true })
  }

  const now = Date.now()
  const currentPeriodEnd = new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString()
  const accountSubscription: AccountSubscription = {
    tier: tier!,
    stripeSubscriptionId: `dev_sub_${now}`,
    stripeCustomerId: `dev_cus_${userId}`,
    status: 'active',
    currentPeriodEnd,
    createdAt: new Date(now).toISOString(),
  }

  await client.users.updateUser(userId, {
    publicMetadata: {
      ...user.publicMetadata,
      accountSubscription,
    },
  })

  return NextResponse.json({ mocked: true, accountSubscription })
}
