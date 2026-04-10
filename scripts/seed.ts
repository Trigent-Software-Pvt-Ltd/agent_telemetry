/**
 * Seed script — populates the database with data from lib/mock-data.ts.
 *
 * This is the migration safety net: after seeding, every screen should
 * render identically to the mock version.
 *
 * Usage: npx tsx scripts/seed.ts
 *
 * Requires DATABASE_URL environment variable.
 */

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { v5 as uuidv5 } from 'uuid'
import * as schema from '../lib/db/schema'
import {
  ORGANISATION,
  PROCESSES,
  AGENTS,
  ONET_TASKS,
  AUDIT_LOG,
  RUN_HISTORY,
  FMEA_ENTRIES,
  TRANSFORMATION_STAGES,
  GOVERNANCE_RULES,
  GOVERNANCE_VIOLATIONS,
  SCHEDULED_REPORTS,
  SKILLS_GAP,
  TRAINING_PROGRESS,
  COMPLIANCE_REQUIREMENTS as MOCK_COMPLIANCE,
  MTBV_DATA,
  SIGMA_TRENDS,
} from '../lib/mock-data'
import { createPasswordHash } from '../lib/auth'

// ─── Deterministic UUID generation ────────────────────────────
// We use UUIDv5 with a fixed namespace so that the same slug
// always produces the same UUID. This makes the seed idempotent
// and lets us reference IDs across tables without lookups.

const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8' // DNS namespace

function toUUID(key: string): string {
  return uuidv5(key, NAMESPACE)
}

// ─── Main seed ────────────────────────────────────────────────

async function seed() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('DATABASE_URL is required')
    process.exit(1)
  }

  const pool = new Pool({ connectionString: url })
  const db = drizzle(pool, { schema })

  console.log('Seeding database...')

  // ── 1. Organisation ─────────────────────────────────────────
  const orgId = toUUID('org:fuzebox')
  await db.insert(schema.organisations).values({
    id: orgId,
    name: ORGANISATION.name,
    industry: ORGANISATION.industry,
    qualityFramework: ORGANISATION.qualityFramework,
    sigmaTarget: String(ORGANISATION.sigmaTarget),
    langfuseHost: ORGANISATION.langfuse.host,
    langfuseProject: ORGANISATION.langfuse.project,
    langfuseLastSync: new Date(ORGANISATION.langfuse.lastSync),
    onetHost: ORGANISATION.onet.host,
    onetLastRefresh: new Date(ORGANISATION.onet.lastRefresh),
  }).onConflictDoNothing()
  console.log('  ✓ Organisation')

  // ── 2. Demo user ────────────────────────────────────────────
  const userId = toUUID('user:demo')
  const { hash } = createPasswordHash('demo1234')
  await db.insert(schema.users).values({
    id: userId,
    orgId,
    email: 'demo@fuzebox.ai',
    name: 'Demo User',
    role: 'admin',
    hashedPassword: hash,
  }).onConflictDoNothing()
  console.log('  ✓ Demo user (demo@fuzebox.ai / demo1234)')

  // ── 3. Processes ────────────────────────────────────────────
  for (const p of PROCESSES) {
    await db.insert(schema.processes).values({
      id: toUUID(`process:${p.id}`),
      orgId,
      slug: p.id,
      name: p.name,
      onetCode: p.onetCode,
      headcount: p.headcount,
      avgHourlyWage: String(p.avgHourlyWage),
      weeklyHours: String(p.weeklyHours),
      status: p.status,
    }).onConflictDoNothing()
  }
  console.log(`  ✓ ${PROCESSES.length} processes`)

  // ── 4. Agents ───────────────────────────────────────────────
  for (const a of AGENTS) {
    await db.insert(schema.agents).values({
      id: toUUID(`agent:${a.id}`),
      processId: toUUID(`process:${a.processId}`),
      slug: a.id,
      name: a.name,
      model: a.model,
      framework: a.framework,
      status: a.status === 'green' ? 'active' : a.status === 'red' ? 'active' : 'active',
    }).onConflictDoNothing()
  }
  console.log(`  ✓ ${AGENTS.length} agents`)

  // ── 5. Agent versions (current version per agent) ──────────
  for (const a of AGENTS) {
    await db.insert(schema.agentVersions).values({
      id: toUUID(`version:${a.id}:v1`),
      agentId: toUUID(`agent:${a.id}`),
      version: 'v1',
      label: 'Initial deployment',
      model: a.model,
      framework: a.framework,
      isCurrent: true,
    }).onConflictDoNothing()
  }
  console.log(`  ✓ ${AGENTS.length} agent versions`)

  // ── 6. O*NET Tasks ──────────────────────────────────────────
  for (const t of ONET_TASKS) {
    const agentId = t.agentName
      ? AGENTS.find(a => a.name === t.agentName)?.id
      : null
    await db.insert(schema.onetTasks).values({
      id: toUUID(`task:${t.id}`),
      processId: toUUID(`process:${t.processId}`),
      task: t.task,
      timeWeight: String(t.timeWeight),
      automationScore: String(t.automationScore),
      ownership: t.ownership,
      agentId: agentId ? toUUID(`agent:${agentId}`) : null,
      confidence: t.automationScore > 0.7 ? 'high' : t.automationScore > 0.3 ? 'medium' : 'low',
    }).onConflictDoNothing()
  }
  console.log(`  ✓ ${ONET_TASKS.length} O*NET tasks`)

  // ── 7. Runs ─────────────────────────────────────────────────
  let runCount = 0
  for (const [agentSlug, runs] of Object.entries(RUN_HISTORY)) {
    for (const run of runs) {
      await db.insert(schema.runs).values({
        id: toUUID(`run:${run.runId}`),
        runId: run.runId,
        agentId: toUUID(`agent:${agentSlug}`),
        agentVersionId: toUUID(`version:${agentSlug}:v1`),
        timestamp: new Date(run.timestamp),
        durationMs: run.durationMs,
        outcome: run.outcome,
        totalCost: String(run.totalCost),
        tokenCount: run.tokenCount,
        toolCalls: run.toolCalls,
        spans: run.spans,
      }).onConflictDoNothing()
      runCount++
    }
  }
  console.log(`  ✓ ${runCount} runs`)

  // ── 8. Audit log ────────────────────────────────────────────
  const processNameToSlug: Record<string, string> = {
    'Sports Betting Analyst': 'sports-betting',
    'Customer Service Representative': 'customer-service',
  }
  for (const entry of AUDIT_LOG) {
    const procSlug = processNameToSlug[entry.processName] ?? 'sports-betting'
    await db.insert(schema.auditLog).values({
      id: toUUID(`audit:${entry.id}`),
      orgId,
      processId: toUUID(`process:${procSlug}`),
      task: entry.task,
      agentRecommendation: entry.agentRecommendation,
      humanDecision: entry.humanDecision,
      reviewerName: entry.reviewer,
      decisionType: entry.decisionType,
      durationMinutes: String(entry.durationMinutes),
      timestamp: new Date(entry.timestamp),
    }).onConflictDoNothing()
  }
  console.log(`  ✓ ${AUDIT_LOG.length} audit log entries`)

  // ── 9. FMEA entries ─────────────────────────────────────────
  for (const f of FMEA_ENTRIES) {
    await db.insert(schema.fmeaEntries).values({
      id: toUUID(`fmea:${f.id}`),
      agentId: toUUID(`agent:${f.agentId}`),
      failureMode: f.failureMode,
      effect: f.effect,
      cause: f.cause,
      severity: f.severity,
      occurrence: f.occurrence,
      detection: f.detection,
      // rpn is generated column — do not insert
      recommendedAction: f.recommendedAction,
      status: f.status,
    }).onConflictDoNothing()
  }
  console.log(`  ✓ ${FMEA_ENTRIES.length} FMEA entries`)

  // ── 10. Transformation stages ──────────────────────────────
  for (let i = 0; i < TRANSFORMATION_STAGES.length; i++) {
    const s = TRANSFORMATION_STAGES[i]
    await db.insert(schema.transformationStages).values({
      id: toUUID(`stage:${s.id}`),
      processId: toUUID('process:sports-betting'),
      name: s.name,
      sigmaTh: String(s.sigmaTh),
      agentCoverage: String(s.agentCoverage),
      collaborativeCoverage: String(s.collaborativeCoverage),
      humanCoverage: String(s.humanCoverage),
      weeklyNetRoi: String(s.weeklyNetRoi),
      tasksToMigrate: s.tasksToMigrate,
      estimatedTimeline: s.estimatedTimeline,
      sortOrder: i,
    }).onConflictDoNothing()
  }
  console.log(`  ✓ ${TRANSFORMATION_STAGES.length} transformation stages`)

  // ── 11. Governance rules ────────────────────────────────────
  for (const r of GOVERNANCE_RULES) {
    await db.insert(schema.governanceRules).values({
      id: toUUID(`grule:${r.id}`),
      orgId,
      name: r.name,
      condition: r.condition,
      enforcement: r.enforcement,
      active: r.active,
    }).onConflictDoNothing()
  }
  console.log(`  ✓ ${GOVERNANCE_RULES.length} governance rules`)

  // ── 12. Compliance requirements ─────────────────────────────
  if (MOCK_COMPLIANCE && MOCK_COMPLIANCE.length > 0) {
    for (const c of MOCK_COMPLIANCE) {
      await db.insert(schema.complianceRequirements).values({
        id: toUUID(`compliance:${c.id}`),
        orgId,
        requirement: c.requirement,
        status: c.status,
        detail: c.detail,
      }).onConflictDoNothing()
    }
    console.log(`  ✓ ${MOCK_COMPLIANCE.length} compliance requirements`)
  }

  // ── 13. Scheduled reports ───────────────────────────────────
  for (const r of SCHEDULED_REPORTS) {
    await db.insert(schema.scheduledReports).values({
      id: toUUID(`report:${r.id}`),
      orgId,
      templateName: r.templateName,
      sections: r.sections,
      frequency: r.frequency,
      dayOfWeek: r.dayOfWeek,
      time: r.time,
      recipients: r.recipients,
      processIds: r.processes,
      status: r.status,
      lastRun: r.lastRun ? new Date(r.lastRun) : null,
      nextRun: new Date(r.nextRun),
    }).onConflictDoNothing()
  }
  console.log(`  ✓ ${SCHEDULED_REPORTS.length} scheduled reports`)

  // ── 14. Skills gap ──────────────────────────────────────────
  for (const [processSlug, skills] of Object.entries(SKILLS_GAP)) {
    for (const s of skills) {
      await db.insert(schema.skillsGap).values({
        id: toUUID(`skill:${processSlug}:${s.skill}`),
        processId: toUUID(`process:${processSlug}`),
        skill: s.skill,
        currentLevel: s.currentLevel,
        requiredLevel: s.requiredLevel,
        priority: s.priority,
        suggestedTraining: s.suggestedTraining,
        suggestedUrl: s.suggestedUrl,
        affectedTaskWeight: String(s.affectedTaskWeight),
      }).onConflictDoNothing()
    }
  }
  console.log('  ✓ Skills gap entries')

  // ── 15. Training assignments ────────────────────────────────
  for (const [processSlug, members] of Object.entries(TRAINING_PROGRESS)) {
    for (const m of members) {
      for (const t of m.trainings) {
        await db.insert(schema.trainingAssignments).values({
          id: toUUID(`training:${processSlug}:${m.name}:${t.trainingName}`),
          processId: toUUID(`process:${processSlug}`),
          memberName: m.name,
          memberRole: m.role,
          trainingName: t.trainingName,
          progress: t.progress,
          status: t.status,
        }).onConflictDoNothing()
      }
    }
  }
  console.log('  ✓ Training assignments')

  // ── 16. Seed agent_metrics_daily from SIGMA_TRENDS ─────────
  // This populates the materialized metrics table so sigma
  // scorecards work immediately after seeding.
  let metricsCount = 0
  for (const [agentSlug, trends] of Object.entries(SIGMA_TRENDS)) {
    const agent = AGENTS.find(a => a.id === agentSlug)
    if (!agent) continue

    for (const point of trends) {
      const dpmo = point.dpmo
      const totalRuns = Math.round(agent.totalRuns / 30) || 2
      const successRate = agent.successRate
      const successfulRuns = Math.round(totalRuns * successRate)

      await db.insert(schema.agentMetricsDaily).values({
        agentId: toUUID(`agent:${agentSlug}`),
        date: point.date,
        totalRuns,
        successfulRuns,
        failedRuns: totalRuns - successfulRuns,
        latencyBreaches: 0,
        costOverruns: 0,
        totalCost: String(totalRuns * agent.avgCostPerRun),
        totalTokens: totalRuns * 2000,
        avgDurationMs: String(agent.p95LatencyMs * 0.6),
        p95DurationMs: agent.p95LatencyMs,
        sigmaScore: String(point.sigma),
        dpmo,
      }).onConflictDoNothing()
      metricsCount++
    }
  }
  console.log(`  ✓ ${metricsCount} agent_metrics_daily rows`)

  // ── 17. Seed process_metrics_daily ──────────────────────────
  // One row per process for "today"
  for (const p of PROCESSES) {
    const roi = {
      'sports-betting': { gross: 2116, oversight: 483, inference: 38, governance: 169, net: 1426 },
      'customer-service': { gross: 896, oversight: 152, inference: 10, governance: 122, net: 612 },
    }[p.id]
    if (!roi) continue

    await db.insert(schema.processMetricsDaily).values({
      processId: toUUID(`process:${p.id}`),
      date: new Date().toISOString().split('T')[0],
      agentCoverage: String(p.agentCoverage),
      collaborativeCoverage: String(p.collaborativeCoverage),
      humanCoverage: String(p.humanCoverage),
      grossSavingWeekly: String(roi.gross),
      netRoiWeekly: String(roi.net),
      oversightCostWeekly: String(roi.oversight),
      inferenceCostWeekly: String(roi.inference),
      governanceCostWeekly: String(roi.governance),
    }).onConflictDoNothing()
  }
  console.log('  ✓ process_metrics_daily')

  // ── 18. Industry benchmarks ────────────────────────────────
  const benchmarks = [
    { metric: 'Agent Coverage', yourValue: 43, industryAvg: 28, top10Pct: 55, unit: '%', percentile: 78 },
    { metric: 'Sigma Score', yourValue: 3.6, industryAvg: 2.8, top10Pct: 4.5, unit: 'σ', percentile: 72 },
    { metric: 'ROI per Person', yourValue: 119, industryAvg: 65, top10Pct: 180, unit: '$/week', percentile: 75 },
    { metric: 'Oversight Cost %', yourValue: 23, industryAvg: 35, top10Pct: 15, unit: '%', percentile: 70 },
    { metric: 'Governance Compliance', yourValue: 87, industryAvg: 62, top10Pct: 95, unit: '%', percentile: 80 },
  ]
  for (const b of benchmarks) {
    await db.insert(schema.industryBenchmarks).values({
      id: toUUID(`benchmark:${b.metric}`),
      orgId,
      metric: b.metric,
      yourValue: String(b.yourValue),
      industryAvg: String(b.industryAvg),
      top10Pct: String(b.top10Pct),
      unit: b.unit,
      percentile: b.percentile,
    }).onConflictDoNothing()
  }
  console.log(`  ✓ ${benchmarks.length} industry benchmarks`)

  // ── Done ────────────────────────────────────────────────────
  console.log('\nSeed complete!')
  await pool.end()
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
