// AEOS demo types — mirrors the canonical AEOS contracts.
// Sources:
//   docs/AEOS/aeos-engineering-handoff/05_instruction_runtime_contract/{context_request,instruction_patch}.schema.json
//   docs/AEOS/aeos-engineering-handoff/06_evidence_delivery/bundle_manifest.schema.json
//   docs/AEOS/Engineering_Instructions_PEL_v1.md (LedgerRow v2.3)
//   docs/AEOS/fuzebox-aeos-handoff/_source_snapshot/fuzebox-aeos/packages/* (reference Python)

// ── Tenants & coverage ────────────────────────────────────
export type AEOSTenantId =
  | 'kengarff_automotive'
  | 'vipsigma_sports_betting'
  | 'artgroup'
  | 'loop_tv'

export interface AEOSTenant {
  id: AEOSTenantId
  display_name: string
  industry: string
  region: string[]
  default_skills_focus: string[]
  default_landing_decision_id?: string
}

export interface CoverageManifestEntry {
  layer: 'hyperscaler' | 'model_lab' | 'agent_platform' | 'tool_surface'
  vendor: string
  status: 'observed' | 'gap' | 'planned'
  note?: string
}

export interface CoverageManifest {
  tenant_id: AEOSTenantId
  observed_count: number
  gap_count: number
  planned_count: number
  vendors: CoverageManifestEntry[]
  signed_at: string
  signature_pair: SignaturePair
}

// ── Skills & actors ──────────────────────────────────────
export type SkillFamily =
  | 'auto_diag'
  | 'auto_repair'
  | 'cx_triage'
  | 'events_ops'
  | 'compliance'
  | 'field_service'
  | 'hr_people'
  | 'sportsbook'

export type GovernanceTag =
  | 'safety_relevant'
  | 'strategic_skill'
  | 'customer_facing'
  | 'regulatory'
  | 'gdpr_sensitive'
  | 'auto_safety'
  | 'gambling'

export type ExecutionPath =
  | 'human'
  | 'anthropic_agent'
  | 'openai_agent'
  | 'salesforce_agent'
  | 'uniphore_agent'
  | 'cloudflare_agent'
  | 'google_vertex_agent'
  | 'hybrid_anthropic_human'
  | 'hybrid_openai_human'

export interface PathPerformance {
  success_rate: number
  avg_cost_usd: number
  avg_latency_ms: number
}

export interface AEOSSkill {
  skill_id: string
  name: string
  family: SkillFamily
  description: string
  allowed_paths: ExecutionPath[]
  required_tools: string[]
  governance_tags: GovernanceTag[]
  strategic_weight: number // 0..1
  drift_risk: number // 0..1
  performance: Partial<Record<ExecutionPath, PathPerformance>>
}

export type ActorType = 'human' | 'agent'

export interface AEOSActor {
  actor_id: string
  type: ActorType
  display_name: string
  role: string
  region: string
  readiness: number // 0..1
  fatigue: number // 0..1
  capacity: number // 0..1
  vendor?: string // for agents
  model?: string // for agents
  authorized_skills: string[]
}

// ── Signals ──────────────────────────────────────────────
export interface SignalSnapshot {
  tenant_id: AEOSTenantId
  observed_at: string
  gsti: Record<string, number> // skill_id -> 0..1
  drift: Record<string, number> // skill_id -> 0..1
  uop_by_actor: Record<string, { readiness: number; fatigue: number; capacity: number }>
  coordination_tax: Record<string, number> // task_type -> 0..1
}

// ── UEF: scored paths & decisions ────────────────────────
export interface ScoredPath {
  path: ExecutionPath
  capability_fit: number
  gsti_value: number // ← rPotential
  uop_value: number // ← rPotential
  coordination_tax: number // ← rPotential (subtracted)
  governance_score: number
  runtime_fit: number
  economic_value: number
  risk_penalty: number // (subtracted)
  total: number
  selected_actor_id?: string
  justification: string
}

export interface UEFTask {
  task_id: string
  task_type: string
  description: string
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  regulatory_class: string
  jurisdiction: string
  complexity: number
  latency_budget_ms: number
  cost_budget_usd: number
  explainability_required: boolean
  human_signoff_required: boolean
}

export interface UEFDecision {
  decision_id: string
  execution_id: string
  tenant_id: AEOSTenantId
  task: UEFTask
  skill_id: string
  selected_path: ExecutionPath
  selected_actor_id?: string
  confidence: number
  scored_paths: ScoredPath[]
  governance_requirements: string[]
  required_controls: string[]
  policy_pack_id: string
  applied_patch?: InstructionPatch
  expected_metrics: { latency_ms: number; cost_usd: number; success_probability: number }
  observation_event?: ObservationEvent
  vendor_layer?: VendorLayer
  decided_at: string
}

// ── DIR: instruction patches ─────────────────────────────
export type DIRPhase = 'pre_input' | 'mid_toolcall' | 'post_output' | 'on_signal'

export interface InstructionPatch {
  contract_version: 'dir.v1'
  phase: DIRPhase
  decision_id: string
  execution_id: string
  issued_at: string
  rules_fired: string[]
  additional_instructions: string[]
  restricted_tools: string[]
  required_tools: string[]
  required_citations: boolean
  require_human_confirmation: boolean
  safety_envelope: string | null
  metadata: { pack_id?: string; ttl_seconds?: number }
  // mock-only: pre-translated per vendor
  vendor_translations?: Partial<Record<'anthropic' | 'openai' | 'google_vertex' | 'salesforce' | 'cloudflare' | 'uniphore', string>>
}

export interface DIRRule {
  rule_id: string
  description: string
  trigger: string // human-readable predicate summary
  pack_id: string | null // null = system-level rule
  patch_preview: Partial<InstructionPatch>
  status: 'live' | 'in_review' | 'proposed' | 'synthesized'
  fired_last_7d: number
  source?: string // for synthesized rules — what aggregate produced it
}

// ── Cross-vendor observation ─────────────────────────────
export interface VendorLayer {
  hyperscaler: string | null
  model_lab: string | null
  model_id: string | null
  agent_platform: string | null
  framework_version: string | null
}

export interface ObservationEvent {
  contract_version: 'obs.v1'
  execution_id: string
  tenant_id: AEOSTenantId
  agent_id: string
  skill_id: string
  vendor_layer: VendorLayer
  tool_surface: Array<{ type: string; vendor: string; operation: string; latency_ms: number; ok?: boolean }>
  technical_metrics: {
    latency_ms_total: number
    tokens_in: number
    tokens_out: number
    tool_calls: number
    tool_failures: number
    error_class: string | null
    hallucination_score: number
    groundedness: number
    policy_violations: string[]
  }
  economic_metrics: {
    inference_cost_usd: number
    tool_cost_usd: number
    human_oversight_cost_usd: number
    total_cost_usd: number
  }
  decision_inputs_hash: string
  observed_at: string
  observer_signature: string
}

// ── Predictive Economic Ledger (LedgerRow v2.3) ──────────
export interface LedgerSignature {
  algorithm: 'ed25519' | 'hmac-sha256'
  key_id: string
  signature: string // hex (mock)
}

export interface SignaturePair {
  fuzebox: LedgerSignature
  rpotential: LedgerSignature
  signed_at: string
}

export type AttributionBucket =
  | 'agent_capability'
  | 'agent_instructions'
  | 'data'
  | 'policy'
  | 'environment'

export interface LedgerRow {
  execution_id: string
  decision_id: string
  tenant_id: AEOSTenantId
  skill_id: string
  selected_path: ExecutionPath
  provider: string
  model?: string
  actor_ids: string[]
  predicted: {
    value_usd: number
    signed_by_fuzebox: LedgerSignature
    signed_at: string
  }
  actual: {
    value_usd: number
    sourced_from: string
    signature_pair: SignaturePair
  }
  variance: {
    technical: {
      sigma_delta: number
      latency_delta_ms: number
      error_rate_delta: number
      hallucination_delta: number
      exceeds_tolerance: boolean
    }
    economic: {
      variance_usd: number
      variance_percentile: number
      win_rate_delta: number
      cost_per_outcome_delta_usd: number
      exceeds_tolerance: boolean
    }
  }
  attribution: {
    cause: AttributionBucket | null
    reasoning: string
    signed_by_fuzebox?: LedgerSignature
  }
  correction: {
    applied_patch_id: string | null
    parent_execution_id: string | null
    patch_type:
      | 'prompt_edit'
      | 'instruction_add'
      | 'tool_restriction'
      | 'tool_addition'
      | 'routing_override'
      | 'code_patch'
      | null
    patch_summary: string | null
    co_signed: boolean
  }
  applied_patch?: InstructionPatch
  eai_contribution: {
    ai_task_share: number
    success_weight: number
    governance_factor: number
    preservation_factor: number
    economic_return_factor: number
  }
  success: boolean
  vendor_layer: VendorLayer
  timestamp: string
}

// ── EAI breakdown ────────────────────────────────────────
export interface EAIBreakdown {
  eai: number
  ai_adjusted_task_share: number
  success_rate: number
  governance_factor: number
  economic_return_factor: number
  hybrid_execution_share: number
  preservation_factor: number // = HPI
  control_failures: number
  risk_penalties: number
  row_count: number
  // sub-metrics
  ucs: number // unit cost of skill
  sy: number // skill yield
  ser: number // skill efficiency ratio
  eroi: number // execution ROI
  hpi: number // human preservation index
  hlr: number // hybrid leverage rate
  // attestation
  signature_pair: SignaturePair
}

export interface EAITimePoint {
  day: string // YYYY-MM-DD
  eai: number
  hpi: number
  hlr: number
  inflection?: { rule_id: string; description: string }
}

// ── Policy packs ─────────────────────────────────────────
export type PolicySeverity = 'critical' | 'high' | 'medium'

export interface PolicyRule {
  rule_id: string
  severity: PolicySeverity
  description: string
  when_summary: string
  require_summary: string
  references: string[]
  fired_last_7d: number
  denied_last_7d: number
  yaml_excerpt: string
}

export interface PolicyPack {
  pack_id: string
  display_name: string
  version: string
  jurisdiction: string[]
  description: string
  rules: PolicyRule[]
}

// ── Evidence bundles ─────────────────────────────────────
export type EvidenceFormat = 'eu_ai_act_article_12' | 'wp29' | 'gdpr' | 'soc2'

export interface EvidenceBundleFile {
  path: string
  sha256: string
  size_bytes: number
  content_type: string
}

export interface EvidenceBundle {
  bundle_id: string
  tenant_id: AEOSTenantId
  format: EvidenceFormat
  period_start: string
  period_end: string
  row_count: number
  integrity_hash: string
  files: EvidenceBundleFile[]
  attestations: SignaturePair
  signed_url: string
  signed_url_expires_at: string
  retention_mode: 'compliance'
  retention_expires_at: string
}

// ── Adapter result ───────────────────────────────────────
export interface AdapterResult {
  success: boolean
  latency_ms: number
  cost_usd: number
  output: string
  trace: Record<string, unknown>
  tool_calls: Array<{ name: string; latency_ms: number; ok: boolean }>
  provider: string
  model?: string
  actor_id?: string
  applied_patch?: InstructionPatch
}

// ── Auto-Improvement (the selling utility) ───────────────
//
// AEOS continuously analyzes the Predictive Economic Ledger for
// delta-improvement opportunities. Patterns from variance breaches,
// drift signals, and aggregated eval failures feed a hypothesis
// generator. Every recommendation is human-approved before it ships
// — humans stay in control; the agent population improves over time.

export type ImprovementStatus =
  | 'new' // detected, awaiting review
  | 'in_review' // under human review
  | 'approved' // approved, queued for deployment
  | 'applied' // deployed; outcome being measured
  | 'confirmed' // outcome measured, delta confirmed
  | 'reverted' // outcome did not match hypothesis; rolled back
  | 'rejected' // human rejected before deploy

export type ImprovementType =
  | 'prompt_edit'
  | 'instruction_add'
  | 'tool_restriction'
  | 'tool_addition'
  | 'routing_override'
  | 'model_swap'
  | 'dir_rule_synthesis'

export interface ImprovementSourceTelemetry {
  ledger_rows: number
  window_days: number
  scope: string // e.g., "kengarff_automotive · skill_brake_diag_v3 · anthropic_agent"
  observed_metric: string // e.g., "−$214 mean variance per run"
  observed_value: number // raw value
}

export interface ImprovementProjection {
  variance_reduction_usd_per_week: number
  eai_delta: number
  cost_change_usd_per_week: number
  confidence: number // 0..1
}

export interface ImprovementOutcome {
  measured_at: string
  variance_actual_delta_usd_per_week: number
  eai_actual_delta: number
  rows_observed: number
  notes: string
}

export interface ImprovementRecommendation {
  improvement_id: string
  status: ImprovementStatus
  tenant_id: AEOSTenantId
  skill_id?: string
  affected_path?: ExecutionPath
  type: ImprovementType
  title: string
  hypothesis: string
  source_telemetry: ImprovementSourceTelemetry
  diff: {
    before: string
    after: string
    summary: string
  }
  projected_impact: ImprovementProjection
  detected_at: string
  reviewed_by?: string
  reviewed_at?: string
  applied_at?: string
  outcome?: ImprovementOutcome
  // governance
  policy_check: 'passed' | 'flagged' | 'blocked'
  policy_notes?: string
  signature_pair?: SignaturePair
}
