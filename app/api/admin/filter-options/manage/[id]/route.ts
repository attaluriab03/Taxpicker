import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase'
import { createSupabaseServer } from '@/lib/supabase-server'

// Which tools column holds the value for each filter category
const CATEGORY_TO_COLUMN: Record<string, string | null> = {
  region: 'supported_regions',
  required_features: 'features',
  supported_exchanges: 'supported_exchanges',
  supported_wallets: 'supported_wallets',
  tax_report_types: 'tax_report_types',
  trading_volume: 'trading_volume',
  user_type: 'user_type',
  price_range: null, // threshold values — not stored in tool arrays
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabaseAuth = await createSupabaseServer()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('filter_options')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/')
  revalidatePath('/admin/filters')
  return NextResponse.json(data)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabaseAuth = await createSupabaseServer()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = createServiceClient()

  // Fetch the option row so we know its category + value
  const { data: option, error: fetchErr } = await supabase
    .from('filter_options')
    .select('id, category, value')
    .eq('id', id)
    .single()

  if (fetchErr || !option) {
    return NextResponse.json({ error: fetchErr?.message ?? 'Not found' }, { status: 404 })
  }

  const toolsColumn = CATEGORY_TO_COLUMN[option.category]
  let affectedTools = 0

  if (toolsColumn) {
    // Select all tool array columns so TS can infer the type properly
    const { data: affectedRows, error: selectErr } = await supabase
      .from('tools')
      .select('id, supported_regions, features, supported_exchanges, supported_wallets, tax_report_types, trading_volume, user_type')
      .contains(toolsColumn, [option.value])

    if (selectErr) {
      return NextResponse.json({ error: selectErr.message }, { status: 500 })
    }

    if (affectedRows && affectedRows.length > 0) {
      affectedTools = affectedRows.length
      // Remove the value from each tool's array column
      for (const tool of affectedRows) {
        const row = tool as Record<string, unknown>
        const currentArr: string[] = (Array.isArray(row[toolsColumn]) ? row[toolsColumn] : []) as string[]
        const updated = currentArr.filter((v) => v !== option.value)
        const { error: updateErr } = await supabase
          .from('tools')
          .update({ [toolsColumn]: updated, updated_at: new Date().toISOString() })
          .eq('id', tool.id)
        if (updateErr) {
          return NextResponse.json({ error: updateErr.message }, { status: 500 })
        }
      }
    }
  }

  // Hard delete the filter_options row
  const { error: deleteErr } = await supabase
    .from('filter_options')
    .delete()
    .eq('id', id)

  if (deleteErr) {
    return NextResponse.json({ error: deleteErr.message }, { status: 500 })
  }

  revalidatePath('/')
  revalidatePath('/admin/filters')
  return NextResponse.json({ success: true, affected_tools: affectedTools })
}
