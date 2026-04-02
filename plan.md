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
| Phase 6 | **UX Redesign** | Restructure nav + pages | **PENDING** |

**Current state**: 35 routes, 60+ components, all building clean. Every CEO question (Q1-Q40) has a screen.
**Next priority**: UX redesign (see `redesign.md`) — the app works but doesn't explain itself.

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
