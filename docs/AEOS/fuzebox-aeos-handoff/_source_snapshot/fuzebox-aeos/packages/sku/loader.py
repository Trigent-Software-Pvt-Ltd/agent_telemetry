"""Load SKU definitions from fixtures/skus.json."""
from __future__ import annotations

import json
from pathlib import Path

from .catalog import SKU, SKU_CATALOG


def load_skus(path: str | Path) -> dict[str, SKU]:
    """Load the SKU catalog from a JSON fixture.

    Returns a dict keyed by ``sku.id``. If ``path`` does not exist, falls
    back to the in-code default catalog.
    """
    target = Path(path)
    if not target.exists():
        return dict(SKU_CATALOG)
    raw = json.loads(target.read_text())
    catalog: dict[str, SKU] = {}
    for item in raw:
        catalog[item["id"]] = SKU(
            id=item["id"],
            name=item.get("name", item["id"]),
            included_packages=list(item.get("included_packages", [])),
            pricing=dict(item.get("pricing", {})),
            description=item.get("description", ""),
        )
    return catalog
