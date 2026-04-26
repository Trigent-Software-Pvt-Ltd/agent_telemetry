import type { AEOSTenantId, SignalSnapshot } from '@/types/aeos'
import { mulberry32, AEOS_SEED, range, clamp } from '@/lib/aeos/prng'
import { SKILLS } from './skills'
import { ACTORS } from './actors'

export function getSignalSnapshot(tenantId: AEOSTenantId): SignalSnapshot {
  const seed = AEOS_SEED + tenantId.length * 13
  const rand = mulberry32(seed)

  const gsti: Record<string, number> = {}
  const drift: Record<string, number> = {}
  for (const s of SKILLS) {
    // GSTI tracks strategic_weight + a tenant-stable wobble
    gsti[s.skill_id] = clamp(s.strategic_weight + range(rand, -0.08, 0.08), 0, 1)
    drift[s.skill_id] = clamp(s.drift_risk + range(rand, -0.05, 0.05), 0, 1)
  }

  const uop_by_actor: Record<string, { readiness: number; fatigue: number; capacity: number }> = {}
  for (const a of ACTORS) {
    uop_by_actor[a.actor_id] = {
      readiness: a.readiness,
      fatigue: a.fatigue,
      capacity: a.capacity,
    }
  }

  const coordination_tax: Record<string, number> = {
    diagnostic: 0.15,
    repair: 0.18,
    customer_triage: 0.13,
    venue_incident: 0.18,
    venue_capacity: 0.10,
    show_run: 0.21,
    responsible_gaming_intervention: 0.16,
    eu_ai_act_review: 0.22,
    gdpr_dpia: 0.19,
    soc2_evidence: 0.12,
    works_council_brief: 0.24,
    field_dispatch: 0.09,
    downed_line_dispatch: 0.14,
    install_quote: 0.08,
    pm_schedule: 0.06,
    coaching_plan: 0.16,
    hiring_brief: 0.11,
    compensation_band: 0.05,
    pip_review: 0.20,
    sportsbook_recommendation: 0.07,
    appointment_scheduling: 0.04,
    test_drive_followup: 0.05,
    loyalty_offer: 0.06,
  }

  return {
    tenant_id: tenantId,
    observed_at: '2026-04-26T08:00:00.000Z',
    gsti,
    drift,
    uop_by_actor,
    coordination_tax,
  }
}
