/**
 * Quadrant Sourcing Agent — CMS Utilization Data Seeder
 *
 * Reseeds `data/cms-pt-utilization.json` using REAL NPIs fetched live from the
 * public NPI Registry API (v2.1). Each NPI is then assigned a deterministic,
 * seeded `medicareAllowedAmount` so the Estimator can pass roughly 25% of
 * live-run candidates through the $5M revenue gate.
 *
 * Usage:
 *   npx tsx scripts/seed-cms-data.ts
 *   npm run seed-cms
 *
 * No external deps — uses native fetch (Node 20+) and writeFile.
 */
import { writeFile, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

/** Matches `CmsUtilizationRow` in `lib/live-sourcing/types.ts`. */
interface CmsUtilizationRow {
  npi: string
  orgName: string
  state: string
  medicareAllowedAmount: number
  billedEncounters: number
  fiscalYear: number
}

/** Subset of NPI Registry v2.1 response we care about. */
interface NpiRegistryResult {
  number: string
  basic?: {
    organization_name?: string
    name?: string
  }
  addresses?: Array<{
    address_purpose?: string
    state?: string
  }>
  practiceLocations?: Array<{
    state?: string
  }>
}

interface NpiRegistryResponse {
  result_count?: number
  results?: NpiRegistryResult[]
  Errors?: Array<{ description?: string }>
}

const STATES = ['TX', 'FL', 'CA', 'NC', 'AZ', 'GA', 'TN', 'PA', 'OH', 'CO'] as const
const FISCAL_YEAR = 2024
const OUTPUT_PATH = resolve(process.cwd(), 'data', 'cms-pt-utilization.json')

/** Deterministic LCG seeded by an integer. */
function seededRand(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0xffffffff
  }
}

/** Returns a revenue bucket label + amount for a given NPI. */
function assignRevenue(npi: string): { tier: 'high' | 'mid' | 'low'; amount: number; encounters: number } {
  const rand = seededRand(parseInt(npi.slice(-4), 10) || 1)
  const bucket = rand() // first draw chooses tier
  let tier: 'high' | 'mid' | 'low'
  let amount: number

  if (bucket < 0.25) {
    // 25%: $1.8M–$4.5M → extrapolates to ~$5.6M–$14M at 32% Medicare share
    tier = 'high'
    amount = 1_800_000 + rand() * (4_500_000 - 1_800_000)
  } else if (bucket < 0.60) {
    // 35%: $800K–$1.8M → borderline
    tier = 'mid'
    amount = 800_000 + rand() * (1_800_000 - 800_000)
  } else {
    // 40%: $50K–$800K → below threshold
    tier = 'low'
    amount = 50_000 + rand() * (800_000 - 50_000)
  }

  amount = Math.round(amount)

  // billedEncounters = round(amount * 0.01) with ±30% jitter
  const base = amount * 0.01
  const jitter = 1 + (rand() - 0.5) * 0.6 // 0.7–1.3
  const encounters = Math.max(1, Math.round(base * jitter))

  return { tier, amount, encounters }
}

async function fetchStateOrgs(state: string): Promise<NpiRegistryResult[]> {
  const url = new URL('https://npiregistry.cms.hhs.gov/api/')
  url.searchParams.set('version', '2.1')
  url.searchParams.set('enumeration_type', 'NPI-2')
  url.searchParams.set('taxonomy_description', 'Physical Therapist')
  url.searchParams.set('state', state)
  url.searchParams.set('limit', '200')

  const res = await fetch(url.toString(), {
    headers: { accept: 'application/json' },
  })

  if (!res.ok) {
    throw new Error(`NPI Registry returned HTTP ${res.status} for state=${state}: ${await res.text()}`)
  }

  const json = (await res.json()) as NpiRegistryResponse
  if (json.Errors && json.Errors.length > 0) {
    throw new Error(
      `NPI Registry error for state=${state}: ${json.Errors.map((e) => e.description).join('; ')}`
    )
  }

  return json.results ?? []
}

async function main() {
  const startedAt = Date.now()
  const rows: CmsUtilizationRow[] = []
  const perState: Record<string, { fetched: number; withNames: number }> = {}
  const seenNpis = new Set<string>()

  for (const state of STATES) {
    const results = await fetchStateOrgs(state)
    let withNames = 0

    for (const r of results) {
      const npi = r.number?.trim()
      const orgName = r.basic?.organization_name?.trim()
      if (!npi || !orgName) continue
      if (seenNpis.has(npi)) continue // dedupe across states
      seenNpis.add(npi)
      withNames++

      // Prefer explicit state filter; fall back to first practice location
      const locState =
        r.addresses?.find((a) => a.address_purpose === 'LOCATION')?.state ??
        r.practiceLocations?.[0]?.state ??
        state

      const { amount, encounters } = assignRevenue(npi)

      rows.push({
        npi,
        orgName,
        state: (locState ?? state).toUpperCase().slice(0, 2),
        medicareAllowedAmount: amount,
        billedEncounters: encounters,
        fiscalYear: FISCAL_YEAR,
      })
    }

    perState[state] = { fetched: results.length, withNames }
    console.log(`${state}: ${results.length} orgs -> ${withNames} with names`)
  }

  // Serialize & write
  const json = JSON.stringify(rows, null, 2)
  await writeFile(OUTPUT_PATH, json, 'utf8')
  const { size } = await stat(OUTPUT_PATH)

  // Distribution histogram
  const hist = { high: 0, mid: 0, low: 0 }
  for (const row of rows) {
    if (row.medicareAllowedAmount >= 1_800_000) hist.high++
    else if (row.medicareAllowedAmount >= 800_000) hist.mid++
    else hist.low++
  }

  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1)

  console.log('')
  console.log('='.repeat(60))
  console.log(`Total NPIs written: ${rows.length}`)
  console.log(`File: ${OUTPUT_PATH}`)
  console.log(`Size: ${(size / 1024).toFixed(1)} KB`)
  console.log(`Elapsed: ${elapsed}s`)
  console.log('')
  console.log('Rows per state:')
  for (const s of STATES) {
    const p = perState[s]
    const kept = rows.filter((r) => r.state === s).length
    console.log(`  ${s}: fetched=${p.fetched}  named=${p.withNames}  kept=${kept}`)
  }
  console.log('')
  console.log('Revenue distribution:')
  console.log(`  high (>=$1.8M): ${hist.high}  (${((hist.high / rows.length) * 100).toFixed(1)}%)`)
  console.log(`  mid  ($800K-$1.8M): ${hist.mid}  (${((hist.mid / rows.length) * 100).toFixed(1)}%)`)
  console.log(`  low  (<$800K): ${hist.low}  (${((hist.low / rows.length) * 100).toFixed(1)}%)`)
  console.log('='.repeat(60))
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})
