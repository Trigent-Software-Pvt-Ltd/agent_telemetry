import { getProcessById, getTransformationStages, getAgentsForProcess } from '@/lib/data-source'
import { ORGANISATION } from '@/lib/data-source'
import { notFound } from 'next/navigation'
import { RoadmapClient } from '@/components/roadmap/RoadmapClient'

export default async function RoadmapPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const process = await getProcessById(id)
  if (!process) return notFound()

  const stages = await getTransformationStages(id)
  const agents = await getAgentsForProcess(id)

  return (
    <RoadmapClient
      stages={stages}
      agents={agents}
      processName={process.name}
      sigmaTarget={ORGANISATION.sigmaTarget}
    />
  )
}
