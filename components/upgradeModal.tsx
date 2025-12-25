'use client'

import { useState } from 'react'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  reason: 'generation_limit' | 'code_access' | 'deploy' | 'download'
}

export default function UpgradeModal({ isOpen, onClose, reason }: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const messages = {
    generation_limit: {
      title: "You've hit today's limit",
      description: "Free accounts get 20 generations per day. Upgrade to build unlimited.",
      icon: "⚡"
    },
    code_access: {
      title: "Unlock your code",
      description: "Upgrade to view, copy, and download your full source code.",
      icon: "🔓"
    },
    deploy: {
      title: "Ready to go live?",
      description: "Deploy your site to a live URL with one click. Custom domains included.",
      icon: "🚀"
    },
    download: {
      title: "Download your project",
      description: "Get a clean, production-ready Next.js project you can host anywhere.",
      icon: "📦"
    }
  }

  const { title, description, icon } = messages[reason]

  const handleUpgrade = async () => {
    setIsLoading(true)
    // TODO: Integrate Stripe checkout
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('Stripe integration coming soon!')
    setIsLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="text-5xl mb-6 text-center">{icon}</div>

        <h2 className="text-2xl font-bold text-white text-center mb-3">
          {title}
        </h2>
        <p className="text-zinc-400 text-center mb-8">
          {description}
        </p>

        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 mb-6">
          <div className="flex items-baseline justify-center gap-1 mb-2">
            <span className="text-4xl font-bold text-white">$49</span>
            <span className="text-zinc-400">/month</span>
          </div>
          <p className="text-zinc-500 text-sm text-center">per live site</p>
          
          <div className="mt-4 space-y-2">
            {[
              'Deploy to live URL',
              'Custom domain',
              'Full code access',
              'Download project',
              'Unlimited generations',
              'Unlimited updates'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="text-green-400">✓</span>
                {feature}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleUpgrade}
          disabled={isLoading}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl font-semibold transition-all"
        >
          {isLoading ? 'Loading...' : 'Upgrade Now'}
        </button>

        <p className="text-zinc-600 text-xs text-center mt-4">
          Cancel anytime. Your code is always yours.
        </p>
      </div>
    </div>
  )
}