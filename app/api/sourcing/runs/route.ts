/**
 * POST /api/sourcing/runs    — trigger a live sourcing run.
 * GET  /api/sourcing/runs    — return the latest live sourcing run.
 *
 * All responses are synchronous JSON. Callers that need mock data should
 * fall back to the mock path when this endpoint returns 503 with
 * `{ error: 'live_not_provisioned', missing: [...] }`.
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isLive, isProvisioned } from '@/lib/live-sourcing/config'
import { MaxCostExceededError, runSourcingManager } from '@/lib/live-sourcing/manager'
import { getLatestRunId, getRun } from '@/lib/live-sourcing/db'

export const runtime = 'nodejs'
// Long-running run — avoid static optimisation of these handlers.
export const dynamic = 'force-dynamic'
// NPI Registry + classifier + estimator + DB write can run up to ~30s
// on a cold container. Explicitly raise the function timeout.
export const maxDuration = 60

const RunRequestSchema = z.object({
  taxonomy: z.string().trim().min(1).optional(),
  states: z.array(z.string().trim().length(2)).max(15).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  triggeredBy: z.string().trim().min(1).optional(),
})

function notProvisionedResponse(missing: string[]) {
  return NextResponse.json(
    { error: 'live_not_provisioned', missing },
    { status: 503 },
  )
}

export async function POST(request: Request): Promise<Response> {
  if (!isLive()) {
    return notProvisionedResponse(['DATA_SOURCE=live-sourcing'])
  }
  const missing = isProvisioned()
  if (missing.length > 0) return notProvisionedResponse(missing)

  let body: unknown = {}
  try {
    body = await request.json()
  } catch {
    body = {}
  }
  const parsed = RunRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_body', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  try {
    const { run, candidates } = await runSourcingManager(parsed.data)
    return NextResponse.json({ runId: run.id, run, candidates })
  } catch (err) {
    if (err instanceof MaxCostExceededError) {
      return NextResponse.json(
        { error: 'max_cost_exceeded', cost: err.cost, cap: err.cap },
        { status: 500 },
      )
    }
    const message = err instanceof Error ? err.message : 'run_failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(): Promise<Response> {
  if (!isLive()) {
    return notProvisionedResponse(['DATA_SOURCE=live-sourcing'])
  }
  const missing = isProvisioned()
  if (missing.length > 0) return notProvisionedResponse(missing)

  try {
    const latestId = await getLatestRunId()
    if (!latestId) {
      return NextResponse.json({ error: 'no_runs' }, { status: 404 })
    }
    const data = await getRun(latestId)
    if (!data) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }
    return NextResponse.json({ run: data.run, candidates: data.candidates, isLive: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'run_failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
