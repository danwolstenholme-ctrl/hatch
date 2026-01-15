'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { CreditCard, Receipt, Calendar, ArrowRight, ExternalLink, Check } from 'lucide-react'

interface BillingInfo {
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
  paymentMethod?: {
    brand?: string
    last4?: string
  }
}

export default function BillingPage() {
  const { user } = useUser()
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null)
  const [loadingPortal, setLoadingPortal] = useState(false)
  
  const accountSubscription = user?.publicMetadata?.accountSubscription as { 
    tier?: string
    stripeCustomerId?: string
    stripeSubscriptionId?: string
  } | undefined
  const currentTier = accountSubscription?.tier || 'free'
  const hasSubscription = currentTier !== 'free'

  // Fetch billing info from Stripe
  useEffect(() => {
    if (hasSubscription && accountSubscription?.stripeSubscriptionId) {
      fetch('/api/subscription/billing-info')
        .then(res => res.ok ? res.json() : null)
        .then(data => data && setBillingInfo(data))
        .catch(() => {})
    }
  }, [hasSubscription, accountSubscription?.stripeSubscriptionId])

  const openBillingPortal = async () => {
    setLoadingPortal(true)
    try {
      const res = await fetch('/api/subscription/portal', { method: 'POST' })
      if (res.ok) {
        const { url } = await res.json()
        window.location.href = url
      }
    } catch {
      // Fallback to Stripe direct
      window.open('https://billing.stripe.com/p/login/test_xxx', '_blank')
    } finally {
      setLoadingPortal(false)
    }
  }

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      features: ['1 project', 'Unlimited AI generations', 'Live preview'],
    },
    {
      id: 'architect',
      name: 'Architect',
      price: 19,
      features: ['3 projects', 'Deploy to hatchit.dev', 'Download source code', 'Push to GitHub'],
    },
    {
      id: 'visionary',
      name: 'Visionary',
      price: 49,
      features: ['Unlimited projects', 'Custom domain', 'Remove branding', 'Auto-healing'],
      recommended: true,
    },
    {
      id: 'singularity',
      name: 'Singularity',
      price: 199,
      features: ['Site cloning', 'Priority AI queue', 'Bulk export', 'White-label license'],
    },
  ]

  const currentPlan = plans.find(p => p.id === currentTier) || plans[0]

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-lg font-medium text-white">Billing</h1>
        <p className="text-xs text-zinc-500 mt-1">Manage your subscription and payment</p>
      </div>

      {/* Current Plan Card */}
      <div className="border border-zinc-800/50 rounded-lg overflow-hidden">
        <div className="p-5 bg-zinc-900/50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mb-1">Current Plan</p>
              <p className="text-xl font-semibold text-white">{currentPlan.name}</p>
              <p className="text-sm text-zinc-400 mt-1">
                ${currentPlan.price}<span className="text-zinc-600">/month</span>
              </p>
            </div>
            {hasSubscription && (
              <button
                onClick={openBillingPortal}
                disabled={loadingPortal}
                className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
              >
                {loadingPortal ? 'Loading...' : 'Manage'} <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Billing Details */}
        {hasSubscription && (
          <div className="border-t border-zinc-800/50 divide-y divide-zinc-800/30">
            {/* Next Billing */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-zinc-500" />
                <div>
                  <p className="text-xs text-zinc-400">Next billing date</p>
                  <p className="text-sm text-zinc-200">
                    {billingInfo?.currentPeriodEnd 
                      ? new Date(billingInfo.currentPeriodEnd).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })
                      : 'Loading...'}
                  </p>
                </div>
              </div>
              {billingInfo?.cancelAtPeriodEnd && (
                <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
                  Cancels at period end
                </span>
              )}
            </div>

            {/* Payment Method */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-zinc-500" />
                <div>
                  <p className="text-xs text-zinc-400">Payment method</p>
                  <p className="text-sm text-zinc-200">
                    {billingInfo?.paymentMethod?.brand 
                      ? `${billingInfo.paymentMethod.brand.charAt(0).toUpperCase() + billingInfo.paymentMethod.brand.slice(1)} •••• ${billingInfo.paymentMethod.last4}`
                      : 'Loading...'}
                  </p>
                </div>
              </div>
              <button
                onClick={openBillingPortal}
                className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Update
              </button>
            </div>

            {/* Invoices */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Receipt className="w-4 h-4 text-zinc-500" />
                <div>
                  <p className="text-xs text-zinc-400">Invoices</p>
                  <p className="text-sm text-zinc-200">View billing history</p>
                </div>
              </div>
              <button
                onClick={openBillingPortal}
                className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                View all →
              </button>
            </div>
          </div>
        )}

        {/* Free tier upgrade prompt */}
        {!hasSubscription && (
          <div className="border-t border-zinc-800/50 p-4 bg-zinc-900/30">
            <p className="text-xs text-zinc-500 mb-3">
              Upgrade to deploy your sites and unlock more features.
            </p>
            <a
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              View plans <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Quick Compare */}
      <div>
        <h2 className="text-sm font-medium text-zinc-300 mb-4">Compare plans</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`p-4 rounded-lg border transition-all ${
                plan.id === currentTier
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : plan.recommended
                  ? 'border-zinc-700/60 bg-zinc-900/50'
                  : 'border-zinc-800/50 bg-zinc-900/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-zinc-100">{plan.name}</h3>
                {plan.id === currentTier && (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
              <p className="text-lg font-semibold text-white mb-3">
                ${plan.price}<span className="text-xs text-zinc-500 font-normal">/mo</span>
              </p>
              <ul className="space-y-1">
                {plan.features.slice(0, 3).map((f, i) => (
                  <li key={i} className="text-[10px] text-zinc-500">{f}</li>
                ))}
              </ul>
              {plan.id !== currentTier && (
                <a
                  href={plan.id === 'free' ? '#' : `/api/checkout?tier=${plan.id}`}
                  className={`block mt-3 text-center text-[11px] py-1.5 rounded transition-colors ${
                    plan.id === 'free'
                      ? 'text-zinc-600 cursor-default'
                      : currentTier === 'free' || plans.findIndex(p => p.id === plan.id) > plans.findIndex(p => p.id === currentTier)
                      ? 'text-emerald-400 hover:text-emerald-300'
                      : 'text-zinc-500 hover:text-zinc-400'
                  }`}
                >
                  {plan.id === 'free' 
                    ? '—' 
                    : plans.findIndex(p => p.id === plan.id) > plans.findIndex(p => p.id === currentTier)
                    ? 'Upgrade'
                    : 'Downgrade'}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p className="text-[10px] text-zinc-600 text-center">
        All plans include a 14-day money-back guarantee. 
        {hasSubscription && (
          <> Questions? <a href="/contact" className="text-zinc-500 hover:text-zinc-400">Contact support</a>.</>
        )}
      </p>
    </div>
  )
}
