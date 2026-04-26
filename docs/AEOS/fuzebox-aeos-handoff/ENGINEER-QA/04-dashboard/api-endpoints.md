# Backend API Endpoints

Four FastAPI services are scaffolded under `services/` in the main repo.
Not all are feature-complete; this table is honest about the state.

| Service | Port | Status | Key endpoints |
|---|---|---|---|
| `uef_service` | 8007 | scaffolded, needs decide-endpoint expansion | `POST /v1/uef/decide` |
| `ledger_service` | 8011 | scaffolded, needs query endpoints | `GET /v1/ledger/{tenant_id}`, `GET /v1/ledger/{tenant_id}/metrics` |
| `governance_service` | 8012 | scaffolded, needs evidence endpoint | `GET /v1/policies`, `POST /v1/evidence/export` |
| `skills_service` | 8003 | scaffolded (Prompt 11 will remote-ify) | `GET /v1/skills`, `GET /v1/skills/{skill_id}` |

## Run locally (optional live mode, needs pip install)

```bash
pip install fastapi uvicorn
uvicorn services.uef_service:app        --port 8007 &
uvicorn services.ledger_service:app     --port 8011 &
uvicorn services.governance_service:app --port 8012 &
uvicorn services.skills_service:app     --port 8003 &
```

## Suggested new endpoints for the React dashboard

The current services don't cover every panel in `suggested-panels.md`.
Recommended additions:

| Endpoint | Returns | Panel served |
|---|---|---|
| `GET /v1/ledger/{tenant}/eai-timeseries?days=30` | `[{day_offset, eai, hpi, hlr}]` | Panel 10 |
| `GET /v1/ledger/{tenant}/recent-decisions?limit=50` | `[UEFResponse + LedgerRow merged]` | Panel 4 |
| `GET /v1/ledger/{tenant}/rules-fired?days=30` | `{rule_id: count}` | Panel 7 |
| `POST /v1/evidence/sign` | `SignedEvidenceBundle` | Download button |
| `POST /v1/attestation/verify` | `{verified: bool}` | Verify button |

## Auth

None implemented yet. Production will use tenant-scoped JWTs — the
React app attaches a bearer token, the service validates against the
tenant registry. Leave auth hooks as TODOs; don't block on them.

## WebSocket option

For the live decision feed (panel 4), recommend `WS /v1/stream/{tenant}`
that pushes each `UEFResponse.to_dict()` as it's produced. Not
implemented; four-hour add.
