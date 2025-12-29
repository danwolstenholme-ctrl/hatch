// Builder Types - Shared across builder components

export interface Message {
  role: 'user' | 'assistant'
  content: string
  code?: string
}

export interface Version {
  id: string
  code: string
  timestamp: string
  prompt?: string
}

export interface Page {
  id: string
  name: string
  path: string // URL path like '/', '/about', '/contact'
  versions: Version[]
  currentVersionIndex: number
}

export interface Brand {
  colors: string[] // Hex colors detected/set (primary, secondary, accent)
  font: string // Font family name
}

export interface Asset {
  id: string
  name: string
  type: 'logo' | 'image' | 'icon'
  dataUrl: string
  createdAt: string
}

export interface Project {
  id: string
  name: string
  pages?: Page[] // Multi-page structure
  currentPageId?: string // Currently active page
  // Legacy single-page support
  versions: Version[]
  currentVersionIndex: number
  createdAt: string
  updatedAt: string
  deployedSlug?: string
  customDomain?: string
  code?: string
  codeHistory?: string[]
  assets?: Asset[]
  brand?: Brand
}

export interface DeployedProject {
  slug: string
  name: string
  code?: string
  pages?: { name: string; path: string; code: string }[]
  deployedAt: string
}

export interface ElementInfo {
  tagName: string
  className: string
  textContent: string
  styles: Record<string, string>
}
