# Conformance Suite

The AEOS conformance suite is the minimum-viable regression test for the
control plane. It executes the eight canonical flows from Tech Spec v1.1
§19 end-to-end through all twelve layers and verifies structural
invariants on each.

## Running the suite

```bash
# Plain Python runner (no pytest required)
python -m apps.conformance_suite.run_suite

# Or via pytest if installed
pytest apps/conformance_suite/test_conformance.py -v
```

Exit code is non-zero on any failure. CI should gate merges on this.

## The eight flows

| Flow | Tenant | Skill | Policy Pack | Key assertion |
|---|---|---|---|---|
| `service_bay_diagnosis` | kengarff_south_jordan | skill_brake_diag_v3 | auto_safety_standard | hybrid path + human involved + DIR safety rule fires |
| `contact_center_escalation` | global_retail_cx | skill_contact_escalation_v1 | gdpr | policy.allow |
| `sportsbook_recommendation` | boyd_gaming_vegas | skill_sportsbook_reco_v1 | gambling_responsible | responsible-play DIR rule fires |
| `venue_operations_incident` | boyd_gaming_vegas | skill_venue_incident_v1 | eu_ai_act_high_risk | human involved + policy.allow |
| `marketing_campaign_exception` | acme_global_marketing | skill_marketing_exception_v1 | gdpr | policy.allow |
| `automotive_cockpit_compliance` | global_oem_cockpit | skill_cockpit_compliance_v1 | wp29 | human involved + policy.allow |
| `field_service_dispatch` | utility_field_ops | skill_field_dispatch_v1 | general | policy.allow |
| `hr_workforce_coaching` | bigco_hr | skill_hr_coaching_v1 | gdpr | policy.allow |

## What the suite proves

1. **UEF is deterministic at seed=42.** Given identical signals and
   performance history, the scoring loop picks the same path.
2. **Adapter isolation holds.** No vendor payload ever reaches the UEF
   or the ledger; all eight flows only serialize canonical types.
3. **Governance overrides are honored.** The EU AI Act + WP.29 flows
   always land on a human-involved path when the task is high-risk or
   auto-safety.
4. **L9 DIR fires on the right triggers.** Safety-relevant flows fire
   `dir_safety_relevant_confirmation`; auto-safety flows add
   `dir_auto_safety_tool_lockdown`; gambling flows fire
   `dir_gambling_responsible_play`.
5. **Economic Ledger closes the loop.** Every flow produces a row, the
   EMA performance update runs on Skills Authority, and the writeback
   lands in the rPotential mock log.

## Adding new flows

Edit `apps/conformance_suite/flows.py`. A flow is:

```python
ConformanceFlow(
    flow_id="my_new_flow",
    description="...",
    build_task=lambda: Task(...),
    skill_id="skill_xxx_v1",
    candidate_paths=[...],
    governance=_gov(policy_pack="..."),
    policy_pack_id="...",
    expect_path_in=[...],                    # optional
    expect_human_involved=True,              # optional
    expect_policy_allow=True,                # optional
    expect_rules_fired_any=["rule_id", ...], # optional
)
```

Append your factory to `ALL_FLOWS` and re-run. New flows require a
matching skill in `fixtures/skills.json`, a tenant actor roster in
`fixtures/actors.json`, and matching signals in `fixtures/signals.json`.

## CI gate (GitHub Actions)

`.github/workflows/conformance.yml` runs the suite on every pull request
and push to `main`. Merges are blocked when any flow fails. The workflow
also:

1. Runs `tests/test_two_party_attestation.py` to prove
   `AttestationSigner.sign_bundle` still refuses single-party signatures.
2. Calls `AttestationSigner.sign(...)` with the CI secrets
   (`FUZEBOX_CI_SECRET` and `RPOTENTIAL_CI_SECRET` — deterministic
   fallback values are used when secrets are unset) to produce a signed
   `EAI` attestation for the build.
3. Uploads `eai_attestation.json` as a build artifact via
   `actions/upload-artifact` so release pipelines can pick it up.

Production deployment must inject real CI secrets into both
environment variables; the demo fallbacks exist only to keep the
workflow runnable on forks.

## Reproducibility

All flows use `rng_seed=42`. If you change a fixture, a policy, or a
scoring weight, expect the suite to produce deterministic but different
results. Bump the `rng_seed` only when you want to explore
non-deterministic behavior under stress.
