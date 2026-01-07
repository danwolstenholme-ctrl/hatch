import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing | HatchIt',
  description: 'Pricing now lives inside the dashboard billing view. Visit dashboard → billing to manage your plan.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
