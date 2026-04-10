import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { agentBudgets, agents, runs, anomalies } from '@/lib/db/schema'
import { eq, and, gte, sql } from 'drizzle-orm'

function validateCronSecret(request: Request): boolean {
  const secret = request.headers.get('x-cron-secret')
  return secret === process.env.CRON_SECRET
}

export async function GET(request: Request) {
  if (!validateCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    // Start of current month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get all agent budgets with agent info
    const budgets = await db
      .select({
        budgetId: agentBudgets.id,
        agentId: agentBudgets.agentId,
        monthlyCap: agentBudgets.monthlyCap,
        alertThreshold: agentBudgets.alertThreshold,
        agentName: agents.name,
        processId: agents.processId,
      })
      .from(agentBudgets)
      .innerJoin(agents, eq(agents.id, agentBudgets.agentId))

    let alertsInserted = 0

    for (const budget of budgets) {
      // Compute month-to-date spend
      const spendRows = await db
        .select({
          total: sql<string>`COALESCE(SUM(${runs.totalCost}), 0)`,
        })
        .from(runs)
        .where(
          and(
            eq(runs.agentId, budget.agentId),
            gte(runs.timestamp, monthStart)
          )
        )

      const mtdSpend = Number(spendRows[0]?.total) || 0
      const cap = Number(budget.monthlyCap)
      const thresholdPct = budget.alertThreshold

      if (cap > 0 && mtdSpend > (cap * thresholdPct) / 100) {
        // Get org ID for this agent's process
        const processRow = await db
          .select({ orgId: sql<string>`org_id` })
          .from(sql`processes`)
          .where(eq(sql`id`, budget.processId))
          .limit(1)

        const orgId = processRow[0]?.orgId
        if (!orgId) continue

        const usagePct = ((mtdSpend / cap) * 100).toFixed(1)
        const severity = mtdSpend > cap ? 'Critical' : 'Warning'

        await db.insert(anomalies).values({
          orgId,
          agentId: budget.agentId,
          severity,
          category: 'Budget',
          description: `Agent ${budget.agentName} has spent $${mtdSpend.toFixed(2)} of $${cap.toFixed(2)} monthly budget (${usagePct}%, threshold: ${thresholdPct}%)`,
          metadata: { mtdSpend, monthlyCap: cap, thresholdPct, usagePct },
        })

        alertsInserted++
      }
    }

    return NextResponse.json({ ok: true, budgetAlerts: alertsInserted })
  } catch (err) {
    console.error('[cron/check-budgets] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
