'use client'

import { useMemo } from 'react'

interface LivePreviewProps {
  code: string
}

export default function LivePreview({ code }: LivePreviewProps) {
  const srcDoc = useMemo(() => {
    if (!code) return ''

    const hooksDestructure = `const { useState, useEffect, useMemo, useCallback, useRef } = React;`

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
    document.addEventListener('click', function(e) {
      const link = e.target.closest('a');
      if (link) {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          const target = document.querySelector(href);
          if (target) target.scrollIntoView({ behavior: 'smooth' });
        }
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
    <div className="h-full bg-zinc-800 overflow-auto p-4">
      {code ? (
        <div className="mx-auto bg-white h-full rounded-lg overflow-hidden shadow-xl">
          <iframe
            srcDoc={srcDoc}
            className="w-full h-full border-0"
            sandbox="allow-scripts"
            title="Live Preview"
          />
        </div>
      ) : (
        <div className="p-4 text-sm text-zinc-600">
          Live preview will render here.
        </div>
      )}
    </div>
  )
}