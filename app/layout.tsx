import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import CrispChat from "@/components/CrispChat";
import ConditionalNavigation from "@/components/ConditionalNavigation";
import Footer from "@/components/Footer";
import ConditionalAnalytics from "@/components/ConditionalAnalytics";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import "./globals.css";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#09090b',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://hatchit.dev'),
  title: 'HatchIt | The Singularity Interface',
  description: 'Not just a website builder. A recursive, self-healing architectural system. Speak your intent, watch the code evolve. Welcome to the post-prompt era.',
  keywords: ['AI website builder', 'React', 'Tailwind CSS', 'The Architect', 'Singularity', 'Self-Healing Code', 'Direct Line API'],
  authors: [{ name: 'The Architect' }],
  creator: 'The Architect',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HatchIt',
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon.png', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hatchit.dev',
    siteName: 'HatchIt',
    title: 'HatchIt | The Singularity Interface',
    description: 'Not just a website builder. A recursive, self-healing architectural system.',
    images: [
      {
        url: '/assets/og-1200x630.png',
        width: 1200,
        height: 630,
        alt: 'HatchIt — The Architect',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@HatchItD',
    creator: '@HatchItD',
    title: 'HatchIt — The Architect | AI Website Builder',
    description: 'Initialize your next project with The Architect. A unified AI pipeline that builds, refines, and audits your code.',
    images: ['/assets/og-1200x630.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <SubscriptionProvider>
            <ServiceWorkerRegistration />
            <ConditionalNavigation />
            {children}
            <Footer />
            <CrispChat />
            <ConditionalAnalytics />
          </SubscriptionProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}