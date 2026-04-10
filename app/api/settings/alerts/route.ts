import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { alertRules } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const orgId = request.nextUrl.searchParams.get('org_id')
    if (!orgId) {
      return Response.json({ error: 'org_id is required' }, { status: 400 })
    }
    const data = await db
      .select()
      .from(alertRules)
      .where(eq(alertRules.orgId, orgId))
    return Response.json({ data })
  } catch (error) {
    return Response.json({ error: 'Failed to fetch alert rules' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { org_id, name, metric, threshold, unit, enabled, severity, scope, config } = body
    if (!org_id || !name || !metric || threshold == null || !unit) {
      return Response.json({ error: 'org_id, name, metric, threshold, and unit are required' }, { status: 400 })
    }
    const [row] = await db
      .insert(alertRules)
      .values({
        orgId: org_id,
        name,
        metric,
        threshold,
        unit,
        enabled: enabled ?? true,
        severity: severity ?? 'Warning',
        scope: scope ?? 'all',
        config: config ?? {},
      })
      .returning()
    return Response.json({ data: row }, { status: 201 })
  } catch (error) {
    return Response.json({ error: 'Failed to create alert rule' }, { status: 500 })
  }
}
