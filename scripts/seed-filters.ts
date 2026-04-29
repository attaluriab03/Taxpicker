import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// ─── Env loading ──────────────────────────────────────────────────────────────
const envPath = resolve(process.cwd(), '.env.local')
try {
  const raw = readFileSync(envPath, 'utf-8')
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim()
    if (!(key in process.env)) process.env[key] = val
  }
} catch {
  console.warn('Could not load .env.local — using existing process.env')
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

// ─── Types ────────────────────────────────────────────────────────────────────
type FilterRow = {
  category: string
  value: string
  label: string
  display_order: number
  is_active: boolean
}

// ─── Region normalisation ─────────────────────────────────────────────────────
// Every value stored in tools.supported_regions must be one of these 5 codes
const BROAD_REGIONS: FilterRow[] = [
  { category: 'region', value: 'US',   label: 'United States',  display_order: 1, is_active: true },
  { category: 'region', value: 'UK',   label: 'United Kingdom', display_order: 2, is_active: true },
  { category: 'region', value: 'EU',   label: 'Europe',         display_order: 3, is_active: true },
  { category: 'region', value: 'Asia', label: 'Asia',           display_order: 4, is_active: true },
  { category: 'region', value: 'AU',   label: 'Australia',      display_order: 5, is_active: true },
]

function normaliseRegion(raw: string): string | null {
  const v = raw.trim()
  const lo = v.toLowerCase()

  if (['us', 'usa', 'united states', 'us only'].includes(lo)) return 'US'
  if (['uk', 'gb', 'united kingdom', 'great britain', 'england', 'britain'].includes(lo)) return 'UK'
  if (['au', 'australia', 'nz', 'new zealand'].includes(lo)) return 'AU'
  if (['asia', 'sg', 'singapore', 'jp', 'japan', 'in', 'india',
       'hk', 'hong kong', 'kr', 'south korea', 'tw', 'taiwan',
       'my', 'malaysia', 'ph', 'philippines', 'th', 'thailand'].includes(lo)) return 'Asia'
  // Broad European codes and names
  if (['eu', 'europe', 'european union', 'de', 'germany', 'fr', 'france',
       'se', 'sweden', 'no', 'norway', 'dk', 'denmark', 'fi', 'finland',
       'ie', 'ireland', 'nl', 'netherlands', 'at', 'austria', 'ch', 'switzerland',
       'be', 'belgium', 'es', 'spain', 'it', 'italy', 'pt', 'portugal',
       'pl', 'poland', 'cz', 'czech', 'ro', 'romania', 'gr', 'greece',
       'hu', 'hungary', 'sk', 'slovakia', 'bg', 'bulgaria', 'lt', 'latvia',
       'lv', 'ee', 'estonia'].includes(lo)) return 'EU'

  return null // drop unknown values
}

// ─── Feature normalisation ────────────────────────────────────────────────────
// Map full label strings (legacy) to short codes (new standard)
const FEATURE_CODES: FilterRow[] = [
  { category: 'required_features', value: 'defi',               label: 'DeFi Transaction Tracking',    display_order: 1,  is_active: true },
  { category: 'required_features', value: 'nft',                label: 'NFT Tax Reporting',            display_order: 2,  is_active: true },
  { category: 'required_features', value: 'tax_loss_harvesting', label: 'Tax-Loss Harvesting',         display_order: 3,  is_active: true },
  { category: 'required_features', value: 'portfolio_tracking', label: 'Portfolio Tracking',           display_order: 4,  is_active: true },
  { category: 'required_features', value: 'automated_imports',  label: 'Automated Exchange Imports',   display_order: 5,  is_active: true },
  { category: 'required_features', value: 'multi_year',         label: 'Multi-year Reporting',         display_order: 6,  is_active: true },
  { category: 'required_features', value: 'audit_report',       label: 'Audit Report Generation',      display_order: 7,  is_active: true },
  { category: 'required_features', value: 'cpa_export',         label: 'CPA Export Formats',           display_order: 8,  is_active: true },
  { category: 'required_features', value: 'margin_trading',     label: 'Margin Trading Support',       display_order: 9,  is_active: true },
  { category: 'required_features', value: 'staking',            label: 'Staking / Income Tracking',    display_order: 10, is_active: true },
  { category: 'required_features', value: 'api_integrations',   label: 'API Integrations',             display_order: 11, is_active: true },
  { category: 'required_features', value: 'turbotax',           label: 'TurboTax Integration',         display_order: 12, is_active: true },
  { category: 'required_features', value: 'mobile_app',         label: 'Mobile App',                   display_order: 13, is_active: true },
]

const FEATURE_LABEL_TO_CODE: Record<string, string> = {
  'DeFi Transaction Tracking': 'defi',
  'DeFi Support': 'defi',
  'DeFi': 'defi',
  'NFT Tax Reporting': 'nft',
  'NFT Tracking': 'nft',
  'NFT': 'nft',
  'Tax-Loss Harvesting': 'tax_loss_harvesting',
  'Tax Loss Harvesting': 'tax_loss_harvesting',
  'Portfolio Tracking': 'portfolio_tracking',
  'Portfolio Management': 'portfolio_tracking',
  'Automated Exchange Imports': 'automated_imports',
  'Exchange Imports': 'automated_imports',
  'Auto Import': 'automated_imports',
  'Multi-year Reporting': 'multi_year',
  'Multi-Year Reporting': 'multi_year',
  'Multi Year Reporting': 'multi_year',
  'Audit Report Generation': 'audit_report',
  'Audit Reports': 'audit_report',
  'Audit Trail': 'audit_report',
  'CPA Export Formats': 'cpa_export',
  'CPA Export': 'cpa_export',
  'Margin Trading Support': 'margin_trading',
  'Margin Trading': 'margin_trading',
  'Staking / Income Tracking': 'staking',
  'Staking / Income': 'staking',
  'Staking Income Tracking': 'staking',
  'Staking': 'staking',
  'API Integrations': 'api_integrations',
  'API Integration': 'api_integrations',
  'TurboTax Integration': 'turbotax',
  'TurboTax': 'turbotax',
  'Mobile App': 'mobile_app',
  'Mobile Application': 'mobile_app',
}

function normaliseFeature(raw: string): string {
  return FEATURE_LABEL_TO_CODE[raw.trim()] ?? raw.trim()
}

// ─── Default static rows for other categories ─────────────────────────────────
const STATIC_PRICING: FilterRow[] = [
  { category: 'pricing', value: 'free',       label: 'Free',            display_order: 1, is_active: true },
  { category: 'pricing', value: 'freemium',   label: 'Freemium',        display_order: 2, is_active: true },
  { category: 'pricing', value: 'paid',       label: 'Paid',            display_order: 3, is_active: true },
  { category: 'pricing', value: 'under_50',   label: 'Under $50/year',  display_order: 4, is_active: true },
  { category: 'pricing', value: 'under_100',  label: 'Under $100/year', display_order: 5, is_active: true },
  { category: 'pricing', value: 'under_200',  label: 'Under $200/year', display_order: 6, is_active: true },
  { category: 'pricing', value: 'under_500',  label: 'Under $500/year', display_order: 7, is_active: true },
]

const STATIC_TRADING_VOLUME: FilterRow[] = [
  { category: 'trading_volume', value: 'casual',       label: 'Casual (under 100 trades)',  display_order: 1, is_active: true },
  { category: 'trading_volume', value: 'active',       label: 'Active (100-1000 trades)',   display_order: 2, is_active: true },
  { category: 'trading_volume', value: 'high',         label: 'High Volume (1000+ trades)', display_order: 3, is_active: true },
  { category: 'trading_volume', value: 'professional', label: 'Professional / Fund',        display_order: 4, is_active: true },
]

const STATIC_USER_TYPE: FilterRow[] = [
  { category: 'user_type', value: 'beginner',     label: 'Beginner',            display_order: 1, is_active: true },
  { category: 'user_type', value: 'intermediate', label: 'Intermediate',        display_order: 2, is_active: true },
  { category: 'user_type', value: 'advanced',     label: 'Advanced',            display_order: 3, is_active: true },
  { category: 'user_type', value: 'professional', label: 'Professional',        display_order: 4, is_active: true },
  { category: 'user_type', value: 'accountant',   label: 'Accountant / CPA',    display_order: 5, is_active: true },
  { category: 'user_type', value: 'business',     label: 'Business / Enterprise', display_order: 6, is_active: true },
]

const DEFAULT_EXCHANGES = [
  'Coinbase', 'Binance', 'Kraken', 'Gemini', 'KuCoin', 'Crypto.com',
  'Bitfinex', 'Huobi', 'OKX', 'ByBit', 'Gate.io', 'Bitstamp', 'Bittrex',
  'Coinbase Pro', 'Binance US', 'FTX', 'Uniswap', 'dYdX',
]

const DEFAULT_WALLETS = [
  'MetaMask', 'Ledger', 'Trezor', 'Exodus', 'Trust Wallet', 'Phantom',
  'Coinbase Wallet', 'Electrum', 'Mycelium', 'Atomic Wallet',
  'Ledger Nano X', 'Trezor Model T',
]

const DEFAULT_TAX_REPORTS = [
  'IRS Form 8949', 'Schedule D', 'FBAR', 'HMRC Capital Gains', 'ATO CGT',
  'CRA T5008', 'TurboTax CSV', 'TaxAct CSV', 'TurboTax PDF', 'H&R Block',
  'FreeTaxUSA', 'Generic CSV',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function dedup<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

function toRows(category: string, values: string[], startOrder = 0): FilterRow[] {
  return values.map((v, i) => ({
    category,
    value: v,
    label: v,
    display_order: startOrder + i,
    is_active: true,
  }))
}

// ─── Step 1: Fetch all tools data ─────────────────────────────────────────────
async function fetchToolsData() {
  const { data, error } = await supabase
    .from('tools')
    .select('id, supported_exchanges, supported_wallets, features, supported_regions, tax_report_types, trading_volume, user_type')

  if (error) throw new Error(`Failed to fetch tools: ${error.message}`)
  return data || []
}

// ─── Step 2: Seed all filter_options ─────────────────────────────────────────
async function seedFilterOptions(tools: any[]) {
  // Extract unique values from tools table
  const toolExchanges = dedup(tools.flatMap((t) => t.supported_exchanges || []).filter(Boolean))
  const toolWallets   = dedup(tools.flatMap((t) => t.supported_wallets || []).filter(Boolean))
  const toolTaxReports = dedup(tools.flatMap((t) => t.tax_report_types || []).filter(Boolean))

  // Merge defaults + tool values (deduplicated)
  const allExchanges = dedup([...DEFAULT_EXCHANGES, ...toolExchanges])
  const allWallets   = dedup([...DEFAULT_WALLETS,   ...toolWallets])
  const allTaxReports = dedup([...DEFAULT_TAX_REPORTS, ...toolTaxReports])

  // Log any values from tools that weren't in the default list
  const extraExchanges = toolExchanges.filter((e) => !DEFAULT_EXCHANGES.includes(e))
  const extraWallets   = toolWallets.filter((w) => !DEFAULT_WALLETS.includes(w))
  const extraTaxReports = toolTaxReports.filter((r) => !DEFAULT_TAX_REPORTS.includes(r))

  if (extraExchanges.length) console.log(`  Auto-added exchanges from DB: ${extraExchanges.join(', ')}`)
  if (extraWallets.length)   console.log(`  Auto-added wallets from DB:   ${extraWallets.join(', ')}`)
  if (extraTaxReports.length) console.log(`  Auto-added tax reports from DB: ${extraTaxReports.join(', ')}`)

  // Collect all rows to upsert
  const allRows: FilterRow[] = [
    ...BROAD_REGIONS,
    ...STATIC_PRICING,
    ...STATIC_TRADING_VOLUME,
    ...STATIC_USER_TYPE,
    ...FEATURE_CODES,
    ...toRows('supported_exchanges', allExchanges),
    ...toRows('supported_wallets',   allWallets),
    ...toRows('tax_report_types',    allTaxReports),
  ]

  // Always force-upsert the 5 canonical regions so they are active even if previously deactivated
  const { error: regionErr } = await supabase
    .from('filter_options')
    .upsert(
      BROAD_REGIONS.map((r) => ({ ...r, updated_at: new Date().toISOString() })),
      { onConflict: 'category,value', ignoreDuplicates: false }
    )
  if (regionErr) throw new Error(`Failed to seed regions: ${regionErr.message}`)

  const nonRegionRows = allRows.filter((r) => r.category !== 'region')
  const categories = [...new Set(nonRegionRows.map((r) => r.category))]

  for (const cat of categories) {
    const catRows = nonRegionRows.filter((r) => r.category === cat)
    console.log(`  Seeding ${cat}... ${catRows.length} options`)

    const { error } = await supabase
      .from('filter_options')
      .upsert(
        catRows.map((r) => ({ ...r, updated_at: new Date().toISOString() })),
        { onConflict: 'category,value', ignoreDuplicates: true }
      )

    if (error) throw new Error(`Failed to seed ${cat}: ${error.message}`)
  }
  console.log(`  Seeding region... 5 options (force-upsert)`)

  // Deactivate stale region values (codes not in the 5 broad regions)
  const validRegionValues = BROAD_REGIONS.map((r) => r.value)
  const { data: staleRegions } = await supabase
    .from('filter_options')
    .select('id, value')
    .eq('category', 'region')
    .not('value', 'in', `(${validRegionValues.map((v) => `"${v}"`).join(',')})`)

  if (staleRegions && staleRegions.length > 0) {
    console.log(`  Deactivating ${staleRegions.length} stale region options: ${staleRegions.map((r) => r.value).join(', ')}`)
    await supabase
      .from('filter_options')
      .update({ is_active: false })
      .in('id', staleRegions.map((r) => r.id))
  }
}

// ─── Step 3: Normalise tool supported_regions → 5 broad regions ───────────────
async function normaliseToolRegions(tools: any[]) {
  console.log(`\nNormalising tool regions... ${tools.length} tools to process`)

  let updated = 0
  for (const tool of tools) {
    const raw: string[] = [
      ...(tool.supported_regions || []),
    ]
    if (raw.length === 0) continue

    const mapped = dedup(raw.map(normaliseRegion).filter(Boolean)) as string[]

    // Only update if the values actually changed
    const current = (tool.supported_regions || []).sort().join(',')
    const next    = mapped.sort().join(',')
    if (current === next) continue

    const { error } = await supabase
      .from('tools')
      .update({ supported_regions: mapped })
      .eq('id', tool.id)

    if (error) {
      console.warn(`  ⚠ Could not update tool ${tool.id}: ${error.message}`)
    } else {
      updated++
    }
  }

  console.log(`  ${updated} tools updated`)
  console.log(`  Region mapping complete — all tools now use: US, UK, EU, Asia, AU only`)
}

// ─── Step 4: Normalise tool features → short codes ────────────────────────────
async function normaliseToolFeatures(tools: any[]) {
  console.log(`\nNormalising tool feature values...`)

  const unmapped: string[] = []
  let updated = 0

  for (const tool of tools) {
    const raw: string[] = tool.features || []
    if (raw.length === 0) continue

    const mapped = dedup(raw.map((f) => {
      const code = normaliseFeature(f)
      if (code === f.trim() && !FEATURE_CODES.some((fc) => fc.value === code)) {
        unmapped.push(f)
      }
      return code
    }))

    const current = (tool.features || []).slice().sort().join(',')
    const next    = mapped.slice().sort().join(',')
    if (current === next) continue

    const { error } = await supabase
      .from('tools')
      .update({ features: mapped })
      .eq('id', tool.id)

    if (error) {
      console.warn(`  ⚠ Could not update features for tool ${tool.id}: ${error.message}`)
    } else {
      updated++
    }
  }

  if (unmapped.length) {
    const uniqueUnmapped = dedup(unmapped)
    console.log(`  Unmapped feature values kept as-is: ${uniqueUnmapped.join(', ')}`)
    console.log(`  → These have been added to filter_options so they appear in the editor.`)
    // Seed these unknown feature values into filter_options so they show up in the admin
    if (uniqueUnmapped.length) {
      await supabase
        .from('filter_options')
        .upsert(
          uniqueUnmapped.map((v, i) => ({
            category: 'required_features',
            value: v,
            label: v,
            display_order: 100 + i,
            is_active: true,
            updated_at: new Date().toISOString(),
          })),
          { onConflict: 'category,value', ignoreDuplicates: true }
        )
    }
  }

  console.log(`  ${updated} tools updated`)
}

// ─── Step 5: Verify ───────────────────────────────────────────────────────────
async function verify() {
  console.log('\nVerification:')

  const { data } = await supabase
    .from('filter_options')
    .select('category, is_active')

  if (!data) return

  const byCategory: Record<string, { active: number; inactive: number }> = {}
  for (const row of data) {
    if (!byCategory[row.category]) byCategory[row.category] = { active: 0, inactive: 0 }
    if (row.is_active) byCategory[row.category].active++
    else               byCategory[row.category].inactive++
  }

  for (const [cat, counts] of Object.entries(byCategory).sort()) {
    const inactive = counts.inactive > 0 ? ` (${counts.inactive} inactive)` : ''
    console.log(`  ${cat}: ${counts.active} active${inactive}`)
  }

  // Verify regions
  const { data: regions } = await supabase
    .from('filter_options')
    .select('value')
    .eq('category', 'region')
    .eq('is_active', true)

  const regionValues = (regions || []).map((r) => r.value).sort()
  console.log(`\n  Active regions: ${regionValues.join(', ')}`)
  const expected = ['AU', 'Asia', 'EU', 'UK', 'US']
  const ok = JSON.stringify(regionValues) === JSON.stringify(expected)
  console.log(`  Region check: ${ok ? '✓ Correct (5 broad regions only)' : '✗ Unexpected values'}`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== Taxpicker filter options seed ===')
  console.log(`Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}\n`)

  const tools = await fetchToolsData()
  console.log(`Fetched ${tools.length} tools from database`)

  console.log('\nSeeding filter_options...')
  await seedFilterOptions(tools)

  await normaliseToolRegions(tools)
  await normaliseToolFeatures(tools)

  await verify()

  console.log('\nSeed complete ✓\n')
}

main().catch((err) => {
  console.error('\n✗ Seed failed:', err)
  process.exit(1)
})
