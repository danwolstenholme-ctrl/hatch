// =============================================================================
// SUBSCRIPTION TYPES - Shared across API routes and components
// =============================================================================

/**
 * Account-level subscription (Pro or Agency tier)
 * Stored in Clerk publicMetadata.accountSubscription
 */
export interface AccountSubscription {
  tier: 'pro' | 'agency'
  stripeSubscriptionId: string
  stripeCustomerId: string
  status: 'active' | 'canceled' | 'past_due'
  currentPeriodEnd: string
  createdAt: string
}

/**
 * Legacy per-site subscription (for backwards compatibility)
 * Stored in Clerk publicMetadata.subscriptions[]
 * @deprecated Use AccountSubscription instead for new subscriptions
 */
export interface SiteSubscription {
  projectSlug: string
  projectName: string
  stripeSubscriptionId: string
  status: 'active' | 'canceled' | 'past_due'
  createdAt: string
}

/**
 * Pricing tier configuration
 */
export interface PricingTier {
  name: 'free' | 'pro' | 'agency'
  price: number // USD per month
  generationsPerDay: number // -1 for unlimited
  opusRefinementsPerMonth: number // -1 for unlimited
  features: string[]
}

/**
 * Current pricing configuration
 */
export const PRICING_TIERS: Record<string, PricingTier> = {
  free: {
    name: 'free',
    price: 0,
    generationsPerDay: 5,
    opusRefinementsPerMonth: 0,
    features: ['5 generations per day', 'Basic templates', 'Community support'],
  },
  pro: {
    name: 'pro',
    price: 39,
    generationsPerDay: -1,
    opusRefinementsPerMonth: 30,
    features: ['Unlimited generations', '30 Opus refinements/month', 'Priority support', 'Custom domains'],
  },
  agency: {
    name: 'agency',
    price: 99,
    generationsPerDay: -1,
    opusRefinementsPerMonth: -1,
    features: ['Unlimited everything', 'White-label exports', 'API access', 'Dedicated support'],
  },
}

// Limits (can be overridden via env vars)
export const FREE_DAILY_LIMIT = parseInt(process.env.FREE_DAILY_LIMIT || '5', 10)
export const PRO_OPUS_MONTHLY_LIMIT = parseInt(process.env.PRO_OPUS_MONTHLY_LIMIT || '30', 10)
