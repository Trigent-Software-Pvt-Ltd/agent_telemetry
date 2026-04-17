/**
 * Sourcing Agent — mock/live data adapter.
 *
 * Server-only helper used by the Sourcing Agent page and the Candidate Review
 * page. When DATA_SOURCE=live-sourcing AND a live run exists in the live
 * backing store, returns live data. Otherwise falls back to deterministic mock
 * data from `@/lib/quadrant-mock`.
 *
 * This module MUST be imported only from server components / route handlers.
 * It never throws on live-mode failures — on any error it logs a warning and
 * returns mock data so the existing UI keeps rendering.
 */
import 'server-only'

import {
  SOURCING_RUNS,
  getCandidates,
  type SourcingCandidate,
  type SourcingRun,
} from '@/lib/quadrant-mock'

export type SourcingSource = 'mock' | 'live'

export interface SourcingData {
  source: SourcingSource
  /** The "active" run for header/trace widgets. null means callers should use the first entry in `runs`. */
  run: SourcingRun | null
  runs: SourcingRun[]
  candidates: SourcingCandidate[]
}

function mockData(): SourcingData {
  return {
    source: 'mock',
    run: null,
    runs: SOURCING_RUNS,
    candidates: getCandidates(),
  }
}

/**
 * Fetch live Sourcing Agent data from the backend (Upstash-backed store).
 * The backend agent exposes `getLatestRun()` from `lib/live-sourcing/redis`.
 * We call it via dynamic import so this module still builds if that file is
 * absent or mid-refactor — integration will resolve any type drift.
 */
async function fetchLiveLatest(): Promise<{ run: SourcingRun; candidates: SourcingCandidate[] } | null> {
  try {
    // Dynamic import — backend agent owns this module; it may not exist yet.
    const mod: unknown = await import('@/lib/live-sourcing/redis').catch(() => null)
    if (!mod || typeof mod !== 'object') return null
    const getLatestRun = (mod as { getLatestRun?: unknown }).getLatestRun
    if (typeof getLatestRun !== 'function') return null
    const latest = (await (getLatestRun as () => Promise<unknown>)()) as
      | { run: SourcingRun; candidates: SourcingCandidate[] }
      | null
      | undefined
    if (!latest || !latest.run) return null
    return { run: latest.run, candidates: latest.candidates ?? [] }
  } catch (err) {
    console.warn('[sourcing-data] live fetch failed, falling back to mock:', err)
    return null
  }
}

export async function getLiveSourcingData(): Promise<SourcingData> {
  if (process.env.DATA_SOURCE !== 'live-sourcing') {
    return mockData()
  }

  const latest = await fetchLiveLatest()
  if (!latest) {
    // Flag is on but no run yet (or helper not provisioned) — use mock UI.
    return mockData()
  }

  // Live mode with a real run. Put the latest run at the head of the runs list
  // so the existing "pick a run" selectors still work unchanged.
  return {
    source: 'live',
    run: latest.run,
    runs: [latest.run],
    candidates: latest.candidates,
  }
}
