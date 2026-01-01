'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'

interface SectionPreviewProps {
  code: string
  darkMode?: boolean
  onRuntimeError?: (error: string) => void
  inspectorMode?: boolean
  onElementSelect?: (element: { tagName: string; text: string; className: string }) => void
  captureTrigger?: number
  onScreenshotCaptured?: (dataUrl: string) => void
}

type DeviceView = 'mobile' | 'tablet' | 'desktop'

const deviceSizes: Record<DeviceView, { width: string; icon: string; label: string }> = {
  mobile: { width: '375px', icon: '📱', label: 'Mobile' },
  tablet: { width: '768px', icon: '📱', label: 'Tablet' },
  desktop: { width: '100%', icon: '🖥️', label: 'Desktop' },
}

export default function SectionPreview({ code, darkMode = true, onRuntimeError, inspectorMode = false, onElementSelect, captureTrigger = 0, onScreenshotCaptured }: SectionPreviewProps) {
  const [deviceView, setDeviceView] = useState<DeviceView>('desktop')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Handle screenshot trigger
  useEffect(() => {
    if (captureTrigger > 0 && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'capture-screenshot' }, '*')
    }
  }, [captureTrigger])

  // Listen for runtime errors, element selection, and screenshots from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return
      
      if (event.data.type === 'preview-error') {
        console.warn('Preview Runtime Error:', event.data.message)
        onRuntimeError?.(event.data.message)
      }
      
      if (event.data.type === 'element-selected') {
        onElementSelect?.(event.data.element)
      }

      if (event.data.type === 'screenshot-captured') {
        onScreenshotCaptured?.(event.data.dataUrl)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onRuntimeError, onElementSelect, onScreenshotCaptured])

  const [srcDoc, setSrcDoc] = useState('')

  useEffect(() => {
    let isMounted = true;
    const generate = async () => {
      if (!code) {
        if (isMounted) setSrcDoc('');
        return;
      }

      // Use Babel to transform the code safely (No more Regex!)
      let transformedCode = ''
    let transformError = null

    try {
      const Babel = await import('@babel/standalone');
      transformedCode = Babel.transform(code, {
        presets: ['env', 'react', 'typescript'],
        filename: 'section.tsx',
      }).code
    } catch (err: any) {
      console.error('Babel Transform Error:', err)
      transformError = err.message
    }

    const hooksDestructure = `const { useState, useEffect, useMemo, useCallback, useRef, Fragment } = React;`

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            zinc: {
              950: '#09090b',
              900: '#18181b',
              800: '#27272a',
              700: '#3f3f46',
              600: '#52525b',
              500: '#71717a',
              400: '#a1a1aa',
              300: '#d4d4d8',
              200: '#e4e4e7',
              100: '#f4f4f5',
            }
          }
        }
      }
    }
  </script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    html, body, #root { min-height: 100%; width: 100%; }
    body { background: ${darkMode ? '#09090b' : '#ffffff'}; color: ${darkMode ? '#ffffff' : '#18181b'}; }
    .error-display { color: #f87171; padding: 2rem; font-family: ui-monospace, monospace; font-size: 0.75rem; white-space: pre-wrap; background: #18181b; border-radius: 0.5rem; margin: 1rem; }
  </style>
</head>
<body class="${darkMode ? 'dark' : ''}">
  <div id="root"></div>
  
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <script src="https://cdn.jsdelivr.net/npm/framer-motion@11/dist/framer-motion.js" crossorigin></script>
  <script src="https://unpkg.com/lucide-react@0.294.0/dist/umd/lucide-react.js" crossorigin></script>
  
  <script>
    window.motion = window.Motion?.motion || { div: 'div', span: 'span', button: 'button', a: 'a', p: 'p', h1: 'h1', h2: 'h2', h3: 'h3', section: 'section', nav: 'nav', ul: 'ul', li: 'li', img: 'img', form: 'form', input: 'input' };
    window.AnimatePresence = window.Motion?.AnimatePresence || function(p) { return p.children; };
    window.useInView = window.Motion?.useInView || function() { return true; };
    window.useScroll = window.Motion?.useScroll || function() { return { scrollY: 0, scrollYProgress: 0 }; };
    window.useTransform = window.Motion?.useTransform || function(v) { return v; };
    window.useMotionValue = window.Motion?.useMotionValue || function(v) { return { get: () => v, set: () => {} }; };
    window.useSpring = window.Motion?.useSpring || function(v) { return v; };
    window.useAnimation = window.Motion?.useAnimation || function() { return { start: () => {}, stop: () => {} }; };
    
    // Robust Lucide Icons Proxy
    window.LucideIcons = window.lucideReact || {};
    window.LucideIcons = new Proxy(window.LucideIcons, {
      get: (target, prop) => {
        if (prop in target) return target[prop];
        return function DummyIcon(props) { return null; };
      }
    });

    window.addEventListener('message', async (event) => {
      if (event.data.type === 'capture-screenshot') {
        try {
          // Wait for any animations or images to settle
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const canvas = await html2canvas(document.body, {
            useCORS: true,
            logging: false,
            scale: 1,
            allowTaint: true,
            backgroundColor: null
          });
          
          const dataUrl = canvas.toDataURL('image/png');
          window.parent.postMessage({ type: 'screenshot-captured', dataUrl }, '*');
        } catch (error) {
          console.error('Screenshot failed:', error);
          window.parent.postMessage({ type: 'screenshot-error', error: error.message }, '*');
        }
      }
    });

    window.onerror = function(message, source, lineno, colno, error) {
      console.error('Preview Error:', message);
      window.parent.postMessage({ type: 'preview-error', message: message, line: lineno }, '*');
      const root = document.getElementById('root');
      if (root) {
        root.innerHTML = '<div style="color: #ef4444; padding: 20px; font-family: monospace; background: #18181b; border-radius: 8px; margin: 20px; border: 1px solid #3f3f46;">' +
          '<h3 style="font-weight: bold; margin-bottom: 10px;">Runtime Error</h3>' +
          '<div style="margin-bottom: 10px;">' + message + '</div>' +
          '<div style="opacity: 0.7; font-size: 0.9em;">Line: ' + lineno + '</div>' +
          '</div>';
      }
    };

    // Inspector Mode Logic
    const inspectorMode = ${inspectorMode};
    
    if (inspectorMode) {
      document.addEventListener('mouseover', (e) => {
        e.stopPropagation();
        const target = e.target;
        if (target === document.body || target.id === 'root') return;
        
        target.style.outline = '2px solid #a855f7'; // Purple outline
        target.style.cursor = 'crosshair';
        
        // Add label
        const label = document.createElement('div');
        label.id = 'inspector-label';
        label.style.position = 'fixed';
        label.style.background = '#a855f7';
        label.style.color = 'white';
        label.style.padding = '2px 6px';
        label.style.borderRadius = '4px';
        label.style.fontSize = '10px';
        label.style.zIndex = '9999';
        label.style.pointerEvents = 'none';
        label.textContent = target.tagName.toLowerCase();
        
        const rect = target.getBoundingClientRect();
        label.style.top = (rect.top - 20) + 'px';
        label.style.left = rect.left + 'px';
        
        const existing = document.getElementById('inspector-label');
        if (existing) existing.remove();
        document.body.appendChild(label);
      }, true);
      
      document.addEventListener('mouseout', (e) => {
        e.stopPropagation();
        const target = e.target;
        target.style.outline = '';
        target.style.cursor = '';
        const label = document.getElementById('inspector-label');
        if (label) label.remove();
      }, true);
      
      document.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const target = e.target;
        if (target === document.body || target.id === 'root') return;
        
        // Flash effect
        target.style.transition = 'all 0.2s';
        target.style.backgroundColor = 'rgba(168, 85, 247, 0.2)';
        setTimeout(() => {
          target.style.backgroundColor = '';
        }, 300);
        
        window.parent.postMessage({ 
          type: 'element-selected', 
          element: {
            tagName: target.tagName.toLowerCase(),
            text: target.innerText?.slice(0, 50) || '',
            className: target.className || ''
          }
        }, '*');
      }, true);
    }
  </script>
  
  <script>
    // Mock CommonJS Environment for Babel Output
    var exports = {};
    var module = { exports: exports };
    var require = function(name) {
      if (name === 'react') return React;
      if (name === 'react-dom') return ReactDOM;
      if (name === 'framer-motion') return window.Motion;
      if (name === 'lucide-react') return window.LucideIcons;
      return window[name] || {};
    };

    ${hooksDestructure}
    
    const { Menu, X, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, ArrowRight, ArrowLeft, Check, CheckCircle, CheckCircle2, Star, Heart, Mail, Phone, MapPin, Github, Twitter, Linkedin, Instagram, Facebook, Youtube, ExternalLink, Search, User, Users, Settings, Home, Plus, Minus, Edit, Trash, Copy, Download, Upload, Share, Send, Bell, Calendar, Clock, Globe, Lock, Unlock, Eye, EyeOff, Filter, Grid, List, MoreHorizontal, MoreVertical, RefreshCw, RotateCcw, Save, Zap, Award, Target, TrendingUp, BarChart, PieChart, Activity, Layers, Box, Package, Cpu, Database, Server, Cloud, Code, Terminal, FileText, Folder, Image, Video, Music, Headphones, Mic, Camera, Bookmark, Tag, AlertCircle, Info, HelpCircle, Loader, Link, MessageCircle, Building, Briefcase, Shield } = window.LucideIcons || {};
    
    try {
      // Inject Transformed Code
      ${transformedCode}
      
      const root = ReactDOM.createRoot(document.getElementById('root'));
      let ComponentToRender = null;
      
      // 1. Try Default Export
      if (module.exports && module.exports.default) {
        ComponentToRender = module.exports.default;
      } 
      // 2. Try Named Exports (First Capitalized Function)
      else if (module.exports) {
        for (const key in module.exports) {
          if (typeof module.exports[key] === 'function' && /^[A-Z]/.test(key)) {
            ComponentToRender = module.exports[key];
            break;
          }
        }
      }
      
      // 3. Fallback: Check for global function declarations
      if (!ComponentToRender) {
         const commonNames = ['GeneratedSection', 'Component', 'Hero', 'Features', 'App'];
         for (const name of commonNames) {
           if (typeof window[name] === 'function') {
             ComponentToRender = window[name];
             break;
           }
         }
      }

      if (ComponentToRender) {
        root.render(React.createElement(ComponentToRender));
      } else {
        throw new Error('No valid React component found in exports.');
      }
    } catch (err) {
      console.error(err);
      document.getElementById('root').innerHTML = '<div class="error-display">Render Error: ' + err.message + '</div>';
    }
  </script>
</body>
</html>`
      if (isMounted) setSrcDoc(html);
    }
    generate();
    return () => { isMounted = false; }
  }, [code, darkMode, inspectorMode])

  if (!code) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20"
          >
            <Brain className="w-10 h-10 text-emerald-500" />
          </motion.div>
          <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
            Ready to hatch
          </h3>
          <p className="text-sm text-zinc-500">
            Describe your section and watch it come to life
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Device Toggle Bar */}
      <div className="flex items-center justify-center gap-1 p-2 bg-zinc-900/50 border-b border-zinc-800">
        {(Object.keys(deviceSizes) as DeviceView[]).map((device) => (
          <button
            key={device}
            onClick={() => setDeviceView(device)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              deviceView === device
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <span>{deviceSizes[device].icon}</span>
            <span>{deviceSizes[device].label}</span>
          </button>
        ))}
      </div>
      
      {/* Preview Container */}
      <div className="flex-1 flex items-start justify-center overflow-auto bg-zinc-950 p-4">
        <motion.div
          initial={false}
          animate={{ width: deviceSizes[deviceView].width }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="h-full bg-zinc-900 rounded-lg overflow-hidden shadow-2xl"
          style={{ 
            maxWidth: '100%',
            minHeight: deviceView === 'desktop' ? '100%' : '600px',
          }}
        >
          {/* Device Frame */}
          {deviceView !== 'desktop' && (
            <div className="h-6 bg-zinc-800 flex items-center justify-center gap-1 border-b border-zinc-700">
              <div className="w-16 h-1 bg-zinc-600 rounded-full" />
            </div>
          )}
          <iframe
            ref={iframeRef}
            srcDoc={srcDoc}
            className="w-full border-0"
            style={{ 
              height: deviceView === 'desktop' ? '100%' : 'calc(100% - 24px)',
            }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            title="Section Preview"
          />
        </motion.div>
      </div>
    </div>
  )
}