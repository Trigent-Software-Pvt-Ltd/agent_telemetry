import type { Metadata } from 'next'
import SourcingAgentView from '@/components/quadrant/SourcingAgentView'
import {
  QUADRANT_AGENTS,
  SOURCING_SPECIALISTS,
  SOURCING_RUNS,
  getRuleOutcomes,
  GROUND_TRUTH_SET,
  getCandidates,
} from '@/lib/quadrant-mock'

export const metadata: Metadata = { title: 'Sourcing Agent' }

export default function Page() {
  const agent = QUADRANT_AGENTS.find(a => a.id === 'sourcing-agent')!
  return (
    <SourcingAgentView
      agent={agent}
      specialists={SOURCING_SPECIALISTS}
      runs={SOURCING_RUNS}
      ruleOutcomes={getRuleOutcomes()}
      groundTruth={GROUND_TRUTH_SET}
      candidates={getCandidates()}
    />
  )
}
