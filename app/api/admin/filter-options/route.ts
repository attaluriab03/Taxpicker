import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category')
  const supabase = createServiceClient()

  let query = supabase
    .from('filter_options')
    .select('id, category, value, label, display_order, is_active')
    .eq('is_active', true)
    .order('display_order')

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data })
}
