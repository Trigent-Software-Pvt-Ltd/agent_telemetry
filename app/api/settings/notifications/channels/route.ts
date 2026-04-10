import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { notificationChannels } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const orgId = request.nextUrl.searchParams.get('org_id')
    if (!orgId) {
      return Response.json({ error: 'org_id is required' }, { status: 400 })
    }
    const data = await db
      .select()
      .from(notificationChannels)
      .where(eq(notificationChannels.orgId, orgId))
    return Response.json({ data })
  } catch (error) {
    return Response.json({ error: 'Failed to fetch notification channels' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, enabled, config } = body
    if (!id) {
      return Response.json({ error: 'id is required' }, { status: 400 })
    }
    const updates: Record<string, unknown> = {}
    if (enabled !== undefined) updates.enabled = enabled
    if (config !== undefined) updates.config = config

    const [row] = await db
      .update(notificationChannels)
      .set(updates)
      .where(eq(notificationChannels.id, id))
      .returning()
    if (!row) {
      return Response.json({ error: 'Channel not found' }, { status: 404 })
    }
    return Response.json({ data: row })
  } catch (error) {
    return Response.json({ error: 'Failed to update notification channel' }, { status: 500 })
  }
}
