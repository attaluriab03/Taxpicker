'use client'

import { useEffect, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

/**
 * Invisible component that subscribes to the affiliate-clicks broadcast channel
 * and calls router.refresh() (debounced) when new clicks arrive, so the
 * server-rendered stats and table on the analytics page stay current.
 */
export default function ClicksLiveUpdater() {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const scheduleRefresh = () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current)
      refreshTimer.current = setTimeout(() => {
        startTransition(() => router.refresh())
      }, 3000)
    }

    const channel = supabase
      .channel('affiliate-clicks')
      .on('broadcast', { event: 'new_click' }, scheduleRefresh)
      .subscribe()

    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current)
      supabase.removeChannel(channel)
    }
  }, [router])

  return null
}
