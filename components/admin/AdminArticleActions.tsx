'use client'

import Link from 'next/link'
import { Edit, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AdminArticleActionsProps {
  articleId: string
  slug: string
}

export default function AdminArticleActions({ articleId, slug }: AdminArticleActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/blog/${slug}`} target="_blank">
        <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-400 hover:text-slate-600">
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </Link>
      <Link href={`/admin/articles/${articleId}/edit`}>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-400 hover:text-slate-700">
          <Edit className="h-3.5 w-3.5" />
        </Button>
      </Link>
    </div>
  )
}
