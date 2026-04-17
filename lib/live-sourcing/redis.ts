/**
 * Upstash Redis client + persistence helpers for sourcing runs.
 *
 * Key scheme:
 *   sourcing:runs:latest         -> string (run id)
 *   sourcing:runs:index          -> JSON array of up to 10 run ids (newest first)
 *   sourcing:run:{id}            -> SourcingRun JSON
 *   sourcing:run:{id}:candidates -> SourcingCandidate[] JSON
 */

import { Redis } from '@upstash/redis'
import type { SourcingCandidate, SourcingRun, FitState } from '@/lib/quadrant-mock'
import { isProvisioned } from './config'

const MAX_RUN_INDEX = 10

let _client: Redis | null = null

/**
 * Returns a singleton Upstash Redis client. Throws if env vars aren't present —
 * callers should have already checked `isProvisioned()` via the API layer.
 */
export function getRedis(): Redis {
  if (_client) return _client
  const missing = isProvisioned()
  if (missing.length > 0) {
    throw new Error(`Upstash Redis not provisioned: missing ${missing.join(', ')}`)
  }
  _client = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL as string,
    token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
  })
  return _client
}

const runKey = (id: string) => `sourcing:run:${id}`
const candKey = (id: string) => `sourcing:run:${id}:candidates`
const LATEST_KEY = 'sourcing:runs:latest'
const INDEX_KEY = 'sourcing:runs:index'

/** Upstash returns values already JSON-parsed; normalise for either case. */
function coerce<T>(value: unknown): T | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T
    } catch {
      return null
    }
  }
  return value as T
}

export async function setRun(
  run: SourcingRun,
  candidates: SourcingCandidate[],
): Promise<void> {
  const r = getRedis()
  await Promise.all([
    r.set(runKey(run.id), JSON.stringify(run)),
    r.set(candKey(run.id), JSON.stringify(candidates)),
    r.set(LATEST_KEY, run.id),
  ])
  // Prepend to index, keep most recent N, drop older ids off the tail.
  const raw = await r.get(INDEX_KEY)
  const prior = coerce<string[]>(raw) ?? []
  const next = [run.id, ...prior.filter(id => id !== run.id)].slice(0, MAX_RUN_INDEX)
  await r.set(INDEX_KEY, JSON.stringify(next))
}

export async function getRun(
  id: string,
): Promise<{ run: SourcingRun; candidates: SourcingCandidate[] } | null> {
  const r = getRedis()
  const [runRaw, candRaw] = await Promise.all([r.get(runKey(id)), r.get(candKey(id))])
  const run = coerce<SourcingRun>(runRaw)
  if (!run) return null
  const candidates = coerce<SourcingCandidate[]>(candRaw) ?? []
  return { run, candidates }
}

export async function getLatestRunId(): Promise<string | null> {
  const r = getRedis()
  const id = await r.get(LATEST_KEY)
  return typeof id === 'string' ? id : null
}

/** Convenience: fetch latest run id + its run/candidates in one call. */
export async function getLatestRun(): Promise<
  { run: SourcingRun; candidates: SourcingCandidate[] } | null
> {
  const id = await getLatestRunId()
  if (!id) return null
  return getRun(id)
}

export async function listRuns(): Promise<string[]> {
  const r = getRedis()
  const raw = await r.get(INDEX_KEY)
  return coerce<string[]>(raw) ?? []
}

/**
 * Scan known run ids, find the candidate by id, update its fit state / reviewer,
 * and rewrite the containing run's candidate array. Returns the updated
 * candidate or null if not found in any indexed run.
 */
export async function addLabelToRun(
  candidateId: string,
  fitState: FitState,
  reviewer?: string,
): Promise<SourcingCandidate | null> {
  const r = getRedis()
  const ids = await listRuns()
  for (const runId of ids) {
    const raw = await r.get(candKey(runId))
    const candidates = coerce<SourcingCandidate[]>(raw)
    if (!candidates) continue
    const idx = candidates.findIndex(c => c.id === candidateId)
    if (idx === -1) continue
    const updated: SourcingCandidate = {
      ...candidates[idx],
      fitState,
      reviewedBy: reviewer,
      reviewedAt: new Date().toISOString(),
    }
    const next = [...candidates]
    next[idx] = updated
    await r.set(candKey(runId), JSON.stringify(next))
    return updated
  }
  return null
}
