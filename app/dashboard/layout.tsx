import { ReactNode } from 'react'
import Link from 'next/link'
import { Activity, Box, Cpu, FlaskConical, Globe, History, LayoutGrid, Palette, Settings, Shield, Target, Users } from 'lucide-react'

import SystemStatus from '@/components/SystemStatus'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Background Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-zinc-800 bg-zinc-950/50 backdrop-blur-xl flex flex-col">
          <div className="p-6 border-b border-zinc-800">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 rounded-sm flex items-center justify-center group-hover:border-emerald-500/50 transition-colors">
                <Box className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="font-mono font-bold text-lg tracking-tighter">DEMIURGE</span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <div className="px-2 py-2 text-xs font-mono text-zinc-500 uppercase tracking-wider">Control Plane</div>
            
            <NavItem href="/dashboard/agency" icon={<LayoutGrid className="w-4 h-4" />} label="Overview" active />
            <NavItem href="/dashboard/projects" icon={<Box className="w-4 h-4" />} label="Projects" />
            <NavItem href="/dashboard/agents" icon={<Users className="w-4 h-4" />} label="Agents" />

            <div className="mt-8 px-2 py-2 text-xs font-mono text-zinc-500 uppercase tracking-wider">Expansion</div>
            <NavItem href="/dashboard/genesis" icon={<FlaskConical className="w-4 h-4" />} label="Genesis Engine" />
            <NavItem href="/dashboard/brand" icon={<Palette className="w-4 h-4" />} label="Brand System" />
            <NavItem href="/dashboard/strategy" icon={<Target className="w-4 h-4" />} label="GTM Strategy" />
            
            <div className="mt-8 px-2 py-2 text-xs font-mono text-zinc-500 uppercase tracking-wider">System</div>
            <NavItem href="/dashboard/chronosphere" icon={<History className="w-4 h-4" />} label="Chronosphere" />
            <NavItem href="/dashboard/health" icon={<Activity className="w-4 h-4" />} label="Health" />
            <NavItem href="/dashboard/security" icon={<Shield className="w-4 h-4" />} label="Security" />
            <NavItem href="/dashboard/network" icon={<Globe className="w-4 h-4" />} label="Network" />
            
            <div className="mt-8 px-2 py-2 text-xs font-mono text-zinc-500 uppercase tracking-wider">Configuration</div>
            <NavItem href="/dashboard/settings" icon={<Settings className="w-4 h-4" />} label="Settings" />
            <NavItem href="/dashboard/api" icon={<Cpu className="w-4 h-4" />} label="API Keys" />
          </nav>

          <div className="p-4 border-t border-zinc-800">
            <div className="flex items-center gap-3 px-2 py-2 rounded-md bg-zinc-900/50 border border-zinc-800">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono text-zinc-400">SYSTEM ONLINE</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative">
          <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <h1 className="font-mono text-sm text-zinc-400">AGENCY_CONTROL_PLANE // <span className="text-emerald-400">ACTIVE</span></h1>
            </div>
            <div className="flex items-center gap-4">
              <SystemStatus />
              <div className="text-xs font-mono text-zinc-500">v2.0.4-SINGULARITY</div>
            </div>
          </header>
          
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

function NavItem({ href, icon, label, active }: { href: string; icon: ReactNode; label: string; active?: boolean }) {
  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
        active 
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
      }`}
    >
      {icon}
      {label}
    </Link>
  )
}
