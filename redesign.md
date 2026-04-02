# UX Redesign Brief — VIPPlay Agent Telemetry

> **Context**: All 5 phases are built and deployed. 35 routes, 60+ components, all functional.
> **Problem**: The app is organized around data structures, not user mental models. A CEO landing on this with zero briefing would be lost.
> **Goal**: Make the app self-explanatory. No briefing needed. The story tells itself.

---

## What a CEO Sees Today (Zero Briefing)

### Problem 1: "What IS this app?"
- Landing on "Executive Portfolio" is vague. There's no hero statement like "This platform monitors your AI agents across N job roles."
- No onboarding, no contextual explanation, no progressive disclosure.

### Problem 2: "Process" vs "Agent" — unclear relationship
- "Sports Betting Analyst" — is this a person? A department? A job title?
- O*NET codes (13-2099.01) are meaningless to a CEO.
- Agents appear nested under processes AND as a flat list. Two paths, neither obvious.
- The core concept — "we took a human job role, broke it into tasks, and assigned AI agents to some of them" — is never stated anywhere.

### Problem 3: Sidebar is overwhelming
- ~40 nav items visible at once across 8 sections.
- Overview (7), Processes (2 groups x 7 sub-items = 14), Agents (5), Governance (4), Analytics (1), Setup (2), Settings (6), Admin (1).
- A CEO glazes over. There's no hierarchy of importance.

### Problem 4: Internal quality engineering language
- "Sigma scorecard", "DPMO trend", "Coverage map", "Labor graph", "FMEA Risk Board", "OEE" — these are Six Sigma / ops engineering terms.
- A CEO thinks: "How are my AI agents performing?" not "What's the DPMO trend?"
- The language barrier makes the app feel like it's for engineers, not executives.

### Problem 5: The Symmetry Dashboard equation is cryptic
- "43% x quality 76% + 37% x productivity = $1,426/week" requires a PhD to parse on first glance.
- Brilliant concept, poor accessibility. Needs a plain-English narrative layer.

### Problem 6: Duplicate/confusing naming
- `/dashboard/benchmark` (cross-process) AND `/dashboard/benchmarks` (industry) — two different pages, nearly identical names.
- "Cost Analysis" vs "ROI Calculator" — overlapping concepts in the sidebar.

### Problem 7: No narrative flow
- The app doesn't guide you through a story: "Here's what's happening → Here's what needs attention → Here's what to do about it."
- Every page is a data dump. Missing: insight callouts, next-step recommendations, contextual links.

---

## Proposed Mental Model

A CEO's brain works in questions, not data structures:

| CEO Question | Current Nav | Proposed Nav |
|---|---|---|
| "How are my AI agents doing?" | Dashboard | **Home** (hero dashboard) |
| "Show me the money" | ROI Calculator / Cost Analysis | **ROI & Costs** (unified) |
| "What's broken?" | Scattered across sigma, FMEA, alerts | **Attention Required** (unified) |
| "Are we safe?" | Governance (4 sub-pages) | **Governance** (simplified) |
| "What's next?" | Roadmap (buried under process) | **Roadmap** (promoted) |
| "How do I configure things?" | Setup + Settings (8 sub-pages) | **Settings** (collapsed) |

---

## Proposed Sidebar Redesign

```
[Logo] r-Potential
       Powered by FuzeBox

HOME
  Dashboard                    → /dashboard (the hero screen)
  Live Monitor                 → /monitoring

MY AI AGENTS                   ← renamed from "Processes + Agents"
  Sports Betting               → /process/sports-betting
    Odds Analysis Agent          → /agents/odds-analysis
    Line Comparison Agent        → /agents/line-comparison [!]
    Recommendation Writer        → /agents/recommendation-writer [!]
  Customer Service             → /process/customer-service
    Customer Response Agent      → /agents/customer-response [!]

INSIGHTS                       ← new unified section
  ROI & Costs                  → /dashboard/roi (merge cost analysis)
  Performance Trends           → /dashboard/costs (rename)
  Benchmarks                   → /dashboard/benchmarks (merge both)
  Correlations                 → /analytics/correlations

GOVERNANCE                     ← simplified
  Audit Trail                  → /governance/audit
  Risk Board (FMEA)            → /governance/fmea
  Rules & Compliance           → /governance/rules (merge oversight)

PLANNING                       ← new section, promoted from buried sub-pages
  Workforce Impact             → /process/[id]/workforce
  Training Gaps                → /process/[id]/training
  Transformation Roadmap       → /process/[id]/roadmap

CONFIGURE                      ← collapsed section
  Settings                     → /settings
  Alerts & SLA                 → /settings/alerts
  (rest hidden behind "More...")
```

### Key changes:
1. **"Processes" renamed to "My AI Agents"** — makes it clear what we're looking at.
2. **Agents nested directly under their process** — one mental path, not two.
3. **Sub-pages (labor, sigma, coverage) removed from sidebar** — accessed as tabs/sections within the process page instead.
4. **"Insights" replaces scattered analytics** — one place for all ROI/cost/benchmark data.
5. **"Planning" promoted** — roadmap, workforce, training are strategic, not buried.
6. **Settings collapsed** — CEO rarely needs budgets, integrations, branding in nav.

---

## Proposed Dashboard Redesign

### Current: "Executive Portfolio"
- 4 stat cards → 2 process cards → 3 insight cards
- No narrative, no guidance

### Proposed: "Your AI Workforce"
```
HERO BANNER
"You have 4 AI agents working across 2 job roles,
 saving $2,038/week after all costs."

ATTENTION REQUIRED (red/amber cards — action-oriented)
  "Recommendation Writer is declining (2.9σ → trending down)"
  "Customer Service override rate is 28% — above threshold"
  "3 agents below your 4.0σ quality target"

YOUR PROCESSES (simplified cards)
  Sports Betting Analyst — GREEN — $1,426/wk — 3 agents
  Customer Service Rep — AMBER — $612/wk — 1 agent

RECENT ACTIVITY (timeline)
  "Odds Analysis Agent completed 50 runs (88% success)"
  "New anomaly detected: Recommendation Writer latency spike"
```

The dashboard tells a STORY: what's working, what needs attention, what happened recently.

---

## Language Simplification

| Current Term | Proposed Plain English |
|---|---|
| Sigma scorecard | Agent Quality |
| DPMO trend | Error Rate Trend |
| Coverage map | Task Assignment |
| Labor graph | Work Distribution |
| FMEA Risk Board | Risk Analysis |
| OEE | Quality Score |
| Symmetry Dashboard | Agent vs Human Split |
| Transformation Roadmap | Automation Roadmap |
| Oversight Gaps | Unreviewed Decisions |

The Operations/Quality toggle can still switch to technical language for Six Sigma practitioners — but the DEFAULT should be plain English.

---

## Process Page Redesign (The Symmetry Dashboard)

### Current: Three-column equation layout
- Hard to parse. "43% x quality 76%" is cryptic.

### Proposed: Narrative-first layout
```
HEADER
"Sports Betting Analyst — 12 people, 3 AI agents"
"AI handles 43% of this role's tasks, saving $1,426/week"

HOW THE WORK IS SPLIT (visual bar, very simple)
[████████ AI 43% ████████ | ████ Shared 20% | ████████ Human 37% ████████]

YOUR AI AGENTS (cards, one per agent)
  Odds Analysis — 4.2σ ↑ — $613/wk ROI — 18% of role
  Line Comparison — 3.4σ → — $477/wk ROI — 14% of role
  Recommendation Writer — 2.9σ ↓ — $374/wk ROI — 11% of role [NEEDS ATTENTION]

FINANCIAL IMPACT (the waterfall, clearer labels)
  Gross saving: $2,116/wk
  - Human oversight: -$483
  - AI inference costs: -$38
  - Governance overhead: -$169
  = Net saving: $1,426/wk

TABS: [Quality Details] [Task Breakdown] [Workforce Impact] [Roadmap]
```

Sub-pages (sigma, labor, coverage, training, workforce, roadmap) become tabs within the process page — not separate sidebar items.

---

## Next Steps

1. **Validate this brief** — review with stakeholders, refine priorities
2. **Prototype the sidebar** — test the new nav structure
3. **Redesign the dashboard** — narrative-first approach
4. **Simplify process pages** — tabs instead of separate routes
5. **Language audit** — replace all engineering jargon with plain English defaults
6. **Test with a real CEO** — zero-briefing walkthrough

---

## What NOT to change

- The data layer is solid — 40+ helpers, comprehensive mock data
- The component library is extensive — 60+ components
- The backend-ready architecture (types, helpers) is correct
- The Recharts visualizations are good — just need better labels
- The governance/compliance features are enterprise-ready
- Print/PDF export works

The bones are right. The skin needs to speak human.

---

## The Elevator Pitch (North Star)

Every design decision must serve this story:

> "Every enterprise running AI agents right now has the same problem. They know AI is doing something useful. They just cannot tell their board how much, how reliably, or whether the humans working alongside it are better or worse off. So when a CFO asks, 'What is our return on AI?' the answer is a guess dressed up as a number.
>
> **This platform is the missing measurement layer.**
>
> It takes your AI agents — whatever framework or model — and scores them against the same quality standard your operations team already uses. **Six Sigma.** The same DPMO methodology that Toyota uses for manufacturing lines, that hospitals use for patient safety, and that logistics companies use for delivery accuracy. Applied to agents. Every invocation is an opportunity. Every failure, latency breach, or cost overrun is a defect. The result is a quality score per agent that any quality leader immediately understands and trusts.
>
> But the quality score is not the product. The product is what happens when you connect that score to your actual workforce. Using the US government's **O*NET database** — which maps every job role, every task, and how much time each one takes — the platform overlays agent performance against the human task map for your team. So instead of 'this agent has an 88% success rate,' you get: **'this agent handles 43% of your analysts' weekly workload at high quality, freeing 14 hours per person per week, creating 5 hours of new oversight work, and producing a net saving after every cost is deducted.'**
>
> That is a number a CFO believes. Not inflated AI ROI. A real number with every assumption visible.
>
> The third layer is governance. The EU AI Act requires audit logs for every human decision made alongside AI by August this year. The platform generates that log automatically — every override, every approval, every escalation — timestamped, attributed, exportable. Compliance coverage out of the box.
>
> **The platform speaks four languages simultaneously: operations, quality, finance, and compliance. Four audiences, one platform, one consistent story.**"

### What this means for the redesign:

The app must land these four messages **without explanation**:
1. **Measurement** — "Here's exactly how your AI agents are performing, scored by the same standard you already trust."
2. **Workforce truth** — "Here's what that performance means for your actual people — hours saved, hours added, net impact."
3. **Financial proof** — "Here's the real ROI — after every cost is deducted, with every assumption visible."
4. **Compliance** — "Here's your audit trail — ready for the board, ready for regulators."

If a CEO can't identify all four within 30 seconds of landing on the dashboard, the redesign has failed.

---

## Full Audit Findings (Chrome Extension Review)

The following issues were found by walking every page of the live app at https://agenttelemetry.vercel.app. These layer onto the original problems identified above.

### Finding 1: Sidebar has asymmetric process coverage
Sports Betting has 6 sub-items (Labor graph, Sigma scorecard, Coverage map, Roadmap, Training Plan, Workforce Plan). Customer Service has 5 (no Labor graph). Creates a subconscious sense of incompleteness. The tab-based approach solves this — **but tab sets must be standardized across all processes**.

### Finding 2: Agent Comparison page is stranded
`/agents/compare` has a genuinely useful radar chart but is only accessible from the Agents sidebar section. Not linked from dashboard, agent pages, or process pages. A CEO would never discover it.
**Fix**: Surface as "Compare Agents" in the Insights section. Add inline "Compare with..." links on agent cards.

### Finding 3: Live Monitor event feed lacks agent names
The scrolling event feed shows timestamps, OK/FAIL badges, latency, and cost — but no agent names on individual rows. Agent mini-cards show model names (gpt-4o, claude-3-5-sonnet) but not which process they belong to. A CEO doesn't know what "claude-3-5-sonnet" means.
**Fix**: Add agent name column to every feed row. Add process name as secondary label on agent status cards.

### Finding 4: Notification bell has no follow-through
Bell shows "2" but the panel has no action buttons, no priority sorting, no dismiss mechanism. Each notification should have an inline action ("Review Agent →", "Acknowledge") and a severity badge.

### Finding 5: "Board Export" is misnamed and mispositioned
This is actually a full **Board Report** generator with live preview, date ranges, section toggles, and scheduling. "Board Export" sounds like a data dump. A CEO would skip it.
**Fix**: Rename to "Board Report". Promote it. Surface a "Generate Q1 Report" quick action from the dashboard.

### Finding 6: ROI Calculator leads with confusing numbers
On `/dashboard/roi`, both "Gross Savings" and "Manual Equivalent" show `$3,396/wk` in top stat cards — looks like zero net benefit at a glance. You have to read the waterfall to understand.
**Fix**: Lead with Net ROI as the hero number. Rename page to "Financial Impact" or "ROI Summary".

### Finding 7: Cost Analysis page naming inconsistency
Sidebar says "Cost Analysis", breadcrumb says "Dashboard / Costs", heading says "Cost Analysis", URL is `/dashboard/costs`. The page covers inference spend only, which overlaps conceptually with the ROI Calculator.
**Fix**: Merge into unified "ROI & Costs" or make explicit this is "AI Inference Spend" only.

### Finding 8: Sigma Translation Scale is buried (but excellent)
The sigma scale on `/process/[id]/sigma` (1σ = "Unreliable — do not deploy" → 6σ = "World class") is the single best piece of educational content in the app. But a CEO seeing "4.2σ" on the dashboard has no frame of reference.
**Fix**: Surface a mini version of this scale as a tooltip or callout **everywhere sigma scores appear** — dashboard, agent cards, process pages.

### Finding 9: Coverage Map and Labor Graph are nearly duplicate
Both show the same 43%/20%/37% breakdown with similar visuals. Coverage Map = task cards with ownership tags. Labor Graph = three-column task list. Same data, different views.
**Fix**: Merge into one "Task Ownership" tab with a card/list view toggle.

### Finding 10: Workforce Planning is buried but strategic
`/process/[id]/workforce` has headcount projections, skills curves, scenario modeling — genuinely strategic content. But it's 3 clicks deep under a specific process. No cross-process roll-up.
**Fix**: Add a cross-process workforce summary in the Planning section. Keep per-process detail as drill-down.

### Finding 11: Setup flow has no wizard/onboarding
`/setup/occupation` is clean but has no progress indicators, no "Step 1 of 3", no guided flow. The transition from occupation selection → agent-task mapping is abrupt.
**Fix**: Wrap Setup in a wizard with clear steps: Choose Job Role → Map Tasks → Set Quality Targets → Review.

### Finding 12: "Confidence" levels have no explanation
On `/setup/mapping`, each task has a confidence level (High/Medium/Low) with zero tooltip or explanation. Confidence in what? The automation decision? The model output?
**Fix**: Add tooltips everywhere confidence, quality framework, and risk level appear.

### Finding 13: FMEA Risk Board loads with empty right panel
The detail panel shows "Select a risk item..." on load — looks broken during a demo walkthrough.
**Fix**: Auto-select the highest-RPN risk item on page load.

### Finding 14: "Oversight Gaps" has three different names
Sidebar: "Oversight Gaps". Page heading: "Oversight Gap Report". Breadcrumb: "Governance / Oversight". The plain-English subtitle ("Tasks with full agent ownership but no human review process") is excellent but buried.
**Fix**: Use the plain-English description as the title: "Unreviewed Decisions" or "Tasks Without Human Review".

### Finding 15: Governance Rules buries business risk
Shows "75% compliant — 2 rules violated" but doesn't quantify consequences (compliance risk, financial exposure).
**Fix**: Add a risk callout: "2 violated rules put you at risk of non-compliance with EU AI Act Article 14."

### Finding 16: Admin/Organisations exposed in sidebar for everyone
Multi-tenant management panel visible to all users. A CEO at Acme Corp should never see FuzBox AI's data.
**Fix**: Hide Admin section based on role, or add visible "Admin Only" label.

### Finding 17: "Quality Score (OEE)" is jargon double-hit
Agent pages show "Quality Score (OEE): 83%" — uses both old and new terms simultaneously, as if mid-migration. Settings exposes OEE/SERVQUAL framework selector to CEO-level users.
**Fix**: Pick one term. Default to "Quality Score". Hide framework selection behind an advanced/expert toggle.

### Finding 18: Operations/Quality toggle has no explanation
Top-right toggle appears on every page with zero help text explaining what it changes or which mode to use.
**Fix**: Add tooltip: "Operations: plain English metrics. Quality: Six Sigma framework view." Default to Operations. Consider hiding Quality behind "Expert Mode".

### Finding 19: "Healthy Processes: 0/2" is alarming and misleading
Dashboard shows 0/2 in red — meaning zero processes have ALL agents above 4σ. But the system is delivering $2,038/week. Makes the entire platform look like it's failing.
**Fix**: Reframe as health gradient: "2 processes active · 1 performing well · 1 needs attention" — never a zero.

### Finding 20: No global search
35 routes, 4+ agents, governance rules, run IDs — no way to search. CEO can't find anything without manual navigation.
**Fix**: Add `Ctrl+K` / `⌘K` command palette or global search bar.

### Finding 21: Browser tab title is always the same
Every page shows "r-Potential | Agent Quality & Process ROI" — can't distinguish tabs.
**Fix**: Dynamic titles: "Dashboard — r-Potential", "Sports Betting — r-Potential", etc.

### Finding 22: No empty states / zero-data design
App assumes data always exists. No loading skeletons, no "no data yet" illustrations. What does a new org see?
**Fix**: Design empty states for every data-heavy component.

### Finding 23: "Cost of Inaction" is a hidden gem
The Recommendation Writer page has a collapsible "Cost of Inaction — What happens if we don't fix this?" showing 90-day projected impact. This is the most executive-friendly content in the app — but it's collapsed by default and buried below the ROI waterfall.
**Fix**: **Expand by default** on any agent in critical/declining status. Move it **above** the ROI breakdown. This is the #1 executive hook.

---

## Priority Matrix for Redesign Execution

### P0 — Must have (lands the elevator pitch)
1. Dashboard hero banner with the four-language story (measurement, workforce, finance, compliance)
2. "Healthy Processes" card reframe — never show a zero
3. Sigma tooltip/legend everywhere σ appears — the translation scale is the bridge
4. Cost of Inaction expanded by default on critical agents — executive hook
5. Default language to plain English (Operations mode = default)
6. Dynamic browser tab titles

### P1 — Should have (removes confusion)
7. Sidebar restructure: MY AI AGENTS, INSIGHTS, GOVERNANCE, PLANNING, CONFIGURE
8. Merge Coverage Map + Labor Graph into "Task Ownership" with view toggle
9. Merge benchmark + benchmarks into single page
10. Merge ROI Calculator + Cost Analysis into "Financial Impact"
11. Rename "Board Export" → "Board Report", promote it
12. FMEA auto-select highest-RPN item on load
13. Notification bell with action buttons and severity
14. Agent Comparison surfaced from process pages and insights

### P2 — Nice to have (polish)
15. Global search / command palette (Ctrl+K)
16. Setup wizard with step indicators
17. Empty states for all data components
18. Cross-process workforce roll-up view
19. Hide Admin section based on role
20. Tooltips on confidence, quality framework, risk levels
21. Live Monitor: agent names in feed rows, process labels on cards
22. Operations/Quality toggle with help text

---

## Design Principles (derived from the pitch)

1. **Lead with the answer, not the data.** Every page should open with a plain-English sentence that answers a CEO question. Data supports it below.
2. **Four languages, one story.** Every key metric must be expressible in operations, quality, finance, AND compliance terms. The toggle switches the lens, not the story.
3. **Show the assumption.** The pitch promises "every assumption visible." The ROI waterfall does this well — extend the pattern. No magic numbers.
4. **Urgency through consequence.** "2.9σ" means nothing. "$133 projected loss over 90 days if not fixed" means everything. Always translate quality into business consequence.
5. **Progressive disclosure.** CEO sees the story. VP sees the breakdown. Engineer sees the data. Same page, different scroll depths.
6. **The sigma scale is the Rosetta Stone.** It translates between all four languages. Surface it everywhere, not just on one buried page.
