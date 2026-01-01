import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, JetBrains_Mono } from 'next/font/google';
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import ContactButton from "@/components/ContactButton";
import ConditionalNavigation from "@/components/ConditionalNavigation";
import Footer from "@/components/Footer";
import ConditionalAnalytics from "@/components/ConditionalAnalytics";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import TheSubconscious from "@/components/TheSubconscious";
import WelcomeModal from "@/components/WelcomeModal";
import "./globals.css";

// System Status: FUNCTIONAL. Verified by The Engineer.

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });

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
  },
  twitter: {
    card: 'summary_large_image',
    site: '@HatchItD',
    creator: '@HatchItD',
    title: 'HatchIt — The Architect | AI Website Builder',
    description: 'The prompt is dead. Speak your intent. Watch the code evolve. The Singularity Interface is here.',
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
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        elements: {
          rootBox: 'font-sans',
          card: 'bg-zinc-900 border border-emerald-900/50 shadow-[0_0_50px_rgba(16,185,129,0.1)]',
          headerTitle: 'text-white',
          headerSubtitle: 'text-zinc-400',
          formButtonPrimary: 'bg-emerald-600 hover:bg-emerald-500 text-white',
          formFieldInput: 'bg-zinc-900 border-zinc-800 focus:border-emerald-500 text-white',
          formFieldLabel: 'text-zinc-400',
          footerActionLink: 'text-emerald-500 hover:text-emerald-400',
          identityPreviewText: 'text-zinc-300',
          formFieldInputShowPasswordButton: 'text-zinc-400 hover:text-white',
          socialButtonsBlockButton: 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700',
          socialButtonsBlockButtonText: 'text-white',
          dividerLine: 'bg-zinc-800',
          dividerText: 'text-zinc-500',
          formFieldLabelRow: 'text-zinc-400',
          footer: 'text-zinc-400',
          footerActionText: 'text-zinc-400',
        }
      }}
    >
      <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <body className="font-sans antialiased bg-zinc-950 text-white selection:bg-emerald-500/30">
          <SubscriptionProvider>
            <TheSubconscious />
            <WelcomeModal />
            <ServiceWorkerRegistration />
            <ConditionalNavigation />
            {children}
            <Footer />
            <ContactButton />
            <ConditionalAnalytics />
          </SubscriptionProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}