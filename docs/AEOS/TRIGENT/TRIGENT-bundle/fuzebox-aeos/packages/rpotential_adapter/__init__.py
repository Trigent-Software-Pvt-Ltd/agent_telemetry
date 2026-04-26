"""rPotential Adapter — Layer 6 (Live Signal Bus).

Bridges FuzeBox AEOS to rPotential's labor graph. Exposes:
  - get_signals(tenant_id, skill_ids, actor_ids) -> WorkforceSignals
  - writeback(event: WritebackEvent) -> None

Two implementations are provided:
  - MockRPotentialAdapter: deterministic fixture data; used by tests and demos
  - HTTPRPotentialAdapter: production-shape HTTP client against rPotential's API
"""
from .base import RPotentialAdapter
from .mock import MockRPotentialAdapter
from .http import HTTPRPotentialAdapter

__all__ = ["RPotentialAdapter", "MockRPotentialAdapter", "HTTPRPotentialAdapter"]
