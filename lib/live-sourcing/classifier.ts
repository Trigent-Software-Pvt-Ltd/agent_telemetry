/**
 * Business-Type Classifier.
 *
 * Discipline: rules in code, reasoning in the model.
 *   - Deterministic rules decide the obvious cases (NPI-1 solo, NPI-2 with
 *     hospital/system/clinic-network keywords).
 *   - The LLM (`generateObject`) is only invoked for the ambiguous middle
 *     where keyword matching is insufficient.
 *
 * Returns a `ClassificationResult` plus the per-call `SpecialistMetric` when
 * the LLM was invoked (zero-valued metric when pure rules fired).
 */

import { z } from 'zod'
import type { ClassificationResult, FinderCandidate, SpecialistMetric } from './types'
import { runObject } from './telemetry'

const CAPTIVE_KEYWORDS = [
  'hospital',
  'medical center',
  'health system',
  'clinic network',
  'healthcare system',
  'university',
  'va medical',
]

/**
 * Tokens that by themselves are ambiguous — they could indicate either an
 * independent group practice or a hospital-affiliated department.
 * When an NPI-2 name contains one of these AND no clear captive keyword,
 * we hand the decision to the LLM instead of defaulting to third-party.
 */
const AMBIGUOUS_KEYWORDS = ['children', 'regional', 'memorial', 'baptist', 'mercy', 'saint ', 'st.']

const ClassifierSchema = z.object({
  isThirdParty: z.boolean(),
  rationale: z.string().min(1).max(400),
  confidence: z.number().min(0).max(1),
})

type LlmClassification = z.infer<typeof ClassifierSchema>

const ZERO_METRIC: SpecialistMetric = {
  latencyMs: 0,
  tokensIn: 0,
  tokensOut: 0,
  costUsd: 0,
}

function hasCaptiveKeyword(name: string): boolean {
  const lower = name.toLowerCase()
  return CAPTIVE_KEYWORDS.some(k => lower.includes(k))
}

function hasAmbiguousKeyword(name: string): boolean {
  const lower = name.toLowerCase()
  return AMBIGUOUS_KEYWORDS.some(k => lower.includes(k))
}

/**
 * Classify a single Finder candidate. Falls back to the LLM only when the
 * deterministic rules can't reach a confident verdict.
 */
export async function classifyCandidate(
  candidate: FinderCandidate,
): Promise<{ result: ClassificationResult; metric: SpecialistMetric }> {
  // Rule 1: NPI-1 (individual) -> solo practitioner, not a 3rd-party platform.
  if (candidate.enumerationType === 'NPI-1') {
    return {
      result: {
        isThirdParty: false,
        confidence: 0.9,
        rationale: 'NPI-1 enumeration indicates an individual practitioner, not a third-party platform.',
        usedLlm: false,
      },
      metric: ZERO_METRIC,
    }
  }

  // Rule 2: NPI-2 (org) with hospital/system keywords -> captive/non-third-party.
  if (hasCaptiveKeyword(candidate.orgName)) {
    return {
      result: {
        isThirdParty: false,
        confidence: 0.85,
        rationale: `Organisation name contains a captive-system keyword (${candidate.orgName}).`,
        usedLlm: false,
      },
      metric: ZERO_METRIC,
    }
  }

  // Rule 3: NPI-2 (org) with a clean name and no ambiguous tokens -> likely
  // third-party at 0.8 confidence. Matches the locked contract: rules carry
  // the easy cases through without an LLM call.
  if (candidate.enumerationType === 'NPI-2' && !hasAmbiguousKeyword(candidate.orgName)) {
    return {
      result: {
        isThirdParty: true,
        confidence: 0.8,
        rationale:
          'NPI-2 organisation with no captive-system keyword in the registered name. Likely independent third-party.',
        usedLlm: false,
      },
      metric: ZERO_METRIC,
    }
  }

  // Ambiguous fallback — hand to the LLM.
  const prompt = [
    'Classify whether this healthcare provider is a THIRD-PARTY service business',
    '(i.e. independent, sellable entity) or a CAPTIVE provider (hospital-owned,',
    'health-system-owned, or employed by a larger medical institution).',
    '',
    `Organisation: ${candidate.orgName}`,
    `NPI: ${candidate.npi}`,
    `Enumeration type: ${candidate.enumerationType}`,
    `Taxonomy: ${candidate.taxonomyDescription} (${candidate.taxonomyCode})`,
    `Location: ${candidate.city}, ${candidate.state}`,
    '',
    'Return a boolean verdict, a short rationale, and a confidence in [0,1].',
  ].join('\n')

  const { object, metric } = await runObject<LlmClassification>({
    system:
      'You are a healthcare M&A research analyst. Be concise and conservative. ' +
      'If uncertain, err toward isThirdParty=false with lower confidence.',
    prompt,
    schema: ClassifierSchema,
    schemaName: 'BusinessTypeClassification',
    temperature: 0.1,
    maxOutputTokens: 300,
  })

  return {
    result: {
      isThirdParty: object.isThirdParty,
      confidence: object.confidence,
      rationale: object.rationale,
      usedLlm: true,
    },
    metric,
  }
}
