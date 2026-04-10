import { eq, and, desc, gte, sql, count } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  agents,
  processes,
  runs,
} from '@/lib/db/schema'

// ─── Local Types ────────────────────────────────────────────────

export interface AgentStatus {
  agentId: string
  agentName: string
  status: 'active' | 'warning' | 'error' | 'paused'
  lastRun: string
  successRate24h: number
  model: string
  processName: string
}

export interface LiveEvent {
  id: string
  timestamp: string
  type: 'success' | 'failure' | 'warning' | 'info'
  agent: string
  message: string
  durationMs: number
  cost: number
}

// ─── Helpers ────────────────────────────────────────────────────

function toNumber(val: string | number | null | undefined, fallback = 0): number {
  if (val == null) return fallback
  const n = typeof val === 'string' ? parseFloat(val) : val
  return Number.isFinite(n) ? n : fallback
}

// ─── 1. getSystemHealth ────────────────────────────────────────

export async function getSystemHealth(
  orgId: string
): Promise<{ status: 'operational' | 'degraded' | 'down'; label: string }> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

  // For each agent belonging to this org, compute failure rate in the last hour
  const agentRows = await db
    .select({ id: agents.id })
    .from(agents)
    .innerJoin(processes, eq(agents.processId, processes.id))
    .where(eq(processes.orgId, orgId))

  if (agentRows.length === 0) {
    return { status: 'operational', label: 'No agents configured' }
  }

  const agentIds = agentRows.map((a) => a.id)

  // Get per-agent success/fail counts in the last hour
  const statsRows = await db
    .select({
      agentId: runs.agentId,
      total: count(runs.id).as('total'),
      failures: count(
        sql`CASE WHEN ${runs.outcome} = false THEN 1 END`
      ).as('failures'),
    })
    .from(runs)
    .where(
      and(
        sql`${runs.agentId} = ANY(${agentIds})`,
        gte(runs.timestamp, oneHourAgo)
      )
    )
    .groupBy(runs.agentId)

  if (statsRows.length === 0) {
    // No runs in the last hour — treat as operational (idle)
    return { status: 'operational', label: 'All Systems Operational' }
  }

  let degradedCount = 0
  let totalAgentsWithRuns = statsRows.length

  for (const row of statsRows) {
    const total = toNumber(row.total, 0)
    const failures = toNumber(row.failures, 0)
    if (total > 0 && failures / total > 0.5) {
      degradedCount++
    }
  }

  if (degradedCount === totalAgentsWithRuns) {
    return { status: 'down', label: 'All agents failing — system down' }
  }

  if (degradedCount > 0) {
    return {
      status: 'degraded',
      label: `${degradedCount} agent${degradedCount > 1 ? 's' : ''} degraded`,
    }
  }

  return { status: 'operational', label: 'All Systems Operational' }
}

// ─── 2. getAgentStatuses ───────────────────────────────────────

export async function getAgentStatuses(orgId: string): Promise<AgentStatus[]> {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  // Join agents → processes to filter by org, and get process name + agent info
  const agentRows = await db
    .select({
      agentId: agents.id,
      agentSlug: agents.slug,
      agentName: agents.name,
      agentModel: agents.model,
      agentStatus: agents.status,
      processName: processes.name,
    })
    .from(agents)
    .innerJoin(processes, eq(agents.processId, processes.id))
    .where(eq(processes.orgId, orgId))

  const results: AgentStatus[] = []

  for (const row of agentRows) {
    // Latest run for this agent
    const [latestRun] = await db
      .select({
        timestamp: runs.timestamp,
      })
      .from(runs)
      .where(eq(runs.agentId, row.agentId))
      .orderBy(desc(runs.timestamp))
      .limit(1)

    // 24h success rate
    const [stats] = await db
      .select({
        total: count(runs.id).as('total'),
        successes: count(
          sql`CASE WHEN ${runs.outcome} = true THEN 1 END`
        ).as('successes'),
      })
      .from(runs)
      .where(
        and(
          eq(runs.agentId, row.agentId),
          gte(runs.timestamp, twentyFourHoursAgo)
        )
      )

    const total = toNumber(stats?.total, 0)
    const successes = toNumber(stats?.successes, 0)
    const successRate24h = total > 0 ? successes / total : 1

    // Map to status
    let status: AgentStatus['status']
    if (row.agentStatus === 'paused') {
      status = 'paused'
    } else if (successRate24h < 0.5) {
      status = 'error'
    } else if (successRate24h < 0.8) {
      status = 'warning'
    } else {
      status = 'active'
    }

    results.push({
      agentId: row.agentSlug,
      agentName: row.agentName,
      status,
      lastRun: latestRun?.timestamp?.toISOString() ?? new Date().toISOString(),
      successRate24h: +successRate24h.toFixed(4),
      model: row.agentModel,
      processName: row.processName,
    })
  }

  return results
}

// ─── 3. getLiveEvents ──────────────────────────────────────────

export async function getLiveEvents(
  orgId: string,
  count = 25
): Promise<LiveEvent[]> {
  // Get latest `count` runs across all agents for this org
  const rows = await db
    .select({
      runId: runs.runId,
      timestamp: runs.timestamp,
      outcome: runs.outcome,
      durationMs: runs.durationMs,
      totalCost: runs.totalCost,
      agentName: agents.name,
    })
    .from(runs)
    .innerJoin(agents, eq(runs.agentId, agents.id))
    .innerJoin(processes, eq(agents.processId, processes.id))
    .where(eq(processes.orgId, orgId))
    .orderBy(desc(runs.timestamp))
    .limit(count)

  return rows.map((row) => {
    const cost = toNumber(row.totalCost)
    const durationMs = row.durationMs
    const isSuccess = row.outcome === true

    let type: LiveEvent['type']
    let message: string

    if (!isSuccess) {
      type = 'failure'
      message = `${row.agentName} run failed after ${durationMs}ms`
    } else if (durationMs > 5000) {
      type = 'warning'
      message = `${row.agentName} completed slowly (${durationMs}ms)`
    } else {
      type = 'success'
      message = `${row.agentName} completed in ${durationMs}ms ($${cost.toFixed(4)})`
    }

    return {
      id: row.runId,
      timestamp: row.timestamp.toISOString(),
      type,
      agent: row.agentName,
      message,
      durationMs,
      cost,
    }
  })
}
