# Ready-to-send email reply to engineers

**Subject:** FuzeBox AEOS — answers to your six questions, plus the
materials you asked for.

> Team,
>
> Attaching `ENGINEER-QA-BUNDLE.tar.gz`. Open `00-ANSWERS.md` first — it
> indexes everything.
>
> Short form:
>
> **Q1 — UEF + GSTI code:** in `fuzebox-aeos-FULL.tar.gz` (already sent).
> UEF entry point is `packages/uef/engine.py`, scoring is
> `packages/uef/scoring.py`, rPotential signals are
> `packages/rpotential_adapter/`. Hard rule: three of the eight UEF
> dimensions are rPotential-owned. Adapters must fetch, not synthesize.
>
> **Q2 — policy templates:** seven YAML templates in
> `02-policy-templates-yaml/`, including a brand-new SOC 2 pack. The
> policy engine loads JSON today — YAML is the authoring format. One
> parser swap and it accepts YAML directly.
>
> **Q3 — seed data:** honest status. We have 11 skills / 27 actors
> today, 40/200 target not yet authored. You get the real current
> fixtures *and* a placeholder generator that produces a 40/200 set
> for scaffolding. Real domain content coming from me; don't wait
> on it to wire up the DB schema.
>
> **Q4 — dashboard:** no wireframes yet, so I gave you the data
> contract and a 10-panel inventory ordered by narrative importance.
> `suggested-panels.md` + `narrative-flow.md` are the two files that
> matter. Designer coming.
>
> **Q5 — instruction runtime format:** JSON Schema + six example
> payloads + integration contract in `05-instruction-runtime-spec/`.
> Adapters have a five-clause obligation list; all five are already
> exercised by the 9/9 conformance suite, so your integration tests
> can cargo-cult from `packages/adapter_gateway/anthropic_adapter.py`.
>
> **Q6 — evidence delivery:** three options laid out with tradeoffs
> in `06-evidence-delivery/`. My recommendation is Option A (UI
> download) for the demo. If I don't override by end of week, build
> the UI-download path first — it's forward-compatible with the other
> two.
>
> Everything in the bundle is self-contained. Any question that turns
> into a discussion, let's take it to a call.
>
> Les

**Attach:** `ENGINEER-QA-BUNDLE.tar.gz` (~40 KB)
