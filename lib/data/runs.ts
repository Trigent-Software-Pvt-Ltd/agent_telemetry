import { eq, and, desc, gte, sql, sum, count } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  agents,
  processes,
  runs,
  onetTasks,
  processMetricsDaily,
} from '@/lib/db/schema'
import type {
  Run,
  Span,
  AgentRoi,
  MonthlyCost,
} from '@/types/telemetry'

// ─── Helpers ────────────────────────────────────────────────────

function toNumber(val: string | number | null | undefined, fallback = 0): number {
  if (val == null) return fallback
  const n = typeof val === 'string' ? parseFloat(val) : val
  return Number.isFinite(n) ? n : fallback
}

/** Resolve an agent's UUID from its slug. */
async function resolveAgentId(agentSlug: string): Promise<string | undefined> {
  const [row] = await db
    .select({ id: agents.id })
    .from(agents)
    .where(eq(agents.slug, agentSlug))
    .limit(1)
  return row?.id
}

/** Resolve a process UUID from its slug. */
async function resolveProcessId(processSlug: string): Promise<string | undefined> {
  const [row] = await db
    .select({ id: processes.id })
    .from(processes)
    .where(eq(processes.slug, processSlug))
    .limit(1)
  return row?.id
}

// ─── 1. getRunsForAgent ─────────────────────────────────────────

export async function getRunsForAgent(agentSlug: string): Promise<Run[]> {
  const agentId = await resolveAgentId(agentSlug)
  if (!agentId) return []

  const rows = await db
    .select()
    .from(runs)
    .where(eq(runs.agentId, agentId))
    .orderBy(desc(runs.timestamp))
    .limit(50)

  return rows.map((r) => ({
    runId: r.runId,
    agentId: agentSlug,
    timestamp: r.timestamp.toISOString(),
    durationMs: r.durationMs,
    outcome: r.outcome,
    totalCost: toNumber(r.totalCost),
    tokenCount: r.tokenCount,
    toolCalls: r.toolCalls,
    spans: Array.isArray(r.spans) ? (r.spans as Span[]) : [],
  }))
}

// ─── 2. getAgentRoi ─────────────────────────────────────────────

export async function getAgentRoi(agentSlug: string): Promise<AgentRoi | undefined> {
  // Resolve agent row
  const [agent] = await db
    .select()
    .from(agents)
    .where(eq(agents.slug, agentSlug))
    .limit(1)

  if (!agent) return undefined

  // Get the process slug for downstream lookups
  const [proc] = await db
    .select({ slug: processes.slug })
    .from(processes)
    .where(eq(processes.id, agent.processId))
    .limit(1)

  if (!proc) return undefined

  // Latest process metrics for ROI envelope
  const [latestMetrics] = await db
    .select()
    .from(processMetricsDaily)
    .where(eq(processMetricsDaily.processId, agent.processId))
    .orderBy(desc(processMetricsDaily.date))
    .limit(1)

  if (!latestMetrics) return undefined

  const grossSavingTotal = toNumber(latestMetrics.grossSavingWeekly)
  const oversightTotal = toNumber(latestMetrics.oversightCostWeekly)
  const governanceTotal = toNumber(latestMetrics.governanceCostWeekly)

  // All tasks for this process
  const processTasks = await db
    .select({
      timeWeight: onetTasks.timeWeight,
      ownership: onetTasks.ownership,
      agentId: onetTasks.agentId,
    })
    .from(onetTasks)
    .where(eq(onetTasks.processId, agent.processId))

  // Total time weight for agent-owned tasks
  const totalAgentTimeWeight = processTasks
    .filter((t) => t.ownership === 'agent')
    .reduce((s, t) => s + toNumber(t.timeWeight), 0)

  // This agent's task weight
  const agentTaskWeight = processTasks
    .filter((t) => t.agentId === agent.id)
    .reduce((s, t) => s + toNumber(t.timeWeight), 0)

  // Share among all agent-owned tasks
  const share = totalAgentTimeWeight > 0 ? agentTaskWeight / totalAgentTimeWeight : 0

  // Gross saving proportional to share
  const grossSavingWeekly = Math.round(grossSavingTotal * share)

  // Inference cost from actual run history (last 30 days -> scale to weekly)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [runCostAgg] = await db
    .select({
      totalCost: sum(runs.totalCost).as('total_cost'),
    })
    .from(runs)
    .where(
      and(
        eq(runs.agentId, agent.id),
        gte(runs.timestamp, thirtyDaysAgo),
      )
    )

  const totalRunCost = toNumber(runCostAgg?.totalCost)
  // Scale 30 days of costs to weekly
  const inferenceCostWeekly = Math.round((totalRunCost / 30) * 7 * 100) / 100

  // Oversight and governance proportional to share
  const oversightCostWeekly = Math.round(oversightTotal * share)
  const governanceCostWeekly = Math.round(governanceTotal * share)

  const netRoiWeekly = Math.round(
    grossSavingWeekly - inferenceCostWeekly - oversightCostWeekly - governanceCostWeekly
  )

  return {
    agentId: agentSlug,
    agentName: agent.name,
    taskTimeWeightPct: Math.round(agentTaskWeight * 100),
    grossSavingWeekly,
    inferenceCostWeekly,
    oversightCostWeekly,
    governanceCostWeekly,
    netRoiWeekly,
  }
}

// ─── 3. getAgentRoisForProcess ──────────────────────────────────

export async function getAgentRoisForProcess(processSlug: string): Promise<AgentRoi[]> {
  const processId = await resolveProcessId(processSlug)
  if (!processId) return []

  const agentRows = await db
    .select({ slug: agents.slug })
    .from(agents)
    .where(eq(agents.processId, processId))

  const results: AgentRoi[] = []

  for (const row of agentRows) {
    const roi = await getAgentRoi(row.slug)
    if (roi) results.push(roi)
  }

  return results
}

// ─── 4. getMonthlyCosts ─────────────────────────────────────────

export async function getMonthlyCosts(processSlug?: string): Promise<MonthlyCost[]> {
  // Last 6 months boundary
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  sixMonthsAgo.setDate(1)
  sixMonthsAgo.setHours(0, 0, 0, 0)

  // Build base conditions
  const conditions = [gte(runs.timestamp, sixMonthsAgo)]

  // If scoped to a process, restrict to that process's agents
  let agentIdSet: Set<string> | null = null
  if (processSlug) {
    const processId = await resolveProcessId(processSlug)
    if (!processId) return []

    const agentRows = await db
      .select({ id: agents.id })
      .from(agents)
      .where(eq(agents.processId, processId))

    agentIdSet = new Set(agentRows.map((a) => a.id))
  }

  // Aggregate runs grouped by month and agent
  const rows = await db
    .select({
      monthLabel: sql<string>`to_char(${runs.timestamp}, 'Mon YYYY')`.as('month_label'),
      monthSort: sql<string>`to_char(${runs.timestamp}, 'YYYY-MM')`.as('month_sort'),
      agentId: runs.agentId,
      totalCost: sum(runs.totalCost).as('total_cost'),
      totalRuns: count(runs.id).as('total_runs'),
      successfulRuns: sum(
        sql<number>`CASE WHEN ${runs.outcome} = true THEN 1 ELSE 0 END`
      ).as('successful_runs'),
    })
    .from(runs)
    .where(and(...conditions))
    .groupBy(
      sql`to_char(${runs.timestamp}, 'Mon YYYY')`,
      sql`to_char(${runs.timestamp}, 'YYYY-MM')`,
      runs.agentId,
    )
    .orderBy(sql`to_char(${runs.timestamp}, 'YYYY-MM')`)

  // Filter by process agents if needed and resolve agent names
  const agentNameCache = new Map<string, string>()

  const results: MonthlyCost[] = []

  for (const row of rows) {
    // Filter by process scope
    if (agentIdSet && !agentIdSet.has(row.agentId)) continue

    // Resolve agent name (with cache)
    let agentName = agentNameCache.get(row.agentId)
    if (!agentName) {
      const [agentRow] = await db
        .select({ name: agents.name })
        .from(agents)
        .where(eq(agents.id, row.agentId))
        .limit(1)
      agentName = agentRow?.name ?? 'Unknown'
      agentNameCache.set(row.agentId, agentName)
    }

    results.push({
      month: row.monthLabel,
      agentId: row.agentId,
      agentName,
      inferenceCost: toNumber(row.totalCost),
      runs: Number(row.totalRuns),
      successfulRuns: toNumber(row.successfulRuns),
    })
  }

  return results
}
