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

export interface FilterOption {
  value: string
  label: string
  metadata?: { max?: number } | null
}

const PRICING_MODEL_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'free', label: 'Free' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'paid', label: 'Paid' },
]

interface ToolFiltersProps {
  totalCount: number
  initialRegions?: string[]
  initialPricingModel?: string
  initialPriceRange?: string
  initialVolume?: string
  initialUserType?: string
  initialFeatures?: string[]
  regionOptions?: FilterOption[]
  priceRangeOptions?: FilterOption[]
  volumeOptions?: FilterOption[]
  userTypeOptions?: FilterOption[]
  featureOptions?: FilterOption[]
}

function FilterLabel({ label }: { label: string }) {
  return (
    <div className="mb-2">
      <span className="block text-xs font-bold text-slate-500 tracking-wide">{label}</span>
    </div>
  )
}

interface MultiSelectProps {
  selected: string[]
  options: FilterOption[]
  placeholder: string
  onChange: (values: string[]) => void
}

function MultiSelect({ selected, options, placeholder, onChange }: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
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
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])
  }

  const allSelected = options.length > 0 && selected.length === options.length
  const hasSelection = selected.length > 0

  return (
    <div ref={ref} className="relative">
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
          {placeholder}
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
          <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', open && 'rotate-180')} />
        </div>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-56 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          <button
            type="button"
            onClick={() => onChange(allSelected ? [] : options.map((o) => o.value))}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 border-b border-slate-100"
          >
            <span
              className={cn(
                'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors',
                allSelected ? 'border-blue-600' : 'border-slate-300'
              )}
              style={allSelected ? { backgroundColor: BRAND_BLUE } : {}}
            >
              {allSelected && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
            </span>
            <span className="font-medium">Select all</span>
          </button>

          <div className="max-h-60 overflow-y-auto py-1">
            {options.map((opt) => {
              const checked = selected.includes(opt.value)
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggle(opt.value)}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors',
                    checked ? 'bg-blue-50 text-blue-900' : 'text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors',
                      checked ? 'border-blue-600' : 'border-slate-300'
                    )}
                    style={checked ? { backgroundColor: BRAND_BLUE } : {}}
                  >
                    {checked && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                  </span>
                  <span>{opt.label}</span>
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={() => onChange([])}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50 border-t border-slate-100 hover:text-rose-600 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}

export default function ToolFilters({
  totalCount,
  initialRegions = [],
  initialPricingModel = 'all',
  initialPriceRange = 'all',
  initialVolume = 'all',
  initialUserType = 'all',
  initialFeatures = [],
  regionOptions = [],
  priceRangeOptions = [],
  volumeOptions = [],
  userTypeOptions = [],
  featureOptions = [],
}: ToolFiltersProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const [selectedRegions, setRegions] = useState<string[]>(initialRegions)
  const [pricingModel, setPricingModel] = useState(initialPricingModel)
  const [priceRange, setPriceRange] = useState(initialPriceRange)
  const [volume, setVolume] = useState(initialVolume)
  const [userType, setUserType] = useState(initialUserType)
  const [selectedFeatures, setFeatures] = useState<string[]>(initialFeatures)

  const hasFilters =
    selectedRegions.length > 0 ||
    pricingModel !== 'all' ||
    priceRange !== 'all' ||
    selectedFeatures.length > 0 ||
    volume !== 'all' ||
    userType !== 'all'

  function pushParams(overrides: {
    regions?: string[]
    pricing?: string
    priceRange?: string
    features?: string[]
    volume?: string
    userType?: string
  }) {
    if (overrides.regions !== undefined) setRegions(overrides.regions)
    if (overrides.pricing !== undefined) setPricingModel(overrides.pricing)
    if (overrides.priceRange !== undefined) setPriceRange(overrides.priceRange)
    if (overrides.volume !== undefined) setVolume(overrides.volume)
    if (overrides.userType !== undefined) setUserType(overrides.userType)
    if (overrides.features !== undefined) setFeatures(overrides.features)

    const rg = overrides.regions !== undefined ? overrides.regions : selectedRegions
    const pm = overrides.pricing !== undefined ? overrides.pricing : pricingModel
    const pr = overrides.priceRange !== undefined ? overrides.priceRange : priceRange
    const ft = overrides.features !== undefined ? overrides.features : selectedFeatures
    const vol = overrides.volume !== undefined ? overrides.volume : volume
    const ut = overrides.userType !== undefined ? overrides.userType : userType

    const p = new URLSearchParams()
    if (rg.length > 0) p.set('regions', rg.join(','))
    if (pm && pm !== 'all') p.set('pricing', pm)
    if (pr && pr !== 'all') p.set('priceRange', pr)
    if (ft.length > 0) p.set('features', ft.join(','))
    if (vol && vol !== 'all') p.set('volume', vol)
    if (ut && ut !== 'all') p.set('userType', ut)

    startTransition(() => {
      router.push(p.toString() ? `/?${p.toString()}` : '/', { scroll: false })
    })
  }

  const clearAll = () => {
    setRegions([])
    setPricingModel('all')
    setPriceRange('all')
    setVolume('all')
    setUserType('all')
    setFeatures([])
    startTransition(() => router.push('/', { scroll: false }))
  }

  return (
    <div className="pb-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Region */}
        <div>
          <FilterLabel label="Region" />
          <MultiSelect
            selected={selectedRegions}
            options={regionOptions}
            placeholder="Select regions..."
            onChange={(vals) => pushParams({ regions: vals })}
          />
        </div>

        {/* Pricing Model — hardcoded, never from DB */}
        <div>
          <FilterLabel label="Pricing Model" />
          <Select value={pricingModel} onValueChange={(val) => pushParams({ pricing: val })}>
            <SelectTrigger className="h-11 text-sm border-slate-200 w-full">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              {PRICING_MODEL_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range — dynamic from filter_options */}
        <div>
          <FilterLabel label="Price Range" />
          <Select value={priceRange} onValueChange={(val) => pushParams({ priceRange: val })}>
            <SelectTrigger className="h-11 text-sm border-slate-200 w-full">
              <SelectValue placeholder="Any Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Price</SelectItem>
              {priceRangeOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
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
              {volumeOptions.map((o) => (
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
              <SelectValue placeholder="All Users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {userTypeOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Required Features */}
        <div>
          <FilterLabel label="Required Features" />
          <MultiSelect
            selected={selectedFeatures}
            options={featureOptions}
            placeholder="Select features..."
            onChange={(vals) => pushParams({ features: vals })}
          />
        </div>
      </div>

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
