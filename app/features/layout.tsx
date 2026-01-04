import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'System Capabilities - HatchIt | Singularity Engine',
  description: 'Explore the capabilities of the Singularity Engine. Powered by Gemini 2.0 Flash, HatchIt offers autonomous architectural generation, real-time code streaming, and self-healing deployments.',
  keywords: [
    'AI website builder',
    'Singularity Engine',
    'Gemini 2.0 Flash',
    'React code generator',
    'autonomous web development',
    'self-healing code',
    'Next.js builder',
    'Tailwind CSS generator',
  ],
  openGraph: {
    title: 'System Capabilities - HatchIt | Singularity Engine',
    description: 'Autonomous website generation powered by Gemini 2.0 Flash. Experience the Singularity.',
    url: 'https://hatchit.dev/features',
    siteName: 'HatchIt',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'System Capabilities - HatchIt | Singularity Engine',
    description: 'Autonomous website generation powered by Gemini 2.0 Flash. Experience the Singularity.',
    creator: '@HatchItD',
  },
  alternates: {
    canonical: 'https://hatchit.dev/features',
  },
}

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
