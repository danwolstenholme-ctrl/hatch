'use client'

import { motion } from 'framer-motion'
import { MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function ContactButton() {
  const pathname = usePathname()
  
  // Don't show on the contact page itself
  if (pathname === '/contact') return null

  return (
    <Link href="/contact" aria-label="Contact Support">
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex items-center justify-center gap-2 px-3 py-2 md:px-4 md:py-3 bg-zinc-900 border border-violet-500/30 rounded-full md:rounded-full shadow-[0_0_20px_rgba(139,92,246,0.2)] group hover:border-violet-500/60 transition-colors"
      >
        <div className="relative">
          <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-violet-500" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
        </div>
        <span className="hidden sm:inline text-xs md:text-sm font-medium text-zinc-300 group-hover:text-white transition-colors pr-1">
          Contact Support
        </span>
      </motion.button>
    </Link>
  )
}
