import type { Metadata } from 'next'
import CandidateReviewView from '@/components/quadrant/CandidateReviewView'
import { getCandidates, SOURCING_RUNS } from '@/lib/quadrant-mock'

export const metadata: Metadata = { title: 'Candidate Review' }

export default function Page() {
  return <CandidateReviewView initialCandidates={getCandidates()} runs={SOURCING_RUNS} />
}
