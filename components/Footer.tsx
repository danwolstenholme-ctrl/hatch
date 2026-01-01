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
              <a href="https://www.reddit.com/r/HatchIt/" target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-900 border border-zinc-800 hover:border-emerald-500/30 hover:bg-zinc-800 rounded-lg transition-all group" aria-label="Reddit">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-zinc-400 group-hover:text-emerald-400 transition-colors"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
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
              <li><Link href="/changelog" className="hover:text-emerald-400 transition-colors">Changelog</Link></li>
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
