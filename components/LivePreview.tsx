'use client'

import { useMemo, useState, useEffect } from 'react'

interface LivePreviewProps {
  code: string
  isLoading?: boolean
  isPaid?: boolean
  setShowUpgradeModal?: (show: boolean) => void
}

export default function LivePreview({ code, isLoading = false, isPaid = false, setShowUpgradeModal }: LivePreviewProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)

  const refreshPreview = () => {
    setIframeLoaded(false)
    setIframeKey(prev => prev + 1)
  }

  useEffect(() => {
    const handleDownloadTrigger = () => {
      downloadZip()
    }
    
    window.addEventListener('triggerDownload', handleDownloadTrigger)
    return () => window.removeEventListener('triggerDownload', handleDownloadTrigger)
  }, [code])

  const downloadZip = async () => {
    if (!isPaid) {
      setShowUpgradeModal?.(true)
      return
    }
    if (!code) return
    setIsDownloading(true)
    
    try {
      // Dynamically import JSZip
      const JSZip = (await import('jszip')).default
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
      zip.file('README.md', `# HatchIt Project

This project was built with [HatchIt](https://hatchit.dev).

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
      
      // App folder
      const app = zip.folder('app')
      
      // Layout
      app?.file('layout.tsx', `import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HatchIt Project',
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
}`)
      
      // Global CSS
      app?.file('globals.css', `@tailwind base;
@tailwind components;
@tailwind utilities;`)
      
      // Page component
      const pageCode = code.includes("'use client'") ? code : `'use client'\nimport { useState, useEffect } from 'react'\n\n${code}`
      app?.file('page.tsx', pageCode)
      
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
    } finally {
      setIsDownloading(false)
    }
  }

  const srcDoc = useMemo(() => {
    setIframeLoaded(false)
    
    if (!code) return ''

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

    const regex = /(?:function|const|let|var)\s+([A-Z][a-zA-Z0-9]*)(?:\s*[=:(]|\s*:)/g
    const matches = [...code.matchAll(regex)]
    const componentName = matches.length > 0 ? matches[matches.length - 1][1] : 'Component'

    const cleanedCode = code
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

    const html = '<!DOCTYPE html>' +
      '<html><head>' +
      '<script src="https://cdn.tailwindcss.com"></script>' +
      '<style>* { margin: 0; padding: 0; box-sizing: border-box; } html, body, #root { min-height: 100%; width: 100%; } body { background: #18181b; } .error { color: #ef4444; padding: 2rem; font-family: monospace; white-space: pre-wrap; background: #18181b; line-height: 1.6; } .error h2 { color: #fecaca; margin-bottom: 1rem; font-size: 1rem; font-weight: bold; } .loading { color: #71717a; padding: 2rem; text-align: center; font-family: system-ui; }</style>' +
      '</head><body>' +
      '<div id="root"><div class="loading">Loading preview...</div></div>' +
      '<script src="https://unpkg.com/react@18/umd/react.development.js"></script>' +
      '<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>' +
      '<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>' +
      '<script>document.addEventListener("click", function(e) { var link = e.target.closest("a"); if (link) { e.preventDefault(); var href = link.getAttribute("href"); if (href && href.startsWith("#")) { var target = document.querySelector(href); if (target) target.scrollIntoView({ behavior: "smooth" }); } } });</script>' +
      '<script>' +
      'window.onerror = function(msg, url, line, col, error) {' +
      '  document.getElementById("root").innerHTML = "<div class=\'error\'><h2>⚠️ Preview Unavailable</h2><p>Your code is ready in the <strong>Code</strong> tab</p><p style=\'font-size: 0.9em; color: #a1a1aa; margin-top: 1rem;\'>This component has a JavaScript issue. Check the browser console for details.</p></div>";' +
      '  return true;' +
      '};' +
      '</script>' +
      '<script type="text/babel" data-presets="react,typescript">' +
      hooksDestructure + '\n' +
      'try {\n' +
      cleanedCode + '\n' +
      '  const root = ReactDOM.createRoot(document.getElementById("root"));\n' +
      '  if (typeof ' + componentName + ' === "function") {\n' +
      '    root.render(React.createElement(' + componentName + '));\n' +
      '  } else if (typeof Component === "function") {\n' +
      '    root.render(React.createElement(Component));\n' +
      '  } else {\n' +
      '    document.getElementById("root").innerHTML = "<div class=\'error\'><h2>Component Not Found</h2><p>Make sure your code exports a function component.</p></div>";\n' +
      '  }\n' +
      '} catch (err) {\n' +
      '  var msg = err.message || "Unknown error";\n' +
      '  document.getElementById("root").innerHTML = "<div class=\'error\'><h2>⚠️ Preview Unavailable</h2><p>Your code is ready in the <strong>Code</strong> tab</p><p style=\'font-size: 0.9em; color: #a1a1aa; margin-top: 1rem;\'>Issue: " + msg + "</p></div>";\n' +
      '}\n' +
      '</script>' +
      '<script>setTimeout(function() { if (document.querySelector(".loading")) { document.getElementById("root").innerHTML = "<div class=\'error\'><h2>⚠️ Preview Timeout</h2><p>Your code is ready in the <strong>Code</strong> tab</p><p style=\'font-size: 0.9em; color: #a1a1aa; margin-top: 1rem;\'>The component took too long to render. Check for infinite loops.</p></div>"; } }, 8000);</script>' +
      '</body></html>'

    return html
  }, [code])

  const showSpinner = isLoading || (code && !iframeLoaded)

  return (
    <div className="h-full bg-zinc-900 overflow-auto">
      {code ? (
        <div className="relative h-full">
          {showSpinner && (
            <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-zinc-700 border-t-purple-500 rounded-full animate-spin"></div>
                <span className="text-zinc-500 text-sm">{isLoading ? 'Generating...' : 'Rendering...'}</span>
              </div>
            </div>
          )}
          <iframe
            key={iframeKey}
            srcDoc={srcDoc}
            className="w-full h-full border-0"
            sandbox="allow-scripts"
            title="Live Preview"
            onLoad={() => setIframeLoaded(true)}
          />
        </div>
      ) : (
        <div className="h-full flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-zinc-700 border-t-purple-500 rounded-full animate-spin"></div>
              <span className="text-zinc-500 text-sm">Generating...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 text-center max-w-md px-8">
              {/* Preview illustration */}
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-850 border border-zinc-700/50 flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-600">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                  </svg>
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </div>
              </div>
              
              <div>
                <h3 className="text-zinc-400 font-medium mb-2">Your preview will appear here</h3>
                <p className="text-zinc-600 text-sm leading-relaxed">
                  Describe what you want to build in the chat and watch it come to life.
                </p>
              </div>

              {/* Example prompts */}
              <div className="flex flex-wrap justify-center gap-2">
                {['Landing page', 'Dashboard', 'Form', 'Card'].map((example) => (
                  <span 
                    key={example}
                    className="px-3 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-full text-xs text-zinc-500"
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