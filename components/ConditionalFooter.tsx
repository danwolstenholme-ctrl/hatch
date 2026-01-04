'use client'

import { usePathname } from 'next/navigation'
import Footer from './Footer'

export default function ConditionalFooter() {
  const pathname = usePathname()
  
  // Don't show footer on builder, canvas, demo, dashboard, or contact pages
  if (pathname?.startsWith('/builder') || pathname?.startsWith('/canvas') || pathname?.startsWith('/demo') || pathname?.startsWith('/dashboard') || pathname === '/contact') {
    return null
  }
  
  return <Footer />
}
