import type { Metadata } from 'next'
import CandidateReviewView from '@/components/quadrant/CandidateReviewView'
import { getLiveSourcingData } from '@/lib/sourcing-data'

export const metadata: Metadata = { title: 'Candidate Review' }
// Server-rendered on demand — the live adapter may hit the DB per request.
export const dynamic = 'force-dynamic'

export default async function Page() {
  const { source, runs, candidates } = await getLiveSourcingData()
  return <CandidateReviewView initialCandidates={candidates} runs={runs} source={source} />
}
