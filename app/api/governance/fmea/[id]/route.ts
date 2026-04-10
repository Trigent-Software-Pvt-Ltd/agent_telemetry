import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { fmeaEntries } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const [row] = await db
      .update(fmeaEntries)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(fmeaEntries.id, id))
      .returning()
    if (!row) {
      return Response.json({ error: 'FMEA entry not found' }, { status: 404 })
    }
    return Response.json({ data: row })
  } catch (error) {
    return Response.json({ error: 'Failed to update FMEA entry' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const [row] = await db
      .delete(fmeaEntries)
      .where(eq(fmeaEntries.id, id))
      .returning()
    if (!row) {
      return Response.json({ error: 'FMEA entry not found' }, { status: 404 })
    }
    return Response.json({ data: row })
  } catch (error) {
    return Response.json({ error: 'Failed to delete FMEA entry' }, { status: 500 })
  }
}
