import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { onetTasks, processes } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const orgId = request.nextUrl.searchParams.get('org_id')
    if (!orgId) {
      return Response.json({ error: 'org_id is required' }, { status: 400 })
    }

    const [process] = await db
      .select()
      .from(processes)
      .where(and(eq(processes.orgId, orgId), eq(processes.slug, slug)))

    if (!process) {
      return Response.json({ error: 'Process not found' }, { status: 404 })
    }

    const data = await db
      .select()
      .from(onetTasks)
      .where(eq(onetTasks.processId, process.id))

    return Response.json({ data })
  } catch (error) {
    return Response.json({ error: 'Failed to fetch coverage map' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()
    const { org_id, assignments } = body

    if (!org_id || !Array.isArray(assignments)) {
      return Response.json({ error: 'org_id and assignments array are required' }, { status: 400 })
    }

    const [process] = await db
      .select()
      .from(processes)
      .where(and(eq(processes.orgId, org_id), eq(processes.slug, slug)))

    if (!process) {
      return Response.json({ error: 'Process not found' }, { status: 404 })
    }

    const results = []
    for (const assignment of assignments) {
      const { task_id, ownership, agent_id, confidence } = assignment
      const [row] = await db
        .update(onetTasks)
        .set({
          ownership: ownership ?? 'human',
          agentId: agent_id ?? null,
          confidence: confidence ?? 'medium',
        })
        .where(and(eq(onetTasks.id, task_id), eq(onetTasks.processId, process.id)))
        .returning()
      if (row) results.push(row)
    }

    return Response.json({ data: results })
  } catch (error) {
    return Response.json({ error: 'Failed to update task assignments' }, { status: 500 })
  }
}
