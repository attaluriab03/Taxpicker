import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { toolMetadata } from '@/lib/metadata'
import type { Tool, Review } from '@/lib/supabase'
import AffiliateBanner from '@/components/compliance/AffiliateBanner'
import DisclaimerCallout from '@/components/compliance/DisclaimerCallout'
import RecommendedBadge from '@/components/tools/RecommendedBadge'
import StarRating from '@/components/tools/StarRating'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Check,
  X,
  ExternalLink,
  ArrowLeft,
  Globe,
  Layers,
  Wallet,
  FileCheck,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react'
import AffiliateButton from '@/components/tools/AffiliateButton'

async function getTool(slug: string): Promise<Tool | null> {
  const { data } = await supabase
    .from('tools')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  return data as Tool | null
}

async function getReviews(toolId: string): Promise<Review[]> {
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('tool_id', toolId)
    .order('created_at', { ascending: false })
    .limit(10)
  return (data as Review[]) || []
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const tool = await getTool(slug)
  if (!tool) return {}
  return toolMetadata(tool)
}

export async function generateStaticParams() {
  const { data } = await supabase
    .from('tools')
    .select('slug')
    .eq('is_published', true)
  return (data || []).map((t) => ({ slug: t.slug }))
}

function BreadcrumbJsonLd({ tool }: { tool: Tool }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taxpicker.io'
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tools',
        item: `${siteUrl}/#tools`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: tool.name || '',
        item: `${siteUrl}/tools/${tool.slug}`,
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

function ToolJsonLd({ tool }: { tool: Tool }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taxpicker.io'
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    url: tool.website_url,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: tool.price_from || 0,
      priceCurrency: 'USD',
    },
    aggregateRating: tool.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: tool.rating,
          bestRating: 5,
        }
      : undefined,
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [tool, reviews] = await Promise.all([
    getTool(slug),
    getTool(slug).then((t) => (t ? getReviews(t.id) : [])),
  ])

  if (!tool) notFound()

  const pricingTiers = tool.pricing_details
    ? tool.pricing_details.split('.').filter(Boolean)
    : []

  const faqs = [
    { q: `Does ${tool.name} support my country?`, a: tool.supported_countries.length > 0 ? `${tool.name} supports the following countries: ${tool.supported_countries.join(', ')}.` : 'Please check the official website for country support.' },
    { q: 'Can it import transactions automatically?', a: tool.supported_exchanges.length > 0 ? `Yes — ${tool.name} supports automatic imports from ${tool.supported_exchanges.slice(0, 5).join(', ')}${tool.supported_exchanges.length > 5 ? ` and ${tool.supported_exchanges.length - 5} more exchanges` : ''}.` : 'Check the official website for import options.' },
    { q: 'What is the pricing structure?', a: tool.pricing_details || `${tool.name} offers ${tool.pricing_type} pricing. Visit the official website for current pricing.` },
    { q: 'Is customer support available?', a: `Yes, ${tool.name} provides customer support. Visit their official website for contact options.` },
    { q: 'Can I export my tax reports?', a: tool.tax_report_types.length > 0 ? `${tool.name} supports the following report types: ${tool.tax_report_types.join(', ')}.` : 'Export options are available — check the official website for details.' },
  ]

  return (
    <>
      <ToolJsonLd tool={tool} />
      <BreadcrumbJsonLd tool={tool} />
      <AffiliateBanner />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-4 w-4" />
            Back to Homepage
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0">
                  {tool.logo_url ? (
                    <Image src={tool.logo_url} alt={`${tool.name} logo`} width={64} height={64} className="object-contain" />
                  ) : (
                    <span className="text-2xl font-bold text-slate-600">{tool.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{tool.name}</h1>
                    {tool.is_recommended && <RecommendedBadge />}
                  </div>
                  <p className="text-slate-500 text-sm mb-2">{tool.description}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    {tool.rating && <StarRating rating={tool.rating} />}
                    {tool.pricing_type && (
                      <Badge variant="secondary" className="capitalize">{tool.pricing_type}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Plans */}
            {(tool.pricing_type || tool.pricing_details) && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-slate-400">$</span> Pricing Plans
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {tool.pricing_type === 'free' ? (
                    <div className="border border-slate-200 rounded-xl p-4 text-center">
                      <div className="text-xs font-medium text-slate-500 mb-1">Free</div>
                      <div className="text-2xl font-bold text-slate-900">$0</div>
                      <div className="text-xs text-slate-500 mt-1">Forever free</div>
                    </div>
                  ) : (
                    <>
                      <div className="border border-slate-200 rounded-xl p-4 text-center">
                        <div className="text-xs font-medium text-slate-500 mb-1">Free</div>
                        <div className="text-2xl font-bold text-slate-900">$0</div>
                        <div className="text-xs text-slate-500 mt-1">Basic features</div>
                      </div>
                      <div className="border border-slate-200 rounded-xl p-4 text-center">
                        <div className="text-xs font-medium text-slate-500 mb-1">Starter</div>
                        <div className="text-2xl font-bold text-slate-900">
                          ${tool.price_from ? Math.round(tool.price_from / 12) : 4}
                          <span className="text-sm font-normal text-slate-500">/mo</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">Essential tools</div>
                      </div>
                      <div className="border-2 border-blue-500 rounded-xl p-4 text-center relative">
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                          <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">Popular</span>
                        </div>
                        <div className="text-xs font-medium text-blue-600 mb-1">Pro</div>
                        <div className="text-2xl font-bold text-slate-900">
                          ${tool.price_from ? Math.round(tool.price_from / 8) : 17}
                          <span className="text-sm font-normal text-slate-500">/mo</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">Advanced features</div>
                      </div>
                      <div className="border border-slate-200 rounded-xl p-4 text-center">
                        <div className="text-xs font-medium text-slate-500 mb-1">Enterprise</div>
                        <div className="text-2xl font-bold text-slate-900">Custom</div>
                        <div className="text-xs text-slate-500 mt-1">Full suite</div>
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}

            {/* Features */}
            {tool.features && tool.features.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Features</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {tool.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-slate-700">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Pros & Cons */}
            {(tool.pros?.length > 0 || tool.cons?.length > 0) && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Pros &amp; Cons</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  {tool.pros?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-green-700 flex items-center gap-1.5 mb-3">
                        <ThumbsUp className="h-4 w-4" /> Pros
                      </h3>
                      <ul className="space-y-2">
                        {tool.pros.map((p) => (
                          <li key={p} className="flex items-start gap-2 text-sm text-slate-700">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {tool.cons?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-red-700 flex items-center gap-1.5 mb-3">
                        <ThumbsDown className="h-4 w-4" /> Cons
                      </h3>
                      <ul className="space-y-2">
                        {tool.cons.map((c) => (
                          <li key={c} className="flex items-start gap-2 text-sm text-slate-700">
                            <X className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* FAQs */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="border border-slate-200 rounded-xl overflow-hidden">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="px-4 last:border-0">
                    <AccordionTrigger className="text-sm font-medium text-slate-900">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent>{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            {/* Reviews */}
            {reviews.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">User Reviews</h2>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">
                          {review.author || 'Anonymous'}
                        </span>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                      {review.comment && (
                        <p className="text-sm text-slate-600">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Disclaimer */}
            <DisclaimerCallout />
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* CTA card */}
            <div className="border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="text-center">
                <div className="text-sm text-slate-500 mb-1">Starting at</div>
                <div className="text-3xl font-bold text-slate-900">
                  {tool.pricing_type === 'free'
                    ? 'Free'
                    : tool.price_from
                    ? `$${tool.price_from}/yr`
                    : 'Free'}
                </div>
              </div>
              <AffiliateButton tool={tool} />
            </div>

            {/* Best for */}
            {tool.supported_countries?.length > 0 && (
              <div className="border border-slate-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-400" />
                  Supported Countries
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {tool.supported_countries.map((c) => (
                    <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Integrations */}
            {tool.supported_exchanges?.length > 0 && (
              <div className="border border-slate-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-slate-400" />
                  Integrations
                </h3>
                <ul className="space-y-1">
                  {tool.supported_exchanges.slice(0, 8).map((e) => (
                    <li key={e} className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Check className="h-3 w-3 text-green-500" />
                      {e}
                    </li>
                  ))}
                  {tool.supported_exchanges.length > 8 && (
                    <li className="text-xs text-slate-400">
                      +{tool.supported_exchanges.length - 8} more
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Tax Reports */}
            {tool.tax_report_types?.length > 0 && (
              <div className="border border-slate-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-slate-400" />
                  Tax Report Types
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {tool.tax_report_types.map((r) => (
                    <Badge key={r} variant="outline" className="text-xs">{r}</Badge>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  )
}
