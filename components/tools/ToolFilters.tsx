'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Netherlands', 'Spain', 'Sweden',
]

const PRICING_OPTIONS = [
  { value: 'all', label: 'All Pricing' },
  { value: 'free', label: 'Free' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'paid', label: 'Paid' },
]

export default function ToolFilters() {
  const router = useRouter()
  const params = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(params.get('q') || '')
  const [country, setCountry] = useState(params.get('country') || '')
  const [pricing, setPricing] = useState(params.get('pricing') || 'all')

  const applyFilters = (overrides: Record<string, string> = {}) => {
    const p = new URLSearchParams()
    const s = overrides.q !== undefined ? overrides.q : search
    const c = overrides.country !== undefined ? overrides.country : country
    const pr = overrides.pricing !== undefined ? overrides.pricing : pricing

    if (s) p.set('q', s)
    if (c) p.set('country', c)
    if (pr && pr !== 'all') p.set('pricing', pr)

    startTransition(() => {
      router.push(`/?${p.toString()}`, { scroll: false })
    })
  }

  const clearAll = () => {
    setSearch('')
    setCountry('')
    setPricing('all')
    startTransition(() => {
      router.push('/', { scroll: false })
    })
  }

  const hasFilters = search || country || (pricing && pricing !== 'all')

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search tools..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') applyFilters({ q: e.currentTarget.value })
          }}
        />
      </div>

      {/* Country filter */}
      <Select
        value={country || 'all'}
        onValueChange={(val) => {
          const c = val === 'all' ? '' : val
          setCountry(c)
          applyFilters({ country: c })
        }}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Country" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Countries</SelectItem>
          {COUNTRIES.map((c) => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Pricing filter */}
      <Select
        value={pricing || 'all'}
        onValueChange={(val) => {
          setPricing(val)
          applyFilters({ pricing: val })
        }}
      >
        <SelectTrigger className="w-full sm:w-[140px]">
          <SelectValue placeholder="Pricing" />
        </SelectTrigger>
        <SelectContent>
          {PRICING_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="text-slate-500 hover:text-slate-700"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  )
}
