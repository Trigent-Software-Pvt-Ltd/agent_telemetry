import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  organisations,
  governanceRules,
  agents,
  agentMetricsDaily,
} from '@/lib/db/schema'
import { eq, and, inArray, sql } from 'drizzle-orm'

function validateCronSecret(request: Request): boolean {
  const secret = request.headers.get('x-cron-secret')
  return secret === process.env.CRON_SECRET
}

/**
 * Parse a governance rule condition string and evaluate it.
 * Supported conditions:
 *   "sigma < 3.5"
 *   "sigma < 4.0"
 *   "cost > 100"
 *   "failure_rate > 0.05"
 */
function evaluateCondition(
  condition: string,
  metrics: {
    sigmaScore: number
    totalCost: number
    failureRate: number
    latencyBreaches: number
  }
): boolean {
  const normalized = condition.trim().toLowerCase()

  // sigma < X
  const sigmaMatch = normalized.match(/^sigma\s*(<|>|<=|>=)\s*([\d.]+)$/)
  if (sigmaMatch) {
    const [, op, val] = sigmaMatch
    return compare(metrics.sigmaScore, op, Number(val))
  }

  // cost > X
  const costMatch = normalized.match(/^cost\s*(<|>|<=|>=)\s*([\d.]+)$/)
  if (costMatch) {
    const [, op, val] = costMatch
    return compare(metrics.totalCost, op, Number(val))
  }

  // failure_rate > X
  const failureMatch = normalized.match(/^failure_rate\s*(<|>|<=|>=)\s*([\d.]+)$/)
  if (failureMatch) {
    const [, op, val] = failureMatch
    return compare(metrics.failureRate, op, Number(val))
  }

  // latency_breaches > X
  const latencyMatch = normalized.match(/^latency_breaches\s*(<|>|<=|>=)\s*([\d.]+)$/)
  if (latencyMatch) {
    const [, op, val] = latencyMatch
    return compare(metrics.latencyBreaches, op, Number(val))
  }

  return false
}

function compare(actual: number, op: string, threshold: number): boolean {
  switch (op) {
    case '<':  return actual < threshold
    case '>':  return actual > threshold
    case '<=': return actual <= threshold
    case '>=': return actual >= threshold
    default:   return false
  }
}

export async function GET(request: Request) {
  if (!validateCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const todayStr = new Date().toISOString().slice(0, 10)
    const allOrgs = await db.select().from(organisations)
    let totalViolations = 0

    for (const org of allOrgs) {
      // Get active governance rules
      const rules = await db
        .select()
        .from(governanceRules)
        .where(
          and(
            eq(governanceRules.orgId, org.id),
            eq(governanceRules.active, true)
          )
        )

      if (rules.length === 0) continue

      // Get all agents for this org
      const orgAgents = await db
        .select({ id: agents.id, name: agents.name })
        .from(agents)
        .innerJoin(
          sql`processes`,
          sql`processes.id = ${agents.processId} AND processes.org_id = ${org.id}`
        )

      if (orgAgents.length === 0) continue

      const agentIds = orgAgents.map((a) => a.id)

      // Get today's metrics for these agents
      const todayMetrics = await db
        .select()
        .from(agentMetricsDaily)
        .where(
          and(
            inArray(agentMetricsDaily.agentId, agentIds),
            eq(agentMetricsDaily.date, todayStr)
          )
        )

      // Map agent ID to name for logging
      const agentNameMap = new Map(orgAgents.map((a) => [a.id, a.name]))

      // Evaluate each rule against each agent's metrics
      for (const rule of rules) {
        for (const metric of todayMetrics) {
          const failureRate =
            metric.totalRuns > 0
              ? metric.failedRuns / metric.totalRuns
              : 0

          const violated = evaluateCondition(rule.condition, {
            sigmaScore: Number(metric.sigmaScore),
            totalCost: Number(metric.totalCost),
            failureRate,
            latencyBreaches: metric.latencyBreaches,
          })

          if (violated) {
            const agentName = agentNameMap.get(metric.agentId) ?? metric.agentId
            console.log(
              `[check-governance] VIOLATION: Org=${org.name}, Rule="${rule.name}" (${rule.condition}), ` +
              `Agent=${agentName}, Enforcement=${rule.enforcement}, ` +
              `Sigma=${metric.sigmaScore}, Cost=${metric.totalCost}`
            )
            totalViolations++
          }
        }
      }
    }

    return NextResponse.json({ ok: true, violations: totalViolations })
  } catch (err) {
    console.error('[cron/check-governance] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
