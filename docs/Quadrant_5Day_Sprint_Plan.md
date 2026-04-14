

**Quadrant × FuzeBox.AI**

**5-Day Development Plan**

Chief of Staff Agent \+ Sourcing Agent MVP

Prepared for Sam Stillman — Quadrant Two Capital Partners

**Delivery Partner: Trigent**

Engagement Lead: Les Ottolenghi — FuzeBox.AI

April 2026 — Confidential

**Table of Contents**

# **1\. Executive Summary**

This plan outlines a 5-day sprint between Quadrant Two Capital Partners and FuzeBox.AI, with Trigent as the delivery partner, to instrument the existing Chief of Staff agent and build a working MVP of the Sourcing Agent. The plan is based on Sam Stillman’s direct confirmation of Quadrant’s current state and stated goals, not on aspirational architecture.

Sam confirmed three things that shape this plan. First, the Chief of Staff agent is real, working, and used primarily by Sam and Genevieve as a daily morning ritual — the goal is for it to become the first thing they check each day. Second, Sam attempted to build the Sourcing Agent and has not had success; he is asking FuzeBox to succeed where his own build failed. Third, Sam’s stated MVP criteria for the Sourcing Agent are deliberately narrower than the detailed acquisition thesis document: the agent must reliably identify actual 3rd-party service providers with estimated annual revenue of $5M or more. The detailed CPT and payer criteria are the target state for later phases, not for the first sprint.

Sam also stated the eventual vision: a Chief of Staff that learns and understands the Quadrant network and recommends who should be involved on a specific deal based on deal context. That is not in scope for this 5-day sprint, but it is the destination this engagement moves toward.

This sprint delivers working software in five business days with Trigent executing under FuzeBox architectural oversight. No rewrite of the existing Chief of Staff code. No multi-tenant platform. No 12-agent framework. Just the two things Sam asked for: telemetry around what already works, and a Sourcing Agent MVP that does what his own attempt could not.

*Quote from Sam: “We’re honestly just trying to see if this can actually be done well and if it can truly be monitored by FuzeBox.” This plan answers that directly.*

# **2\. What Sam Confirmed**

Every item in this plan is grounded in Sam’s direct written confirmation. The scope does not exceed what he asked for.

## **2.1 Chief of Staff — Confirmed**

* **Users:** The agent is primarily used by Sam and Genevieve. Ted is listed as a user but not an active focus.

* **Architecture:** Node.js application on Vercel, cron-triggered weekdays, pulling from HubSpot, Microsoft Graph, Granola, and Vercel KV, with a direct call to claude-sonnet-4-20250514 at 8,000 tokens.

* **Prompt:** The system prompt is a 40+ line string literal embedded in briefingEngine.js at lines 156–196.

* **Daily ritual goal:** “We want this to be the first thing we check in the morning to see what is on the docket, who needs a follow-up, and what time is needed to get urgent tasks done.”

* **Future state:** “Eventual goal is for it to potentially learn and understand our network, and offer recommendations as to who should get involved on a specific deal based on the information about the deal.” This is named here as the destination, not as sprint scope.

## **2.2 Sourcing Agent — Confirmed**

* **Current state:** “I’ve tried to build it but have not had success.” This is not a greenfield design exercise — it is a rescue.

* **Sam’s stated MVP criteria:** “Mostly paying attention to just the business type (are they actually a 3rd party service provider), the estimated annual revenue ($5M+).” This is the sprint MVP.

* **Evaluation criteria:** “We’re honestly just trying to see if this can actually be done well and if it can truly be monitored by FuzeBox.” This is the pass/fail test for the engagement.

* **Out of sprint scope:** The tiered CPT code logic, payer rate analysis, MSO geographic overlap, and disqualifier screening from the detailed acquisition criteria document. These are the target state and are explicitly deferred to a follow-on engagement.

# **3\. Guiding Principles**

Four principles shape every decision in the 5-day sprint. These are deliberate corrections against the common failure modes of enterprise AI projects.

## **3.1 Instrument Before You Replace**

Day 1 adds observability to the Chief of Staff workflow without modifying its code. This produces usage data that tells us what is actually valuable in the current system before any architectural decisions are made. The alternative — rebuilding first and measuring later — is how teams waste time replacing something that was working and miss what was actually broken.

## **3.2 Rules in Code, Reasoning in Models**

LLMs are reliable at interpretation, synthesis, and ambiguity. They are not reliable at deterministic arithmetic or threshold comparisons. “Is annual revenue ≥ $5M?” is not a reasoning task — it is a numeric comparison. This plan pushes all hard rules (revenue threshold, business type classification, disqualifier checks) into validated code paths and reserves LLM calls for the parts that actually need interpretation.

## **3.3 Evidence Required, Not Just Output**

Every company surfaced by the Sourcing Agent MVP must include a source reference and a confidence score. Investment decisions based on unsourced LLM assertions are organizational risk. Findings without evidence are rejected before they reach Sam’s review screen.

## **3.4 Five Days, Not Twelve Weeks**

This sprint is deliberately short. It is not a replacement for a longer engagement — it is a proof that the approach works. The output is instrumented code, a working MVP, and a decision point at the end of Day 5 about whether to extend into a follow-on engagement.

# **4\. Sprint Architecture**

The sprint architecture has three layers: a wrapper layer that captures telemetry around the existing Chief of Staff agent without modifying it, a specialist workflow layer that builds the Sourcing Agent MVP as coordinated components rather than a single monolithic agent, and an evaluation layer that scores every Sourcing Agent run automatically.

## **4.1 The Wrapper Layer (Chief of Staff)**

The wrapper layer intercepts calls to the existing briefingEngine.js without changing its code. It logs every input, every Claude API call, every output card, every user action (schedule, done, push), and every downstream Outlook draft. This produces a telemetry stream that answers three questions Sam cannot answer today: How often do Sam and Genevieve open the dashboard each morning? Which cards actually get acted on? Which cards get dismissed?

The wrapper is deployed as a proxy in front of the existing Vercel application. It requires no changes to briefingEngine.js, no changes to the cron handler, and no changes to the React dashboard. The only integration point is a routing change to pass traffic through the wrapper.

## **4.2 The Specialist Workflow Layer (Sourcing Agent MVP)**

The Sourcing Agent MVP is built as three specialist workflows coordinated by a narrow manager component. This is intentionally smaller than the full six-specialist architecture from the acquisition criteria document — it matches Sam’s stated MVP scope.

| Specialist | Responsibility | Data Sources |
| :---- | :---- | :---- |
| **Company Finder** | Identify candidate companies in healthcare service categories within target geographies | CMS Medicare Utilization files, NPI Registry, state licensing databases |
| **Business Type Classifier** | Verify each candidate is actually a 3rd-party service provider, not a captive practice or integrated health system | NPI taxonomy codes, company websites, SEC and state corporate filings |
| **Revenue Estimator** | Estimate annual revenue and filter to $5M+ threshold, with confidence scoring on the estimate | CMS Medicare claims volume, public directories, commercial database enrichment where available |

## **4.3 The Evaluation Layer**

Every candidate the specialists surface is scored automatically against Sam’s MVP criteria before reaching the review screen. A candidate that fails the business type check or the revenue threshold is filtered out with an evidence-backed reason. A candidate that passes both is presented to Sam with source references for every claim.

# **5\. The 5-Day Sprint**

Trigent executes the sprint under FuzeBox architectural oversight. Each day has a defined deliverable, a defined owner, and a defined acceptance test. All work is tracked in a shared project board visible to Sam in real time.

## **5.1 Day 1 — Monday: Instrument and Inventory**

Day 1 runs two parallel tracks. Trigent Track A instruments the existing Chief of Staff agent without touching its code. Trigent Track B completes the Sourcing Agent data inventory.

* **Track A morning:** Deploy the wrapper proxy in front of the existing Vercel application. Route cron and on-demand briefing traffic through the proxy. Capture every request, every Claude API call, and every response.

* **Track A afternoon:** Instrument the schedule-task, done-task, and push-task endpoints to capture which cards Sam and Genevieve act on. Log dashboard open events to measure the morning ritual baseline.

* **Track B morning:** Confirm CMS Medicare Utilization file access, NPI Registry API availability, and state licensing database coverage. Identify any gaps before code is written.

* **Track B afternoon:** Build the structured criteria engine for the two MVP rules: business type classification and $5M+ revenue threshold. This is pure code, no LLM involved.

* **End-of-day acceptance:** Wrapper proxy is live and logging every Chief of Staff request. First telemetry data visible to Sam in a shared dashboard by end of day. Sourcing data inventory complete with any gaps documented.

## **5.2 Day 2 — Tuesday: Specialists Alpha**

Day 2 builds the three Sourcing Agent specialists in isolation. Each specialist is tested against a small set of known examples before integration.

* **Morning:** Company Finder specialist built and tested against a single target service category (recommended: Outpatient Physical Therapy Tier 1 given fragmentation and data availability).

* **Midday:** Business Type Classifier built. Uses NPI taxonomy codes and corporate filings as primary signals, with LLM interpretation only for ambiguous cases.

* **Afternoon:** Revenue Estimator built. Produces a numeric estimate plus a confidence score. Candidates with confidence below a threshold are flagged rather than filtered.

* **End-of-day acceptance:** Each specialist produces structured output for a test input. Outputs include source references. Chief of Staff telemetry shows first 24 hours of real usage data.

## **5.3 Day 3 — Wednesday: Integration and Evidence**

Day 3 integrates the three specialists under a narrow manager component and builds the evidence layer that backs every claim with a source reference.

* **Morning:** Manager component built. Receives a manual trigger (matching Sam’s stated requirement), creates a work plan, invokes specialists in sequence, and consolidates findings.

* **Midday:** Evidence layer built. Every specialist output is validated for source provenance before being passed to the manager. Findings without evidence are rejected automatically.

* **Afternoon:** First end-to-end integration run. Manager executes all three specialists against a small candidate pool and returns consolidated findings with evidence.

* **End-of-day acceptance:** End-to-end run completes without errors. Output format matches the defined schema. Every claim in the output has a source reference. Chief of Staff telemetry continues to accumulate.

## **5.4 Day 4 — Thursday: Evaluation and Review UI**

Day 4 builds the automated evaluation layer and the review interface Sam will use to judge the results.

* **Morning:** Evaluation layer built. Every candidate output is automatically scored against the two MVP criteria. Candidates failing either check are filtered out with reasons logged.

* **Midday:** Review dashboard built. Simple web interface showing candidate companies sorted by confidence score, with expandable evidence per claim and good-fit / poor-fit feedback buttons for Sam.

* **Afternoon:** First full Sourcing Agent run produces 10 to 25 candidates. Chief of Staff usage report draft produced from three days of telemetry.

* **End-of-day acceptance:** Sam can log in to the review dashboard and see real candidates with evidence. Sam can see a preliminary Chief of Staff usage report showing his and Genevieve’s morning ritual baseline.

## **5.5 Day 5 — Friday: Live Run, Report, and Decision**

Day 5 executes the live Sourcing Agent run, delivers the Chief of Staff usage report, and holds a decision meeting with Sam.

* **Morning:** Second Sourcing Agent run against a larger candidate pool. Sam reviews live results during a working session with Les and Trigent. Sam marks each candidate as good fit, poor fit, or unclear — this captures the first ground truth dataset.

* **Midday:** Chief of Staff usage report delivered. Report covers morning ritual frequency (how often Sam and Genevieve open the dashboard), card action rates, dismissal rates, and user-specific patterns. Report also identifies the top three improvement opportunities in the existing prompt.

* **Afternoon:** Sprint retrospective and decision meeting with Sam. Three decisions on the table: does the Chief of Staff telemetry show a measurable morning ritual baseline; does the Sourcing Agent MVP produce candidates Sam considers useful; and does Sam want to extend into a follow-on engagement covering the full acquisition criteria document and the network-learning vision.

* **End-of-day acceptance:** Sam has working telemetry on the Chief of Staff agent. Sam has a working Sourcing Agent MVP he can trigger manually. Sam has a written decision on whether to extend the engagement.

# **6\. Trigent Delivery Model**

Trigent is the delivery partner for this sprint. FuzeBox provides architectural oversight, the evaluation methodology, and the direct relationship with Sam. Trigent provides the engineering capacity to execute the sprint in five days.

## **6.1 Team Composition**

* **FuzeBox oversight:** Principal architect (FuzeBox, Les Ottolenghi). Owns the relationship with Sam, sets architectural direction, reviews all major decisions, attends Day 5 decision meeting.

* **Trigent sprint team:** One technical lead, two full-stack engineers, one data engineer for CMS and NPI integration. Dedicated for the full five days.

* **Quadrant time commitment:** Sam Stillman commits to a 30-minute daily standup Monday through Thursday at a time of his choosing, plus a 90-minute working session on Day 5 Friday morning.

## **6.2 Daily Standup Structure**

The daily standup is the primary coordination mechanism during the sprint. Every standup follows the same structure:

* What was completed yesterday against the defined deliverable.

* What is planned for today and by when.

* Any blockers requiring Sam’s input or decision.

* Any new telemetry data Sam should be aware of.

* Any adjustments to the next day’s plan based on what was learned today.

## **6.3 Quality Controls**

* **Code review:** Every commit goes through FuzeBox architectural review before end of day. No code ships without review.

* **Acceptance tests:** Every specialist and every integration point has defined acceptance tests that must pass before the day is marked complete.

* **Daily demo:** Sam sees every piece of working software in a shared environment on the day it is built, not at the end of the week.

* **Scope discipline:** Any scope change requires written approval from Sam before work begins. No surprise scope expansion.

# **7\. Deliverables Summary**

At the end of Day 5, Sam receives the following artifacts. Each is production-quality for internal Quadrant use, not a prototype to be rebuilt later.

## **7.1 Chief of Staff Deliverables**

* **Telemetry wrapper:** Wrapper proxy deployed in front of the existing Vercel application. Read-only telemetry. No modifications to briefingEngine.js.

* **Usage dashboard:** Live dashboard showing morning ritual frequency, card action rates, dismissal rates, and user-specific patterns for Sam and Genevieve.

* **Usage report:** Written report covering the first five days of telemetry, identifying the top three improvement opportunities in the existing prompt, and recommending next steps.

* **Prompt version capture:** The current 40+ line system prompt extracted from briefingEngine.js and stored in a version-controlled blueprint registry. The existing code continues to use it verbatim — no functional change, just version tracking.

## **7.2 Sourcing Agent Deliverables**

* **Structured criteria engine:** Two deterministic rules from Sam’s MVP criteria encoded as validated code, not prompts.

* **Three specialist workflows:** Company Finder, Business Type Classifier, and Revenue Estimator. Each built as an independent workflow with its own data access and structured output.

* **Manager component:** Narrow coordination component that receives a manual trigger, invokes specialists, and consolidates findings with evidence.

* **Evidence layer:** Source provenance on every claim. Findings without evidence rejected automatically.

* **Evaluation layer:** Automated scoring against the two MVP criteria with reasons logged for every filtered candidate.

* **Review dashboard:** Web interface showing candidates sorted by confidence, with expandable evidence and good-fit / poor-fit feedback buttons.

* **First live run output:** 10 to 25 evidence-backed candidate companies produced by the live Day 5 run. First ground truth dataset captured from Sam’s review.

# **8\. Out of Scope for This Sprint**

This section protects the sprint from the scope creep that would otherwise kill a 5-day delivery. Every item here is a deliberate exclusion tied to Sam’s actual ask.

* **No rewrite of briefingEngine.js:** The existing code continues to run. The wrapper sits around it, not inside it.

* **No full acquisition criteria coverage:** The full tiered CPT code logic, payer rate analysis, MSO geographic overlap, Transparency in Coverage filings, and disqualifier screening are explicitly deferred. They are the target state for a follow-on engagement, not for this sprint. Sam’s stated MVP is business type plus revenue threshold — this sprint delivers that and nothing more.

* **No network learning or deal routing:** Sam’s eventual goal — a Chief of Staff that learns the Quadrant network and recommends who should be involved on a deal — is named here as the destination but is not in sprint scope. See Section 9\.

* **No multi-tenant productization:** This sprint delivers internal IP for Quadrant’s use behind their firewall. No multi-tenant platform, no SaaS productization, no commercial reuse. If Quadrant wants to productize later, that is a separate conversation.

* **No autonomous decision-making:** The Sourcing Agent surfaces candidates with evidence. It does not make investment decisions, contact sellers, or take action. All decision authority remains with Sam and the Quadrant team.

* **No 12-agent framework or AEOS deployment:** No AEOS platform pitch, no 12-agent framework, no enterprise platform licensing. The sprint is scoped to exactly what Sam asked for.

# **9\. Future State: What Sam Described**

Sam’s answers included a clear statement of where he eventually wants the Chief of Staff to go: “Eventual goal is for it to potentially learn and understand our network, and offer recommendations as to who should get involved on a specific deal based on the information about the deal.” This section names that vision and outlines what it would require, so that when the sprint ends Sam and FuzeBox have a shared understanding of where a follow-on engagement would go.

## **9.1 Network Memory**

Network learning requires three components beyond the current Chief of Staff: a graph model of people, companies, and relationships Quadrant has interacted with over time; a memory layer that updates that graph from every briefing, email, meeting, and deal interaction; and a query layer that can answer questions like “who at Quadrant has the strongest relationship with this broker” or “what past deals look similar to this one.” None of these exist today.

## **9.2 Deal Context Reasoning**

Deal-routing recommendations require the system to reason about deal context: the investment thesis involved, the industry, the geographic market, the deal size, the stage of the deal, and the skills or relationships needed to move it forward. This is substantially harder than the current Chief of Staff’s card generation because it requires the system to have opinions about deal fit and human fit — both of which need ground truth datasets Quadrant does not yet have.

## **9.3 Follow-On Engagement**

A follow-on engagement would likely cover: the full acquisition criteria document (the remaining specialists and rules from the detailed thesis), the network memory layer, the deal context reasoning layer, and a production-grade deployment with access control, audit trail, and monitoring. Rough scope estimate: six to twelve weeks depending on data availability and ground truth capture. The Day 5 decision meeting is where Sam decides whether to open that conversation.

# **10\. Risks and Mitigation**

Four risks are material to a 5-day sprint. Each is identified with a specific mitigation.

## **10.1 Data Availability Risk**

The Sourcing Agent depends on CMS Medicare Utilization files, NPI Registry data, and state licensing information. If any of these is incomplete, dirty, or inaccessible in the first 24 hours of the sprint, Day 2 and beyond suffer.

**Mitigation:** Day 1 Track B is specifically dedicated to data inventory before any code is written. Known gaps are documented immediately. If a critical source is unavailable, the sprint adjusts by narrowing to service categories with sufficient public data and flagging the gap for the follow-on engagement.

## **10.2 Ground Truth Risk**

The evaluation layer needs historical examples of good-fit and poor-fit companies to learn from. If Sam cannot provide examples from past deal flow at the start of the sprint, the eval layer has nothing to calibrate against in its first days.

**Mitigation:** Sam is asked to provide five good-fit examples and five poor-fit examples before Day 1 kickoff. If these are not available, the Day 5 live run itself becomes the ground truth capture session — Sam marks each candidate as good fit, poor fit, or unclear during the working session.

## **10.3 False Confidence Risk**

The most dangerous failure mode is polished output that looks right but is wrong. A Sourcing Agent that surfaces a candidate with hallucinated revenue or a misclassified business type is worse than no output at all because it wastes Sam’s review time.

**Mitigation:** Every finding is evidence-backed with a source reference. Findings without evidence are rejected before reaching the review dashboard. Confidence scores are surfaced prominently. The evaluation layer includes a verification step that cross-checks numeric claims against their cited sources.

## **10.4 Sprint Pace Risk**

Five days is aggressive. A single blocker on Day 1 or Day 2 can cascade into a missed Day 5 delivery.

**Mitigation:** The daily standup structure surfaces blockers the same day they appear. Trigent holds a reserved capacity buffer equivalent to 20% of total sprint hours for unplanned work. If any day’s deliverable is at risk by its end-of-day acceptance test, the sprint team has authority to reduce scope (specifically: drop from three specialists to two, or defer the review dashboard to a follow-on day) rather than miss Day 5\. Any such reduction is communicated to Sam immediately.

# **11\. What Quadrant Needs to Provide**

Successful delivery requires specific commitments from Quadrant at the start of the sprint. These are minimal but non-negotiable — the sprint cannot start without them.

* **Access:** Read access to the Vercel deployment running briefingEngine.js, the Vercel KV store holding daily\_briefing entries, and the HubSpot API with the relevant owner scopes. All access is read-only.

* **Time:** Sam commits to a 30-minute daily standup Monday through Thursday and a 90-minute working session Friday morning.

* **Data authorization:** Written confirmation that CMS Medicare Utilization files, NPI Registry, and state licensing databases are acceptable data sources for the sprint.

* **Ground truth examples:** Five companies Sam considers “good fit” (pursued or successfully closed) and five he considers “poor fit.” Needed before Day 1 if possible, otherwise captured during the Day 5 working session.

* **Firewall boundary:** Confirmation that sprint output is deployed inside Quadrant’s security boundary for the duration of the sprint (Quadrant-owned cloud account or Vercel enterprise tier).

# **12\. The Day 5 Decision**

The sprint ends with a decision meeting. Sam, Les, and the Trigent technical lead review the sprint output and answer three questions:

* Does the Chief of Staff telemetry show a measurable morning ritual baseline — and does the usage report identify real improvements worth making?

* Does the Sourcing Agent MVP produce candidates Sam considers useful, even at the narrower business-type-plus-revenue scope?

* Based on answers one and two, does Sam want to extend the engagement into a follow-on that covers the full acquisition criteria document, the network memory vision, and production hardening?

If the answer to question three is yes, FuzeBox and Trigent return the following week with a scoped follow-on proposal based on what was actually learned during the sprint. If the answer is no, Quadrant keeps the sprint deliverables, the telemetry, and the working Sourcing Agent MVP — all production-quality, all theirs to use.

*Sam said: “We’re honestly just trying to see if this can actually be done well and if it can truly be monitored by FuzeBox.” Day 5 answers that question with working software, not a slide deck.*

CONFIDENTIAL — Prepared by FuzeBox.AI for Quadrant Two Capital Partners — Delivery by Trigent — April 2026

*This plan is a proposal. All scope, timeline, and deliverables are subject to mutual agreement before execution.*