// ─── Language & Status ────────────────────────────────────────────
export type LanguageMode = 'operations' | 'quality'
export type Status = 'green' | 'amber' | 'red'
export type Ownership = 'agent' | 'collaborative' | 'human'
export type DecisionType = 'approved' | 'overridden' | 'escalated'
export type Verdict = 'GREEN' | 'AMBER' | 'RED'
export type SigmaTrend = 'up' | 'flat' | 'down'
export type QualityFramework = 'oee' | 'servqual'

// ─── Organisation ────────────────────────────────────────────────
export interface Organisation {
  name: string
  industry: string
  qualityFramework: QualityFramework
  sigmaTarget: number
  langfuse: {
    status: string
    host: string
    project: string
    lastSync: string
  }
  onet: {
    status: string
    host: string
    lastRefresh: string
  }
}

// ─── Process ─────────────────────────────────────────────────────
export interface Process {
  id: string
  name: string
  onetCode: string
  headcount: number
  avgHourlyWage: number
  weeklyHours: number
  agentCoverage: number
  collaborativeCoverage: number
  humanCoverage: number
  status: Status
  weeklyNetRoi: number
  weeklyGrossSaving: number
  agents: string[]
}

// ─── Agent ───────────────────────────────────────────────────────
export interface Agent {
  id: string
  name: string
  processId: string
  model: string
  framework: string
  status: Status
  sigmaScore: number
  sigmaTrend: SigmaTrend
  sigmaPrev: number
  dpmo: number
  oee: number
  successRate: number
  p95LatencyMs: number
  avgCostPerRun: number
  totalRuns: number
  defects: {
    failures: number
    latencyBreaches: number
    costOverruns: number
  }
  tasks: string[]
}

// ─── O*NET Task ──────────────────────────────────────────────────
export interface OnetTask {
  id: string
  processId: string
  task: string
  timeWeight: number
  automationScore: number
  ownership: Ownership
  agentName: string | null
}

// ─── Per-Agent ROI ──────────────────────────────────────────────
export interface AgentRoi {
  agentId: string
  agentName: string
  taskTimeWeightPct: number
  grossSavingWeekly: number
  inferenceCostWeekly: number
  oversightCostWeekly: number
  governanceCostWeekly: number
  netRoiWeekly: number
}

// ─── ROI ─────────────────────────────────────────────────────────
export interface RoiSnapshot {
  processId: string
  agentCoveragePct: number
  collaborativePct: number
  humanRetainedPct: number
  grossSavingWeekly: number
  oversightCostWeekly: number
  inferenceCostWeekly: number
  governanceOverheadWeekly: number
  netRoiWeekly: number
  netPerPerson: number
  manualCostPerTask: number
}

// ─── Audit ───────────────────────────────────────────────────────
export interface AuditLogEntry {
  id: string
  timestamp: string
  processName: string
  task: string
  agentRecommendation: string
  humanDecision: string
  reviewer: string
  decisionType: DecisionType
  durationMinutes: number
}

// ─── Sigma Trend ─────────────────────────────────────────────────
export interface SigmaTrendPoint {
  day: number
  date: string
  sigma: number
  dpmo: number
}

// ─── Sigma Level ─────────────────────────────────────────────────
export interface SigmaLevel {
  sigma: number
  dpmo: number
  label: string
  shortLabel: string
}

// ─── Runs & Spans ────────────────────────────────────────────────
export interface Span {
  name: string
  duration_ms: number
  status: 'ok' | 'error'
  cost: number
  tool_calls: number
  error?: string
}

export interface Run {
  runId: string
  agentId: string
  timestamp: string
  durationMs: number
  outcome: boolean
  totalCost: number
  tokenCount: number
  toolCalls: number
  spans: Span[]
}

// ─── Language Vocabulary ─────────────────────────────────────────
export interface LanguageVocabulary {
  green: string
  amber: string
  red: string
  qualityPrefix: string
  qualitySuffix: string
  trendUp: string
  trendDown: string
  trendFlat: string
  target: string
  defect: string
  effectiveness: string
}

// ─── O*NET Occupation (for A2 search) ─────────────────────────
export interface OnetOccupation {
  code: string
  title: string
  description: string
  automationRisk: 'low' | 'medium' | 'high'
  taskCount: number
  medianWage: number
  category: string
}

// ─── Coverage Map Entry (for A3 mapper) ────────────────────────
export interface CoverageMapEntry {
  taskId: string
  task: string
  timeWeight: number
  automationScore: number
  ownership: Ownership
  agentId: string | null
  agentName: string | null
  confidence: 'high' | 'medium' | 'low'
  notes: string
}

// ─── FMEA Entry (for D3 risk board) ────────────────────────────
export interface FmeaEntry {
  id: string
  agentId: string
  agentName: string
  failureMode: string
  effect: string
  cause: string
  severity: number
  occurrence: number
  detection: number
  rpn: number
  recommendedAction: string
  status: 'open' | 'in-progress' | 'mitigated'
}

// ─── Transformation Stage (for C5 roadmap) ─────────────────────
export interface TransformationStage {
  id: string
  name: string
  sigmaTh: number
  agentCoverage: number
  collaborativeCoverage: number
  humanCoverage: number
  weeklyNetRoi: number
  tasksToMigrate: string[]
  estimatedTimeline: string
}

// ─── Report Config (for B3 export) ──────────────────────────────
export interface ReportConfig {
  id: string
  name: string
  dateRange: string
  processes: string[]
  sections: string[]
  generatedAt: string
  format: 'pdf' | 'pptx'
  status: 'ready' | 'generating'
}

// ─── SERVQUAL Dimension (for F1) ────────────────────────────────
export interface ServqualDimension {
  name: string
  score: number
  weight: number
  description: string
}

// ─── Agent-level types (for 3.1 Agent Lifecycle) ────────────────
export interface AgentTask {
  name: string
  timeWeight: number          // percentage of role time (0-100)
  weeklyVolume: number        // tasks per week
  avgCost: number             // $ per task
}

export interface AgentProfile {
  id: string
  name: string
  workflowId: string
  processName: string
  sigmaScore: number          // 1-6
  dpmo: number                // defects per million opportunities
  successRate: number         // 0-1
  avgCostPerRun: number
  p95Latency: number          // ms
  totalRuns: number
  tasks: AgentTask[]
  weeklyROI: number           // $ per week
  status: 'active' | 'paused' | 'decommissioned'
  consistency: number         // 0-100
}

export interface DecommissionImpact {
  agentName: string
  processName: string
  taskCoveragePercent: number   // % of process tasks this agent handles
  currentCoverage: number       // current total agent coverage %
  newCoverage: number           // coverage after decommission %
  weeklyROIImpact: number       // negative $ amount
  affectedTasks: AgentTask[]
  fallbackMode: string          // e.g. "Collaborative (human review required)"
}

// ─── Monthly Cost (for 3.2.1 Cost Intelligence) ────────────────
export interface MonthlyCost {
  month: string
  agentId: string
  agentName: string
  inferenceCost: number
  runs: number
  successfulRuns: number
}

// ─── Scheduled Report (for 3.6.1) ──────────────────────────────
export interface ScheduledReport {
  id: string
  templateName: string
  sections: string[]
  frequency: 'weekly' | 'biweekly' | 'monthly'
  dayOfWeek?: string
  time: string
  recipients: string[]
  processes: string[]
  status: 'active' | 'paused'
  lastRun?: string
  nextRun: string
}

// ─── Skills Gap (for 3.7.1) ────────────────────────────────────
export interface SkillGap {
  skill: string
  currentLevel: number
  requiredLevel: number
  gap: number
  priority: 'High' | 'Medium' | 'Low'
  suggestedTraining: string
  suggestedUrl: string
  affectedTaskWeight: number
}

export interface TrainingAssignment {
  trainingName: string
  progress: number
  status: 'completed' | 'in-progress' | 'not-started'
}

export interface TeamMemberTraining {
  name: string
  role: string
  avatar: string
  trainings: TrainingAssignment[]
  overallProgress: number
}

// ─── Process Benchmark (for 3.8.1) ────────────────────────────
export interface ProcessBenchmark {
  processId: string
  processName: string
  avgSigma: number
  oee: number
  agentCoveragePct: number
  netRoiWeekly: number
  costPerTask: number
  maturityRank: number
  quality: number
  coverage: number
  roi: number
  costEfficiency: number
  compliance: number
}

// ─── Phase 4: Staging & Versions (4.1) ─────────────────────────
export interface StagingCandidate {
  agentId: string
  productionModel: string
  candidateModel: string
  productionFramework: string
  candidateFramework: string
  productionMetrics: {
    sigma: number
    successRate: number
    avgCost: number
    avgLatencyMs: number
  }
  candidateMetrics: {
    sigma: number
    successRate: number
    avgCost: number
    avgLatencyMs: number
  }
  stagingRuns: number
  stagingSucessRate: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  riskNote: string
}

export interface AgentVersion {
  version: string
  label: string
  model: string
  framework: string
  deployedDate: string
  status: 'current' | 'retired'
  retiredReason?: string
  sigma: number
}

// ─── Phase 4: Workforce Planning (4.5) ─────────────────────────

export type Scenario = 'conservative' | 'moderate' | 'aggressive'

export interface SkillDemand {
  name: string
  demand: number
}

export interface WorkforceMonth {
  month: string
  headcount: number
  salaryBurn: number
  agentCost: number
  netSaving: number
  skills: SkillDemand[]
}

export interface WorkforceProjection {
  processId: string
  scenario: Scenario
  months: WorkforceMonth[]
}

// ─── Phase 4: Governance Rules (4.6) ───────────────────────────

export type EnforcementLevel = 'Block' | 'Warn' | 'Log'

export interface GovernanceRule {
  id: string
  name: string
  condition: string
  enforcement: EnforcementLevel
  active: boolean
  satisfied: boolean
}

export interface GovernanceViolation {
  id: string
  ruleId: string
  ruleName: string
  agentName: string
  description: string
  recommendedAction: string
}

// ─── Phase 5: Industry Benchmarks (5.3) ────────────────────────

export interface IndustryBenchmark {
  metric: string
  yourValue: number
  industryAvg: number
  top10Pct: number
  unit: string
  percentile: number
}

// ─── Phase 5: Anomaly Detection (5.4.1) ────────────────────────

export type AnomalySeverity = 'Critical' | 'Warning' | 'Info'

export interface Anomaly {
  id: string
  timestamp: string
  severity: AnomalySeverity
  agentId: string
  agentName: string
  description: string
  category: string
}

// ─── Phase 5: Correlation Engine (5.4.2) ───────────────────────

export interface CorrelationPoint {
  x: number
  y: number
}

export interface Correlation {
  id: string
  title: string
  coefficient: number
  strength: 'Strong' | 'Moderate' | 'Weak'
  type: string
  insight: string
  data: CorrelationPoint[]
}
