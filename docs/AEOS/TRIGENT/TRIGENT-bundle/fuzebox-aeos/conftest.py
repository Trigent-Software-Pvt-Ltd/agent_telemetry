"""Pytest + python -m entry root.

Ensures the repo root is on sys.path so `from packages.X import Y` and
`from apps._runtime import ...` work whether you run pytest, run
`python -m apps.kengarff_demo.main`, or import interactively.
"""
from __future__ import annotations

import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))
