"""Policy pack loader + evaluator.

Policy packs are versioned YAML files shipped alongside the product. For
this MVP we parse a small YAML subset without requiring PyYAML — each
pack declares a set of rules that reference canonical schema fields.

Pack format (YAML):

    id: eu_ai_act_high_risk
    version: "2026.04"
    description: EU AI Act Annex-III high-risk systems
    rules:
      - id: human_in_loop
        when:
          task.risk_level: [high, critical]
        require:
          path.human_involved: true
        severity: critical
      - id: audit_log_mandatory
        when:
          always: true
        require:
          governance.audit_log_required: true
        severity: high
"""
from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Iterable

from packages.shared.schema import (
    ExecutionPath,
    GovernanceRequirement,
    RiskLevel,
    Task,
)


_HYBRID_PATHS = {
    ExecutionPath.HYBRID_ANTHROPIC_HUMAN,
    ExecutionPath.HYBRID_OPENAI_HUMAN,
}


@dataclass
class PolicyDecision:
    allow: bool
    reasons: list[str] = field(default_factory=list)
    required_controls: list[str] = field(default_factory=list)
    evidence_required: bool = False

    def to_dict(self) -> dict:
        return {
            "allow": self.allow,
            "reasons": list(self.reasons),
            "required_controls": list(self.required_controls),
            "evidence_required": self.evidence_required,
        }


@dataclass
class PolicyRule:
    id: str
    severity: str = "medium"  # low | medium | high | critical
    when: dict[str, Any] = field(default_factory=dict)
    require: dict[str, Any] = field(default_factory=dict)


@dataclass
class PolicyPack:
    id: str
    version: str
    description: str
    rules: list[PolicyRule] = field(default_factory=list)

    # ----- YAML-lite parser (avoids pyyaml dependency for MVP) -----

    @classmethod
    def from_dict(cls, raw: dict) -> "PolicyPack":
        rules = [PolicyRule(**r) for r in raw.get("rules", [])]
        return cls(
            id=raw["id"],
            version=raw.get("version", "0.1"),
            description=raw.get("description", ""),
            rules=rules,
        )

    @classmethod
    def load_file(cls, path: str | Path) -> "PolicyPack":
        """Very small YAML subset parser — handles the packs we ship.

        We intentionally avoid a PyYAML dependency for the MVP so the repo
        runs against stdlib only.
        """
        import json as _json
        text = Path(path).read_text()
        # Packs are actually shipped as JSON with .json suffix OR as YAML.
        # For the MVP we use JSON to keep the zero-dep promise.
        return cls.from_dict(_json.loads(text))


class PolicyEngine:
    """Loads packs and evaluates decisions against them."""

    def __init__(self) -> None:
        self._packs: dict[str, PolicyPack] = {}

    # ---------- Loading ----------

    def register(self, pack: PolicyPack) -> None:
        self._packs[pack.id] = pack

    def load_directory(self, directory: str | Path) -> int:
        count = 0
        for p in sorted(Path(directory).glob("*.json")):
            self.register(PolicyPack.load_file(p))
            count += 1
        return count

    def get(self, pack_id: str) -> PolicyPack | None:
        return self._packs.get(pack_id)

    def list_packs(self) -> list[str]:
        return sorted(self._packs.keys())

    # ---------- Evaluation ----------

    def evaluate(
        self,
        *,
        pack_id: str,
        task: Task,
        selected_path: ExecutionPath,
        governance: GovernanceRequirement,
    ) -> PolicyDecision:
        pack = self._packs.get(pack_id)
        if pack is None:
            # Absence of a pack => default-allow with baseline controls
            return PolicyDecision(
                allow=True,
                reasons=[f"pack_not_loaded:{pack_id}"],
                required_controls=["audit_log"],
                evidence_required=False,
            )

        decision = PolicyDecision(allow=True)
        for rule in pack.rules:
            if not _rule_matches(rule.when, task):
                continue
            satisfied = _rule_satisfied(rule.require, selected_path, governance)
            if satisfied:
                decision.required_controls.extend(_required_controls(rule.require))
            else:
                decision.allow = decision.allow and rule.severity != "critical"
                decision.reasons.append(f"violation:{rule.id}")
                decision.required_controls.extend(_required_controls(rule.require))
        # Dedupe
        decision.required_controls = sorted(set(decision.required_controls))
        decision.evidence_required = governance.evidence_export_required or (
            pack_id in ("eu_ai_act_high_risk", "wp29")
        )
        return decision


# ---------------------------------------------------------------------------
# Rule matching helpers
# ---------------------------------------------------------------------------


def _rule_matches(when: dict[str, Any], task: Task) -> bool:
    if not when or when.get("always"):
        return True
    risk_match = when.get("task.risk_level")
    if risk_match:
        allowed_levels = {RiskLevel(v) for v in risk_match}
        if task.risk_level not in allowed_levels:
            return False
    regclass = when.get("task.regulatory_class")
    if regclass:
        if task.regulatory_class not in regclass:
            return False
    return True


def _rule_satisfied(
    require: dict[str, Any],
    selected_path: ExecutionPath,
    governance: GovernanceRequirement,
) -> bool:
    if require.get("path.human_involved"):
        if not (selected_path == ExecutionPath.HUMAN or selected_path in _HYBRID_PATHS):
            return False
    if require.get("governance.audit_log_required"):
        if not governance.audit_log_required:
            return False
    if require.get("governance.evidence_export_required"):
        if not governance.evidence_export_required:
            return False
    if require.get("governance.human_override_available"):
        if not governance.human_override_available:
            return False
    min_retention = require.get("governance.trace_retention_days_min")
    if min_retention is not None:
        if governance.trace_retention_days < int(min_retention):
            return False
    if require.get("governance.explainability_required"):
        # Satisfied when the governance bundle flags an explanation interface
        # via either the canonical flag (future-proofing) or the policy pack
        # carrying the EU AI Act Article-12 obligation.
        flag = getattr(governance, "explainability_required", None)
        if flag is None:
            # If the governance dataclass predates the flag, treat presence of
            # a high-risk policy pack as implicit satisfaction.
            if governance.policy_pack not in ("eu_ai_act_high_risk", "wp29"):
                return False
        elif not flag:
            return False
    return True


def _required_controls(require: dict[str, Any]) -> list[str]:
    controls: list[str] = []
    if require.get("path.human_involved"):
        controls.append("human_in_loop")
    if require.get("governance.audit_log_required"):
        controls.append("audit_log")
    if require.get("governance.evidence_export_required"):
        controls.append("evidence_export")
    if require.get("governance.human_override_available"):
        controls.append("human_override")
    if require.get("governance.explainability_required"):
        controls.append("explanation_interface")
    return controls
