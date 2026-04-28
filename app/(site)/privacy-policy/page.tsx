export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getPageContent, getContent } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Taxpicker privacy policy covering data collection, cookies, Supabase storage, affiliate tracking, and GDPR user rights.',
  robots: { index: false, follow: false },
}

export default async function PrivacyPolicyPage() {
  const content = await getPageContent('privacy-policy')

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">
        {getContent(content, 'page.page_title', 'Privacy Policy')}
      </h1>
      <p className="text-sm text-slate-500 mb-10">
        Last updated: {getContent(content, 'page.last_updated', 'April 27, 2026')}
      </p>

      <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-blue-600 prose-strong:text-slate-900 prose-li:text-slate-700">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {getContent(content, 'page.content', '')}
        </ReactMarkdown>
      </div>
    </div>
  )
}
