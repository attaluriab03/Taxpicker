import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const supabase = createServiceClient()
    const now = new Date().toISOString()

    let update: Record<string, unknown>

    if (body.action === 'publish') {
      update = { published_at: now, updated_at: now }
    } else if (body.action === 'unpublish') {
      update = { published_at: null, updated_at: now }
    } else {
      // Full field update — do not touch published_at unless explicitly in body
      const { action: _action, ...fields } = body
      update = { ...fields, updated_at: now }
    }

    const { data, error } = await supabase
      .from('articles')
      .update(update)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/blog')
    revalidatePath('/blog/[slug]', 'page')
    revalidatePath('/admin/articles')

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServiceClient()

    const { error } = await supabase.from('articles').delete().eq('id', id)
    if (error) throw error

    revalidatePath('/blog')
    revalidatePath('/blog/[slug]', 'page')
    revalidatePath('/admin/articles')

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
