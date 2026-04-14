'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { MousePointerClick, Zap } from 'lucide-react'

interface RealtimeClickCounterProps {
  initialCount: number
}

export default function RealtimeClickCounter({ initialCount }: RealtimeClickCounterProps) {
  const [count, setCount] = useState(initialCount)
  const [recentClicks, setRecentClicks] = useState<{ id: string; clicked_at: string; tool_id: string }[]>([])
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    const channel = supabase
      .channel('affiliate_clicks_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'affiliate_clicks' },
        (payload) => {
          setCount((c) => c + 1)
          setPulse(true)
          setRecentClicks((prev) => [payload.new as any, ...prev].slice(0, 5))
          setTimeout(() => setPulse(false), 600)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-slate-900">Live Affiliate Clicks</h2>
          <div className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </div>
        </div>
        <MousePointerClick className="h-4 w-4 text-slate-400" />
      </div>
      <div className="px-5 py-6 text-center">
        <div className={`text-5xl font-bold text-slate-900 transition-all duration-200 ${pulse ? 'scale-110 text-blue-600' : ''}`}>
          {count.toLocaleString()}
        </div>
        <p className="text-sm text-slate-500 mt-1">total affiliate clicks</p>
      </div>
      <div className="px-5 pb-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Recent Activity</p>
        {recentClicks.length === 0 ? (
          <p className="text-xs text-slate-400 py-2">Waiting for new clicks...</p>
        ) : (
          <div className="space-y-1.5">
            {recentClicks.map((click) => (
              <div key={click.id} className="flex items-center gap-2 text-xs text-slate-600 animate-fade-in">
                <Zap className="h-3 w-3 text-amber-500" />
                <span>New click at {new Date(click.clicked_at).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
