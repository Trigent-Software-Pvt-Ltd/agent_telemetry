import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { notificationRules } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const orgId = request.nextUrl.searchParams.get('org_id')
    if (!orgId) {
      return Response.json({ error: 'org_id is required' }, { status: 400 })
    }
    const data = await db
      .select()
      .from(notificationRules)
      .where(eq(notificationRules.orgId, orgId))
    return Response.json({ data })
  } catch (error) {
    return Response.json({ error: 'Failed to fetch notification rules' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, channels, recipients } = body
    if (!id) {
      return Response.json({ error: 'id is required' }, { status: 400 })
    }
    const updates: Record<string, unknown> = {}
    if (channels !== undefined) updates.channels = channels
    if (recipients !== undefined) updates.recipients = recipients

    const [row] = await db
      .update(notificationRules)
      .set(updates)
      .where(eq(notificationRules.id, id))
      .returning()
    if (!row) {
      return Response.json({ error: 'Notification rule not found' }, { status: 404 })
    }
    return Response.json({ data: row })
  } catch (error) {
    return Response.json({ error: 'Failed to update notification rule' }, { status: 500 })
  }
}
