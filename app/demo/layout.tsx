import type { Metadata } from 'next'
import { ReactNode } from 'react'
import ErrorBoundary from '@/components/ErrorBoundary'

export const metadata: Metadata = {
  title: 'Demo | HatchIt',
  description: 'Try HatchIt free. No signup required. Describe your website and watch AI build it in real-time.',
  openGraph: {
    title: 'Demo | HatchIt',
    description: 'Try HatchIt free. No signup required. Describe your website and watch AI build it.',
    url: 'https://hatchit.dev/demo',
    siteName: 'HatchIt',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Demo | HatchIt',
    description: 'Try HatchIt free. No signup required. Describe your website and watch AI build it.',
    creator: '@HatchItD',
  },
  alternates: {
    canonical: 'https://hatchit.dev/demo',
  },
}

export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-zinc-950 text-white">
        {children}
      </div>
    </ErrorBoundary>
  )
}
