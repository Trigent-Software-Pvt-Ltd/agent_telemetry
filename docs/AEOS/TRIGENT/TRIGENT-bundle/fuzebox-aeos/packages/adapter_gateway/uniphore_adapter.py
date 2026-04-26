"""Uniphore Business AI Cloud adapter (mock-first).

In AEOS, Uniphore BAC is treated as ONE candidate runtime among many,
not as the control plane. This adapter lets the UEF dispatch work to
Uniphore-hosted agents when the decision scoring picks that path.
"""
from __future__ import annotations

import random
from typing import Any, Optional

from packages.shared.schema import ExecutionPath, Skill, SkillPlanItem, Task

from .base import AdapterResult, RuntimeAdapter, simulate_from_skill_performance


class UniphoreAdapter(RuntimeAdapter):
    provider = "uniphore"
    handled_paths = (ExecutionPath.UNIPHORE,)

    def __init__(self, *, mode: str = "mock") -> None:
        self.mode = "mock"
        self._rng = random.Random()

    def invoke(
        self,
        *,
        task: Task,
        skill: Skill,
        plan_item: SkillPlanItem,
        instruction_patch: Optional[dict[str, Any]] = None,
    ) -> AdapterResult:
        success, latency_ms, cost, output = simulate_from_skill_performance(
            skill=skill, path_value=plan_item.executor, task=task, rng=self._rng
        )
        patch = instruction_patch or {}
        trace = {
            "provider": "uniphore",
            "mode": "mock",
            "bpmn_workflow": skill.skill_id + "_workflow",
            "slm_used": plan_item.model_hint or "uniphore-bac-slm-v2",
            "agent_opa_passed": True,
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
            model=plan_item.model_hint or "uniphore-bac-v2",
            actor_id=plan_item.actor_hint,
            applied_patch=patch or None,
        )
