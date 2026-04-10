import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { organisations } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const [row] = await db
      .select()
      .from(organisations)
      .where(eq(organisations.id, id))
    if (!row) {
      return Response.json({ error: 'Organisation not found' }, { status: 404 })
    }
    return Response.json({ data: row })
  } catch (error) {
    return Response.json({ error: 'Failed to fetch organisation' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const [row] = await db
      .update(organisations)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(organisations.id, id))
      .returning()
    if (!row) {
      return Response.json({ error: 'Organisation not found' }, { status: 404 })
    }
    return Response.json({ data: row })
  } catch (error) {
    return Response.json({ error: 'Failed to update organisation' }, { status: 500 })
  }
}
