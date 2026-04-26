// EAI computation — derives the Enterprise Autonomy Index and sub-metrics
// from a set of LedgerRows. Mirrors the reference Python in
// packages/economic_ledger/metrics.py (compute_eai, compute_hpi, compute_hlr,
// compute_ucs, compute_sy, compute_ser, compute_eroi).

import type { AEOSTenantId, EAIBreakdown, EAITimePoint, LedgerRow, SignaturePair } from '@/types/aeos'
import { mulberry32, AEOS_SEED, mockHex, clamp } from './prng'
import { getLedgerRowsForTenant } from './seed/ledger'

function avg(xs: number[]): number {
  if (xs.length === 0) return 0
  return xs.reduce((s, x) => s + x, 0) / xs.length
}

export function computeEAIBreakdown(rows: LedgerRow[], tenantId: AEOSTenantId): EAIBreakdown {
  if (rows.length === 0) {
    const rand = mulberry32(AEOS_SEED + tenantId.length)
    return {
      eai: 0,
      ai_adjusted_task_share: 0,
      success_rate: 0,
      governance_factor: 0,
      economic_return_factor: 0,
      hybrid_execution_share: 0,
      preservation_factor: 0,
      control_failures: 0,
      risk_penalties: 0,
      row_count: 0,
      ucs: 0,
      sy: 0,
      ser: 0,
      eroi: 0,
      hpi: 0,
      hlr: 0,
      signature_pair: emptySignature(rand),
    }
  }

  const aiTaskShare = avg(rows.map(r => r.eai_contribution.ai_task_share))
  const successRate = rows.filter(r => r.success).length / rows.length
  const govFactor = avg(rows.map(r => r.eai_contribution.governance_factor))
  const econFactor = avg(rows.map(r => r.eai_contribution.economic_return_factor))
  const hybridShare =
    rows.filter(r => r.selected_path.startsWith('hybrid_')).length / rows.length
  const preservation =
    rows.filter(r => r.selected_path === 'human' || r.selected_path.startsWith('hybrid_')).length /
    Math.max(1, rows.length)
  const controlFailures = rows.filter(r => r.eai_contribution.governance_factor <= 0.5).length
  const riskPenalties = avg(rows.map(r => (r.variance.technical.exceeds_tolerance ? 0.4 : 0)))

  // Sub-metrics
  const ucs = avg(rows.map(r => r.actual.value_usd > 0 ? Math.abs(r.actual.value_usd - r.predicted.value_usd) : 0))
  const sy = successRate
  const ser = ucs > 0 ? sy / ucs : sy
  const eroi = avg(
    rows.map(r => r.actual.value_usd - r.predicted.value_usd * 0.6 - (r.variance.economic.cost_per_outcome_delta_usd ?? 0) * 100)
  )
  const strategicRows = rows.filter(r => {
    // Approximate "strategic" via the row's preservation_factor flag
    return r.eai_contribution.preservation_factor >= 0.5
  })
  const hpi = strategicRows.length === 0 ? 0 :
    strategicRows.filter(r => r.selected_path === 'human' || r.selected_path.startsWith('hybrid_')).length /
    strategicRows.length
  const hybridRows = rows.filter(r => r.selected_path.startsWith('hybrid_'))
  const humanRows = rows.filter(r => r.selected_path === 'human')
  const agentRows = rows.filter(r => !r.selected_path.startsWith('hybrid_') && r.selected_path !== 'human')
  const meanERoi = (rs: LedgerRow[]) =>
    rs.length === 0 ? 0 : avg(rs.map(r => r.actual.value_usd - r.predicted.value_usd * 0.6))
  const hlrDenom = Math.max(meanERoi(humanRows), meanERoi(agentRows), 0.01)
  const hlr = meanERoi(hybridRows) / hlrDenom

  // EAI formula:
  // eai = (ai_task_share × success_rate × governance × econ)
  //     + (hybrid_share × preservation)
  //     − (control_failures_normalized + risk_penalties)
  const eai = clamp(
    aiTaskShare * successRate * govFactor * clamp(econFactor + 0.5, 0, 1.5) +
      hybridShare * preservation -
      (controlFailures / Math.max(1, rows.length)) -
      riskPenalties * 0.4,
    -0.5,
    1.5,
  )

  const rand = mulberry32(AEOS_SEED + tenantId.length * 5 + rows.length)
  return {
    eai: +eai.toFixed(3),
    ai_adjusted_task_share: +aiTaskShare.toFixed(3),
    success_rate: +successRate.toFixed(3),
    governance_factor: +govFactor.toFixed(3),
    economic_return_factor: +econFactor.toFixed(3),
    hybrid_execution_share: +hybridShare.toFixed(3),
    preservation_factor: +preservation.toFixed(3),
    control_failures: controlFailures,
    risk_penalties: +riskPenalties.toFixed(3),
    row_count: rows.length,
    ucs: +ucs.toFixed(2),
    sy: +sy.toFixed(3),
    ser: +ser.toFixed(3),
    eroi: +eroi.toFixed(2),
    hpi: +hpi.toFixed(3),
    hlr: +hlr.toFixed(3),
    signature_pair: emptySignature(rand),
  }
}

function emptySignature(rand: () => number): SignaturePair {
  return {
    fuzebox: { algorithm: 'ed25519', key_id: 'fuzebox-kms-primary', signature: mockHex(rand, 128) },
    rpotential: { algorithm: 'hmac-sha256', key_id: 'rpotential-witness-1', signature: mockHex(rand, 64) },
    signed_at: '2026-04-26T08:00:00.000Z',
  }
}

export function computeEAITimeSeries(tenantId: AEOSTenantId, windowDays = 30): EAITimePoint[] {
  const rows = getLedgerRowsForTenant(tenantId)
  if (rows.length === 0) return []
  const points: EAITimePoint[] = []
  const today = new Date('2026-04-26T00:00:00.000Z').getTime()
  const dayMs = 24 * 60 * 60 * 1000

  // For each day, aggregate rows from a sliding 5-day window ending that day
  for (let d = windowDays - 1; d >= 0; d--) {
    const dayEnd = today - d * dayMs
    const dayStart = dayEnd - 5 * dayMs
    const window = rows.filter(r => {
      const t = new Date(r.timestamp).getTime()
      return t >= dayStart && t <= dayEnd
    })
    const breakdown = computeEAIBreakdown(window, tenantId)
    points.push({
      day: new Date(dayEnd).toISOString().slice(0, 10),
      eai: breakdown.eai,
      hpi: breakdown.hpi,
      hlr: breakdown.hlr,
    })
  }

  // Tag inflection points where the demo synthesized a rule
  // (timed evenly across the window)
  const inflectionAt = [Math.floor(windowDays * 0.20), Math.floor(windowDays * 0.55), Math.floor(windowDays * 0.85)]
  const inflections = [
    {
      rule_id: 'dir_compliance_citation_density',
      description: 'Synthesized — citation density rule fired across compliance workload',
    },
    {
      rule_id: 'dir_responsible_gaming_loss_streak',
      description: 'Synthesized — responsible-gaming intervention escalation',
    },
    {
      rule_id: 'dir_brake_diag_hallucination_guard',
      description: 'Synthesized — TSB citation guard for brake diagnosis',
    },
  ]
  inflectionAt.forEach((idx, i) => {
    if (points[idx]) points[idx].inflection = inflections[i]
  })

  return points
}
