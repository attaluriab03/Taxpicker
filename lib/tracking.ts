'use server'

import { createServiceClient } from './supabase'
import { headers } from 'next/headers'

export async function trackAffiliateClick(
  toolId: string,
  gdprConsent: boolean
) {
  if (!gdprConsent) return

  try {
    const supabase = createServiceClient()
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || null
    const referrer = headersList.get('referer') || null
    const forwardedFor = headersList.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : null

    await supabase.from('affiliate_clicks').insert({
      tool_id: toolId,
      clicked_at: new Date().toISOString(),
      user_agent: userAgent,
      referrer: referrer,
      ip: ip,
      gdpr_consent: gdprConsent,
    })
  } catch (err) {
    // Fail silently — tracking should never break the user experience
    console.error('Failed to track affiliate click:', err)
  }
}
