'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

export default function DashboardRefresher() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [secondsAgo, setSecondsAgo] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refresh = () => {
    setLastUpdated(new Date())
    setSecondsAgo(0)
    startTransition(() => router.refresh())
  }

  // Poll every 30 seconds — use a ref so the interval always calls the latest refresh
  const refreshRef = useRef(refresh)
  refreshRef.current = refresh

  useEffect(() => {
    intervalRef.current = setInterval(() => refreshRef.current(), 30_000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // Update "X seconds ago" counter every second
  useEffect(() => {
    const ticker = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(ticker)
  }, [lastUpdated])

  const label =
    secondsAgo < 5
      ? 'just now'
      : secondsAgo < 60
      ? `${secondsAgo}s ago`
      : `${Math.floor(secondsAgo / 60)}m ago`

  return (
    <div className="flex items-center justify-end gap-3 mb-4">
      <span className="text-xs text-slate-400">Last updated {label}</span>
      <button
        onClick={refresh}
        disabled={isPending}
        className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`} />
        Refresh
      </button>
    </div>
  )
}
