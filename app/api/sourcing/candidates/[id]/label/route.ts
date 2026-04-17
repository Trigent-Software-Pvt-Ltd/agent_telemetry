/**
 * POST /api/sourcing/candidates/[id]/label  — label a candidate's fit state.
 *
 * Body: { fitState: FitState, reviewer?: string }
 * 200:  { candidate }
 * 404:  not found across any indexed run
 * 503:  live_not_provisioned
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isLive, isProvisioned } from '@/lib/live-sourcing/config'
import { addLabelToRun } from '@/lib/live-sourcing/redis'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const LabelSchema = z.object({
  fitState: z.enum(['good_fit', 'poor_fit', 'unclear', 'unreviewed']),
  reviewer: z.string().trim().min(1).optional(),
})

function notProvisionedResponse(missing: string[]) {
  return NextResponse.json(
    { error: 'live_not_provisioned', missing },
    { status: 503 },
  )
}

export async function POST(
  request: Request,
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

  let body: unknown = {}
  try {
    body = await request.json()
  } catch {
    body = {}
  }
  const parsed = LabelSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_body', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  try {
    const updated = await addLabelToRun(id, parsed.data.fitState, parsed.data.reviewer)
    if (!updated) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }
    return NextResponse.json({ candidate: updated })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'label_failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
