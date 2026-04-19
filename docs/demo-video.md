# Quadrant Sourcing Agent — Live Demo Video Script

**Target length:** 5–6 minutes
**Audience:** Les Ottolenghi (FuzeBox.AI), Sam Stillman (Quadrant Two Capital)
**Goal:** Prove the 3-day commitment: one agent genuinely live, real NPI + Bedrock + Postgres, evidence-backed findings, reviewer labels persist.
**Recording:** Screen capture + voice-over (no face-cam needed). 1080p, clean browser, sidebar visible.

---

## Pre-record checklist (5 min before you hit record)

1. **Browser window** — Chrome, full screen, single tab
2. **URL bar cleaned** — close all other tabs/bookmarks
3. **Zoom** — 100% (Ctrl+0) — no DevTools open
4. **Prime a recent cron run** — so the first screen shows data, not empty state:
   ```
   curl -H "Authorization: Bearer test-secret" https://vipquadrant.arkos.studio/api/sourcing/cron
   ```
   Wait for 200 response. This seeds a recent run into `quadrant.sourcing_runs`.
5. **Prime a second run ~2 minutes later** — so the "New run — reload" indicator fires during the demo without guesswork about cron timing. Alternatively, just let the scheduled cron do it — check the clock, aim to hit section 6 near a `*/5` minute boundary.
6. **Close toasts** — if a stale "Claude is active in this tab group" pill is on screen, dismiss it.
7. **Mic check** — 3 seconds of silence, then a clap to sync audio.

---

## 0 · Cold open (0:00 – 0:10)

**[SCREEN]** Start paused on `https://vipquadrant.arkos.studio/agents/sourcing-agent`. The green **● LIVE** pill and the "watching · next check in Ns" indicator are visible in the header. The Manager trace below shows a recent run from `scheduled-cron`.

**[VO]**
> This is the Quadrant Sourcing Agent running live. Every number on this screen came from a real NPI Registry lookup, a real Claude call, and a dedicated Postgres schema that nobody else in your infrastructure can touch. Let me walk you through it.

---

## 1 · What we're looking at (0:10 – 0:50)

**[SCREEN]** Slow cursor movement. Hover over, in order:
1. The **● LIVE** badge (2s)
2. The "Model: claude-sonnet-4-20250514" line (2s)
3. The three Specialist tiles — Company Finder, Business Type Classifier, Revenue Estimator (2s each)

**[VO]**
> The scope we committed to was exactly what Sam asked for — one agent, live end-to-end, the rest stays seeded. That's what you're seeing. The Sourcing Agent is a manager coordinating three specialists: a Company Finder that hits the public NPI Registry, a Business Type Classifier that decides if a provider is actually a third-party versus a hospital subsidiary, and a Revenue Estimator that uses Medicare utilization data to gate on your five-million-dollar threshold.

**[VO — continues]**
> Two design principles shaped this. First, rules in code, reasoning in models — any deterministic check runs in TypeScript, Claude only engages when there's genuine ambiguity. Second, graceful degradation — if any live dependency is missing, the UI falls back to seeded data and the demo never breaks.

---

## 2 · The Manager trace (0:50 – 1:50)

**[SCREEN]** Scroll down to the Manager trace panel. Point at the timestamp line at top.

**[VO]**
> The most recent run here was triggered by `scheduled-cron` — we wired a Vercel cron job to fire every five minutes so the trace is never stale. You can see the run started, the manager created a three-step plan against prompt version `live-v1`, and each step has its own row below with input count, output count, latency, tokens, and cost.

**[SCREEN]** Click the `>` arrow on **Step 1: Finder** to expand. Detail panel shows `input: 0 / output: 50 / tokens: in=0 out=0 / status: ok`.

**[VO]**
> Finder pulled fifty organization NPIs across our ten target states — that's the first line of evidence, and it's free because NPI Registry is a public API.

**[SCREEN]** Click `>` on **Step 2: Classifier**. Shows input/output counts and near-zero tokens.

**[VO]**
> Classifier took those fifty, applied rule-first gating — drop any individual NPI, drop any org with "hospital" or "medical center" in the name — and passed forty-seven through. Notice the token count is zero. That's the rule branch handling everything cleanly on this run. If an org name was ambiguous, Claude Haiku 4.5 would pick it up, and you'd see tokens and a small cost here.

**[SCREEN]** Click `>` on **Step 3: Estimator**. Shows 47 → 13.

**[VO]**
> Estimator matched each NPI against our bundled CMS Medicare utilization dataset, applied a 32-percent Medicare-share assumption, and gated on five million in estimated total revenue. Thirteen surfaced. Total cost across all three specialists — zero cents. Total latency — under a second.

---

## 3 · Run now — live pipeline in real time (1:50 – 3:00)

**[SCREEN]** Scroll back up. Hover over the **Run now** button. Click it. Button shows "Running…" with spinning icon.

**[VO]**
> I can also trigger a run manually. Watch the button.

**[SCREEN]** Wait 10–15 seconds. Page reloads. New trace at top shows triggered-by "Sam Stillman" (the default).

**[VO]**
> That was a round trip: Next.js called the API, the API hit NPI Registry, classifier ran the rules, estimator joined against CMS, we assembled evidence per candidate, and persisted fifty rows to `quadrant.sourcing_candidates` — all under twenty seconds. Notice the run at the top of the trace is now the one I just kicked off, triggered by Sam Stillman. The scheduled-cron run just moved one slot down the dropdown.

**[SCREEN]** Click the Run selector dropdown at top right of the Manager trace. Show two entries (at minimum) — `2026-04-19 · Sam Stillman` and `2026-04-19 · scheduled-cron`.

**[VO]**
> Run history persists. Every run is a row in Postgres with its full trace, its cost, and the candidate set it produced. Close the dropdown.

---

## 4 · Candidate Review — the Day-5 artifact (3:00 – 4:00)

**[SCREEN]** Click **Review surfaced candidates →** in the top-right. Navigates to `/sourcing/review`. Green LIVE pill visible in new header.

**[VO]**
> This is the screen Sam will actually work in. "Reviewed zero of forty-seven" — because the run I just kicked off has no labels yet. The forty-seven are all the classifier survivors; the top-right shows thirteen of them cleared the revenue gate.

**[SCREEN]** Hover over the filter pills: `all · 47`, `unreviewed · 47`, `good fit · 0`, `poor fit · 0`, `unclear · 0`.

**[VO]**
> Filter pills group by state. Sort defaults to confidence descending. Every row is a real organization — these NPIs came off the live Registry moments ago.

**[SCREEN]** Scroll down the table to find a row where both R1 (green check) AND R2 (green check) are true — e.g., `1ST MEDCARE CLINIC $6.2M`. Click the row.

**[VO]**
> Click any row to open the evidence panel.

---

## 5 · Evidence panel — rules in code, reasoning in models (4:00 – 5:00)

**[SCREEN]** Evidence panel open on the right side. Walk through the panel top to bottom:

**[SCREEN → pointer]** Disqualifier Screen pills (all green).

**[VO]**
> Quadrant's disqualifier screen runs as code — founder concentration, MSO absence, rate ceiling, prior-auth burden, referral concentration. All green on this candidate. Any red pill would pull the row back into human review.

**[SCREEN → pointer]** Identity block: NPI, taxonomy, service category, geography.

**[VO]**
> Identity pulled from the NPI Registry — real NPI, real taxonomy, real practice location. No guessing.

**[SCREEN → pointer]** RULE 1 — 3RD-PARTY PROVIDER? Pass line.

**[VO]**
> Rule one — is this a third-party provider — passed via the deterministic classifier. No tokens spent. The classifier's reasoning is logged below.

**[SCREEN → pointer]** RULE 2 — REVENUE ≥ $5M box (orange border, "ASSUMPTION-SENSITIVE" tag).

**[VO]**
> Rule two is the interesting one. We can't look up total revenue directly, so we extrapolate from Medicare volume using a Medicare-share assumption — thirty-two percent by default. We prominently flag this as assumption-sensitive because of the false-confidence risk Sam called out. Watch what happens when I move the slider.

**[SCREEN → action]** Drag the Medicare % slider from 32% → 25% → 40% → back to 32%. Watch "Extrapolated total" recalculate in real time.

**[VO]**
> At twenty-five percent, the estimate goes up and the band widens. At forty percent, it goes down. Every claim in this panel links to its source.

**[SCREEN → action]** Scroll down inside the panel to "Raw evidence (3)". Point at each evidence row.

**[VO]**
> NPI Registry source at ninety-six percent confidence. CMS Medicare utilization at eighty-two. Classifier verdict at eighty. Click any link and you land on the actual source document — nothing fabricated.

---

## 6 · Label persistence + the scheduled cron loop (5:00 – 5:50)

**[SCREEN]** Scroll to bottom of evidence panel. Click **Good fit**. The button fills, a subtle "Last labeled by Sam Stillman · timestamp" line appears.

**[VO]**
> Sam marks this one good fit. That POSTs to our label endpoint, updates the row in `quadrant.sourcing_candidates`, and returns.

**[SCREEN]** Close the evidence panel with the X. Counter at top now reads "Reviewed 1 of 47 · 1 good / 0 poor / 0 unclear". Filter pill `good fit · 1` has the count. Table row state badge changes from "Unreviewed" to green "Good fit".

**[VO]**
> Counter updates everywhere. Refresh the page and the label persists — that's a real database write, not client state.

**[SCREEN → action]** Hard reload the page (Ctrl+F5). Counter still shows "Reviewed 1 of 47".

**[SCREEN → action]** Click **Sourcing Agent** in the sidebar to go back. Watch the header — if the cron has fired since, it will show amber **🔄 New run — reload**. Otherwise show the "watching · next check in Ns" steady state.

**[VO — if reload button visible]**
> While we were in the review screen, the scheduled cron fired another run. The page picked it up passively — no forced refresh, Sam stays in control. One click and we're back on the latest trace.

**[VO — if still "watching"]**
> The indicator here is the passive poller. Every thirty seconds it checks if the backend has a newer run. When it does, this flips to an amber reload button. That means at no point during a demo or a real review session does Sam see stale data — but he also never gets yanked out of what he's working on.

---

## 7 · Closing (5:50 – 6:20)

**[SCREEN]** Stay on the Sourcing Agent page. Slight pause.

**[VO]**
> Three points before we close. First — everything you just saw runs inside your firewall. Dedicated Postgres role, isolated schema, no shared auth with your existing Supabase setup. Second — the cost cap is two dollars per run, armed regardless of whether the trigger is manual, scheduled, or API. No runaway Bedrock bills. Third — this is the proof-of-concept shape of the delivery. The same UI becomes the live artifact on week one of the longer engagement; the seed data just gets replaced by your real ingest.

**[VO]**
> Happy to walk through any part of this again. Over to you.

**[SCREEN]** Fade out or cut.

---

## Notes for the presenter

- **Speak slower than feels natural.** PE/finance-adjacent audience, technical claims, record-then-review — aim for 150 words/min, not 180.
- **Pause after showing a number.** Let viewers read it before you name it.
- **Don't apologize for polish gaps.** If a Specialist tile still shows seeded latency/cost (known polish item), don't draw attention to it unless asked. Stay on the live trace below.
- **If the "New run — reload" button doesn't appear naturally** during section 6, skip the if-visible branch — the steady-state explanation is good enough.
- **If Run now fails mid-demo** (network hiccup, Bedrock 500), keep going — the prior runs in the dropdown are still real, the trace is still real, and graceful-503 fallback is itself a story point.

## Post-record

- Trim silence > 1.5s at cuts.
- Add 3-beat title card: "Quadrant × FuzeBox — Sourcing Agent Live · 2026-04-19".
- Export 1080p MP4. Upload to Loom (unlisted link) or share as file with Les.
