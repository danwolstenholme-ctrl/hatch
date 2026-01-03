'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Brain, Type } from 'lucide-react'

interface SectionPreviewProps {
  code: string
  darkMode?: boolean
  onRuntimeError?: (error: string) => void
  inspectorMode?: boolean
  onElementSelect?: (element: { tagName: string; text: string; className: string }) => void
  captureTrigger?: number
  onScreenshotCaptured?: (dataUrl: string) => void
  editMode?: boolean
  onTextEdit?: (oldText: string, newText: string) => void
  allowCodeView?: boolean
  onUpgradeClick?: () => void
}

type DeviceView = 'mobile' | 'tablet' | 'desktop'

const deviceSizes: Record<DeviceView, { width: string; icon: string; label: string }> = {
  mobile: { width: '375px', icon: '📱', label: 'Mobile' },
  tablet: { width: '768px', icon: '📱', label: 'Tablet' },
  desktop: { width: '100%', icon: '🖥️', label: 'Desktop' },
}

// Encode unescaped quotes inside Tailwind data-URI utilities to keep Babel happy
const sanitizeSvgDataUrls = (input: string) => {
  return input.replace(/bg-\[url\((['"])data:image\/svg\+xml,([\s\S]*?)\1\)\]/g, (full, quote, data) => {
    const safe = data.replace(/"/g, '%22').replace(/'/g, '%27')
    return `bg-[url(${quote}data:image/svg+xml,${safe}${quote})]`
  })
}

export default function SectionPreview({ code, darkMode = true, onRuntimeError, inspectorMode = false, onElementSelect, captureTrigger = 0, onScreenshotCaptured, editMode = false, onTextEdit, allowCodeView = false, onUpgradeClick }: SectionPreviewProps) {
  // Default to desktop on desktop, mobile on mobile devices
  const [deviceView, setDeviceView] = useState<DeviceView>('desktop')
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview')
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  const [isEditModeActive, setIsEditModeActive] = useState(false)
  const [showCodePaywall, setShowCodePaywall] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Handle screenshot trigger
  useEffect(() => {
    if (captureTrigger > 0 && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'capture-screenshot' }, '*')
    }
  }, [captureTrigger])

  // Send edit mode state to iframe
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'set-edit-mode', enabled: isEditModeActive }, '*')
    }
  }, [isEditModeActive])

  // Listen for runtime errors, element selection, text edits, and screenshots from the iframe
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
      
      if (event.data.type === 'text-edited') {
        onTextEdit?.(event.data.oldText, event.data.newText)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onRuntimeError, onElementSelect, onScreenshotCaptured, onTextEdit])

  // Set device view based on actual device - desktop on desktop, mobile on mobile
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const handle = () => {
      setIsMobileDevice(mq.matches)
      if (mq.matches) {
        // On mobile device: lock to mobile view
        setDeviceView('mobile')
        setViewMode('preview')
      } else {
        // On desktop: show desktop view
        setDeviceView('desktop')
      }
    }
    handle()
    mq.addEventListener('change', handle)
    return () => mq.removeEventListener('change', handle)
  }, [])

  const [srcDoc, setSrcDoc] = useState('')
  const displayCode = sanitizeSvgDataUrls(code?.trim() || '')

  useEffect(() => {
    let isMounted = true;
    const generate = async () => {
      if (!code) {
        if (isMounted) setSrcDoc('');
        return;
      }

      // Clean the code to remove markdown artifacts and "use client" directive
      const cleanCode = code
        .replace(/```tsx/g, '')
        .replace(/```typescript/g, '')
        .replace(/```/g, '')
        .replace(/'use client'/g, '')
        .replace(/"use client"/g, '')
        .trim();

      const sanitizedCode = sanitizeSvgDataUrls(cleanCode)

      // Use Babel to transform the code safely (No more Regex!)
      let transformedCode = ''
      let transformError = null

      try {
        const Babel = await import('@babel/standalone');
        transformedCode = Babel.transform(sanitizedCode, {
          presets: ['env', 'react', 'typescript'],
          filename: 'section.tsx',
        }).code || ''
      } catch (err: any) {
      console.error('Babel Transform Error:', err)
      transformError = err.message
    }

    if (transformError) {
      const errorHtml = `<!DOCTYPE html>
<html><body style="background:#0b0b0f;color:#f87171;font-family:ui-monospace,monospace;padding:24px;">
  <div style="max-width:640px;margin:0 auto;border:1px solid #3f3f46;border-radius:12px;padding:16px;background:#111827;">
    <h3 style="margin:0 0 8px;font-size:16px;color:#fca5a5;">Transform Error</h3>
    <p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:#e5e7eb;">${transformError}</p>
    <p style="margin:0;font-size:12px;color:#9ca3af;">Update the request or regenerate to continue.</p>
  </div>
  <script>window.parent?.postMessage({type:'preview-error',message:${JSON.stringify(transformError)}},'*');</script>
</body></html>`
      if (isMounted) setSrcDoc(errorHtml)
      return
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
  
  <!-- Load React first and expose globally IMMEDIATELY -->
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script>window.React = React; window.react = React;</script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script>window.ReactDOM = ReactDOM; window['react-dom'] = ReactDOM;</script>
  
  <!-- Now load framer-motion and lucide (they can find React on window) -->
  <script src="https://cdn.jsdelivr.net/npm/framer-motion@11/dist/framer-motion.js"></script>
  <script src="https://unpkg.com/lucide-react@0.294.0/dist/umd/lucide-react.js"></script>
  
  <script>
    // Ensure Motion is defined before we try to use it
    window.motion = window.Motion?.motion || new Proxy({}, {
      get: (target, prop) => prop // Return string for tag name if Motion fails
    });
    
    window.AnimatePresence = window.Motion?.AnimatePresence || function(p) { return p.children; };
    window.useInView = window.Motion?.useInView || function() { return true; };
    window.useScroll = window.Motion?.useScroll || function() { return { scrollY: 0, scrollYProgress: 0 }; };
    window.useTransform = window.Motion?.useTransform || function(v) { return v; };
    window.useMotionValue = window.Motion?.useMotionValue || function(v) { return { get: () => v, set: () => {} }; };
    window.useSpring = window.Motion?.useSpring || function(v) { return v; };
    window.useAnimation = window.Motion?.useAnimation || function() { return { start: () => {}, stop: () => {} }; };

    // Force all links to open in a new tab to keep the preview sandboxed
    document.addEventListener('click', (e) => {
      const anchor = e.target?.closest?.('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#')) return
      e.preventDefault()
      window.open(href, '_blank', 'noopener,noreferrer')
    }, true);
    
    // Robust Lucide Icons Proxy
    // Fix for React #130: Ensure we return a valid component (function or string), never an object/undefined
    window.LucideIcons = window.lucideReact || {};
    window.LucideIcons = new Proxy(window.LucideIcons, {
      get: (target, prop) => {
        if (prop in target) return target[prop];
        // Return a dummy component that renders nothing but doesn't crash
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
    
    // Edit Mode Logic - Double-click to edit text inline
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
            newText: newText
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
      if (!target.matches(editableSelectors)) return;
      target.style.outline = '1px dashed #a855f7';
      target.style.cursor = 'text';
    }, true);
    
    document.addEventListener('mouseout', (e) => {
      if (!editModeEnabled || activeEditor) return;
      const target = e.target;
      target.style.outline = '';
      target.style.cursor = '';
    }, true);
  </script>
  
  <script>
    // Mock CommonJS Environment for Babel Output
    var exports = {};
    var module = { exports: exports };
    
    // Next.js component stubs
    var NextImage = function(props) {
      var src = props.src, alt = props.alt, className = props.className, style = props.style, fill = props.fill;
      var fillStyle = fill ? Object.assign({ position: 'absolute', height: '100%', width: '100%', inset: 0, objectFit: 'cover' }, style) : style;
      return React.createElement('img', { src: src, alt: alt || '', className: className, style: fillStyle });
    };
    var NextLink = function(props) {
      return React.createElement('a', { href: props.href, className: props.className }, props.children);
    };
    var Image = NextImage;
    var Link = NextLink;
    var Head = function() { return null; };
    var Script = function() { return null; };
    
    // Next.js navigation hooks
    var useRouter = function() {
      return { push: function(url) { window.location.hash = url; }, replace: function(url) { window.location.hash = url; }, pathname: '/', query: {}, asPath: '/' };
    };
    var usePathname = function() { return '/'; };
    var useSearchParams = function() { return new URLSearchParams(); };
    
    // Utility stubs
    var cn = function() { return Array.prototype.slice.call(arguments).filter(Boolean).join(' '); };
    var clsx = cn;
    var twMerge = cn;
    var cva = function(base) { return function() { return base; }; };
    
    var require = function(name) {
      if (name === 'react') return React;
      if (name === 'react-dom') return ReactDOM;
      if (name === 'framer-motion') return window.Motion || window.motion || {};
      if (name === 'lucide-react') return window.LucideIcons;
      if (name === 'next/image') return NextImage;
      if (name === 'next/link') return NextLink;
      if (name === 'next/navigation') return { useRouter: useRouter, usePathname: usePathname, useSearchParams: useSearchParams };
      if (name === 'next/head') return Head;
      if (name === 'next/script') return Script;
      if (name.indexOf('next/font') === 0) return { className: '', style: {} };
      if (name === 'clsx' || name === 'classnames') return cn;
      if (name === 'tailwind-merge') return { twMerge: twMerge };
      if (name === 'class-variance-authority') return { cva: cva };
      if (name.endsWith('.css') || name.endsWith('.scss') || name.endsWith('.sass')) return {};
      return window[name] || {};
    };

    ${hooksDestructure}
    
    // Lucide icons - using var to avoid redeclaration errors with Image/Link
    var _icons = window.LucideIcons || {};
    var Menu = _icons.Menu, X = _icons.X, ChevronRight = _icons.ChevronRight, ChevronLeft = _icons.ChevronLeft, ChevronDown = _icons.ChevronDown, ChevronUp = _icons.ChevronUp, ArrowRight = _icons.ArrowRight, ArrowLeft = _icons.ArrowLeft, Check = _icons.Check, CheckCircle = _icons.CheckCircle, CheckCircle2 = _icons.CheckCircle2, Star = _icons.Star, Heart = _icons.Heart, Mail = _icons.Mail, Phone = _icons.Phone, MapPin = _icons.MapPin, Github = _icons.Github, Twitter = _icons.Twitter, Linkedin = _icons.Linkedin, Instagram = _icons.Instagram, Facebook = _icons.Facebook, Youtube = _icons.Youtube, ExternalLink = _icons.ExternalLink, Search = _icons.Search, User = _icons.User, Users = _icons.Users, Settings = _icons.Settings, Home = _icons.Home, Plus = _icons.Plus, Minus = _icons.Minus, Edit = _icons.Edit, Trash = _icons.Trash, Copy = _icons.Copy, Download = _icons.Download, Upload = _icons.Upload, Share = _icons.Share, Send = _icons.Send, Bell = _icons.Bell, Calendar = _icons.Calendar, Clock = _icons.Clock, Globe = _icons.Globe, Lock = _icons.Lock, Unlock = _icons.Unlock, Eye = _icons.Eye, EyeOff = _icons.EyeOff, Filter = _icons.Filter, Grid = _icons.Grid, List = _icons.List, MoreHorizontal = _icons.MoreHorizontal, MoreVertical = _icons.MoreVertical, RefreshCw = _icons.RefreshCw, RotateCcw = _icons.RotateCcw, Save = _icons.Save, Zap = _icons.Zap, Award = _icons.Award, Target = _icons.Target, TrendingUp = _icons.TrendingUp, BarChart = _icons.BarChart, PieChart = _icons.PieChart, Activity = _icons.Activity, Layers = _icons.Layers, Box = _icons.Box, Package = _icons.Package, Cpu = _icons.Cpu, Database = _icons.Database, Server = _icons.Server, Cloud = _icons.Cloud, Code = _icons.Code, Terminal = _icons.Terminal, FileText = _icons.FileText, Folder = _icons.Folder, ImageIcon = _icons.Image, Video = _icons.Video, Music = _icons.Music, Headphones = _icons.Headphones, Mic = _icons.Mic, Camera = _icons.Camera, Bookmark = _icons.Bookmark, Tag = _icons.Tag, AlertCircle = _icons.AlertCircle, Info = _icons.Info, HelpCircle = _icons.HelpCircle, Loader = _icons.Loader, LinkIcon = _icons.Link, MessageCircle = _icons.MessageCircle, Building = _icons.Building, Briefcase = _icons.Briefcase, Shield = _icons.Shield;
    
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
         const commonNames = [
           'GeneratedSection', 'Component', 'App', 'Section',
           'Hero', 'Features', 'Testimonials', 'Contact', 'Pricing', 'Faq', 'Footer', 'Header',
           'HeroSection', 'FeaturesSection', 'TestimonialsSection', 'ContactSection', 'PricingSection', 'FaqSection', 'FooterSection', 'HeaderSection'
         ];
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
            Preparing your first render
          </h3>
          <p className="text-sm text-zinc-500">
            Describe your section and we will assemble a live preview
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* View + Device Bar */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-zinc-900/60 border-b border-zinc-800">
        {!isMobileDevice && (
          <div className="inline-flex bg-zinc-900/70 border border-zinc-800 rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'preview'
                  ? 'bg-gradient-to-r from-emerald-600/70 to-teal-500/70 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-zinc-500 hover:text-zinc-200'
              }`}
            >
              Visual
            </button>
            <button
              onClick={() => {
                if (allowCodeView) {
                  setViewMode('code')
                } else {
                  setShowCodePaywall(true)
                }
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                viewMode === 'code'
                  ? 'bg-gradient-to-r from-emerald-600/70 to-teal-500/70 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-zinc-500 hover:text-zinc-200'
              }`}
            >
              Code
              {!allowCodeView && <span className="text-amber-400">🔒</span>}
            </button>
          </div>
        )}

        {!isMobileDevice && viewMode === 'preview' && (
          <div className="flex items-center gap-2">
            {/* Edit Mode Toggle */}
            <button
              onClick={() => setIsEditModeActive(!isEditModeActive)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                isEditModeActive
                  ? 'bg-violet-500/20 text-violet-400 border-violet-500/50'
                  : 'bg-zinc-900/70 text-zinc-500 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
              }`}
              title="Double-click text to edit"
            >
              <Type className="w-3.5 h-3.5" />
              <span>Edit Text</span>
            </button>
            
            {/* Device Selector */}
            <div className="flex items-center gap-1 bg-zinc-900/70 border border-zinc-800 rounded-lg p-1">
              {(Object.keys(deviceSizes) as DeviceView[]).map((device) => (
                <button
                  key={device}
                  onClick={() => setDeviceView(device)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    deviceView === device
                      ? 'bg-zinc-800 text-white border border-emerald-400/30'
                      : 'text-zinc-500 hover:text-zinc-200'
                  }`}
                >
                  <span>{deviceSizes[device].icon}</span>
                  <span>{deviceSizes[device].label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Code Paywall Modal */}
      {showCodePaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowCodePaywall(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 max-w-md mx-4 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <span className="text-3xl">🔒</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Code Access Locked</h3>
            <p className="text-zinc-400 mb-6">
              Upgrade to view and export your raw React + Tailwind code. 
              It&apos;s 100% yours to keep - no lock-in.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCodePaywall(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-zinc-400 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Maybe later
              </button>
              <button
                onClick={() => {
                  setShowCodePaywall(false)
                  onUpgradeClick?.()
                }}
                className="flex-1 px-4 py-2 text-sm font-bold text-black bg-emerald-500 rounded-lg hover:bg-emerald-400 transition-colors"
              >
                Unlock Code
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Preview / Code Container */}
      <div className="flex-1 flex items-start justify-center overflow-auto bg-zinc-950 p-4">
        {viewMode === 'code' && allowCodeView ? (
          <div className="w-full max-w-5xl h-full bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-auto">
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/80">
              <span className="text-xs font-mono text-emerald-300">Raw React + Tailwind (no wrappers)</span>
            </div>
            <pre className="p-4 text-xs font-mono text-zinc-100 whitespace-pre overflow-auto min-h-[320px]">
              {displayCode || '// Generate a section to see code'}
            </pre>
          </div>
        ) : (
          <motion.div
            initial={false}
            animate={{ width: deviceView === 'mobile' && isMobileDevice ? '100%' : deviceSizes[deviceView].width }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="h-full bg-zinc-900 rounded-lg overflow-hidden shadow-2xl"
            style={{ 
              maxWidth: '100%',
              minHeight: isMobileDevice ? '640px' : deviceView === 'desktop' ? '100%' : '600px',
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
        )}
      </div>
    </div>
  )
}