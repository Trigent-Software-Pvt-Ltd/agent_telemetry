"""Generate placeholder demo fixtures: 40 skills, 200 actors, 8 tenants.

This produces STRUCTURALLY VALID placeholder data for integration testing
and database scaffolding. Skill names are synthetic (demo_skill_007),
actor names are synthetic (demo_actor_0142), and performance numbers are
drawn from stable ranges. Real content — domain-accurate skill names,
role titles, and calibrated performance history — must come from
Les + domain SMEs before any customer-facing demo.

Usage:
    python3 generate_demo_fixtures.py

Writes skills.json, actors.json, signals.json into the current directory.

Determinism: seeded with 42 so repeated runs produce identical output.
"""
from __future__ import annotations

import json
import random
from pathlib import Path

SEED = 42
N_SKILLS = 40
N_ACTORS = 200
N_TENANTS = 8

EXEC_PATHS_AGENT = [
    "anthropic_agent",
    "openai_agent",
    "salesforce_agent",
    "uniphore_agent",
    "cloudflare_agent",
    "google_vertex_agent",
]
EXEC_PATHS_HYBRID = ["hybrid_anthropic_human", "hybrid_openai_human"]
EXEC_PATHS_ALL = ["human"] + EXEC_PATHS_AGENT + EXEC_PATHS_HYBRID

GOVERNANCE_TAGS = [
    "safety_relevant",
    "strategic_skill",
    "gdpr_sensitive",
    "customer_facing",
    "financial",
    "regulatory",
    "brand_safety",
    "people_data",
    "sla_sensitive",
]
PROVIDERS_AGENT = ["anthropic", "openai", "salesforce", "uniphore", "cloudflare", "google"]

TENANTS = [
    ("demo_tenant_01_automotive", "auto_safety"),
    ("demo_tenant_02_contact_center", "general"),
    ("demo_tenant_03_gaming", "gambling"),
    ("demo_tenant_04_insurance", "general"),
    ("demo_tenant_05_healthcare", "general"),
    ("demo_tenant_06_finserv", "general"),
    ("demo_tenant_07_marketing", "general"),
    ("demo_tenant_08_field_ops", "general"),
]


def make_skill(rng: random.Random, idx: int) -> dict:
    # Mix of path sets to exercise every dispatcher branch in the demo
    path_template = rng.choice([
        ["human", "anthropic_agent", "openai_agent", "hybrid_anthropic_human", "hybrid_openai_human"],
        ["human", "anthropic_agent", "hybrid_anthropic_human"],
        ["human", "openai_agent", "salesforce_agent", "hybrid_openai_human"],
        ["human", "openai_agent", "cloudflare_agent", "google_vertex_agent", "hybrid_openai_human"],
        ["human", "anthropic_agent", "uniphore_agent", "hybrid_anthropic_human"],
    ])
    performance = {}
    for p in path_template:
        if p == "human":
            performance[p] = {
                "success_rate": round(rng.uniform(0.80, 0.95), 2),
                "avg_cost": round(rng.uniform(15.0, 90.0), 2),
                "avg_latency_ms": rng.randrange(300_000, 2_100_000, 30_000),
            }
        elif p in EXEC_PATHS_AGENT:
            performance[p] = {
                "success_rate": round(rng.uniform(0.55, 0.80), 2),
                "avg_cost": round(rng.uniform(0.08, 1.50), 2),
                "avg_latency_ms": rng.randrange(2_000, 20_000, 500),
            }
        else:  # hybrid
            performance[p] = {
                "success_rate": round(rng.uniform(0.82, 0.96), 2),
                "avg_cost": round(rng.uniform(2.0, 25.0), 2),
                "avg_latency_ms": rng.randrange(90_000, 900_000, 30_000),
            }

    # Random 1-3 governance tags; always include strategic or customer-facing
    n_tags = rng.randint(1, 3)
    tags = rng.sample(GOVERNANCE_TAGS, n_tags)

    return {
        "skill_id": f"demo_skill_{idx:03d}",
        "name": f"Placeholder Skill {idx:03d}",
        "allowed_paths": path_template,
        "required_tools": [f"tool_{idx:03d}_{i}" for i in range(rng.randint(1, 3))],
        "governance_tags": tags,
        "strategic_weight": round(rng.uniform(0.2, 0.85), 2),
        "version": "1.0",
        "description": f"Placeholder description for demo_skill_{idx:03d}. Replace before customer demo.",
        "performance": performance,
    }


def make_actor(rng: random.Random, idx: int, capable_skill_ids: list[str]) -> dict:
    actor_type = "human" if rng.random() < 0.55 else "agent"
    if actor_type == "human":
        return {
            "actor_id": f"demo_actor_{idx:04d}",
            "actor_type": "human",
            "provider": "human",
            "capabilities": rng.sample(capable_skill_ids, min(len(capable_skill_ids), rng.randint(1, 4))),
            "availability": round(rng.uniform(0.40, 0.85), 2),
            "fatigue": round(rng.uniform(0.05, 0.55), 2),
            "certifications": [],
        }
    else:
        return {
            "actor_id": f"demo_agent_{idx:04d}",
            "actor_type": "agent",
            "provider": rng.choice(PROVIDERS_AGENT),
            "capabilities": rng.sample(capable_skill_ids, min(len(capable_skill_ids), rng.randint(2, 6))),
            "availability": round(rng.uniform(0.90, 0.99), 2),
            "fatigue": 0.0,
        }


def main() -> None:
    rng = random.Random(SEED)

    # 1. skills.json
    skills = [make_skill(rng, i + 1) for i in range(N_SKILLS)]

    # 2. actors.json — partition actors across tenants, ensure each tenant has humans
    actors_by_tenant: dict[str, list[dict]] = {t[0]: [] for t in TENANTS}
    # Assign each skill to 1-3 tenants at random
    tenant_skill_map: dict[str, list[str]] = {t[0]: [] for t in TENANTS}
    for s in skills:
        n_t = rng.randint(1, 3)
        chosen = rng.sample([t[0] for t in TENANTS], n_t)
        for t in chosen:
            tenant_skill_map[t].append(s["skill_id"])

    actor_idx = 1
    actors_per_tenant = N_ACTORS // N_TENANTS
    for tenant_id in actors_by_tenant:
        skills_here = tenant_skill_map[tenant_id] or [skills[0]["skill_id"]]
        for _ in range(actors_per_tenant):
            actors_by_tenant[tenant_id].append(
                make_actor(rng, actor_idx, skills_here)
            )
            actor_idx += 1

    # 3. signals.json — GSTI / drift per skill present in the tenant, UOP per actor
    signals = {}
    skills_by_id = {s["skill_id"]: s for s in skills}
    for tenant_id, _ in TENANTS:
        sk_ids = tenant_skill_map[tenant_id]
        gsti = {sid: round(rng.uniform(0.2, 0.8), 2) for sid in sk_ids}
        drift = {sid: round(rng.uniform(0.05, 0.30), 2) for sid in sk_ids}
        uop = {
            a["actor_id"]: {
                "readiness": round(a["availability"], 2),
                "fatigue": round(a["fatigue"], 2),
                "capacity": round(min(0.99, a["availability"] + rng.uniform(-0.05, 0.05)), 2),
            }
            for a in actors_by_tenant[tenant_id]
        }
        coord = {"default": round(rng.uniform(0.05, 0.18), 2)}
        signals[tenant_id] = {
            "tenant_id": tenant_id,
            "gsti": gsti,
            "skill_drift_risk": drift,
            "uop_by_actor": uop,
            "coordination_tax": coord,
        }

    out = Path(__file__).parent
    (out / "skills.json").write_text(json.dumps(skills, indent=2) + "\n")
    (out / "actors.json").write_text(json.dumps(actors_by_tenant, indent=2) + "\n")
    (out / "signals.json").write_text(json.dumps(signals, indent=2) + "\n")

    total_actors = sum(len(v) for v in actors_by_tenant.values())
    total_skills = len(skills)
    print(f"wrote skills.json   — {total_skills} skills")
    print(f"wrote actors.json   — {total_actors} actors across {len(actors_by_tenant)} tenants")
    print(f"wrote signals.json  — {len(signals)} tenants")


if __name__ == "__main__":
    main()
