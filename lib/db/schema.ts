import {
  pgTable,
  uuid,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
  date,
  jsonb,
  bigint,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// ─── Tenant & Auth ──────────────────────────────────────────────

export const organisations = pgTable('organisations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  industry: text('industry').notNull(),
  qualityFramework: text('quality_framework').notNull().default('oee'),
  sigmaTarget: numeric('sigma_target', { precision: 3, scale: 1 }).notNull().default('4.0'),
  langfuseHost: text('langfuse_host'),
  langfuseProject: text('langfuse_project'),
  langfuseApiKeyEnc: text('langfuse_api_key_enc'),
  langfuseLastSync: timestamp('langfuse_last_sync', { withTimezone: true }),
  onetHost: text('onet_host').default('services.onetcenter.org'),
  onetLastRefresh: timestamp('onet_last_refresh', { withTimezone: true }),
  brandingConfig: jsonb('branding_config').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organisations.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  name: text('name').notNull(),
  emailVerified: timestamp('email_verified', { withTimezone: true }),
  image: text('image'),
  role: text('role').notNull().default('analyst'),
  hashedPassword: text('hashed_password'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('users_org_email_idx').on(t.orgId, t.email),
])

// NextAuth adapter tables
export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refreshToken: text('refresh_token'),
  accessToken: text('access_token'),
  expiresAt: integer('expires_at'),
  tokenType: text('token_type'),
  scope: text('scope'),
  idToken: text('id_token'),
  sessionState: text('session_state'),
}, (t) => [
  uniqueIndex('accounts_provider_idx').on(t.provider, t.providerAccountId),
])

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionToken: text('session_token').notNull().unique(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { withTimezone: true }).notNull(),
})

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull().unique(),
  expires: timestamp('expires', { withTimezone: true }).notNull(),
}, (t) => [
  uniqueIndex('verification_tokens_idx').on(t.identifier, t.token),
])

// ─── Process & Task Config ─────────────────────────────────────

export const processes = pgTable('processes', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organisations.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull(),
  name: text('name').notNull(),
  onetCode: text('onet_code'),
  headcount: integer('headcount').notNull().default(0),
  avgHourlyWage: numeric('avg_hourly_wage', { precision: 8, scale: 2 }).notNull().default('0'),
  weeklyHours: numeric('weekly_hours', { precision: 5, scale: 1 }).notNull().default('40'),
  status: text('status').notNull().default('green'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('processes_org_slug_idx').on(t.orgId, t.slug),
])

export const onetTasks = pgTable('onet_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  processId: uuid('process_id').notNull().references(() => processes.id, { onDelete: 'cascade' }),
  task: text('task').notNull(),
  timeWeight: numeric('time_weight', { precision: 5, scale: 4 }).notNull(),
  automationScore: numeric('automation_score', { precision: 5, scale: 4 }).notNull().default('0'),
  ownership: text('ownership').notNull().default('human'),
  agentId: uuid('agent_id').references(() => agents.id, { onDelete: 'set null' }),
  confidence: text('confidence').default('medium'),
  notes: text('notes').default(''),
  sortOrder: integer('sort_order').default(0),
})

// ─── Agent Config ──────────────────────────────────────────────

export const agents = pgTable('agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  processId: uuid('process_id').notNull().references(() => processes.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull(),
  name: text('name').notNull(),
  model: text('model').notNull(),
  framework: text('framework').notNull().default('CrewAI'),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('agents_process_slug_idx').on(t.processId, t.slug),
])

export const agentVersions = pgTable('agent_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  version: text('version').notNull(),
  label: text('label'),
  model: text('model').notNull(),
  framework: text('framework').notNull(),
  deployedAt: timestamp('deployed_at', { withTimezone: true }).notNull().defaultNow(),
  retiredAt: timestamp('retired_at', { withTimezone: true }),
  retiredReason: text('retired_reason'),
  isCurrent: boolean('is_current').notNull().default(false),
}, (t) => [
  uniqueIndex('agent_versions_agent_version_idx').on(t.agentId, t.version),
])

// ─── Telemetry (high-write) ────────────────────────────────────

export const runs = pgTable('runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  runId: text('run_id').notNull(),
  agentId: uuid('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  agentVersionId: uuid('agent_version_id').references(() => agentVersions.id),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
  durationMs: integer('duration_ms').notNull(),
  outcome: boolean('outcome').notNull(),
  totalCost: numeric('total_cost', { precision: 12, scale: 6 }).notNull(),
  tokenCount: integer('token_count').notNull().default(0),
  toolCalls: integer('tool_calls').notNull().default(0),
  spans: jsonb('spans').notNull().default([]),
  langfuseTraceId: text('langfuse_trace_id'),
  metadata: jsonb('metadata').default({}),
}, (t) => [
  index('idx_runs_agent_ts').on(t.agentId, t.timestamp),
  index('idx_runs_ts').on(t.timestamp),
  index('idx_runs_outcome').on(t.agentId, t.outcome, t.timestamp),
  uniqueIndex('idx_runs_agent_run_id').on(t.agentId, t.runId),
])

export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organisations.id, { onDelete: 'cascade' }),
  processId: uuid('process_id').notNull().references(() => processes.id, { onDelete: 'cascade' }),
  task: text('task').notNull(),
  agentRecommendation: text('agent_recommendation'),
  humanDecision: text('human_decision'),
  reviewerId: uuid('reviewer_id').references(() => users.id),
  reviewerName: text('reviewer_name').notNull(),
  decisionType: text('decision_type').notNull(),
  durationMinutes: numeric('duration_minutes', { precision: 6, scale: 1 }),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('idx_audit_org_ts').on(t.orgId, t.timestamp),
])

// ─── Governance ────────────────────────────────────────────────

export const governanceRules = pgTable('governance_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organisations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  condition: text('condition').notNull(),
  enforcement: text('enforcement').notNull().default('Warn'),
  active: boolean('active').notNull().default(true),
  geography: text('geography').notNull().default('Global'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const fmeaEntries = pgTable('fmea_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  failureMode: text('failure_mode').notNull(),
  effect: text('effect').notNull(),
  cause: text('cause').notNull(),
  severity: integer('severity').notNull(),
  occurrence: integer('occurrence').notNull(),
  detection: integer('detection').notNull(),
  rpn: integer('rpn').generatedAlwaysAs(
    sql`severity * occurrence * detection`
  ),
  recommendedAction: text('recommended_action'),
  status: text('status').notNull().default('open'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const complianceRequirements = pgTable('compliance_requirements', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organisations.id, { onDelete: 'cascade' }),
  requirement: text('requirement').notNull(),
  status: text('status').notNull().default('NOT_STARTED'),
  detail: text('detail').default(''),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ─── Settings ──────────────────────────────────────────────────

export const alertRules = pgTable('alert_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organisations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  metric: text('metric').notNull(),
  threshold: numeric('threshold').notNull(),
  unit: text('unit').notNull(),
  enabled: boolean('enabled').notNull().default(true),
  severity: text('severity').notNull().default('Warning'),
  scope: text('scope').default('all'),
  config: jsonb('config').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const agentBudgets = pgTable('agent_budgets', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }).unique(),
  monthlyCap: numeric('monthly_cap', { precision: 12, scale: 2 }).notNull(),
  alertThreshold: integer('alert_threshold').notNull().default(80),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const notificationChannels = pgTable('notification_channels', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organisations.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  label: text('label').notNull(),
  enabled: boolean('enabled').notNull().default(false),
  config: jsonb('config').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const notificationRules = pgTable('notification_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organisations.id, { onDelete: 'cascade' }),
  alertType: text('alert_type').notNull(),
  description: text('description'),
  channels: jsonb('channels').notNull().default({}),
  recipients: text('recipients'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const scheduledReports = pgTable('scheduled_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organisations.id, { onDelete: 'cascade' }),
  templateName: text('template_name').notNull(),
  sections: jsonb('sections').notNull().default([]),
  frequency: text('frequency').notNull().default('weekly'),
  dayOfWeek: text('day_of_week'),
  time: text('time').notNull(),
  recipients: jsonb('recipients').notNull().default([]),
  processIds: jsonb('process_ids').notNull().default([]),
  status: text('status').notNull().default('active'),
  lastRun: timestamp('last_run', { withTimezone: true }),
  nextRun: timestamp('next_run', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const stagingCandidates = pgTable('staging_candidates', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  candidateModel: text('candidate_model').notNull(),
  candidateFramework: text('candidate_framework').notNull(),
  stagingRuns: integer('staging_runs').notNull().default(0),
  stagingSuccessRate: numeric('staging_success_rate', { precision: 5, scale: 4 }),
  riskLevel: text('risk_level').notNull().default('MEDIUM'),
  riskNote: text('risk_note'),
  productionMetrics: jsonb('production_metrics').notNull().default({}),
  candidateMetrics: jsonb('candidate_metrics').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const skillsGap = pgTable('skills_gap', {
  id: uuid('id').primaryKey().defaultRandom(),
  processId: uuid('process_id').notNull().references(() => processes.id, { onDelete: 'cascade' }),
  skill: text('skill').notNull(),
  currentLevel: integer('current_level').notNull(),
  requiredLevel: integer('required_level').notNull(),
  priority: text('priority').notNull().default('Medium'),
  suggestedTraining: text('suggested_training'),
  suggestedUrl: text('suggested_url'),
  affectedTaskWeight: numeric('affected_task_weight', { precision: 5, scale: 4 }),
})

export const trainingAssignments = pgTable('training_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  processId: uuid('process_id').notNull().references(() => processes.id, { onDelete: 'cascade' }),
  memberName: text('member_name').notNull(),
  memberRole: text('member_role'),
  trainingName: text('training_name').notNull(),
  progress: integer('progress').notNull().default(0),
  status: text('status').notNull().default('not-started'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ─── API Keys (for ingestion auth) ────────────────────────────

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organisations.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  keyHash: text('key_hash').notNull().unique(),
  keyPrefix: text('key_prefix').notNull(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ─── Materialized / Cron-populated ─────────────────────────────

export const agentMetricsDaily = pgTable('agent_metrics_daily', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  totalRuns: integer('total_runs').notNull().default(0),
  successfulRuns: integer('successful_runs').notNull().default(0),
  failedRuns: integer('failed_runs').notNull().default(0),
  latencyBreaches: integer('latency_breaches').notNull().default(0),
  costOverruns: integer('cost_overruns').notNull().default(0),
  totalCost: numeric('total_cost', { precision: 12, scale: 6 }).notNull().default('0'),
  totalTokens: bigint('total_tokens', { mode: 'number' }).notNull().default(0),
  avgDurationMs: numeric('avg_duration_ms', { precision: 10, scale: 2 }),
  p95DurationMs: integer('p95_duration_ms'),
  sigmaScore: numeric('sigma_score', { precision: 4, scale: 2 }),
  dpmo: integer('dpmo'),
}, (t) => [
  uniqueIndex('agent_metrics_daily_agent_date_idx').on(t.agentId, t.date),
])

export const processMetricsDaily = pgTable('process_metrics_daily', {
  id: uuid('id').primaryKey().defaultRandom(),
  processId: uuid('process_id').notNull().references(() => processes.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  agentCoverage: numeric('agent_coverage', { precision: 5, scale: 4 }),
  collaborativeCoverage: numeric('collaborative_coverage', { precision: 5, scale: 4 }),
  humanCoverage: numeric('human_coverage', { precision: 5, scale: 4 }),
  grossSavingWeekly: numeric('gross_saving_weekly', { precision: 12, scale: 2 }),
  netRoiWeekly: numeric('net_roi_weekly', { precision: 12, scale: 2 }),
  oversightCostWeekly: numeric('oversight_cost_weekly', { precision: 12, scale: 2 }),
  inferenceCostWeekly: numeric('inference_cost_weekly', { precision: 12, scale: 6 }),
  governanceCostWeekly: numeric('governance_cost_weekly', { precision: 12, scale: 2 }),
}, (t) => [
  uniqueIndex('process_metrics_daily_process_date_idx').on(t.processId, t.date),
])

export const anomalies = pgTable('anomalies', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organisations.id, { onDelete: 'cascade' }),
  agentId: uuid('agent_id').references(() => agents.id, { onDelete: 'set null' }),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
  severity: text('severity').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  metadata: jsonb('metadata').default({}),
  acknowledged: boolean('acknowledged').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ─── Transformation Stages (config) ───────────────────────────

export const transformationStages = pgTable('transformation_stages', {
  id: uuid('id').primaryKey().defaultRandom(),
  processId: uuid('process_id').notNull().references(() => processes.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  sigmaTh: numeric('sigma_th', { precision: 3, scale: 1 }).notNull(),
  agentCoverage: numeric('agent_coverage', { precision: 5, scale: 4 }).notNull(),
  collaborativeCoverage: numeric('collaborative_coverage', { precision: 5, scale: 4 }).notNull(),
  humanCoverage: numeric('human_coverage', { precision: 5, scale: 4 }).notNull(),
  weeklyNetRoi: numeric('weekly_net_roi', { precision: 12, scale: 2 }).notNull(),
  tasksToMigrate: jsonb('tasks_to_migrate').notNull().default([]),
  estimatedTimeline: text('estimated_timeline').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
})

// ─── Industry Benchmarks (config) ─────────────────────────────

export const industryBenchmarks = pgTable('industry_benchmarks', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organisations.id, { onDelete: 'cascade' }),
  metric: text('metric').notNull(),
  yourValue: numeric('your_value').notNull(),
  industryAvg: numeric('industry_avg').notNull(),
  top10Pct: numeric('top_10_pct').notNull(),
  unit: text('unit').notNull(),
  percentile: integer('percentile').notNull(),
})

// ─── Model Options (config for insights/model-comparison) ─────

export const modelOptions = pgTable('model_options', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organisations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  costPerToken: numeric('cost_per_token', { precision: 12, scale: 8 }).notNull(),
  estimatedSigmaDelta: numeric('estimated_sigma_delta', { precision: 4, scale: 2 }).notNull(),
  estimatedLatencyMs: integer('estimated_latency_ms').notNull(),
  monthlyCostEstimate: numeric('monthly_cost_estimate', { precision: 12, scale: 2 }).notNull(),
})
