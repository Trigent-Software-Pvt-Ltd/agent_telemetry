import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { agents, runs, agentMetricsDaily } from '@/lib/db/schema'
import { eq, gte, and, sql } from 'drizzle-orm'

function validateCronSecret(request: Request): boolean {
  const secret = request.headers.get('x-cron-secret')
  return secret === process.env.CRON_SECRET
}

function dpmoToSigma(dpmo: number): number {
  if (dpmo <= 3.4) return 6
  if (dpmo <= 233) return 5
  if (dpmo <= 6210) return 4
  if (dpmo <= 66807) return 3
  if (dpmo <= 308538) return 2
  return 1
}

export async function GET(request: Request) {
  if (!validateCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const todayStr = now.toISOString().slice(0, 10)
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Find agents with runs in the last 24 hours
    const activeAgents = await db
      .selectDistinct({ agentId: runs.agentId })
      .from(runs)
      .where(gte(runs.timestamp, twentyFourHoursAgo))

    let processed = 0

    for (const { agentId } of activeAgents) {
      // Query trailing 30-day window
      const agentRuns = await db
        .select({
          durationMs: runs.durationMs,
          outcome: runs.outcome,
          totalCost: runs.totalCost,
          tokenCount: runs.tokenCount,
        })
        .from(runs)
        .where(
          and(
            eq(runs.agentId, agentId),
            gte(runs.timestamp, thirtyDaysAgo)
          )
        )

      if (agentRuns.length === 0) continue

      const totalRuns = agentRuns.length
      const successfulRuns = agentRuns.filter((r) => r.outcome).length
      const failedRuns = totalRuns - successfulRuns
      const latencyBreaches = agentRuns.filter((r) => r.durationMs > 5000).length
      const costOverruns = agentRuns.filter((r) => Number(r.totalCost) > 0.10).length

      const defects = failedRuns + latencyBreaches + costOverruns
      const opportunities = totalRuns * 3
      const dpmo = opportunities > 0
        ? Math.round((defects / opportunities) * 1_000_000)
        : 1_000_000
      const sigmaScore = dpmoToSigma(dpmo)

      // Compute duration stats
      const durations = agentRuns.map((r) => r.durationMs).sort((a, b) => a - b)
      const avgDurationMs = durations.reduce((s, d) => s + d, 0) / durations.length
      const p95Index = Math.ceil(durations.length * 0.95) - 1
      const p95DurationMs = durations[Math.max(0, p95Index)]

      const totalCost = agentRuns.reduce((s, r) => s + Number(r.totalCost), 0)
      const totalTokens = agentRuns.reduce((s, r) => s + r.tokenCount, 0)

      // UPSERT into agent_metrics_daily
      await db
        .insert(agentMetricsDaily)
        .values({
          agentId,
          date: todayStr,
          totalRuns,
          successfulRuns,
          failedRuns,
          latencyBreaches,
          costOverruns,
          totalCost: totalCost.toFixed(6),
          totalTokens,
          avgDurationMs: avgDurationMs.toFixed(2),
          p95DurationMs,
          sigmaScore: sigmaScore.toFixed(2),
          dpmo,
        })
        .onConflictDoUpdate({
          target: [agentMetricsDaily.agentId, agentMetricsDaily.date],
          set: {
            totalRuns,
            successfulRuns,
            failedRuns,
            latencyBreaches,
            costOverruns,
            totalCost: totalCost.toFixed(6),
            totalTokens,
            avgDurationMs: avgDurationMs.toFixed(2),
            p95DurationMs,
            sigmaScore: sigmaScore.toFixed(2),
            dpmo,
          },
        })

      processed++
    }

    return NextResponse.json({ ok: true, agentsProcessed: processed })
  } catch (err) {
    console.error('[cron/compute-metrics] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
