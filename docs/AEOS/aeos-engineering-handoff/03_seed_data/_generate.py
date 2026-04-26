"""Deterministic seed-data generator for the engineering demo.

Produces:
  - skills.json   (40 entries, spanning automotive / CX / events / compliance / field / HR)
  - actors.json   (200 entries for the demo tenant "aeos_demo_enterprise")
  - signals.json  (tenant workforce signals matching the 200 actors)

Run once to regenerate; output is committed alongside. Deterministic
because we seed Python's RNG.
"""
from __future__ import annotations

import json
import random
from pathlib import Path

OUT = Path(__file__).resolve().parent
TENANT = "aeos_demo_enterprise"

rnd = random.Random(20260420)  # date-based seed for reproducibility


# ---------------------------------------------------------------------------
# 40 skills, ~7 families
# ---------------------------------------------------------------------------

FAMILIES = [
    # (prefix, display_name_tmpl, governance_tags, strategic_low, strategic_high,
    #  allowed_paths, required_tools)
    ("auto_diag", "Automotive Diagnosis — {sub}",
     ["safety_relevant", "strategic_skill"], 0.55, 0.75,
     ["human", "anthropic_agent", "openai_agent", "hybrid_anthropic_human", "hybrid_openai_human"],
     ["dtc_reader", "oem_bulletin_lookup"]),
    ("auto_repair", "Automotive Repair — {sub}",
     ["safety_relevant"], 0.40, 0.65,
     ["human", "hybrid_anthropic_human"],
     ["torque_wrench_digital", "oem_procedure_lookup"]),
    ("cx_triage", "Contact Center — {sub}",
     ["customer_facing"], 0.30, 0.55,
     ["human", "anthropic_agent", "openai_agent", "uniphore_agent", "hybrid_openai_human"],
     ["case_lookup", "sentiment"]),
    ("events_ops", "Venue Operations — {sub}",
     ["safety_relevant"], 0.40, 0.60,
     ["human", "openai_agent", "anthropic_agent", "hybrid_anthropic_human"],
     ["incident_log", "comms_broadcast"]),
    ("compliance", "Regulatory Compliance — {sub}",
     ["regulatory", "strategic_skill"], 0.60, 0.80,
     ["human", "anthropic_agent", "hybrid_anthropic_human"],
     ["regulation_lookup", "audit_trail_writer"]),
    ("field_service", "Field Service — {sub}",
     ["sla_sensitive"], 0.30, 0.55,
     ["human", "openai_agent", "cloudflare_agent", "hybrid_openai_human"],
     ["fleet_tracker", "sla_calculator"]),
    ("hr_people", "Workforce Coaching — {sub}",
     ["people_data", "gdpr_sensitive"], 0.45, 0.65,
     ["human", "anthropic_agent", "hybrid_anthropic_human"],
     ["performance_history", "coaching_templates"]),
]

SUBS = {
    "auto_diag": ["Brake", "Engine", "Transmission", "HVAC", "Electrical", "Steering", "Battery EV"],
    "auto_repair": ["Brake Pad Replacement", "Oil Service", "Tire Rotation", "Suspension", "Cooling System"],
    "cx_triage": ["Billing Escalation", "Fraud Review", "Loyalty Retention", "Tier-2 Routing", "Churn Save"],
    "events_ops": ["Medical Incident", "Crowd Flow", "VIP Host", "Security Handoff"],
    "compliance": ["WP.29 Cockpit Review", "SOC2 Change Audit", "EU AI Act Article-12 Pull", "GDPR DSAR"],
    "field_service": ["Utility Outage", "HVAC On-Site", "Cable Splice", "Meter Exchange"],
    "hr_people": ["Q2 Coaching Plan", "PIP Authoring", "1:1 Summary", "Skill Gap Review"],
}


def perf_block(paths, rng):
    # Baseline performance curves per path; slight random noise.
    base = {
        "human": (0.88, 26.0, 1_600_000),
        "anthropic_agent": (0.68, 0.80, 12_000),
        "openai_agent": (0.70, 0.60, 8_000),
        "salesforce_agent": (0.65, 0.35, 6_000),
        "uniphore_agent": (0.72, 0.55, 5_500),
        "cloudflare_agent": (0.67, 0.08, 2_200),
        "hybrid_anthropic_human": (0.92, 13.0, 700_000),
        "hybrid_openai_human": (0.91, 11.0, 650_000),
    }
    out = {}
    for p in paths:
        if p not in base:
            continue
        s, c, l = base[p]
        out[p] = {
            "success_rate": round(max(0.35, min(0.98, s + rng.uniform(-0.04, 0.04))), 3),
            "avg_cost": round(max(0.05, c * rng.uniform(0.85, 1.15)), 2),
            "avg_latency_ms": int(l * rng.uniform(0.85, 1.15)),
        }
    return out


skills = []
skill_ids_by_family = {}
for prefix, name_tmpl, tags, sw_lo, sw_hi, paths, tools in FAMILIES:
    skill_ids_by_family.setdefault(prefix, [])
    for i, sub in enumerate(SUBS[prefix]):
        sid = f"skill_{prefix}_{i+1:02d}"
        skill_ids_by_family[prefix].append(sid)
        skills.append({
            "skill_id": sid,
            "name": name_tmpl.format(sub=sub),
            "allowed_paths": paths,
            "required_tools": tools,
            "governance_tags": tags,
            "strategic_weight": round(rnd.uniform(sw_lo, sw_hi), 2),
            "version": "1.0",
            "description": f"{name_tmpl.format(sub=sub)} — demo skill generated for aeos_demo_enterprise.",
            "performance": perf_block(paths, rnd),
        })

# pad to exactly 40 by cloning variants with regional suffixes
REGIONS = ["US-West", "US-East", "EU-DE", "EU-FR", "APAC-JP"]
while len(skills) < 40:
    src = skills[len(skills) % len(SUBS["auto_diag"])]
    region = REGIONS[len(skills) % len(REGIONS)]
    sid = f"{src['skill_id']}_r{len(skills):02d}"
    clone = json.loads(json.dumps(src))
    clone["skill_id"] = sid
    clone["name"] = f"{src['name']} ({region})"
    clone["description"] = f"{src['description']} Regional variant: {region}."
    skills.append(clone)
    skill_ids_by_family.setdefault("auto_diag", []).append(sid)

assert len(skills) == 40, len(skills)


# ---------------------------------------------------------------------------
# 200 actors — mix of humans + shared agents
# ---------------------------------------------------------------------------

FIRST_NAMES = ["Alex","Sam","Jordan","Morgan","Taylor","Casey","Riley","Drew","Quinn","Avery",
               "Cameron","Harper","Logan","Rowan","Skyler","Peyton","Parker","Sage","Reese","Emery"]
LAST_NAMES  = ["Kim","Patel","García","Nguyen","Okafor","Jansen","Silva","Fischer","Rossi","Cohen",
               "Haddad","Yamada","Petrov","Dubois","Larsen","O'Connor","Novak","Schmidt","Tanaka","Martín"]

CERT_POOL = [
    "ASE_Master", "ASE_A5_Brakes", "Hybrid_Safety", "EV_L2_Cert",
    "OEM_Toyota", "OEM_Ford", "OEM_GM", "WP29_Assessor",
    "GDPR_DPO", "CIPP_E", "SHRM_SCP", "ITIL_v4",
    "SOC2_Lead_Auditor", "Lean_Six_Sigma_GB"
]


def pick_caps(n_min, n_max, pool_keys):
    k = rnd.randint(n_min, n_max)
    pool = []
    for fam in pool_keys:
        pool.extend(skill_ids_by_family.get(fam, []))
    return rnd.sample(pool, min(k, len(pool)))


actors = []

# 180 humans distributed across specialties
SPECIALTIES = [
    ("technician",       ["auto_diag", "auto_repair"],        70, (0.65, 0.88), (0.05, 0.35)),
    ("cx_agent",         ["cx_triage"],                       40, (0.55, 0.82), (0.15, 0.50)),
    ("venue_operator",   ["events_ops"],                      20, (0.60, 0.85), (0.10, 0.45)),
    ("compliance_lead",  ["compliance"],                      15, (0.45, 0.75), (0.15, 0.45)),
    ("field_tech",       ["field_service"],                   25, (0.60, 0.80), (0.10, 0.40)),
    ("hr_lead",          ["hr_people"],                       10, (0.50, 0.75), (0.15, 0.40)),
]

counter = 0
for role, fams, count, readiness_range, fatigue_range in SPECIALTIES:
    for _ in range(count):
        counter += 1
        first, last = rnd.choice(FIRST_NAMES), rnd.choice(LAST_NAMES)
        certs = rnd.sample(CERT_POOL, rnd.randint(1, 3))
        actors.append({
            "actor_id": f"h_{role}_{counter:03d}",
            "actor_type": "human",
            "provider": "human",
            "capabilities": pick_caps(3, 7, fams),
            "availability": round(rnd.uniform(0.40, 0.90), 2),
            "fatigue": round(rnd.uniform(*fatigue_range), 2),
            "certifications": certs,
            "metadata": {
                "display_name": f"{first} {last}",
                "role": role,
                "region": rnd.choice(REGIONS),
            },
        })

# 20 shared agents (Anthropic / OpenAI / SF / Uniphore / Cloudflare)
AGENT_ROSTER = [
    ("agent_claude_opus_47",  "anthropic",  "Claude Opus 4.7",     ["auto_diag","compliance","hr_people","events_ops"]),
    ("agent_claude_haiku_47", "anthropic",  "Claude Haiku 4.7",    ["cx_triage","field_service"]),
    ("agent_gpt_51",          "openai",     "GPT-5.1 Thinking",    ["auto_diag","cx_triage","field_service","events_ops"]),
    ("agent_gpt_51_mini",     "openai",     "GPT-5.1 Mini",        ["cx_triage","field_service"]),
    ("agent_salesforce_af",   "salesforce", "Agentforce Standard", ["cx_triage","hr_people"]),
    ("agent_uniphore_bac",    "uniphore",   "Uniphore BAC v2",     ["cx_triage"]),
    ("agent_cloudflare_think","cloudflare", "Project Think v1",    ["field_service","cx_triage"]),
]
# expand to 20 by cloning with regional endpoint suffixes
while len(AGENT_ROSTER) < 20:
    base = AGENT_ROSTER[len(AGENT_ROSTER) % 7]
    suffix = f"_r{len(AGENT_ROSTER)}"
    AGENT_ROSTER.append((base[0]+suffix, base[1], base[2]+" (regional)", base[3]))

for aid, provider, display, fams in AGENT_ROSTER:
    actors.append({
        "actor_id": aid,
        "actor_type": "agent",
        "provider": provider,
        "capabilities": pick_caps(4, 10, fams),
        "availability": round(rnd.uniform(0.90, 0.99), 2),
        "fatigue": 0.0,
        "certifications": [],
        "metadata": {
            "display_name": display,
            "role": "agent",
            "region": "GLOBAL",
        },
    })

assert len(actors) == 200, len(actors)


# ---------------------------------------------------------------------------
# Signals bundle for the tenant
# ---------------------------------------------------------------------------

gsti = {s["skill_id"]: round(s["strategic_weight"], 2) for s in skills}
drift = {s["skill_id"]: round(rnd.uniform(0.06, 0.30), 2) for s in skills}

uop = {}
for a in actors:
    uop[a["actor_id"]] = {
        "readiness": round(max(0.05, min(0.99, 1.0 - a["fatigue"] * 0.6 + rnd.uniform(-0.05, 0.05))), 2),
        "fatigue":   a["fatigue"],
        "capacity":  round(max(0.1, a["availability"] - rnd.uniform(0.0, 0.10)), 2),
    }

coord = {
    "default": 0.12,
    "service_bay_diagnosis": 0.15,
    "contact_center_escalation": 0.10,
    "venue_operations_incident": 0.18,
    "automotive_cockpit_compliance": 0.22,
    "field_service_dispatch": 0.09,
    "hr_workforce_coaching": 0.14,
}

signals = {
    TENANT: {
        "tenant_id": TENANT,
        "gsti": gsti,
        "skill_drift_risk": drift,
        "uop_by_actor": uop,
        "coordination_tax": coord,
    }
}


# ---------------------------------------------------------------------------
# Write outputs
# ---------------------------------------------------------------------------

(OUT / "skills.json").write_text(json.dumps(skills, indent=2))

# Actors file keyed by tenant (same shape the fixture loader expects)
(OUT / "actors.json").write_text(json.dumps({TENANT: actors}, indent=2))

(OUT / "signals.json").write_text(json.dumps(signals, indent=2))

# Convenience: per-actor index for fast lookup at demo time
index = {
    "tenant_id": TENANT,
    "counts": {
        "skills": len(skills),
        "actors_total": len(actors),
        "humans": sum(1 for a in actors if a["actor_type"] == "human"),
        "agents": sum(1 for a in actors if a["actor_type"] == "agent"),
    },
    "skill_ids_by_family": skill_ids_by_family,
}
(OUT / "index.json").write_text(json.dumps(index, indent=2))

print(f"Wrote {len(skills)} skills and {len(actors)} actors for tenant {TENANT}")
