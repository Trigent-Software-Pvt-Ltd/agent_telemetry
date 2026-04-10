import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { fmeaEntries } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const agentId = request.nextUrl.searchParams.get('agent_id')
    const query = agentId
      ? db.select().from(fmeaEntries).where(eq(fmeaEntries.agentId, agentId))
      : db.select().from(fmeaEntries)
    const data = await query
    return Response.json({ data })
  } catch (error) {
    return Response.json({ error: 'Failed to fetch FMEA entries' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agent_id, failure_mode, effect, cause, severity, occurrence, detection, recommended_action, status } = body
    if (!agent_id || !failure_mode || !effect || !cause || severity == null || occurrence == null || detection == null) {
      return Response.json({ error: 'agent_id, failure_mode, effect, cause, severity, occurrence, and detection are required' }, { status: 400 })
    }
    const [row] = await db
      .insert(fmeaEntries)
      .values({
        agentId: agent_id,
        failureMode: failure_mode,
        effect,
        cause,
        severity,
        occurrence,
        detection,
        recommendedAction: recommended_action ?? null,
        status: status ?? 'open',
      })
      .returning()
    return Response.json({ data: row }, { status: 201 })
  } catch (error) {
    return Response.json({ error: 'Failed to create FMEA entry' }, { status: 500 })
  }
}
