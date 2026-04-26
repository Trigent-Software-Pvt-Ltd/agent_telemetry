"""Layer 10 — Telemetry Normalizer.

Converts vendor-specific traces (Anthropic MCP, OpenAI AgentKit response
shapes, Salesforce event envelopes, etc.) into a canonical ExecutionTrace
that downstream consumers (Economic Ledger, Governance, Dynamic Instruction
Runtime) can reason about uniformly.
"""
from .normalizer import (
    CanonicalTrace,
    CanonicalTraceEvent,
    TelemetryNormalizer,
)

__all__ = ["CanonicalTrace", "CanonicalTraceEvent", "TelemetryNormalizer"]
