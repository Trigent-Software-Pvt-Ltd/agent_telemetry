/**
 * Quadrant-owned Postgres persistence for the live Sourcing Agent.
 *
 * ISOLATED by design — the app connects as a dedicated `quadrant_app`
 * Postgres role against its own `quadrant` schema on arkosdb.trigent.com.
 * No Supabase JS client, no JWT, no PostgREST, no shared auth.
 *
 * Schema (see supabase/migrations/20260418_quadrant_schema.sql):
 *   quadrant.sourcing_runs        — one row per run
 *   quadrant.sourcing_candidates  — N rows per run (cascade delete)
 *
 * Connection string is read from QUADRANT_DB_URL. The caller is expected
 * to have already checked `isProvisioned()` via the API layer.
 */

import postgres, { type Sql } from 'postgres'
import type { SourcingCandidate, SourcingRun, FitState } from '@/lib/quadrant-mock'
import { isProvisioned } from './config'

let _sql: Sql | null = null

export function getDb(): Sql {
  if (_sql) return _sql
  const missing = isProvisioned()
  if (missing.length > 0) {
    throw new Error(`Quadrant DB not provisioned: missing ${missing.join(', ')}`)
  }
  // SSL mode is controlled by the connection string's `sslmode` param so the
  // app can target either the direct Postgres port (sslmode=disable) or an
  // SSL-terminating endpoint (sslmode=require) without code changes.
  _sql = postgres(process.env.QUADRANT_DB_URL as string, {
    max: 4,
    idle_timeout: 20,
    connect_timeout: 10,
    transform: { undefined: null },
  })
  return _sql
}

// ─── Row shapes (snake_case as stored) ──────────────────────────

interface RunRow {
  id: string
  triggered_by: string
  triggered_at: Date | string
  trigger: 'manual' | 'scheduled'
  input_brief: string | null
  steps: unknown
  evidence_validated_count: number
  evaluation_surfaced_count: number
  total_cost_usd: number | string
  total_latency_ms: number
  prompt_version: string | null
}

interface CandRow {
  id: string
  run_id: string
  company_name: string
  npi: string | null
  taxonomy_code: string | null
  taxonomy_label: string | null
  service_category: string | null
  geography_state: string | null
  geography_metro: string | null
  medicare_revenue: number | string | null
  medicare_pct_assumption: number | string | null
  extrapolated_total_revenue: number | string | null
  revenue_confidence_band: [number, number] | null
  is_third_party: boolean | null
  revenue_over_5m: boolean | null
  overall_confidence: number | string | null
  evidence: SourcingCandidate['evidence'] | null
  thesis_fit: SourcingCandidate['thesisFit'] | null
  disqualifiers: SourcingCandidate['disqualifiers'] | null
  fit_state: FitState
  reviewed_by: string | null
  reviewed_at: Date | string | null
  notes: string | null
}

function num(v: number | string | null | undefined, fallback = 0): number {
  if (v === null || v === undefined) return fallback
  const n = typeof v === 'number' ? v : Number.parseFloat(v)
  return Number.isFinite(n) ? n : fallback
}

function toIso(v: Date | string | null | undefined): string {
  if (!v) return new Date().toISOString()
  if (v instanceof Date) return v.toISOString()
  return v
}

/** Defensive: jsonb columns usually come back as parsed objects, but some
 *  postgres.js configurations or edge runtimes leave them as strings. */
function parseJson<T>(v: unknown): T | null {
  if (v === null || v === undefined) return null
  if (typeof v === 'string') {
    try { return JSON.parse(v) as T } catch { return null }
  }
  return v as T
}

function fromRunRow(row: RunRow): SourcingRun {
  return {
    id: row.id,
    triggeredBy: row.triggered_by,
    triggeredAt: toIso(row.triggered_at),
    trigger: row.trigger,
    inputBrief: row.input_brief ?? '',
    steps: parseJson<SourcingRun['steps']>(row.steps) ?? [],
    evidenceValidatedCount: row.evidence_validated_count,
    evaluationSurfacedCount: row.evaluation_surfaced_count,
    totalCostUsd: num(row.total_cost_usd),
    totalLatencyMs: row.total_latency_ms,
    promptVersion: row.prompt_version ?? '',
  }
}

function fromCandRow(row: CandRow): SourcingCandidate {
  return {
    id: row.id,
    companyName: row.company_name,
    npi: row.npi ?? '',
    taxonomyCode: row.taxonomy_code ?? '',
    taxonomyLabel: row.taxonomy_label ?? '',
    serviceCategory: row.service_category ?? '',
    geographyState: row.geography_state ?? '',
    geographyMetro: row.geography_metro ?? '',
    medicareRevenue: num(row.medicare_revenue),
    medicarePctAssumption: num(row.medicare_pct_assumption),
    extrapolatedTotalRevenue: num(row.extrapolated_total_revenue),
    revenueConfidenceBand: parseJson<[number, number]>(row.revenue_confidence_band) ?? [0, 0],
    isThirdParty: row.is_third_party ?? false,
    revenueOver5M: row.revenue_over_5m ?? false,
    overallConfidence: num(row.overall_confidence),
    evidence: parseJson<SourcingCandidate['evidence']>(row.evidence) ?? [],
    fitState: row.fit_state,
    reviewedBy: row.reviewed_by ?? undefined,
    reviewedAt: row.reviewed_at ? toIso(row.reviewed_at) : undefined,
    notes: row.notes ?? undefined,
    thesisFit: parseJson<SourcingCandidate['thesisFit']>(row.thesis_fit) ?? {
      financial: 0,
      serviceCategory: 0,
      commercialMix: 0,
      rateArbitrage: 0,
      msoOverlap: 0,
      staffReferrals: 0,
      total: 0,
    },
    disqualifiers: parseJson<SourcingCandidate['disqualifiers']>(row.disqualifiers) ?? {
      founderConcentration: false,
      msoAbsent: false,
      rateCeiling: false,
      priorAuthBurden: false,
      referralConcentration: false,
    },
  }
}

// ─── Public API ─────────────────────────────────────────────────

/**
 * Upsert the run row, then replace its candidate set — atomically.
 */
export async function setRun(
  run: SourcingRun,
  candidates: SourcingCandidate[],
): Promise<void> {
  const sql = getDb()

  await sql.begin(async tx => {
    await tx`
      insert into quadrant.sourcing_runs (
        id, triggered_by, triggered_at, trigger, input_brief, steps,
        evidence_validated_count, evaluation_surfaced_count,
        total_cost_usd, total_latency_ms, prompt_version
      ) values (
        ${run.id}, ${run.triggeredBy}, ${run.triggeredAt}, ${run.trigger},
        ${run.inputBrief ?? null}, ${JSON.stringify(run.steps)}::jsonb,
        ${run.evidenceValidatedCount}, ${run.evaluationSurfacedCount},
        ${run.totalCostUsd}, ${run.totalLatencyMs}, ${run.promptVersion ?? null}
      )
      on conflict (id) do update set
        triggered_by = excluded.triggered_by,
        triggered_at = excluded.triggered_at,
        trigger = excluded.trigger,
        input_brief = excluded.input_brief,
        steps = excluded.steps,
        evidence_validated_count = excluded.evidence_validated_count,
        evaluation_surfaced_count = excluded.evaluation_surfaced_count,
        total_cost_usd = excluded.total_cost_usd,
        total_latency_ms = excluded.total_latency_ms,
        prompt_version = excluded.prompt_version
    `

    await tx`delete from quadrant.sourcing_candidates where run_id = ${run.id}`

    for (const c of candidates) {
      await tx`
        insert into quadrant.sourcing_candidates (
          id, run_id, company_name, npi, taxonomy_code, taxonomy_label,
          service_category, geography_state, geography_metro,
          medicare_revenue, medicare_pct_assumption, extrapolated_total_revenue,
          revenue_confidence_band, is_third_party, revenue_over_5m,
          overall_confidence, evidence, thesis_fit, disqualifiers,
          fit_state, reviewed_by, reviewed_at, notes
        ) values (
          ${c.id}, ${run.id}, ${c.companyName}, ${c.npi ?? null},
          ${c.taxonomyCode ?? null}, ${c.taxonomyLabel ?? null},
          ${c.serviceCategory ?? null}, ${c.geographyState ?? null}, ${c.geographyMetro ?? null},
          ${c.medicareRevenue ?? null}, ${c.medicarePctAssumption ?? null},
          ${c.extrapolatedTotalRevenue ?? null},
          ${JSON.stringify(c.revenueConfidenceBand ?? null)}::jsonb,
          ${c.isThirdParty ?? null}, ${c.revenueOver5M ?? null},
          ${c.overallConfidence ?? null},
          ${JSON.stringify(c.evidence ?? [])}::jsonb,
          ${JSON.stringify(c.thesisFit ?? null)}::jsonb,
          ${JSON.stringify(c.disqualifiers ?? null)}::jsonb,
          ${c.fitState}, ${c.reviewedBy ?? null},
          ${c.reviewedAt ?? null}, ${c.notes ?? null}
        )
      `
    }
  })
}

export async function getRun(
  id: string,
): Promise<{ run: SourcingRun; candidates: SourcingCandidate[] } | null> {
  const sql = getDb()
  const runRows = await sql<RunRow[]>`
    select * from quadrant.sourcing_runs where id = ${id} limit 1
  `
  if (runRows.length === 0) return null

  const candRows = await sql<CandRow[]>`
    select * from quadrant.sourcing_candidates where run_id = ${id}
  `

  return {
    run: fromRunRow(runRows[0]),
    candidates: candRows.map(fromCandRow),
  }
}

export async function getLatestRunId(): Promise<string | null> {
  const sql = getDb()
  const rows = await sql<Array<{ id: string }>>`
    select id from quadrant.sourcing_runs
    order by triggered_at desc
    limit 1
  `
  return rows[0]?.id ?? null
}

export async function getLatestRun(): Promise<
  { run: SourcingRun; candidates: SourcingCandidate[] } | null
> {
  const id = await getLatestRunId()
  if (!id) return null
  return getRun(id)
}

export async function listRuns(): Promise<string[]> {
  const sql = getDb()
  const rows = await sql<Array<{ id: string }>>`
    select id from quadrant.sourcing_runs
    order by triggered_at desc
    limit 10
  `
  return rows.map(r => r.id)
}

export async function addLabelToRun(
  candidateId: string,
  fitState: FitState,
  reviewer?: string,
): Promise<SourcingCandidate | null> {
  const sql = getDb()
  const reviewedAt = new Date().toISOString()
  const rows = await sql<CandRow[]>`
    update quadrant.sourcing_candidates
    set fit_state = ${fitState},
        reviewed_by = ${reviewer ?? null},
        reviewed_at = ${reviewedAt}
    where id = ${candidateId}
    returning *
  `
  if (rows.length === 0) return null
  return fromCandRow(rows[0])
}
