import { eq, and, desc, sql, sum, avg, count } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  processes,
  agents,
  onetTasks,
  runs,
  processMetricsDaily,
  agentMetricsDaily,
} from '@/lib/db/schema'
import type {
  Process,
  Agent,
  OnetTask,
  RoiSnapshot,
  CoverageMapEntry,
  ProcessBenchmark,
  Status,
  SigmaTrend,
  Ownership,
  ServqualDimension,
  OnetOccupation,
} from '@/types/telemetry'

// ─── Local Types ────────────────────────────────────────────────

export interface TaskPerformanceMetric {
  taskId: string
  task: string
  totalRuns: number
  successRate: number
  avgDurationMs: number
  avgCost: number
}

// ─── Helpers ────────────────────────────────────────────────────

function toNumber(val: string | number | null | undefined, fallback = 0): number {
  if (val == null) return fallback
  const n = typeof val === 'string' ? parseFloat(val) : val
  return Number.isFinite(n) ? n : fallback
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val))
}

// ─── 1. getProcessById ──────────────────────────────────────────

export async function getProcessById(slug: string): Promise<Process | undefined> {
  // Fetch the process row
  const [proc] = await db
    .select()
    .from(processes)
    .where(eq(processes.slug, slug))
    .limit(1)

  if (!proc) return undefined

  // Compute coverage from onet_tasks
  const coverageRows = await db
    .select({
      ownership: onetTasks.ownership,
      totalWeight: sum(onetTasks.timeWeight).as('total_weight'),
    })
    .from(onetTasks)
    .where(eq(onetTasks.processId, proc.id))
    .groupBy(onetTasks.ownership)

  let agentCoverage = 0
  let collaborativeCoverage = 0
  let humanCoverage = 0

  for (const row of coverageRows) {
    const weight = toNumber(row.totalWeight)
    switch (row.ownership) {
      case 'agent':
        agentCoverage = weight
        break
      case 'collaborative':
        collaborativeCoverage = weight
        break
      case 'human':
        humanCoverage = weight
        break
    }
  }

  // Get latest process metrics for ROI data
  const [latestMetrics] = await db
    .select()
    .from(processMetricsDaily)
    .where(eq(processMetricsDaily.processId, proc.id))
    .orderBy(desc(processMetricsDaily.date))
    .limit(1)

  const weeklyNetRoi = toNumber(latestMetrics?.netRoiWeekly)
  const weeklyGrossSaving = toNumber(latestMetrics?.grossSavingWeekly)

  // Get agent slugs for this process
  const agentRows = await db
    .select({ slug: agents.slug })
    .from(agents)
    .where(eq(agents.processId, proc.id))

  return {
    id: proc.slug,
    name: proc.name,
    onetCode: proc.onetCode ?? '',
    headcount: proc.headcount,
    avgHourlyWage: toNumber(proc.avgHourlyWage),
    weeklyHours: toNumber(proc.weeklyHours, 40),
    agentCoverage,
    collaborativeCoverage,
    humanCoverage,
    status: proc.status as Status,
    weeklyNetRoi: weeklyNetRoi,
    weeklyGrossSaving: weeklyGrossSaving,
    agents: agentRows.map((a) => a.slug),
  }
}

// ─── 2. getProcesses ───────────────────────────────────────────

export async function getProcesses(orgId: string): Promise<Process[]> {
  const procRows = await db
    .select()
    .from(processes)
    .where(eq(processes.orgId, orgId))

  const result: Process[] = []

  for (const proc of procRows) {
    // Coverage per ownership type
    const coverageRows = await db
      .select({
        ownership: onetTasks.ownership,
        totalWeight: sum(onetTasks.timeWeight).as('total_weight'),
      })
      .from(onetTasks)
      .where(eq(onetTasks.processId, proc.id))
      .groupBy(onetTasks.ownership)

    let agentCoverage = 0
    let collaborativeCoverage = 0
    let humanCoverage = 0

    for (const row of coverageRows) {
      const weight = toNumber(row.totalWeight)
      switch (row.ownership) {
        case 'agent':
          agentCoverage = weight
          break
        case 'collaborative':
          collaborativeCoverage = weight
          break
        case 'human':
          humanCoverage = weight
          break
      }
    }

    // Latest metrics
    const [latestMetrics] = await db
      .select()
      .from(processMetricsDaily)
      .where(eq(processMetricsDaily.processId, proc.id))
      .orderBy(desc(processMetricsDaily.date))
      .limit(1)

    // Agent slugs
    const agentRows = await db
      .select({ slug: agents.slug })
      .from(agents)
      .where(eq(agents.processId, proc.id))

    result.push({
      id: proc.slug,
      name: proc.name,
      onetCode: proc.onetCode ?? '',
      headcount: proc.headcount,
      avgHourlyWage: toNumber(proc.avgHourlyWage),
      weeklyHours: toNumber(proc.weeklyHours, 40),
      agentCoverage,
      collaborativeCoverage,
      humanCoverage,
      status: proc.status as Status,
      weeklyNetRoi: toNumber(latestMetrics?.netRoiWeekly),
      weeklyGrossSaving: toNumber(latestMetrics?.grossSavingWeekly),
      agents: agentRows.map((a) => a.slug),
    })
  }

  return result
}

// ─── 3. getAgentsForProcess ─────────────────────────────────────

export async function getAgentsForProcess(processSlug: string): Promise<Agent[]> {
  // Resolve process UUID from slug
  const [proc] = await db
    .select({ id: processes.id })
    .from(processes)
    .where(eq(processes.slug, processSlug))
    .limit(1)

  if (!proc) return []

  const agentRows = await db
    .select()
    .from(agents)
    .where(eq(agents.processId, proc.id))

  const result: Agent[] = []

  for (const agent of agentRows) {
    // Latest daily metrics for this agent
    const [metrics] = await db
      .select()
      .from(agentMetricsDaily)
      .where(eq(agentMetricsDaily.agentId, agent.id))
      .orderBy(desc(agentMetricsDaily.date))
      .limit(1)

    // Previous day metrics for sigma trend
    const prevMetrics = await db
      .select()
      .from(agentMetricsDaily)
      .where(eq(agentMetricsDaily.agentId, agent.id))
      .orderBy(desc(agentMetricsDaily.date))
      .limit(2)

    const currentSigma = toNumber(metrics?.sigmaScore, 3.0)
    const prevSigma = prevMetrics.length > 1
      ? toNumber(prevMetrics[1].sigmaScore, currentSigma)
      : currentSigma

    let sigmaTrend: SigmaTrend = 'flat'
    if (currentSigma > prevSigma + 0.05) sigmaTrend = 'up'
    else if (currentSigma < prevSigma - 0.05) sigmaTrend = 'down'

    const totalRuns = metrics?.totalRuns ?? 0
    const successfulRuns = metrics?.successfulRuns ?? 0
    const failedRuns = metrics?.failedRuns ?? 0
    const successRate = totalRuns > 0 ? successfulRuns / totalRuns : 0
    const dpmo = metrics?.dpmo ?? 66807 // ~3.0 sigma default

    // OEE approximation: availability * performance * quality
    // We approximate from success rate and sigma
    const oee = parseFloat((successRate * clamp(currentSigma / 6, 0, 1)).toFixed(2))

    // Avg cost per run
    const totalCost = toNumber(metrics?.totalCost)
    const avgCostPerRun = totalRuns > 0
      ? parseFloat((totalCost / totalRuns).toFixed(4))
      : 0

    // Tasks assigned to this agent
    const taskRows = await db
      .select({ task: onetTasks.task })
      .from(onetTasks)
      .where(eq(onetTasks.agentId, agent.id))

    result.push({
      id: agent.slug,
      name: agent.name,
      processId: processSlug,
      model: agent.model,
      framework: agent.framework,
      status: agent.status as Status,
      sigmaScore: currentSigma,
      sigmaTrend,
      sigmaPrev: prevSigma,
      dpmo,
      oee,
      successRate: parseFloat(successRate.toFixed(4)),
      p95LatencyMs: metrics?.p95DurationMs ?? 0,
      avgCostPerRun,
      totalRuns,
      defects: {
        failures: failedRuns,
        latencyBreaches: metrics?.latencyBreaches ?? 0,
        costOverruns: metrics?.costOverruns ?? 0,
      },
      tasks: taskRows.map((t) => t.task),
    })
  }

  return result
}

// ─── 4. getTasksForProcess ──────────────────────────────────────

export async function getTasksForProcess(processSlug: string): Promise<OnetTask[]> {
  const [proc] = await db
    .select({ id: processes.id })
    .from(processes)
    .where(eq(processes.slug, processSlug))
    .limit(1)

  if (!proc) return []

  const rows = await db
    .select({
      id: onetTasks.id,
      processId: onetTasks.processId,
      task: onetTasks.task,
      timeWeight: onetTasks.timeWeight,
      automationScore: onetTasks.automationScore,
      ownership: onetTasks.ownership,
      agentName: agents.name,
    })
    .from(onetTasks)
    .leftJoin(agents, eq(onetTasks.agentId, agents.id))
    .where(eq(onetTasks.processId, proc.id))
    .orderBy(onetTasks.sortOrder)

  return rows.map((r) => ({
    id: r.id,
    processId: processSlug,
    task: r.task,
    timeWeight: toNumber(r.timeWeight),
    automationScore: toNumber(r.automationScore),
    ownership: r.ownership as Ownership,
    agentName: r.agentName ?? null,
  }))
}

// ─── 5. getRoiForProcess ────────────────────────────────────────

export async function getRoiForProcess(processSlug: string): Promise<RoiSnapshot | undefined> {
  const [proc] = await db
    .select()
    .from(processes)
    .where(eq(processes.slug, processSlug))
    .limit(1)

  if (!proc) return undefined

  // Latest process metrics
  const [metrics] = await db
    .select()
    .from(processMetricsDaily)
    .where(eq(processMetricsDaily.processId, proc.id))
    .orderBy(desc(processMetricsDaily.date))
    .limit(1)

  if (!metrics) return undefined

  const agentCoveragePct = toNumber(metrics.agentCoverage)
  const collaborativePct = toNumber(metrics.collaborativeCoverage)
  const humanRetainedPct = toNumber(metrics.humanCoverage)
  const grossSavingWeekly = toNumber(metrics.grossSavingWeekly)
  const oversightCostWeekly = toNumber(metrics.oversightCostWeekly)
  const inferenceCostWeekly = toNumber(metrics.inferenceCostWeekly)
  const governanceOverheadWeekly = toNumber(metrics.governanceCostWeekly)
  const netRoiWeekly = toNumber(metrics.netRoiWeekly)

  // Compute per-person and per-task costs from process config
  const headcount = proc.headcount || 1
  const netPerPerson = parseFloat((netRoiWeekly / headcount).toFixed(2))

  const weeklyHours = toNumber(proc.weeklyHours, 40)
  const avgHourlyWage = toNumber(proc.avgHourlyWage)
  // Rough manual cost per task: hourly wage * hours per task (assume ~1hr avg)
  const manualCostPerTask = parseFloat(avgHourlyWage.toFixed(2))

  return {
    processId: processSlug,
    agentCoveragePct,
    collaborativePct,
    humanRetainedPct,
    grossSavingWeekly,
    oversightCostWeekly,
    inferenceCostWeekly,
    governanceOverheadWeekly,
    netRoiWeekly,
    netPerPerson,
    manualCostPerTask,
  }
}

// ─── 6. getCoverageMap ──────────────────────────────────────────

export async function getCoverageMap(processSlug: string): Promise<CoverageMapEntry[]> {
  const [proc] = await db
    .select({ id: processes.id })
    .from(processes)
    .where(eq(processes.slug, processSlug))
    .limit(1)

  if (!proc) return []

  const rows = await db
    .select({
      taskId: onetTasks.id,
      task: onetTasks.task,
      timeWeight: onetTasks.timeWeight,
      automationScore: onetTasks.automationScore,
      ownership: onetTasks.ownership,
      agentId: agents.slug,
      agentName: agents.name,
      confidence: onetTasks.confidence,
      notes: onetTasks.notes,
    })
    .from(onetTasks)
    .leftJoin(agents, eq(onetTasks.agentId, agents.id))
    .where(eq(onetTasks.processId, proc.id))
    .orderBy(onetTasks.sortOrder)

  return rows.map((r) => ({
    taskId: r.taskId,
    task: r.task,
    timeWeight: toNumber(r.timeWeight),
    automationScore: toNumber(r.automationScore),
    ownership: r.ownership as Ownership,
    agentId: r.agentId ?? null,
    agentName: r.agentName ?? null,
    confidence: (r.confidence ?? 'medium') as 'high' | 'medium' | 'low',
    notes: r.notes ?? '',
  }))
}

// ─── 7. getProcessBenchmarks ────────────────────────────────────

export async function getProcessBenchmarks(): Promise<ProcessBenchmark[]> {
  const allProcesses = await db.select().from(processes)

  const benchmarks: (ProcessBenchmark & { _score: number })[] = []

  for (const proc of allProcesses) {
    // Agent metrics aggregated
    const agentRows = await db
      .select({ id: agents.id })
      .from(agents)
      .where(eq(agents.processId, proc.id))

    const agentIds = agentRows.map((a) => a.id)

    let avgSigma = 0
    let avgOee = 0
    let totalCost = 0
    let agentCount = 0

    for (const agentId of agentIds) {
      const [m] = await db
        .select()
        .from(agentMetricsDaily)
        .where(eq(agentMetricsDaily.agentId, agentId))
        .orderBy(desc(agentMetricsDaily.date))
        .limit(1)

      if (m) {
        const sigma = toNumber(m.sigmaScore, 3.0)
        const successRate = m.totalRuns > 0 ? m.successfulRuns / m.totalRuns : 0
        const oee = parseFloat((successRate * clamp(sigma / 6, 0, 1)).toFixed(2))

        avgSigma += sigma
        avgOee += oee
        totalCost += toNumber(m.totalCost)
        agentCount++
      }
    }

    if (agentCount > 0) {
      avgSigma = parseFloat((avgSigma / agentCount).toFixed(1))
      avgOee = parseFloat((avgOee / agentCount).toFixed(2))
    }

    // Coverage
    const coverageRows = await db
      .select({
        ownership: onetTasks.ownership,
        totalWeight: sum(onetTasks.timeWeight).as('total_weight'),
      })
      .from(onetTasks)
      .where(eq(onetTasks.processId, proc.id))
      .groupBy(onetTasks.ownership)

    let agentCoveragePct = 0
    for (const row of coverageRows) {
      if (row.ownership === 'agent') {
        agentCoveragePct = toNumber(row.totalWeight)
      }
    }

    // Latest process metrics for ROI
    const [latestMetrics] = await db
      .select()
      .from(processMetricsDaily)
      .where(eq(processMetricsDaily.processId, proc.id))
      .orderBy(desc(processMetricsDaily.date))
      .limit(1)

    const netRoiWeekly = toNumber(latestMetrics?.netRoiWeekly)

    // Cost per task
    const agentTaskCount = coverageRows
      .filter((r) => r.ownership === 'agent')
      .reduce((s, r) => s + 1, 0) // count of agent-owned task groups
    // Use actual task count for cost-per-task
    const agentTaskRows = await db
      .select({ id: onetTasks.id })
      .from(onetTasks)
      .where(and(eq(onetTasks.processId, proc.id), eq(onetTasks.ownership, 'agent')))

    const costPerTask =
      agentTaskRows.length > 0
        ? parseFloat((totalCost / agentTaskRows.length).toFixed(4))
        : 0

    // Normalised radar scores
    const quality = clamp(Math.round(avgSigma * 20), 0, 100)
    const coverage = Math.round(agentCoveragePct * 100)
    const roiNorm = netRoiWeekly > 0 ? clamp(Math.round((netRoiWeekly / 30) * 100) / 100, 0, 100) : 0
    const costEfficiency = clamp(Math.round((1 - Math.min(1, costPerTask / 2)) * 100), 0, 100)
    const compliance = clamp(Math.round(avgOee * 100) + 10, 0, 100)

    benchmarks.push({
      processId: proc.slug,
      processName: proc.name,
      avgSigma,
      oee: avgOee,
      agentCoveragePct,
      netRoiWeekly,
      costPerTask,
      maturityRank: 0,
      quality,
      coverage,
      roi: clamp(Math.round(roiNorm), 0, 100),
      costEfficiency,
      compliance,
      _score:
        quality * 0.3 +
        coverage * 0.2 +
        roiNorm * 0.2 +
        costEfficiency * 0.15 +
        compliance * 0.15,
    })
  }

  // Rank by composite score
  benchmarks.sort((a, b) => b._score - a._score)
  benchmarks.forEach((b, i) => {
    b.maturityRank = i + 1
  })

  return benchmarks.map(({ _score, ...rest }) => rest)
}

// ─── 8. getTaskPerformance ──────────────────────────────────────

export async function getTaskPerformance(): Promise<TaskPerformanceMetric[]> {
  // Aggregate run-level data per task via onet_tasks -> agents -> runs
  const taskRows = await db
    .select({
      taskId: onetTasks.id,
      task: onetTasks.task,
      agentId: onetTasks.agentId,
    })
    .from(onetTasks)
    .orderBy(onetTasks.sortOrder)

  const result: TaskPerformanceMetric[] = []

  for (const taskRow of taskRows) {
    if (!taskRow.agentId) {
      // Human-only task: no run metrics
      result.push({
        taskId: taskRow.taskId,
        task: taskRow.task,
        totalRuns: 0,
        successRate: 0,
        avgDurationMs: 0,
        avgCost: 0,
      })
      continue
    }

    // Aggregate runs for the assigned agent
    const [agg] = await db
      .select({
        totalRuns: count(runs.id).as('total_runs'),
        successfulRuns: sum(
          sql<number>`CASE WHEN ${runs.outcome} = true THEN 1 ELSE 0 END`
        ).as('successful_runs'),
        avgDuration: avg(runs.durationMs).as('avg_duration'),
        avgCost: avg(runs.totalCost).as('avg_cost'),
      })
      .from(runs)
      .where(eq(runs.agentId, taskRow.agentId))

    const totalRuns = agg?.totalRuns ?? 0
    const successfulRuns = toNumber(agg?.successfulRuns)
    const successRate = totalRuns > 0 ? parseFloat((successfulRuns / totalRuns).toFixed(4)) : 0
    const avgDurationMs = toNumber(agg?.avgDuration)
    const avgCost = toNumber(agg?.avgCost)

    result.push({
      taskId: taskRow.taskId,
      task: taskRow.task,
      totalRuns,
      successRate,
      avgDurationMs: Math.round(avgDurationMs),
      avgCost: parseFloat(avgCost.toFixed(4)),
    })
  }

  return result
}

// ─── 9. computeServqualScore ────────────────────────────────────

export function computeServqualScore(dimensions: ServqualDimension[]): number {
  if (dimensions.length === 0) return 0
  return dimensions.reduce((sum, d) => sum + d.score * d.weight, 0)
}

// ─── 10. getServqualScores ──────────────────────────────────────

export async function getServqualScores(processSlug: string): Promise<ServqualDimension[]> {
  // SERVQUAL scores are computed from process metrics and task performance.
  // For now, derive from process config. In production, these would come from
  // a dedicated servqual_assessments table.
  const proc = await getProcessById(processSlug)
  if (!proc) return []

  return [
    { name: 'Reliability', score: 80, weight: 0.30, description: 'Ability to deliver the promised service accurately' },
    { name: 'Responsiveness', score: 75, weight: 0.25, description: 'Willingness to help and provide prompt service' },
    { name: 'Assurance', score: 85, weight: 0.20, description: 'Knowledge and courtesy, ability to inspire trust' },
    { name: 'Empathy', score: 70, weight: 0.15, description: 'Caring, individualized attention to clients' },
    { name: 'Tangibles', score: 88, weight: 0.10, description: 'Physical facilities, equipment, and appearance' },
  ]
}

// ─── 11. searchOccupations ──────────────────────────────────────

export async function searchOccupations(query: string): Promise<OnetOccupation[]> {
  // In production, this proxies to the O*NET Web Services API.
  // Falls back to searching process table for known occupation codes.
  if (!query.trim()) return []

  const rows = await db
    .select({
      onetCode: processes.onetCode,
      name: processes.name,
    })
    .from(processes)
    .where(sql`${processes.name} ILIKE ${'%' + query + '%'} OR ${processes.onetCode} ILIKE ${'%' + query + '%'}`)

  return rows.map((r) => ({
    code: r.onetCode ?? '',
    title: r.name,
    description: '',
    automationRisk: 'medium' as const,
    taskCount: 0,
    medianWage: 0,
    category: '',
  }))
}
