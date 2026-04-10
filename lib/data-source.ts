/**
 * Data Source Bridge
 *
 * Re-exports seed data (constants, types, sync functions) for backward
 * compatibility while the codebase migrates page-by-page to the async
 * DB layer in lib/data/*.
 *
 * ─── Migration path ───
 *
 *   Step 1 (current):
 *     import { PROCESSES, getProcessById } from '@/lib/data-source'
 *     // constants + sync wrapper functions from seed-data.ts
 *
 *   Step 2 (per-page):
 *     import { getProcessById } from '@/lib/data/processes'   // async DB
 *     import { PROCESSES } from '@/lib/data-source'           // constants stay
 *
 *   Step 3 (final cleanup):
 *     Delete seed-data.ts once all pages use lib/data/* for functions.
 *     This file shrinks to exporting only constants & types.
 *
 * ─── DB modules (lib/data/*) ───
 *
 *   processes, agents, runs, sigma, governance, settings,
 *   analytics, monitoring, insights
 *
 * See lib/data/index.ts for the full barrel export.
 */

export * from './seed-data'
