import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  max?: number
  size?: 'sm' | 'md'
  showValue?: boolean
}

export default function StarRating({ rating, max = 5, size = 'md', showValue = true }: StarRatingProps) {
  const starSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: max }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              starSize,
              i < Math.floor(rating)
                ? 'text-amber-400 fill-amber-400'
                : i < rating
                ? 'text-amber-400 fill-amber-200'
                : 'text-slate-200 fill-slate-200'
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className={cn('font-semibold text-slate-700', size === 'sm' ? 'text-xs' : 'text-sm')}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
