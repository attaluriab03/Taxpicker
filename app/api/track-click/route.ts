import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { toolId, gdprConsent } = await req.json()

    if (!toolId) {
      return NextResponse.json({ error: 'toolId is required' }, { status: 400 })
    }

    // Only track if consent was given
    if (!gdprConsent) {
      return NextResponse.json({ ok: true, tracked: false })
    }

    const supabase = createServiceClient()

    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : null
    const userAgent = req.headers.get('user-agent') || null
    const referrer = req.headers.get('referer') || null

    await supabase.from('affiliate_clicks').insert({
      tool_id: toolId,
      clicked_at: new Date().toISOString(),
      user_agent: userAgent,
      referrer: referrer,
      ip: ip,
      gdpr_consent: true,
    })

    return NextResponse.json({ ok: true, tracked: true })
  } catch (err: any) {
    // Fail silently — tracking should never break user experience
    console.error('Track click error:', err)
    return NextResponse.json({ ok: true, tracked: false })
  }
}
