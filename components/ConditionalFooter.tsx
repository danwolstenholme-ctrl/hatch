'use client'

import { usePathname } from 'next/navigation'
import Footer from './Footer'

export default function ConditionalFooter() {
  const pathname = usePathname()
  
  // Don't show footer on builder, canvas, or demo pages
  if (pathname?.startsWith('/builder') || pathname?.startsWith('/canvas') || pathname?.startsWith('/demo')) {
    return null
  }
  
  return <Footer />
}
