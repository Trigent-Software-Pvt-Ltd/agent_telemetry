import type {
  AEOSTenantId,
  LedgerRow,
  ExecutionPath,
  AttributionBucket,
  VendorLayer,
  SignaturePair,
  AEOSSkill,
} from '@/types/aeos'
import { mulberry32, AEOS_SEED, range, rangeInt, clamp, mockHex, mockId, pickOne } from '@/lib/aeos/prng'
import { SKILLS } from './skills'
import { TENANTS } from './tenants'
import { ACTORS } from './actors'

// Per-tenant skill mix (reflects each tenant's primary use cases).
const TENANT_SKILL_FOCUS: Record<AEOSTenantId, string[]> = {
  kengarff_automotive: [
    'skill_brake_diag_v3',
    'skill_engine_misfire_diag_v2',
    'skill_transmission_shudder_v1',
    'skill_adas_calibration_v2',
    'skill_battery_health_v1',
    'skill_hvac_diag_v1',
    'skill_suspension_diag_v1',
    'skill_emissions_diag_v1',
    'skill_recall_lookup_v1',
    'skill_warranty_eligibility_v1',
    'skill_brake_pad_replace_v1',
    'skill_oil_change_v1',
    'skill_alignment_service_v1',
    'skill_angry_customer_triage_v2',
    'skill_appointment_scheduling_v1',
    'skill_test_drive_followup_v1',
    'skill_q2_coaching_plan_v1',
  ],
  vipsigma_sports_betting: [
    'skill_responsible_gaming_intervention_v1',
    'skill_venue_incident_triage_v1',
    'skill_capacity_planning_v1',
    'skill_show_run_v1',
    'skill_angry_customer_triage_v2',
    'skill_billing_dispute_v1',
    'skill_loyalty_offer_v1',
    'skill_eu_ai_act_review_v1',
  ],
  artgroup: [
    'skill_eu_ai_act_review_v1',
    'skill_gdpr_dpia_v1',
    'skill_soc2_evidence_v1',
    'skill_works_council_brief_v1',
    'skill_q2_coaching_plan_v1',
    'skill_pip_review_v1',
    'skill_compensation_band_v1',
    'skill_hiring_brief_v1',
  ],
  loop_tv: [
    'skill_field_dispatch_v1',
    'skill_downed_line_dispatch_v1',
    'skill_install_quote_v1',
    'skill_pm_schedule_v1',
    'skill_venue_incident_triage_v1',
    'skill_capacity_planning_v1',
    'skill_show_run_v1',
    'skill_angry_customer_triage_v2',
    'skill_billing_dispute_v1',
  ],
}

const VENDOR_BY_PATH: Record<ExecutionPath, { provider: string; model?: string; layer: VendorLayer }> = {
  human: { provider: 'human', layer: { hyperscaler: null, model_lab: null, model_id: null, agent_platform: null, framework_version: null } },
  anthropic_agent: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
    layer: { hyperscaler: null, model_lab: 'anthropic', model_id: 'claude-sonnet-4-6', agent_platform: null, framework_version: 'messages-api/2026-04' },
  },
  openai_agent: {
    provider: 'openai',
    model: 'gpt-4o',
    layer: { hyperscaler: null, model_lab: 'openai', model_id: 'gpt-4o', agent_platform: null, framework_version: 'responses-api/2026-04' },
  },
  google_vertex_agent: {
    provider: 'google_vertex',
    model: 'gemini-2.5-pro',
    layer: { hyperscaler: 'google_vertex', model_lab: 'google', model_id: 'gemini-2.5-pro', agent_platform: null, framework_version: 'vertex/2026-03' },
  },
  salesforce_agent: {
    provider: 'salesforce',
    model: 'agentforce-1.5',
    layer: { hyperscaler: null, model_lab: null, model_id: 'agentforce-1.5', agent_platform: 'salesforce_agentforce', framework_version: '1.5' },
  },
  uniphore_agent: {
    provider: 'uniphore',
    model: 'bac-v3',
    layer: { hyperscaler: null, model_lab: null, model_id: 'bac-v3', agent_platform: 'uniphore_bac', framework_version: '3.0' },
  },
  cloudflare_agent: {
    provider: 'cloudflare',
    model: 'llama-3.3-70b',
    layer: { hyperscaler: null, model_lab: 'meta', model_id: 'llama-3.3-70b', agent_platform: 'cloudflare_workers_ai', framework_version: 'workers-ai/2026-04' },
  },
  hybrid_anthropic_human: {
    provider: 'hybrid_anthropic_human',
    model: 'claude-sonnet-4-6+human',
    layer: { hyperscaler: null, model_lab: 'anthropic', model_id: 'claude-sonnet-4-6', agent_platform: null, framework_version: 'messages-api/2026-04' },
  },
  hybrid_openai_human: {
    provider: 'hybrid_openai_human',
    model: 'gpt-4o+human',
    layer: { hyperscaler: null, model_lab: 'openai', model_id: 'gpt-4o', agent_platform: null, framework_version: 'responses-api/2026-04' },
  },
}

const ATTRIBUTION_REASONING: Record<AttributionBucket, string[]> = {
  agent_capability: [
    'Model failed to ground recommendation in TSB; output below skill performance baseline.',
    'Hallucination score exceeded skill tolerance (0.18 vs 0.15 threshold).',
    'Tool call failed silently; agent did not retry with alternative.',
  ],
  agent_instructions: [
    'Prompt did not enforce citation density; rule synthesis recommended.',
    'Reasoning template missing chain-of-checks for elevated drift.',
    'Tool allowlist permitted destructive action that should have been gated.',
  ],
  data: [
    'Source-of-record returned stale value; skill estimate unaffected by model quality.',
    'Knowledge graph ingestion lag of 6h hid the resolved record.',
    'Customer intake form missing required field; attribution to data, not model.',
  ],
  policy: [
    'Required control (human_in_loop) not yet provisioned for region; deny upheld.',
    'Policy pack version drift between regions caused inconsistent gating.',
  ],
  environment: [
    'Vendor latency P99 spiked; outcome timed out before model output.',
    'Network blip between adapter gateway and tool surface (Pinecone).',
  ],
}

function pickPathForSkill(rand: () => number, skill: AEOSSkill, weeksAgo: number): ExecutionPath {
  // Bias toward hybrid paths for strategic/safety skills.
  // Bias agent paths heavier in earlier weeks (so hybrid share grows over time — positive HPI trend).
  const candidates = skill.allowed_paths.slice()
  if (candidates.length === 0) return 'human'
  // Prefer hybrid for safety_relevant or strategic_skill
  const hybrid = candidates.filter(p => p.startsWith('hybrid_'))
  const agent = candidates.filter(p => !p.startsWith('hybrid_') && p !== 'human')
  const human = candidates.filter(p => p === 'human')

  const tags = skill.governance_tags
  const isStrategic = tags.includes('safety_relevant') || tags.includes('strategic_skill') || tags.includes('regulatory')

  // Hybrid share: 0.55 four weeks ago → 0.72 today
  const hybridShare = clamp(0.72 - (weeksAgo / 4) * 0.17, 0.4, 0.78)

  const r = rand()
  if (isStrategic) {
    if (hybrid.length && r < hybridShare) return pickOne(rand, hybrid)
    if (agent.length && r < hybridShare + 0.2) return pickOne(rand, agent)
    if (human.length) return human[0]
  }
  if (agent.length && r < 0.55) return pickOne(rand, agent)
  if (hybrid.length && r < 0.55 + hybridShare * 0.5) return pickOne(rand, hybrid)
  return candidates[Math.floor(rand() * candidates.length)]
}

function makeSig(rand: () => number, signedAt: string): SignaturePair {
  return {
    fuzebox: { algorithm: 'ed25519', key_id: 'fuzebox-kms-primary', signature: mockHex(rand, 128) },
    rpotential: { algorithm: 'hmac-sha256', key_id: 'rpotential-witness-1', signature: mockHex(rand, 64) },
    signed_at: signedAt,
  }
}

function generateRowsForTenant(tenantId: AEOSTenantId, count: number, seedOffset: number): LedgerRow[] {
  const rand = mulberry32(AEOS_SEED + seedOffset)
  const focus = TENANT_SKILL_FOCUS[tenantId]
  const rows: LedgerRow[] = []
  // Distribute timestamps across last 30 days
  const now = new Date('2026-04-26T08:00:00.000Z').getTime()
  const dayMs = 24 * 60 * 60 * 1000
  for (let i = 0; i < count; i++) {
    const skillId = focus[Math.floor(rand() * focus.length)]
    const skill = SKILLS.find(s => s.skill_id === skillId)
    if (!skill) continue
    // Newer rows first when indexed by i ascending; we'll place i=0 today, i=count-1 ~30d ago
    const dayAgo = Math.floor((i / count) * 29) + Math.floor(rand() * 1.5)
    const weeksAgo = dayAgo / 7
    const ts = new Date(now - dayAgo * dayMs - rand() * dayMs).toISOString()

    const path = pickPathForSkill(rand, skill, weeksAgo)
    const perf = skill.performance[path]
    const baseSuccess = perf?.success_rate ?? 0.85
    const baseCost = perf?.avg_cost_usd ?? 12
    const baseLatency = perf?.avg_latency_ms ?? 2000

    // Variance trends DOWN over time — newer rows have tighter actual/predicted gap.
    // varianceFactor: 1.0 thirty days ago → 0.45 today
    const varianceFactor = clamp(1.0 - (1 - dayAgo / 30) * 0.55, 0.45, 1.0)

    // Predicted dollar value (skill-scale) — synthetic but consistent
    const predictedValue = +range(rand, 80, 320).toFixed(2)
    // Actual = predicted +/- variance
    const variancePct = range(rand, -0.18, 0.12) * varianceFactor // skewed slightly negative on average earlier
    const actualValue = +(predictedValue * (1 + variancePct)).toFixed(2)
    const varianceUsd = +(actualValue - predictedValue).toFixed(2)

    // Tolerances — both technical and economic
    const techExceeds = Math.abs(variancePct) > 0.12 && rand() < 0.7
    const econExceeds = Math.abs(variancePct) > 0.10 && rand() < 0.85
    const breach = techExceeds || econExceeds

    const success = rand() < baseSuccess && !(breach && rand() < 0.4)
    const exec = mockId(rand, 'exe', 16)
    const dec = mockId(rand, 'dec', 16)

    const sigDelta = +range(rand, -0.4, 0.2).toFixed(2)
    const latencyDelta = Math.round(range(rand, -200, 600))
    const errorRateDelta = +range(rand, -0.04, 0.06).toFixed(3)
    const halluDelta = +range(rand, -0.03, 0.06).toFixed(3)
    const winRateDelta = +range(rand, -0.12, 0.08).toFixed(3)
    const cpoDelta = +range(rand, -0.02, 0.04).toFixed(3)

    const provider = VENDOR_BY_PATH[path]
    const isHybrid = path.startsWith('hybrid_')

    // Pick actor(s)
    const authorized = ACTORS.filter(a => a.authorized_skills.includes(skillId))
    const actorIds: string[] = []
    if (path === 'human' || isHybrid) {
      const human = authorized.find(a => a.type === 'human')
      if (human) actorIds.push(human.actor_id)
    }
    if (isHybrid || path !== 'human') {
      const agent =
        ACTORS.find(a => a.type === 'agent' && a.vendor === provider.provider.replace('hybrid_', '').replace('_human', '')) ??
        ACTORS.find(a => a.type === 'agent')
      if (agent) actorIds.push(agent.actor_id)
    }

    let attributionCause: AttributionBucket | null = null
    let reasoning = ''
    if (breach) {
      const buckets: AttributionBucket[] = ['agent_capability', 'agent_instructions', 'data', 'policy', 'environment']
      const weights = [0.35, 0.30, 0.18, 0.10, 0.07]
      let r = rand()
      for (let b = 0; b < buckets.length; b++) {
        r -= weights[b]
        if (r <= 0) {
          attributionCause = buckets[b]
          break
        }
      }
      attributionCause = attributionCause ?? 'agent_capability'
      reasoning = pickOne(rand, ATTRIBUTION_REASONING[attributionCause])
    }

    // Correction — fires only when attribution is agent_*
    const hasCorrection =
      breach &&
      (attributionCause === 'agent_capability' || attributionCause === 'agent_instructions') &&
      rand() < 0.85
    const correction = hasCorrection
      ? {
          applied_patch_id: mockId(rand, 'pat', 12),
          parent_execution_id: exec,
          patch_type:
            attributionCause === 'agent_instructions' ? 'instruction_add' as const :
            (rand() < 0.5 ? 'prompt_edit' as const : 'tool_restriction' as const),
          patch_summary:
            attributionCause === 'agent_instructions'
              ? 'Added chain-of-checks instruction for elevated drift conditions.'
              : 'Restricted destructive tool; required citation density.',
          co_signed: true,
        }
      : { applied_patch_id: null, parent_execution_id: null, patch_type: null, patch_summary: null, co_signed: false }

    // EAI contribution
    const aiTaskShare = path === 'human' ? 0 : isHybrid ? 0.6 : 1
    const successWeight = success ? 1 : 0.2
    const govFactor = breach ? 0.6 : skill.governance_tags.includes('safety_relevant') ? 0.85 : 0.95
    const preservation = isHybrid || path === 'human' ? 1 : 0.4
    const econ = success ? clamp((actualValue - baseCost) / 100, -0.5, 1.2) : -0.3

    const row: LedgerRow = {
      execution_id: exec,
      decision_id: dec,
      tenant_id: tenantId,
      skill_id: skillId,
      selected_path: path,
      provider: provider.provider,
      model: provider.model,
      actor_ids: actorIds,
      predicted: {
        value_usd: predictedValue,
        signed_by_fuzebox: { algorithm: 'ed25519', key_id: 'fuzebox-kms-primary', signature: mockHex(rand, 128) },
        signed_at: ts,
      },
      actual: {
        value_usd: actualValue,
        sourced_from:
          tenantId === 'kengarff_automotive' ? 'dealership_dms' :
          tenantId === 'vipsigma_sports_betting' ? 'sportsbook_book' :
          tenantId === 'artgroup' ? 'compliance_ledger' :
          'venue_pos',
        signature_pair: makeSig(rand, ts),
      },
      variance: {
        technical: {
          sigma_delta: sigDelta,
          latency_delta_ms: latencyDelta,
          error_rate_delta: errorRateDelta,
          hallucination_delta: halluDelta,
          exceeds_tolerance: techExceeds,
        },
        economic: {
          variance_usd: varianceUsd,
          variance_percentile: clamp(0.5 + variancePct * 2, 0, 1),
          win_rate_delta: winRateDelta,
          cost_per_outcome_delta_usd: cpoDelta,
          exceeds_tolerance: econExceeds,
        },
      },
      attribution: {
        cause: attributionCause,
        reasoning,
        signed_by_fuzebox: breach
          ? { algorithm: 'ed25519', key_id: 'fuzebox-kms-primary', signature: mockHex(rand, 128) }
          : undefined,
      },
      correction,
      eai_contribution: {
        ai_task_share: aiTaskShare,
        success_weight: successWeight,
        governance_factor: govFactor,
        preservation_factor: preservation,
        economic_return_factor: econ,
      },
      success,
      vendor_layer: provider.layer,
      timestamp: ts,
    }
    rows.push(row)
  }
  // Sort newest-first
  rows.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
  return rows
}

const TENANT_ROW_COUNTS: Record<AEOSTenantId, number> = {
  kengarff_automotive: 145,
  vipsigma_sports_betting: 120,
  artgroup: 95,
  loop_tv: 110,
}

const ROWS_BY_TENANT: Record<AEOSTenantId, LedgerRow[]> = {
  kengarff_automotive: generateRowsForTenant('kengarff_automotive', TENANT_ROW_COUNTS.kengarff_automotive, 1),
  vipsigma_sports_betting: generateRowsForTenant('vipsigma_sports_betting', TENANT_ROW_COUNTS.vipsigma_sports_betting, 2),
  artgroup: generateRowsForTenant('artgroup', TENANT_ROW_COUNTS.artgroup, 3),
  loop_tv: generateRowsForTenant('loop_tv', TENANT_ROW_COUNTS.loop_tv, 4),
}

export function getLedgerRowsForTenant(tenantId: AEOSTenantId): LedgerRow[] {
  return ROWS_BY_TENANT[tenantId] ?? []
}

export function getLedgerRowByExecutionId(executionId: string): LedgerRow | undefined {
  for (const id of Object.keys(ROWS_BY_TENANT) as AEOSTenantId[]) {
    const found = ROWS_BY_TENANT[id].find(r => r.execution_id === executionId)
    if (found) return found
  }
  return undefined
}
