import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { governanceRules } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const orgId = request.nextUrl.searchParams.get('org_id')
    if (!orgId) {
      return Response.json({ error: 'org_id is required' }, { status: 400 })
    }
    const data = await db
      .select()
      .from(governanceRules)
      .where(eq(governanceRules.orgId, orgId))
    return Response.json({ data })
  } catch (error) {
    return Response.json({ error: 'Failed to fetch governance rules' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { org_id, name, condition, enforcement, active, geography } = body
    if (!org_id || !name || !condition) {
      return Response.json({ error: 'org_id, name, and condition are required' }, { status: 400 })
    }
    const [row] = await db
      .insert(governanceRules)
      .values({
        orgId: org_id,
        name,
        condition,
        enforcement: enforcement ?? 'Warn',
        active: active ?? true,
        geography: geography ?? 'Global',
      })
      .returning()
    return Response.json({ data: row }, { status: 201 })
  } catch (error) {
    return Response.json({ error: 'Failed to create governance rule' }, { status: 500 })
  }
}
