import { Star } from 'lucide-react'

export default function RecommendedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-semibold text-white">
      <Star className="h-3 w-3 fill-current" />
      Recommended
    </span>
  )
}
