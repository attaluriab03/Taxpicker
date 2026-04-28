export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getPageContent, getContent } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'Taxpicker liability disclaimer — all content is informational only, not financial advice.',
  robots: { index: false, follow: false },
}

export default async function DisclaimerPage() {
  const content = await getPageContent('disclaimer')

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">
        {getContent(content, 'page.page_title', 'Disclaimer')}
      </h1>
      <p className="text-sm text-slate-500 mb-10">
        Last updated: {getContent(content, 'page.last_updated', 'April 27, 2026')}
      </p>

      <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-blue-600 prose-strong:text-slate-900 prose-li:text-slate-700 prose-blockquote:border-red-400 prose-blockquote:bg-red-50 prose-blockquote:text-red-800 prose-blockquote:rounded-xl prose-blockquote:px-5 prose-blockquote:py-4 prose-blockquote:not-italic">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {getContent(content, 'page.content', '')}
        </ReactMarkdown>
      </div>
    </div>
  )
}
