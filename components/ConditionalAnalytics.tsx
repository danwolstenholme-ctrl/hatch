'use client'

import { Analytics } from '@vercel/analytics/next'
import { GoogleAnalytics } from '@next/third-parties/google'
import { useSyncExternalStore } from 'react'

type AnalyticsEligibilityState =
  | { status: 'unknown' }
  | { status: 'allowed' }
  | { status: 'blocked' }

let eligibilityState: AnalyticsEligibilityState = { status: 'unknown' }
const eligibilityListeners = new Set<() => void>()
let eligibilityCheckStarted = false

function emitEligibilityChange() {
  for (const listener of eligibilityListeners) listener()
}

function startEligibilityCheckIfNeeded() {
  if (eligibilityCheckStarted) return
  eligibilityCheckStarted = true

  // Default to blocked in development.
  if (process.env.NODE_ENV === 'development') {
    eligibilityState = { status: 'blocked' }
    emitEligibilityChange()
    return
  }

  // Manual override.
  if (typeof document !== 'undefined' && document.cookie.includes('skipAnalytics=true')) {
    eligibilityState = { status: 'blocked' }
    emitEligibilityChange()
    return
  }

  // Async eligibility check.
  fetch('/api/check-ip')
    .then(res => res.json())
    .then((data: { ip?: string }) => {
      const blockedIPs = [
        '31.153.32.99',
        '2a00:1358:e2d7:4000:dc08:631b:f1f7:6978',
      ]

      if (data.ip && blockedIPs.includes(data.ip)) {
        eligibilityState = { status: 'blocked' }
      } else {
        eligibilityState = { status: 'allowed' }
      }
      emitEligibilityChange()
    })
    .catch(() => {
      // If IP check fails, default to allowed.
      eligibilityState = { status: 'allowed' }
      emitEligibilityChange()
    })
}

function subscribe(listener: () => void) {
  eligibilityListeners.add(listener)
  startEligibilityCheckIfNeeded()
  return () => {
    eligibilityListeners.delete(listener)
  }
}

function getSnapshot() {
  return eligibilityState
}

// Cached server snapshot to avoid infinite loop
const serverSnapshot: AnalyticsEligibilityState = { status: 'blocked' }

function getServerSnapshot(): AnalyticsEligibilityState {
  return serverSnapshot
}

export default function ConditionalAnalytics() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  if (state.status !== 'allowed') {
    return null
  }

  return (
    <>
      <Analytics />
      {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
    </>
  )
}