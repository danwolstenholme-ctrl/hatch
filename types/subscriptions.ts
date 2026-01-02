// =============================================================================
// SUBSCRIPTION TYPES - Shared across API routes and components
// =============================================================================

/**
 * Account-level subscription (Pro or Agency tier)
 * Stored in Clerk publicMetadata.accountSubscription
 */
export interface AccountSubscription {
  tier: 'lite' | 'pro' | 'agency'
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
  name: 'lite' | 'pro' | 'agency'
  price: number // USD per month
  generationsPerDay: number // -1 for unlimited
  architectRefinementsPerMonth: number // -1 for unlimited
  features: string[]
}

/**
 * Current pricing configuration
 */
export const PRICING_TIERS: Record<string, PricingTier> = {
  lite: {
    name: 'lite',
    price: 9,
    generationsPerDay: -1, // Unlimited
    architectRefinementsPerMonth: 5,
    features: ['Unlimited Generations', '3 Active Projects', 'Code Download', 'Deploy to hatchitsites.dev'],
  },
  pro: {
    name: 'pro',
    price: 29,
    generationsPerDay: -1,
    architectRefinementsPerMonth: -1,
    features: ['Unlimited generations', 'Unlimited Architect refinements', 'Full code export', 'Custom domains', 'Remove HatchIt Branding', 'The Living Site (Evolution Engine)'],
  },
  agency: {
    name: 'agency',
    price: 99,
    generationsPerDay: -1,
    architectRefinementsPerMonth: -1,
    features: ['Everything in Pro', 'Commercial License', 'Priority Support', 'Team Features (Coming Soon)'],
  },
}

// Limits (can be overridden via env vars)
// Guest (unauthenticated) trial limits before forcing signup
export const GUEST_TRIAL_LIMITS = {
  generationsPerSession: parseInt(process.env.GUEST_GENERATION_LIMIT || '3', 10),
  refinementsAllowed: 3,
  dreamsPerSession: 3,
  features: ['3 trial generations', '3 trial polishes', '3 trial dreams', 'Live preview in builder', 'Signup required to save/export/deploy'],
}
