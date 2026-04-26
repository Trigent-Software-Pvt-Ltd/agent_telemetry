"""Layer 3 Skills Authority service.

Endpoints:
  GET  /v1/skills                — list skills
  GET  /v1/skills/{skill_id}     — get one
  POST /v1/skills                — register/upsert a skill
  POST /v1/skills/performance    — apply an EMA performance update
"""
from __future__ import annotations

from pathlib import Path

from packages.shared.schema import ExecutionPath, Skill
from packages.skills_authority.authority import SkillsAuthority

from services._fastapi_shim import FastAPI, HTTPException


_ROOT = Path(__file__).resolve().parent.parent
_authority = SkillsAuthority()
_authority.load_from_file(_ROOT / "fixtures" / "skills.json")


app = FastAPI(title="FuzeBox AEOS — Skills Authority (L3)")


@app.get("/health")
def health():
    return {"status": "ok", "service": "skills", "count": _authority.count()}


@app.get("/v1/skills")
def list_skills():
    return {
        "skills": [
            {
                "skill_id": s.skill_id,
                "name": s.name,
                "allowed_paths": [p.value for p in s.allowed_paths],
                "strategic_weight": s.strategic_weight,
                "governance_tags": s.governance_tags,
            }
            for s in _authority.list()
        ]
    }


@app.get("/v1/skills/{skill_id}")
def get_skill(skill_id: str):
    s = _authority.try_get(skill_id)
    if s is None:
        raise HTTPException(status_code=404, detail=f"Unknown skill {skill_id}")
    return {
        "skill_id": s.skill_id,
        "name": s.name,
        "allowed_paths": [p.value for p in s.allowed_paths],
        "required_tools": s.required_tools,
        "governance_tags": s.governance_tags,
        "strategic_weight": s.strategic_weight,
        "performance": s.performance,
        "version": s.version,
        "description": s.description,
    }


@app.post("/v1/skills")
def upsert(payload: dict):
    try:
        skill = Skill(
            skill_id=payload["skill_id"],
            name=payload["name"],
            allowed_paths=[ExecutionPath(p) for p in payload["allowed_paths"]],
            required_tools=payload.get("required_tools", []),
            governance_tags=payload.get("governance_tags", []),
            strategic_weight=float(payload.get("strategic_weight", 0.5)),
            performance=payload.get("performance", {}),
            version=payload.get("version", "1.0"),
            description=payload.get("description", ""),
        )
        _authority.register(skill)
        return {"status": "ok", "skill_id": skill.skill_id}
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Missing field: {e}")


@app.post("/v1/skills/performance")
def perf_update(payload: dict):
    try:
        _authority.apply_performance_update(
            skill_id=payload["skill_id"],
            path=ExecutionPath(payload["path"]),
            success=bool(payload["success"]),
            cost=float(payload["cost"]),
            latency_ms=int(payload["latency_ms"]),
            ema_alpha=float(payload.get("ema_alpha", 0.1)),
        )
        return {"status": "ok"}
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Missing field: {e}")


def authority() -> SkillsAuthority:
    return _authority
