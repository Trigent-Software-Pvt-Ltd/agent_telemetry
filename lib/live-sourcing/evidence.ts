/**
 * Evidence assembly — builds the `EvidenceItem[]` attached to each candidate.
 *
 * Each claim carries a source URL, a human-readable source label, and a
 * confidence in [0,1]. The UI uses these to render the per-candidate
 * provenance trail.
 */

import type { EvidenceItem } from '@/lib/quadrant-mock'
import type { ClassificationResult, EstimationResult, FinderCandidate } from './types'

const NPI_LOOKUP_BASE = 'https://npiregistry.cms.hhs.gov/api/?number='
const CMS_PROVIDER_DATA = 'https://data.cms.gov/provider-data/'

export function buildEvidence(args: {
  candidate: FinderCandidate
  classification: ClassificationResult
  estimation: EstimationResult
}): EvidenceItem[] {
  const { candidate, classification, estimation } = args
  const items: EvidenceItem[] = []

  items.push({
    claim: `NPI ${candidate.npi} (${candidate.enumerationType}) registered as "${candidate.orgName}" under taxonomy ${candidate.taxonomyCode} — ${candidate.taxonomyDescription}.`,
    sourceUrl: `${NPI_LOOKUP_BASE}${candidate.npi}`,
    sourceLabel: 'NPI Registry',
    confidence: 0.96,
  })

  if (estimation.matched) {
    const fy = estimation.fiscalYear ? `FY${estimation.fiscalYear}` : 'most recent FY'
    const encounters =
      estimation.billedEncounters !== null
        ? ` across ${estimation.billedEncounters.toLocaleString()} billed encounters`
        : ''
    items.push({
      claim: `Medicare utilization ${fy}: $${estimation.medicareRevenue.toLocaleString()}${encounters}. Extrapolated total ≈ $${estimation.extrapolatedTotalRevenue.toLocaleString()} at ${(estimation.medicarePctAssumption * 100).toFixed(0)}% Medicare share.`,
      sourceUrl: CMS_PROVIDER_DATA,
      sourceLabel: 'CMS Medicare Utilization',
      confidence: estimation.confidence,
    })
  } else {
    items.push({
      claim: `No CMS Medicare utilization match for NPI ${candidate.npi}. Revenue gate cannot be validated from CMS alone.`,
      sourceUrl: CMS_PROVIDER_DATA,
      sourceLabel: 'CMS Medicare Utilization',
      confidence: estimation.confidence,
    })
  }

  items.push({
    claim: `Classifier verdict: ${classification.isThirdParty ? 'third-party service provider' : 'not third-party'}. ${classification.rationale}`,
    sourceUrl: `${NPI_LOOKUP_BASE}${candidate.npi}`,
    sourceLabel: classification.usedLlm ? 'Claude classifier (LLM)' : 'Deterministic rules',
    confidence: classification.confidence,
  })

  return items
}

export function meanConfidence(items: EvidenceItem[]): number {
  if (items.length === 0) return 0
  const sum = items.reduce((a, i) => a + i.confidence, 0)
  return Number((sum / items.length).toFixed(2))
}
