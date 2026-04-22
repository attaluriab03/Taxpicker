export const dynamic = 'force-dynamic'

import { createSupabaseServer } from '@/lib/supabase-server'
import type { Article } from '@/lib/supabase'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import AdminArticlesTable from '@/components/admin/AdminArticlesTable'

async function getArticles(): Promise<Article[]> {
  const supabase = await createSupabaseServer()
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

      <AdminArticlesTable articles={articles} />
    </div>
  )
}
