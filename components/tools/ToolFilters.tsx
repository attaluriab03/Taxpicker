'use client'

import { useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const REGIONS = [
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'EU', label: 'European Union' },
]

const PRICING_OPTIONS = [
  { value: 'free', label: 'Free' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'paid', label: 'Paid' },
]

const FEATURES_OPTIONS = [
  { value: 'DeFi', label: 'DeFi Support' },
  { value: 'NFT', label: 'NFT Tracking' },
  { value: 'Tax-Loss', label: 'Tax-Loss Harvesting' },
  { value: 'Portfolio', label: 'Portfolio Tracking' },
  { value: 'API', label: 'API Integrations' },
  { value: 'TurboTax', label: 'TurboTax Integration' },
  { value: 'CPA', label: 'CPA Export' },
  { value: 'Mobile', label: 'Mobile App' },
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
}

function FilterLabel({ label }: { label: string }) {
  return (
    <span className="block text-xs font-semibold text-slate-500 mb-2 tracking-wide">
      {label}
    </span>
  )
}

export default function ToolFilters({ totalCount }: ToolFiltersProps) {
  const router = useRouter()
  const params = useSearchParams()
  const [, startTransition] = useTransition()

  const region = params.get('region') || 'all'
  const pricing = params.get('pricing') || 'all'
  const features = params.get('features') || 'all'

  const hasFilters = region !== 'all' || pricing !== 'all' || features !== 'all'

  const push = (overrides: Record<string, string>) => {
    const p = new URLSearchParams()
    const r = overrides.region !== undefined ? overrides.region : region
    const pr = overrides.pricing !== undefined ? overrides.pricing : pricing
    const ft = overrides.features !== undefined ? overrides.features : features

    if (r && r !== 'all') p.set('region', r)
    if (pr && pr !== 'all') p.set('pricing', pr)
    if (ft && ft !== 'all') p.set('features', ft)

    startTransition(() => {
      router.push(p.toString() ? `/?${p.toString()}` : '/', { scroll: false })
    })
  }

  const clearAll = () => {
    startTransition(() => router.push('/', { scroll: false }))
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 px-6 pt-5 pb-4 shadow-sm">
      {/* Filter dropdowns row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
        {/* Region */}
        <div>
          <FilterLabel label="Region" />
          <Select value={region} onValueChange={(val) => push({ region: val })}>
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

        {/* Trading Volume (display only) */}
        <div>
          <FilterLabel label="Trading Volume" />
          <Select defaultValue="all">
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
          <Select value={pricing} onValueChange={(val) => push({ pricing: val })}>
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

        {/* User Type (display only) */}
        <div>
          <FilterLabel label="User Type" />
          <Select defaultValue="both">
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

        {/* Required Features */}
        <div>
          <FilterLabel label="Required Features" />
          <Select value={features} onValueChange={(val) => push({ features: val })}>
            <SelectTrigger className="h-11 text-sm border-slate-200 w-full">
              <SelectValue placeholder="Select features..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Select features...</SelectItem>
              {FEATURES_OPTIONS.map((f) => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bottom row: count + clear */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <span className="text-sm text-slate-500">
          Showing{' '}
          <span className="font-semibold text-blue-600">{totalCount}</span>{' '}
          tools matching your criteria
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
