import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase'
import { createSupabaseServer } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const supabaseAuth = await createSupabaseServer()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const category = req.nextUrl.searchParams.get('category')
  const supabase = createServiceClient()

  let query = supabase
    .from('filter_options')
    .select('id, category, value, label, display_order, is_active, metadata')
    .order('display_order')

  if (category) query = query.eq('category', category)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const supabaseAuth = await createSupabaseServer()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { category, value, label, display_order, metadata } = body

  if (!category || !value || !label) {
    return NextResponse.json({ error: 'category, value, and label are required' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('filter_options')
    .insert({
      category,
      value,
      label,
      display_order: display_order ?? 0,
      metadata: metadata ?? null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'An option with this value already exists in this category' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  revalidatePath('/')
  return NextResponse.json(data, { status: 201 })
}
