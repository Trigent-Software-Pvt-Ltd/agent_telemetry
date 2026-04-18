/**
 * Sourcing Manager — orchestrates Finder -> Classifier -> Estimator.
 *
 * Responsibilities:
 *   1. Run the Finder against the NPI Registry.
 *   2. Run the rule-first Classifier over each Finder candidate; drop the
 *      non-third-party ones; aggregate classifier telemetry.
 *   3. Run the deterministic Estimator over the third-party survivors;
 *      aggregate estimator metrics (all $0 — no LLM).
 *   4. Assemble EvidenceItem[] per candidate and compute the overall
 *      confidence (mean of per-claim confidences).
 *   5. Build a `SourcingRun` with three `TraceStep` entries and persist
 *      the run + candidates to Redis (also updating the latest pointer).
 *
 * Cost cap: if projected cost exceeds MAX_RUN_COST_USD mid-flight, aborts
 * with a thrown `MaxCostExceededError` so the API layer can surface 500.
 */

import type {
  EvidenceItem,
  FitState,
  SourcingCandidate,
  SourcingRun,
  TraceStep,
} from '@/lib/quadrant-mock'
import { getMaxRunCostUsd } from './config'
import { classifyCandidate } from './classifier'
import { buildEvidence, meanConfidence } from './evidence'
import { estimateByNpi } from './estimator'
import { findCandidates } from './finder'
import { setRun } from './db'
import { sumMetrics } from './telemetry'
import type {
  ClassificationResult,
  EstimationResult,
  FinderCandidate,
  SpecialistMetric,
} from './types'

export class MaxCostExceededError extends Error {
  constructor(public cost: number, public cap: number) {
    super(`Projected run cost $${cost.toFixed(2)} exceeds cap $${cap.toFixed(2)}`)
    this.name = 'MaxCostExceededError'
  }
}

export interface ManagerRunArgs {
  taxonomy?: string
  states?: string[]
  limit?: number
  triggeredBy?: string
}

export interface ManagerRunResult {
  run: SourcingRun
  candidates: SourcingCandidate[]
}

const ZERO_METRIC: SpecialistMetric = {
  latencyMs: 0,
  tokensIn: 0,
  tokensOut: 0,
  costUsd: 0,
}

function runId(): string {
  // yyyy-mm-dd-HHMMSS in UTC
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}-${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}`
  return `srun-live-${stamp}`
}

function inferServiceCategory(taxonomy: string): string {
  if (taxonomy === '225100000X') return 'Outpatient Physical Therapy — Tier 1'
  return `Taxonomy ${taxonomy}`
}

function inferMetro(state: string, city: string): string {
  if (city) return `${city}, ${state}`
  return state
}

/**
 * Builds a fully-populated `SourcingCandidate` from the pipeline outputs.
 * Fields that don't apply to a live run (thesisFit, disqualifiers, groundTruth)
 * get reasonable defaults per the contract.
 */
function assembleCandidate(args: {
  index: number
  runId: string
  finder: FinderCandidate
  classification: ClassificationResult
  estimation: EstimationResult
  evidence: EvidenceItem[]
  taxonomy: string
}): SourcingCandidate {
  const { index, runId, finder, classification, estimation, evidence, taxonomy } = args
  return {
    id: `live-${runId}-${index + 1}`,
    companyName: finder.orgName,
    npi: finder.npi,
    taxonomyCode: finder.taxonomyCode || taxonomy,
    taxonomyLabel: finder.taxonomyDescription || 'Physical Therapist',
    serviceCategory: inferServiceCategory(taxonomy),
    geographyState: finder.state,
    geographyMetro: inferMetro(finder.state, finder.city),
    medicareRevenue: estimation.medicareRevenue,
    medicarePctAssumption: Number(estimation.medicarePctAssumption.toFixed(3)),
    extrapolatedTotalRevenue: estimation.extrapolatedTotalRevenue,
    revenueConfidenceBand: estimation.revenueConfidenceBand,
    isThirdParty: classification.isThirdParty,
    revenueOver5M: estimation.revenueOver5M,
    overallConfidence: meanConfidence(evidence),
    evidence,
    fitState: 'unreviewed' as FitState,
    groundTruth: undefined,
    thesisFit: {
      financial: 50,
      serviceCategory: 50,
      commercialMix: 50,
      rateArbitrage: 50,
      msoOverlap: 50,
      staffReferrals: 50,
      total: 50,
    },
    disqualifiers: {
      founderConcentration: false,
      msoAbsent: false,
      rateCeiling: false,
      priorAuthBurden: false,
      referralConcentration: false,
    },
  }
}

function toTraceStep(args: {
  id: string
  stepNumber: number
  specialist: string
  description: string
  inputCount: number
  outputCount: number
  metric: SpecialistMetric
  status?: 'ok' | 'error'
}): TraceStep {
  return {
    id: args.id,
    stepNumber: args.stepNumber,
    specialist: args.specialist,
    description: args.description,
    inputCount: args.inputCount,
    outputCount: args.outputCount,
    latencyMs: args.metric.latencyMs,
    tokensIn: args.metric.tokensIn,
    tokensOut: args.metric.tokensOut,
    costUsd: Number(args.metric.costUsd.toFixed(6)),
    status: args.status ?? 'ok',
  }
}

export async function runSourcingManager(args: ManagerRunArgs): Promise<ManagerRunResult> {
  const taxonomy = args.taxonomy ?? '225100000X'
  const states = args.states ?? ['TX', 'FL', 'CA']
  const limit = args.limit ?? 30
  const triggeredBy = args.triggeredBy ?? 'Sam Stillman'
  const costCap = getMaxRunCostUsd()

  // ── Step 1: Finder ───────────────────────────────────────────────
  const finderStarted = Date.now()
  const finderOut = await findCandidates({ taxonomy, states, limit })
  const finderMetric: SpecialistMetric = {
    ...ZERO_METRIC,
    latencyMs: Date.now() - finderStarted,
  }

  // ── Step 2: Classifier ──────────────────────────────────────────
  const classifierMetrics: SpecialistMetric[] = []
  const thirdParty: Array<{ finder: FinderCandidate; classification: ClassificationResult }> = []

  for (const cand of finderOut) {
    const { result, metric } = await classifyCandidate(cand)
    classifierMetrics.push(metric)
    if (result.isThirdParty) thirdParty.push({ finder: cand, classification: result })

    const runningCost = sumMetrics(classifierMetrics).costUsd
    if (runningCost > costCap) {
      throw new MaxCostExceededError(runningCost, costCap)
    }
  }
  const classifierMetric = sumMetrics(classifierMetrics)

  // ── Step 3: Estimator ───────────────────────────────────────────
  const estimatorStarted = Date.now()
  const candidates: SourcingCandidate[] = []
  const id = runId()

  for (let i = 0; i < thirdParty.length; i++) {
    const { finder, classification } = thirdParty[i]
    const estimation = estimateByNpi(finder.npi)
    const evidence = buildEvidence({ candidate: finder, classification, estimation })
    candidates.push(
      assembleCandidate({
        index: i,
        runId: id,
        finder,
        classification,
        estimation,
        evidence,
        taxonomy,
      }),
    )
  }
  const estimatorMetric: SpecialistMetric = {
    ...ZERO_METRIC,
    latencyMs: Date.now() - estimatorStarted,
  }

  // ── Assemble run ────────────────────────────────────────────────
  const evidenceValidatedCount = candidates.filter(
    c => c.evidence.length >= 3 && c.overallConfidence >= 0.5,
  ).length
  const evaluationSurfacedCount = candidates.filter(
    c => c.isThirdParty && c.revenueOver5M,
  ).length

  const steps: TraceStep[] = [
    toTraceStep({
      id: 'step-finder',
      stepNumber: 1,
      specialist: 'finder',
      description: `NPI taxonomy ${taxonomy} across ${states.join(', ')} (limit ${limit})`,
      inputCount: 0,
      outputCount: finderOut.length,
      metric: finderMetric,
    }),
    toTraceStep({
      id: 'step-classifier',
      stepNumber: 2,
      specialist: 'classifier',
      description: `Rule-first third-party classification (LLM fallback for ambiguous names)`,
      inputCount: finderOut.length,
      outputCount: thirdParty.length,
      metric: classifierMetric,
    }),
    toTraceStep({
      id: 'step-estimator',
      stepNumber: 3,
      specialist: 'estimator',
      description: `CMS lookup + Medicare-share revenue extrapolation ($5M gate)`,
      inputCount: thirdParty.length,
      outputCount: evaluationSurfacedCount,
      metric: estimatorMetric,
    }),
  ]

  const total = sumMetrics([finderMetric, classifierMetric, estimatorMetric])

  const run: SourcingRun = {
    id,
    triggeredBy,
    triggeredAt: new Date().toISOString(),
    trigger: 'manual',
    inputBrief: `Live run: taxonomy ${taxonomy}, states ${states.join('/')}, limit ${limit}`,
    steps,
    evidenceValidatedCount,
    evaluationSurfacedCount,
    totalCostUsd: Number(total.costUsd.toFixed(6)),
    totalLatencyMs: total.latencyMs,
    promptVersion: 'live-v1',
  }

  await setRun(run, candidates)
  return { run, candidates }
}
