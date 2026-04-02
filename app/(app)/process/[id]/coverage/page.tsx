import { getProcessById, getCoverageMap, getAgentsForProcess, getTasksForProcess } from '@/lib/mock-data'
import { notFound } from 'next/navigation'
import { TaskOwnershipPage } from '@/components/coverage/TaskOwnershipPage'

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
  const tasks = getTasksForProcess(id)

  return (
    <TaskOwnershipPage
      entries={entries}
      agents={agents}
      tasks={tasks}
      process={process}
    />
  )
}
