# Agent Quality Platform — Phases 3, 4 & 5

> **Anchor**: Every feature below answers a real CEO/COO/CFO/CTO question.
> **Method**: We list the question first, then the feature that answers it.

---

## CEO Questions → Feature Mapping

Before defining phases, here's the complete question set that drives the roadmap:

### Category 1: Agent Lifecycle Management
| # | Question | Answered By | Phase |
|---|---|---|---|
| Q1 | How do I add a new agent? | A2 Occupation Selector + A3 Agent Mapper | Phase 2 |
| Q2 | How do I remove/decommission a bad agent? | **Agent Decommission Flow** | Phase 3 |
| Q3 | How do I replace one agent with another? | **Agent Swap/Migration Tool** | Phase 3 |
| Q4 | How do I test an agent before promoting to production? | **Agent Staging/Canary View** | Phase 4 |
| Q5 | How do I compare two agents doing the same task? | **Agent A/B Comparison** | Phase 3 |
| Q6 | How do I see agent version history? | **Agent Version Timeline** | Phase 4 |

### Category 2: ROI & Financial
| # | Question | Answered By | Phase |
|---|---|---|---|
| Q7 | What's the total ROI across all processes? | B1 Dashboard (done) | Phase 1 ✅ |
| Q8 | What's ROI per individual agent? | **Per-Agent ROI Card** | Phase 2 |
| Q9 | What's the cost of NOT fixing a bad agent? | **Cost of Inaction Calculator** | Phase 3 |
| Q10 | How much are we spending on inference per month? | **Cost Trend Dashboard** | Phase 3 |
| Q11 | What's the ROI projection for next quarter? | C5 Roadmap (done) | Phase 2 |
| Q12 | Can I set a budget cap per agent? | **Budget Alerts & Caps** | Phase 4 |
| Q13 | How does our ROI compare to industry benchmarks? | **Benchmark Comparison** | Phase 5 |

### Category 3: Performance & Quality
| # | Question | Answered By | Phase |
|---|---|---|---|
| Q14 | Which agent is the best performer? | C4 Sigma Scorecard (done) | Phase 1 ✅ |
| Q15 | Which agent is underperforming? | C4 + Dashboard alerts (done) | Phase 1 ✅ |
| Q16 | How do I get insights on improving an agent? | D1 Defect Analysis (done) | Phase 1 ✅ |
| Q17 | What's the root cause of failures? | D3 FMEA Risk Board | Phase 2 |
| Q18 | How do I track improvement over time? | **Improvement Tracker** | Phase 3 |
| Q19 | How do I set SLA targets per agent? | **SLA Configuration** | Phase 3 |
| Q20 | How do I get alerted when quality drops? | **Alert Rules Engine** | Phase 3 |
| Q21 | Can I see real-time agent performance? | **Live Monitoring View** | Phase 4 |

### Category 4: Reporting & Communication
| # | Question | Answered By | Phase |
|---|---|---|---|
| Q22 | Can I download a report for all agents? | B3 Board Export | Phase 2 |
| Q23 | Can I schedule weekly reports? | **Scheduled Reports** | Phase 3 |
| Q24 | Can I share a dashboard link with stakeholders? | **Shareable Dashboard Links** | Phase 4 |
| Q25 | Can I get a Slack/Teams notification? | **Notification Channels** | Phase 4 |
| Q26 | Can I export to our existing BI tool? | **API & Webhook Export** | Phase 5 |

### Category 5: Team & Workforce
| # | Question | Answered By | Phase |
|---|---|---|---|
| Q27 | What skills does my team need now? | C2 Labor Graph (done) | Phase 1 ✅ |
| Q28 | How do I plan training for the team? | **Skills Gap & Training Plan** | Phase 3 |
| Q29 | How does the team's role evolve as agents improve? | C5 Roadmap (done) | Phase 2 |
| Q30 | What's the headcount impact over 12 months? | **Workforce Planning Model** | Phase 4 |

### Category 6: Governance & Compliance
| # | Question | Answered By | Phase |
|---|---|---|---|
| Q31 | Are we EU AI Act compliant? | D2 Audit Log (done) | Phase 1 ✅ |
| Q32 | What's the override rate trend? | **Override Trend Analysis** | Phase 3 |
| Q33 | Can I export for external auditors? | B3 Export + D2 Export | Phase 2 |
| Q34 | Which decisions have no human oversight? | **Oversight Gap Report** | Phase 3 |
| Q35 | Can I set mandatory human review for high-risk tasks? | **Governance Rules** | Phase 4 |

### Category 7: Multi-Org & Scaling
| # | Question | Answered By | Phase |
|---|---|---|---|
| Q36 | Can I use this for multiple departments? | Multi-process (done) | Phase 1 ✅ |
| Q37 | Can different teams have different quality targets? | **Per-Process Sigma Targets** | Phase 3 |
| Q38 | Can I benchmark across departments? | **Cross-Process Benchmark** | Phase 3 |
| Q39 | Can we white-label this for our clients? | **White-Label Configuration** | Phase 5 |
| Q40 | Can multiple organisations use one instance? | **Multi-Tenant Architecture** | Phase 5 |

---

## Phase 3: Operational Maturity (~35 hours)

> **Theme**: "Now that I can see the data, I want to act on it."
> Answers: Q2, Q3, Q5, Q9, Q10, Q18, Q19, Q20, Q23, Q28, Q32, Q34, Q37, Q38

### 3.1 — Agent Lifecycle Actions

**Route**: Enhanced `/agents/[id]` + new `/agents/[id]/manage`

#### 3.1.1 Agent Decommission Flow (Q2) — 3h
- Add "Actions" dropdown to Agent Telemetry header: Decommission, Pause, Reassign
- **Decommission**: Confirmation dialog showing impact analysis:
  - "This agent handles 18% of Sports Betting Analyst tasks"
  - "Decommissioning will reduce agent coverage from 43% to 25%"
  - "Estimated weekly ROI impact: -$687/week"
  - "Tasks will revert to: Collaborative (human review required)"
- Mock: Shows toast "Agent decommissioned" and marks status as `decommissioned` in UI
- Sidebar shows strikethrough for decommissioned agents

#### 3.1.2 Agent Swap/Migration Tool (Q3) — 2h
- "Replace Agent" action in the dropdown
- Shows a modal: "Replace Recommendation Writer Agent with..."
  - Option A: "New agent (not yet deployed)" — placeholder
  - Option B: "Existing agent" — select from list
- Impact comparison table: old agent metrics vs new agent (mock: show an improved version)
- "This swap will affect 2 tasks covering 11% of role time"

#### 3.1.3 Agent A/B Comparison (Q5) — 3h
- New route: `/agents/compare`
- Select two agents to compare side-by-side
- Comparison metrics: sigma, DPMO, OEE, success rate, cost, latency, defect breakdown
- Radar chart (Recharts) showing 6 dimensions
- Winner callout: "Odds Analysis Agent outperforms Line Comparison Agent in 5 of 6 dimensions"

### 3.2 — Cost & Financial Intelligence

**Route**: New `/dashboard/costs`

#### 3.2.1 Cost Trend Dashboard (Q10) — 3h
- Monthly cost trend chart (Recharts AreaChart): last 6 months of inference spend
- Per-agent cost breakdown stacked bar chart
- Cost efficiency metric: $/successful task
- Month-over-month change indicators
- Seeded data: 6 months of mock cost data

#### 3.2.2 Cost of Inaction Calculator (Q9) — 2h
- Add to Agent Telemetry page as a collapsible section
- "If Recommendation Writer stays at 2.9σ for the next 90 days:"
  - Failed tasks: ~42 more failures (14/month × 3)
  - Revenue at risk: $X (failed tasks × value per success)
  - Oversight cost increase: $Y (more human reviews needed)
  - Compliance risk: Z audit entries without adequate quality
- Compelling visual: escalating risk timeline

### 3.3 — Alert & SLA Engine

**Route**: New `/settings/alerts`

#### 3.3.1 SLA Configuration (Q19) — 2h
- Per-agent SLA settings: latency target, cost cap, success rate floor
- Visual SLA editor with sliders
- Current vs target comparison
- Mock: Pre-populated with reasonable defaults, save shows toast

#### 3.3.2 Alert Rules Engine (Q20) — 3h
- Configure alert triggers:
  - "Alert when sigma drops below [X]" (slider)
  - "Alert when override rate exceeds [X]%" (slider)
  - "Alert when weekly cost exceeds $[X]" (input)
  - "Alert when success rate drops below [X]%" (slider)
- Alert history table: 5-6 seeded alerts with timestamps, type, agent, resolution
- Alert status: Active | Acknowledged | Resolved
- Severity: Critical | Warning | Info

### 3.4 — Performance Tracking

#### 3.4.1 Improvement Tracker (Q18) — 3h
- Add to Sigma Scorecard (C4) as a new section below the DPMO trend
- Table: Agent | 30 days ago | 14 days ago | Today | Trend | Status
- "Odds Analysis: 3.8σ → 4.0σ → 4.2σ ↑ Improving"
- "Recommendation Writer: 3.1σ → 3.0σ → 2.9σ ↓ Declining"
- Weekly improvement rate calculated
- Target date projection: "At current rate, Recommendation Writer reaches 4.0σ by: Never (declining)"

#### 3.4.2 Override Trend Analysis (Q32) — 2h
- Add to Audit Log (D2) as a new chart section
- Weekly override rate trend (Recharts line chart, last 8 weeks)
- Per-task override rate breakdown
- Correlation callout: "High override rate on recommendation tasks correlates with Recommendation Writer's 2.9σ score"

### 3.5 — Governance Enhancements

#### 3.5.1 Oversight Gap Report (Q34) — 2h
- Add to Governance section: `/governance/oversight`
- Shows tasks that are agent-owned but have no human review process
- Risk assessment per unreviewed task
- Recommendation: "Consider moving these to Collaborative until agent quality reaches 5.0σ"

### 3.6 — Reporting Enhancements

#### 3.6.1 Scheduled Reports (Q23) — 2h
- Add to Board Export (B3): "Schedule" tab
- Frequency: Weekly | Biweekly | Monthly
- Recipients: email input list (mock — accepts input, shows toast)
- Day/time selector
- "Next scheduled: Monday, April 7 at 9:00 AM"
- Pre-populated with 2 scheduled reports

### 3.7 — Skills & Training

#### 3.7.1 Skills Gap & Training Plan (Q28) — 3h
- New route: `/process/[id]/training`
- Shows skills gap analysis derived from Labor Graph:
  - Skills to develop: AI output review, Exception escalation, Prompt engineering
  - Priority: High/Medium/Low based on time weight of affected tasks
  - Suggested training: linked to skill name (mock URLs)
- Training progress tracker (mock: 3 team members with progress bars)
- Add "Training plan" sub-item in sidebar under each process

### 3.8 — Cross-Process Intelligence

#### 3.8.1 Cross-Process Benchmark (Q37, Q38) — 3h
- New route: `/dashboard/benchmark`
- Side-by-side process comparison table
- Metrics: avg sigma, OEE, coverage %, net ROI, cost efficiency
- Ranking: which process is most mature
- Best practices extraction: "Sports Betting's Odds Analysis Agent (4.2σ) can serve as a template for Customer Service"
- Add to sidebar under OVERVIEW

---

## Phase 4: Enterprise Features (~30 hours)

> **Theme**: "I need to scale this across the organization and manage it like enterprise software."
> Answers: Q4, Q6, Q12, Q21, Q24, Q25, Q30, Q35

### 4.1 — Agent Staging & Versioning

#### 4.1.1 Agent Staging/Canary View (Q4) — 4h
- New route: `/agents/[id]/staging`
- Shows two panels: "Production" (current) vs "Staging" (candidate)
- Staging metrics from mock data (slightly better sigma, different model)
- "Promote to Production" button (mock: toast + metrics swap)
- Traffic split visualization: "Currently: 100% production / 0% staging"
- Risk assessment: "Staging agent has been tested on 50 runs with 92% success rate"

#### 4.1.2 Agent Version Timeline (Q6) — 3h
- Add to Agent Telemetry: "Version History" tab
- Timeline showing model changes, config updates, sigma score at each version
- Example entries:
  - "v3 (current): claude-sonnet-4-6, CrewAI, deployed Mar 15"
  - "v2: gpt-4o, CrewAI, deployed Feb 1 — retired (cost overrun)"
  - "v1: gpt-3.5-turbo, LangChain, deployed Jan 5 — retired (quality)"
- Per-version sigma comparison chart

### 4.2 — Budget & Cost Controls

#### 4.2.1 Budget Alerts & Caps (Q12) — 3h
- New route: `/settings/budgets`
- Per-agent monthly budget cap with visual gauge (current spend vs cap)
- Budget utilization chart (Recharts, monthly bars with cap line)
- Alert when 80% budget consumed
- Projected end-of-month spend based on current run rate
- "At current rate, Recommendation Writer will hit budget cap in 8 days"

### 4.3 — Real-Time Monitoring

#### 4.3.1 Live Monitoring View (Q21) — 5h
- New route: `/monitoring`
- Simulated live dashboard (mock: auto-refreshing metrics every 5 seconds using setInterval)
- Active agents: status dots pulsing
- Last run: timestamp + status per agent
- Rolling success rate (last 1 hour / last 24 hours)
- Live event feed: scrolling list of recent runs with status
- System health: "All systems operational" or "Degraded — Recommendation Writer latency elevated"
- This is the "NOC screen" — designed to be projected on a wall

### 4.4 — Collaboration & Sharing

#### 4.4.1 Shareable Dashboard Links (Q24) — 2h
- "Share" button on each screen that generates a mock URL
- "Copy link" button with toast "Link copied"
- Access control UI: "Anyone with link" / "Team members only" / "Admins only"
- Expiry: "Link expires in 7 days"
- Pre-generated links table in Settings

#### 4.4.2 Notification Channels (Q25) — 3h
- New route: `/settings/notifications`
- Channel configuration:
  - Email (default): email inputs, frequency selector
  - Slack: workspace + channel input, "Test connection" button (mock)
  - Microsoft Teams: webhook URL input, "Test connection" button (mock)
- Notification rules: map alert types to channels
  - "Agent below sigma target" → Slack #ai-alerts + Email
  - "Override rate > 25%" → Email compliance team
  - "Budget cap reached" → Email finance + Slack #ops
- Recent notifications table (seeded: 5-6 entries)

### 4.5 — Workforce Planning

#### 4.5.1 Workforce Planning Model (Q30) — 4h
- New route: `/process/[id]/workforce`
- 12-month projection based on Transformation Roadmap stages
- Charts:
  - Headcount need over time (Recharts: agents replace hours, not people)
  - Skills demand curve (which skills peak when)
  - Cost projection (salary costs declining, agent costs increasing, net savings growing)
- Scenario toggle: "Conservative" / "Moderate" / "Aggressive" automation pace
- "At moderate pace, 3 of 12 analysts can be redeployed to higher-value roles by Q4 2026"
- Add "Workforce plan" sub-item in sidebar under each process

### 4.6 — Governance Rules

#### 4.6.1 Governance Rules Engine (Q35) — 3h
- New route: `/governance/rules`
- Configurable rules:
  - "All tasks with automation score < 0.30 MUST remain human-owned"
  - "All collaborative tasks MUST have human review within 5 minutes"
  - "Agents below 3.0σ MUST have mandatory human gate"
  - "Any task touching financial data requires dual sign-off"
- Rules table: name, condition, enforcement level (block/warn/log), status (active/disabled)
- Compliance score: "8 of 10 rules satisfied (80%)"
- Non-compliant items highlighted with recommended actions

---

## Phase 5: Platform & Integration (~25 hours)

> **Theme**: "I want to connect this to everything else and make it the standard across the company."
> Answers: Q13, Q26, Q39, Q40, plus new integration questions

### 5.1 — External Integrations

#### 5.1.1 API & Webhook Export (Q26) — 4h
- New route: `/settings/integrations`
- API key management (generate/revoke mock keys)
- Webhook configuration:
  - URL input + event selector (agent.quality.changed, audit.decision.made, roi.updated)
  - "Test webhook" button (mock)
  - Recent webhook deliveries table (seeded: 5 entries with status)
- API documentation preview: OpenAPI-style endpoint reference embedded in the page
  - `GET /api/v1/processes` — list all processes
  - `GET /api/v1/agents/{id}/sigma` — current sigma score
  - `GET /api/v1/roi/snapshot` — latest ROI data
  - `POST /api/v1/reports/generate` — trigger report generation

#### 5.1.2 BI Tool Integration (Q26) — 3h
- Add to Integrations page:
  - "Connect to PowerBI" — shows mock connection wizard (3 steps)
  - "Connect to Tableau" — similar wizard
  - "Connect to Looker" — similar wizard
  - Each wizard: endpoint URL, auth, dataset selection, "Test connection"
- Data dictionary: table of all available metrics with descriptions and refresh rates
- "Embed dashboard" — iframe code snippet generator (mock)

### 5.2 — Benchmarking

#### 5.2.1 Industry Benchmark Comparison (Q13) — 4h
- New route: `/dashboard/benchmarks`
- Compare your org's metrics against "industry averages" (seeded):
  - Your sigma: 4.2σ vs Industry avg: 3.6σ vs Top 10%: 5.1σ
  - Your OEE: 83% vs Industry: 72% vs Top 10%: 91%
  - Your ROI/agent: $475/wk vs Industry: $280/wk vs Top 10%: $850/wk
- Percentile ranking: "FuzeBox AI is in the top 25% of gaming companies for agent quality"
- Improvement recommendations based on gap analysis
- Charts: bar chart comparisons, spider/radar chart of dimensions

### 5.3 — White-Label & Multi-Tenant

#### 5.3.1 White-Label Configuration (Q39) — 4h
- New route: `/settings/branding`
- Customizable:
  - Logo upload (mock: file input with preview)
  - Primary color picker
  - Company name (replaces "r-Potential" in sidebar)
  - Subtitle (replaces "Powered by FuzeBox")
  - Report footer text
- Live preview panel showing how the sidebar looks with changes
- "Apply branding" button (mock: toast, sidebar updates with new name/color)

#### 5.3.2 Multi-Tenant Workspace (Q40) — 5h
- New route: `/admin/organisations`
- Organisation list table:
  - FuzeBox AI (current) — 2 processes, 4 agents, $2,038/wk ROI
  - "Acme Corp" (seeded second tenant) — 1 process, 2 agents, $1,200/wk ROI
- Organisation detail:
  - Users list with roles
  - Processes list with status
  - Data isolation indicator: "Row-level security: Active"
- "Create organisation" button (mock: form wizard, toast)
- Switch tenant dropdown in TopBar: "FuzeBox AI ▼"

### 5.4 — Advanced Analytics

#### 5.4.1 Anomaly Detection (new) — 3h
- Add to Dashboard: "Anomalies" section
- Auto-detected anomalies (seeded):
  - "Recommendation Writer latency spiked 340% between 2:00-4:00 PM on Mar 28"
  - "Odds Analysis cost per run decreased 15% after model update on Mar 20"
  - "Customer Service override rate doubled in the last 7 days"
- Each anomaly: timestamp, severity, affected agent, description, "Investigate →" link
- Anomaly trend: "3 anomalies this week vs 1 last week"

#### 5.4.2 Correlation Engine (new) — 2h
- Add to Sigma Scorecard or new `/analytics/correlations`
- Auto-discovered correlations (seeded):
  - "Override rate is 85% correlated with agent sigma score (r=-0.85)"
  - "Latency breaches increase 3× during peak hours (2-4 PM)"
  - "Cost per run decreased 22% when switching from gpt-4o to claude-sonnet-4-6"
- Scatter plots for each correlation (Recharts ScatterChart)
- Actionable insight per correlation

---

## Complete Phase Summary

| Phase | Theme | Screens | Features | Est. Hours |
|---|---|---|---|---|
| **Phase 1** | April 7 Demo | 9 screens | Mock data, navigation, language toggle | ✅ DONE |
| **Phase 2** | Complete Platform | +6 screens | Setup flow, roadmap, FMEA, export, SERVQUAL | ~32h |
| **Phase 3** | Operational Maturity | +5 routes | Agent lifecycle, cost intelligence, alerts, training, benchmarks | ~35h |
| **Phase 4** | Enterprise Features | +6 routes | Staging, budgets, live monitoring, workforce planning, governance rules | ~30h |
| **Phase 5** | Platform & Integration | +5 routes | API/webhooks, BI tools, white-label, multi-tenant, anomaly detection | ~25h |
| **Total** | | **~31 screens** | | **~122h + Phase 1** |

---

## Final Screen Count by Phase

```
Phase 1 (DONE):
  /login, /dashboard, /dashboard/roi, /settings
  /process/[id], /process/[id]/labor, /process/[id]/sigma
  /agents/[id], /governance/audit
  = 9 screens

Phase 2:
  /setup/occupation, /setup/mapping, /dashboard/export
  /process/[id]/coverage, /process/[id]/roadmap
  /governance/fmea
  = 6 screens (total: 15)

Phase 3:
  /agents/[id]/manage, /agents/compare, /dashboard/costs
  /dashboard/benchmark, /settings/alerts, /governance/oversight
  /process/[id]/training
  = 7 screens (total: 22)

Phase 4:
  /agents/[id]/staging, /monitoring, /settings/budgets
  /settings/notifications, /process/[id]/workforce
  /governance/rules
  = 6 screens (total: 28)

Phase 5:
  /settings/integrations, /dashboard/benchmarks
  /settings/branding, /admin/organisations
  /analytics/correlations
  = 5 screens (total: 33)
```

---

## CEO Questions → Final Checklist

After all 5 phases, every question has an answer:

| Question | Screen | Phase |
|---|---|---|
| How do I add agents? | Setup → Occupation Selector → Agent Mapper | 2 |
| How is the process worked out? | Setup → Mapper → Coverage Map | 2 |
| How do I get ROI per agent? | Agent Telemetry → Process Context | 2 |
| How do I download reports? | Board Export → PDF/PPTX | 2 |
| Which agent is underperforming? | Sigma Scorecard + Dashboard alerts | 1 ✅ |
| How do I decommission an agent? | Agent Telemetry → Actions → Decommission | 3 |
| Which agent is best? | Sigma Scorecard + Dashboard | 1 ✅ |
| How do I improve an agent? | Defect Analysis + FMEA + Improvement Tracker | 1+2+3 |
| What happens to my team? | Labor Graph + Workforce Planning | 1+4 |
| Are we compliant? | Audit Log + Governance Rules | 1+4 |
| Can I get alerts? | Alert Rules Engine + Notification Channels | 3+4 |
| Can I share with my board? | Board Export + Shareable Links | 2+4 |
| How do we compare to industry? | Benchmark Comparison | 5 |
| Can other clients use this? | Multi-Tenant + White-Label | 5 |
| Can I connect to our BI tools? | API + Webhook + BI Integration | 5 |
| What's the cost of doing nothing? | Cost of Inaction Calculator | 3 |
| Can I plan headcount changes? | Workforce Planning Model | 4 |
| Can I set per-agent budgets? | Budget Alerts & Caps | 4 |
| What's happening right now? | Live Monitoring View | 4 |
| What should I investigate? | Anomaly Detection + Correlations | 5 |
