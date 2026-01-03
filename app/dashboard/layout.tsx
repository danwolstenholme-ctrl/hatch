'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
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
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 rounded-sm flex items-center justify-center group-hover:border-emerald-500/50 transition-colors">
                <Box className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="font-mono font-bold text-lg tracking-tighter">DEMIURGE</span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden">
            <div className="px-2 py-2 text-[10px] font-mono text-zinc-500 uppercase tracking-wider truncate">Control Plane</div>
            
            <NavItem href="/dashboard/agency" icon={<LayoutGrid className="w-4 h-4" />} label="Overview" pathname={pathname} />
            <NavItem href="/dashboard/projects" icon={<Terminal className="w-4 h-4" />} label="Terminal" pathname={pathname} />
            {/* <NavItem href="/dashboard/agents" icon={<Users className="w-4 h-4" />} label="Agents" /> */}

            <div className="mt-8 px-2 py-2 text-[10px] font-mono text-zinc-500 uppercase tracking-wider truncate">Expansion</div>
            <NavItem href="/dashboard/genesis" icon={<FlaskConical className="w-4 h-4" />} label="Genesis Engine" pathname={pathname} />
            <NavItem href="/dashboard/brand" icon={<Palette className="w-4 h-4" />} label="Brand System" pathname={pathname} />
            <NavItem href="/dashboard/strategy" icon={<Target className="w-4 h-4" />} label="GTM Strategy" pathname={pathname} />
            
            <div className="mt-8 px-2 py-2 text-[10px] font-mono text-zinc-500 uppercase tracking-wider truncate">System</div>
            <NavItem href="/dashboard/chronosphere" icon={<History className="w-4 h-4" />} label="Chronosphere" pathname={pathname} />
            {/* 
            <NavItem href="/dashboard/health" icon={<Activity className="w-4 h-4" />} label="Health" />
            <NavItem href="/dashboard/security" icon={<Shield className="w-4 h-4" />} label="Security" />
            <NavItem href="/dashboard/network" icon={<Globe className="w-4 h-4" />} label="Network" />
            */}
            
            {/* 
            <div className="mt-8 px-2 py-2 text-xs font-mono text-zinc-500 uppercase tracking-wider">Configuration</div>
            <NavItem href="/dashboard/settings" icon={<Settings className="w-4 h-4" />} label="Settings" />
            <NavItem href="/dashboard/api" icon={<Cpu className="w-4 h-4" />} label="API Keys" />
            */}
          </nav>

          <div className="p-4 border-t border-zinc-800">
            <div className="flex items-center gap-3 px-2 py-2 rounded-md bg-zinc-900/50 border border-zinc-800 group cursor-default" title="The Architect watches.">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono text-zinc-400 group-hover:text-emerald-400 transition-colors">SYSTEM ONLINE</span>
            </div>
            <p className="text-[10px] text-zinc-600 mt-2 px-2 font-mono opacity-0 hover:opacity-100 transition-opacity">// The Architect remembers.</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative min-w-0">
          <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-4 md:px-8 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-4">
              {/* Mobile logo */}
              <Link href="/" className="flex md:hidden items-center gap-2">
                <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 rounded-sm flex items-center justify-center">
                  <Box className="w-5 h-5 text-emerald-500" />
                </div>
              </Link>
              <h1 className="font-mono text-xs md:text-sm text-zinc-400 hidden sm:block">CONTROL_PLANE // <span className="text-emerald-400">ACTIVE</span></h1>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <SystemStatus />
              <div className="text-xs font-mono text-zinc-500 group cursor-default hidden sm:block">
                <span>v2.0.4</span>
                <span className="text-zinc-700 group-hover:text-emerald-500/50 transition-colors">-SINGULARITY</span>
              </div>
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
