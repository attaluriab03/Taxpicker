import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
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

    const clickedAt = new Date().toISOString()

    await supabase.from('affiliate_clicks').insert({
      tool_id: toolId,
      clicked_at: clickedAt,
      user_agent: userAgent,
      referrer: referrer,
      ip: ip,
      gdpr_consent: true,
    })

    revalidatePath('/admin')
    revalidatePath('/admin/clicks')

    // Broadcast the new click to the admin realtime counter.
    // Uses the Supabase REST broadcast API (fire-and-forget, non-blocking).
    // This bypasses RLS — broadcast channels are not subject to row-level policies,
    // so the anon client on the admin dashboard can receive these events.
    broadcastClick(toolId, clickedAt).catch(() => {})

    return NextResponse.json({ ok: true, tracked: true })
  } catch (err: any) {
    // Fail silently — tracking should never break user experience
    console.error('Track click error:', err)
    return NextResponse.json({ ok: true, tracked: false })
  }
}

async function broadcastClick(toolId: string, clickedAt: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SECRET_KEY
  if (!supabaseUrl || !serviceKey) return

  await fetch(`${supabaseUrl}/realtime/v1/api/broadcast`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({
      messages: [
        {
          topic: 'realtime:affiliate-clicks',
          event: 'new_click',
          payload: { tool_id: toolId, clicked_at: clickedAt },
        },
      ],
    }),
  })
}
