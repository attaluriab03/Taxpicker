import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServer } from '@/lib/supabase-server'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; reviewId: string }> }
) {
  const { id, reviewId } = await params
  const supabase = await createSupabaseServer()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .eq('tool_id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/tools/[slug]', 'page')

  return NextResponse.json({ ok: true })
}
