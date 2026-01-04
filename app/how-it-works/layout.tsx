import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Execution Sequence - HatchIt | The Singularity',
  description: 'The operational protocol of the Singularity Engine. From natural language directive to deployed entity in four phases.',
  keywords: [
    'AI website builder',
    'Singularity Engine',
    'autonomous coding',
    'React generation',
    'AI architect',
    'HatchIt protocol',
  ],
  openGraph: {
    title: 'Execution Sequence - HatchIt | The Singularity',
    description: 'From Concept to Entity in T-Minus Seconds. The Singularity Protocol.',
    url: 'https://hatchit.dev/how-it-works',
    siteName: 'HatchIt',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Execution Sequence - HatchIt | The Singularity',
    description: 'From Concept to Entity in T-Minus Seconds. The Singularity Protocol.',
    creator: '@HatchItD',
  },
  alternates: {
    canonical: 'https://hatchit.dev/how-it-works',
  },
}

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
