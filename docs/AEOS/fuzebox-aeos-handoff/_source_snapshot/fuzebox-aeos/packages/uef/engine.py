"""The Universal Execution Function itself.

Composes the eight scoring functions into a ranked candidate-path result.
"""
from __future__ import annotations

from packages.shared.schema import (
    Actor,
    ExecutionPath,
    GovernanceRequirement,
    ScoredPath,
    Skill,
    Task,
    UEFResponse,
    SkillPlanItem,
    WorkforceSignals,
    new_decision_id,
)

from . import scoring


# ---------------------------------------------------------------------------
# Vendor model hints (defaults). Overridable by caller constraints.
# ---------------------------------------------------------------------------


_DEFAULT_MODEL_HINTS: dict[ExecutionPath, str] = {
    ExecutionPath.ANTHROPIC: "claude-opus-4-7",
    ExecutionPath.OPENAI: "gpt-5.1-thinking",
    ExecutionPath.SALESFORCE: "agentforce-standard",
    ExecutionPath.UNIPHORE: "uniphore-bac-v2",
    ExecutionPath.CLOUDFLARE: "project-think-v1",
    ExecutionPath.GOOGLE_VERTEX: "gemini-2.5-pro",
    ExecutionPath.HYBRID_ANTHROPIC_HUMAN: "claude-opus-4-7",
    ExecutionPath.HYBRID_OPENAI_HUMAN: "gpt-5.1-thinking",
}


def score_all_paths(
    task: Task,
    skill: Skill,
    candidate_paths: list[ExecutionPath],
    actors: list[Actor],
    signals: WorkforceSignals,
    governance: GovernanceRequirement,
) -> list[ScoredPath]:
    """Score every candidate path and return the list sorted highest-first."""
    scored: list[ScoredPath] = []
    for path in candidate_paths:
        cap = scoring.score_capability_fit(path, task, skill)
        if cap < 0:
            continue  # path not permitted by skill
        gsti = scoring.score_gsti_value(path, skill, signals)
        uop, actor_id = scoring.score_uop_value(path, actors, signals)
        coord = scoring.score_coordination_tax(path, task, signals)
        gov = scoring.score_governance(path, governance, task)
        runtime = scoring.score_runtime_fit(path, task)
        econ = scoring.score_economic_value(path, task, skill)
        risk = scoring.score_risk_penalty(path, task, skill)

        total = cap + gsti + uop - coord + gov + runtime + econ - risk

        justification = (
            f"capability={cap:.2f} gsti={gsti:+.2f} uop={uop:+.2f} "
            f"-coord_tax={-coord:+.2f} gov={gov:+.2f} runtime={runtime:+.2f} "
            f"econ={econ:+.2f} -risk={-risk:+.2f}"
        )

        scored.append(
            ScoredPath(
                path=path,
                capability_fit=cap,
                gsti_value=gsti,
                uop_value=uop,
                coordination_tax=coord,
                governance_score=gov,
                runtime_fit=runtime,
                economic_value=econ,
                risk_penalty=risk,
                total=total,
                selected_actor_id=actor_id,
                justification=justification,
            )
        )
    scored.sort(key=lambda p: p.total, reverse=True)
    return scored


def universal_execution_function(
    task: Task,
    skill: Skill,
    candidate_paths: list[ExecutionPath],
    actors: list[Actor],
    signals: WorkforceSignals,
    governance: GovernanceRequirement,
) -> UEFResponse:
    """The core AEOS decision call.

    This is the callable surface that the UEF service exposes behind
    POST /v1/uef/decide. The scoring loop is a pure function of its
    inputs — easy to unit test, easy to reason about, easy to replay
    from ledger rows.
    """
    if not candidate_paths:
        raise ValueError("No candidate paths supplied")

    scored = score_all_paths(task, skill, candidate_paths, actors, signals, governance)
    if not scored:
        raise ValueError(
            f"No scorable paths — every candidate was excluded by skill.allowed_paths "
            f"for skill={skill.skill_id}"
        )
    best = scored[0]

    # Confidence = gap between best and second-best, normalized
    if len(scored) > 1:
        gap = best.total - scored[1].total
        confidence = min(1.0, 0.5 + gap / 4.0)
    else:
        confidence = 0.9

    # Governance requirement projection
    gov_requirements = ["audit_log", f"trace_retention_{governance.trace_retention_days}d"]
    if governance.human_override_available:
        gov_requirements.append("human_override")
    if governance.evidence_export_required:
        gov_requirements.append("evidence_export")
    if governance.policy_pack != "general":
        gov_requirements.append(f"policy_pack:{governance.policy_pack}")

    # Skill plan — for a single-skill decision, one item in the plan.
    plan = [
        SkillPlanItem(
            skill_id=skill.skill_id,
            executor=best.path.value,
            model_hint=_DEFAULT_MODEL_HINTS.get(best.path),
            actor_hint=best.selected_actor_id,
            justification=best.justification,
        )
    ]

    history = skill.performance.get(best.path.value, {"avg_cost": 10.0, "success_rate": 0.5, "avg_latency_ms": 2000})
    expected_metrics = {
        "expected_cost_usd": round(float(history["avg_cost"]), 2),
        "expected_latency_ms": int(history.get("avg_latency_ms", 2000)),
        "success_probability": round(float(history["success_rate"]), 3),
        "risk_penalty": round(best.risk_penalty, 3),
        "coordination_tax": round(best.coordination_tax, 3),
    }

    writeback = ["ledger_record", "skill_update", "uop_update", "gsti_delta", "eai_contribution"]

    return UEFResponse(
        decision_id=new_decision_id(),
        selected_path=best.path,
        confidence=round(confidence, 3),
        skill_plan=plan,
        governance_requirements=gov_requirements,
        expected_metrics=expected_metrics,
        writeback_requirements=writeback,
        scored_paths=scored,
        selected_actor_id=best.selected_actor_id,
    )
