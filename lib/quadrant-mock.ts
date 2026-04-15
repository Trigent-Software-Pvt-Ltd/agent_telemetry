/**
 * Quadrant Two Capital Partners — Mock Data
 * All data is fabricated for demo purposes. Single tenant, Claude-only.
 */

// ─── Organisation ────────────────────────────────────────────────

export const QUADRANT_ORG = {
  name: 'Quadrant Two Capital Partners',
  framework: 'deal-flow' as const,
  industry: 'Private Equity — Healthcare Services',
  tenants: ['quadrant'],
  logoPath: '/quadrant-logo.png',
  delivery: 'FuzeBox.AI · Delivered by Trigent',
}

// ─── Users ───────────────────────────────────────────────────────

export interface QuadrantUser {
  id: string
  name: string
  role: 'Principal' | 'Team Member'
  hubspotOwnerId: string
  email: string
}

export const QUADRANT_USERS: QuadrantUser[] = [
  {
    id: 'sam',
    name: 'Sam Stillman',
    role: 'Principal',
    hubspotOwnerId: '80294112',
    email: 'sam@quadrantcapital.com',
  },
  {
    id: 'genevieve',
    name: 'Genevieve Castelline',
    role: 'Team Member',
    hubspotOwnerId: '80294113',
    email: 'genevieve@quadrantcapital.com',
  },
  {
    id: 'ted',
    name: 'Ted Deinard',
    role: 'Team Member',
    hubspotOwnerId: '80294114',
    email: 'ted@quadrantcapital.com',
  },
]

// ─── Agents ──────────────────────────────────────────────────────

export interface QuadrantAgent {
  id: string
  name: string
  kind: 'chief-of-staff' | 'sourcing-agent'
  summary: string
  model: string
  status: 'live' | 'pilot' | 'paused'
  createdAt: string
  currentPromptVersion?: string
}

export const QUADRANT_AGENTS: QuadrantAgent[] = [
  {
    id: 'chief-of-staff',
    name: 'Chief of Staff',
    kind: 'chief-of-staff',
    summary:
      'Weekday briefing synthesis across HubSpot deals/tasks, Microsoft Graph calendar/email, Granola notes and Vercel KV deferred items. Produces structured action cards per user each morning.',
    model: 'claude-sonnet-4-20250514',
    status: 'live',
    createdAt: '2025-11-14T12:00:00Z',
    currentPromptVersion: 'v1.3',
  },
  {
    id: 'sourcing-agent',
    name: 'Sourcing Agent',
    kind: 'sourcing-agent',
    summary:
      'Manager-orchestrated multi-specialist agent for healthcare services deal sourcing. Finds 3rd-party providers by NPI taxonomy + geography, classifies business type, estimates revenue, and surfaces ≥ $5M candidates with evidence.',
    model: 'claude-sonnet-4-20250514',
    status: 'pilot',
    createdAt: '2026-02-03T09:00:00Z',
  },
]

// ─── Sourcing Specialists ────────────────────────────────────────

export interface SourcingSpecialist {
  id: string
  name: string
  role: string
  model: string
  avgLatencyMs: number
  successRate: number
  avgCostPerCandidate: number
  lastRunCount: number
}

export const SOURCING_SPECIALISTS: SourcingSpecialist[] = [
  {
    id: 'finder',
    name: 'Company Finder',
    role: 'NPI taxonomy + geography search against CMS + NPI Registry',
    model: 'claude-sonnet-4-20250514',
    avgLatencyMs: 2400,
    successRate: 0.97,
    avgCostPerCandidate: 0.014,
    lastRunCount: 142,
  },
  {
    id: 'classifier',
    name: 'Business Type Classifier',
    role: 'Distinguishes 3rd-party service providers from captive / hospital-owned practices',
    model: 'claude-sonnet-4-20250514',
    avgLatencyMs: 4100,
    successRate: 0.91,
    avgCostPerCandidate: 0.028,
    lastRunCount: 142,
  },
  {
    id: 'estimator',
    name: 'Revenue Estimator',
    role: 'Extrapolates total revenue from CMS Medicare utilization using assumed Medicare share',
    model: 'claude-sonnet-4-20250514',
    avgLatencyMs: 3200,
    successRate: 0.95,
    avgCostPerCandidate: 0.021,
    lastRunCount: 87,
  },
]

// ─── Chief of Staff — Card & Briefing types ──────────────────────

export type CardType = 'follow_up' | 'meeting_prep' | 'deal_action' | 'email_draft' | 'admin' | 'deferred'
export type CardAction = 'scheduled' | 'done' | 'pushed' | 'dismissed' | 'pending'
export type DraftLifecycle = 'drafted' | 'sent' | 'edited' | 'deleted'

export interface BriefingCard {
  id: string
  type: CardType
  priority: 'high' | 'medium' | 'low'
  title: string
  summary: string
  action: CardAction
  timeToActionMinutes: number | null
  draft?: {
    lifecycle: DraftLifecycle
    toneSummary: string
  }
  source: string
}

export interface Briefing {
  id: string
  userId: string
  date: string // yyyy-mm-dd
  triggeredAt: string
  trigger: 'cron-0930' | 'ad-hoc'
  promptVersion: string
  dashboardOpenedAt: string | null
  latencyMs: number
  tokensIn: number
  tokensOut: number
  costUsd: number
  cards: BriefingCard[]
}

// ─── Briefing generation (30 days) ───────────────────────────────

const CARD_TYPES: CardType[] = ['follow_up', 'meeting_prep', 'deal_action', 'email_draft', 'admin', 'deferred']
const CARD_TITLES: Record<CardType, string[]> = {
  follow_up: [
    'Chase response from MedForce Rehab (deal 14201)',
    'Ping Dr. Ramirez re: second-round meeting',
    'Follow up with Stanton Holdings CFO on LOI',
    'Touch base with Laura at Accelus Physio — no reply in 9d',
  ],
  meeting_prep: [
    '10:30 — Partner call with Coastal Therapy Group',
    '14:00 — Sourcing sync on Tier 1 PT funnel',
    '09:00 — Investor update deck review',
    '16:00 — Meridian Rehab financials walk-through',
  ],
  deal_action: [
    'Review revised Q1 financials for Pike Physical Therapy',
    'Countersign NDA with Summit Orthopedic',
    'Advance PineRidge Rehab to IC review',
    'Commission QoE on CedarSpine Wellness',
  ],
  email_draft: [
    'Draft reply to Benjamin at Harborline Therapy',
    'Draft intro to Jordan at BlueLane Capital',
    'Draft 2-sentence ask to lender on DigiDent portfolio',
    'Draft thank-you to advisor at Greenlake Partners',
  ],
  admin: [
    'Expense report due Friday (2 receipts outstanding)',
    'Approve Ted\'s travel to Dallas roadshow',
    'Renew Bloomberg terminal — Apr 22',
    'Sign engagement letter with King & Spalding',
  ],
  deferred: [
    'Revisit Aptiva Health thesis (deferred 2w ago)',
    'Look into Outpatient Imaging Tier-2 roll-up idea',
    'Revisit declined Vertex PT deal — price may have moved',
  ],
}

function seededRand(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export function generateBriefings(): Briefing[] {
  const briefings: Briefing[] = []
  const rand = seededRand(42)

  const today = new Date('2026-04-14T09:30:00Z')
  for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
    const date = new Date(today)
    date.setUTCDate(date.getUTCDate() - dayOffset)
    const dow = date.getUTCDay()
    if (dow === 0 || dow === 6) continue // weekdays only

    for (const user of QUADRANT_USERS) {
      const cardCount = 6 + Math.floor(rand() * 7) // 6-12
      const cards: BriefingCard[] = []
      for (let i = 0; i < cardCount; i++) {
        const type = CARD_TYPES[Math.floor(rand() * CARD_TYPES.length)]
        const titles = CARD_TITLES[type]
        const title = titles[Math.floor(rand() * titles.length)]
        const actionRoll = rand()
        // Sam acts on more cards; team members less (per plan §5.2)
        const actThreshold = user.id === 'sam' ? 0.25 : 0.45
        let action: CardAction = 'pending'
        if (actionRoll < actThreshold) action = 'done'
        else if (actionRoll < actThreshold + 0.15) action = 'scheduled'
        else if (actionRoll < actThreshold + 0.25) action = 'pushed'
        else if (actionRoll < actThreshold + 0.35) action = 'dismissed'
        else action = 'pending'

        const card: BriefingCard = {
          id: `c-${dayOffset}-${user.id}-${i}`,
          type,
          priority: rand() < 0.3 ? 'high' : rand() < 0.6 ? 'medium' : 'low',
          title,
          summary: 'Synthesized from HubSpot + Microsoft Graph + Granola context.',
          action,
          timeToActionMinutes: action === 'done' ? Math.floor(rand() * 240) : null,
          source: 'HubSpot + MS Graph + Granola',
        }

        if (type === 'email_draft') {
          const lRoll = rand()
          const lifecycle: DraftLifecycle =
            lRoll < 0.35 ? 'sent' : lRoll < 0.6 ? 'edited' : lRoll < 0.8 ? 'drafted' : 'deleted'
          card.draft = {
            lifecycle,
            toneSummary: 'Concise, direct, follow-up framing.',
          }
        }
        cards.push(card)
      }

      const promptVer = dayOffset > 20 ? 'v1.0' : dayOffset > 12 ? 'v1.1' : dayOffset > 5 ? 'v1.2' : 'v1.3'
      const dashOpenedOffset = user.id === 'sam' ? 4 + rand() * 30 : rand() < 0.65 ? 10 + rand() * 180 : -1

      briefings.push({
        id: `br-${date.toISOString().slice(0, 10)}-${user.id}`,
        userId: user.id,
        date: date.toISOString().slice(0, 10),
        triggeredAt: new Date(date.getTime() + 9.5 * 3600 * 1000).toISOString(),
        trigger: 'cron-0930',
        promptVersion: promptVer,
        dashboardOpenedAt:
          dashOpenedOffset < 0
            ? null
            : new Date(date.getTime() + 9.5 * 3600 * 1000 + dashOpenedOffset * 60 * 1000).toISOString(),
        latencyMs: Math.floor(2400 + rand() * 2600),
        tokensIn: Math.floor(18000 + rand() * 8000),
        tokensOut: Math.floor(3500 + rand() * 2500),
        costUsd: Number((0.08 + rand() * 0.06).toFixed(4)),
        cards,
      })
    }
  }
  return briefings
}

export const BRIEFINGS = generateBriefings()

export function getBriefingsForUser(userId: string | 'all'): Briefing[] {
  if (userId === 'all') return BRIEFINGS
  return BRIEFINGS.filter(b => b.userId === userId)
}

// ─── Prompt Registry ─────────────────────────────────────────────

export interface PromptVersion {
  version: string
  date: string
  author: string
  summary: string
  body: string
  inUse: boolean
}

const BASE_PROMPT = `You are the Chief of Staff agent for Quadrant Two Capital Partners, a healthcare-services focused private equity firm. Your role is to produce a concise, structured weekday briefing for a single user each morning at 09:30 America/New_York.

## Inputs
You will be given JSON payloads from four connectors:
1. HubSpot — open deals (owner filtered), recent deal-stage changes, open tasks, task completions in last 24h.
2. Microsoft Graph — calendar events for today + tomorrow, unread emails scored by sender importance, sent-items summary.
3. Granola — meeting notes from the prior 72h, tagged by deal/company where possible.
4. Vercel KV — user-specific deferred items pushed from prior briefings ("remind me next Tuesday").

## Context rules
- Treat the user's HubSpot owner ID as the authoritative filter for deal ownership.
- When a calendar event maps to a HubSpot deal by company name or attendee email, fuse the two records into a single meeting_prep card.
- Granola notes from a meeting with a sender in today's inbox should be surfaced as follow_up context, not as a standalone card.

## Output
Return a JSON array of cards. Each card has these fields:
  { "type": one of [follow_up, meeting_prep, deal_action, email_draft, admin, deferred],
    "priority": one of [high, medium, low],
    "title": short imperative sentence (< 80 chars),
    "summary": 1–2 sentence context + source refs,
    "suggested_action": single concrete next step,
    "draft_email": { "to": ..., "subject": ..., "body": ... } when type == email_draft,
    "source_ids": array of upstream record IDs used }

## Card-type rules
- follow_up: use when a deal has had no inbound activity in ≥ 5 business days and the user owns it.
- meeting_prep: one per calendar event in the next 8 hours tagged to a deal or external attendee.
- deal_action: IC-ready deals, LOI deadlines, QoE gating items.
- email_draft: unread email from a deal contact that warrants a same-day reply; propose body ≤ 120 words.
- admin: expense, legal, travel, subscriptions. Always low priority unless deadline ≤ 48h.
- deferred: any item pulled from Vercel KV whose trigger date is today or earlier.

## Volume guardrails
- Cap total cards at 12.
- At least one meeting_prep card per scheduled meeting (do not drop meetings).
- No more than 3 admin cards in any briefing.
`

export const PROMPT_VERSIONS: PromptVersion[] = [
  {
    version: 'v1.0',
    date: '2025-11-14',
    author: 'Sam Stillman',
    summary: 'Initial briefing prompt. Card types: follow_up, meeting_prep, deal_action, email_draft, admin.',
    body: BASE_PROMPT.replace(', deferred', '').replace(
      '- deferred: any item pulled from Vercel KV whose trigger date is today or earlier.\n',
      '',
    ),
    inUse: false,
  },
  {
    version: 'v1.1',
    date: '2026-01-08',
    author: 'Sam Stillman',
    summary: 'Added deferred card type for KV-backed reminder queue.',
    body: BASE_PROMPT.replace(
      '## Volume guardrails\n- Cap total cards at 12.',
      '## Volume guardrails\n- Cap total cards at 10.',
    ),
    inUse: false,
  },
  {
    version: 'v1.2',
    date: '2026-02-19',
    author: 'Sam Stillman',
    summary: 'Raised cap to 12 cards; tightened email_draft word cap from 180 → 120 words.',
    body: BASE_PROMPT.replace(
      'fuse the two records into a single meeting_prep card.',
      'fuse the two records into a single meeting_prep card. If the calendar event has no deal match, still include it.',
    ),
    inUse: false,
  },
  {
    version: 'v1.3',
    date: '2026-03-27',
    author: 'Sam Stillman',
    summary:
      'Granola fusion rule added: meeting notes from past 72h should augment follow_up context rather than create duplicate cards.',
    body: BASE_PROMPT,
    inUse: true,
  },
]

// ─── Sourcing candidates (~25 healthcare services) ──────────────

export type FitState = 'good_fit' | 'poor_fit' | 'unclear' | 'unreviewed'

export interface EvidenceItem {
  claim: string
  sourceUrl: string
  sourceLabel: string
  confidence: number // 0-1
}

export interface SourcingCandidate {
  id: string
  companyName: string
  npi: string
  taxonomyCode: string
  taxonomyLabel: string
  serviceCategory: string
  geographyState: string
  geographyMetro: string
  medicareRevenue: number
  medicarePctAssumption: number // 0.30-0.40
  extrapolatedTotalRevenue: number
  revenueConfidenceBand: [number, number]
  isThirdParty: boolean
  revenueOver5M: boolean
  overallConfidence: number
  evidence: EvidenceItem[]
  fitState: FitState
  groundTruth?: FitState // pre-seeded labels for calibration
  reviewedBy?: string
  reviewedAt?: string
  notes?: string
  // B1: Thesis Fit Scorecard
  thesisFit: {
    financial: number
    serviceCategory: number
    commercialMix: number
    rateArbitrage: number
    msoOverlap: number
    staffReferrals: number
    total: number
  }
  disqualifiers: {
    founderConcentration: boolean
    msoAbsent: boolean
    rateCeiling: boolean
    priorAuthBurden: boolean
    referralConcentration: boolean
  }
}

const METROS: Array<[string, string]> = [
  ['TX', 'Dallas–Fort Worth'],
  ['TX', 'Houston'],
  ['FL', 'Tampa Bay'],
  ['FL', 'Orlando'],
  ['AZ', 'Phoenix'],
  ['NC', 'Charlotte'],
  ['NC', 'Raleigh–Durham'],
  ['GA', 'Atlanta'],
  ['OH', 'Columbus'],
  ['PA', 'Philadelphia'],
  ['CO', 'Denver'],
  ['TN', 'Nashville'],
  ['IL', 'Chicago Metro'],
  ['VA', 'Richmond'],
  ['MI', 'Detroit'],
]

const COMPANY_NAMES = [
  'Pike Physical Therapy',
  'Coastal Therapy Group',
  'MedForce Rehab',
  'Stanton Holdings Rehabilitation',
  'Accelus Physio Partners',
  'Summit Orthopedic PT',
  'PineRidge Rehab Associates',
  'CedarSpine Wellness',
  'Harborline Therapy',
  'Greenlake Physical Therapy',
  'Meridian Rehab Network',
  'BlueLane Sports PT',
  'Keystone Motion Health',
  'Vertex PT Clinics',
  'LightBridge Rehabilitation',
  'Argent Physio',
  'FieldStone PT Group',
  'Trident Outpatient Rehab',
  'Ridgepoint Therapy',
  'Northwind Physical Therapy',
  'OakTerra Rehab',
  'Lantern Health Physio',
  'Foundry Motion Clinic',
  'Heartland Outpatient PT',
  'Copperline Physical Therapy',
]

function fabricateNpi(seed: number) {
  // 10-digit NPI, Luhn-check-free, plausible format
  const s = seededRand(seed)
  let out = '1'
  for (let i = 0; i < 9; i++) out += Math.floor(s() * 10).toString()
  return out
}

function buildCandidates(): SourcingCandidate[] {
  const list: SourcingCandidate[] = []
  const rand = seededRand(101)

  // Ground-truth seed: first 5 = good_fit, next 5 = poor_fit
  const seededGoodFit = new Set([0, 1, 2, 3, 4])
  const seededPoorFit = new Set([5, 6, 7, 8, 9])

  for (let i = 0; i < COMPANY_NAMES.length; i++) {
    const isSeedGood = seededGoodFit.has(i)
    const isSeedPoor = seededPoorFit.has(i)

    const [state, metro] = METROS[Math.floor(rand() * METROS.length)]
    const medicarePct = 0.3 + rand() * 0.1
    const medicareRev = isSeedGood
      ? 2_400_000 + Math.floor(rand() * 3_600_000)
      : isSeedPoor
        ? 300_000 + Math.floor(rand() * 1_000_000)
        : 800_000 + Math.floor(rand() * 4_500_000)

    const total = medicareRev / medicarePct
    const band: [number, number] = [
      Math.round((medicareRev / (medicarePct + 0.07)) / 1000) * 1000,
      Math.round((medicareRev / Math.max(medicarePct - 0.07, 0.15)) / 1000) * 1000,
    ]

    const isThirdParty = isSeedPoor ? rand() < 0.3 : rand() < 0.85
    const revOver5M = total >= 5_000_000
    const overallConfidence = 0.55 + rand() * 0.4

    const fitState: FitState = isSeedGood ? 'good_fit' : isSeedPoor ? 'poor_fit' : 'unreviewed'

    const evidence: EvidenceItem[] = [
      {
        claim: `NPI ${fabricateNpi(i + 1)} classified under taxonomy 225100000X (Physical Therapist)`,
        sourceUrl: 'https://npiregistry.cms.hhs.gov/api/?number=' + fabricateNpi(i + 1),
        sourceLabel: 'NPI Registry',
        confidence: 0.96,
      },
      {
        claim: `Medicare utilization FY2024: $${medicareRev.toLocaleString()} across ${Math.floor(1200 + rand() * 6000)} billed encounters`,
        sourceUrl: 'https://data.cms.gov/provider-data/dataset/medicare-pt-utilization',
        sourceLabel: 'CMS Medicare Utilization',
        confidence: 0.91,
      },
      {
        claim: `State license active in ${state}, no disciplinary actions in last 5 years`,
        sourceUrl: `https://www.${state.toLowerCase()}.gov/health/licensing`,
        sourceLabel: `${state} Board of PT`,
        confidence: 0.78,
      },
      {
        claim: isThirdParty
          ? 'Business registration shows independent ownership; no hospital parent entity identified'
          : 'Secretary of State records link entity to hospital holding company — likely captive',
        sourceUrl: `https://sos.${state.toLowerCase()}.gov/business-search`,
        sourceLabel: `${state} Secretary of State`,
        confidence: 0.72,
      },
    ]

    // ─── B1: Thesis Fit dimensions (deterministic, realistic spread) ───
    // Tier buckets: seedGood -> mostly 75-95, seedPoor -> mostly 25-55, others -> 50-85
    const dimRand = seededRand(i * 17 + 3)
    const tierBase = isSeedGood ? 78 : isSeedPoor ? 38 : 62
    const tierSpread = isSeedGood ? 18 : isSeedPoor ? 22 : 28
    const dim = () => Math.max(5, Math.min(98, Math.round(tierBase + (dimRand() - 0.5) * tierSpread)))
    const financial = dim()
    const serviceCategory = dim()
    const commercialMix = dim()
    const rateArbitrage = dim()
    const msoOverlap = dim()
    const staffReferrals = dim()
    // Weights: financial 25, serviceCategory 15, commercialMix 15, rateArbitrage 20, mso 15, staff 10
    const thesisTotal = Math.round(
      financial * 0.25 +
        serviceCategory * 0.15 +
        commercialMix * 0.15 +
        rateArbitrage * 0.2 +
        msoOverlap * 0.15 +
        staffReferrals * 0.1,
    )

    // ─── B1: Disqualifiers (deterministic). Seed-good rarely trigger; seed-poor often do. ───
    const disqRand = seededRand(i * 29 + 7)
    const dq = (goodProb: number, poorProb: number, otherProb: number) => {
      const p = isSeedGood ? goodProb : isSeedPoor ? poorProb : otherProb
      return disqRand() < p
    }
    const disqualifiers = {
      founderConcentration: dq(0.05, 0.55, 0.2),
      msoAbsent: dq(0.05, 0.45, 0.15),
      rateCeiling: dq(0.08, 0.5, 0.2),
      priorAuthBurden: dq(0.1, 0.4, 0.25),
      referralConcentration: dq(0.05, 0.5, 0.18),
    }

    list.push({
      id: `cand-${i + 1}`,
      companyName: COMPANY_NAMES[i],
      npi: fabricateNpi(i + 1),
      taxonomyCode: '225100000X',
      taxonomyLabel: 'Physical Therapist',
      serviceCategory: 'Outpatient Physical Therapy — Tier 1',
      geographyState: state,
      geographyMetro: metro,
      medicareRevenue: medicareRev,
      medicarePctAssumption: Number(medicarePct.toFixed(3)),
      extrapolatedTotalRevenue: Math.round(total),
      revenueConfidenceBand: band,
      isThirdParty,
      revenueOver5M: revOver5M,
      overallConfidence: Number(overallConfidence.toFixed(2)),
      evidence,
      fitState,
      groundTruth: isSeedGood ? 'good_fit' : isSeedPoor ? 'poor_fit' : undefined,
      thesisFit: {
        financial,
        serviceCategory,
        commercialMix,
        rateArbitrage,
        msoOverlap,
        staffReferrals,
        total: thesisTotal,
      },
      disqualifiers,
    })
  }
  return list
}

export const SOURCING_CANDIDATES: SourcingCandidate[] = buildCandidates()

// Mutable in-memory ground truth store for the review page (survives nav, not reload)
const FIT_STATE_STORE = new Map<string, FitState>()

export function getCandidates(): SourcingCandidate[] {
  return SOURCING_CANDIDATES.map(c => ({
    ...c,
    fitState: FIT_STATE_STORE.get(c.id) ?? c.fitState,
  }))
}

export function setCandidateFit(id: string, state: FitState, reviewer = 'Sam Stillman') {
  FIT_STATE_STORE.set(id, state)
  const c = SOURCING_CANDIDATES.find(x => x.id === id)
  if (c) {
    c.fitState = state
    c.reviewedBy = reviewer
    c.reviewedAt = new Date().toISOString()
  }
}

// ─── Ground-Truth Set (calibration) ─────────────────────────────

export interface GroundTruthExample {
  candidateId: string
  label: FitState
  rationale: string
}

export const GROUND_TRUTH_SET: GroundTruthExample[] = [
  { candidateId: 'cand-1', label: 'good_fit', rationale: 'Independent, $8.0M+ est revenue, clean license history, Tier-1 metro.' },
  { candidateId: 'cand-2', label: 'good_fit', rationale: 'Multi-site footprint, Medicare revenue implies ~$12M total, clear 3rd party.' },
  { candidateId: 'cand-3', label: 'good_fit', rationale: 'Strong growth in billed encounters Y/Y, owner-operated.' },
  { candidateId: 'cand-4', label: 'good_fit', rationale: 'Independent group with above-threshold revenue and stable license.' },
  { candidateId: 'cand-5', label: 'good_fit', rationale: '3 locations, high encounter volume, no hospital affiliation.' },
  { candidateId: 'cand-6', label: 'poor_fit', rationale: 'Hospital-captive per SoS filings; revenue flows to parent.' },
  { candidateId: 'cand-7', label: 'poor_fit', rationale: 'Revenue below $5M threshold even at upper-band Medicare assumption.' },
  { candidateId: 'cand-8', label: 'poor_fit', rationale: 'Single-provider practice, not a platform opportunity.' },
  { candidateId: 'cand-9', label: 'poor_fit', rationale: 'Recent license action; too much deal risk.' },
  { candidateId: 'cand-10', label: 'poor_fit', rationale: 'Private-equity owned already (confirmed in press releases).' },
]

// ─── Two-rule evaluation ─────────────────────────────────────────

export interface RuleOutcome {
  id: string
  label: string
  description: string
  passRate: number
  filteredCount: number
  totalInput: number
}

export function getRuleOutcomes(): RuleOutcome[] {
  const cands = getCandidates()
  const total = 142 // last manager run input size
  const r1Passed = cands.filter(c => c.isThirdParty).length
  const r2Passed = cands.filter(c => c.revenueOver5M).length
  return [
    {
      id: 'rule-1',
      label: 'Is 3rd-party service provider',
      description: 'Rejects captive / hospital-owned / PE-owned entities. Drops from 142 → 87.',
      passRate: 87 / total,
      filteredCount: 87,
      totalInput: total,
    },
    {
      id: 'rule-2',
      label: 'Estimated revenue ≥ $5M',
      description: 'Filters survivors of rule 1 using Medicare % assumption (32% default).',
      passRate: r2Passed / cands.length,
      filteredCount: r2Passed,
      totalInput: 87,
    },
  ]
}

// ─── Data sources inventory ──────────────────────────────────────

export interface DataSourceStatus {
  id: string
  name: string
  status: 'connected' | 'partial' | 'missing'
  lastSync: string
  recordsIndexed: number
  knownGaps: string
}

export const DATA_SOURCES: DataSourceStatus[] = [
  {
    id: 'cms',
    name: 'CMS Medicare Utilization',
    status: 'connected',
    lastSync: '2026-04-13T08:15:00Z',
    recordsIndexed: 41820,
    knownGaps: 'CY2025 not yet published — using FY2024 snapshot.',
  },
  {
    id: 'npi',
    name: 'NPI Registry',
    status: 'connected',
    lastSync: '2026-04-14T02:00:00Z',
    recordsIndexed: 18734,
    knownGaps: 'Taxonomy changes lag by ~30 days.',
  },
  {
    id: 'state-licensing',
    name: 'State Licensing (PT Boards)',
    status: 'partial',
    lastSync: '2026-04-10T12:45:00Z',
    recordsIndexed: 6210,
    knownGaps: '8 of 50 state boards require manual scraping. TX, FL, CA current; NY pending.',
  },
  {
    id: 'hubspot',
    name: 'HubSpot CRM',
    status: 'connected',
    lastSync: '2026-04-14T09:32:00Z',
    recordsIndexed: 412,
    knownGaps: 'No gaps.',
  },
  {
    id: 'ms-graph',
    name: 'Microsoft Graph (Calendar + Email)',
    status: 'connected',
    lastSync: '2026-04-14T09:30:00Z',
    recordsIndexed: 2185,
    knownGaps: 'Shared mailboxes not yet onboarded.',
  },
  {
    id: 'granola',
    name: 'Granola Meeting Notes',
    status: 'connected',
    lastSync: '2026-04-14T09:31:00Z',
    recordsIndexed: 318,
    knownGaps: 'Pre-Nov 2025 notes unindexed.',
  },
  {
    id: 'vercel-kv',
    name: 'Vercel KV (Deferred Items)',
    status: 'connected',
    lastSync: '2026-04-14T09:30:00Z',
    recordsIndexed: 47,
    knownGaps: 'No gaps.',
  },
]

// ─── Sourcing run trace (manager plan) ──────────────────────────

export interface TraceStep {
  id: string
  stepNumber: number
  specialist: string
  description: string
  inputCount: number
  outputCount: number
  latencyMs: number
  tokensIn: number
  tokensOut: number
  costUsd: number
  status: 'ok' | 'error'
}

export interface SourcingRun {
  id: string
  triggeredBy: string
  triggeredAt: string
  trigger: 'manual' | 'scheduled'
  inputBrief: string
  steps: TraceStep[]
  evidenceValidatedCount: number
  evaluationSurfacedCount: number
  totalCostUsd: number
  totalLatencyMs: number
  promptVersion: string
}

export const SOURCING_RUNS: SourcingRun[] = [
  {
    id: 'srun-2026-04-14',
    triggeredBy: 'Sam Stillman',
    triggeredAt: '2026-04-14T14:02:00Z',
    trigger: 'manual',
    inputBrief: 'Outpatient PT, Tier 1 metros, 3rd-party only, $5M+ revenue threshold',
    steps: [
      {
        id: 'step-1',
        stepNumber: 1,
        specialist: 'finder',
        description: 'NPI taxonomy 225100000X in top-15 metros',
        inputCount: 0,
        outputCount: 142,
        latencyMs: 2400,
        tokensIn: 4200,
        tokensOut: 3800,
        costUsd: 0.021,
        status: 'ok',
      },
      {
        id: 'step-2',
        stepNumber: 2,
        specialist: 'classifier',
        description: '3rd-party vs captive classification',
        inputCount: 142,
        outputCount: 87,
        latencyMs: 4100,
        tokensIn: 8400,
        tokensOut: 3600,
        costUsd: 0.036,
        status: 'ok',
      },
      {
        id: 'step-3',
        stepNumber: 3,
        specialist: 'estimator',
        description: 'Medicare → total revenue extrapolation',
        inputCount: 87,
        outputCount: 23,
        latencyMs: 3200,
        tokensIn: 6100,
        tokensOut: 2900,
        costUsd: 0.027,
        status: 'ok',
      },
    ],
    evidenceValidatedCount: 21,
    evaluationSurfacedCount: 21,
    totalCostUsd: 0.084,
    totalLatencyMs: 9700,
    promptVersion: 'v1.3',
  },
  {
    id: 'srun-2026-04-07',
    triggeredBy: 'Sam Stillman',
    triggeredAt: '2026-04-07T10:14:00Z',
    trigger: 'manual',
    inputBrief: 'Outpatient PT, Tier 1 metros, 3rd-party only',
    steps: [
      {
        id: 'step-1',
        stepNumber: 1,
        specialist: 'finder',
        description: 'NPI taxonomy 225100000X in top-15 metros',
        inputCount: 0,
        outputCount: 138,
        latencyMs: 2550,
        tokensIn: 4100,
        tokensOut: 3750,
        costUsd: 0.020,
        status: 'ok',
      },
      {
        id: 'step-2',
        stepNumber: 2,
        specialist: 'classifier',
        description: '3rd-party vs captive',
        inputCount: 138,
        outputCount: 81,
        latencyMs: 4200,
        tokensIn: 8100,
        tokensOut: 3400,
        costUsd: 0.035,
        status: 'ok',
      },
      {
        id: 'step-3',
        stepNumber: 3,
        specialist: 'estimator',
        description: 'Revenue extrapolation',
        inputCount: 81,
        outputCount: 20,
        latencyMs: 3100,
        tokensIn: 5800,
        tokensOut: 2700,
        costUsd: 0.025,
        status: 'ok',
      },
    ],
    evidenceValidatedCount: 19,
    evaluationSurfacedCount: 19,
    totalCostUsd: 0.080,
    totalLatencyMs: 9850,
    promptVersion: 'v1.2',
  },
  {
    id: 'srun-2026-03-31',
    triggeredBy: 'Sam Stillman',
    triggeredAt: '2026-03-31T15:22:00Z',
    trigger: 'manual',
    inputBrief: 'Pilot run — Dallas + Houston only',
    steps: [
      {
        id: 'step-1',
        stepNumber: 1,
        specialist: 'finder',
        description: 'Pilot geography',
        inputCount: 0,
        outputCount: 62,
        latencyMs: 1800,
        tokensIn: 3100,
        tokensOut: 2400,
        costUsd: 0.015,
        status: 'ok',
      },
      {
        id: 'step-2',
        stepNumber: 2,
        specialist: 'classifier',
        description: '3rd-party filter',
        inputCount: 62,
        outputCount: 34,
        latencyMs: 3400,
        tokensIn: 5900,
        tokensOut: 2200,
        costUsd: 0.028,
        status: 'ok',
      },
      {
        id: 'step-3',
        stepNumber: 3,
        specialist: 'estimator',
        description: 'Revenue extrapolation',
        inputCount: 34,
        outputCount: 9,
        latencyMs: 2800,
        tokensIn: 4200,
        tokensOut: 1900,
        costUsd: 0.019,
        status: 'ok',
      },
    ],
    evidenceValidatedCount: 9,
    evaluationSurfacedCount: 9,
    totalCostUsd: 0.062,
    totalLatencyMs: 8000,
    promptVersion: 'v1.1',
  },
]

// ─── Aggregates for Chief of Staff widgets ──────────────────────

export function getMorningRitualStats() {
  // First-open time per user (minutes after briefing ready)
  const byUser = new Map<string, number[]>()
  for (const b of BRIEFINGS) {
    if (!b.dashboardOpenedAt) continue
    const openMs = new Date(b.dashboardOpenedAt).getTime() - new Date(b.triggeredAt).getTime()
    const mins = openMs / 60000
    if (!byUser.has(b.userId)) byUser.set(b.userId, [])
    byUser.get(b.userId)!.push(mins)
  }
  const stats = QUADRANT_USERS.map(u => {
    const arr = byUser.get(u.id) || []
    const sorted = [...arr].sort((a, b) => a - b)
    const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : null
    const opens = BRIEFINGS.filter(b => b.userId === u.id && b.dashboardOpenedAt).length
    const total = BRIEFINGS.filter(b => b.userId === u.id).length
    return {
      userId: u.id,
      userName: u.name,
      medianMinutesToOpen: median,
      dashboardOpens14d: opens,
      briefingsTotal: total,
      openRate: total ? opens / total : 0,
    }
  })
  return stats
}

export function getCardBreakdownByUser() {
  return QUADRANT_USERS.map(u => {
    const bs = BRIEFINGS.filter(b => b.userId === u.id)
    const byType: Record<CardType, { total: number; acted: number; dismissed: number }> = {
      follow_up: { total: 0, acted: 0, dismissed: 0 },
      meeting_prep: { total: 0, acted: 0, dismissed: 0 },
      deal_action: { total: 0, acted: 0, dismissed: 0 },
      email_draft: { total: 0, acted: 0, dismissed: 0 },
      admin: { total: 0, acted: 0, dismissed: 0 },
      deferred: { total: 0, acted: 0, dismissed: 0 },
    }
    for (const b of bs) {
      for (const c of b.cards) {
        byType[c.type].total++
        if (c.action === 'done' || c.action === 'scheduled') byType[c.type].acted++
        if (c.action === 'dismissed') byType[c.type].dismissed++
      }
    }
    return { userId: u.id, userName: u.name, byType }
  })
}

export function getOutlookDraftLifecycle() {
  const counts: Record<DraftLifecycle, number> = { drafted: 0, sent: 0, edited: 0, deleted: 0 }
  const byUser: Record<string, Record<DraftLifecycle, number>> = {}
  for (const u of QUADRANT_USERS) byUser[u.id] = { drafted: 0, sent: 0, edited: 0, deleted: 0 }
  for (const b of BRIEFINGS) {
    for (const c of b.cards) {
      if (!c.draft) continue
      counts[c.draft.lifecycle]++
      byUser[b.userId][c.draft.lifecycle]++
    }
  }
  return { total: counts, byUser }
}

export function getActionRate(userId: string | 'all') {
  const bs = userId === 'all' ? BRIEFINGS : BRIEFINGS.filter(b => b.userId === userId)
  let total = 0
  let acted = 0
  for (const b of bs) {
    for (const c of b.cards) {
      total++
      if (c.action === 'done' || c.action === 'scheduled') acted++
    }
  }
  return { acted, total, rate: total ? acted / total : 0 }
}

// ─── Day-5 Decision Report data ─────────────────────────────────

export function getDay5ReportData() {
  const ritual = getMorningRitualStats()
  const actionRates = QUADRANT_USERS.map(u => ({ user: u.name, ...getActionRate(u.id) }))
  const cands = getCandidates()
  const reviewed = cands.filter(c => c.fitState !== 'unreviewed').length
  const good = cands.filter(c => c.fitState === 'good_fit').length
  const surfaceCount = 21 // from latest manager run

  return {
    morningRitual: ritual,
    actionRates,
    topPromptOpportunities: [
      'Reduce admin-card volume — 42% are dismissed (propose tighter admin guardrails in prompt §Volume).',
      'Strengthen Granola fusion: 18% of follow_up cards duplicate meeting_prep context.',
      'Raise email_draft send rate — currently 34%, target 50%+ via shorter-is-better tone guidance.',
    ],
    sourcing: {
      surfacedCount: surfaceCount,
      reviewedCount: reviewed,
      goodFitCount: good,
      poorFitCount: cands.filter(c => c.fitState === 'poor_fit').length,
      unclearCount: cands.filter(c => c.fitState === 'unclear').length,
    },
    recommendation: {
      decision: 'conditional' as const,
      narrative:
        'Extend engagement conditional on (a) tightening Chief of Staff prompt against admin-card churn, and (b) adding a licensing-dispute evidence source to Sourcing rule 1. Data inventory is sufficient; evaluation set of 10 calibration examples is tracking at 7/10 accuracy, above the 6/10 minimum go/no-go.',
      signedBy: 'Les Perry (FuzeBox.AI) · Sam Stillman (Quadrant)',
    },
  }
}
