import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Tool } from '@/lib/supabase'
import AffiliateBanner from '@/components/compliance/AffiliateBanner'
import ToolCard from '@/components/tools/ToolCard'
import ToolFilters from '@/components/tools/ToolFilters'
import ToolExpandButton from '@/components/tools/ToolExpandButton'
import FeatureMatrix from '@/components/tools/FeatureMatrix'
import { Shield, Zap, TrendingUp, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Find the Best Crypto Tax Tool for You',
  description:
    'Save hours of research and avoid costly mistakes. Compare top crypto tax platforms across 15+ countries.',
}

const INITIAL_COUNT = 6
const BRAND_BLUE = '#2563EB'

// Map new filter params to DB query
async function getTools(searchParams: {
  region?: string
  pricing?: string
  features?: string
}): Promise<Tool[]> {
  let query = supabase
    .from('tools')
    .select('*')
    .eq('is_published', true)
    .order('is_recommended', { ascending: false })
    .order('is_featured', { ascending: false })
    .order('rating', { ascending: false })
    .order('created_at', { ascending: false })

  if (searchParams.region && searchParams.region !== 'all') {
    query = query.contains('supported_countries', [searchParams.region])
  }
  if (searchParams.pricing && searchParams.pricing !== 'all') {
    query = query.eq('pricing_type', searchParams.pricing)
  }
  if (searchParams.features && searchParams.features !== 'all') {
    query = query.contains('features', [searchParams.features])
  }

  const { data, error } = await query
  if (error) {
    console.error('Failed to fetch tools:', error)
    return []
  }
  return data as Tool[]
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

// Static hero stats matching Figma
const HERO_STATS = [
  { value: '50K+', label: 'Users Helped' },
  { value: '6', label: 'Platforms Reviewed' },
  { value: '50+', label: 'Evaluation Criteria' },
  { value: '15+', label: 'Countries Supported' },
]

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
  searchParams: Promise<{ region?: string; pricing?: string; features?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const sp = await searchParams
  const tools = await getTools(sp)

  const initialTools = tools.slice(0, INITIAL_COUNT)
  const extraTools = tools.slice(INITIAL_COUNT)

  return (
    <>
      <HomepageJsonLd tools={tools} />
      <AffiliateBanner />

      {/* Hero */}
      <section className="bg-white pt-12 pb-12 px-4 text-center">
        <div className="mx-auto max-w-3xl">
          {/* Trusted badge — matches Figma pill above title */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-slate-700 mb-6">
            <Star className="h-3.5 w-3.5 fill-current" style={{ color: BRAND_BLUE }} />
            <span>Trusted by 50,000+ crypto investors</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-4">
            Find the Right Crypto Tax Tool
            <br />
            for You
          </h1>

          {/* Description — exact text from spec */}
          <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto">
            Save hours of research and avoid costly mistakes. We&apos;ve tested leading
            platforms across 15+ countries to help you find the right fit—fast.
          </p>

          {/* Stats — numbers in brand blue, labels in slate */}
          <div className="flex flex-wrap justify-center gap-10 sm:gap-16">
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold" style={{ color: BRAND_BLUE }}>
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tool listing */}
      <section className="bg-slate-50 py-12 px-4">
        <div className="mx-auto max-w-7xl">
          {/* Filters — new Figma design */}
          <div className="mb-6">
            <Suspense fallback={<div className="h-20 bg-white rounded-xl border border-slate-200 animate-pulse" />}>
              <ToolFilters totalCount={tools.length} />
            </Suspense>
          </div>

          {/* Table column headers — matches Figma */}
          <div className="hidden lg:grid grid-cols-[1fr_120px_120px_180px_180px] gap-4 px-5 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <span>Platform</span>
            <span className="text-center">Rating</span>
            <span className="text-center">Starting Price</span>
            <span>Best For</span>
            <span className="text-right">Actions</span>
          </div>

          {tools.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200 text-slate-500">
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

      {/* Feature Comparison Matrix — centered title, region filter inside component */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Feature Comparison Matrix</h2>
            <p className="text-slate-500">Compare features across all platforms</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden p-4">
            <FeatureMatrix tools={tools} maxInitial={6} />
          </div>
        </div>
      </section>
    </>
  )
}
