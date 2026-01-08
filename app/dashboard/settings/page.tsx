'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useGitHub } from '@/hooks/useGitHub'

export default function DashboardSettingsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const gitHub = useGitHub()

  const accountSubscription = user?.publicMetadata?.accountSubscription as { tier?: string; status?: string } | undefined
  const tier = accountSubscription?.tier || 'free'

  if (!isLoaded) return null

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold text-white">Settings</h1>
        <p className="text-sm text-zinc-500">Account connections and workspace configuration.</p>
      </header>

      <section className="rounded-lg border border-zinc-800/70 bg-zinc-900/40 p-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Plan</p>
          <p className="text-sm text-zinc-200 mt-1">{tier}</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/billing')}
          className="px-3 py-1.5 text-xs text-zinc-200 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-all"
        >
          Manage billing
        </button>
      </section>

      <section className="rounded-lg border border-zinc-800/70 bg-zinc-900/40 p-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">GitHub</p>
          <p className="text-sm text-zinc-200 mt-1">
            {gitHub.loading ? 'Checking connection…' : gitHub.connected ? 'Connected' : 'Not connected'}
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">Required for pushing code to your repo.</p>
        </div>
        {gitHub.connected ? (
          <button
            onClick={async () => {
              await gitHub.disconnect()
              await gitHub.refresh()
            }}
            className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-all"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={() => gitHub.connect()}
            disabled={gitHub.loading}
            className="px-3 py-1.5 text-xs text-zinc-200 border border-zinc-800 hover:border-emerald-500/40 hover:text-white rounded-lg transition-all disabled:opacity-50"
          >
            Connect GitHub
          </button>
        )}
      </section>

      <section className="rounded-lg border border-zinc-800/70 bg-zinc-900/40 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Support</p>
        <p className="text-sm text-zinc-200 mt-1">Need help?</p>
        <button
          onClick={() => router.push('/contact')}
          className="mt-3 px-3 py-1.5 text-xs text-zinc-200 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-all"
        >
          Contact support
        </button>
      </section>
    </div>
  )
}
