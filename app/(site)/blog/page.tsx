import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import type { Article } from '@/lib/supabase'
import ArticleCard from '@/components/articles/ArticleCard'
import { BookOpen } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Crypto Tax Resources & Guides',
  description:
    'Educational guides and articles about crypto taxes, DeFi taxation, NFT tax rules, and more.',
}

async function getArticles(): Promise<Article[]> {
  const { data } = await supabase
    .from('articles')
    .select('*')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
  return (data as Article[]) || []
}

export default async function BlogPage() {
  const articles = await getArticles()

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-blue-600 mb-2">
          <BookOpen className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">Resources</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
          Crypto Tax Guides &amp; Articles
        </h1>
        <p className="text-slate-500 max-w-xl">
          Everything you need to know about crypto taxes, DeFi, NFTs, and staying compliant.
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-medium">No articles yet</p>
          <p className="text-sm">Check back soon for crypto tax guides.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}
