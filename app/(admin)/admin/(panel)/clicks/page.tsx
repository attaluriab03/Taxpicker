export const dynamic = 'force-dynamic'

import { createSupabaseServer } from '@/lib/supabase-server'
import { MousePointerClick, TrendingUp } from 'lucide-react'
import StatsCard from '@/components/admin/StatsCard'
import ClicksTable from '@/components/admin/ClicksTable'
import ClicksLiveUpdater from '@/components/admin/ClicksLiveUpdater'
import DashboardRefresher from '@/components/admin/DashboardRefresher'

async function getClicksData() {
  const supabase = await createSupabaseServer()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

  const [
    { count: totalClicks },
    { count: monthlyClicks },
    { count: todayClicks },
    { data: recentClicks },
  ] = await Promise.all([
    supabase.from('affiliate_clicks').select('*', { count: 'exact', head: true }),
    supabase.from('affiliate_clicks').select('*', { count: 'exact', head: true }).gte('clicked_at', startOfMonth),
    supabase.from('affiliate_clicks').select('*', { count: 'exact', head: true }).gte('clicked_at', startOfToday),
    supabase
      .from('affiliate_clicks')
      .select('*, tools(name,slug)')
      .order('clicked_at', { ascending: false })
      .limit(50),
  ])

  return {
    totalClicks: totalClicks || 0,
    monthlyClicks: monthlyClicks || 0,
    todayClicks: todayClicks || 0,
    recentClicks: (recentClicks as any[]) || [],
  }
}

export default async function ClicksPage() {
  const data = await getClicksData()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Subscribes to broadcast and calls router.refresh() when new clicks arrive */}
      <ClicksLiveUpdater />
      <DashboardRefresher />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Affiliate Click Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">
          Track all affiliate link clicks with GDPR consent status ·{' '}
          <span className="font-semibold text-slate-700">{data.totalClicks.toLocaleString()} total</span>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatsCard
          title="Total Clicks (All Time)"
          value={data.totalClicks.toLocaleString()}
          icon={<MousePointerClick className="h-4 w-4" />}
        />
        <StatsCard
          title="This Month"
          value={data.monthlyClicks.toLocaleString()}
          subtitle="Current month"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatsCard
          title="Today"
          value={data.todayClicks.toLocaleString()}
          subtitle={new Date().toLocaleDateString()}
          icon={<MousePointerClick className="h-4 w-4" />}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">Recent Clicks</h2>
        </div>
        <ClicksTable clicks={data.recentClicks} />
      </div>
    </div>
  )
}
