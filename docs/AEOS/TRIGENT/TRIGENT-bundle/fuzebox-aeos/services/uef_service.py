"""Layer 7 UEF service — POST /v1/uef/decide.

Run live:
    uvicorn services.uef_service:app --port 8007

Zero-dep mode:
    from services.uef_service import handle_decide
    handle_decide(payload_dict)
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from packages.shared.schema import (
    ExecutionPath,
    GovernanceRequirement,
    RiskLevel,
    Task,
    TaskType,
)
from packages.skills_authority.authority import SkillsAuthority
from packages.rpotential_adapter.mock import MockRPotentialAdapter
from packages.uef.engine import universal_execution_function

from services._fastapi_shim import FastAPI, HTTPException


_ROOT = Path(__file__).resolve().parent.parent

_authority = SkillsAuthority()
_authority.load_from_file(_ROOT / "fixtures" / "skills.json")

_rpotential = MockRPotentialAdapter(fixture_path=_ROOT / "fixtures" / "signals.json")

_ACTORS = json.loads((_ROOT / "fixtures" / "actors.json").read_text())


def _actors_for_tenant(tenant_id: str):
    from packages.shared.schema import Actor

    raws = _ACTORS.get(tenant_id, [])
    return [Actor(**r) for r in raws]


def handle_decide(payload: dict[str, Any]) -> dict[str, Any]:
    """Core endpoint logic, shared by FastAPI + in-process callers."""
    task_raw = payload["task"]
    task = Task(
        task_id=task_raw["task_id"],
        task_type=TaskType(task_raw["task_type"]),
        description=task_raw["description"],
        complexity=float(task_raw.get("complexity", 0.5)),
        risk_level=RiskLevel(task_raw["risk_level"]),
        regulatory_class=task_raw.get("regulatory_class", "general"),
        latency_budget_ms=int(task_raw.get("latency_budget_ms", 60000)),
        cost_budget_usd=float(task_raw.get("cost_budget_usd", 25.0)),
        explainability_required=bool(task_raw.get("explainability_required", False)),
        human_signoff_required=bool(task_raw.get("human_signoff_required", False)),
        tenant_id=task_raw["tenant_id"],
        business_unit=task_raw.get("business_unit"),
        metadata=task_raw.get("metadata", {}),
    )

    skill_id = payload["skills_required"][0]
    skill = _authority.get(skill_id)
    candidate_paths = [ExecutionPath(p) for p in payload["candidate_paths"]]
    actors = _actors_for_tenant(task.tenant_id)
    signals = _rpotential.get_signals(tenant_id=task.tenant_id)

    gov_raw = payload.get("governance", {})
    governance = GovernanceRequirement(
        audit_log_required=bool(gov_raw.get("audit_log_required", True)),
        trace_retention_days=int(gov_raw.get("trace_retention_days", 365)),
        human_override_available=bool(gov_raw.get("human_override_available", True)),
        policy_pack=gov_raw.get("policy_pack", "general"),
        data_residency_required=gov_raw.get("data_residency_required"),
        evidence_export_required=bool(gov_raw.get("evidence_export_required", False)),
    )

    response = universal_execution_function(
        task=task,
        skill=skill,
        candidate_paths=candidate_paths,
        actors=actors,
        signals=signals,
        governance=governance,
    )
    return {
        "decision_id": response.decision_id,
        "selected_path": response.selected_path.value,
        "confidence": response.confidence,
        "selected_actor_id": response.selected_actor_id,
        "skill_plan": [
            {
                "skill_id": p.skill_id,
                "executor": p.executor,
                "model_hint": p.model_hint,
                "actor_hint": p.actor_hint,
                "justification": p.justification,
            }
            for p in response.skill_plan
        ],
        "governance_requirements": response.governance_requirements,
        "expected_metrics": response.expected_metrics,
        "writeback_requirements": response.writeback_requirements,
        "scored_paths": [s.to_dict() for s in response.scored_paths],
    }


app = FastAPI(title="FuzeBox AEOS — UEF Service (L7)")


@app.get("/health")
def health():
    return {"status": "ok", "service": "uef", "skills_loaded": _authority.count()}


@app.post("/v1/uef/decide")
def decide(payload: dict):
    try:
        return handle_decide(payload)
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Missing field: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/v1/skills/{skill_id}")
def get_skill(skill_id: str):
    skill = _authority.try_get(skill_id)
    if not skill:
        raise HTTPException(status_code=404, detail=f"Unknown skill {skill_id}")
    return {
        "skill_id": skill.skill_id,
        "name": skill.name,
        "allowed_paths": [p.value for p in skill.allowed_paths],
        "strategic_weight": skill.strategic_weight,
        "performance": skill.performance,
    }
