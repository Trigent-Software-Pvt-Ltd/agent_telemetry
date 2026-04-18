/**
 * Live Sourcing Agent — runtime configuration & feature flag.
 *
 * Required environment variables (document only; do NOT commit values):
 *   DATA_SOURCE                 'mock' (default) or 'live-sourcing'
 *   AWS_REGION                  AWS region for Bedrock (default 'us-east-1')
 *   AWS_ACCESS_KEY_ID           AWS access key id (server-side only)
 *   AWS_SECRET_ACCESS_KEY       AWS secret access key (server-side only)
 *   BEDROCK_MODEL_ID            Bedrock Claude model id / inference profile,
 *                               default 'us.anthropic.claude-haiku-4-5-20251001-v1:0'
 *   SUPABASE_URL                Supabase Postgres base URL (e.g. https://arkosdb.trigent.com)
 *   SUPABASE_SERVICE_ROLE_KEY   Supabase service-role JWT (server-side only)
 *   MAX_RUN_COST_USD            Per-run cost cap, default '2.00'
 *
 * Contract:
 *   - `isLive()` is the single source of truth for selecting live vs mock paths.
 *   - `isProvisioned()` returns the list of env vars that are missing while in
 *     live mode. An empty list means we're fully provisioned. API handlers MUST
 *     return 503 `{ error: 'live_not_provisioned', missing }` if the list is
 *     non-empty so the UI can gracefully fall back to mock.
 */

export const DEFAULT_BEDROCK_MODEL_ID = 'us.anthropic.claude-haiku-4-5-20251001-v1:0'
export const DEFAULT_MAX_RUN_COST_USD = 2.0

/** True when the user has opted into live sourcing. Defaults to false (mock). */
export function isLive(): boolean {
  return process.env.DATA_SOURCE === 'live-sourcing'
}

/** Resolved Bedrock model id (or cross-region inference profile) for InvokeModel. */
export function getBedrockModelId(): string {
  return process.env.BEDROCK_MODEL_ID?.trim() || DEFAULT_BEDROCK_MODEL_ID
}

/** Hard per-run USD cap parsed from MAX_RUN_COST_USD. */
export function getMaxRunCostUsd(): number {
  const raw = process.env.MAX_RUN_COST_USD
  if (!raw) return DEFAULT_MAX_RUN_COST_USD
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MAX_RUN_COST_USD
}

/**
 * Returns the env vars that are missing while we're in live mode.
 * When `isLive()` is false this returns [] (mock path needs no secrets).
 */
export function isProvisioned(): string[] {
  if (!isLive()) return []
  const required: Array<[string, string | undefined]> = [
    ['AWS_ACCESS_KEY_ID', process.env.AWS_ACCESS_KEY_ID],
    ['AWS_SECRET_ACCESS_KEY', process.env.AWS_SECRET_ACCESS_KEY],
    ['SUPABASE_URL', process.env.SUPABASE_URL],
    ['SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY],
  ]
  return required.filter(([, v]) => !v || v.trim() === '').map(([k]) => k)
}
