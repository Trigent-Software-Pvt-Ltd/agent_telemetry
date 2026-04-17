'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Play } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  className?: string
}

/**
 * Triggers a new live Sourcing Agent run by POSTing to /api/sourcing/runs.
 * - 200: success toast + refresh the server component so the new run renders.
 * - 503 { error: 'live_not_provisioned' }: warn with the env-var hint.
 * - Any other error: surface the server message (or a generic one).
 */
export default function RunNowButton({ className }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [, startTransition] = useTransition()

  const disabled = busy

  async function handleClick() {
    if (busy) return
    setBusy(true)
    try {
      const res = await fetch('/api/sourcing/runs', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (res.ok) {
        toast.success('Sourcing run started — refreshing trace.')
        startTransition(() => router.refresh())
        return
      }

      // Try to parse a structured error body.
      let body: { error?: string; missing?: unknown; message?: string } = {}
      try {
        body = (await res.json()) as typeof body
      } catch {
        // non-JSON error, that's fine
      }

      if (res.status === 503 && body.error === 'live_not_provisioned') {
        toast.warning(
          'Live mode not provisioned — check AI_GATEWAY_API_KEY and Upstash env vars.',
        )
        return
      }

      const msg = body.message || body.error || `Run failed (HTTP ${res.status})`
      toast.error(msg)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Network error while starting run.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      aria-busy={busy}
      className={clsx(
        'inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all',
        disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:brightness-110',
        className,
      )}
      style={{
        background: '#0f1117',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {busy ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          Running…
        </>
      ) : (
        <>
          <Play size={14} />
          Run now
        </>
      )}
    </button>
  )
}
