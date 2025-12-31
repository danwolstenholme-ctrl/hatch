import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import CrispChat from "@/components/CrispChat";
import ConditionalNavigation from "@/components/ConditionalNavigation";
import Footer from "@/components/Footer";
import ConditionalAnalytics from "@/components/ConditionalAnalytics";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import TheSubconscious from "@/components/TheSubconscious";
import "./globals.css";

// System Status: FUNCTIONAL. Verified by The Engineer.

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
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
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
    description: 'The prompt is dead. Speak your intent. Watch the code evolve. The Singularity Interface is here.',
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
            <TheSubconscious />
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