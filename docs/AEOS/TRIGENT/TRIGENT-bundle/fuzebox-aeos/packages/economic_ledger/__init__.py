"""Layer 11 — Execution Economic Ledger.

Append-only record of every execution with cost, latency, success, risk,
coordination, and capability deltas. Feeds:
  - Derived metrics (UCS, SY, SER, EROI, SDD)
  - Joint-IP indices (HPI, HLR, EAI)
  - rPotential writeback loop
  - Skills Authority performance update
"""
from .ledger import EconomicLedger
from .metrics import (
    compute_ucs,
    compute_sy,
    compute_ser,
    compute_eroi,
    compute_sdd,
    compute_hpi,
    compute_hlr,
    compute_eai,
    EAIBreakdown,
)

__all__ = [
    "EconomicLedger",
    "compute_ucs",
    "compute_sy",
    "compute_ser",
    "compute_eroi",
    "compute_sdd",
    "compute_hpi",
    "compute_hlr",
    "compute_eai",
    "EAIBreakdown",
]
