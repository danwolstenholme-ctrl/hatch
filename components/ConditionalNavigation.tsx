'use client'

import { usePathname } from 'next/navigation'
import Navigation from './Navigation'

export default function ConditionalNavigation() {
  const pathname = usePathname()
  
  // Don't show navigation on builder, canvas, demo, or contact pages
  if (pathname?.startsWith('/builder') || pathname?.startsWith('/canvas') || pathname?.startsWith('/demo') || pathname === '/contact') {
    return null
  }
  
  return <Navigation />
}
