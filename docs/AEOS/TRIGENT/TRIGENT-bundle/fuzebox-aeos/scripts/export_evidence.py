"""CLI: export a signed evidence bundle to stdout.

Usage:
    python -m scripts.export_evidence \
        --tenant kengarff_south_jordan \
        --format eu_ai_act_article_12 \
        --period-start 2026-01-01 \
        --period-end 2026-04-01

Runs a representative flow against the demo runtime so the in-memory
ledger has something to export, then prints the SignedEvidenceBundle
JSON to stdout. In production, swap ``build_runtime()`` for a ledger
backed by the durable persistence path.
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from datetime import datetime

from apps._runtime import build_runtime, run_flow, task_ken_garff_brake_diagnosis
from packages.shared.schema import ExecutionPath, GovernanceRequirement


def _parse_when(s: str) -> float:
    # Accept ISO date or unix timestamp
    try:
        return float(s)
    except ValueError:
        pass
    try:
        return datetime.fromisoformat(s).timestamp()
    except ValueError as exc:  # pragma: no cover - cli guard
        raise SystemExit(f"Invalid date/time: {s}") from exc


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Export a two-party signed evidence bundle.")
    parser.add_argument("--tenant", required=True)
    parser.add_argument(
        "--format",
        required=True,
        choices=["eu_ai_act_article_12", "wp29", "gdpr", "soc2"],
    )
    parser.add_argument("--period-start", required=True, dest="period_start")
    parser.add_argument("--period-end", required=True, dest="period_end")
    args = parser.parse_args(argv)

    period_start = _parse_when(args.period_start)
    period_end = _parse_when(args.period_end)

    runtime = build_runtime()
    # Seed the ledger with one representative flow so the bundle is non-empty.
    if args.tenant == "kengarff_south_jordan":
        run_flow(
            runtime,
            task=task_ken_garff_brake_diagnosis(),
            skill_id="skill_brake_diag_v3",
            candidate_paths=[
                ExecutionPath.HUMAN,
                ExecutionPath.HYBRID_ANTHROPIC_HUMAN,
            ],
            governance=GovernanceRequirement(
                policy_pack="auto_safety_standard",
                evidence_export_required=True,
            ),
            policy_pack_id="auto_safety_standard",
        )

    rows = runtime.ledger.for_tenant(args.tenant, since=period_start, until=period_end or time.time())
    bundle = runtime.evidence_exporter.export(
        rows=rows,
        tenant_id=args.tenant,
        format=args.format,
        period_start=period_start,
        period_end=period_end,
    )
    signed = runtime.signer.sign_bundle(bundle)
    json.dump(signed.to_dict(), sys.stdout, sort_keys=True, indent=2)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
