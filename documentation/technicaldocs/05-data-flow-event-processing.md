# 5. Data Flow & Event Processing

## Current Data Flow (Mock)

```mermaid
flowchart LR
    subgraph "Static Config"
        WF[WORKFLOWS array<br/>4 workflow definitions]
    end

    subgraph "Data Generation"
        GR[generateRuns<br/>Seeded pseudo-random]
        CS[computeSummary<br/>Aggregation engine]
    end

    subgraph "Verdict Engine"
        VD{Verdict Decision}
    end

    subgraph "UI Rendering"
        VC[VerdictCard]
        SB[StatBanner]
        SG[SuccessGauge]
        LC[LatencyChart]
        RT[RunTimeline]
        CB[CostBreakdown]
        RR[RecentRuns]
    end

    WF --> GR
    GR --> CS
    CS --> VD

    VD -->|SLA>=88%<br/>Success>=82%<br/>ROI+| GREEN[GREEN verdict]
    VD -->|SLA>=70%<br/>OR Success>=65%| AMBER[AMBER verdict]
    VD -->|else| RED[RED verdict]

    GREEN --> VC
    AMBER --> VC
    RED --> VC

    CS --> SB
    CS --> SG
    GR --> LC
    GR --> RT
    CS --> CB
    GR --> RR
```

## Run Generation Pipeline

The mock data pipeline is deterministic — given the same `workflowId`, it always produces the same runs.

### Step 1: Seed Calculation
```
seed = workflowId.length * 137
per_run_seed = (seed + runIndex * 31337) % 1000
```

### Step 2: Run Tier Classification
```
s < 720  → "fast"   (72% of runs) — duration: 800-1600ms
s < 870  → "slow"   (15% of runs) — duration: 3200-5200ms
s >= 870 → "failed" (13% of runs) — duration: 1200-2600ms, outcome: false
```

### Step 3: Cost Calculation
```
tokens = failed ? (400 + s%300) : (1200 + s%2000)
cost = tokens * model_rate
```

### Step 4: Span Generation
- **Failed runs**: 2 spans — first OK, second ERROR with timeout message
- **Successful runs**: 3 spans per agent, duration split using rotating patterns:
  - `[25%, 45%, 30%]`
  - `[20%, 55%, 25%]`
  - `[30%, 40%, 30%]`

### Step 5: Summary Computation
```
success_rate = successful_runs / total_runs
sla_hit_rate = runs_under_sla / total_runs
consistency  = max(0, min(100, round(100 * (1 - coefficient_of_variation))))
verdict      = computed from thresholds
roi_positive = (successful_runs * value_per_success) > total_cost
```

## Target Data Flow (Production)

```mermaid
flowchart TD
    subgraph "Data Sources"
        LF[Langfuse Cloud<br/>Agent traces & telemetry]
        ON[O*NET API<br/>Occupation tasks & weights]
        BLS[BLS Data<br/>Wage rates per occupation]
    end

    subgraph "Ingestion Layer"
        CRON[Vercel Cron Job<br/>02:00 UTC nightly]
        PROXY[O*NET Proxy<br/>7-day revalidation]
    end

    subgraph "Processing"
        SIGMA[Sigma Computation<br/>DPMO, OEE, quality rates]
        ROI[ROI Computation<br/>Gross - oversight - agent - governance]
    end

    subgraph "Storage"
        DB[(Supabase PostgreSQL)]
        CACHE[(Upstash Redis<br/>5-min TTL)]
    end

    subgraph "Presentation"
        SC[Server Components<br/>Read from DB]
        CC[Client Components<br/>Interactive charts]
    end

    LF --> CRON
    CRON --> SIGMA
    SIGMA --> DB
    CRON --> ROI
    ROI --> DB

    ON --> PROXY
    BLS --> PROXY
    PROXY --> DB

    LF --> CACHE
    DB --> SC
    CACHE --> SC
    SC --> CC
```

## Sigma Score Computation Pipeline (Target)

```mermaid
flowchart TD
    A[Fetch Langfuse runs for agent+date] --> B[Count failures]
    A --> C[Count latency breaches<br/>P90 > SLA threshold]
    A --> D[Count cost overruns<br/>vs per-task budget]

    B --> E[Apply weights]
    C --> E
    D --> E

    E --> F["weighted_defects =<br/>(failures × 1.0) +<br/>(latency_breaches × 0.6) +<br/>(cost_overruns × 0.4)"]

    F --> G["DPMO =<br/>(weighted_defects / total_invocations)<br/>× 1,000,000"]

    G --> H{DPMO Lookup}
    H -->|691,462| S1["1σ — Unreliable"]
    H -->|308,538| S2["2σ — High risk"]
    H -->|66,807| S3["3σ — Needs tuning"]
    H -->|6,210| S4["4σ — Supervised production"]
    H -->|233| S5["5σ — Production ready"]
    H -->|3.4| S6["6σ — Autonomous"]

    A --> I["OEE = availability_rate<br/>× performance_rate<br/>× quality_rate"]
```

## ROI Computation Pipeline (Target)

```mermaid
flowchart LR
    subgraph "Inputs"
        OT[O*NET task weights<br/>per occupation]
        CM[Coverage map<br/>agent/collaborative/human]
        BW[BLS hourly wage]
        HC[Headcount]
        WH[Weekly hours]
        AC[Agent cost from Langfuse]
    end

    subgraph "Computation"
        HS["Human hours saved =<br/>Σ(agent_task_weight × headcount × weekly_hours)"]
        GS["Gross saving =<br/>hours_saved × hourly_wage"]
        OC["Oversight cost =<br/>collaborative_review_hours × hourly_wage"]
        GO["Governance overhead =<br/>oversight_cost × 0.35"]
        NR["Net ROI =<br/>gross - oversight - agent_cost - governance"]
    end

    OT --> HS
    CM --> HS
    HC --> HS
    WH --> HS
    BW --> GS
    HS --> GS
    BW --> OC
    OC --> GO
    GS --> NR
    OC --> NR
    AC --> NR
    GO --> NR
```

## State Management Flow

```mermaid
stateDiagram-v2
    [*] --> PageLoad: User navigates to /dashboard

    PageLoad --> DefaultWorkflow: useState('odds-analysis-agent')

    DefaultWorkflow --> ComputeData: computeSummary + generateRuns
    ComputeData --> RenderDashboard: Pass data to child components

    RenderDashboard --> WorkflowChange: User selects different workflow
    WorkflowChange --> ComputeData: Re-render with new workflowId

    state RenderDashboard {
        VerdictCard --> StatBanner
        StatBanner --> Charts
        Charts --> RecentRuns
    }
```

## Event Processing (Target State)

### Nightly Cron Schedule

| Job | Schedule | Duration | Purpose |
|---|---|---|---|
| Sigma snapshot computation | `0 2 * * *` (02:00 UTC daily) | ~5-10 min | Fetch Langfuse data, compute DPMO/OEE, write to DB |
| O*NET task refresh | `0 3 * * 0` (03:00 UTC weekly) | ~2-3 min | Refresh cached task data from O*NET API |

### Vercel Cron Configuration (Target)

```json
{
  "crons": [
    {
      "path": "/api/cron/snapshots",
      "schedule": "0 2 * * *"
    }
  ]
}
```
