'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="relative">
        {/* Minimal Top Bar */}
        <header className="border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image 
                src="/assets/hatchit_definitive.svg" 
                alt="HatchIt" 
                width={24}
                height={24}
                className="w-6 h-6"
              />
            </Link>

            <nav className="flex items-center gap-1">
              <Link 
                href="/dashboard/studio"
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  pathname.startsWith('/dashboard/studio') 
                    ? 'text-white bg-white/[0.06]' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Studio
              </Link>
              <Link 
                href="/dashboard/billing"
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  pathname.startsWith('/dashboard/billing') 
                    ? 'text-white bg-white/[0.06]' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Billing
              </Link>
              <Link 
                href="/builder"
                className="px-3 py-1.5 rounded-md text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Builder
              </Link>
            </nav>
          </div>
        </header>

        <main className="relative">
          {children}
        </main>
      </div>
    </div>
  )
}
