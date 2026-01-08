'use client'

import { useUser } from '@clerk/nextjs'
import { Check, X } from 'lucide-react'

export default function BillingPage() {
  const { user } = useUser()
  const accountSubscription = user?.publicMetadata?.accountSubscription as any
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
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-2xl font-semibold text-zinc-100 mb-2">Billing</h1>
        <p className="text-zinc-500 text-sm">
          Manage your subscription and billing details
        </p>
      </div>

      {/* Current plan info */}
      <div className="mb-10 p-5 bg-zinc-900 border border-zinc-800 rounded-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Current plan</p>
            <p className="text-lg font-medium text-zinc-200 capitalize">{currentTier}</p>
          </div>
          {currentTier !== 'free' && (
            <a 
              href="/api/subscription/portal"
              className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Manage subscription →
            </a>
          )}
        </div>
      </div>

      {/* Plans grid - 4 columns on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative p-5 rounded-md border transition-all ${
              plan.current
                ? 'bg-emerald-900/10 border-emerald-500/30'
                : plan.recommended
                ? 'bg-zinc-900 border-emerald-500/30 hover:border-emerald-500/50'
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            {plan.recommended && !plan.current && (
              <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-semibold rounded">
                RECOMMENDED
              </div>
            )}

            <div className="mb-4">
              <h3 className="text-lg font-medium text-zinc-200 mb-1">{plan.name}</h3>
              <p className="text-xs text-zinc-500">{plan.description}</p>
            </div>

            <div className="flex items-baseline gap-1 mb-5">
              <span className="text-2xl font-semibold text-zinc-200">${plan.price}</span>
              <span className="text-zinc-500 text-xs">/mo</span>
            </div>

            <ul className="space-y-2 mb-5">
              {plan.features.map((feature, i) => (
                <li key={i} className={`flex items-start gap-2 text-xs ${feature.included ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {feature.included ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-zinc-700 mt-0.5 flex-shrink-0" />
                  )}
                  <span>{feature.text}</span>
                </li>
              ))}
            </ul>

            {plan.current ? (
              <div className="w-full py-2 text-center text-xs text-emerald-500 border border-emerald-500/30 rounded-md">
                Current plan
              </div>
            ) : plan.free ? (
              <div className="w-full py-2 text-center text-xs text-zinc-600 border border-zinc-800 rounded-md">
                Free forever
              </div>
            ) : (
              <a
                href={`/api/checkout?tier=${plan.id}`}
                className={`block w-full py-2 text-center text-xs font-medium rounded-md transition-colors ${
                  plan.recommended
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                }`}
              >
                {plan.cta}
              </a>
            )}
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-zinc-600 mt-8">
        All plans include a 14-day money-back guarantee. Cancel anytime.
      </p>
    </div>
  )
}
