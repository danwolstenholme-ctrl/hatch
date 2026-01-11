'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useGitHub } from '@/hooks/useGitHub'
import { Github, Mail, Shield, HelpCircle, ArrowRight, Check, X } from 'lucide-react'

export default function DashboardSettingsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const gitHub = useGitHub()

  const accountSubscription = user?.publicMetadata?.accountSubscription as { tier?: string; status?: string } | undefined
  const tier = accountSubscription?.tier || 'free'

  if (!isLoaded) return null

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-lg font-medium text-white">Settings</h1>
        <p className="text-xs text-zinc-500 mt-1">Account and workspace configuration</p>
      </div>

      {/* Account Section */}
      <div>
        <h2 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">Account</h2>
        <div className="border border-zinc-800/50 rounded-lg overflow-hidden divide-y divide-zinc-800/30">
          {/* Email */}
          <div className="p-4 flex items-center justify-between bg-zinc-900/30">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-zinc-500" />
              <div>
                <p className="text-xs text-zinc-400">Email</p>
                <p className="text-sm text-zinc-200">{user?.emailAddresses?.[0]?.emailAddress || '—'}</p>
              </div>
            </div>
          </div>

          {/* Plan */}
          <div className="p-4 flex items-center justify-between bg-zinc-900/30">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-zinc-500" />
              <div>
                <p className="text-xs text-zinc-400">Plan</p>
                <p className="text-sm text-zinc-200 capitalize">{tier}</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard/billing')}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
            >
              Manage <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Connections Section */}
      <div>
        <h2 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">Connections</h2>
        <div className="border border-zinc-800/50 rounded-lg overflow-hidden divide-y divide-zinc-800/30">
          {/* GitHub */}
          <div className="p-4 flex items-center justify-between bg-zinc-900/30">
            <div className="flex items-center gap-3">
              <Github className="w-4 h-4 text-zinc-500" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-zinc-400">GitHub</p>
                  {gitHub.connected && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                      <Check className="w-3 h-3" /> Connected
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-200">
                  {gitHub.loading ? 'Checking...' : gitHub.connected ? `@${gitHub.username}` : 'Not connected'}
                </p>
              </div>
            </div>
            {gitHub.connected ? (
              <button
                onClick={async () => {
                  await gitHub.disconnect()
                  await gitHub.refresh()
                }}
                className="text-[11px] text-zinc-500 hover:text-red-400 transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => gitHub.connect()}
                disabled={gitHub.loading}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
              >
                Connect
              </button>
            )}
          </div>
        </div>
        <p className="text-[10px] text-zinc-600 mt-2">
          Connect GitHub to push your projects directly to your repositories.
        </p>
      </div>

      {/* Preferences Section */}
      <div>
        <h2 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">Preferences</h2>
        <div className="border border-zinc-800/50 rounded-lg overflow-hidden divide-y divide-zinc-800/30">
          {/* Theme - placeholder for future */}
          <div className="p-4 flex items-center justify-between bg-zinc-900/30">
            <div>
              <p className="text-xs text-zinc-400">Theme</p>
              <p className="text-sm text-zinc-200">Dark</p>
            </div>
            <span className="text-[10px] text-zinc-600">Coming soon</span>
          </div>

          {/* Notifications - placeholder for future */}
          <div className="p-4 flex items-center justify-between bg-zinc-900/30">
            <div>
              <p className="text-xs text-zinc-400">Email notifications</p>
              <p className="text-sm text-zinc-200">Product updates and tips</p>
            </div>
            <span className="text-[10px] text-zinc-600">Coming soon</span>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div>
        <h2 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">Support</h2>
        <div className="border border-zinc-800/50 rounded-lg overflow-hidden bg-zinc-900/30">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-4 h-4 text-zinc-500" />
              <div>
                <p className="text-xs text-zinc-400">Need help?</p>
                <p className="text-sm text-zinc-200">Contact our support team</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/contact')}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
            >
              Contact <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone - placeholder */}
      <div>
        <h2 className="text-xs font-medium text-red-400/70 uppercase tracking-wider mb-3">Danger Zone</h2>
        <div className="border border-red-500/20 rounded-lg overflow-hidden bg-red-500/5">
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400">Delete account</p>
              <p className="text-[11px] text-zinc-500">Permanently delete your account and all data</p>
            </div>
            <button
              onClick={() => window.open('mailto:support@hatchit.dev?subject=Account%20Deletion%20Request', '_blank')}
              className="text-[11px] text-red-400/70 hover:text-red-400 transition-colors"
            >
              Request deletion
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
