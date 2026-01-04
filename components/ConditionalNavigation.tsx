'use client'

import { usePathname } from 'next/navigation'
import Navigation from './Navigation'

export default function ConditionalNavigation() {
  const pathname = usePathname()
  
  // Don't show navigation on builder, canvas, or demo pages
  if (pathname?.startsWith('/builder') || pathname?.startsWith('/canvas') || pathname?.startsWith('/demo')) {
    return null
  }
  
  return <Navigation />
}
