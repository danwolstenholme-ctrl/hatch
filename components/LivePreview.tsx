'use client'

import { useMemo } from 'react'

interface LivePreviewProps {
  code: string
}

export default function LivePreview({ code }: LivePreviewProps) {
  const srcDoc = useMemo(() => {
    if (!code) return ''

    // Always destructure common hooks
    const hooksDestructure = `const { useState, useEffect, useMemo, useCallback, useRef } = React;`

    // Remove export statements and fix React.hook patterns
    const cleanedCode = code
      .replace(/export\s+default\s+/g, '')
      .replace(/export\s+/g, '')
      .replace(/React\.useState/g, 'useState')
      .replace(/React\.useEffect/g, 'useEffect')
      .replace(/React\.useMemo/g, 'useMemo')
      .replace(/React\.useCallback/g, 'useCallback')
      .replace(/React\.useRef/g, 'useRef')

    return `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #root { 
      min-height: 100%;
      width: 100%;
    }
    body {
      background: #f9fafb;
    }
    .error { 
      color: #ef4444; 
      padding: 1rem; 
      font-family: monospace; 
      white-space: pre-wrap;
      background: #18181b;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script>
    // Intercept all link clicks to prevent iframe navigation
    document.addEventListener('click', function(e) {
      const link = e.target.closest('a');
      if (link) {
        e.preventDefault();
        const href = link.getAttribute('href');
        // Handle anchor links - scroll to element
        if (href && href.startsWith('#')) {
          const target = document.querySelector(href);
          if (target) target.scrollIntoView({ behavior: 'smooth' });
        }
        // For other links, could show a toast or just ignore
      }
    });
  </script>
  <script type="text/babel" data-presets="react,typescript">
    ${hooksDestructure}
    
    ${cleanedCode}
    
    try {
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(<Component />);
    } catch (err) {
      document.getElementById('root').innerHTML = '<div class="error">Error: ' + err.message + '</div>';
    }
  </script>
</body>
</html>`
  }, [code])

  return (
  <div className="flex-1 h-full bg-zinc-900 overflow-auto">
    {code ? (
      <iframe
        srcDoc={srcDoc}
        className="w-full h-full border-0 bg-white"
        sandbox="allow-scripts"
        title="Live Preview"
      />
    ) : (
      <div className="p-4 text-sm text-zinc-600">
        Live preview will render here.
      </div>
    )}
  </div>
)
}