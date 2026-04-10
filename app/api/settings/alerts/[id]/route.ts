import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { alertRules } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const [row] = await db
      .update(alertRules)
      .set(body)
      .where(eq(alertRules.id, id))
      .returning()
    if (!row) {
      return Response.json({ error: 'Alert rule not found' }, { status: 404 })
    }
    return Response.json({ data: row })
  } catch (error) {
    return Response.json({ error: 'Failed to update alert rule' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const [row] = await db
      .delete(alertRules)
      .where(eq(alertRules.id, id))
      .returning()
    if (!row) {
      return Response.json({ error: 'Alert rule not found' }, { status: 404 })
    }
    return Response.json({ data: row })
  } catch (error) {
    return Response.json({ error: 'Failed to delete alert rule' }, { status: 500 })
  }
}
