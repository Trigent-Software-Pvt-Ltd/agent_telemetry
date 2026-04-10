import { eq, and, desc, gte, sql, avg } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  agents,
  processes,
  agentMetricsDaily,
  organisations,
} from '@/lib/db/schema'
import type { SigmaTrendPoint } from '@/types/telemetry'

// ─── Local Types ────────────────────────────────────────────────

export interface SigmaHistoryEntry {
  month: string
  avgSigma: number
  agents: { name: string; sigma: number }[]
}

export interface LatencyTrendPoint {
  day: number
  date: string
  p95Ms: number
  avgMs: number
}

export type TimeRange = '30d' | '90d' | '6m'

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

/** Compute the start date for a given time range. */
function rangeStartDate(range: TimeRange): Date {
  const now = new Date()
  switch (range) {
    case '30d':
      now.setDate(now.getDate() - 30)
      return now
    case '90d':
      now.setDate(now.getDate() - 90)
      return now
    case '6m':
      now.setMonth(now.getMonth() - 6)
      return now
  }
}

// ─── 1. getSigmaTrendForAgent ───────────────────────────────────

export async function getSigmaTrendForAgent(
  agentSlug: string,
): Promise<SigmaTrendPoint[]> {
  return getSigmaTrendsForRange(agentSlug, '30d')
}

// ─── 2. getSigmaTrendsForRange ──────────────────────────────────

export async function getSigmaTrendsForRange(
  agentSlug: string,
  range: TimeRange,
): Promise<SigmaTrendPoint[]> {
  const agentId = await resolveAgentId(agentSlug)
  if (!agentId) return []

  const startDate = rangeStartDate(range)
  const startDateStr = startDate.toISOString().slice(0, 10)

  const rows = await db
    .select({
      date: agentMetricsDaily.date,
      sigmaScore: agentMetricsDaily.sigmaScore,
      dpmo: agentMetricsDaily.dpmo,
    })
    .from(agentMetricsDaily)
    .where(
      and(
        eq(agentMetricsDaily.agentId, agentId),
        gte(agentMetricsDaily.date, startDateStr),
      )
    )
    .orderBy(agentMetricsDaily.date)

  return rows.map((r, i) => ({
    day: i + 1,
    date: r.date,
    sigma: toNumber(r.sigmaScore, 3.0),
    dpmo: r.dpmo ?? 66807,
  }))
}

// ─── 3. getSigmaHistory ─────────────────────────────────────────

export async function getSigmaHistory(
  processSlug: string,
): Promise<SigmaHistoryEntry[]> {
  const processId = await resolveProcessId(processSlug)
  if (!processId) return []

  // Get all agents for this process
  const agentRows = await db
    .select({ id: agents.id, name: agents.name })
    .from(agents)
    .where(eq(agents.processId, processId))

  if (agentRows.length === 0) return []

  // Aggregate sigma by month for each agent (last 6 months)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const startDateStr = sixMonthsAgo.toISOString().slice(0, 10)

  // Build a map: month -> { agentName -> avgSigma }
  const monthMap = new Map<string, Map<string, number>>()

  for (const agent of agentRows) {
    const rows = await db
      .select({
        month: sql<string>`to_char(${agentMetricsDaily.date}::date, 'Mon YYYY')`.as('month_label'),
        monthSort: sql<string>`to_char(${agentMetricsDaily.date}::date, 'YYYY-MM')`.as('month_sort'),
        avgSigma: avg(agentMetricsDaily.sigmaScore).as('avg_sigma'),
      })
      .from(agentMetricsDaily)
      .where(
        and(
          eq(agentMetricsDaily.agentId, agent.id),
          gte(agentMetricsDaily.date, startDateStr),
        )
      )
      .groupBy(
        sql`to_char(${agentMetricsDaily.date}::date, 'Mon YYYY')`,
        sql`to_char(${agentMetricsDaily.date}::date, 'YYYY-MM')`,
      )
      .orderBy(sql`to_char(${agentMetricsDaily.date}::date, 'YYYY-MM')`)

    for (const row of rows) {
      const key = row.month
      if (!monthMap.has(key)) monthMap.set(key, new Map())
      monthMap.get(key)!.set(agent.name, toNumber(row.avgSigma, 3.0))
    }
  }

  // Convert to output format
  const result: SigmaHistoryEntry[] = []

  for (const [month, agentMap] of monthMap) {
    const agentsArr = Array.from(agentMap.entries()).map(([name, sigma]) => ({
      name,
      sigma: parseFloat(sigma.toFixed(1)),
    }))

    const avgSigma =
      agentsArr.length > 0
        ? parseFloat(
            (agentsArr.reduce((s, a) => s + a.sigma, 0) / agentsArr.length).toFixed(1)
          )
        : 0

    result.push({ month, avgSigma, agents: agentsArr })
  }

  return result
}

// ─── 4. getLatencyTrendsForRange ────────────────────────────────

export async function getLatencyTrendsForRange(
  agentSlug: string,
  range: TimeRange,
): Promise<LatencyTrendPoint[]> {
  const agentId = await resolveAgentId(agentSlug)
  if (!agentId) return []

  const startDate = rangeStartDate(range)
  const startDateStr = startDate.toISOString().slice(0, 10)

  const rows = await db
    .select({
      date: agentMetricsDaily.date,
      p95DurationMs: agentMetricsDaily.p95DurationMs,
      avgDurationMs: agentMetricsDaily.avgDurationMs,
    })
    .from(agentMetricsDaily)
    .where(
      and(
        eq(agentMetricsDaily.agentId, agentId),
        gte(agentMetricsDaily.date, startDateStr),
      )
    )
    .orderBy(agentMetricsDaily.date)

  return rows.map((r, i) => ({
    day: i + 1,
    date: r.date,
    p95Ms: r.p95DurationMs ?? 0,
    avgMs: toNumber(r.avgDurationMs),
  }))
}
