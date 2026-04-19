'use client'

import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'

interface Props {
  /** Poll interval in ms. Default 30_000 (30 seconds). */
  intervalMs?: number
  /** The run id the page was server-rendered with. */
  currentRunId?: string | null
}

/**
 * Passive detector: polls `/api/sourcing/runs` at a slow cadence to check
 * if the backend has a newer run id than what this page was server-rendered
 * with. When a new run lands (typically from the scheduled cron), a small
 * "new run available" pill appears — clicking it does a full reload. We
 * don't auto-refresh because router.refresh() at cadence can race with the
 * RSC payload and Chrome crashes the renderer on some setups. Full reload
 * on explicit click is reliable.
 */
export default function LiveAutoRefresh({
  intervalMs = 30_000,
  currentRunId = null,
}: Props) {
  const [nextIn, setNextIn] = useState(Math.ceil(intervalMs / 1000))
  const [latestId, setLatestId] = useState<string | null>(null)

  useEffect(() => {
    let aborted = false
    async function poll() {
      try {
        const res = await fetch('/api/sourcing/runs', { cache: 'no-store' })
        if (!res.ok) return
        const body = (await res.json()) as { run?: { id?: string } }
        if (aborted) return
        if (body.run?.id) setLatestId(body.run.id)
      } catch {
        // swallow — we just skip this tick
      }
    }
    const pollTimer = setInterval(() => {
      poll()
      setNextIn(Math.ceil(intervalMs / 1000))
    }, intervalMs)
    const tickTimer = setInterval(() => {
      setNextIn(prev => (prev > 1 ? prev - 1 : Math.ceil(intervalMs / 1000)))
    }, 1000)
    // Initial poll after a short delay so the page settles first.
    const initial = setTimeout(poll, 3000)
    return () => {
      aborted = true
      clearInterval(pollTimer)
      clearInterval(tickTimer)
      clearTimeout(initial)
    }
  }, [intervalMs])

  const hasNewRun = !!latestId && !!currentRunId && latestId !== currentRunId

  if (hasNewRun) {
    return (
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer hover:brightness-110"
        style={{
          background: '#F59E0B',
          color: 'white',
          border: '1px solid rgba(245,158,11,0.6)',
        }}
        title={`New run available (${latestId}) — click to reload`}
      >
        <RefreshCw size={11} />
        New run — reload
      </button>
    )
  }

  return (
    <span
      className="text-[11px] text-neutral-500 tabular-nums"
      title="Polling backend for new runs"
    >
      watching · next check in {nextIn}s
    </span>
  )
}
