import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import type { Tool } from '@/lib/supabase'
import AffiliateBanner from '@/components/compliance/AffiliateBanner'
import DisclaimerCallout from '@/components/compliance/DisclaimerCallout'
import FeatureMatrix from '@/components/tools/FeatureMatrix'
import ToolCard from '@/components/tools/ToolCard'
import ToolExpandButton from '@/components/tools/ToolExpandButton'

export const metadata: Metadata = {
  title: 'Compare Crypto Tax Tools',
  description:
    'Side-by-side comparison of the best crypto tax software. Compare features, pricing, supported exchanges, and more to find the right tool.',
}

async function getTools(): Promise<Tool[]> {
  const { data } = await supabase
    .from('tools')
    .select('*')
    .eq('is_published', true)
    .order('is_recommended', { ascending: false })
    .order('is_featured', { ascending: false })
    .order('rating', { ascending: false })
    .order('created_at', { ascending: false })
  return (data as Tool[]) || []
}

const INITIAL_COUNT = 6

export default async function ComparePage() {
  const tools = await getTools()
  const initialTools = tools.slice(0, INITIAL_COUNT)
  const extraTools = tools.slice(INITIAL_COUNT)

  return (
    <>
      <AffiliateBanner />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            Compare Crypto Tax Tools
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto">
            Use this page to compare features, pricing, and ratings side by side across all platforms.
          </p>
        </div>

        {/* Tool listing */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-slate-900 mb-5">
            All Tools ({tools.length})
          </h2>

          <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <span className="w-6" />
            <span>Tool</span>
            <span>Category</span>
            <span>Rating</span>
            <span>Pricing</span>
            <span>Actions</span>
          </div>

          <div className="flex flex-col gap-3">
            {initialTools.map((tool, i) => (
              <ToolCard key={tool.id} tool={tool} rank={i + 1} />
            ))}
            <ToolExpandButton extraTools={extraTools} startRank={INITIAL_COUNT + 1} />
          </div>
        </section>

        {/* Feature comparison matrix */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Feature Comparison Matrix
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Compare features across all platforms. Scroll horizontally to see all tools.
          </p>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden p-4">
            <FeatureMatrix tools={tools} maxInitial={6} />
          </div>
        </section>

        {/* Disclaimer */}
        <DisclaimerCallout />
      </div>
    </>
  )
}
