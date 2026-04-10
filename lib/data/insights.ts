import { eq, and, desc, sql, sum, avg, count } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  processes,
  agents,
  onetTasks,
  runs,
  governanceRules,
  complianceRequirements,
  trainingAssignments,
  agentMetricsDaily,
  processMetricsDaily,
  skillsGap as skillsGapTable,
  transformationStages as transformationStagesTable,
  modelOptions as modelOptionsTable,
} from '@/lib/db/schema'
import type {
  Scenario,
  WorkforceProjection,
  WorkforceMonth,
  MaturityDimension,
  ModelOption,
  LongRangeMonth,
  BuildVsProcess,
  DecisionFactor,
  HumanBaseline,
  TeamMemberImpact,
  SkillGap,
  TeamMemberTraining,
  TrainingAssignment,
  TransformationStage,
  Agent,
} from '@/types/telemetry'

// ─── Local Types ────────────────────────────────────────────────

export interface WorkforceProcess {
  id: string
  name: string
  currentHeadcount: number
  avgHourlyWage: number
  weeklyHours: number
  agentCoverage: number
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

// ─── 1. getWorkforceProcess ────────────────────────────────────

export async function getWorkforceProcess(
  processSlug: string
): Promise<WorkforceProcess> {
  const [proc] = await db
    .select()
    .from(processes)
    .where(eq(processes.slug, processSlug))
    .limit(1)

  if (!proc) {
    return {
      id: processSlug,
      name: processSlug,
      currentHeadcount: 0,
      avgHourlyWage: 0,
      weeklyHours: 40,
      agentCoverage: 0,
    }
  }

  // Compute agent coverage from onet_tasks
  const coverageRows = await db
    .select({
      ownership: onetTasks.ownership,
      totalWeight: sum(onetTasks.timeWeight).as('total_weight'),
    })
    .from(onetTasks)
    .where(eq(onetTasks.processId, proc.id))
    .groupBy(onetTasks.ownership)

  let agentCoverage = 0
  for (const row of coverageRows) {
    if (row.ownership === 'agent') {
      agentCoverage = toNumber(row.totalWeight)
    }
  }

  return {
    id: proc.slug,
    name: proc.name,
    currentHeadcount: proc.headcount,
    avgHourlyWage: toNumber(proc.avgHourlyWage),
    weeklyHours: toNumber(proc.weeklyHours, 40),
    agentCoverage,
  }
}

// ─── 2. getWorkforceProjection ─────────────────────────────────

export async function getWorkforceProjection(
  processSlug: string,
  scenario: Scenario
): Promise<WorkforceProjection> {
  const proc = await getWorkforceProcess(processSlug)
  const hc = proc.currentHeadcount
  const hourlyWage = proc.avgHourlyWage || 35
  const weeklyHours = proc.weeklyHours || 40
  const salaryPerHead = Math.round(hourlyWage * weeklyHours * 4.33) // monthly

  const pace =
    scenario === 'aggressive' ? 0.065 : scenario === 'moderate' ? 0.04 : 0.02

  const skillNames = [
    'AI Review',
    'Exception Handling',
    'Quality Assurance',
    'Prompt Engineering',
  ]

  const now = new Date()
  const months: WorkforceMonth[] = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i + 1, 1)
    const month = d.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    })

    const decay = Math.max(0, 1 - pace * (i + 1))
    const headcount = Math.max(2, Math.round(hc * decay))
    const salaryBurn = headcount * salaryPerHead
    const agentCost = Math.round(800 + (hc - headcount) * 420 + i * 120)
    const netSaving = hc * salaryPerHead - salaryBurn - agentCost

    const skills = skillNames.map((name, si) => {
      const peak = 3 + si * 2
      const dist = Math.abs(i - peak)
      const demand = Math.max(5, Math.round(100 * Math.exp(-0.15 * dist * dist)))
      return { name, demand }
    })

    return { month, headcount, salaryBurn, agentCost, netSaving, skills }
  })

  return { processId: proc.id, scenario, months }
}

// ─── 3. getMaturityDimensions ──────────────────────────────────

export async function getMaturityDimensions(
  orgId: string
): Promise<MaturityDimension[]> {
  // Governance: count active rules
  const [ruleStats] = await db
    .select({
      total: count(governanceRules.id).as('total'),
      active: count(
        sql`CASE WHEN ${governanceRules.active} = true THEN 1 END`
      ).as('active'),
    })
    .from(governanceRules)
    .where(eq(governanceRules.orgId, orgId))

  const totalRules = toNumber(ruleStats?.total, 0)
  const activeRules = toNumber(ruleStats?.active, 0)

  // Compliance %
  const compRows = await db
    .select({ status: complianceRequirements.status })
    .from(complianceRequirements)
    .where(eq(complianceRequirements.orgId, orgId))

  const compTotal = compRows.length || 1
  const compPassed = compRows.filter((r) => r.status === 'PASS').length
  const compPartial = compRows.filter((r) => r.status === 'PARTIAL').length
  const compliancePct = Math.round(
    ((compPassed + compPartial * 0.5) / compTotal) * 100
  )

  // Training progress: avg progress across all assignments in this org
  const trainingRows = await db
    .select({ progress: trainingAssignments.progress })
    .from(trainingAssignments)
    .innerJoin(processes, eq(trainingAssignments.processId, processes.id))
    .where(eq(processes.orgId, orgId))

  const trainingPct =
    trainingRows.length > 0
      ? Math.round(
          trainingRows.reduce((a, r) => a + r.progress, 0) /
            trainingRows.length
        )
      : 0

  // Avg sigma across agents
  const [sigmaStats] = await db
    .select({
      avgSigma: avg(agentMetricsDaily.sigmaScore).as('avg_sigma'),
    })
    .from(agentMetricsDaily)
    .innerJoin(agents, eq(agentMetricsDaily.agentId, agents.id))
    .innerJoin(processes, eq(agents.processId, processes.id))
    .where(eq(processes.orgId, orgId))

  const avgSigma = toNumber(sigmaStats?.avgSigma, 3.0)

  // Coverage: avg agent coverage across processes
  const coverageRows = await db
    .select({
      agentCoverage: processMetricsDaily.agentCoverage,
    })
    .from(processMetricsDaily)
    .innerJoin(processes, eq(processMetricsDaily.processId, processes.id))
    .where(eq(processes.orgId, orgId))
    .orderBy(desc(processMetricsDaily.date))
    .limit(10)

  const avgCoverage =
    coverageRows.length > 0
      ? Math.round(
          (coverageRows.reduce(
            (a, r) => a + toNumber(r.agentCoverage),
            0
          ) /
            coverageRows.length) *
            100
        )
      : 0

  // Score mapping: convert percentages/values to 1-5 maturity scores
  function pctToScore(pct: number): number {
    if (pct >= 80) return 5
    if (pct >= 60) return 4
    if (pct >= 40) return 3
    if (pct >= 20) return 2
    return 1
  }

  function sigmaToScore(s: number): number {
    if (s >= 4.5) return 5
    if (s >= 4.0) return 4
    if (s >= 3.5) return 3
    if (s >= 3.0) return 2
    return 1
  }

  const coverageScore = pctToScore(avgCoverage)
  const qualityScore = sigmaToScore(avgSigma)
  const governanceScore = pctToScore(
    totalRules > 0 ? (activeRules / totalRules) * 100 : 0
  )
  const complianceScore = pctToScore(compliancePct)
  const workforceScore = pctToScore(trainingPct)

  // Combine governance + compliance into a single governance dimension
  const govCombined = Math.round((governanceScore + complianceScore) / 2)

  return [
    {
      dimension: 'Coverage',
      score: coverageScore,
      nextLevel: 'Achieve >50% task coverage across all processes',
      action: 'Expand agent coverage to additional tasks and processes',
    },
    {
      dimension: 'Quality',
      score: qualityScore,
      nextLevel: `Reach average 4.0\u03C3 across all agents (current: ${avgSigma.toFixed(1)}\u03C3)`,
      action: 'Improve lowest-performing agents with prompt refinement',
    },
    {
      dimension: 'ROI',
      score: clamp(coverageScore + 1, 1, 5),
      nextLevel: 'Achieve >$3,000/week net ROI across all processes',
      action: 'Expand agent coverage to increase gross savings',
    },
    {
      dimension: 'Governance',
      score: govCombined,
      nextLevel: 'Achieve 100% compliance with all active rules',
      action: 'Resolve outstanding compliance gaps and complete overdue reviews',
    },
    {
      dimension: 'Workforce Readiness',
      score: workforceScore,
      nextLevel: 'Complete training programs for 80%+ of affected staff',
      action: 'Launch AI collaboration training and formalize new role definitions',
    },
  ]
}

// ─── 4. getMaturityScore ───────────────────────────────────────

export async function getMaturityScore(orgId: string): Promise<number> {
  const dims = await getMaturityDimensions(orgId)
  return Math.round(dims.reduce((a, d) => a + d.score, 0) / dims.length)
}

// ─── 5. getModelOptionsForAgent ────────────────────────────────

export async function getModelOptionsForAgent(
  agentSlug: string
): Promise<{
  agent: Agent
  currentCostPerRun: number
  currentMonthlySpend: number
  alternatives: ModelOption[]
}> {
  // Look up agent by slug
  const [agentRow] = await db
    .select()
    .from(agents)
    .where(eq(agents.slug, agentSlug))
    .limit(1)

  if (!agentRow) {
    throw new Error(`Agent not found: ${agentSlug}`)
  }

  const [procRow] = await db
    .select()
    .from(processes)
    .where(eq(processes.id, agentRow.processId))
    .limit(1)

  // Get run metrics for this agent
  const [runStats] = await db
    .select({
      totalRuns: count(runs.id).as('total_runs'),
      successes: count(
        sql`CASE WHEN ${runs.outcome} = true THEN 1 END`
      ).as('successes'),
      avgCost: avg(runs.totalCost).as('avg_cost'),
      avgDuration: avg(runs.durationMs).as('avg_duration'),
    })
    .from(runs)
    .where(eq(runs.agentId, agentRow.id))

  const totalRuns = toNumber(runStats?.totalRuns, 0)
  const successes = toNumber(runStats?.successes, 0)
  const avgCostPerRun = toNumber(runStats?.avgCost, 0.01)
  const avgDurationMs = toNumber(runStats?.avgDuration, 2000)
  const successRate = totalRuns > 0 ? successes / totalRuns : 1

  // Build Agent interface from DB row
  const agent: Agent = {
    id: agentRow.slug,
    name: agentRow.name,
    processId: procRow?.slug ?? agentRow.processId,
    model: agentRow.model,
    framework: agentRow.framework,
    status: (agentRow.status as Agent['status']) || 'green',
    sigmaScore: 0,
    sigmaTrend: 'flat' as const,
    sigmaPrev: 0,
    dpmo: 0,
    oee: 0,
    successRate: +successRate.toFixed(4),
    p95LatencyMs: Math.round(avgDurationMs * 1.5),
    avgCostPerRun: +avgCostPerRun.toFixed(6),
    totalRuns,
    defects: { failures: totalRuns - successes, latencyBreaches: 0, costOverruns: 0 },
    tasks: [],
  }

  const runsPerMonth = Math.max(1, Math.round(totalRuns / 6))
  const currentMonthlySpend = +(avgCostPerRun * runsPerMonth).toFixed(2)

  // Query model_options from DB
  const orgId = procRow?.orgId
  let alternatives: ModelOption[] = []

  if (orgId) {
    const optionRows = await db
      .select()
      .from(modelOptionsTable)
      .where(eq(modelOptionsTable.orgId, orgId))

    alternatives = optionRows.map((o) => ({
      id: o.id,
      name: o.name,
      costPerToken: toNumber(o.costPerToken),
      estimatedSigmaDelta: toNumber(o.estimatedSigmaDelta),
      estimatedLatencyMs: o.estimatedLatencyMs,
      monthlyCostEstimate: toNumber(o.monthlyCostEstimate),
    }))
  }

  return { agent, currentCostPerRun: avgCostPerRun, currentMonthlySpend, alternatives }
}

// ─── 6. getLongRangeProjection ─────────────────────────────────

export async function getLongRangeProjection(
  orgId: string
): Promise<LongRangeMonth[]> {
  // Get current headcount across all processes
  const procRows = await db
    .select({ headcount: processes.headcount })
    .from(processes)
    .where(eq(processes.orgId, orgId))

  const startHeadcount = procRows.reduce((a, p) => a + p.headcount, 0) || 20

  // Get current coverage
  const [coverageRow] = await db
    .select({
      avgCoverage: avg(processMetricsDaily.agentCoverage).as('avg_coverage'),
    })
    .from(processMetricsDaily)
    .innerJoin(processes, eq(processMetricsDaily.processId, processes.id))
    .where(eq(processes.orgId, orgId))

  const baseCoverage = toNumber(coverageRow?.avgCoverage, 0.37)

  const months: LongRangeMonth[] = []

  for (let i = 0; i <= 36; i++) {
    const label = i === 0 ? 'Now' : `M${i}`

    // Cumulative ROI curves (monthly increments, compounding)
    const conservativeMonthly = 1800 + i * 120
    const moderateMonthly = 2400 + i * 200
    const aggressiveMonthly = 3200 + i * 320

    const conservative =
      i === 0 ? 0 : months[i - 1].conservative + conservativeMonthly
    const moderate =
      i === 0 ? 0 : months[i - 1].moderate + moderateMonthly
    const aggressive =
      i === 0 ? 0 : months[i - 1].aggressive + aggressiveMonthly

    // Headcount trajectory (moderate scenario)
    const headcountDecay = Math.max(
      4,
      Math.round(startHeadcount * Math.max(0.2, 1 - 0.018 * i))
    )

    // Agent coverage growth
    const coveragePct = Math.min(0.85, baseCoverage + 0.014 * i)

    months.push({
      month: i,
      label,
      conservative,
      moderate,
      aggressive,
      headcount: headcountDecay,
      agentCoveragePct: +coveragePct.toFixed(2),
    })
  }

  return months
}

// ─── 7. getBuildVsProcesses ────────────────────────────────────

export async function getBuildVsProcesses(
  orgId: string
): Promise<BuildVsProcess[]> {
  const procRows = await db
    .select({
      id: processes.id,
      slug: processes.slug,
      name: processes.name,
      headcount: processes.headcount,
    })
    .from(processes)
    .where(eq(processes.orgId, orgId))

  return procRows.map((proc) => {
    // Heuristic: processes with higher headcount are more complex → build
    const isComplex = proc.headcount > 10
    const buildCost = Math.round(40000 + proc.headcount * 5000)
    const buyCost = Math.round(15000 + proc.headcount * 2000)

    return {
      processId: proc.slug,
      processName: proc.name,
      build: {
        approach: 'build' as const,
        estimatedCost: buildCost,
        timeline: isComplex ? '4-6 months' : '2-3 months',
        riskLevel: 'Medium' as const,
        controlLevel: 'Full' as const,
      },
      buy: {
        approach: 'buy' as const,
        estimatedCost: buyCost,
        timeline: isComplex ? '2-3 weeks' : '1-2 weeks',
        riskLevel: 'Low' as const,
        controlLevel: isComplex ? 'Limited' as const : 'Moderate' as const,
      },
      recommendation: isComplex ? ('build' as const) : ('buy' as const),
      reasoning: isComplex
        ? 'Specialized domain with high complexity. Custom build yields better long-term ROI despite higher upfront cost.'
        : 'Well-established use case with vendor solutions. Faster time to value and lower total cost.',
    }
  })
}

// ─── 8. getBuildVsDecisionFactors ──────────────────────────────

export async function getBuildVsDecisionFactors(): Promise<DecisionFactor[]> {
  return [
    { factor: 'Cost (Year 1)', weight: 25, buildScore: 3, buyScore: 5 },
    { factor: 'Speed to Deploy', weight: 20, buildScore: 2, buyScore: 5 },
    { factor: 'Control & Customization', weight: 25, buildScore: 5, buyScore: 2 },
    { factor: 'Quality Ceiling', weight: 15, buildScore: 5, buyScore: 3 },
    { factor: 'Maintenance Burden', weight: 15, buildScore: 2, buyScore: 4 },
  ]
}

// ─── 9. getHumanBaseline ───────────────────────────────────────

export async function getHumanBaseline(
  processSlug: string
): Promise<HumanBaseline[]> {
  // Get process
  const [proc] = await db
    .select()
    .from(processes)
    .where(eq(processes.slug, processSlug))
    .limit(1)

  if (!proc) return []

  // Get tasks with agent assignments
  const taskRows = await db
    .select({
      taskId: onetTasks.id,
      task: onetTasks.task,
      timeWeight: onetTasks.timeWeight,
      agentId: onetTasks.agentId,
    })
    .from(onetTasks)
    .where(eq(onetTasks.processId, proc.id))

  const results: HumanBaseline[] = []

  for (const task of taskRows) {
    // Human baseline: estimate from time weight
    const humanAvgTimeMinutes = Math.round(20 + toNumber(task.timeWeight) * 200)
    const humanErrorRate = +(0.05 + toNumber(task.timeWeight) * 0.15).toFixed(4)

    let agentErrorRate = humanErrorRate
    let agentAvgTimeMinutes = humanAvgTimeMinutes

    // If an agent is assigned, compute actual error rate from runs
    if (task.agentId) {
      const [agentStats] = await db
        .select({
          total: count(runs.id).as('total'),
          failures: count(
            sql`CASE WHEN ${runs.outcome} = false THEN 1 END`
          ).as('failures'),
          avgDuration: avg(runs.durationMs).as('avg_duration'),
        })
        .from(runs)
        .where(eq(runs.agentId, task.agentId))

      const total = toNumber(agentStats?.total, 0)
      const failures = toNumber(agentStats?.failures, 0)
      agentErrorRate = total > 0 ? +(failures / total).toFixed(4) : 0.05
      agentAvgTimeMinutes = Math.round(
        toNumber(agentStats?.avgDuration, 3000) / 60000
      )
      // Agent time is at least 1 minute
      agentAvgTimeMinutes = Math.max(1, agentAvgTimeMinutes)
    }

    results.push({
      taskId: task.taskId,
      task: task.task,
      humanErrorRate,
      humanAvgTimeMinutes,
      agentErrorRate,
      agentAvgTimeMinutes,
    })
  }

  return results
}

// ─── 10. getTeamMembers ────────────────────────────────────────

export async function getTeamMembers(
  processSlug: string
): Promise<TeamMemberImpact[]> {
  const [proc] = await db
    .select()
    .from(processes)
    .where(eq(processes.slug, processSlug))
    .limit(1)

  if (!proc) return []

  // Get coverage breakdown
  const coverageRows = await db
    .select({
      ownership: onetTasks.ownership,
      totalWeight: sum(onetTasks.timeWeight).as('total_weight'),
    })
    .from(onetTasks)
    .where(eq(onetTasks.processId, proc.id))
    .groupBy(onetTasks.ownership)

  let agentCoverage = 0
  let collabCoverage = 0
  for (const row of coverageRows) {
    if (row.ownership === 'agent') agentCoverage = toNumber(row.totalWeight)
    if (row.ownership === 'collaborative')
      collabCoverage = toNumber(row.totalWeight)
  }

  const weeklyHours = toNumber(proc.weeklyHours, 40)
  const headcount = proc.headcount || 4

  // Get unique training members (as proxy for team members)
  const memberRows = await db
    .select({
      memberName: trainingAssignments.memberName,
      memberRole: trainingAssignments.memberRole,
    })
    .from(trainingAssignments)
    .where(eq(trainingAssignments.processId, proc.id))
    .groupBy(trainingAssignments.memberName, trainingAssignments.memberRole)

  // If no training members, generate synthetic team
  const members =
    memberRows.length > 0
      ? memberRows
      : Array.from({ length: headcount }, (_, i) => ({
          memberName: `Team Member ${i + 1}`,
          memberRole: i === 0 ? 'Senior Analyst' : i < 3 ? 'Analyst' : 'Junior Analyst',
        }))

  return members.map((m, i) => {
    // Hours freed proportional to agent coverage
    const hoursFreed = Math.round(weeklyHours * agentCoverage * (0.8 + (i % 3) * 0.1))
    // Oversight hours proportional to collaborative coverage
    const oversightHours = Math.round(weeklyHours * collabCoverage * 0.3 * (0.7 + (i % 2) * 0.3))
    const netSaved = hoursFreed - oversightHours
    // Satisfaction: higher when more hours freed, lower when too much oversight
    const satisfaction = clamp(Math.round(3 + netSaved / weeklyHours * 5), 1, 5)

    return {
      name: m.memberName,
      role: m.memberRole ?? 'Analyst',
      hoursFreed,
      oversightHours,
      netSaved,
      satisfaction,
    }
  })
}

// ─── 11. getSkillsGap ─────────────────────────────────────────

export async function getSkillsGap(
  processSlug: string
): Promise<SkillGap[]> {
  const [proc] = await db
    .select()
    .from(processes)
    .where(eq(processes.slug, processSlug))
    .limit(1)

  if (!proc) return []

  const rows = await db
    .select()
    .from(skillsGapTable)
    .where(eq(skillsGapTable.processId, proc.id))

  return rows.map((r) => ({
    skill: r.skill,
    currentLevel: r.currentLevel,
    requiredLevel: r.requiredLevel,
    gap: r.requiredLevel - r.currentLevel,
    priority: r.priority as SkillGap['priority'],
    suggestedTraining: r.suggestedTraining ?? '',
    suggestedUrl: r.suggestedUrl ?? '',
    affectedTaskWeight: toNumber(r.affectedTaskWeight),
  }))
}

// ─── 12. getTrainingProgress ───────────────────────────────────

export async function getTrainingProgress(
  processSlug: string
): Promise<TeamMemberTraining[]> {
  const [proc] = await db
    .select()
    .from(processes)
    .where(eq(processes.slug, processSlug))
    .limit(1)

  if (!proc) return []

  const rows = await db
    .select()
    .from(trainingAssignments)
    .where(eq(trainingAssignments.processId, proc.id))

  // Group by member name
  const memberMap = new Map<
    string,
    { role: string; trainings: TrainingAssignment[] }
  >()

  for (const row of rows) {
    const key = row.memberName
    if (!memberMap.has(key)) {
      memberMap.set(key, {
        role: row.memberRole ?? 'Analyst',
        trainings: [],
      })
    }
    memberMap.get(key)!.trainings.push({
      trainingName: row.trainingName,
      progress: row.progress,
      status: row.status as TrainingAssignment['status'],
    })
  }

  const results: TeamMemberTraining[] = []
  const names = Array.from(memberMap.keys())

  for (const name of names) {
    const entry = memberMap.get(name)!
    const overallProgress =
      entry.trainings.length > 0
        ? Math.round(
            entry.trainings.reduce((a, t) => a + t.progress, 0) /
              entry.trainings.length
          )
        : 0

    // Generate a deterministic avatar initial-based placeholder
    const initials = name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()

    results.push({
      name,
      role: entry.role,
      avatar: initials,
      trainings: entry.trainings,
      overallProgress,
    })
  }

  return results
}

// ─── 13. getTransformationStages ───────────────────────────────

export async function getTransformationStages(
  processSlug: string
): Promise<TransformationStage[]> {
  const [proc] = await db
    .select()
    .from(processes)
    .where(eq(processes.slug, processSlug))
    .limit(1)

  if (!proc) return []

  const rows = await db
    .select()
    .from(transformationStagesTable)
    .where(eq(transformationStagesTable.processId, proc.id))
    .orderBy(transformationStagesTable.sortOrder)

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    sigmaTh: toNumber(r.sigmaTh),
    agentCoverage: toNumber(r.agentCoverage),
    collaborativeCoverage: toNumber(r.collaborativeCoverage),
    humanCoverage: toNumber(r.humanCoverage),
    weeklyNetRoi: toNumber(r.weeklyNetRoi),
    tasksToMigrate: (r.tasksToMigrate as string[]) ?? [],
    estimatedTimeline: r.estimatedTimeline,
  }))
}
