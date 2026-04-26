// AEOS mock data accessor surface.
// Phase 0: stubs so the route group builds. Phase 1 fills these in.
//
// All functions are SYNCHRONOUS — pure reads against in-memory seed data.
// Mutations during a demo session live in-memory until reset (Phase 6).

import type {
  AEOSTenantId,
  AEOSTenant,
  AEOSSkill,
  AEOSActor,
  CoverageManifest,
  UEFDecision,
  LedgerRow,
  EAIBreakdown,
  EAITimePoint,
  PolicyPack,
  EvidenceBundle,
  DIRRule,
  ObservationEvent,
} from '@/types/aeos'

// ── Tenants ──────────────────────────────────────────────
export function listTenants(): AEOSTenant[] {
  return []
}
export function getTenant(_id: AEOSTenantId): AEOSTenant | undefined {
  return undefined
}

// ── Coverage manifest ────────────────────────────────────
export function getCoverageManifest(_tenantId: AEOSTenantId): CoverageManifest | undefined {
  return undefined
}

// ── Skills & actors ──────────────────────────────────────
export function listSkills(_tenantId?: AEOSTenantId): AEOSSkill[] {
  return []
}
export function getSkill(_skillId: string): AEOSSkill | undefined {
  return undefined
}
export function listActors(_tenantId?: AEOSTenantId): AEOSActor[] {
  return []
}
export function getActor(_actorId: string): AEOSActor | undefined {
  return undefined
}

// ── Decisions ────────────────────────────────────────────
export function listRecentDecisions(_tenantId: AEOSTenantId, _limit = 20): UEFDecision[] {
  return []
}
export function getDecision(_decisionId: string): UEFDecision | undefined {
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
export function listLedgerRows(_tenantId: AEOSTenantId, _filters: LedgerFilters = {}): LedgerRow[] {
  return []
}
export function getLedgerRow(_executionId: string): LedgerRow | undefined {
  return undefined
}

// ── EAI ──────────────────────────────────────────────────
export function computeEAI(_tenantId: AEOSTenantId, _windowDays = 30): EAIBreakdown | undefined {
  return undefined
}
export function computeEAITimeSeries(_tenantId: AEOSTenantId, _windowDays = 30): EAITimePoint[] {
  return []
}

// ── Policy packs ─────────────────────────────────────────
export function listPolicyPacks(): PolicyPack[] {
  return []
}
export function getPolicyPack(_packId: string): PolicyPack | undefined {
  return undefined
}

// ── Evidence bundles ─────────────────────────────────────
export function listEvidenceBundles(_tenantId: AEOSTenantId): EvidenceBundle[] {
  return []
}
export function exportEvidenceBundle(_input: {
  tenant_id: AEOSTenantId
  format: 'eu_ai_act_article_12' | 'wp29' | 'gdpr' | 'soc2'
  period_start: string
  period_end: string
}): Promise<EvidenceBundle | null> {
  return Promise.resolve(null)
}

// ── DIR rules ────────────────────────────────────────────
export function listDIRRules(): DIRRule[] {
  return []
}
export function getDIRRule(_ruleId: string): DIRRule | undefined {
  return undefined
}

// ── Observation events ───────────────────────────────────
export function listObservationEvents(_tenantId: AEOSTenantId, _limit = 50): ObservationEvent[] {
  return []
}
