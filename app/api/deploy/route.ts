import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { code, projectName } = await req.json()

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 })
    }

    const slug = projectName
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `site-${Date.now()}`

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
  description: 'Built with HatchIt',
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
        file: 'app/page.tsx',
        data: (() => {
          // Ensure proper Next.js page structure
          let pageCode = code
          
          // Add 'use client' if not present
          if (!pageCode.includes("'use client'")) {
            pageCode = `'use client'\n${pageCode}`
          }
          
          // Add all required React imports if not present
          if (!pageCode.includes('import')) {
            pageCode = pageCode.replace(
              "'use client'\n",
              "'use client'\nimport { useState, useEffect, useRef, useMemo, useCallback } from 'react'\n\n"
            )
          }
          
          // Ensure proper export default
          if (!pageCode.includes('export default')) {
            // Remove any trailing function or component declaration and re-export
            pageCode = pageCode.replace(/function\s+\w+\s*\(/, 'function Component(')
            pageCode = pageCode + '\n\nexport default Component'
          }
          
          return pageCode
        })()
      }
    ]

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