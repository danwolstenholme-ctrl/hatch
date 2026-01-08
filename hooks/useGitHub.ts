import { useState, useEffect, useCallback } from 'react'

// =============================================================================
// useGitHub - Hook for GitHub integration
// =============================================================================

interface GitHubStatus {
  connected: boolean
  username?: string
  expired?: boolean
  loading: boolean
}

interface PushResult {
  success: boolean
  repoUrl?: string
  repoName?: string
  vercelImportUrl?: string
  error?: string
  requiresAuth?: boolean
}

export function useGitHub() {
  const [status, setStatus] = useState<GitHubStatus>({ connected: false, loading: true })
  const [pushing, setPushing] = useState(false)

  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/github/status')
      const data = await response.json()
      setStatus({ ...data, loading: false })
    } catch {
      setStatus({ connected: false, loading: false })
    }
  }, [])

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  const connect = useCallback(() => {
    const returnUrl = window.location.pathname + window.location.search
    window.location.href = `/api/github/auth?returnUrl=${encodeURIComponent(returnUrl)}`
  }, [])

  const disconnect = useCallback(async () => {
    try {
      await fetch('/api/github/disconnect', { method: 'POST' })
      setStatus({ connected: false, loading: false })
    } catch {
      console.error('Failed to disconnect GitHub')
    }
  }, [])

  const push = useCallback(async (
    repoName: string,
    code: string,
    pages?: { name: string; path: string; code: string; sectionId?: string }[],
    options?: { 
      isPrivate?: boolean
      description?: string
      projectConfig?: {
        name?: string
        brand?: {
          primaryColor?: string
          secondaryColor?: string
          font?: string
          headingFont?: string
          mode?: 'dark' | 'light'
        }
        seo?: {
          title?: string
          description?: string
        }
      }
    }
  ): Promise<PushResult> => {
    setPushing(true)
    try {
      const response = await fetch('/api/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoName, code, pages, ...options }),
      })
      const data = await response.json()
      
      if (data.requiresAuth) {
        return { success: false, requiresAuth: true }
      }
      
      if (!response.ok) {
        return { success: false, error: data.error }
      }
      
      return {
        success: true,
        repoUrl: data.repoUrl,
        repoName: data.repoName,
        vercelImportUrl: data.vercelImportUrl,
      }
    } catch (error) {
      return { success: false, error: 'Failed to push to GitHub' }
    } finally {
      setPushing(false)
    }
  }, [])

  return {
    ...status,
    pushing,
    connect,
    disconnect,
    push,
    refresh: checkStatus,
  }
}

// =============================================================================
// useCustomDomain - Hook for custom domain management
// =============================================================================

interface DomainStatus {
  verified: boolean
  exists: boolean
  verification?: { type: string; domain: string; value: string }[]
}

interface AddDomainResult {
  success: boolean
  domain?: string
  verified?: boolean
  dns?: {
    type: string
    name: string
    value: string
    aRecords?: string[]
  }
  error?: string
  requiresUpgrade?: boolean
  requiredTier?: string
}

export function useCustomDomain(projectSlug?: string) {
  const [checking, setChecking] = useState(false)
  const [adding, setAdding] = useState(false)

  const checkDomain = useCallback(async (domain: string): Promise<DomainStatus> => {
    if (!projectSlug) return { verified: false, exists: false }
    
    setChecking(true)
    try {
      const response = await fetch(
        `/api/domain?domain=${encodeURIComponent(domain)}&projectSlug=${encodeURIComponent(projectSlug)}`
      )
      return await response.json()
    } catch {
      return { verified: false, exists: false }
    } finally {
      setChecking(false)
    }
  }, [projectSlug])

  const addDomain = useCallback(async (domain: string): Promise<AddDomainResult> => {
    if (!projectSlug) return { success: false, error: 'No project selected' }
    
    setAdding(true)
    try {
      const response = await fetch('/api/domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, projectSlug, action: 'add' }),
      })
      const data = await response.json()
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error,
          requiresUpgrade: data.requiresUpgrade,
          requiredTier: data.requiredTier,
        }
      }
      
      return {
        success: true,
        domain: data.domain,
        verified: data.verified,
        dns: data.dns,
      }
    } catch {
      return { success: false, error: 'Failed to add domain' }
    } finally {
      setAdding(false)
    }
  }, [projectSlug])

  const removeDomain = useCallback(async (domain: string): Promise<{ success: boolean; error?: string }> => {
    if (!projectSlug) return { success: false, error: 'No project selected' }
    
    try {
      const response = await fetch('/api/domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, projectSlug, action: 'remove' }),
      })
      const data = await response.json()
      
      if (!response.ok) {
        return { success: false, error: data.error }
      }
      
      return { success: true }
    } catch {
      return { success: false, error: 'Failed to remove domain' }
    }
  }, [projectSlug])

  return {
    checking,
    adding,
    checkDomain,
    addDomain,
    removeDomain,
  }
}
