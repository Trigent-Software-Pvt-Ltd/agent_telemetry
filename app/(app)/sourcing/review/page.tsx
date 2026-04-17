import type { Metadata } from 'next'
import CandidateReviewView from '@/components/quadrant/CandidateReviewView'
import { getLiveSourcingData } from '@/lib/sourcing-data'

export const metadata: Metadata = { title: 'Candidate Review' }

export default async function Page() {
  const { source, runs, candidates } = await getLiveSourcingData()
  return <CandidateReviewView initialCandidates={candidates} runs={runs} source={source} />
}
