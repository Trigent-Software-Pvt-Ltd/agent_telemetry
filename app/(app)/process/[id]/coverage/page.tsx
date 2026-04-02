import { getProcessById, getCoverageMap, getAgentsForProcess } from '@/lib/mock-data'
import { notFound } from 'next/navigation'
import { CoverageGrid } from '@/components/coverage/CoverageGrid'

export default async function CoverageMapPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const process = getProcessById(id)
  if (!process) return notFound()

  const entries = getCoverageMap(id)
  const agents = getAgentsForProcess(id)

  return (
    <CoverageGrid
      entries={entries}
      agents={agents}
      processName={process.name}
    />
  )
}
