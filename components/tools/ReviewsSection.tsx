'use client'

import { useState } from 'react'
import StarRating from '@/components/tools/StarRating'
import type { Review } from '@/lib/supabase'
import { ChevronDown } from 'lucide-react'

const COLLAPSED_COUNT = 3

export default function ReviewsSection({ reviews }: { reviews: Review[] }) {
  const [expanded, setExpanded] = useState(false)

  const visible = expanded ? reviews : reviews.slice(0, COLLAPSED_COUNT)
  const hiddenCount = reviews.length - COLLAPSED_COUNT

  return (
    <div>
      <div className="space-y-4">
        {visible.map((review) => (
          <div key={review.id} className="border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">
                {review.author || 'Anonymous'}
              </span>
              <StarRating rating={review.rating} size="sm" />
            </div>
            {review.comment && (
              <p className="text-sm text-slate-600">{review.comment}</p>
            )}
          </div>
        ))}
      </div>

      {hiddenCount > 0 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
          {expanded ? 'Show fewer reviews' : `Show all ${reviews.length} reviews (${hiddenCount} more)`}
        </button>
      )}
    </div>
  )
}
