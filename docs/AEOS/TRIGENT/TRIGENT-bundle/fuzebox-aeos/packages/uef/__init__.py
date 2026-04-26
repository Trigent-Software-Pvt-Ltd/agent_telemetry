"""Layer 7 — Universal Execution Function.

Pre-execution decision engine that scores candidate paths across human,
agent, and hybrid runtimes and returns the best choice. This is the core
AEOS IP. Joint FuzeBox + rPotential IP on the scoring model.
"""
from .scoring import (
    score_capability_fit,
    score_gsti_value,
    score_uop_value,
    score_coordination_tax,
    score_governance,
    score_runtime_fit,
    score_economic_value,
    score_risk_penalty,
)
from .engine import universal_execution_function, score_all_paths

__all__ = [
    "universal_execution_function",
    "score_all_paths",
    "score_capability_fit",
    "score_gsti_value",
    "score_uop_value",
    "score_coordination_tax",
    "score_governance",
    "score_runtime_fit",
    "score_economic_value",
    "score_risk_penalty",
]
