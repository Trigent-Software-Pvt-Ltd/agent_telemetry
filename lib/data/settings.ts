import { eq, and, desc, sql, count, avg } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  alertRules,
  anomalies,
  agents,
  agentMetricsDaily,
  runs,
  processes,
  notificationChannels,
  notificationRules,
  scheduledReports,
} from '@/lib/db/schema'
import type { ScheduledReport } from '@/types/telemetry'

// ─── Local Interfaces ──────────────────────────────────────────

export interface AlertRule {
  id: string
  name: string
  description: string
  metric: 'sigma' | 'override_rate' | 'weekly_cost' | 'success_rate' | 'latency_p95'
  threshold: number
  unit: string
  enabled: boolean
  severity: 'Critical' | 'Warning' | 'Info'
  scope: 'all' | string
  min: number
  max: number
  step: number
  inputType: 'slider' | 'input'
}

export interface AlertHistoryEntry {
  id: string
  timestamp: string
  type: string
  agent: string
  severity: 'Critical' | 'Warning' | 'Info'
  status: 'Active' | 'Acknowledged' | 'Resolved'
  message: string
}

export interface AgentSlaConfig {
  agentName: string
  workflowName: string
  model: string
  latencyTarget: number
  costCap: number
  successRateFloor: number
  sigmaTarget: number
  currentLatencyP95: number
  currentAvgCost: number
  currentSuccessRate: number
  currentSigma: number
}

export interface NotificationChannel {
  id: string
  type: 'email' | 'slack' | 'teams'
  label: string
  enabled: boolean
  status: 'connected' | 'not_configured'
  config: Record<string, string>
}

export interface NotificationRule {
  id: string
  alertType: string
  description: string
  channels: { email: boolean; slack: boolean; teams: boolean }
  recipients: string
}

export interface RecentNotification {
  id: string
  timestamp: string
  type: string
  channel: 'email' | 'slack' | 'teams'
  recipient: string
  status: 'delivered' | 'failed' | 'pending'
  message: string
}

export interface SharedLink {
  id: string
  url: string
  page: string
  pagePath: string
  access: 'anyone' | 'team' | 'admins'
  createdAt: string
  expiresAt: string | null
  createdBy: string
  revoked: boolean
}

// ─── Helpers ───────────────────────────────────────────────────

function toNumber(val: string | number | null | undefined, fallback = 0): number {
  if (val == null) return fallback
  const n = typeof val === 'string' ? parseFloat(val) : val
  return Number.isFinite(n) ? n : fallback
}

// ─── Config defaults for alert rule input ranges ───────────────

const METRIC_CONFIGS: Record<string, { min: number; max: number; step: number; inputType: 'slider' | 'input'; description: string }> = {
  sigma: { min: 1.0, max: 6.0, step: 0.1, inputType: 'slider', description: 'Alert when sigma drops below threshold' },
  override_rate: { min: 5, max: 60, step: 1, inputType: 'slider', description: 'Alert when override rate exceeds threshold' },
  weekly_cost: { min: 50, max: 5000, step: 50, inputType: 'input', description: 'Alert when weekly cost exceeds threshold' },
  success_rate: { min: 50, max: 99, step: 1, inputType: 'slider', description: 'Alert when success rate drops below threshold' },
  latency_p95: { min: 500, max: 10000, step: 100, inputType: 'slider', description: 'Alert when latency P95 exceeds threshold' },
}

// ─── 1. getAlertRules ─────────────────────────────────────────

export async function getAlertRules(orgId: string): Promise<AlertRule[]> {
  const rows = await db
    .select()
    .from(alertRules)
    .where(eq(alertRules.orgId, orgId))

  return rows.map((r) => {
    const config = (r.config ?? {}) as Record<string, unknown>
    const metricDefaults = METRIC_CONFIGS[r.metric] ?? { min: 0, max: 100, step: 1, inputType: 'input', description: '' }

    return {
      id: r.id,
      name: r.name,
      description: (config.description as string) ?? metricDefaults.description,
      metric: r.metric as AlertRule['metric'],
      threshold: toNumber(r.threshold),
      unit: r.unit,
      enabled: r.enabled,
      severity: r.severity as AlertRule['severity'],
      scope: r.scope ?? 'all',
      min: toNumber(config.min as string | number | undefined, metricDefaults.min),
      max: toNumber(config.max as string | number | undefined, metricDefaults.max),
      step: toNumber(config.step as string | number | undefined, metricDefaults.step),
      inputType: (config.inputType as AlertRule['inputType']) ?? metricDefaults.inputType,
    }
  })
}

// ─── 2. getAlertHistory ───────────────────────────────────────

export async function getAlertHistory(orgId: string): Promise<AlertHistoryEntry[]> {
  const rows = await db
    .select({
      id: anomalies.id,
      timestamp: anomalies.timestamp,
      severity: anomalies.severity,
      category: anomalies.category,
      description: anomalies.description,
      acknowledged: anomalies.acknowledged,
      agentId: anomalies.agentId,
      agentName: agents.name,
    })
    .from(anomalies)
    .leftJoin(agents, eq(anomalies.agentId, agents.id))
    .where(eq(anomalies.orgId, orgId))
    .orderBy(desc(anomalies.timestamp))
    .limit(50)

  return rows.map((r) => ({
    id: r.id,
    timestamp: r.timestamp.toISOString(),
    type: r.category,
    agent: r.agentName ?? 'All Agents',
    severity: r.severity as AlertHistoryEntry['severity'],
    status: r.acknowledged ? 'Acknowledged' as const : 'Active' as const,
    message: r.description,
  }))
}

// ─── 3. getAgentSlaConfigs ────────────────────────────────────

export async function getAgentSlaConfigs(orgId: string): Promise<AgentSlaConfig[]> {
  // Get all agents for the org's processes
  const agentRows = await db
    .select({
      agentId: agents.id,
      agentName: agents.name,
      model: agents.model,
      processId: agents.processId,
      processName: processes.name,
    })
    .from(agents)
    .innerJoin(processes, eq(agents.processId, processes.id))
    .where(eq(processes.orgId, orgId))

  // Get latest metrics per agent
  const metricsRows = await db
    .select()
    .from(agentMetricsDaily)
    .orderBy(desc(agentMetricsDaily.date))

  const agentMetrics = new Map<string, typeof metricsRows[number]>()
  for (const m of metricsRows) {
    if (!agentMetrics.has(m.agentId)) {
      agentMetrics.set(m.agentId, m)
    }
  }

  // Get recent runs for P95 latency calculation
  const recentRuns = await db
    .select({
      agentId: runs.agentId,
      durationMs: runs.durationMs,
      outcome: runs.outcome,
      totalCost: runs.totalCost,
    })
    .from(runs)
    .orderBy(desc(runs.timestamp))
    .limit(5000)

  // Group runs by agent
  const runsByAgent = new Map<string, { durationMs: number; outcome: boolean; totalCost: number }[]>()
  for (const r of recentRuns) {
    if (!runsByAgent.has(r.agentId)) {
      runsByAgent.set(r.agentId, [])
    }
    runsByAgent.get(r.agentId)!.push({
      durationMs: r.durationMs,
      outcome: r.outcome,
      totalCost: toNumber(r.totalCost),
    })
  }

  return agentRows.map((a) => {
    const metrics = agentMetrics.get(a.agentId)
    const agentRuns = runsByAgent.get(a.agentId) ?? []

    const durations = agentRuns.map((r) => r.durationMs).sort((x, y) => x - y)
    const p95 = durations.length > 0 ? durations[Math.floor(durations.length * 0.95)] : toNumber(metrics?.p95DurationMs, 1000)

    const successfulRuns = agentRuns.filter((r) => r.outcome)
    const costs = successfulRuns.map((r) => r.totalCost)
    const avgCost = costs.length > 0 ? costs.reduce((s, c) => s + c, 0) / costs.length : 0.01

    const successRate = agentRuns.length > 0
      ? (successfulRuns.length / agentRuns.length) * 100
      : toNumber(metrics?.successfulRuns, 0) / Math.max(toNumber(metrics?.totalRuns, 1), 1) * 100

    const sigma = toNumber(metrics?.sigmaScore, 4.0)

    return {
      agentName: a.agentName,
      workflowName: a.processName,
      model: a.model,
      latencyTarget: Math.round(p95 * 1.1 / 100) * 100,
      costCap: parseFloat(Math.min(1.0, Math.max(0.01, avgCost * 1.5)).toFixed(2)),
      successRateFloor: Math.max(70, Math.round(successRate - 5)),
      sigmaTarget: parseFloat(Math.max(2.0, Math.min(6.0, sigma * 0.9)).toFixed(1)),
      currentLatencyP95: p95,
      currentAvgCost: parseFloat(avgCost.toFixed(4)),
      currentSuccessRate: parseFloat(successRate.toFixed(1)),
      currentSigma: parseFloat(sigma.toFixed(2)),
    }
  })
}

// ─── 4. getNotificationChannels ───────────────────────────────

export async function getNotificationChannels(orgId: string): Promise<NotificationChannel[]> {
  const rows = await db
    .select()
    .from(notificationChannels)
    .where(eq(notificationChannels.orgId, orgId))

  return rows.map((r) => ({
    id: r.id,
    type: r.type as NotificationChannel['type'],
    label: r.label,
    enabled: r.enabled,
    status: r.enabled ? 'connected' as const : 'not_configured' as const,
    config: (r.config ?? {}) as Record<string, string>,
  }))
}

// ─── 5. getNotificationRules ──────────────────────────────────

export async function getNotificationRules(orgId: string): Promise<NotificationRule[]> {
  const rows = await db
    .select()
    .from(notificationRules)
    .where(eq(notificationRules.orgId, orgId))

  return rows.map((r) => ({
    id: r.id,
    alertType: r.alertType,
    description: r.description ?? '',
    channels: (r.channels ?? { email: false, slack: false, teams: false }) as NotificationRule['channels'],
    recipients: r.recipients ?? '',
  }))
}

// ─── 6. getRecentNotifications ────────────────────────────────

export async function getRecentNotifications(orgId: string): Promise<RecentNotification[]> {
  const rows = await db
    .select({
      id: anomalies.id,
      timestamp: anomalies.timestamp,
      category: anomalies.category,
      severity: anomalies.severity,
      description: anomalies.description,
      metadata: anomalies.metadata,
    })
    .from(anomalies)
    .where(eq(anomalies.orgId, orgId))
    .orderBy(desc(anomalies.timestamp))
    .limit(10)

  return rows.map((r, idx) => {
    const meta = (r.metadata ?? {}) as Record<string, unknown>
    return {
      id: r.id,
      timestamp: r.timestamp.toISOString(),
      type: r.category,
      channel: (meta.channel as RecentNotification['channel']) ?? (['email', 'slack', 'teams'] as const)[idx % 3],
      recipient: (meta.recipient as string) ?? 'ops-team@vipplay.com',
      status: 'delivered' as const,
      message: r.description,
    }
  })
}

// ─── 7. getScheduledReports ───────────────────────────────────

export async function getScheduledReports(orgId: string): Promise<ScheduledReport[]> {
  const rows = await db
    .select()
    .from(scheduledReports)
    .where(eq(scheduledReports.orgId, orgId))

  return rows.map((r) => ({
    id: r.id,
    templateName: r.templateName,
    sections: (r.sections ?? []) as string[],
    frequency: r.frequency as ScheduledReport['frequency'],
    dayOfWeek: r.dayOfWeek ?? undefined,
    time: r.time,
    recipients: (r.recipients ?? []) as string[],
    processes: (r.processIds ?? []) as string[],
    status: r.status as ScheduledReport['status'],
    lastRun: r.lastRun?.toISOString(),
    nextRun: r.nextRun?.toISOString() ?? '',
  }))
}

// ─── 8. getSharedLinks ────────────────────────────────────────

export async function getSharedLinks(_orgId: string): Promise<SharedLink[]> {
  // Placeholder: shared_links table not yet created
  return []
}
