# AEOS Demo · Video Recording Script

**URL:** https://vipaeos.arkos.studio
**Default tenant:** Ken Garff Automotive (preloaded)
**Recommended duration:** 6–8 min
**Recording tip:** open the URL in an incognito window with browser zoom at 100%, full-screen the tab, set the tenant to *Ken Garff Automotive* before hitting record.

---

## 0. Opening shot — Mission Control · `/`
**(0:00 – 0:45)**

**On screen:** Mission Control loads. Hero EAI / HPI / HLR row at the top, Coverage Manifest below, Live Decision Feed and Path Mix donut on the next row.

**Say:**
> "This is AEOS — the joint-IP control plane between FuzeBox and rPotential. One screen, three load-bearing capabilities: cross-vendor observation, the Predictive Economic Ledger, and realtime injection on dual triggers.
>
> The headline number — Enterprise Autonomy Index — is signed by both parties. Single-party signatures are structurally refused. That's not a policy, it's a code invariant.
>
> Below it, the Coverage Manifest. Five hyperscalers, eight model labs, six agent platforms, twelve tool surfaces — each marked observed, gap, or planned. Coverage gaps are explicit; they're commercial risk we put on the wire."

**Action:** click the *Show vendors* expand on the Coverage Manifest. Let it scroll briefly so the viewer sees the named vendors (AWS Bedrock, Anthropic, Salesforce Agentforce, etc.). Collapse it.

**Say:**
> "Underneath, the live decision feed. Every recent UEF decision against this tenant. Most are hybrid — that's intentional, the system biases hybrid for strategic and safety-relevant skills."

---

## 1. The decision · `/decisions/[id]`
**(0:45 – 2:30)**

**Action:** click the **first row** in the Live Decision Feed (top of the list — should be the brake-diagnosis decision).

**On screen:** Decision Explorer loads. Task header with risk pill at top, then UEF Decision + Adapter Result, the 8-dimension Scored Paths table, and below it the new Score Computation panel.

**Say:**
> "A brake-squeal task arrived from a Ken Garff service bay. Watch the system make the decision.
>
> Eight dimensions, scored across every candidate path. Hybrid Anthropic + Human wins. Why?"

**Action:** scroll down to the **Score computation · winner** panel (the new explicit math panel).

**Say:**
> "Look at the math. The winning path scored 3.73 — and three of those eight dimensions come exclusively from rPotential's workforce graph.
>
> GSTI — strategic talent signal. UoP — actor readiness minus fatigue. Coordination Tax — workflow friction.
>
> No runtime vendor can produce these. OpenAI can't, Anthropic can't, Salesforce can't. They don't have the workforce data. That's the joint-IP moat — without rPotential, AEOS doesn't exist; without AEOS, rPotential's signal isn't economically meaningful at the agent layer."

**Action:** scroll to **DIR Patch** card and **Policy Evaluation** card.

**Say:**
> "Before any vendor saw the prompt, the Layer-9 Dynamic Instruction Runtime fired two rules: safety-relevant confirmation and auto-safety tool lockdown. It restricted three destructive tools, forced citations, and required human confirmation.
>
> The policy engine returned ALLOW with five required controls — audit log, human-in-loop, evidence export, explanation interface, EU residency. Each of those is now a line in the ledger. That's the EU AI Act Article 12 trail."

**Action:** scroll down to **Cross-Vendor Patch Translation**.

**Say:**
> "And here's the cross-vendor part. Same canonical patch, translated for Anthropic, OpenAI, and Vertex side-by-side. The patch is vendor-agnostic; the translation is the work. Patches propagate regardless of which vendor the agent runs on next."

---

## 2. The Ledger · `/ledger`
**(2:30 – 3:45)**

**Action:** click *Ledger* in the sidebar.

**On screen:** Ledger page loads. Top: the **LedgerRow v2.3 · five substructures** explainer card. Below: the row table.

**Say:**
> "The Predictive Economic Ledger. Append-only. Every row carries five substructures, all on screen.
>
> Predicted dollar value at decision time, signed by FuzeBox. Actual outcome from the dealership system of record, co-signed FuzeBox plus rPotential. Variance computed on two dimensions — technical and economic. Attribution into one of five buckets. Correction — a DIR patch object that fires automatically when attribution lands on the agent."

**Action:** click any row that shows a **wrench icon** in the Correction column (a row where a patch was applied — usually a few visible).

**On screen:** drawer opens with full LedgerRow detail.

**Say:**
> "Here's a row that breached tolerance. Predicted $187. Actual $156. Variance minus $31. The technical side shows a hallucination delta over threshold. Attribution: agent_instructions — the prompt didn't enforce citation density.
>
> The system fired a correction automatically. Patch type: instruction_add. Co-signed. The next five executions of this skill ran under the new patch and the variance shrank."

**Action:** close the drawer.

**Say:**
> "That's the AEOS loop in one row. Predict, observe, reconcile, attribute, correct. Every stage signed."

---

## 3. The Auto-Improvement workspace · `/dir`
**(3:45 – 5:30)** — *the headline utility*

**Action:** click *Auto-Improvement → Recommendations* in the sidebar.

**On screen:** Auto-Improvement page. Realised-impact summary row at top, then pending recommendations as rich cards.

**Say:**
> "This is the part of AEOS we sell as a utility on top of the platform.
>
> The system continuously analyses the ledger for delta-improvement opportunities. Variance breaches, drift signals, eval failures — grouped by skill, vendor, and time window. From those patterns it generates improvement hypotheses with projected impact."

**Action:** point at the **first recommendation card** (TSB citation density on brake diagnosis).

**Say:**
> "Here's an active recommendation. The system noticed seventeen brake-diagnosis runs in the last seven days had eighteen percent TSB-citation miss rate, with a $214 mean variance per run. The hypothesis: tighter citation density should reduce both hallucination and economic variance.
>
> It's projected: $3,640 a week in variance reduction, EAI plus 0.012, confidence 87 percent. Policy check passed against the EU AI Act explainability rule.
>
> But here's the key — humans stay in control. The system *recommends*. I'm the platform owner. I review the diff, I see the proposed change…"

**Action:** click **View diff** on that first card.

**On screen:** modal opens with red/green side-by-side diff.

**Say:**
> "The exact prompt edit. Before, after. Annualised projection. I can approve and deploy, or reject. Either way the decision is on the audit trail."

**Action:** close the modal.

**Action:** scroll down to the **Improvement history** table.

**Say:**
> "Track record — last ninety days. Some confirmed: the engine-misfire prompt edit reduced variance sixty-three percent over fourteen days. Some rejected by me: the works-council model swap, confidence was below 0.5 on a twelve-row sample. Some auto-reverted: the weather weighting on capacity planning overcorrected on calm days, the system rolled it back per outcome guardrail."

**Action:** click the **first confirmed row** (e.g., the 2026-04-08 brake-diag one).

**On screen:** Outcome modal with projected vs realised side-by-side.

**Say:**
> "Projected vs realised, side by side. Detected, reviewed, applied, measured — every step time-stamped. Co-signed by both parties. This is what makes the system trustworthy: we don't just propose changes, we measure whether the proposal worked."

**Action:** close modal. Scroll down to **How Auto-Improvement works** flow diagram.

**Say:**
> "Telemetry → Pattern → Hypothesis → Govern → Approve → Deploy → Measure. Seven stages, one of them — Approve — is human, all of them are signed.
>
> We took inspiration from automated research feedback loops. The agent population genuinely improves over time, but no change ships without human review. That's how you sell autonomy to a regulated enterprise."

---

## 4. The board number · `/eai`
**(5:30 – 6:30)**

**Action:** click *EAI Board* in the sidebar.

**On screen:** EAI Hero, Sub-Metrics tiles, EAI Computation panel, Rolling Time-Series.

**Say:**
> "Scaled across the enterprise, this is what the board sees. Enterprise Autonomy Index.
>
> Six sub-metrics — UCS, SY, SER, EROI, HPI, HLR. Each has its own derivation."

**Action:** scroll to the **EAI computation** panel.

**Say:**
> "And here's the math behind the headline. Three components.
>
> Component A — AI execution quality: ai_share times success rate times governance factor times economic return. Component B — Human preservation lift: hybrid share times preservation factor. Component C — Risk drag: control failures plus risk penalties.
>
> EAI equals A plus B minus C. Each multiplier is a real value from this tenant's last thirty days of ledger. The headline number isn't a vibe — it's the equation."

**Action:** scroll to the **30-day rolling time-series**.

**Say:**
> "Last thirty days of EAI. Trending upward. Three inflection points marked in amber. Hover one."

**Action:** hover over an amber dot on the time-series.

**On screen:** tooltip shows the synthesized rule that fired at that inflection.

**Say:**
> "Each inflection is where the auto-improvement system synthesized a new DIR rule from aggregated eval failures. Brake-diag hallucination guard. Responsible-gaming loss-streak intervention. Compliance citation density.
>
> The agents are getting better. Variance is shrinking. The board number is climbing. And every point on this chart is signed by both parties."

---

## 5. The audit asset · `/evidence`
**(6:30 – 7:15)**

**Action:** click *Evidence Export* in the sidebar.

**On screen:** export form on the left, bundle queue on the right.

**Say:**
> "When the regulator shows up, this is the artifact. Pick a format — EU AI Act Article 12, WP.29, GDPR, SOC 2 — pick a period, click Export."

**Action:** click *Export & sign*.

**On screen:** 1.8s skeleton with the assembling message, then the signature reveal modal pops.

**Say:**
> "The system assembles decisions, instruction patches, ledger trace, the policy pack used. Hashes the bundle. Signs it.
>
> Two parties. FuzeBox with ed25519. rPotential with HMAC-SHA256. Either signature alone is invalid. The auditor verifies the bundle offline against either public key independently. Seven-year compliance retention."

**Action:** close the modal.

---

## 6. Closer
**(7:15 – 7:45)**

**Action:** click *Mission Control* (back to home).

**Say:**
> "That's AEOS. Cross-vendor observation. The Predictive Economic Ledger. Realtime injection. Two-party attestation.
>
> Plus Auto-Improvement on top — the agents propose their own next-day's prompt, but you ship it. Variance shrinks; the ledger proves it; the regulator can verify it.
>
> One screen. One number. One signed asset per execution. That's the demo."

**End recording.**

---

## Recording checklist

### Before
- [ ] Set tenant to **Ken Garff Automotive** in the sidebar
- [ ] Browser zoom: 100%
- [ ] Full-screen the browser tab
- [ ] Close other tabs / extensions to keep the URL bar clean
- [ ] Have this script open on a phone or second monitor — don't read, glance

### During
- [ ] Speak slowly. The numbers are the point — let them breathe.
- [ ] Don't apologise for "this is a mock." It's a working platform with deterministic data. Treat it as live.
- [ ] If you misclick: keep talking. The screens are stable; cursor jitter is fine.
- [ ] When you hover the EAI inflection markers, pause for the tooltip to fully render before moving on.

### After
- [ ] Trim the front-and-back five seconds of dead air.
- [ ] Add a one-line opening title slide: "AEOS · FuzeBox + rPotential" with the URL.

---

## If Les pushes back on the "self-improving" claim live

Pull up `/dir` Auto-Improvement and point at any **history row with `CONFIRMED` status**. The outcome modal shows projected vs realised side-by-side with the lifecycle timeline. That's the receipt.

The claim isn't "AI rewrites itself" — it's "the system reads the economic ledger, proposes data-backed delta changes, humans approve, the next ledger window measures whether the change worked." Every word is on screen.

---

## Quick-reference shot list

| # | Section | Route | Key action |
|---|---|---|---|
| 0 | Mission Control | `/` | Expand Coverage Manifest |
| 1 | Decision Explorer | `/decisions/[id]` | Scroll to Score Computation, then DIR Patch, then Cross-Vendor Translation |
| 2 | Ledger | `/ledger` | Click a row with a wrench (correction) icon |
| 3 | Auto-Improvement | `/dir` | View diff on first card → close → click confirmed history row |
| 4 | EAI Board | `/eai` | Scroll to EAI computation, then hover an amber inflection |
| 5 | Evidence Export | `/evidence` | Click *Export & sign* |
| 6 | Closer | `/` | Back to Mission Control |

---

*Script for the demo at https://vipaeos.arkos.studio · branch `aeos-mock` · companion to AEOS_DEMO_SCRIPT.md.*
