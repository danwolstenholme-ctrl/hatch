'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { UserButton, useUser } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { LogoMark } from '@/components/Logo'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useUser()
  const [isCreating, setIsCreating] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const accountSubscription = user?.publicMetadata?.accountSubscription as { tier?: string } | undefined
  const tier = accountSubscription?.tier || 'free'

  const navItems = [
    { href: '/dashboard', label: 'Overview' },
    { href: '/dashboard/projects', label: 'Projects' },
    { href: '/dashboard/billing', label: 'Billing' },
    { href: '/dashboard/settings', label: 'Settings' },
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
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-12 border-b border-zinc-800/50 bg-zinc-950/95 backdrop-blur-sm">
        <div className="flex items-center justify-between h-full px-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <LogoMark size={16} />
            <span className="text-sm font-medium text-white">HatchIt</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-xs text-zinc-400 hover:text-white transition-colors"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="lg:hidden fixed top-12 left-0 right-0 z-50 bg-zinc-900 border-b border-zinc-800/50"
          >
            <nav className="p-2">
              {navItems.map((item) => {
                const active = isActive(item.href)
                return (
                  <button
                    key={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      active ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {item.label}
                  </button>
                )
              })}
              <div className="border-t border-zinc-800/50 mt-2 pt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleNewProject()
                  }}
                  disabled={isCreating}
                  className="w-full text-left px-3 py-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : '+ New Project'}
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-48 border-r border-zinc-800/50 bg-zinc-950 flex-col fixed h-full">
          <div className="p-4 border-b border-zinc-800/50">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <LogoMark size={18} />
              <span className="text-sm font-medium text-white">HatchIt</span>
            </Link>
          </div>

          <nav className="flex-1 p-2">
            {navItems.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-1.5 text-[13px] transition-colors ${
                    active ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="p-3 border-t border-zinc-800/50 space-y-3">
            <button
              onClick={handleNewProject}
              disabled={isCreating}
              className="w-full px-3 py-1.5 text-[13px] text-left text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : '+ New Project'}
            </button>

            <div className="flex items-center gap-2 px-2">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-6 h-6"
                  }
                }}
              />
              <p className="text-[11px] text-zinc-500 truncate flex-1 capitalize">{tier}</p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-48 pt-12 lg:pt-0">
          <div className="max-w-4xl mx-auto px-4 py-8 lg:px-6 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
