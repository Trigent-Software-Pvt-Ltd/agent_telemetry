import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { agentBudgets, agents, agentMetricsDaily } from '@/lib/db/schema'
import { eq, and, gte, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const orgId = request.nextUrl.searchParams.get('org_id')
    if (!orgId) {
      return Response.json({ error: 'org_id is required' }, { status: 400 })
    }

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const data = await db
      .select({
        id: agentBudgets.id,
        agentId: agentBudgets.agentId,
        agentName: agents.name,
        monthlyCap: agentBudgets.monthlyCap,
        alertThreshold: agentBudgets.alertThreshold,
        currentSpend: sql<string>`coalesce(sum(${agentMetricsDaily.totalCost}), 0)`,
        updatedAt: agentBudgets.updatedAt,
      })
      .from(agentBudgets)
      .innerJoin(agents, eq(agentBudgets.agentId, agents.id))
      .leftJoin(
        agentMetricsDaily,
        and(
          eq(agentMetricsDaily.agentId, agentBudgets.agentId),
          gte(agentMetricsDaily.date, startOfMonth.toISOString().slice(0, 10))
        )
      )
      .where(eq(agents.processId, sql`(select id from processes where org_id = ${orgId} limit 1)`))
      .groupBy(agentBudgets.id, agents.name)

    return Response.json({ data })
  } catch (error) {
    return Response.json({ error: 'Failed to fetch budgets' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { agent_id, monthly_cap, alert_threshold } = body
    if (!agent_id || monthly_cap == null) {
      return Response.json({ error: 'agent_id and monthly_cap are required' }, { status: 400 })
    }

    const [row] = await db
      .insert(agentBudgets)
      .values({
        agentId: agent_id,
        monthlyCap: monthly_cap,
        alertThreshold: alert_threshold ?? 80,
      })
      .onConflictDoUpdate({
        target: agentBudgets.agentId,
        set: {
          monthlyCap: monthly_cap,
          alertThreshold: alert_threshold ?? 80,
          updatedAt: new Date(),
        },
      })
      .returning()

    return Response.json({ data: row })
  } catch (error) {
    return Response.json({ error: 'Failed to update budget' }, { status: 500 })
  }
}
