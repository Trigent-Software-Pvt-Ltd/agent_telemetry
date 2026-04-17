/**
 * Finder specialist — pure data fetch (no LLM).
 *
 * Uses the NPI Registry to enumerate organisations and individuals matching a
 * taxonomy code in a set of states. This is the first step of the manager's
 * pipeline; its output becomes the Classifier's input.
 */

import { searchNpi } from './npi-client'
import type { FinderCandidate } from './types'

export async function findCandidates(args: {
  taxonomy: string
  states?: string[]
  limit?: number
}): Promise<FinderCandidate[]> {
  return searchNpi(args)
}
