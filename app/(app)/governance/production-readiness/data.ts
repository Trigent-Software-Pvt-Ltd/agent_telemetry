// Mock data co-located with the Production Readiness preview screen.
// Kept local per sprint plan — canonical mock lives in lib/quadrant-mock.ts (owned elsewhere).

export type Role = {
  key: 'principal' | 'team' | 'observer'
  label: string
  people: string
  access: string
}

export const ROLES: Role[] = [
  { key: 'principal', label: 'Principal', people: 'Sam Stillman', access: 'full access' },
  { key: 'team', label: 'Team Member', people: 'Genevieve Castelline / Ted Deinard', access: 'own briefing + review' },
  { key: 'observer', label: 'Observer', people: '—', access: 'read-only' },
]

export const LAST_ROLE_CHANGE = {
  summary: 'Ted promoted to Team Member',
  date: '2026-04-02',
  actor: 'Sam',
}

// 14-day GSTI sparkline — oscillates around mid-80s, ends at 87
export const GSTI_HISTORY: { day: string; score: number }[] = [
  { day: 'D-13', score: 82 },
  { day: 'D-12', score: 83 },
  { day: 'D-11', score: 81 },
  { day: 'D-10', score: 84 },
  { day: 'D-9', score: 85 },
  { day: 'D-8', score: 83 },
  { day: 'D-7', score: 86 },
  { day: 'D-6', score: 84 },
  { day: 'D-5', score: 85 },
  { day: 'D-4', score: 86 },
  { day: 'D-3', score: 88 },
  { day: 'D-2', score: 86 },
  { day: 'D-1', score: 87 },
  { day: 'Today', score: 87 },
]

export const GSTI = {
  current: 87,
  baseline: 82,
  alertThreshold: 75,
}

export type AuditEvent = {
  id: string
  timestamp: string
  actor: string
  action: string
  traceId: string
}

export const AUDIT_EVENTS: AuditEvent[] = [
  { id: 'e1',  timestamp: '2026-04-15 09:42', actor: 'Sam Stillman',       action: 'Prompt updated — sourcing.v7 → v8',            traceId: 'tr_7f3a91' },
  { id: 'e2',  timestamp: '2026-04-15 08:17', actor: 'Genevieve Castelline', action: 'Candidate approved — NPI 1548372901',        traceId: 'tr_7f3a44' },
  { id: 'e3',  timestamp: '2026-04-14 17:58', actor: 'Ted Deinard',        action: 'Feedback captured — run #412',                 traceId: 'tr_7f3985' },
  { id: 'e4',  timestamp: '2026-04-14 16:20', actor: 'system',             action: 'Deployment — prod-rollout 2026.04.14-r3',      traceId: 'tr_7f38e1' },
  { id: 'e5',  timestamp: '2026-04-14 14:03', actor: 'Sam Stillman',       action: 'Candidate approved — NPI 1427889102',          traceId: 'tr_7f37bc' },
  { id: 'e6',  timestamp: '2026-04-14 11:49', actor: 'Genevieve Castelline', action: 'Prompt updated — review.v3 → v4',            traceId: 'tr_7f370a' },
  { id: 'e7',  timestamp: '2026-04-13 18:11', actor: 'Ted Deinard',        action: 'Feedback captured — run #408',                 traceId: 'tr_7f364d' },
  { id: 'e8',  timestamp: '2026-04-13 15:26', actor: 'system',             action: 'Deployment — staging-canary 2026.04.13-r1',    traceId: 'tr_7f3591' },
  { id: 'e9',  timestamp: '2026-04-13 10:44', actor: 'Sam Stillman',       action: 'Candidate approved — NPI 1300529488',          traceId: 'tr_7f34c2' },
  { id: 'e10', timestamp: '2026-04-12 19:02', actor: 'Genevieve Castelline', action: 'Feedback captured — run #403',               traceId: 'tr_7f3440' },
]

export type SourceHealth = {
  name: string
  status: 'healthy' | 'degraded'
  detail: string
}

export const SOURCE_HEALTH: SourceHealth[] = [
  { name: 'CMS Utilization',          status: 'healthy',  detail: 'No retries in last 24h · last sync 14 min ago' },
  { name: 'Transparency in Coverage', status: 'degraded', detail: '2 retries in last 24h · last error: MRF parse timeout (14:22 UTC)' },
  { name: 'NPI Registry',             status: 'healthy',  detail: 'No retries in last 24h · last sync 3 min ago' },
  { name: 'HubSpot',                  status: 'healthy',  detail: 'No retries in last 24h · last sync 1 min ago' },
]
