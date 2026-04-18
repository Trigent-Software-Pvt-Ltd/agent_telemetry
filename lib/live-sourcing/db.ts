/**
 * Supabase Postgres persistence helpers for sourcing runs.
 *
 * Tables (public schema, `quadrant_` prefix):
 *   quadrant_sourcing_runs        — one row per run
 *   quadrant_sourcing_candidates  — N rows per run (cascade delete)
 *
 * Uses the service-role key on the server side only — never imported from
 * client components. The caller is expected to have already checked
 * `isProvisioned()` via the API layer.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { SourcingCandidate, SourcingRun, FitState } from '@/lib/quadrant-mock'
import { isProvisioned } from './config'

const RUNS_TABLE = 'quadrant_sourcing_runs'
const CANDS_TABLE = 'quadrant_sourcing_candidates'

let _client: SupabaseClient | null = null

/**
 * Returns a singleton Supabase client bound to the service-role key.
 * Throws if env vars aren't present — API handlers should have already
 * returned 503 via `isProvisioned()` before reaching this point.
 */
export function getSupabase(): SupabaseClient {
  if (_client) return _client
  const missing = isProvisioned()
  if (missing.length > 0) {
    throw new Error(`Supabase not provisioned: missing ${missing.join(', ')}`)
  }
  _client = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      db: { schema: 'public' },
    },
  )
  return _client
}

// ─── Row <-> TS mapping ─────────────────────────────────────────

interface RunRow {
  id: string
  triggered_by: string
  triggered_at: string
  trigger: 'manual' | 'scheduled'
  input_brief: string | null
  steps: SourcingRun['steps']
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
  evidence: SourcingCandidate['evidence']
  thesis_fit: SourcingCandidate['thesisFit'] | null
  disqualifiers: SourcingCandidate['disqualifiers'] | null
  fit_state: FitState
  reviewed_by: string | null
  reviewed_at: string | null
  notes: string | null
}

function num(v: number | string | null | undefined, fallback = 0): number {
  if (v === null || v === undefined) return fallback
  const n = typeof v === 'number' ? v : Number.parseFloat(v)
  return Number.isFinite(n) ? n : fallback
}

function toRunRow(run: SourcingRun): RunRow {
  return {
    id: run.id,
    triggered_by: run.triggeredBy,
    triggered_at: run.triggeredAt,
    trigger: run.trigger,
    input_brief: run.inputBrief ?? null,
    steps: run.steps,
    evidence_validated_count: run.evidenceValidatedCount,
    evaluation_surfaced_count: run.evaluationSurfacedCount,
    total_cost_usd: run.totalCostUsd,
    total_latency_ms: run.totalLatencyMs,
    prompt_version: run.promptVersion ?? null,
  }
}

function fromRunRow(row: RunRow): SourcingRun {
  return {
    id: row.id,
    triggeredBy: row.triggered_by,
    triggeredAt: row.triggered_at,
    trigger: row.trigger,
    inputBrief: row.input_brief ?? '',
    steps: row.steps ?? [],
    evidenceValidatedCount: row.evidence_validated_count,
    evaluationSurfacedCount: row.evaluation_surfaced_count,
    totalCostUsd: num(row.total_cost_usd),
    totalLatencyMs: row.total_latency_ms,
    promptVersion: row.prompt_version ?? '',
  }
}

function toCandRow(runId: string, cand: SourcingCandidate): CandRow {
  return {
    id: cand.id,
    run_id: runId,
    company_name: cand.companyName,
    npi: cand.npi ?? null,
    taxonomy_code: cand.taxonomyCode ?? null,
    taxonomy_label: cand.taxonomyLabel ?? null,
    service_category: cand.serviceCategory ?? null,
    geography_state: cand.geographyState ?? null,
    geography_metro: cand.geographyMetro ?? null,
    medicare_revenue: cand.medicareRevenue ?? null,
    medicare_pct_assumption: cand.medicarePctAssumption ?? null,
    extrapolated_total_revenue: cand.extrapolatedTotalRevenue ?? null,
    revenue_confidence_band: cand.revenueConfidenceBand ?? null,
    is_third_party: cand.isThirdParty ?? null,
    revenue_over_5m: cand.revenueOver5M ?? null,
    overall_confidence: cand.overallConfidence ?? null,
    evidence: cand.evidence ?? [],
    thesis_fit: cand.thesisFit ?? null,
    disqualifiers: cand.disqualifiers ?? null,
    fit_state: cand.fitState,
    reviewed_by: cand.reviewedBy ?? null,
    reviewed_at: cand.reviewedAt ?? null,
    notes: cand.notes ?? null,
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
    revenueConfidenceBand: row.revenue_confidence_band ?? [0, 0],
    isThirdParty: row.is_third_party ?? false,
    revenueOver5M: row.revenue_over_5m ?? false,
    overallConfidence: num(row.overall_confidence),
    evidence: row.evidence ?? [],
    fitState: row.fit_state,
    reviewedBy: row.reviewed_by ?? undefined,
    reviewedAt: row.reviewed_at ?? undefined,
    notes: row.notes ?? undefined,
    thesisFit: row.thesis_fit ?? {
      financial: 0,
      serviceCategory: 0,
      commercialMix: 0,
      rateArbitrage: 0,
      msoOverlap: 0,
      staffReferrals: 0,
      total: 0,
    },
    disqualifiers: row.disqualifiers ?? {
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
 * Upsert the run row, then replace its candidate set.
 * Single-writer demo semantics — no explicit transaction.
 */
export async function setRun(
  run: SourcingRun,
  candidates: SourcingCandidate[],
): Promise<void> {
  const sb = getSupabase()

  const runUp = await sb.from(RUNS_TABLE).upsert(toRunRow(run), { onConflict: 'id' })
  if (runUp.error) {
    throw new Error(`setRun: upsert run failed: ${runUp.error.message}`)
  }

  const del = await sb.from(CANDS_TABLE).delete().eq('run_id', run.id)
  if (del.error) {
    throw new Error(`setRun: delete candidates failed: ${del.error.message}`)
  }

  if (candidates.length > 0) {
    const rows = candidates.map(c => toCandRow(run.id, c))
    const ins = await sb.from(CANDS_TABLE).insert(rows)
    if (ins.error) {
      throw new Error(`setRun: insert candidates failed: ${ins.error.message}`)
    }
  }
}

export async function getRun(
  id: string,
): Promise<{ run: SourcingRun; candidates: SourcingCandidate[] } | null> {
  const sb = getSupabase()

  const runRes = await sb
    .from(RUNS_TABLE)
    .select('*')
    .eq('id', id)
    .maybeSingle<RunRow>()
  if (runRes.error) {
    throw new Error(`getRun: select run failed: ${runRes.error.message}`)
  }
  if (!runRes.data) return null

  const candRes = await sb
    .from(CANDS_TABLE)
    .select('*')
    .eq('run_id', id)
  if (candRes.error) {
    throw new Error(`getRun: select candidates failed: ${candRes.error.message}`)
  }

  const candidates = ((candRes.data ?? []) as CandRow[]).map(fromCandRow)
  return { run: fromRunRow(runRes.data), candidates }
}

export async function getLatestRunId(): Promise<string | null> {
  const sb = getSupabase()
  const res = await sb
    .from(RUNS_TABLE)
    .select('id')
    .order('triggered_at', { ascending: false })
    .limit(1)
    .maybeSingle<{ id: string }>()
  if (res.error) {
    throw new Error(`getLatestRunId failed: ${res.error.message}`)
  }
  return res.data?.id ?? null
}

export async function getLatestRun(): Promise<
  { run: SourcingRun; candidates: SourcingCandidate[] } | null
> {
  const id = await getLatestRunId()
  if (!id) return null
  return getRun(id)
}

export async function listRuns(): Promise<string[]> {
  const sb = getSupabase()
  const res = await sb
    .from(RUNS_TABLE)
    .select('id')
    .order('triggered_at', { ascending: false })
    .limit(10)
  if (res.error) {
    throw new Error(`listRuns failed: ${res.error.message}`)
  }
  return ((res.data ?? []) as Array<{ id: string }>).map(r => r.id)
}

/**
 * Update a candidate's fit state + reviewer metadata by candidate id.
 * Returns the updated candidate or null if no row matched.
 */
export async function addLabelToRun(
  candidateId: string,
  fitState: FitState,
  reviewer?: string,
): Promise<SourcingCandidate | null> {
  const sb = getSupabase()
  const reviewedAt = new Date().toISOString()

  const res = await sb
    .from(CANDS_TABLE)
    .update({
      fit_state: fitState,
      reviewed_by: reviewer ?? null,
      reviewed_at: reviewedAt,
    })
    .eq('id', candidateId)
    .select('*')
    .maybeSingle<CandRow>()

  if (res.error) {
    throw new Error(`addLabelToRun failed: ${res.error.message}`)
  }
  if (!res.data) return null
  return fromCandRow(res.data)
}
