import ArticleForm from '@/components/admin/ArticleForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewArticlePage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/articles" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" />
          Back to Articles
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">New Article</h1>
      <p className="text-slate-500 text-sm mb-8">Write a new crypto tax guide or educational article.</p>
      <ArticleForm />
    </div>
  )
}
