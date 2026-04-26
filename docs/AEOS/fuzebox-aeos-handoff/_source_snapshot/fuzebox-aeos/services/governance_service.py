"""Layer 12 Governance service.

Endpoints:
  POST /v1/governance/evaluate  — evaluate a decision against a policy pack
  POST /v1/governance/evidence  — produce an evidence bundle from ledger rows
  POST /v1/governance/attest    — sign a metric value (two-party HMAC)
  GET  /v1/governance/packs     — list loaded packs
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

from packages.shared.schema import (
    EAIContribution,
    ExecutionPath,
    GovernanceRequirement,
    LedgerRow,
    RiskLevel,
    Task,
    TaskType,
)
from packages.governance.policy_engine import PolicyEngine
from packages.governance.evidence import AttestationSigner, EvidenceExporter

from services._fastapi_shim import FastAPI, HTTPException


_ROOT = Path(__file__).resolve().parent.parent
_engine = PolicyEngine()
_engine.load_directory(_ROOT / "policies")
_exporter = EvidenceExporter()
_signer = AttestationSigner()


app = FastAPI(title="FuzeBox AEOS — Governance Service (L12)")


@app.get("/health")
def health():
    return {"status": "ok", "service": "governance", "packs": _engine.list_packs()}


@app.get("/v1/governance/packs")
def packs():
    return {"packs": _engine.list_packs()}


@app.post("/v1/governance/evaluate")
def evaluate(payload: dict):
    try:
        t = payload["task"]
        task = Task(
            task_id=t["task_id"],
            task_type=TaskType(t["task_type"]),
            description=t.get("description", ""),
            complexity=float(t.get("complexity", 0.5)),
            risk_level=RiskLevel(t["risk_level"]),
            regulatory_class=t.get("regulatory_class", "general"),
            latency_budget_ms=int(t.get("latency_budget_ms", 60000)),
            cost_budget_usd=float(t.get("cost_budget_usd", 25.0)),
            explainability_required=bool(t.get("explainability_required", False)),
            human_signoff_required=bool(t.get("human_signoff_required", False)),
            tenant_id=t["tenant_id"],
        )
        gov_raw = payload.get("governance", {})
        governance = GovernanceRequirement(
            audit_log_required=bool(gov_raw.get("audit_log_required", True)),
            trace_retention_days=int(gov_raw.get("trace_retention_days", 365)),
            human_override_available=bool(gov_raw.get("human_override_available", True)),
            policy_pack=gov_raw.get("policy_pack", payload.get("pack_id", "general")),
            evidence_export_required=bool(gov_raw.get("evidence_export_required", False)),
        )
        pack_id = payload.get("pack_id") or governance.policy_pack
        decision = _engine.evaluate(
            pack_id=pack_id,
            task=task,
            selected_path=ExecutionPath(payload["selected_path"]),
            governance=governance,
        )
        return decision.to_dict()
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Missing field: {e}")


@app.post("/v1/governance/evidence")
def evidence(payload: dict):
    """Produce an evidence bundle.

    Input: {"tenant_id": ..., "format": ..., "period_start": ..., "period_end": ..., "rows": [LedgerRow dicts]}
    """
    try:
        rows = [_ledger_row_from_dict(r) for r in payload["rows"]]
        bundle = _exporter.export(
            rows=rows,
            tenant_id=payload["tenant_id"],
            format=payload["format"],
            period_start=float(payload["period_start"]),
            period_end=float(payload["period_end"]),
        )
        return bundle.to_dict()
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Missing field: {e}")


@app.post("/v1/governance/attest")
def attest(payload: dict):
    try:
        att = _signer.sign(
            tenant_id=payload["tenant_id"],
            period=payload["period"],
            metric_name=payload["metric_name"],
            metric_value=float(payload["metric_value"]),
            details=payload.get("details", {}),
        )
        return att.to_dict()
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Missing field: {e}")


def _ledger_row_from_dict(raw: dict[str, Any]) -> LedgerRow:
    eai_raw = raw.get("eai_contribution", {})
    return LedgerRow(
        execution_id=raw["execution_id"],
        decision_id=raw["decision_id"],
        task_id=raw["task_id"],
        skill_id=raw["skill_id"],
        tenant_id=raw["tenant_id"],
        selected_path=ExecutionPath(raw["selected_path"]),
        provider=raw["provider"],
        actor_ids=raw.get("actor_ids", []),
        execution_cost_usd=float(raw["execution_cost_usd"]),
        latency_ms=int(raw["latency_ms"]),
        success=bool(raw["success"]),
        success_probability_predicted=float(raw.get("success_probability_predicted", 0.5)),
        risk_penalty=float(raw.get("risk_penalty", 0.0)),
        coordination_tax=float(raw.get("coordination_tax", 0.0)),
        gsti_delta=float(raw.get("gsti_delta", 0.0)),
        uop_delta=float(raw.get("uop_delta", 0.0)),
        coordination_delta=float(raw.get("coordination_delta", 0.0)),
        outcome_value_usd=float(raw.get("outcome_value_usd", 0.0)),
        audit_record_id=raw["audit_record_id"],
        eai_contribution=EAIContribution(
            ai_task_share=float(eai_raw.get("ai_task_share", 0.0)),
            success_weight=float(eai_raw.get("success_weight", 0.0)),
            governance_factor=float(eai_raw.get("governance_factor", 1.0)),
            preservation_factor=float(eai_raw.get("preservation_factor", 0.0)),
            economic_return_factor=float(eai_raw.get("economic_return_factor", 1.0)),
        ),
        business_unit=raw.get("business_unit"),
        governance_tags=raw.get("governance_tags", []),
    )


# In-process helpers
def engine() -> PolicyEngine:
    return _engine


def exporter() -> EvidenceExporter:
    return _exporter


def signer() -> AttestationSigner:
    return _signer
