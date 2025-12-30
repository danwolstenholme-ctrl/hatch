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
  title: 'HatchIt — AI Website Builder That Writes Real Code',
  description: 'Describe your website in plain English. Watch AI write real React + Tailwind code in real-time. Deploy in one click. No drag-and-drop, just code you actually own.',
  keywords: ['AI website builder', 'React', 'Tailwind CSS', 'code generator', 'web development', 'deploy website', 'build website fast', 'Claude AI', 'live code streaming'],
  authors: [{ name: 'HatchIt' }],
  creator: 'HatchIt',
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
    title: 'HatchIt — Describe it. Watch it build. Ship it.',
    description: 'The AI website builder that writes real React code. Not drag-and-drop. Real code you own. Built with Claude Sonnet 4.',
    images: [
      {
        url: '/assets/og-1200x630.png',
        width: 1200,
        height: 630,
        alt: 'HatchIt — AI Website Builder That Writes Real Code',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@HatchItD',
    creator: '@HatchItD',
    title: 'HatchIt — Describe it. Watch it build. Ship it. 🐣',
    description: 'The AI website builder that writes real React code. Not drag-and-drop garbage. Real code you own.',
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