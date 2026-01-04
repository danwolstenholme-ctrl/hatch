'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Activity, Box, Cpu, FlaskConical, Globe, History, LayoutGrid, Palette, Settings, Shield, Target, Users, Terminal } from 'lucide-react'

import SystemStatus from '@/components/SystemStatus'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Background Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative flex h-screen overflow-hidden">
        {/* Sidebar - hidden on mobile */}
        <aside className="hidden md:flex w-64 border-r border-zinc-800 bg-zinc-950/50 backdrop-blur-xl flex-col shrink-0">
          <div className="p-6 border-b border-zinc-800">
            <Link href="/" className="flex items-center gap-3 group">
              <Image 
                src="/assets/hatchit_definitive.svg" 
                alt="HatchIt" 
                width={32}
                height={32}
                className="w-8 h-8 transition-transform group-hover:scale-105"
              />
              <span className="font-sans font-bold text-lg tracking-tight text-zinc-100">HatchIt</span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden">
            <NavItem href="/dashboard/projects" icon={<Terminal className="w-4 h-4" />} label="Projects" pathname={pathname} />
            <NavItem href="/dashboard/agency" icon={<LayoutGrid className="w-4 h-4" />} label="Overview" pathname={pathname} />
            
            <div className="my-4 h-px bg-zinc-800/50 mx-2" />
            
            <NavItem href="/dashboard/genesis" icon={<FlaskConical className="w-4 h-4" />} label="Genesis Engine" pathname={pathname} />
            <NavItem href="/dashboard/brand" icon={<Palette className="w-4 h-4" />} label="Brand System" pathname={pathname} />
            <NavItem href="/dashboard/strategy" icon={<Target className="w-4 h-4" />} label="Strategy" pathname={pathname} />
            <NavItem href="/dashboard/chronosphere" icon={<History className="w-4 h-4" />} label="History" pathname={pathname} />
          </nav>

          <div className="p-4 border-t border-zinc-800">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-900/30 border border-zinc-800/50">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-zinc-400">System Operational</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative min-w-0 bg-zinc-950">
          <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-4 md:px-8 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-4">
              {/* Mobile logo */}
              <Link href="/" className="flex md:hidden items-center gap-2">
                <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center">
                  <Box className="w-5 h-5 text-zinc-100" />
                </div>
              </Link>
              <h1 className="font-medium text-sm text-zinc-400 hidden sm:block">Dashboard</h1>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <SystemStatus />
            </div>
          </header>
          
          {/* Mobile Nav */}
          <div className="md:hidden flex gap-2 p-3 border-b border-zinc-800 overflow-x-auto">
            <MobileNavItem href="/dashboard/agency" icon={<LayoutGrid className="w-4 h-4" />} label="Overview" pathname={pathname} />
            <MobileNavItem href="/dashboard/projects" icon={<Terminal className="w-4 h-4" />} label="Terminal" pathname={pathname} />
            <MobileNavItem href="/dashboard/genesis" icon={<FlaskConical className="w-4 h-4" />} label="Genesis" pathname={pathname} />
            <MobileNavItem href="/dashboard/brand" icon={<Palette className="w-4 h-4" />} label="Brand" pathname={pathname} />
            <MobileNavItem href="/dashboard/strategy" icon={<Target className="w-4 h-4" />} label="Strategy" pathname={pathname} />
            <MobileNavItem href="/dashboard/chronosphere" icon={<History className="w-4 h-4" />} label="Chrono" pathname={pathname} />
          </div>
          
          <div className="p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

function NavItem({ href, icon, label, pathname }: { href: string; icon: ReactNode; label: string; pathname: string }) {
  const isActive = pathname === href
  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
        isActive 
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
      }`}
    >
      {icon}
      {label}
    </Link>
  )
}

function MobileNavItem({ href, icon, label, pathname }: { href: string; icon: ReactNode; label: string; pathname: string }) {
  const isActive = pathname === href
  return (
    <Link 
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
        isActive
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          : 'text-zinc-400 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800'
      }`}
    >
      {icon}
      {label}
    </Link>
  )
}
