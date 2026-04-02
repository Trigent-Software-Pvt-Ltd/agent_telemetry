import { getProcessById, getAgentsForProcess, getSigmaTrendForAgent, getSigmaHistory, ORGANISATION } from '@/lib/mock-data'
import { SigmaScorecardClient } from './SigmaScorecardClient'
import { notFound } from 'next/navigation'

export default async function SigmaScorecardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const process = getProcessById(id)

  if (!process) {
    notFound()
  }

  const agents = getAgentsForProcess(id)
  const trends: Record<string, ReturnType<typeof getSigmaTrendForAgent>> = {}
  for (const agent of agents) {
    trends[agent.id] = getSigmaTrendForAgent(agent.id)
  }

  const sigmaHistory = getSigmaHistory(id)

  return (
    <SigmaScorecardClient
      process={process}
      agents={agents}
      trends={trends}
      sigmaTarget={ORGANISATION.sigmaTarget}
      sigmaHistory={sigmaHistory}
    />
  )
}
