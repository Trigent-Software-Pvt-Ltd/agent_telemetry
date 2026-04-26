"""Layer 11 Economic Ledger service.

Endpoints:
  POST /v1/ledger/append           — append a LedgerRow
  GET  /v1/ledger/eai/{tenant_id}  — compute EAI breakdown for tenant
  GET  /v1/ledger/metrics/{tenant_id} — compute full metric suite
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

from packages.shared.schema import (
    EAIContribution,
    ExecutionPath,
    LedgerRow,
)
from packages.economic_ledger.ledger import EconomicLedger
from packages.economic_ledger.metrics import (
    compute_eai,
    compute_eroi,
    compute_hlr,
    compute_hpi,
    compute_sdd,
    compute_ser,
    compute_sy,
    compute_ucs,
)

from services._fastapi_shim import FastAPI, HTTPException


_LEDGER = EconomicLedger()


def _row_from_dict(raw: dict[str, Any]) -> LedgerRow:
    eai_raw = raw["eai_contribution"]
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


app = FastAPI(title="FuzeBox AEOS — Economic Ledger Service (L11)")


@app.get("/health")
def health():
    return {"status": "ok", "service": "ledger", "row_count": _LEDGER.count()}


@app.post("/v1/ledger/append")
def append(payload: dict):
    try:
        row = _row_from_dict(payload)
        _LEDGER.append(row)
        return {"status": "ok", "execution_id": row.execution_id, "row_count": _LEDGER.count()}
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Missing field: {e}")


@app.get("/v1/ledger/eai/{tenant_id}")
def eai(tenant_id: str):
    rows = _LEDGER.for_tenant(tenant_id)
    breakdown = compute_eai(rows)
    return {
        "tenant_id": tenant_id,
        "row_count": len(rows),
        "eai": breakdown.to_dict(),
    }


@app.get("/v1/ledger/metrics/{tenant_id}")
def metrics(tenant_id: str):
    rows = _LEDGER.for_tenant(tenant_id)
    if not rows:
        return {"tenant_id": tenant_id, "row_count": 0, "metrics": {}}
    breakdown = compute_eai(rows)
    return {
        "tenant_id": tenant_id,
        "row_count": len(rows),
        "metrics": {
            "ucs": compute_ucs(rows),
            "sy": compute_sy(rows),
            "ser": compute_ser(rows),
            "eroi": compute_eroi(rows),
            "sdd": compute_sdd(rows),
            "hpi": compute_hpi(rows),
            "hlr": compute_hlr(rows),
            "eai": breakdown.to_dict(),
        },
    }


@app.get("/v1/ledger/rows/{tenant_id}")
def rows_for_tenant(tenant_id: str):
    rows = _LEDGER.for_tenant(tenant_id)
    return {"tenant_id": tenant_id, "count": len(rows), "rows": [r.to_dict() for r in rows]}


# In-process helpers so tests / demo can call directly.
def ledger() -> EconomicLedger:
    return _LEDGER
