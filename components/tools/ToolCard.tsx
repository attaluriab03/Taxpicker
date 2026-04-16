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
  if (tool.pricing_type === 'freemium') return 'Free'
  if (tool.price_from && tool.price_from > 0) return `$${tool.price_from}/yr`
  return 'Paid'
}

// Shorten country names to short labels for tags
function shortCountry(name: string): string {
  const map: Record<string, string> = {
    'United States': 'USA',
    'US': 'USA',
    'United Kingdom': 'UK',
    'GB': 'UK',
    'Canada': 'Canada',
    'CA': 'Canada',
    'Australia': 'Australia',
    'AU': 'Australia',
    'Germany': 'Germany',
    'DE': 'Germany',
    'France': 'France',
    'FR': 'France',
    'European Union': 'EU',
    'EU': 'EU',
    'Sweden': 'Sweden',
    'SE': 'Sweden',
    'Norway': 'Norway',
    'NO': 'Norway',
    'Denmark': 'Denmark',
    'DK': 'Denmark',
    'Finland': 'Finland',
    'FI': 'Finland',
    'Netherlands': 'Netherlands',
    'NL': 'Netherlands',
    'Switzerland': 'Switzerland',
    'CH': 'Switzerland',
    'Singapore': 'Singapore',
    'SG': 'Singapore',
    'New Zealand': 'NZ',
    'NZ': 'NZ',
  }
  return map[name] ?? name
}

// Deterministic avatar color from tool name
function avatarColor(name: string): { bg: string; text: string } {
  const colors = [
    { bg: 'bg-blue-100', text: 'text-blue-700' },
    { bg: 'bg-indigo-100', text: 'text-indigo-700' },
    { bg: 'bg-violet-100', text: 'text-violet-700' },
    { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    { bg: 'bg-orange-100', text: 'text-orange-700' },
    { bg: 'bg-rose-100', text: 'text-rose-700' },
    { bg: 'bg-cyan-100', text: 'text-cyan-700' },
    { bg: 'bg-amber-100', text: 'text-amber-700' },
  ]
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

export default function ToolCard({ tool, rank }: ToolCardProps) {
  const handleAffiliate = () => {
    trackAffiliateClickClient(tool.id)
  }

  const badge = pricingBadge(tool)
  const bestFor = tool.best_for?.slice(0, 2) ?? []
  const avatar = avatarColor(tool.name)

  // Abbreviated country tags
  const countryTags = tool.supported_countries
    .slice(0, 3)
    .map(shortCountry)
  const extraCountries = tool.supported_countries.length - 3

  return (
    <div
      className={cn(
        'group relative bg-white rounded-xl border transition-shadow hover:shadow-md',
        tool.is_recommended ? 'border-blue-200 shadow-sm' : 'border-slate-200'
      )}
    >
      {/* ── Mobile layout ── */}
      <div className="flex flex-col gap-4 p-5 lg:hidden">
        <div className="flex items-start gap-3">
          {/* Logo */}
          <div className={cn(
            'flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl overflow-hidden',
            tool.logo_url ? 'bg-slate-100' : avatar.bg
          )}>
            {tool.logo_url ? (
              <Image src={tool.logo_url} alt={`${tool.name} logo`} width={44} height={44} className="object-contain" />
            ) : (
              <span className={cn('text-lg font-bold', avatar.text)}>
                {tool.name.charAt(0)}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <Link href={`/tools/${tool.slug}`} prefetch={true} className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                {tool.name}
              </Link>
              {tool.is_recommended && (
                <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-medium text-blue-600">
                  Recommended
                </span>
              )}
            </div>
            {tool.description && (
              <p className="text-xs text-slate-500 line-clamp-2">{tool.description}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          {tool.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-900">{tool.rating.toFixed(1)}</span>
              {tool.review_count && (
                <span className="text-slate-400 text-xs">{tool.review_count.toLocaleString()} reviews</span>
              )}
            </div>
          )}
          <span className="inline-flex items-center rounded-md bg-blue-50 border border-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
            {badge}
          </span>
        </div>

        {bestFor.length > 0 && (
          <ul className="flex flex-col gap-1.5">
            {bestFor.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="flex-shrink-0 flex h-4 w-4 mt-0.5 items-center justify-center rounded-full bg-emerald-100">
                  <Check className="h-2.5 w-2.5 text-emerald-600 stroke-[3]" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <a
            href={tool.affiliate_url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            onClick={handleAffiliate}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 transition-colors"
          >
            Visit Website
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <Link
            href={`/tools/${tool.slug}`} prefetch={true}
            className="flex-1 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2.5 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>

      {/* ── Desktop table-row layout — 5 columns matching Figma ── */}
      <div className="hidden lg:grid grid-cols-[1fr_140px_140px_200px_210px] gap-4 items-center px-6 py-6">

        {/* Platform */}
        <div className="flex items-start gap-4 min-w-0">
          {/* Logo / letter avatar */}
          <div className={cn(
            'flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl overflow-hidden',
            tool.logo_url ? 'bg-slate-100' : avatar.bg
          )}>
            {tool.logo_url ? (
              <Image src={tool.logo_url} alt={`${tool.name} logo`} width={48} height={48} className="object-contain" />
            ) : (
              <span className={cn('text-xl font-bold', avatar.text)}>
                {tool.name.charAt(0)}
              </span>
            )}
          </div>

          <div className="min-w-0">
            {/* Name + badge */}
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Link
                href={`/tools/${tool.slug}`} prefetch={true}
                className="font-bold text-base text-slate-900 hover:text-blue-600 transition-colors"
              >
                {tool.name}
              </Link>
              {tool.is_recommended && (
                <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
                  Recommended
                </span>
              )}
            </div>
            {/* Description */}
            {tool.description && (
              <p className="text-sm text-slate-500 line-clamp-2 max-w-xs leading-snug mb-2">
                {tool.description}
              </p>
            )}
            {/* Country tags */}
            {countryTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {countryTags.map((c) => (
                  <span key={c} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                    {c}
                  </span>
                ))}
                {extraCountries > 0 && (
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                    +{extraCountries}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Rating */}
        <div className="flex flex-col items-center gap-0.5">
          {tool.rating ? (
            <>
              <div className="flex items-center gap-1.5">
                <Star className="h-4.5 w-4.5 fill-amber-400 text-amber-400" style={{ width: 18, height: 18 }} />
                <span className="text-base font-bold text-slate-900">{tool.rating.toFixed(1)}</span>
              </div>
              {tool.review_count ? (
                <span className="text-xs text-slate-400 text-center">
                  {tool.review_count.toLocaleString()} reviews
                </span>
              ) : null}
            </>
          ) : (
            <span className="text-sm text-slate-400">N/A</span>
          )}
        </div>

        {/* Starting Price */}
        <div className="flex items-center justify-center">
          <span className="inline-flex items-center rounded-lg bg-blue-50 border border-blue-100 px-4 py-1.5 text-base font-bold text-blue-700">
            {badge}
          </span>
        </div>

        {/* Best For */}
        <div>
          {bestFor.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {bestFor.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="flex-shrink-0 flex h-4 w-4 mt-0.5 items-center justify-center rounded-full bg-emerald-100">
                    <Check className="h-2.5 w-2.5 text-emerald-600 stroke-[3]" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-sm text-slate-400">—</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <a
            href={tool.affiliate_url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            onClick={handleAffiliate}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 transition-colors"
          >
            Visit Website
            <ExternalLink className="h-4 w-4 flex-shrink-0" />
          </a>
          <Link
            href={`/tools/${tool.slug}`} prefetch={true}
            className="w-full inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium px-5 py-2.5 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}
