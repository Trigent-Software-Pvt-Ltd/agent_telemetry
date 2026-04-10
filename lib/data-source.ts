/**
 * Data Source Bridge
 *
 * Feature-flagged switchover between mock data and real database.
 *
 * Environment variable:
 *   DATA_SOURCE=mock  (default) — all exports come from lib/mock-data.ts
 *   DATA_SOURCE=db              — consumers should import from lib/data/*
 *
 * ─── Why a simple re-export instead of runtime switching? ───
 *
 * 1. ES module `export *` is a static binding resolved at compile time.
 *    You cannot conditionally swap barrel re-exports with `process.env`.
 *
 * 2. The DB layer (lib/data/*.ts) has **different signatures** from mock-data:
 *    - DB functions are `async` (return Promises); mock functions are sync.
 *    - Many DB functions require an `orgId` parameter that mock functions omit.
 *    These mismatches mean a transparent swap is not possible without adapter
 *    wrappers for every function, which would be premature at this stage.
 *
 * 3. Mock-data exports ~40 CONSTANTS (PROCESSES, AGENTS, SIGMA_LEVELS, etc.)
 *    and ~15 interfaces/types that the DB layer does not provide. Components
 *    import these directly, so they must always be available from this module.
 *
 * ─── Migration path ───
 *
 * The switchover happens **per-page / per-component**, not globally:
 *
 *   Step 1 (current):
 *     import { getProcessById } from '@/lib/data-source'
 *     // resolves to the synchronous mock function
 *
 *   Step 2 (page-by-page migration):
 *     import { getProcessById } from '@/lib/data/processes'
 *     // resolves to the async DB function — caller must await
 *     // constants still come from data-source (or mock-data directly)
 *
 *   Step 3 (cleanup):
 *     Once all pages import functions from lib/data/*, this file shrinks
 *     to exporting only the constants & types that have no DB equivalent.
 *
 * ─── Constants always from mock-data ───
 *
 * The following are compile-time constants with no DB counterpart and will
 * always be re-exported from mock-data regardless of DATA_SOURCE:
 *
 *   ORGANISATION, PROCESSES, AGENTS, SIGMA_LEVELS, LANGUAGE_MODES,
 *   ROI_SNAPSHOTS, ONET_TASKS, AUDIT_LOG, RUN_HISTORY, SIGMA_TRENDS,
 *   ONET_OCCUPATIONS, COVERAGE_MAP, FMEA_ENTRIES, TRANSFORMATION_STAGES,
 *   REPORT_HISTORY, SERVQUAL_SCORES, AGENT_PROFILES, MONTHLY_COSTS,
 *   OVERRIDE_TRENDS, SCHEDULED_REPORTS, SKILLS_GAP, TRAINING_PROGRESS,
 *   GOVERNANCE_RULES, GOVERNANCE_VIOLATIONS, SHARED_LINKS,
 *   NOTIFICATION_CHANNELS, NOTIFICATION_RULES, RECENT_NOTIFICATIONS,
 *   AGENT_SETUP_COSTS, MODEL_OPTIONS, MATURITY_LEVELS, PEAK_HOUR_DATA,
 *   TASK_PERFORMANCE, OVERRIDE_QUALITY, SIGMA_TRENDS_90D, SIGMA_TRENDS_6M,
 *   LATENCY_TRENDS_30D, LATENCY_TRENDS_90D, LATENCY_TRENDS_6M,
 *   COMPLIANCE_REQUIREMENTS, EVIDENCE_CHAINS, RULE_GEOGRAPHIES,
 *   MTBV_DATA, HUMAN_BASELINE, TEAM_MEMBERS
 *
 * ─── DB modules (lib/data/*) ───
 *
 *   processes  — getProcessById, getProcesses, getAgentsForProcess,
 *                getTasksForProcess, getRoiForProcess, getCoverageMap,
 *                getProcessBenchmarks, getTaskPerformance
 *   agents     — getAgentById, getAgentProfile, getAgentVersions,
 *                getDecommissionImpact, getAllAgents, getAgentBudgets,
 *                getStagingCandidate, getAgentAvailability,
 *                getPeakHourData, getAgentDependencies
 *   runs       — getRunsForAgent, getAgentRoi, getAgentRoisForProcess,
 *                getMonthlyCosts
 *   sigma      — getSigmaTrendForAgent, getSigmaTrendsForRange,
 *                getSigmaHistory, getLatencyTrendsForRange
 *   governance — getGovernanceRules, getGovernanceViolations,
 *                getFmeaEntries, getOversightGaps, getOverrideTrends,
 *                getOverrideQuality, getComplianceRequirements,
 *                getEvidenceChains, getMtbvData, getRuleGeography
 *   settings   — getAlertRules, getAlertHistory, getAgentSlaConfigs,
 *                getNotificationChannels, getNotificationRules,
 *                getRecentNotifications, getScheduledReports, getSharedLinks
 *   analytics  — getAnomalies, getCorrelations, getIndustryBenchmarks
 *   monitoring — getSystemHealth, getAgentStatuses, getLiveEvents
 *   insights   — getWorkforceProcess, getWorkforceProjection,
 *                getMaturityDimensions, getMaturityScore,
 *                getModelOptionsForAgent, getLongRangeProjection,
 *                getBuildVsProcesses, getBuildVsDecisionFactors,
 *                getHumanBaseline, getTeamMembers, getSkillsGap,
 *                getTrainingProgress, getTransformationStages
 */

// Default: re-export everything from mock-data.
// This provides all constants, types, interfaces, and synchronous functions.
export * from './mock-data'

// To use DB-backed functions in a specific page or component, import directly:
//
//   import { getProcessById } from '@/lib/data/processes'
//   import { PROCESSES } from '@/lib/data-source'  // constants stay here
//
// The DB functions are async and may require additional parameters (orgId).
// See lib/data/index.ts for the full barrel export.
