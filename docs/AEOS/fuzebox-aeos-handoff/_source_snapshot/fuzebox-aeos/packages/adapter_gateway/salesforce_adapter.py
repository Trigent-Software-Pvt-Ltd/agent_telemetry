"""Salesforce Agentforce adapter (mock-first)."""
from __future__ import annotations

import random
from typing import Any, Optional

from packages.shared.schema import ExecutionPath, Skill, SkillPlanItem, Task

from .base import AdapterResult, RuntimeAdapter, simulate_from_skill_performance


class SalesforceAdapter(RuntimeAdapter):
    provider = "salesforce"
    handled_paths = (ExecutionPath.SALESFORCE,)

    def __init__(self, *, mode: str = "mock") -> None:
        self.mode = "mock"  # live mode stubbed — production uses Agentforce Actions API
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
        restricted = set(patch.get("restricted_tools", []))
        tool_names = [t for t in skill.required_tools if t not in restricted]
        trace = {
            "provider": "salesforce",
            "mode": "mock",
            "trust_layer_active": True,
            "agentforce_action": skill.name,
            "data_cloud_objects_touched": tool_names,
            "dir_rules_fired": list(patch.get("rules_fired", [])),
        }
        return AdapterResult(
            success=success,
            latency_ms=latency_ms,
            cost_usd=cost,
            output=output,
            trace=trace,
            tool_calls=[{"name": t, "status": "mock_ok"} for t in tool_names],
            provider=self.provider,
            model=plan_item.model_hint or "agentforce-standard",
            actor_id=plan_item.actor_hint,
            applied_patch=patch or None,
        )
