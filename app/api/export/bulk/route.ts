import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { AccountSubscription } from '@/types/subscriptions'
import { getProjectsByUserId, getProjectById } from '@/lib/db/projects'
import { getSectionsByProjectId } from '@/lib/db/sections'
import { generateProjectScaffold, ProjectConfig } from '@/lib/scaffold'
import JSZip from 'jszip'

// =============================================================================
// BULK EXPORT API
// Export all user projects in a single ZIP file
// TIER: Singularity only
// =============================================================================

export async function POST() {
  const { userId } = await auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check tier - Singularity only
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const accountSub = user.publicMetadata?.accountSubscription as AccountSubscription | undefined
    const isAdmin = user.publicMetadata?.role === 'admin'
    
    if (accountSub?.tier !== 'singularity' && !isAdmin) {
      return NextResponse.json({ 
        error: 'Bulk export requires Singularity tier', 
        requiresUpgrade: true,
        requiredTier: 'singularity'
      }, { status: 403 })
    }

    // Get all user projects
    const projects = await getProjectsByUserId(userId)
    
    if (!projects || projects.length === 0) {
      return NextResponse.json({ error: 'No projects to export' }, { status: 400 })
    }

    const masterZip = new JSZip()
    let exportedCount = 0

    for (const projectMeta of projects) {
      try {
        const project = await getProjectById(projectMeta.id)
        if (!project) continue

        const sections = await getSectionsByProjectId(project.id)
        const completedSections = sections.filter(s => s.status === 'complete' && s.code)

        if (completedSections.length === 0) continue

        // Get brand config
        const brandConfig = project.brand_config as Record<string, string | undefined> | null

        // Generate project scaffold config
        const config: ProjectConfig = {
          name: project.name || 'HatchIt Project',
          slug: project.slug || project.id,
          description: '',
          brand: {
            primaryColor: brandConfig?.primaryColor || '#10b981',
            secondaryColor: brandConfig?.secondaryColor || '#059669',
            font: brandConfig?.font || 'Inter',
            headingFont: brandConfig?.headingFont || brandConfig?.font || 'Inter',
            mode: (brandConfig?.mode as 'dark' | 'light') || 'dark',
          },
          includeBranding: false, // Singularity = no branding
        }

        const scaffold = generateProjectScaffold(config)
        
        // Create folder for this project
        const projectFolder = masterZip.folder(sanitizeFolder(project.name || project.id))
        if (projectFolder) {
          // Add scaffold files
          for (const file of scaffold) {
            if (!file.path.endsWith('page.tsx')) {
              projectFolder.file(file.path, file.content)
            }
          }
          
          // Add main page with actual code
          const pageCode = `'use client'\n\nimport { motion } from 'framer-motion'\n\nexport default function Home() {\n  return (\n    <div className="min-h-screen bg-zinc-950 text-white">\n${completedSections.map(s => s.code).join('\n\n')}\n    </div>\n  )\n}`
          projectFolder.file('app/page.tsx', pageCode)
          
          exportedCount++
        }
      } catch (err) {
        console.error(`Failed to export project ${projectMeta.id}:`, err)
        // Continue with other projects
      }
    }

    if (exportedCount === 0) {
      return NextResponse.json({ error: 'No projects with completed sections to export' }, { status: 400 })
    }

    // Generate the master ZIP
    const zipBuffer = await masterZip.generateAsync({ 
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    })

    // Return the ZIP file
    return new NextResponse(zipBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="hatchit-projects-${Date.now()}.zip"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('Bulk export error:', error)
    return NextResponse.json({ error: 'Failed to export projects' }, { status: 500 })
  }
}

function sanitizeFolder(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50) || 'project'
}
