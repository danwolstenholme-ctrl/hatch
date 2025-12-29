import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Welcome | HatchIt',
  description: 'Welcome to HatchIt - Build beautiful websites with AI',
}

export default function WelcomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
