'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  /** Polling interval in ms. Default 20_000 (20 seconds). */
  intervalMs?: number
}

/**
 * Background poller that calls `router.refresh()` on a cadence so the server
 * components re-render with whatever the latest persisted run is. Paired with
 * the scheduled cron in `app/api/sourcing/cron`, the effect is that a viewer
 * sitting on /agents/sourcing-agent sees new runs land every few minutes
 * without touching anything.
 *
 * Renders a tiny status line showing seconds until next refresh.
 */
export default function LiveAutoRefresh({ intervalMs = 20_000 }: Props) {
  const router = useRouter()
  const [nextIn, setNextIn] = useState(Math.ceil(intervalMs / 1000))

  useEffect(() => {
    const refresh = setInterval(() => {
      router.refresh()
      setNextIn(Math.ceil(intervalMs / 1000))
    }, intervalMs)
    const tick = setInterval(() => {
      setNextIn(prev => (prev > 1 ? prev - 1 : Math.ceil(intervalMs / 1000)))
    }, 1000)
    return () => {
      clearInterval(refresh)
      clearInterval(tick)
    }
  }, [intervalMs, router])

  return (
    <span
      className="text-[11px] text-neutral-500 tabular-nums"
      title="Auto-refreshing live data"
    >
      auto-refresh · next in {nextIn}s
    </span>
  )
}
