import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  processes,
  onetTasks,
  agents,
  runs,
  agentMetricsDaily,
  governanceRules,
  processMetricsDaily,
} from '@/lib/db/schema'
import { eq, and, gte, inArray, sql, avg } from 'drizzle-orm'

function validateCronSecret(request: Request): boolean {
  const secret = request.headers.get('x-cron-secret')
  return secret === process.env.CRON_SECRET
}

/** Lower sigma = more oversight hours per week */
function oversightHoursFromSigma(avgSigma: number): number {
  if (avgSigma >= 5) return 2
  if (avgSigma >= 4) return 5
  if (avgSigma >= 3) return 10
  if (avgSigma >= 2) return 20
  return 40
}

export async function GET(request: Request) {
  if (!validateCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const todayStr = now.toISOString().slice(0, 10)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const allProcesses = await db.select().from(processes)
    let processed = 0

    for (const proc of allProcesses) {
      // labor_pool = headcount * avg_hourly_wage * weekly_hours
      const laborPool =
        proc.headcount * Number(proc.avgHourlyWage) * Number(proc.weeklyHours)

      // agent_coverage = SUM(time_weight) WHERE ownership IN ('agent', 'collaborative')
      const coverageRows = await db
        .select({
          ownership: onetTasks.ownership,
          totalWeight: sql<string>`SUM(${onetTasks.timeWeight})`,
        })
        .from(onetTasks)
        .where(eq(onetTasks.processId, proc.id))
        .groupBy(onetTasks.ownership)

      let agentCoverage = 0
      let collaborativeCoverage = 0
      let humanCoverage = 0
      for (const row of coverageRows) {
        const w = Number(row.totalWeight) || 0
        if (row.ownership === 'agent') agentCoverage = w
        else if (row.ownership === 'collaborative') collaborativeCoverage = w
        else humanCoverage = w
      }

      const totalAgentCoverage = agentCoverage + collaborativeCoverage
      const grossSaving = laborPool * totalAgentCoverage

      // inference_cost = SUM(total_cost) from runs last 7 days for this process's agents
      const processAgents = await db
        .select({ id: agents.id })
        .from(agents)
        .where(eq(agents.processId, proc.id))

      const agentIds = processAgents.map((a) => a.id)
      let inferenceCost = 0

      if (agentIds.length > 0) {
        const costRows = await db
          .select({
            total: sql<string>`COALESCE(SUM(${runs.totalCost}), 0)`,
          })
          .from(runs)
          .where(
            and(
              inArray(runs.agentId, agentIds),
              gte(runs.timestamp, sevenDaysAgo)
            )
          )
        inferenceCost = Number(costRows[0]?.total) || 0
      }

      // oversight_cost based on avg sigma
      let avgSigma = 3
      if (agentIds.length > 0) {
        const sigmaRows = await db
          .select({
            avgSigma: sql<string>`COALESCE(AVG(${agentMetricsDaily.sigmaScore}), 3)`,
          })
          .from(agentMetricsDaily)
          .where(
            and(
              inArray(agentMetricsDaily.agentId, agentIds),
              eq(agentMetricsDaily.date, todayStr)
            )
          )
        avgSigma = Number(sigmaRows[0]?.avgSigma) || 3
      }

      const oversightHours = oversightHoursFromSigma(avgSigma)
      // Assume oversight hourly cost = avg_hourly_wage * 1.5 (senior rate)
      const oversightCost = oversightHours * Number(proc.avgHourlyWage) * 1.5

      // governance_cost = 0.02 * gross_saving * active_rule_count
      const ruleCountRows = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(governanceRules)
        .where(
          and(
            eq(governanceRules.orgId, proc.orgId),
            eq(governanceRules.active, true)
          )
        )
      const activeRuleCount = Number(ruleCountRows[0]?.count) || 0
      const governanceCost = 0.02 * grossSaving * activeRuleCount

      const netRoi = grossSaving - inferenceCost - oversightCost - governanceCost

      // UPSERT into process_metrics_daily
      await db
        .insert(processMetricsDaily)
        .values({
          processId: proc.id,
          date: todayStr,
          agentCoverage: agentCoverage.toFixed(4),
          collaborativeCoverage: collaborativeCoverage.toFixed(4),
          humanCoverage: humanCoverage.toFixed(4),
          grossSavingWeekly: grossSaving.toFixed(2),
          netRoiWeekly: netRoi.toFixed(2),
          oversightCostWeekly: oversightCost.toFixed(2),
          inferenceCostWeekly: inferenceCost.toFixed(6),
          governanceCostWeekly: governanceCost.toFixed(2),
        })
        .onConflictDoUpdate({
          target: [processMetricsDaily.processId, processMetricsDaily.date],
          set: {
            agentCoverage: agentCoverage.toFixed(4),
            collaborativeCoverage: collaborativeCoverage.toFixed(4),
            humanCoverage: humanCoverage.toFixed(4),
            grossSavingWeekly: grossSaving.toFixed(2),
            netRoiWeekly: netRoi.toFixed(2),
            oversightCostWeekly: oversightCost.toFixed(2),
            inferenceCostWeekly: inferenceCost.toFixed(6),
            governanceCostWeekly: governanceCost.toFixed(2),
          },
        })

      processed++
    }

    return NextResponse.json({ ok: true, processesComputed: processed })
  } catch (err) {
    console.error('[cron/compute-process-roi] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
