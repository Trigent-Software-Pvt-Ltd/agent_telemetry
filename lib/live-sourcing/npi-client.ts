/**
 * NPI Registry client (public, no API key).
 *
 * Docs: https://npiregistry.cms.hhs.gov/registry/help-api
 * Endpoint: https://npiregistry.cms.hhs.gov/api/?version=2.1
 *
 * Notes:
 *   - The API is public and CORS-free when called server-side.
 *   - Honour the `limit` parameter; we don't want to blast >200 per call.
 *   - The response shape is documented; we typecast the minimum we need.
 */

import type { FinderCandidate } from './types'

const BASE_URL = 'https://npiregistry.cms.hhs.gov/api/'
const MAX_LIMIT = 200 // API cap per call

/**
 * Known taxonomy-code -> description map. The NPI Registry API searches by
 * description, not code, so we translate. If a caller passes a description
 * directly we'll use it as-is.
 */
const TAXONOMY_CODE_TO_DESCRIPTION: Record<string, string> = {
  '225100000X': 'Physical Therapist',
}

function taxonomyDescription(input: string): string {
  const trimmed = input.trim()
  return TAXONOMY_CODE_TO_DESCRIPTION[trimmed] ?? trimmed
}

interface NpiAddress {
  address_purpose?: string
  city?: string
  state?: string
  country_code?: string
}

interface NpiTaxonomy {
  code?: string
  desc?: string
  primary?: boolean
}

interface NpiBasic {
  organization_name?: string
  first_name?: string
  last_name?: string
}

interface NpiResult {
  number?: string
  enumeration_type?: 'NPI-1' | 'NPI-2'
  basic?: NpiBasic
  addresses?: NpiAddress[]
  taxonomies?: NpiTaxonomy[]
}

interface NpiResponse {
  result_count?: number
  results?: NpiResult[]
  Errors?: Array<{ description: string }>
}

function pickAddress(addresses: NpiAddress[] | undefined): NpiAddress | undefined {
  if (!addresses || addresses.length === 0) return undefined
  return (
    addresses.find(a => a.address_purpose === 'LOCATION') ??
    addresses.find(a => a.address_purpose === 'PRIMARY') ??
    addresses[0]
  )
}

function pickTaxonomy(taxonomies: NpiTaxonomy[] | undefined): NpiTaxonomy | undefined {
  if (!taxonomies || taxonomies.length === 0) return undefined
  return taxonomies.find(t => t.primary) ?? taxonomies[0]
}

function nameOf(r: NpiResult): string {
  if (r.basic?.organization_name) return r.basic.organization_name
  const first = r.basic?.first_name ?? ''
  const last = r.basic?.last_name ?? ''
  return `${first} ${last}`.trim() || 'Unknown'
}

/**
 * Search the NPI Registry by taxonomy code and (optionally) one or more states.
 * Hits the API once per state and merges results up to `limit` total.
 */
export async function searchNpi(args: {
  taxonomy: string
  states?: string[]
  limit?: number
}): Promise<FinderCandidate[]> {
  const limit = Math.min(Math.max(args.limit ?? 30, 1), MAX_LIMIT)
  const states = args.states && args.states.length > 0 ? args.states : [undefined]
  const perState = Math.max(5, Math.ceil(limit / states.length))
  const collected: FinderCandidate[] = []

  for (const state of states) {
    if (collected.length >= limit) break
    const params = new URLSearchParams({
      version: '2.1',
      taxonomy_description: taxonomyDescription(args.taxonomy),
      limit: String(Math.min(perState, MAX_LIMIT)),
    })
    if (state) params.set('state', state)

    const url = `${BASE_URL}?${params.toString()}`
    const res = await fetch(url, { method: 'GET' })
    if (!res.ok) {
      // Skip this state on failure rather than aborting the whole run.
      continue
    }
    const json = (await res.json()) as NpiResponse
    const results = json.results ?? []
    for (const r of results) {
      if (collected.length >= limit) break
      const addr = pickAddress(r.addresses)
      const tax = pickTaxonomy(r.taxonomies)
      if (!r.number) continue
      collected.push({
        npi: r.number,
        orgName: nameOf(r),
        taxonomyCode: tax?.code ?? args.taxonomy,
        taxonomyDescription: tax?.desc ?? 'Physical Therapist',
        enumerationType: r.enumeration_type === 'NPI-2' ? 'NPI-2' : 'NPI-1',
        state: addr?.state ?? state ?? '',
        city: addr?.city ?? '',
      })
    }
  }

  return collected
}
