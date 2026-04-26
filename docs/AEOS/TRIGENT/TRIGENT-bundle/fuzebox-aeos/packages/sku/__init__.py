"""AEOS SKU catalog — which packages ship with which commercial bundle.

Four SKUs are supported:

- ``uef_core`` — the decision plane (L1-L8 + L10).
- ``governance_edition`` — adds L9 DIR, L12 evidence, two-party attestation.
- ``enterprise_autonomy_index`` — adds EAI metrics + board-level signer.
- Vertical bundles — ``automotive``, ``contact_center``, ``gaming``.
"""
from .catalog import SKU, SKU_CATALOG
from .loader import load_skus

__all__ = ["SKU", "SKU_CATALOG", "load_skus"]
