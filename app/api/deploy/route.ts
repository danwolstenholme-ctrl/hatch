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

// Type for deployed project
interface DeployedProject {
  slug: string
  name: string
  code?: string
  pages?: PageToDeploy[]
  deployedAt: string
}

// Type for page to deploy
interface PageToDeploy {
  name: string
  path: string
  code: string
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code, pages, projectName } = await req.json()

    // Support both single-page (legacy) and multi-page projects
    if (!code && (!pages || pages.length === 0)) {
      return NextResponse.json({ error: 'No code or pages provided' }, { status: 400 })
    }

    // Sanitize and validate project name
    if (!projectName || typeof projectName !== 'string') {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 })
    }
    
    // Strip HTML/script tags and limit length
    const sanitizedName = projectName
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>'"&]/g, '') // Remove dangerous characters
      .trim()
      .slice(0, 100) // Limit length

    if (!sanitizedName || sanitizedName.length < 2) {
      return NextResponse.json({ error: 'Invalid project name' }, { status: 400 })
    }

    const slug = sanitizedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `site-${Date.now()}`

    // Verify this specific project has an active subscription
    const client = await clerkClient()
    let user = await client.users.getUser(userId)
    let subscriptions = (user.publicMetadata?.subscriptions as SiteSubscription[]) || []
    let projectSubscription = subscriptions.find(
      s => s.projectSlug === slug && s.status === 'active'
    )

    // If no subscription found, wait and retry once (handles race condition after checkout)
    if (!projectSubscription) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Refetch user data
      user = await client.users.getUser(userId)
      subscriptions = (user.publicMetadata?.subscriptions as SiteSubscription[]) || []
      projectSubscription = subscriptions.find(
        s => s.projectSlug === slug && s.status === 'active'
      )
    }

    if (!projectSubscription) {
      return NextResponse.json({ 
        error: 'Subscription required for this project',
        requiresUpgrade: true,
        projectSlug: slug
      }, { status: 403 })
    }

    // Create the file structure for deployment
    const files = [
      {
        file: 'package.json',
        data: JSON.stringify({
          name: slug,
          version: '1.0.0',
          private: true,
          scripts: {
            dev: 'next dev',
            build: 'next build',
            start: 'next start'
          },
          dependencies: {
            next: '^14.0.0',
            react: '^18.2.0',
            'react-dom': '^18.2.0'
          },
          devDependencies: {
            typescript: '^5.0.0',
            '@types/node': '^20.0.0',
            '@types/react': '^18.2.0',
            '@types/react-dom': '^18.2.0',
            tailwindcss: '^3.4.0',
            postcss: '^8.4.0',
            autoprefixer: '^10.4.0'
          }
        }, null, 2)
      },
      {
        file: 'next.config.js',
        data: `/** @type {import('next').NextConfig} */
const nextConfig = {}
module.exports = nextConfig`
      },
      {
        file: 'tailwind.config.js',
        data: `/** @type {import('tailwindcss').Config} */
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
}`
      },
      {
        file: 'postcss.config.js',
        data: `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`
      },
      {
        file: 'tsconfig.json',
        data: JSON.stringify({
          compilerOptions: {
            target: 'es5',
            lib: ['dom', 'dom.iterable', 'esnext'],
            allowJs: true,
            skipLibCheck: true,
            strict: false,
            noImplicitAny: false,
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
        }, null, 2)
      },
      {
        file: 'app/layout.tsx',
        data: `import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '${projectName || 'My Site'}',
  description: 'Built with HatchIt.dev',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`
      },
      {
        file: 'app/globals.css',
        data: `@tailwind base;
@tailwind components;
@tailwind utilities;`
      },
      {
        file: 'app/not-found.tsx',
        data: `export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-zinc-400 mb-8">Page not found</p>
        <a href="/" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
          Go Home
        </a>
      </div>
    </div>
  )
}`
      }
    ]
    
    // Helper function to prepare page code
    const preparePageCode = (pageCode: string) => {
      let prepared = pageCode
      
      // Add 'use client' if not present
      if (!prepared.includes("'use client'")) {
        prepared = `'use client'\n${prepared}`
      }
      
      // Add all required React imports if not present
      if (!prepared.includes('import')) {
        prepared = prepared.replace(
          "'use client'\n",
          "'use client'\nimport { useState, useEffect, useRef, useMemo, useCallback } from 'react'\n\n"
        )
      }
      
      // Ensure proper export default
      if (!prepared.includes('export default')) {
        prepared = prepared.replace(/function\s+\w+\s*\(/, 'function Component(')
        prepared = prepared + '\n\nexport default Component'
      }
      
      return prepared
    }
    
    // Add page files
    if (pages && pages.length > 0) {
      // Multi-page project - create a file for each page
      let hasRootPage = false
      
      pages.forEach((page: PageToDeploy) => {
        // Convert path to Next.js route
        // "/" -> "app/page.tsx"
        // "/about" -> "app/about/page.tsx"
        // "/contact" -> "app/contact/page.tsx"
        const filePath = page.path === '/' 
          ? 'app/page.tsx'
          : `app${page.path}/page.tsx`
        
        if (page.path === '/') hasRootPage = true
        
        files.push({
          file: filePath,
          data: preparePageCode(page.code)
        })
      })
      
      // If no root page, create a redirect to first page
      if (!hasRootPage && pages.length > 0) {
        const firstPagePath = pages[0].path
        files.push({
          file: 'app/page.tsx',
          data: `import { redirect } from 'next/navigation'

export default function Home() {
  redirect('${firstPagePath}')
}`
        })
      }
    } else {
      // Legacy single-page project
      files.push({
        file: 'app/page.tsx',
        data: preparePageCode(code)
      })
    }

    // Deploy to Vercel
    const response = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: slug,
        files: files.map(f => ({
          file: f.file,
          data: Buffer.from(f.data).toString('base64'),
          encoding: 'base64'
        })),
        projectSettings: {
          framework: 'nextjs'
        },
        target: 'production',
        alias: [`${slug}.hatchitsites.dev`]
      })
    })

    const deployment = await response.json()

    if (!response.ok) {
      console.error('Vercel API error:', deployment)
      return NextResponse.json(
        { error: deployment.error?.message || 'Deployment failed' },
        { status: response.status }
      )
    }

    // Store the deployed project with code in Clerk metadata
    try {
      const client = await clerkClient()
      const user = await client.users.getUser(userId)
      const existingDeployedProjects = (user.publicMetadata?.deployedProjects as DeployedProject[]) || []
      
      // Remove existing project with same slug if it exists, then add new one
      const updatedProjects = existingDeployedProjects.filter(p => p.slug !== slug)
      updatedProjects.push({
        slug,
        name: projectName || slug,
        code: pages && pages.length > 0 ? undefined : code,
        pages: pages && pages.length > 0 ? pages : undefined,
        deployedAt: new Date().toISOString()
      })

      await client.users.updateUser(userId, {
        publicMetadata: {
          ...user.publicMetadata,
          deployedProjects: updatedProjects,
        },
      })
    } catch (err) {
      console.error('Failed to store deployed project in metadata:', err)
      // Don't fail the deployment if metadata update fails
    }

    // Return the clean URL
    const url = `https://${slug}.hatchitsites.dev`
    
    return NextResponse.json({
      success: true,
      url,
      deploymentId: deployment.id
    })

  } catch (error) {
    console.error('Deploy error:', error)
    return NextResponse.json(
      { error: 'Deployment failed' },
      { status: 500 }
    )
  }
}