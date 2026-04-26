"""CLI: print an SKU-to-package matrix.

Usage:
    python -m scripts.list_skus

Intended audience: sales engineers who need to answer "which features
ship with which bundle" at a glance.
"""
from __future__ import annotations

from pathlib import Path

from packages.sku import load_skus

ROOT = Path(__file__).resolve().parent.parent


def main() -> int:
    catalog = load_skus(ROOT / "fixtures" / "skus.json")

    # Collect the union of every package across all SKUs for stable columns.
    all_packages = sorted({p for sku in catalog.values() for p in sku.included_packages})

    # Header
    col1_width = max((len(p) for p in all_packages), default=20)
    headers = [sku.id for sku in catalog.values()]
    col_widths = [max(8, len(h)) for h in headers]

    header_line = "  " + "Package".ljust(col1_width) + "  " + "  ".join(
        h.ljust(w) for h, w in zip(headers, col_widths)
    )
    print(header_line)
    print("  " + "-" * (col1_width + 2 + sum(col_widths) + 2 * (len(col_widths) - 1)))

    for pkg in all_packages:
        cells = []
        for sku, w in zip(catalog.values(), col_widths):
            cells.append(("yes" if pkg in sku.included_packages else "no ").ljust(w))
        print("  " + pkg.ljust(col1_width) + "  " + "  ".join(cells))

    print()
    print("Pricing:")
    for sku in catalog.values():
        print(f"  {sku.id:30s}  {sku.pricing}")
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
