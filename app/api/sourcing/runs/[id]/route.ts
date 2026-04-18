/**
 * GET /api/sourcing/runs/[id]  — fetch a specific sourcing run by id.
 */

import { NextResponse } from 'next/server'
import { isLive, isProvisioned } from '@/lib/live-sourcing/config'
import { getRun } from '@/lib/live-sourcing/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function notProvisionedResponse(missing: string[]) {
  return NextResponse.json(
    { error: 'live_not_provisioned', missing },
    { status: 503 },
  )
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  if (!isLive()) {
    return notProvisionedResponse(['DATA_SOURCE=live-sourcing'])
  }
  const missing = isProvisioned()
  if (missing.length > 0) return notProvisionedResponse(missing)

  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: 'missing_id' }, { status: 400 })
  }

  try {
    const data = await getRun(id)
    if (!data) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }
    return NextResponse.json({ run: data.run, candidates: data.candidates })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'run_failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
