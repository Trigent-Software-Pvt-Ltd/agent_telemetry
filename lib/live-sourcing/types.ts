/**
 * Live-sourcing-only types. Keep this file small — reuse `SourcingRun`,
 * `TraceStep`, `SourcingCandidate`, `EvidenceItem`, `FitState` from
 * `@/lib/quadrant-mock`.
 */

/** One row of the CMS Medicare Physical Therapist utilization dataset. */
export interface CmsUtilizationRow {
  npi: string
  orgName: string
  state: string
  medicareAllowedAmount: number // USD
  billedEncounters: number
  fiscalYear: number
}

/** Captured telemetry for a single specialist LLM call. */
export interface SpecialistMetric {
  latencyMs: number
  tokensIn: number
  tokensOut: number
  costUsd: number
}

/** Minimal candidate shape returned by the Finder step. */
export interface FinderCandidate {
  npi: string
  orgName: string
  taxonomyCode: string
  taxonomyDescription: string
  enumerationType: 'NPI-1' | 'NPI-2'
  state: string
  city: string
}

/** Classifier verdict for a single candidate. */
export interface ClassificationResult {
  isThirdParty: boolean
  confidence: number
  rationale: string
  usedLlm: boolean
}

/** Estimator output for a single candidate. */
export interface EstimationResult {
  matched: boolean
  medicareRevenue: number
  medicarePctAssumption: number
  extrapolatedTotalRevenue: number
  revenueConfidenceBand: [number, number]
  revenueOver5M: boolean
  confidence: number
  billedEncounters: number | null
  fiscalYear: number | null
  note?: string
}
