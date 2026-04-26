"""Run the eight canonical conformance flows and report pass/fail.

    $ python -m apps.conformance_suite.run_suite

Exits non-zero if any flow fails its assertions.
"""
from __future__ import annotations

import sys

from packages.shared.schema import ExecutionPath

from apps._runtime import build_runtime
from apps.conformance_suite.flows import ALL_FLOWS


_HYBRID = {
    ExecutionPath.HYBRID_ANTHROPIC_HUMAN,
    ExecutionPath.HYBRID_OPENAI_HUMAN,
}


def _check_flow(flow, outcome) -> list[str]:
    errs: list[str] = []
    selected = ExecutionPath(outcome.selected_path)

    if flow.expect_path_in is not None and selected not in flow.expect_path_in:
        errs.append(
            f"expected path in {[p.value for p in flow.expect_path_in]} "
            f"but got {selected.value}"
        )

    if flow.expect_human_involved is True:
        human_involved = selected == ExecutionPath.HUMAN or selected in _HYBRID
        if not human_involved:
            errs.append(f"expected human-involved but got {selected.value}")

    if flow.expect_policy_allow is not None:
        if outcome.policy_decision.get("allow") != flow.expect_policy_allow:
            errs.append(
                f"expected policy.allow={flow.expect_policy_allow} "
                f"but got {outcome.policy_decision.get('allow')} "
                f"(reasons={outcome.policy_decision.get('reasons')})"
            )

    if flow.expect_rules_fired_any:
        fired = set(outcome.instruction_patch.get("rules_fired") or [])
        if not (set(flow.expect_rules_fired_any) & fired):
            errs.append(
                f"expected one of DIR rules {flow.expect_rules_fired_any} to fire; "
                f"got {sorted(fired)}"
            )
    return errs


def main() -> int:
    runtime = build_runtime(rng_seed=42)
    results: list[tuple[str, bool, list[str], dict]] = []

    print()
    print("=" * 78)
    print("FUZEBOX AEOS — CONFORMANCE SUITE")
    print("=" * 78)
    for factory in ALL_FLOWS:
        flow = factory()
        try:
            outcome = flow.run(runtime)
            errs = _check_flow(flow, outcome)
            results.append((flow.flow_id, not errs, errs, outcome.to_summary()))
        except Exception as e:  # catch-all keeps suite running
            results.append((flow.flow_id, False, [f"exception: {e}"], {}))

    all_pass = all(ok for _, ok, _, _ in results)

    for flow_id, ok, errs, summary in results:
        status = "PASS" if ok else "FAIL"
        print()
        print(f"[{status}] {flow_id}")
        if summary:
            print(f"    selected_path:    {summary.get('selected_path')}")
            print(f"    selected_actor:   {summary.get('selected_actor_id')}")
            print(f"    adapter_success:  {summary.get('adapter_success')}  "
                  f"latency={summary.get('adapter_latency_ms')}ms  "
                  f"cost=${summary.get('adapter_cost_usd'):.2f}")
            print(f"    policy_allow:     {summary.get('policy_allow')}")
            if summary.get("rules_fired"):
                print(f"    rules_fired:      {summary.get('rules_fired')}")
        for e in errs:
            print(f"    ERROR: {e}")

    passed = sum(1 for _, ok, _, _ in results if ok)
    total = len(results)
    print()
    print("=" * 78)
    print(f"CONFORMANCE SUITE — {passed}/{total} flows passed")
    print("=" * 78)

    # Cross-flow ledger summary
    from packages.economic_ledger.metrics import compute_eai

    tenants = {row.tenant_id for row in runtime.ledger.all()}
    print()
    print("Ledger summary by tenant:")
    for t in sorted(tenants):
        rows = runtime.ledger.for_tenant(t)
        eai = compute_eai(rows)
        print(f"  {t:<28} rows={len(rows):<3} EAI={eai.eai:.4f}")

    return 0 if all_pass else 1


if __name__ == "__main__":
    sys.exit(main())
