'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'

type ReplicatorStatus = 'idle' | 'fetching' | 'analyzing' | 'complete' | 'error'

interface ReplicatorResult {
  projectName: string
  description: string
  style: {
    palette: string[]
    fontPairing: string
    vibe: string
  }
  sections: Array<{
    type: string
    prompt: string
  }>
}

export default function ReplicatorPage() {
  const router = useRouter()
  const { user } = useUser()
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<ReplicatorStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ReplicatorResult | null>(null)
  const [creating, setCreating] = useState(false)

  const accountSubscription = user?.publicMetadata?.accountSubscription as { tier?: string } | undefined
  const tier = accountSubscription?.tier || 'free'
  const hasAccess = tier === 'singularity' || user?.publicMetadata?.role === 'admin'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    let targetUrl = url
    if (!targetUrl.startsWith('http')) {
      targetUrl = 'https://' + targetUrl
    }

    setStatus('fetching')
    setError('')
    setProgress(10)
    setResult(null)

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 8
        })
      }, 600)

      const res = await fetch('/api/replicator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      })

      clearInterval(progressInterval)

      if (!res.ok) {
        const data = await res.json()
        if (res.status === 403 && data.requiresUpgrade) {
          throw new Error('UPGRADE_REQUIRED')
        }
        throw new Error(data.error || 'Failed to analyze site')
      }

      setStatus('analyzing')
      setProgress(95)
      
      const data = await res.json()
      
      setStatus('complete')
      setProgress(100)
      setResult(data)

    } catch (err: unknown) {
      setStatus('error')
      const message = err instanceof Error ? err.message : 'Unknown error'
      if (message === 'UPGRADE_REQUIRED') {
        setError('The Replicator requires Singularity tier.')
      } else {
        setError(message || 'Failed to analyze. The site may be blocked or unreachable.')
      }
    }
  }

  const handleCreateProject = async () => {
    if (!result) return
    setCreating(true)

    try {
      // Create project with extracted data
      const res = await fetch('/api/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: result.projectName || 'Replicated Site',
          templateId: 'website',
          replicatorData: result
        }),
      })
      
      const data = await res.json()
      if (res.ok && data.project) {
        router.push(`/builder?project=${data.project.id}`)
      }
    } catch {
      setError('Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  const reset = () => {
    setStatus('idle')
    setProgress(0)
    setError('')
    setResult(null)
    setUrl('')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-lg font-medium text-white">Replicator</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Analyze any website and extract its structure into a new project
        </p>
      </div>

      {/* Access Gate */}
      {!hasAccess ? (
        <div className="border border-zinc-800/50 rounded-md p-8 bg-zinc-900/30 text-center">
          <p className="text-sm text-zinc-400 mb-2">Singularity tier required</p>
          <p className="text-xs text-zinc-600 mb-6">
            The Replicator is available exclusively on the Singularity plan.
          </p>
          <button
            onClick={() => router.push('/dashboard/billing')}
            className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            View plans →
          </button>
        </div>
      ) : (
        <>
          {/* Input Form */}
          {status === 'idle' && !result && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="border border-zinc-800/50 rounded-md p-6 bg-zinc-900/30">
                <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-3">
                  Target URL
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="example.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
                />
                <p className="text-[11px] text-zinc-600 mt-2">
                  Enter a URL to analyze its structure, colors, and content
                </p>
              </div>

              <button
                type="submit"
                disabled={!url}
                className="w-full py-3 text-sm font-medium text-black bg-white rounded-md hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Analyze Site
              </button>
            </form>
          )}

          {/* Progress */}
          {(status === 'fetching' || status === 'analyzing') && (
            <div className="border border-zinc-800/50 rounded-md p-8 bg-zinc-900/30">
              <div className="space-y-4">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>
                    {status === 'fetching' ? 'Fetching site content...' : 'Analyzing structure...'}
                  </span>
                  <span className="tabular-nums">{Math.round(progress)}%</span>
                </div>
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-white"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-[11px] text-zinc-600 text-center">
                  Extracting colors, typography, sections, and content
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="border border-zinc-800/50 rounded-md p-8 bg-zinc-900/30 text-center">
              <p className="text-sm text-red-400 mb-2">Analysis Failed</p>
              <p className="text-xs text-zinc-500 mb-6">{error}</p>
              <button
                onClick={reset}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {/* Results */}
          {status === 'complete' && result && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="border border-zinc-800/50 rounded-md p-6 bg-zinc-900/30">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-medium text-white">{result.projectName}</h2>
                    <p className="text-xs text-zinc-500 mt-1">{result.description}</p>
                  </div>
                  <span className="text-[10px] text-emerald-400 uppercase tracking-wide">Analyzed</span>
                </div>

                {/* Style */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800/50">
                  <div>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wide mb-2">Colors</p>
                    <div className="flex gap-1">
                      {result.style.palette.slice(0, 4).map((color, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded border border-zinc-700"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wide mb-2">Typography</p>
                    <p className="text-xs text-zinc-400">{result.style.fontPairing}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wide mb-2">Vibe</p>
                    <p className="text-xs text-zinc-400">{result.style.vibe}</p>
                  </div>
                </div>
              </div>

              {/* Sections */}
              <div className="border border-zinc-800/50 rounded-md overflow-hidden">
                <div className="px-4 py-3 bg-zinc-900/50 border-b border-zinc-800/50">
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wide">
                    {result.sections.length} Sections Detected
                  </p>
                </div>
                <div className="divide-y divide-zinc-800/30">
                  {result.sections.map((section, i) => (
                    <div key={i} className="px-4 py-3">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] text-zinc-600 tabular-nums w-4">{i + 1}</span>
                        <span className="text-xs text-zinc-300 capitalize">{section.type}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 pl-7 line-clamp-2">{section.prompt}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={reset}
                  className="flex-1 py-3 text-sm text-zinc-400 border border-zinc-800 rounded-md hover:border-zinc-700 hover:text-white transition-colors"
                >
                  Analyze Another
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={creating}
                  className="flex-1 py-3 text-sm font-medium text-black bg-white rounded-md hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* How it works */}
      <div className="border-t border-zinc-800/30 pt-8">
        <p className="text-[11px] text-zinc-600 uppercase tracking-wide mb-4">How it works</p>
        <div className="grid grid-cols-3 gap-6 text-xs text-zinc-500">
          <div>
            <p className="text-zinc-400 mb-1">1. Fetch</p>
            <p>We retrieve the target site's HTML and visible content</p>
          </div>
          <div>
            <p className="text-zinc-400 mb-1">2. Analyze</p>
            <p>AI extracts structure, colors, typography, and copy</p>
          </div>
          <div>
            <p className="text-zinc-400 mb-1">3. Generate</p>
            <p>Section prompts are created for the builder to execute</p>
          </div>
        </div>
      </div>
    </div>
  )
}
