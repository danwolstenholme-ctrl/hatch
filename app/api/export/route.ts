import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { AccountSubscription } from '@/types/subscriptions'
import { getOrCreateUser } from '@/lib/db/users'
import { getProjectsByUserId } from '@/lib/db/projects'

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

  // Verify project ownership - SECURITY FIX
  try {
    const dbUser = await getOrCreateUser(userId)
    if (!dbUser) {
      return NextResponse.json({ error: 'Failed to verify user' }, { status: 500 })
    }
    
    const userProjects = await getProjectsByUserId(dbUser.id)
    const ownsProject = userProjects.some((p: { slug: string }) => p.slug === projectSlug)
    if (!ownsProject) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 403 })
    }
  } catch {
    return NextResponse.json({ error: 'Failed to verify project ownership' }, { status: 500 })
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

  // Check if user has active subscription (Architect, Visionary, or Singularity)
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const accountSubscription = user.publicMetadata?.accountSubscription as AccountSubscription | undefined
    
    // Export requires active subscription (Architect, Visionary, or Singularity)
    const hasAccess = accountSubscription?.status === 'active' && 
                      (accountSubscription.tier === 'architect' || accountSubscription.tier === 'visionary' || accountSubscription.tier === 'singularity')
    
    if (!hasAccess) {
      return NextResponse.json({ 
        error: 'Active subscription required to download code',
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
        next: '14.1.0',
        react: '18.2.0',
        'react-dom': '18.2.0',
        'framer-motion': '^11.0.0',
        'lucide-react': '^0.300.0'
      },
      devDependencies: {
        '@types/node': '^20',
        '@types/react': '^18',
        '@types/react-dom': '^18',
        tailwindcss: '^3.4.0',
        postcss: '^8.4.0',
        autoprefixer: '^10.4.0',
        typescript: '^5'
      }
    }, null, 2),

    'tsconfig.json': JSON.stringify({
      compilerOptions: {
        target: 'es5',
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

    'postcss.config.js': `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,

    'next.config.js': `/** @type {import('next').NextConfig} */
const nextConfig = {}
module.exports = nextConfig`,

    'app/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

html, body {
  height: 100%;
  width: 100%;
  margin: 0;
}`,

    'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,

    'app/layout.tsx': `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My HatchIt.dev Project",
  description: "Built with HatchIt.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  // Helper: Extract Lucide icon names from code
  const extractLucideIcons = (codeStr: string): string[] => {
    const lucideIconRegex = /<([A-Z][a-zA-Z0-9]*)\s/g
    const icons = new Set<string>()
    let match
    while ((match = lucideIconRegex.exec(codeStr)) !== null) {
      const name = match[1]
      // Exclude React/framer components
      if (!['AnimatePresence', 'Component', 'Fragment', 'Suspense'].includes(name)) {
        icons.add(name)
      }
    }
    return Array.from(icons)
  }

  // Add page files
  if (pages && pages.length > 0) {
    // Multi-page project
    pages.forEach((page: { path: string; code: string }) => {
      const icons = extractLucideIcons(page.code)
      const lucideImport = icons.length > 0 ? `import { ${icons.join(', ')} } from 'lucide-react'\n` : ''
      
      const pageCode = `'use client'
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
${lucideImport}
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
    const icons = extractLucideIcons(code)
    const lucideImport = icons.length > 0 ? `import { ${icons.join(', ')} } from 'lucide-react'\n` : ''
    
    files['app/page.tsx'] = `'use client'
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
${lucideImport}import Component from '@/components/Generated'

export default function Home() {
  return <Component />
}`
    
    files['components/Generated.tsx'] = `'use client'
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
${lucideImport}
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