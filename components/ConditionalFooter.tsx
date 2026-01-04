'use client'

import { usePathname } from 'next/navigation'
import Footer from './Footer'

export default function ConditionalFooter() {
  const pathname = usePathname()
  
  // Don't show footer on builder, canvas, demo, or contact pages
  if (pathname?.startsWith('/builder') || pathname?.startsWith('/canvas') || pathname?.startsWith('/demo') || pathname === '/contact') {
    return null
  }
  
  return <Footer />
}
