import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { governanceRules } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const [row] = await db
      .update(governanceRules)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(governanceRules.id, id))
      .returning()
    if (!row) {
      return Response.json({ error: 'Rule not found' }, { status: 404 })
    }
    return Response.json({ data: row })
  } catch (error) {
    return Response.json({ error: 'Failed to update governance rule' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const [row] = await db
      .delete(governanceRules)
      .where(eq(governanceRules.id, id))
      .returning()
    if (!row) {
      return Response.json({ error: 'Rule not found' }, { status: 404 })
    }
    return Response.json({ data: row })
  } catch (error) {
    return Response.json({ error: 'Failed to delete governance rule' }, { status: 500 })
  }
}
