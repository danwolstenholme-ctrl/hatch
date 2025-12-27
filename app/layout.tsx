import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import CrispChat from "@/components/CrispChat";
import "./globals.css";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#09090b',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://hatchit.dev'),
  title: 'HatchIt.dev - AI Website Builder',
  description: 'Build production-ready React websites with AI. Describe what you want, get real code, deploy in one click.',
  keywords: ['AI website builder', 'React', 'Tailwind CSS', 'no-code', 'code generator', 'web development'],
  authors: [{ name: 'HatchIt.dev' }],
  creator: 'HatchIt.dev',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HatchIt.dev',
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hatchit.dev',
    siteName: 'HatchIt.dev',
    title: 'HatchIt.dev - AI Website Builder',
    description: 'Build production-ready React websites with AI. Describe what you want, get real code, deploy in one click.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HatchIt.dev - AI Website Builder',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HatchIt.dev - AI Website Builder',
    description: 'Build production-ready React websites with AI. Describe what you want, get real code, deploy in one click.',
    images: ['/og-image.png'],
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
          <ServiceWorkerRegistration />
          {children}
          <CrispChat />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}