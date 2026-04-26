"""Anthropic MCP adapter.

In mock mode (default), returns a deterministic-ish outcome drawn from
Skills Authority performance history. In live mode, dispatches to the
Anthropic Messages API + MCP tool catalog the caller has configured.

The live path is behind a try/except so the MVP runs zero-dep. Pip
install ``anthropic`` to enable live mode and set ``ANTHROPIC_API_KEY``.
"""
from __future__ import annotations

import os
import random
import time
from typing import Any, Optional

from packages.shared.schema import ExecutionPath, Skill, SkillPlanItem, Task

from .base import AdapterResult, RuntimeAdapter, simulate_from_skill_performance


class AnthropicAdapter(RuntimeAdapter):
    provider = "anthropic"
    handled_paths = (
        ExecutionPath.ANTHROPIC,
        ExecutionPath.HYBRID_ANTHROPIC_HUMAN,
    )

    def __init__(self, *, mode: str = "mock", api_key: str | None = None, model: str = "claude-opus-4-7") -> None:
        self.mode = mode if mode in {"mock", "live"} else "mock"
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY", "")
        self.default_model = model
        self._rng = random.Random()

    def invoke(
        self,
        *,
        task: Task,
        skill: Skill,
        plan_item: SkillPlanItem,
        instruction_patch: Optional[dict[str, Any]] = None,
    ) -> AdapterResult:
        if self.mode == "live" and self.api_key:
            return self._invoke_live(
                task=task, skill=skill, plan_item=plan_item, instruction_patch=instruction_patch
            )
        return self._invoke_mock(
            task=task, skill=skill, plan_item=plan_item, instruction_patch=instruction_patch
        )

    # ------------------------------------------------------------------
    # Mock mode
    # ------------------------------------------------------------------

    def _invoke_mock(
        self,
        *,
        task: Task,
        skill: Skill,
        plan_item: SkillPlanItem,
        instruction_patch: Optional[dict[str, Any]] = None,
    ) -> AdapterResult:
        path_value = plan_item.executor
        success, latency_ms, cost, output = simulate_from_skill_performance(
            skill=skill, path_value=path_value, task=task, rng=self._rng
        )
        patch = instruction_patch or {}
        # Restricted tools are pruned from the mock toolcall list.
        restricted = set(patch.get("restricted_tools", []))
        tool_names = [t for t in skill.required_tools if t not in restricted]
        if patch.get("required_citations"):
            output = f"{output} [citations: service_bulletin_ref_001]"
        trace = {
            "provider": "anthropic",
            "mode": "mock",
            "model": plan_item.model_hint or self.default_model,
            "task_id": task.task_id,
            "skill_id": skill.skill_id,
            "hybrid": "hybrid" in path_value,
            "mcp_tools_invoked": tool_names,
            "duration_ms": latency_ms,
            "dir_rules_fired": list(patch.get("rules_fired", [])),
        }
        tool_calls = [
            {"name": t, "status": "mock_ok", "duration_ms": int(latency_ms / max(len(tool_names), 1))}
            for t in tool_names
        ]
        return AdapterResult(
            success=success,
            latency_ms=latency_ms,
            cost_usd=cost,
            output=output,
            trace=trace,
            tool_calls=tool_calls,
            provider=self.provider,
            model=plan_item.model_hint or self.default_model,
            actor_id=plan_item.actor_hint,
            applied_patch=patch or None,
        )

    # ------------------------------------------------------------------
    # Live mode (optional — requires `anthropic` package)
    # ------------------------------------------------------------------

    def _invoke_live(
        self,
        *,
        task: Task,
        skill: Skill,
        plan_item: SkillPlanItem,
        instruction_patch: Optional[dict[str, Any]] = None,
    ) -> AdapterResult:
        try:
            import anthropic  # type: ignore
        except ImportError:
            return self._invoke_mock(
                task=task, skill=skill, plan_item=plan_item, instruction_patch=instruction_patch
            )

        start = time.perf_counter()
        client = anthropic.Anthropic(api_key=self.api_key)
        model = plan_item.model_hint or self.default_model
        patch = instruction_patch or {}
        dir_prefix = ""
        for line in patch.get("additional_instructions", []):
            dir_prefix += f"[L9 DIR] {line}\n"
        sys_prompt = (
            f"{dir_prefix}"
            f"You are an AEOS-governed agent executing skill '{skill.name}' "
            f"({skill.skill_id}) for tenant {task.tenant_id}. Operate within "
            f"governance tags: {', '.join(skill.governance_tags)}."
        )
        user_prompt = f"Task: {task.description}"
        msg = client.messages.create(
            model=model,
            max_tokens=1024,
            system=sys_prompt,
            messages=[{"role": "user", "content": user_prompt}],
        )
        latency_ms = int((time.perf_counter() - start) * 1000)
        # Cost estimation is vendor-side — plug real pricing into production
        usage = getattr(msg, "usage", None)
        cost = 0.0
        if usage:
            # Rough heuristic: $0.000015/in + $0.000075/out for Opus class
            cost = round(
                (getattr(usage, "input_tokens", 0) * 0.000015)
                + (getattr(usage, "output_tokens", 0) * 0.000075),
                4,
            )
        text_out = ""
        for block in getattr(msg, "content", []):
            if getattr(block, "type", None) == "text":
                text_out += getattr(block, "text", "")
        return AdapterResult(
            success=True,
            latency_ms=latency_ms,
            cost_usd=cost,
            output=text_out[:1000],
            trace={"provider": "anthropic", "mode": "live", "model": model, "usage": getattr(msg, "usage", {})},
            tool_calls=[],
            provider=self.provider,
            model=model,
            actor_id=plan_item.actor_hint,
            applied_patch=patch or None,
        )
