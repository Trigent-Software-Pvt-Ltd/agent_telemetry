import type { ImprovementRecommendation } from '@/types/aeos'
import { mulberry32, AEOS_SEED, mockHex } from '@/lib/aeos/prng'

const rand = mulberry32(AEOS_SEED + 71)

function sig() {
  return {
    fuzebox: { algorithm: 'ed25519' as const, key_id: 'fuzebox-kms-primary', signature: mockHex(rand, 128) },
    rpotential: { algorithm: 'hmac-sha256' as const, key_id: 'rpotential-witness-1', signature: mockHex(rand, 64) },
    signed_at: '2026-04-26T08:00:00.000Z',
  }
}

export const IMPROVEMENTS: ImprovementRecommendation[] = [
  // ── ACTIVE / PENDING APPROVAL ─────────────────────────
  {
    improvement_id: 'imp_2026_0426_001',
    status: 'new',
    tenant_id: 'kengarff_automotive',
    skill_id: 'skill_brake_diag_v3',
    affected_path: 'anthropic_agent',
    type: 'instruction_add',
    title: 'Tighten TSB citation density on brake-diagnosis prompt',
    hypothesis:
      'Brake-diagnosis outputs with fewer than 2 cited TSBs correlate with a +0.12 hallucination delta and a $214 mean economic variance. Forcing minimum citation density at the prompt layer should reduce both.',
    source_telemetry: {
      ledger_rows: 17,
      window_days: 7,
      scope: 'kengarff_automotive · skill_brake_diag_v3 · anthropic_agent',
      observed_metric: '−$214 mean economic variance per run · 18% TSB-citation miss rate',
      observed_value: -214,
    },
    diff: {
      before:
        '[system] You are a brake diagnostician at Ken Garff. Diagnose the issue and recommend a service plan.',
      after:
        '[system] You are a brake diagnostician at Ken Garff. Diagnose the issue and recommend a service plan.\n\n[L9 DIR · dir_brake_diag_hallucination_guard] Every recommendation must reference at least two TSBs (Technical Service Bulletins) from the past 18 months. If fewer than two are available, surface "insufficient bulletin coverage" and route to human review.',
      summary: 'Add explicit citation-density requirement to system prompt + new DIR rule.',
    },
    projected_impact: {
      variance_reduction_usd_per_week: 3640,
      eai_delta: 0.012,
      cost_change_usd_per_week: -180, // slight cost increase from extra retrieval
      confidence: 0.87,
    },
    detected_at: '2026-04-25T14:22:09.000Z',
    policy_check: 'passed',
    policy_notes: 'Patch is consistent with EU AI Act explainability requirements + auto_safety pack.',
  },
  {
    improvement_id: 'imp_2026_0425_002',
    status: 'in_review',
    tenant_id: 'vipsigma_sports_betting',
    skill_id: 'skill_angry_customer_triage_v2',
    affected_path: 'openai_agent',
    type: 'routing_override',
    title: 'Route 70% of cx_triage from OpenAI → Anthropic on VIPSigma',
    hypothesis:
      'OpenAI agent cost-per-outcome on cx_triage is 23% higher than Anthropic with no measurable success-rate delta. A weighted routing override captures the cost saving without quality loss.',
    source_telemetry: {
      ledger_rows: 89,
      window_days: 14,
      scope: 'vipsigma_sports_betting · skill_angry_customer_triage_v2',
      observed_metric: 'OpenAI cost-per-outcome $0.071 vs Anthropic $0.054 · success rate within 0.4σ',
      observed_value: 0.23,
    },
    diff: {
      before:
        'Routing rule: cx_triage → openai_agent (default)',
      after:
        'Routing rule: cx_triage → 70% anthropic_agent, 30% openai_agent (A/B canary, 14 days), then full cutover if SLO holds.',
      summary: 'Update Adapter Gateway routing weight; A/B canary before full cutover.',
    },
    projected_impact: {
      variance_reduction_usd_per_week: 0,
      eai_delta: 0.005,
      cost_change_usd_per_week: -1470,
      confidence: 0.92,
    },
    detected_at: '2026-04-22T09:14:31.000Z',
    reviewed_by: 'L. Ottolenghi · CEO',
    reviewed_at: '2026-04-25T17:08:55.000Z',
    policy_check: 'passed',
    policy_notes: 'No GDPR or auto_safety implications. Vendor-neutral by design.',
  },
  {
    improvement_id: 'imp_2026_0424_003',
    status: 'new',
    tenant_id: 'vipsigma_sports_betting',
    skill_id: 'skill_responsible_gaming_intervention_v1',
    affected_path: 'hybrid_openai_human',
    type: 'dir_rule_synthesis',
    title: 'Synthesize new DIR rule: responsible-gaming loss-streak intervention',
    hypothesis:
      'Drift on responsible_gaming_intervention skill climbed from 0.18 → 0.34 over 6 weeks. 23 Tier-3 evaluators flagged late-stage interventions in players with 5+ consecutive losses. A new DIR rule that pre-empts on loss-streak signals should restore baseline.',
    source_telemetry: {
      ledger_rows: 23,
      window_days: 30,
      scope: 'vipsigma_sports_betting · skill_responsible_gaming_intervention_v1',
      observed_metric: 'drift_risk 0.18 → 0.34 over 6 weeks · 23 eval failures (late intervention)',
      observed_value: 0.34,
    },
    diff: {
      before: '(no rule)',
      after:
        'rule: dir_responsible_gaming_loss_streak\n  trigger: actor.recent_loss_streak > 5\n  patch:\n    additional_instructions: "Surface responsible-gaming intervention copy before any new wager recommendation."\n    require_human_confirmation: true',
      summary: 'New L9 DIR rule with human-confirmation requirement on loss-streak signal.',
    },
    projected_impact: {
      variance_reduction_usd_per_week: 890,
      eai_delta: 0.018,
      cost_change_usd_per_week: 0,
      confidence: 0.78,
    },
    detected_at: '2026-04-24T11:44:12.000Z',
    policy_check: 'flagged',
    policy_notes:
      'Touches gambling regulatory class — compliance review required before deployment. EU residency rule applies in MT region.',
  },
  {
    improvement_id: 'imp_2026_0423_004',
    status: 'new',
    tenant_id: 'artgroup',
    skill_id: 'skill_eu_ai_act_review_v1',
    affected_path: 'hybrid_anthropic_human',
    type: 'prompt_edit',
    title: 'Add citation-density floor on EU AI Act review outputs',
    hypothesis:
      'Compliance reviews with fewer than 3 distinct regulatory citations had a Tier-1 format-compliance failure rate of 28%. Enforcing the floor at the prompt layer should catch this before downstream review.',
    source_telemetry: {
      ledger_rows: 11,
      window_days: 30,
      scope: 'artgroup · compliance family',
      observed_metric: '11 Tier-1 citation-density misses · 28% rejection rate',
      observed_value: 0.28,
    },
    diff: {
      before: '[system] Review the AI deployment under EU AI Act Article 14...',
      after:
        '[system] Review the AI deployment under EU AI Act Article 14. Every recommendation must cite at least three discrete regulatory references with article-level granularity (e.g., "Art. 14(1)", "Art. 12(3)").',
      summary: 'Tighten compliance prompt with explicit citation-density requirement.',
    },
    projected_impact: {
      variance_reduction_usd_per_week: 540,
      eai_delta: 0.008,
      cost_change_usd_per_week: 0,
      confidence: 0.82,
    },
    detected_at: '2026-04-23T16:07:33.000Z',
    policy_check: 'passed',
  },

  // ── HISTORY · CONFIRMED IMPACT ────────────────────────
  {
    improvement_id: 'imp_2026_0408_h1',
    status: 'confirmed',
    tenant_id: 'kengarff_automotive',
    skill_id: 'skill_engine_misfire_diag_v2',
    affected_path: 'anthropic_agent',
    type: 'prompt_edit',
    title: 'Add live-data capture requirement to misfire diagnosis',
    hypothesis: 'Misfire diagnoses without live-data capture had a 31% incorrect-root-cause rate.',
    source_telemetry: {
      ledger_rows: 42,
      window_days: 21,
      scope: 'kengarff_automotive · skill_engine_misfire_diag_v2',
      observed_metric: '31% incorrect root cause without live data',
      observed_value: 0.31,
    },
    diff: { before: '...', after: '...', summary: 'Mandate live_data_capture tool before P0xxx diagnosis.' },
    projected_impact: {
      variance_reduction_usd_per_week: 2100,
      eai_delta: 0.015,
      cost_change_usd_per_week: 95,
      confidence: 0.84,
    },
    detected_at: '2026-04-04T10:00:00.000Z',
    reviewed_by: 'A. Padia · Platform owner',
    reviewed_at: '2026-04-08T11:30:00.000Z',
    applied_at: '2026-04-08T13:00:00.000Z',
    outcome: {
      measured_at: '2026-04-22T13:00:00.000Z',
      variance_actual_delta_usd_per_week: -1980,
      eai_actual_delta: 0.014,
      rows_observed: 64,
      notes: '63% variance reduction over 14 days. Hypothesis confirmed.',
    },
    policy_check: 'passed',
    signature_pair: sig(),
  },
  {
    improvement_id: 'imp_2026_0322_h2',
    status: 'confirmed',
    tenant_id: 'vipsigma_sports_betting',
    skill_id: 'skill_billing_dispute_v1',
    affected_path: 'openai_agent',
    type: 'tool_restriction',
    title: 'Restrict cross_tenant_join from billing-dispute flow',
    hypothesis: 'Cross-tenant joins on billing dispute caused 3 PII overlap incidents in 2 months.',
    source_telemetry: {
      ledger_rows: 8,
      window_days: 60,
      scope: 'vipsigma_sports_betting · skill_billing_dispute_v1',
      observed_metric: '3 GDPR-flagged PII overlap incidents',
      observed_value: 3,
    },
    diff: { before: '...', after: '...', summary: 'Remove cross_tenant_join from skill toolset.' },
    projected_impact: {
      variance_reduction_usd_per_week: 0,
      eai_delta: 0.022,
      cost_change_usd_per_week: 0,
      confidence: 0.95,
    },
    detected_at: '2026-03-18T14:00:00.000Z',
    reviewed_by: 'L. Ottolenghi · CEO',
    reviewed_at: '2026-03-22T09:00:00.000Z',
    applied_at: '2026-03-22T11:00:00.000Z',
    outcome: {
      measured_at: '2026-04-22T11:00:00.000Z',
      variance_actual_delta_usd_per_week: 0,
      eai_actual_delta: 0.020,
      rows_observed: 38,
      notes: 'Zero PII incidents in following 30 days. Compliance-driven win.',
    },
    policy_check: 'passed',
    signature_pair: sig(),
  },
  {
    improvement_id: 'imp_2026_0315_h3',
    status: 'confirmed',
    tenant_id: 'loop_tv',
    skill_id: 'skill_field_dispatch_v1',
    affected_path: 'openai_agent',
    type: 'routing_override',
    title: 'Cutover field-dispatch high-volume traffic to Cloudflare Workers AI',
    hypothesis:
      'Field dispatch is high-volume / low-risk; edge inference at Cloudflare achieved equivalent quality at 38% cost.',
    source_telemetry: {
      ledger_rows: 412,
      window_days: 30,
      scope: 'loop_tv · skill_field_dispatch_v1',
      observed_metric: '$0.0038 vs $0.0061 cost-per-outcome · 0.92 vs 0.94 success delta',
      observed_value: 0.38,
    },
    diff: { before: '...', after: '...', summary: 'Route 100% of field_dispatch to cloudflare_agent.' },
    projected_impact: {
      variance_reduction_usd_per_week: 0,
      eai_delta: 0.004,
      cost_change_usd_per_week: -2840,
      confidence: 0.91,
    },
    detected_at: '2026-03-10T14:00:00.000Z',
    reviewed_by: 'A. Padia · Platform owner',
    reviewed_at: '2026-03-15T10:00:00.000Z',
    applied_at: '2026-03-15T12:30:00.000Z',
    outcome: {
      measured_at: '2026-04-15T12:30:00.000Z',
      variance_actual_delta_usd_per_week: 0,
      eai_actual_delta: 0.005,
      rows_observed: 1740,
      notes: '$2,920/wk realised cost reduction (better than projected). Quality stable.',
    },
    policy_check: 'passed',
    signature_pair: sig(),
  },
  {
    improvement_id: 'imp_2026_0228_h4',
    status: 'rejected',
    tenant_id: 'artgroup',
    skill_id: 'skill_works_council_brief_v1',
    affected_path: 'hybrid_anthropic_human',
    type: 'model_swap',
    title: 'Swap Anthropic → OpenAI on works-council briefing',
    hypothesis: 'OpenAI marginally lower cost on long-form text generation.',
    source_telemetry: {
      ledger_rows: 12,
      window_days: 21,
      scope: 'artgroup · skill_works_council_brief_v1',
      observed_metric: '$0.012 cost differential per run',
      observed_value: 0.012,
    },
    diff: { before: '...', after: '...', summary: 'Vendor swap.' },
    projected_impact: {
      variance_reduction_usd_per_week: 0,
      eai_delta: 0.001,
      cost_change_usd_per_week: -85,
      confidence: 0.41,
    },
    detected_at: '2026-02-22T10:00:00.000Z',
    reviewed_by: 'L. Ottolenghi · CEO',
    reviewed_at: '2026-02-28T09:00:00.000Z',
    policy_check: 'flagged',
    policy_notes:
      'REJECTED — confidence below 0.5 floor. Strategic skill drift would not be detectable in 12-row sample.',
  },
  {
    improvement_id: 'imp_2026_0212_h5',
    status: 'confirmed',
    tenant_id: 'kengarff_automotive',
    skill_id: 'skill_appointment_scheduling_v1',
    affected_path: 'salesforce_agent',
    type: 'prompt_edit',
    title: 'Bake regional capacity hints into scheduling prompt',
    hypothesis: 'Including bay-capacity context inline reduced reschedule rate.',
    source_telemetry: {
      ledger_rows: 218,
      window_days: 14,
      scope: 'kengarff_automotive · skill_appointment_scheduling_v1',
      observed_metric: '14% reschedule rate baseline',
      observed_value: 0.14,
    },
    diff: { before: '...', after: '...', summary: 'Inject region.bay_capacity into prompt context.' },
    projected_impact: {
      variance_reduction_usd_per_week: 0,
      eai_delta: 0.006,
      cost_change_usd_per_week: 30,
      confidence: 0.79,
    },
    detected_at: '2026-02-08T08:00:00.000Z',
    reviewed_by: 'A. Padia · Platform owner',
    reviewed_at: '2026-02-12T11:00:00.000Z',
    applied_at: '2026-02-12T13:00:00.000Z',
    outcome: {
      measured_at: '2026-03-12T13:00:00.000Z',
      variance_actual_delta_usd_per_week: 0,
      eai_actual_delta: 0.007,
      rows_observed: 894,
      notes: '+9% success rate sustained over 30 days.',
    },
    policy_check: 'passed',
    signature_pair: sig(),
  },
  {
    improvement_id: 'imp_2026_0130_h6',
    status: 'reverted',
    tenant_id: 'loop_tv',
    skill_id: 'skill_capacity_planning_v1',
    affected_path: 'anthropic_agent',
    type: 'instruction_add',
    title: 'Add weather-anomaly weighting to capacity forecast',
    hypothesis: 'Severe weather events double attendance variance; explicit prompting should help.',
    source_telemetry: {
      ledger_rows: 9,
      window_days: 14,
      scope: 'loop_tv · skill_capacity_planning_v1',
      observed_metric: '92% variance on weather-affected days',
      observed_value: 0.92,
    },
    diff: { before: '...', after: '...', summary: 'Inject weather-anomaly weighting instruction.' },
    projected_impact: {
      variance_reduction_usd_per_week: 320,
      eai_delta: 0.003,
      cost_change_usd_per_week: 0,
      confidence: 0.62,
    },
    detected_at: '2026-01-25T08:00:00.000Z',
    reviewed_by: 'A. Padia · Platform owner',
    reviewed_at: '2026-01-30T10:00:00.000Z',
    applied_at: '2026-01-30T12:00:00.000Z',
    outcome: {
      measured_at: '2026-02-13T12:00:00.000Z',
      variance_actual_delta_usd_per_week: 80, // worse, not better
      eai_actual_delta: -0.002,
      rows_observed: 28,
      notes:
        'Weather weighting overcorrected on calm days; net variance increased. Auto-rolled back per outcome guardrail.',
    },
    policy_check: 'passed',
    signature_pair: sig(),
  },
]

export function listImprovements(): ImprovementRecommendation[] {
  return IMPROVEMENTS
}

export function listActiveImprovements(): ImprovementRecommendation[] {
  return IMPROVEMENTS.filter(i => ['new', 'in_review', 'approved'].includes(i.status))
}

export function listImprovementHistory(): ImprovementRecommendation[] {
  return IMPROVEMENTS.filter(i => ['confirmed', 'reverted', 'rejected', 'applied'].includes(i.status))
}
