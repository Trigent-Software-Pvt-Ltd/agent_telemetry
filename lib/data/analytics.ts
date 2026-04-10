import { eq, and, desc, sql, gte, count, avg } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  anomalies,
  agents,
  agentMetricsDaily,
  industryBenchmarks,
} from '@/lib/db/schema'
import type {
  Anomaly,
  AnomalySeverity,
  Correlation,
  CorrelationPoint,
  IndustryBenchmark,
} from '@/types/telemetry'

// ─── Helpers ───────────────────────────────────────────────────

function toNumber(val: string | number | null | undefined, fallback = 0): number {
  if (val == null) return fallback
  const n = typeof val === 'string' ? parseFloat(val) : val
  return Number.isFinite(n) ? n : fallback
}

function pearson(xs: number[], ys: number[]): number {
  const n = xs.length
  if (n < 3) return 0

  const meanX = xs.reduce((a, b) => a + b, 0) / n
  const meanY = ys.reduce((a, b) => a + b, 0) / n

  let num = 0
  let denX = 0
  let denY = 0

  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX
    const dy = ys[i] - meanY
    num += dx * dy
    denX += dx * dx
    denY += dy * dy
  }

  const den = Math.sqrt(denX * denY)
  return den === 0 ? 0 : num / den
}

function correlationStrength(r: number): Correlation['strength'] {
  const abs = Math.abs(r)
  if (abs >= 0.7) return 'Strong'
  if (abs >= 0.4) return 'Moderate'
  return 'Weak'
}

// ─── 1. getAnomalies ─────────────────────────────────────────

export async function getAnomalies(orgId: string): Promise<Anomaly[]> {
  const rows = await db
    .select({
      id: anomalies.id,
      timestamp: anomalies.timestamp,
      severity: anomalies.severity,
      agentId: anomalies.agentId,
      description: anomalies.description,
      category: anomalies.category,
      agentName: agents.name,
    })
    .from(anomalies)
    .leftJoin(agents, eq(anomalies.agentId, agents.id))
    .where(eq(anomalies.orgId, orgId))
    .orderBy(desc(anomalies.timestamp))
    .limit(20)

  return rows.map((r) => ({
    id: r.id,
    timestamp: r.timestamp.toISOString(),
    severity: r.severity as AnomalySeverity,
    agentId: r.agentId ?? '',
    agentName: r.agentName ?? 'Overall',
    description: r.description,
    category: r.category,
  }))
}

// ─── 2. getCorrelations ──────────────────────────────────────

export async function getCorrelations(orgId: string): Promise<Correlation[]> {
  // Compute Pearson coefficients on-demand from agent_metrics_daily (last 90 days)
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
  const cutoff = ninetyDaysAgo.toISOString().slice(0, 10)

  const rows = await db
    .select({
      agentId: agentMetricsDaily.agentId,
      date: agentMetricsDaily.date,
      sigmaScore: agentMetricsDaily.sigmaScore,
      totalRuns: agentMetricsDaily.totalRuns,
      successfulRuns: agentMetricsDaily.successfulRuns,
      failedRuns: agentMetricsDaily.failedRuns,
      totalCost: agentMetricsDaily.totalCost,
      avgDurationMs: agentMetricsDaily.avgDurationMs,
      p95DurationMs: agentMetricsDaily.p95DurationMs,
      latencyBreaches: agentMetricsDaily.latencyBreaches,
      costOverruns: agentMetricsDaily.costOverruns,
      dpmo: agentMetricsDaily.dpmo,
    })
    .from(agentMetricsDaily)
    .where(gte(agentMetricsDaily.date, cutoff))
    .orderBy(agentMetricsDaily.date)

  if (rows.length < 5) return []

  // Build time-series arrays
  const sigmas: number[] = []
  const successRates: number[] = []
  const costs: number[] = []
  const latencies: number[] = []
  const failRates: number[] = []
  const dpmos: number[] = []

  for (const r of rows) {
    const total = r.totalRuns || 1
    sigmas.push(toNumber(r.sigmaScore))
    successRates.push((r.successfulRuns / total) * 100)
    costs.push(toNumber(r.totalCost) / total)
    latencies.push(toNumber(r.avgDurationMs))
    failRates.push((r.failedRuns / total) * 100)
    dpmos.push(r.dpmo ?? 0)
  }

  const correlations: Correlation[] = []
  let idCounter = 1

  // Correlation 1: Sigma vs Success Rate
  {
    const r = pearson(sigmas, successRates)
    const data: CorrelationPoint[] = sigmas.map((s, i) => ({ x: parseFloat(s.toFixed(2)), y: parseFloat(successRates[i].toFixed(1)) }))
    // Sample down if too many points
    const sampled = data.length > 20 ? data.filter((_, i) => i % Math.ceil(data.length / 20) === 0) : data
    correlations.push({
      id: `corr-${String(idCounter++).padStart(3, '0')}`,
      title: 'Sigma score vs success rate',
      coefficient: parseFloat(r.toFixed(2)),
      strength: correlationStrength(r),
      type: 'Quality',
      insight: r > 0.5
        ? 'Higher sigma scores strongly correlate with higher success rates. Improving agent quality directly boosts task completion.'
        : 'Sigma score has moderate relationship with success rate. Other factors may be influencing outcomes.',
      data: sampled,
    })
  }

  // Correlation 2: Cost vs Latency
  {
    const r = pearson(costs, latencies)
    const data: CorrelationPoint[] = costs.map((c, i) => ({ x: parseFloat(c.toFixed(4)), y: parseFloat(latencies[i].toFixed(0)) }))
    const sampled = data.length > 20 ? data.filter((_, i) => i % Math.ceil(data.length / 20) === 0) : data
    correlations.push({
      id: `corr-${String(idCounter++).padStart(3, '0')}`,
      title: 'Cost per run vs average latency',
      coefficient: parseFloat(r.toFixed(2)),
      strength: correlationStrength(r),
      type: 'Cost',
      insight: r > 0.5
        ? 'Higher cost runs tend to have higher latency, suggesting longer token generation or more complex chains.'
        : 'Cost and latency show limited correlation — cost may be driven more by token count than processing time.',
      data: sampled,
    })
  }

  // Correlation 3: Fail rate vs DPMO
  {
    const r = pearson(failRates, dpmos)
    const data: CorrelationPoint[] = failRates.map((f, i) => ({ x: parseFloat(f.toFixed(1)), y: dpmos[i] }))
    const sampled = data.length > 20 ? data.filter((_, i) => i % Math.ceil(data.length / 20) === 0) : data
    correlations.push({
      id: `corr-${String(idCounter++).padStart(3, '0')}`,
      title: 'Failure rate vs DPMO',
      coefficient: parseFloat(r.toFixed(2)),
      strength: correlationStrength(r),
      type: 'Quality',
      insight: 'Failure rate and defects per million opportunities are naturally correlated. Reducing failures directly improves sigma scores.',
      data: sampled,
    })
  }

  // Correlation 4: Latency vs Fail rate
  {
    const r = pearson(latencies, failRates)
    const data: CorrelationPoint[] = latencies.map((l, i) => ({ x: parseFloat(l.toFixed(0)), y: parseFloat(failRates[i].toFixed(1)) }))
    const sampled = data.length > 20 ? data.filter((_, i) => i % Math.ceil(data.length / 20) === 0) : data
    correlations.push({
      id: `corr-${String(idCounter++).padStart(3, '0')}`,
      title: 'Average latency vs failure rate',
      coefficient: parseFloat(r.toFixed(2)),
      strength: correlationStrength(r),
      type: 'Temporal',
      insight: r > 0.4
        ? 'Higher latency runs are more likely to fail. Consider implementing timeout policies and retry logic for long-running tasks.'
        : 'Latency has limited impact on failure rates. Failures may be caused by prompt or data quality issues.',
      data: sampled,
    })
  }

  return correlations
}

// ─── 3. getIndustryBenchmarks ─────────────────────────────────

export async function getIndustryBenchmarks(orgId: string): Promise<IndustryBenchmark[]> {
  const rows = await db
    .select()
    .from(industryBenchmarks)
    .where(eq(industryBenchmarks.orgId, orgId))

  return rows.map((r) => ({
    metric: r.metric,
    yourValue: toNumber(r.yourValue),
    industryAvg: toNumber(r.industryAvg),
    top10Pct: toNumber(r.top10Pct),
    unit: r.unit,
    percentile: r.percentile,
  }))
}
