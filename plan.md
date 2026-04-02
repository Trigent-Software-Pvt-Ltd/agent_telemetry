# Agent Quality & Process ROI Platform — Master Plan

> **Product**: VIPPlay Agent Telemetry by r-Potential / FuzeBox AI
> **Stack**: Next.js 16.2, React 19, Tailwind CSS 4, Recharts, TypeScript
> **Data**: All mock/deterministic from `lib/mock-data.ts`. No backend.
> **Deployed**: https://agenttelemetry.vercel.app
> **Repo**: https://github.com/Trigent-Software-Pvt-Ltd/agent_telemetry

---

## Status Summary

| Phase | Theme | Screens | Status |
|---|---|---|---|
| Phase 1 | Core Demo (April 7) | 9 screens | DONE |
| Phase 2 | Complete Platform | +6 screens, +5 features | DONE |
| Phase 3 | Operational Maturity | +7 routes, +6 enhancements | DONE |
| Phase 4 | Enterprise Features | +6 routes | DONE |
| Phase 5 | Platform & Integration | +5 routes | DONE |
| Phase 6 | UX Redesign | Restructure nav + pages | DONE |
| Phase 7 | **Deep Observability** | Run traces, latency trends, task-level analytics | **PLANNED** |
| Phase 8 | **Financial Modeling** | Scenarios, payback, TCO, model comparison | **PLANNED** |
| Phase 9 | **Operational Controls & Strategic** | Kill switch, maturity score, mobile, compliance cert | **PLANNED** |

**Current state**: 35 routes, 60+ components, redesigned UX, all building clean. Q1-Q40 fully answered, Q41-Q100 evaluated.
**Next priority**: Phase 7 — Deep Observability (trace viewer, latency trends, task-level performance).

---

## CEO Questions → Feature Map (Q1-Q40)

All 40 questions are answered. This is the anchor for every feature decision.

### Category 1: Agent Lifecycle Management
| # | Question | Screen | Phase | Status |
|---|---|---|---|---|
| Q1 | How do I add a new agent? | `/setup/occupation` + `/setup/mapping` | 2 | DONE |
| Q2 | How do I remove/decommission a bad agent? | `/agents/[id]/manage` | 3 | DONE |
| Q3 | How do I replace one agent with another? | `/agents/[id]/manage` (swap) | 3 | DONE |
| Q4 | How do I test before promoting to prod? | `/agents/[id]/staging` | 4 | DONE |
| Q5 | How do I compare two agents? | `/agents/compare` | 3 | DONE |
| Q6 | How do I see agent version history? | `/agents/[id]` (timeline) | 4 | DONE |

### Category 2: ROI & Financial
| # | Question | Screen | Phase | Status |
|---|---|---|---|---|
| Q7 | Total ROI across all processes? | `/dashboard` | 1 | DONE |
| Q8 | ROI per individual agent? | `/agents/[id]` (AgentRoiCard) | 2 | DONE |
| Q9 | Cost of NOT fixing a bad agent? | `/agents/[id]` (CostOfInaction) | 3 | DONE |
| Q10 | Monthly inference spend? | `/dashboard/costs` | 3 | DONE |
| Q11 | ROI projection for next quarter? | `/process/[id]/roadmap` | 2 | DONE |
| Q12 | Budget cap per agent? | `/settings/budgets` | 4 | DONE |
| Q13 | Benchmark against industry? | `/dashboard/benchmarks` | 5 | DONE |

### Category 3: Performance & Quality
| # | Question | Screen | Phase | Status |
|---|---|---|---|---|
| Q14 | Best performing agent? | `/process/[id]/sigma` | 1 | DONE |
| Q15 | Underperforming agent? | `/process/[id]/sigma` + alerts | 1 | DONE |
| Q16 | Insights on improving an agent? | `/agents/[id]` (defects) | 1 | DONE |
| Q17 | Root cause of failures? | `/governance/fmea` | 2 | DONE |
| Q18 | Track improvement over time? | `/process/[id]/sigma` (tracker) | 3 | DONE |
| Q19 | Set SLA targets per agent? | `/settings/alerts` | 3 | DONE |
| Q20 | Alerted when quality drops? | `/settings/alerts` (rules) | 3 | DONE |
| Q21 | Real-time agent performance? | `/monitoring` | 4 | DONE |

### Category 4: Reporting & Communication
| # | Question | Screen | Phase | Status |
|---|---|---|---|---|
| Q22 | Download a report? | `/dashboard/export` | 2 | DONE |
| Q23 | Schedule weekly reports? | `/dashboard/export` (schedule tab) | 3 | DONE |
| Q24 | Share dashboard link? | ShareButton on pages | 4 | DONE |
| Q25 | Slack/Teams notification? | `/settings/notifications` | 4 | DONE |
| Q26 | Export to BI tools? | `/settings/integrations` | 5 | DONE |

### Category 5: Team & Workforce
| # | Question | Screen | Phase | Status |
|---|---|---|---|---|
| Q27 | Skills my team needs now? | `/process/[id]/labor` | 1 | DONE |
| Q28 | Plan training for the team? | `/process/[id]/training` | 3 | DONE |
| Q29 | Team's role as agents improve? | `/process/[id]/roadmap` | 2 | DONE |
| Q30 | Headcount impact over 12 months? | `/process/[id]/workforce` | 4 | DONE |

### Category 6: Governance & Compliance
| # | Question | Screen | Phase | Status |
|---|---|---|---|---|
| Q31 | EU AI Act compliant? | `/governance/audit` | 1 | DONE |
| Q32 | Override rate trend? | `/governance/audit` (charts) | 3 | DONE |
| Q33 | Export for auditors? | `/dashboard/export` + audit PDF | 2 | DONE |
| Q34 | Decisions with no oversight? | `/governance/oversight` | 3 | DONE |
| Q35 | Mandatory human review for high-risk? | `/governance/rules` | 4 | DONE |

### Category 7: Multi-Org & Scaling
| # | Question | Screen | Phase | Status |
|---|---|---|---|---|
| Q36 | Multiple departments? | Multi-process sidebar | 1 | DONE |
| Q37 | Different quality targets per team? | `/settings/alerts` (per-agent SLA) | 3 | DONE |
| Q38 | Benchmark across departments? | `/dashboard/benchmark` | 3 | DONE |
| Q39 | White-label for clients? | `/settings/branding` | 5 | DONE |
| Q40 | Multiple organisations? | `/admin/organisations` | 5 | DONE |

---

## Phase 1: Core Demo (DONE)

> **Theme**: April 7 demo — high-fidelity mock on Vercel.
> **Delivered**: 9 screens, mock data layer, design system, sidebar nav.

### What was built:
1. **Mock Data Layer** (`lib/mock-data.ts`) — Organisation, 2 processes, 4 agents, O*NET tasks, ROI snapshots, sigma trends, run history, audit log
2. **Type System** (`types/telemetry.ts`) — Process, Agent, OnetTask, RoiSnapshot, Run, Span, AuditLogEntry
3. **App Shell** — `(app)` route group with Sidebar + TopBar, language mode toggle (Operations/Quality)
4. **Design System** — CSS custom properties, Sora/DM Sans/JetBrains Mono fonts, VIP luxury aesthetic

### Screens delivered:
| ID | Screen | Route |
|---|---|---|
| A1 | Settings | `/settings` |
| B1 | Executive Portfolio (Dashboard) | `/dashboard` |
| B2 | ROI Calculator | `/dashboard/roi` |
| C1 | Symmetry Dashboard | `/process/[id]` |
| C2 | Labor Graph | `/process/[id]/labor` |
| C4 | Sigma Scorecard | `/process/[id]/sigma` |
| D1 | Agent Telemetry | `/agents/[id]` |
| D2 | Audit Log | `/governance/audit` |
| — | Login | `/login` |

---

## Phase 2: Complete Platform (DONE)

> **Theme**: Build remaining screens + features. Everything still mock data.
> **Delivered**: 6 new screens, 5 feature enhancements, 25 new components.

### Screens delivered:
| ID | Screen | Route |
|---|---|---|
| A2 | Occupation Selector | `/setup/occupation` |
| A3 | Agent-to-Task Mapper | `/setup/mapping` |
| B3 | Board Export | `/dashboard/export` |
| C3 | Coverage Map | `/process/[id]/coverage` |
| C5 | Transformation Roadmap | `/process/[id]/roadmap` |
| D3 | FMEA Risk Board | `/governance/fmea` |

### Features delivered:
| # | Feature | Where |
|---|---|---|
| F1 | SERVQUAL mode toggle | C1, C4, Settings — `useOrganisation` context |
| F2 | Per-agent ROI breakdown | C1 AgentColumn, D1 AgentRoiCard |
| F3 | Notification indicators | Sidebar badges, TopBar bell |
| F4 | PDF report download | `@media print` styles, `window.print()` in B3/D2 |
| F5 | Legacy cleanup | Removed old types/stubs |

---

## Phase 3: Operational Maturity (DONE)

> **Theme**: "Now that I can see the data, I want to act on it."
> **Delivered**: 7 new routes, 6 enhancements to existing pages.

### New routes:
| Feature | Route |
|---|---|
| Agent Lifecycle (Decommission/Pause/Swap) | `/agents/[id]/manage` |
| Agent A/B Comparison | `/agents/compare` |
| Cost Trend Dashboard | `/dashboard/costs` |
| Cross-Process Benchmark | `/dashboard/benchmark` |
| SLA Config + Alert Rules Engine | `/settings/alerts` |
| Oversight Gap Report | `/governance/oversight` |
| Skills Gap & Training Plan | `/process/[id]/training` |

### Enhancements to existing pages:
| Feature | Where |
|---|---|
| Cost of Inaction Calculator | `/agents/[id]` — collapsible 90-day risk projection |
| Improvement Tracker | `/process/[id]/sigma` — sigma history table with trend projections |
| Override Trend Analysis | `/governance/audit` — weekly override charts + correlation insight |
| Scheduled Reports | `/dashboard/export` — schedule tab with frequency/recipients |

---

## Phase 4: Enterprise Features (DONE)

> **Theme**: "Scale this across the organization and manage it like enterprise software."
> **Delivered**: 6 new routes.

### New routes:
| Feature | Route |
|---|---|
| Agent Staging/Canary View | `/agents/[id]/staging` — traffic split, promote/rollback |
| Live Monitoring (NOC screen) | `/monitoring` — dark theme, simulated real-time feeds |
| Budget Alerts & Caps | `/settings/budgets` — per-agent monthly caps with gauges |
| Notification Channels | `/settings/notifications` — email, Slack, Teams config |
| Workforce Planning Model | `/process/[id]/workforce` — 12-month projections, 3 scenarios |
| Governance Rules Engine | `/governance/rules` — 10 rules, compliance gauge, violations |

### Enhancements:
| Feature | Where |
|---|---|
| Agent Version Timeline | `/agents/[id]` — 3-version history with sigma chart |
| Shareable Dashboard Links | ShareButton component on key pages |
| Shared Links Management | `/settings` — SharedLinksTable |

---

## Phase 5: Platform & Integration (DONE)

> **Theme**: "Connect this to everything else and make it the standard."
> **Delivered**: 5 new routes.

### New routes:
| Feature | Route |
|---|---|
| API & Webhooks + BI Integration | `/settings/integrations` — 3 tabs: API keys, webhooks, BI tools |
| Industry Benchmark Comparison | `/dashboard/benchmarks` — vs industry avg, vs top 10% |
| White-Label Configuration | `/settings/branding` — logo, colors, name, live preview |
| Multi-Tenant Workspace | `/admin/organisations` — 3 orgs, users, data isolation |
| Correlation Engine | `/analytics/correlations` — 4 correlations with scatter plots |

### Enhancements:
| Feature | Where |
|---|---|
| Anomaly Detection | `/dashboard` — 5 detected anomalies with severity |

---

## Phase 6: UX Redesign (PENDING)

> **Theme**: "Make the app explain itself. No briefing needed."
> **Detailed brief**: See `redesign.md`

### Problems identified:
1. App organized around data structures, not user questions
2. "Process" vs "Agent" relationship unclear to non-technical users
3. Sidebar has ~40 items — overwhelming
4. Six Sigma jargon as default language (sigma, DPMO, OEE, FMEA)
5. No narrative flow — data dumps instead of stories
6. Duplicate/confusing page names (benchmark vs benchmarks)
7. Sub-pages (labor, sigma, coverage, training, workforce) buried in sidebar

### Proposed changes:
1. Restructure sidebar around CEO mental model (Home, My AI Agents, Insights, Governance, Planning, Configure)
2. Nest agents under their process — one mental path
3. Convert process sub-pages to tabs within process page
4. Default language to plain English (sigma → quality score, DPMO → error rate)
5. Dashboard redesign: narrative-first ("You have 4 AI agents saving $2,038/week")
6. Attention-first design: what needs fixing shown prominently
7. Merge duplicate pages (benchmark + benchmarks, cost analysis + ROI)

### Status: Awaiting brainstorm and stakeholder input before execution.

---

## Complete Route Map (35 routes)

```
Phase 1:
  /login .......................... Login page
  /dashboard ...................... B1 Executive Portfolio
  /dashboard/roi .................. B2 ROI Calculator
  /process/[id] .................. C1 Symmetry Dashboard
  /process/[id]/labor ............ C2 Labor Graph
  /process/[id]/sigma ............ C4 Sigma Scorecard
  /agents/[id] ................... D1 Agent Telemetry
  /governance/audit .............. D2 Audit Log
  /settings ...................... A1 Settings

Phase 2:
  /setup/occupation .............. A2 Occupation Selector
  /setup/mapping ................. A3 Agent-to-Task Mapper
  /dashboard/export .............. B3 Board Export + Scheduled Reports
  /process/[id]/coverage ......... C3 Coverage Map
  /process/[id]/roadmap .......... C5 Transformation Roadmap
  /governance/fmea ............... D3 FMEA Risk Board

Phase 3:
  /agents/[id]/manage ............ Agent Lifecycle (decommission/pause/swap)
  /agents/compare ................ Agent A/B Comparison
  /dashboard/costs ............... Cost Trend Dashboard
  /dashboard/benchmark ........... Cross-Process Benchmark
  /settings/alerts ............... SLA Config + Alert Rules
  /governance/oversight .......... Oversight Gap Report
  /process/[id]/training ......... Skills Gap & Training Plan

Phase 4:
  /agents/[id]/staging ........... Agent Staging/Canary View
  /monitoring .................... Live Monitoring (NOC screen)
  /settings/budgets .............. Budget Alerts & Caps
  /settings/notifications ........ Notification Channels
  /process/[id]/workforce ........ Workforce Planning Model
  /governance/rules .............. Governance Rules Engine

Phase 5:
  /settings/integrations ......... API Keys + Webhooks + BI Tools
  /dashboard/benchmarks .......... Industry Benchmark Comparison
  /settings/branding ............. White-Label Configuration
  /admin/organisations ........... Multi-Tenant Workspace
  /analytics/correlations ........ Correlation Engine
```

---

## Technical Architecture

### Data Layer
- `types/telemetry.ts` — 30+ TypeScript interfaces
- `lib/mock-data.ts` — 40+ helper functions, all seeded data
- `lib/verdict-logic.ts` — Verdict display config

### State Management
- `hooks/useLanguageMode.ts` — Operations/Quality vocabulary toggle
- `hooks/useOrganisation.ts` — OEE/SERVQUAL quality framework
- `hooks/useCountUp.ts` — Number animation

### Design System
- Light mode, VIP/luxury aesthetic
- Navy sidebar `#0A1628`, gold accent `#D4AF37`, white cards on `#F7F9FC`
- Monitoring page: dark NOC theme override
- `@media print` styles for PDF export
- Fonts: Sora (headings), DM Sans (body), JetBrains Mono (code)

### Key Dependencies
- Next.js 16.2 (App Router, Turbopack)
- React 19
- Tailwind CSS 4 via `@tailwindcss/postcss`
- Recharts (area, bar, radar, scatter, composed charts)
- Lucide React (icons), clsx, sonner (toasts)

---

## Phase 6: UX Redesign (DONE)

> **Theme**: "Make the app explain itself. No briefing needed."
> **Detailed brief**: See `redesign.md`

### What was delivered:
- **Dashboard**: Narrative hero banner ("Your AI Workforce"), four-language pills (Quality/Workforce/Finance/Compliance), Attention Required section with business consequences, health gradient (no more 0/2), quick actions row
- **Sidebar**: Restructured from ~40 to ~15 items — MY AI AGENTS (agents nested under processes), INSIGHTS, GOVERNANCE, PLANNING, CONFIGURE (collapsed)
- **Sigma Tooltips**: SigmaTooltip component on every sigma score — hover shows plain-English translation scale
- **Page Merges**: Coverage+Labor → Task Ownership, ROI+Costs → Financial Impact, benchmark+benchmarks → single tabbed page
- **Agent Polish**: Cost of Inaction expanded by default on critical agents, FMEA auto-selects highest RPN
- **Language**: Jargon renamed (FMEA→Risk Analysis, Oversight Gaps→Unreviewed Decisions, Board Export→Board Report)
- **Global**: Ctrl+K command palette, dynamic browser tab titles, setup wizard progress, empty states, notification bell with actions

---

## CEO Questions → Feature Map (Q41-Q100)

> **Design principle**: Every new feature must follow the redesign rules:
> 1. Lead with the answer, not the data
> 2. Four languages, one story (operations, quality, finance, compliance)
> 3. Show the assumption — no magic numbers
> 4. Urgency through consequence — translate quality into business impact
> 5. Progressive disclosure — CEO sees story, VP sees breakdown, engineer sees data
> 6. The sigma scale is the Rosetta Stone — surface it everywhere

### Evaluation: 7 fully answered, 22 partial, 31 gaps

| # | Question | Status | Phase |
|---|---|---|---|
| **Agent Performance (Deeper)** | | | |
| Q41 | Which agent improved the most this month? | Yes (Improvement Tracker) | — |
| Q42 | Which agent costs the most per successful outcome? | Yes (Agent detail) | — |
| Q43 | Failure rate trend over the last quarter? | Partial (30-day only) | 7 |
| Q44 | Can I see what an agent does step-by-step? | **Gap** | 7 |
| Q45 | What happens when an agent fails — who catches it? | Partial | 7 |
| Q46 | How fast are my agents responding? | Yes (P95 Latency) | — |
| Q47 | Are agents getting faster or slower over time? | **Gap** | 7 |
| Q48 | Which tasks are agents worst at? | Partial (per-defect-type only) | 7 |
| Q49 | Can I see a specific run that failed and why? | **Gap** | 7 |
| Q50 | What's the agent uptime / availability? | **Gap** | 7 |
| **Financial (Deeper)** | | | |
| Q51 | What's the total cost of AI ownership (TCO)? | Partial | 8 |
| Q52 | How does ROI change if I add one more agent? | **Gap** | 8 |
| Q53 | What's the payback period for each agent? | **Gap** | 8 |
| Q54 | Cost per department, not just per process? | **Gap** | 8 |
| Q55 | Cost trend by model (GPT vs Claude)? | Partial | 8 |
| Q56 | How much would switching models save? | **Gap** | 8 |
| Q57 | Marginal cost of scaling an agent? | **Gap** | 8 |
| Q58 | Over-spending on oversight for high-performing agents? | Partial | 8 |
| Q59 | Inference cost per token across agents? | **Gap** | 8 |
| Q60 | What % of AI spend is wasted on failures? | Partial | 8 |
| **Workforce (Deeper)** | | | |
| Q61 | Which team members are most affected? | **Gap** | 9 |
| Q62 | What new roles should we create? | Partial | 9 |
| Q63 | Are humans overriding good agent decisions? | Partial | 7 |
| Q64 | Time spent reviewing AI output? | Partial | 9 |
| Q65 | Employee satisfaction impact? | **Gap** | 9 |
| Q66 | What happens if we hire 2 more people? | **Gap** | 8 |
| Q67 | What tasks should we automate next? | Partial | 7 |
| Q68 | Human error rate vs agent error rate? | **Gap** | 9 |
| **Governance (Deeper)** | | | |
| Q69 | ISO 42001 compliant? | Partial | 9 |
| Q70 | Generate a compliance certificate? | **Gap** | 9 |
| Q71 | Audit readiness score? | Partial | 9 |
| Q72 | Who approved the most overrides? | Partial | 7 |
| Q73 | Overrides correlated with time of day? | **Gap** | 7 |
| Q74 | Different governance rules per geography? | **Gap** | 9 |
| Q75 | All decisions from March for a regulator? | Yes (Audit + export) | — |
| Q76 | Prove human-in-the-loop for high-risk? | Partial | 9 |
| Q77 | Mean time between governance violations? | **Gap** | 9 |
| Q78 | Alert when compliance drops below threshold? | Yes (Alert rules) | — |
| **Operational (Deeper)** | | | |
| Q79 | Pause all agents at once (kill switch)? | **Gap** | 9 |
| Q80 | Blast radius if agent goes rogue? | Partial | 9 |
| Q81 | Roll back to previous version? | Partial | 9 |
| Q82 | Dependency map between agents? | **Gap** | 9 |
| Q83 | Which agents share data sources? | **Gap** | 9 |
| Q84 | What happens during peak hours? | Partial | 7 |
| Q85 | Set maintenance windows? | **Gap** | 9 |
| Q86 | Recovery time when agent fails? | **Gap** | 7 |
| **Strategic (C-Suite)** | | | |
| Q87 | Where on the AI maturity curve? | Partial | 8 |
| Q88 | How do we compare to competitors? | Yes (Benchmarks) | — |
| Q89 | AI strategy readiness? | **Gap** | 8 |
| Q90 | Present to the board in 5 minutes? | Yes (Board Report) | — |
| Q91 | 3-year projection? | **Gap** | 8 |
| Q92 | Should we build or buy more agents? | **Gap** | 8 |
| Q93 | AI risk exposure summary? | Partial | 9 |
| Q94 | See this on my phone? | **Gap** | 9 |
| Q95 | Show this to investors? | Partial | 8 |
| Q96 | Competitive moat from AI agents? | **Gap** | 8 |
| **Integration (Deeper)** | | | |
| Q97 | Connect to HR system? | Partial | 9 |
| Q98 | Agents trigger actions in other systems? | **Gap** | 9 |
| Q99 | Import data from Langfuse/LangSmith? | **Gap** | 9 |
| Q100 | Set up SSO for my team? | **Gap** | 9 |

---

## Phase 7: Deep Observability (~30h)

> **Theme**: "I can see the dashboard. Now show me what's actually happening inside."
> **Answers**: Q43, Q44, Q45, Q47, Q48, Q49, Q50, Q63, Q67, Q72, Q73, Q84, Q86
> **Design rule**: Every screen opens with a plain-English answer. Trace data is progressive disclosure — CEO sees summary, engineer can drill into spans.

### 7.1 — Run Trace Viewer

**Route**: Enhanced `/agents/[id]` — "Run History" section becomes interactive

#### 7.1.1 Run Detail Panel (Q44, Q49) — 4h
- Click any run in Run History to expand a full trace view
- **CEO view** (top): "This run succeeded in 1.2s, cost $0.025, processed 3 steps"
- **Engineer view** (expandable): Span timeline — horizontal bars showing each agent step with duration, status, token count
- Span names: OddsScraperAgent → LineComparisonAgent → RecommendationWriterAgent
- Failed runs: highlight the failing span in red, show error message
- Component: `components/telemetry/RunDetailPanel.tsx`
- Mock: expand existing RUN_HISTORY entries with span data (already have Span type)

#### 7.1.2 Failure Escalation Flow (Q45) — 2h
- On failed runs, show the chain: "Agent failed → Escalated to human → Resolved by [reviewer] in [X] mins"
- Connect run failures to audit log entries where available
- Component: `components/telemetry/FailureEscalationCard.tsx`
- Surface as a callout inside the run detail panel

### 7.2 — Trend Analytics

#### 7.2.1 Extended Trend View (Q43, Q47) — 3h
- Sigma scorecard currently shows 30-day DPMO trend
- Add time range selector: "30 days | 60 days | 90 days | 6 months"
- Add latency trend chart alongside DPMO trend (Q47)
- Place in `/process/[id]/sigma` as new section
- Component: `components/sigma/ExtendedTrends.tsx`
- Mock: generate 90-day and 6-month trend data

#### 7.2.2 Peak Hour Analysis (Q84) — 2h
- Heatmap showing run volume and failure rate by hour-of-day × day-of-week
- Surface on agent detail page or monitoring page
- CEO reads: "Most failures happen between 2-4 PM on Fridays"
- Component: `components/telemetry/PeakHourHeatmap.tsx`

### 7.3 — Task-Level Performance

#### 7.3.1 Per-Task Agent Quality (Q48, Q67) — 3h
- On the Task Ownership page (`/process/[id]/coverage`), add per-task quality metrics
- Each task card shows: success rate, avg latency, cost — specific to that task
- "Next best task to automate" recommendation based on automation score + adjacent agent quality
- CEO reads: "Agents are worst at 'Generate client recommendations' (61% success). Best candidate for next automation: 'Review automated recommendations' (high automation score, adjacent to existing agent)"
- Component: `components/coverage/TaskPerformanceOverlay.tsx`

#### 7.3.2 Override Quality Analysis (Q63, Q72) — 3h
- In Audit Trail, add a new section: "Were the overrides correct?"
- Per-reviewer breakdown: reviewer name, override count, "helpful override rate" (mock: 70% of overrides were justified)
- Temporal pattern chart: overrides by hour-of-day (Q73)
- CEO reads: "Marcus Webb overrides most often (8 times), 75% of his overrides improved outcomes"
- Component: `components/governance/OverrideQualityAnalysis.tsx`

### 7.4 — Reliability Metrics

#### 7.4.1 Agent Availability & MTTR (Q50, Q86) — 3h
- Add availability metric to agent header: "99.2% uptime (last 30 days)"
- Add MTTR (Mean Time to Recovery): "Avg recovery: 12 minutes"
- Show downtime incidents (mock: 2-3 incidents with timestamps and duration)
- Component: `components/telemetry/AvailabilityCard.tsx`
- Place on agent detail page below metrics bar

### New routes: 0 (all enhancements to existing pages)
### New components: ~8
### Mock data additions: extended trend data, span data, peak hour data, override quality data, availability data

---

## Phase 8: Financial Modeling (~25h)

> **Theme**: "I believe the current numbers. Now model the future."
> **Answers**: Q51, Q52, Q53, Q54, Q55, Q56, Q57, Q58, Q59, Q60, Q66, Q87, Q89, Q91, Q92, Q95, Q96
> **Design rule**: Every model shows assumptions explicitly. Sliders and toggles let the user change inputs and see results instantly. No black boxes.

### 8.1 — Scenario Modeler

**Route**: New `/insights/scenarios`

#### 8.1.1 What-If Scenario Builder (Q52, Q66, Q57) — 5h
- Interactive page: "What happens if..."
  - "...I add 1 more agent to Customer Service?" → shows projected ROI change, coverage change, headcount impact
  - "...I hire 2 more analysts?" → shows per-person ROI change, oversight capacity impact
  - "...I scale Odds Analysis to 200 runs/day?" → shows marginal cost curve, projected spend
- Sliders for each variable, results update in real-time
- CEO reads: "Adding 1 agent to Customer Service would increase coverage from 31% to 48% and ROI from $612 to ~$940/week"
- Component: `components/insights/ScenarioBuilder.tsx`
- Sidebar: Add under INSIGHTS as "What-If Scenarios"

#### 8.1.2 Payback Calculator (Q53) — 2h
- Per-agent payback period: setup cost ÷ weekly net ROI = weeks to break even
- Visual timeline showing when each agent "pays for itself"
- Include on Financial Impact page as new tab: "Payback"
- CEO reads: "Odds Analysis Agent paid back its setup cost in 3.2 weeks"
- Component: `components/roi/PaybackTimeline.tsx`

### 8.2 — Cost Deep-Dive

#### 8.2.1 TCO View (Q51, Q58, Q59, Q60) — 3h
- Total Cost of Ownership breakdown: inference + oversight + governance + setup + training
- Show "waste ratio": what % of spend goes to failed runs
- Per-agent oversight efficiency: high-performing agents should need less oversight
- Token-level cost breakdown (cost/token by agent)
- Add as tab on Financial Impact: "TCO Breakdown"
- Component: `components/roi/TcoBreakdown.tsx`

#### 8.2.2 Model Cost Comparison (Q55, Q56) — 3h
- Side-by-side comparison: "What if Recommendation Writer used Claude instead of GPT-4o?"
- Table: current model metrics vs projected metrics with different model
- Cost projection: monthly spend change, quality change estimate
- Add to agent manage page or as standalone `/insights/model-comparison`
- Component: `components/insights/ModelComparison.tsx`

### 8.3 — Strategic Projections

#### 8.3.1 AI Maturity Score (Q87, Q89) — 3h
- New section on dashboard or new route `/insights/maturity`
- Maturity assessment across 5 dimensions: Coverage, Quality, ROI, Governance, Workforce Readiness
- Score 1-5 per dimension, with overall score
- Radar chart + recommendations: "You're at Level 3 (Scaling). To reach Level 4 (Optimized), focus on governance coverage."
- Component: `components/insights/MaturityScore.tsx`

#### 8.3.2 Long-Range Projection (Q91, Q95, Q96) — 3h
- Extend workforce planning from 12 months to 36 months
- Include in Financial Impact as tab: "3-Year Projection"
- Charts: cumulative ROI, headcount trajectory, agent coverage growth
- "Investor slide" mode: key metrics in presentation-ready format
- Component: `components/roi/LongRangeProjection.tsx`

#### 8.3.3 Build vs Buy Analysis (Q92) — 3h
- For each process: "Should we build a custom agent or buy a vendor solution?"
- Comparison table: custom (cost, time, control) vs vendor (cost, time, risk)
- Decision matrix with weighted scoring
- Place under PLANNING or INSIGHTS
- Component: `components/insights/BuildVsBuy.tsx`

### New routes: 2 (`/insights/scenarios`, `/insights/maturity`)
### New tabs: 3 (Payback, TCO, 3-Year on Financial Impact)
### New components: ~8
### Sidebar: Add "What-If Scenarios" and "AI Maturity" under INSIGHTS

---

## Phase 9: Operational Controls & Strategic (~25h)

> **Theme**: "I trust the data. Now give me the controls."
> **Answers**: Q61, Q62, Q64, Q65, Q68, Q69, Q70, Q71, Q74, Q76, Q77, Q79, Q80, Q81, Q82, Q83, Q85, Q93, Q94, Q97, Q98, Q99, Q100
> **Design rule**: Controls must feel safe. Destructive actions require confirmation with impact preview (like decommission flow). Status is always visible.

### 9.1 — Operational Controls

#### 9.1.1 Global Kill Switch (Q79) — 2h
- "Emergency Pause All Agents" button on Live Monitor page
- Confirmation dialog: "This will pause all 4 agents across 2 processes. Human-only mode will activate."
- Shows impact: affected tasks, estimated manual workload increase
- Status banner across all pages when active: "ALL AGENTS PAUSED — manual mode active"
- Component: `components/monitoring/EmergencyPause.tsx`

#### 9.1.2 Agent Dependency Map (Q82, Q83) — 3h
- Visual graph showing agent relationships: which agents feed into which
- Data source sharing: "Odds Analysis and Line Comparison both use the odds feed API"
- Place on Agent Comparison page or new `/agents/dependencies`
- Component: `components/telemetry/DependencyMap.tsx`

#### 9.1.3 Maintenance Windows & Recovery (Q85, Q81) — 2h
- Add to agent manage page: schedule maintenance windows
- "Roll back to v2" button on version timeline (mock: toast + metrics revert)
- MTTR tracking integrated with availability (from Phase 7)
- Component: `components/telemetry/MaintenanceScheduler.tsx`

### 9.2 — Compliance & Certification

#### 9.2.1 Compliance Dashboard (Q69, Q70, Q71, Q76) — 4h
- New route: `/governance/compliance`
- ISO 42001 / EU AI Act compliance checklist with pass/fail per requirement
- Audit readiness score: "87% audit-ready"
- "Generate Compliance Certificate" button → PDF with checklist, scores, timestamps
- Human-in-the-loop evidence chain: for each high-risk task, show the complete decision trail
- Component: `components/governance/ComplianceDashboard.tsx`
- Sidebar: Add under GOVERNANCE as "Compliance"

#### 9.2.2 Geo-Scoped Rules & MTBV (Q74, Q77) — 2h
- Extend governance rules with geography selector (EU, US, APAC)
- Add MTBV (Mean Time Between Violations) metric to rules page
- Component: extend existing `GovernanceRuleCard.tsx`

### 9.3 — Workforce Intelligence

#### 9.3.1 Human vs Agent Comparison (Q68, Q63) — 3h
- Side-by-side comparison: human error rate (from override data) vs agent error rate (from runs)
- Per-task: "Humans make 3% errors on this task, agent makes 12% — human is better here"
- Place on Task Ownership page as overlay
- Component: `components/coverage/HumanVsAgentComparison.tsx`

#### 9.3.2 Team Impact View (Q61, Q64, Q65) — 3h
- Per-team-member impact: hours freed, new oversight hours, net change
- Mock: 3-4 team members with individual impact cards
- Satisfaction indicator (mock: survey score)
- Place under workforce planning or new section
- Component: `components/labor/TeamImpactCards.tsx`

### 9.4 — Platform Hardening

#### 9.4.1 Mobile Responsive Pass (Q94) — 3h
- Responsive breakpoints for all key pages: dashboard, agent detail, monitoring
- Sidebar becomes hamburger menu on mobile
- Cards stack vertically, charts scale
- This is a CSS/layout pass, not new components

#### 9.4.2 Risk Exposure Summary (Q93, Q80) — 2h
- Single-page risk summary: "Your AI Risk Profile"
- Aggregates: governance violations, oversight gaps, failing agents, compliance score
- Place on dashboard as a card or under GOVERNANCE
- CEO reads: "Your total AI risk exposure: LOW — 2 minor violations, 1 agent declining, 87% audit-ready"
- Component: `components/dashboard/RiskExposureSummary.tsx`

#### 9.4.3 Integration Stubs (Q97, Q98, Q99, Q100) — 3h
- HR System connector stub in integrations page (mock wizard like BI tools)
- Observability import stub: "Connect Langfuse" / "Connect LangSmith" (mock)
- SSO configuration stub: "Configure SAML SSO" (mock)
- Outbound webhook actions: "When agent fails → create Jira ticket" (mock)
- Extend existing `/settings/integrations` with new tab: "Connectors"

### New routes: 2 (`/governance/compliance`, `/agents/dependencies`)
### New components: ~12
### Sidebar: Add "Compliance" under GOVERNANCE

---

## Phase Summary (Complete Roadmap)

| Phase | Theme | Status | Questions Answered |
|---|---|---|---|
| Phase 1 | Core Demo | DONE | Q7, Q14-Q16, Q27, Q31, Q36 |
| Phase 2 | Complete Platform | DONE | Q1, Q8, Q11, Q17, Q22, Q29, Q33 |
| Phase 3 | Operational Maturity | DONE | Q2, Q3, Q5, Q9, Q10, Q18-Q20, Q23, Q28, Q32, Q34, Q37, Q38 |
| Phase 4 | Enterprise Features | DONE | Q4, Q6, Q12, Q21, Q24, Q25, Q30, Q35 |
| Phase 5 | Platform & Integration | DONE | Q13, Q26, Q39, Q40 |
| Phase 6 | UX Redesign | DONE | (improved all existing answers) |
| Phase 7 | Deep Observability | PLANNED | Q43-Q45, Q47-Q50, Q63, Q67, Q72, Q73, Q84, Q86 |
| Phase 8 | Financial Modeling | PLANNED | Q51-Q60, Q66, Q87, Q89, Q91, Q92, Q95, Q96 |
| Phase 9 | Operational Controls | PLANNED | Q61, Q62, Q64, Q65, Q68-Q71, Q74, Q76, Q77, Q79-Q83, Q85, Q93, Q94, Q97-Q100 |

**After Phase 9**: 100/100 CEO questions answered across ~45 routes and 80+ components.
