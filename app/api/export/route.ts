import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { AccountSubscription } from '@/types/subscriptions'
import { getProjectsByUserId, getProjectById } from '@/lib/db/projects'
import { generateProjectScaffold, ProjectConfig } from '@/lib/scaffold'

// =============================================================================
// EXPORT TO ZIP - Now with proper project scaffold!
// TIER: Architect+ (basic export), Visionary+ (full code export with assets)
// =============================================================================

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

  // Check tier - Architect or higher required
  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const accountSub = user.publicMetadata?.accountSubscription as AccountSubscription | undefined
  
  const hasExportAccess = ['architect', 'visionary', 'singularity'].includes(accountSub?.tier || '') || user.publicMetadata?.role === 'admin'
  
  if (!hasExportAccess) {
    return NextResponse.json({ 
      error: 'Code export requires Architect tier or higher', 
      requiresUpgrade: true,
      requiredTier: 'architect'
    }, { status: 403 })
  }

  const { code, pages, projectSlug, projectId, assets } = await req.json()

  if (!code && (!pages || pages.length === 0)) {
    return NextResponse.json({ error: 'No code or pages provided' }, { status: 400 })
  }
  if (pages && pages.length === 0) {
    return NextResponse.json({ error: 'No pages to export' }, { status: 400 })
  }

  if (!projectSlug && !projectId) {
    return NextResponse.json({ error: 'Project slug or ID required' }, { status: 400 })
  }

  // Verify project ownership and get project data
  let project = null
  try {
    const userProjects = await getProjectsByUserId(userId)
    const foundProject = userProjects.find((p: { slug: string; id: string }) => 
      p.slug === projectSlug || p.id === projectId
    )
    if (!foundProject) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 403 })
    }
    // Get full project with brand config
    project = await getProjectById(foundProject.id)
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

  const files: Record<string, string> = {}

  // Generate proper scaffold from project config
  const brandConfig = project?.brand_config as Record<string, string | undefined> | null
  
  const scaffoldConfig: ProjectConfig = {
    name: project?.name || 'My HatchIt Project',
    slug: project?.slug || 'my-hatchit-project',
    description: '', // Projects don't have description field yet
    brand: {
      primaryColor: brandConfig?.primaryColor || '#10b981',
      secondaryColor: brandConfig?.secondaryColor || '#059669',
      font: brandConfig?.font || 'Inter',
      headingFont: brandConfig?.headingFont || brandConfig?.font || 'Inter',
      mode: (brandConfig?.mode as 'dark' | 'light') || 'dark',
    },
    seo: {
      title: project?.name || 'My HatchIt Project',
      description: 'Built with HatchIt.dev',
    },
  }

  // Generate scaffold files
  const scaffoldFiles = generateProjectScaffold(scaffoldConfig)
  
  // Add scaffold files (but we'll override page.tsx with actual content)
  for (const file of scaffoldFiles) {
    // Skip page files - we'll add those with actual generated content
    if (!file.path.endsWith('page.tsx')) {
      files[file.path] = file.content
    }
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

  // Add page files with generated content
  if (pages && pages.length > 0) {
    // Multi-page project - export sections as individual component files
    const sectionComponents: Record<string, string> = {}
    
    pages.forEach((page: { path: string; code: string; sectionId?: string; name?: string }) => {
      const icons = extractLucideIcons(page.code)
      const lucideImport = icons.length > 0 ? `import { ${icons.join(', ')} } from 'lucide-react'` : ''
      
      // If this is a section, save it as a component
      if (page.sectionId) {
        const componentName = page.sectionId.charAt(0).toUpperCase() + page.sectionId.slice(1).replace(/-/g, '')
        sectionComponents[page.sectionId] = componentName
        
        files[`components/sections/${componentName}.tsx`] = `'use client'
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
${lucideImport}

${page.code}
`
      }
      
      // Still create page files
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
    
    // Update the sections index to export all generated sections
    if (Object.keys(sectionComponents).length > 0) {
      files['components/sections/index.ts'] = `// Section components - generated by HatchIt builder
export { default as Header } from '../Header'
export { default as Footer } from '../Footer'

// Generated sections:
${Object.entries(sectionComponents).map(([, name]) => 
  `export { default as ${name} } from './${name}'`
).join('\n')}
`
    }
  } else {
    // Single-page project
    const icons = extractLucideIcons(code)
    const lucideImport = icons.length > 0 ? `import { ${icons.join(', ')} } from 'lucide-react'` : ''
    
    files['app/page.tsx'] = `'use client'
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
${lucideImport}
import Component from '@/components/Generated'

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