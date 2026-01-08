// =============================================================================
// PROJECT SCAFFOLD GENERATOR
// Creates a complete Next.js 14 App Router project structure for user projects
// =============================================================================

export interface ProjectConfig {
  name: string
  slug: string
  description?: string
  brand?: {
    primaryColor?: string
    secondaryColor?: string
    font?: string
    headingFont?: string
    mode?: 'dark' | 'light'
    logo?: string
  }
  seo?: {
    title?: string
    description?: string
    keywords?: string
  }
  pages?: PageConfig[]
}

export interface PageConfig {
  name: string
  path: string // e.g., '/', '/about', '/contact'
  sections: string[] // Section IDs to include on this page
}

export interface ScaffoldFile {
  path: string
  content: string
}

// Default page structure for a website
export const DEFAULT_PAGES: PageConfig[] = [
  { name: 'Home', path: '/', sections: ['header', 'hero', 'services', 'testimonials', 'cta', 'footer'] },
  { name: 'About', path: '/about', sections: ['header', 'about', 'team', 'footer'] },
  { name: 'Services', path: '/services', sections: ['header', 'services', 'pricing', 'footer'] },
  { name: 'Contact', path: '/contact', sections: ['header', 'contact', 'footer'] },
]

// Generate all scaffold files for a project
export function generateProjectScaffold(config: ProjectConfig): ScaffoldFile[] {
  const files: ScaffoldFile[] = []
  const pages = config.pages || DEFAULT_PAGES
  
  // Extract navigation from pages
  const navLinks = pages.map(p => ({
    name: p.name,
    href: p.path
  }))

  // 1. Package.json
  files.push({
    path: 'package.json',
    content: JSON.stringify({
      name: config.slug,
      version: '1.0.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint'
      },
      dependencies: {
        'next': '14.2.0',
        'react': '18.2.0',
        'react-dom': '18.2.0',
        'framer-motion': '^11.0.0',
        'lucide-react': '^0.400.0',
        'clsx': '^2.1.0',
        'tailwind-merge': '^2.2.0'
      },
      devDependencies: {
        'typescript': '^5.3.0',
        '@types/node': '^20.0.0',
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0',
        'tailwindcss': '^3.4.0',
        'postcss': '^8.4.0',
        'autoprefixer': '^10.4.0',
        'eslint': '^8.0.0',
        'eslint-config-next': '14.2.0'
      }
    }, null, 2)
  })

  // 2. TypeScript config
  files.push({
    path: 'tsconfig.json',
    content: JSON.stringify({
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
        paths: {
          '@/*': ['./*']
        }
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules']
    }, null, 2)
  })

  // 3. Next.js config
  files.push({
    path: 'next.config.ts',
    content: `import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
}

export default nextConfig
`
  })

  // 4. Tailwind config with brand colors
  const primaryColor = config.brand?.primaryColor || '#10b981'
  const secondaryColor = config.brand?.secondaryColor || '#059669'
  const fontFamily = config.brand?.font || 'Inter'
  const headingFont = config.brand?.headingFont || fontFamily
  
  files.push({
    path: 'tailwind.config.ts',
    content: `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '${primaryColor}',
          50: '${adjustColor(primaryColor, 0.95)}',
          100: '${adjustColor(primaryColor, 0.9)}',
          200: '${adjustColor(primaryColor, 0.8)}',
          300: '${adjustColor(primaryColor, 0.6)}',
          400: '${adjustColor(primaryColor, 0.4)}',
          500: '${primaryColor}',
          600: '${adjustColor(primaryColor, -0.1)}',
          700: '${adjustColor(primaryColor, -0.2)}',
          800: '${adjustColor(primaryColor, -0.3)}',
          900: '${adjustColor(primaryColor, -0.4)}',
        },
        secondary: {
          DEFAULT: '${secondaryColor}',
          500: '${secondaryColor}',
        },
      },
      fontFamily: {
        sans: ['${fontFamily}', 'system-ui', 'sans-serif'],
        heading: ['${headingFont}', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
`
  })

  // 5. PostCSS config
  files.push({
    path: 'postcss.config.mjs',
    content: `/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

export default config
`
  })

  // 6. Global CSS
  const isDark = config.brand?.mode !== 'light'
  files.push({
    path: 'app/globals.css',
    content: `@tailwind base;
@tailwind components;
@tailwind utilities;

/* Import Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@400;500;600;700&family=${headingFont.replace(/ /g, '+')}:wght@400;500;600;700;800&display=swap');

:root {
  --primary: ${primaryColor};
  --secondary: ${secondaryColor};
  --background: ${isDark ? '#09090b' : '#ffffff'};
  --foreground: ${isDark ? '#fafafa' : '#09090b'};
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: '${fontFamily}', system-ui, sans-serif;
}

h1, h2, h3, h4, h5, h6 {
  font-family: '${headingFont}', system-ui, sans-serif;
}

/* Smooth page transitions */
.page-transition-enter {
  opacity: 0;
  transform: translateY(10px);
}

.page-transition-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 300ms, transform 300ms;
}
`
  })

  // 7. Root layout with fonts and metadata
  files.push({
    path: 'app/layout.tsx',
    content: `import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '${config.seo?.title || config.name}',
  description: '${config.seo?.description || config.description || `Welcome to ${config.name}`}',
  keywords: '${config.seo?.keywords || ''}',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="${isDark ? 'dark' : ''}">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
`
  })

  // 8. Utility functions (cn helper)
  files.push({
    path: 'lib/utils.ts',
    content: `import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`
  })

  // 9. Site configuration
  files.push({
    path: 'lib/config.ts',
    content: `// Site configuration - generated by HatchIt
export const siteConfig = {
  name: '${config.name}',
  description: '${config.description || ''}',
  url: 'https://yoursite.com', // Update after deployment
  
  // Navigation
  nav: ${JSON.stringify(navLinks, null, 4)},
  
  // Brand
  brand: {
    primaryColor: '${primaryColor}',
    secondaryColor: '${secondaryColor}',
    font: '${fontFamily}',
    headingFont: '${headingFont}',
    mode: '${config.brand?.mode || 'dark'}',
  },
  
  // Social links (update these)
  social: {
    twitter: '',
    linkedin: '',
    github: '',
  },
}
`
  })

  // 10. Sitemap
  files.push({
    path: 'app/sitemap.ts',
    content: `import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://yoursite.com' // Update after deployment
  
  return [
${pages.map(p => `    {
      url: \`\${baseUrl}${p.path === '/' ? '' : p.path}\`,
      lastModified: new Date(),
      changeFrequency: '${p.path === '/' ? 'daily' : 'weekly'}',
      priority: ${p.path === '/' ? '1' : '0.8'},
    },`).join('\n')}
  ]
}
`
  })

  // 11. Robots.txt
  files.push({
    path: 'app/robots.ts',
    content: `import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://yoursite.com/sitemap.xml', // Update after deployment
  }
}
`
  })

  // 12. Open Graph Image generation
  files.push({
    path: 'app/opengraph-image.tsx',
    content: `import { ImageResponse } from 'next/og'
import { siteConfig } from '@/lib/config'

export const runtime = 'edge'
export const alt = '${config.name}'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '${isDark ? '#09090b' : '#ffffff'}',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: '${primaryColor}',
              letterSpacing: '-0.02em',
            }}
          >
            {siteConfig.name}
          </div>
          <div
            style={{
              fontSize: 28,
              color: '${isDark ? '#a1a1aa' : '#52525b'}',
              maxWidth: '600px',
              textAlign: 'center',
            }}
          >
            {siteConfig.description}
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
`
  })

  // 13. Twitter Image (same as OG)
  files.push({
    path: 'app/twitter-image.tsx',
    content: `import { ImageResponse } from 'next/og'
import { siteConfig } from '@/lib/config'

export const runtime = 'edge'
export const alt = '${config.name}'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '${isDark ? '#09090b' : '#ffffff'}',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: '${primaryColor}',
              letterSpacing: '-0.02em',
            }}
          >
            {siteConfig.name}
          </div>
          <div
            style={{
              fontSize: 28,
              color: '${isDark ? '#a1a1aa' : '#52525b'}',
              maxWidth: '600px',
              textAlign: 'center',
            }}
          >
            {siteConfig.description}
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
`
  })

  // 14. Components directory structure
  // Header placeholder
  files.push({
    path: 'components/Header.tsx',
    content: `'use client'

// Header component - will be generated by HatchIt builder
// This is a placeholder that will be replaced when you build the Header section

import Link from 'next/link'
import { siteConfig } from '@/lib/config'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          {siteConfig.name}
        </Link>
        <div className="flex items-center gap-6">
          {siteConfig.nav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
`
  })

  // Footer placeholder
  files.push({
    path: 'components/Footer.tsx',
    content: `'use client'

// Footer component - will be generated by HatchIt builder
// This is a placeholder that will be replaced when you build the Footer section

import Link from 'next/link'
import { siteConfig } from '@/lib/config'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex gap-4">
            {siteConfig.nav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
`
  })

  // Sections directory with index
  files.push({
    path: 'components/sections/index.ts',
    content: `// Section components - generated by HatchIt builder
// Each section you build will be added here

export { default as Header } from '../Header'
export { default as Footer } from '../Footer'

// Add your generated sections here:
// export { default as Hero } from './Hero'
// export { default as Services } from './Services'
// etc.
`
  })

  // 15. Page templates for each route
  pages.forEach(page => {
    const pagePath = page.path === '/' ? 'app/page.tsx' : `app${page.path}/page.tsx`
    
    files.push({
      path: pagePath,
      content: `'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'

// Page: ${page.name}
// Sections: ${page.sections.join(', ')}

export default function ${page.name.replace(/\s+/g, '')}Page() {
  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Your generated sections will appear here */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">${page.name}</h1>
          <p className="text-muted-foreground">
            Build your ${page.name.toLowerCase()} sections in HatchIt to see them here.
          </p>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
`
    })
  })

  // 16. README
  files.push({
    path: 'README.md',
    content: `# ${config.name}

Built with [HatchIt.dev](https://hatchit.dev) - AI-powered website builder.

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see your site.

## Project Structure

\`\`\`
├── app/                 # Next.js App Router pages
│   ├── layout.tsx       # Root layout with fonts/metadata
│   ├── page.tsx         # Home page
│   ├── globals.css      # Global styles with brand colors
│   ├── sitemap.ts       # Auto-generated sitemap
│   └── robots.ts        # SEO robots config
├── components/          # React components
│   ├── Header.tsx       # Site header/navigation
│   ├── Footer.tsx       # Site footer
│   └── sections/        # Your generated sections
├── lib/                 # Utilities
│   ├── config.ts        # Site configuration
│   └── utils.ts         # Helper functions
└── public/              # Static assets
\`\`\`

## Deployment

Push to GitHub and import to [Vercel](https://vercel.com) for instant deployment.

---

Generated with ❤️ by [HatchIt.dev](https://hatchit.dev)
`
  })

  // 17. .gitignore
  files.push({
    path: '.gitignore',
    content: `# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage

# Next.js
.next/
out/

# Production
build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
`
  })

  // 18. ESLint config
  files.push({
    path: '.eslintrc.json',
    content: JSON.stringify({
      extends: ['next/core-web-vitals']
    }, null, 2)
  })

  // 19. next-env.d.ts
  files.push({
    path: 'next-env.d.ts',
    content: `/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
`
  })

  return files
}

// Helper to adjust color lightness (simple version)
function adjustColor(hex: string, factor: number): string {
  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  
  // Adjust
  const adjust = (c: number) => {
    if (factor > 0) {
      // Lighten
      return Math.round(c + (255 - c) * factor)
    } else {
      // Darken
      return Math.round(c * (1 + factor))
    }
  }
  
  const nr = Math.min(255, Math.max(0, adjust(r)))
  const ng = Math.min(255, Math.max(0, adjust(g)))
  const nb = Math.min(255, Math.max(0, adjust(b)))
  
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`
}

// Export scaffold as a JSON-serializable structure for DB storage
export function generateScaffoldJSON(config: ProjectConfig): Record<string, string> {
  const files = generateProjectScaffold(config)
  const result: Record<string, string> = {}
  
  for (const file of files) {
    result[file.path] = file.content
  }
  
  return result
}
