# 2. System Architecture

## High-Level Architecture

```mermaid
graph TB
    subgraph "Browser (Client)"
        UI[React 19 Client Components]
        RC[Recharts Visualizations]
        ST[State: WorkflowContext]
    end

    subgraph "Next.js 16 App Router"
        SC[Server Components]
        CC[Client Components]
        RH[Route Handlers]
        SA[Server Actions]
    end

    subgraph "Data Layer (Current: Mock)"
        MD[lib/mock-data.ts<br/>Deterministic generator]
        VL[lib/verdict-logic.ts<br/>Verdict config & recommendations]
        TY[types/telemetry.ts<br/>Type definitions]
    end

    subgraph "Data Layer (Target: Production)"
        LF[Langfuse API<br/>Trace & telemetry data]
        ON[O*NET API<br/>Occupation task taxonomy]
        BLS[BLS Wage Data<br/>Hourly cost per occupation]
        SB[(Supabase PostgreSQL<br/>Sigma snapshots, ROI, audit)]
        RD[(Upstash Redis<br/>Langfuse response cache)]
    end

    UI --> CC
    RC --> CC
    ST --> CC
    CC --> SC
    SC --> MD
    SC --> VL
    MD --> TY

    SA -.-> LF
    SA -.-> ON
    SA -.-> BLS
    RH -.-> SB
    RH -.-> RD

    style MD fill:#E8EEF5,stroke:#0A1628
    style LF fill:#FFFBEB,stroke:#D97706
    style ON fill:#FFFBEB,stroke:#D97706
    style BLS fill:#FFFBEB,stroke:#D97706
    style SB fill:#FFFBEB,stroke:#D97706
    style RD fill:#FFFBEB,stroke:#D97706
```

> Dashed lines (-.->`) indicate planned integrations not yet implemented.

## Application Flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant P as page.tsx (/)
    participant D as dashboard/page.tsx
    participant M as mock-data.ts
    participant V as verdict-logic.ts

    B->>P: GET /
    P->>B: redirect('/dashboard')
    B->>D: GET /dashboard
    D->>M: WORKFLOWS (static array)
    D->>M: computeSummary(workflowId)
    M->>M: generateRuns(workflowId, 50)
    M->>M: Calculate stats, verdict
    M-->>D: WorkflowSummary
    D->>M: generateRuns(workflowId)
    M-->>D: Run[]
    D->>V: getVerdictConfig(verdict)
    V-->>D: Colors, icons, labels
    D-->>B: Rendered dashboard with charts
```

## Component Tree

```mermaid
graph TD
    RL[RootLayout<br/>layout.tsx] --> HP[Home Page<br/>redirect to /dashboard]
    RL --> DP[Dashboard Page<br/>'use client']
    RL --> WP[Workflows Page<br/>'use client']
    RL --> WDP[Workflow Detail<br/>'use client']
    RL --> CP[Compare Page<br/>'use client']
    RL --> RP[Reports Page<br/>'use client']
    RL --> SP[Settings Page<br/>'use client']

    DP --> SB[Sidebar]
    DP --> TB[TopBar]
    DP --> VC[VerdictCard]
    DP --> SBN[StatBanner]
    DP --> SG[SuccessGauge]
    DP --> LC[LatencyChart]
    DP --> RT[RunTimeline]
    DP --> CB[CostBreakdown]
    DP --> RR[RecentRuns]

    WP --> SB2[Sidebar]
    WP --> WC[WorkflowCard x4]

    WDP --> SB3[Sidebar]
    WDP --> TV[TraceViewer]

    CP --> SB4[Sidebar]
    CP --> CM[ComparisonMatrix]

    style RL fill:#0A1628,color:#fff
    style DP fill:#D4AF37,color:#0A1628
    style VC fill:#059669,color:#fff
```

## Data Flow Architecture

```mermaid
flowchart LR
    subgraph "Static Configuration"
        W[WORKFLOWS<br/>4 workflow definitions]
    end

    subgraph "Data Generation"
        GR[generateRuns<br/>Seeded deterministic runs]
        CS[computeSummary<br/>Stats aggregation]
        GS[generateSparkline<br/>Mini trend data]
    end

    subgraph "Verdict Engine"
        VE{Verdict Logic}
        VE -->|SLA >= 88%<br/>Success >= 82%<br/>ROI+| GREEN
        VE -->|SLA >= 70%<br/>OR Success >= 65%| AMBER
        VE -->|else| RED
    end

    subgraph "Display"
        VC2[VerdictCard]
        CH[Charts]
        TBL[Tables]
    end

    W --> GR
    GR --> CS
    CS --> VE
    VE --> VC2
    GR --> CH
    GR --> TBL
    CS --> CH
```

## Rendering Strategy

| Route | Strategy | Reason |
|---|---|---|
| `/` | Server Component | Simple redirect, no client state |
| `/dashboard` | Client Component (`'use client'`) | Workflow selector state, chart interactivity |
| `/workflows` | Client Component | Sidebar navigation state |
| `/workflows/[id]` | Client Component | Dynamic params, trace viewer interactivity |
| `/compare` | Client Component | Multi-workflow selection state |
| `/reports` | Client Component | Report configuration state |
| `/settings` | Client Component | Form state management |

> **Note**: The current implementation makes most pages client components. In production, consider moving data fetching to Server Components and pushing `'use client'` boundaries down to individual interactive widgets.

## Layout Structure

```
+------------------+----------------------------------------+
|                  |          TopBar (workflow selector)      |
|    Sidebar       +----------------------------------------+
|    (240px)       |                                        |
|    Fixed left    |          Main Content Area              |
|                  |          (p-6, flex-col, gap-6)         |
|    - MONITOR     |                                        |
|    - ANALYZE     |          VerdictCard                    |
|    - CONFIGURE   |          StatBanner                     |
|                  |          [SuccessGauge] [LatencyChart]  |
|                  |          [RunTimeline] [CostBreakdown]  |
|                  |          RecentRuns table               |
|                  |                                        |
+------------------+----------------------------------------+
```

---

*Diagrams use Mermaid.js syntax. Render in any Mermaid-compatible viewer.*
