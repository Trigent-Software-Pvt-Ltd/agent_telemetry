import type { Metadata } from 'next'
import SourcingAgentView from '@/components/quadrant/SourcingAgentView'
import {
  QUADRANT_AGENTS,
  SOURCING_SPECIALISTS,
  getRuleOutcomes,
  GROUND_TRUTH_SET,
} from '@/lib/quadrant-mock'
import { getLiveSourcingData } from '@/lib/sourcing-data'

export const metadata: Metadata = { title: 'Sourcing Agent' }

export default async function Page() {
  const agent = QUADRANT_AGENTS.find(a => a.id === 'sourcing-agent')!
  const { source, runs, candidates } = await getLiveSourcingData()

  return (
    <SourcingAgentView
      agent={agent}
      specialists={SOURCING_SPECIALISTS}
      runs={runs}
      ruleOutcomes={getRuleOutcomes()}
      groundTruth={GROUND_TRUTH_SET}
      candidates={candidates}
      source={source}
    />
  )
}
