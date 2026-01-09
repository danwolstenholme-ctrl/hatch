'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { UserButton, useUser } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Sparkles,
  Activity,
  CreditCard,
  Settings,
  Rocket,
  Menu,
  X
} from 'lucide-react'
import { LogoMark } from '@/components/Logo'
import Button from '@/components/singularity/Button'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useUser()
  const [isCreating, setIsCreating] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const accountSubscription = user?.publicMetadata?.accountSubscription as { tier?: string } | undefined
  const tier = accountSubscription?.tier || 'free'

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/features', label: 'Features', icon: Sparkles },
    { href: '/dashboard/builds', label: 'Builds', icon: Activity },
    { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const handleNewProject = async () => {
    setIsCreating(true)
    try {
      const res = await fetch('/api/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Untitled Project', templateId: 'website' }),
      })
      const data = await res.json()
      if (res.ok && data.project) {
        router.push(`/builder?project=${data.project.id}`)
      } else if (res.status === 403) {
        router.push('/dashboard/billing')
      }
    } catch (e) {
      console.error('Failed to create project', e)
    } finally {
      setIsCreating(false)
    }
  }

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false)
    router.push(href)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-zinc-500/20">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur-xl">
        <div className="flex items-center justify-between h-full px-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <LogoMark size={18} />
            <span className="text-sm font-semibold text-white">HatchIt</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -mr-2 text-zinc-400 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed inset-y-0 right-0 w-72 z-50 bg-zinc-900 border-l border-zinc-800 shadow-2xl"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-800/60">
                  <span className="text-sm font-semibold text-white">Menu</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 -mr-2 text-zinc-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Nav */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                  {navItems.map((item) => {
                    const active = isActive(item.href)
                    return (
                      <button
                        key={item.href}
                        onClick={() => handleNavClick(item.href)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                          active
                            ? 'text-white bg-zinc-800/80'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                        }`}
                      >
                        <item.icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-zinc-500'}`} />
                        {item.label}
                      </button>
                    )
                  })}
                </nav>

                {/* Mobile Menu Footer */}
                <div className="p-4 border-t border-zinc-800/60 space-y-3">
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    loading={isCreating}
                    icon={<Rocket className="w-4 h-4" />}
                    iconPosition="left"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleNewProject()
                    }}
                    disabled={isCreating}
                  >
                    {isCreating ? 'Creating' : 'New Project'}
                  </Button>

                  <div className="flex items-center gap-3 px-2 py-1.5">
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "w-8 h-8 ring-1 ring-zinc-700"
                        }
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-400 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                      <p className="text-[10px] text-zinc-500 capitalize">{tier} plan</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-56 border-r border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl flex-col fixed h-full">
          <div className="p-4 border-b border-zinc-800/60">
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <LogoMark size={20} />
              <span className="text-sm font-semibold text-white">HatchIt</span>
            </Link>
          </div>

          <nav className="flex-1 p-3 space-y-0.5">
            {navItems.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-all ${
                    active
                      ? 'text-white bg-zinc-800/80'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-zinc-500'}`} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="p-3 border-t border-zinc-800/60 space-y-3">
            <Button
              variant="primary"
              size="sm"
              fullWidth
              loading={isCreating}
              icon={<Rocket className="w-4 h-4" />}
              iconPosition="left"
              onClick={handleNewProject}
              disabled={isCreating}
            >
              {isCreating ? 'Creating' : 'New Project'}
            </Button>

            <div className="flex items-center gap-3 px-2 py-1.5">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-7 h-7 ring-1 ring-zinc-700"
                  }
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-zinc-400 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                <p className="text-[10px] text-zinc-500 capitalize">{tier} plan</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-56 pt-14 lg:pt-0">
          <div className="max-w-5xl mx-auto px-4 py-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
