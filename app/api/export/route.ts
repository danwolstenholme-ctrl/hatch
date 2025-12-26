import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'

// Type for site subscription
interface SiteSubscription {
  projectSlug: string
  projectName: string
  stripeSubscriptionId: string
  status: 'active' | 'canceled' | 'past_due'
  createdAt: string
}

export async function POST(req: NextRequest) {
  // Authenticate user
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { code, projectSlug } = await req.json()

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 })
  }

  if (!projectSlug) {
    return NextResponse.json({ error: 'Project slug required' }, { status: 400 })
  }

  // Check if this specific project has an active subscription
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const subscriptions = (user.publicMetadata?.subscriptions as SiteSubscription[]) || []
    const projectSubscription = subscriptions.find(
      s => s.projectSlug === projectSlug && s.status === 'active'
    )
    
    if (!projectSubscription) {
      return NextResponse.json({ 
        error: 'Subscription required for this project to download',
        requiresUpgrade: true 
      }, { status: 403 })
    }
  } catch {
    return NextResponse.json({ error: 'Failed to verify subscription' }, { status: 500 })
  }

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 })
  }

  const files: Record<string, string> = {
    'package.json': JSON.stringify({
      name: 'my-hatchit-project',
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'eslint'
      },
      dependencies: {
        next: '16.1.1',
        react: '19.2.3',
        'react-dom': '19.2.3'
      },
      devDependencies: {
        '@tailwindcss/postcss': '^4',
        '@types/node': '^20',
        '@types/react': '^19',
        '@types/react-dom': '^19',
        tailwindcss: '^4',
        typescript: '^5'
      }
    }, null, 2),

    'tsconfig.json': JSON.stringify({
      compilerOptions: {
        target: 'ES2017',
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
        plugins: [{ name: 'next' }],
        paths: { '@/*': ['./*'] }
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules']
    }, null, 2),

    'postcss.config.mjs': `const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;`,

    'next.config.ts': `import type { NextConfig } from "next";
const nextConfig: NextConfig = {};
export default nextConfig;`,

    'app/globals.css': `@import "tailwindcss";

html, body {
  height: 100%;
  width: 100%;
  margin: 0;
}`,

    'app/layout.tsx': `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Hatchit Project",
  description: "Built with Hatchit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`,

    'app/page.tsx': `'use client'
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Component from '@/components/Generated'

export default function Home() {
  return <Component />
}`,

    'components/Generated.tsx': `'use client'
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'

${code}`,

    'README.md': `# My Hatchit Project

Built with [Hatchit](https://hatchit.dev)

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see your component.

## Deploy

Push to GitHub and connect to [Vercel](https://vercel.com) for instant deployment.
`
  }

  const JSZip = (await import('jszip')).default
  const zip = new JSZip()

  for (const [path, content] of Object.entries(files)) {
    zip.file(path, content)
  }

  const zipBuffer = await zip.generateAsync({ type: 'uint8array' })
  const blob = new Blob([zipBuffer as BlobPart], { type: 'application/zip' })

  return new Response(blob, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="hatchit-project.zip"'
    }
  })
}