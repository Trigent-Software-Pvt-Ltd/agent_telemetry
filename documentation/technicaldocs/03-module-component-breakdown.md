# 3. Module & Component Breakdown

## Directory Structure

```
agent_telemetry/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (fonts, Toaster)
│   ├── page.tsx                  # Redirect to /dashboard
│   ├── globals.css               # Tailwind imports, design tokens, animations
│   ├── dashboard/page.tsx        # Main dashboard (hero page)
│   ├── workflows/
│   │   ├── page.tsx              # Workflow listing grid
│   │   └── [id]/page.tsx         # Workflow detail with trace viewer
│   ├── compare/page.tsx          # Side-by-side workflow comparison
│   ├── reports/page.tsx          # Report generation interface
│   └── settings/page.tsx         # Configuration panel
│
├── components/
│   ├── layout/                   # App shell components
│   │   ├── Sidebar.tsx           # Fixed left navigation (240px)
│   │   └── TopBar.tsx            # Workflow selector dropdown
│   │
│   ├── dashboard/                # Dashboard-specific widgets
│   │   ├── VerdictCard.tsx       # Hero verdict display with stats
│   │   ├── StatBanner.tsx        # Key metrics row (4 stat tiles)
│   │   ├── SuccessGauge.tsx      # Circular success rate gauge
│   │   ├── LatencyChart.tsx      # Latency distribution (Recharts)
│   │   ├── RunTimeline.tsx       # Run history timeline (Recharts)
│   │   ├── CostBreakdown.tsx     # Agent cost donut chart (Recharts)
│   │   └── RecentRuns.tsx        # Paginated run table with spans
│   │
│   ├── workflow/                 # Workflow-specific components
│   │   ├── WorkflowCard.tsx      # Summary card for workflow listing
│   │   └── TraceViewer.tsx       # Span tree visualization
│   │
│   ├── compare/                  # Comparison components
│   │   └── ComparisonMatrix.tsx  # Multi-workflow comparison table
│   │
│   └── shared/                   # Reusable UI primitives
│       ├── StatTile.tsx          # Single metric display tile
│       ├── StatusDot.tsx         # Animated status indicator
│       ├── VerdictBadge.tsx      # GREEN/AMBER/RED badge
│       ├── Tooltip.tsx           # Hover tooltip wrapper
│       └── ExportButton.tsx      # CSV/JSON export trigger
│
├── hooks/                        # Custom React hooks
│   ├── useWorkflow.ts            # WorkflowContext provider & consumer
│   └── useCountUp.ts             # Number animation hook
│
├── lib/                          # Business logic & data
│   ├── mock-data.ts              # Deterministic data generator
│   └── verdict-logic.ts          # Verdict configuration & recommendations
│
├── types/                        # TypeScript type definitions
│   └── telemetry.ts              # Core domain types
│
├── docs/                         # Source documents (Word)
│   ├── AgentQuality_BrainDump_FuzeboxAI.docx
│   └── AgentQuality_TechSpec_FuzeboxAI.docx
│
└── documentation/                # Technical documentation (this folder)
    └── technicaldocs/
```

## Component Details

### Layout Components

#### `Sidebar` (`components/layout/Sidebar.tsx`)
- **Type**: Client Component (`'use client'`)
- **Purpose**: Fixed left navigation bar (240px width)
- **Dependencies**: `next/link`, `next/navigation` (usePathname), `clsx`, `lucide-react`
- **Navigation Sections**:
  - MONITOR: Dashboard, Workflows
  - ANALYZE: Compare, Reports
  - CONFIGURE: Settings
- **Active State**: Gold highlight (`#D4AF37`) with left border indicator
- **Branding**: VIPPlay logo with gold diamond icon, "Powered by Langfuse" footer

#### `TopBar` (`components/layout/TopBar.tsx`)
- **Type**: Client Component
- **Purpose**: Horizontal header with workflow selector dropdown
- **Props**: `activeWorkflowId: string`, `onWorkflowChange: (id: string) => void`
- **Features**: Workflow dropdown, export button, settings link

### Dashboard Components

#### `VerdictCard` (`components/dashboard/VerdictCard.tsx`)
- **Type**: Client Component
- **Purpose**: Hero card showing verdict status, key metrics, and recommendations
- **Props**: `summary: WorkflowSummary`, `workflow: Workflow`
- **Dependencies**: `VerdictBadge`, `StatusDot`, `useCountUp`
- **Visual**: Background color changes based on verdict (green/amber/red tints)
- **Metrics Shown**: Consistency score, SLA hit rate, cost per success, total runs
- **Key**: Uses `key={verdict-${workflowId}}` for re-mount animation on workflow change

#### `StatBanner` (`components/dashboard/StatBanner.tsx`)
- **Type**: Client Component
- **Purpose**: Row of 4 key metric tiles
- **Props**: `summary: WorkflowSummary`
- **Dependencies**: `StatTile`
- **Metrics**: Success rate, avg duration, avg cost, total value generated

#### `SuccessGauge` (`components/dashboard/SuccessGauge.tsx`)
- **Type**: Client Component
- **Purpose**: Circular gauge showing success rate percentage
- **Props**: `rate: number`, `verdict: Verdict`
- **Visual**: SVG circular arc with color based on verdict

#### `LatencyChart` (`components/dashboard/LatencyChart.tsx`)
- **Type**: Client Component
- **Purpose**: Latency distribution chart with percentile markers
- **Props**: `runs: Run[]`, `sla_ms: number`, `p50: number`, `p90: number`, `p95: number`
- **Dependencies**: `recharts` (BarChart, ReferenceLine)
- **Features**: SLA threshold line, percentile annotations

#### `RunTimeline` (`components/dashboard/RunTimeline.tsx`)
- **Type**: Client Component
- **Purpose**: Chronological timeline of run durations
- **Props**: `runs: Run[]`, `sla_ms: number`
- **Dependencies**: `recharts` (AreaChart or LineChart)
- **Features**: SLA threshold overlay, color coding by pass/fail

#### `CostBreakdown` (`components/dashboard/CostBreakdown.tsx`)
- **Type**: Client Component
- **Purpose**: Per-agent cost distribution (donut chart)
- **Props**: `agentCosts: { agent: string; avgCost: number }[]`
- **Dependencies**: `recharts` (PieChart)

#### `RecentRuns` (`components/dashboard/RecentRuns.tsx`)
- **Type**: Client Component
- **Purpose**: Paginated table of recent runs with expandable span details
- **Props**: `runs: Run[]`, `sla_ms: number`, `workflowId: string`
- **Features**: Row expansion for span tree, status icons, duration/cost columns

### Workflow Components

#### `WorkflowCard` (`components/workflow/WorkflowCard.tsx`)
- **Type**: Client Component
- **Purpose**: Summary card for workflow listing page
- **Dependencies**: `VerdictBadge`, `StatusDot`
- **Features**: Sparkline, key metrics, click to navigate to detail

#### `TraceViewer` (`components/workflow/TraceViewer.tsx`)
- **Type**: Client Component
- **Purpose**: Span-level trace visualization for individual runs
- **Features**: Horizontal span bars with animated fill, error highlighting

### Shared Components

| Component | Props | Purpose |
|---|---|---|
| `StatTile` | `label`, `value`, `trend?`, `format?` | Single metric display with optional trend indicator |
| `StatusDot` | `status: 'green' \| 'amber' \| 'red'` | Animated pulsing dot (CSS `status-dot-*` classes) |
| `VerdictBadge` | `verdict: Verdict`, `size?: 'sm' \| 'lg'` | Colored badge with icon and label |
| `Tooltip` | `content: string`, `children` | Hover tooltip with fade animation |
| `ExportButton` | `data`, `format?` | Triggers CSV/JSON download of data |

## Hooks

### `useWorkflow` (`hooks/useWorkflow.ts`)
- **Purpose**: React Context for active workflow selection
- **Context Shape**: `{ activeWorkflowId: string, setActiveWorkflowId: (id: string) => void }`
- **Provider**: Created in `dashboard/page.tsx` wrapping the entire dashboard
- **Default**: `'odds-analysis-agent'`

### `useCountUp` (`hooks/useCountUp.ts`)
- **Purpose**: Animated number counter for dashboard metrics
- **Params**: `target: number`, `duration: number`, `decimals: number`
- **Returns**: Animated current value as a formatted string
- **Usage**: VerdictCard metrics display with entrance animation

## Data Modules

### `lib/mock-data.ts`
- **`WORKFLOWS`**: Array of 4 workflow definitions with agents, framework, model, SLA, and value parameters
- **`generateRuns(workflowId, count)`**: Deterministic run generator using seeded pseudo-random logic. Produces 3 tiers: fast (72%), slow (15%), failed (13%)
- **`computeSummary(workflowId)`**: Aggregates runs into `WorkflowSummary` with stats, verdict, and agent cost breakdown
- **`generateSparkline(workflowId, count)`**: Mini trend data for workflow cards

### `lib/verdict-logic.ts`
- **`VERDICT_CONFIG`**: Color/icon/label mapping for GREEN, AMBER, RED
- **`getVerdictConfig(verdict)`**: Lookup function for verdict display properties
- **`generateRecommendations(workflowId, verdict, slaHitRate, successRate)`**: Context-aware recommendation text generator

## Type Definitions (`types/telemetry.ts`)

```typescript
type Verdict = 'GREEN' | 'AMBER' | 'RED'

interface Workflow {
  id, name, description, agents[], framework, model, sla_ms, value_per_success, color
}

interface Span {
  name, duration_ms, status: 'ok' | 'error', cost, tool_calls, error?
}

interface Run {
  run_id, workflow_id, timestamp, duration_ms, total_cost, outcome: boolean,
  model, token_count, tool_calls, framework, spans: Span[]
}

interface WorkflowSummary {
  workflow_id, total_runs, successful_runs, success_rate,
  avg_duration_ms, p50/p90/p95_duration_ms,
  avg_cost, total_cost, cost_per_success,
  sla_hit_rate, consistency_score, roi_positive, total_value,
  verdict, verdict_text, hypothesis_proven,
  agent_costs[], sla_ms
}
```
