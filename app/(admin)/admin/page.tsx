import { createServiceClient } from '@/lib/supabase'
import type { Tool, Review, AffiliateClick } from '@/lib/supabase'
import StatsCard from '@/components/admin/StatsCard'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Wrench, FileText, Star, MousePointerClick, Clock } from 'lucide-react'
import RealtimeClickCounter from '@/components/admin/RealtimeClickCounter'

async function getDashboardData() {
  const supabase = createServiceClient()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString()

  const [
    { count: totalTools },
    { count: draftTools },
    { count: totalReviews },
    { count: weeklyReviews },
    { count: totalClicks },
    { count: monthlyClicks },
    { data: recentReviews },
    { data: topTools },
  ] = await Promise.all([
    supabase.from('tools').select('*', { count: 'exact', head: true }),
    supabase.from('tools').select('*', { count: 'exact', head: true }).eq('is_published', false),
    supabase.from('reviews').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).gte('created_at', startOfWeek),
    supabase.from('affiliate_clicks').select('*', { count: 'exact', head: true }),
    supabase.from('affiliate_clicks').select('*', { count: 'exact', head: true }).gte('clicked_at', startOfMonth),
    supabase.from('reviews').select('*, tools(name,slug)').order('created_at', { ascending: false }).limit(5),
    supabase.from('tools').select('id, name, slug, rating, is_published, is_recommended').order('rating', { ascending: false }).limit(5),
  ])

  return {
    totalTools: totalTools || 0,
    draftTools: draftTools || 0,
    totalReviews: totalReviews || 0,
    weeklyReviews: weeklyReviews || 0,
    totalClicks: totalClicks || 0,
    monthlyClicks: monthlyClicks || 0,
    recentReviews: recentReviews || [],
    topTools: topTools || [],
  }
}

export default async function AdminDashboard() {
  const data = await getDashboardData()

  return (
    <div className="p-6 max-w-7xl mx-auto">
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

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Tools"
          value={data.totalTools}
          subtitle={`${data.draftTools} draft${data.draftTools !== 1 ? 's' : ''} pending review`}
          subtitleColor={data.draftTools > 0 ? 'text-amber-600' : 'text-slate-400'}
          icon={<Wrench className="h-4 w-4" />}
        />
        <StatsCard
          title="Total Reviews"
          value={data.totalReviews.toLocaleString()}
          subtitle={`+${data.weeklyReviews} this week`}
          icon={<Star className="h-4 w-4" />}
        />
        <StatsCard
          title="Avg Rating"
          value="4.5"
          subtitle="Across all tools"
          subtitleColor="text-slate-400"
          icon={<Star className="h-4 w-4" />}
        />
        <StatsCard
          title="Monthly Clicks"
          value={data.monthlyClicks.toLocaleString()}
          subtitle={`+${Math.round((data.monthlyClicks / Math.max(data.totalClicks, 1)) * 100)}% vs last month`}
          icon={<MousePointerClick className="h-4 w-4" />}
        />
      </div>

      {/* Tools Table */}
      <div className="bg-white rounded-xl border border-slate-200 mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">Crypto Tax Tools</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tools..."
                className="h-8 pl-8 pr-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
              />
              <svg className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <Link href="/admin/tools/new">
              <Button size="sm" className="bg-slate-900 hover:bg-slate-800">
                <Plus className="h-4 w-4 mr-1" />
                Add New Tool
              </Button>
            </Link>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tool</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Rating</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.topTools.map((tool: any) => (
              <tr key={tool.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <span className="font-medium text-slate-900">{tool.name}</span>
                    <div className="text-xs text-slate-400 mt-0.5">{tool.slug}</div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <Badge variant="secondary" className="text-xs">Both</Badge>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    <span className="text-slate-700">{tool.rating || 'N/A'}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <Badge variant={tool.is_published ? 'success' : 'secondary'} className="text-xs">
                    {tool.is_published ? 'Active' : 'Draft'}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/admin/tools/${tool.id}/edit`}>
                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700 text-xs">
                      Edit
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-6 py-3 border-t border-slate-100">
          <Link href="/admin/tools" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all tools →
          </Link>
        </div>
      </div>

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
    </div>
  )
}
