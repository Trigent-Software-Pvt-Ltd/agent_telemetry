import { getProcessById, getTransformationStages, getAgentsForProcess } from '@/lib/mock-data'
import { ORGANISATION } from '@/lib/mock-data'
import { notFound } from 'next/navigation'
import { RoadmapClient } from '@/components/roadmap/RoadmapClient'

export default async function RoadmapPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const process = getProcessById(id)
  if (!process) return notFound()

  const stages = getTransformationStages(id)
  const agents = getAgentsForProcess(id)

  return (
    <RoadmapClient
      stages={stages}
      agents={agents}
      processName={process.name}
      sigmaTarget={ORGANISATION.sigmaTarget}
    />
  )
}
