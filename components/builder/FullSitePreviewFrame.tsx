'use client'

import { useMemo, forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

// Sanitize SVG data URLs to prevent XSS
const sanitizeSvgDataUrls = (input: string) => {
  return input.replace(/url\(['"]?(data:image\/svg\+xml[^'")\s]+)['"]?\)/gi, (match, data) => {
    const safe = data.replace(/"/g, '%22').replace(/'/g, '%27')
    return `url("${safe}")`
  })
}

interface FullSitePreviewFrameProps {
  sections: { id: string; code: string }[]
  deviceView: 'mobile' | 'tablet' | 'desktop'
  seo?: { title: string; description: string; keywords: string }
  editMode?: boolean
  onTextEdit?: (oldText: string, newText: string, sectionId: string) => void
}

// =============================================================================
// FULL SITE PREVIEW FRAME
// Renders all assembled sections in an iframe - simplified for reliability
// =============================================================================

const FullSitePreviewFrame = forwardRef<HTMLIFrameElement, FullSitePreviewFrameProps>(function FullSitePreviewFrame({ sections, deviceView, seo, editMode = false, onTextEdit }, ref) {
  const internalRef = useRef<HTMLIFrameElement>(null)
  
  // Expose the internal ref to parent
  useImperativeHandle(ref, () => internalRef.current as HTMLIFrameElement)
  
  // Send edit mode state to iframe
  useEffect(() => {
    if (internalRef.current?.contentWindow) {
      internalRef.current.contentWindow.postMessage({ type: 'set-edit-mode', enabled: editMode }, '*')
    }
  }, [editMode])
  
  // Listen for text edit messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'text-edited' && onTextEdit) {
        onTextEdit(event.data.oldText, event.data.newText, event.data.sectionId || '')
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onTextEdit])
  
  const srcDoc = useMemo(() => {
    if (!sections || sections.length === 0) {
      return ''
    }

    // 1. Extract all Lucide imports to ensure they are available
    const allLucideImports = new Set<string>();
    const processedSections = sections.map((section, index) => {
      let code = sanitizeSvgDataUrls(section.code || '')
      
      // Extract imports
      const lucideImportRegex = /import\s+\{(.*?)\}\s+from\s+['"]lucide-react['"]/g;
      let match;
      while ((match = lucideImportRegex.exec(code)) !== null) {
        match[1].split(',').forEach(s => allLucideImports.add(s.trim()));
      }

      // Strip imports and directives
      code = code
        .replace(/'use client';?/g, '')
        .replace(/"use client";?/g, '')
        .replace(/import\s+.*?from\s+['"][^'"]+['"];?\s*/g, '')
      
      // Strip TypeScript type annotations that leak into runtime
      // Handles: const x: string = ..., function(a: string, b: number), etc.
      code = code
        .replace(/:\s*(string|number|boolean|any|void|null|undefined|never|unknown)\s*([=,\)\}])/g, '$2')
        .replace(/:\s*(string|number|boolean|any|void|null|undefined|never|unknown)\s*$/gm, '')
        .replace(/:\s*React\.\w+(\[\])?\s*([=,\)\}])/g, '$2')
        .replace(/:\s*\w+\[\]\s*([=,\)\}])/g, '$1')
        .replace(/<(\w+)\s+extends\s+\w+>/g, '')
        .replace(/as\s+(string|number|boolean|any)\s*/g, '')

      // Transform exports
      // Replace "export default function Name" -> "const Section_i = function Name"
      code = code.replace(/export\s+default\s+function\s+(\w+)?/g, (match, name) => {
        return `const Section_${index} = function ${name || ''}`;
      });
      // Replace "export default" -> "const Section_i ="
      code = code.replace(/export\s+default\s+/g, `const Section_${index} = `);

      return code;
    });

    // 3. Create the App component with Error Boundary wrapper
    const appComponent = `
      // Safe Component Wrapper to catch "got: object" errors
      function SafeSection({ component: Component }) {
        if (!Component) return null;
        try {
          // If it's a function (component), render it
          if (typeof Component === 'function') {
            return <Component />;
          }
          // If it's already an element (object), return it
          if (React.isValidElement(Component)) {
            return Component;
          }
          // If it's an object but not an element (likely a module export or mistake), log and skip
          console.warn('Invalid section export type:', typeof Component, Component);
          return <div className="p-4 text-red-500 border border-red-500 rounded bg-red-950/50">
            <p className="font-bold">Section Error</p>
            <p className="text-sm opacity-75">Invalid export type: {typeof Component}</p>
          </div>;
        } catch (err) {
          console.error('Section render error:', err);
          return <div className="p-4 text-red-500 border border-red-500 rounded bg-red-950/50">
            <p className="font-bold">Render Error</p>
            <p className="text-sm opacity-75">{err.message}</p>
          </div>;
        }
      }

      // Section ID mapping for scroll-to functionality
      const sectionIdMap = {
        ${sections.map((s, i) => `${i}: '${s.id}'`).join(',\n        ')}
      };

      function App() {
        const Header = ${sections.findIndex((s) => s.id === 'header') >= 0 ? `Section_${sections.findIndex((s) => s.id === 'header')}` : 'null'};
        const Footer = ${sections.findIndex((s) => s.id === 'footer') >= 0 ? `Section_${sections.findIndex((s) => s.id === 'footer')}` : 'null'};
        const BodySections = [
          ${sections
            .map((_, i) => i)
            .filter((i) => sections[i]?.id !== 'header' && sections[i]?.id !== 'footer')
            .map((i) => `{ component: Section_${i}, id: '${sections[i]?.id}', index: ${i} }`)
            .join(',\n          ')}
        ];

        // Listen for scroll-to-section messages from parent
        useEffect(() => {
          const handleMessage = (event) => {
            if (event.data?.type === 'scrollToSection') {
              const sectionId = event.data.sectionId;
              const element = document.getElementById('section-' + sectionId);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }
          };
          window.addEventListener('message', handleMessage);
          return () => window.removeEventListener('message', handleMessage);
        }, []);

        return (
          <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
            {Header ? (
              <div id="section-header" className="shrink-0 scroll-mt-4">
                <SafeSection component={Header} />
              </div>
            ) : null}

            <div className="flex-1">
              {BodySections.map((item, idx) => (
                <div key={idx} id={'section-' + item.id} className="scroll-mt-4">
                  <SafeSection component={item.component} />
                </div>
              ))}
            </div>

            {Footer ? (
              <div id="section-footer" className="shrink-0 scroll-mt-4">
                <SafeSection component={Footer} />
              </div>
            ) : null}
          </div>
        );
      }

      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(<App />);
      
      // ============================================
      // EDIT MODE - Double-click to edit text inline
      // ============================================
      let editModeEnabled = false;
      let activeEditor = null;
      
      window.addEventListener('message', (event) => {
        if (event.data.type === 'set-edit-mode') {
          editModeEnabled = event.data.enabled;
          document.body.style.cursor = editModeEnabled ? 'text' : '';
          
          // Add visual indicator when edit mode is active
          const indicator = document.getElementById('edit-mode-indicator');
          if (editModeEnabled && !indicator) {
            const div = document.createElement('div');
            div.id = 'edit-mode-indicator';
            div.style.cssText = 'position:fixed;top:8px;left:50%;transform:translateX(-50%);background:#a855f7;color:white;padding:4px 12px;border-radius:9999px;font-size:11px;z-index:99999;font-family:system-ui;pointer-events:none;';
            div.textContent = '✏️ Edit Mode - Double-click text to edit';
            document.body.appendChild(div);
          } else if (!editModeEnabled && indicator) {
            indicator.remove();
          }
        }
      });
      
      // Text elements that can be edited
      const editableSelectors = 'h1, h2, h3, h4, h5, h6, p, span, a, button, li, label, td, th';
      
      // Find which section an element belongs to
      function findSectionId(element) {
        let el = element;
        while (el && el !== document.body) {
          if (el.id && el.id.startsWith('section-')) {
            return el.id.replace('section-', '');
          }
          el = el.parentElement;
        }
        return '';
      }
      
      document.addEventListener('dblclick', (e) => {
        if (!editModeEnabled) return;
        
        const target = e.target;
        if (!target.matches(editableSelectors)) return;
        if (target === document.body || target.id === 'root') return;
        
        // Don't edit if already editing
        if (activeEditor) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const originalText = target.innerText;
        const originalBg = target.style.backgroundColor;
        const originalOutline = target.style.outline;
        const sectionId = findSectionId(target);
        
        // Make editable
        target.contentEditable = 'true';
        target.style.outline = '2px solid #a855f7';
        target.style.backgroundColor = 'rgba(168, 85, 247, 0.1)';
        target.focus();
        
        // Select all text
        const range = document.createRange();
        range.selectNodeContents(target);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        activeEditor = target;
        
        const finishEdit = () => {
          if (!activeEditor) return;
          
          target.contentEditable = 'false';
          target.style.outline = originalOutline;
          target.style.backgroundColor = originalBg;
          
          const newText = target.innerText.trim();
          if (newText !== originalText) {
            // Flash green to confirm
            target.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
            setTimeout(() => { target.style.backgroundColor = originalBg; }, 500);
            
            window.parent.postMessage({
              type: 'text-edited',
              oldText: originalText,
              newText: newText,
              sectionId: sectionId
            }, '*');
          }
          
          activeEditor = null;
        };
        
        target.addEventListener('blur', finishEdit, { once: true });
        target.addEventListener('keydown', (ke) => {
          if (ke.key === 'Enter' && !ke.shiftKey) {
            ke.preventDefault();
            target.blur();
          }
          if (ke.key === 'Escape') {
            target.innerText = originalText;
            target.blur();
          }
        });
      }, true);
      
      // Hover effect in edit mode
      document.addEventListener('mouseover', (e) => {
        if (!editModeEnabled || activeEditor) return;
        const target = e.target;
        if (!target.matches || !target.matches(editableSelectors)) return;
        target.style.outline = '1px dashed #a855f7';
        target.style.cursor = 'text';
      }, true);
      
      document.addEventListener('mouseout', (e) => {
        if (!editModeEnabled || activeEditor) return;
        const target = e.target;
        if (target.style) {
          target.style.outline = '';
          target.style.cursor = '';
        }
      }, true);
    `;

    // 4. Construct the script
    // We explicitly destructure the used icons from window.LucideIcons
    const lucideDestructuring = allLucideImports.size > 0 
      ? `var _icons = window.LucideIcons || {};
${Array.from(allLucideImports).map((name) => {
  if (name === 'Image') return 'var ImageIcon = _icons.Image;';
  if (name === 'Link') return 'var LinkIcon = _icons.Link;';
  return 'var ' + name + ' = _icons.' + name + ';';
}).join('\n')}`
      : '';

    const fullScript = `
      ${lucideDestructuring}
      ${processedSections.join('\n\n')}
      ${appComponent}
    `;

    const html = `<!DOCTYPE html>
<html class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${seo?.title ? `<title>${seo.title}</title>` : ''}
  ${seo?.description ? `<meta name="description" content="${seo.description}">` : ''}
  ${seo?.keywords ? `<meta name="keywords" content="${seo.keywords}">` : ''}
  
  <!-- Singularity Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=JetBrains+Mono:wght@100..800&display=swap" rel="stylesheet">
  
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Load React first and expose globally IMMEDIATELY -->
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script>window.React = React; window.react = React;</script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script>window.ReactDOM = ReactDOM; window['react-dom'] = ReactDOM;</script>
  <!-- Now load framer-motion and lucide (they can find React on window) -->
  <script src="https://unpkg.com/framer-motion@10.16.4/dist/framer-motion.js"></script>
  <script src="https://unpkg.com/lucide-react@0.294.0/dist/umd/lucide-react.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
          },
          colors: {
            zinc: { 950: '#09090b', 900: '#18181b', 800: '#27272a', 700: '#3f3f46', 600: '#52525b', 500: '#71717a', 400: '#a1a1aa', 300: '#d4d4d8', 200: '#e4e4e7', 100: '#f4f4f5' }
          }
        }
      }
    }
    
    // --- ROBUST PROXY SHIMS ---
    
    // 1. Motion Proxy
    // If framer-motion fails to load, or loads weirdly, we fallback to a Proxy.
    // The Proxy is a FUNCTION so that <motion /> doesn't crash (returns null).
    // The Proxy's 'get' trap returns the property name (e.g. 'div') so <motion.div> works.
    
    const motionProxy = new Proxy(function() { return null; }, {
      get: (target, prop) => {
        // If accessing a property like motion.div, return the tag name 'div'
        if (typeof prop === 'string') return prop;
        return 'div';
      }
    });
    
    // Try to find the real motion object
    // framer-motion UMD usually exposes 'Motion' global
    window.motion = (window.Motion && window.Motion.motion) || motionProxy;
    window.AnimatePresence = (window.Motion && window.Motion.AnimatePresence) || function({ children }) { return children; };

    // 2. Lucide Proxy
    // If lucide-react fails, we provide a Proxy that returns a DummyIcon component.
    // The DummyIcon is a function, so <Icon /> works.
    
    const dummyIcon = function(props) { return null; };
    const lucideProxy = new Proxy({}, {
      get: (target, prop) => {
        // If the icon exists in the real library, return it
        if (window.lucideReact && window.lucideReact[prop]) {
          return window.lucideReact[prop];
        }
        // Otherwise return dummy
        return dummyIcon;
      }
    });
    
    window.LucideIcons = window.lucideReact || lucideProxy;
    
    // Inject globals for the eval context
    window.React = React;
    window.ReactDOM = ReactDOM;
  </script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #09090b; color: #fff; }
    ::-webkit-scrollbar { width: 0px; background: transparent; }
    a { cursor: pointer; }
  </style>
  <script>
    // Block ALL navigation in preview - it's a preview, not a live site
    document.addEventListener('click', function(e) {
      var target = e.target;
      while (target && target !== document) {
        if (target.tagName === 'A' || target.tagName === 'BUTTON') {
          var href = target.getAttribute('href');
          // Allow anchor links that scroll within the page
          if (href && href.startsWith('#')) {
            // Smooth scroll to section
            var sectionId = href.slice(1);
            var element = document.getElementById(sectionId) || document.querySelector('[id$="' + sectionId + '"]');
            if (element) {
              e.preventDefault();
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            return;
          }
          // Block all other navigation
          e.preventDefault();
          return;
        }
        target = target.parentElement;
      }
    }, true);
  </script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-presets="react,typescript">
    // Global imports
    const { useState, useEffect, useRef, useMemo, useCallback } = React;
    const { motion, AnimatePresence } = window;
    
    // Next.js Mocks - using var to allow redeclaration by AI code
    var Image = (props) => {
      var { src, alt, width, height, className, style, fill, priority, quality, placeholder, blurDataURL, loader, unoptimized, ...rest } = props;
      var fillStyle = fill ? { position: 'absolute', height: '100%', width: '100%', inset: 0, objectFit: 'cover', ...style } : style;
      return <img src={src} alt={alt || ''} className={className} style={fillStyle} {...rest} />;
    };
    var Link = ({ href, children, ...props }) => <a href={href} onClick={(e) => { e.preventDefault(); }} {...props}>{children}</a>;
    var Head = ({ children }) => null;
    var Script = (props) => null;
    const getPath = () => window.location.hash?.slice(1) || '/';
    const usePathname = () => { try { return getPath(); } catch(e) { return '/'; } };
    const useSearchParams = () => { try { return new URLSearchParams(window.location.search); } catch(e) { return new URLSearchParams(); } };
    const useParams = () => { try { return { ...Object.fromEntries(new URLSearchParams(window.location.search)) }; } catch(e) { return {}; } };
    
    // Safe useRouter that works both inside and outside components
    const useRouter = (() => {
      let _pathname = getPath();
      const _push = (url) => { window.location.hash = url; _pathname = url; };
      const _replace = (url) => { window.location.hash = url; _pathname = url; };
      window.addEventListener('hashchange', () => { _pathname = getPath(); });
      
      return () => {
        try {
          const [pathname, setPathname] = useState(_pathname);
          useEffect(() => {
            const onHashChange = () => setPathname(getPath());
            window.addEventListener('hashchange', onHashChange);
            return () => window.removeEventListener('hashchange', onHashChange);
          }, []);
          return {
            push: _push,
            replace: _replace,
            prefetch: async () => {},
            back: () => window.history.back(),
            refresh: () => window.location.reload(),
            pathname,
            asPath: pathname,
            query: Object.fromEntries(new URLSearchParams(window.location.search)),
          };
        } catch (e) {
          // Not inside a component - return static router object
          return {
            push: _push,
            replace: _replace,
            prefetch: async () => {},
            back: () => window.history.back(),
            refresh: () => window.location.reload(),
            pathname: _pathname,
            asPath: _pathname,
            query: Object.fromEntries(new URLSearchParams(window.location.search)),
          };
        }
      };
    })();

    // Next.js module shims for Babel-evaluated code
    var NextImage = Image;
    var NextLink = Link;
    // Common utility stubs
    var cn = (...args) => args.filter(Boolean).join(' ');
    var clsx = cn;
    var twMerge = (...args) => args.filter(Boolean).join(' ');
    var cva = (base, config) => (props) => base;
    var exports = {};
    var module = { exports };
    var require = (name) => {
      if (name === 'react') return React;
      if (name === 'react-dom') return ReactDOM;
      if (name === 'framer-motion') return window.Motion || window.motion || window['framer-motion'] || {};
      if (name === 'lucide-react') return window.LucideIcons || {};
      if (name === 'next/image') return NextImage;
      if (name === 'next/link') return NextLink;
      if (name === 'next/navigation') return { useRouter, usePathname, useSearchParams, useParams };
      if (name === 'next/head') return ({ children }) => null;
      if (name === 'next/script') return (props) => null;
      if (name.startsWith('next/font')) return { className: '', style: {} };
      if (name === 'clsx' || name === 'classnames') return cn;
      if (name === 'tailwind-merge') return { twMerge };
      if (name === 'class-variance-authority') return { cva };
      if (name.endsWith('.css') || name.endsWith('.scss') || name.endsWith('.sass')) return {};
      return {};
    };

    // We do NOT use Object.assign for icons anymore, we use destructuring in the generated code.
    
    ${fullScript}
  </script>
</body>
</html>`;

    return html
  }, [sections, seo])

  return (
    <div className={`w-full h-full bg-zinc-950 transition-all duration-300 mx-auto ${
      deviceView === 'mobile' ? 'max-w-[375px] border-x border-zinc-800' :
      deviceView === 'tablet' ? 'max-w-[768px] border-x border-zinc-800' :
      'max-w-full'
    }`}>
      <iframe
        ref={internalRef}
        title="Preview"
        srcDoc={srcDoc}
        className="w-full h-full border-0 bg-zinc-950"
        sandbox="allow-scripts"
      />
    </div>
  )
})

export default FullSitePreviewFrame
