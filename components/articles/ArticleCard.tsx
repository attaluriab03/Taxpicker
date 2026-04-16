import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, Tag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Article } from '@/lib/supabase'

interface ArticleCardProps {
  article: Article
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  return (
    <article className="group border border-slate-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
      {article.og_image_url && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={article.og_image_url}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-5">
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {article.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs capitalize">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <h2 className="text-base font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          <Link href={`/blog/${article.slug}`} prefetch={true}>
            {article.title}
          </Link>
        </h2>
        {article.meta_description && (
          <p className="text-sm text-slate-500 line-clamp-2 mb-4">
            {article.meta_description}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-slate-400">
          {publishedDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {publishedDate}
            </span>
          )}
          {article.author && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {article.author}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
