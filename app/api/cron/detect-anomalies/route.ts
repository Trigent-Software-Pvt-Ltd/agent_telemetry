import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { agents, agentMetricsDaily, anomalies } from '@/lib/db/schema'
import { eq, gte, and, desc, sql } from 'drizzle-orm'

function validateCronSecret(request: Request): boolean {
  const secret = request.headers.get('x-cron-secret')
  return secret === process.env.CRON_SECRET
}

function mean(values: number[]): number {
  return values.reduce((s, v) => s + v, 0) / values.length
}

function stddev(values: number[], avg: number): number {
  const variance = values.reduce((s, v) => s + (v - avg) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

export async function GET(request: Request) {
  if (!validateCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const todayStr = now.toISOString().slice(0, 10)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const allAgents = await db.select().from(agents)
    let anomaliesInserted = 0

    for (const agent of allAgents) {
      // Get last 30 days of metrics
      const metrics = await db
        .select()
        .from(agentMetricsDaily)
        .where(
          and(
            eq(agentMetricsDaily.agentId, agent.id),
            gte(agentMetricsDaily.date, thirtyDaysAgo.toISOString().slice(0, 10))
          )
        )
        .orderBy(desc(agentMetricsDaily.date))

      if (metrics.length < 8) continue // Need at least 7 days history + today

      const today = metrics.find((m) => m.date === todayStr)
      if (!today) continue

      // Use all days except today as the rolling window
      const history = metrics.filter((m) => m.date !== todayStr).slice(0, 7)
      if (history.length < 7) continue

      // Get the org for this agent's process
      const processRow = await db
        .select({ orgId: sql<string>`org_id` })
        .from(sql`processes`)
        .where(eq(sql`id`, agent.processId))
        .limit(1)
      const orgId = processRow[0]?.orgId
      if (!orgId) continue

      // Check sigma_score
      const sigmaValues = history.map((m) => Number(m.sigmaScore))
      const sigmaMean = mean(sigmaValues)
      const sigmaStd = stddev(sigmaValues, sigmaMean)
      const todaySigma = Number(today.sigmaScore)

      if (sigmaStd > 0) {
        const sigmaDeviation = Math.abs(todaySigma - sigmaMean) / sigmaStd
        if (sigmaDeviation > 3) {
          await db.insert(anomalies).values({
            orgId,
            agentId: agent.id,
            severity: 'Critical',
            category: 'Sigma',
            description: `Sigma score ${todaySigma.toFixed(2)} deviates ${sigmaDeviation.toFixed(1)} stddev from 7-day mean ${sigmaMean.toFixed(2)} for agent ${agent.name}`,
            metadata: { sigmaDeviation, todaySigma, sigmaMean, sigmaStd },
          })
          anomaliesInserted++
        } else if (sigmaDeviation > 2) {
          await db.insert(anomalies).values({
            orgId,
            agentId: agent.id,
            severity: 'Warning',
            category: 'Sigma',
            description: `Sigma score ${todaySigma.toFixed(2)} deviates ${sigmaDeviation.toFixed(1)} stddev from 7-day mean ${sigmaMean.toFixed(2)} for agent ${agent.name}`,
            metadata: { sigmaDeviation, todaySigma, sigmaMean, sigmaStd },
          })
          anomaliesInserted++
        }
      }

      // Check total_cost
      const costValues = history.map((m) => Number(m.totalCost))
      const costMean = mean(costValues)
      const costStd = stddev(costValues, costMean)
      const todayCost = Number(today.totalCost)

      if (costStd > 0) {
        const costDeviation = Math.abs(todayCost - costMean) / costStd
        if (costDeviation > 3) {
          await db.insert(anomalies).values({
            orgId,
            agentId: agent.id,
            severity: 'Critical',
            category: 'Cost',
            description: `Total cost $${todayCost.toFixed(4)} deviates ${costDeviation.toFixed(1)} stddev from 7-day mean $${costMean.toFixed(4)} for agent ${agent.name}`,
            metadata: { costDeviation, todayCost, costMean, costStd },
          })
          anomaliesInserted++
        } else if (costDeviation > 2) {
          await db.insert(anomalies).values({
            orgId,
            agentId: agent.id,
            severity: 'Warning',
            category: 'Cost',
            description: `Total cost $${todayCost.toFixed(4)} deviates ${costDeviation.toFixed(1)} stddev from 7-day mean $${costMean.toFixed(4)} for agent ${agent.name}`,
            metadata: { costDeviation, todayCost, costMean, costStd },
          })
          anomaliesInserted++
        }
      }
    }

    return NextResponse.json({ ok: true, anomaliesInserted })
  } catch (err) {
    console.error('[cron/detect-anomalies] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
