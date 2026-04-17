/**
 * Live Sourcing Agent — runtime configuration & feature flag.
 *
 * Required environment variables (document only; do NOT commit values):
 *   DATA_SOURCE                 'mock' (default) or 'live-sourcing'
 *   AI_GATEWAY_API_KEY          Vercel AI Gateway API token (server-side only)
 *   CLAUDE_MODEL                Gateway model string, default 'anthropic/claude-sonnet-4-5'
 *   UPSTASH_REDIS_REST_URL      Upstash Redis REST endpoint
 *   UPSTASH_REDIS_REST_TOKEN    Upstash Redis REST token
 *   MAX_RUN_COST_USD            Per-run cost cap, default '2.00'
 *
 * Contract:
 *   - `isLive()` is the single source of truth for selecting live vs mock paths.
 *   - `isProvisioned()` returns the list of env vars that are missing while in
 *     live mode. An empty list means we're fully provisioned. API handlers MUST
 *     return 503 `{ error: 'live_not_provisioned', missing }` if the list is
 *     non-empty so the UI can gracefully fall back to mock.
 */

export const DEFAULT_CLAUDE_MODEL = 'anthropic/claude-sonnet-4-5'
export const DEFAULT_MAX_RUN_COST_USD = 2.0

/** True when the user has opted into live sourcing. Defaults to false (mock). */
export function isLive(): boolean {
  return process.env.DATA_SOURCE === 'live-sourcing'
}

/** Resolved model id for generateText / generateObject calls via AI Gateway. */
export function getClaudeModel(): string {
  return process.env.CLAUDE_MODEL?.trim() || DEFAULT_CLAUDE_MODEL
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
    ['AI_GATEWAY_API_KEY', process.env.AI_GATEWAY_API_KEY],
    ['UPSTASH_REDIS_REST_URL', process.env.UPSTASH_REDIS_REST_URL],
    ['UPSTASH_REDIS_REST_TOKEN', process.env.UPSTASH_REDIS_REST_TOKEN],
  ]
  return required.filter(([, v]) => !v || v.trim() === '').map(([k]) => k)
}
