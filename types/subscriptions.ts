// =============================================================================
// SUBSCRIPTION TYPES - Shared across API routes and components
// =============================================================================

/**
 * Account-level subscription (Architect, Visionary, or Singularity tier)
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

// =============================================================================
// CENTRALIZED LIMITS - Import these instead of hardcoding
// =============================================================================

export const LIMITS = {
  // Guest/Demo users (no account)
  GUEST_TOTAL_CREDITS: 9, // Combined builds + refinements before signup wall
  GUEST_REFINEMENTS: 1, // Max refinements per session
  GUEST_DAILY_GENERATIONS: 3, // Generations per day (IP-based)
  
  // Free users (signed in, no subscription)
  FREE_DAILY_GENERATIONS: 5, // Generations per day
  FREE_REFINEMENTS: 1, // Max refinements before paywall
  
  // Architect tier
  ARCHITECT_PROJECTS: 3, // Max projects
  ARCHITECT_DEPLOYED_SITES: 3, // Max deployed sites
  ARCHITECT_REFINEMENTS_MONTHLY: 5, // Refinements per month
  
  // Visionary+ = unlimited everything
  // Singularity = unlimited + premium features
}

/**
 * Pricing tier configuration
 * NOTE: The paywall is at DEPLOY, not at generation.
 * Free users can generate code - they pay to ship.
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
    deployedSitesLimit: 3,
    architectRefinementsPerMonth: -1, // Unlimited
    features: [
      'Unlimited AI generations',
      'Deploy to hatchitsites.dev',
      'Download source code (ZIP)',
      'Push to your GitHub',
      '3 projects',
    ],
  },
  visionary: {
    name: 'visionary',
    price: 49,
    deployedSitesLimit: -1, // Unlimited
    architectRefinementsPerMonth: -1,
    features: [
      'Everything in Architect',
      'Unlimited projects',
      'Custom domain support',
      'Remove HatchIt branding',
      'The Auditor (AI quality check)',
      'The Healer (auto-fix errors)',
    ],
  },
  singularity: {
    name: 'singularity',
    price: 199,
    deployedSitesLimit: -1,
    architectRefinementsPerMonth: -1,
    features: [
      'Everything in Visionary',
      'The Replicator (clone any site)',
      'Commercial / white-label license',
      'API access',
      'Priority support',
      'Early access to new features',
    ],
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
