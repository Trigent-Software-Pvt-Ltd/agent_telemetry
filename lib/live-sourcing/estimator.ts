/**
 * Revenue Estimator — deterministic math, no LLM.
 *
 * Given an NPI, look up the CMS Medicare utilization row, assume a Medicare
 * revenue share of 32% (±7% confidence band), and extrapolate total revenue.
 * Pass the $5M gate if the midpoint extrapolated revenue clears the threshold.
 */

import { lookupByNpi } from './cms-data'
import type { EstimationResult } from './types'

export const DEFAULT_MEDICARE_PCT = 0.32
export const BAND_HALF_WIDTH = 0.07 // ± around default Medicare share
export const MIN_PCT = 0.25 // floor — avoid absurdly large extrapolations
export const MAX_PCT = 0.39
export const REVENUE_THRESHOLD_USD = 5_000_000

export function estimateByNpi(npi: string): EstimationResult {
  const row = lookupByNpi(npi)

  if (!row) {
    return {
      matched: false,
      medicareRevenue: 0,
      medicarePctAssumption: DEFAULT_MEDICARE_PCT,
      extrapolatedTotalRevenue: 0,
      revenueConfidenceBand: [0, 0],
      revenueOver5M: false,
      confidence: 0.3,
      billedEncounters: null,
      fiscalYear: null,
      note: 'No CMS utilization match for this NPI.',
    }
  }

  const medicareRevenue = row.medicareAllowedAmount
  const mid = medicareRevenue / DEFAULT_MEDICARE_PCT
  // Wider Medicare share -> smaller extrapolated total. Pick the band using
  // MIN_PCT / MAX_PCT rather than simple addition so we don't divide by zero.
  const upper = medicareRevenue / Math.max(DEFAULT_MEDICARE_PCT - BAND_HALF_WIDTH, MIN_PCT)
  const lower = medicareRevenue / Math.min(DEFAULT_MEDICARE_PCT + BAND_HALF_WIDTH, MAX_PCT)
  const band: [number, number] = [
    Math.round(lower / 1000) * 1000,
    Math.round(upper / 1000) * 1000,
  ]

  return {
    matched: true,
    medicareRevenue,
    medicarePctAssumption: DEFAULT_MEDICARE_PCT,
    extrapolatedTotalRevenue: Math.round(mid),
    revenueConfidenceBand: band,
    revenueOver5M: mid >= REVENUE_THRESHOLD_USD,
    confidence: 0.82,
    billedEncounters: row.billedEncounters ?? null,
    fiscalYear: row.fiscalYear ?? null,
  }
}
