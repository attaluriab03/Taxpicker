import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

// Service role client bypasses RLS completely — intentional for a public
// write-only route so inserts always succeed regardless of RLS policy state
const getSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tool_id, referrer, gdpr_consent } = body

    if (!tool_id) {
      return NextResponse.json({ error: 'tool_id is required' }, { status: 400 })
    }

    // Extract real IP — x-forwarded-for may contain multiple IPs, take the first
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor
      ? forwardedFor.split(',')[0].trim()
      : request.headers.get('x-real-ip') || 'unknown'

    const userAgent = request.headers.get('user-agent') || 'unknown'
    const clickedAt = new Date().toISOString()

    // Log every incoming request for debugging across devices
    console.log('track-click received:', {
      tool_id,
      ip: ip.slice(0, 15),
      gdpr_consent,
      user_agent: userAgent.slice(0, 80),
    })

    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('affiliate_clicks')
      .insert({
        tool_id,
        clicked_at: clickedAt,
        user_agent: userAgent,
        referrer: referrer || '',
        ip,
        gdpr_consent: gdpr_consent === true,
      })
      .select()
      .single()

    if (error) {
      console.error('affiliate_clicks insert failed:', {
        code: error.code,
        message: error.message,
        details: error.details,
        tool_id,
      })
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 500 }
      )
    }

    console.log('affiliate click recorded:', data?.id)

    revalidatePath('/admin')
    revalidatePath('/admin/clicks')

    // Broadcast the new click to the admin realtime counter.
    // Fire-and-forget — never block the response on this.
    broadcastClick(tool_id, clickedAt).catch(() => {})

    return NextResponse.json({ success: true, id: data?.id })
  } catch (err: any) {
    console.error('track-click route exception:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
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
