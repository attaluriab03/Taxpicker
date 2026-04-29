import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { createSupabaseServer } from '@/lib/supabase-server'

// Returns { [value]: count } for all filter option values across all tool array columns
export async function GET() {
  const supabaseAuth = await createSupabaseServer()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()

  const { data: tools, error } = await supabase
    .from('tools')
    .select(
      'supported_regions, features, supported_exchanges, supported_wallets, tax_report_types, trading_volume, user_type'
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const counts: Record<string, number> = {}

  const addArr = (arr: string[] | null) => {
    if (!arr) return
    for (const v of arr) {
      counts[v] = (counts[v] ?? 0) + 1
    }
  }

  for (const tool of tools ?? []) {
    addArr(tool.supported_regions)
    addArr(tool.features)
    addArr(tool.supported_exchanges)
    addArr(tool.supported_wallets)
    addArr(tool.tax_report_types)
    addArr(tool.trading_volume)
    addArr(tool.user_type)
  }

  return NextResponse.json(counts)
}
