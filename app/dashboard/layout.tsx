'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Terminal } from 'lucide-react'
import { motion } from 'framer-motion'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Ambient void background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative">
        {/* Minimal Top Bar */}
        <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute -inset-2 bg-emerald-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Image 
                  src="/assets/hatchit_definitive.svg" 
                  alt="HatchIt" 
                  width={28}
                  height={28}
                  className="relative w-7 h-7"
                />
              </div>
              <span className="font-bold text-base tracking-tight">HatchIt</span>
            </Link>

            {/* Nav */}
            <nav className="flex items-center gap-1">
              <NavLink href="/dashboard/projects" isActive={pathname.startsWith('/dashboard/projects')}>
                <Terminal className="w-4 h-4" />
                <span>Projects</span>
              </NavLink>
            </nav>
          </div>
        </header>

        {/* Content */}
        <main className="relative">
          {children}
        </main>
      </div>
    </div>
  )
}

function NavLink({ href, isActive, children }: { href: string; isActive: boolean; children: ReactNode }) {
  return (
    <Link 
      href={href}
      className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        isActive 
          ? 'text-emerald-400' 
          : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </Link>
  )
}
