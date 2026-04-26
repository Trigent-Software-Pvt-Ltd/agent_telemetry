import type { AEOSActor } from '@/types/aeos'

const HUMAN_ROLES = [
  ['h_technician', 'Master Technician', 'US-UT', ['skill_brake_diag_v3', 'skill_engine_misfire_diag_v2', 'skill_brake_pad_replace_v1', 'skill_oil_change_v1', 'skill_alignment_service_v1']],
  ['h_technician', 'Senior Technician', 'US-UT', ['skill_brake_diag_v3', 'skill_transmission_shudder_v1', 'skill_adas_calibration_v2', 'skill_steering_diag_v1']],
  ['h_technician', 'ADAS Specialist', 'US-CO', ['skill_adas_calibration_v2', 'skill_steering_diag_v1', 'skill_battery_health_v1']],
  ['h_cx_agent', 'Senior CX Agent', 'US-NV', ['skill_angry_customer_triage_v2', 'skill_billing_dispute_v1']],
  ['h_cx_agent', 'CX Lead', 'US-NV', ['skill_angry_customer_triage_v2', 'skill_billing_dispute_v1', 'skill_loyalty_offer_v1']],
  ['h_cx_agent', 'CX Coach', 'US-CA', ['skill_angry_customer_triage_v2', 'skill_billing_dispute_v1']],
  ['h_venue_operator', 'Floor Manager', 'US-NV', ['skill_venue_incident_triage_v1', 'skill_capacity_planning_v1', 'skill_show_run_v1']],
  ['h_venue_operator', 'Responsible Gaming Lead', 'US-NV', ['skill_responsible_gaming_intervention_v1']],
  ['h_venue_operator', 'Venue Ops Lead', 'EU-MT', ['skill_venue_incident_triage_v1', 'skill_responsible_gaming_intervention_v1']],
  ['h_compliance_lead', 'Senior Compliance Lead', 'EU-DE', ['skill_eu_ai_act_review_v1', 'skill_gdpr_dpia_v1', 'skill_works_council_brief_v1']],
  ['h_compliance_lead', 'Compliance Counsel', 'EU-FR', ['skill_eu_ai_act_review_v1', 'skill_works_council_brief_v1']],
  ['h_compliance_lead', 'Compliance Analyst', 'EU-DE', ['skill_gdpr_dpia_v1', 'skill_soc2_evidence_v1']],
  ['h_field_tech', 'Field Service Lead', 'US-TX', ['skill_field_dispatch_v1', 'skill_downed_line_dispatch_v1', 'skill_install_quote_v1']],
  ['h_field_tech', 'Senior Field Tech', 'US-CA', ['skill_downed_line_dispatch_v1', 'skill_pm_schedule_v1']],
  ['h_hr_lead', 'People Partner', 'US-UT', ['skill_q2_coaching_plan_v1', 'skill_hiring_brief_v1', 'skill_pip_review_v1']],
  ['h_hr_lead', 'HRBP — EMEA', 'EU-DE', ['skill_q2_coaching_plan_v1', 'skill_pip_review_v1']],
] as const

function readyHuman(idx: number): { readiness: number; fatigue: number; capacity: number } {
  // Vary readiness/fatigue across the population so UEF picks differentiated actors
  const phase = (idx * 0.37) % 1
  const readiness = 0.55 + phase * 0.4 // 0.55..0.95
  const fatigue = (1 - phase) * 0.5 // 0.05..0.5
  const capacity = 0.4 + ((idx * 0.13) % 0.55) // 0.4..0.95
  return { readiness, fatigue, capacity }
}

const HUMANS: AEOSActor[] = HUMAN_ROLES.flatMap(([prefix, role, region, skills], familyIdx) => {
  // 2-3 humans per role variant
  const count = 2 + (familyIdx % 2)
  return Array.from({ length: count }, (_, i): AEOSActor => {
    const idx = familyIdx * 3 + i
    const id = `${prefix}_${(idx + 1).toString().padStart(3, '0')}`
    const { readiness, fatigue, capacity } = readyHuman(idx)
    return {
      actor_id: id,
      type: 'human',
      display_name: `${role} ${id.slice(-3)}`,
      role,
      region,
      readiness,
      fatigue,
      capacity,
      authorized_skills: skills as unknown as string[],
    }
  })
})

const AGENTS: AEOSActor[] = [
  {
    actor_id: 'agent_claude_opus_4_7',
    type: 'agent',
    display_name: 'Claude Opus 4.7',
    role: 'Frontier reasoning agent',
    region: 'global',
    readiness: 0.92,
    fatigue: 0,
    capacity: 0.99,
    vendor: 'anthropic',
    model: 'claude-opus-4-7',
    authorized_skills: ['skill_brake_diag_v3', 'skill_engine_misfire_diag_v2', 'skill_eu_ai_act_review_v1', 'skill_gdpr_dpia_v1', 'skill_q2_coaching_plan_v1', 'skill_hiring_brief_v1'],
  },
  {
    actor_id: 'agent_claude_sonnet_4_6',
    type: 'agent',
    display_name: 'Claude Sonnet 4.6',
    role: 'Production reasoning agent',
    region: 'global',
    readiness: 0.88,
    fatigue: 0,
    capacity: 0.99,
    vendor: 'anthropic',
    model: 'claude-sonnet-4-6',
    authorized_skills: ['skill_brake_diag_v3', 'skill_emissions_diag_v1', 'skill_recall_lookup_v1', 'skill_warranty_eligibility_v1', 'skill_loyalty_offer_v1'],
  },
  {
    actor_id: 'agent_gpt_4o',
    type: 'agent',
    display_name: 'GPT-4o',
    role: 'Multimodal CX agent',
    region: 'global',
    readiness: 0.85,
    fatigue: 0,
    capacity: 0.99,
    vendor: 'openai',
    model: 'gpt-4o',
    authorized_skills: ['skill_angry_customer_triage_v2', 'skill_billing_dispute_v1', 'skill_appointment_scheduling_v1', 'skill_test_drive_followup_v1', 'skill_responsible_gaming_intervention_v1'],
  },
  {
    actor_id: 'agent_gpt_4o_mini',
    type: 'agent',
    display_name: 'GPT-4o-mini',
    role: 'High-throughput CX agent',
    region: 'global',
    readiness: 0.78,
    fatigue: 0,
    capacity: 0.99,
    vendor: 'openai',
    model: 'gpt-4o-mini',
    authorized_skills: ['skill_appointment_scheduling_v1', 'skill_test_drive_followup_v1', 'skill_recall_lookup_v1', 'skill_compensation_band_v1'],
  },
  {
    actor_id: 'agent_gemini_2_5_pro',
    type: 'agent',
    display_name: 'Gemini 2.5 Pro',
    role: 'Multimodal diagnosis agent',
    region: 'global',
    readiness: 0.84,
    fatigue: 0,
    capacity: 0.99,
    vendor: 'google_vertex',
    model: 'gemini-2.5-pro',
    authorized_skills: ['skill_battery_health_v1', 'skill_ev_charging_diag_v1', 'skill_capacity_planning_v1'],
  },
  {
    actor_id: 'agent_salesforce_agentforce',
    type: 'agent',
    display_name: 'Agentforce CX',
    role: 'CRM-native agent',
    region: 'global',
    readiness: 0.82,
    fatigue: 0,
    capacity: 0.99,
    vendor: 'salesforce',
    model: 'agentforce-1.5',
    authorized_skills: ['skill_appointment_scheduling_v1', 'skill_test_drive_followup_v1', 'skill_loyalty_offer_v1', 'skill_field_dispatch_v1', 'skill_install_quote_v1'],
  },
  {
    actor_id: 'agent_uniphore_bac',
    type: 'agent',
    display_name: 'Uniphore BAC',
    role: 'Voice-first CX agent',
    region: 'global',
    readiness: 0.81,
    fatigue: 0,
    capacity: 0.99,
    vendor: 'uniphore',
    model: 'bac-v3',
    authorized_skills: ['skill_angry_customer_triage_v2', 'skill_appointment_scheduling_v1'],
  },
  {
    actor_id: 'agent_cloudflare_workers_ai',
    type: 'agent',
    display_name: 'Cloudflare Workers AI',
    role: 'Edge-inference agent',
    region: 'global',
    readiness: 0.74,
    fatigue: 0,
    capacity: 0.99,
    vendor: 'cloudflare',
    model: 'llama-3.3-70b',
    authorized_skills: ['skill_recall_lookup_v1', 'skill_infotainment_diag_v1', 'skill_field_dispatch_v1', 'skill_pm_schedule_v1'],
  },
]

export const ACTORS: AEOSActor[] = [...HUMANS, ...AGENTS]

export function getActorById(id: string): AEOSActor | undefined {
  return ACTORS.find(a => a.actor_id === id)
}

export function listActorsAuthorizedForSkill(skillId: string): AEOSActor[] {
  return ACTORS.filter(a => a.authorized_skills.includes(skillId))
}

export function listAgents(): AEOSActor[] {
  return ACTORS.filter(a => a.type === 'agent')
}

export function listHumans(): AEOSActor[] {
  return ACTORS.filter(a => a.type === 'human')
}
