import type {
  Organisation,
  Process,
  Agent,
  OnetTask,
  AgentRoi,
  RoiSnapshot,
  AuditLogEntry,
  SigmaTrendPoint,
  SigmaLevel,
  Run,
  Span,
  LanguageVocabulary,
  OnetOccupation,
  CoverageMapEntry,
  FmeaEntry,
  TransformationStage,
  ReportConfig,
  ServqualDimension,
  AgentProfile,
  DecommissionImpact,
  MonthlyCost,
  ScheduledReport,
  SkillGap,
  TeamMemberTraining,
  ProcessBenchmark,
  StagingCandidate,
  AgentVersion,
  Scenario,
  WorkforceProjection,
  GovernanceRule,
  GovernanceViolation,
  IndustryBenchmark,
  Anomaly,
  AnomalySeverity,
  Correlation,
  CorrelationPoint,
} from '@/types/telemetry'

// ─── Organisation ────────────────────────────────────────────────

export const ORGANISATION: Organisation = {
  name: 'FuzeBox AI',
  industry: 'Gaming / Sports Betting',
  qualityFramework: 'oee',
  sigmaTarget: 4.0,
  langfuse: {
    status: 'connected',
    host: 'cloud.langfuse.com',
    project: 'vipplay-production',
    lastSync: '2026-03-30T19:52:00Z',
  },
  onet: {
    status: 'registered',
    host: 'onetcenter.org',
    lastRefresh: '2026-03-28T00:00:00Z',
  },
}

// ─── Processes ───────────────────────────────────────────────────

export const PROCESSES: Process[] = [
  {
    id: 'sports-betting',
    name: 'Sports Betting Analyst',
    onetCode: '13-2099.01',
    headcount: 12,
    avgHourlyWage: 42,
    weeklyHours: 40,
    agentCoverage: 0.43,
    collaborativeCoverage: 0.20,
    humanCoverage: 0.37,
    status: 'green',
    weeklyNetRoi: 1426,
    weeklyGrossSaving: 2116,
    agents: ['odds-analysis', 'line-comparison', 'recommendation-writer'],
  },
  {
    id: 'customer-service',
    name: 'Customer Service Representative',
    onetCode: '43-4051.00',
    headcount: 8,
    avgHourlyWage: 28,
    weeklyHours: 40,
    agentCoverage: 0.31,
    collaborativeCoverage: 0.15,
    humanCoverage: 0.54,
    status: 'amber',
    weeklyNetRoi: 612,
    weeklyGrossSaving: 896,
    agents: ['customer-response'],
  },
]

// ─── Agents ──────────────────────────────────────────────────────

export const AGENTS: Agent[] = [
  {
    id: 'odds-analysis',
    name: 'Odds Analysis Agent',
    processId: 'sports-betting',
    model: 'gpt-4o',
    framework: 'CrewAI',
    status: 'green',
    sigmaScore: 4.2,
    sigmaTrend: 'up',
    sigmaPrev: 3.8,
    dpmo: 2776,
    oee: 0.83,
    successRate: 0.88,
    p95LatencyMs: 3200,
    avgCostPerRun: 0.0252,
    totalRuns: 50,
    defects: {
      failures: 6,     // 50 * (1 - 0.88) = 6
      latencyBreaches: 3,
      costOverruns: 1,
    },
    tasks: [
      'Analyse betting line movements',
      'Compare competitor odds across platforms',
    ],
  },
  {
    id: 'line-comparison',
    name: 'Line Comparison Agent',
    processId: 'sports-betting',
    model: 'gpt-4o',
    framework: 'CrewAI',
    status: 'amber',
    sigmaScore: 3.4,
    sigmaTrend: 'flat',
    sigmaPrev: 3.4,
    dpmo: 22750,
    oee: 0.71,
    successRate: 0.74,
    p95LatencyMs: 3800,
    avgCostPerRun: 0.0188,
    totalRuns: 43,
    defects: {
      failures: 11,    // 43 * (1 - 0.74) ≈ 11
      latencyBreaches: 5,
      costOverruns: 2,
    },
    tasks: [
      'Compare competitor odds across platforms',
    ],
  },
  {
    id: 'recommendation-writer',
    name: 'Recommendation Writer Agent',
    processId: 'sports-betting',
    model: 'claude-3-5-sonnet',
    framework: 'CrewAI',
    status: 'red',
    sigmaScore: 2.9,
    sigmaTrend: 'down',
    sigmaPrev: 3.1,
    dpmo: 67210,
    oee: 0.58,
    successRate: 0.61,
    p95LatencyMs: 4100,
    avgCostPerRun: 0.0091,
    totalRuns: 36,
    defects: {
      failures: 14,    // 36 * (1 - 0.61) ≈ 14
      latencyBreaches: 7,
      costOverruns: 3,
    },
    tasks: [
      'Generate client recommendations',
    ],
  },
  {
    id: 'customer-response',
    name: 'Customer Response Agent',
    processId: 'customer-service',
    model: 'gpt-4o-mini',
    framework: 'CrewAI',
    status: 'amber',
    sigmaScore: 3.2,
    sigmaTrend: 'flat',
    sigmaPrev: 3.2,
    dpmo: 44565,
    oee: 0.65,
    successRate: 0.72,
    p95LatencyMs: 2900,
    avgCostPerRun: 0.0064,
    totalRuns: 40,
    defects: {
      failures: 11,
      latencyBreaches: 4,
      costOverruns: 2,
    },
    tasks: [
      'Draft initial customer responses',
      'Classify customer intent',
      'Retrieve knowledge base articles',
    ],
  },
]

// ─── O*NET Tasks: Sports Betting Analyst ─────────────────────────
// Time weights must sum to 1.0:
// 0.18 + 0.14 + 0.11 + 0.12 + 0.08 + 0.09 + 0.07 + 0.06 + 0.05 + 0.10 = 1.00
// Agent coverage:  0.18 + 0.14 + 0.11 = 0.43
// Collaborative:   0.12 + 0.08 = 0.20
// Human retained:  0.09 + 0.07 + 0.06 + 0.05 + 0.10 = 0.37
// Total: 0.43 + 0.20 + 0.37 = 1.00

export const ONET_TASKS: OnetTask[] = [
  // ── Sports Betting Analyst tasks (10) ───────────────────────────
  { id: 't1',  processId: 'sports-betting', task: 'Analyse betting line movements',                  timeWeight: 0.18, automationScore: 0.89, ownership: 'agent',         agentName: 'Odds Analysis Agent' },
  { id: 't2',  processId: 'sports-betting', task: 'Compare competitor odds across platforms',         timeWeight: 0.14, automationScore: 0.92, ownership: 'agent',         agentName: 'Line Comparison Agent' },
  { id: 't3',  processId: 'sports-betting', task: 'Generate client recommendations',                 timeWeight: 0.11, automationScore: 0.71, ownership: 'agent',         agentName: 'Recommendation Writer Agent' },
  { id: 't4',  processId: 'sports-betting', task: 'Review and approve automated recommendations',    timeWeight: 0.12, automationScore: 0.31, ownership: 'collaborative', agentName: null },
  { id: 't5',  processId: 'sports-betting', task: 'Escalate unusual market movements',               timeWeight: 0.08, automationScore: 0.28, ownership: 'collaborative', agentName: null },
  { id: 't6',  processId: 'sports-betting', task: 'Maintain client relationship context',            timeWeight: 0.09, automationScore: 0.18, ownership: 'human',         agentName: null },
  { id: 't7',  processId: 'sports-betting', task: 'Regulatory compliance review',                    timeWeight: 0.07, automationScore: 0.22, ownership: 'human',         agentName: null },
  { id: 't8',  processId: 'sports-betting', task: 'Handle client disputes and complaints',           timeWeight: 0.06, automationScore: 0.15, ownership: 'human',         agentName: null },
  { id: 't9',  processId: 'sports-betting', task: 'Team briefings and knowledge sharing',            timeWeight: 0.05, automationScore: 0.11, ownership: 'human',         agentName: null },
  { id: 't10', processId: 'sports-betting', task: 'Emergency market intervention decisions',         timeWeight: 0.10, automationScore: 0.09, ownership: 'human',         agentName: null },

  // ── Customer Service Representative tasks (6) ──────────────────
  { id: 'ct1', processId: 'customer-service', task: 'Draft initial customer responses',              timeWeight: 0.22, automationScore: 0.85, ownership: 'agent',         agentName: 'Customer Response Agent' },
  { id: 'ct2', processId: 'customer-service', task: 'Classify customer intent and route tickets',    timeWeight: 0.09, automationScore: 0.78, ownership: 'agent',         agentName: 'Customer Response Agent' },
  { id: 'ct3', processId: 'customer-service', task: 'Review and personalise agent-drafted responses',timeWeight: 0.15, automationScore: 0.35, ownership: 'collaborative', agentName: null },
  { id: 'ct4', processId: 'customer-service', task: 'Handle complex account disputes',              timeWeight: 0.20, automationScore: 0.12, ownership: 'human',         agentName: null },
  { id: 'ct5', processId: 'customer-service', task: 'Manage escalations and VIP clients',           timeWeight: 0.18, automationScore: 0.10, ownership: 'human',         agentName: null },
  { id: 'ct6', processId: 'customer-service', task: 'Quality assurance and call coaching',          timeWeight: 0.16, automationScore: 0.08, ownership: 'human',         agentName: null },
]

// ─── ROI Snapshots ───────────────────────────────────────────────
// Sports Betting: 2116 - 483 - 38 - 169 = 1426 ✓

export const ROI_SNAPSHOTS: RoiSnapshot[] = [
  {
    processId: 'sports-betting',
    agentCoveragePct: 0.43,
    collaborativePct: 0.20,
    humanRetainedPct: 0.37,
    grossSavingWeekly: 2116,
    oversightCostWeekly: 483,
    inferenceCostWeekly: 38,
    governanceOverheadWeekly: 169,
    netRoiWeekly: 1426,
    netPerPerson: 119,
    manualCostPerTask: 50,
  },
  {
    processId: 'customer-service',
    agentCoveragePct: 0.31,
    collaborativePct: 0.15,
    humanRetainedPct: 0.54,
    grossSavingWeekly: 896,
    oversightCostWeekly: 152,
    inferenceCostWeekly: 10,
    governanceOverheadWeekly: 122,
    netRoiWeekly: 612,
    netPerPerson: 77,
    manualCostPerTask: 35,
  },
]

// ─── Sigma Translation Table ─────────────────────────────────────

export const SIGMA_LEVELS: SigmaLevel[] = [
  { sigma: 1, dpmo: 691462, label: 'Unreliable — do not deploy',             shortLabel: 'Unreliable' },
  { sigma: 2, dpmo: 308538, label: 'High risk — human gate mandatory',       shortLabel: 'High risk' },
  { sigma: 3, dpmo: 66807,  label: 'Needs tuning — supervised use only',     shortLabel: 'Needs gate' },
  { sigma: 4, dpmo: 6210,   label: 'Supervised production — monitor closely',shortLabel: 'Supervised' },
  { sigma: 5, dpmo: 233,    label: 'Production ready — standard monitoring', shortLabel: 'Prod. ready' },
  { sigma: 6, dpmo: 3.4,    label: 'Autonomous — minimal human oversight',   shortLabel: 'World class' },
]

// ─── Language Mode Vocabulary ────────────────────────────────────

export const LANGUAGE_MODES: Record<'operations' | 'quality', LanguageVocabulary> = {
  operations: {
    green: 'Performing well',
    amber: 'Needs attention',
    red: 'Requires action',
    qualityPrefix: 'Reliable',
    qualitySuffix: '% of the time',
    trendUp: 'Quality improving',
    trendDown: 'Quality declining — action needed',
    trendFlat: 'Quality stable',
    target: 'Your quality target',
    defect: 'Task incomplete — review required',
    effectiveness: 'OEE',
  },
  quality: {
    green: 'Above target',
    amber: 'Below target',
    red: 'Critical — below 3σ',
    qualityPrefix: 'DPMO:',
    qualitySuffix: '',
    trendUp: 'DPMO trending down ↓',
    trendDown: 'DPMO trending up ↑ — investigate',
    trendFlat: 'DPMO stable',
    target: 'σ benchmark',
    defect: 'Non-conformance recorded',
    effectiveness: 'Process capability Cpk',
  },
}

// ─── 30-Day Sigma Trend ──────────────────────────────────────────

/** Deterministic seeded pseudo-random in range [-1, 1] */
function seededNoise(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return (x - Math.floor(x)) * 2 - 1
}

/** Convert sigma to DPMO using standard approximation */
function sigmaToDpmo(sigma: number): number {
  // Standard lookup-based approximation
  // Using the relation: DPMO ≈ 1_000_000 * (1 - Φ(sigma - 1.5))
  // Simplified polynomial fit for the range 2–5σ
  const dpmo = 1_000_000 * Math.exp(-0.8406 * sigma * sigma + 1.243 * sigma - 0.342)
  return Math.max(1, Math.round(dpmo))
}

function generateSigmaTrend(
  agentId: string,
  startSigma: number,
  endSigma: number,
  noiseAmplitude: number,
): SigmaTrendPoint[] {
  const baseDate = new Date('2026-03-01T00:00:00Z')
  const seedBase = agentId.length * 17

  return Array.from({ length: 30 }, (_, i) => {
    const t = i / 29 // 0 → 1
    const linearSigma = startSigma + (endSigma - startSigma) * t
    const noise = seededNoise(seedBase + i) * noiseAmplitude
    const sigma = parseFloat((linearSigma + noise).toFixed(2))
    const date = new Date(baseDate)
    date.setUTCDate(date.getUTCDate() + i)

    return {
      day: i + 1,
      date: date.toISOString().slice(0, 10),
      sigma,
      dpmo: sigmaToDpmo(sigma),
    }
  })
}

export const SIGMA_TRENDS: Record<string, SigmaTrendPoint[]> = {
  'odds-analysis':        generateSigmaTrend('odds-analysis',        3.8, 4.2, 0.05),
  'line-comparison':      generateSigmaTrend('line-comparison',      3.4, 3.4, 0.08),
  'recommendation-writer':generateSigmaTrend('recommendation-writer',3.1, 2.9, 0.04),
  'customer-response':    generateSigmaTrend('customer-response',    3.2, 3.2, 0.06),
}

// ─── Run History (50 runs for Odds Analysis) ─────────────────────

function generateRunHistory(
  agentId: string,
  totalRuns: number,
  successCount: number,
  spanNames: string[],
): Run[] {
  const baseDate = new Date('2026-03-01T08:00:00Z')
  const seedBase = agentId.length * 31
  const prefix = agentId.slice(0, 4).toUpperCase()

  // Determine which runs are failures (deterministic)
  const failureIndices = new Set<number>()
  const failCount = totalRuns - successCount
  for (let f = 0; f < failCount; f++) {
    // Spread failures across the run range
    const idx = Math.round(((f + 1) * totalRuns) / (failCount + 1))
    failureIndices.add(idx)
  }

  return Array.from({ length: totalRuns }, (_, i) => {
    const s = (seedBase + i * 31337) % 1000
    const isSuccess = !failureIndices.has(i)

    // Timestamp: business hours (8am-6pm), every 2-4 hours over 30 days
    const dayOffset = Math.floor((i * 30) / totalRuns)
    const hourOffset = 8 + (((s % 5) * 2) + (s % 3)) // 8-18 range
    const runDate = new Date(baseDate)
    runDate.setUTCDate(runDate.getUTCDate() + dayOffset)
    runDate.setUTCHours(Math.min(hourOffset, 17), s % 60, 0, 0)

    const durationMs = isSuccess
      ? 800 + (s % 2400)  // 800-3200ms for success
      : 2800 + (s % 1400) // 2800-4200ms for failure (slower)

    const tokenCount = isSuccess
      ? 1200 + (s % 1600)  // 1200-2800
      : 800 + (s % 800)    // 800-1600 for failures (partial)

    const rateMap: Record<string, number> = {
      'gpt-4o': 0.000015,
      'gpt-4o-mini': 0.000003,
      'claude-3-5-sonnet': 0.000012,
    }
    const agent = AGENTS.find(a => a.id === agentId)!
    const cost = tokenCount * (rateMap[agent.model] ?? 0.000010)

    const toolCalls = isSuccess ? 3 + (s % 5) : 1 + (s % 2)

    // Generate spans
    const splits = [[0.30, 0.40, 0.30], [0.25, 0.50, 0.25], [0.35, 0.35, 0.30]]
    const split = splits[i % 3]

    let spans: Span[]
    if (!isSuccess) {
      // Failed run: first span OK, second span errors out
      const failSpanIdx = 1 + (s % Math.max(1, spanNames.length - 1))
      spans = spanNames.slice(0, failSpanIdx + 1).map((name, si) => ({
        name,
        duration_ms: Math.round(durationMs * (split[si] ?? 0.3)),
        status: (si === failSpanIdx ? 'error' : 'ok') as 'ok' | 'error',
        cost: parseFloat((cost * (split[si] ?? 0.3)).toFixed(6)),
        tool_calls: si === failSpanIdx ? 0 : 1 + (s % 2),
        ...(si === failSpanIdx ? { error: 'Upstream timeout: odds feed unavailable after 3 retries' } : {}),
      }))
    } else {
      spans = spanNames.map((name, si) => ({
        name,
        duration_ms: Math.round(durationMs * (split[si] ?? 0.3)),
        status: 'ok' as const,
        cost: parseFloat((cost * (split[si] ?? 0.3)).toFixed(6)),
        tool_calls: 1 + (s % 3),
      }))
    }

    const runId = `${prefix}-${String(i + 1).padStart(4, '0')}`
    const totalCostVal = parseFloat(cost.toFixed(6))

    return {
      runId,
      agentId,
      timestamp: runDate.toISOString(),
      durationMs,
      outcome: isSuccess,
      totalCost: totalCostVal,
      tokenCount,
      toolCalls,
      spans,
    }
  })
}

export const RUN_HISTORY: Record<string, Run[]> = {
  'odds-analysis': generateRunHistory(
    'odds-analysis',
    50,
    44, // 88% success = 44/50
    ['OddsScraperAgent', 'LineComparisonAgent', 'RecommendationWriterAgent'],
  ),
  'line-comparison': generateRunHistory(
    'line-comparison',
    43,
    32, // 74% success ≈ 32/43
    ['LineComparisonAgent', 'OddsScraperAgent'],
  ),
  'recommendation-writer': generateRunHistory(
    'recommendation-writer',
    36,
    22, // 61% success ≈ 22/36
    ['RecommendationWriterAgent', 'LineComparisonAgent'],
  ),
  'customer-response': generateRunHistory(
    'customer-response',
    40,
    29, // 72% success ≈ 29/40
    ['CustomerResponseAgent', 'IntentClassifierAgent'],
  ),
}

// ─── Audit Log (15 entries) ──────────────────────────────────────
// 9 APPROVED, 4 OVERRIDDEN, 2 ESCALATED

export const AUDIT_LOG: AuditLogEntry[] = [
  {
    id: 'aud-001',
    timestamp: '2026-03-30T19:50:00Z',
    processName: 'Sports Betting Analyst',
    task: 'Review automated recommendations',
    agentRecommendation: 'Lay bet on Man Utd -1.5 at odds 2.40',
    humanDecision: 'Approved as recommended',
    reviewer: 'Marcus Webb',
    decisionType: 'approved',
    durationMinutes: 3,
  },
  {
    id: 'aud-002',
    timestamp: '2026-03-30T16:22:00Z',
    processName: 'Sports Betting Analyst',
    task: 'Review automated recommendations',
    agentRecommendation: 'Back Liverpool ML at odds 1.85',
    humanDecision: 'Approved as recommended',
    reviewer: 'Priya Sharma',
    decisionType: 'approved',
    durationMinutes: 2,
  },
  {
    id: 'aud-003',
    timestamp: '2026-03-30T14:05:00Z',
    processName: 'Sports Betting Analyst',
    task: 'Review automated recommendations',
    agentRecommendation: 'Back Arsenal -1 Asian handicap at odds 1.92',
    humanDecision: 'Changed to lay bet based on injury news not yet reflected in odds',
    reviewer: 'Marcus Webb',
    decisionType: 'overridden',
    durationMinutes: 8,
  },
  {
    id: 'aud-004',
    timestamp: '2026-03-29T18:40:00Z',
    processName: 'Sports Betting Analyst',
    task: 'Review automated recommendations',
    agentRecommendation: 'Over 2.5 goals in Chelsea vs Spurs at odds 1.78',
    humanDecision: 'Approved as recommended',
    reviewer: 'James Okello',
    decisionType: 'approved',
    durationMinutes: 4,
  },
  {
    id: 'aud-005',
    timestamp: '2026-03-29T15:12:00Z',
    processName: 'Sports Betting Analyst',
    task: 'Review automated recommendations',
    agentRecommendation: 'Lay bet on draw in Wolves vs Burnley at odds 3.10',
    humanDecision: 'Approved as recommended',
    reviewer: 'Priya Sharma',
    decisionType: 'approved',
    durationMinutes: 2,
  },
  {
    id: 'aud-006',
    timestamp: '2026-03-29T11:30:00Z',
    processName: 'Sports Betting Analyst',
    task: 'Review automated recommendations',
    agentRecommendation: 'Back Newcastle +0.5 Asian handicap at odds 2.05',
    humanDecision: 'Reduced stake by 50% — recent form inconsistent with model confidence',
    reviewer: 'Marcus Webb',
    decisionType: 'overridden',
    durationMinutes: 6,
  },
  {
    id: 'aud-007',
    timestamp: '2026-03-28T19:15:00Z',
    processName: 'Sports Betting Analyst',
    task: 'Escalate unusual market movements',
    agentRecommendation: 'Heavy back bet on West Ham ML at odds 4.20',
    humanDecision: 'Escalated to senior — unusual volume spike on Asian handicap market',
    reviewer: 'Priya Sharma',
    decisionType: 'escalated',
    durationMinutes: 12,
  },
  {
    id: 'aud-008',
    timestamp: '2026-03-28T14:45:00Z',
    processName: 'Sports Betting Analyst',
    task: 'Review automated recommendations',
    agentRecommendation: 'Under 2.5 goals in Everton vs Brighton at odds 2.15',
    humanDecision: 'Approved as recommended',
    reviewer: 'James Okello',
    decisionType: 'approved',
    durationMinutes: 3,
  },
  {
    id: 'aud-009',
    timestamp: '2026-03-27T17:30:00Z',
    processName: 'Sports Betting Analyst',
    task: 'Review automated recommendations',
    agentRecommendation: 'Back both teams to score in Aston Villa vs Forest at odds 1.72',
    humanDecision: 'Switched to under 2.5 goals — goalkeeper returned from injury, defensive record improved',
    reviewer: 'Marcus Webb',
    decisionType: 'overridden',
    durationMinutes: 7,
  },
  {
    id: 'aud-010',
    timestamp: '2026-03-27T12:10:00Z',
    processName: 'Sports Betting Analyst',
    task: 'Review automated recommendations',
    agentRecommendation: 'Back Man City -2 at odds 2.80',
    humanDecision: 'Approved as recommended',
    reviewer: 'Priya Sharma',
    decisionType: 'approved',
    durationMinutes: 2,
  },
  {
    id: 'aud-011',
    timestamp: '2026-03-26T16:55:00Z',
    processName: 'Sports Betting Analyst',
    task: 'Review automated recommendations',
    agentRecommendation: 'Lay bet on Crystal Palace ML at odds 3.50',
    humanDecision: 'Approved as recommended',
    reviewer: 'James Okello',
    decisionType: 'approved',
    durationMinutes: 3,
  },
  {
    id: 'aud-012',
    timestamp: '2026-03-26T11:20:00Z',
    processName: 'Sports Betting Analyst',
    task: 'Review automated recommendations',
    agentRecommendation: 'Back Leicester draw no bet at odds 2.30',
    humanDecision: 'Rejected and reversed — relegation-zone team, model overweighting recent home form',
    reviewer: 'Marcus Webb',
    decisionType: 'overridden',
    durationMinutes: 9,
  },
  {
    id: 'aud-013',
    timestamp: '2026-03-25T18:05:00Z',
    processName: 'Sports Betting Analyst',
    task: 'Escalate unusual market movements',
    agentRecommendation: 'Back Fulham ML at odds 5.00 — sharp money detected',
    humanDecision: 'Escalated to compliance — potential match-fixing indicators flagged',
    reviewer: 'James Okello',
    decisionType: 'escalated',
    durationMinutes: 15,
  },
  {
    id: 'aud-014',
    timestamp: '2026-03-25T14:30:00Z',
    processName: 'Sports Betting Analyst',
    task: 'Review automated recommendations',
    agentRecommendation: 'Over 3.5 goals in Bournemouth vs Southampton at odds 2.60',
    humanDecision: 'Approved as recommended',
    reviewer: 'Priya Sharma',
    decisionType: 'approved',
    durationMinutes: 2,
  },
  {
    id: 'aud-015',
    timestamp: '2026-03-24T15:40:00Z',
    processName: 'Sports Betting Analyst',
    task: 'Review automated recommendations',
    agentRecommendation: 'Back Tottenham -1 at odds 2.10',
    humanDecision: 'Approved as recommended',
    reviewer: 'Marcus Webb',
    decisionType: 'approved',
    durationMinutes: 3,
  },
]

// ─── Helper: get data by process / agent ID ──────────────────────

export function getProcessById(id: string): Process | undefined {
  return PROCESSES.find(p => p.id === id)
}

export function getAgentById(id: string): Agent | undefined {
  return AGENTS.find(a => a.id === id)
}

export function getAgentsForProcess(processId: string): Agent[] {
  return AGENTS.filter(a => a.processId === processId)
}

export function getTasksForProcess(processId: string): OnetTask[] {
  return ONET_TASKS.filter(t => t.processId === processId)
}

export function getRoiForProcess(processId: string): RoiSnapshot | undefined {
  return ROI_SNAPSHOTS.find(r => r.processId === processId)
}

export function getRunsForAgent(agentId: string): Run[] {
  return RUN_HISTORY[agentId] ?? []
}

export function getSigmaTrendForAgent(agentId: string): SigmaTrendPoint[] {
  return SIGMA_TRENDS[agentId] ?? []
}

// ─── Per-Agent ROI ──────────────────────────────────────────────

export function getAgentRoi(agentId: string): AgentRoi | undefined {
  const agent = getAgentById(agentId)
  if (!agent) return undefined

  const roi = getRoiForProcess(agent.processId)
  if (!roi) return undefined

  const processTasks = getTasksForProcess(agent.processId)
  const processAgents = getAgentsForProcess(agent.processId)

  // Sum of all timeWeights for agent-owned tasks
  const totalAgentTimeWeight = processTasks
    .filter(t => t.ownership === 'agent')
    .reduce((s, t) => s + t.timeWeight, 0)

  // This agent's tasks (matched by agentName)
  const agentTaskWeight = processTasks
    .filter(t => t.agentName === agent.name)
    .reduce((s, t) => s + t.timeWeight, 0)

  // Agent's share among all agent-owned tasks
  const share = totalAgentTimeWeight > 0 ? agentTaskWeight / totalAgentTimeWeight : 0

  // Gross saving proportional to share
  const grossSavingWeekly = Math.round(roi.grossSavingWeekly * share)

  // Inference cost from actual run history
  const runs = getRunsForAgent(agentId)
  const totalRunCost = runs.reduce((s, r) => s + r.totalCost, 0)
  // Scale run costs to weekly (30 days of runs -> weekly)
  const inferenceCostWeekly = Math.round((totalRunCost / 30) * 7 * 100) / 100

  // Oversight and governance proportional to share
  const oversightCostWeekly = Math.round(roi.oversightCostWeekly * share)
  const governanceCostWeekly = Math.round(roi.governanceOverheadWeekly * share)

  const netRoiWeekly = Math.round(
    grossSavingWeekly - inferenceCostWeekly - oversightCostWeekly - governanceCostWeekly
  )

  return {
    agentId,
    agentName: agent.name,
    taskTimeWeightPct: Math.round(agentTaskWeight * 100),
    grossSavingWeekly,
    inferenceCostWeekly,
    oversightCostWeekly,
    governanceCostWeekly,
    netRoiWeekly,
  }
}

export function getAgentRoisForProcess(processId: string): AgentRoi[] {
  const agents = getAgentsForProcess(processId)
  return agents
    .map(a => getAgentRoi(a.id))
    .filter((r): r is AgentRoi => r !== undefined)
}

// ─── O*NET Occupation Search Results (for A2) ───────────────────

export const ONET_OCCUPATIONS: OnetOccupation[] = [
  { code: '13-2099.01', title: 'Sports Betting Analyst', description: 'Analyse odds, compare lines, generate betting recommendations for clients.', automationRisk: 'high', taskCount: 10, medianWage: 42, category: 'Business and Financial Operations' },
  { code: '43-4051.00', title: 'Customer Service Representatives', description: 'Interact with customers to handle complaints, process orders, and provide information.', automationRisk: 'medium', taskCount: 6, medianWage: 28, category: 'Office and Administrative Support' },
  { code: '13-2011.00', title: 'Accountants and Auditors', description: 'Examine financial statements for accuracy and legal compliance.', automationRisk: 'medium', taskCount: 12, medianWage: 38, category: 'Business and Financial Operations' },
  { code: '15-1252.00', title: 'Software Developers', description: 'Design, develop, and test software applications and systems.', automationRisk: 'low', taskCount: 14, medianWage: 62, category: 'Computer and Mathematical' },
  { code: '41-3031.00', title: 'Securities and Financial Sales Agents', description: 'Buy and sell securities and provide financial advice to clients.', automationRisk: 'high', taskCount: 11, medianWage: 49, category: 'Sales and Related' },
  { code: '13-1161.00', title: 'Market Research Analysts', description: 'Research market conditions to examine potential sales of a product or service.', automationRisk: 'high', taskCount: 9, medianWage: 35, category: 'Business and Financial Operations' },
  { code: '29-2099.00', title: 'Health Information Technologists', description: 'Apply knowledge of health care and information systems to assist in patient care.', automationRisk: 'medium', taskCount: 8, medianWage: 30, category: 'Healthcare Practitioners' },
  { code: '43-3031.00', title: 'Bookkeeping and Accounting Clerks', description: 'Compute, classify, and record numerical data to keep financial records.', automationRisk: 'high', taskCount: 7, medianWage: 22, category: 'Office and Administrative Support' },
]

// ─── Coverage Map (for A3 — Sports Betting process) ─────────────

export const COVERAGE_MAP: CoverageMapEntry[] = [
  { taskId: 't1', task: 'Analyse betting line movements', timeWeight: 0.18, automationScore: 0.89, ownership: 'agent', agentId: 'odds-analysis', agentName: 'Odds Analysis Agent', confidence: 'high', notes: 'Fully automated since March 2026. 4.2σ quality.' },
  { taskId: 't2', task: 'Compare competitor odds across platforms', timeWeight: 0.14, automationScore: 0.92, ownership: 'agent', agentId: 'line-comparison', agentName: 'Line Comparison Agent', confidence: 'high', notes: 'Automated. Latency variance being investigated.' },
  { taskId: 't3', task: 'Generate client recommendations', timeWeight: 0.11, automationScore: 0.71, ownership: 'agent', agentId: 'recommendation-writer', agentName: 'Recommendation Writer Agent', confidence: 'low', notes: 'Quality declining (2.9σ). May revert to collaborative.' },
  { taskId: 't4', task: 'Review and approve automated recommendations', timeWeight: 0.12, automationScore: 0.31, ownership: 'collaborative', agentId: 'recommendation-writer', agentName: 'Recommendation Writer Agent', confidence: 'medium', notes: '40% override rate. Agent suggests, human decides.' },
  { taskId: 't5', task: 'Escalate unusual market movements', timeWeight: 0.08, automationScore: 0.28, ownership: 'collaborative', agentId: null, agentName: null, confidence: 'medium', notes: 'Agent flags anomalies, human validates severity.' },
  { taskId: 't6', task: 'Maintain client relationship context', timeWeight: 0.09, automationScore: 0.18, ownership: 'human', agentId: null, agentName: null, confidence: 'high', notes: 'Requires nuanced understanding of client history.' },
  { taskId: 't7', task: 'Regulatory compliance review', timeWeight: 0.07, automationScore: 0.22, ownership: 'human', agentId: null, agentName: null, confidence: 'high', notes: 'Legal accountability requires human sign-off.' },
  { taskId: 't8', task: 'Handle client disputes and complaints', timeWeight: 0.06, automationScore: 0.15, ownership: 'human', agentId: null, agentName: null, confidence: 'high', notes: 'Empathy and negotiation not automatable.' },
  { taskId: 't9', task: 'Team briefings and knowledge sharing', timeWeight: 0.05, automationScore: 0.11, ownership: 'human', agentId: null, agentName: null, confidence: 'high', notes: 'Interpersonal skill. Cannot be delegated.' },
  { taskId: 't10', task: 'Emergency market intervention decisions', timeWeight: 0.10, automationScore: 0.09, ownership: 'human', agentId: null, agentName: null, confidence: 'high', notes: 'High-stakes judgment. Must remain human.' },
]

// ─── FMEA Data (for D3) ─────────────────────────────────────────

export const FMEA_ENTRIES: FmeaEntry[] = [
  {
    id: 'fmea-001', agentId: 'recommendation-writer', agentName: 'Recommendation Writer Agent',
    failureMode: 'Generates recommendation based on stale odds data',
    effect: 'Client acts on incorrect pricing, potential financial loss',
    cause: 'Odds feed API latency > 30 seconds not detected',
    severity: 9, occurrence: 6, detection: 4, rpn: 216,
    recommendedAction: 'Add staleness check: reject odds data older than 15 seconds',
    status: 'open',
  },
  {
    id: 'fmea-002', agentId: 'recommendation-writer', agentName: 'Recommendation Writer Agent',
    failureMode: 'Recommendation contradicts regulatory constraints',
    effect: 'Compliance violation, potential fine',
    cause: 'No jurisdiction-aware filtering in prompt chain',
    severity: 10, occurrence: 3, detection: 5, rpn: 150,
    recommendedAction: 'Add compliance rule layer before output',
    status: 'in-progress',
  },
  {
    id: 'fmea-003', agentId: 'line-comparison', agentName: 'Line Comparison Agent',
    failureMode: 'Fails to detect significant line movement across platforms',
    effect: 'Missed arbitrage opportunity or risk exposure',
    cause: 'Comparison window too narrow (only checks top 3 bookmakers)',
    severity: 7, occurrence: 5, detection: 6, rpn: 210,
    recommendedAction: 'Expand comparison to 8+ bookmakers with priority ranking',
    status: 'open',
  },
  {
    id: 'fmea-004', agentId: 'odds-analysis', agentName: 'Odds Analysis Agent',
    failureMode: 'Timeout on upstream odds feed API',
    effect: 'Run fails, no analysis produced for that cycle',
    cause: 'Third-party API rate limiting during peak hours',
    severity: 5, occurrence: 4, detection: 3, rpn: 60,
    recommendedAction: 'Implement retry with exponential backoff + fallback feed',
    status: 'mitigated',
  },
  {
    id: 'fmea-005', agentId: 'recommendation-writer', agentName: 'Recommendation Writer Agent',
    failureMode: 'Hallucinated odds or fabricated bookmaker quotes',
    effect: 'Client receives plausible but fictitious pricing, eroding trust and causing financial exposure',
    cause: 'LLM generates confident but ungrounded numerical outputs when source data is incomplete',
    severity: 9, occurrence: 5, detection: 5, rpn: 225,
    recommendedAction: 'Add factual grounding check: cross-reference every quoted odd against live feed before output',
    status: 'open',
  },
  {
    id: 'fmea-006', agentId: 'recommendation-writer', agentName: 'Recommendation Writer Agent',
    failureMode: 'Prompt injection via crafted event names in odds feed',
    effect: 'Agent output manipulated to produce biased or malicious recommendations',
    cause: 'Unsanitised event metadata passed directly into prompt template',
    severity: 10, occurrence: 2, detection: 7, rpn: 140,
    recommendedAction: 'Sanitise all external data inputs before prompt insertion; add output guardrail classifier',
    status: 'in-progress',
  },
  {
    id: 'fmea-007', agentId: 'line-comparison', agentName: 'Line Comparison Agent',
    failureMode: 'Data staleness from slow third-party API responses',
    effect: 'Comparison uses outdated lines, leading to incorrect arbitrage signals',
    cause: 'API response times spike to 10-45 seconds during peak betting windows (pre-match)',
    severity: 8, occurrence: 6, detection: 4, rpn: 192,
    recommendedAction: 'Implement circuit breaker pattern with 5-second timeout; use cached last-known-good values with staleness indicator',
    status: 'open',
  },
  {
    id: 'fmea-008', agentId: 'line-comparison', agentName: 'Line Comparison Agent',
    failureMode: 'Incorrect currency conversion on international bookmaker odds',
    effect: 'Cross-platform comparison invalid, false arbitrage opportunities reported',
    cause: 'Hardcoded USD conversion rates instead of real-time FX feed',
    severity: 7, occurrence: 3, detection: 6, rpn: 126,
    recommendedAction: 'Integrate live FX rate API; add unit tests for multi-currency comparison logic',
    status: 'open',
  },
  {
    id: 'fmea-009', agentId: 'odds-analysis', agentName: 'Odds Analysis Agent',
    failureMode: 'Model drift causing degraded prediction accuracy over time',
    effect: 'Gradual decline in recommendation quality undetected until significant losses accrue',
    cause: 'Underlying market dynamics shift (e.g. new season, rule changes) but model weights remain static',
    severity: 8, occurrence: 4, detection: 7, rpn: 224,
    recommendedAction: 'Implement weekly model performance backtesting; set sigma drift alert threshold at -0.3σ per week',
    status: 'open',
  },
  {
    id: 'fmea-010', agentId: 'odds-analysis', agentName: 'Odds Analysis Agent',
    failureMode: 'Performance degradation during peak betting hours',
    effect: 'Analysis latency exceeds SLA, missing pre-match betting windows',
    cause: 'Concurrent request volume triples during Premier League match days, exhausting API rate limits and token throughput',
    severity: 6, occurrence: 5, detection: 3, rpn: 90,
    recommendedAction: 'Pre-compute analysis for scheduled fixtures; implement request queue with priority tiers',
    status: 'mitigated',
  },
]

// ─── Transformation Roadmap (for C5) ────────────────────────────

export const TRANSFORMATION_STAGES: TransformationStage[] = [
  {
    id: 'current', name: 'Current State', sigmaTh: 0,
    agentCoverage: 0.43, collaborativeCoverage: 0.20, humanCoverage: 0.37,
    weeklyNetRoi: 1426,
    tasksToMigrate: [],
    estimatedTimeline: 'Now',
  },
  {
    id: 'stage-1', name: 'Near-term (Recommendation Writer to 4.0σ)', sigmaTh: 4.0,
    agentCoverage: 0.43, collaborativeCoverage: 0.12, humanCoverage: 0.45,
    weeklyNetRoi: 1680,
    tasksToMigrate: ['Review automated recommendations → reduced oversight as agent improves'],
    estimatedTimeline: '1-3 months',
  },
  {
    id: 'stage-2', name: 'Mid-term (Collaborative tasks automated)', sigmaTh: 4.5,
    agentCoverage: 0.55, collaborativeCoverage: 0.08, humanCoverage: 0.37,
    weeklyNetRoi: 2340,
    tasksToMigrate: ['Review automated recommendations → Agent (with spot-check)', 'Escalate unusual market movements → Agent (with human alert)'],
    estimatedTimeline: '3-6 months',
  },
  {
    id: 'stage-3', name: 'Target State (Maximum safe automation)', sigmaTh: 5.0,
    agentCoverage: 0.63, collaborativeCoverage: 0.05, humanCoverage: 0.32,
    weeklyNetRoi: 3180,
    tasksToMigrate: ['Client relationship context → Collaborative (AI assists, human leads)'],
    estimatedTimeline: '6-12 months',
  },
]

// ─── Report History (for B3) ────────────────────────────────────

export const REPORT_HISTORY: ReportConfig[] = [
  { id: 'rpt-001', name: 'Q1 2026 Board Report', dateRange: 'Jan 1 - Mar 31, 2026', processes: ['sports-betting', 'customer-service'], sections: ['executive-summary', 'roi', 'sigma', 'audit'], generatedAt: '2026-03-30T14:00:00Z', format: 'pdf', status: 'ready' },
  { id: 'rpt-002', name: 'March Agent Performance', dateRange: 'Mar 1 - Mar 31, 2026', processes: ['sports-betting'], sections: ['sigma', 'defects', 'trends'], generatedAt: '2026-03-28T10:00:00Z', format: 'pdf', status: 'ready' },
  { id: 'rpt-003', name: 'Compliance Audit Export', dateRange: 'Mar 1 - Mar 31, 2026', processes: ['sports-betting'], sections: ['audit'], generatedAt: '2026-03-25T16:00:00Z', format: 'pdf', status: 'ready' },
]

// ─── SERVQUAL Dimensions (for F1) ───────────────────────────────

export const SERVQUAL_SCORES: Record<string, ServqualDimension[]> = {
  'sports-betting': [
    { name: 'Reliability', score: 82, weight: 0.30, description: 'Ability to deliver the promised service accurately' },
    { name: 'Responsiveness', score: 76, weight: 0.25, description: 'Willingness to help and provide prompt service' },
    { name: 'Assurance', score: 88, weight: 0.20, description: 'Knowledge and courtesy, ability to inspire trust' },
    { name: 'Empathy', score: 71, weight: 0.15, description: 'Caring, individualized attention to clients' },
    { name: 'Tangibles', score: 90, weight: 0.10, description: 'Physical facilities, equipment, and appearance' },
  ],
  'customer-service': [
    { name: 'Reliability', score: 74, weight: 0.25, description: 'Ability to deliver the promised service accurately' },
    { name: 'Responsiveness', score: 85, weight: 0.30, description: 'Willingness to help and provide prompt service' },
    { name: 'Assurance', score: 79, weight: 0.15, description: 'Knowledge and courtesy, ability to inspire trust' },
    { name: 'Empathy', score: 68, weight: 0.20, description: 'Caring, individualized attention to clients' },
    { name: 'Tangibles', score: 82, weight: 0.10, description: 'Physical facilities, equipment, and appearance' },
  ],
}

// ─── Helper: Compute weighted SERVQUAL score ───────────────────

export function computeServqualScore(dimensions: ServqualDimension[]): number {
  if (dimensions.length === 0) return 0
  return dimensions.reduce((sum, d) => sum + d.score * d.weight, 0)
}

// ─── Helper: Coverage Map ───────────────────────────────────────

export function getCoverageMap(processId: string): CoverageMapEntry[] {
  if (processId === 'sports-betting') return COVERAGE_MAP
  return []
}

// ─── Helper: FMEA Entries ───────────────────────────────────────

export function getFmeaEntries(processId?: string): FmeaEntry[] {
  if (!processId) return FMEA_ENTRIES
  const process = PROCESSES.find(p => p.id === processId)
  if (!process) return []
  const agentIds = new Set(process.agents)
  return FMEA_ENTRIES.filter(e => agentIds.has(e.agentId))
}

// ─── Helper: Transformation Stages ──────────────────────────────

export function getTransformationStages(processId: string): TransformationStage[] {
  if (processId === 'sports-betting') return TRANSFORMATION_STAGES
  return []
}

// ─── Helper: Search Occupations ─────────────────────────────────

export function searchOccupations(query: string): OnetOccupation[] {
  if (!query.trim()) return ONET_OCCUPATIONS
  const lower = query.toLowerCase()
  return ONET_OCCUPATIONS.filter(o =>
    o.title.toLowerCase().includes(lower) ||
    o.description.toLowerCase().includes(lower) ||
    o.category.toLowerCase().includes(lower) ||
    o.code.includes(lower)
  )
}

// ─── Helper: SERVQUAL Scores ────────────────────────────────────

export function getServqualScores(processId: string): ServqualDimension[] {
  return SERVQUAL_SCORES[processId] ?? []
}

// ═══════════════════════════════════════════════════════════════════
// Phase 3 Additions
// ═══════════════════════════════════════════════════════════════════

// ─── 3.1 Agent Profiles (Agent Lifecycle) ────────────────────────

export const AGENT_PROFILES: AgentProfile[] = [
  // Odds Analysis Agent workflow
  { id: 'odds-scraper', name: 'OddsScraperAgent', workflowId: 'odds-analysis-agent', processName: 'Odds Analysis',
    sigmaScore: 4.2, dpmo: 6210, successRate: 0.91, avgCostPerRun: 0.018, p95Latency: 1420,
    totalRuns: 1240, weeklyROI: 385, status: 'active', consistency: 82,
    tasks: [
      { name: 'Fetch live odds feeds', timeWeight: 45, weeklyVolume: 320, avgCost: 0.012 },
      { name: 'Normalise odds formats', timeWeight: 30, weeklyVolume: 320, avgCost: 0.004 },
      { name: 'Cache odds snapshots', timeWeight: 25, weeklyVolume: 320, avgCost: 0.002 },
    ] },
  { id: 'line-comparison-profile', name: 'LineComparisonAgent', workflowId: 'odds-analysis-agent', processName: 'Odds Analysis',
    sigmaScore: 3.8, dpmo: 10700, successRate: 0.86, avgCostPerRun: 0.022, p95Latency: 1850,
    totalRuns: 1240, weeklyROI: 290, status: 'active', consistency: 74,
    tasks: [
      { name: 'Compare cross-book lines', timeWeight: 55, weeklyVolume: 280, avgCost: 0.015 },
      { name: 'Detect line movement', timeWeight: 25, weeklyVolume: 280, avgCost: 0.005 },
      { name: 'Flag arbitrage opportunities', timeWeight: 20, weeklyVolume: 120, avgCost: 0.002 },
    ] },
  { id: 'recommendation-writer-profile', name: 'RecommendationWriterAgent', workflowId: 'odds-analysis-agent', processName: 'Odds Analysis',
    sigmaScore: 4.5, dpmo: 3400, successRate: 0.94, avgCostPerRun: 0.025, p95Latency: 980,
    totalRuns: 1100, weeklyROI: 520, status: 'active', consistency: 88,
    tasks: [
      { name: 'Generate betting recommendation', timeWeight: 60, weeklyVolume: 260, avgCost: 0.018 },
      { name: 'Format output for display', timeWeight: 20, weeklyVolume: 260, avgCost: 0.004 },
      { name: 'Confidence scoring', timeWeight: 20, weeklyVolume: 260, avgCost: 0.003 },
    ] },
  // Player Engagement Agent workflow
  { id: 'player-profiler', name: 'PlayerProfilerAgent', workflowId: 'player-engagement-agent', processName: 'Player Engagement',
    sigmaScore: 3.5, dpmo: 22700, successRate: 0.82, avgCostPerRun: 0.014, p95Latency: 1200,
    totalRuns: 980, weeklyROI: 210, status: 'active', consistency: 70,
    tasks: [
      { name: 'Analyse player history', timeWeight: 40, weeklyVolume: 200, avgCost: 0.008 },
      { name: 'Segment player cohorts', timeWeight: 35, weeklyVolume: 200, avgCost: 0.004 },
      { name: 'Calculate lifetime value', timeWeight: 25, weeklyVolume: 200, avgCost: 0.002 },
    ] },
  { id: 'offer-generator', name: 'OfferGeneratorAgent', workflowId: 'player-engagement-agent', processName: 'Player Engagement',
    sigmaScore: 4.0, dpmo: 6700, successRate: 0.89, avgCostPerRun: 0.016, p95Latency: 1100,
    totalRuns: 980, weeklyROI: 340, status: 'active', consistency: 79,
    tasks: [
      { name: 'Select offer template', timeWeight: 30, weeklyVolume: 180, avgCost: 0.005 },
      { name: 'Personalise offer parameters', timeWeight: 45, weeklyVolume: 180, avgCost: 0.008 },
      { name: 'Compliance check', timeWeight: 25, weeklyVolume: 180, avgCost: 0.003 },
    ] },
  { id: 'copy-writer', name: 'CopyWriterAgent', workflowId: 'player-engagement-agent', processName: 'Player Engagement',
    sigmaScore: 3.2, dpmo: 44600, successRate: 0.78, avgCostPerRun: 0.019, p95Latency: 1500,
    totalRuns: 950, weeklyROI: 165, status: 'active', consistency: 65,
    tasks: [
      { name: 'Generate offer copy', timeWeight: 50, weeklyVolume: 170, avgCost: 0.012 },
      { name: 'A/B variant generation', timeWeight: 30, weeklyVolume: 100, avgCost: 0.005 },
      { name: 'Tone/brand alignment', timeWeight: 20, weeklyVolume: 170, avgCost: 0.002 },
    ] },
  // Content Moderation Agent workflow
  { id: 'content-extractor', name: 'ContentExtractorAgent', workflowId: 'content-moderation-agent', processName: 'Content Moderation',
    sigmaScore: 4.8, dpmo: 1300, successRate: 0.96, avgCostPerRun: 0.004, p95Latency: 450,
    totalRuns: 2100, weeklyROI: 180, status: 'active', consistency: 92,
    tasks: [
      { name: 'Extract text from UGC', timeWeight: 50, weeklyVolume: 500, avgCost: 0.002 },
      { name: 'Parse media metadata', timeWeight: 30, weeklyVolume: 500, avgCost: 0.001 },
      { name: 'Language detection', timeWeight: 20, weeklyVolume: 500, avgCost: 0.001 },
    ] },
  { id: 'compliance-checker', name: 'ComplianceCheckerAgent', workflowId: 'content-moderation-agent', processName: 'Content Moderation',
    sigmaScore: 5.1, dpmo: 230, successRate: 0.98, avgCostPerRun: 0.005, p95Latency: 620,
    totalRuns: 2100, weeklyROI: 420, status: 'active', consistency: 95,
    tasks: [
      { name: 'Check against jurisdiction rules', timeWeight: 45, weeklyVolume: 500, avgCost: 0.003 },
      { name: 'Flag prohibited content', timeWeight: 35, weeklyVolume: 500, avgCost: 0.001 },
      { name: 'Generate compliance report', timeWeight: 20, weeklyVolume: 500, avgCost: 0.001 },
    ] },
  { id: 'flag-decision', name: 'FlagDecisionAgent', workflowId: 'content-moderation-agent', processName: 'Content Moderation',
    sigmaScore: 4.4, dpmo: 4700, successRate: 0.93, avgCostPerRun: 0.003, p95Latency: 380,
    totalRuns: 2100, weeklyROI: 280, status: 'active', consistency: 87,
    tasks: [
      { name: 'Final flag/pass decision', timeWeight: 60, weeklyVolume: 500, avgCost: 0.002 },
      { name: 'Escalation routing', timeWeight: 25, weeklyVolume: 120, avgCost: 0.001 },
      { name: 'Audit trail logging', timeWeight: 15, weeklyVolume: 500, avgCost: 0.000 },
    ] },
  // VIP Customer Support Agent workflow
  { id: 'intent-classifier', name: 'IntentClassifierAgent', workflowId: 'vip-support-agent', processName: 'VIP Support',
    sigmaScore: 4.6, dpmo: 2500, successRate: 0.95, avgCostPerRun: 0.012, p95Latency: 680,
    totalRuns: 1500, weeklyROI: 610, status: 'active', consistency: 90,
    tasks: [
      { name: 'Classify customer intent', timeWeight: 55, weeklyVolume: 350, avgCost: 0.008 },
      { name: 'Sentiment analysis', timeWeight: 25, weeklyVolume: 350, avgCost: 0.003 },
      { name: 'Priority scoring', timeWeight: 20, weeklyVolume: 350, avgCost: 0.001 },
    ] },
  { id: 'knowledge-retriever', name: 'KnowledgeRetrieverAgent', workflowId: 'vip-support-agent', processName: 'VIP Support',
    sigmaScore: 3.9, dpmo: 8500, successRate: 0.88, avgCostPerRun: 0.015, p95Latency: 1350,
    totalRuns: 1500, weeklyROI: 440, status: 'active', consistency: 76,
    tasks: [
      { name: 'Retrieve relevant knowledge', timeWeight: 50, weeklyVolume: 340, avgCost: 0.009 },
      { name: 'Rank result relevance', timeWeight: 30, weeklyVolume: 340, avgCost: 0.004 },
      { name: 'Context assembly', timeWeight: 20, weeklyVolume: 340, avgCost: 0.002 },
    ] },
  { id: 'response-draft', name: 'ResponseDraftAgent', workflowId: 'vip-support-agent', processName: 'VIP Support',
    sigmaScore: 4.1, dpmo: 5800, successRate: 0.90, avgCostPerRun: 0.020, p95Latency: 1600,
    totalRuns: 1500, weeklyROI: 530, status: 'active', consistency: 83,
    tasks: [
      { name: 'Draft customer response', timeWeight: 55, weeklyVolume: 330, avgCost: 0.014 },
      { name: 'Tone adjustment', timeWeight: 25, weeklyVolume: 330, avgCost: 0.004 },
      { name: 'Insert personalisation', timeWeight: 20, weeklyVolume: 330, avgCost: 0.002 },
    ] },
]

const AGENT_ID_TO_PROFILE: Record<string, string> = {
  'odds-analysis': 'odds-scraper',
  'line-comparison': 'line-comparison-profile',
  'recommendation-writer': 'recommendation-writer-profile',
  'customer-response': 'player-profiler',
}

export function getAgentProfile(agentId: string): AgentProfile | undefined {
  const profileId = AGENT_ID_TO_PROFILE[agentId] ?? agentId
  return AGENT_PROFILES.find(a => a.id === profileId)
}

export function getAgentsByWorkflow(workflowId: string): AgentProfile[] {
  return AGENT_PROFILES.filter(a => a.workflowId === workflowId)
}

export function getAllAgents(): AgentProfile[] {
  return AGENT_PROFILES
}

export function getDecommissionImpact(agentId: string): DecommissionImpact | null {
  const agent = getAgentProfile(agentId)
  if (!agent) return null

  const processAgents = AGENT_PROFILES.filter(a => a.workflowId === agent.workflowId)
  const totalProcessTasks = processAgents.reduce(
    (sum, a) => sum + a.tasks.reduce((s, t) => s + t.timeWeight, 0), 0
  )
  const agentTaskWeight = agent.tasks.reduce((s, t) => s + t.timeWeight, 0)
  const taskCoveragePercent = Math.round((agentTaskWeight / totalProcessTasks) * 100)

  const activeAgents = processAgents.filter(a => a.status === 'active')
  const currentCoverage = Math.round(
    (activeAgents.length / processAgents.length) * 100
  )
  const newCoverage = Math.round(
    ((activeAgents.length - 1) / processAgents.length) * 100
  )

  return {
    agentName: agent.name,
    processName: agent.processName,
    taskCoveragePercent,
    currentCoverage,
    newCoverage,
    weeklyROIImpact: -agent.weeklyROI,
    affectedTasks: agent.tasks,
    fallbackMode: 'Collaborative (human review required)',
  }
}

// ─── 3.2.1 Monthly Cost Data (Cost Intelligence) ────────────────

const MONTHS = ['Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026']

function generateMonthlyCosts(): MonthlyCost[] {
  const entries: MonthlyCost[] = []

  for (const agent of AGENTS) {
    const baseCostPerRun = agent.avgCostPerRun
    const baseMonthlyRuns = Math.round(agent.totalRuns * 1.0)

    for (let mi = 0; mi < MONTHS.length; mi++) {
      const costDecay = 1 - mi * 0.035
      const volumeGrowth = 1 + mi * 0.02
      const baseSuccess = Math.max(0.55, agent.successRate - 0.05 * (5 - mi))

      const runs = Math.round(baseMonthlyRuns * volumeGrowth)
      const successfulRuns = Math.round(runs * baseSuccess)
      const inferenceCost = parseFloat((runs * baseCostPerRun * costDecay).toFixed(4))

      entries.push({
        month: MONTHS[mi],
        agentId: agent.id,
        agentName: agent.name,
        inferenceCost,
        runs,
        successfulRuns,
      })
    }
  }

  return entries
}

export const MONTHLY_COSTS: MonthlyCost[] = generateMonthlyCosts()

export function getMonthlyCosts(processId?: string): MonthlyCost[] {
  if (!processId) return MONTHLY_COSTS
  const processAgentIds = new Set(
    AGENTS.filter(a => a.processId === processId).map(a => a.id)
  )
  return MONTHLY_COSTS.filter(c => processAgentIds.has(c.agentId))
}

// ─── 3.3 Alert & SLA Engine ────────���────────────────────────────

export interface AgentSlaConfig {
  agentName: string
  workflowName: string
  model: string
  latencyTarget: number
  costCap: number
  successRateFloor: number
  sigmaTarget: number
  currentLatencyP95: number
  currentAvgCost: number
  currentSuccessRate: number
  currentSigma: number
}

export interface AlertRule {
  id: string
  name: string
  description: string
  metric: 'sigma' | 'override_rate' | 'weekly_cost' | 'success_rate' | 'latency_p95'
  threshold: number
  unit: string
  enabled: boolean
  severity: 'Critical' | 'Warning' | 'Info'
  scope: 'all' | string
  min: number
  max: number
  step: number
  inputType: 'slider' | 'input'
}

export interface AlertHistoryEntry {
  id: string
  timestamp: string
  type: string
  agent: string
  severity: 'Critical' | 'Warning' | 'Info'
  status: 'Active' | 'Acknowledged' | 'Resolved'
  message: string
}

export function getAgentSlaConfigs(): AgentSlaConfig[] {
  const configs: AgentSlaConfig[] = []

  for (const agent of AGENTS) {
    const runs = getRunsForAgent(agent.id)
    const successfulRuns = runs.filter(r => r.outcome)

    const durations = runs.map(r => r.durationMs).sort((a, b) => a - b)
    const p95 = durations[Math.floor(durations.length * 0.95)] || 1000
    const costs = successfulRuns.map(r => r.totalCost)
    const avgCost = costs.length > 0 ? costs.reduce((a, b) => a + b, 0) / costs.length : 0.01
    const successRate = (successfulRuns.length / (runs.length || 1)) * 100

    const mean = durations.reduce((a, b) => a + b, 0) / (durations.length || 1)
    const std = Math.sqrt(durations.reduce((s, d) => s + (d - mean) ** 2, 0) / (durations.length || 1))
    const sigma = std > 0 ? mean / std : 4.0

    configs.push({
      agentName: agent.name,
      workflowName: PROCESSES.find(p => p.id === agent.processId)?.name ?? agent.processId,
      model: agent.model,
      latencyTarget: Math.round(p95 * 1.1 / 100) * 100,
      costCap: parseFloat(Math.min(1.0, Math.max(0.01, avgCost * 1.5)).toFixed(2)),
      successRateFloor: Math.max(70, Math.round(successRate - 5)),
      sigmaTarget: parseFloat(Math.max(2.0, Math.min(6.0, sigma * 0.9)).toFixed(1)),
      currentLatencyP95: p95,
      currentAvgCost: parseFloat(avgCost.toFixed(4)),
      currentSuccessRate: parseFloat(successRate.toFixed(1)),
      currentSigma: parseFloat(sigma.toFixed(2)),
    })
  }

  return configs
}

export function getAlertRules(): AlertRule[] {
  return [
    {
      id: 'rule-sigma', name: 'Sigma Drop', description: 'Alert when sigma drops below threshold',
      metric: 'sigma', threshold: 3.5, unit: '\u03C3', enabled: true, severity: 'Critical',
      scope: 'all', min: 1.0, max: 6.0, step: 0.1, inputType: 'slider',
    },
    {
      id: 'rule-override', name: 'Override Rate', description: 'Alert when override rate exceeds threshold',
      metric: 'override_rate', threshold: 25, unit: '%', enabled: true, severity: 'Warning',
      scope: 'all', min: 5, max: 60, step: 1, inputType: 'slider',
    },
    {
      id: 'rule-cost', name: 'Weekly Cost', description: 'Alert when weekly cost exceeds threshold',
      metric: 'weekly_cost', threshold: 500, unit: '$', enabled: false, severity: 'Warning',
      scope: 'all', min: 50, max: 5000, step: 50, inputType: 'input',
    },
    {
      id: 'rule-success', name: 'Success Rate', description: 'Alert when success rate drops below threshold',
      metric: 'success_rate', threshold: 75, unit: '%', enabled: true, severity: 'Critical',
      scope: 'all', min: 50, max: 99, step: 1, inputType: 'slider',
    },
    {
      id: 'rule-latency', name: 'Latency P95', description: 'Alert when latency P95 exceeds threshold',
      metric: 'latency_p95', threshold: 3000, unit: 'ms', enabled: true, severity: 'Warning',
      scope: 'all', min: 500, max: 10000, step: 100, inputType: 'slider',
    },
  ]
}

export function getAlertHistory(): AlertHistoryEntry[] {
  const now = Date.now()
  return [
    { id: 'alert-001', timestamp: new Date(now - 2 * 3600 * 1000).toISOString(), type: 'Sigma Drop', agent: 'Line Comparison Agent', severity: 'Critical', status: 'Active', message: 'Sigma dropped to 2.8 (below threshold of 3.5) over the last 24 hours' },
    { id: 'alert-002', timestamp: new Date(now - 8 * 3600 * 1000).toISOString(), type: 'Latency P95', agent: 'Customer Response Agent', severity: 'Warning', status: 'Active', message: 'P95 latency reached 3,420ms (threshold: 3,000ms)' },
    { id: 'alert-003', timestamp: new Date(now - 18 * 3600 * 1000).toISOString(), type: 'Success Rate', agent: 'Recommendation Writer Agent', severity: 'Critical', status: 'Acknowledged', message: 'Success rate fell to 61% (below floor of 75%)' },
    { id: 'alert-004', timestamp: new Date(now - 36 * 3600 * 1000).toISOString(), type: 'Weekly Cost', agent: 'All Agents', severity: 'Warning', status: 'Resolved', message: 'Weekly spend reached $542 (budget cap: $500)' },
    { id: 'alert-005', timestamp: new Date(now - 72 * 3600 * 1000).toISOString(), type: 'Override Rate', agent: 'Recommendation Writer Agent', severity: 'Info', status: 'Resolved', message: 'Override rate at 28% over last 7 days (threshold: 25%)' },
    { id: 'alert-006', timestamp: new Date(now - 96 * 3600 * 1000).toISOString(), type: 'Sigma Drop', agent: 'Odds Analysis Agent', severity: 'Warning', status: 'Resolved', message: 'Sigma dropped to 3.2 (below threshold of 3.5) -- recovered after model config update' },
  ]
}

// ─── 3.4.1 Sigma History (Performance & Governance) ─────────────

export interface SigmaHistoryEntry {
  agentId: string
  agentName: string
  sigma30d: number
  sigma14d: number
  sigmaToday: number
  trend: 'improving' | 'declining' | 'flat'
  weeklyRate: number
  targetDate: string | null
}

export function getSigmaHistory(processId: string): SigmaHistoryEntry[] {
  const agents = getAgentsForProcess(processId)

  return agents.map(agent => {
    const trend30 = SIGMA_TRENDS[agent.id]
    if (!trend30 || trend30.length === 0) {
      return {
        agentId: agent.id, agentName: agent.name,
        sigma30d: agent.sigmaScore, sigma14d: agent.sigmaScore, sigmaToday: agent.sigmaScore,
        trend: 'flat' as const, weeklyRate: 0, targetDate: null,
      }
    }

    const sigma30d = trend30[0].sigma
    const sigma14d = trend30[Math.floor(trend30.length / 2)]?.sigma ?? sigma30d
    const sigmaToday = trend30[trend30.length - 1].sigma
    const weeklyRate = parseFloat(((sigmaToday - sigma30d) / 4).toFixed(3))

    let trend: 'improving' | 'declining' | 'flat'
    if (weeklyRate > 0.03) trend = 'improving'
    else if (weeklyRate < -0.03) trend = 'declining'
    else trend = 'flat'

    let targetDate: string | null = null
    const target = ORGANISATION.sigmaTarget
    if (sigmaToday >= target) {
      targetDate = 'Achieved'
    } else if (weeklyRate > 0) {
      const weeksNeeded = (target - sigmaToday) / weeklyRate
      const projDate = new Date('2026-04-02')
      projDate.setDate(projDate.getDate() + Math.round(weeksNeeded * 7))
      targetDate = projDate.toISOString().slice(0, 10)
    }

    return {
      agentId: agent.id, agentName: agent.name,
      sigma30d: parseFloat(sigma30d.toFixed(1)),
      sigma14d: parseFloat(sigma14d.toFixed(1)),
      sigmaToday: parseFloat(sigmaToday.toFixed(1)),
      trend, weeklyRate, targetDate,
    }
  })
}

// ─── 3.4.2 Override Trends (Audit Log Enhancement) ──────────────

export interface OverrideTrendWeek {
  week: string
  weekLabel: string
  totalDecisions: number
  overrides: number
  overrideRate: number
  byTask: { taskName: string; overrides: number; total: number }[]
}

export const OVERRIDE_TRENDS: OverrideTrendWeek[] = [
  { week: '2026-02-10', weekLabel: 'W6', totalDecisions: 18, overrides: 3, overrideRate: 16.7,
    byTask: [
      { taskName: 'Review automated recommendations', overrides: 2, total: 14 },
      { taskName: 'Escalate unusual market movements', overrides: 1, total: 4 },
    ] },
  { week: '2026-02-17', weekLabel: 'W7', totalDecisions: 21, overrides: 4, overrideRate: 19.0,
    byTask: [
      { taskName: 'Review automated recommendations', overrides: 3, total: 16 },
      { taskName: 'Escalate unusual market movements', overrides: 1, total: 5 },
    ] },
  { week: '2026-02-24', weekLabel: 'W8', totalDecisions: 19, overrides: 4, overrideRate: 21.1,
    byTask: [
      { taskName: 'Review automated recommendations', overrides: 3, total: 14 },
      { taskName: 'Escalate unusual market movements', overrides: 1, total: 5 },
    ] },
  { week: '2026-03-03', weekLabel: 'W9', totalDecisions: 22, overrides: 5, overrideRate: 22.7,
    byTask: [
      { taskName: 'Review automated recommendations', overrides: 4, total: 17 },
      { taskName: 'Escalate unusual market movements', overrides: 1, total: 5 },
    ] },
  { week: '2026-03-10', weekLabel: 'W10', totalDecisions: 20, overrides: 5, overrideRate: 25.0,
    byTask: [
      { taskName: 'Review automated recommendations', overrides: 4, total: 15 },
      { taskName: 'Escalate unusual market movements', overrides: 1, total: 5 },
    ] },
  { week: '2026-03-17', weekLabel: 'W11', totalDecisions: 23, overrides: 6, overrideRate: 26.1,
    byTask: [
      { taskName: 'Review automated recommendations', overrides: 5, total: 18 },
      { taskName: 'Escalate unusual market movements', overrides: 1, total: 5 },
    ] },
  { week: '2026-03-24', weekLabel: 'W12', totalDecisions: 15, overrides: 4, overrideRate: 26.7,
    byTask: [
      { taskName: 'Review automated recommendations', overrides: 4, total: 13 },
      { taskName: 'Escalate unusual market movements', overrides: 0, total: 2 },
    ] },
  { week: '2026-03-31', weekLabel: 'W13', totalDecisions: 8, overrides: 2, overrideRate: 25.0,
    byTask: [
      { taskName: 'Review automated recommendations', overrides: 2, total: 6 },
      { taskName: 'Escalate unusual market movements', overrides: 0, total: 2 },
    ] },
]

export function getOverrideTrends(): OverrideTrendWeek[] {
  return OVERRIDE_TRENDS
}

// ─���─ 3.5.1 Oversight Gaps ───────────���───────────────────────────

export interface OversightGap {
  id: string
  taskId: string
  task: string
  agentId: string
  agentName: string
  processId: string
  processName: string
  automationScore: number
  riskLevel: 'High' | 'Medium' | 'Low'
  sigmaScore: number
  recommendation: string
}

export function getOversightGaps(): OversightGap[] {
  const gaps: OversightGap[] = []

  for (const entry of COVERAGE_MAP) {
    if (entry.ownership !== 'agent') continue

    const agent = AGENTS.find(a => a.id === entry.agentId)
    if (!agent) continue

    const process = PROCESSES.find(p => p.id === agent.processId)
    if (!process) continue

    let riskLevel: 'High' | 'Medium' | 'Low'
    if (agent.sigmaScore < 3.0 || (entry.automationScore < 0.8 && agent.sigmaScore < 3.5)) {
      riskLevel = 'High'
    } else if (agent.sigmaScore < 4.0 || entry.automationScore < 0.85) {
      riskLevel = 'Medium'
    } else {
      riskLevel = 'Low'
    }

    let recommendation: string
    if (riskLevel === 'High') {
      recommendation = `Move to Collaborative immediately. Agent quality at ${agent.sigmaScore.toFixed(1)}\u03C3 is below safe threshold.`
    } else if (riskLevel === 'Medium') {
      recommendation = `Consider adding review gate until agent quality reaches ${ORGANISATION.sigmaTarget.toFixed(1)}\u03C3.`
    } else {
      recommendation = `Monitor quarterly. Agent performing above target at ${agent.sigmaScore.toFixed(1)}\u03C3.`
    }

    gaps.push({
      id: `gap-${entry.taskId}`,
      taskId: entry.taskId,
      task: entry.task,
      agentId: agent.id,
      agentName: agent.name,
      processId: process.id,
      processName: process.name,
      automationScore: entry.automationScore,
      riskLevel,
      sigmaScore: agent.sigmaScore,
      recommendation,
    })
  }

  return gaps
}

// ─── 3.6.1 Scheduled Reports ��──────────────────────────────────

export const SCHEDULED_REPORTS: ScheduledReport[] = [
  {
    id: 'sched-001', templateName: 'Weekly Executive Summary',
    sections: ['executive-summary', 'roi', 'sigma'], frequency: 'weekly', dayOfWeek: 'Monday', time: '09:00',
    recipients: ['ceo@fuzebox.ai', 'coo@fuzebox.ai', 'vp-ops@fuzebox.ai'],
    processes: ['sports-betting', 'customer-service'], status: 'active',
    lastRun: '2026-03-31T09:00:00Z', nextRun: '2026-04-07T09:00:00Z',
  },
  {
    id: 'sched-002', templateName: 'Monthly ROI Report',
    sections: ['executive-summary', 'roi', 'labor'], frequency: 'monthly', time: '08:00',
    recipients: ['cfo@fuzebox.ai', 'coo@fuzebox.ai', 'finance@fuzebox.ai', 'vp-ops@fuzebox.ai', 'board@fuzebox.ai'],
    processes: ['sports-betting', 'customer-service'], status: 'active',
    lastRun: '2026-03-01T08:00:00Z', nextRun: '2026-04-01T08:00:00Z',
  },
  {
    id: 'sched-003', templateName: 'Biweekly Sigma Report',
    sections: ['sigma', 'fmea', 'audit'], frequency: 'biweekly', dayOfWeek: 'Friday', time: '17:00',
    recipients: ['qa@fuzebox.ai', 'cto@fuzebox.ai'],
    processes: ['sports-betting'], status: 'paused',
    lastRun: '2026-03-21T17:00:00Z', nextRun: '2026-04-04T17:00:00Z',
  },
]

export function getScheduledReports(): ScheduledReport[] {
  return SCHEDULED_REPORTS
}

// ─── 3.7.1 Skills Gap & Training ────────────────────────────────

export const SKILLS_GAP: Record<string, SkillGap[]> = {
  'sports-betting': [
    { skill: 'AI output review', currentLevel: 2, requiredLevel: 4, gap: 2, priority: 'High', suggestedTraining: 'AI Output Quality Assessment', suggestedUrl: 'https://training.fuzebox.ai/ai-output-review', affectedTaskWeight: 0.35 },
    { skill: 'Exception escalation', currentLevel: 3, requiredLevel: 4, gap: 1, priority: 'Medium', suggestedTraining: 'Escalation Frameworks for AI-Assisted Workflows', suggestedUrl: 'https://training.fuzebox.ai/escalation', affectedTaskWeight: 0.20 },
    { skill: 'Prompt engineering', currentLevel: 1, requiredLevel: 3, gap: 2, priority: 'High', suggestedTraining: 'Prompt Engineering Certification', suggestedUrl: 'https://training.fuzebox.ai/prompt-engineering', affectedTaskWeight: 0.29 },
    { skill: 'Data validation', currentLevel: 3, requiredLevel: 4, gap: 1, priority: 'Medium', suggestedTraining: 'Statistical Data Validation Methods', suggestedUrl: 'https://training.fuzebox.ai/data-validation', affectedTaskWeight: 0.18 },
    { skill: 'Quality assurance', currentLevel: 2, requiredLevel: 4, gap: 2, priority: 'High', suggestedTraining: 'Six Sigma for AI Quality Management', suggestedUrl: 'https://training.fuzebox.ai/qa-sigma', affectedTaskWeight: 0.32 },
  ],
  'customer-service': [
    { skill: 'AI output review', currentLevel: 2, requiredLevel: 3, gap: 1, priority: 'Medium', suggestedTraining: 'AI Output Quality Assessment', suggestedUrl: 'https://training.fuzebox.ai/ai-output-review', affectedTaskWeight: 0.22 },
    { skill: 'Exception escalation', currentLevel: 3, requiredLevel: 4, gap: 1, priority: 'Medium', suggestedTraining: 'Escalation Frameworks for AI-Assisted Workflows', suggestedUrl: 'https://training.fuzebox.ai/escalation', affectedTaskWeight: 0.18 },
    { skill: 'Prompt engineering', currentLevel: 1, requiredLevel: 2, gap: 1, priority: 'Low', suggestedTraining: 'Prompt Engineering Basics', suggestedUrl: 'https://training.fuzebox.ai/prompt-basics', affectedTaskWeight: 0.09 },
    { skill: 'Data validation', currentLevel: 2, requiredLevel: 3, gap: 1, priority: 'Medium', suggestedTraining: 'Customer Data Accuracy Training', suggestedUrl: 'https://training.fuzebox.ai/data-accuracy', affectedTaskWeight: 0.15 },
    { skill: 'Quality assurance', currentLevel: 3, requiredLevel: 4, gap: 1, priority: 'High', suggestedTraining: 'Service Quality Monitoring', suggestedUrl: 'https://training.fuzebox.ai/service-quality', affectedTaskWeight: 0.16 },
  ],
}

export const TRAINING_PROGRESS: Record<string, TeamMemberTraining[]> = {
  'sports-betting': [
    {
      name: 'Marcus Webb', role: 'Senior Betting Analyst', avatar: 'MW',
      trainings: [
        { trainingName: 'AI Output Quality Assessment', progress: 85, status: 'in-progress' },
        { trainingName: 'Prompt Engineering Certification', progress: 100, status: 'completed' },
        { trainingName: 'Six Sigma for AI Quality Management', progress: 40, status: 'in-progress' },
      ],
      overallProgress: 75,
    },
    {
      name: 'Priya Sharma', role: 'Betting Analyst', avatar: 'PS',
      trainings: [
        { trainingName: 'AI Output Quality Assessment', progress: 60, status: 'in-progress' },
        { trainingName: 'Escalation Frameworks', progress: 30, status: 'in-progress' },
        { trainingName: 'Statistical Data Validation', progress: 0, status: 'not-started' },
      ],
      overallProgress: 30,
    },
    {
      name: 'James Okello', role: 'Junior Betting Analyst', avatar: 'JO',
      trainings: [
        { trainingName: 'AI Output Quality Assessment', progress: 20, status: 'in-progress' },
        { trainingName: 'Prompt Engineering Basics', progress: 0, status: 'not-started' },
        { trainingName: 'Six Sigma for AI Quality Management', progress: 0, status: 'not-started' },
      ],
      overallProgress: 7,
    },
  ],
  'customer-service': [
    {
      name: 'Alex Chen', role: 'Senior CS Representative', avatar: 'AC',
      trainings: [
        { trainingName: 'AI Output Quality Assessment', progress: 100, status: 'completed' },
        { trainingName: 'Service Quality Monitoring', progress: 70, status: 'in-progress' },
        { trainingName: 'Escalation Frameworks', progress: 50, status: 'in-progress' },
      ],
      overallProgress: 73,
    },
    {
      name: 'Rosa Martinez', role: 'CS Representative', avatar: 'RM',
      trainings: [
        { trainingName: 'AI Output Quality Assessment', progress: 45, status: 'in-progress' },
        { trainingName: 'Customer Data Accuracy Training', progress: 20, status: 'in-progress' },
        { trainingName: 'Prompt Engineering Basics', progress: 0, status: 'not-started' },
      ],
      overallProgress: 22,
    },
    {
      name: 'David Park', role: 'CS Representative', avatar: 'DP',
      trainings: [
        { trainingName: 'AI Output Quality Assessment', progress: 30, status: 'in-progress' },
        { trainingName: 'Service Quality Monitoring', progress: 10, status: 'in-progress' },
        { trainingName: 'Escalation Frameworks', progress: 0, status: 'not-started' },
      ],
      overallProgress: 13,
    },
  ],
}

export function getSkillsGap(processId: string): SkillGap[] {
  return SKILLS_GAP[processId] ?? []
}

export function getTrainingProgress(processId: string): TeamMemberTraining[] {
  return TRAINING_PROGRESS[processId] ?? []
}

// ─── 3.8.1 Process Benchmarks ──────────���────────────────────────

export function getProcessBenchmarks(): ProcessBenchmark[] {
  const benchmarks: ProcessBenchmark[] = PROCESSES.map(process => {
    const agents = getAgentsForProcess(process.id)
    const roi = getRoiForProcess(process.id)
    const tasks = getTasksForProcess(process.id)

    const avgSigma = agents.length > 0
      ? parseFloat((agents.reduce((s, a) => s + a.sigmaScore, 0) / agents.length).toFixed(1))
      : 0

    const oee = agents.length > 0
      ? parseFloat((agents.reduce((s, a) => s + a.oee, 0) / agents.length).toFixed(2))
      : 0

    const totalCost = agents.reduce((s, a) => s + (a.avgCostPerRun * a.totalRuns), 0)
    const agentTaskCount = tasks.filter(t => t.ownership === 'agent').length
    const costPerTask = agentTaskCount > 0 ? parseFloat((totalCost / agentTaskCount).toFixed(4)) : 0

    const quality = Math.min(100, Math.round(avgSigma * 20))
    const coverage = Math.round(process.agentCoverage * 100)
    const roiNorm = roi ? Math.min(100, Math.round((roi.netRoiWeekly / 30) * 100) / 100) : 0
    const costEfficiency = Math.min(100, Math.round((1 - Math.min(1, costPerTask / 2)) * 100))
    const compliance = Math.min(100, Math.round(oee * 100) + 10)

    return {
      processId: process.id,
      processName: process.name,
      avgSigma, oee,
      agentCoveragePct: process.agentCoverage,
      netRoiWeekly: roi?.netRoiWeekly ?? 0,
      costPerTask,
      maturityRank: 0,
      quality, coverage,
      roi: Math.min(100, Math.round(roiNorm)),
      costEfficiency,
      compliance: Math.min(100, compliance),
    }
  })

  const scored = benchmarks.map(b => ({
    ...b,
    _score: b.quality * 0.3 + b.coverage * 0.2 + b.roi * 0.2 + b.costEfficiency * 0.15 + b.compliance * 0.15,
  }))
  scored.sort((a, b) => b._score - a._score)
  scored.forEach((b, i) => { b.maturityRank = i + 1 })

  return scored.map(({ _score, ...rest }) => rest)
}

// ═══════════════════════════════════════════════════════════════════
// Phase 4 + 5 Additions
// ═══════════════════════════════════════════════════════════════════

// ─── 4.1 Staging Candidates & Agent Versions ────────────────────

const STAGING_CANDIDATES: Record<string, StagingCandidate> = {
  'odds-analysis-agent': {
    agentId: 'odds-analysis-agent',
    productionModel: 'gpt-4o',
    candidateModel: 'claude-sonnet-4-6',
    productionFramework: 'CrewAI',
    candidateFramework: 'CrewAI',
    productionMetrics: { sigma: 3.8, successRate: 0.84, avgCost: 0.032, avgLatencyMs: 1420 },
    candidateMetrics: { sigma: 4.3, successRate: 0.91, avgCost: 0.028, avgLatencyMs: 1180 },
    stagingRuns: 50,
    stagingSucessRate: 0.92,
    riskLevel: 'LOW',
    riskNote: 'Candidate shows improved latency and cost efficiency across 50 test runs.',
  },
  'player-engagement-agent': {
    agentId: 'player-engagement-agent',
    productionModel: 'claude-3-5-sonnet',
    candidateModel: 'claude-sonnet-4-6',
    productionFramework: 'CrewAI',
    candidateFramework: 'CrewAI',
    productionMetrics: { sigma: 3.5, successRate: 0.78, avgCost: 0.025, avgLatencyMs: 1650 },
    candidateMetrics: { sigma: 4.1, successRate: 0.88, avgCost: 0.022, avgLatencyMs: 1320 },
    stagingRuns: 42,
    stagingSucessRate: 0.88,
    riskLevel: 'LOW',
    riskNote: 'Staging candidate outperforms production across all key metrics.',
  },
  'content-moderation-agent': {
    agentId: 'content-moderation-agent',
    productionModel: 'gpt-4o-mini',
    candidateModel: 'gpt-4o',
    productionFramework: 'CrewAI',
    candidateFramework: 'CrewAI',
    productionMetrics: { sigma: 2.9, successRate: 0.72, avgCost: 0.006, avgLatencyMs: 980 },
    candidateMetrics: { sigma: 3.6, successRate: 0.85, avgCost: 0.018, avgLatencyMs: 1100 },
    stagingRuns: 35,
    stagingSucessRate: 0.85,
    riskLevel: 'MEDIUM',
    riskNote: 'Higher accuracy but 3x cost increase. Evaluate ROI before promoting.',
  },
  'vip-support-agent': {
    agentId: 'vip-support-agent',
    productionModel: 'claude-3-5-sonnet',
    candidateModel: 'claude-sonnet-4-6',
    productionFramework: 'CrewAI',
    candidateFramework: 'CrewAI',
    productionMetrics: { sigma: 4.0, successRate: 0.86, avgCost: 0.038, avgLatencyMs: 2100 },
    candidateMetrics: { sigma: 4.5, successRate: 0.93, avgCost: 0.034, avgLatencyMs: 1750 },
    stagingRuns: 60,
    stagingSucessRate: 0.93,
    riskLevel: 'LOW',
    riskNote: 'Strong improvement on high-value VIP interactions. Recommend promotion.',
  },
}

export function getStagingCandidate(agentId: string): StagingCandidate | undefined {
  return STAGING_CANDIDATES[agentId]
}

const AGENT_VERSIONS: Record<string, AgentVersion[]> = {
  'odds-analysis-agent': [
    { version: 'v3', label: 'current', model: 'gpt-4o', framework: 'CrewAI', deployedDate: '2026-03-15', status: 'current', sigma: 3.8 },
    { version: 'v2', label: 'retired', model: 'gpt-4o-mini', framework: 'CrewAI', deployedDate: '2026-02-01', status: 'retired', retiredReason: 'Quality regression on complex multi-leg parlays', sigma: 3.1 },
    { version: 'v1', label: 'retired', model: 'gpt-3.5-turbo', framework: 'LangChain', deployedDate: '2026-01-05', status: 'retired', retiredReason: 'Insufficient accuracy for live odds analysis', sigma: 2.1 },
  ],
  'player-engagement-agent': [
    { version: 'v3', label: 'current', model: 'claude-3-5-sonnet', framework: 'CrewAI', deployedDate: '2026-03-15', status: 'current', sigma: 3.5 },
    { version: 'v2', label: 'retired', model: 'gpt-4o', framework: 'CrewAI', deployedDate: '2026-02-01', status: 'retired', retiredReason: 'Cost overrun — $0.045/run exceeded budget', sigma: 3.8 },
    { version: 'v1', label: 'retired', model: 'gpt-3.5-turbo', framework: 'LangChain', deployedDate: '2026-01-05', status: 'retired', retiredReason: 'Poor personalisation quality', sigma: 2.1 },
  ],
  'content-moderation-agent': [
    { version: 'v3', label: 'current', model: 'gpt-4o-mini', framework: 'CrewAI', deployedDate: '2026-03-15', status: 'current', sigma: 2.9 },
    { version: 'v2', label: 'retired', model: 'gpt-4o', framework: 'CrewAI', deployedDate: '2026-02-01', status: 'retired', retiredReason: 'Cost overrun — switched to mini for budget compliance', sigma: 3.6 },
    { version: 'v1', label: 'retired', model: 'gpt-3.5-turbo', framework: 'LangChain', deployedDate: '2026-01-05', status: 'retired', retiredReason: 'Failed multi-jurisdiction compliance checks', sigma: 1.8 },
  ],
  'vip-support-agent': [
    { version: 'v3', label: 'current', model: 'claude-3-5-sonnet', framework: 'CrewAI', deployedDate: '2026-03-15', status: 'current', sigma: 4.0 },
    { version: 'v2', label: 'retired', model: 'gpt-4o', framework: 'CrewAI', deployedDate: '2026-02-01', status: 'retired', retiredReason: 'Tone inconsistency with VIP customers', sigma: 3.4 },
    { version: 'v1', label: 'retired', model: 'gpt-3.5-turbo', framework: 'LangChain', deployedDate: '2026-01-05', status: 'retired', retiredReason: 'Unacceptable hallucination rate on policy queries', sigma: 2.0 },
  ],
}

export function getAgentVersions(agentId: string): AgentVersion[] {
  return AGENT_VERSIONS[agentId] ?? []
}

// ─── 4.2 Agent Budgets ──────────────────────────────────────────

export interface AgentBudget {
  agentId: string
  agentName: string
  model: string
  monthlyCap: number
  currentSpend: number
  lastMonthSpend: number
  projectedSpend: number
  alertThreshold: number
  monthlyHistory: { month: string; spend: number }[]
}

const BUDGET_SEED: { agentId: string; agentName: string; model: string; cap: number; spendPct: number }[] = [
  { agentId: 'odds-analysis',      agentName: 'Odds Analysis Agent',       model: 'gpt-4o',            cap: 2500, spendPct: 0.73 },
  { agentId: 'line-comparison',    agentName: 'Line Comparison Agent',     model: 'gpt-4o',            cap: 1800, spendPct: 0.85 },
  { agentId: 'recommendation-writer', agentName: 'Recommendation Writer Agent', model: 'claude-3-5-sonnet', cap: 800,  spendPct: 0.42 },
  { agentId: 'customer-response',  agentName: 'Customer Response Agent',   model: 'gpt-4o-mini',       cap: 3200, spendPct: 0.91 },
]

export function getAgentBudgets(): AgentBudget[] {
  return BUDGET_SEED.map(b => {
    const currentSpend = parseFloat((b.cap * b.spendPct).toFixed(2))
    const lastMonthSpend = parseFloat((b.cap * (b.spendPct * 0.88 + 0.05)).toFixed(2))
    const dayOfMonth = 22
    const dailyRate = currentSpend / dayOfMonth
    const projectedSpend = parseFloat((dailyRate * 30).toFixed(2))

    const months = ['Jan', 'Feb', 'Mar', 'Apr']
    const monthlyHistory = months.map((m, i) => ({
      month: m,
      spend: parseFloat((b.cap * (0.55 + i * 0.10 + (b.spendPct - 0.7) * 0.3)).toFixed(2)),
    }))

    return {
      agentId: b.agentId,
      agentName: b.agentName,
      model: b.model,
      monthlyCap: b.cap,
      currentSpend,
      lastMonthSpend,
      projectedSpend,
      alertThreshold: 80,
      monthlyHistory,
    }
  })
}

// ─── 4.3 Live Monitoring ────────────────────────────────────────

export interface LiveEvent {
  id: string
  timestamp: string
  agentName: string
  agentId: string
  status: 'success' | 'failure'
  duration_ms: number
  cost: number
}

export interface AgentStatus {
  agentId: string
  agentName: string
  model: string
  status: 'active' | 'degraded' | 'down'
  lastRun: string
  successRate1h: number
  successRate24h: number
  sigmaScore: number
}

export function getSystemHealth(): { status: 'operational' | 'degraded' | 'down'; label: string } {
  return { status: 'operational', label: 'All Systems Operational' }
}

export function getAgentStatuses(): AgentStatus[] {
  const now = Date.now()
  return [
    { agentId: 'odds-analysis',      agentName: 'Odds Analysis Agent',       model: 'gpt-4o',            status: 'active',   lastRun: new Date(now - 2 * 60000).toISOString(),  successRate1h: 0.96, successRate24h: 0.92, sigmaScore: 4.2 },
    { agentId: 'line-comparison',    agentName: 'Line Comparison Agent',     model: 'gpt-4o',            status: 'active',   lastRun: new Date(now - 5 * 60000).toISOString(),  successRate1h: 0.88, successRate24h: 0.85, sigmaScore: 3.4 },
    { agentId: 'recommendation-writer', agentName: 'Recommendation Writer Agent', model: 'claude-3-5-sonnet', status: 'degraded', lastRun: new Date(now - 12 * 60000).toISOString(), successRate1h: 0.72, successRate24h: 0.78, sigmaScore: 2.9 },
    { agentId: 'customer-response',  agentName: 'Customer Response Agent',   model: 'gpt-4o-mini',       status: 'active',   lastRun: new Date(now - 1 * 60000).toISOString(),  successRate1h: 0.94, successRate24h: 0.91, sigmaScore: 3.2 },
  ]
}

export function getLiveEvents(count = 25): LiveEvent[] {
  const agents = AGENTS
  const now = Date.now()
  return Array.from({ length: count }, (_, i) => {
    const s = (i * 7919 + 137) % 1000
    const agent = agents[i % agents.length]
    const isSuccess = s > 180
    return {
      id: `EVT-${String(i + 1).padStart(4, '0')}`,
      timestamp: new Date(now - i * 45000).toISOString(),
      agentName: agent.name,
      agentId: agent.id,
      status: isSuccess ? 'success' : 'failure',
      duration_ms: 800 + (s % 3200),
      cost: parseFloat((0.002 + (s % 50) * 0.001).toFixed(4)),
    }
  })
}

// ─── 4.4 Sharing & Notifications ────────────────────────────────

export interface SharedLink {
  id: string
  url: string
  page: string
  pagePath: string
  access: 'anyone' | 'team' | 'admins'
  createdAt: string
  expiresAt: string | null
  createdBy: string
  revoked: boolean
}

export const SHARED_LINKS: SharedLink[] = [
  { id: 'sl-001', url: 'https://vipplay.app/share/abc123', page: 'Dashboard', pagePath: '/dashboard', access: 'anyone', createdAt: '2026-03-28T10:15:00Z', expiresAt: '2026-04-04T10:15:00Z', createdBy: 'alex.morgan@vipplay.com', revoked: false },
  { id: 'sl-002', url: 'https://vipplay.app/share/def456', page: 'Compare', pagePath: '/compare', access: 'team', createdAt: '2026-03-25T14:30:00Z', expiresAt: '2026-04-24T14:30:00Z', createdBy: 'sam.patel@vipplay.com', revoked: false },
  { id: 'sl-003', url: 'https://vipplay.app/share/ghi789', page: 'Reports', pagePath: '/reports', access: 'admins', createdAt: '2026-03-20T09:00:00Z', expiresAt: null, createdBy: 'alex.morgan@vipplay.com', revoked: false },
  { id: 'sl-004', url: 'https://vipplay.app/share/jkl012', page: 'Settings', pagePath: '/settings', access: 'admins', createdAt: '2026-03-15T16:45:00Z', expiresAt: '2026-04-14T16:45:00Z', createdBy: 'dana.lee@vipplay.com', revoked: true },
  { id: 'sl-005', url: 'https://vipplay.app/share/mno345', page: 'Workflows', pagePath: '/workflows', access: 'team', createdAt: '2026-03-30T11:20:00Z', expiresAt: '2026-04-06T11:20:00Z', createdBy: 'sam.patel@vipplay.com', revoked: false },
]

export function getSharedLinks(): SharedLink[] {
  return SHARED_LINKS
}

export interface NotificationChannel {
  id: string
  type: 'email' | 'slack' | 'teams'
  label: string
  enabled: boolean
  status: 'connected' | 'not_configured'
  config: Record<string, string>
}

export const NOTIFICATION_CHANNELS: NotificationChannel[] = [
  { id: 'ch-email', type: 'email', label: 'Email', enabled: true, status: 'connected', config: { emails: 'alex.morgan@vipplay.com, ops-team@vipplay.com', frequency: 'Hourly digest' } },
  { id: 'ch-slack', type: 'slack', label: 'Slack', enabled: true, status: 'connected', config: { workspace: 'VIPPlay HQ', channel: '#ai-alerts' } },
  { id: 'ch-teams', type: 'teams', label: 'Microsoft Teams', enabled: false, status: 'not_configured', config: { webhookUrl: '' } },
]

export function getNotificationChannels(): NotificationChannel[] {
  return NOTIFICATION_CHANNELS
}

export interface NotificationRule {
  id: string
  alertType: string
  description: string
  channels: { email: boolean; slack: boolean; teams: boolean }
  recipients: string
}

export const NOTIFICATION_RULES: NotificationRule[] = [
  { id: 'nr-001', alertType: 'Agent below sigma target', description: 'Triggers when any agent falls below its configured sigma threshold', channels: { email: true, slack: true, teams: false }, recipients: 'ops-team@vipplay.com, #ai-alerts' },
  { id: 'nr-002', alertType: 'Override rate > 25%', description: 'Compliance alert when human override rate exceeds threshold', channels: { email: true, slack: false, teams: false }, recipients: 'compliance@vipplay.com' },
  { id: 'nr-003', alertType: 'Budget cap reached', description: 'Financial alert when workflow spend exceeds monthly budget', channels: { email: true, slack: true, teams: false }, recipients: 'finance@vipplay.com, #ops' },
  { id: 'nr-004', alertType: 'SLA breach', description: 'Performance alert when SLA hit rate drops below threshold', channels: { email: true, slack: true, teams: true }, recipients: 'All channels' },
]

export function getNotificationRules(): NotificationRule[] {
  return NOTIFICATION_RULES
}

export interface RecentNotification {
  id: string
  timestamp: string
  type: string
  channel: 'email' | 'slack' | 'teams'
  recipient: string
  status: 'delivered' | 'failed' | 'pending'
  message: string
}

export const RECENT_NOTIFICATIONS: RecentNotification[] = [
  { id: 'rn-001', timestamp: '2026-04-02T08:14:00Z', type: 'SLA breach', channel: 'slack', recipient: '#ai-alerts', status: 'delivered', message: 'Odds Analysis Agent SLA hit rate dropped to 68% (target: 88%)' },
  { id: 'rn-002', timestamp: '2026-04-02T08:14:00Z', type: 'SLA breach', channel: 'email', recipient: 'ops-team@vipplay.com', status: 'delivered', message: 'Odds Analysis Agent SLA hit rate dropped to 68% (target: 88%)' },
  { id: 'rn-003', timestamp: '2026-04-01T15:30:00Z', type: 'Budget cap reached', channel: 'email', recipient: 'finance@vipplay.com', status: 'delivered', message: 'Content Moderation Agent monthly spend reached $142.50 (cap: $150)' },
  { id: 'rn-004', timestamp: '2026-04-01T12:00:00Z', type: 'Agent below sigma target', channel: 'slack', recipient: '#ai-alerts', status: 'delivered', message: 'Player Engagement Agent consistency dropped to 2.1 sigma (target: 3.0)' },
  { id: 'rn-005', timestamp: '2026-03-31T09:45:00Z', type: 'Override rate > 25%', channel: 'email', recipient: 'compliance@vipplay.com', status: 'failed', message: 'VIP Support Agent override rate at 31% — compliance review required' },
  { id: 'rn-006', timestamp: '2026-03-30T18:22:00Z', type: 'SLA breach', channel: 'teams', recipient: 'AI Ops Team', status: 'pending', message: 'VIP Support Agent P95 latency exceeded 4000ms SLA for 3 consecutive hours' },
]

export function getRecentNotifications(): RecentNotification[] {
  return RECENT_NOTIFICATIONS
}

// ─── 4.5 Workforce Projections ──────────────────────────────────

const WORKFORCE_MONTHS_12 = [
  'May 2025','Jun 2025','Jul 2025','Aug 2025','Sep 2025','Oct 2025',
  'Nov 2025','Dec 2025','Jan 2026','Feb 2026','Mar 2026','Apr 2026',
]

const WORKFORCE_SKILL_NAMES = ['AI Review', 'Exception Handling', 'Quality Assurance', 'Prompt Engineering']

interface WorkforceProcess {
  id: string
  name: string
  currentHeadcount: number
}

const WORKFORCE_PROCESSES: WorkforceProcess[] = [
  { id: 'sports-betting', name: 'Sports Betting Analyst', currentHeadcount: 12 },
  { id: 'customer-service', name: 'Customer Service Representative', currentHeadcount: 8 },
]

export function getWorkforceProcess(id: string): WorkforceProcess {
  return WORKFORCE_PROCESSES.find(p => p.id === id) ?? WORKFORCE_PROCESSES[0]
}

function buildWorkforceProjection(processId: string, scenario: Scenario): WorkforceProjection {
  const proc = getWorkforceProcess(processId)
  const hc = proc.currentHeadcount
  const pace = scenario === 'aggressive' ? 0.065 : scenario === 'moderate' ? 0.04 : 0.02
  const salaryPerHead = 7500

  const months = WORKFORCE_MONTHS_12.map((month, i) => {
    const decay = Math.max(0, 1 - pace * (i + 1))
    const headcount = Math.max(2, Math.round(hc * decay))
    const salaryBurn = headcount * salaryPerHead
    const agentCost = Math.round(800 + (hc - headcount) * 420 + i * 120)
    const netSaving = (hc * salaryPerHead) - salaryBurn - agentCost

    const skills = WORKFORCE_SKILL_NAMES.map((name, si) => {
      const peak = 3 + si * 2
      const dist = Math.abs(i - peak)
      const demand = Math.max(5, Math.round(100 * Math.exp(-0.15 * dist * dist)))
      return { name, demand }
    })

    return { month, headcount, salaryBurn, agentCost, netSaving, skills }
  })

  return { processId, scenario, months }
}

const workforceProjectionCache = new Map<string, WorkforceProjection>()

export function getWorkforceProjection(processId: string, scenario: Scenario): WorkforceProjection {
  const key = `${processId}:${scenario}`
  if (!workforceProjectionCache.has(key)) {
    workforceProjectionCache.set(key, buildWorkforceProjection(processId, scenario))
  }
  return workforceProjectionCache.get(key)!
}

// ─── 4.6 Governance Rules & Violations ──────────────────────────

export const GOVERNANCE_RULES: GovernanceRule[] = [
  { id: 'gr-01', name: 'Low-automation tasks remain human-owned', condition: 'All tasks with automation score < 0.30 MUST remain human-owned', enforcement: 'Block', active: true, satisfied: true },
  { id: 'gr-02', name: 'Human review for collaborative tasks', condition: 'All collaborative tasks MUST have human review within 5 minutes', enforcement: 'Warn', active: true, satisfied: true },
  { id: 'gr-03', name: 'Sigma gate for low-performing agents', condition: 'Agents below 3.0\u03C3 MUST have mandatory human gate', enforcement: 'Block', active: true, satisfied: true },
  { id: 'gr-04', name: 'Financial data dual sign-off', condition: 'Any task touching financial data requires dual sign-off', enforcement: 'Block', active: true, satisfied: true },
  { id: 'gr-05', name: 'Override rate cap', condition: 'Override rate cannot exceed 30% per agent per week', enforcement: 'Warn', active: true, satisfied: false },
  { id: 'gr-06', name: 'Agent cost ceiling', condition: 'Agent cost per run cannot exceed $0.50', enforcement: 'Warn', active: false, satisfied: true },
  { id: 'gr-07', name: 'Decision logging requirement', condition: 'All agent decisions must be logged within 24h', enforcement: 'Log', active: true, satisfied: true },
  { id: 'gr-08', name: 'Burn-in for new agents', condition: 'New agents require 100-run burn-in before autonomous mode', enforcement: 'Block', active: true, satisfied: true },
  { id: 'gr-09', name: 'Reactivation review', condition: 'Decommissioned agents cannot be reactivated without review', enforcement: 'Block', active: false, satisfied: true },
  { id: 'gr-10', name: 'Quarterly FMEA review', condition: 'High-risk tasks require quarterly FMEA review', enforcement: 'Warn', active: true, satisfied: false },
]

export const GOVERNANCE_VIOLATIONS: GovernanceViolation[] = [
  { id: 'gv-01', ruleId: 'gr-05', ruleName: 'Override rate cap', agentName: 'LineComparisonAgent', description: 'Override rate reached 38% this week (threshold: 30%)', recommendedAction: 'Review recent overrides and retrain agent on edge-case scenarios' },
  { id: 'gv-02', ruleId: 'gr-10', ruleName: 'Quarterly FMEA review', agentName: 'ComplianceCheckerAgent', description: 'FMEA review overdue by 18 days for high-risk compliance tasks', recommendedAction: 'Schedule FMEA review session and update risk register' },
]

export function getGovernanceRules(): GovernanceRule[] {
  return GOVERNANCE_RULES
}

export function getGovernanceViolations(): GovernanceViolation[] {
  return GOVERNANCE_VIOLATIONS
}

// ─── 5.3 Industry Benchmarks ───────────────────────────────────

const INDUSTRY_BENCHMARKS: IndustryBenchmark[] = [
  { metric: 'Sigma Score',      yourValue: 4.2,  industryAvg: 3.6,  top10Pct: 5.1,  unit: '\u03C3',    percentile: 75 },
  { metric: 'OEE',              yourValue: 83,   industryAvg: 72,   top10Pct: 91,   unit: '%',       percentile: 72 },
  { metric: 'ROI / Agent / Wk', yourValue: 475,  industryAvg: 280,  top10Pct: 850,  unit: '$/wk',    percentile: 68 },
  { metric: 'Cost / Run',       yourValue: 0.12, industryAvg: 0.18, top10Pct: 0.08, unit: '$',       percentile: 71 },
  { metric: 'Success Rate',     yourValue: 89,   industryAvg: 78,   top10Pct: 95,   unit: '%',       percentile: 76 },
]

export function getIndustryBenchmarks(): IndustryBenchmark[] {
  return INDUSTRY_BENCHMARKS
}

// ─── 5.4.1 Anomaly Detection ───────────────────────────────────

const ANOMALIES: Anomaly[] = [
  { id: 'anom-001', timestamp: '2026-03-28T14:00:00Z', severity: 'Critical', agentId: 'recommendation-writer', agentName: 'Recommendation Writer', description: 'Recommendation Writer latency spiked 340% between 2:00-4:00 PM on Mar 28', category: 'Latency' },
  { id: 'anom-002', timestamp: '2026-03-20T09:30:00Z', severity: 'Info', agentId: 'odds-analysis', agentName: 'Odds Analysis', description: 'Odds Analysis cost per run decreased 15% after model update on Mar 20', category: 'Cost' },
  { id: 'anom-003', timestamp: '2026-03-30T11:15:00Z', severity: 'Warning', agentId: 'customer-response', agentName: 'Customer Service', description: 'Customer Service override rate doubled in the last 7 days', category: 'Quality' },
  { id: 'anom-004', timestamp: '2026-03-31T16:45:00Z', severity: 'Critical', agentId: 'line-comparison', agentName: 'Line Comparison', description: 'Line Comparison success rate dropped below SLA threshold for 3 consecutive hours', category: 'SLA' },
  { id: 'anom-005', timestamp: '2026-03-25T08:00:00Z', severity: 'Info', agentId: 'odds-analysis', agentName: 'Overall', description: 'Overall inference costs reduced 12% month-over-month', category: 'Cost' },
]

export function getAnomalies(): Anomaly[] {
  return ANOMALIES
}

// ─── 5.4.2 Correlation Engine ──────────────────────────────────

const CORRELATIONS: Correlation[] = [
  {
    id: 'corr-001', title: 'Override rate vs sigma score', coefficient: -0.85, strength: 'Strong', type: 'Quality',
    insight: 'Reducing human overrides by 20% could lift your sigma score by ~0.4\u03C3. Focus on improving the Recommendation Writer prompt quality to reduce manual corrections.',
    data: [{ x: 5, y: 4.8 }, { x: 12, y: 4.2 }, { x: 18, y: 3.9 }, { x: 22, y: 3.5 }, { x: 28, y: 3.2 }, { x: 35, y: 2.8 }, { x: 8, y: 4.5 }, { x: 15, y: 4.0 }, { x: 20, y: 3.6 }, { x: 30, y: 3.0 }, { x: 10, y: 4.4 }, { x: 25, y: 3.3 }],
  },
  {
    id: 'corr-002', title: 'Latency breaches increase 3x during peak hours (2-4 PM)', coefficient: 0.78, strength: 'Strong', type: 'Temporal',
    insight: 'Peak hour latency breaches are 3x higher than off-peak. Consider request queuing, model caching, or load balancing during 2-4 PM windows.',
    data: [{ x: 8, y: 2 }, { x: 9, y: 3 }, { x: 10, y: 4 }, { x: 11, y: 3 }, { x: 12, y: 5 }, { x: 13, y: 6 }, { x: 14, y: 15 }, { x: 15, y: 18 }, { x: 16, y: 12 }, { x: 17, y: 7 }, { x: 18, y: 4 }, { x: 19, y: 3 }],
  },
  {
    id: 'corr-003', title: 'Cost per run decreased 22% when switching from gpt-4o to claude-sonnet-4-6', coefficient: -0.91, strength: 'Strong', type: 'Model comparison',
    insight: 'Model migration yielded significant cost savings with no degradation in success rate. Consider migrating remaining gpt-4o workflows to Claude Sonnet.',
    data: [{ x: 1, y: 0.18 }, { x: 2, y: 0.17 }, { x: 3, y: 0.19 }, { x: 4, y: 0.16 }, { x: 5, y: 0.15 }, { x: 6, y: 0.14 }, { x: 7, y: 0.13 }, { x: 8, y: 0.12 }, { x: 9, y: 0.12 }, { x: 10, y: 0.11 }, { x: 11, y: 0.12 }, { x: 12, y: 0.10 }],
  },
  {
    id: 'corr-004', title: 'Higher task complexity correlates with lower success rate', coefficient: -0.72, strength: 'Moderate', type: 'Task analysis',
    insight: 'Tasks with complexity score above 7 have a 40% lower success rate. Consider breaking complex tasks into sub-workflows or adding chain-of-thought prompting.',
    data: [{ x: 2, y: 96 }, { x: 3, y: 94 }, { x: 4, y: 91 }, { x: 5, y: 88 }, { x: 6, y: 82 }, { x: 7, y: 75 }, { x: 8, y: 68 }, { x: 9, y: 60 }, { x: 3, y: 92 }, { x: 5, y: 85 }, { x: 7, y: 72 }, { x: 9, y: 55 }],
  },
]

export function getCorrelations(): Correlation[] {
  return CORRELATIONS
}
