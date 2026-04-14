import { createServiceClient } from '@/lib/supabase'
import type { Article } from '@/lib/supabase'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Calendar, User } from 'lucide-react'
import AdminArticleActions from '@/components/admin/AdminArticleActions'

async function getArticles(): Promise<Article[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false })
  return (data as Article[]) || []
}

export default async function AdminArticlesPage() {
  const articles = await getArticles()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Articles</h1>
          <p className="text-slate-500 text-sm mt-1">{articles.length} articles</p>
        </div>
        <Link href="/admin/articles/new">
          <Button className="bg-slate-900 hover:bg-slate-800">
            <Plus className="h-4 w-4 mr-2" />
            New Article
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {articles.length === 0 ? (
          <div className="px-6 py-16 text-center text-slate-400">
            <p>No articles yet.</p>
            <Link href="/admin/articles/new" className="text-blue-600 hover:underline text-sm mt-1 block">
              Write the first one.
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Author</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tags</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Published</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div>
                      <span className="font-medium text-slate-900 line-clamp-1">{article.title}</span>
                      <div className="text-xs text-slate-400 mt-0.5">{article.slug}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <User className="h-3 w-3 text-slate-400" />
                      {article.author || '—'}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {article.tags?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs capitalize">
                          {tag}
                        </Badge>
                      ))}
                      {article.tags?.length > 2 && (
                        <span className="text-xs text-slate-400">+{article.tags.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {article.published_at ? (
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {new Date(article.published_at).toLocaleDateString()}
                      </div>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Draft</Badge>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <AdminArticleActions articleId={article.id} slug={article.slug} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
