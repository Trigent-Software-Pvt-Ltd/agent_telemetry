"""Human workforce adapter.

Dispatches work to a human actor. In mock mode, uses Skills Authority
performance history the same way agent adapters do, so the simulation
is internally consistent (humans with higher success_rate / higher cost
relative to agents).

In production, this adapter integrates with shift-management systems and
publishes a "human task" to the advisor's queue via rPotential's
dispatch surface.
"""
from __future__ import annotations

import random
from typing import Any, Optional

from packages.shared.schema import ExecutionPath, Skill, SkillPlanItem, Task

from .base import AdapterResult, RuntimeAdapter, simulate_from_skill_performance


class HumanWorkforceAdapter(RuntimeAdapter):
    provider = "human"
    handled_paths = (
        ExecutionPath.HUMAN,
        ExecutionPath.HYBRID_ANTHROPIC_HUMAN,
        ExecutionPath.HYBRID_OPENAI_HUMAN,
    )

    def __init__(self) -> None:
        self._rng = random.Random()

    def invoke(
        self,
        *,
        task: Task,
        skill: Skill,
        plan_item: SkillPlanItem,
        instruction_patch: Optional[dict[str, Any]] = None,
    ) -> AdapterResult:
        # The human leg of a hybrid path; use full-human performance as the
        # anchor for human-side cost / latency.
        path_value = plan_item.executor
        success, latency_ms, cost, output = simulate_from_skill_performance(
            skill=skill, path_value=path_value, task=task, rng=self._rng
        )
        patch = instruction_patch or {}
        trace = {
            "provider": "human",
            "mode": "mock",
            "actor_id": plan_item.actor_hint,
            "assigned_queue": f"tenant:{task.tenant_id}:queue",
            "estimated_pickup_ms": latency_ms,
            "dir_human_confirmation_required": bool(patch.get("require_human_confirmation")),
            "dir_rules_fired": list(patch.get("rules_fired", [])),
        }
        return AdapterResult(
            success=success,
            latency_ms=latency_ms,
            cost_usd=cost,
            output=output,
            trace=trace,
            tool_calls=[],
            provider=self.provider,
            model=None,
            actor_id=plan_item.actor_hint,
            applied_patch=patch or None,
        )
