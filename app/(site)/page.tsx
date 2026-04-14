import type { Metadata } from 'next'
import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import type { Tool } from '@/lib/supabase'
import AffiliateBanner from '@/components/compliance/AffiliateBanner'
import ToolCard from '@/components/tools/ToolCard'
import ToolFilters from '@/components/tools/ToolFilters'
import ToolExpandButton from '@/components/tools/ToolExpandButton'
import FeatureMatrix from '@/components/tools/FeatureMatrix'
import { Shield, Zap, TrendingUp, FileText, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Find the Best Crypto Tax Tool for You',
  description:
    'Compare top crypto tax software. Unbiased reviews, feature comparisons, and verified pricing to find the right tool for your needs.',
}

const INITIAL_COUNT = 6

async function getTools(searchParams: {
  q?: string
  country?: string
  pricing?: string
}): Promise<Tool[]> {
  let query = supabase
    .from('tools')
    .select('*')
    .eq('is_published', true)
    .order('is_recommended', { ascending: false })
    .order('is_featured', { ascending: false })
    .order('rating', { ascending: false })
    .order('created_at', { ascending: false })

  if (searchParams.q) {
    query = query.ilike('name', `%${searchParams.q}%`)
  }
  if (searchParams.country) {
    query = query.contains('supported_countries', [searchParams.country])
  }
  if (searchParams.pricing && searchParams.pricing !== 'all') {
    query = query.eq('pricing_type', searchParams.pricing)
  }

  const { data, error } = await query
  if (error) {
    console.error('Failed to fetch tools:', error)
    return []
  }
  return data as Tool[]
}

async function getStats() {
  const [{ count: toolCount }, { count: reviewCount }] = await Promise.all([
    supabase.from('tools').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('reviews').select('*', { count: 'exact', head: true }),
  ])
  return { toolCount: toolCount || 0, reviewCount: reviewCount || 0 }
}

// JSON-LD for homepage
function HomepageJsonLd({ tools }: { tools: Tool[] }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taxpicker.io'
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'Taxpicker',
        description: 'Find the best crypto tax software for your needs.',
      },
      {
        '@type': 'ItemList',
        name: 'Best Crypto Tax Tools',
        itemListElement: tools.slice(0, 10).map((tool, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: tool.name,
          url: `${siteUrl}/tools/${tool.slug}`,
        })),
      },
    ],
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

const whyItems = [
  {
    icon: Shield,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    title: 'Stay Compliant',
    desc: 'Ensure your crypto taxes meet local regulations and avoid penalties.',
  },
  {
    icon: Zap,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    title: 'Save Time',
    desc: 'Automate transaction imports and report generation.',
  },
  {
    icon: TrendingUp,
    color: 'text-green-600',
    bg: 'bg-green-50',
    title: 'Audit Ready',
    desc: 'Generate professional reports that hold up to scrutiny.',
  },
  {
    icon: FileText,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    title: 'CPA Export',
    desc: 'Export data in formats your accountant can use directly.',
  },
]

interface HomePageProps {
  searchParams: Promise<{ q?: string; country?: string; pricing?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const sp = await searchParams
  const [tools, stats] = await Promise.all([getTools(sp), getStats()])

  const initialTools = tools.slice(0, INITIAL_COUNT)
  const extraTools = tools.slice(INITIAL_COUNT)

  return (
    <>
      <HomepageJsonLd tools={tools} />
      <AffiliateBanner />

      {/* Hero */}
      <section className="bg-white pt-16 pb-12 px-4 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-4">
            Find the Right Crypto Tax Tool<br />
            <span className="text-blue-600">for You</span>
          </h1>
          <p className="text-lg text-slate-500 mb-8 max-w-2xl mx-auto">
            Stop wasting hours researching crypto tax software. We compare features, pricing, and reviews so you can find the perfect tool in minutes.
          </p>

          {/* Stats bar */}
          <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
            {[
              { value: `${stats.toolCount}+`, label: 'Tools Reviewed' },
              { value: `${stats.reviewCount.toLocaleString()}+`, label: 'User Reviews' },
              { value: '50+', label: 'Countries' },
              { value: '500+', label: 'Exchanges' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tool listing */}
      <section className="bg-slate-50 py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Crypto Tax Tools</h2>
              <p className="text-slate-500 text-sm mt-1">
                {tools.length} tools found
              </p>
            </div>
            <Link href="/compare">
              <Button variant="outline" size="sm">
                Compare Side by Side
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <Suspense fallback={<div className="h-10 bg-slate-200 rounded-lg animate-pulse" />}>
              <ToolFilters />
            </Suspense>
          </div>

          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <span className="w-6" />
            <span>Tool</span>
            <span>Category</span>
            <span>Rating</span>
            <span>Pricing</span>
            <span>Actions</span>
          </div>

          {tools.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <p className="text-lg font-medium">No tools found</p>
              <p className="text-sm mt-1">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {initialTools.map((tool, i) => (
                <ToolCard key={tool.id} tool={tool} rank={i + 1} />
              ))}
              <ToolExpandButton extraTools={extraTools} startRank={INITIAL_COUNT + 1} />
            </div>
          )}
        </div>
      </section>

      {/* Why section */}
      <section className="py-16 px-4 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Why Use Crypto Tax Software?</h2>
            <p className="text-slate-500">
              Professionally manage your DeFi, trading, and staking activities and optimize your tax bill.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyItems.map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center p-6 rounded-xl border border-slate-100 hover:shadow-sm transition-shadow">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${item.bg} mb-4`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Matrix */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Feature Comparison Matrix</h2>
            <p className="text-slate-500">Compare features across all {tools.length} platforms</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden p-4">
            <FeatureMatrix tools={tools} maxInitial={6} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-slate-900 text-white text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Find Your Perfect Tax Tool?</h2>
          <p className="text-slate-400 mb-8">
            Use our comparison tool to find the right crypto tax software based on your needs, exchanges, and budget.
          </p>
          <Link href="/compare">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              Compare Tools Now
            </Button>
          </Link>
        </div>
      </section>
    </>
  )
}
