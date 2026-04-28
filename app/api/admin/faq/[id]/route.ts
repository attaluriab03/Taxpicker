import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServer } from '@/lib/supabase-server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServer()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { question, answer, display_order, is_published } = body

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (question !== undefined) update.question = question
  if (answer !== undefined) update.answer = answer
  if (display_order !== undefined) update.display_order = display_order
  if (is_published !== undefined) update.is_published = is_published

  const { data, error } = await supabase
    .from('faq_items')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  revalidatePath('/faq')

  return NextResponse.json(data)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServer()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: existing } = await supabase
    .from('faq_items')
    .select('id')
    .eq('id', id)
    .single()

  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error } = await supabase.from('faq_items').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/faq')

  return NextResponse.json({ ok: true })
}
