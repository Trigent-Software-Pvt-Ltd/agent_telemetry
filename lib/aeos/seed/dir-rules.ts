import type { DIRRule } from '@/types/aeos'

// 6 default rules from the reference Python impl
// (packages/dynamic_instruction/runtime.py: load_default_rules)
// + 3 mock-synthesized rules to demonstrate the self-improving flywheel.

export const DIR_RULES: DIRRule[] = [
  {
    rule_id: 'dir_safety_relevant_confirmation',
    description: 'High/critical-risk safety tasks require citations and human confirmation.',
    trigger: 'risk_level ∈ {HIGH, CRITICAL}',
    pack_id: 'auto_safety_standard',
    patch_preview: {
      additional_instructions: [
        'This task is safety-relevant. Cite manufacturer service bulletins for every recommendation and flag any action requiring human sign-off before execution.',
      ],
      required_citations: true,
      require_human_confirmation: true,
      safety_envelope: 'safety_relevant_v1',
    },
    status: 'live',
    fired_last_7d: 47,
  },
  {
    rule_id: 'dir_auto_safety_tool_lockdown',
    description: 'Auto-safety regulatory class blocks destructive tools.',
    trigger: 'task.regulatory_class == "auto_safety"',
    pack_id: 'auto_safety_standard',
    patch_preview: {
      restricted_tools: ['clear_dtc_without_root_cause', 'ota_push_untested', 'disable_adas_module'],
      required_citations: true,
      safety_envelope: 'auto_safety_lockdown_v1',
    },
    status: 'live',
    fired_last_7d: 31,
  },
  {
    rule_id: 'dir_gambling_responsible_play',
    description: 'Gambling regulatory class requires responsible-play disclaimer.',
    trigger: 'task.regulatory_class == "gambling"',
    pack_id: 'gambling_responsible',
    patch_preview: {
      additional_instructions: [
        'This recommendation is for entertainment only. Include a responsible-play disclaimer and surface self-exclusion resources.',
      ],
    },
    status: 'live',
    fired_last_7d: 22,
  },
  {
    rule_id: 'dir_drift_coaching',
    description: 'Skill drift > 30% triggers chain-of-checks coaching prompt.',
    trigger: 'signals.skill_drift_risk > 0.30',
    pack_id: null,
    patch_preview: {
      additional_instructions: [
        'Skill drift is elevated. Include an explicit chain-of-checks before each recommendation and route low-confidence outputs to human review.',
      ],
    },
    status: 'live',
    fired_last_7d: 14,
  },
  {
    rule_id: 'dir_people_data_pii_mask',
    description: 'GDPR-sensitive skills mask PII and require human confirmation.',
    trigger: '"gdpr_sensitive" ∈ skill.governance_tags',
    pack_id: 'gdpr',
    patch_preview: {
      restricted_tools: ['raw_customer_lookup', 'cross_tenant_join'],
      required_tools: ['pii_redactor'],
      require_human_confirmation: true,
      safety_envelope: 'gdpr_pii_mask_v1',
    },
    status: 'live',
    fired_last_7d: 38,
  },
  {
    rule_id: 'dir_fatigue_handoff',
    description: 'Actor fatigue > 0.55 forces checklist-style output.',
    trigger: 'signals.actor_fatigue > 0.55',
    pack_id: null,
    patch_preview: {
      additional_instructions: [
        'Actor fatigue elevated. Output as a numbered checklist with explicit handoff points.',
      ],
    },
    status: 'live',
    fired_last_7d: 9,
  },

  // ── Synthesized — the self-improving flywheel ────────────
  {
    rule_id: 'dir_brake_diag_hallucination_guard',
    description: 'Brake-diagnosis outputs with hallucination_score > 0.15 must include a TSB-citation density check.',
    trigger: 'auto_diag.hallucination_score > 0.15',
    pack_id: null,
    patch_preview: {
      additional_instructions: [
        'For brake-diagnosis tasks, every recommendation must reference at least two TSBs from the past 18 months. Reject and re-prompt if zero or one TSB is cited.',
      ],
      required_citations: true,
    },
    status: 'live',
    fired_last_7d: 6,
    source: '17 eval failures (kengarff_automotive · last 30d) — Tier 2 LLM-as-judge flagged unsupported claims',
  },
  {
    rule_id: 'dir_responsible_gaming_loss_streak',
    description: 'Sportsbook recommendations to actors with > 5 consecutive losses include intervention prompt.',
    trigger: 'actor.recent_loss_streak > 5',
    pack_id: 'gambling_responsible',
    patch_preview: {
      additional_instructions: [
        'Player has 5+ consecutive losses. Surface responsible-gaming intervention copy before any new wager recommendation. Flag account for review if pattern persists.',
      ],
      require_human_confirmation: true,
    },
    status: 'in_review',
    fired_last_7d: 0,
    source: '23 eval failures (vipsigma_sports_betting · last 30d) — Tier 3 human evaluator flagged intervention timing',
  },
  {
    rule_id: 'dir_compliance_citation_density',
    description: 'Compliance outputs must cite at least 3 regulatory references.',
    trigger: 'skill.family == "compliance" && citation_count < 3',
    pack_id: 'eu_ai_act_high_risk',
    patch_preview: {
      additional_instructions: [
        'Every compliance recommendation must cite at least three discrete regulatory references with article-level granularity.',
      ],
      required_citations: true,
    },
    status: 'proposed',
    fired_last_7d: 0,
    source: '11 eval failures (artgroup · last 30d) — Tier 1 format check missed citation density target',
  },
]

export function getDIRRuleById(id: string): DIRRule | undefined {
  return DIR_RULES.find(r => r.rule_id === id)
}

export const SYNTHESIZED_RULES = DIR_RULES.filter(r => r.source !== undefined)
