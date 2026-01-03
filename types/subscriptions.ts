// =============================================================================
// SUBSCRIPTION TYPES - Shared across API routes and components
// =============================================================================

/**
 * Account-level subscription (Pro or Agency tier)
 * Stored in Clerk publicMetadata.accountSubscription
 */
export interface AccountSubscription {
  tier: 'architect' | 'visionary' | 'singularity'
  stripeSubscriptionId: string
  stripeCustomerId: string
  status: 'active' | 'canceled' | 'past_due'
  currentPeriodEnd: string
  createdAt: string
  deployedSitesCount?: number // Track how many sites deployed
}

/**
 * Pricing tier configuration
 * NOTE: The paywall is at DEPLOY, not at generation.
 * Free users can generate unlimited code - they pay to ship.
 */
export interface PricingTier {
  name: 'architect' | 'visionary' | 'singularity'
  price: number // USD per month
  deployedSitesLimit: number // -1 for unlimited
  architectRefinementsPerMonth: number // -1 for unlimited
  features: string[]
}

/**
 * Current pricing configuration
 */
export const PRICING_TIERS: Record<string, PricingTier> = {
  architect: {
    name: 'architect',
    price: 19,
    deployedSitesLimit: 3, // 3 live sites
    architectRefinementsPerMonth: 5,
    features: ['Unlimited Generations', '3 Deployed Sites', '5 AI Polishes / month', 'Deploy to hatchitsites.dev'],
  },
  visionary: {
    name: 'visionary',
    price: 49,
    deployedSitesLimit: 10, // 10 live sites
    architectRefinementsPerMonth: 30,
    features: ['Unlimited generations', '10 Deployed Sites', '30 AI Polishes / month', 'Full code export', 'Custom domains', 'Remove HatchIt Branding'],
  },
  singularity: {
    name: 'singularity',
    price: 199,
    deployedSitesLimit: -1, // Unlimited
    architectRefinementsPerMonth: -1,
    features: ['Everything in Visionary', 'Unlimited Deployed Sites', 'Commercial License', 'Priority Support', 'API Access (Coming Soon)'],
  },
}

// Guest/Free user - can generate unlimited, but cannot deploy
export const GUEST_TRIAL_LIMITS = {
  generationsPerSession: -1, // UNLIMITED - let them play
  refinementsAllowed: -1, // UNLIMITED - let them refine
  dreamsPerSession: -1, // UNLIMITED
  canDeploy: false, // THE ONLY GATE
  canExport: false, // Code download requires payment too
  features: ['Unlimited generations', 'Full preview', 'Signup + payment required to deploy/export'],
}
