'use client'

import { useTransition, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, ChevronDown, Check } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const BRAND_BLUE = '#2563EB'

const REGIONS = [
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'EU', label: 'European Union' },
  { value: 'AU', label: 'Australia' },
]

const PRICING_OPTIONS = [
  { value: 'freemium', label: 'Freemium (Free + Paid)' },
  { value: 'paid', label: 'Paid Only' },
  { value: 'free', label: 'Free' },
]

// Values must exactly match the strings stored in the `features` JSONB column
const FEATURES_OPTIONS = [
  { value: 'DeFi Transaction Tracking', label: 'DeFi Support' },
  { value: 'NFT Tax Reporting', label: 'NFT Tracking' },
  { value: 'Tax-Loss Harvesting', label: 'Tax-Loss Harvesting' },
  { value: 'Portfolio Tracking', label: 'Portfolio Tracking' },
  { value: 'Automated Exchange Imports', label: 'Exchange Imports' },
  { value: 'API Integrations', label: 'API Integrations' },
  { value: 'TurboTax Integration', label: 'TurboTax Integration' },
  { value: 'CPA Export Formats', label: 'CPA Export' },
  { value: 'Mobile App', label: 'Mobile App' },
  { value: 'Audit Report Generation', label: 'Audit Reports' },
  { value: 'Staking / Income Tracking', label: 'Staking / Income' },
]

const VOLUME_OPTIONS = [
  { value: 'low', label: 'Low (< 100 trades)' },
  { value: 'medium', label: 'Medium (100–1k)' },
  { value: 'high', label: 'High (1k–10k)' },
  { value: 'unlimited', label: 'Unlimited' },
]

const USER_TYPE_OPTIONS = [
  { value: 'individual', label: 'Individual' },
  { value: 'business', label: 'Business' },
]

interface ToolFiltersProps {
  totalCount: number
  initialRegion?: string
  initialPricing?: string
  initialVolume?: string
  initialUserType?: string
  initialFeatures?: string[]
}

function FilterLabel({ label }: { label: string }) {
  return (
    <div className="mb-2">
      <span className="block text-xs font-bold text-slate-500 tracking-wide">
        {label}
      </span>
    </div>
  )
}

// ─── Multi-select dropdown for features ────────────────────────────────────
interface MultiSelectProps {
  selected: string[]
  onChange: (values: string[]) => void
}

function FeaturesMultiSelect({ selected, onChange }: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on click outside or Escape
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const selectAll = () => onChange(FEATURES_OPTIONS.map((f) => f.value))
  const clearAll = () => onChange([])

  const allSelected = selected.length === FEATURES_OPTIONS.length
  const hasSelection = selected.length > 0

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex h-11 w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm transition-colors',
          hasSelection
            ? 'border-blue-500 ring-1 ring-blue-500/30'
            : 'border-slate-200 hover:border-slate-300'
        )}
      >
        <span className={cn('truncate', hasSelection ? 'text-slate-900' : 'text-slate-400')}>
          {hasSelection ? 'Select features...' : 'Select features...'}
        </span>
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          {hasSelection && (
            <span
              className="inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white leading-none"
              style={{ backgroundColor: BRAND_BLUE, minWidth: '18px' }}
            >
              {selected.length}
            </span>
          )}
          <ChevronDown
            className={cn(
              'h-4 w-4 text-slate-400 transition-transform',
              open && 'rotate-180'
            )}
          />
        </div>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-64 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          {/* Select all */}
          <button
            type="button"
            onClick={selectAll}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 border-b border-slate-100"
          >
            <span
              className={cn(
                'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors',
                allSelected
                  ? 'border-blue-600 text-white'
                  : 'border-slate-300'
              )}
              style={allSelected ? { backgroundColor: BRAND_BLUE } : {}}
            >
              {allSelected && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
            </span>
            <span className="font-medium">Select all</span>
          </button>

          {/* Feature options */}
          <div className="max-h-60 overflow-y-auto py-1">
            {FEATURES_OPTIONS.map((opt) => {
              const checked = selected.includes(opt.value)
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggle(opt.value)}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors',
                    checked
                      ? 'bg-blue-50 text-blue-900'
                      : 'text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors',
                      checked ? 'border-blue-600' : 'border-slate-300'
                    )}
                    style={checked ? { backgroundColor: BRAND_BLUE } : {}}
                  >
                    {checked && (
                      <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                    )}
                  </span>
                  <span>{opt.label}</span>
                </button>
              )
            })}
          </div>

          {/* Clear all */}
          <button
            type="button"
            onClick={clearAll}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50 border-t border-slate-100 hover:text-rose-600 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main filter component ──────────────────────────────────────────────────
export default function ToolFilters({
  totalCount,
  initialRegion = 'all',
  initialPricing = 'all',
  initialVolume = 'all',
  initialUserType = 'both',
  initialFeatures = [],
}: ToolFiltersProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  // Local state provides immediate UI feedback while the server re-renders in the background.
  // Props are the authoritative server values; local state tracks optimistic updates.
  const [region, setRegion] = useState(initialRegion)
  const [pricing, setPricing] = useState(initialPricing)
  const [volume, setVolume] = useState(initialVolume)
  const [userType, setUserType] = useState(initialUserType)
  const [selectedFeatures, setFeatures] = useState<string[]>(initialFeatures)

  const hasFilters =
    region !== 'all' || pricing !== 'all' || selectedFeatures.length > 0 ||
    volume !== 'all' || userType !== 'both'

  function pushParams(overrides: {
    region?: string
    pricing?: string
    features?: string[]
    volume?: string
    userType?: string
  }) {
    // Update local state immediately so UI reflects the change without waiting for navigation
    if (overrides.region !== undefined) setRegion(overrides.region)
    if (overrides.pricing !== undefined) setPricing(overrides.pricing)
    if (overrides.volume !== undefined) setVolume(overrides.volume)
    if (overrides.userType !== undefined) setUserType(overrides.userType)
    if (overrides.features !== undefined) setFeatures(overrides.features)

    const p = new URLSearchParams()

    const r = overrides.region !== undefined ? overrides.region : region
    const pr = overrides.pricing !== undefined ? overrides.pricing : pricing
    const ft = overrides.features !== undefined ? overrides.features : selectedFeatures
    const vol = overrides.volume !== undefined ? overrides.volume : volume
    const ut = overrides.userType !== undefined ? overrides.userType : userType

    if (r && r !== 'all') p.set('region', r)
    if (pr && pr !== 'all') p.set('pricing', pr)
    if (ft.length > 0) p.set('features', ft.join(','))
    if (vol && vol !== 'all') p.set('volume', vol)
    if (ut && ut !== 'both') p.set('userType', ut)

    startTransition(() => {
      router.push(p.toString() ? `/?${p.toString()}` : '/', { scroll: false })
    })
  }

  const clearAll = () => {
    setRegion('all')
    setPricing('all')
    setVolume('all')
    setUserType('both')
    setFeatures([])
    startTransition(() => router.push('/', { scroll: false }))
  }

  return (
    <div className="pb-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
        {/* Region */}
        <div>
          <FilterLabel label="Region" />
          <Select value={region} onValueChange={(val) => pushParams({ region: val })}>
            <SelectTrigger className="h-11 text-sm border-slate-200 w-full">
              <SelectValue placeholder="Select regions..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Select regions...</SelectItem>
              {REGIONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Trading Volume */}
        <div>
          <FilterLabel label="Trading Volume" />
          <Select value={volume} onValueChange={(val) => pushParams({ volume: val })}>
            <SelectTrigger className="h-11 text-sm border-slate-200 w-full">
              <SelectValue placeholder="All Volumes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Volumes</SelectItem>
              {VOLUME_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div>
          <FilterLabel label="Price Range" />
          <Select value={pricing} onValueChange={(val) => pushParams({ pricing: val })}>
            <SelectTrigger className="h-11 text-sm border-slate-200 w-full">
              <SelectValue placeholder="All Prices" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              {PRICING_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* User Type */}
        <div>
          <FilterLabel label="User Type" />
          <Select value={userType} onValueChange={(val) => pushParams({ userType: val })}>
            <SelectTrigger className="h-11 text-sm border-slate-200 w-full">
              <SelectValue placeholder="Both" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="both">Both</SelectItem>
              {USER_TYPE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Required Features — multi-select */}
        <div>
          <FilterLabel label="Required Features" />
          <FeaturesMultiSelect
            selected={selectedFeatures}
            onChange={(vals) => pushParams({ features: vals })}
          />
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <span className="text-sm text-slate-500">
          Showing{' '}
          <span className="font-semibold text-blue-600">{totalCount}</span>{' '}
          tools{hasFilters ? ' matching your criteria' : ''}
        </span>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 font-medium"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Clear All
          </button>
        )}
      </div>
    </div>
  )
}
