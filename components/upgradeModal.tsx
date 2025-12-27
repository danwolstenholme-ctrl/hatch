'use client'

import { useState } from 'react'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  reason: 'generation_limit' | 'code_access' | 'deploy' | 'download' | 'proactive' | 'running_low'
  projectSlug?: string
  projectName?: string
  generationsRemaining?: number
}

export default function UpgradeModal({ isOpen, onClose, reason, projectSlug = '', projectName = 'this project', generationsRemaining }: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const messages = {
    generation_limit: {
      title: "You've hit today's limit",
      description: "Free accounts get 10 generations per day. Go Hatched for unlimited builds.",
      icon: "⚡"
    },
    running_low: {
      title: `${generationsRemaining} generations left today`,
      description: "Running low! Go Hatched for unlimited generations and deploy your site.",
      icon: "⏳"
    },
    proactive: {
      title: "Ready to level up?",
      description: "Go Hatched to unlock unlimited generations, deploy to a live URL, and get full code access.",
      icon: "🚀"
    },
    code_access: {
      title: "Unlock your code",
      description: "Go Hatched to view, copy, and download your full source code.",
      icon: "🔓"
    },
    deploy: {
      title: "Ready to go live?",
      description: `Go Hatched to deploy "${projectName}" with a custom domain.`,
      icon: "🚀"
    },
    download: {
      title: "Download your project",
      description: `Go Hatched to download "${projectName}" as a clean, production-ready project.`,
      icon: "📦"
    }
  }

  const { title, description, icon } = messages[reason]

  const handleUpgrade = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectSlug, projectName }),
      })
      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Failed to start checkout. Please try again.')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingBottom: 'max(1rem, env(safe-area-inset-bottom))', paddingLeft: 'max(1rem, env(safe-area-inset-left))', paddingRight: 'max(1rem, env(safe-area-inset-right))' }}>
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh] select-text">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-zinc-500 hover:text-white transition-colors active:bg-zinc-800 rounded-lg md:p-2"
          aria-label="Close"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

        <div className="bg-gradient-to-br from-zinc-800/50 to-zinc-900 border border-purple-500/30 rounded-xl p-6 mb-6 ring-1 ring-purple-500/20">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">🐣</span>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Hatched</span>
          </div>
          <div className="flex items-baseline justify-center gap-1 mb-2">
            <span className="text-4xl font-bold text-white">$49</span>
            <span className="text-zinc-400">/month</span>
          </div>
          <p className="text-zinc-500 text-sm text-center mb-4">per live site</p>
          
          <div className="space-y-2">
            {[
              'Deploy to live URL',
              'Custom domain',
              'Buy domains in-app',
              'Full code access',
              'Download project',
              'Version history',
              'Unlimited generations',
              'Unlimited updates'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="text-purple-400">✓</span>
                {feature}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleUpgrade}
          disabled={isLoading}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? 'Loading...' : (
            <>
              <span>🐣</span>
              <span>Go Hatched</span>
            </>
          )}
        </button>

        <p className="text-zinc-600 text-xs text-center mt-4">
          Cancel anytime. Your code is always yours.
        </p>

        <div className="flex items-center justify-center gap-4 text-zinc-500 text-xs mt-6 pt-4 border-t border-zinc-800">
          <a href="/terms" className="hover:text-white transition-colors">Terms</a>
          <span>•</span>
          <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
        </div>
      </div>
    </div>
  )
}