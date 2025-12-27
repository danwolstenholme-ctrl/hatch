import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
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
  title: 'HatchIt.dev — Describe. Build. Ship.',
  description: 'Turn your idea into a live website in 60 seconds. Just describe what you want — HatchIt builds it, you ship it.',
  keywords: ['AI website builder', 'React', 'Tailwind CSS', 'no-code', 'code generator', 'web development', 'deploy website', 'build website fast'],
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
    title: 'HatchIt.dev — Describe. Build. Ship.',
    description: 'Turn your idea into a live website in 60 seconds. Just describe what you want — HatchIt builds it, you ship it.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HatchIt.dev — Describe. Build. Ship.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HatchIt.dev — Describe. Build. Ship.',
    description: 'Turn your idea into a live website in 60 seconds. Just describe what you want — HatchIt builds it, you ship it.',
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