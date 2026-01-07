'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { motion } from 'framer-motion'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 selection:bg-emerald-500/30">
      {/* Ambient Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none z-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPC9zdmc+')] opacity-20 mix-blend-overlay" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/" className="block hover:opacity-80 transition-opacity">
              <Image 
                src="/icon.svg" 
                alt="Logo" 
                width={28}
                height={28}
                className="w-7 h-7 sm:w-8 sm:h-8"
              />
            </Link>
            
            <nav className="flex items-center gap-0.5 sm:gap-1 bg-white/5 p-0.5 sm:p-1 rounded-lg border border-white/10">
              <Link 
                href="/dashboard"
                className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  pathname === '/dashboard' 
                    ? 'text-white bg-white/10 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                href="/dashboard/billing"
                className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  pathname === '/dashboard/billing' 
                    ? 'text-white bg-white/10 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Billing
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 ring-2 ring-white/10 hover:ring-white/20 transition-all"
                  }
                }}
              />
          </div>
        </div>

        <main className="relative">
          {children}
        </main>
      </div>
    </div>
  )
}
