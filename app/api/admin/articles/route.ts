import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = createServiceClient()
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('articles')
      .insert({
        ...body,
        // New articles are always drafts — published_at must be set explicitly via publish action
        published_at: body.published_at ?? null,
        updated_at: now,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/blog')
    revalidatePath('/admin/articles')

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
