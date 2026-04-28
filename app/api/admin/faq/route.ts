import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServer } from '@/lib/supabase-server'

export async function GET(_req: NextRequest) {
  const supabase = await createSupabaseServer()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('faq_items')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { question, answer, display_order } = body

  if (!question || !answer) {
    return NextResponse.json({ error: 'question and answer are required' }, { status: 400 })
  }

  let order = display_order
  if (order === undefined || order === null) {
    const { data: last } = await supabase
      .from('faq_items')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single()
    order = last ? (last.display_order ?? 0) + 1 : 1
  }

  const { data, error } = await supabase
    .from('faq_items')
    .insert({ question, answer, display_order: order, is_published: true })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/faq')

  return NextResponse.json(data, { status: 201 })
}
