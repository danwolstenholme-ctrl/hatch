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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const accountSubscription = user?.publicMetadata?.accountSubscription as { tier?: string } | undefined
  const tier = accountSubscription?.tier || 'free'

  const navItems = [
    { href: '/dashboard', label: 'Overview' },
    { href: '/dashboard/projects', label: 'Projects' },
    { href: '/dashboard/replicator', label: 'Replicator' },
    { href: '/dashboard/billing', label: 'Billing' },
    { href: '/dashboard/settings', label: 'Settings' },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const handleNewProject = () => {
    router.push('/dashboard/projects/new')
  }

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false)
    router.push(href)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Mobile Header - Proper height and touch targets */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 border-b border-zinc-800/50 bg-zinc-950/95 backdrop-blur-xl">
        <div className="flex items-center justify-between h-full px-4">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <LogoMark size={20} />
            <span className="text-base font-semibold text-white">HatchIt</span>
          </Link>
          <div className="flex items-center gap-3">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 ring-1 ring-zinc-700"
                }
              }}
            />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all active:scale-95"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Full screen overlay with large touch targets */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Menu panel */}
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className="lg:hidden fixed top-0 right-0 bottom-0 z-50 w-[280px] bg-zinc-900 border-l border-zinc-800/50 shadow-2xl"
            >
              {/* Menu header */}
              <div className="flex items-center justify-between h-14 px-4 border-b border-zinc-800/50">
                <span className="text-sm font-medium text-zinc-400 capitalize">{tier} Plan</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
              
              {/* Nav items */}
              <nav className="p-3">
                {navItems.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <button
                      key={item.href}
                      onClick={() => handleNavClick(item.href)}
                      className={`w-full text-left px-4 py-3.5 text-base rounded-lg mb-1 transition-all active:scale-[0.98] ${
                        active 
                          ? 'text-white bg-zinc-800/80' 
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                      }`}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </nav>
              
              {/* CTA */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800/50 bg-zinc-900">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleNewProject()
                  }}
                  className="w-full py-3.5 text-base font-medium rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black transition-all active:scale-[0.98]"
                >
                  + New Project
                </button>
              </div>
            </motion.div>
          </>
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
              className="w-full px-3 py-1.5 text-[13px] text-left text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              + New Project
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
        <main className="flex-1 lg:ml-48 pt-14 lg:pt-0">
          <div className="max-w-4xl mx-auto px-4 py-6 lg:px-6 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
