# Agent Quality & Process ROI Platform — April 7 Build Plan

> **Target**: High-fidelity mock deployed on Vercel. Every screen must feel like a real, shipped product.
> **Deadline**: April 7, 2026
> **Approach**: All data from `lib/mock-data.ts`. No backend, no API calls, no database. Seeded and static.

---

## Build Phases & Agent Assignments

Each phase is a self-contained unit of work. Phases 1-2 are sequential (foundations). Phases 3-9 can be parallelized across agent teams once Phase 2 is deployed. Phase 10 is a final sequential pass.

---

## Phase 1: Mock Data Layer

**Agent**: `data-architect`
**Priority**: P0 — MUST complete before any screen work begins
**Estimated effort**: 2-3 hours
**Output**: `lib/mock-data.ts` (single file, all seeded data)

### Task 1.1: Rewrite `lib/mock-data.ts`

Replace the current mock data entirely. The new file must contain ALL data for the entire application. Every component reads from this one file.

#### Organisation

```typescript
export const ORGANISATION = {
  name: 'FuzeBox AI',
  industry: 'Gaming / Sports Betting',
  qualityFramework: 'oee' as const,  // 'oee' | 'servqual'
  sigmaTarget: 4.0,
  langfuse: { status: 'connected', host: 'cloud.langfuse.com', project: 'vipplay-production', lastSync: '2026-03-30T19:52:00Z' },
  onet: { status: 'registered', host: 'onetcenter.org', lastRefresh: '2026-03-28T00:00:00Z' },
}
```

#### Processes (2)

```typescript
export const PROCESSES = [
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
    status: 'green' as const,
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
    status: 'amber' as const,
    weeklyNetRoi: 612,
    weeklyGrossSaving: 896,
    agents: ['customer-response'],
  },
]
```

#### Agents (3 for Sports Betting + 1 basic for Customer Service)

Each agent must include:
- `id`, `name`, `processId`, `model`, `framework`
- `status`: `'green' | 'amber' | 'red'`
- `sigmaScore`, `sigmaTrend` (`'up' | 'flat' | 'down'`), `sigmaPrev` (30 days ago value)
- `dpmo`, `oee`, `successRate`, `p95LatencyMs`, `avgCostPerRun`
- `totalRuns`, `defects: { failures, latencyBreaches, costOverruns }`
- `tasks`: array of task names this agent handles

Full agent data from the prompt:
- **Odds Analysis**: 4.2σ ↑ (was 3.8), DPMO 2776, OEE 83%, 88% success, $0.0252/run, 50 runs, GREEN
- **Line Comparison**: 3.4σ → (flat), DPMO 22750, OEE 71%, 74% success, $0.0188/run, 43 runs, AMBER
- **Recommendation Writer**: 2.9σ ↓ (was 3.1), DPMO 67210, OEE 58%, 61% success, $0.0091/run, 36 runs, RED
- **Customer Response** (basic): 3.2σ →, AMBER, enough data for sidebar + basic C1/C4

#### O*NET Task List (Sports Betting Analyst — 10 tasks)

```typescript
export const ONET_TASKS = [
  { id: 't1', task: 'Analyse betting line movements', timeWeight: 0.18, automationScore: 0.89, ownership: 'agent', agentName: 'Odds Analysis Agent' },
  { id: 't2', task: 'Compare competitor odds across platforms', timeWeight: 0.14, automationScore: 0.92, ownership: 'agent', agentName: 'Line Comparison Agent' },
  { id: 't3', task: 'Generate client recommendations', timeWeight: 0.11, automationScore: 0.71, ownership: 'agent', agentName: 'Recommendation Writer Agent' },
  { id: 't4', task: 'Review and approve automated recommendations', timeWeight: 0.12, automationScore: 0.31, ownership: 'collaborative', agentName: null },
  { id: 't5', task: 'Escalate unusual market movements', timeWeight: 0.08, automationScore: 0.28, ownership: 'collaborative', agentName: null },
  { id: 't6', task: 'Maintain client relationship context', timeWeight: 0.09, automationScore: 0.18, ownership: 'human', agentName: null },
  { id: 't7', task: 'Regulatory compliance review', timeWeight: 0.07, automationScore: 0.22, ownership: 'human', agentName: null },
  { id: 't8', task: 'Handle client disputes and complaints', timeWeight: 0.06, automationScore: 0.15, ownership: 'human', agentName: null },
  { id: 't9', task: 'Team briefings and knowledge sharing', timeWeight: 0.05, automationScore: 0.11, ownership: 'human', agentName: null },
  { id: 't10', task: 'Emergency market intervention decisions', timeWeight: 0.10, automationScore: 0.09, ownership: 'human', agentName: null },
]
```

#### ROI Snapshot

```typescript
export const ROI_SNAPSHOT = {
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
  manualCostPerTask: 50, // default slider value
}
```

#### 30-Day Sigma Trend (daily data points for charts)

Generate 30 data points per agent:
- **Odds Analysis**: Linear interpolation from 3.8 to 4.2 with ±0.05 noise
- **Line Comparison**: Flat around 3.4 with ±0.08 noise
- **Recommendation Writer**: Linear interpolation from 3.1 to 2.9 with ±0.04 noise

Each point: `{ day: number, date: string, sigma: number, dpmo: number }`

Use sigma-to-DPMO lookup: `dpmo = 10^((sigma - 0.8406) / 0.2985)` (approximation) or hardcode the standard table.

#### Run History (50 runs for Odds Analysis Agent)

Generate 50 runs with realistic timestamps (every 2-4 hours during business hours over 30 days). Each run:

```typescript
{
  runId: string,         // 'ODDS-0001' format
  timestamp: string,     // ISO string, business hours
  durationMs: number,    // 800-4200ms range
  outcome: boolean,      // 42/50 success (88%)
  totalCost: number,     // ~$0.02-0.03
  tokenCount: number,    // 1200-2800
  toolCalls: number,     // 3-7
  spans: Span[],         // 3 spans per run
}
```

Span names must be: `OddsScraperAgent`, `LineComparisonAgent`, `RecommendationWriterAgent`

#### Audit Log (15 entries)

```typescript
export const AUDIT_LOG = [
  {
    id: 'aud-001',
    timestamp: '2026-03-30T19:50:00Z',
    processName: 'Sports Betting Analyst',
    task: 'Review automated recommendations',
    agentRecommendation: 'Lay bet on Man Utd -1.5 at odds 2.40',
    humanDecision: 'Approved as recommended',
    reviewer: 'Marcus Webb',
    decisionType: 'approved' as const,
    durationMinutes: 3,
  },
  // ... 14 more entries
  // Mix: 9 APPROVED, 4 OVERRIDDEN, 2 ESCALATED
  // Reviewers: Marcus Webb, Priya Sharma, James Okello
  // Override reasons must be realistic:
  //   "Changed to lay bet based on injury news not yet reflected in odds"
  //   "Escalated to senior — unusual volume spike on Asian handicap market"
]
```

#### Sigma Translation Table (reference constant)

```typescript
export const SIGMA_LEVELS = [
  { sigma: 1, dpmo: 691462, label: 'Unreliable — do not deploy', shortLabel: 'Unreliable' },
  { sigma: 2, dpmo: 308538, label: 'High risk — human gate mandatory', shortLabel: 'High risk' },
  { sigma: 3, dpmo: 66807, label: 'Needs tuning — supervised use only', shortLabel: 'Needs gate' },
  { sigma: 4, dpmo: 6210, label: 'Supervised production — monitor closely', shortLabel: 'Supervised' },
  { sigma: 5, dpmo: 233, label: 'Production ready — standard monitoring', shortLabel: 'Prod. ready' },
  { sigma: 6, dpmo: 3.4, label: 'Autonomous — minimal human oversight', shortLabel: 'World class' },
]
```

#### Language Mode Vocabulary Map

```typescript
export const LANGUAGE_MODES = {
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
```

### Task 1.2: Rewrite `lib/verdict-logic.ts`

Update verdict config for the new color system:
- GREEN: `#1D9E75` (not the old `#059669`)
- AMBER: `#BA7517` (not the old `#D97706`)
- RED: `#E24B4A` (not the old `#DC2626`)
- Accent blue: `#378ADD`
- Card border: `#E8E6E0`

### Task 1.3: Update `types/telemetry.ts`

Add new types to match the expanded data model:
- `Organisation`, `Process`, `Agent`, `OnetTask`, `RoiSnapshot`
- `AuditLogEntry`, `SigmaTrendPoint`, `SigmaLevel`
- `LanguageMode = 'operations' | 'quality'`
- Keep existing `Verdict`, `Run`, `Span`, `WorkflowSummary` types but update as needed

### Task 1.4: Numerical Consistency Verification

**CRITICAL**: Before marking Phase 1 complete, verify:
- [ ] ROI waterfall adds up: 2116 - 483 - 38 - 169 = 1426 ✓
- [ ] Agent coverage: 18% + 14% + 11% = 43% ✓
- [ ] Collaborative: 12% + 8% = 20% ✓
- [ ] Human retained: 9% + 7% + 6% + 5% + 10% = 37% ✓
- [ ] Total: 43% + 20% + 37% = 100% ✓
- [ ] All time weights sum to 1.0
- [ ] Sigma scores match DPMO values (use lookup table)
- [ ] Agent success rates match defect counts vs total runs
- [ ] Cost per run × total runs ≈ weekly agent cost

---

## Phase 2: App Shell & Routing

**Agent**: `shell-architect`
**Priority**: P0 — MUST complete before screen work begins
**Estimated effort**: 3-4 hours
**Dependencies**: Phase 1 (mock data)

### Task 2.1: Update `app/globals.css`

Replace the current design tokens with the new color system:

```css
:root {
  --sidebar-bg: #0f1117;
  --sidebar-text: #94A3B8;
  --sidebar-active: #378ADD;
  --content-bg: #FFFFFF;
  --surface: #F8F9FA;
  --border: #E8E6E0;
  --text-primary: #1A1A2E;
  --text-secondary: #6B7280;
  --text-muted: #9CA3AF;
  --status-green: #1D9E75;
  --status-green-bg: #ECFDF5;
  --status-amber: #BA7517;
  --status-amber-bg: #FFF8EB;
  --status-red: #E24B4A;
  --status-red-bg: #FEF2F2;
  --accent-blue: #378ADD;
  --accent-blue-bg: #EFF6FF;
}
```

Keep existing animations (`.animate-fade-up`, `.status-dot-*`, `.span-bar`). Update `@theme inline` block to match.

### Task 2.2: Create Language Mode Context

Create `hooks/useLanguageMode.ts`:

```typescript
'use client'
import { createContext, useContext, useState } from 'react'

type LanguageMode = 'operations' | 'quality'

const LanguageModeContext = createContext<{
  mode: LanguageMode
  setMode: (mode: LanguageMode) => void
}>({ mode: 'operations', setMode: () => {} })

export function LanguageModeProvider({ children }) { ... }
export function useLanguageMode() { return useContext(LanguageModeContext) }
```

### Task 2.3: Create New Route Structure

Delete existing pages. Create new route structure:

```
app/
├── layout.tsx              ← Root layout (fonts, LanguageModeProvider, Toaster)
├── page.tsx                ← redirect('/dashboard')
├── login/page.tsx          ← Static login page
├── dashboard/
│   ├── layout.tsx          ← Shared shell (Sidebar + TopBar + content area)
│   ├── page.tsx            ← B1 Executive Portfolio
│   └── roi/page.tsx        ← B2 ROI Calculator
├── process/
│   └── [id]/
│       ├── page.tsx        ← C1 Symmetry Dashboard
│       ├── labor/page.tsx  ← C2 Labor Graph
│       └── sigma/page.tsx  ← C4 Sigma Scorecard
├── agents/
│   └── [id]/page.tsx       ← D1 Agent Telemetry
├── governance/
│   └── audit/page.tsx      ← D2 Audit Log
└── settings/page.tsx       ← A1 Settings
```

### Task 2.4: Create Dashboard Layout (`app/dashboard/layout.tsx`)

This layout wraps ALL screens (not just `/dashboard` — ALL routes should use it). Consider making it `app/(app)/layout.tsx` as a route group.

**Revised route structure using route group**:

```
app/
├── layout.tsx              ← Root (fonts, providers)
├── page.tsx                ← redirect('/dashboard')
├── login/page.tsx          ← Outside app shell (no sidebar)
└── (app)/
    ├── layout.tsx          ← App shell: Sidebar + TopBar + content area
    ├── dashboard/
    │   ├── page.tsx        ← B1
    │   └── roi/page.tsx    ← B2
    ├── process/
    │   └── [id]/
    │       ├── page.tsx    ← C1
    │       ├── labor/page.tsx ← C2
    │       └── sigma/page.tsx ← C4
    ├── agents/
    │   └── [id]/page.tsx   ← D1
    ├── governance/
    │   └── audit/page.tsx  ← D2
    └── settings/page.tsx   ← A1
```

The `(app)/layout.tsx` provides:
- Fixed sidebar (left, ~260px)
- TopBar with language mode toggle (right-aligned)
- Main content area with padding

### Task 2.5: Rebuild Sidebar (`components/layout/Sidebar.tsx`)

Complete rewrite. New navigation structure:

```
Logo: "r-Potential" + subtitle "Powered by FuzeBox"
Background: #0f1117

OVERVIEW
  Dashboard                → /dashboard
  ROI Calculator           → /dashboard/roi

PROCESSES (collapsible sections)
  Sports Betting Analyst   → /process/sports-betting
    Labor graph            → /process/sports-betting/labor
    Sigma scorecard        → /process/sports-betting/sigma
  Customer Service Rep     → /process/customer-service
    Sigma scorecard        → /process/customer-service/sigma

AGENTS
  Odds Analysis Agent      → /agents/odds-analysis     [green dot]
  Line Comparison Agent    → /agents/line-comparison    [amber dot]
  Recommendation Writer    → /agents/recommendation-writer [red dot]

GOVERNANCE
  Audit log                → /governance/audit

SETTINGS                   → /settings
```

Active state: accent blue (`#378ADD`) text + left border indicator.
Status dots next to agent names showing their current status color.
Process sub-items indented with a subtle left line.

### Task 2.6: Rebuild TopBar (`components/layout/TopBar.tsx`)

- Left: Breadcrumb based on current route (e.g., "Processes > Sports Betting Analyst > Sigma Scorecard")
- Right: Language mode toggle (`Operations | Quality` segmented control), user avatar placeholder

### Task 2.7: Create Login Page (`app/login/page.tsx`)

Static login page. No auth logic. Just:
- Centered card with logo
- Email + password fields (non-functional)
- "Sign in" button that navigates to `/dashboard`
- Looks real but does nothing

### Task 2.8: Deploy & Verify Shell

- `npm run build` — verify no errors
- Deploy to Vercel
- Verify all routes render with sidebar
- Verify language mode toggle updates context
- Verify sidebar navigation highlights correct item

---

## Phase 3: Screen B1 — Executive Portfolio (`/dashboard`)

**Agent**: `screen-b1`
**Priority**: P1
**Dependencies**: Phase 1, Phase 2
**Estimated effort**: 3 hours

### Components to build:
- `components/dashboard/MetricCards.tsx` — 4 top-level metric cards
- `components/dashboard/ProcessCard.tsx` — Full-width process summary card
- `components/dashboard/InsightCards.tsx` — 3 bottom insight cards

### Layout:

**Top row**: 4 metric cards in a grid
```
Processes monitored: 2 | Healthy processes: 1 | Weekly net ROI: $1,426 | Agents needing attention: 2
```

**Middle**: Process cards (full-width, one per process)
- Status pill (GREEN/AMBER/RED)
- Process name + O*NET code
- Summary line: "Performing well · 3 agents · 43% automated"
- ROI quote: "Saving $1,426/week after all costs"
- Link: "View process details →"

**Bottom**: 3 insight cards
- Blue card: Total savings across all processes
- Green card: Best performing process
- Amber card: Agent needing attention (Recommendation Writer)

### Design notes:
- Language mode toggle has NO effect on this screen — always plain English
- GREEN pill = `#1D9E75` bg, AMBER = `#BA7517`, RED = `#E24B4A`
- Cards have `border: 1px solid var(--border)`, `border-radius: 12px`, subtle shadow
- Process cards clickable → navigate to `/process/{id}`

---

## Phase 4: Screen C4 — Sigma Scorecard (`/process/[id]/sigma`)

**Agent**: `screen-c4`
**Priority**: P1
**Dependencies**: Phase 1, Phase 2
**Estimated effort**: 4 hours

### Components to build:
- `components/sigma/AgentSigmaCard.tsx` — Per-agent sigma score card
- `components/sigma/SigmaLegend.tsx` — Translation legend (1σ through 6σ)
- `components/sigma/DpmoTrendChart.tsx` — 30-day DPMO trend (Recharts LineChart)

### Agent Score Cards (3 side-by-side):

Each card shows BOTH language modes — content switches based on toggle:

**Operations mode visible**:
- Status label: "Performing well" / "Needs attention" / "Requires action"
- "Reliable X% of the time"

**Quality mode visible**:
- Sigma score with trend arrow: "4.2σ ↑" / "3.4σ →" / "2.9σ ↓"
- "DPMO: X,XXX"

**Always visible (both modes)**:
- OEE bar: colored progress bar with percentage
- Defect breakdown: failures, latency breaches, cost overruns
- Bullet (●) next to the highest defect category

### Sigma Translation Legend — NON-NEGOTIABLE:

Horizontal scale from 1σ to 6σ with:
- Labels at each level
- DPMO values below
- Markers showing where each agent sits
- Target line at 4.0σ
- Must be visually clear to a non-Six Sigma person

### 30-Day DPMO Trend Chart (Recharts):
- 3 lines (one per agent, colored by status)
- Y-axis: DPMO (lower = better, log scale or linear)
- X-axis: last 30 days
- Horizontal reference line at DPMO 6,210 (= 4.0σ target)
- Recommendation Writer trending UP (worse)
- Odds Analysis trending DOWN (better)

### Language mode effects:
- Card headers switch between plain English and sigma values
- Legend stays the same (always shows both)
- Chart stays the same (DPMO is the universal metric)

---

## Phase 5: Screen C1 — Symmetry Dashboard (`/process/[id]`)

**Agent**: `screen-c1`
**Priority**: P0 (HERO SCREEN — spend the most time here)
**Dependencies**: Phase 1, Phase 2
**Estimated effort**: 5-6 hours

### Components to build:
- `components/symmetry/AgentColumn.tsx` — Left column (what AI handles)
- `components/symmetry/EquationCenter.tsx` — Center column (the equation)
- `components/symmetry/HumanColumn.tsx` — Right column (what humans own)
- `components/symmetry/RoiWaterfall.tsx` — Condensed waterfall below columns

### Three-Column Layout:

**LEFT — "What AI is handling"**:
- Coverage: 43%
- Quality metric (language-mode dependent):
  - Operations: "Avg quality: 88%"
  - Quality: "4.2σ average"
- Weekly cost: $38
- Top agent tasks (list)

**CENTER — The Symmetry Equation**:
This is the visual centrepiece. Styled cards stacked vertically:

```
┌─────────────────────┐
│   Agent 43%         │
│   × quality 83%     │  ← teal/green card
├─────────────────────┤
│        +            │
├─────────────────────┤
│   Human 37%         │
│   × productivity    │  ← gray card
├─────────────────────┤
│        =            │
├─────────────────────┤
│   TOTAL ROI         │
│   $1,426/week       │  ← large, accent blue card
│   after all costs   │
└─────────────────────┘
```

The NET ROI number must be large, prominent, and unmissable.

**RIGHT — "What your team still owns"**:
- Coverage: 37%
- Hours freed: 14hrs/wk/person
- Oversight added: 5hrs/wk/person
- Net hours saved: 9hrs/wk/person
- Top retained tasks (list)
- New skills needed (list)

### ROI Waterfall (below columns):
Condensed horizontal: `Gross $2,116 → -$483 oversight → -$38 inference → -$169 governance = Net $1,426`

### Language mode effects:
- Left column quality metric switches
- Center equation labels switch
- Right column unchanged

### Design notes:
- This must be the most polished screen
- Responsive: 3 columns on desktop, stacked on narrow screens
- Equation center column should have visual weight — slightly larger, perhaps with a subtle background
- The NET ROI number should use the accent blue and be the largest text on screen

---

## Phase 6: Screen C2 — Labor Graph (`/process/[id]/labor`)

**Agent**: `screen-c2`
**Priority**: P1
**Dependencies**: Phase 1, Phase 2
**Estimated effort**: 3 hours

### Components to build:
- `components/labor/CoverageBar.tsx` — Horizontal coverage split bar
- `components/labor/TaskBoard.tsx` — Three-column task board
- `components/labor/SkillsPanel.tsx` — Before/after skills comparison

### Layout:

**Header**: Process name, O*NET code, headcount, hours, wage

**Coverage bar**: Full-width horizontal bar split into 3 colored sections:
- Teal (43% Agent) | Amber (20% Collaborative) | Gray (37% Human)

**Task board**: Three columns
- **Agent Owned** (teal accent): 3 tasks with time weight bars
- **Collaborative** (amber accent): 2 tasks with time weight bars
- **Human Retained** (gray): 5 tasks with time weight bars

Each task shows: task name, "X% of role", proportional bar

**Skills panel**: Two-column comparison
- Left: "Skills the role used to require"
- Right: "New skills the role now requires"
- Some skills marked "[unchanged]"

---

## Phase 7: Screen D1 — Agent Telemetry (`/agents/[id]`)

**Agent**: `screen-d1`
**Priority**: P1
**Dependencies**: Phase 1, Phase 2
**Estimated effort**: 3-4 hours

### Components to build:
- `components/telemetry/AgentHeader.tsx` — Status, name, model, key metrics
- `components/telemetry/MetricsBar.tsx` — 4 key metrics row
- `components/telemetry/SigmaContext.tsx` — Process context panel
- `components/telemetry/RunHistory.tsx` — Run list with expandable span tree
- `components/telemetry/DefectAnalysis.tsx` — Defect breakdown panel

### Design note:
This screen should match the existing `agenttelemetry.vercel.app` aesthetic. Port the existing VerdictCard, StatBanner, and RecentRuns patterns but update with new data and add the Sigma Context and Defect Analysis sections.

### Run History:
- List of runs with: run ID, timestamp, duration, status icon
- Expandable rows showing span tree (3 spans per run)
- Span tree with timeline bars (reuse existing `.span-bar` animation)

### Defect Analysis:
- Breakdown by type: failures, latency breaches, cost overruns
- Each type shows count, % of DPMO contribution
- Sub-items with specific failure reasons

### Agent routing:
- `/agents/odds-analysis` — Odds Analysis Agent (GREEN, full data)
- `/agents/line-comparison` — Line Comparison Agent (AMBER)
- `/agents/recommendation-writer` — Recommendation Writer Agent (RED)

Match agent ID from URL params to `AGENTS` array in mock data.

---

## Phase 8: Screen D2 — Audit Log (`/governance/audit`)

**Agent**: `screen-d2`
**Priority**: P1
**Dependencies**: Phase 1, Phase 2
**Estimated effort**: 2-3 hours

### Components to build:
- `components/governance/AuditSummary.tsx` — Summary metric cards
- `components/governance/AuditAlert.tsx` — High override rate warning
- `components/governance/AuditTable.tsx` — Full audit log table
- `components/governance/AuditFilters.tsx` — Filter bar

### Layout:

**Header**: "Human Oversight Audit Log" + "ISO/IEC 42001 compliance record · EU AI Act Article 14"
- Compliance percentage: "93% of collaborative decisions have a human audit trail"
- Export button: "Export for audit (PDF)" (no-op)

**Summary cards**: Total decisions: 15, Override rate: 27%, Avg review time: 4.2 min, Compliance: 93%

**Alert callout** (amber): High override rate warning for Recommendation Writer tasks

**Audit table**: Full 15-entry table with columns:
- Date/Time, Process, Task, Agent recommendation, Human decision, Reviewer, Decision type (pill), Duration

**Filter bar**: Date range, process selector, decision type dropdown (non-functional but present)

Decision type pills: APPROVED = green, OVERRIDDEN = amber, ESCALATED = red

---

## Phase 9: Screens B2 & A1 — ROI Calculator & Settings

**Agent**: `screen-b2-a1`
**Priority**: P2
**Dependencies**: Phase 1, Phase 2
**Estimated effort**: 3-4 hours

### B2 — ROI Calculator (`/dashboard/roi`)

#### Components:
- `components/roi/CostSlider.tsx` — Manual cost assumption slider
- `components/roi/RoiSummaryCards.tsx` — 4 summary cards (update with slider)
- `components/roi/WaterfallChart.tsx` — ROI waterfall (Recharts)
- `components/roi/ProcessComparison.tsx` — Comparison table
- `components/roi/HonestNote.tsx` — Honest ROI callout

#### Slider behavior:
- Range: $5 to $500, default $50
- Updates summary cards and waterfall chart in real-time
- Client-side recompute: `grossSaving = manualCost × tasksPerWeek`
- `tasksPerWeek` derived from agent run counts

#### Waterfall chart (Recharts):
- Teal bars for savings, coral/red bars for costs, accent blue for net
- Each bar labeled with $ amount
- One waterfall per process, side by side

### A1 — Settings (`/settings`)

#### Components:
- `components/settings/SettingsForm.tsx` — All settings in one form

#### Layout:
- Organisation settings (name, industry, framework, sigma target slider)
- Agent telemetry connection (Langfuse status, project, last sync)
- O*NET configuration (account status, last refresh)
- Language preference (default mode toggle)
- Notification thresholds (sigma alert level, ROI alert)

All fields appear editable. Save button exists but is a no-op (toast: "Settings saved").

---

## Phase 10: Polish Pass

**Agent**: `polish-agent`
**Priority**: P0 — MUST run before delivery
**Dependencies**: ALL phases complete
**Estimated effort**: 3-4 hours

### Task 10.1: Numerical Cross-Check

Verify across ALL screens:
- [ ] B1 dashboard ROI matches C1 symmetry equation
- [ ] B1 "agents needing attention" count matches agents with sigma < 3.5
- [ ] B2 waterfall math is correct at default $50 slider value
- [ ] C1 coverage percentages match C2 task board
- [ ] C4 sigma scores match D1 agent telemetry
- [ ] D1 defect counts match C4 defect breakdown
- [ ] D2 override rate matches actual audit log data (4/15 = 26.7% ≈ 27%)

### Task 10.2: Language Mode Verification

Toggle between Operations and Quality on every screen and verify:
- [ ] C1 (Symmetry): quality metric switches
- [ ] C4 (Sigma): card headers switch, legend stays
- [ ] D1 (Telemetry): sigma context switches
- [ ] B1 (Dashboard): NO change (always plain English)
- [ ] D2 (Audit): NO change

### Task 10.3: Navigation Consistency

- [ ] Every sidebar link navigates correctly
- [ ] Active state highlights correctly on all routes including nested
- [ ] Breadcrumbs update correctly in TopBar
- [ ] Process cards on B1 link to correct `/process/{id}`
- [ ] "View agent" links navigate to correct `/agents/{id}`

### Task 10.4: Visual Polish

- [ ] No placeholder text, "lorem ipsum", or "coming soon"
- [ ] No "mock data" labels or indicators
- [ ] Consistent card styling (border, radius, shadow)
- [ ] Consistent spacing (p-6 content area, gap-6 between sections)
- [ ] All status colors consistent across screens
- [ ] Fonts: Sora for headings, DM Sans for body, JetBrains Mono for code/numbers
- [ ] Tabular nums on all number displays
- [ ] Timestamps look realistic (business hours, not midnight)

### Task 10.5: Build & Deploy

```bash
npm run lint          # Fix any ESLint issues
npm run build         # Verify production build succeeds
vercel --prod         # Deploy to production
```

### Task 10.6: Smoke Test Deployed App

- [ ] Visit every route on the deployed URL
- [ ] Toggle language mode on C1, C4
- [ ] Click through B1 → C1 → C4 → D1 flow
- [ ] Verify D2 audit log table renders fully
- [ ] Check B2 slider updates waterfall
- [ ] Login page renders and "Sign in" navigates to dashboard

---

## File Inventory — What Gets Created/Modified

### New Files (create)

```
lib/mock-data.ts                      ← Complete rewrite (Phase 1)
types/telemetry.ts                    ← Complete rewrite (Phase 1)
lib/verdict-logic.ts                  ← Update colors (Phase 1)
hooks/useLanguageMode.ts              ← New (Phase 2)

app/login/page.tsx                    ← New (Phase 2)
app/(app)/layout.tsx                  ← App shell layout (Phase 2)

components/layout/Sidebar.tsx         ← Complete rewrite (Phase 2)
components/layout/TopBar.tsx          ← Complete rewrite (Phase 2)

components/dashboard/MetricCards.tsx   ← New (Phase 3)
components/dashboard/ProcessCard.tsx   ← New (Phase 3)
components/dashboard/InsightCards.tsx   ← New (Phase 3)

components/sigma/AgentSigmaCard.tsx    ← New (Phase 4)
components/sigma/SigmaLegend.tsx       ← New (Phase 4)
components/sigma/DpmoTrendChart.tsx     ← New (Phase 4)

components/symmetry/AgentColumn.tsx    ← New (Phase 5)
components/symmetry/EquationCenter.tsx ← New (Phase 5)
components/symmetry/HumanColumn.tsx    ← New (Phase 5)
components/symmetry/RoiWaterfall.tsx   ← New (Phase 5)

components/labor/CoverageBar.tsx       ← New (Phase 6)
components/labor/TaskBoard.tsx         ← New (Phase 6)
components/labor/SkillsPanel.tsx       ← New (Phase 6)

components/telemetry/AgentHeader.tsx   ← New (Phase 7)
components/telemetry/MetricsBar.tsx    ← New (Phase 7)
components/telemetry/SigmaContext.tsx  ← New (Phase 7)
components/telemetry/RunHistory.tsx    ← New (Phase 7)
components/telemetry/DefectAnalysis.tsx ← New (Phase 7)

components/governance/AuditSummary.tsx ← New (Phase 8)
components/governance/AuditAlert.tsx   ← New (Phase 8)
components/governance/AuditTable.tsx   ← New (Phase 8)
components/governance/AuditFilters.tsx ← New (Phase 8)

components/roi/CostSlider.tsx          ← New (Phase 9)
components/roi/RoiSummaryCards.tsx      ← New (Phase 9)
components/roi/WaterfallChart.tsx       ← New (Phase 9)
components/roi/ProcessComparison.tsx    ← New (Phase 9)
components/roi/HonestNote.tsx           ← New (Phase 9)

components/settings/SettingsForm.tsx    ← New (Phase 9)
```

### Files to Delete

```
components/dashboard/VerdictCard.tsx    ← Replaced by new components
components/dashboard/StatBanner.tsx     ← Replaced
components/dashboard/SuccessGauge.tsx   ← Replaced
components/dashboard/LatencyChart.tsx   ← Replaced
components/dashboard/RunTimeline.tsx    ← Replaced
components/dashboard/CostBreakdown.tsx  ← Replaced
components/dashboard/RecentRuns.tsx     ← Replaced
components/workflow/WorkflowCard.tsx    ← Replaced
components/workflow/TraceViewer.tsx     ← Port patterns to new RunHistory
components/compare/ComparisonMatrix.tsx ← Replaced
components/shared/ExportButton.tsx      ← Rebuild as needed
components/shared/StatTile.tsx          ← Rebuild as needed

app/dashboard/page.tsx                 ← Replaced by new route
app/workflows/page.tsx                 ← Route removed
app/workflows/[id]/page.tsx            ← Route removed
app/compare/page.tsx                   ← Route removed
app/reports/page.tsx                   ← Route removed
app/settings/page.tsx                  ← Replaced by new route

hooks/useWorkflow.ts                   ← Replaced by useLanguageMode
hooks/useCountUp.ts                    ← Keep if still used, else delete
```

### Files to Modify

```
app/layout.tsx                         ← Add LanguageModeProvider
app/globals.css                        ← New color tokens
app/page.tsx                           ← Keep (redirect to /dashboard)
```

### Files to Keep As-Is

```
components/shared/StatusDot.tsx        ← Update colors only
components/shared/VerdictBadge.tsx     ← Update colors only
components/shared/Tooltip.tsx          ← Keep
next.config.ts                         ← Keep
tsconfig.json                          ← Keep
eslint.config.mjs                      ← Keep
postcss.config.mjs                     ← Keep
package.json                           ← May need new deps
```

---

## Agent Team Coordination Rules

1. **Phase 1 and Phase 2 are sequential** — no screen work starts until both are merged
2. **Phases 3-9 can run in parallel** — each agent works in its own component directory
3. **All screen agents import from `lib/mock-data.ts`** — never create local mock data
4. **All screen agents use `useLanguageMode()` hook** where applicable
5. **All agents use the shared `components/shared/` primitives** (StatusDot, VerdictBadge, Tooltip)
6. **No agent creates loading spinners, placeholder text, or "coming soon" states**
7. **Phase 10 runs after ALL screen agents have merged** — it's the integration test
8. **Every agent must run `npm run build` before marking their phase complete**
9. **Color values must come from CSS variables** — never hardcode hex in components
10. **Recharts is the ONLY chart library** — no additional charting deps

---

## Success Criteria

Les shows this to a client on April 7. The client:
- Asks questions about the **data**, not the technology
- Says "how would we configure this for our process"
- Has opinions about the labor graph
- Wants to know when it's available

That reaction — **engaging with the product as if it exists** — is the goal.
