export const dynamic = 'force-dynamic'

import { createSupabaseServer } from '@/lib/supabase-server'
import StatsCard from '@/components/admin/StatsCard'
import { Wrench, Star, MousePointerClick, BookOpen, Zap } from 'lucide-react'
import RealtimeClickCounter from '@/components/admin/RealtimeClickCounter'
import AdminToolsTable from '@/components/admin/AdminToolsTable'
import DashboardRefresher from '@/components/admin/DashboardRefresher'

function validateMetric(value: number | null | undefined, fallback = 'N/A'): string {
  if (value === null || value === undefined || isNaN(value as number)) return fallback
  return value.toLocaleString()
}

async function getDashboardData() {
  const supabase = await createSupabaseServer()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

  const [
    { count: publishedTools },
    { count: draftTools },
    { count: totalReviews },
    { count: weeklyReviews },
    { count: totalClicks },
    { count: monthlyClicks },
    { count: todayClicks },
    { count: publishedArticles },
    { count: draftArticles },
    { data: recentReviews },
    { data: allTools },
    { data: publishedToolRatings },
    { data: topToolsByClicks },
    { data: recentClicks },
  ] = await Promise.all([
    supabase.from('tools').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('tools').select('*', { count: 'exact', head: true }).eq('is_published', false),
    supabase.from('reviews').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).gte('created_at', startOfWeek),
    supabase.from('affiliate_clicks').select('*', { count: 'exact', head: true }),
    supabase.from('affiliate_clicks').select('*', { count: 'exact', head: true }).gte('clicked_at', startOfMonth),
    supabase.from('affiliate_clicks').select('*', { count: 'exact', head: true }).gte('clicked_at', startOfToday),
    supabase.from('articles').select('*', { count: 'exact', head: true }).not('published_at', 'is', null),
    supabase.from('articles').select('*', { count: 'exact', head: true }).is('published_at', null),
    supabase.from('reviews').select('*, tools(name,slug)').order('created_at', { ascending: false }).limit(5),
    supabase.from('tools').select('id, name, slug, rating, is_published, is_recommended').order('created_at', { ascending: false }),
    supabase.from('tools').select('rating').eq('is_published', true).not('rating', 'is', null),
    supabase.from('affiliate_clicks').select('tool_id').order('tool_id'),
    supabase.from('affiliate_clicks').select('clicked_at, tool_id, tools(name,slug)').order('clicked_at', { ascending: false }).limit(10),
  ])

  // Compute avg rating from actual tool ratings
  const ratings = (publishedToolRatings || []).map((r: any) => r.rating).filter((r: any) => r !== null && !isNaN(r))
  const avgRating = ratings.length > 0
    ? (ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length).toFixed(1)
    : null

  // Compute top 5 tools by click count
  const clickCounts: Record<string, number> = {}
  for (const row of topToolsByClicks || []) {
    const id = (row as any).tool_id
    clickCounts[id] = (clickCounts[id] || 0) + 1
  }
  const top5ToolIds = Object.entries(clickCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ id, count }))

  // Enrich top 5 with tool names
  const toolMap = Object.fromEntries((allTools || []).map((t: any) => [t.id, t]))
  const topTools = top5ToolIds.map(({ id, count }) => ({
    name: toolMap[id]?.name ?? 'Unknown',
    slug: toolMap[id]?.slug ?? '',
    count,
  }))

  return {
    publishedTools: publishedTools || 0,
    draftTools: draftTools || 0,
    totalReviews: totalReviews || 0,
    weeklyReviews: weeklyReviews || 0,
    totalClicks: totalClicks || 0,
    monthlyClicks: monthlyClicks || 0,
    todayClicks: todayClicks || 0,
    publishedArticles: publishedArticles || 0,
    draftArticles: draftArticles || 0,
    avgRating,
    recentReviews: recentReviews || [],
    allTools: allTools || [],
    topTools,
    recentClicks: (recentClicks as any[]) || [],
  }
}

export default async function AdminDashboard() {
  const data = await getDashboardData()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Polls every 30s and provides manual refresh button */}
      <DashboardRefresher />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage crypto tax tools and content</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">
            AD
          </div>
          <span className="text-sm font-medium text-slate-700">Admin</span>
        </div>
      </div>

      {/* Stats grid — row 1: tools & articles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatsCard
          title="Published Tools"
          value={validateMetric(data.publishedTools)}
          subtitle={`${data.draftTools} draft${data.draftTools !== 1 ? 's' : ''} pending review`}
          subtitleColor={data.draftTools > 0 ? 'text-amber-600' : 'text-slate-400'}
          icon={<Wrench className="h-4 w-4" />}
        />
        <StatsCard
          title="Published Articles"
          value={validateMetric(data.publishedArticles)}
          subtitle={`${data.draftArticles} draft${data.draftArticles !== 1 ? 's' : ''}`}
          subtitleColor={data.draftArticles > 0 ? 'text-amber-600' : 'text-slate-400'}
          icon={<BookOpen className="h-4 w-4" />}
        />
        <StatsCard
          title="Avg Tool Rating"
          value={data.avgRating !== null ? `${data.avgRating} / 5.0` : 'N/A'}
          subtitle="Across published tools"
          subtitleColor="text-slate-400"
          icon={<Star className="h-4 w-4" />}
        />
        <StatsCard
          title="Total Reviews"
          value={validateMetric(data.totalReviews)}
          subtitle={`+${data.weeklyReviews} this week`}
          icon={<Star className="h-4 w-4" />}
        />
      </div>

      {/* Stats grid — row 2: clicks */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatsCard
          title="Total Clicks (All Time)"
          value={validateMetric(data.totalClicks)}
          icon={<MousePointerClick className="h-4 w-4" />}
        />
        <StatsCard
          title="Clicks This Month"
          value={validateMetric(data.monthlyClicks)}
          subtitle="Current month"
          icon={<MousePointerClick className="h-4 w-4" />}
        />
        <StatsCard
          title="Clicks Today"
          value={validateMetric(data.todayClicks)}
          subtitle={new Date().toLocaleDateString()}
          icon={<MousePointerClick className="h-4 w-4" />}
        />
      </div>

      {/* Tools table — client component handles search, unpublish, delete */}
      <AdminToolsTable tools={data.allTools} />

      {/* Bottom grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent reviews */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900">Recent Reviews</h2>
            <Star className="h-4 w-4 text-slate-400" />
          </div>
          <div className="divide-y divide-slate-100">
            {data.recentReviews.length === 0 ? (
              <p className="px-5 py-8 text-sm text-slate-400 text-center">No reviews yet</p>
            ) : (
              data.recentReviews.map((review: any) => (
                <div key={review.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-slate-700">{review.author || 'Anonymous'}</span>
                    <span className="text-xs text-slate-400 ml-2">{(review.tools as any)?.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live clicks counter */}
        <RealtimeClickCounter initialCount={data.totalClicks} />
      </div>

      {/* Bottom grid 2: top tools by clicks + recent clicks feed */}
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        {/* Top 5 tools by clicks */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900">Top Tools by Clicks</h2>
            <MousePointerClick className="h-4 w-4 text-slate-400" />
          </div>
          <div className="divide-y divide-slate-100">
            {data.topTools.length === 0 ? (
              <p className="px-5 py-8 text-sm text-slate-400 text-center">No click data yet</p>
            ) : (
              data.topTools.map((tool, i) => (
                <div key={tool.slug} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                    <span className="text-sm font-medium text-slate-700">{tool.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{tool.count.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent 10 clicks feed */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900">Recent Clicks</h2>
            <Zap className="h-4 w-4 text-slate-400" />
          </div>
          <div className="divide-y divide-slate-100">
            {data.recentClicks.length === 0 ? (
              <p className="px-5 py-8 text-sm text-slate-400 text-center">No clicks yet</p>
            ) : (
              data.recentClicks.map((click: any) => (
                <div key={click.id ?? click.clicked_at} className="px-5 py-2.5 flex items-center justify-between">
                  <span className="text-sm text-slate-700">{(click.tools as any)?.name ?? 'Unknown'}</span>
                  <span className="text-xs text-slate-400">{new Date(click.clicked_at).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
