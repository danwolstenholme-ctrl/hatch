'use client'

import { useUser } from '@clerk/nextjs'

export default function BillingPage() {
  const { user } = useUser()
  const accountSubscription = user?.publicMetadata?.accountSubscription as { tier?: string } | undefined
  const currentTier = accountSubscription?.tier || 'free'

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      description: 'Explore the builder',
      features: [
        { text: 'Unlimited AI generations', included: true },
        { text: 'Live preview', included: true },
        { text: '1 project', included: true },
        { text: 'Deploy to hatchitsites.dev', included: false },
        { text: 'Download source code', included: false },
        { text: 'Push to GitHub', included: false },
      ],
      cta: currentTier === 'free' ? 'Current plan' : 'Downgrade',
      current: currentTier === 'free',
      free: true,
    },
    {
      id: 'architect',
      name: 'Architect',
      price: 19,
      description: 'Ship your projects',
      features: [
        { text: 'Unlimited AI generations', included: true },
        { text: 'Live preview', included: true },
        { text: '3 projects', included: true },
        { text: 'Deploy to hatchitsites.dev', included: true },
        { text: 'Download source code (ZIP)', included: true },
        { text: 'Push to your GitHub', included: true },
      ],
      cta: currentTier === 'architect' ? 'Current plan' : 'Get started',
      current: currentTier === 'architect',
    },
    {
      id: 'visionary',
      name: 'Visionary',
      price: 49,
      description: 'Professional tools',
      features: [
        { text: 'Everything in Architect', included: true },
        { text: 'Unlimited projects', included: true },
        { text: 'Custom domain', included: true },
        { text: 'Remove HatchIt branding', included: true },
        { text: 'The Auditor (AI quality check)', included: true },
        { text: 'The Healer (auto-fix errors)', included: true },
      ],
      cta: currentTier === 'visionary' ? 'Current plan' : 'Upgrade',
      current: currentTier === 'visionary',
      recommended: true,
    },
    {
      id: 'singularity',
      name: 'Singularity',
      price: 199,
      description: 'Agency & teams',
      features: [
        { text: 'Everything in Visionary', included: true },
        { text: 'The Replicator (clone any site)', included: true },
        { text: 'Commercial / white-label license', included: true },
        { text: 'API access', included: true },
        { text: 'Priority support', included: true },
        { text: 'Early access to new features', included: true },
      ],
      cta: currentTier === 'singularity' ? 'Current plan' : 'Upgrade',
      current: currentTier === 'singularity',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-medium text-white">Billing</h1>
        <p className="text-xs text-zinc-500 mt-1">Manage your subscription and billing</p>
      </div>

      {/* Current plan info */}
      <div className="p-4 bg-zinc-900/50 border border-zinc-800/60 rounded-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mb-1">Current plan</p>
            <p className="text-sm font-medium text-zinc-100 capitalize">{currentTier}</p>
          </div>
          {currentTier !== 'free' && (
            <a 
              href="/api/subscription/portal"
              className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Manage subscription →
            </a>
          )}
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative p-4 rounded-md border transition-all ${
              plan.current
                ? 'bg-zinc-900/50 border-zinc-700/60'
                : plan.recommended
                ? 'bg-zinc-900/50 border-zinc-700/60 shadow-sm hover:border-zinc-600'
                : 'bg-zinc-900/50 border-zinc-800/60 hover:border-zinc-700'
            }`}
          >
            {plan.recommended && !plan.current && (
              <div className="absolute -top-2.5 left-3 px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-medium rounded-sm">
                RECOMMENDED
              </div>
            )}

            <div className="mb-3">
              <h3 className="text-sm font-medium text-zinc-100">{plan.name}</h3>
              <p className="text-[10px] text-zinc-500">{plan.description}</p>
            </div>

            <div className="flex items-baseline gap-0.5 mb-4">
              <span className="text-xl font-semibold text-white">${plan.price}</span>
              <span className="text-zinc-500 text-[10px]">/mo</span>
            </div>

            <ul className="space-y-1.5 mb-4">
              {plan.features.map((feature, i) => (
                <li key={i} className={`flex items-start gap-2 text-[11px] ${feature.included ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  <span className={`mt-0.5 flex-shrink-0 ${feature.included ? 'text-emerald-500' : 'text-zinc-700'}`}>
                    {feature.included ? '✓' : '—'}
                  </span>
                  <span>{feature.text}</span>
                </li>
              ))}
            </ul>

            {plan.current ? (
              <div className="w-full py-1.5 text-center text-[11px] text-zinc-400 border border-zinc-700 rounded-md bg-zinc-800/50">
                Current plan
              </div>
            ) : plan.free ? (
              <div className="w-full py-1.5 text-center text-[11px] text-zinc-500 border border-zinc-700 rounded-md">
                Free forever
              </div>
            ) : (
              <a
                href={`/api/checkout?tier=${plan.id}`}
                className={`block w-full py-1.5 text-center text-[11px] font-medium rounded-md transition-colors ${
                  plan.recommended
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                }`}
              >
                {plan.cta}
              </a>
            )}
          </div>
        ))}
      </div>

      <p className="text-center text-[10px] text-zinc-500">
        All plans include a 14-day money-back guarantee. Cancel anytime.
      </p>
    </div>
  )
}
