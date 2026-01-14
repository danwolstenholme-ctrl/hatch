'use client'

import { useMemo, forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { DesignTokens } from '@/lib/tokens'

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
  inspectMode?: boolean
  designTokens?: DesignTokens
  onTextEdit?: (oldText: string, newText: string, sectionId: string) => void
  onElementSelect?: (element: SelectedElement | null) => void
  onSyntaxError?: (error: string, lineNumber?: number) => void
  onRuntimeError?: (error: string, sectionId?: string) => void
}

// Element info passed when user clicks something in inspect mode
export interface SelectedElement {
  tagName: string
  className: string
  textContent: string
  computedStyles: {
    fontSize: string
    fontWeight: string
    color: string
    backgroundColor: string
    padding: string
    margin: string
    borderRadius: string
    width: string
    height: string
  }
  sectionId: string
  elementPath: string // CSS selector path to re-find element
}

// =============================================================================
// FULL SITE PREVIEW FRAME
// Renders all assembled sections in an iframe - simplified for reliability
// =============================================================================

const FullSitePreviewFrame = forwardRef<HTMLIFrameElement, FullSitePreviewFrameProps>(function FullSitePreviewFrame({ sections, deviceView, seo, editMode = false, inspectMode = false, designTokens, onTextEdit, onElementSelect, onSyntaxError, onRuntimeError }, ref) {
  const internalRef = useRef<HTMLIFrameElement>(null)
  
  // Expose the internal ref to parent
  useImperativeHandle(ref, () => internalRef.current as HTMLIFrameElement)
  
  // Send edit mode state to iframe
  useEffect(() => {
    if (internalRef.current?.contentWindow) {
      internalRef.current.contentWindow.postMessage({ type: 'set-edit-mode', enabled: editMode }, '*')
    }
  }, [editMode])
  
  // Send inspect mode state to iframe
  useEffect(() => {
    if (internalRef.current?.contentWindow) {
      internalRef.current.contentWindow.postMessage({ type: 'set-inspect-mode', enabled: inspectMode }, '*')
    }
  }, [inspectMode])
  
  // Listen for text edit messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'text-edited' && onTextEdit) {
        onTextEdit(event.data.oldText, event.data.newText, event.data.sectionId || '')
      }
      // Listen for element selection in inspect mode
      if (event.data?.type === 'element-selected' && onElementSelect) {
        onElementSelect(event.data.element)
      }
      if (event.data?.type === 'element-deselected' && onElementSelect) {
        onElementSelect(null)
      }
      // Listen for syntax errors from iframe - pass to Overseer for auto-fix
      if (event.data?.type === 'syntax-error') {
        console.log('[Overseer] Received syntax error from iframe:', event.data.error)
        if (onSyntaxError) {
          onSyntaxError(event.data.error, event.data.line)
        }
      }
      // Listen for runtime errors - pass to self-healing
      if (event.data?.type === 'runtime-error') {
        console.log('[Self-Healing] Received runtime error from iframe:', event.data.error)
        if (onRuntimeError) {
          onRuntimeError(event.data.error, event.data.sectionId)
        }
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onTextEdit, onSyntaxError])
  
  const srcDoc = useMemo(() => {
    if (!sections || sections.length === 0) {
      console.log('[FullSitePreviewFrame] No sections to render')
      return ''
    }
    
    console.log('[FullSitePreviewFrame] Generating srcDoc for', sections.length, 'sections:', sections.map(s => s.id))

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
      // This is critical - Claude often outputs TS in refined code
      code = code
        // 1. Strip inline type annotation objects: ({ foo }: { foo: string }) → ({ foo })
        //    Must handle nested braces and multi-line
        .replace(/\}\s*:\s*\{[^{}]*\}/g, '}')
        .replace(/\}\s*:\s*\{[\s\S]*?\}/g, '}')
        
        // 2. Strip interface/type definitions entirely
        .replace(/^(export\s+)?(interface|type)\s+\w+[\s\S]*?^\}/gm, '')
        
        // 3. Strip optional type annotations: foo?: string → foo
        .replace(/\?\s*:\s*(string|number|boolean|any|void|null|undefined|never|unknown|React\.\w+|\w+\[\])/g, '')
        
        // 4. Strip required type annotations: foo: string → foo  
        .replace(/:\s*(string|number|boolean|any|void|null|undefined|never|unknown)\s*([=,\)\}\]])/g, '$2')
        .replace(/:\s*(string|number|boolean|any|void|null|undefined|never|unknown)\s*$/gm, '')
        
        // 5. Strip React types: : React.FC, : React.ReactNode, etc.
        .replace(/:\s*React\.\w+(<[^>]*>)?(\[\])?\s*([=,\)\}])?/g, (m, g, arr, end) => end || '')
        
        // 6. Strip array types: : string[], : number[]
        .replace(/:\s*\w+\[\]\s*([=,\)\}])/g, '$1')
        
        // 7. Strip generic constraints: <T extends Something>
        .replace(/<\w+\s+extends\s+[^>]+>/g, '')
        
        // 8. Strip type assertions: as string, as SomeType
        .replace(/\s+as\s+\w+(\[\])?/g, '')
        
        // 9. Strip return type annotations: ): string => or ): void {
        .replace(/\)\s*:\s*(string|number|boolean|void|any|null|undefined|never|React\.\w+|\w+\[\])\s*(=>|\{)/g, ') $2')
        
        // 10. Strip generic type parameters on functions: function foo<T>() → function foo()
        .replace(/(<[A-Z]\w*(,\s*[A-Z]\w*)*>)\s*\(/g, '(')

      // =============================================================================
      // TERNARY FIXER - Fix Claude's incomplete ternary operators
      // =============================================================================
      // ONLY fix patterns that are UNAMBIGUOUSLY broken - don't touch valid code
      
      // Fix: ={condition ? { object }} (missing : {})
      code = code.replace(
        /=\{(\w+)\s*\?\s*(\{[^{}]*\})\s*\}\}/g,
        (match, condition, trueValue) => {
          if (match.includes(' : ')) return match
          return `={${condition} ? ${trueValue} : {}}`
        }
      )

      // =============================================================================
      // JSX SYNTAX FIXER - Fix common JSX syntax issues from Claude
      // =============================================================================
      
      // Fix: `) }` → `)}` - stray space between closing paren and brace in JSX
      code = code.replace(/\)\s+\}/g, ')}')
      
      // Fix: `{ }` in JSX expressions that should be `{}` (empty object)
      code = code.replace(/\{\s+\}/g, '{}')
      
      // Fix: `( )` that should be `()` (empty parens)
      code = code.replace(/\(\s+\)/g, '()')
      
      // Fix: `} )` → `})` - stray space between brace and paren
      code = code.replace(/\}\s+\)/g, '})')
      
      // Fix: `( {` → `({` - stray space in object destructuring
      code = code.replace(/\(\s+\{/g, '({')
      
      // Fix: `} ,` → `},` - stray space before comma
      code = code.replace(/\}\s+,/g, '},')
      
      // Fix: `] )` → `])` - stray space in array closing
      code = code.replace(/\]\s+\)/g, '])')

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
      // Safe Component Wrapper to catch "got: object" errors and runtime errors
      function SafeSection({ component: Component, sectionId }) {
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
          const errMsg = 'Invalid export type: ' + typeof Component;
          window.parent.postMessage({ type: 'runtime-error', error: errMsg, sectionId: sectionId }, '*');
          return <div className="p-4 text-red-500 border border-red-500 rounded bg-red-950/50">
            <p className="font-bold">Section Error</p>
            <p className="text-sm opacity-75">{errMsg}</p>
          </div>;
        } catch (err) {
          console.error('Section render error:', err);
          window.parent.postMessage({ type: 'runtime-error', error: err.message, sectionId: sectionId }, '*');
          return <div className="p-4 text-red-500 border border-red-500 rounded bg-red-950/50">
            <p className="font-bold">Render Error</p>
            <p className="text-sm opacity-75">{err.message}</p>
          </div>;
        }
      }
      
      // Global error handler for uncaught runtime errors
      window.onerror = function(message, source, lineno, colno, error) {
        console.error('[Preview Runtime Error]', message, error);
        window.parent.postMessage({ 
          type: 'runtime-error', 
          error: String(message), 
          line: lineno 
        }, '*');
        return true;
      };
      
      // Promise rejection handler
      window.onunhandledrejection = function(event) {
        console.error('[Preview Unhandled Promise]', event.reason);
        window.parent.postMessage({ 
          type: 'runtime-error', 
          error: 'Promise rejected: ' + String(event.reason)
        }, '*');
      };

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
                <SafeSection component={Header} sectionId="header" />
              </div>
            ) : null}

            <div className="flex-1">
              {BodySections.map((item, idx) => (
                <div key={idx} id={'section-' + item.id} className="scroll-mt-4">
                  <SafeSection component={item.component} sectionId={item.id} />
                </div>
              ))}
            </div>

            {Footer ? (
              <div id="section-footer" className="shrink-0 scroll-mt-4">
                <SafeSection component={Footer} sectionId="footer" />
              </div>
            ) : null}
          </div>
        );
      }

      const root = ReactDOM.createRoot(document.getElementById('root'));
      try {
        root.render(<App />);
        console.log('[Preview] Render complete!');
      } catch (err) {
        console.error('[Preview] Render failed:', err);
        document.getElementById('root').innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#ef4444;font-family:ui-monospace,monospace;flex-direction:column;gap:12px;padding:20px;text-align:center;"><div style="font-size:14px;font-weight:600;">Render Error</div><div style="font-size:12px;color:#fca5a5;max-width:400px;word-break:break-word;">' + String(err.message || err).slice(0, 200) + '</div></div>';
        window.parent.postMessage({ type: 'runtime-error', error: String(err.message || err) }, '*');
      }
      
      // ============================================
      // EDIT MODE - Double-click to edit text inline
      // ============================================
      let editModeEnabled = false;
      let activeEditor = null;
      
      // Detect if mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
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
            div.textContent = isMobile ? '✏️ Edit Mode - Tap text to edit' : '✏️ Edit Mode - Double-click text to edit';
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
      
      // Mobile: use single tap when edit mode is on (dblclick doesn't work well on iOS)
      // Desktop: use double-click
      function handleEditTrigger(e) {
        if (!editModeEnabled) return;
        
        const target = e.target;
        if (!target.matches || !target.matches(editableSelectors)) return;
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
        
        // Delay focus slightly on mobile to prevent scroll jump
        setTimeout(() => {
          target.focus();
          // Select all text
          try {
            const range = document.createRange();
            range.selectNodeContents(target);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
          } catch (err) {
            console.log('Selection failed:', err);
          }
        }, isMobile ? 100 : 0);
        
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
      }
      
      // Attach edit trigger event listeners
      // Desktop: double-click to edit
      document.addEventListener('dblclick', handleEditTrigger, true);
      // Mobile: single tap to edit (double-tap zooms on iOS, doesn't fire dblclick reliably)
      if (isMobile) {
        document.addEventListener('click', handleEditTrigger, true);
      }
      
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
      
      // ============================================
      // INSPECT MODE - Click to select and edit elements
      // ============================================
      let inspectModeEnabled = false;
      let selectedElement = null;
      let hoverElement = null;
      
      // Create selection highlight overlay
      const selectionOverlay = document.createElement('div');
      selectionOverlay.id = 'inspect-selection';
      selectionOverlay.style.cssText = 'position:fixed;pointer-events:none;border:2px solid #10b981;background:rgba(16,185,129,0.1);z-index:99998;display:none;transition:all 0.1s ease;';
      document.body.appendChild(selectionOverlay);
      
      // Create hover highlight overlay
      const hoverOverlay = document.createElement('div');
      hoverOverlay.id = 'inspect-hover';
      hoverOverlay.style.cssText = 'position:fixed;pointer-events:none;border:1px dashed #60a5fa;background:rgba(96,165,250,0.05);z-index:99997;display:none;transition:all 0.05s ease;';
      document.body.appendChild(hoverOverlay);
      
      function updateOverlay(overlay, element) {
        if (!element) {
          overlay.style.display = 'none';
          return;
        }
        const rect = element.getBoundingClientRect();
        overlay.style.display = 'block';
        overlay.style.top = rect.top + 'px';
        overlay.style.left = rect.left + 'px';
        overlay.style.width = rect.width + 'px';
        overlay.style.height = rect.height + 'px';
      }
      
      function getElementPath(el) {
        const path = [];
        while (el && el !== document.body) {
          let selector = el.tagName.toLowerCase();
          if (el.id) {
            selector += '#' + el.id;
            path.unshift(selector);
            break;
          } else if (el.className && typeof el.className === 'string') {
            const classes = el.className.split(' ').filter(c => c && !c.includes(':'));
            if (classes.length) selector += '.' + classes.slice(0, 2).join('.');
          }
          const siblings = el.parentElement ? Array.from(el.parentElement.children).filter(c => c.tagName === el.tagName) : [];
          if (siblings.length > 1) {
            const idx = siblings.indexOf(el);
            selector += ':nth-of-type(' + (idx + 1) + ')';
          }
          path.unshift(selector);
          el = el.parentElement;
        }
        return path.join(' > ');
      }
      
      window.addEventListener('message', (event) => {
        if (event.data.type === 'set-inspect-mode') {
          inspectModeEnabled = event.data.enabled;
          document.body.style.cursor = inspectModeEnabled ? 'crosshair' : '';
          
          // Show/hide indicator
          let indicator = document.getElementById('inspect-mode-indicator');
          if (inspectModeEnabled && !indicator) {
            const div = document.createElement('div');
            div.id = 'inspect-mode-indicator';
            div.style.cssText = 'position:fixed;top:8px;left:50%;transform:translateX(-50%);background:#10b981;color:white;padding:4px 12px;border-radius:9999px;font-size:11px;z-index:99999;font-family:system-ui;pointer-events:none;';
            div.textContent = '🎯 Inspect Mode - Click any element to edit';
            document.body.appendChild(div);
          } else if (!inspectModeEnabled && indicator) {
            indicator.remove();
            selectionOverlay.style.display = 'none';
            hoverOverlay.style.display = 'none';
            selectedElement = null;
            window.parent.postMessage({ type: 'element-deselected' }, '*');
          }
        }
        
        // Apply style changes from parent
        if (event.data.type === 'apply-element-style' && selectedElement) {
          const { property, value } = event.data;
          selectedElement.style[property] = value;
          updateOverlay(selectionOverlay, selectedElement);
        }
      });
      
      // Hover highlight
      document.addEventListener('mousemove', (e) => {
        if (!inspectModeEnabled || editModeEnabled) return;
        const target = e.target;
        if (target === document.body || target.id === 'root' || target.id?.startsWith('inspect-') || target.id?.startsWith('edit-')) {
          hoverOverlay.style.display = 'none';
          return;
        }
        if (target !== hoverElement) {
          hoverElement = target;
          updateOverlay(hoverOverlay, target);
        }
      }, true);
      
      // Click to select
      document.addEventListener('click', (e) => {
        if (!inspectModeEnabled || editModeEnabled) return;
        
        const target = e.target;
        if (target === document.body || target.id === 'root' || target.id?.startsWith('inspect-') || target.id?.startsWith('edit-')) {
          return;
        }
        
        e.preventDefault();
        e.stopPropagation();
        
        selectedElement = target;
        updateOverlay(selectionOverlay, target);
        hoverOverlay.style.display = 'none';
        
        // Get computed styles
        const cs = window.getComputedStyle(target);
        const elementInfo = {
          tagName: target.tagName.toLowerCase(),
          className: target.className || '',
          textContent: target.innerText?.slice(0, 100) || '',
          computedStyles: {
            fontSize: cs.fontSize,
            fontWeight: cs.fontWeight,
            color: cs.color,
            backgroundColor: cs.backgroundColor,
            padding: cs.padding,
            margin: cs.margin,
            borderRadius: cs.borderRadius,
            width: cs.width,
            height: cs.height,
          },
          sectionId: findSectionId(target),
          elementPath: getElementPath(target)
        };
        
        window.parent.postMessage({ type: 'element-selected', element: elementInfo }, '*');
      }, true);
      
      // ESC to deselect
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && inspectModeEnabled && selectedElement) {
          selectedElement = null;
          selectionOverlay.style.display = 'none';
          window.parent.postMessage({ type: 'element-deselected' }, '*');
        }
      });
      
      // ============================================
      // LINK INTERCEPTION - Prevent navigation in preview
      // ============================================
      // Stop ALL link clicks from navigating the iframe
      // This prevents the iframe from loading the real HatchIt app
      document.addEventListener('click', (e) => {
        // Find if click target is inside an anchor or is an anchor
        const link = e.target.closest ? e.target.closest('a') : null;
        if (link || e.target.tagName === 'A') {
          const anchor = link || e.target;
          const href = anchor.getAttribute('href');
          
          // Allow anchor links within the page (scroll to section)
          if (href && href.startsWith('#')) {
            const targetId = href.slice(1);
            const targetEl = document.getElementById(targetId) || document.querySelector('[id="section-' + targetId + '"]');
            if (targetEl) {
              e.preventDefault();
              targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            return;
          }
          
          // Block all other navigation
          e.preventDefault();
          e.stopPropagation();
          
          // Show a brief toast indicating link was clicked but not followed
          const toast = document.createElement('div');
          toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(39,39,42,0.95);color:#a1a1aa;padding:8px 16px;border-radius:8px;font-size:12px;z-index:99999;font-family:system-ui;border:1px solid rgba(63,63,70,0.5);backdrop-filter:blur(8px);';
          toast.textContent = 'Link: ' + (href || 'none') + ' (disabled in preview)';
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 2000);
        }
      }, true);
      
      // Also intercept form submissions
      document.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const toast = document.createElement('div');
        toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(39,39,42,0.95);color:#a1a1aa;padding:8px 16px;border-radius:8px;font-size:12px;z-index:99999;font-family:system-ui;border:1px solid rgba(63,63,70,0.5);backdrop-filter:blur(8px);';
        toast.textContent = 'Form submission disabled in preview';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
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
  <script>window.React = React; window.react = React; console.log('[Preview] React loaded');</script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script>window.ReactDOM = ReactDOM; window['react-dom'] = ReactDOM; console.log('[Preview] ReactDOM loaded');</script>
  <!-- Now load framer-motion and lucide (they can find React on window) -->
  <script src="https://unpkg.com/framer-motion@10.16.4/dist/framer-motion.js"></script>
  <script>console.log('[Preview] framer-motion loaded, Motion:', typeof Motion, 'motion:', typeof motion);</script>
  <script src="https://unpkg.com/lucide-react@0.294.0/dist/umd/lucide-react.js"></script>
  <script>console.log('[Preview] lucide-react loaded:', typeof lucideReact);</script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script>console.log('[Preview] Babel loaded:', typeof Babel);</script>
  <script>
    // Show loading indicator until Babel runs
    window._previewLoading = true;
    setTimeout(function() {
      if (window._previewLoading) {
        var root = document.getElementById('root');
        if (root && !root.innerHTML) {
          root.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#ef4444;font-family:system-ui;flex-direction:column;gap:12px;padding:20px;text-align:center;"><div style="font-size:14px;font-weight:600;">Preview Failed to Load</div><div style="font-size:12px;color:#a1a1aa;max-width:300px;">Check browser console for errors. Try refreshing.</div></div>';
          window.parent.postMessage({ type: 'runtime-error', error: 'Preview failed to load - check console' }, '*');
        }
      }
    }, 3000);
    
    // Global error handler - notify parent of syntax errors for auto-fix
    window.onerror = function(message, source, lineno, colno, error) {
      console.error('[Preview Error]', message, 'at line', lineno);
      // Show error in root
      var root = document.getElementById('root');
      if (root) {
        root.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#ef4444;font-family:ui-monospace,monospace;flex-direction:column;gap:12px;padding:20px;text-align:center;"><div style="font-size:14px;font-weight:600;">Runtime Error</div><div style="font-size:12px;color:#fca5a5;max-width:400px;word-break:break-word;">' + String(message).slice(0, 200) + '</div><div style="font-size:11px;color:#71717a;">Line: ' + lineno + '</div></div>';
      }
      if (message && (message.includes('SyntaxError') || message.includes('Unexpected token'))) {
        window.parent.postMessage({
          type: 'syntax-error',
          error: String(message),
          line: lineno
        }, '*');
      } else {
        window.parent.postMessage({
          type: 'runtime-error',
          error: String(message),
          line: lineno
        }, '*');
      }
      return false;
    };
    
    // Also catch Babel compile errors via custom transformer
    if (window.Babel) {
      const originalTransform = window.Babel.transform;
      window.Babel.transform = function(code, options) {
        try {
          return originalTransform.call(this, code, options);
        } catch (e) {
          // Extract line number from Babel error
          const lineMatch = e.message && e.message.match(/[(](\\d+):(\\d+)[)]/);
          const line = lineMatch ? parseInt(lineMatch[1], 10) : undefined;
          console.log('[Overseer] Babel syntax error captured:', e.message, 'line:', line);
          window.parent.postMessage({
            type: 'syntax-error',
            error: e.message || String(e),
            line: line
          }, '*');
          throw e;
        }
      };
    }
    
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
    // If framer-motion fails to load, we fallback to a Proxy that returns
    // React components that render the underlying HTML element.
    // This ensures <motion.div> renders as <div> even without framer-motion.
    
    const createMotionComponent = (tag) => {
      return function MotionComponent(props) {
        const { initial, animate, exit, transition, whileHover, whileTap, whileInView, variants, ...rest } = props;
        return React.createElement(tag, rest);
      };
    };
    
    const motionProxy = new Proxy({}, {
      get: (target, prop) => {
        if (typeof prop === 'string') {
          return createMotionComponent(prop);
        }
        return createMotionComponent('div');
      }
    });
    
    // Try to find the real motion object from framer-motion UMD
    // framer-motion UMD exposes 'Motion' global with motion, AnimatePresence, etc.
    const realMotion = window.Motion?.motion;
    window.motion = realMotion || motionProxy;
    window.AnimatePresence = window.Motion?.AnimatePresence || function AnimatePresenceFallback({ children }) { return children; };
    
    // Shim other framer-motion hooks that AI might use
    window.useInView = window.Motion?.useInView || function() { return true; };
    window.useScroll = window.Motion?.useScroll || function() { return { scrollY: { get: () => 0 }, scrollYProgress: { get: () => 0 } }; };
    window.useTransform = window.Motion?.useTransform || function(value) { return value; };
    window.useMotionValue = window.Motion?.useMotionValue || function(v) { return { get: () => v, set: () => {} }; };
    window.useSpring = window.Motion?.useSpring || function(v) { return v; };
    window.useAnimation = window.Motion?.useAnimation || function() { return { start: () => Promise.resolve(), stop: () => {} }; };
    window.useReducedMotion = window.Motion?.useReducedMotion || function() { return false; };

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
    
    /* Design Token CSS Variables - Live Styling Controls */
    :root {
      --section-padding: ${designTokens?.sectionPadding ?? 80}px;
      --component-gap: ${designTokens?.componentGap ?? 24}px;
      --border-radius: ${designTokens?.borderRadius ?? 12}px;
      --heading-multiplier: ${designTokens?.headingSizeMultiplier ?? 1};
      --body-multiplier: ${designTokens?.bodySizeMultiplier ?? 1};
      --button-scale: ${designTokens?.buttonScale ?? 1};
      --icon-scale: ${designTokens?.iconScale ?? 1};
      --font-weight: ${designTokens?.fontWeight === 'normal' ? 400 : designTokens?.fontWeight === 'medium' ? 500 : designTokens?.fontWeight === 'semibold' ? 600 : designTokens?.fontWeight === 'bold' ? 700 : 500};
      --shadow: ${designTokens?.shadowIntensity === 'none' ? 'none' : designTokens?.shadowIntensity === 'subtle' ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' : designTokens?.shadowIntensity === 'medium' ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' : '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'};
    }
    
    /* Apply design tokens to common patterns */
    section, [class*="py-"] {
      padding-top: var(--section-padding) !important;
      padding-bottom: var(--section-padding) !important;
    }
    
    /* Apply border radius to cards and buttons */
    [class*="rounded-xl"], [class*="rounded-lg"], [class*="rounded-2xl"] {
      border-radius: var(--border-radius) !important;
    }
    
    /* Apply gap to flex and grid containers */
    [class*="gap-"] {
      gap: var(--component-gap) !important;
    }
    
    /* Apply heading size multiplier */
    h1 { font-size: calc(2.25rem * var(--heading-multiplier)); }
    h2 { font-size: calc(1.875rem * var(--heading-multiplier)); }
    h3 { font-size: calc(1.5rem * var(--heading-multiplier)); }
    h4 { font-size: calc(1.25rem * var(--heading-multiplier)); }
    
    /* Apply body text size multiplier */
    p, li, span:not([class*="text-"]), div:not([class*="text-"]) > span {
      font-size: calc(1rem * var(--body-multiplier));
    }
    
    /* Apply button scale - affects padding and font size */
    button, a[class*="bg-"], [class*="btn"], [role="button"] {
      padding: calc(12px * var(--button-scale)) calc(24px * var(--button-scale)) !important;
      font-size: calc(1rem * var(--button-scale)) !important;
    }
    
    /* Apply icon scale - SVGs and lucide icons */
    svg {
      transform: scale(var(--icon-scale));
      transform-origin: center;
    }
    
    /* Also target common icon wrapper classes */
    [class*="w-"][class*="h-"] > svg,
    [class*="size-"] > svg {
      width: calc(100% * var(--icon-scale)) !important;
      height: calc(100% * var(--icon-scale)) !important;
      transform: none;
    }
    
    /* Apply shadow */
    [class*="shadow"] {
      box-shadow: var(--shadow) !important;
    }
  </style>
  <script>
    // Block ALL navigation in preview - it's a preview, not a live site
    // Handle both click and touch events for mobile Safari
    function blockNavigation(e) {
      var target = e.target;
      while (target && target !== document) {
        if (target.tagName === 'A' || target.tagName === 'BUTTON') {
          var href = target.getAttribute('href') || target.getAttribute('data-href');
          // Allow anchor links that scroll within the page
          if (href && href.startsWith('#') && href.length > 1) {
            // Smooth scroll to section
            var sectionId = href.slice(1);
            var element = document.getElementById(sectionId) || document.querySelector('[id$="' + sectionId + '"]');
            if (element) {
              e.preventDefault();
              e.stopPropagation();
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            return false;
          }
          // Block all other navigation
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        target = target.parentElement;
      }
    }
    document.addEventListener('click', blockNavigation, true);
    document.addEventListener('touchend', blockNavigation, true);
    // Prevent any default touch behaviors that might cause navigation
    document.addEventListener('touchstart', function(e) {
      var target = e.target;
      while (target && target !== document) {
        if (target.tagName === 'A') {
          // Don't prevent touchstart, just mark it
          target.setAttribute('data-touched', 'true');
          return;
        }
        target = target.parentElement;
      }
    }, { passive: true });
  </script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-presets="react,typescript">
    // Global imports
    const { useState, useEffect, useRef, useMemo, useCallback } = React;
    const { motion, AnimatePresence, useInView, useScroll, useTransform, useMotionValue, useSpring, useAnimation, useReducedMotion } = window;
    
    // Next.js Mocks - using var to allow redeclaration by AI code
    var Image = (props) => {
      var { src, alt, width, height, className, style, fill, priority, quality, placeholder, blurDataURL, loader, unoptimized, ...rest } = props;
      var fillStyle = fill ? { position: 'absolute', height: '100%', width: '100%', inset: 0, objectFit: 'cover', ...style } : style;
      return <img src={src} alt={alt || ''} className={className} style={fillStyle} {...rest} />;
    };
    var Link = ({ href, children, ...props }) => <a href="#" role="link" data-href={href} onClick={(e) => { e.preventDefault(); e.stopPropagation(); return false; }} onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); return false; }} {...props}>{children}</a>;
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
      if (name === 'framer-motion') return {
        motion: window.motion,
        AnimatePresence: window.AnimatePresence,
        useInView: window.useInView,
        useScroll: window.useScroll,
        useTransform: window.useTransform,
        useMotionValue: window.useMotionValue,
        useSpring: window.useSpring,
        useAnimation: window.useAnimation,
        useReducedMotion: window.useReducedMotion,
        ...(window.Motion || {})
      };
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
    
    // Mark preview as loaded (clears timeout fallback)
    window._previewLoading = false;
    console.log('[Preview] Starting render...');
    
    ${fullScript}
  </script>
</body>
</html>`;

    return html
  }, [sections, seo, designTokens])

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
        sandbox="allow-scripts allow-same-origin"
        referrerPolicy="no-referrer"
        loading="lazy"
      />
    </div>
  )
})

export default FullSitePreviewFrame
