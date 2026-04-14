'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import StarRating from './StarRating'
import RecommendedBadge from './RecommendedBadge'
import type { Tool } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { trackAffiliateClickClient } from '@/lib/tracking-client'

interface ToolCardProps {
  tool: Tool
  rank?: number
}

function pricingLabel(tool: Tool): string {
  if (tool.pricing_type === 'free') return 'Free'
  if (tool.pricing_type === 'freemium') return 'Free+'
  if (tool.price_from && tool.price_from > 0) return `$${tool.price_from}/mo`
  return 'Paid'
}

export default function ToolCard({ tool, rank }: ToolCardProps) {
  const handleAffiliate = () => {
    trackAffiliateClickClient(tool.id)
  }

  return (
    <div
      className={cn(
        'group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-xl border bg-white transition-shadow hover:shadow-md',
        tool.is_recommended
          ? 'border-blue-200 shadow-sm'
          : 'border-slate-200'
      )}
    >
      {/* Rank */}
      {rank && (
        <div className="hidden sm:flex flex-shrink-0 w-6 items-center justify-center text-sm font-medium text-slate-400">
          {rank}
        </div>
      )}

      {/* Logo */}
      <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 overflow-hidden">
        {tool.logo_url ? (
          <Image
            src={tool.logo_url}
            alt={`${tool.name} logo`}
            width={48}
            height={48}
            className="object-contain"
          />
        ) : (
          <span className="text-lg font-bold text-slate-600">
            {tool.name.charAt(0)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <Link
            href={`/tools/${tool.slug}`}
            className="font-semibold text-slate-900 hover:text-blue-600 transition-colors"
          >
            {tool.name}
          </Link>
          {tool.is_recommended && <RecommendedBadge />}
          {tool.is_featured && !tool.is_recommended && (
            <Badge variant="blue">Featured</Badge>
          )}
        </div>
        <p className="text-xs text-slate-500 mb-2 line-clamp-1">
          {tool.website_url?.replace(/^https?:\/\//, '')}
        </p>
        {tool.description && (
          <p className="text-sm text-slate-600 line-clamp-2 max-w-prose">
            {tool.description}
          </p>
        )}
      </div>

      {/* Meta columns */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6 flex-shrink-0 text-sm">
        {/* Category */}
        <div className="text-center">
          <p className="text-xs text-slate-400 mb-1">Category</p>
          <Badge variant="secondary" className="capitalize">
            {tool.pricing_type === 'free' ? 'Free' : 'Both'}
          </Badge>
        </div>

        {/* Rating */}
        <div className="text-center">
          <p className="text-xs text-slate-400 mb-1">Rating</p>
          {tool.rating ? (
            <StarRating rating={tool.rating} size="sm" />
          ) : (
            <span className="text-xs text-slate-400">N/A</span>
          )}
        </div>

        {/* Pricing */}
        <div className="text-center min-w-[70px]">
          <p className="text-xs text-slate-400 mb-1">Pricing</p>
          <div className="flex items-center gap-1 justify-center">
            <DollarSign className="h-3 w-3 text-slate-500" />
            <span className="text-xs font-medium text-slate-700">
              {pricingLabel(tool)}
            </span>
          </div>
        </div>

        {/* CTA */}
        <a
          href={tool.affiliate_url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          onClick={handleAffiliate}
          className="flex-shrink-0"
        >
          <Button
            size="sm"
            className={cn(
              tool.is_recommended
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-slate-900 hover:bg-slate-800'
            )}
          >
            Get Started
            <ExternalLink className="h-3 w-3" />
          </Button>
        </a>
      </div>
    </div>
  )
}
