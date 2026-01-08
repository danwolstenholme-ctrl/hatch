'use client'

import Link from 'next/link'

export default function DashboardFeaturesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold text-white">Features</h1>
        <p className="text-sm text-zinc-500">Your build pipeline and what it unlocks.</p>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-800/70 bg-zinc-900/40 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Pipeline</p>
          <p className="text-sm text-zinc-200 mt-1">AI → Your GitHub → Deploy → You own everything</p>
          <p className="text-xs text-zinc-500 mt-2">Ship from the builder via the Ship dropdown.</p>
        </div>

        <div className="rounded-lg border border-zinc-800/70 bg-zinc-900/40 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Component library</p>
          <p className="text-sm text-zinc-200 mt-1">Generation references prebuilt components</p>
          <p className="text-xs text-zinc-500 mt-2">Reduces generic layouts and keeps output consistent.</p>
        </div>

        <div className="rounded-lg border border-zinc-800/70 bg-zinc-900/40 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Deploy</p>
          <p className="text-sm text-zinc-200 mt-1">HatchIt deploys to Vercel infrastructure</p>
          <p className="text-xs text-zinc-500 mt-2">Custom domains are available on Visionary+.</p>
        </div>

        <div className="rounded-lg border border-zinc-800/70 bg-zinc-900/40 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Brand settings</p>
          <p className="text-sm text-zinc-200 mt-1">Site settings persist per project</p>
          <p className="text-xs text-zinc-500 mt-2">Open any project and use Site settings.</p>
        </div>
      </div>

      <div className="text-sm text-zinc-400">
        Manage access and upgrades in{' '}
        <Link href="/dashboard/billing" className="text-zinc-300 hover:text-white underline underline-offset-4">
          Billing
        </Link>
        .
      </div>
    </div>
  )
}
