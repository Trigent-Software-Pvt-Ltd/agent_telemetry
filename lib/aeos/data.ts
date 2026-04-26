// AEOS mock data accessor surface — synchronous reads against in-memory seed.

import type {
  AEOSTenantId,
  AEOSTenant,
  AEOSSkill,
  AEOSActor,
  CoverageManifest,
  UEFDecision,
  UEFTask,
  ScoredPath,
  ExecutionPath,
  LedgerRow,
  EAIBreakdown,
  EAITimePoint,
  PolicyPack,
  EvidenceBundle,
  DIRRule,
  ObservationEvent,
  InstructionPatch,
} from '@/types/aeos'

import { TENANTS } from './seed/tenants'
import { SKILLS, getSkillById } from './seed/skills'
import { ACTORS, getActorById, listActorsAuthorizedForSkill } from './seed/actors'
import { POLICY_PACKS, getPolicyPack as _getPolicyPack } from './seed/policy-packs'
import { DIR_RULES, getDIRRuleById } from './seed/dir-rules'
import { getCoverageManifest as _getCoverageManifest } from './seed/coverage-manifest'
import { getLedgerRowsForTenant, getLedgerRowByExecutionId } from './seed/ledger'
import { computeEAIBreakdown, computeEAITimeSeries } from './eai'
import { mulberry32, AEOS_SEED, mockHex, mockId, range, clamp, pickOne } from './prng'

// ── Tenants ──────────────────────────────────────────────
export function listTenants(): AEOSTenant[] {
  return TENANTS
}
export function getTenant(id: AEOSTenantId): AEOSTenant | undefined {
  return TENANTS.find(t => t.id === id)
}

// ── Coverage manifest ────────────────────────────────────
export function getCoverageManifest(tenantId: AEOSTenantId): CoverageManifest {
  return _getCoverageManifest(tenantId)
}

// ── Skills & actors ──────────────────────────────────────
export function listSkills(_tenantId?: AEOSTenantId): AEOSSkill[] {
  return SKILLS
}
export function getSkill(skillId: string): AEOSSkill | undefined {
  return getSkillById(skillId)
}
export function listActors(tenantId?: AEOSTenantId): AEOSActor[] {
  // Filter by tenant region heuristically (kept simple for the demo)
  return ACTORS
}
export function getActor(actorId: string): AEOSActor | undefined {
  return getActorById(actorId)
}

// ── UEF Decisions ────────────────────────────────────────
// Decisions are derived on-demand from ledger rows so they share a single
// source of truth. Each row's decision_id is used; we synthesize a full
// UEFDecision by scoring all candidate paths for that row's skill and
// labeling the row's path as the winner.

const decisionCache = new Map<string, UEFDecision>()

function buildScoredPaths(skill: AEOSSkill, rand: () => number, winner: ExecutionPath): ScoredPath[] {
  return skill.allowed_paths.map((p, i) => {
    const isWinner = p === winner
    const isHybrid = p.startsWith('hybrid_')
    const isHuman = p === 'human'
    // Score components — biased so the winner totals highest
    const cap = clamp(0.6 + range(rand, -0.1, 0.4) + (isWinner ? 0.18 : 0), 0, 1)
    const gsti = clamp(skill.strategic_weight + range(rand, -0.1, 0.15) + (isHybrid ? 0.18 : 0) - (p.endsWith('_agent') && skill.governance_tags.includes('strategic_skill') ? 0.12 : 0), -0.5, 1)
    const uop = clamp(0.4 + range(rand, -0.05, 0.25) + (isHuman || isHybrid ? 0.2 : 0), 0, 1)
    const coordTax = clamp(0.10 + range(rand, 0, 0.12) + (isHybrid ? 0.04 : 0), 0, 0.4)
    const gov = clamp(0.5 + (skill.governance_tags.includes('safety_relevant') && (isHybrid || isHuman) ? 0.3 : 0) + range(rand, -0.05, 0.1), 0, 1)
    const runtime = clamp(0.55 + (p.endsWith('_agent') ? 0.2 : 0) - (isHuman ? 0.1 : 0) + range(rand, -0.08, 0.1), 0, 1)
    const econ = clamp(0.3 + (p.endsWith('_agent') ? 0.2 : 0) - (isHuman ? 0.15 : 0) + range(rand, -0.1, 0.2), -0.5, 1)
    const risk = clamp(skill.governance_tags.includes('auto_safety') && p.endsWith('_agent') && !isHybrid ? 0.4 : range(rand, 0, 0.15), 0, 0.8)
    const total = cap + gsti + uop - coordTax + gov + runtime + econ - risk + (isWinner ? 0.18 : 0)
    return {
      path: p,
      capability_fit: +cap.toFixed(2),
      gsti_value: +gsti.toFixed(2),
      uop_value: +uop.toFixed(2),
      coordination_tax: +coordTax.toFixed(2),
      governance_score: +gov.toFixed(2),
      runtime_fit: +runtime.toFixed(2),
      economic_value: +econ.toFixed(2),
      risk_penalty: +risk.toFixed(2),
      total: +total.toFixed(2),
      justification: isWinner
        ? `Winner — capability fit (${cap.toFixed(2)}) + workforce signal preservation (gsti ${gsti.toFixed(2)}, uop ${uop.toFixed(2)}) outweighs runtime overhead.`
        : `Below winner by ${(0.18).toFixed(2)} on workforce-graph contribution.`,
    }
  }).sort((a, b) => b.total - a.total)
}

function decisionFromRow(row: LedgerRow): UEFDecision {
  if (decisionCache.has(row.decision_id)) return decisionCache.get(row.decision_id)!
  const rand = mulberry32(AEOS_SEED + row.decision_id.length * 17 + row.timestamp.length)
  const skill = getSkillById(row.skill_id)
  if (!skill) throw new Error(`unknown skill ${row.skill_id}`)
  const scored = buildScoredPaths(skill, rand, row.selected_path)

  const isAutoSafety = skill.governance_tags.includes('auto_safety')
  const isGambling = skill.governance_tags.includes('gambling')
  const isGdpr = skill.governance_tags.includes('gdpr_sensitive')
  const isSafety = skill.governance_tags.includes('safety_relevant')

  const task: UEFTask = {
    task_id: mockId(rand, 'task', 12),
    task_type: skill.family,
    description: synthesizeTaskDescription(skill),
    risk_level: isAutoSafety || skill.governance_tags.includes('strategic_skill') ? 'high' : isSafety ? 'medium' : 'low',
    regulatory_class: isAutoSafety ? 'auto_safety' : isGambling ? 'gambling' : isGdpr ? 'gdpr' : 'general',
    jurisdiction: row.tenant_id === 'artgroup' ? 'EU-DE' : row.tenant_id === 'vipsigma_sports_betting' ? 'US-NV' : row.tenant_id === 'loop_tv' ? 'US' : 'US-UT',
    complexity: +range(rand, 0.4, 0.85).toFixed(2),
    latency_budget_ms: 600_000,
    cost_budget_usd: 60,
    explainability_required: isAutoSafety || skill.governance_tags.includes('regulatory'),
    human_signoff_required: isAutoSafety || isSafety,
  }

  const policyPackId =
    isAutoSafety ? 'auto_safety_standard' :
    isGambling ? 'gambling_responsible' :
    skill.governance_tags.includes('regulatory') ? 'eu_ai_act_high_risk' :
    isGdpr ? 'gdpr' :
    'general'

  // Build the applied patch from the rules that *would have* fired
  const fired: string[] = []
  if (isSafety || task.risk_level === 'high') fired.push('dir_safety_relevant_confirmation')
  if (isAutoSafety) fired.push('dir_auto_safety_tool_lockdown')
  if (isGambling) fired.push('dir_gambling_responsible_play')
  if (isGdpr) fired.push('dir_people_data_pii_mask')
  if (skill.drift_risk > 0.30) fired.push('dir_drift_coaching')
  // fatigue handled separately on a fraction of human paths

  const patch: InstructionPatch | undefined = fired.length > 0 ? {
    contract_version: 'dir.v1',
    phase: 'pre_input',
    decision_id: row.decision_id,
    execution_id: row.execution_id,
    issued_at: row.timestamp,
    rules_fired: fired,
    additional_instructions: fired.flatMap(rid => {
      const r = getDIRRuleById(rid)
      return r?.patch_preview.additional_instructions ?? []
    }),
    restricted_tools: Array.from(new Set(fired.flatMap(rid => getDIRRuleById(rid)?.patch_preview.restricted_tools ?? []))),
    required_tools: Array.from(new Set(fired.flatMap(rid => getDIRRuleById(rid)?.patch_preview.required_tools ?? []))),
    required_citations: fired.some(rid => getDIRRuleById(rid)?.patch_preview.required_citations),
    require_human_confirmation: fired.some(rid => getDIRRuleById(rid)?.patch_preview.require_human_confirmation),
    safety_envelope: fired.find(rid => getDIRRuleById(rid)?.patch_preview.safety_envelope) ?
      (getDIRRuleById(fired.find(rid => getDIRRuleById(rid)?.patch_preview.safety_envelope)!)!.patch_preview.safety_envelope ?? null) :
      null,
    metadata: { pack_id: policyPackId, ttl_seconds: 3600 },
    vendor_translations: {
      anthropic: vendorTranslate('anthropic', fired),
      openai: vendorTranslate('openai', fired),
      google_vertex: vendorTranslate('google_vertex', fired),
    },
  } : undefined

  const requiredControls = ['audit_log']
  if (task.human_signoff_required) requiredControls.push('human_in_loop')
  if (task.explainability_required) requiredControls.push('explanation_interface')
  if (skill.governance_tags.includes('regulatory')) requiredControls.push('evidence_export')
  if (isGdpr) requiredControls.push('data_residency_eu')

  const decision: UEFDecision = {
    decision_id: row.decision_id,
    execution_id: row.execution_id,
    tenant_id: row.tenant_id,
    task,
    skill_id: skill.skill_id,
    selected_path: row.selected_path,
    selected_actor_id: row.actor_ids[0],
    confidence: clamp(0.55 + range(rand, 0, 0.35), 0, 1),
    scored_paths: scored,
    governance_requirements: requiredControls,
    required_controls: requiredControls,
    policy_pack_id: policyPackId,
    applied_patch: patch,
    expected_metrics: {
      latency_ms: row.variance.technical.latency_delta_ms < 0 ? 1500 : 2200,
      cost_usd: row.predicted.value_usd * 0.4,
      success_probability: clamp(0.6 + range(rand, 0, 0.3), 0, 1),
    },
    vendor_layer: row.vendor_layer,
    decided_at: row.timestamp,
  }
  decisionCache.set(row.decision_id, decision)
  return decision
}

function synthesizeTaskDescription(skill: AEOSSkill): string {
  const map: Record<string, string> = {
    skill_brake_diag_v3: 'Customer reports brake squeal at low speed; diagnose and recommend service plan.',
    skill_engine_misfire_diag_v2: 'P0301 misfire on cylinder 1; diagnose root cause and recommend remediation.',
    skill_adas_calibration_v2: 'Post-windshield-replacement ADAS calibration verification.',
    skill_responsible_gaming_intervention_v1: 'Player has 7 consecutive losses; evaluate responsible-gaming intervention.',
    skill_eu_ai_act_review_v1: 'High-risk AI deployment review under EU AI Act Article 14.',
    skill_gdpr_dpia_v1: 'DPIA for new processing activity touching customer profile data.',
    skill_works_council_brief_v1: 'Prepare DE works-council briefing for AI rollout.',
    skill_angry_customer_triage_v2: 'Frustrated customer escalation; de-escalate and route.',
    skill_appointment_scheduling_v1: 'Schedule service appointment matching customer availability and bay capacity.',
    skill_field_dispatch_v1: 'Match service ticket to nearest qualified technician.',
    skill_downed_line_dispatch_v1: 'Emergency downed-line dispatch with safety pre-checks.',
    skill_q2_coaching_plan_v1: 'Generate Q2 coaching plan for direct report.',
    skill_recall_lookup_v1: 'VIN recall lookup and TSB cross-reference.',
    skill_capacity_planning_v1: 'Forecast venue staffing for upcoming weekend.',
    skill_billing_dispute_v1: 'Investigate disputed charge and issue refund/credit decision.',
    skill_warranty_eligibility_v1: 'Determine warranty coverage for repair line item.',
    skill_loyalty_offer_v1: 'Generate next-best loyalty offer for VIP customer.',
    skill_test_drive_followup_v1: 'Personalized follow-up after dealership test drive.',
    skill_install_quote_v1: 'Generate equipment install quote with parts and labor.',
    skill_pm_schedule_v1: 'Generate preventive-maintenance schedule for fleet device.',
  }
  return map[skill.skill_id] ?? `Execute ${skill.name.toLowerCase()}.`
}

function vendorTranslate(vendor: 'anthropic' | 'openai' | 'google_vertex', fired: string[]): string {
  const lines = fired.map(id => `[L9 DIR · ${id}] ${getDIRRuleById(id)?.description ?? id}`)
  switch (vendor) {
    case 'anthropic':
      return `# system\n${lines.join('\n')}`
    case 'openai':
      return `# instructions\n${lines.join('\n')}`
    case 'google_vertex':
      return `# system_instruction\n${lines.join('\n')}`
  }
}

export function listRecentDecisions(tenantId: AEOSTenantId, limit = 20): UEFDecision[] {
  const rows = getLedgerRowsForTenant(tenantId).slice(0, limit)
  return rows.map(r => decisionFromRow(r))
}

export function getDecision(decisionId: string): UEFDecision | undefined {
  // Search across all tenants
  for (const t of TENANTS) {
    const rows = getLedgerRowsForTenant(t.id)
    const row = rows.find(r => r.decision_id === decisionId)
    if (row) return decisionFromRow(row)
  }
  return undefined
}

// ── Ledger ───────────────────────────────────────────────
export interface LedgerFilters {
  skill_id?: string
  selected_path?: string
  vendor?: string
  variance_breach?: boolean
  has_correction?: boolean
  date_from?: string
  date_to?: string
}

export function listLedgerRows(tenantId: AEOSTenantId, filters: LedgerFilters = {}): LedgerRow[] {
  let rows = getLedgerRowsForTenant(tenantId)
  if (filters.skill_id) rows = rows.filter(r => r.skill_id === filters.skill_id)
  if (filters.selected_path) rows = rows.filter(r => r.selected_path === filters.selected_path)
  if (filters.vendor) rows = rows.filter(r => r.provider === filters.vendor)
  if (filters.variance_breach !== undefined) {
    rows = rows.filter(r => {
      const breach = r.variance.technical.exceeds_tolerance || r.variance.economic.exceeds_tolerance
      return breach === filters.variance_breach
    })
  }
  if (filters.has_correction !== undefined) {
    rows = rows.filter(r => Boolean(r.correction.applied_patch_id) === filters.has_correction)
  }
  if (filters.date_from) rows = rows.filter(r => r.timestamp >= filters.date_from!)
  if (filters.date_to) rows = rows.filter(r => r.timestamp <= filters.date_to!)
  return rows
}

export function getLedgerRow(executionId: string): LedgerRow | undefined {
  return getLedgerRowByExecutionId(executionId)
}

// ── EAI ──────────────────────────────────────────────────
export function computeEAI(tenantId: AEOSTenantId, _windowDays = 30): EAIBreakdown {
  const rows = getLedgerRowsForTenant(tenantId)
  return computeEAIBreakdown(rows, tenantId)
}

export { computeEAITimeSeries }

// ── Policy packs ─────────────────────────────────────────
export function listPolicyPacks(): PolicyPack[] {
  return POLICY_PACKS
}
export function getPolicyPack(packId: string): PolicyPack | undefined {
  return _getPolicyPack(packId)
}

// ── Evidence bundles ─────────────────────────────────────
const evidenceBundlesByTenant = new Map<AEOSTenantId, EvidenceBundle[]>()

function ensureBundles(tenantId: AEOSTenantId) {
  if (evidenceBundlesByTenant.has(tenantId)) return
  const rand = mulberry32(AEOS_SEED + tenantId.length * 19)
  const formats: Array<EvidenceBundle['format']> = ['eu_ai_act_article_12', 'gdpr', 'soc2', 'wp29', 'eu_ai_act_article_12']
  const bundles: EvidenceBundle[] = formats.map((fmt, i) => {
    const id = mockId(rand, 'evb', 12)
    const start = new Date('2026-04-01T00:00:00Z')
    start.setDate(start.getDate() + i * 4)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    return {
      bundle_id: id,
      tenant_id: tenantId,
      format: fmt,
      period_start: start.toISOString(),
      period_end: end.toISOString(),
      row_count: Math.floor(range(rand, 35, 95)),
      integrity_hash: 'sha256:' + mockHex(rand, 64),
      files: [
        { path: 'manifest.json', sha256: mockHex(rand, 64), size_bytes: 4823, content_type: 'application/json' },
        { path: 'decisions.jsonl', sha256: mockHex(rand, 64), size_bytes: 18234, content_type: 'application/x-ndjson' },
        { path: 'policy_pack.yaml', sha256: mockHex(rand, 64), size_bytes: 3015, content_type: 'application/x-yaml' },
        { path: 'ledger.jsonl', sha256: mockHex(rand, 64), size_bytes: 27412, content_type: 'application/x-ndjson' },
      ],
      attestations: {
        fuzebox: { algorithm: 'ed25519', key_id: 'fuzebox-kms-primary', signature: mockHex(rand, 128) },
        rpotential: { algorithm: 'hmac-sha256', key_id: 'rpotential-witness-1', signature: mockHex(rand, 64) },
        signed_at: end.toISOString(),
      },
      signed_url: `https://evidence.aeos.fuzebox.ai/v1/bundles/${id}?sig=${mockHex(rand, 32)}&exp=${Date.now() + 7 * 86400_000}`,
      signed_url_expires_at: new Date(Date.now() + 7 * 86400_000).toISOString(),
      retention_mode: 'compliance',
      retention_expires_at: new Date(Date.now() + 7 * 365 * 86400_000).toISOString(),
    }
  })
  evidenceBundlesByTenant.set(tenantId, bundles)
}

export function listEvidenceBundles(tenantId: AEOSTenantId): EvidenceBundle[] {
  ensureBundles(tenantId)
  return evidenceBundlesByTenant.get(tenantId) ?? []
}

export async function exportEvidenceBundle(input: {
  tenant_id: AEOSTenantId
  format: EvidenceBundle['format']
  period_start: string
  period_end: string
}): Promise<EvidenceBundle> {
  // Artificial 1.8s delay to feel real
  await new Promise(res => setTimeout(res, 1800))
  ensureBundles(input.tenant_id)
  const rand = mulberry32(AEOS_SEED + Date.now() % 1_000_000)
  const id = mockId(rand, 'evb', 12)
  const bundle: EvidenceBundle = {
    bundle_id: id,
    tenant_id: input.tenant_id,
    format: input.format,
    period_start: input.period_start,
    period_end: input.period_end,
    row_count: Math.floor(range(rand, 35, 95)),
    integrity_hash: 'sha256:' + mockHex(rand, 64),
    files: [
      { path: 'manifest.json', sha256: mockHex(rand, 64), size_bytes: 4823, content_type: 'application/json' },
      { path: 'decisions.jsonl', sha256: mockHex(rand, 64), size_bytes: 18234, content_type: 'application/x-ndjson' },
      { path: 'policy_pack.yaml', sha256: mockHex(rand, 64), size_bytes: 3015, content_type: 'application/x-yaml' },
      { path: 'ledger.jsonl', sha256: mockHex(rand, 64), size_bytes: 27412, content_type: 'application/x-ndjson' },
    ],
    attestations: {
      fuzebox: { algorithm: 'ed25519', key_id: 'fuzebox-kms-primary', signature: mockHex(rand, 128) },
      rpotential: { algorithm: 'hmac-sha256', key_id: 'rpotential-witness-1', signature: mockHex(rand, 64) },
      signed_at: new Date().toISOString(),
    },
    signed_url: `https://evidence.aeos.fuzebox.ai/v1/bundles/${id}?sig=${mockHex(rand, 32)}&exp=${Date.now() + 7 * 86400_000}`,
    signed_url_expires_at: new Date(Date.now() + 7 * 86400_000).toISOString(),
    retention_mode: 'compliance',
    retention_expires_at: new Date(Date.now() + 7 * 365 * 86400_000).toISOString(),
  }
  const list = evidenceBundlesByTenant.get(input.tenant_id) ?? []
  evidenceBundlesByTenant.set(input.tenant_id, [bundle, ...list])
  return bundle
}

// ── DIR rules ────────────────────────────────────────────
export function listDIRRules(): DIRRule[] {
  return DIR_RULES
}
export function getDIRRule(ruleId: string): DIRRule | undefined {
  return getDIRRuleById(ruleId)
}

// ── Observation events (lightweight derivation) ──────────
export function listObservationEvents(tenantId: AEOSTenantId, limit = 50): ObservationEvent[] {
  const rows = getLedgerRowsForTenant(tenantId).slice(0, limit)
  return rows.map((r): ObservationEvent => {
    const rand = mulberry32(AEOS_SEED + r.execution_id.length * 7)
    return {
      contract_version: 'obs.v1',
      execution_id: r.execution_id,
      tenant_id: r.tenant_id,
      agent_id: r.actor_ids[0] ?? 'unknown',
      skill_id: r.skill_id,
      vendor_layer: r.vendor_layer,
      tool_surface: [
        { type: 'service_bulletin_lookup', vendor: 'enterprise_kg', operation: 'query', latency_ms: Math.floor(range(rand, 30, 120)), ok: true },
        { type: 'function_call', vendor: r.provider, operation: 'tool', latency_ms: Math.floor(range(rand, 100, 400)), ok: rand() > 0.05 },
      ],
      technical_metrics: {
        latency_ms_total: Math.floor(range(rand, 800, 3500)),
        tokens_in: Math.floor(range(rand, 800, 6000)),
        tokens_out: Math.floor(range(rand, 80, 700)),
        tool_calls: Math.floor(range(rand, 1, 4)),
        tool_failures: rand() < 0.08 ? 1 : 0,
        error_class: null,
        hallucination_score: +range(rand, 0.01, 0.18).toFixed(2),
        groundedness: +range(rand, 0.78, 0.98).toFixed(2),
        policy_violations: [],
      },
      economic_metrics: {
        inference_cost_usd: +range(rand, 0.005, 0.045).toFixed(3),
        tool_cost_usd: +range(rand, 0.001, 0.012).toFixed(3),
        human_oversight_cost_usd: r.selected_path.startsWith('hybrid_') || r.selected_path === 'human' ? +range(rand, 0.5, 2.5).toFixed(2) : 0,
        total_cost_usd: +range(rand, 0.01, 3).toFixed(2),
      },
      decision_inputs_hash: 'sha256:' + mockHex(rand, 64),
      observed_at: r.timestamp,
      observer_signature: 'fuzebox-kms-primary:' + mockHex(rand, 16),
    }
  })
}
