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
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-medium text-white">Settings</h1>
        <p className="text-xs text-zinc-500 mt-1">Account connections and workspace configuration</p>
      </div>

      {/* Plan */}
      <div className="border border-zinc-800/50 rounded-md p-4 bg-zinc-900/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-zinc-500 uppercase tracking-wide">Plan</p>
            <p className="text-sm text-white capitalize mt-0.5">{tier}</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/billing')}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Manage billing →
          </button>
        </div>
      </div>

      {/* GitHub */}
      <div className="border border-zinc-800/50 rounded-md p-4 bg-zinc-900/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[11px] text-zinc-500 uppercase tracking-wide">GitHub</p>
              {gitHub.connected && (
                <span className="text-[10px] text-emerald-400">Connected</span>
              )}
            </div>
            <p className="text-sm text-white mt-0.5">
              {gitHub.loading ? 'Checking...' : gitHub.connected ? `@${gitHub.username}` : 'Not connected'}
            </p>
            <p className="text-[11px] text-zinc-600 mt-1">Required for pushing code to your repo</p>
          </div>
          {gitHub.connected ? (
            <button
              onClick={async () => {
                await gitHub.disconnect()
                await gitHub.refresh()
              }}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={() => gitHub.connect()}
              disabled={gitHub.loading}
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
            >
              Connect
            </button>
          )}
        </div>
      </div>

      {/* Support */}
      <div className="border border-zinc-800/50 rounded-md p-4 bg-zinc-900/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-zinc-500 uppercase tracking-wide">Support</p>
            <p className="text-sm text-white mt-0.5">Need help?</p>
          </div>
          <button
            onClick={() => router.push('/contact')}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Contact →
          </button>
        </div>
      </div>
    </div>
  )
}
