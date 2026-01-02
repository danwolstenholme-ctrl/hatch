'use client'

import { useMemo, useState, useEffect, useRef, memo } from 'react'

interface Page {
  id: string
  name: string
  path: string
  code: string
}

interface Asset {
  name: string
  dataUrl: string
}

interface LivePreviewProps {
  code?: string
  pages?: Page[]
  currentPageId?: string
  isLoading?: boolean
  loadingProgress?: string  // Real-time generation status
  isPaid?: boolean
  assets?: Asset[]
  setShowHatchModal?: (show: boolean) => void
  inspectorMode?: boolean
  onElementSelect?: (elementInfo: ElementInfo) => void
  onViewCode?: () => void
  onRegenerate?: () => void
  onQuickFix?: () => void
}

interface ElementInfo {
  tagName: string
  className: string
  textContent: string
  styles: {
    color?: string
    backgroundColor?: string
    fontSize?: string
    fontWeight?: string
    padding?: string
    margin?: string
  }
}

const buildRouterStubs = (defaultPath: string) => `
// Safe useRouter that works both inside and outside components
const useRouter = (() => {
  // Module-level singleton state for non-component usage
  let _pathname = window.location.hash.slice(1) || "${defaultPath}";
  const _push = (path) => { window.location.hash = path; _pathname = path; };
  const _replace = (path) => { window.location.hash = path; _pathname = path; };
  
  // Listen for hash changes globally
  window.addEventListener("hashchange", () => { _pathname = window.location.hash.slice(1) || "${defaultPath}"; });
  
  return () => {
    // Try to use React state if we're inside a component, otherwise return static values
    try {
      const [currentPath, setCurrentPath] = useState(_pathname);
      useEffect(() => {
        const handleHashChange = () => setCurrentPath(window.location.hash.slice(1) || "${defaultPath}");
        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
      }, []);
      return { push: _push, replace: _replace, pathname: currentPath, query: {}, asPath: currentPath };
    } catch (e) {
      // Not inside a component - return static router object
      return { push: _push, replace: _replace, pathname: _pathname, query: {}, asPath: _pathname };
    }
  };
})();
const useSearchParams = () => { try { return new URLSearchParams(window.location.search); } catch(e) { return new URLSearchParams(); } };
const usePathname = () => { try { return window.location.hash.slice(1) || "${defaultPath}"; } catch(e) { return "${defaultPath}"; } };
`;

function LivePreview({ code, pages, currentPageId, isLoading = false, loadingProgress, isPaid = false, assets = [], setShowHatchModal, inspectorMode = false, onElementSelect, onViewCode, onRegenerate, onQuickFix }: LivePreviewProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [previewError, setPreviewError] = useState<{ type: string; message: string } | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Truncation detection - check if code was cut off mid-generation
  const detectTruncation = (codeToCheck: string): { isTruncated: boolean; reason: string } | null => {
    if (!codeToCheck || codeToCheck.length < 50) return null
    
    const trimmed = codeToCheck.trim()
    
    // Check for code ending mid-word (letters followed by nothing)
    if (/[a-zA-Z]$/.test(trimmed) && !/(?:return|const|let|var|function|true|false|null|undefined)$/.test(trimmed)) {
      // Check if it looks like it was cut mid-identifier
      const lastLine = trimmed.split('\n').pop() || ''
      if (!/[;{})\]>]$/.test(lastLine.trim()) && !/^\s*\/\//.test(lastLine)) {
        return { isTruncated: true, reason: 'Code appears to end mid-word' }
      }
    }
    
    // Count brackets and braces
    const openBraces = (trimmed.match(/\{/g) || []).length
    const closeBraces = (trimmed.match(/\}/g) || []).length
    const openParens = (trimmed.match(/\(/g) || []).length
    const closeParens = (trimmed.match(/\)/g) || []).length
    const openBrackets = (trimmed.match(/\[/g) || []).length
    const closeBrackets = (trimmed.match(/\]/g) || []).length
    
    if (openBraces > closeBraces + 2) {
      return { isTruncated: true, reason: `Unclosed braces (${openBraces - closeBraces} unclosed)` }
    }
    if (openParens > closeParens + 2) {
      return { isTruncated: true, reason: `Unclosed parentheses (${openParens - closeParens} unclosed)` }
    }
    if (openBrackets > closeBrackets + 2) {
      return { isTruncated: true, reason: `Unclosed brackets (${openBrackets - closeBrackets} unclosed)` }
    }
    
    // Check for unclosed JSX tags (simplified check)
    const jsxOpenTags = trimmed.match(/<([A-Z][a-zA-Z]*|[a-z]+)[^>]*(?<!\/)\s*>/g) || []
    const jsxCloseTags = trimmed.match(/<\/[A-Za-z]+>/g) || []
    const selfClosing = trimmed.match(/<[A-Za-z][^>]*\/>/g) || []
    
    // Very rough heuristic - if way more opens than closes
    if (jsxOpenTags.length > jsxCloseTags.length + selfClosing.length + 5) {
      return { isTruncated: true, reason: 'Unclosed JSX tags detected' }
    }
    
    // Check if ends with incomplete patterns
    if (/(?:className|style|onClick|onChange|href|src)=["']?[^"']*$/.test(trimmed)) {
      return { isTruncated: true, reason: 'Code ends with incomplete attribute' }
    }
    
    if (/(?:return|=>)\s*\(?[\s\n]*$/.test(trimmed)) {
      return { isTruncated: true, reason: 'Code ends with incomplete return statement' }
    }
    
    return null
  }


  // Listen for error and inspector messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'element-selected' && inspectorMode && onElementSelect) {
        onElementSelect(event.data.elementInfo)
      }
      if (event.data?.type === 'preview-error') {
        setPreviewError({
          type: event.data.errorType || 'Runtime Error',
          message: event.data.message || 'Unknown error occurred'
        })
      }
    }
    
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [inspectorMode, onElementSelect])

  // Inject/remove inspector script when mode changes
  useEffect(() => {
    if (!iframeRef.current?.contentWindow) return
    
    try {
      iframeRef.current.contentWindow.postMessage({ 
        type: 'inspector-mode', 
        enabled: inspectorMode 
      }, '*')
    } catch {
      // Iframe may not be ready
    }
  }, [inspectorMode, iframeLoaded])

  // Download trigger listener - intentionally stable to avoid re-registering
  useEffect(() => {
    const handleDownloadTrigger = () => {
      downloadZip()
    }
    
    window.addEventListener('triggerDownload', handleDownloadTrigger)
    return () => window.removeEventListener('triggerDownload', handleDownloadTrigger)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty deps - downloadZip reads current state via closure

  const downloadZip = async () => {
    if (!isPaid) {
      setShowHatchModal?.(true)
      return
    }
    if (!code && (!pages || pages.length === 0)) {
      alert('Nothing to download: no pages or code available')
      return
    }
    if (pages && pages.length === 0) {
      alert('Nothing to download: pages list is empty')
      return
    }

    const decodeDataUrl = (dataUrl: string) => {
      const match = dataUrl.match(/^data:([^;]+);base64,(.*)$/)
      if (!match) return null
      const [, mime, base64] = match
      try {
        const binary = atob(base64)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
        return { mime, bytes }
      } catch {
        return null
      }
    }

    const sanitizeName = (name: string, fallback: string) => {
      const cleaned = name.replace(/[^a-zA-Z0-9._-]/g, '-') || fallback
      return cleaned.replace(/\.{2,}/g, '-')
    }
    
    try {
      // Dynamically import JSZip
      const JSZipModule = await import('jszip')
      const JSZip = JSZipModule.default || JSZipModule
      const zip = new JSZip()
      
      // Package.json
      zip.file('package.json', JSON.stringify({
        name: 'hatchit-project',
        version: '1.0.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'next lint'
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
      }, null, 2))
      
      // Next config
      zip.file('next.config.js', `/** @type {import('next').NextConfig} */
const nextConfig = {}
module.exports = nextConfig`)
      
      // Tailwind config
      zip.file('tailwind.config.js', `/** @type {import('tailwindcss').Config} */
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
}`)
      
      // PostCSS config
      zip.file('postcss.config.js', `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`)
      
      // TypeScript config
      zip.file('tsconfig.json', JSON.stringify({
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
      }, null, 2))
      
      // .gitignore
      zip.file('.gitignore', `# Dependencies
node_modules
.pnp
.pnp.js

# Next.js
.next
out

# Production
build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*

# Local env
.env*.local

# TypeScript
*.tsbuildinfo
next-env.d.ts`)
      
      // README
      zip.file('README.md', `# HatchIt.dev Project

This project was built with [HatchIt.dev](https://hatchit.dev).

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy

The easiest way to deploy is with [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
`)

      const assetsToInclude = Array.isArray(assets) ? assets.slice(0, 20) : []
      let assetBytes = 0
      if (assetsToInclude.length > 0) {
        const assetFolder = zip.folder('public/assets')
        for (const asset of assetsToInclude) {
          const decoded = decodeDataUrl(asset.dataUrl)
          if (!decoded) continue
          assetBytes += decoded.bytes.length
          if (assetBytes > 5_000_000) {
            alert('Assets exceed 5MB. Remove some files and try again.')
            return
          }
          const safeName = sanitizeName(asset.name, 'asset')
          assetFolder?.file(safeName, decoded.bytes)
        }
      }
      
      // App folder
      const app = zip.folder('app')
      
      // Layout
      app?.file('layout.tsx', `import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HatchIt.dev Project',
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
}`)
      
      // Global CSS
      app?.file('globals.css', `@tailwind base;
@tailwind components;
@tailwind utilities;`)
      
      // Add page files - multi-page or single-page
      if (pages && pages.length > 0) {
        // Multi-page project
        pages.forEach(page => {
          const pageCode = page.code.includes("'use client'") 
            ? page.code 
            : `'use client'\nimport { useState, useEffect } from 'react'\n\n${page.code}`
          
          if (page.path === '/') {
            app?.file('page.tsx', pageCode)
          } else {
            // Create folder for route: /about -> about/page.tsx
            const routeName = page.path.slice(1) // Remove leading /
            const pageFolder = app?.folder(routeName)
            pageFolder?.file('page.tsx', pageCode)
          }
        })
      } else if (code) {
        // Single-page project (legacy)
        const pageCode = code.includes("'use client'") ? code : `'use client'\nimport { useState, useEffect } from 'react'\n\n${code}`
        app?.file('page.tsx', pageCode)
      }
      
      // Generate and download
      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'hatchit-project.zip'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download project')
    }
  }

  // Reset iframe state when content changes - OUTSIDE of useMemo to avoid render loops
  useEffect(() => {
    setIframeLoaded(false)
    setPreviewError(null)
  }, [code, pages, currentPageId])

  const srcDoc = useMemo(() => {
    // Multi-page mode
    if (pages && pages.length > 0) {
      const currentPage = pages.find(p => p.id === currentPageId) || pages[0]
      const displayCode = currentPage?.code || ''
      
      // Handle empty code - show helpful message
      if (!displayCode || displayCode.trim().length === 0) {
        return '<!DOCTYPE html><html><body style="background: #18181b; height: 100vh; display: flex; align-items: center; justify-content: center;">' +
          '<div style="text-align: center; color: #71717a; font-family: system-ui;">' +
          '<div style="font-size: 3rem; margin-bottom: 1rem;">🐣</div>' +
          '<h2 style="color: white; margin-bottom: 0.5rem; font-size: 1.25rem;">Ready to build</h2>' +
          '<p>Switch to <strong style="color: #60a5fa;">Build</strong> mode and describe what you want to create</p>' +
          '</div></body></html>'
      }
      
      // Check for truncation
      const truncationCheck = detectTruncation(displayCode)
      if (truncationCheck?.isTruncated) {
        return '<!DOCTYPE html><html><body style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem;">' +
          '<div style="text-align: center; color: #71717a; font-family: system-ui; max-width: 400px;">' +
          '<div style="font-size: 3rem; margin-bottom: 1rem;">✂️</div>' +
          '<h2 style="color: white; margin-bottom: 0.5rem; font-size: 1.25rem;">Response was cut off</h2>' +
          '<p style="color: #a1a1aa; margin-bottom: 0.5rem;">The AI response was truncated before completion.</p>' +
          '<p style="color: #f97316; font-size: 0.875rem; background: rgba(249, 115, 22, 0.1); padding: 0.5rem 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">' + truncationCheck.reason + '</p>' +
          '<p style="color: #71717a; font-size: 0.875rem;">Try a shorter prompt or click Regenerate to try again.</p>' +
          '</div></body></html>'
      }
      
      if (displayCode.length > 50000) {
        return '<!DOCTYPE html><html><body>' +
          '<div style="color: #f87171; padding: 2rem; font-family: monospace; line-height: 1.6; background: #18181b; height: 100vh; display: flex; align-items: center; justify-content: center;">' +
          '<div style="max-width: 500px;">' +
          '<div style="font-size: 2rem; margin-bottom: 1rem;">⚠️</div>' +
          '<h2 style="color: white; margin-bottom: 0.5rem; font-size: 1.25rem;">Code Too Large</h2>' +
          '<p>The generated code is ' + Math.round(displayCode.length / 1000) + 'KB, which exceeds the preview limit of 50KB.</p>' +
          '</div></div></body></html>'
      }
      
      const hooksDestructure = 'const { useState, useEffect, useMemo, useCallback, useRef } = React;'
      const routerStubs = buildRouterStubs(currentPage.path)

      // Extract all Lucide imports to ensure they are available
      const allLucideImports = new Set<string>();
      // Add default icons that are commonly used
      ['ArrowRight', 'ArrowLeft', 'Check', 'X', 'Menu', 'ChevronDown', 'ChevronUp', 'Loader', 'Search', 'User', 'Settings', 'Info', 'AlertCircle'].forEach(i => allLucideImports.add(i));
      
      if (pages) {
        pages.forEach(page => {
          const lucideImportRegex = /import\s+\{(.*?)\}\s+from\s+['"]lucide-react['"]/g;
          let match;
          while ((match = lucideImportRegex.exec(page.code)) !== null) {
            match[1].split(',').forEach(s => {
              const name = s.trim().replace(/^type\s+/, ''); // Remove 'type' keyword if present
              if (name && /^[A-Z]/.test(name)) allLucideImports.add(name);
            });
          }
        });
      }
      
      const iconAssignments = Array.from(allLucideImports).map(name => {
        if (name === 'Image') return 'var ImageIcon = window.LucideIcons.Image;';
        if (name === 'Link') return 'var LinkIcon = window.LucideIcons.Link;';
        return `var ${name} = window.LucideIcons.${name};`;
      }).join('\n');



      // Build components directly in the Babel script (so JSX gets transpiled)
      const pageComponents = pages.map((page, idx) => {
        // Look for actual function components (arrow functions or function declarations that return JSX)
        // Priority 1: Arrow function components: const Name = () => { or const Name = () => (
        const arrowFnRegex = /(?:const|let|var)\s+([A-Z][a-zA-Z0-9]*)\s*=\s*(?:\([^)]*\)|[a-zA-Z_][a-zA-Z0-9_]*)\s*=>/g
        // Priority 2: Function declarations: function Name(
        const funcDeclRegex = /function\s+([A-Z][a-zA-Z0-9]*)\s*\(/g
        // Priority 3: Fallback - any capitalized const/let/var (less reliable)
        const fallbackRegex = /(?:const|let|var)\s+([A-Z][a-zA-Z0-9]*)(?:\s*[=:(])/g
        
        const arrowMatches = Array.from(page.code.matchAll(arrowFnRegex))
        const funcMatches = Array.from(page.code.matchAll(funcDeclRegex))
        const fallbackMatches = Array.from(page.code.matchAll(fallbackRegex))
        
        // Prefer arrow functions, then function declarations, then fallback
        let componentName = `Page${idx}`
        if (arrowMatches.length > 0) {
          componentName = arrowMatches[0][1]
        } else if (funcMatches.length > 0) {
          componentName = funcMatches[0][1]
        } else if (fallbackMatches.length > 0) {
          // Filter out common non-component names
          const nonComponents = ['Theme', 'Config', 'Settings', 'Options', 'Data', 'Props', 'State', 'Context', 'Provider', 'Store', 'Schema', 'Type', 'Interface', 'Const', 'Enum']
          const validMatch = fallbackMatches.find(m => !nonComponents.includes(m[1]))
          if (validMatch) componentName = validMatch[1]
        }

        const cleanedCode = page.code
          // Remove markdown artifacts
          .replace(/```tsx/g, '')
          .replace(/```typescript/g, '')
          .replace(/```/g, '')
          // Remove all import statements (default, named, side-effect, multi-line)
          .replace(/import\s+(?:[\s\S]*?)\s+from\s*['"][^'"]+['"]\s*;?/g, '')
          .replace(/import\s*['"][^'"]+['"]\s*;?/g, '')
          // Remove TypeScript types
          .replace(/interface\s+\w+\s*\{[\s\S]*?\}/g, '')
          .replace(/type\s+\w+\s*=[^;]+;/g, '')
          .replace(/\s+as\s+[A-Za-z][A-Za-z0-9\[\]<>|&\s,'_]*/g, '')
          .replace(/(useState|useRef|useMemo|useCallback|useEffect)<[^>]+>/g, '$1')
          .replace(/:\s*(React\.)?FC(<[^>]*>)?/g, '')
          .replace(/:\s*[A-Z][A-Za-z0-9\[\]<>|&\s,']*(?=\s*=\s*[\[{(])/g, '')
          .replace(/(\(\s*\w+):\s*(?:keyof\s+|typeof\s+|readonly\s+)?[A-Z][^,)]*(?=[,)])/g, '$1')
          .replace(/,(\s*\w+):\s*(?:keyof\s+|typeof\s+|readonly\s+)?[A-Z][^,)]*(?=[,)])/g, ',$1')
          .replace(/(\(\s*\w+):\s*(?:string|number|boolean|any|void|never|unknown)(?:\[\])?(?=[,)])/g, '$1')
          .replace(/,(\s*\w+):\s*(?:string|number|boolean|any|void|never|unknown)(?:\[\])?(?=[,)])/g, ',$1')
          .replace(/\):\s*[A-Za-z][A-Za-z0-9\[\]<>|&\s,']*(?=\s*[{=])/g, ')')
          // Handle anonymous default exports by giving them a name
          .replace(/export\s+default\s+function\s*\(/g, 'function Default(')
          .replace(/export\s+default\s+/g, '')
          .replace(/export\s+/g, '')
          .replace(/React\.useState/g, 'useState')
          .replace(/React\.useEffect/g, 'useEffect')
          .replace(/React\.useMemo/g, 'useMemo')
          .replace(/React\.useCallback/g, 'useCallback')
          .replace(/React\.useRef/g, 'useRef')
          // Remove 'use client' directive
          .replace(/'use client'\s*;?/g, '')
          .replace(/"use client"\s*;?/g, '')
          // Remove React event types (e.g., e: React.FormEvent<HTMLFormElement>)
          .replace(/:\s*React\.\w+(?:Event|Handler)(?:<[^>]+>)?/g, '')
          // Remove HTML event types (e.g., e: FormEvent<HTMLFormElement>)
          .replace(/:\s*(?:Form|Mouse|Keyboard|Change|Focus|Touch|Input|Submit|Click)Event(?:<[^>]+>)?/g, '')
          // Remove generic Event types
          .replace(/:\s*(?:Event|SyntheticEvent)(?:<[^>]+>)?/g, '')

        return {
          path: page.path,
          componentName,
          cleanedCode
        }
      })

      // Generate the page component definitions (will be transpiled by Babel)
      const pageDefinitions = pageComponents.map((page, idx) => `
// Page: ${page.path}
const PageComponent${idx} = (() => {
  try {
    ${page.cleanedCode}
    // Return the component - ONLY accept functions to avoid React #130
    if (typeof ${page.componentName} === "function") return ${page.componentName};
    if (typeof Component === "function") return Component;
    if (typeof App === "function") return App;
    if (typeof Page === "function") return Page;
    if (typeof Home === "function") return Home;
    if (typeof Main === "function") return Main;
    if (typeof Index === "function") return Index;
    if (typeof Default === "function") return Default;
    
    // Safe fallback
    return function FallbackComponent() { return React.createElement("div", { className: "p-8 text-center text-zinc-500" }, "Component loading..."); };
  } catch (e) {
    console.error("Error in page ${page.path}:", e);
    return function ErrorComponent() { return React.createElement("div", { className: "p-8 text-zinc-500" }, "Error: " + e.message); };
  }
})();
`).join('\n')

      // Generate the page registry
      const pageRegistry = pageComponents.map((page, idx) => 
        `  "${page.path}": PageComponent${idx}`
      ).join(',\n')

      const routerCode = `
      const pageRegistry = {
${pageRegistry}
      };

      const Router = () => {
        const [currentPath, setCurrentPath] = useState(window.location.hash.slice(1) || '${currentPage.path}');

        useEffect(() => {
          const handleHashChange = () => setCurrentPath(window.location.hash.slice(1) || '${currentPage.path}');
          window.addEventListener('hashchange', handleHashChange);
          return () => window.removeEventListener('hashchange', handleHashChange);
        }, []);
        
        // Find the component for this path
        const PageComponent = pageRegistry[currentPath] || pageRegistry['${currentPage.path}'] || pageRegistry['/'];
        
        // Strict safety check: ONLY render if it's a function
        // Objects with $$typeof are handled by React.createElement internally
        const isValidComponent = typeof PageComponent === 'function';
        
        if (isValidComponent) {
          try {
            return <PageComponent />;
          } catch (err) {
            console.error('[Preview] Render error:', err);
            window.parent.postMessage({ type: 'preview-error', errorType: 'Render Error', message: err.message }, '*');
            return (
              <div style={{ 
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', 
                minHeight: '100vh', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '2rem', 
                textAlign: 'center',
                fontFamily: 'system-ui, sans-serif'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
                <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Render Error</h2>
                <p style={{ color: '#f87171', maxWidth: '400px', fontFamily: 'monospace', fontSize: '0.875rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem' }}>{err.message}</p>
              </div>
            );
          }
        }

        // Invalid component - show helpful message instead of crashing
        console.warn('[Preview] Invalid component type:', typeof PageComponent, PageComponent);
        return (
          <div style={{ 
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '2rem', 
            textAlign: 'center',
            fontFamily: 'system-ui, sans-serif'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎨</div>
            <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Preview Loading...</h2>
            <p style={{ color: '#a1a1aa', maxWidth: '300px' }}>Your code is ready! Click the Code tab to view and edit.</p>
          </div>
        );
      };
      `

      // Theme config - Minimal defaults for preview environment
      const themeConfig = `
// Default Tailwind-compatible tokens
const colors = {
  cyan: { primary: '#06b6d4', bright: '#22d3ee', light: 'rgba(6, 182, 212, 0.08)' },
  background: { light: '#f4f4f5', white: '#ffffff', dark: '#09090b', darker: '#000000' },
  text: { primary: '#18181b', secondary: '#71717a', tertiary: '#a1a1aa', light: '#d4d4d8', white: '#ffffff' },
};

// Animation primitives
const easings = { smooth: [0.21, 0.47, 0.32, 0.98], bounce: [0.34, 1.56, 0.64, 1] };
const springs = {
  snappy: { type: 'spring', stiffness: 400, damping: 17 },
  bouncy: { type: 'spring', stiffness: 300, damping: 20 },
  smooth: { type: 'spring', stiffness: 100, damping: 15 },
};

// Helper components for preview compatibility
const GlassCard = ({ children, className }) => React.createElement('div', { className, style: { backdropFilter: 'blur(10px)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' } }, children);
`;;

      const html = '<!DOCTYPE html>' +
        '<html><head>' +
        '<script>' +
        '  window.onerror = function(msg, url, line, col, error) {' +
        '    console.error("[Preview Global Error]", msg, error);' +
        '    window.parent.postMessage({ type: "preview-error", errorType: "Runtime Error", message: msg + " (Line " + line + ")" }, "*");' +
        '    return false;' +
        '  };' +
        '  window.addEventListener("unhandledrejection", function(event) {' +
        '    console.error("[Preview Promise Error]", event.reason);' +
        '    window.parent.postMessage({ type: "preview-error", errorType: "Async Error", message: event.reason ? event.reason.message : "Unknown Async Error" }, "*");' +
        '  });' +
        '</script>' +
        '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">' +
        '<style>' +
        '* { margin: 0; padding: 0; box-sizing: border-box; }' +
        'html, body, #root { min-height: 100%; width: 100%; }' +
        'body { background: #09090b; font-family: "Inter", system-ui, sans-serif; }' +
        '.preview-loading { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(180deg, #09090b 0%, #18181b 100%); }' +
        '.preview-loading-spinner { width: 32px; height: 32px; border: 2px solid #27272a; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; }' +
        '@keyframes spin { to { transform: rotate(360deg); } }' +
        '.preview-loading-text { margin-top: 16px; color: #71717a; font-size: 13px; letter-spacing: 0.01em; }' +
        '.preview-fallback { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(180deg, #09090b 0%, #18181b 100%); padding: 32px; text-align: center; }' +
        '.preview-fallback-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2); border-radius: 100px; margin-bottom: 24px; }' +
        '.preview-fallback-badge-dot { width: 6px; height: 6px; background: #3b82f6; border-radius: 50%; animation: pulse 2s ease-in-out infinite; }' +
        '@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }' +
        '.preview-fallback-badge-text { color: #3b82f6; font-size: 11px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; }' +
        '.preview-fallback-title { color: #fafafa; font-size: 20px; font-weight: 600; margin-bottom: 8px; letter-spacing: -0.01em; }' +
        '.preview-fallback-desc { color: #71717a; font-size: 14px; line-height: 1.6; max-width: 320px; margin-bottom: 24px; }' +
        '.preview-fallback-hint { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #18181b; border: 1px solid #27272a; border-radius: 8px; }' +
        '.preview-fallback-hint-icon { color: #3b82f6; }' +
        '.preview-fallback-hint-text { color: #a1a1aa; font-size: 12px; }' +
        '</style>' +
        '</head><body>' +
        '<div id="root"><div class="preview-loading"><div class="preview-loading-spinner"></div><div class="preview-loading-text">Rendering preview...</div></div></div>' +
        // Load React first and expose globally IMMEDIATELY (lucide needs this during init)
        '<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>' +
        '<script>window.React = React; window.react = React;</script>' +
        '<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>' +
        '<script>window.ReactDOM = ReactDOM; window["react-dom"] = ReactDOM;</script>' +
        // Load Tailwind and configure IMMEDIATELY
        '<script src="https://cdn.tailwindcss.com"></script>' +
        '<script>if(typeof tailwind!=="undefined"){tailwind.config={theme:{extend:{}},darkMode:"class"};}</script>' +
        // Now load framer-motion and lucide (they can find React on window)
        '<script src="https://cdn.jsdelivr.net/npm/framer-motion@11/dist/framer-motion.js"></script>' +
        '<script src="https://unpkg.com/lucide-react@0.294.0/dist/umd/lucide-react.js"></script>' +
        '<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>' +
        '<script>' +
        'window.showFallback = function(reason) {' +
        '  document.getElementById("root").innerHTML = \'<div class="preview-fallback">\' +' +
        '    \'<div class="preview-fallback-badge"><div class="preview-fallback-badge-dot"></div><span class="preview-fallback-badge-text">Preview Mode</span></div>\' +' +
        '    \'<h2 class="preview-fallback-title">Complex Preview</h2>\' +' +
        '    \'<p class="preview-fallback-desc">This design uses advanced features. Export or deploy to see the full experience.</p>\' +' +
        '    \'<div class="preview-fallback-hint"><svg class="preview-fallback-hint-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg><span class="preview-fallback-hint-text">Your code is ready—ship it to see it live</span></div>\' +' +
        '  \'</div>\';' +
        '};' +
        '</script>' +
        '<script>' +
        '  // Force all preview links to open in a new tab to keep the sandbox intact' +
        '  document.addEventListener("click", function(e) {' +
        '    var anchor = e.target && e.target.closest ? e.target.closest("a") : null;' +
        '    if (!anchor) return;' +
        '    var href = anchor.getAttribute("href");' +
        '    if (!href || href.startsWith("#")) return;' +
        '    e.preventDefault();' +
        '    window.open(href, "_blank", "noopener,noreferrer");' +
        '  }, true);' +
        '</script>' +
        '<script>' +
        '// Setup globals with fallbacks\n' +
        '// FRAMER MOTION: ALWAYS use Proxy to ensure safe access\n' +
        '// Target must be a function to support motion(Component) usage\n' +
        'window.motion = new Proxy(function() {}, {\n' +
        '  get: function(target, tag) {\n' +
        '    // Try to get real framer-motion component\n' +
        '    if (window.Motion && window.Motion.motion && window.Motion.motion[tag]) {\n' +
        '      var realComponent = window.Motion.motion[tag];\n' +
        '      if (typeof realComponent === "function" || (typeof realComponent === "object" && realComponent && realComponent.$$typeof)) {\n' +
        '        return realComponent;\n' +
        '      }\n' +
        '    }\n' +
        '    // Fallback: return the HTML tag name as a string (React accepts strings for native elements)\n' +
        '    return tag;\n' +
        '  }\n' +
        '});\n' +
        'window.AnimatePresence = function AnimatePresenceFallback(props) {\n' +
        '  if (window.Motion && typeof window.Motion.AnimatePresence === "function") {\n' +
        '    return React.createElement(window.Motion.AnimatePresence, props);\n' +
        '  }\n' +
        '  return props.children || null;\n' +
        '};\n' +
        'window.useAnimation = function() {\n' +
        '  if (window.Motion && typeof window.Motion.useAnimation === "function") return window.Motion.useAnimation();\n' +
        '  return { start: function(){}, stop: function(){} };\n' +
        '};\n' +
        'window.useInView = function(ref, opts) {\n' +
        '  if (window.Motion && typeof window.Motion.useInView === "function") return window.Motion.useInView(ref, opts);\n' +
        '  return true;\n' +
        '};\n' +
        'window.useScroll = function(opts) {\n' +
        '  if (window.Motion && typeof window.Motion.useScroll === "function") return window.Motion.useScroll(opts);\n' +
        '  return { scrollY: { get: function(){ return 0; } }, scrollYProgress: { get: function(){ return 0; } } };\n' +
        '};\n' +
        'window.useTransform = function(v, i, o) {\n' +
        '  if (window.Motion && typeof window.Motion.useTransform === "function") return window.Motion.useTransform(v, i, o);\n' +
        '  return typeof v === "number" ? v : 0;\n' +
        '};\n' +
        'window.useSpring = function(v, opts) {\n' +
        '  if (window.Motion && typeof window.Motion.useSpring === "function") return window.Motion.useSpring(v, opts);\n' +
        '  return typeof v === "number" ? v : 0;\n' +
        '};\n' +
        'window.useMotionValue = function(v) {\n' +
        '  if (window.Motion && typeof window.Motion.useMotionValue === "function") return window.Motion.useMotionValue(v);\n' +
        '  return { get: function() { return v; }, set: function() {}, onChange: function(){} };\n' +
        '};\n' +
        '// LUCIDE ICONS: Create safe icon factory that ALWAYS returns a function\n' +
        'window.createSafeIcon = function(name) {\n' +
        '  return function SafeIcon(props) {\n' +
        '    var icons = window.lucideReact || window.lucide || {};\n' +
        '    var Icon = icons[name];\n' +
        '    if (typeof Icon === "function") {\n' +
        '      try { return React.createElement(Icon, props); } catch(e) { /* fall through */ }\n' +
        '    }\n' +
        '    // Fallback SVG if icon missing\n' +
        '    return React.createElement("svg", Object.assign({}, props, { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 }), \n' +
        '      React.createElement("rect", { x: 2, y: 2, width: 20, height: 20, rx: 2 }));\n' +
        '  };\n' +
        '};\n' +
        '// Pre-create all common icons\n' +
        'var iconNames = ["ArrowRight","ArrowLeft","ArrowUp","ArrowDown","Check","CheckCircle","CheckCircle2","Circle","X","Menu","ChevronDown","ChevronUp","ChevronLeft","ChevronRight","Plus","Minus","Search","Settings","User","Users","Mail","Phone","MapPin","Calendar","Clock","Star","Heart","Home","Globe","Layers","Lock","Award","BookOpen","Zap","Shield","Target","TrendingUp","BarChart","PieChart","Activity","Eye","EyeOff","Edit","Trash","Copy","Download","Upload","Share","Link","ExternalLink","Send","MessageCircle","Bell","AlertCircle","Info","HelpCircle","Loader","RefreshCw","RotateCcw","Save","FileText","Folder","Image","Play","Pause","Volume2","VolumeX","Mic","Video","Camera","Wifi","Battery","Sun","Moon","Cloud","Map","Compass","Flag","Bookmark","Tag","Hash","AtSign","Filter","Grid","List","LayoutGrid","Maximize","Minimize","MoreHorizontal","MoreVertical","Briefcase","Building","Cpu","Database","Server","Code","Terminal","GitBranch","Github","Linkedin","Twitter","Facebook","Instagram","Youtube","Sparkles","Box","ShoppingCart","CreditCard","DollarSign","Rocket","Package","Bot","Brain"];\n' +
        'var iconBase = {};\n' +
        'iconNames.forEach(function(name) { iconBase[name] = window.createSafeIcon(name); });\n' +
        '// Proxy for any icons (ensures we ALWAYS return a function, never undefined/object)\n' +
        'window.LucideIcons = new Proxy(iconBase, {\n' +
        '  get: function(target, prop) {\n' +
        '    if (typeof prop !== "string") return function() { return null; };\n' +
        '    if (prop in target) return target[prop];\n' +
        '    // Create new safe icon for unknown icon names\n' +
        '    target[prop] = window.createSafeIcon(prop);\n' +
        '    return target[prop];\n' +
        '  }\n' +
        '});\n' +
        '</script>' +
        // Inspector script - handles element selection when inspector mode is enabled
        '<script>' +
        '(function() {\n' +
        '  var inspectorEnabled = false;\n' +
        '  var highlightEl = null;\n' +
        '  var selectedEl = null;\n' +
        '  \n' +
        '  function createHighlight() {\n' +
        '    if (highlightEl) return;\n' +
        '    highlightEl = document.createElement("div");\n' +
        '    highlightEl.style.cssText = "position:fixed;pointer-events:none;z-index:99999;border:2px solid #8b5cf6;background:rgba(139,92,246,0.1);transition:all 0.15s ease;display:none;";\n' +
        '    document.body.appendChild(highlightEl);\n' +
        '  }\n' +
        '  \n' +
        '  function getElementInfo(el) {\n' +
        '    var computed = window.getComputedStyle(el);\n' +
        '    return {\n' +
        '      tagName: el.tagName.toLowerCase(),\n' +
        '      className: el.className || "",\n' +
        '      textContent: (el.textContent || "").slice(0, 100),\n' +
        '      styles: {\n' +
        '        color: computed.color,\n' +
        '        backgroundColor: computed.backgroundColor,\n' +
        '        fontSize: computed.fontSize,\n' +
        '        fontWeight: computed.fontWeight,\n' +
        '        padding: computed.padding,\n' +
        '        margin: computed.margin\n' +
        '      }\n' +
        '    };\n' +
        '  }\n' +
        '  \n' +
        '  function handleMouseMove(e) {\n' +
        '    if (!inspectorEnabled || !highlightEl) return;\n' +
        '    var el = e.target;\n' +
        '    if (el === highlightEl || el === document.body || el === document.documentElement) return;\n' +
        '    var rect = el.getBoundingClientRect();\n' +
        '    highlightEl.style.display = "block";\n' +
        '    highlightEl.style.top = rect.top + "px";\n' +
        '    highlightEl.style.left = rect.left + "px";\n' +
        '    highlightEl.style.width = rect.width + "px";\n' +
        '    highlightEl.style.height = rect.height + "px";\n' +
        '  }\n' +
        '  \n' +
        '  function handleClick(e) {\n' +
        '    if (!inspectorEnabled) return;\n' +
        '    e.preventDefault();\n' +
        '    e.stopPropagation();\n' +
        '    var el = e.target;\n' +
        '    if (el === highlightEl) return;\n' +
        '    selectedEl = el;\n' +
        '    highlightEl.style.borderColor = "#22c55e";\n' +
        '    highlightEl.style.background = "rgba(34,197,94,0.1)";\n' +
        '    window.parent.postMessage({ type: "element-selected", elementInfo: getElementInfo(el) }, "*");\n' +
        '  }\n' +
        '  \n' +
        '  function handleMouseLeave() {\n' +
        '    if (highlightEl) highlightEl.style.display = "none";\n' +
        '  }\n' +
        '  \n' +
        '  window.addEventListener("message", function(e) {\n' +
        '    if (e.data && e.data.type === "inspector-mode") {\n' +
        '      inspectorEnabled = e.data.enabled;\n' +
        '      if (inspectorEnabled) {\n' +
        '        createHighlight();\n' +
        '        document.body.style.cursor = "crosshair";\n' +
        '      } else {\n' +
        '        if (highlightEl) highlightEl.style.display = "none";\n' +
        '        document.body.style.cursor = "";\n' +
        '      }\n' +
        '    }\n' +
        '  });\n' +
        '  \n' +
        '  document.addEventListener("mousemove", handleMouseMove, true);\n' +
        '  document.addEventListener("click", handleClick, true);\n' +
        '  document.addEventListener("mouseleave", handleMouseLeave, true);\n' +
        '})();\n' +
        '</script>' +
        '<script>document.addEventListener("click", function(e) { var link = e.target.closest("a"); if (!link) return; var href = link.getAttribute("href"); if (!href) return; if (href.startsWith("http://") || href.startsWith("https://")) { e.preventDefault(); window.open(href, "_blank", "noopener,noreferrer"); return; } if (href.startsWith("/") && !href.startsWith("//")) { e.preventDefault(); window.location.hash = href; return; } if (href.startsWith("#") && !href.startsWith("#/")) { e.preventDefault(); var target = document.querySelector(href); if (target) target.scrollIntoView({ behavior: "smooth" }); else window.location.hash = "/" + href.slice(1); } if (href.startsWith("#/")) { e.preventDefault(); window.location.hash = href.slice(1); } });</script>' +
        '<script>' +
        '// Global error handler - communicate errors to parent and show fallback\n' +
        'window.onerror = function(msg, url, line, col, error) {' +
        '  var errorMsg = msg || "Unknown error";' +
        '  if (msg === "Script error." || msg === "Script error") {' +
        '    errorMsg = "Cross-origin script error (check browser console for details)";' +
        '  }' +
        '  console.error("Preview error:", errorMsg, "at line", line, "col", col, error);' +
        '  window.parent.postMessage({ type: "preview-error", errorType: "Runtime Error", message: errorMsg + " (Line: " + line + ")" }, "*");' +
        '  document.getElementById("root").innerHTML = ' +
        '    "<div class=\'fallback-container\'>" +' +
        '    "<div class=\'fallback-icon\'>🎨</div>" +' +
        '    "<h2 class=\'fallback-title\'>Preview Loading...</h2>" +' +
        '    "<p class=\'fallback-text\'>Your code is ready! Click the Code tab to view and edit.</p>" +' +
        '    "</div>";' +
        '  return true;' +
        '};' +
        '</script>' +
        '<script type="text/babel" data-presets="react,typescript">' +
        hooksDestructure + '\n' +
        routerStubs + '\n' +
        themeConfig + '\n' +
        'const motion = window.motion;\n' +
        'const AnimatePresence = window.AnimatePresence;\n' +
        'const useAnimation = window.useAnimation;\n' +
        'const useInView = window.useInView;\n' +
        'const useScroll = window.useScroll;\n' +
        'const useTransform = window.useTransform;\n' +
        'const useSpring = window.useSpring;\n' +
        'const useMotionValue = window.useMotionValue;\n' +
        '// Next.js module shims for Babel-evaluated code\n' +
        'var NextImage = (props) => {\n' +
        '  var { src, alt, className, style, fill, ...rest } = props;\n' +
        '  var fillStyle = fill ? { position: "absolute", height: "100%", width: "100%", inset: 0, objectFit: "cover", ...style } : style;\n' +
        '  return React.createElement("img", { src, alt: alt || "", className, style: fillStyle, ...rest });\n' +
        '};\n' +
        'var NextLink = ({ href, children, ...rest }) => React.createElement("a", { href, ...rest }, children);\n' +
        'var Image = NextImage;\n' +
        'var Link = NextLink;\n' +
        'var Head = ({ children }) => null;\n' +
        'var Script = (props) => null;\n' +
        '// Common utility stubs\n' +
        'var cn = (...args) => args.filter(Boolean).join(" ");\n' +
        'var clsx = cn;\n' +
        'var twMerge = (...args) => args.filter(Boolean).join(" ");\n' +
        'var cva = (base, config) => (props) => base;\n' +
        'var exports = {};\n' +
        'var module = { exports };\n' +
        'var require = (name) => {\n' +
        '  if (name === "react") return React;\n' +
        '  if (name === "react-dom") return ReactDOM;\n' +
        '  if (name === "framer-motion") return window.Motion || window.motion || {};\n' +
        '  if (name === "lucide-react") return window.LucideIcons || {};\n' +
        '  if (name === "next/image") return NextImage;\n' +
        '  if (name === "next/link") return NextLink;\n' +
        '  if (name === "next/navigation") return { useRouter, usePathname, useSearchParams };\n' +
        '  if (name === "next/head") return Head;\n' +
        '  if (name === "next/script") return Script;\n' +
        '  if (name.startsWith("next/font")) return { className: "", style: {} };\n' +
        '  if (name === "clsx" || name === "classnames") return cn;\n' +
        '  if (name === "tailwind-merge") return { twMerge: twMerge };\n' +
        '  if (name === "class-variance-authority") return { cva: cva };\n' +
        '  if (name.endsWith(".css") || name.endsWith(".scss") || name.endsWith(".sass")) return {};\n' +
        '  return {};\n' +
        '};\n' +
        '// Icons - access from window.LucideIcons which has safe fallbacks\n' +
        'var LucideIcons = window.LucideIcons;\n' +
        iconAssignments + '\n' +
        'try {\n' +
        '// Error Boundary class to catch render errors\n' +
        'class ErrorBoundary extends React.Component {\n' +
        '  constructor(props) { super(props); this.state = { hasError: false, error: null }; }\n' +
        '  static getDerivedStateFromError(error) { return { hasError: true, error }; }\n' +
        '  componentDidCatch(error, info) {\n' +
        '    console.error("ErrorBoundary caught:", error, info);\n' +
        '    window.parent.postMessage({ type: "preview-error", errorType: "Render Error", message: error.message }, "*");\n' +
        '  }\n' +
        '  render() {\n' +
        '    if (this.state.hasError) {\n' +
        '      return React.createElement("div", { style: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", padding: "2rem", textAlign: "center", fontFamily: "system-ui" } },\n' +
        '        React.createElement("div", { style: { fontSize: "4rem", marginBottom: "1rem" } }, "⚠️"),\n' +
        '        React.createElement("h2", { style: { color: "#fff", fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" } }, "Preview Error"),\n' +
        '        React.createElement("p", { style: { color: "#f87171", maxWidth: "400px", fontFamily: "monospace", fontSize: "0.875rem", background: "rgba(0,0,0,0.3)", padding: "1rem", borderRadius: "0.5rem" } }, this.state.error?.message || "Unknown error")\n' +
        '      );\n' +
        '    }\n' +
        '    return this.props.children;\n' +
        '  }\n' +
        '}\n' +
        pageDefinitions + '\n' +
        routerCode + '\n' +
        '  const root = ReactDOM.createRoot(document.getElementById("root"));\n' +
        '  root.render(React.createElement(ErrorBoundary, null, React.createElement(Router)));\n' +
        '} catch (err) {\n' +
        '  console.error("Render catch:", err);\n' +
        '  window.parent.postMessage({ type: "preview-error", errorType: "Render Error", message: err.message }, "*");\n' +
        '  document.getElementById("root").innerHTML = "<div class=\'fallback-container\'><div class=\'fallback-icon\'>⚠️</div><h2 class=\'fallback-title\'>Preview Error</h2><p class=\'fallback-text\'>" + err.message + "</p></div>";\n' +
        '}\n' +
        '</script>' +
        '<script>setTimeout(function() { if (document.querySelector(".loading")) { document.getElementById("root").innerHTML = "<div class=\'fallback-container\'><div class=\'fallback-icon\'>🎨</div><h2 class=\'fallback-title\'>Preview Loading...</h2><p class=\'fallback-text\'>Your code is ready! Click the Code tab to view and edit.</p></div>"; } }, 8000);</script>' +
        '</body></html>'
        
      return html
    }
    
    // Legacy single-page mode
    if (!code) return ''
    
    // Check for truncation in single-page mode
    const truncationCheck = detectTruncation(code)
    if (truncationCheck?.isTruncated) {
      return '<!DOCTYPE html><html><body style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem;">' +
        '<div style="text-align: center; color: #71717a; font-family: system-ui; max-width: 400px;">' +
        '<div style="font-size: 3rem; margin-bottom: 1rem;">✂️</div>' +
        '<h2 style="color: white; margin-bottom: 0.5rem; font-size: 1.25rem;">Response was cut off</h2>' +
        '<p style="color: #a1a1aa; margin-bottom: 0.5rem;">The AI response was truncated before completion.</p>' +
        '<p style="color: #f97316; font-size: 0.875rem; background: rgba(249, 115, 22, 0.1); padding: 0.5rem 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">' + truncationCheck.reason + '</p>' +
        '<p style="color: #71717a; font-size: 0.875rem;">Try a shorter prompt or click Regenerate to try again.</p>' +
        '</div></body></html>'
    }

    // Check if code is too large (prevent srcDoc URL length issues)
    if (code.length > 50000) {
      const html = '<!DOCTYPE html><html><body>' +
        '<div style="color: #f87171; padding: 2rem; font-family: monospace; line-height: 1.6; background: #18181b; height: 100vh; display: flex; align-items: center; justify-content: center;">' +
        '<div style="max-width: 500px;">' +
        '<div style="font-size: 2rem; margin-bottom: 1rem;">⚠️</div>' +
        '<h2 style="color: white; margin-bottom: 0.5rem; font-size: 1.25rem;">Code Too Large</h2>' +
        '<p>The generated code is ' + Math.round(code.length / 1000) + 'KB, which exceeds the preview limit of 50KB.</p>' +
        '<p style="margin-top: 1rem; color: #a1a1aa;">💡 Try:</p>' +
        '<ul style="margin: 0.5rem 0 0 1.5rem; color: #a1a1aa;">' +
        '<li>Breaking the component into smaller pieces</li>' +
        '<li>Simplifying the design</li>' +
        '<li>Downloading the full code to view locally</li>' +
        '</ul>' +
        '</div>' +
        '</div>' +
        '</body></html>'
      return html
    }

    const hooksDestructure = 'const { useState, useEffect, useMemo, useCallback, useRef } = React;'
  const routerStubs = buildRouterStubs('/')

    // Look for actual function components (arrow functions or function declarations)
    // Priority 1: Arrow function components: const Name = () => { or const Name = () => (
    const arrowFnRegex = /(?:const|let|var)\s+([A-Z][a-zA-Z0-9]*)\s*=\s*(?:\([^)]*\)|[a-zA-Z_][a-zA-Z0-9_]*)\s*=>/g
    // Priority 2: Function declarations: function Name(
    const funcDeclRegex = /function\s+([A-Z][a-zA-Z0-9]*)\s*\(/g
    // Priority 3: Fallback - any capitalized const/let/var (less reliable)
    const fallbackRegex = /(?:const|let|var)\s+([A-Z][a-zA-Z0-9]*)(?:\s*[=:(])/g
    
    const arrowMatches = Array.from(code.matchAll(arrowFnRegex))
    const funcMatches = Array.from(code.matchAll(funcDeclRegex))
    const fallbackMatches = Array.from(code.matchAll(fallbackRegex))
    
    // Prefer arrow functions, then function declarations, then fallback
    let componentName = 'Component'
    if (arrowMatches.length > 0) {
      componentName = arrowMatches[0][1]
    } else if (funcMatches.length > 0) {
      componentName = funcMatches[0][1]
    } else if (fallbackMatches.length > 0) {
      // Filter out common non-component names
      const nonComponents = ['Theme', 'Config', 'Settings', 'Options', 'Data', 'Props', 'State', 'Context', 'Provider', 'Store', 'Schema', 'Type', 'Interface', 'Const', 'Enum']
      const validMatch = fallbackMatches.find(m => !nonComponents.includes(m[1]))
      if (validMatch) componentName = validMatch[1]
    }

    const cleanedCode = code
      // Remove import statements for motion, lucide, and react
      .replace(/import\s*\{[^}]*\}\s*from\s*['"](?:motion\/react|framer-motion|motion)['"]\s*;?/g, '')
      .replace(/import\s*\{[^}]*\}\s*from\s*['"]lucide-react['"]\s*;?/g, '')
      .replace(/import\s*\{[^}]*\}\s*from\s*['"]react['"]\s*;?/g, '')
      .replace(/import\s+\w+\s*from\s*['"][^'"]+['"]\s*;?/g, '')
      .replace(/import\s*['"][^'"]+['"]\s*;?/g, '')
      // Remove TypeScript types
      .replace(/interface\s+\w+\s*\{[\s\S]*?\}/g, '')
      .replace(/type\s+\w+\s*=[^;]+;/g, '')
      .replace(/\s+as\s+[A-Za-z][A-Za-z0-9\[\]<>|&\s,'_]*/g, '')
      .replace(/(useState|useRef|useMemo|useCallback|useEffect)<[^>]+>/g, '$1')
      .replace(/:\s*(React\.)?FC(<[^>]*>)?/g, '')
      .replace(/:\s*[A-Z][A-Za-z0-9\[\]<>|&\s,']*(?=\s*=\s*[\[{(])/g, '')
      .replace(/(\(\s*\w+):\s*(?:keyof\s+|typeof\s+|readonly\s+)?[A-Z][^,)]*(?=[,)])/g, '$1')
      .replace(/,(\s*\w+):\s*(?:keyof\s+|typeof\s+|readonly\s+)?[A-Z][^,)]*(?=[,)])/g, ',$1')
      .replace(/(\(\s*\w+):\s*(?:string|number|boolean|any|void|never|unknown)(?:\[\])?(?=[,)])/g, '$1')
      .replace(/,(\s*\w+):\s*(?:string|number|boolean|any|void|never|unknown)(?:\[\])?(?=[,)])/g, ',$1')
      .replace(/\):\s*[A-Za-z][A-Za-z0-9\[\]<>|&\s,']*(?=\s*[{=])/g, ')')
      .replace(/export\s+default\s+/g, '')
      .replace(/export\s+/g, '')
      .replace(/React\.useState/g, 'useState')
      .replace(/React\.useEffect/g, 'useEffect')
      .replace(/React\.useMemo/g, 'useMemo')
      .replace(/React\.useCallback/g, 'useCallback')
      .replace(/React\.useRef/g, 'useRef')
      // Remove 'use client' directive
      .replace(/'use client'\s*;?/g, '')
      .replace(/"use client"\s*;?/g, '')
      // Remove React event types (e.g., e: React.FormEvent<HTMLFormElement>)
      .replace(/:\s*React\.\w+(?:Event|Handler)(?:<[^>]+>)?/g, '')
      // Remove HTML event types (e.g., e: FormEvent<HTMLFormElement>)
      .replace(/:\s*(?:Form|Mouse|Keyboard|Change|Focus|Touch|Input|Submit|Click)Event(?:<[^>]+>)?/g, '')
      // Remove generic Event types
      .replace(/:\s*(?:Event|SyntheticEvent)(?:<[^>]+>)?/g, '')

    const html = '<!DOCTYPE html>' +
      '<html><head>' +
      '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">' +
      '<style>' +
      '* { margin: 0; padding: 0; box-sizing: border-box; }' +
      'html, body, #root { min-height: 100%; width: 100%; }' +
      'body { background: #09090b; font-family: "Inter", system-ui, sans-serif; }' +
      '.preview-loading { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(180deg, #09090b 0%, #18181b 100%); }' +
      '.preview-loading-spinner { width: 40px; height: 40px; border: 2px solid rgba(255,255,255,0.1); border-top-color: #fff; border-radius: 50%; animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite; }' +
      '@keyframes spin { to { transform: rotate(360deg); } }' +
      '.preview-loading-text { margin-top: 20px; color: #a1a1aa; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 500; }' +
      '.preview-fallback { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(180deg, #09090b 0%, #18181b 100%); padding: 32px; text-align: center; }' +
      '.preview-fallback-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2); border-radius: 100px; margin-bottom: 24px; }' +
      '.preview-fallback-badge-dot { width: 6px; height: 6px; background: #3b82f6; border-radius: 50%; animation: pulse 2s ease-in-out infinite; }' +
      '@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }' +
      '.preview-fallback-badge-text { color: #3b82f6; font-size: 11px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; }' +
      '.preview-fallback-title { color: #fafafa; font-size: 20px; font-weight: 600; margin-bottom: 8px; letter-spacing: -0.01em; }' +
      '.preview-fallback-desc { color: #71717a; font-size: 14px; line-height: 1.6; max-width: 320px; margin-bottom: 24px; }' +
      '.preview-fallback-hint { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #18181b; border: 1px solid #27272a; border-radius: 8px; }' +
      '.preview-fallback-hint-icon { color: #3b82f6; }' +
      '.preview-fallback-hint-text { color: #a1a1aa; font-size: 12px; }' +
      '.error { color: #ef4444; padding: 2rem; font-family: monospace; white-space: pre-wrap; background: #18181b; line-height: 1.6; }' +
      '.error h2 { color: #fecaca; margin-bottom: 1rem; font-size: 1rem; font-weight: bold; }' +
      '</style>' +
      '</head><body>' +
      '<div id="root"><div class="preview-loading"><div class="preview-loading-spinner"></div><div class="preview-loading-text">Rendering preview...</div></div></div>' +
      // Load React first and expose globally IMMEDIATELY (lucide needs this during init)
      '<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>' +
      '<script>window.React = React; window.react = React;</script>' +
      '<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>' +
      '<script>window.ReactDOM = ReactDOM; window["react-dom"] = ReactDOM;</script>' +
      // Load Tailwind and configure IMMEDIATELY
      '<script src="https://cdn.tailwindcss.com"></script>' +
      '<script>if(typeof tailwind!=="undefined"){tailwind.config={theme:{extend:{}},darkMode:"class"};}</script>' +
      // Now load framer-motion and lucide (they can find React on window)
      '<script src="https://cdn.jsdelivr.net/npm/framer-motion@11/dist/framer-motion.js"></script>' +
      '<script src="https://unpkg.com/lucide-react@0.294.0/dist/umd/lucide-react.js"></script>' +
      '<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>' +
      '<script>' +
      'window.showFallback = function() {' +
      '  document.getElementById("root").innerHTML = \'<div class="preview-fallback">\' +' +
      '    \'<div class="preview-fallback-badge"><div class="preview-fallback-badge-dot"></div><span class="preview-fallback-badge-text">Preview Mode</span></div>\' +' +
      '    \'<h2 class="preview-fallback-title">Complex Preview</h2>\' +' +
      '    \'<p class="preview-fallback-desc">This design uses advanced features. Export or deploy to see the full experience.</p>\' +' +
      '    \'<div class="preview-fallback-hint"><svg class="preview-fallback-hint-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg><span class="preview-fallback-hint-text">Your code is ready—ship it to see it live</span></div>\' +' +
      '  \'</div>\';' +
      '};' +
      '</script>' +
      '<script>' +
      '// Expose motion and lucide icons as globals\n' +
      'window.motion = window.Motion?.motion || { div: "div", button: "button", a: "a", span: "span", p: "p", h1: "h1", h2: "h2", h3: "h3", section: "section", main: "main", nav: "nav", ul: "ul", li: "li", img: "img", input: "input", form: "form", label: "label", textarea: "textarea", header: "header", footer: "footer", article: "article", aside: "aside" };\n' +
      'window.AnimatePresence = window.Motion?.AnimatePresence || function(props) { return props.children; };\n' +
      'window.useAnimation = window.Motion?.useAnimation || function() { return { start: function(){}, stop: function(){} }; };\n' +
      'window.useInView = window.Motion?.useInView || function() { return true; };\n' +
      'window.useScroll = window.Motion?.useScroll || function() { return { scrollY: { get: function(){ return 0; } }, scrollYProgress: { get: function(){ return 0; } } }; };\n' +
      'window.useTransform = window.Motion?.useTransform || function(v, i, o) { return typeof v === "number" ? v : 0; };\n' +
      'window.useSpring = window.Motion?.useSpring || function(v) { return typeof v === "number" ? v : 0; };\n' +
      'window.useMotionValue = window.Motion?.useMotionValue || function(v) { return { get: function() { return v; }, set: function() {}, onChange: function(){} }; };\n' +
      '// Create a safe icon getter that ALWAYS returns a valid component\n' +
      'window.createSafeIcon = function(name) {\n' +
      '  return function SafeIcon(props) {\n' +
      '    var icons = window.lucideReact || window.lucide || {};\n' +
      '    var Icon = icons[name];\n' +
      '    if (typeof Icon === "function") {\n' +
      '      try { return Icon(props); } catch(e) { /* fall through */ }\n' +
      '    }\n' +
      '    // Fallback: render empty SVG placeholder\n' +
      '    return React.createElement("svg", Object.assign({ width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }, props));\n' +
      '  };\n' +
      '};\n' +
      '// Pre-create common icons as safe components\n' +
      'window.LucideIcons = {};\n' +
      '["ArrowRight","ArrowLeft","ArrowUp","ArrowDown","Check","CheckCircle","CheckCircle2","Circle","X","Menu","ChevronDown","ChevronUp","ChevronLeft","ChevronRight","Plus","Minus","Search","Settings","User","Users","Mail","Phone","MapPin","Calendar","Clock","Star","Heart","Home","Globe","Layers","Lock","Award","BookOpen","Zap","Shield","Target","TrendingUp","BarChart","PieChart","Activity","Eye","EyeOff","Edit","Trash","Copy","Download","Upload","Share","Link","ExternalLink","Send","MessageCircle","Bell","AlertCircle","Info","HelpCircle","Loader","RefreshCw","RotateCcw","Save","FileText","Folder","Image","Play","Pause","SkipBack","SkipForward","Volume2","VolumeX","Mic","Video","Camera","Wifi","Battery","Sun","Moon","Cloud","Droplet","Wind","Thermometer","Map","Navigation","Compass","Flag","Bookmark","Tag","Hash","AtSign","Filter","Grid","List","LayoutGrid","Maximize","Minimize","Move","Crop","ZoomIn","ZoomOut","MoreHorizontal","MoreVertical","Briefcase","Building","Cpu","Database","Server","Code","Terminal","GitBranch","Github","Linkedin","Twitter","Facebook","Instagram","Youtube","Sparkles","Bot","Brain","Rocket"].forEach(function(name) {\n' +
      '  window.LucideIcons[name] = window.createSafeIcon(name);\n' +
      '});\n' +
      '// Proxy for any icons not in the list\n' +
      'window.LucideIcons = new Proxy(window.LucideIcons, {\n' +
      '  get: function(target, prop) {\n' +
      '    if (prop in target) return target[prop];\n' +
      '    if (typeof prop === "string" && prop[0] === prop[0].toUpperCase()) {\n' +
      '      target[prop] = window.createSafeIcon(prop);\n' +
      '      return target[prop];\n' +
      '    }\n' +
      '    return undefined;\n' +
      '  }\n' +
      '});\n' +
      '</script>' +
      // Inspector script - handles element selection when inspector mode is enabled
      '<script>' +
      '(function() {\n' +
      '  var inspectorEnabled = false;\n' +
      '  var highlightEl = null;\n' +
      '  \n' +
      '  function createHighlight() {\n' +
      '    if (highlightEl) return;\n' +
      '    highlightEl = document.createElement("div");\n' +
      '    highlightEl.style.cssText = "position:fixed;pointer-events:none;z-index:99999;border:2px solid #8b5cf6;background:rgba(139,92,246,0.1);transition:all 0.15s ease;display:none;";\n' +
      '    document.body.appendChild(highlightEl);\n' +
      '  }\n' +
      '  \n' +
      '  function getElementInfo(el) {\n' +
      '    var computed = window.getComputedStyle(el);\n' +
      '    return {\n' +
      '      tagName: el.tagName.toLowerCase(),\n' +
      '      className: el.className || "",\n' +
      '      textContent: (el.textContent || "").slice(0, 100),\n' +
      '      styles: {\n' +
      '        color: computed.color,\n' +
      '        backgroundColor: computed.backgroundColor,\n' +
      '        fontSize: computed.fontSize,\n' +
      '        fontWeight: computed.fontWeight,\n' +
      '        padding: computed.padding,\n' +
      '        margin: computed.margin\n' +
      '      }\n' +
      '    };\n' +
      '  }\n' +
      '  \n' +
      '  function handleMouseMove(e) {\n' +
      '    if (!inspectorEnabled || !highlightEl) return;\n' +
      '    var el = e.target;\n' +
      '    if (el === highlightEl || el === document.body || el === document.documentElement) return;\n' +
      '    var rect = el.getBoundingClientRect();\n' +
      '    highlightEl.style.display = "block";\n' +
      '    highlightEl.style.top = rect.top + "px";\n' +
      '    highlightEl.style.left = rect.left + "px";\n' +
      '    highlightEl.style.width = rect.width + "px";\n' +
      '    highlightEl.style.height = rect.height + "px";\n' +
      '  }\n' +
      '  \n' +
      '  function handleClick(e) {\n' +
      '    if (!inspectorEnabled) return;\n' +
      '    e.preventDefault();\n' +
      '    e.stopPropagation();\n' +
      '    var el = e.target;\n' +
      '    if (el === highlightEl) return;\n' +
      '    highlightEl.style.borderColor = "#22c55e";\n' +
      '    highlightEl.style.background = "rgba(34,197,94,0.1)";\n' +
      '    window.parent.postMessage({ type: "element-selected", elementInfo: getElementInfo(el) }, "*");\n' +
      '  }\n' +
      '  \n' +
      '  function handleMouseLeave() {\n' +
      '    if (highlightEl) highlightEl.style.display = "none";\n' +
      '  }\n' +
      '  \n' +
      '  window.addEventListener("message", function(e) {\n' +
      '    if (e.data && e.data.type === "inspector-mode") {\n' +
      '      inspectorEnabled = e.data.enabled;\n' +
      '      if (inspectorEnabled) {\n' +
      '        createHighlight();\n' +
      '        document.body.style.cursor = "crosshair";\n' +
      '      } else {\n' +
      '        if (highlightEl) highlightEl.style.display = "none";\n' +
      '        document.body.style.cursor = "";\n' +
      '      }\n' +
      '    }\n' +
      '  });\n' +
      '  \n' +
      '  document.addEventListener("mousemove", handleMouseMove, true);\n' +
      '  document.addEventListener("click", handleClick, true);\n' +
      '  document.addEventListener("mouseleave", handleMouseLeave, true);\n' +
      '})();\n' +
      '</script>' +
      '<script>document.addEventListener("click", function(e) { var link = e.target.closest("a"); if (link) { e.preventDefault(); var href = link.getAttribute("href"); if (href && href.startsWith("#")) { var target = document.querySelector(href); if (target) target.scrollIntoView({ behavior: "smooth" }); } } });</script>' +
      '<script>' +
      '// Global error handler - show friendly fallback instead of technical error\n' +
      'window.onerror = function(msg, url, line, col, error) {' +
      '  console.error("Preview error:", msg, error);' +
      '  document.getElementById("root").innerHTML = ' +
      '    "<div class=\'preview-fallback\'>" +' +
      '    "<div class=\'preview-fallback-badge\'><div class=\'preview-fallback-badge-dot\'></div><span class=\'preview-fallback-badge-text\'>Preview Mode</span></div>" +' +
      '    "<h2 class=\'preview-fallback-title\'>Complex Preview</h2>" +' +
      '    "<p class=\'preview-fallback-desc\'>This design uses advanced features. Deploy or export to see the full experience.</p>" +' +
      '    "<div class=\'preview-fallback-hint\'><svg class=\'preview-fallback-hint-icon\' width=\'16\' height=\'16\' fill=\'none\' stroke=\'currentColor\' viewBox=\'0 0 24 24\'><path stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M13 10V3L4 14h7v7l9-11h-7z\'/></svg><span class=\'preview-fallback-hint-text\'>Your code is ready—ship it to see it live</span></div>" +' +
      '    "</div>";' +
      '  return true;' +
      '};' +
      'window.onunhandledrejection = function(e) { console.error("Unhandled rejection:", e); return true; };' +
      '</script>' +
      '<script type="text/babel" data-presets="react,typescript">' +
      hooksDestructure + '\n' +
      routerStubs + '\n' +
      // Single-page theme config (same as multi-page)
      `// Design tokens from Wolsten Studios config/theme.ts
const colors = {
  cyan: { primary: '#00A5C7', bright: '#00D4FF', light: 'rgba(0, 165, 199, 0.08)' },
  background: { light: '#FAFAFC', white: '#FFFFFF', dark: '#0A0A0A', darker: '#0F0F0F' },
  text: { primary: '#0E0E0E', secondary: '#606260', tertiary: '#949797', light: '#C0C8D0', lighter: '#D8DCE0', white: '#FAFAFC' },
  border: { light: '#EBEBEF', cyan: 'rgba(0, 212, 255, 0.2)', default: '#DADADA' },
};
const spacing = { section: { py: 'py-16 md:py-24', px: 'px-8' } };
const typography = {
  eyebrow: { fontSize: '0.813rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 500 },
  hero: { fontSize: 'clamp(3rem, 7vw, 5.5rem)', lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: 300 },
  h2: { fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 300, lineHeight: '1.2' },
  h3: { fontSize: '1.25rem', fontWeight: 400 },
  body: { fontSize: '1rem', lineHeight: '1.7' },
  bodyLarge: { fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', lineHeight: '1.5' },
};
const effects = {
  glass: { backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(0, 212, 255, 0.2)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)' },
  glassLight: { backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid #00A5C7', backdropFilter: 'blur(10px)', boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)' },
  cardBorder: { backgroundColor: '#FFFFFF', border: '1px solid #EBEBEF' },
};
const easings = { smooth: [0.21, 0.47, 0.32, 0.98], bounce: [0.34, 1.56, 0.64, 1], easeOut: 'easeOut', easeInOut: 'easeInOut' };
const durations = { fast: 0.2, normal: 0.4, medium: 0.6, slow: 0.8 };
const springs = {
  snappy: { type: 'spring', stiffness: 400, damping: 17 },
  bouncy: { type: 'spring', stiffness: 300, damping: 20 },
  smooth: { type: 'spring', stiffness: 100, damping: 15 },
  gentle: { type: 'spring', stiffness: 90, damping: 15 },
};
const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
const fadeInLeft = { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 } };
const fadeIn = { initial: { opacity: 0 }, animate: { opacity: 1 } };
const scaleIn = { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } };
const Navigation = () => null;
const Footer = () => null;
const GlassCard = ({ children, className }) => React.createElement('div', { className, style: effects.glass }, children);
const SectionHeader = ({ eyebrow, title, description }) => React.createElement('div', { className: 'text-center mb-12' }, 
  eyebrow && React.createElement('p', { style: { ...typography.eyebrow, color: colors.cyan.primary } }, eyebrow),
  React.createElement('h2', { style: { ...typography.h2, color: colors.text.primary } }, title),
  description && React.createElement('p', { style: { ...typography.body, color: colors.text.secondary } }, description)
);
` +
      'const motion = window.motion;\n' +
      'const AnimatePresence = window.AnimatePresence;\n' +
      'const useAnimation = window.useAnimation;\n' +
      'const useInView = window.useInView;\n' +
      'const useScroll = window.useScroll;\n' +
      'const useTransform = window.useTransform;\n' +
      'const useSpring = window.useSpring;\n' +
      'const useMotionValue = window.useMotionValue;\n' +
      '// Next.js module shims for Babel-evaluated code\n' +
      'var NextImage = (props) => {\n' +
      '  var { src, alt, className, style, fill, ...rest } = props;\n' +
      '  var fillStyle = fill ? { position: "absolute", height: "100%", width: "100%", inset: 0, objectFit: "cover", ...style } : style;\n' +
      '  return React.createElement("img", { src, alt: alt || "", className, style: fillStyle, ...rest });\n' +
      '};\n' +
      'var NextLink = ({ href, children, ...rest }) => React.createElement("a", { href, ...rest }, children);\n' +
      'var Image = NextImage;\n' +
      'var Link = NextLink;\n' +
      'var Head = ({ children }) => null;\n' +
      'var Script = (props) => null;\n' +
      '// Common utility stubs\n' +
      'var cn = (...args) => args.filter(Boolean).join(" ");\n' +
      'var clsx = cn;\n' +
      'var twMerge = (...args) => args.filter(Boolean).join(" ");\n' +
      'var cva = (base, config) => (props) => base;\n' +
      'var exports = {};\n' +
      'var module = { exports };\n' +
      'var require = (name) => {\n' +
      '  if (name === "react") return React;\n' +
      '  if (name === "react-dom") return ReactDOM;\n' +
      '  if (name === "framer-motion") return window.Motion || window.motion || {};\n' +
      '  if (name === "lucide-react") return window.LucideIcons || {};\n' +
      '  if (name === "next/image") return NextImage;\n' +
      '  if (name === "next/link") return NextLink;\n' +
      '  if (name === "next/navigation") return { useRouter, usePathname, useSearchParams };\n' +
      '  if (name === "next/head") return Head;\n' +
      '  if (name === "next/script") return Script;\n' +
      '  if (name.startsWith("next/font")) return { className: "", style: {} };\n' +
      '  if (name === "clsx" || name === "classnames") return cn;\n' +
      '  if (name === "tailwind-merge") return { twMerge: twMerge };\n' +
      '  if (name === "class-variance-authority") return { cva: cva };\n' +
      '  if (name.endsWith(".css") || name.endsWith(".scss") || name.endsWith(".sass")) return {};\n' +
      '  return {};\n' +
      '};\n' +
      '// Icons - access from window.LucideIcons which has safe fallbacks\n' +
      'var LucideIcons = window.LucideIcons;\n' +
      '// ErrorBoundary class for single-page mode\n' +
      'class ErrorBoundary extends React.Component {\n' +
      '  constructor(props) { super(props); this.state = { hasError: false, error: null }; }\n' +
      '  static getDerivedStateFromError(error) { return { hasError: true, error: error }; }\n' +
      '  componentDidCatch(error, info) {\n' +
      '    console.error("[ErrorBoundary]", error, info);\n' +
      '    window.parent.postMessage({ type: "preview-error", errorType: "Component Error", message: error.message }, "*");\n' +
      '  }\n' +
      '  render() {\n' +
      '    if (this.state.hasError) {\n' +
      '      return React.createElement("div", { className: "preview-fallback" },\n' +
      '        React.createElement("div", { className: "preview-fallback-badge" },\n' +
      '          React.createElement("div", { className: "preview-fallback-badge-dot" }),\n' +
      '          React.createElement("span", { className: "preview-fallback-badge-text" }, "Error Caught")\n' +
      '        ),\n' +
      '        React.createElement("h2", { className: "preview-fallback-title" }, "Preview Error"),\n' +
      '        React.createElement("p", { className: "preview-fallback-desc" }, this.state.error?.message || "Something went wrong"),\n' +
      '        React.createElement("div", { className: "preview-fallback-hint" },\n' +
      '          React.createElement("span", { className: "preview-fallback-hint-text" }, "Your code is available in the Code tab")\n' +
      '        )\n' +
      '      );\n' +
      '    }\n' +
      '    return this.props.children;\n' +
      '  }\n' +
      '}\n' +
      'try {\n' +
      cleanedCode + '\n' +
      '  const root = ReactDOM.createRoot(document.getElementById("root"));\n' +
      '  if (typeof ' + componentName + ' === "function") {\n' +
      '    root.render(React.createElement(ErrorBoundary, null, React.createElement(' + componentName + ')));\n' +
      '  } else if (typeof Component === "function") {\n' +
      '    root.render(React.createElement(ErrorBoundary, null, React.createElement(Component)));\n' +
      '  } else {\n' +
      '    document.getElementById("root").innerHTML = "<div class=\'error\'><h2>Component Not Found</h2><p>Make sure your code exports a function component.</p></div>";\n' +
      '  }\n' +
      '} catch (err) {\n' +
      '  var msg = err.message || "Unknown error";\n' +
      '  window.parent.postMessage({ type: "preview-error", errorType: "Render Error", message: msg }, "*");\n' +
      '  document.getElementById("root").innerHTML = ' +
      '    "<div class=\'error\'>" +' +
      '    "<h2>⚠️ Could not render preview</h2>" +' +
      '    "<p style=\'color: #f87171; font-size: 0.9em;\'>" + msg + "</p>" +' +
      '    "<p style=\'font-size: 0.9em; color: #d4d4d8; margin-top: 1rem;\'><strong>Tips:</strong></p>" +' +
      '    "<ul style=\'text-align: left; margin-top: 0.5rem; padding-left: 1.5rem; color: #a1a1aa; font-size: 0.85em;\'>" +' +
      '    "<li style=\'margin-bottom: 0.5rem;\'>Try a simpler request like a landing page</li>" +' +
      '    "<li style=\'margin-bottom: 0.5rem;\'>For images/logos, upload them via <strong>Assets</strong></li>" +' +
      '    "<li>Click <strong>Update</strong> to regenerate</li>" +' +
      '    "</ul>" +' +
      '    "<p style=\'margin-top: 1rem; font-size: 0.85em; color: #71717a;\'>Your code is still available in the Code tab.</p>" +' +
      '    "</div>";\n' +
      '}\n' +
      '</script>' +
      '<script>setTimeout(function() { if (document.querySelector(".loading")) { window.parent.postMessage({ type: "preview-error", errorType: "Timeout", message: "Component took too long to render" }, "*"); document.getElementById("root").innerHTML = "<div class=\'error\'><h2>⚠️ Preview Timeout</h2><p>Your code is ready in the <strong>Code</strong> tab</p><p style=\'font-size: 0.9em; color: #a1a1aa; margin-top: 1rem;\'>The component took too long to render. Check for infinite loops.</p></div>"; } }, 8000);</script>' +
      '</body></html>'

    return html
  }, [code, pages, currentPageId])

  const showSpinner = isLoading || ((code || pages) && !iframeLoaded)

  // Error action panel component
  const ErrorActionPanel = () => {
    if (!previewError) return null
    
    return (
      <div className="absolute bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-sm border-t border-zinc-700 p-4 z-20">
        <div className="flex items-start gap-3 mb-3">
          <div className="text-2xl">⚠️</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white mb-0.5">Couldn{"'"}t render preview</h3>
            <p className="text-xs text-zinc-400 truncate">{previewError.type}: {previewError.message}</p>
          </div>
          <button 
            onClick={() => setPreviewError(null)} 
            className="text-zinc-500 hover:text-white p-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-zinc-500 mb-3">This usually happens with complex prompts. Try simplifying.</p>
        <div className="flex gap-2 flex-wrap">
          {onViewCode && (
            <button 
              onClick={onViewCode}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              View Code
            </button>
          )}
          {onRegenerate && (
            <button 
              onClick={onRegenerate}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
              Regenerate
            </button>
          )}
          {onQuickFix && (
            <button 
              onClick={onQuickFix}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs rounded-lg transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Quick Fix
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-zinc-900 overflow-auto">
      {(code || (pages && pages.length > 0)) ? (
        <div className="relative h-full">
          {showSpinner && (
            <div className="absolute inset-0 bg-zinc-950 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-6">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 border border-zinc-800 rounded-full"></div>
                  <div className="absolute inset-0 border border-transparent border-t-white rounded-full animate-spin"></div>
                  <div className="absolute inset-0 rounded-full animate-pulse bg-white/5"></div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-white text-xs font-medium tracking-widest uppercase">{isLoading ? 'Genesis Engine Building' : 'Materializing'}</span>
                  {loadingProgress && <span className="text-zinc-500 text-xs">{loadingProgress}</span>}
                </div>
              </div>
            </div>
          )}
          <iframe
            ref={iframeRef}
            srcDoc={srcDoc}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            title="Live Preview"
            onLoad={() => setIframeLoaded(true)}
          />
          <ErrorActionPanel />
        </div>
      ) : (
        <div className="h-full flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-6">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 border border-zinc-800 rounded-full"></div>
                <div className="absolute inset-0 border border-transparent border-t-white rounded-full animate-spin"></div>
                <div className="absolute inset-0 rounded-full animate-pulse bg-white/5"></div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-white text-xs font-medium tracking-widest uppercase">Genesis Engine Building</span>
                {loadingProgress && <span className="text-zinc-500 text-xs">{loadingProgress}</span>}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-8 text-center max-w-md px-8">
              {/* Preview illustration */}
              <div className="relative group">
                <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl shadow-black/50 group-hover:border-zinc-700 transition-colors duration-500">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-zinc-500 group-hover:text-zinc-300 transition-colors duration-500">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div className="absolute inset-0 rounded-full bg-white/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-white text-sm font-medium tracking-widest uppercase">Awaiting Input</h3>
                <p className="text-zinc-500 text-xs leading-relaxed max-w-xs mx-auto">
                  The Genesis Engine is ready. Describe your vision to begin.
                </p>
              </div>

              {/* Example prompts */}
              <div className="flex flex-wrap justify-center gap-2 opacity-50 hover:opacity-100 transition-opacity duration-300">
                {['Landing page', 'Dashboard', 'SaaS Pricing', 'Portfolio'].map((example) => (
                  <span 
                    key={example}
                    className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-colors cursor-pointer uppercase tracking-wide"
                  >
                    {example}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default memo(LivePreview)