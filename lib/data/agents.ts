import { db } from '@/lib/db'
import {
  agents, agentVersions, agentMetricsDaily, agentBudgets,
  onetTasks, processes, runs, stagingCandidates,
} from '@/lib/db/schema'
import { eq, and, desc, gte, sql, sum } from 'drizzle-orm'
import type {
  Agent, AgentProfile, AgentVersion, DecommissionImpact,
  StagingCandidate, AgentAvailability, AgentTask,
  AgentOversightEfficiency,
} from '@/types/telemetry'

// ─── Local interfaces (not in telemetry.ts) ──────────────────

export interface AgentBudget {
  agentId: string
  agentName: string
  monthlyCap: number
  alertThreshold: number
  currentSpend: number
  utilizationPct: number
  trend: 'up' | 'down' | 'flat'
}

export interface PeakHourCell {
  hour: number
  day: string
  count: number
  avgLatencyMs: number
}

export interface AgentDependency {
  from: string
  to: string
  type: 'data' | 'sequential' | 'shared-task'
  label: string
}

// ─── Helpers ──────────────────────────────────────────────────

async function resolveAgentId(slug: string): Promise<string | null> {
  const [row] = await db.select({ id: agents.id }).from(agents).where(eq(agents.slug, slug)).limit(1)
  return row?.id ?? null
}

// ─── Functions ────────────────────────────────────────────────

export async function getAgentById(slug: string): Promise<Agent | undefined> {
  const [agent] = await db
    .select()
    .from(agents)
    .where(eq(agents.slug, slug))
    .limit(1)

  if (!agent) return undefined

  // Get latest metrics
  const [metrics] = await db
    .select()
    .from(agentMetricsDaily)
    .where(eq(agentMetricsDaily.agentId, agent.id))
    .orderBy(desc(agentMetricsDaily.date))
    .limit(1)

  // Get previous day metrics for trend
  const [prevMetrics] = await db
    .select()
    .from(agentMetricsDaily)
    .where(eq(agentMetricsDaily.agentId, agent.id))
    .orderBy(desc(agentMetricsDaily.date))
    .limit(1)
    .offset(1)

  // Get agent tasks
  const tasks = await db
    .select({ task: onetTasks.task })
    .from(onetTasks)
    .where(eq(onetTasks.agentId, agent.id))

  const sigmaScore = Number(metrics?.sigmaScore) || 0
  const prevSigma = Number(prevMetrics?.sigmaScore) || sigmaScore
  const totalRuns = metrics?.totalRuns ?? 0
  const successfulRuns = metrics?.successfulRuns ?? 0
  const successRate = totalRuns > 0 ? successfulRuns / totalRuns : 0

  const status = sigmaScore >= 4.0 ? 'green' : sigmaScore >= 3.0 ? 'amber' : 'red'
  const sigmaTrend = sigmaScore > prevSigma + 0.1 ? 'up' : sigmaScore < prevSigma - 0.1 ? 'down' : 'flat'

  // Get process slug for processId mapping
  const [proc] = await db.select({ slug: processes.slug }).from(processes).where(eq(processes.id, agent.processId)).limit(1)

  return {
    id: agent.slug,
    name: agent.name,
    processId: proc?.slug ?? '',
    model: agent.model,
    framework: agent.framework,
    status: status as Agent['status'],
    sigmaScore,
    sigmaTrend: sigmaTrend as Agent['sigmaTrend'],
    sigmaPrev: prevSigma,
    dpmo: metrics?.dpmo ?? 0,
    oee: successRate * (sigmaScore / 6),
    successRate,
    p95LatencyMs: metrics?.p95DurationMs ?? 0,
    avgCostPerRun: totalRuns > 0 ? Number(metrics?.totalCost) / totalRuns : 0,
    totalRuns,
    defects: {
      failures: metrics?.failedRuns ?? 0,
      latencyBreaches: metrics?.latencyBreaches ?? 0,
      costOverruns: metrics?.costOverruns ?? 0,
    },
    tasks: tasks.map(t => t.task),
  }
}

export async function getAgentProfile(agentSlug: string): Promise<AgentProfile | undefined> {
  const agentId = await resolveAgentId(agentSlug)
  if (!agentId) return undefined

  const [agent] = await db.select().from(agents).where(eq(agents.id, agentId)).limit(1)
  if (!agent) return undefined

  const [proc] = await db.select().from(processes).where(eq(processes.id, agent.processId)).limit(1)

  const tasks = await db
    .select({ task: onetTasks.task, timeWeight: onetTasks.timeWeight })
    .from(onetTasks)
    .where(eq(onetTasks.agentId, agentId))

  const [metrics] = await db
    .select()
    .from(agentMetricsDaily)
    .where(eq(agentMetricsDaily.agentId, agentId))
    .orderBy(desc(agentMetricsDaily.date))
    .limit(1)

  const totalRuns = metrics?.totalRuns ?? 0
  const successRate = totalRuns > 0 ? (metrics?.successfulRuns ?? 0) / totalRuns : 0
  const avgCostPerRun = totalRuns > 0 ? Number(metrics?.totalCost) / totalRuns : 0

  return {
    id: agent.slug,
    name: agent.name,
    workflowId: proc?.slug ?? '',
    processName: proc?.name ?? '',
    sigmaScore: Number(metrics?.sigmaScore) || 0,
    dpmo: metrics?.dpmo ?? 0,
    successRate,
    avgCostPerRun,
    p95Latency: metrics?.p95DurationMs ?? 0,
    totalRuns,
    tasks: tasks.map(t => ({
      name: t.task,
      timeWeight: Number(t.timeWeight) * 100,
      weeklyVolume: Math.round(totalRuns / 4.3),
      avgCost: avgCostPerRun,
    })),
    weeklyROI: 0, // computed later from ROI module
    status: agent.status as AgentProfile['status'],
    consistency: 85, // default; computed from run variance in production
  }
}

export async function getAgentVersions(agentSlug: string): Promise<AgentVersion[]> {
  const agentId = await resolveAgentId(agentSlug)
  if (!agentId) return []

  const rows = await db
    .select()
    .from(agentVersions)
    .where(eq(agentVersions.agentId, agentId))
    .orderBy(desc(agentVersions.deployedAt))

  return rows.map(v => ({
    version: v.version,
    label: v.label ?? '',
    model: v.model,
    framework: v.framework,
    deployedDate: v.deployedAt.toISOString(),
    status: v.isCurrent ? 'current' as const : 'retired' as const,
    retiredReason: v.retiredReason ?? undefined,
    sigma: 0,
  }))
}

export async function getDecommissionImpact(agentSlug: string): Promise<DecommissionImpact | null> {
  const profile = await getAgentProfile(agentSlug)
  if (!profile) return null

  const allAgents = await db
    .select()
    .from(agents)
    .innerJoin(processes, eq(agents.processId, processes.id))
    .where(eq(processes.slug, profile.workflowId))

  const totalAgents = allAgents.length
  const activeAgents = allAgents.filter(a => a.agents.status === 'active').length
  const taskWeight = profile.tasks.reduce((s, t) => s + t.timeWeight, 0)
  const totalWeight = 100

  return {
    agentName: profile.name,
    processName: profile.processName,
    taskCoveragePercent: Math.round((taskWeight / totalWeight) * 100),
    currentCoverage: Math.round((activeAgents / totalAgents) * 100),
    newCoverage: Math.round(((activeAgents - 1) / totalAgents) * 100),
    weeklyROIImpact: -profile.weeklyROI,
    affectedTasks: profile.tasks,
    fallbackMode: 'Collaborative (human review required)',
  }
}

export async function getAllAgents(): Promise<AgentProfile[]> {
  const allAgents = await db.select({ slug: agents.slug }).from(agents)
  const profiles: AgentProfile[] = []
  for (const a of allAgents) {
    const p = await getAgentProfile(a.slug)
    if (p) profiles.push(p)
  }
  return profiles
}

export async function getAgentBudgets(): Promise<AgentBudget[]> {
  const rows = await db
    .select({
      agentId: agents.slug,
      agentName: agents.name,
      monthlyCap: agentBudgets.monthlyCap,
      alertThreshold: agentBudgets.alertThreshold,
    })
    .from(agentBudgets)
    .innerJoin(agents, eq(agentBudgets.agentId, agents.id))

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const result: AgentBudget[] = []
  for (const row of rows) {
    const agentId = await resolveAgentId(row.agentId)
    const [spend] = agentId ? await db
      .select({ total: sql<number>`COALESCE(SUM(CAST(${runs.totalCost} AS NUMERIC)), 0)` })
      .from(runs)
      .where(and(
        eq(runs.agentId, agentId),
        gte(runs.timestamp, startOfMonth)
      )) : [{ total: 0 }]

    const currentSpend = Number(spend?.total) || 0
    const cap = Number(row.monthlyCap)

    result.push({
      agentId: row.agentId,
      agentName: row.agentName,
      monthlyCap: cap,
      alertThreshold: row.alertThreshold,
      currentSpend,
      utilizationPct: cap > 0 ? Math.round((currentSpend / cap) * 100) : 0,
      trend: 'flat',
    })
  }
  return result
}

export async function getStagingCandidate(agentSlug: string): Promise<StagingCandidate | undefined> {
  const agentId = await resolveAgentId(agentSlug)
  if (!agentId) return undefined

  const [row] = await db
    .select()
    .from(stagingCandidates)
    .where(eq(stagingCandidates.agentId, agentId))
    .limit(1)

  if (!row) return undefined

  return {
    agentId: agentSlug,
    productionModel: (row.productionMetrics as any)?.model ?? '',
    candidateModel: row.candidateModel,
    productionFramework: (row.productionMetrics as any)?.framework ?? '',
    candidateFramework: row.candidateFramework,
    productionMetrics: row.productionMetrics as StagingCandidate['productionMetrics'],
    candidateMetrics: row.candidateMetrics as StagingCandidate['candidateMetrics'],
    stagingRuns: row.stagingRuns,
    stagingSucessRate: Number(row.stagingSuccessRate) || 0,
    riskLevel: row.riskLevel as StagingCandidate['riskLevel'],
    riskNote: row.riskNote ?? '',
  }
}

export async function getAgentAvailability(agentSlug: string): Promise<AgentAvailability | undefined> {
  const agentId = await resolveAgentId(agentSlug)
  if (!agentId) return undefined

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)

  const recentRuns = await db
    .select({ timestamp: runs.timestamp, outcome: runs.outcome, durationMs: runs.durationMs })
    .from(runs)
    .where(and(eq(runs.agentId, agentId), gte(runs.timestamp, thirtyDaysAgo)))
    .orderBy(runs.timestamp)

  if (recentRuns.length === 0) {
    return { agentId: agentSlug, uptimePct: 100, mttrMinutes: 0, incidents: [] }
  }

  // Compute uptime: % of runs that succeeded
  const successCount = recentRuns.filter(r => r.outcome).length
  const uptimePct = Math.round((successCount / recentRuns.length) * 1000) / 10

  // Find failure clusters as incidents
  const incidents: AgentAvailability['incidents'] = []
  let inFailure = false
  let failStart: Date | null = null

  for (const r of recentRuns) {
    if (!r.outcome && !inFailure) {
      inFailure = true
      failStart = r.timestamp
    } else if (r.outcome && inFailure) {
      inFailure = false
      if (failStart) {
        const dur = (r.timestamp.getTime() - failStart.getTime()) / 60000
        incidents.push({
          date: failStart.toISOString().split('T')[0],
          durationMinutes: Math.round(dur),
          cause: 'Consecutive run failures',
        })
      }
    }
  }

  const mttr = incidents.length > 0
    ? Math.round(incidents.reduce((s, i) => s + i.durationMinutes, 0) / incidents.length)
    : 0

  return { agentId: agentSlug, uptimePct, mttrMinutes: mttr, incidents }
}

export async function getPeakHourData(): Promise<PeakHourCell[]> {
  const rows = await db
    .select({
      hour: sql<number>`EXTRACT(HOUR FROM ${runs.timestamp})::int`,
      day: sql<string>`TO_CHAR(${runs.timestamp}, 'Dy')`,
      count: sql<number>`COUNT(*)::int`,
      avgLatency: sql<number>`AVG(${runs.durationMs})::int`,
    })
    .from(runs)
    .groupBy(
      sql`EXTRACT(HOUR FROM ${runs.timestamp})`,
      sql`TO_CHAR(${runs.timestamp}, 'Dy')`
    )

  return rows.map(r => ({
    hour: r.hour,
    day: r.day,
    count: r.count,
    avgLatencyMs: r.avgLatency,
  }))
}

export async function getAgentDependencies(): Promise<AgentDependency[]> {
  // Agents that share tasks or are in the same process form dependencies
  const taskAgents = await db
    .select({
      task: onetTasks.task,
      agentId: agents.slug,
      agentName: agents.name,
    })
    .from(onetTasks)
    .innerJoin(agents, eq(onetTasks.agentId, agents.id))
    .where(sql`${onetTasks.agentId} IS NOT NULL`)

  const deps: AgentDependency[] = []
  const taskMap = new Map<string, string[]>()

  for (const row of taskAgents) {
    const arr = taskMap.get(row.task) ?? []
    arr.push(row.agentId)
    taskMap.set(row.task, arr)
  }

  for (const [task, agentSlugs] of taskMap) {
    if (agentSlugs.length > 1) {
      for (let i = 0; i < agentSlugs.length - 1; i++) {
        deps.push({
          from: agentSlugs[i],
          to: agentSlugs[i + 1],
          type: 'shared-task',
          label: task,
        })
      }
    }
  }

  return deps
}

// ─── getAgentsByWorkflow ────────────────────────────────────────

export async function getAgentsByWorkflow(processSlug: string): Promise<AgentProfile[]> {
  const processAgents = await db
    .select()
    .from(agents)
    .innerJoin(processes, eq(agents.processId, processes.id))
    .where(eq(processes.slug, processSlug))

  const results: AgentProfile[] = []

  for (const row of processAgents) {
    const agent = row.agents
    const proc = row.processes

    // Get latest metrics
    const [metrics] = await db
      .select()
      .from(agentMetricsDaily)
      .where(eq(agentMetricsDaily.agentId, agent.id))
      .orderBy(desc(agentMetricsDaily.date))
      .limit(1)

    // Get task breakdown
    const agentTasks = await db
      .select({ task: onetTasks.task, timeWeight: onetTasks.timeWeight })
      .from(onetTasks)
      .where(eq(onetTasks.agentId, agent.id))

    const totalRuns = metrics?.totalRuns ?? 0
    const successRate = totalRuns > 0 ? ((metrics?.successfulRuns ?? 0) / totalRuns) : 0
    const sigmaScore = metrics?.sigmaScore ? parseFloat(String(metrics.sigmaScore)) : 0
    const dpmo = metrics?.dpmo ?? 0
    const avgCost = metrics?.totalCost && totalRuns > 0
      ? parseFloat(String(metrics.totalCost)) / totalRuns
      : 0

    results.push({
      id: agent.slug,
      name: agent.name,
      workflowId: proc.slug,
      processName: proc.name,
      sigmaScore,
      dpmo,
      successRate,
      avgCostPerRun: parseFloat(avgCost.toFixed(4)),
      p95Latency: metrics?.p95DurationMs ?? 0,
      totalRuns,
      weeklyROI: 0,
      status: (agent.status ?? 'active') as 'active' | 'paused' | 'decommissioned',
      consistency: Math.round(successRate * 100),
      tasks: agentTasks.map((t) => ({
        name: t.task,
        timeWeight: parseFloat(String(t.timeWeight)),
        weeklyVolume: 0,
        avgCost: 0,
      })),
    })
  }

  return results
}

// ─── getAgentOversightEfficiency ────────────────────────────────

export async function getAgentOversightEfficiency(): Promise<AgentOversightEfficiency[]> {
  const allAgents = await db
    .select({
      id: agents.id,
      slug: agents.slug,
      name: agents.name,
    })
    .from(agents)
    .where(eq(agents.status, 'active'))

  const results: AgentOversightEfficiency[] = []
  const costRate = 55 // $/hr for oversight labor

  for (const agent of allAgents) {
    const [metrics] = await db
      .select({ sigmaScore: agentMetricsDaily.sigmaScore })
      .from(agentMetricsDaily)
      .where(eq(agentMetricsDaily.agentId, agent.id))
      .orderBy(desc(agentMetricsDaily.date))
      .limit(1)

    const sigma = metrics?.sigmaScore ? parseFloat(String(metrics.sigmaScore)) : 3.0
    // Lower sigma = more oversight needed
    const baseHours = sigma >= 4.0 ? 2 : sigma >= 3.5 ? 3.5 : sigma >= 3.0 ? 6 : 8

    results.push({
      agentId: agent.slug,
      agentName: agent.name,
      sigmaScore: sigma,
      oversightHoursPerWeek: baseHours,
      costPerWeek: Math.round(baseHours * costRate),
    })
  }

  return results
}
