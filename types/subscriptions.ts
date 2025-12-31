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
  initiate: {
    name: 'free',
    price: 0,
    generationsPerDay: 5,
    architectRefinementsPerMonth: 0,
    features: ['5 generations per day', 'Live preview', 'Basic templates', 'Community support'],
  },
  architect: {
    name: 'pro',
    price: 29,
    generationsPerDay: -1,
    architectRefinementsPerMonth: -1,
    features: ['Unlimited generations', 'Unlimited Architect refinements', 'Full code export', 'Custom domains', 'The Living Site (Evolution Engine)'],
  },
  demiurge: {
    name: 'agency',
    price: 199,
    generationsPerDay: -1,
    architectRefinementsPerMonth: -1,
    features: ['Everything in Architect', 'White-label client portal', 'The Replicator (Clone any site)', 'API Access', 'Priority 24/7 Support'],
  },
}

// Limits (can be overridden via env vars)
export const FREE_DAILY_LIMIT = parseInt(process.env.FREE_DAILY_LIMIT || '5', 10)
export const PRO_ARCHITECT_MONTHLY_LIMIT = parseInt(process.env.PRO_ARCHITECT_MONTHLY_LIMIT || '30', 10)
