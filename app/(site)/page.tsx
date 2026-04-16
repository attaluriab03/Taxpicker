export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'

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

async function getTools(searchParams: {
  regions?: string
  pricing?: string
  features?: string
  volume?: string
  userType?: string
}): Promise<Tool[]> {
  let query = supabase
    .from('tools')
    .select('*')
    .eq('is_published', true)
    .order('is_recommended', { ascending: false })
    .order('is_featured', { ascending: false })
    .order('rating', { ascending: false })
    .order('created_at', { ascending: false })

  if (searchParams.regions) {
    const regionList = searchParams.regions.split(',').filter(Boolean)
    // AND logic — each selected region must be in supported_countries
    for (const region of regionList) {
      query = query.contains('supported_countries', [region])
    }
  }
  if (searchParams.pricing && searchParams.pricing !== 'all') {
    query = query.eq('pricing_type', searchParams.pricing)
  }
  if (searchParams.features) {
    const featureList = searchParams.features.split(',').filter(Boolean)
    for (const feat of featureList) {
      // JSONB @> operator requires JSON.stringify for proper comparison
      query = query.filter('features', 'cs', JSON.stringify([feat.trim()]))
    }
  }

  const { data, error } = await query
  if (error) {
    console.error('Failed to fetch tools:', error)
    return []
  }

  let tools = data as Tool[]

  // Client-side filtering for volume (no dedicated DB column — infer from pricing_details)
  if (searchParams.volume && searchParams.volume !== 'all') {
    tools = tools.filter((t) => {
      const details = (t.pricing_details || '').toLowerCase()
      switch (searchParams.volume) {
        case 'low':    return details.includes('100') || details.includes('25') || details.includes('50')
        case 'medium': return details.includes('1,000') || details.includes('1000') || details.includes('500')
        case 'high':   return details.includes('10,000') || details.includes('10000') || details.includes('5,000')
        case 'unlimited': return details.includes('unlimited') || details.includes('∞')
        default: return true
      }
    })
  }

  // Client-side filtering for user type (infer from best_for array)
  if (searchParams.userType && searchParams.userType !== 'both') {
    tools = tools.filter((t) => {
      const bestFor = (t.best_for || []).map((b: string) => b.toLowerCase())
      if (searchParams.userType === 'business') {
        return bestFor.some((b: string) => b.includes('business') || b.includes('enterprise') || b.includes('professional'))
      }
      if (searchParams.userType === 'individual') {
        return bestFor.some((b: string) => b.includes('individual') || b.includes('trader') || b.includes('investor') || b.includes('beginner'))
      }
      return true
    })
  }

  return tools
}

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

const HERO_STATS = [
  { value: '50K+', label: 'Users Helped' },
  { value: '10+', label: 'Platforms Reviewed' },
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
  searchParams: Promise<{ regions?: string; pricing?: string; features?: string; volume?: string; userType?: string }>
}

async function getAllTools(): Promise<Tool[]> {
  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .eq('is_published', true)
    .order('is_recommended', { ascending: false })
    .order('is_featured', { ascending: false })
    .order('rating', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) {
    console.error('Failed to fetch all tools:', error)
    return []
  }
  return data as Tool[]
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const sp = await searchParams
  const [tools, allTools] = await Promise.all([getTools(sp), getAllTools()])

  const initialTools = tools.slice(0, INITIAL_COUNT)
  const extraTools = tools.slice(INITIAL_COUNT)

  return (
    <>
      <HomepageJsonLd tools={tools} />
      <AffiliateBanner />

      {/* Hero — soft blue-to-white gradient background */}
      <section
        className="pt-16 pb-16 px-4 text-center"
        style={{
          background: 'linear-gradient(180deg, #EFF6FF 0%, #F8FAFF 55%, #FFFFFF 100%)',
        }}
      >
        <div className="mx-auto max-w-3xl">
          {/* Trusted badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-300 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 mb-8">
            <Star className="h-3.5 w-3.5 fill-blue-500 text-blue-500" />
            <span>Trusted by 50,000+ crypto investors</span>
          </div>

          <h1 className="text-5xl font-bold text-slate-900 leading-tight mb-6">
            Find the Right Crypto Tax Tool
            <span className="block">for You</span>
          </h1>

          <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
            Save hours of research and avoid costly mistakes. We&apos;ve tested leading
            platforms across 15+ countries to help you find the right fit—fast.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-12 sm:gap-20">
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold" style={{ color: BRAND_BLUE }}>
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tool listing */}
      <section className="bg-slate-50 py-14 px-4">
        <div className="mx-auto max-w-7xl">
          {/* Filter + column header panel */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm mb-3">
            {/* "Refine Results" heading */}
            <div className="px-6 pt-5 pb-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Refine Results</p>
              <ToolFilters
                key={[sp.regions, sp.pricing, sp.volume, sp.userType, sp.features].join('|')}
                totalCount={tools.length}
                initialRegions={sp.regions ? sp.regions.split(',').filter(Boolean) : []}
                initialPricing={sp.pricing || 'all'}
                initialVolume={sp.volume || 'all'}
                initialUserType={sp.userType || 'both'}
                initialFeatures={sp.features ? sp.features.split(',').filter(Boolean) : []}
              />
            </div>

            {/* Column headers — visually connected to the cards below */}
            <div className="hidden lg:grid grid-cols-[1fr_140px_140px_200px_210px] gap-4 px-6 py-3 text-sm font-bold text-slate-600 uppercase tracking-wide border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <span>Platform</span>
              <span className="text-center">Rating</span>
              <span className="text-center">Starting Price</span>
              <span>Best For</span>
              <span className="text-right">Actions</span>
            </div>
          </div>

          {tools.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-slate-200 text-slate-500">
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
      <section className="py-20 px-4 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Why Use Crypto Tax Software?</h2>
            <p className="text-lg text-slate-500">
              Professionally manage your DeFi, trading, and staking activities and optimize your tax bill.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyItems.map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center text-center p-8 rounded-xl border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-full ${item.bg} mb-5`}>
                  <item.icon className={`h-7 w-7 ${item.color}`} />
                </div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Matrix */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Feature Comparison Matrix</h2>
            <p className="text-lg text-slate-500">Compare features across all platforms</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden p-6">
            <FeatureMatrix tools={allTools} maxInitial={6} />
          </div>
        </div>
      </section>
    </>
  )
}
