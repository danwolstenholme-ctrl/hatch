import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { AccountSubscription } from '@/types/subscriptions'

interface Asset {
  name: string
  dataUrl: string
}

const MAX_ASSET_BYTES = 5_000_000
const MAX_ASSET_COUNT = 20

const sanitizeName = (name: string, fallback: string) => {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]/g, '-') || fallback
  return cleaned.replace(/\.{2,}/g, '-')
}

const parseDataUrl = (dataUrl: string) => {
  const match = dataUrl.match(/^data:([^;]+);base64,(.*)$/)
  if (!match) return null
  const [, mime, base64] = match
  try {
    return { mime, data: Buffer.from(base64, 'base64') }
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  // Authenticate user
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { code, pages, projectSlug, assets } = await req.json()

  if (!code && (!pages || pages.length === 0)) {
    return NextResponse.json({ error: 'No code or pages provided' }, { status: 400 })
  }
  if (pages && pages.length === 0) {
    return NextResponse.json({ error: 'No pages to export' }, { status: 400 })
  }

  if (!projectSlug) {
    return NextResponse.json({ error: 'Project slug required' }, { status: 400 })
  }

  const safeAssets: Asset[] = Array.isArray(assets) ? assets.slice(0, MAX_ASSET_COUNT) : []
  const assetFiles: Array<{ path: string; content: Buffer }> = []
  if (safeAssets.length > 0) {
    let assetBytes = 0
    for (const asset of safeAssets) {
      const parsed = parseDataUrl(asset.dataUrl)
      if (!parsed) continue
      assetBytes += parsed.data.length
      if (assetBytes > MAX_ASSET_BYTES) {
        return NextResponse.json({ error: 'Assets exceed 5MB total. Remove some files and try again.' }, { status: 400 })
      }
      const safeName = sanitizeName(asset.name, 'asset')
      assetFiles.push({ path: `public/assets/${safeName}`, content: parsed.data })
    }
  }

  // Check if user has an active account subscription
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const accountSubscription = user.publicMetadata?.accountSubscription as AccountSubscription | undefined
    
    if (!accountSubscription || accountSubscription.status !== 'active') {
      return NextResponse.json({ 
        error: 'Pro subscription required to download projects',
        requiresUpgrade: true 
      }, { status: 403 })
    }
  } catch {
    return NextResponse.json({ error: 'Failed to verify subscription' }, { status: 500 })
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
  title: "My HatchIt.dev Project",
  description: "Built with HatchIt.dev",
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

    'README.md': `# My HatchIt.dev Project

Built with [HatchIt.dev](https://hatchit.dev)

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

  // Add page files
  if (pages && pages.length > 0) {
    // Multi-page project
    pages.forEach((page: { path: string; code: string }) => {
      const pageCode = `'use client'
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'

${page.code}`
      
      if (page.path === '/') {
        files['app/page.tsx'] = pageCode
      } else {
        const routeName = page.path.slice(1)
        files[`app/${routeName}/page.tsx`] = pageCode
      }
    })
  } else {
    // Single-page project
    files['app/page.tsx'] = `'use client'
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Component from '@/components/Generated'

export default function Home() {
  return <Component />
}`
    
    files['components/Generated.tsx'] = `'use client'
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'

${code}`
  }

  const JSZip = (await import('jszip')).default
  const zip = new JSZip()

  for (const [path, content] of Object.entries(files)) {
    zip.file(path, content)
  }

  for (const asset of assetFiles) {
    zip.file(asset.path, asset.content)
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