# Agent Quality Platform — Phase 2 Build Plan

> **Context**: Phase 1 (April 7 demo) is complete. 9 screens, 38 components, all working with seeded mock data.
> **Goal**: Build the remaining 6 screens + 5 features. Everything still uses seeded data — no live backends.
> **Principle**: Same as Phase 1 — nothing should feel like a demo. Every screen must feel finished.
> **Data**: Extend `lib/mock-data.ts` with new data. No database, no API calls.

---

## What We're Building

### 6 New Screens

| # | Screen | Route | Primary Role | Est. Hours |
|---|---|---|---|---|
| A2 | Occupation Selector | `/setup/occupation` | AI Lead | 3h |
| A3 | Agent-to-Task Mapper | `/setup/mapping` | AI Lead | 4h |
| B3 | Board Export | `/dashboard/export` | Admin/EA | 3h |
| C3 | Coverage Map | `/process/[id]/coverage` | Ops/AI Lead | 4h |
| C5 | Transformation Roadmap | `/process/[id]/roadmap` | COO/Ops | 5h |
| D3 | FMEA Risk Board | `/governance/fmea` | Quality/AI Lead | 4h |

### 5 Feature Enhancements

| # | Feature | Where | Est. Hours |
|---|---|---|---|
| F1 | SERVQUAL mode | C1, C4, Settings | 2h |
| F2 | Per-agent ROI breakdown | C1, D1 | 2h |
| F3 | Notification indicators | Sidebar, Dashboard | 1h |
| F4 | PDF report download | B3, D2 | 3h |
| F5 | Legacy cleanup | Types, mock-data | 1h |

**Total estimated: ~32 hours**

---

## Phase 2.0: Data Layer Extension

**Agent**: `data-layer-ext`
**Priority**: P0 — Complete before any new screen work
**Estimated effort**: 3 hours
**Dependencies**: None

### Task 2.0.1: Extend `types/telemetry.ts`

Add these new types:

```typescript
// ─── O*NET Occupation (for A2 search) ─────────────────────────
export interface OnetOccupation {
  code: string            // e.g. '13-2099.01'
  title: string           // e.g. 'Sports Betting Analyst'
  description: string     // 1-2 sentence description
  automationRisk: 'low' | 'medium' | 'high'
  taskCount: number       // number of tasks in O*NET
  medianWage: number      // BLS median hourly wage
  category: string        // e.g. 'Business and Financial Operations'
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
  confidence: 'high' | 'medium' | 'low'   // how confident the mapping is
  notes: string
}

// ─── FMEA Entry (for D3 risk board) ────────────────────────────
export interface FmeaEntry {
  id: string
  agentId: string
  agentName: string
  failureMode: string      // what can go wrong
  effect: string           // business impact
  cause: string            // root cause
  severity: number         // 1-10
  occurrence: number       // 1-10
  detection: number        // 1-10
  rpn: number              // severity × occurrence × detection
  recommendedAction: string
  status: 'open' | 'in-progress' | 'mitigated'
}

// ─── Transformation Stage (for C5 roadmap) ─────────────────────
export interface TransformationStage {
  id: string
  name: string             // e.g. 'Current State', 'Target State'
  sigmaTh: number          // sigma threshold for this stage
  agentCoverage: number    // % of tasks agent-owned at this stage
  collaborativeCoverage: number
  humanCoverage: number
  weeklyNetRoi: number
  tasksToMigrate: string[] // task names that move in this stage
  estimatedTimeline: string // e.g. '3-6 months'
}

// ─── Report Config (for B3 export) ──────────────────────────────
export interface ReportConfig {
  id: string
  name: string
  dateRange: string
  processes: string[]      // process IDs to include
  sections: string[]       // which sections to include
  generatedAt: string
  format: 'pdf' | 'pptx'
  status: 'ready' | 'generating'
  downloadUrl: string
}

// ─── SERVQUAL Dimension (for F1) ────────────────────────────────
export interface ServqualDimension {
  name: string             // Reliability, Responsiveness, Assurance, Empathy, Tangibles
  score: number            // 0-100
  weight: number           // contribution weight
  description: string
}
```

### Task 2.0.2: Extend `lib/mock-data.ts`

Add these new data exports:

#### O*NET Occupation Search Results (for A2)

```typescript
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
```

#### Coverage Map (for A3 — Sports Betting process)

```typescript
export const COVERAGE_MAP: CoverageMapEntry[] = [
  // Same 10 tasks from ONET_TASKS but enriched with confidence and notes
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
```

#### FMEA Data (for D3)

Generate 8-10 FMEA entries across all 3 sports betting agents. Examples:

```typescript
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
  // ... 4-6 more entries covering parse errors, cost overruns, hallucination risks
]
```

#### Transformation Roadmap (for C5)

```typescript
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
```

#### Report History (for B3)

```typescript
export const REPORT_HISTORY: ReportConfig[] = [
  { id: 'rpt-001', name: 'Q1 2026 Board Report', dateRange: 'Jan 1 - Mar 31, 2026', processes: ['sports-betting', 'customer-service'], sections: ['executive-summary', 'roi', 'sigma', 'audit'], generatedAt: '2026-03-30T14:00:00Z', format: 'pdf', status: 'ready', downloadUrl: '#' },
  { id: 'rpt-002', name: 'March Agent Performance', dateRange: 'Mar 1 - Mar 31, 2026', processes: ['sports-betting'], sections: ['sigma', 'defects', 'trends'], generatedAt: '2026-03-28T10:00:00Z', format: 'pdf', status: 'ready', downloadUrl: '#' },
  { id: 'rpt-003', name: 'Compliance Audit Export', dateRange: 'Mar 1 - Mar 31, 2026', processes: ['sports-betting'], sections: ['audit'], generatedAt: '2026-03-25T16:00:00Z', format: 'pdf', status: 'ready', downloadUrl: '#' },
]
```

#### SERVQUAL Dimensions (for F1)

```typescript
export const SERVQUAL_SCORES: Record<string, ServqualDimension[]> = {
  'sports-betting': [
    { name: 'Reliability', score: 82, weight: 0.30, description: 'Ability to deliver the promised service accurately' },
    { name: 'Responsiveness', score: 76, weight: 0.25, description: 'Willingness to help and provide prompt service' },
    { name: 'Assurance', score: 88, weight: 0.20, description: 'Knowledge and courtesy, ability to inspire trust' },
    { name: 'Empathy', score: 71, weight: 0.15, description: 'Caring, individualized attention to clients' },
    { name: 'Tangibles', score: 90, weight: 0.10, description: 'Physical facilities, equipment, and appearance' },
  ],
}
```

### Task 2.0.3: Remove Legacy Types

- Delete `Workflow`, `WorkflowSummary`, `SparklinePoint` from `types/telemetry.ts`
- Remove legacy snake_case fields from `Run` interface
- Remove legacy stubs (`WORKFLOWS`, old `generateRuns`, `computeSummary`, `generateSparkline`) from `lib/mock-data.ts`
- Fix any imports that break

### Task 2.0.4: Verify

- `npm run build` must pass
- All existing screens must still work

---

## Phase 2.1: Screen A2 — Occupation Selector (`/setup/occupation`)

**Agent**: `screen-a2`
**Priority**: P1
**Dependencies**: Phase 2.0
**Estimated effort**: 3 hours

### Purpose
User searches O*NET occupations, previews task lists, and selects which ones to track. This is the onboarding entry point — "tell us what job roles your agents are handling."

### Components to create:

1. **`components/setup/OccupationSearch.tsx`** — Search input with results dropdown
   - Text input with search icon
   - Filters `ONET_OCCUPATIONS` by keyword match on title/description/category
   - Shows results as cards with: title, O*NET code, category, task count, median wage, automation risk badge

2. **`components/setup/OccupationPreview.tsx`** — Selected occupation detail panel
   - Shows full task list (from `ONET_TASKS` for existing processes, or generate placeholder tasks for others)
   - Automation susceptibility distribution chart (Recharts bar chart — how many tasks are high/medium/low automation)
   - Wage and headcount input fields
   - "Add this process" button (adds to a selected list, shows toast)

3. **`components/setup/SelectedProcesses.tsx`** — List of processes user has selected
   - Shows the 2 already-configured processes (Sports Betting, Customer Service) as "active"
   - Shows any newly selected ones as "pending setup"
   - "Continue to mapping →" button

### Page layout (`app/(app)/setup/occupation/page.tsx`):
```
Header: "Add a Process" + "Search the O*NET database to find the job role your agents support"
Two-column: [OccupationSearch (left 40%)] [OccupationPreview (right 60%)]
SelectedProcesses (bottom, full width)
```

### Route addition:
Add `/setup/occupation` route. Add to sidebar under a new "SETUP" section (above Settings).

---

## Phase 2.2: Screen A3 — Agent-to-Task Mapper (`/setup/mapping`)

**Agent**: `screen-a3`
**Priority**: P1
**Dependencies**: Phase 2.0
**Estimated effort**: 4 hours

### Purpose
Drag-and-drop interface where the user maps which agents handle which O*NET tasks. The output is the coverage map — the foundation of all analytics.

### Components to create:

1. **`components/setup/TaskList.tsx`** — Unassigned task list (left column)
   - Lists all O*NET tasks for the selected process
   - Each task card shows: task name, time weight, automation score
   - Color-coded automation score bar (green = highly automatable, red = low)

2. **`components/setup/OwnershipColumns.tsx`** — Three drop zones
   - **Agent Owned** (teal) — drag tasks here, then select which agent handles it
   - **Collaborative** (amber) — agent assists, human decides
   - **Human Retained** (gray) — no agent involvement
   - Each zone shows total time weight % covered

3. **`components/setup/AgentAssigner.tsx`** — Agent selector dropdown
   - When a task is dropped into "Agent Owned", show a dropdown to pick which agent
   - Lists agents from the current process
   - Shows agent's current sigma score as context

4. **`components/setup/MappingSummary.tsx`** — Coverage summary footer
   - Horizontal bar showing Agent / Collaborative / Human split
   - Estimated weekly ROI impact
   - "Save mapping" button (shows toast)

### Implementation note:
Since we're not adding `@dnd-kit` or `react-beautiful-dnd` for a mock, implement the "drag-and-drop" as **click-to-assign** instead:
- Each task has 3 radio buttons: Agent | Collaborative | Human
- When "Agent" is selected, a dropdown appears to pick the agent
- This is simpler, still looks professional, and avoids a heavy dependency

### Page layout:
```
Header: "Map Agents to Tasks" + process name
Two-column: [TaskList with radio buttons (70%)] [MappingSummary (30%)]
```

Pre-populate with `COVERAGE_MAP` data so Sports Betting shows the existing mapping.

---

## Phase 2.3: Screen C3 — Coverage Map (`/process/[id]/coverage`)

**Agent**: `screen-c3`
**Priority**: P1
**Dependencies**: Phase 2.0
**Estimated effort**: 4 hours

### Purpose
Visual coverage map showing all O*NET tasks color-coded by owner. Click a task to see its Langfuse trace summary. This is the operational view of what the mapper produced.

### Components to create:

1. **`components/coverage/CoverageGrid.tsx`** — Color-coded task grid
   - All tasks in a grid layout (3-4 columns)
   - Each card: task name, time weight %, owner pill (Agent/Collaborative/Human)
   - Agent-owned cards show agent name + sigma score
   - Color: teal border for agent, amber for collaborative, gray for human
   - Click to expand detail panel

2. **`components/coverage/TaskDetailPanel.tsx`** — Slide-out or expandable detail
   - Task description, automation score, ownership rationale (from `COVERAGE_MAP.notes`)
   - If agent-owned: agent sigma score, DPMO, OEE, last 5 runs summary
   - If collaborative: override rate from audit log, avg review time
   - Confidence badge (high/medium/low)

3. **`components/coverage/CoverageSummaryBar.tsx`** — Top summary
   - Horizontal coverage bar (same as Labor Graph)
   - Key metrics: # agent tasks, # collaborative, # human, total automation score

### Page layout:
```
Header: "Coverage Map — {Process Name}"
CoverageSummaryBar (full width)
CoverageGrid (full width, 3-4 column grid)
TaskDetailPanel (slide-out on task click)
```

### Route:
`app/(app)/process/[id]/coverage/page.tsx`
Add "Coverage map" sub-item in sidebar under each process.

---

## Phase 2.4: Screen C5 — Transformation Roadmap (`/process/[id]/roadmap`)

**Agent**: `screen-c5`
**Priority**: P1
**Dependencies**: Phase 2.0
**Estimated effort**: 5 hours

### Purpose
Shows "what happens if agent quality improves." A maturity progression from current state to target state — which tasks migrate at each stage, and the ROI impact.

### Components to create:

1. **`components/roadmap/StageTimeline.tsx`** — Horizontal stage progression
   - 4 stages: Current → Near-term → Mid-term → Target
   - Each stage as a card on a horizontal timeline with connecting arrows
   - Active stage highlighted (current = filled, future = outlined)
   - Click a stage to see details below

2. **`components/roadmap/StageDetail.tsx`** — Selected stage detail
   - Coverage bar showing agent/collaborative/human split at that stage
   - Tasks that migrate in this stage (with directional arrows showing from→to)
   - ROI impact: "Net ROI increases from $X to $Y/week (+Z%)"
   - Estimated timeline
   - Sigma threshold required to reach this stage

3. **`components/roadmap/RoiProjectionChart.tsx`** — Recharts area chart
   - X-axis: stages (Current → Target)
   - Y-axis: weekly net ROI ($)
   - Filled area showing ROI growth
   - Annotation dots at each stage with $ value

4. **`components/roadmap/SigmaGapAnalysis.tsx`** — What needs to improve
   - Per-agent gap: "Recommendation Writer needs to go from 2.9σ → 4.0σ"
   - Per-agent action: "Reduce failure rate from 14 to < 4 per 36 runs"
   - Progress bars showing current vs target

### Page layout:
```
Header: "Transformation Roadmap — {Process Name}"
StageTimeline (full width, horizontal)
Two-column: [StageDetail (60%)] [SigmaGapAnalysis (40%)]
RoiProjectionChart (full width)
```

### Route:
`app/(app)/process/[id]/roadmap/page.tsx`
Add "Roadmap" sub-item in sidebar under each process.

---

## Phase 2.5: Screen D3 — FMEA Risk Board (`/governance/fmea`)

**Agent**: `screen-d3`
**Priority**: P1
**Dependencies**: Phase 2.0
**Estimated effort**: 4 hours

### Purpose
Failure Mode and Effects Analysis — structured risk assessment for each agent. Shows severity × occurrence × detection in a heatmap, with actionable recommendations.

### Components to create:

1. **`components/fmea/RiskHeatmap.tsx`** — Severity × Occurrence heatmap
   - Grid: severity (1-10 Y-axis) × occurrence (1-10 X-axis)
   - Each FMEA entry plotted as a dot, sized by RPN, colored by status
   - Quadrants labeled: Low/Medium/High/Critical risk zones
   - Click a dot to see detail

2. **`components/fmea/RiskTable.tsx`** — Full FMEA table
   - Columns: Agent, Failure Mode, Effect, Cause, S, O, D, RPN, Action, Status
   - Sortable by RPN (highest first by default)
   - Status pills: open (red), in-progress (amber), mitigated (green)
   - RPN color coding: > 200 red, > 100 amber, < 100 green

3. **`components/fmea/RiskSummary.tsx`** — Summary cards
   - Total risk items, Critical (RPN > 200), Open items, Mitigated items
   - Highest RPN agent callout

4. **`components/fmea/FmeaDetailModal.tsx`** — Detail view for selected entry
   - Full failure mode description, effect, cause
   - Recommended action with status
   - History timeline (mock: "Identified → Under review → Action assigned")

### Page layout:
```
Header: "FMEA Risk Board" + "ISO/IEC 42001 risk assessment"
RiskSummary (4-column cards)
Two-column: [RiskHeatmap (50%)] [RiskTable (50%)]
FmeaDetailModal (overlay on click)
```

### Route:
`app/(app)/governance/fmea/page.tsx`
Add "FMEA Risk Board" to sidebar under GOVERNANCE.

---

## Phase 2.6: Screen B3 — Board Export (`/dashboard/export`)

**Agent**: `screen-b3`
**Priority**: P2
**Dependencies**: Phase 2.0
**Estimated effort**: 3 hours

### Purpose
Configure and generate board-ready reports. Select which processes, date range, and sections to include. Shows previously generated reports for re-download.

### Components to create:

1. **`components/export/ExportConfigForm.tsx`** — Report configuration
   - Report name input
   - Date range picker (mock — two date inputs)
   - Process checkboxes (Sports Betting ✓, Customer Service ✓)
   - Section checkboxes: Executive Summary, ROI Analysis, Sigma Scores, Audit Trail, Labor Analysis, FMEA Summary
   - Format toggle: PDF | PPTX
   - "Generate Report" button → shows toast "Report generated", adds to history

2. **`components/export/ReportHistory.tsx`** — Previous reports list
   - Table: Report name, Date range, Processes, Format, Generated at, Download button
   - Pre-populated with `REPORT_HISTORY`
   - Download button shows toast "Download started" (no-op)

3. **`components/export/ReportPreview.tsx`** — Preview pane
   - Shows a styled preview of what the report would contain
   - Sections match the selected checkboxes
   - Uses data from existing screens (dashboard metrics, sigma scores, ROI waterfall, audit summary)

### Page layout:
```
Header: "Board Report Export"
Two-column: [ExportConfigForm (40%)] [ReportPreview (60%)]
ReportHistory (full width, below)
```

### Route:
`app/(app)/dashboard/export/page.tsx`
Add "Board Export" to sidebar under OVERVIEW.

---

## Phase 2.7: Feature Enhancements

**Agent**: `feature-enhancements`
**Priority**: P2
**Dependencies**: Phase 2.0
**Estimated effort**: 6 hours total

### F1: SERVQUAL Mode (2h)

When `ORGANISATION.qualityFramework === 'servqual'`, screens should show SERVQUAL vocabulary instead of OEE. For the mock, add a toggle in Settings and implement the vocabulary switch.

**Changes**:
- **C4 Sigma Scorecard**: Replace OEE bar with 5 SERVQUAL dimensions (Reliability, Responsiveness, Assurance, Empathy, Tangibles) as a radar chart or stacked bar
- **C1 Symmetry Dashboard**: Replace "OEE: 83%" with "Service Quality: 82%" (weighted average of SERVQUAL)
- **Settings**: Add toggle between OEE and SERVQUAL under Quality Framework

**Implementation**: Add `useOrganisation()` hook that reads from mock data. Components check `qualityFramework` and render the appropriate visualization.

### F2: Per-Agent ROI Breakdown (2h)

**Changes**:
- **C1 Symmetry Dashboard**: Add a small breakdown under agent column showing per-agent ROI contribution
- **D1 Agent Telemetry**: Enhance the Process Context panel with ROI contribution as a bar chart across agents

**Data**: Derive from `ROI_SNAPSHOTS.grossSavingWeekly` proportioned by each agent's task time weights.

### F3: Notification Indicators (1h)

**Changes**:
- **Sidebar**: Add a red badge count next to "Governance" if override rate > 20%
- **Sidebar**: Add an amber dot next to agents below sigma target
- **Dashboard**: Add a notification bell icon in TopBar with dropdown showing 3 recent alerts (seeded)

### F4: PDF Report Download (3h)

Use the browser's `window.print()` with print-specific CSS as a simple PDF solution (no library needed).

**Changes**:
- **B3 Board Export**: "Generate Report" opens a print-optimized view in a new tab
- **D2 Audit Log**: "Export for audit (PDF)" opens print-optimized audit table
- Add `@media print` styles to `globals.css` (hide sidebar, topbar, adjust layout)

---

## Phase 2.8: Sidebar & Navigation Updates

**Agent**: Part of each screen agent's work
**Priority**: P0 — must update as screens are added

### Updated Sidebar Structure:

```
OVERVIEW
  Dashboard                → /dashboard
  ROI Calculator           → /dashboard/roi
  Board Export             → /dashboard/export         ← NEW

PROCESSES
  Sports Betting Analyst   → /process/sports-betting
    Labor graph            → /process/sports-betting/labor
    Sigma scorecard        → /process/sports-betting/sigma
    Coverage map           → /process/sports-betting/coverage   ← NEW
    Roadmap                → /process/sports-betting/roadmap    ← NEW
  Customer Service Rep     → /process/customer-service
    Sigma scorecard        → /process/customer-service/sigma
    Coverage map           → /process/customer-service/coverage ← NEW
    Roadmap                → /process/customer-service/roadmap  ← NEW

AGENTS
  Odds Analysis Agent      → /agents/odds-analysis     [green dot]
  Line Comparison Agent    → /agents/line-comparison    [amber dot]
  Recommendation Writer    → /agents/recommendation-writer [red dot] [!]
  Customer Response Agent  → /agents/customer-response  [amber dot]

GOVERNANCE
  Audit log                → /governance/audit          [badge: 27%]
  FMEA Risk Board          → /governance/fmea           ← NEW

SETUP                                                   ← NEW section
  Occupation selector      → /setup/occupation
  Agent-task mapping       → /setup/mapping

SETTINGS                   → /settings
```

---

## Build Order & Agent Team Coordination

### Sequential (Foundations)
```
Phase 2.0 — Data layer extension (must complete first)
```

### Parallel (Screens — all can run simultaneously after 2.0)
```
Phase 2.1 — A2 Occupation Selector       (screen-a2 agent)
Phase 2.2 — A3 Agent-to-Task Mapper      (screen-a3 agent)
Phase 2.3 — C3 Coverage Map              (screen-c3 agent)
Phase 2.4 — C5 Transformation Roadmap    (screen-c5 agent)
Phase 2.5 — D3 FMEA Risk Board           (screen-d3 agent)
Phase 2.6 — B3 Board Export              (screen-b3 agent)
```

### Sequential (After screens complete)
```
Phase 2.7 — Feature enhancements (F1-F5)
Phase 2.8 — Sidebar updates + integration test
```

---

## File Inventory — New Files

### New Routes
```
app/(app)/setup/occupation/page.tsx        ← A2
app/(app)/setup/mapping/page.tsx           ← A3
app/(app)/dashboard/export/page.tsx        ← B3
app/(app)/process/[id]/coverage/page.tsx   ← C3
app/(app)/process/[id]/roadmap/page.tsx    ← C5
app/(app)/governance/fmea/page.tsx         ← D3
```

### New Components
```
components/setup/OccupationSearch.tsx       ← A2
components/setup/OccupationPreview.tsx      ← A2
components/setup/SelectedProcesses.tsx      ← A2
components/setup/TaskList.tsx               ← A3
components/setup/OwnershipColumns.tsx       ← A3
components/setup/AgentAssigner.tsx          ← A3
components/setup/MappingSummary.tsx         ← A3

components/coverage/CoverageGrid.tsx        ← C3
components/coverage/TaskDetailPanel.tsx     ← C3
components/coverage/CoverageSummaryBar.tsx  ← C3

components/roadmap/StageTimeline.tsx        ← C5
components/roadmap/StageDetail.tsx          ← C5
components/roadmap/RoiProjectionChart.tsx   ← C5
components/roadmap/SigmaGapAnalysis.tsx     ← C5

components/fmea/RiskHeatmap.tsx             ← D3
components/fmea/RiskTable.tsx               ← D3
components/fmea/RiskSummary.tsx             ← D3
components/fmea/FmeaDetailModal.tsx         ← D3

components/export/ExportConfigForm.tsx      ← B3
components/export/ReportHistory.tsx         ← B3
components/export/ReportPreview.tsx         ← B3
```

### Files to Modify
```
lib/mock-data.ts                           ← Add new data exports
types/telemetry.ts                         ← Add new types, remove legacy
components/layout/Sidebar.tsx              ← Add new nav items
app/globals.css                            ← Add print styles
```

---

## Agent Team Rules (Same as Phase 1)

1. **Phase 2.0 is sequential** — no screen work starts until it's merged
2. **Phases 2.1-2.6 can run in parallel** — each agent works in its own component directory
3. **All agents import from `lib/mock-data.ts`** — never create local mock data
4. **All agents use the existing design system** — same card styles, colors, spacing from globals.css
5. **No agent creates loading spinners, placeholder text, or "coming soon" states**
6. **Every agent must run `npm run build` before marking their phase complete**
7. **Recharts is the ONLY chart library**
8. **Sidebar updates happen in Phase 2.8** after all screens are built

---

## Success Criteria

After Phase 2:
- **15 screens total** (9 from Phase 1 + 6 new)
- **~60 components**
- All data still seeded and internally consistent
- Every screen navigable from the sidebar
- SERVQUAL toggle works alongside OEE
- Transformation roadmap tells a compelling "what's next" story
- FMEA risk board gives quality teams actionable data
- Board export feels like a real reporting feature
- Coverage map connects the agent-task mapping to live performance data

The architecture remains ready for live data — swap `lib/mock-data.ts` for API calls and the entire app works with real backends.
