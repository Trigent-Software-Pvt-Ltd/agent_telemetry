# Recommendation — Les please pick

## TL;DR

**Default the demo to Option A (UI download). Add Option B when a real
customer asks. Defer Option C until we have a regulator partner.**

## Why Option A for the demo

- It fits the 90-second narrative (see `04-dashboard/narrative-flow.md`).
  Click → download → verify on camera.
- Zero external dependencies. If the demo wi-fi dies, this still works.
- The signed bundle itself is identical to what Option B or C would
  produce — so whatever we ship now is forward-compatible.
- Option A is the lowest-risk demo move and the highest-info move for
  capturing customer feedback. Nobody has asked for B or C yet.

## What engineers should build first

In this order:

1. Backend: `POST /v1/evidence/sign` endpoint in `services/governance_service.py`
   (takes tenant + period + format, returns `SignedEvidenceBundle` JSON).
2. React: a "Download signed evidence bundle" button on the dashboard.
   Triggers the endpoint, saves the returned JSON as a file.
3. React: a "Verify attestation" panel that takes a pasted JSON bundle
   and calls `POST /v1/attestation/verify`.

Steps 1–3 unblock the demo. Steps 4–5 (Option B) come later:

4. Backend: `POST /v1/evidence/sign-and-archive` endpoint that writes
   to a customer-provided S3 bucket after signing.
5. Per-tenant config: store `s3_bucket`, `s3_role_arn`, `retention_years`
   in the tenant registry.

## The call from Les

Two specific things I need you to decide:

1. **Demo default: Option A or something else?** If A, I'll tell the
   engineers to build #1–#3 above.
2. **If we skip to B immediately for a specific customer:** which
   customer, which cloud, and do they have IAM / compliance folks
   already in the loop?

If no answer by end of this week, engineers default to A and move on.
