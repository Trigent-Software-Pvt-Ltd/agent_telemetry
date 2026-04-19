/**
 * GET /api/sourcing/cron — Vercel scheduled trigger.
 *
 * Fires on the cron schedule defined in vercel.json. Runs the live Sourcing
 * pipeline with default parameters so the Manager Trace always shows a
 * recent run when a viewer opens the page (demo feel: "the agent is always
 * working"). The manual "Run now" button still works on top of this.
 *
 * Security: Vercel attaches `Authorization: Bearer ${CRON_SECRET}` to all
 * cron invocations. Any request without a matching secret is rejected.
 */

import { NextResponse } from 'next/server'
import { isLive, isProvisioned } from '@/lib/live-sourcing/config'
import { runSourcingManager } from '@/lib/live-sourcing/manager'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const DEFAULT_STATES = ['TX', 'FL', 'CA', 'NC', 'AZ', 'GA', 'TN', 'PA', 'OH', 'CO']

export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = request.headers.get('authorization') ?? ''
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
  }

  if (!isLive()) {
    return NextResponse.json({ skipped: 'DATA_SOURCE != live-sourcing' }, { status: 200 })
  }
  const missing = isProvisioned()
  if (missing.length > 0) {
    return NextResponse.json(
      { skipped: 'live_not_provisioned', missing },
      { status: 200 },
    )
  }

  try {
    const { run, candidates } = await runSourcingManager({
      taxonomy: '225100000X',
      states: DEFAULT_STATES,
      limit: 50,
      triggeredBy: 'scheduled-cron',
    })
    return NextResponse.json({
      runId: run.id,
      surfaced: run.evaluationSurfacedCount,
      candidates: candidates.length,
      cost: run.totalCostUsd,
      latency: run.totalLatencyMs,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'cron_run_failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
