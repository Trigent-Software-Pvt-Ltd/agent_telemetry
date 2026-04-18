/**
 * Quadrant Sourcing Agent — Live Mode Smoke Test
 *
 * Validates that all live-mode prerequisites are satisfied BEFORE flipping
 * `DATA_SOURCE=live-sourcing` and hitting the "Run now" button in the UI.
 *
 * Usage:
 *   npx tsx scripts/smoke-live.ts          # env + bedrock + db + schema + privs
 *   npx tsx scripts/smoke-live.ts --full   # additionally run a mini end-to-end
 *
 *   or: npm run smoke-live
 *       npm run smoke-live -- --full
 *
 * Exits 0 if all mandatory checks pass, 1 otherwise.
 */

// ─── Load .env.local (Next.js auto-loads it in dev/build; tsx doesn't) ──────
import { existsSync } from 'node:fs'
for (const file of ['.env.local', '.env']) {
  if (existsSync(file)) {
    // Node 20.6+ supports process.loadEnvFile; fall back to manual parse.
    const loader = (process as unknown as { loadEnvFile?: (p: string) => void })
      .loadEnvFile
    if (typeof loader === 'function') loader.call(process, file)
    break
  }
}

// ─── Force DATA_SOURCE for this process only (doesn't mutate .env.local) ────
let forcedDataSource = false
if (!process.env.DATA_SOURCE || process.env.DATA_SOURCE.trim() === '') {
  process.env.DATA_SOURCE = 'live-sourcing'
  forcedDataSource = true
}

import { invokeClaude } from '@/lib/live-sourcing/telemetry'
import { getDb, getLatestRun, addLabelToRun } from '@/lib/live-sourcing/db'
import { getBedrockModelId } from '@/lib/live-sourcing/config'
import { runSourcingManager } from '@/lib/live-sourcing/manager'

// ─── ANSI colours ───────────────────────────────────────────────────────────
const C = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
}

const TICK = `${C.green}[✓]${C.reset}`
const CROSS = `${C.red}[✗]${C.reset}`
const SKIP = `${C.dim}[—]${C.reset}`
const WARN = `${C.yellow}[!]${C.reset}`

// ─── Tally ──────────────────────────────────────────────────────────────────
let passed = 0
let failed = 0
let warnings = 0
let skipped = 0

function pass(label: string, detail?: string) {
  passed++
  console.log(`${TICK} ${C.bold}${label}${C.reset}${detail ? `  ${C.dim}${detail}${C.reset}` : ''}`)
}

function fail(label: string, detail?: string) {
  failed++
  console.log(`${CROSS} ${C.bold}${label}${C.reset}${detail ? `  ${C.red}${detail}${C.reset}` : ''}`)
}

function warn(label: string, detail?: string) {
  warnings++
  console.log(`${WARN} ${C.bold}${label}${C.reset}${detail ? `  ${C.yellow}${detail}${C.reset}` : ''}`)
}

function skip(label: string, detail?: string) {
  skipped++
  console.log(`${SKIP} ${C.bold}${label}${C.reset}${detail ? `  ${C.dim}${detail}${C.reset}` : ''}`)
}

function info(msg: string) {
  console.log(`    ${C.dim}${msg}${C.reset}`)
}

function header(title: string) {
  console.log(`\n${C.cyan}${C.bold}${title}${C.reset}`)
  console.log(C.dim + '─'.repeat(title.length) + C.reset)
}

function fmtUsd(n: number): string {
  if (n === 0) return '$0.00'
  if (n < 0.0001) return `$${n.toExponential(3)}`
  return `$${n.toFixed(6)}`
}

function fmtMs(n: number): string {
  return `${n.toLocaleString()}ms`
}

function errMsg(e: unknown): string {
  if (e instanceof Error) return e.message
  try {
    return String(e)
  } catch {
    return '<unrepresentable error>'
  }
}

function isNetworkError(msg: string): boolean {
  return /ETIMEDOUT|ENOTFOUND|ENETUNREACH|ECONNREFUSED|ECONNRESET|getaddrinfo/i.test(msg)
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const full = process.argv.includes('--full')

  console.log(`${C.magenta}${C.bold}╔════════════════════════════════════════════════════╗${C.reset}`)
  console.log(`${C.magenta}${C.bold}║  Quadrant Sourcing — Live Mode Smoke Test          ║${C.reset}`)
  console.log(`${C.magenta}${C.bold}╚════════════════════════════════════════════════════╝${C.reset}`)

  if (forcedDataSource) {
    console.log(
      `${C.dim}Note: DATA_SOURCE was unset — forced to 'live-sourcing' for this process only.` +
        ` .env.local was NOT modified.${C.reset}`,
    )
  }
  console.log(`${C.dim}Mode: ${full ? 'FULL (includes end-to-end run)' : 'QUICK (no Bedrock tokens spent on pipeline)'}${C.reset}`)

  // ── Step 1: Env vars ─────────────────────────────────────────────
  header('1. Environment variables')
  const required = ['DATA_SOURCE', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'QUADRANT_DB_URL']
  const optional = ['BEDROCK_MODEL_ID', 'AWS_REGION', 'MAX_RUN_COST_USD']

  let envAllPresent = true
  for (const key of required) {
    const v = process.env[key]
    if (v && v.trim() !== '') {
      pass(key, `set (len=${v.length})`)
    } else {
      fail(key, 'NOT SET')
      envAllPresent = false
    }
  }
  for (const key of optional) {
    const v = process.env[key]
    if (v && v.trim() !== '') {
      // BEDROCK_MODEL_ID is safe to print, regions too. Don't print secrets
      // generally — but these optional ones are non-secret.
      pass(`${key} (optional)`, `${v}`)
    } else {
      warn(`${key} (optional)`, 'not set, using default')
    }
  }

  if (!envAllPresent) {
    console.log(`\n${C.red}Required env vars missing — aborting further checks.${C.reset}`)
    return summary(1)
  }

  // ── Step 2: DATA_SOURCE correctness ──────────────────────────────
  header('2. DATA_SOURCE flag')
  if (process.env.DATA_SOURCE === 'live-sourcing') {
    pass('DATA_SOURCE', `= 'live-sourcing'`)
  } else {
    warn(
      'DATA_SOURCE',
      `= '${process.env.DATA_SOURCE}' — API routes will return 503. Smoke-test proceeds anyway.`,
    )
  }

  // ── Step 3: Bedrock reachability ─────────────────────────────────
  header('3. Bedrock reachability')
  try {
    const modelId = getBedrockModelId()
    info(`model: ${modelId}`)
    const { text, metric } = await invokeClaude({
      userPrompt: 'Reply with the single word: OK',
      maxTokens: 10,
      temperature: 0,
    })
    const trimmed = text.trim()
    const okMatch = /ok/i.test(trimmed)
    info(`response: "${trimmed.slice(0, 80)}"`)
    info(
      `tokens in=${metric.tokensIn} out=${metric.tokensOut}  cost=${fmtUsd(metric.costUsd)}  latency=${fmtMs(metric.latencyMs)}`,
    )
    if (okMatch) {
      pass('Bedrock invokeClaude', `model reachable, response contains 'OK'`)
    } else {
      fail('Bedrock invokeClaude', `response did not contain 'OK': "${trimmed.slice(0, 80)}"`)
    }
  } catch (e) {
    const m = errMsg(e)
    fail('Bedrock invokeClaude', m)
    if (isNetworkError(m)) {
      console.log(
        `    ${C.yellow}Network error — if you are outside the VPC, this is expected. ` +
          `See docs/sourcing_live_runbook.md for VPC access.${C.reset}`,
      )
    }
  }

  // ── Step 4: DB connectivity ──────────────────────────────────────
  header('4. Postgres connectivity')
  let dbReachable = false
  try {
    const sql = getDb()
    const started = Date.now()
    const rows = await sql<Array<{ one: number }>>`select 1 as one`
    const elapsed = Date.now() - started
    if (rows[0]?.one === 1) {
      pass('getDb + select 1', `${fmtMs(elapsed)}`)
      dbReachable = true
    } else {
      fail('getDb + select 1', `unexpected result: ${JSON.stringify(rows)}`)
    }
  } catch (e) {
    const m = errMsg(e)
    fail('getDb + select 1', m)
    if (isNetworkError(m)) {
      console.log(
        `    ${C.yellow}Network error reaching Postgres — check VPC / firewall access to arkosdb.trigent.com.${C.reset}`,
      )
      console.log(`    ${C.yellow}See docs/sourcing_live_runbook.md for network setup.${C.reset}`)
    }
  }

  if (!dbReachable) {
    console.log(`\n${C.red}DB unreachable — skipping schema/privilege/e2e checks.${C.reset}`)
    return summary(1)
  }

  // ── Step 5: Schema present ───────────────────────────────────────
  header('5. Schema check')
  try {
    const sql = getDb()
    const rows = await sql<Array<{ runs: string | null; cands: string | null }>>`
      select
        to_regclass('quadrant.sourcing_runs')::text as runs,
        to_regclass('quadrant.sourcing_candidates')::text as cands
    `
    const r = rows[0]
    if (r?.runs) pass('quadrant.sourcing_runs', 'exists')
    else fail('quadrant.sourcing_runs', 'MIGRATION NOT APPLIED — run supabase/migrations/20260418_quadrant_schema.sql')

    if (r?.cands) pass('quadrant.sourcing_candidates', 'exists')
    else fail('quadrant.sourcing_candidates', 'MIGRATION NOT APPLIED — run supabase/migrations/20260418_quadrant_schema.sql')
  } catch (e) {
    fail('Schema lookup', errMsg(e))
  }

  // ── Step 6: Role privileges ──────────────────────────────────────
  header('6. Role privileges (quadrant_app)')
  const privs: Array<'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE'> = [
    'SELECT',
    'INSERT',
    'UPDATE',
    'DELETE',
  ]
  const tables = ['quadrant.sourcing_runs', 'quadrant.sourcing_candidates']
  try {
    const sql = getDb()
    for (const table of tables) {
      for (const priv of privs) {
        try {
          const rows = await sql<Array<{ ok: boolean }>>`
            select has_table_privilege('quadrant_app', ${table}, ${priv}) as ok
          `
          if (rows[0]?.ok) pass(`${table}  ${priv}`, 'granted')
          else warn(`${table}  ${priv}`, 'NOT granted to quadrant_app')
        } catch (e) {
          warn(`${table}  ${priv}`, errMsg(e))
        }
      }
    }
  } catch (e) {
    warn('Privilege check', errMsg(e))
  }

  // ── Step 7: Mini end-to-end (optional) ───────────────────────────
  header('7. End-to-end run (optional, --full)')
  if (!full) {
    skip('runSourcingManager', 'pass --full to execute (spends Bedrock tokens)')
    skip('getLatestRun', 'requires --full')
    skip('addLabelToRun', 'requires --full')
  } else {
    try {
      info(`invoking runSourcingManager({ taxonomy: '225100000X', states: ['TX'], limit: 5 })`)
      const startedRun = Date.now()
      const { run, candidates } = await runSourcingManager({
        taxonomy: '225100000X',
        states: ['TX'],
        limit: 5,
        triggeredBy: 'smoke-test',
      })
      const totalElapsed = Date.now() - startedRun

      info(`run.id = ${run.id}`)
      info(
        `run totals: cost=${fmtUsd(run.totalCostUsd)}  latency=${fmtMs(run.totalLatencyMs)}  wall=${fmtMs(totalElapsed)}`,
      )
      info(`candidates returned: ${candidates.length}`)

      if (candidates.length >= 1) {
        pass('runSourcingManager', `${candidates.length} candidate(s) persisted`)
      } else {
        fail('runSourcingManager', 'returned zero candidates')
      }

      // getLatestRun
      try {
        const latest = await getLatestRun()
        if (latest && latest.run.id === run.id) {
          pass('getLatestRun', `latest.id matches (${latest.run.id})`)
        } else if (latest) {
          warn(
            'getLatestRun',
            `returned a different run id (${latest.run.id}) — another run may have landed concurrently`,
          )
        } else {
          fail('getLatestRun', 'returned null')
        }
      } catch (e) {
        fail('getLatestRun', errMsg(e))
      }

      // addLabelToRun
      if (candidates.length >= 1) {
        try {
          const labelled = await addLabelToRun(candidates[0].id, 'good_fit', 'smoke-test')
          if (labelled) {
            pass(
              'addLabelToRun',
              `candidate=${labelled.id}  fitState=${labelled.fitState}  reviewedBy=${labelled.reviewedBy}`,
            )
          } else {
            fail('addLabelToRun', 'returned null (candidate not found?)')
          }
        } catch (e) {
          fail('addLabelToRun', errMsg(e))
        }
      } else {
        skip('addLabelToRun', 'no candidates to label')
      }

      console.log(
        `\n${C.cyan}Inspect run in DB:${C.reset}  ${C.bold}${run.id}${C.reset}` +
          `   ${C.dim}(left in place — not cleaned up)${C.reset}`,
      )
    } catch (e) {
      fail('End-to-end run', errMsg(e))
    }
  }

  // ── Summary & exit ───────────────────────────────────────────────
  const exitCode = failed > 0 ? 1 : 0
  return summary(exitCode)
}

function summary(exitCode: number): number {
  console.log(`\n${C.bold}${'═'.repeat(54)}${C.reset}`)
  const parts = [
    `${C.green}${passed} passed${C.reset}`,
    `${failed > 0 ? C.red : C.dim}${failed} failed${C.reset}`,
    `${warnings > 0 ? C.yellow : C.dim}${warnings} warnings${C.reset}`,
    `${C.dim}${skipped} skipped${C.reset}`,
  ]
  console.log(`${C.bold}Summary:${C.reset} ${parts.join('  /  ')}`)
  console.log(
    exitCode === 0
      ? `${C.green}${C.bold}Live mode prerequisites OK.${C.reset}`
      : `${C.red}${C.bold}Live mode NOT READY — fix the failing checks above.${C.reset}`,
  )
  console.log(`${C.bold}${'═'.repeat(54)}${C.reset}`)
  return exitCode
}

main()
  .then(code => process.exit(code))
  .catch(e => {
    console.error(`\n${C.red}${C.bold}Unhandled error:${C.reset}`, e)
    process.exit(1)
  })
