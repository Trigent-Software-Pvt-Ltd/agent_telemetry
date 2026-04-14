

**Quadrant × FuzeBox.AI**

**Development Plan**

Chief of Staff Agent \+ Sourcing Agent Architecture

Prepared for Sam Stillman — Quadrant Two Capital Partners

By Les Ottolenghi — FuzeBox.AI

April 2026 — Confidential

**Table of Contents**

[1\. Executive Summary	1](#1.-executive-summary)

[2\. Current State Assessment	1](#2.-current-state-assessment)

[2.1 Chief of Staff Agent — What Exists	1](#2.1-chief-of-staff-agent-—-what-exists)

[2.2 Chief of Staff Agent — Honest Classification	1](#2.2-chief-of-staff-agent-—-honest-classification)

[2.3 Sourcing Agent — What Exists	1](#2.3-sourcing-agent-—-what-exists)

[2.4 Why Single-Agent Is Wrong for the Sourcing Problem	1](#2.4-why-single-agent-is-wrong-for-the-sourcing-problem)

[3\. Guiding Principles	1](#3.-guiding-principles)

[3.1 Instrument Before You Replace	1](#3.1-instrument-before-you-replace)

[3.2 Rules Belong in Code, Reasoning Belongs in Models	1](#3.2-rules-belong-in-code,-reasoning-belongs-in-models)

[3.3 Evidence Required, Not Just Output	1](#3.3-evidence-required,-not-just-output)

[3.4 Eval Is Part of the Build, Not a Phase 4 Afterthought	1](#3.4-eval-is-part-of-the-build,-not-a-phase-4-afterthought)

[3.5 Resist “Platform” Language Until Reuse Is Proven	1](#3.5-resist-“platform”-language-until-reuse-is-proven)

[4\. Proposed Architecture	1](#4.-proposed-architecture)

[4.1 The Wrapper Layer	1](#4.1-the-wrapper-layer)

[4.2 The Orchestration Layer	1](#4.2-the-orchestration-layer)

[4.3 The Evaluation Layer	1](#4.3-the-evaluation-layer)

[5\. Phase 1 — Evaluate Current Chief of Staff Tool	1](#5.-phase-1-—-evaluate-current-chief-of-staff-tool)

[5.1 Deliverables	1](#5.1-deliverables)

[5.2 Success Criteria	1](#5.2-success-criteria)

[5.3 Phase 1 Risks	1](#5.3-phase-1-risks)

[6\. Phase 2 — Refactor into Configurable Architecture	1](#6.-phase-2-—-refactor-into-configurable-architecture)

[6.1 Deliverables	1](#6.1-deliverables)

[6.2 Success Criteria	1](#6.2-success-criteria)

[6.3 What Phase 2 Explicitly Does NOT Do	1](#6.3-what-phase-2-explicitly-does-not-do)

[7\. Phase 3 — Build Sourcing Agent Prototype	1](#7.-phase-3-—-build-sourcing-agent-prototype)

[7.1 Week 1 — Criteria Engine and Data Inventory	1](#7.1-criteria-engine-and-data-inventory)

[7.2 Week 2 — Specialist Prototypes	1](#7.2-specialist-prototypes)

[7.3 Week 3 — Manager Agent and Evidence Layer	1](#7.3-manager-agent-and-evidence-layer)

[7.4 Week 4 — Evaluation, Review Dashboard, and First Run	1](#7.4-evaluation,-review-dashboard,-and-first-run)

[7.5 Phase 3 Deliverables Summary	1](#7.5-deliverables-summary)

[8\. Phase 4 — Production Hardening	1](#8.-phase-4-—-production-hardening)

[8.1 Deliverables	1](#8.1-deliverables)

[8.2 Success Criteria	1](#8.2-success-criteria)

[9\. Timeline and Milestones	1](#9.-timeline-and-milestones)

[10\. Risks and Mitigation	1](#10.-risks-and-mitigation)

[10.1 Data Availability Risk	1](#10.1-data-availability-risk)

[10.2 Criteria Ambiguity Risk	1](#10.2-criteria-ambiguity-risk)

[10.3 Ground Truth Risk	1](#10.3-ground-truth-risk)

[10.4 Integration Complexity Risk	1](#10.4-integration-complexity-risk)

[10.5 False Confidence Risk	1](#10.5-false-confidence-risk)

[11\. Out of Scope	1](#11.-out-of-scope)

[12\. What FuzeBox Needs From Quadrant	1](#12.-what-fuzebox-needs-from-quadrant)

# **1\. Executive Summary** {#1.-executive-summary}

This development plan outlines a phased engagement between Quadrant Two Capital Partners and FuzeBox.AI to evolve Quadrant’s internal AI tooling from two standalone workflows into an orchestrated, measurable, and continuously improving agentic system. The plan is grounded in what Quadrant has actually built — not in aspirational architecture — and follows a deliberate sequence of evaluate, refactor, build, and harden.

The engagement covers two agents already on Quadrant’s roadmap. The first is the Chief of Staff agent, a working Node.js application that generates daily briefings for Sam Stillman, Genevieve Castelline, and Ted Deinard by pulling data from HubSpot, Microsoft Graph, Granola, and Vercel KV and synthesizing it via a direct Claude Sonnet 4 API call. The second is the Sourcing Agent, currently at the design stage, intended to surface acquisition targets in the 3rd Party Clinical Services vertical against a detailed investment thesis covering CPT-code-level specificity, payer rate analysis, MSO geographic overlap, and a set of disqualifying criteria.

The approach taken in this plan is deliberately conservative on language and aggressive on delivery. It does not claim that multi-agent systems are magic. It does not pitch a platform before platform-grade reuse is proven. It does combine LLM reasoning with structured rules, deterministic checks, evidence-backed outputs, and automated evaluation — because that combination is what actually produces accuracy against an investment thesis this specific.

*“This is technically feasible, but the winning architecture is not one monolithic agent — it is an orchestrated system of specialist workflows, grounded data, and built-in evaluation.”*

# **2\. Current State Assessment** {#2.-current-state-assessment}

Before proposing any new architecture, this plan documents what Quadrant has today. This is intentional: the engagement’s first deliverable is instrumentation of existing code, not replacement of it.

## **2.1 Chief of Staff Agent — What Exists** {#2.1-chief-of-staff-agent-—-what-exists}

The Chief of Staff agent is a working, purpose-built tool that runs on Vercel with the following characteristics documented in the Quadrant source code:

* **Trigger:** Scheduled cron trigger firing weekdays at 9:30 UTC (4:30 AM ET), authenticated via a bearer token against CRON\_SECRET. Also callable on-demand via a separate API endpoint.

* **Users:** Three team members — Sam Stillman (Principal, HubSpot owner 88510694), Genevieve Castelline (Team Member, owner 162887494), and Ted Deinard (Team Member). All Eastern Time, all using the Granola MCP at mcp.granola.ai.

* **Data sources:** HubSpot deals and tasks (filtered by owner, excluding Passed and Acquired stages), Granola meeting notes via nested Claude MCP call, Microsoft Graph calendar events, Microsoft Graph emails (last 7 days), and Vercel KV for deferred tasks.

* **Model call:** Direct call to claude-sonnet-4-20250514 with an 8,000 token budget. No MCP servers on the master call — Granola is called separately and pre-digested. The system prompt is a 40+ line string literal embedded in briefingEngine.js lines 156–196.

* **Output:** Structured JSON array of task cards with defined fields (id, type, priority, title, body, due, source, deal\_name, contact\_email, draft\_email, group\_key, group\_label). Cards with draft\_email fields automatically create Microsoft Graph Outlook drafts. Stored in Vercel KV with a 48-hour TTL and rendered in a React dashboard.

* **Downstream:** Schedule, done, and push actions against individual cards via separate API endpoints. No telemetry, no per-user preference learning, no evaluation layer, no version history for the prompt.

## **2.2 Chief of Staff Agent — Honest Classification** {#2.2-chief-of-staff-agent-—-honest-classification}

The Chief of Staff agent is more accurately described as a workflow than an agent. It is a deterministic pipeline with a single LLM synthesis step at the end. It does not dynamically select actions, it does not route between multiple capabilities, and it does not maintain state or memory across runs. This distinction matters for planning purposes: a workflow can be evolved into an agent, but pretending it already is one would misrepresent the current state.

## **2.3 Sourcing Agent — What Exists** {#2.3-sourcing-agent-—-what-exists}

The Sourcing Agent is a design specification, not deployed code. The intent is a manual trigger that searches for companies matching Quadrant’s investment thesis for the 3rd Party Clinical Services vertical. The criteria document is unusually specific:

* **Financial filter:** $1–$5M EBITDA, 100% owner-operated, regional presence, commercial insurance / Medicare / MA payer mix.

* **Service categories:** Tier 1 services include Echocardiography, ECG/EKG Interpretation, Pulmonary Function Testing, Nerve Conduction Studies / EMG, and Outpatient Physical Therapy. Tier 2 includes Vascular/ABI Doppler, Holter Monitoring, DEXA, EEG, Audiology, and Wound Care.

* **CPT specificity:** Tiered CPT codes per service (e.g., 93306–93308 and 93325 for echocardiography; 94010, 94060, 94070, 94375 for PFT; 95907–95913 and 95860–95872 for NCS/EMG).

* **Thesis requirements:** Commercial volume must be at least 40% of mix, current rates must be at or below 120% of Medicare, an MSO or IPA must already be active in the target geography paying 150–175% of Medicare, there must be at least 2 non-founder clinical staff, 3–5 independent referral practices, and denial rate must be under 15%.

* **Disqualifiers:** Founder holds all referrals and performs most clinical work, no MSO in geography, high prior authorization burden, current rates already above 140% of Medicare, or a single referral practice representing 50%+ of referrals.

* **Thesis mechanism:** The investment thesis is rate-uplift arbitrage: buy at current-revenue multiples, enroll the NPI into existing MSO payer contracts, collect the rate differential from identical patient volume. Value creation happens at the contracting layer, not the clinical layer.

## **2.4 Why Single-Agent Is Wrong for the Sourcing Problem** {#2.4-why-single-agent-is-wrong-for-the-sourcing-problem}

A single LLM agent trying to execute this thesis end-to-end would fail on accuracy for three reasons. First, the reasoning domains are distinct: company identification, healthcare CPT utilization analysis, payer rate analysis, geographic MSO overlap, and disqualifier screening each require different data, different logic, and different verification. Second, significant portions of the criteria are deterministic rules (“commercial volume ≥ 40%,” “rates ≤ 120% of Medicare,” “denial rate \< 15%”) that should not live inside a prompt — they should live in structured validation code where they can be tested and audited. Third, an investment thesis this specific needs evidence-backed output where every claim is tied to a source, and a monolithic agent has no natural place to enforce that.

The correct architecture is orchestrated specialist workflows with a manager agent for coordination, structured rule engines for deterministic filters, and an evaluation layer that scores every output against the criteria document automatically. This plan builds exactly that.

# **3\. Guiding Principles** {#3.-guiding-principles}

Five principles shape every phase of this engagement. These principles are a deliberate correction against the common failure modes of enterprise AI projects.

## **3.1 Instrument Before You Replace** {#3.1-instrument-before-you-replace}

Phase 1 adds observability to the Chief of Staff workflow without modifying its code. This produces usage data that tells us what is actually valuable in the current system before any architectural decisions are made. The alternative — rebuilding first and measuring later — is how teams waste six months replacing a system that was working fine and miss the parts that were actually broken.

## **3.2 Rules Belong in Code, Reasoning Belongs in Models** {#3.2-rules-belong-in-code,-reasoning-belongs-in-models}

LLMs are excellent at interpretation, synthesis, summarization, and handling ambiguous inputs. They are not reliable at deterministic arithmetic or threshold comparisons. “Is commercial volume ≥ 40%” is not a reasoning task — it is a numeric comparison. This plan pushes all hard rules (financial thresholds, disqualifier checks, CPT tier logic, payer rate comparisons) into validated code paths and reserves LLM calls for the parts that actually need interpretation.

## **3.3 Evidence Required, Not Just Output** {#3.3-evidence-required,-not-just-output}

Every finding produced by the Sourcing Agent must be tied to a data source with a confidence score. Investment decisions based on unsourced LLM assertions are organizational risk. This plan mandates structured output with source provenance from day one, and builds a human review dashboard that surfaces evidence alongside every recommendation.

## **3.4 Eval Is Part of the Build, Not a Phase 4 Afterthought** {#3.4-eval-is-part-of-the-build,-not-a-phase-4-afterthought}

The acquisition criteria document is essentially a ready-made eval dataset. Every criterion in it is a testable assertion: if the Sourcing Agent surfaces a target, the system can automatically check whether that target meets each criterion. This plan builds the evaluation layer as a first-class component of the Sourcing Agent, not as a quality-assurance step bolted on later.

## **3.5 Resist “Platform” Language Until Reuse Is Proven** {#3.5-resist-“platform”-language-until-reuse-is-proven}

The Chief of Staff agent and the Sourcing Agent share a technical foundation (observability, blueprint management, structured output, evaluation), and that foundation has obvious extensibility. But calling it a “platform” before Quadrant has successfully reused it across two or more use cases would be premature. This plan refers to the shared foundation as “reusable architecture” and defers platform language until there is demonstrated reuse to back it up.

# **4\. Proposed Architecture** {#4.-proposed-architecture}

The architecture for this engagement has three layers: a wrapper layer that captures telemetry around existing and new agents without modifying them, an orchestration layer that coordinates specialist workflows for complex tasks like sourcing, and an evaluation layer that scores every run against structured criteria.

## **4.1 The Wrapper Layer** {#4.1-the-wrapper-layer}

For the Chief of Staff agent, the wrapper layer intercepts calls to the existing briefingEngine.js without changing its code. It logs every input, every Claude API call, every output card, every user action (schedule, done, push), and every downstream Outlook draft. This produces a telemetry stream that answers three questions Sam cannot answer today: Which cards actually get acted on? Which cards get dismissed? Which cards generate real downstream work?

The wrapper is deployed as a proxy in front of the existing Vercel application. It requires no changes to briefingEngine.js, no changes to the cron handler, and no changes to the React dashboard. The only integration point is a routing change to pass traffic through the wrapper.

## **4.2 The Orchestration Layer** {#4.2-the-orchestration-layer}

For the Sourcing Agent, the orchestration layer coordinates multiple specialist workflows, each responsible for one reasoning domain. The manager workflow receives a trigger, creates a work plan, assigns tasks to specialists, and consolidates results into a structured finding.

| Specialist | Responsibility | Data Sources |
| :---- | :---- | :---- |
| **Market Map / Company Finder** | Identify candidate companies matching service category and geography | CMS Medicare Utilization files filtered by taxonomy \+ geography, NPI Registry, state licensing databases |
| **CMS / Utilization Analyst** | Analyze CPT code utilization volume and trends per candidate | CMS Medicare Utilization by NPI, CMS claims volume reports |
| **Payer Rate Analyst** | Extract current contracted rates and compare to Medicare baseline | CMS Transparency in Coverage rule filings (negotiated rates by CPT code and geography) |
| **MSO Geographic Overlap** | Confirm an MSO or IPA is already active in the target geography at 150–175% of Medicare | MSO/IPA directories, Transparency in Coverage comparison data |
| **Disqualifier Screener** | Run deterministic checks against all avoid criteria | Rule engine with outputs from other specialists |
| **Thesis Fit Scorer** | Apply investment criteria weights and produce final fit score with evidence | Consolidated outputs from all specialists \+ structured criteria engine |

## **4.3 The Evaluation Layer** {#4.3-the-evaluation-layer}

The evaluation layer runs continuously alongside the orchestration layer. Every candidate company that flows through the specialists is scored against the full criteria document. The score is structured by dimension: financial fit, service category fit, commercial mix, rate arbitrage opportunity, MSO overlap, disqualifier pass/fail. Each dimension returns a numeric score, a pass/fail flag, and the evidence that supports the assessment.

This layer is also the source of training signal for continuous improvement. When Sam marks a candidate as “good fit” or “poor fit” in the review dashboard, that feedback is captured and used to refine the specialists over time.

# **5\. Phase 1 — Evaluate Current Chief of Staff Tool** {#5.-phase-1-—-evaluate-current-chief-of-staff-tool}

Phase 1 is SUPER RAPID – HOW FAST CAN YOU REACT? Its goal is to instrument the existing Chief of Staff workflow and produce the first usage report without changing any of Quadrant’s code.

## **5.1 Deliverables** {#5.1-deliverables}

* **Telemetry wrapper:** Proxy layer in front of the existing Vercel application that intercepts cron and on-demand briefing requests without code changes to briefingEngine.js.

* **Prompt version capture:** The 40+ line system prompt extracted from briefingEngine.js as a versioned artifact in a blueprint registry, with the existing code continuing to use it verbatim. No functional change, just version tracking.

* **Latency and token tracking:** Per-briefing metrics including input token count, output token count, Claude API latency, total end-to-end time, card count generated, and breakdown by card type (follow\_up, meeting\_prep, deal\_action, email\_draft, admin, deferred).

* **User action capture:** Instrumentation of the existing schedule-task, done-task, and push-task endpoints to capture which cards each user acts on and which they ignore.

* **Usefulness scoring:** A scoring rubric applied to each generated card rating usefulness, specificity, actionability, and likelihood of downstream action. Initial scoring is automated with human spot-checks.

* **Usage report:** A two-week usage report showing for Sam, Genevieve, and Ted: total cards generated, cards acted on, cards dismissed, average time-to-action, most valuable card types, and most ignored card types.

## **5.2 Success Criteria** {#5.2-success-criteria}

Phase 1 is successful if Sam can answer the following questions with data, where today he cannot:

* What percentage of generated cards across all three users actually result in downstream action?

* Which card types produce the highest action rate and which produce the highest dismiss rate?

* Are there user-specific patterns — does Sam act on different card types than Genevieve or Ted?

* Is the stale deal detection logic actually surfacing deals that need action, or is it generating noise?

* Are the auto-created Outlook drafts being sent, edited, or deleted?

## **5.3 Phase 1 Risks** {#5.3-phase-1-risks}

* **Latency overhead:** The wrapper proxy adds a network hop between the cron handler and the Claude API. Mitigation: the proxy runs in the same region as the Vercel deployment and the added latency is measured and reported.

* **Sample size:** Two weeks may not be enough data to produce statistically meaningful patterns across three users. Mitigation: the report distinguishes between directional signal (what we can see) and confirmed patterns (what we would need more time to verify).

* **Access scope:** Instrumenting the existing endpoints requires read access to the Vercel deployment. Mitigation: all instrumentation is read-only; no writes to Quadrant infrastructure.

# **6\. Phase 2 — Refactor into Configurable Architecture** {#6.-phase-2-—-refactor-into-configurable-architecture}

Phase 2 RAPIDLY. It takes the Chief of Staff workflow from a hardcoded single-user design to a configurable system that can vary per user without code changes. This phase starts only after Phase 1 data confirms which parts of the current workflow are valuable and which need to change.

## **6.1 Deliverables** {#6.1-deliverables}

* **Parameterized prompts:** The single hardcoded system prompt is decomposed into a base template plus a user-specific preference layer. Sam, Genevieve, and Ted each get a blueprint that references the shared template but overlays their preferences (e.g., card format, priority weighting, suggested time blocks, grouping style).

* **Modular connectors:** HubSpot, Microsoft Graph, Granola, and Vercel KV connectors are abstracted behind a uniform interface. Adding a new data source (e.g., proprietary Quadrant deal data) becomes a configuration change rather than a code rewrite.

* **Structured output contract:** The JSON card schema is formalized with Pydantic-equivalent validation in the wrapper. Cards that fail schema validation are logged as defects rather than silently corrupting the dashboard.

* **User preference layer:** A lightweight preference store (initially Vercel KV, potentially upgraded to PostgreSQL later) that lets each user tune their briefing without requiring a code push.

* **Orchestration routing:** Instead of all three users getting the same briefing logic, a routing layer selects which blueprint template, which preference overlay, and which data sources apply for each user. This is still not a true agent — it is a more flexible workflow — but it is the foundation that a true agent would eventually sit on.

## **6.2 Success Criteria** {#6.2-success-criteria}

* Genevieve can request a different briefing format than Sam without any code change — the change is made in the preference store and takes effect on the next run.

* All three users’ outputs pass the structured output contract validator on every run.

* The Phase 1 usage report is regenerated against the Phase 2 architecture and shows equal or better action rates per user.

* Adding a hypothetical fourth user (e.g., Neil) would be a configuration task, not an engineering task.

## **6.3 What Phase 2 Explicitly Does NOT Do** {#6.3-what-phase-2-explicitly-does-not-do}

Phase 2 does not rewrite the existing briefingEngine.js. It does not replace the Vercel deployment. It does not introduce a new framework or database. It does not call this system a “platform.” The goal is flexibility within the existing architecture, not architectural replacement.

# **7\. Phase 3 — Build Sourcing Agent Prototype** {#7.-phase-3-—-build-sourcing-agent-prototype}

Phase 3 ASAP. It is the largest and highest-risk phase of the engagement, and also the one with the highest potential return. It builds the Sourcing Agent as an orchestrated system of specialists with structured rules and an evaluation layer baked in from day one.

## **7.1 Criteria Engine and Data Inventory** {#7.1-criteria-engine-and-data-inventory}

Before any LLM work, the team builds a structured criteria engine that encodes every deterministic rule from the acquisition criteria document. This includes financial thresholds ($1–$5M EBITDA), mix requirements (commercial volume ≥ 40%), rate thresholds (≤ 120% of Medicare current, 150–175% target via MSO), staff requirements (≥ 2 non-founder clinical staff), referral concentration (no single practice ≥ 50%), and denial rate ceilings (\< 15%).

In parallel, the team completes a data inventory: which data sources exist, which are accessible, which require paid subscriptions, and which have quality issues. The CMS Medicare Utilization files, CMS Transparency in Coverage filings, NPI Registry, and state licensing databases are the starting point. Gaps are identified and either resolved or flagged as known limitations.

## **7.2 Specialist Prototypes** {#7.2-specialist-prototypes}

Each specialist is built as an independent workflow with its own data access, its own prompt blueprint, and its own structured output schema. The Market Map / Company Finder is built first because its output is the input to every other specialist. The CMS/Utilization Analyst and Payer Rate Analyst are built next. Each specialist is tested in isolation against a small set of known-good examples before integration.

## **7.3 Manager Agent and Evidence Layer** {#7.3-manager-agent-and-evidence-layer}

The manager agent is the only component in the system that resembles a true agent: it receives a trigger, decides what work needs to happen, assigns tasks to specialists, and reasons about conflicts or gaps in their outputs. The manager is deliberately kept narrow — it does not perform domain analysis itself; it orchestrates specialists that do.

The evidence layer is built in parallel. Every claim produced by a specialist must include a source reference (a URL, a CMS file identifier, an NPI number), a confidence score, and a human-readable explanation. Findings without evidence are rejected before they reach the manager.

## **7.4 Evaluation, Review Dashboard, and First Run** {#7.4-evaluation,-review-dashboard,-and-first-run}

The evaluation layer runs automatically against every candidate surfaced by the specialists. It scores each candidate across all criteria dimensions and flags any candidate that passes all deterministic disqualifiers for human review. The review dashboard presents candidates in order of thesis fit score, with evidence expandable per claim, and includes a simple good-fit / poor-fit feedback button for Sam.

At the end of Week 4, the Sourcing Agent runs its first full pipeline against a target service category (recommended: Physical Therapy Tier 1 or Pulmonary Function Testing Tier 1 given the fragmentation and data availability) and produces an initial batch of 10–25 candidate companies with full evidence and scoring.

## **7.5 Deliverables Summary** {#7.5-deliverables-summary}

* Structured criteria engine covering every deterministic rule in the acquisition criteria document.

* Six specialist workflows: Market Map, CMS Analyst, Payer Analyst, MSO Overlap, Disqualifier Screener, Thesis Fit Scorer.

* Manager agent that coordinates specialists and consolidates findings.

* Evidence layer with source provenance and confidence scoring on every claim.

* Evaluation layer that automatically scores every candidate against the criteria document.

* Human review dashboard with good-fit / poor-fit feedback capture.

* First live run producing 10–25 evidence-backed candidate companies.

# **8\. Phase 4 — Production Hardening** {#8.-phase-4-—-production-hardening}

Phase 4 is three weeks AFTER THE DEMO. It takes the Chief of Staff refactor and the Sourcing Agent prototype to production-grade. This is the phase where everything that was acceptable for a pilot becomes enterprise-grade for internal use behind Quadrant’s firewall.

## **8.1 Deliverables** {#8.1-deliverables}

* **Monitoring and evaluation:** Per-run GSTI scoring continues from the pilot but is now formalized with thresholds that trigger alerts if scores drop below baseline. Weekly eval benchmarks run automatically against a growing test set.

* **Source provenance:** Every finding in the Sourcing Agent output can be traced back to the specific CMS file, NPI record, or Transparency in Coverage filing that produced it. Provenance is stored alongside the finding and is surfaced in the review dashboard.

* **Firewall-internal deployment:** The wrapper layer, orchestration layer, and evaluation layer are all deployed inside Quadrant’s infrastructure boundary. No Quadrant data leaves the firewall except for the Claude API calls themselves, which are already happening in the current architecture.

* **Access control:** Role-based access control restricts who can view briefings, who can trigger Sourcing Agent runs, and who can approve or reject candidates. Initial roles: principal (full access), team member (own briefing \+ review dashboard), observer (read-only).

* **Audit trail:** Every prompt change, every candidate approval, every feedback event, and every deployment is logged to an append-only audit store. Sam can produce a full history of who did what and when for any candidate that ever entered the system.

* **Retry and error handling:** Claude API failures, data source outages, timeout errors, and eval failures all have defined handling paths with retry logic, circuit breakers, and graceful degradation. The Chief of Staff briefing degrades to a partial briefing rather than failing entirely when a data source is unavailable.

## **8.2 Success Criteria** {#8.2-success-criteria}

* Both agents run for two consecutive weeks without manual intervention.

* Every Chief of Staff briefing and every Sourcing Agent run produces a GSTI score and a trace ID that can be looked up in the audit store.

* Every candidate in the Sourcing Agent output has source-backed evidence for every claim.

* Access control is enforced — an observer cannot trigger a Sourcing Agent run, a team member cannot override a principal’s feedback, and all attempts are logged.

* A simulated failure in any data source or API call produces a graceful degradation rather than a cascade failure.

# **9\. Timeline and Milestones** {#9.-timeline-and-milestones}

The full engagement is twelve weeks from kickoff to hardened production. The phases are sequential with one exception: Phase 2 data connector abstraction can begin in parallel with the final week of Phase 1 because it does not depend on the Phase 1 usage report.

| Week | Phase | Focus | Key Milestone |
| :---- | :---- | :---- | :---- |
| **1–2** | Phase 1 | Telemetry and evaluation of existing Chief of Staff | Two-week usage report delivered |
| **3–5** | Phase 2 | Refactor Chief of Staff to configurable architecture | Per-user preference layer live |
| **6–9** | Phase 3 | Build Sourcing Agent prototype with specialists, rules, evidence, and evaluation | First live Sourcing Agent run with 10–25 candidates |
| **10–12** | Phase 4 | Production hardening, access control, audit trail, error handling | Both agents running autonomously behind Quadrant firewall |

# **10\. Risks and Mitigation** {#10.-risks-and-mitigation}

Five risks are material to this engagement. Each is identified here with a specific mitigation strategy. None of these are hypothetical — they are the actual failure modes that cause enterprise AI projects to miss their targets.

## **10.1 Data Availability Risk** {#10.1-data-availability-risk}

The Sourcing Agent depends on CMS Medicare Utilization files, CMS Transparency in Coverage filings, NPI Registry data, and MSO/IPA directory information. If any of these sources is incomplete, dirty, delayed, or inaccessible, the agent’s accuracy suffers regardless of how well the orchestration is built.

**Mitigation:** The Phase 3 Week 1 data inventory identifies gaps before code is written. Known gaps are documented and either resolved via paid data subscriptions, estimated with confidence intervals, or flagged as limitations in the output. The agent never pretends to have data it does not have.

## **10.2 Criteria Ambiguity Risk** {#10.2-criteria-ambiguity-risk}

The acquisition criteria document is specific in some places (exact CPT codes, numeric thresholds) and subjective in others (“fatigued by billing disputes and stalled growth,” “never worked with a banker”). The subjective criteria are harder to automate and prone to false confidence.

**Mitigation:** Subjective criteria are scored as qualitative signals with explicit confidence levels, not as pass/fail gates. The final thesis fit score weights the deterministic criteria heavily and treats subjective criteria as tiebreakers. Sam reviews and tunes the weighting in Phase 4\.

## **10.3 Ground Truth Risk** {#10.3-ground-truth-risk}

Continuous improvement requires a ground truth dataset. If Quadrant does not have historical examples of “good fit” and “poor fit” companies from past deal flow, the eval layer has nothing to learn from in its first weeks.

**Mitigation:** Phase 3 Week 4 includes a ground truth capture step where Sam reviews the first 10–25 candidates and labels each as good fit, poor fit, or unclear. This creates the starting ground truth dataset. Subsequent runs add to it automatically via the review dashboard feedback loop.

## **10.4 Integration Complexity Risk** {#10.4-integration-complexity-risk}

HubSpot, Microsoft Graph, Granola, Vercel KV, CMS data sources, and NPI Registry all have different schemas, different authentication mechanisms, different rate limits, and different failure modes. Integration debt compounds quickly.

**Mitigation:** Phase 2 introduces the connector abstraction specifically to contain this complexity in one layer. Every data source integration passes through a uniform interface with standardized error handling, rate limiting, and retry logic. New sources added later inherit this machinery.

## **10.5 False Confidence Risk** {#10.5-false-confidence-risk}

The most dangerous failure mode is polished output that looks right but is wrong. An LLM-generated investment thesis analysis that confidently cites a payer rate that turns out to be incorrect, or a candidate company whose EBITDA was hallucinated from limited data, is worse than no output at all because it wastes the time of the people reviewing it.

**Mitigation:** Every finding in the Sourcing Agent output is evidence-backed with a source reference. Findings without evidence are rejected before they reach the review dashboard. Confidence scores are surfaced prominently so Sam knows when the system is uncertain. The evaluation layer includes a “hallucination check” that verifies numeric claims against their cited sources.

# **11\. Out of Scope** {#11.-out-of-scope}

This section is as important as the scope itself. The following items are explicitly not part of this engagement. Each exclusion is deliberate, and each protects the project from scope creep that would otherwise kill it.

* **Rewrite of existing code:** No rewrite of briefingEngine.js. The existing code continues to run. The wrapper and refactor layers sit around it, not inside it.

* **Multi-tenant productization:** This engagement delivers internal IP for Quadrant’s use behind their firewall. FuzeBox is not building a commercial product, a multi-tenant platform, or a reusable SaaS offering as part of this engagement. If Quadrant wants to productize later, that is a separate conversation.

* **Autonomous decision-making:** The Sourcing Agent surfaces candidates and provides evidence. It does not attempt to autonomously make investment decisions, contact sellers, or take any action on its findings. All decision authority remains with Sam and the Quadrant team.

* **Publishing to external channels:** The Chief of Staff agent already creates Outlook drafts via Microsoft Graph. This engagement does not extend that to any other publishing channels — no social media, no marketing automation, no external sends of any kind.

* **12-agent framework or AEOS platform deployment:** This engagement does not introduce a 12-agent framework, an AEOS orchestration layer, or any other architecture that is larger than what Quadrant actually needs. If the engagement succeeds, those conversations can happen afterward. They are not part of this plan.

# **12\. What FuzeBox Needs From Quadrant** {#12.-what-fuzebox-needs-from-quadrant}

Successful delivery requires specific commitments from Quadrant at the start of the engagement:

* **Access:** Read access to the Vercel deployment running briefingEngine.js, the Vercel KV store holding daily\_briefing entries, and the HubSpot API with the relevant owner scopes. All access is read-only for Phase 1\.

* **Time:** Sam’s availability for a review call throughout the twelve weeks. Longer sessions at the Phase 1 report delivery and the first Sourcing Agent run.

* **Data authorization:** Written confirmation that CMS Medicare Utilization files and CMS Transparency in Coverage filings are acceptable data sources, plus clarity on any paid data subscriptions Quadrant wants included (e.g., PitchBook, Crunchbase, proprietary healthcare databases).

* **Ground truth examples:** A set of 5–10 past deal opportunities that Sam considers “good fit” (either pursued or successfully closed) and 5–10 that he considers “poor fit.” This seeds the eval layer.

* **Firewall boundary:** Confirmation of which Quadrant security boundary applies for Phase 4 production deployment. Is this deployed in an AWS account Quadrant owns, a Vercel enterprise tier, or somewhere else?

CONFIDENTIAL — Prepared by FuzeBox.AI for Quadrant Two Capital Partners — April 2026

*This plan is a proposal. All scope, timeline, and deliverables are subject to mutual agreement before execution.*