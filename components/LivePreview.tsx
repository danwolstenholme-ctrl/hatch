'use client'

import { useMemo, useState } from 'react'

interface LivePreviewProps {
  code: string
  isLoading?: boolean
}

export default function LivePreview({ code, isLoading = false }: LivePreviewProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false)

  const srcDoc = useMemo(() => {
    setIframeLoaded(false)
    
    if (!code) return ''

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
      '<style>* { margin: 0; padding: 0; box-sizing: border-box; } html, body, #root { min-height: 100%; width: 100%; } body { background: #18181b; } .error { color: #ef4444; padding: 1rem; font-family: monospace; white-space: pre-wrap; background: #18181b; }</style>' +
      '</head><body>' +
      '<div id="root"></div>' +
      '<script src="https://unpkg.com/react@18/umd/react.development.js"></script>' +
      '<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>' +
      '<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>' +
      '<script>document.addEventListener("click", function(e) { var link = e.target.closest("a"); if (link) { e.preventDefault(); var href = link.getAttribute("href"); if (href && href.startsWith("#")) { var target = document.querySelector(href); if (target) target.scrollIntoView({ behavior: "smooth" }); } } });</script>' +
      '<script type="text/babel" data-presets="react,typescript">' +
      hooksDestructure + '\n' +
      cleanedCode + '\n' +
      'try { const root = ReactDOM.createRoot(document.getElementById("root")); root.render(<' + componentName + ' />); } catch (err) { document.getElementById("root").innerHTML = "<div class=\'error\'>Render Error: " + err.message + "</div>"; }' +
      '</script>' +
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