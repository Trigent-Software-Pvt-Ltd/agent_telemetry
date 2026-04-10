import { getProcessById, getAgentsForProcess, getSigmaTrendForAgent, getSigmaHistory, ORGANISATION } from '@/lib/data-source'
import { SigmaScorecardClient } from './SigmaScorecardClient'
import { notFound } from 'next/navigation'

export default async function SigmaScorecardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const process = await getProcessById(id)

  if (!process) {
    notFound()
  }

  const agents = await getAgentsForProcess(id)
  const trends: Record<string, Awaited<ReturnType<typeof getSigmaTrendForAgent>>> = {}
  for (const agent of agents) {
    trends[agent.id] = await getSigmaTrendForAgent(agent.id)
  }

  const sigmaHistory = await getSigmaHistory(id)

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
