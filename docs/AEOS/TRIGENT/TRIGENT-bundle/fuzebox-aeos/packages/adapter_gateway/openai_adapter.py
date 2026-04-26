"""OpenAI AgentKit / Responses API adapter.

Mock mode returns a deterministic-ish outcome. Live mode uses the
OpenAI SDK (pip install openai) and reads ``OPENAI_API_KEY`` from env.
"""
from __future__ import annotations

import os
import random
import time
from typing import Any, Optional

from packages.shared.schema import ExecutionPath, Skill, SkillPlanItem, Task

from .base import AdapterResult, RuntimeAdapter, simulate_from_skill_performance


class OpenAIAdapter(RuntimeAdapter):
    provider = "openai"
    handled_paths = (
        ExecutionPath.OPENAI,
        ExecutionPath.HYBRID_OPENAI_HUMAN,
    )

    def __init__(
        self,
        *,
        mode: str = "mock",
        api_key: str | None = None,
        model: str = "gpt-5.1-thinking",
    ) -> None:
        self.mode = mode if mode in {"mock", "live"} else "mock"
        self.api_key = api_key or os.getenv("OPENAI_API_KEY", "")
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
        restricted = set(patch.get("restricted_tools", []))
        tool_names = [t for t in skill.required_tools if t not in restricted]
        if patch.get("required_citations"):
            output = f"{output} [citations: policy_doc_ref_001]"
        trace = {
            "provider": "openai",
            "mode": "mock",
            "model": plan_item.model_hint or self.default_model,
            "task_id": task.task_id,
            "skill_id": skill.skill_id,
            "hybrid": "hybrid" in path_value,
            "agentkit_tools_invoked": tool_names,
            "duration_ms": latency_ms,
            "dir_rules_fired": list(patch.get("rules_fired", [])),
        }
        return AdapterResult(
            success=success,
            latency_ms=latency_ms,
            cost_usd=cost,
            output=output,
            trace=trace,
            tool_calls=[
                {"name": t, "status": "mock_ok", "duration_ms": max(50, latency_ms // max(len(tool_names), 1))}
                for t in tool_names
            ],
            provider=self.provider,
            model=plan_item.model_hint or self.default_model,
            actor_id=plan_item.actor_hint,
            applied_patch=patch or None,
        )

    def _invoke_live(
        self,
        *,
        task: Task,
        skill: Skill,
        plan_item: SkillPlanItem,
        instruction_patch: Optional[dict[str, Any]] = None,
    ) -> AdapterResult:
        try:
            from openai import OpenAI  # type: ignore
        except ImportError:
            return self._invoke_mock(
                task=task, skill=skill, plan_item=plan_item, instruction_patch=instruction_patch
            )

        client = OpenAI(api_key=self.api_key)
        start = time.perf_counter()
        model = plan_item.model_hint or self.default_model
        patch = instruction_patch or {}
        dir_prefix = "".join(f"[L9 DIR] {line}\n" for line in patch.get("additional_instructions", []))
        resp = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        f"{dir_prefix}"
                        f"You are an AEOS-governed agent executing skill "
                        f"'{skill.name}' for tenant {task.tenant_id}."
                    ),
                },
                {"role": "user", "content": task.description},
            ],
        )
        latency_ms = int((time.perf_counter() - start) * 1000)
        usage = getattr(resp, "usage", None)
        cost = 0.0
        if usage:
            cost = round(
                (getattr(usage, "prompt_tokens", 0) * 0.0000025)
                + (getattr(usage, "completion_tokens", 0) * 0.00001),
                4,
            )
        text_out = ""
        if resp.choices:
            text_out = resp.choices[0].message.content or ""
        return AdapterResult(
            success=True,
            latency_ms=latency_ms,
            cost_usd=cost,
            output=text_out[:1000],
            trace={"provider": "openai", "mode": "live", "model": model},
            tool_calls=[],
            provider=self.provider,
            model=model,
            actor_id=plan_item.actor_hint,
            applied_patch=patch or None,
        )
