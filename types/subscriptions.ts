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
 * Pricing tier configuration
 */
export interface PricingTier {
  name: 'free' | 'pro' | 'agency'
  price: number // USD per month
  generationsPerDay: number // -1 for unlimited
  architectRefinementsPerMonth: number // -1 for unlimited
  features: string[]
}

/**
 * Current pricing configuration
 */
export const PRICING_TIERS: Record<string, PricingTier> = {
  free: {
    name: 'free',
    price: 0,
    generationsPerDay: 10, // Increased from 5 to hook users
    architectRefinementsPerMonth: 0,
    features: ['10 generations per day', 'Live preview', 'Basic templates', 'Community support'],
  },
  pro: {
    name: 'pro',
    price: 19,
    generationsPerDay: -1,
    architectRefinementsPerMonth: -1,
    features: ['Unlimited generations', 'Unlimited Architect refinements', 'Full code export', 'Custom domains', 'The Living Site (Evolution Engine)'],
  },
  agency: {
    name: 'agency',
    price: 99,
    generationsPerDay: -1,
    architectRefinementsPerMonth: -1,
    features: ['Everything in Pro', 'Commercial License', 'White-label exports', 'Priority Support', 'Team Features (Coming Soon)'],
  },
}

// Limits (can be overridden via env vars)
export const FREE_DAILY_LIMIT = parseInt(process.env.FREE_DAILY_LIMIT || '5', 10)
export const PRO_ARCHITECT_MONTHLY_LIMIT = parseInt(process.env.PRO_ARCHITECT_MONTHLY_LIMIT || '30', 10)
