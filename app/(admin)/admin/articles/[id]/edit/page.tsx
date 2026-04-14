import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase'
import type { Article } from '@/lib/supabase'
import ArticleForm from '@/components/admin/ArticleForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

async function getArticle(id: string): Promise<Article | null> {
  const supabase = createServiceClient()
  const { data } = await supabase.from('articles').select('*').eq('id', id).single()
  return data as Article | null
}

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const article = await getArticle(id)
  if (!article) notFound()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/articles" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" />
          Back to Articles
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Edit: {article.title}</h1>
      <p className="text-slate-500 text-sm mb-8">
        {article.published_at ? 'This article is published.' : 'This article is a draft.'}
      </p>
      <ArticleForm initialData={article} articleId={article.id} />
    </div>
  )
}
