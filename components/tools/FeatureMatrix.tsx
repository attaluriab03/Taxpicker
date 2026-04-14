'use client'

import { useRef, useEffect, useState } from 'react'
import { Check, X, Minus } from 'lucide-react'
import type { Tool } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface FeatureMatrixProps {
  tools: Tool[]
  maxInitial?: number
}

// Canonical feature list — tools will be checked against their features array
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

function hasFeature(tool: Tool, feature: string): boolean {
  const feat = feature.toLowerCase()
  return tool.features.some((f) => f.toLowerCase().includes(feat.split(' ')[0]))
}

export default function FeatureMatrix({ tools, maxInitial = 6 }: FeatureMatrixProps) {
  const [expanded, setExpanded] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showScrollHint, setShowScrollHint] = useState(false)

  const displayedTools = expanded ? tools : tools.slice(0, maxInitial)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    setShowScrollHint(el.scrollWidth > el.clientWidth)
    const handler = () => setShowScrollHint(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
    el.addEventListener('scroll', handler)
    return () => el.removeEventListener('scroll', handler)
  }, [displayedTools])

  return (
    <div>
      <div className="relative">
        {showScrollHint && (
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none rounded-r-xl" />
        )}
        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <table className="w-full border-collapse text-sm" style={{ minWidth: `${220 + displayedTools.length * 120}px` }}>
            <thead>
              <tr>
                {/* Sticky label column */}
                <th className="sticky left-0 bg-white z-20 text-left py-3 px-4 font-semibold text-slate-500 border-b border-slate-200 min-w-[180px]">
                  Feature
                </th>
                {displayedTools.map((tool) => (
                  <th
                    key={tool.id}
                    className="py-3 px-4 text-center font-semibold text-slate-700 border-b border-slate-200 min-w-[120px]"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs leading-tight">{tool.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURE_ROWS.map((feature, ri) => (
                <tr
                  key={feature}
                  className={cn(
                    'group transition-colors hover:bg-slate-50',
                    ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  )}
                >
                  <td className="sticky left-0 z-10 py-3 px-4 text-slate-700 font-medium border-b border-slate-100 bg-inherit">
                    {feature}
                  </td>
                  {displayedTools.map((tool) => {
                    const has = hasFeature(tool, feature)
                    return (
                      <td key={tool.id} className="py-3 px-4 text-center border-b border-slate-100">
                        {has ? (
                          <div className="flex justify-center">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                              <Check className="h-3 w-3 text-green-600" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100">
                              <X className="h-3 w-3 text-slate-400" />
                            </div>
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {tools.length > maxInitial && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
        >
          {expanded ? 'Show fewer tools' : `Show all ${tools.length} tools`}
        </button>
      )}
    </div>
  )
}
