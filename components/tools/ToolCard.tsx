'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, Check, ExternalLink } from 'lucide-react'
import type { Tool } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { trackAffiliateClickClient } from '@/lib/tracking-client'

interface ToolCardProps {
  tool: Tool
  rank?: number
}

function pricingBadge(tool: Tool): string {
  if (tool.pricing_type === 'free') return 'Free'
  if (tool.pricing_type === 'freemium') return 'Free+'
  if (tool.price_from && tool.price_from > 0) return `$${tool.price_from}/yr`
  return 'Paid'
}

export default function ToolCard({ tool, rank }: ToolCardProps) {
  const handleAffiliate = () => {
    trackAffiliateClickClient(tool.id)
  }

  const badge = pricingBadge(tool)
  const bestFor = tool.best_for?.slice(0, 3) ?? []

  return (
    <div
      className={cn(
        'group relative bg-white rounded-xl border transition-shadow hover:shadow-md',
        tool.is_recommended ? 'border-blue-200 shadow-sm' : 'border-slate-200'
      )}
    >
      {/* Mobile layout */}
      <div className="flex flex-col gap-4 p-5 lg:hidden">
        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 overflow-hidden">
            {tool.logo_url ? (
              <Image
                src={tool.logo_url}
                alt={`${tool.name} logo`}
                width={40}
                height={40}
                className="object-contain"
              />
            ) : (
              <span className="text-base font-bold text-slate-600">
                {tool.name.charAt(0)}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
              <Link
                href={`/tools/${tool.slug}`}
                className="font-semibold text-slate-900 hover:text-blue-600 transition-colors text-sm"
              >
                {tool.name}
              </Link>
              {tool.is_recommended && (
                <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-medium text-blue-700">
                  Recommended
                </span>
              )}
            </div>
            {tool.description && (
              <p className="text-xs text-slate-500 line-clamp-2">{tool.description}</p>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-4 text-sm">
          {tool.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-slate-900">{tool.rating.toFixed(1)}</span>
              {tool.review_count && (
                <span className="text-slate-400 text-xs">({tool.review_count.toLocaleString()})</span>
              )}
            </div>
          )}
          <span className="inline-flex items-center rounded-md bg-blue-50 border border-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
            {badge}
          </span>
        </div>

        {/* Best for */}
        {bestFor.length > 0 && (
          <ul className="flex flex-col gap-1">
            {bestFor.map((item) => (
              <li key={item} className="flex items-start gap-1.5 text-xs text-slate-600">
                <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <a
            href={tool.affiliate_url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            onClick={handleAffiliate}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 transition-colors"
          >
            Visit Website
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <Link
            href={`/tools/${tool.slug}`}
            className="flex-1 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>

      {/* Desktop table-row layout — matches Figma columns */}
      <div className="hidden lg:grid grid-cols-[1fr_120px_120px_180px_180px] gap-4 items-center px-5 py-4">
        {/* Platform column */}
        <div className="flex items-start gap-3 min-w-0">
          {rank && (
            <span className="flex-shrink-0 w-5 text-xs font-medium text-slate-400 pt-1">{rank}</span>
          )}
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 overflow-hidden">
            {tool.logo_url ? (
              <Image
                src={tool.logo_url}
                alt={`${tool.name} logo`}
                width={40}
                height={40}
                className="object-contain"
              />
            ) : (
              <span className="text-base font-bold text-slate-600">
                {tool.name.charAt(0)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
              <Link
                href={`/tools/${tool.slug}`}
                className="font-semibold text-slate-900 hover:text-blue-600 transition-colors text-sm"
              >
                {tool.name}
              </Link>
              {tool.is_recommended && (
                <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-medium text-blue-700">
                  Recommended
                </span>
              )}
            </div>
            {tool.description && (
              <p className="text-xs text-slate-500 line-clamp-2 max-w-xs">{tool.description}</p>
            )}
            {/* Country tags */}
            {tool.supported_countries.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {tool.supported_countries.slice(0, 3).map((c) => (
                  <span key={c} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                    {c}
                  </span>
                ))}
                {tool.supported_countries.length > 3 && (
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                    +{tool.supported_countries.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Rating column */}
        <div className="flex flex-col items-center gap-0.5">
          {tool.rating ? (
            <>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-slate-900">{tool.rating.toFixed(1)}</span>
              </div>
              {tool.review_count && (
                <span className="text-xs text-slate-400">({tool.review_count.toLocaleString()} reviews)</span>
              )}
            </>
          ) : (
            <span className="text-xs text-slate-400">N/A</span>
          )}
        </div>

        {/* Starting Price column */}
        <div className="flex items-center justify-center">
          <span className="inline-flex items-center rounded-md bg-blue-50 border border-blue-100 px-2.5 py-1 text-sm font-semibold text-blue-700">
            {badge}
          </span>
        </div>

        {/* Best For column */}
        <div>
          {bestFor.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {bestFor.map((item) => (
                <li key={item} className="flex items-start gap-1.5 text-xs text-slate-600">
                  <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-xs text-slate-400">—</span>
          )}
        </div>

        {/* Actions column */}
        <div className="flex flex-col gap-2 items-end">
          <a
            href={tool.affiliate_url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            onClick={handleAffiliate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 transition-colors whitespace-nowrap"
          >
            Visit Website
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <Link
            href={`/tools/${tool.slug}`}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2 transition-colors whitespace-nowrap"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}
