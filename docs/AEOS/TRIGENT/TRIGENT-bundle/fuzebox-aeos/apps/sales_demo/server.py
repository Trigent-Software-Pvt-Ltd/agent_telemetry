"""Minimal sales demo HTTP server — stdlib only.

Serves a single-page board-level AEOS dashboard. The left column shows
the live UEF decision for the Ken Garff brake scenario; the right column
shows the ledger metric board (EAI, HPI, HLR, EROI, SER).

    $ python -m apps.sales_demo.server

Then open http://localhost:8080/
"""
from __future__ import annotations

import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

from packages.shared.schema import ExecutionPath, GovernanceRequirement
from packages.economic_ledger.metrics import (
    compute_eai,
    compute_eroi,
    compute_hlr,
    compute_hpi,
    compute_ser,
    compute_sy,
    compute_ucs,
)

from apps._runtime import build_runtime, run_flow, task_ken_garff_brake_diagnosis


HERE = Path(__file__).resolve().parent
RUNTIME = build_runtime(rng_seed=42)


def _seed_ledger() -> None:
    gov = GovernanceRequirement(
        audit_log_required=True,
        trace_retention_days=365,
        human_override_available=True,
        policy_pack="auto_safety_standard",
        evidence_export_required=True,
    )
    candidates = [
        ExecutionPath.HUMAN,
        ExecutionPath.ANTHROPIC,
        ExecutionPath.OPENAI,
        ExecutionPath.HYBRID_ANTHROPIC_HUMAN,
        ExecutionPath.HYBRID_OPENAI_HUMAN,
    ]
    for i in range(12):
        t = task_ken_garff_brake_diagnosis()
        t.task_id = f"seed_task_{i:03d}"
        run_flow(
            RUNTIME,
            task=t,
            skill_id="skill_brake_diag_v3",
            candidate_paths=candidates,
            governance=gov,
            policy_pack_id="auto_safety_standard",
            outcome_value_usd=300.0,
        )


_seed_ledger()


def _dashboard_payload() -> dict:
    rows = RUNTIME.ledger.for_tenant("kengarff_south_jordan")
    eai = compute_eai(rows)
    # Recent decision — replay the demo task live
    outcome = run_flow(
        RUNTIME,
        task=task_ken_garff_brake_diagnosis(),
        skill_id="skill_brake_diag_v3",
        candidate_paths=[
            ExecutionPath.HUMAN,
            ExecutionPath.ANTHROPIC,
            ExecutionPath.OPENAI,
            ExecutionPath.HYBRID_ANTHROPIC_HUMAN,
            ExecutionPath.HYBRID_OPENAI_HUMAN,
        ],
        governance=GovernanceRequirement(
            audit_log_required=True,
            trace_retention_days=365,
            human_override_available=True,
            policy_pack="auto_safety_standard",
            evidence_export_required=True,
        ),
        policy_pack_id="auto_safety_standard",
        outcome_value_usd=300.0,
    )
    rows2 = RUNTIME.ledger.for_tenant("kengarff_south_jordan")
    return {
        "tenant": "kengarff_south_jordan",
        "decision": {
            "selected_path": outcome.selected_path,
            "selected_actor_id": outcome.selected_actor_id,
            "confidence": outcome.ledger_row.success_probability_predicted,
            "scored_paths": outcome.scored_paths,
            "rules_fired": outcome.instruction_patch.get("rules_fired", []),
            "policy_allow": outcome.policy_decision.get("allow"),
            "required_controls": outcome.policy_decision.get("required_controls", []),
            "adapter": {
                "provider": outcome.adapter_result.provider,
                "model": outcome.adapter_result.model,
                "success": outcome.adapter_result.success,
                "latency_ms": outcome.adapter_result.latency_ms,
                "cost_usd": outcome.adapter_result.cost_usd,
            },
        },
        "metrics": {
            "row_count": len(rows2),
            "ucs": round(compute_ucs(rows2), 4),
            "sy":  round(compute_sy(rows2), 4),
            "ser": round(compute_ser(rows2), 4),
            "eroi": round(compute_eroi(rows2), 4),
            "hpi":  round(compute_hpi(rows2), 4),
            "hlr":  round(compute_hlr(rows2), 4),
            "eai": compute_eai(rows2).to_dict(),
        },
    }


_INDEX_HTML = """<!doctype html>
<html lang='en'><head>
<meta charset='utf-8'/>
<title>FuzeBox AEOS — Board Demo</title>
<style>
  body{font-family:system-ui,Inter,Helvetica,Arial,sans-serif;background:#0b1220;color:#e8eefb;margin:0;padding:24px;}
  h1{margin:0 0 4px 0;font-size:22px;color:#8fd3ff;}
  .sub{color:#8da0c0;font-size:13px;margin-bottom:22px;}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;}
  .card{background:#131c30;border:1px solid #223255;border-radius:12px;padding:20px;}
  .card h2{margin:0 0 12px 0;font-size:14px;color:#8fd3ff;letter-spacing:.08em;text-transform:uppercase;}
  .row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed #22315a;font-size:14px;}
  .row:last-child{border-bottom:none;}
  .k{color:#9db2d9;}
  .v{color:#e8eefb;font-family:'JetBrains Mono',Menlo,monospace;}
  .pill{display:inline-block;padding:2px 8px;border-radius:999px;background:#1d3a6a;color:#9fd8ff;font-size:12px;margin-right:4px;}
  .scored{font-family:'JetBrains Mono',Menlo,monospace;font-size:12px;line-height:1.55;color:#cde0ff;background:#0d1526;padding:10px;border-radius:8px;margin-top:6px;max-height:220px;overflow:auto;}
  .big{font-size:34px;font-weight:700;color:#8fd3ff;font-family:'JetBrains Mono',Menlo,monospace;}
  .small{font-size:12px;color:#8da0c0;}
  button{background:#1d3a6a;color:#9fd8ff;border:1px solid #2b4a82;border-radius:8px;padding:6px 14px;font-size:13px;cursor:pointer;}
  button:hover{background:#264a82;}
</style></head>
<body>
  <h1>FuzeBox AEOS</h1>
  <div class='sub'>Agentic Enterprise Operating System — Ken Garff South Jordan live demo.
    <button onclick='load()'>Re-run decision</button></div>
  <div class='grid'>
    <div class='card'>
      <h2>Layer 7 — UEF Decision</h2>
      <div id='decision'>Loading…</div>
    </div>
    <div class='card'>
      <h2>Layer 11 — Enterprise Autonomy Index</h2>
      <div id='metrics'>Loading…</div>
    </div>
  </div>
<script>
function fmt(n){return typeof n==='number'?n.toFixed(3):n;}
async function load(){
  const r = await fetch('/api/dashboard'); const d = await r.json();
  const dec = d.decision;
  const rows = [
    ['selected_path',`<span class='pill'>${dec.selected_path}</span>`],
    ['selected_actor',dec.selected_actor_id||'—'],
    ['adapter.provider',dec.adapter.provider],
    ['adapter.model',dec.adapter.model||'—'],
    ['adapter.success',dec.adapter.success],
    ['adapter.latency_ms',dec.adapter.latency_ms.toLocaleString()],
    ['adapter.cost_usd','$'+dec.adapter.cost_usd.toFixed(2)],
    ['policy.allow',dec.policy_allow],
    ['policy.required_controls',(dec.required_controls||[]).join(', ')],
    ['dir.rules_fired',(dec.rules_fired||[]).join(', ')||'—'],
  ];
  document.getElementById('decision').innerHTML =
    rows.map(([k,v])=>`<div class='row'><span class='k'>${k}</span><span class='v'>${v}</span></div>`).join('')+
    `<div class='scored'><b>Scored paths</b><br/>`+
    dec.scored_paths.map(s=>`${s.path.padEnd(26)} total=${fmt(s.total)}  cap=${fmt(s.capability_fit)} gsti=${fmt(s.gsti_value)} uop=${fmt(s.uop_value)} -coord=${fmt(-s.coordination_tax)} gov=${fmt(s.governance_score)} rt=${fmt(s.runtime_fit)} econ=${fmt(s.economic_value)} -risk=${fmt(-s.risk_penalty)}`).join('<br/>')+`</div>`;
  const m = d.metrics;
  document.getElementById('metrics').innerHTML =
    `<div class='big'>${m.eai.eai.toFixed(4)}</div>
     <div class='small'>EAI across ${m.row_count} Ken Garff ledger rows</div><br/>`+
    [['UCS (avg unit cost)',m.ucs],['SY (success yield)',m.sy],['SER (skill elasticity)',m.ser],['EROI (econ ROI)',m.eroi],['HPI (human preservation)',m.hpi],['HLR (hybrid leverage)',m.hlr]]
    .map(([k,v])=>`<div class='row'><span class='k'>${k}</span><span class='v'>${fmt(v)}</span></div>`).join('');
}
load();
</script>
</body></html>"""


class _H(BaseHTTPRequestHandler):
    def _json(self, obj: dict, status: int = 200):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/" or self.path == "/index.html":
            body = _INDEX_HTML.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if self.path == "/api/dashboard":
            self._json(_dashboard_payload())
            return
        self.send_error(404)

    def log_message(self, format, *args):  # silence default logs
        return


def main(port: int | None = None):
    p = int(port or os.getenv("PORT", "8080"))
    server = HTTPServer(("0.0.0.0", p), _H)
    print(f"FuzeBox AEOS sales demo — http://localhost:{p}/")
    server.serve_forever()


if __name__ == "__main__":
    main()
