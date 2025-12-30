'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

interface SectionPreviewProps {
  code: string
  darkMode?: boolean
}

type DeviceView = 'mobile' | 'tablet' | 'desktop'

const deviceSizes: Record<DeviceView, { width: string; icon: string; label: string }> = {
  mobile: { width: '375px', icon: '📱', label: 'Mobile' },
  tablet: { width: '768px', icon: '📱', label: 'Tablet' },
  desktop: { width: '100%', icon: '🖥️', label: 'Desktop' },
}

export default function SectionPreview({ code, darkMode = true }: SectionPreviewProps) {
  const [deviceView, setDeviceView] = useState<DeviceView>('desktop')

  const srcDoc = useMemo(() => {
    if (!code) return ''

    // Use ONLY the current section code for preview
    const codeToRender = code

    const hooksDestructure = `const { useState, useEffect, useMemo, useCallback, useRef, Fragment } = React;`

    // Clean code for browser execution
    let cleanedCode = codeToRender
      .replace(/export\s+default\s+/g, '')
      .replace(/export\s+/g, '')
      .replace(/import\s+.*?from\s+['"].*?['"]\s*;?/g, '')
      .replace(/React\.useState/g, 'useState')
      .replace(/React\.useEffect/g, 'useEffect')
      .replace(/React\.useMemo/g, 'useMemo')
      .replace(/React\.useCallback/g, 'useCallback')
      .replace(/React\.useRef/g, 'useRef')
      .replace(/React\.Fragment/g, 'Fragment')
    
    // Auto-wrap raw JSX in a function component
    const trimmedCode = cleanedCode.trim()
    if (trimmedCode.startsWith('<') || trimmedCode.startsWith('{/*')) {
      cleanedCode = `function GeneratedSection() {\n  return (\n${trimmedCode}\n  )\n}`
    }

    // Detect component names from the code
    const componentRegex = /(?:function|const|let|var)\s+([A-Z][a-zA-Z0-9]*)(?:\s*[=:(]|\s*:)/g
    const matches = [...codeToRender.matchAll(componentRegex)]
    const componentNames = matches.map(m => m[1])
    
    const potentialComponents = [...new Set([
      ...componentNames,
      'GeneratedSection',
      'Component',
      'HeroSection',
      'Hero',
      'FeaturesSection',
      'Features',
      'AboutSection',
      'About',
      'ContactSection',
      'Contact',
      'CTASection',
      'CTA',
      'Footer',
      'Header',
      'Nav',
      'Navbar',
      'Section',
      'Page',
      'App',
      'Main'
    ])]

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
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
  
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/framer-motion@11/dist/framer-motion.js"></script>
  <script src="https://unpkg.com/lucide-react@0.294.0/dist/umd/lucide-react.js"></script>
  
  <script>
    window.motion = window.Motion?.motion || { div: 'div', span: 'span', button: 'button', a: 'a', p: 'p', h1: 'h1', h2: 'h2', h3: 'h3', section: 'section', nav: 'nav', ul: 'ul', li: 'li', img: 'img', form: 'form', input: 'input' };
    window.AnimatePresence = window.Motion?.AnimatePresence || function(p) { return p.children; };
    window.useInView = window.Motion?.useInView || function() { return true; };
    window.useScroll = window.Motion?.useScroll || function() { return { scrollY: 0, scrollYProgress: 0 }; };
    window.useTransform = window.Motion?.useTransform || function(v) { return v; };
    window.useMotionValue = window.Motion?.useMotionValue || function(v) { return { get: () => v, set: () => {} }; };
    window.useSpring = window.Motion?.useSpring || function(v) { return v; };
    window.useAnimation = window.Motion?.useAnimation || function() { return { start: () => {}, stop: () => {} }; };
    
    window.LucideIcons = window.lucideReact || {};
    if (!window.LucideIcons || Object.keys(window.LucideIcons).length === 0) {
      window.LucideIcons = new Proxy({}, { get: () => () => null });
    }

    window.onerror = function(msg, url, line) {
      window.parent.postMessage({ type: 'preview-error', message: msg, line: line }, '*');
    };
  </script>
  
  <script type="text/babel" data-presets="react,typescript">
    ${hooksDestructure}
    
    const motion = window.motion;
    const AnimatePresence = window.AnimatePresence;
    const useInView = window.useInView;
    const useScroll = window.useScroll;
    const useTransform = window.useTransform;
    const useMotionValue = window.useMotionValue;
    const useSpring = window.useSpring;
    const useAnimation = window.useAnimation;
    
    const { Menu, X, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, ArrowRight, ArrowLeft, Check, CheckCircle, CheckCircle2, Star, Heart, Mail, Phone, MapPin, Github, Twitter, Linkedin, Instagram, Facebook, Youtube, ExternalLink, Search, User, Users, Settings, Home, Plus, Minus, Edit, Trash, Copy, Download, Upload, Share, Send, Bell, Calendar, Clock, Globe, Lock, Unlock, Eye, EyeOff, Filter, Grid, List, MoreHorizontal, MoreVertical, RefreshCw, RotateCcw, Save, Zap, Award, Target, TrendingUp, BarChart, PieChart, Activity, Layers, Box, Package, Cpu, Database, Server, Cloud, Code, Terminal, FileText, Folder, Image, Video, Music, Headphones, Mic, Camera, Bookmark, Tag, AlertCircle, Info, HelpCircle, Loader, Link, MessageCircle, Building, Briefcase, Shield } = window.LucideIcons || {};
    
    ${cleanedCode}
    
    try {
      const root = ReactDOM.createRoot(document.getElementById('root'));
      const potentialComponents = ${JSON.stringify(potentialComponents)};
      let ComponentToRender = null;
      
      for (const name of potentialComponents) {
        try {
          const comp = eval(name);
          if (typeof comp === 'function') {
            ComponentToRender = comp;
            break;
          }
        } catch (e) {}
      }
      
      if (ComponentToRender) {
        root.render(<ComponentToRender />);
      } else {
        throw new Error('No valid React component found. Detected: ' + potentialComponents.slice(0, 5).join(', '));
      }
    } catch (err) {
      document.getElementById('root').innerHTML = '<div class="error-display">Render Error: ' + err.message + '</div>';
    }
  </script>
</body>
</html>`
  }, [code, darkMode])

  if (!code) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [-5, 5, -5]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="text-6xl mb-4"
          >
            🐣
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
            srcDoc={srcDoc}
            className="w-full border-0"
            style={{ 
              height: deviceView === 'desktop' ? '100%' : 'calc(100% - 24px)',
            }}
            sandbox="allow-scripts"
            title="Section Preview"
          />
        </motion.div>
      </div>
    </div>
  )
}