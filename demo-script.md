# Demo Script — r-Potential Agent Quality Platform

> **Audience**: C-suite / board-level decision makers (CEO, CFO, COO, CTO)
> **Presenter**: Anyone — designed to be reusable and shareable
> **Duration**: 20-25 minutes
> **Tone**: Outcome-focused, conversational, confident. Touch of technical flair where it earns trust.
> **Setup**: Chrome on large screen, app at https://agenttelemetry.vercel.app
> **Rule**: Never say "mock data" or "demo." Present as the real thing.
> **How to use**: Walk through each act in order. Quoted text (>) is suggested talk track — adapt to your own voice. **[Bold in brackets]** are screen actions. Pause where indicated.

---

## Opening (30 seconds)

> "Every company running AI agents today has the same problem. They know AI is doing *something* useful — but they can't tell their board *how much*, *how reliably*, or whether the humans working alongside it are better or worse off.
>
> When the CFO asks 'What's our return on AI?' — the answer is usually a guess dressed up as a number.
>
> This platform is the missing measurement layer. Let me show you what it looks like when you actually have the answer."

**[Screen: Dashboard]**

---

## Act 1: The Executive View (3 minutes)

### Screen: Dashboard (`/dashboard`)

> "This is what your CEO sees on Monday morning. One sentence tells the whole story:"

**Point to hero banner:**
> "'4 AI agents working across 2 job roles, saving $2,038 per week after all costs.' That's the net number — not inflated, not gross. After every cost is deducted."

**Point to the four pills:**
> "Four distinct audiences and personas get their answer in one glance:
> - **Quality**: your agents are averaging 3.4 sigma — that's the same quality standard Toyota uses for manufacturing
> - **Workforce**: 37% of work is now automated across both roles
> - **Finance**: $2,038 net per week, after oversight and inference costs
> - **Compliance**: audit trail is active — every human decision alongside AI is logged"

**Point to Attention Required section:**
> "And here's what needs your attention *right now*. The Recommendation Writer agent is declining — 2.9 sigma, trending down. If we don't fix it, that's $47 in additional cost over the next 90 days. Not a vague warning — a dollar figure."

**Point to process cards:**
> "Two job roles are being monitored. Sports Betting Analyst — green, healthy, $1,426 a week. Customer Service Rep — amber, needs attention, $612 a week. Each one tells you how many agents, what percentage is automated, and the net saving."

**Pause. Let it land.**

> "That's the board slide. One screen. No guessing."

---

## Act 2: The Workforce Truth (4 minutes)

### Screen: Process Detail — Sports Betting Analyst (`/process/sports-betting`)

**Click "View details" on Sports Betting card.**

> "Now let's go deeper. This is the Sports Betting Analyst role. 12 people, $42 an hour, 40 hours a week. That's a real job role from the US Department of Labor's O*NET database — not something we made up."

**Point to three-column layout:**
> "The platform answers a very specific question: *How is the work split between AI and humans?*"

**Point to left column:**
> "Left side: What AI is handling. 43% of this role's tasks are now done by agents. Average quality: 76%. Total inference cost: $38 a week. That's what you're paying the AI."

**Point to right column:**
> "Right side: What your team still owns. 37% of tasks stay with humans — the ones that require judgment, empathy, compliance sign-off. Things AI shouldn't do. But here's the key number: **17 hours freed per person per week**. Minus 12 hours of new oversight work. Net: **5 hours saved per person, per week.**"

**Point to center equation:**
> "The equation in the middle ties it together. Agent contribution times quality, plus human contribution times productivity, equals $1,426 a week. Every assumption is visible. Nothing hidden."

**Point to per-agent ROI breakdown:**
> "And it breaks down by agent. Odds Analysis: $613 a week. Line Comparison: $477. Recommendation Writer: $374. You can see exactly which agent is earning its keep."

**Point to ROI waterfall at bottom:**
> "The waterfall shows every deduction. Gross saving $2,116 — minus $483 for human oversight, minus $38 for inference, minus $169 for governance overhead — equals net $1,426. A CFO believes this number because they can see where every dollar went."

---

## Act 3: Agent Deep-Dive — The Good and The Bad (4 minutes)

### Screen: Agent Detail — Recommendation Writer (`/agents/recommendation-writer`)

**Click Recommendation Writer agent.**

> "Let's look at the agent that needs attention. Recommendation Writer. Running on Claude 3.5 Sonnet via CrewAI."

**Point to header:**
> "2.9 sigma, trending down. 'Critical' status. 61% success rate — that means 39% of its runs fail or breach SLA. That's not production quality."

**Point to Availability card:**
> "95.4% uptime, average recovery time 24 minutes. Three incidents in the last 30 days — including a prompt template corruption and a provider outage."

**Point to Cost of Inaction (expanded):**
> "Now here's what makes this platform different. It doesn't just tell you there's a problem — it tells you **what it costs to ignore it**."
>
> "'If we don't fix this, over the next 90 days: 42 additional failed tasks. $76 in revenue at risk. $57 in extra human reviews. 6 unaudited compliance entries.' Total projected impact: $133."
>
> "That's how you turn a quality metric into a board conversation. 'We need to fix the Recommendation Writer' becomes 'Every week we don't fix it costs us money and creates compliance risk.'"

### Screen: Agent Detail — Odds Analysis (`/agents/odds-analysis`)

**Navigate to Odds Analysis Agent.**

> "Now contrast that with a healthy agent. Odds Analysis: 4.2 sigma, trending up. 88% success rate. $0.025 per run. 99.8% uptime."
>
> "This is what good looks like. And notice — the Cost of Inaction section isn't even showing. Because there's no inaction needed. The system only raises alarms when there's a real problem."

---

## Act 4: Quality — The Sigma Standard (3 minutes)

### Screen: Sigma Scorecard (`/process/sports-betting/sigma`)

**Navigate to sigma scorecard.**

> "This is where the Six Sigma methodology comes in. Every agent gets scored using the same DPMO framework that manufacturing has used for 40 years. Defects Per Million Opportunities."

**Point to agent cards:**
> "Three agents, three scores. Odds Analysis at 4.2 sigma — that's supervised production quality. Line Comparison at 3.4 — needs tuning. Recommendation Writer at 2.9 — below the threshold, needs a human gate."

**Point to sigma legend:**
> "This translation scale is key. A quality leader walks in, sees '4.2 sigma,' and immediately knows what that means. No AI-specific jargon. The same standard they already trust."

**Point to Improvement Tracker:**
> "And here's the trend. Odds Analysis: 3.8 to 4.0 to 4.2 — improving. Recommendation Writer: 3.1 to 3.0 to 2.9 — declining. At current rate, it reaches the 4.0 target... never. That's the urgency signal."

**Point to time range selector:**
> "We can look at 30 days, 90 days, or 6 months of trend data. The latency trend runs alongside quality — so you can see if agents are getting slower, not just less accurate."

---

## Act 5: Governance & Compliance (3 minutes)

### Screen: Audit Trail (`/governance/audit`)

**Navigate to Audit Trail.**

> "The EU AI Act requires audit logs for every human decision made alongside AI. This platform generates that automatically."

**Point to summary cards:**
> "15 decisions logged. 27% override rate — that means humans changed the AI's recommendation 27% of the time. Average review time: 4.2 minutes. 93% compliance coverage."

**Point to override trend chart:**
> "The override rate is tracked weekly. If it spikes, that's a signal — either the agent is getting worse, or the human review process needs calibration."

**Point to override quality section:**
> "And here's something most platforms miss: **were the overrides correct?** Marcus Webb overrides most often — 8 times — but 75% of his overrides improved outcomes. That's a good reviewer. If that number drops, it's a training signal."

### Screen: Compliance Dashboard (`/governance/compliance`)

**Navigate to Compliance.**

> "For the board: an audit readiness score. 87%. ISO 42001 and EU AI Act requirements mapped to a checklist — pass, partial, or not started. You can generate a compliance certificate directly from this screen and export it as PDF."

### Screen: Risk Analysis (`/governance/fmea`)

**Navigate to Risk Analysis.**

> "Risk assessment uses FMEA — Failure Mode and Effects Analysis. Every potential failure has a severity, occurrence, and detection score. The highest risk is pre-selected: 'Hallucinated odds' — severity 9, RPN 225. The recommended action is already documented."

---

## Act 6: Financial Intelligence (3 minutes)

### Screen: Financial Impact (`/dashboard/roi`)

**Navigate to Financial Impact.**

> "Five tabs of financial detail. Let's start with the headline: **Net Weekly ROI: $2,422 across both processes.** Gross savings of $3,396 minus $974 in total agent costs."

**Click TCO tab:**
> "Total Cost of Ownership breakdown. Inference is only 40% of the cost. Oversight labor is 35%. Governance is 15%. And here's the waste ratio: 8% of inference spend goes to failed runs. That's your optimization target."

**Click Payback tab:**
> "Payback period per agent. Odds Analysis paid for itself in 1.4 weeks. Recommendation Writer: 3.6 weeks. Even the underperforming agent pays back within a month."

**Click 3-Year Projection tab:**
> "Three scenarios — conservative, moderate, aggressive. At moderate pace, cumulative ROI hits $156K by end of year three. Headcount doesn't drop — people are redeployed to higher-value work."

### Screen: What-If Scenarios (`/insights/scenarios`)

**Navigate to What-If Scenarios.**

> "And this is where it gets strategic. What happens if you add another agent to Customer Service? Slide the coverage to 3 tasks... projected ROI jumps from $612 to $940 a week. What if you reduce headcount by 2? Here's the salary saving, here's the oversight gap it creates. Every assumption on the slider, every result in real-time."

---

## Act 7: Strategic Planning (2 minutes)

### Screen: AI Maturity (`/insights/maturity`)

**Navigate to AI Maturity.**

> "Where are you on the AI maturity curve? This scores your organization across five dimensions: coverage, quality, ROI, governance, workforce readiness. You're at Level 3: Scaling. To reach Level 4, the recommendation is to close the workforce readiness gap — complete training programs and formalize new role definitions."

### Screen: Build vs Buy (`/insights/build-vs-buy`)

**Navigate to Build vs Buy.**

> "And for each process, should you build custom agents or buy off-the-shelf? Sports Betting: build — it's a specialized domain, you need control. Customer Service: buy — it's a commodity use case, faster time to value. Weighted decision matrix, transparent scoring."

---

## Act 8: Operations & Control (2 minutes)

### Screen: Live Monitor (`/monitoring`)

**Navigate to Live Monitor.**

> "This is the NOC screen. Designed to go on a wall. Real-time status of every agent — green, amber, or red. Event feed scrolling live. And if something goes catastrophically wrong..."

**Point to Emergency Pause button:**
> "...one button pauses every agent across every process. Impact preview before you confirm: 4 agents paused, 8 tasks revert to manual, +17 hours a week in human workload. You know exactly what you're doing before you do it."

### Screen: Agent Dependencies (`/agents/dependencies`)

**Navigate to Dependencies.**

> "Dependency map shows how agents connect. Odds Analysis feeds into Line Comparison, which feeds into Recommendation Writer. If Odds Analysis goes down, the whole chain is affected. Shared resource: they all use the same odds feed API. That's your single point of failure."

---

## Act 9: Onboarding & Configuration (1 minute)

### Screen: Setup — Occupation Selector (`/setup/occupation`)

**Navigate to Setup.**

> "Adding a new process starts here. Search the O*NET database — every job role in the US economy. Select one, see the task breakdown, map agents to tasks. Step 1 of 4 — it's a guided wizard."

### Screen: Settings overview

> "SLA targets, alert rules, budget caps, notification channels, API integrations, white-label branding — all configurable. Multi-tenant: separate organizations with row-level data isolation."

---

## Closing (1 minute)

**Navigate back to Dashboard.**

> "Let me bring it back to one screen."

**Point to hero banner.**

> "Four AI agents. Two job roles. $2,038 a week in net savings. Every assumption visible. Every decision audited. Every agent scored against the same quality standard your operations team already trusts."

> "The platform speaks four languages: operations, quality, finance, and compliance. Four audiences, one platform, one consistent story."

> "This is not an AI dashboard. This is the measurement layer that makes AI accountable."

**Pause.**

> "Questions?"

---

## Objection Handling (Keep in Back Pocket)

| Objection | Response |
|---|---|
| "Where does the data come from?" | "Any observability platform — Langfuse, LangSmith, custom. We ingest run data and score it against the sigma standard. The O*NET mapping is your configuration — you define which tasks map to which agents." |
| "Can it work with our agents?" | "Framework-agnostic. CrewAI, LangChain, AutoGen, custom — if it produces a run with input/output/duration/cost, we can score it." |
| "What about privacy?" | "Multi-tenant with row-level isolation. Your data never mixes with another client's. On-premise deployment available." |
| "How long to deploy?" | "The platform itself deploys in minutes. The value comes from the O*NET mapping — defining which job roles and tasks your agents cover. That's a half-day workshop with your operations lead." |
| "Is the $2,038 real?" | "Every number in the waterfall is auditable. Gross saving = tasks automated × time weight × hourly wage. Costs = inference API spend + oversight hours + governance overhead. Net = gross minus costs. Change any assumption with the slider and watch the number move." |
| "What about the EU AI Act?" | "Article 14 requires human oversight documentation for high-risk AI. The audit trail generates that automatically — every override, every approval, timestamped and exportable. We also map to ISO 42001 requirements with a compliance checklist and certificate generator." |
| "Can I show this to my board?" | "Board Report generator: select date range, choose sections, generate a PDF. Or share a live dashboard link with expiry and access control. Scheduled weekly reports go out automatically." |

---

## Demo Flow Summary (Quick Reference)

```
1. Dashboard (30s)        → "The board slide"
2. Process Detail (2min)  → "How work splits between AI and humans"
3. Agent Deep-Dive (2min) → "Good agent vs bad agent, cost of inaction"
4. Sigma Scorecard (2min) → "Quality standard they already trust"
5. Governance (2min)      → "Audit trail, compliance, risk"
6. Financial Impact (2min)→ "TCO, payback, 3-year projection"
7. Scenarios (1min)       → "What-if modeling"
8. Maturity + B/B (1min)  → "Strategic positioning"
9. Operations (1min)      → "Live monitor, kill switch, dependencies"
10. Setup (30s)           → "Onboarding flow"
11. Close (30s)           → "Back to dashboard, one sentence"
```

**Total: ~20 minutes + Q&A**
