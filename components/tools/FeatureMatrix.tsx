'use client'

import { useRef, useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import type { Tool } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface FeatureMatrixProps {
  tools: Tool[]
  maxInitial?: number
}

const FEATURE_ROWS = [
  'DeFi Transaction Tracking',
  'NFT Tax Reporting',
  'Tax-Loss Harvesting',
  'Portfolio Tracking',
  'Automated Exchange Imports',
  'Multi-year Reporting',
  'Audit Report Generation',
  'CPA Export Formats',
  'Margin Trading Support',
  'Staking / Income Tracking',
  'API Integrations',
  'Mobile App',
  'TurboTax Integration',
]

const REGION_FILTERS = [
  { value: 'US', label: 'USA' },
  { value: 'GB', label: 'UK' },
  { value: 'CA', label: 'Canada' },
  { value: 'EU', label: 'EU' },
  { value: 'AU', label: 'Australia' },
]

// Deterministic avatar colour per tool (matches ToolCard)
const AVATAR_COLORS = [
  { bg: 'bg-blue-100', text: 'text-blue-700' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  { bg: 'bg-violet-100', text: 'text-violet-700' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { bg: 'bg-orange-100', text: 'text-orange-700' },
  { bg: 'bg-rose-100', text: 'text-rose-700' },
  { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  { bg: 'bg-amber-100', text: 'text-amber-700' },
]

function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

function hasFeature(tool: Tool, feature: string): boolean {
  const firstWord = feature.split(' ')[0].toLowerCase()
  return tool.features.some((f) => f.toLowerCase().includes(firstWord))
}

function featureCount(tool: Tool): number {
  return FEATURE_ROWS.filter((f) => hasFeature(tool, f)).length
}

function toolSupportsRegion(tool: Tool, region: string): boolean {
  return tool.supported_countries.some(
    (c) => c.toUpperCase().includes(region) || c.toLowerCase().includes(region.toLowerCase())
  )
}

export default function FeatureMatrix({ tools, maxInitial = 6 }: FeatureMatrixProps) {
  const [expanded, setExpanded] = useState(false)
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showScrollHint, setShowScrollHint] = useState(false)

  const toggleRegion = (region: string) => {
    setSelectedRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    )
  }

  const regionFiltered =
    selectedRegions.length === 0
      ? tools
      : tools.filter((tool) => selectedRegions.some((r) => toolSupportsRegion(tool, r)))

  // Sort by feature count descending when regions are selected
  const sortedFiltered = selectedRegions.length > 0
    ? [...regionFiltered].sort((a, b) => featureCount(b) - featureCount(a))
    : regionFiltered

  const displayedTools = expanded ? sortedFiltered : sortedFiltered.slice(0, maxInitial)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    setShowScrollHint(el.scrollWidth > el.clientWidth)
    const handler = () =>
      setShowScrollHint(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
    el.addEventListener('scroll', handler)
    return () => el.removeEventListener('scroll', handler)
  }, [displayedTools])

  return (
    <div>
      {/* ── Filter by Region ── */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-slate-500 mb-2.5">
          Filter by Region
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {REGION_FILTERS.map((r) => {
            const active = selectedRegions.includes(r.value)
            return (
              <label
                key={r.value}
                className="inline-flex items-center gap-2 cursor-pointer select-none"
              >
                {/* Custom checkbox matching Figma square style */}
                <span
                  onClick={() => toggleRegion(r.value)}
                  className={cn(
                    'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors',
                    active
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-white border-slate-300 hover:border-blue-400'
                  )}
                >
                  {active && <Check className="h-2.5 w-2.5 text-white stroke-[3]" />}
                </span>
                <span
                  onClick={() => toggleRegion(r.value)}
                  className={cn(
                    'text-sm transition-colors',
                    active ? 'text-slate-800 font-medium' : 'text-slate-600'
                  )}
                >
                  {r.label}
                </span>
              </label>
            )
          })}
        </div>
        <p className="text-xs text-slate-400 mt-2.5">
          Showing{' '}
          <span className="font-semibold text-slate-600">{displayedTools.length}</span>{' '}
          tools{selectedRegions.length > 0 ? ' sorted by feature count' : ''}
        </p>
      </div>

      {/* ── Scrollable matrix ── */}
      <div className="relative">
        {showScrollHint && (
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none rounded-r-xl" />
        )}
        <div
          ref={scrollRef}
          className="overflow-x-auto"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {displayedTools.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">
              No tools available for the selected regions.
            </p>
          ) : (
            <table
              className="w-full border-collapse"
              style={{ minWidth: `${220 + displayedTools.length * 150}px` }}
            >
              <thead>
                <tr>
                  {/* Feature label header — sticky */}
                  <th className="sticky left-0 bg-white z-20 text-left py-4 px-5 text-sm font-semibold text-slate-500 border-b border-slate-200 min-w-[220px] w-[220px]">
                    Feature
                  </th>
                  {displayedTools.map((tool) => {
                    const av = avatarColor(tool.name)
                    const count = featureCount(tool)
                    return (
                      <th
                        key={tool.id}
                        className="py-4 px-3 text-center border-b border-slate-200 min-w-[150px]"
                      >
                        <div className="flex flex-col items-center gap-2">
                          {/* Avatar circle */}
                          <div
                            className={cn(
                              'flex h-10 w-10 items-center justify-center rounded-full text-base font-bold',
                              av.bg,
                              av.text
                            )}
                          >
                            {tool.name.charAt(0)}
                          </div>
                          {/* Tool name */}
                          <span className="text-sm font-semibold text-slate-800 leading-tight text-center">
                            {tool.name}
                          </span>
                          {/* Feature count */}
                          <span className="text-xs text-slate-400 font-normal">
                            {count} feature{count !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {FEATURE_ROWS.map((feature, ri) => (
                  <tr
                    key={feature}
                    className={cn(
                      'transition-colors hover:bg-blue-50/30',
                      ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    )}
                  >
                    {/* Feature label — sticky */}
                    <td className="sticky left-0 z-10 py-4 px-5 text-sm font-medium text-slate-700 border-b border-slate-100 bg-inherit">
                      {feature}
                    </td>
                    {displayedTools.map((tool) => {
                      const has = hasFeature(tool, feature)
                      return (
                        <td
                          key={tool.id}
                          className="py-4 px-3 text-center border-b border-slate-100"
                        >
                          <div className="flex justify-center">
                            {has ? (
                              <Check
                                className="h-5 w-5 text-emerald-500"
                                strokeWidth={2.5}
                              />
                            ) : (
                              <X
                                className="h-5 w-5 text-rose-400"
                                strokeWidth={2.5}
                              />
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {sortedFiltered.length > maxInitial && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          {expanded
            ? 'Show fewer tools'
            : `Show all ${sortedFiltered.length} tools`}
        </button>
      )}
    </div>
  )
}
