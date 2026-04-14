'use client'

import { useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'
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

interface ToolFiltersProps {
  totalCount: number
}

export default function ToolFilters({ totalCount }: ToolFiltersProps) {
  const router = useRouter()
  const params = useSearchParams()
  const [isPending, startTransition] = useTransition()

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
    <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Filter dropdowns */}
        <div className="flex flex-wrap gap-3 flex-1">
          {/* Region */}
          <Select
            value={region}
            onValueChange={(val) => push({ region: val })}
          >
            <SelectTrigger className="w-[160px] h-9 text-sm">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {REGIONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Pricing */}
          <Select
            value={pricing}
            onValueChange={(val) => push({ pricing: val })}
          >
            <SelectTrigger className="w-[150px] h-9 text-sm">
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pricing</SelectItem>
              {PRICING_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Required Features */}
          <Select
            value={features}
            onValueChange={(val) => push({ features: val })}
          >
            <SelectTrigger className="w-[190px] h-9 text-sm">
              <SelectValue placeholder="Required Features" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Features</SelectItem>
              {FEATURES_OPTIONS.map((f) => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Right side: count + clear */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-sm text-slate-500 whitespace-nowrap">
            Showing <span className="font-semibold text-slate-700">{totalCount}</span> tool{totalCount !== 1 ? 's' : ''}
            {hasFilters ? ' matching your criteria' : ''}
          </span>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              <X className="h-3.5 w-3.5" />
              Clear All
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
