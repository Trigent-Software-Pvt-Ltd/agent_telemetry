"""Dynamic Instruction Runtime (L9) — reference implementation.

The DIR is deliberately small and side-effect-free; the interesting work
happens in the policy authors' rules. An adapter uses the runtime like so:

    dir_runtime = DynamicInstructionRuntime()
    dir_runtime.register_rule(InstructionRule(...))
    patch = dir_runtime.intercept(task, skill, path, phase="input", signals={...})
    if patch.additional_instructions:
        prompt = merge_prompt(prompt, patch.additional_instructions)
    if patch.restricted_tools:
        tools = [t for t in tools if t not in patch.restricted_tools]

Design goals:

  * Deterministic. Given identical inputs a rule must produce identical patches.
  * Composable. Multiple matching rules combine additively.
  * Observable. Every patch records which rules fired, so the ledger and
    the governance evidence bundle can explain *why* an instruction fired.
  * Zero runtime deps. Pure Python.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable, Optional

from packages.shared.schema import ExecutionPath, RiskLevel, Skill, Task


class RuntimeTrigger(str, Enum):
    """When in the execution lifecycle a rule may fire."""

    PRE_INPUT = "pre_input"          # before the prompt is sent to the vendor
    MID_TOOLCALL = "mid_toolcall"    # between tool call and tool response
    POST_OUTPUT = "post_output"      # after final output, before writeback
    ON_SIGNAL = "on_signal"          # triggered by a runtime signal (fatigue spike, drift)


@dataclass
class InstructionPatch:
    """Result of running the DIR against a context."""

    additional_instructions: list[str] = field(default_factory=list)
    restricted_tools: list[str] = field(default_factory=list)
    required_tools: list[str] = field(default_factory=list)
    required_citations: bool = False
    require_human_confirmation: bool = False
    rules_fired: list[str] = field(default_factory=list)
    safety_envelope: Optional[str] = None

    def merge(self, other: "InstructionPatch") -> "InstructionPatch":
        return InstructionPatch(
            additional_instructions=self.additional_instructions + other.additional_instructions,
            restricted_tools=list(set(self.restricted_tools + other.restricted_tools)),
            required_tools=list(set(self.required_tools + other.required_tools)),
            required_citations=self.required_citations or other.required_citations,
            require_human_confirmation=self.require_human_confirmation
            or other.require_human_confirmation,
            rules_fired=self.rules_fired + other.rules_fired,
            safety_envelope=other.safety_envelope or self.safety_envelope,
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "additional_instructions": self.additional_instructions,
            "restricted_tools": self.restricted_tools,
            "required_tools": self.required_tools,
            "required_citations": self.required_citations,
            "require_human_confirmation": self.require_human_confirmation,
            "rules_fired": self.rules_fired,
            "safety_envelope": self.safety_envelope,
        }


# A match predicate takes the live context dict and returns True if the rule fires.
MatchFn = Callable[[dict[str, Any]], bool]


@dataclass
class InstructionRule:
    """Policy-authored rule.

    A rule matches on any combination of: skill_id, execution path, task
    risk level, regulatory class, or a custom predicate. When it matches
    at the specified trigger phase it contributes its patch.
    """

    rule_id: str
    trigger: RuntimeTrigger
    patch: InstructionPatch
    description: str = ""
    skills: Optional[list[str]] = None            # skill_ids; None = any
    paths: Optional[list[ExecutionPath]] = None   # None = any
    risk_levels: Optional[list[RiskLevel]] = None  # None = any
    regulatory_classes: Optional[list[str]] = None  # None = any
    predicate: Optional[MatchFn] = None

    def matches(self, ctx: dict[str, Any]) -> bool:
        task: Task = ctx.get("task")  # type: ignore[assignment]
        skill: Skill = ctx.get("skill")  # type: ignore[assignment]
        path: ExecutionPath = ctx.get("path")  # type: ignore[assignment]
        phase: RuntimeTrigger = ctx.get("phase")  # type: ignore[assignment]

        if phase != self.trigger:
            return False
        if self.skills is not None and (skill is None or skill.skill_id not in self.skills):
            return False
        if self.paths is not None and (path is None or path not in self.paths):
            return False
        if self.risk_levels is not None and (task is None or task.risk_level not in self.risk_levels):
            return False
        if self.regulatory_classes is not None and (
            task is None or task.regulatory_class not in self.regulatory_classes
        ):
            return False
        if self.predicate is not None and not self.predicate(ctx):
            return False
        return True


class DynamicInstructionRuntime:
    """L9 sidecar. Registered rules are evaluated on every intercept call.

    Thread-safe: rules are registered once at startup; intercept() only reads.
    """

    def __init__(self) -> None:
        self._rules: list[InstructionRule] = []

    # ---------------------------------------------------------------- rules
    def register_rule(self, rule: InstructionRule) -> None:
        self._rules.append(rule)

    def load_default_rules(self) -> None:
        """Seed the runtime with a safe, opinionated baseline."""
        # Safety-relevant work always demands citations + human confirmation.
        self.register_rule(
            InstructionRule(
                rule_id="dir_safety_relevant_confirmation",
                trigger=RuntimeTrigger.PRE_INPUT,
                patch=InstructionPatch(
                    additional_instructions=[
                        "This task is safety-relevant. Cite manufacturer service bulletins for every recommendation and flag any action requiring human sign-off before execution.",
                    ],
                    required_citations=True,
                    require_human_confirmation=True,
                    rules_fired=[],
                    safety_envelope="safety_relevant_v1",
                ),
                description="Force citations + human confirmation when risk is high or critical.",
                risk_levels=[RiskLevel.HIGH, RiskLevel.CRITICAL],
            )
        )
        # Auto safety — block self-reported destructive tools during input phase.
        self.register_rule(
            InstructionRule(
                rule_id="dir_auto_safety_tool_lockdown",
                trigger=RuntimeTrigger.PRE_INPUT,
                patch=InstructionPatch(
                    restricted_tools=["clear_dtc_without_root_cause", "ota_push_untested"],
                    rules_fired=[],
                ),
                description="Lock down destructive tools on auto_safety traffic.",
                regulatory_classes=["auto_safety"],
            )
        )
        # Gambling — mandate responsible-play disclaimer.
        self.register_rule(
            InstructionRule(
                rule_id="dir_gambling_responsible_play",
                trigger=RuntimeTrigger.PRE_INPUT,
                patch=InstructionPatch(
                    additional_instructions=[
                        "Include a responsible-play disclaimer in all user-facing recommendations. Never encourage chasing losses."
                    ],
                    rules_fired=[],
                    safety_envelope="gambling_responsible_v1",
                ),
                description="Responsible-play envelope for sportsbook.",
                regulatory_classes=["gambling"],
            )
        )
        # Drift spike — add a coaching instruction when GSTI drift is elevated.
        def _drift_elevated(ctx: dict[str, Any]) -> bool:
            signals = ctx.get("signals") or {}
            return float(signals.get("skill_drift_risk", 0.0)) > 0.30

        self.register_rule(
            InstructionRule(
                rule_id="dir_drift_coaching",
                trigger=RuntimeTrigger.PRE_INPUT,
                patch=InstructionPatch(
                    additional_instructions=[
                        "Drift risk is elevated for this skill. Annotate the output with a one-line coaching note for the human reviewer so the skill is reinforced, not eroded."
                    ],
                    rules_fired=[],
                ),
                description="Inject preservation coaching when drift risk is high.",
                predicate=_drift_elevated,
            )
        )
        # GDPR-sensitive people data — mask PII before the prompt reaches the model.
        def _is_gdpr_sensitive(ctx: dict[str, Any]) -> bool:
            skill: Skill = ctx.get("skill")  # type: ignore[assignment]
            if skill is None:
                return False
            return "gdpr_sensitive" in (skill.governance_tags or [])

        self.register_rule(
            InstructionRule(
                rule_id="dir_people_data_pii_mask",
                trigger=RuntimeTrigger.PRE_INPUT,
                patch=InstructionPatch(
                    additional_instructions=[
                        "Before sending any name, address, email, or phone number to the model, replace it with <PII_MASK_N>."
                    ],
                    restricted_tools=["raw_customer_lookup"],
                    require_human_confirmation=True,
                    rules_fired=[],
                    safety_envelope="gdpr_pii_mask_v1",
                ),
                description="Mask PII and lock raw customer lookup for GDPR-sensitive skills.",
                predicate=_is_gdpr_sensitive,
            )
        )
        # Fatigue spike — reroute to agent-led handoff pattern.
        def _fatigue_high(ctx: dict[str, Any]) -> bool:
            signals = ctx.get("signals") or {}
            return float(signals.get("actor_fatigue", 0.0)) > 0.55

        self.register_rule(
            InstructionRule(
                rule_id="dir_fatigue_handoff",
                trigger=RuntimeTrigger.PRE_INPUT,
                patch=InstructionPatch(
                    additional_instructions=[
                        "Actor fatigue is elevated. Structure the output as a checklist the agent can carry to completion, minimizing steps that demand sustained human focus."
                    ],
                    rules_fired=[],
                ),
                description="Adapt instructions when human partner is fatigued.",
                predicate=_fatigue_high,
            )
        )

    # -------------------------------------------------------------- intercept
    def intercept(
        self,
        *,
        task: Task,
        skill: Skill,
        path: ExecutionPath,
        phase: RuntimeTrigger,
        signals: Optional[dict[str, Any]] = None,
    ) -> InstructionPatch:
        """Run the rule set for a given execution context.

        Parameters
        ----------
        task, skill, path :
            Core decision context from the UEF output.
        phase :
            Which lifecycle point is being intercepted.
        signals :
            Runtime telemetry slice. Common keys: ``skill_drift_risk``,
            ``actor_fatigue``, ``coordination_tax``, ``recent_error_rate``.

        Returns
        -------
        InstructionPatch :
            The merged patch from all matching rules. An empty patch is
            returned if nothing matches.
        """
        ctx: dict[str, Any] = {
            "task": task,
            "skill": skill,
            "path": path,
            "phase": phase,
            "signals": signals or {},
        }
        merged = InstructionPatch()
        for rule in self._rules:
            if rule.matches(ctx):
                rule_patch = InstructionPatch(
                    additional_instructions=list(rule.patch.additional_instructions),
                    restricted_tools=list(rule.patch.restricted_tools),
                    required_tools=list(rule.patch.required_tools),
                    required_citations=rule.patch.required_citations,
                    require_human_confirmation=rule.patch.require_human_confirmation,
                    rules_fired=[rule.rule_id],
                    safety_envelope=rule.patch.safety_envelope,
                )
                merged = merged.merge(rule_patch)
        return merged

    def rule_count(self) -> int:
        return len(self._rules)

    def rule_ids(self) -> list[str]:
        return [r.rule_id for r in self._rules]
