# Ready-to-paste email drafts

## To TRIGENT — subject: "FuzeBox AEOS — engineering / runtime handoff"

> Team,
>
> Attaching the engineering-track handoff for FuzeBox AEOS. Everything
> in this bundle is already green end-to-end against the 9/9 conformance
> suite — you don't need to fix anything before you start extending.
>
> **Start here:** `TRIGENT-brief.md` in the bundle root. It lists the six
> work items already landed on your side (Prompts 1, 2, 5, 6, 14, 15 from
> `CLAUDE.md`) and the six follow-on prompts (7, 8, 9, 11, 12, 13) that
> are yours to pick up next.
>
> **Smoke test on arrival:**
> ```
> tar xzf TRIGENT-bundle.tar.gz
> cd fuzebox-aeos
> python3 -m apps.conformance_suite.run_suite   # must print "9/9"
> python3 -m apps.kengarff_demo.main            # must print "DEMO COMPLETE"
> python3 -m scripts.list_skus                  # SKU matrix
> ```
>
> Zero pip installs required. Python 3.10+.
>
> Six invariants are listed at the bottom of the brief — please don't
> route around them. If one of them is in your way, flag it and let's
> talk; don't bypass.
>
> Les

**Attach:** `TRIGENT-engineering/TRIGENT-bundle.tar.gz`
(~77 KB, well under any mail-server limit)

---

## To TRIGMA — subject: "FuzeBox AEOS — governance / attestation handoff"

> Team,
>
> Attaching the governance-track handoff for FuzeBox AEOS. The four
> work items in this bundle (Prompts 3, 4, 10, and the two-party
> attestation refusal) are the **joint-IP defensibility layer** — this
> is what makes the EAI credible to regulators and audit committees.
>
> **Start here:** `TRIGMA-brief.md` in the bundle root. Three artifacts
> in there are the contractual lever with rPotential:
>
>   1. `policies/aeos_governance_edition.json` — two-party attestation
>      is now a critical-severity policy rule.
>   2. `AttestationSigner.sign_bundle()` raises
>      `SinglePartyAttestationRefused` if either HMAC leg is missing.
>   3. `tests/test_two_party_attestation.py` — five tests that lock
>      that behavior in as a regression-protected invariant.
>
> **Smoke test on arrival:**
> ```
> tar xzf TRIGMA-bundle.tar.gz
> cd fuzebox-aeos
> python3 -m apps.conformance_suite.run_suite                # 9/9
> python3 -m pytest tests/test_two_party_attestation.py -v   # 5 pass
>
> # Hero demo for regulators — emits a fully signed bundle:
> python3 -m scripts.export_evidence \
>     --tenant kengarff_south_jordan \
>     --format eu_ai_act_article_12 \
>     --period-start 2026-01-01 \
>     --period-end 2026-12-31
> ```
>
> Suggested pickups are at the bottom of the brief — HIPAA / FINRA
> policy packs, KMS-backed ECDSA keys, new DIR rules for regulated
> verticals. All self-contained.
>
> Les

**Attach:** `TRIGMA-governance/TRIGMA-bundle.tar.gz`
(~77 KB)

---

## Optional — to both, with executive summary

**Subject:** "FuzeBox AEOS — 9/9 green, handoff packages ready"

> All,
>
> AEOS is green: 9/9 conformance, 13/13 unit tests, Ken Garff demo runs
> end-to-end with zero pip installs. Executive summary attached.
>
> Two independent handoff bundles going out:
>
>   - **TRIGENT** gets the engineering / runtime track — new Google
>     Vertex adapter, 9th conformance flow (insurance triage), L9→
>     adapter wiring, durable ledger replay, CI gate, commercial SKU
>     catalog.
>
>   - **TRIGMA** gets the governance / attestation track — tightened
>     EU AI Act policy pack (2-year retention + explainability),
>     GDPR-sensitive PII-mask L9 rule, signed evidence bundle CLI, and
>     the two-party attestation refusal that makes the joint-IP story
>     with rPotential structurally enforceable.
>
> Each partner's bundle is a complete, standalone, runnable repo.
> Neither blocks on the other.
>
> 30-second smoke test in `03-VERIFICATION.md`.
>
> Les

**Attach:** `01-EXECUTIVE-SUMMARY.md`, `02-CHANGES-MANIFEST.md`,
`03-VERIFICATION.md`, `fuzebox-aeos-FULL.tar.gz`
