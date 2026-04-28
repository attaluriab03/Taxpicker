import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServer } from '@/lib/supabase-server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
  const { page } = await params
  const supabase = await createSupabaseServer()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('site_content')
    .select('*')
    .eq('page', page)
    .order('section')
    .order('key')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
  const { page } = await params
  const supabase = await createSupabaseServer()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { updates } = body

  if (!updates || !Array.isArray(updates)) {
    return NextResponse.json({ error: 'updates array required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('site_content')
    .upsert(
      updates.map((u: { section: string; key: string; value: string; content_type?: string; label?: string }) => ({
        page,
        section: u.section,
        key: u.key,
        value: u.value,
        content_type: u.content_type || 'text',
        label: u.label || u.key,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: 'page,section,key' }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath(`/${page}`)
  revalidatePath(`/admin/content/${page}`)

  return NextResponse.json({ success: true })
}
