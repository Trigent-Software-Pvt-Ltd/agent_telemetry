/**
 * CMS Medicare Physical Therapist utilization lookup.
 *
 * Backed by `data/cms-pt-utilization.json` — an array of `CmsUtilizationRow`.
 * The data agent populates this file; this module exposes `lookupByNpi` for
 * the Estimator step.
 */

import cmsRaw from '@/data/cms-pt-utilization.json'
import type { CmsUtilizationRow } from './types'

// The JSON import is typed as unknown[] — cast via the shared interface.
const ROWS = cmsRaw as CmsUtilizationRow[]

// Build a simple in-memory index once at module load.
const INDEX: Map<string, CmsUtilizationRow> = new Map(
  ROWS.filter(r => r && typeof r.npi === 'string').map(r => [r.npi, r]),
)

/** Exact-match NPI lookup. Returns null if no match. */
export function lookupByNpi(npi: string): CmsUtilizationRow | null {
  return INDEX.get(npi) ?? null
}

/** Returns number of rows loaded — useful for diagnostics. */
export function datasetSize(): number {
  return ROWS.length
}
