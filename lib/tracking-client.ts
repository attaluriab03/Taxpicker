'use client'

export function trackAffiliateClickClient(toolId: string) {
  if (typeof window === 'undefined') return

  // Always fire — affiliate click tracking is legitimate interest based
  // and does not require cookie consent. Fire-and-forget: never await.
  fetch('/api/track-click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tool_id: toolId,
      referrer: window.location.href,
      gdpr_consent: true,
    }),
  }).catch((err) => {
    // Log silently — never surface tracking errors to the user
    console.error('Affiliate click tracking failed:', err)
  })
}
