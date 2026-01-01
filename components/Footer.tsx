'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import HatchLogo from './HatchLogo'

export default function Footer() {
  const pathname = usePathname()
  
  // Don't show footer in builder
  if (pathname?.startsWith('/builder')) return null

  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 pt-16 pb-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent blur-sm" />
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <HatchLogo className="w-8 h-8 group-hover:rotate-12 transition-transform duration-300" />
            </Link>
            <p className="text-sm text-zinc-500 leading-relaxed mb-6">
              Build real websites with AI. <span className="text-white">The Architect</span> creates production-ready code you own.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://x.com/HatchItD" target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-900 border border-zinc-800 hover:border-emerald-500/30 hover:bg-zinc-800 rounded-lg transition-all group" aria-label="Twitter">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-zinc-400 group-hover:text-emerald-400 transition-colors"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://www.linkedin.com/company/hatchit-dev/" target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-900 border border-zinc-800 hover:border-emerald-500/30 hover:bg-zinc-800 rounded-lg transition-all group" aria-label="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-zinc-400 group-hover:text-emerald-400 transition-colors"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-6 font-mono">Product</h4>
            <ul className="space-y-3 text-sm text-zinc-500">
              <li><Link href="/builder" className="hover:text-emerald-400 transition-colors">Builder</Link></li>
              <li><Link href="/features" className="hover:text-emerald-400 transition-colors">Features</Link></li>
              <li><Link href="/how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</Link></li>
              <li><Link href="/roadmap" className="hover:text-emerald-400 transition-colors">Roadmap</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-6 font-mono">Company</h4>
            <ul className="space-y-3 text-sm text-zinc-500">
              <li><Link href="/about" className="hover:text-emerald-400 transition-colors">About</Link></li>
              <li><Link href="/vision" className="hover:text-emerald-400 transition-colors">Vision</Link></li>
              <li><Link href="/faq" className="hover:text-emerald-400 transition-colors">FAQ</Link></li>
              <li><a href="mailto:hello@hatchit.dev" className="hover:text-emerald-400 transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-6 font-mono">Legal</h4>
            <ul className="space-y-3 text-sm text-zinc-500">
              <li><Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-600 font-mono">© {new Date().getFullYear()} HatchIt. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs text-zinc-600 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500/50 animate-pulse"></span>
            <span>System Operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
