import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { supabase } from '@/lib/supabase'
import { articleMetadata } from '@/lib/metadata'
import type { Article } from '@/lib/supabase'
import { Calendar, User, ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

async function getArticle(slug: string): Promise<Article | null> {
  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .single()
  return data as Article | null
}

async function getRelatedArticles(current: Article): Promise<Article[]> {
  const { data } = await supabase
    .from('articles')
    .select('id, title, slug, meta_description, published_at, author, tags, og_image_url, content, created_at, updated_at')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .neq('id', current.id)
    .limit(3)
  return (data as Article[]) || []
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return {}
  return articleMetadata(article)
}

export async function generateStaticParams() {
  const { data } = await supabase
    .from('articles')
    .select('slug')
    .not('published_at', 'is', null)
  return (data || []).map((a) => ({ slug: a.slug }))
}

function ArticleJsonLd({ article }: { article: Article }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taxpicker.io'
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.meta_description,
    author: article.author
      ? { '@type': 'Person', name: article.author }
      : undefined,
    datePublished: article.published_at,
    image: article.og_image_url,
    url: `${siteUrl}/blog/${article.slug}`,
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Extract headings for table of contents (from raw markdown)
function extractHeadings(content: string): { id: string; text: string; level: number }[] {
  const headings: { id: string; text: string; level: number }[] = []
  const regex = /^(#{1,3}) (.+)$/gm
  let match
  while ((match = regex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2]
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    headings.push({ id, text, level })
  }
  return headings
}

// Strip leading h1 from markdown body so it doesn't duplicate the page title
function stripLeadingH1(content: string): string {
  return content.replace(/^# .+\n*/m, '')
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const related = await getRelatedArticles(article)

  // Strip the leading H1 from markdown — the title is rendered in the page header
  const bodyContent = stripLeadingH1(article.content)
  const headings = extractHeadings(bodyContent)

  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <>
      <ArticleJsonLd article={article} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Resources
          </Link>
        </div>

        <div className="grid lg:grid-cols-4 gap-10">
          {/* Main article */}
          <article className="lg:col-span-3">
            {/* Article header */}
            <header className="mb-8">
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="capitalize text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                {article.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 pb-6 border-b border-slate-200">
                {article.author && (
                  <span className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    {article.author}
                  </span>
                )}
                {publishedDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {publishedDate}
                  </span>
                )}
              </div>
            </header>

            {article.og_image_url && (
              <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden mb-8">
                <Image
                  src={article.og_image_url}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Article content — rendered markdown with prose typography */}
            <div className="prose prose-lg max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-p:text-slate-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 prose-code:text-blue-700 prose-code:bg-blue-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-blockquote:border-l-blue-500 prose-blockquote:text-slate-600 prose-li:text-slate-700 prose-table:text-sm prose-th:bg-slate-50 prose-th:text-slate-700 prose-th:font-semibold prose-td:text-slate-600 prose-hr:border-slate-200">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {bodyContent}
              </ReactMarkdown>
            </div>
          </article>

          {/* Sidebar — static, no sticky */}
          <aside className="space-y-6">
            {/* Table of contents */}
            {headings.length > 0 && (
              <div className="border border-slate-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">In This Article</h3>
                <nav>
                  <ul className="space-y-2">
                    {headings.map((h) => (
                      <li key={h.id}>
                        <a
                          href={`#${h.id}`}
                          className={`block text-sm text-slate-500 hover:text-blue-600 transition-colors leading-snug ${
                            h.level === 2 ? '' : h.level === 3 ? 'pl-4' : ''
                          }`}
                        >
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            )}

            {/* CTA */}
            <div className="border border-blue-100 bg-blue-50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                Ready to Find Your Tax Tool?
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                Use our comparison tool to find the right crypto tax software for your needs.
              </p>
              <Link href="/">
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Compare Tools
                </Button>
              </Link>
            </div>
          </aside>
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <section className="mt-14 pt-10 border-t border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Related Articles</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {related.map((a) => (
                <div
                  key={a.id}
                  className="border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow"
                >
                  <h3 className="font-semibold text-slate-900 mb-2 hover:text-blue-600">
                    <Link href={`/blog/${a.slug}`}>{a.title}</Link>
                  </h3>
                  {a.meta_description && (
                    <p className="text-sm text-slate-500 line-clamp-2">{a.meta_description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
