import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { organisations } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const orgId = request.nextUrl.searchParams.get('org_id')
    if (!orgId) {
      return Response.json({ error: 'org_id is required' }, { status: 400 })
    }
    const [row] = await db
      .select({
        id: organisations.id,
        brandingConfig: organisations.brandingConfig,
      })
      .from(organisations)
      .where(eq(organisations.id, orgId))
    if (!row) {
      return Response.json({ error: 'Organisation not found' }, { status: 404 })
    }
    return Response.json({ data: row.brandingConfig })
  } catch (error) {
    return Response.json({ error: 'Failed to fetch branding config' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { org_id, branding_config } = body
    if (!org_id || !branding_config) {
      return Response.json({ error: 'org_id and branding_config are required' }, { status: 400 })
    }
    const [row] = await db
      .update(organisations)
      .set({ brandingConfig: branding_config, updatedAt: new Date() })
      .where(eq(organisations.id, org_id))
      .returning()
    if (!row) {
      return Response.json({ error: 'Organisation not found' }, { status: 404 })
    }
    return Response.json({ data: row.brandingConfig })
  } catch (error) {
    return Response.json({ error: 'Failed to update branding config' }, { status: 500 })
  }
}
