'use client'

import { CONSENT_KEY } from '@/components/layout/CookieBanner'

export async function trackAffiliateClickClient(toolId: string) {
  if (typeof window === 'undefined') return
  const consent = localStorage.getItem(CONSENT_KEY)
  if (consent !== 'true') return

  try {
    await fetch('/api/track-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toolId, gdprConsent: true }),
    })
  } catch {
    // fail silently
  }
}
