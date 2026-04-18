/**
 * Business-Type Classifier.
 *
 * Discipline: rules in code, reasoning in the model.
 *   - Deterministic rules decide the obvious cases (NPI-1 solo, NPI-2 with
 *     hospital/system/clinic-network keywords).
 *   - The LLM (Bedrock Claude via `invokeClaude`) is only invoked for the
 *     ambiguous middle where keyword matching is insufficient.
 *
 * Returns a `ClassificationResult` plus the per-call `SpecialistMetric` when
 * the LLM was invoked (zero-valued metric when pure rules fired).
 */

import type { ClassificationResult, FinderCandidate, SpecialistMetric } from './types'
import { invokeClaude } from './telemetry'

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

const ZERO_METRIC: SpecialistMetric = {
  latencyMs: 0,
  tokensIn: 0,
  tokensOut: 0,
  costUsd: 0,
}

/**
 * Tolerant JSON parser. Strips code fences, then falls back to extracting the
 * first `{...}` block if the raw text contains prose around the JSON.
 */
function parseJsonStrict<T>(raw: string): T | null {
  const stripped = raw.trim().replace(/^```(?:json)?/, '').replace(/```$/, '').trim()
  try {
    const obj = JSON.parse(stripped)
    return obj as T
  } catch {
    const match = stripped.match(/\{[\s\S]*\}/)
    if (!match) return null
    try {
      return JSON.parse(match[0]) as T
    } catch {
      return null
    }
  }
}

function hasCaptiveKeyword(name: string): boolean {
  const lower = name.toLowerCase()
  return CAPTIVE_KEYWORDS.some(k => lower.includes(k))
}

function hasAmbiguousKeyword(name: string): boolean {
  const lower = name.toLowerCase()
  return AMBIGUOUS_KEYWORDS.some(k => lower.includes(k))
}

/** Clamp a number into [0, 1]. NaN / non-finite -> 0.5 (mid-confidence). */
function clampConfidence(n: unknown): number {
  const x = typeof n === 'number' ? n : Number.parseFloat(String(n))
  if (!Number.isFinite(x)) return 0.5
  if (x < 0) return 0
  if (x > 1) return 1
  return x
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

  // Ambiguous fallback — hand to the LLM via Bedrock.
  const userPrompt = `Classify the following organization: is it a third-party service provider (vs a captive practice, hospital subsidiary, or integrated health system)?

NPI: ${candidate.npi}
Organization name: ${candidate.orgName}
Taxonomy: ${candidate.taxonomyDescription} (${candidate.taxonomyCode})
State: ${candidate.state}
City: ${candidate.city ?? 'unknown'}

Respond with strict JSON matching this exact shape:
{"isThirdParty": boolean, "rationale": "<<one short sentence>>", "confidence": <number between 0 and 1>}`

  const { text, metric } = await invokeClaude({
    system:
      'You classify healthcare businesses for private-equity sourcing. Output strict JSON only, no prose.',
    userPrompt,
    maxTokens: 200,
    temperature: 0,
  })

  const parsed = parseJsonStrict<ClassificationResult>(text)

  if (!parsed) {
    return {
      result: {
        isThirdParty: true, // lean include; human reviewer decides
        confidence: 0.4,
        rationale: 'LLM output not parseable; defaulting to include for human review.',
        usedLlm: true,
      },
      metric,
    }
  }

  return {
    result: {
      isThirdParty: Boolean(parsed.isThirdParty),
      confidence: clampConfidence(parsed.confidence),
      rationale:
        typeof parsed.rationale === 'string' && parsed.rationale.trim() !== ''
          ? parsed.rationale
          : 'No rationale provided by model.',
      usedLlm: true,
    },
    metric,
  }
}
